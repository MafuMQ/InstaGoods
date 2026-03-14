-- Fix: All Groceries products were incorrectly assigned sub_category = 'Home & Living'
-- (Home & Living belongs to Physical Goods).
-- These are all pantry staples / canned goods, so the correct subcategory is 'Pantry Essentials'.

UPDATE public.products
SET sub_category = 'Pantry Essentials'
WHERE main_category = 'Groceries'
  AND sub_category = 'Home & Living';
