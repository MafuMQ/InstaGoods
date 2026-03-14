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
    const id = url.searchParams.get('id')

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id, name, description, price, image_url,
        main_category, sub_category, stock_quantity,
        available_everywhere, no_delivery,
        delivery_location, delivery_lat, delivery_lng, delivery_radius_km,
        collection_available, delivery_fee,
        created_at, updated_at,
        suppliers (
          id, business_name, description, location, phone,
          provider_type, business_type, review_status
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      const status = error.code === 'PGRST116' ? 404 : 500
      const message = status === 404 ? 'Product not found' : error.message
      return new Response(
        JSON.stringify({ error: message }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ product }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (_err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
