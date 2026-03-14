// api/agent-categories.js
// Vercel API route — proxies to the Supabase agent-categories Edge Function

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !anonKey) {
    res.status(500).json({ error: 'Supabase environment variables not configured' });
    return;
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/agent-categories`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
}
