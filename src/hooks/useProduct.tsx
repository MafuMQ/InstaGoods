import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { products as staticProducts, groceries, services, freelance, suppliers } from '@/lib/data';

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

        // Check if ID is a valid UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isUUID = uuidRegex.test(id);

        let productData = null;
        let productError = null;

        // Only query database if ID is a valid UUID
        if (isUUID) {
          const result = await supabase
            .from('products')
            .select(`
              *,
              supplier:suppliers(*)
            `)
            .eq('id', id)
            .single();
          
          productData = result.data;
          productError = result.error;
        } else {
          // Not a UUID, skip database query and go straight to static data
          productError = { code: 'PGRST116' } as any;
        }

        if (productError) {
          if (productError.code === 'PGRST116' || productError.code === '22P02') {
            // No rows found in database or invalid UUID, try static data
            console.log('Product not found in database, searching static data for ID:', id);
            const allStaticItems = [...staticProducts, ...groceries, ...services, ...freelance];
            console.log('Total static items:', allStaticItems.length);
            const staticItem = allStaticItems.find(item => item.id === id);
            console.log('Found static item:', staticItem);
            
            if (staticItem) {
              // Find the supplier for this static item
              const staticSupplier = suppliers.find(s => s.id === staticItem.supplierId);
              console.log('Found static supplier:', staticSupplier);
              
              // Convert static data to database format
              const convertedProduct: ProductWithSupplier = {
                id: staticItem.id,
                name: staticItem.name,
                description: staticItem.description,
                price: staticItem.price,
                image_url: staticItem.image,
                main_category: staticItem.mainCategory,
                sub_category: staticItem.subCategory,
                supplier_id: staticItem.supplierId,
                is_active: true,
                is_marketplace_visible: true,
                stock_quantity: 100, // Default for static items
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                available_everywhere: staticItem.availableEverywhere || false,
                delivery_location: staticItem.region || null,
                delivery_lat: staticItem.location?.lat || null,
                delivery_lng: staticItem.location?.lng || null,
                delivery_radius_km: staticItem.deliveryRadiusKm || null,
                delivery_fee: null,
                collection_available: false,
                no_delivery: false,
                supplier: staticSupplier ? {
                  id: staticSupplier.id,
                  business_name: staticSupplier.name,
                  description: staticSupplier.description,
                  location: staticSupplier.location,
                  logo_url: null,
                  banner_url: null,
                  user_id: null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                } : null
              };
              
              setProduct(convertedProduct);
            } else {
              setProduct(null);
            }
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