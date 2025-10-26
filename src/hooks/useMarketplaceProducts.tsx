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
        .select("id, name, description, price, image_url, main_category, sub_category, supplier_id")
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