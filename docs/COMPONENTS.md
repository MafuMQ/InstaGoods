# Component Architecture Guide

## Overview

InstaGoods follows a component-based architecture with clear separation between customer-facing and supplier portal components.

---

## Directory Structure

```
src/components/
├── customer/              # Customer-facing components
│   ├── CategoryNav.tsx
│   ├── FreelanceCard.tsx
│   ├── GroceryCard.tsx
│   ├── Header.tsx
│   ├── ProductCard.tsx
│   ├── ServiceCard.tsx
│   └── ServiceRequestForm.tsx
├── supplier/              # Supplier portal components
│   └── SupplierNav.tsx
└── ui/                    # Reusable UI components (shadcn)
    ├── accordion.tsx
    ├── alert.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    └── ... (50+ components)
```

---

## Component Categories

### 1. Customer Components

#### Header
**File:** `src/components/customer/Header.tsx`

**Purpose:** Main navigation header for customer-facing pages

**Features:**
- Responsive design with mobile hamburger menu
- Location selector with autocomplete
- Search functionality
- Cart and wishlist indicators
- "Shop by Business" filter

**Props:**
```typescript
// No props - uses contexts internally
```

**Usage:**
```tsx
import Header from "@/components/customer/Header";

function Page() {
  return <Header />;
}
```

---

#### CategoryNav
**File:** `src/components/customer/CategoryNav.tsx`

**Purpose:** Category navigation for filtering products

**Features:**
- Grid layout for category selection
- Active state management
- Responsive design

**Props:**
```typescript
interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}
```

**Usage:**
```tsx
<CategoryNav 
  activeCategory={category}
  onCategoryChange={setCategory}
/>
```

---

#### ProductCard / GroceryCard / ServiceCard / FreelanceCard
**Files:** `src/components/customer/[Type]Card.tsx`

**Purpose:** Display individual items in grid layouts

**Features:**
- Consistent card design
- Image handling with fallbacks
- Price display
- Add to cart/wishlist buttons
- Location-based availability badges
- Responsive sizing

**Common Props:**
```typescript
interface CardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  supplier_name?: string;
  supplier_id: string;
  latitude?: number;
  longitude?: number;
  delivery_radius_km?: number;
  no_delivery?: boolean;
}
```

**Usage:**
```tsx
<ProductCard
  id={product.id}
  name={product.name}
  price={product.price}
  image_url={product.image_url}
  supplier_name={product.supplier_name}
  // ... other props
/>
```

---

#### ServiceRequestForm
**File:** `src/components/customer/ServiceRequestForm.tsx`

**Purpose:** Form for customers to request services

**Features:**
- Form validation with Zod
- Date/time selection
- Location input
- Budget estimation

**Props:**
```typescript
interface ServiceRequestFormProps {
  serviceId: string;
  serviceName: string;
  supplierId: string;
  onClose: () => void;
}
```

---

### 2. Supplier Components

#### SupplierNav
**File:** `src/components/supplier/SupplierNav.tsx`

**Purpose:** Navigation bar for supplier portal

**Features:**
- Dashboard, Products, Orders, Incomes, Expenses, Service Requests, Optimize, Settings links
- Mobile-responsive with hamburger menu
- Sign out functionality

**Props:**
```typescript
interface SupplierNavProps {
  onSignOut: () => void;
}
```

**Usage:**
```tsx
<SupplierNav onSignOut={handleSignOut} />
```

---

### 3. UI Components (shadcn/ui)

All UI components follow the shadcn/ui pattern and are located in `src/components/ui/`.

#### Button
**File:** `src/components/ui/button.tsx`

**Variants:**
- `default` - Primary action button
- `destructive` - Dangerous actions
- `outline` - Secondary action
- `secondary` - Alternative style
- `ghost` - Minimal style
- `link` - Text-only style

**Sizes:**
- `default` - Standard size
- `sm` - Small
- `lg` - Large
- `icon` - Icon-only button

**Usage:**
```tsx
<Button variant="default" size="lg">
  Click Me
</Button>
```

---

#### Card
**File:** `src/components/ui/card.tsx`

**Subcomponents:**
- `Card` - Container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Subtitle text
- `CardContent` - Main content
- `CardFooter` - Footer section

**Usage:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

---

#### Dialog
**File:** `src/components/ui/dialog.tsx`

**Usage:**
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

---

#### Input & Form Components

**Input:**
```tsx
<Input 
  type="text"
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

**Label:**
```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

**Form (React Hook Form integration):**
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema)
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}
```

---

## Context Providers

### CartContext
**File:** `src/context/CartContext.tsx`

**Purpose:** Manages shopping cart state

**Exported Functions:**
```typescript
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}
```

**Usage:**
```tsx
import { useCart } from "@/context/CartContext";

function Component() {
  const { addToCart, cartItems } = useCart();
  
  return (
    <button onClick={() => addToCart(item)}>
      Add to Cart ({cartItems.length})
    </button>
  );
}
```

---

### LocationContext
**File:** `src/context/LocationContext.tsx`

**Purpose:** Manages user location for delivery filtering

**Exported Functions:**
```typescript
interface LocationContextType {
  userAddress: string | null;
  userCoordinates: { lat: number; lng: number } | null;
  setUserLocation: (address: string, coords: { lat: number; lng: number }) => void;
  clearUserLocation: () => void;
}
```

**Usage:**
```tsx
import { useLocation } from "@/context/LocationContext";

function Component() {
  const { userAddress, userCoordinates, setUserLocation } = useLocation();
  
  return (
    <div>
      Current Location: {userAddress || "Not set"}
    </div>
  );
}
```

---

### WishlistContext
**File:** `src/context/WishlistContext.tsx`

**Purpose:** Manages wishlist state

**Exported Functions:**
```typescript
interface WishlistContextType {
  wishlistItems: string[]; // Product IDs
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}
```

---

## Custom Hooks

### useSupplierAuth
**File:** `src/hooks/useSupplierAuth.tsx`

**Purpose:** Handle supplier authentication and session

**Returns:**
```typescript
interface UseSupplierAuthReturn {
  loading: boolean;
  supplierId: string | null;
  signOut: () => Promise<void>;
}
```

**Usage:**
```tsx
import { useSupplierAuth } from "@/hooks/useSupplierAuth";

function SupplierPage() {
  const { loading, supplierId, signOut } = useSupplierAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!supplierId) return <div>Not authenticated</div>;
  
  return <div>Supplier ID: {supplierId}</div>;
}
```

---

### useProduct
**File:** `src/hooks/useProduct.tsx`

**Purpose:** Fetch single product data

**Returns:**
```typescript
interface UseProductReturn {
  product: Product | null;
  loading: boolean;
}
```

---

### useMarketplaceProducts
**File:** `src/hooks/useMarketplaceProducts.tsx`

**Purpose:** Fetch and filter marketplace products

**Returns:**
```typescript
interface UseMarketplaceProductsReturn {
  products: Product[];
  loading: boolean;
  error: Error | null;
}
```

---

## Component Best Practices

### 1. Responsive Design
Always use Tailwind's responsive modifiers:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {/* Content */}
</div>
```

### 2. Loading States
Show loading indicators:
```tsx
if (loading) {
  return <div className="flex items-center justify-center p-8">Loading...</div>;
}
```

### 3. Error Handling
Handle errors gracefully:
```tsx
if (error) {
  return <Alert variant="destructive">{error.message}</Alert>;
}
```

### 4. TypeScript
Always define prop types:
```tsx
interface MyComponentProps {
  title: string;
  count: number;
  onAction: () => void;
}

function MyComponent({ title, count, onAction }: MyComponentProps) {
  // Component logic
}
```

### 5. Accessibility
Use semantic HTML and ARIA attributes:
```tsx
<button aria-label="Add to cart" onClick={handleClick}>
  <ShoppingCart className="h-4 w-4" />
</button>
```

---

## Testing Components

### Example Test Structure
```typescript
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('renders product name', () => {
    render(
      <ProductCard
        id="1"
        name="Test Product"
        price={10}
        supplier_id="sup1"
      />
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

---

## Component Lifecycle

1. **Mount:** Component initializes, contexts load
2. **Render:** Component renders based on props/state
3. **Update:** Re-renders when props/state change
4. **Unmount:** Cleanup (remove listeners, cancel requests)

**Example with cleanup:**
```tsx
useEffect(() => {
  const subscription = subscribeToUpdates();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## Performance Optimization

### 1. Memo for expensive components
```tsx
const ExpensiveComponent = memo(({ data }) => {
  // Expensive rendering
});
```

### 2. useCallback for stable functions
```tsx
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

### 3. useMemo for expensive calculations
```tsx
const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);
```

---

## Further Resources

- [React Documentation](https://react.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
