// api/agent-product-detail.js
// Vercel API route — proxies to the Supabase agent-product-detail Edge Function

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Missing required parameter: id' });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !anonKey) {
    res.status(500).json({ error: 'Supabase environment variables not configured' });
    return;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/agent-product-detail?id=${encodeURIComponent(id)}`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      }
    );

    const data = await response.json();

    // Inject a direct product page URL so AI and API consumers can link to the product
    if (response.ok && data.product) {
      const rootUrl = (process.env.INSTAGOODS_ROOT_URL || '').replace(/\/$/, '');
      data.product.product_url = `${rootUrl}/product/${id}`;
    }

    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
}
