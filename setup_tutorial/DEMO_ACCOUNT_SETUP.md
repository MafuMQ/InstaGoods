# Demo Account Setup Guide

This guide walks you through creating a fully functional demo account for InstaGoods with sample data.

## 🎯 Purpose

A demo account allows you to:
- Showcase the platform's features
- Test functionality without using real data
- Provide stakeholders with a live walkthrough
- Train new team members

---

## 🚀 Quick Setup (3 Methods)

### Method 1: UI Signup (Fastest - 2 minutes)

**Best for:** Quick demos, testing basic functionality

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:** `http://localhost:5173/auth`

3. **Sign up with these credentials:**
   - **Full Name:** `Demo Supplier`
   - **Email:** `demo@example.com`
   - **Password:** `REDACTED_PASSWORD`

4. **Done!** You'll be automatically:
   - Logged in
   - Given a supplier account
   - Redirected to the dashboard

**Note:** This creates a basic account without products or sample data.

---

### Method 2: Supabase Dashboard (5 minutes)

**Best for:** More control over user creation

1. **Go to Supabase Dashboard** → `Authentication` → `Users`

2. **Click "Add User"** or "Invite User"

3. **Fill in the details:**
   - Email: `demo@example.com`
   - Password: `REDACTED_PASSWORD`
   - ✓ Auto Confirm User (important!)
   - User Metadata (optional):
     ```json
     {
       "full_name": "Demo Supplier"
     }
     ```

4. **Click "Send Invitation" or "Create User"**

5. **Verify creation:**
   - Go to SQL Editor
   - Run: 
     ```sql
     SELECT * FROM profiles WHERE email = 'demo@example.com';
     SELECT * FROM suppliers WHERE user_id = (SELECT id FROM profiles WHERE email = 'demo@example.com');
     ```

**Note:** This also creates a basic account without sample data.

---

### Method 3: Complete Demo with Sample Data (Recommended - 10 minutes)

**Best for:** Full demos, presentations, stakeholder reviews

#### Step 1: Create the Demo User

**Option A - Via UI:**
1. Go to `http://localhost:5173/auth`
2. Sign up with:
   - Full Name: `Demo Supplier`
   - Email: `demo@example.com`
   - Password: `REDACTED_PASSWORD`
3. Log out after creation

**Option B - Via Supabase Dashboard:**
1. Go to Authentication → Users
2. Add user: `demo@example.com` / `REDACTED_PASSWORD`
3. Auto-confirm the user

#### Step 2: Add Sample Data

1. **Open Supabase SQL Editor:**
   - Go to your Supabase Dashboard
   - Navigate to: `SQL Editor`

2. **Run the demo setup script:**
   - Open the file: `setup_tutorial/create-demo-account.sql`
   - Copy all contents
   - Paste into Supabase SQL Editor
   - Click "Run" or press `Ctrl+Enter`

3. **Verify success:**
   - You should see a success message showing:
     - 10 products created
     - 10 orders created
     - 10 expenses created
     - Total revenue and expenses

#### Step 3: Log In and Explore

1. Go to `http://localhost:5173/auth`
2. Sign in with `demo@example.com` / `REDACTED_PASSWORD`
3. Explore the supplier dashboard with realistic data!

---

## 📊 What's Included in the Demo Account

### Business Profile
- **Business Name:** Demo Fresh Market
- **Description:** Professional demo description
- **Location:** Cape Town, Western Cape
- **Status:** Active

### Products (10 items)
- Fresh Organic Tomatoes
- Free-Range Eggs
- Artisan Whole Wheat Bread
- Local Honey
- Organic Baby Spinach
- Farm Fresh Milk
- Handmade Chocolate Truffles
- Organic Chicken Breast
- Fresh Garden Salad Mix
- Artisan Cheese Selection

**Product Details:**
- Realistic descriptions
- Various categories (groceries, products)
- Different delivery options
- Stock levels
- Pricing

### Orders (10 orders)
- **Statuses:** Completed, Processing, Pending
- **Date Range:** Last 7 days
- **Total Revenue:** ~R1,213.00
- **Customer Notes:** Realistic order notes

### Expenses (10 records)
- **Categories:** Supplies, Transport, Marketing, etc.
- **Total Expenses:** ~R4,370.00
- **Date Range:** Last 10 days

### Dashboard Metrics
All statistics will be populated with realistic data:
- Total Revenue
- Total Orders
- Active Products
- Total Expenses
- Profit/Loss calculations
- Recent activity

---

## 🎨 Customizing the Demo Account

### Changing Business Details

```sql
UPDATE suppliers
SET 
  business_name = 'Your Custom Name',
  description = 'Your custom description',
  location = 'Your Location'
WHERE user_id = (
  SELECT id FROM profiles WHERE email = 'demo@example.com'
);
```

### Adding More Products

```sql
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
  stock_quantity
)
SELECT 
  id,
  'Your Product Name',
  'Product description',
  99.99,
  'groceries',
  50
FROM demo_supplier;
```

### Adjusting Financial Data

```sql
-- Add custom order
WITH demo_supplier AS (
  SELECT id FROM suppliers 
  WHERE user_id = (SELECT id FROM profiles WHERE email = 'demo@example.com')
)
INSERT INTO orders (supplier_id, product_name, quantity, unit_price, total_amount, status)
SELECT id, 'Custom Product', 1, 100.00, 100.00, 'completed'
FROM demo_supplier;

-- Add custom expense
WITH demo_supplier AS (
  SELECT id FROM suppliers 
  WHERE user_id = (SELECT id FROM profiles WHERE email = 'demo@example.com')
)
INSERT INTO expenses (supplier_id, category, amount, description)
SELECT id, 'Custom Category', 50.00, 'Custom expense'
FROM demo_supplier;
```

---

## 🔄 Resetting the Demo Account

### Clear All Data (Keep Account)

```sql
-- Remove all products, orders, and expenses for demo account
WITH demo_supplier AS (
  SELECT id FROM suppliers 
  WHERE user_id = (SELECT id FROM profiles WHERE email = 'demo@example.com')
)
DELETE FROM products WHERE supplier_id = (SELECT id FROM demo_supplier);

WITH demo_supplier AS (
  SELECT id FROM suppliers 
  WHERE user_id = (SELECT id FROM profiles WHERE email = 'demo@example.com')
)
DELETE FROM orders WHERE supplier_id = (SELECT id FROM demo_supplier);

WITH demo_supplier AS (
  SELECT id FROM suppliers 
  WHERE user_id = (SELECT id FROM profiles WHERE email = 'demo@example.com')
)
DELETE FROM expenses WHERE supplier_id = (SELECT id FROM demo_supplier);

-- Then run create-demo-account.sql again to repopulate
```

### Delete Entire Demo Account

```sql
-- WARNING: This permanently deletes the demo account and all associated data

-- Delete from auth.users (cascades to everything else)
DELETE FROM auth.users 
WHERE email = 'demo@example.com';
```

---

## 🧪 Testing the Demo Account

### Key Features to Demonstrate

1. **Dashboard Overview**
   - Navigate to `/supplier/dashboard`
   - Show revenue, orders, products stats
   - View recent activity

2. **Product Management**
   - Navigate to `/supplier/products`
   - View product catalog
   - Edit a product
   - Add a new product
   - Toggle product active status

3. **Order Management**
   - Navigate to `/supplier/orders`
   - View all orders
   - Filter by status
   - Update order status
   - View order details

4. **Financial Tracking**
   - Navigate to `/supplier/income`
   - View income/expense reports
   - Add new expense
   - View profit calculations

5. **Business Settings**
   - Navigate to `/supplier/settings`
   - Update business information
   - Change business description
   - Update location

6. **Optimization Tool**
   - Navigate to `/supplier/optimize`
   - Select products
   - Set constraints
   - Run optimization
   - View recommendations

---

## 💡 Tips for Effective Demos

### 1. **Prepare Your Data**
- Run the complete setup script before the demo
- Check that all products are visible
- Ensure orders span recent dates

### 2. **Create a Demo Script**
Example flow:
1. Start at dashboard → Show metrics
2. Go to products → Show inventory
3. View orders → Demonstrate order management
4. Show income tracker → Display financials
5. Try optimization tool → Show value proposition

### 3. **Handle Common Questions**

**Q: "Can I change the business name?"**
A: Yes! Go to Settings → Update business information

**Q: "How do I add products?"**
A: Products page → Add New Product button

**Q: "Where can customers see my products?"**
A: Customer marketplace at `/` (home page)

**Q: "How does delivery work?"**
A: Set delivery radius per product, or make available everywhere

### 4. **Showcase Key Features**

**For Suppliers:**
- Easy product management
- Real-time order tracking
- Financial overview
- Business optimization

**For Platform Value:**
- Multi-vendor support
- Location-based filtering
- Mobile responsive
- Secure authentication

---

## 🚨 Troubleshooting

### Issue: "Email already in use"
**Solution:** The demo account already exists. Either:
- Use different email
- Delete existing demo account first
- Just log in with existing credentials

### Issue: "No products showing"
**Solution:** 
- Make sure you ran `create-demo-account.sql`
- Check products table:
  ```sql
  SELECT * FROM products WHERE supplier_id = (
    SELECT id FROM suppliers WHERE user_id = (
      SELECT id FROM profiles WHERE email = 'demo@example.com'
    )
  );
  ```

### Issue: "Dashboard shows zero revenue"
**Solution:**
- Orders might not be marked as 'completed'
- Check orders table and update statuses:
  ```sql
  UPDATE orders 
  SET status = 'completed', completed_date = CURRENT_TIMESTAMP
  WHERE supplier_id = (
    SELECT id FROM suppliers WHERE user_id = (
      SELECT id FROM profiles WHERE email = 'demo@example.com'
    )
  ) AND status = 'pending';
  ```

### Issue: "Can't log in"
**Solution:**
- Verify email confirmation in Supabase Dashboard
- Check Authentication → Users → confirm email is verified
- Try password reset

---

## 📝 Multiple Demo Accounts

To create multiple demo accounts for different scenarios:

```sql
-- Use different emails for each scenario:
-- demo-grocery@instagoods.com  (Grocery store)
-- demo-services@instagoods.com (Service provider)
-- demo-artisan@instagoods.com  (Artisan products)

-- Update the email in create-demo-account.sql before running
-- This lets you show different business types
```

---

## 🔐 Security Note

**Important:** Demo accounts should:
- Use obvious demo credentials
- Not contain real customer data
- Be clearly labeled in the UI (optional)
- Be deleted or disabled in production

Consider adding a demo badge in development:
```typescript
{email === 'demo@example.com' && (
  <Badge variant="secondary">DEMO ACCOUNT</Badge>
)}
```

---

## ✅ Demo Account Checklist

Before your demo, verify:

- [ ] Demo account is created
- [ ] User can log in successfully
- [ ] Dashboard shows statistics
- [ ] At least 5-10 products exist
- [ ] Orders have various statuses
- [ ] Financial data is populated
- [ ] Business profile is complete
- [ ] All pages load correctly
- [ ] Mobile view works properly
- [ ] Sample data looks realistic

---

## 📧 Support

For issues with demo account setup:
1. Check this guide first
2. Review Supabase logs
3. Check browser console for errors
4. Verify database migrations ran correctly

---

**Happy Demoing! 🎉**
