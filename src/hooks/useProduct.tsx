import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];
type Supplier = Database['public']['Tables']['suppliers']['Row'];

interface ProductWithSupplier extends Product {
  supplier: Supplier | null;
}

export const useProduct = (id: string | undefined) => {
  const [product, setProduct] = useState<ProductWithSupplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch product with supplier data
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            supplier:suppliers(*)
          `)
          .eq('id', id)
          .eq('is_active', true)
          .eq('is_marketplace_visible', true)
          .single();

        if (productError) {
          if (productError.code === 'PGRST116') {
            // No rows found
            setProduct(null);
          } else {
            throw productError;
          }
        } else {
          setProduct(productData as ProductWithSupplier);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to fetch product');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
};