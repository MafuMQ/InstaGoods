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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const { data, error } = await supabase
      .from('products')
      .select('main_category, sub_category')
      .eq('is_active', true)
      .eq('is_marketplace_visible', true)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Build a structured map: { main_category: [sub_categories] }
    const categoryMap: Record<string, Set<string>> = {}
    for (const row of data ?? []) {
      if (!row.main_category) continue
      if (!categoryMap[row.main_category]) {
        categoryMap[row.main_category] = new Set()
      }
      if (row.sub_category) {
        categoryMap[row.main_category].add(row.sub_category)
      }
    }

    const categories = Object.entries(categoryMap).map(([name, subs]) => ({
      name,
      sub_categories: [...subs].sort(),
    })).sort((a, b) => a.name.localeCompare(b.name))

    return new Response(
      JSON.stringify({ count: categories.length, categories }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (_err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
