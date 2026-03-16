// api/agent-proxy.js
// Proxies all agent chat requests to the ECS-hosted Flask agent.
// This avoids Mixed Content and CORS issues — the browser only ever talks to Vercel (HTTPS).

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
    const upstreamRes = await fetch(upstreamUrl, {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method)
        ? JSON.stringify(req.body)
        : undefined,
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