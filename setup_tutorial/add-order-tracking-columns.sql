-- Store calculated distance (optional - can also be calculated on-the-fly)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS distance_km numeric;

-- Delivery estimation
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_hours numeric;

-- Order type classification (auto-detected from supplier category)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type varchar(20) DEFAULT 'physical';
-- Values: 'physical', 'perishable', 'service'

-- Tracking progress percentage
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_progress integer DEFAULT 0;

-- Add index for faster tracking queries
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(order_type, status) WHERE order_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_estimated_delivery ON orders(estimated_delivery) WHERE estimated_delivery IS NOT NULL;

-- Comment on the columns
COMMENT ON COLUMN orders.distance_km IS 'Calculated distance between customer and supplier in kilometers';
COMMENT ON COLUMN orders.estimated_delivery IS 'Estimated delivery timestamp based on distance';
COMMENT ON COLUMN orders.estimated_hours IS 'Estimated hours until delivery';
COMMENT ON COLUMN orders.order_type IS 'Type of order: physical, perishable, or service (auto-detected from category)';
COMMENT ON COLUMN orders.tracking_progress IS 'Progress percentage (0-100) based on order status';

