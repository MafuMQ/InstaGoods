import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  main_category: string;
  sub_category: string | null;
  supplier_id: string;
  available_everywhere: boolean | null;
  no_delivery: boolean | null;
  delivery_location: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  delivery_radius_km: number | null;
  collection_available: boolean | null;
}

export const useMarketplaceProducts = () => {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, price, image_url, main_category, sub_category, supplier_id, available_everywhere, no_delivery, delivery_location, delivery_lat, delivery_lng, delivery_radius_km, collection_available")
        .eq("is_active", true)
        .eq("is_marketplace_visible", true)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
};