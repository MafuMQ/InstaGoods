import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)

    // Location params (optional — omit to get all visible products)
    const latParam = url.searchParams.get('lat')
    const lngParam = url.searchParams.get('lng')
    const lat = latParam ? parseFloat(latParam) : null
    const lng = lngParam ? parseFloat(lngParam) : null
    const radiusKm = parseFloat(url.searchParams.get('radius_km') ?? '50')

    // Filter params (all optional)
    const category = url.searchParams.get('category')
    const search = url.searchParams.get('search')
    const maxPrice = url.searchParams.get('max_price')
    const minPrice = url.searchParams.get('min_price')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    let query = supabase
      .from('products')
      .select(`
        id, name, description, price, image_url,
        main_category, sub_category, stock_quantity,
        available_everywhere, no_delivery,
        delivery_location, delivery_lat, delivery_lng, delivery_radius_km,
        collection_available, delivery_fee,
        suppliers (id, business_name, description, location, phone, provider_type)
      `)
      .eq('is_active', true)
      .eq('is_marketplace_visible', true)

    if (category) {
      query = query.ilike('main_category', `%${category}%`)
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }

    const { data: products, error } = await query

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let results = (products ?? []) as Record<string, unknown>[]

    // If lat/lng provided, filter to only products reachable at that location
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      results = results
        .map((p) => {
          if (p.available_everywhere) {
            return { ...p, distance_km: null, delivery_available: true }
          }
          if (p.delivery_lat && p.delivery_lng) {
            const dist = haversineDistance(lat, lng, p.delivery_lat as number, p.delivery_lng as number)
            const radius = (p.delivery_radius_km as number) ?? radiusKm
            return {
              ...p,
              distance_km: Math.round(dist * 10) / 10,
              delivery_available: dist <= radius,
            }
          }
          // No coordinates set — only reachable if collection is available
          return { ...p, distance_km: null, delivery_available: false }
        })
        .filter((p) => p.delivery_available || p.collection_available)
        .sort((a, b) => {
          const da = (a.distance_km as number | null) ?? Infinity
          const db = (b.distance_km as number | null) ?? Infinity
          return da - db
        })
    }

    return new Response(
      JSON.stringify({ count: results.length, products: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (_err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
