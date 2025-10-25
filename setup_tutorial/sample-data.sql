-- Sample data for testing InstaGoods supplier income functionality
-- Replace 'your-email@example.com' with an actual supplier email address

-- Insert sample orders
WITH current_supplier AS (
  SELECT s.id as supplier_id 
  FROM suppliers s 
  JOIN profiles p ON s.user_id = p.id 
  WHERE p.email = 'your-email@example.com'  -- REPLACE WITH REAL EMAIL
)
INSERT INTO orders (supplier_id, product_name, quantity, unit_price, total_amount, status, order_date, completed_date, notes)
SELECT 
  cs.supplier_id,
  unnest(ARRAY[
    'Handcrafted Wooden Bowl',
    'Ceramic Coffee Mug Set', 
    'Artisan Leather Wallet',
    'Hand-knitted Wool Scarf',
    'Handmade Soap Collection',
    'Custom Engraved Cutting Board',
    'Vintage Style Picture Frame',
    'Handwoven Basket Set'
  ]) as product_name,
  unnest(ARRAY[2, 1, 1, 3, 5, 1, 4, 2]) as quantity,
  unnest(ARRAY[45.00, 32.50, 78.00, 55.00, 12.00, 95.00, 28.00, 42.00]) as unit_price,
  unnest(ARRAY[90.00, 32.50, 78.00, 165.00, 60.00, 95.00, 112.00, 84.00]) as total_amount,
  unnest(ARRAY['completed', 'completed', 'completed', 'processing', 'pending', 'cancelled', 'completed', 'processing']) as status,
  unnest(ARRAY[
    '2024-10-22 10:30:00+00',
    '2024-10-23 14:15:00+00',
    '2024-10-24 16:45:00+00', 
    '2024-10-25 09:00:00+00',
    '2024-10-25 13:30:00+00',
    '2024-10-22 11:00:00+00',
    '2024-10-22 15:20:00+00',
    '2024-10-25 08:00:00+00'
  ])::timestamp with time zone as order_date,
  unnest(ARRAY[
    '2024-10-23 14:00:00+00',
    '2024-10-24 09:30:00+00',
    '2024-10-25 11:20:00+00',
    NULL,
    NULL, 
    NULL,
    '2024-10-24 10:15:00+00',
    NULL
  ])::timestamp with time zone as completed_date,
  unnest(ARRAY[
    'Customer requested expedited shipping',
    'Gift wrap requested',
    'Customer very satisfied with quality',
    'Custom colors requested - blue, red, green',
    'Bulk order for local spa',
    'Customer changed mind about design',
    'Wedding gift order',
    'Rush order for farmers market'
  ]) as notes
FROM current_supplier cs;

-- Insert sample expenses
WITH current_supplier AS (
  SELECT s.id as supplier_id 
  FROM suppliers s 
  JOIN profiles p ON s.user_id = p.id 
  WHERE p.email = 'your-email@example.com'  -- REPLACE WITH REAL EMAIL
)
INSERT INTO expenses (supplier_id, category, amount, description, expense_date)
SELECT 
  cs.supplier_id,
  unnest(ARRAY['Materials', 'Shipping', 'Marketing', 'Tools']) as category,
  unnest(ARRAY[125.50, 45.20, 75.00, 89.99]) as amount,
  unnest(ARRAY[
    'Wood and leather supplies for October production',
    'Packaging and shipping costs for recent orders', 
    'Social media advertising campaign',
    'New crafting tools and equipment'
  ]) as description,
  unnest(ARRAY['2024-10-22', '2024-10-24', '2024-10-25', '2024-10-23'])::date as expense_date
FROM current_supplier cs;

-- Verify the data was inserted
SELECT 'Orders inserted:' as info, COUNT(*) as count FROM orders 
WHERE supplier_id = (
  SELECT s.id FROM suppliers s 
  JOIN profiles p ON s.user_id = p.id 
  WHERE p.email = 'your-email@example.com'  -- REPLACE WITH REAL EMAIL
);

SELECT 'Expenses inserted:' as info, COUNT(*) as count FROM expenses 
WHERE supplier_id = (
  SELECT s.id FROM suppliers s 
  JOIN profiles p ON s.user_id = p.id 
  WHERE p.email = 'your-email@example.com'  -- REPLACE WITH REAL EMAIL
);

-- Show summary of what was added
SELECT 
  'SUMMARY' as section,
  'Total Orders: 8 (4 completed, 2 processing, 1 pending, 1 cancelled)' as details
UNION ALL
SELECT 
  'REVENUE', 
  'Completed Orders Total: $' || 
  (SELECT COALESCE(SUM(total_amount), 0)::text FROM orders WHERE status = 'completed' AND supplier_id = (
    SELECT s.id FROM suppliers s 
    JOIN profiles p ON s.user_id = p.id 
    WHERE p.email = 'your-email@example.com'  -- REPLACE WITH REAL EMAIL
  ))
UNION ALL  
SELECT 
  'EXPENSES',
  'Total Expenses: $' || 
  (SELECT COALESCE(SUM(amount), 0)::text FROM expenses WHERE supplier_id = (
    SELECT s.id FROM suppliers s 
    JOIN profiles p ON s.user_id = p.id 
    WHERE p.email = 'your-email@example.com'  -- REPLACE WITH REAL EMAIL
  ));