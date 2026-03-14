// api/agent-cart.js
// Vercel API route — proxies to the Supabase agent-cart Edge Function
// Requires: user_jwt (the user's Supabase access token)

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

  const { user_jwt } = req.query;
  if (!user_jwt) {
    res.status(400).json({ error: 'user_jwt query parameter is required' });
    return;
  }

  const upstreamUrl = `${supabaseUrl}/functions/v1/agent-cart?user_jwt=${encodeURIComponent(user_jwt)}`;

  try {
    const response = await fetch(upstreamUrl, {
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
