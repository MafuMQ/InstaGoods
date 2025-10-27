# Project Architecture & Features

## System Overview

InstaGoods is a multi-vendor marketplace platform built with a modern tech stack focusing on performance, scalability, and user experience.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           React 18 + TypeScript + Vite                │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│     ┌──────────────────────┼──────────────────────┐         │
│     │                      │                      │         │
│  ┌──▼──┐              ┌───▼───┐            ┌─────▼────┐    │
│  │Pages│              │Context│            │Components│    │
│  │     │              │       │            │          │    │
│  │-Cust│              │-Cart  │            │-Customer │    │
│  │-Supp│              │-Loc   │            │-Supplier │    │
│  └──┬──┘              │-Wish  │            │-UI (shad)│    │
│     │                 └───┬───┘            └─────┬────┘    │
│     └─────────────────────┼──────────────────────┘         │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼────┐      ┌──────▼──────┐   ┌──────▼──────┐
    │Supabase │      │API Functions│   │Google Maps  │
    │         │      │             │   │   API       │
    │-Auth    │      │-Optimize    │   │             │
    │-Database│      │-Geocode     │   │-Geocoding   │
    │-Storage │      │             │   │-Autocomplete│
    │-RLS     │      └─────────────┘   └─────────────┘
    └─────────┘
```

---

## Data Flow

### Customer Shopping Flow

```
1. User visits site → Sees all products (static + database)
2. Sets location → Products filtered by delivery radius
3. Searches/filters → Products filtered in real-time
4. Views product → Fetches detailed info from DB
5. Adds to cart → Stored in Context + LocalStorage
6. Checkout → Creates order in Supabase
7. Order confirmation → Email notification (future)
```

### Supplier Management Flow

```
1. Supplier signs up → Auto-creates supplier profile (trigger)
2. Adds products → Stored in Supabase with location data
3. Receives order → Real-time update via Supabase
4. Updates status → Customer sees update
5. Tracks income → Linked to completed orders
6. Views analytics → Dashboard aggregates data
```

---

## Feature Breakdown

### 1. Location-Based Filtering

**How it works:**
1. Customer enters address
2. Google Maps API geocodes to coordinates
3. Each product has supplier coordinates + delivery radius
4. Haversine formula calculates distance
5. Products outside radius are hidden

**Key Files:**
- `src/lib/geocode.ts` - Geocoding logic
- `src/lib/distance.ts` - Distance calculations
- `src/context/LocationContext.tsx` - Location state

**Formula:**
```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * 
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

---

### 2. Product Optimization Tool

**Purpose:** Help suppliers decide optimal product quantities to maximize profit within budget.

**Algorithm:** Linear Programming (Simplex Method)
- **Objective:** Maximize total profit
- **Constraints:** 
  - Total cost ≤ budget
  - Quantity ≥ lowerBound
  - Quantity ≤ upperBound
  - Integer quantities only

**Example Problem:**
```
Given:
- Product A: Cost $50, Sell $75, Profit $25
- Product B: Cost $30, Sell $45, Profit $15
- Budget: $1000

Find: How many of each to buy?

Solution:
- Buy 13 × Product A = $650 cost, $325 profit
- Buy 11 × Product B = $330 cost, $165 profit
- Total spent: $980
- Total profit: $490
```

**Key Files:**
- `src/pages/supplier/SupplierOptimize.tsx` - UI
- `api/optimize-proxy.js` - API proxy

---

### 3. Multi-Vendor System

**Architecture:**
- Each supplier has unique ID (UUID)
- Products linked via `supplier_id` foreign key
- Orders track both customer and supplier
- RLS policies ensure data isolation

**Security:**
```sql
-- Suppliers can only see their own data
CREATE POLICY "Suppliers can view own products"
ON products FOR SELECT
USING (auth.uid() = supplier_id);

-- Customers can see all active products
CREATE POLICY "Anyone can view active products"
ON products FOR SELECT
USING (is_active = true);
```

---

### 4. State Preservation

**Problem:** When user navigates back, scroll position and filters are lost.

**Solution:** 
1. Store state in `sessionStorage` before navigation
2. Pass state via React Router's `location.state`
3. Restore on component mount

**Implementation:**
```typescript
// Before navigation
navigate('/product/123', {
  state: {
    from: '/products',
    scrollY: window.scrollY,
    filters: currentFilters,
    category: selectedCategory
  }
});

// On return
useEffect(() => {
  const state = location.state as NavigationState;
  if (state?.scrollY) {
    window.scrollTo(0, state.scrollY);
  }
  if (state?.filters) {
    setFilters(state.filters);
  }
}, [location]);
```

**Key Files:**
- `src/pages/customer/Index.tsx` - Implementation example

---

### 5. Real-time Updates

**Supabase Subscriptions:**
```typescript
// Subscribe to order updates
const subscription = supabase
  .channel('orders')
  .on('postgres_changes', 
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'orders',
      filter: `supplier_id=eq.${supplierId}`
    },
    (payload) => {
      console.log('Order updated:', payload.new);
      refreshOrders();
    }
  )
  .subscribe();

// Cleanup
return () => {
  subscription.unsubscribe();
};
```

---

### 6. Authentication & Authorization

**Flow:**
```
1. User signs up → Supabase Auth creates user
2. Database trigger creates supplier profile
3. JWT token issued with user_id claim
4. RLS policies enforce access control
5. Client stores session in localStorage
```

**Auth Check:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  navigate('/auth');
  return;
}
```

---

## Database Schema

### Key Tables

```sql
-- Users (managed by Supabase Auth)
auth.users (
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP
)

-- Suppliers
public.suppliers (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  business_name TEXT,
  location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  logo_url TEXT,
  banner_url TEXT,
  is_active BOOLEAN DEFAULT true
)

-- Products
public.products (
  id UUID PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  main_category TEXT,
  sub_category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  delivery_radius_km NUMERIC,
  no_delivery BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
)

-- Orders
public.orders (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id),
  supplier_id UUID REFERENCES suppliers(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  order_date TIMESTAMP DEFAULT NOW()
)

-- Incomes
public.incomes (
  id UUID PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id),
  source TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  income_date DATE NOT NULL,
  order_id UUID REFERENCES orders(id)
)

-- Expenses
public.expenses (
  id UUID PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  expense_date DATE NOT NULL
)
```

### Indexes

```sql
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_category ON products(main_category, sub_category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_supplier ON orders(supplier_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
```

---

## Performance Optimizations

### 1. Code Splitting
```typescript
// Lazy load heavy pages
const SupplierDashboard = lazy(() => 
  import('./pages/supplier/SupplierDashboard')
);
```

### 2. Image Optimization
- Use WebP format where possible
- Lazy load images below fold
- Proper sizing with `srcset`

### 3. Caching Strategy
```typescript
// TanStack Query with stale-while-revalidate
const { data } = useQuery({
  queryKey: ['products', category],
  queryFn: fetchProducts,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### 4. Bundle Size
- Tree-shaking enabled
- Dynamic imports for routes
- Minimal external dependencies

---

## Security Measures

### 1. Row Level Security (RLS)
All tables have RLS enabled:
```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

### 2. Environment Variables
API keys never exposed in client code:
```typescript
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
```

### 3. Input Validation
Zod schemas for all forms:
```typescript
const productSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  stock_quantity: z.number().int().nonnegative()
});
```

### 4. SQL Injection Prevention
Supabase uses parameterized queries:
```typescript
const { data } = await supabase
  .from('products')
  .select()
  .eq('supplier_id', supplierId); // Safe!
```

---

## Testing Strategy

### Unit Tests
```typescript
// Component tests
describe('ProductCard', () => {
  it('displays product name', () => {
    render(<ProductCard {...mockProps} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// Test full user flows
it('allows user to add product to cart', async () => {
  render(<App />);
  const addButton = screen.getByText('Add to Cart');
  fireEvent.click(addButton);
  expect(screen.getByText('1 item in cart')).toBeInTheDocument();
});
```

### E2E Tests (Recommended)
Consider Playwright or Cypress for end-to-end testing.

---

## Monitoring & Analytics

### Recommended Tools

1. **Error Tracking:** Sentry
2. **Analytics:** Google Analytics / Plausible
3. **Performance:** Vercel Analytics / Web Vitals
4. **Database:** Supabase Dashboard

### Key Metrics to Track

- Page load time (target: < 3s)
- Time to Interactive (target: < 5s)
- Error rate (target: < 1%)
- Conversion rate
- Cart abandonment rate
- Average order value

---

## Future Enhancements

### Planned Features
- [ ] Real-time chat between customers and suppliers
- [ ] Advanced search with Algolia
- [ ] Payment integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Review and rating system
- [ ] Promotional campaigns
- [ ] Loyalty program
- [ ] Multi-language support

### Technical Improvements
- [ ] Implement Redis caching
- [ ] Add GraphQL API layer
- [ ] Server-side rendering (SSR)
- [ ] Progressive Web App (PWA)
- [ ] Automated testing pipeline
- [ ] Performance budgets
- [ ] A/B testing framework

---

## Contributing

### Development Workflow

1. **Create Feature Branch**
```bash
git checkout -b feature/new-feature
```

2. **Make Changes**
- Write code
- Add tests
- Update documentation

3. **Commit**
```bash
git commit -m "feat: add new feature"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/)

4. **Push and Create PR**
```bash
git push origin feature/new-feature
```

### Code Review Checklist
- [ ] Code follows style guide
- [ ] Tests pass
- [ ] No console.log statements
- [ ] Documentation updated
- [ ] Responsive design tested
- [ ] Accessibility checked

---

## Support & Community

- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-repo/discussions)
- **Discord:** [Join our server](#)
- **Email:** support@instagoods.app

---

**InstaGoods - Empowering Local Businesses Online 🚀**
