// api/agent-products.js
// Vercel API route — proxies to the Supabase agent-products Edge Function
// Forwards all query params: lat, lng, radius_km, category, search, min_price, max_price

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

  // Forward only known, safe query parameters
  const allowed = ['lat', 'lng', 'radius_km', 'category', 'search', 'min_price', 'max_price'];
  const params = new URLSearchParams();
  for (const key of allowed) {
    if (req.query[key] !== undefined) {
      params.set(key, req.query[key]);
    }
  }

  const upstreamUrl = `${supabaseUrl}/functions/v1/agent-products${params.toString() ? `?${params}` : ''}`;

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
