-- Create incomes table only (other tables already exist)
CREATE TABLE IF NOT EXISTS public.incomes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id uuid REFERENCES public.suppliers(id) ON DELETE CASCADE NOT NULL,
    source text NOT NULL,
    amount numeric NOT NULL CHECK (amount > 0),
    description text,
    income_date date NOT NULL DEFAULT CURRENT_DATE,
    order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for incomes
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

-- Policy: Suppliers can only see their own incomes
CREATE POLICY "Suppliers can view own incomes" ON public.incomes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.suppliers s
            WHERE s.id = incomes.supplier_id
            AND s.user_id = auth.uid()
        )
    );

-- Policy: Suppliers can insert their own incomes
CREATE POLICY "Suppliers can insert own incomes" ON public.incomes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.suppliers s
            WHERE s.id = incomes.supplier_id
            AND s.user_id = auth.uid()
        )
    );

-- Policy: Suppliers can update their own incomes
CREATE POLICY "Suppliers can update own incomes" ON public.incomes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.suppliers s
            WHERE s.id = incomes.supplier_id
            AND s.user_id = auth.uid()
        )
    );

-- Policy: Suppliers can delete their own incomes
CREATE POLICY "Suppliers can delete own incomes" ON public.incomes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.suppliers s
            WHERE s.id = incomes.supplier_id
            AND s.user_id = auth.uid()
        )
    );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_incomes_supplier_id ON public.incomes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_incomes_order_id ON public.incomes(order_id);
CREATE INDEX IF NOT EXISTS idx_incomes_income_date ON public.incomes(income_date);

-- Create unique constraint to prevent duplicate order incomes
CREATE UNIQUE INDEX IF NOT EXISTS idx_incomes_unique_order ON public.incomes(order_id) WHERE order_id IS NOT NULL;

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for incomes table
DROP TRIGGER IF EXISTS update_incomes_updated_at ON public.incomes;
CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON public.incomes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
