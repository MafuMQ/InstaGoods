-- Persistent cart and wishlist tables
-- Allows AI agents and cross-device sessions to access a user's state

-- -------------------------------------------------------
-- customer_carts
-- -------------------------------------------------------
CREATE TABLE public.customer_carts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.customer_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cart"
  ON public.customer_carts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -------------------------------------------------------
-- customer_wishlists
-- -------------------------------------------------------
CREATE TABLE public.customer_wishlists (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  added_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

ALTER TABLE public.customer_wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wishlist"
  ON public.customer_wishlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
