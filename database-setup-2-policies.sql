-- InstaGoods Database Setup - Part 2: Security Policies
-- Run this AFTER running database-setup-1-tables.sql

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for suppliers
CREATE POLICY "Suppliers can view their own data"
  ON public.suppliers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Suppliers can update their own data"
  ON public.suppliers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active suppliers"
  ON public.suppliers FOR SELECT
  USING (true);

-- RLS Policies for products
CREATE POLICY "Suppliers can manage their own products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.suppliers
      WHERE suppliers.id = products.supplier_id
      AND suppliers.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- RLS Policies for orders
CREATE POLICY "Suppliers can view their own orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.suppliers
      WHERE suppliers.id = orders.supplier_id
      AND suppliers.user_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can update their own orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.suppliers
      WHERE suppliers.id = orders.supplier_id
      AND suppliers.user_id = auth.uid()
    )
  );

-- RLS Policies for expenses
CREATE POLICY "Suppliers can manage their own expenses"
  ON public.expenses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.suppliers
      WHERE suppliers.id = expenses.supplier_id
      AND suppliers.user_id = auth.uid()
    )
  );