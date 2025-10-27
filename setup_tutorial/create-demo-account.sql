-- InstaGoods Demo Account Setup
-- This script creates a complete demo account with products, orders, and expenses
-- Run this in your Supabase SQL Editor AFTER setting up the database

-- Step 1: The demo user should already be created through the UI or Supabase Auth
-- Use email: demo@example.com
-- Password: REDACTED_PASSWORD (or your choice)

-- Step 2: Update the supplier information for a better demo experience
UPDATE suppliers
SET 
  business_name = 'Demo Fresh Market',
  description = 'Your local source for fresh groceries, artisan products, and quality services. We deliver to your neighborhood with care and attention to quality.',
  location = 'Cape Town, Western Cape'
WHERE user_id = (
  SELECT id FROM profiles WHERE email = 'demo@example.com'
);

-- Step 3: Insert sample products
WITH demo_supplier AS (
  SELECT id FROM suppliers 
  WHERE user_id = (SELECT id FROM profiles WHERE email = 'demo@example.com')
)
INSERT INTO products (
  supplier_id, 
  name, 
  description, 
  price, 
  main_category, 
  sub_category, 
  stock_quantity, 
  is_active,
  available_everywhere,
  collection_available,
  delivery_fee
)
SELECT 
  ds.id,
  unnest(ARRAY[
    'Fresh Organic Tomatoes',
    'Free-Range Eggs (Dozen)',
    'Artisan Whole Wheat Bread',
    'Local Honey (500g)',
    'Organic Baby Spinach',
    'Farm Fresh Milk (2L)',
    'Handmade Chocolate Truffles',
    'Organic Chicken Breast',
    'Fresh Garden Salad Mix',
    'Artisan Cheese Selection'
  ]) as name,
  unnest(ARRAY[
    'Locally grown, vine-ripened organic tomatoes. Perfect for salads and cooking.',
    'Farm-fresh free-range eggs from local chickens. Rich in flavor and nutrition.',
    'Freshly baked whole wheat bread made with organic flour and natural ingredients.',
    'Pure, raw honey harvested from local hives. Rich, natural sweetness.',
    'Tender organic baby spinach, perfect for salads and smoothies.',
    'Fresh pasteurized milk from local dairy farms. Full cream goodness.',
    'Luxury handmade chocolate truffles in assorted flavors.',
    'Premium organic chicken breast, hormone-free and locally sourced.',
    'Mixed fresh salad greens ready to serve. Washed and ready to eat.',
    'Curated selection of local artisan cheeses. Perfect for entertaining.'
  ]) as description,
  unnest(ARRAY[
    35.00, 45.00, 28.00, 75.00, 32.00,
    42.00, 95.00, 120.00, 38.00, 165.00
  ]) as price,
  unnest(ARRAY[
    'groceries', 'groceries', 'groceries', 'products', 'groceries',
    'groceries', 'products', 'groceries', 'groceries', 'products'
  ]) as main_category,
  unnest(ARRAY[
    'vegetables', 'dairy', 'bakery', 'pantry', 'vegetables',
    'dairy', 'snacks', 'meat', 'vegetables', 'dairy'
  ]) as sub_category,
  unnest(ARRAY[50, 100, 25, 30, 45, 40, 20, 35, 60, 15]) as stock_quantity,
  true as is_active,
  unnest(ARRAY[false, false, false, true, false, false, true, false, false, true]) as available_everywhere,
  unnest(ARRAY[true, true, true, false, true, true, false, true, true, false]) as collection_available,
  unnest(ARRAY[25.00, 25.00, 25.00, 0, 25.00, 25.00, 0, 25.00, 25.00, 0]) as delivery_fee
FROM demo_supplier ds;

-- Step 4: Insert sample orders (for dashboard statistics)
WITH demo_supplier AS (
  SELECT id FROM suppliers 
  WHERE user_id = (SELECT id FROM profiles WHERE email = 'demo@example.com')
),
demo_products AS (
  SELECT id, name, price FROM products WHERE supplier_id = (SELECT id FROM demo_supplier)
)
INSERT INTO orders (
  supplier_id, 
  product_name, 
  quantity, 
  unit_price, 
  total_amount, 
  status, 
  order_date, 
  completed_date,
  notes
)
SELECT 
  ds.id,
  unnest(ARRAY[
    'Fresh Organic Tomatoes',
    'Free-Range Eggs (Dozen)',
    'Artisan Whole Wheat Bread',
    'Local Honey (500g)',
    'Farm Fresh Milk (2L)',
    'Handmade Chocolate Truffles',
    'Organic Chicken Breast',
    'Fresh Garden Salad Mix',
    'Organic Baby Spinach',
    'Artisan Cheese Selection'
  ]) as product_name,
  unnest(ARRAY[3, 2, 1, 2, 4, 1, 2, 2, 3, 1]) as quantity,
  unnest(ARRAY[35.00, 45.00, 28.00, 75.00, 42.00, 95.00, 120.00, 38.00, 32.00, 165.00]) as unit_price,
  unnest(ARRAY[105.00, 90.00, 28.00, 150.00, 168.00, 95.00, 240.00, 76.00, 96.00, 165.00]) as total_amount,
  unnest(ARRAY[
    'completed', 'completed', 'completed', 'completed', 'processing',
    'pending', 'completed', 'completed', 'processing', 'pending'
  ]) as status,
  unnest(ARRAY[
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '4 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '12 hours',
    CURRENT_TIMESTAMP - INTERVAL '6 days',
    CURRENT_TIMESTAMP - INTERVAL '4 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '6 hours'
  ]) as order_date,
  unnest(ARRAY[
    CURRENT_TIMESTAMP - INTERVAL '4 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    NULL,
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    NULL,
    NULL
  ]) as completed_date,
  unnest(ARRAY[
    'Customer was very happy with quality',
    'Regular customer order',
    'Rush delivery requested',
    'Gift packaging included',
    'Awaiting delivery confirmation',
    'New customer - first order',
    'Bulk order for family gathering',
    'Repeat customer',
    'Out for delivery',
    'Payment confirmed'
  ]) as notes
FROM demo_supplier ds;

-- Step 5: Insert sample expenses (for financial tracking)
WITH demo_supplier AS (
  SELECT id FROM suppliers 
  WHERE user_id = (SELECT id FROM profiles WHERE email = 'demo@example.com')
)
INSERT INTO expenses (
  supplier_id, 
  category, 
  amount, 
  description, 
  expense_date
)
SELECT 
  ds.id,
  unnest(ARRAY[
    'Supplies', 'Transportation', 'Marketing', 'Packaging',
    'Utilities', 'Labor', 'Rent', 'Insurance',
    'Equipment', 'Maintenance'
  ]) as category,
  unnest(ARRAY[
    450.00, 120.00, 250.00, 180.00, 
    320.00, 800.00, 1200.00, 350.00,
    550.00, 150.00
  ]) as amount,
  unnest(ARRAY[
    'Fresh produce and raw materials',
    'Delivery vehicle fuel and maintenance',
    'Social media advertising campaign',
    'Eco-friendly packaging materials',
    'Shop electricity and water',
    'Part-time staff wages',
    'Monthly shop rent',
    'Business liability insurance',
    'Commercial refrigerator',
    'Equipment repairs and upkeep'
  ]) as description,
  unnest(ARRAY[
    CURRENT_DATE - INTERVAL '6 days',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE - INTERVAL '4 days',
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE - INTERVAL '8 days',
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE - INTERVAL '5 days'
  ]) as expense_date
FROM demo_supplier ds;

-- Step 6: Verify the demo account setup
SELECT 
  'Demo Account Created Successfully!' as status,
  p.email,
  s.business_name,
  (SELECT COUNT(*) FROM products WHERE supplier_id = s.id) as product_count,
  (SELECT COUNT(*) FROM orders WHERE supplier_id = s.id) as order_count,
  (SELECT COUNT(*) FROM expenses WHERE supplier_id = s.id) as expense_count,
  (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE supplier_id = s.id AND status = 'completed') as total_revenue,
  (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE supplier_id = s.id) as total_expenses
FROM profiles p
JOIN suppliers s ON s.user_id = p.id
WHERE p.email = 'demo@example.com';

-- Success message
SELECT 'Demo account setup complete! You can now log in with:' as message
UNION ALL SELECT 'Email: demo@example.com'
UNION ALL SELECT 'Password: REDACTED_PASSWORD'
UNION ALL SELECT ''
UNION ALL SELECT 'The account includes:'
UNION ALL SELECT '✓ 10 products across different categories'
UNION ALL SELECT '✓ 10 orders with various statuses'
UNION ALL SELECT '✓ 10 expense records'
UNION ALL SELECT '✓ Complete business profile'
UNION ALL SELECT ''
UNION ALL SELECT 'Navigate to /supplier/dashboard to see your demo data!';
