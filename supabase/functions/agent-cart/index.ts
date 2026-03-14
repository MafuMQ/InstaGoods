import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const userJwt = url.searchParams.get('user_jwt')

    if (!userJwt) {
      return new Response(
        JSON.stringify({ error: 'user_jwt query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Create a client authenticated as the requesting user so RLS applies correctly
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: `Bearer ${userJwt}` } } },
    )

    // Verify the token is valid and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired user_jwt' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { data: cartRows, error } = await supabase
      .from('customer_carts')
      .select(`
        product_id,
        quantity,
        updated_at,
        products (
          id, name, description, price, image_url,
          main_category, sub_category, stock_quantity,
          available_everywhere, no_delivery,
          delivery_location, delivery_lat, delivery_lng, delivery_radius_km,
          collection_available, delivery_fee,
          suppliers (id, business_name, location, provider_type)
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const items = (cartRows ?? []).filter((row) => row.products)

    const cartTotal = items.reduce(
      (sum, row) => sum + (row.products as Record<string, number>).price * row.quantity,
      0,
    )

    return new Response(
      JSON.stringify({
        user_id: user.id,
        item_count: items.reduce((sum, row) => sum + row.quantity, 0),
        cart_total: Math.round(cartTotal * 100) / 100,
        items: items.map((row) => ({
          product_id: row.product_id,
          quantity: row.quantity,
          updated_at: row.updated_at,
          product: row.products,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (_err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
