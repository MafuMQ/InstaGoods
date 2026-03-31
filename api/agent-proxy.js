// api/agent-proxy.js
// Proxies all agent chat requests to the ECS-hosted Flask agent.
// This avoids Mixed Content and CORS issues — the browser only ever talks to Vercel (HTTPS).

// Disable Vercel's default body parser so we can forward raw bytes (needed for
// multipart/form-data uploads such as the /transcribe audio endpoint).
export const config = {
  api: {
    bodyParser: false,
  },
};

/** Read the full raw body from a Node.js IncomingMessage stream. */
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  const agentUrl = process.env.AGENT_BACKEND_URL; // e.g. http://<huawei-ecs-ip>:5000
  if (!agentUrl) {
    res.status(500).json({ error: 'AGENT_BACKEND_URL not configured' });
    return;
  }

  // Strip the /api/agent-proxy prefix and forward the rest of the path
  const upstreamPath = req.url.replace(/^\/api\/agent-proxy/, '') || '/';
  const upstreamUrl = `${agentUrl}${upstreamPath}`;

  try {
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method);
    const rawBody = hasBody ? await readRawBody(req) : undefined;

    const upstreamRes = await fetch(upstreamUrl, {
      method: req.method,
      headers: {
        // Forward Content-Type verbatim so multipart boundaries are preserved
        ...(req.headers['content-type'] && { 'Content-Type': req.headers['content-type'] }),
      },
      body: hasBody ? rawBody : undefined,
    });

    const contentType = upstreamRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await upstreamRes.json();
      res.status(upstreamRes.status).json(data);
    } else {
      // Binary response (e.g. audio/mpeg from /tts)
      const buffer = await upstreamRes.arrayBuffer();
      res.status(upstreamRes.status)
        .setHeader('Content-Type', contentType)
        .send(Buffer.from(buffer));
    }
  } catch (error) {
    res.status(500).json({ error: 'Agent proxy failed', details: error.message });
  }
}