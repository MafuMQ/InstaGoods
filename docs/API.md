# API Documentation

## Overview

InstaGoods uses a combination of Supabase's auto-generated REST API and custom serverless functions for specialized operations.

---

## Supabase API

All database operations go through Supabase's REST API with Row Level Security (RLS) enabled.

### Base URL

```
https://[your-project-ref].supabase.co/rest/v1/
```

### Authentication

All authenticated requests require the `Authorization` header:

```
Authorization: Bearer [supabase-anon-key]
```

For authenticated users, the JWT token is automatically included by the Supabase client.

---

## Custom API Endpoints

### 1. Optimization API

**Endpoint:** `POST /api/optimize-proxy`

**Description:** Proxies requests to the optimization algorithm service to find the optimal product mix that maximizes profit within budget constraints.

**Request Body:**

```json
{
  "variables": [
    {
      "name": "Product Name",
      "lowerBound": 0,
      "upperBound": 100,
      "integer": true,
      "multiplier": 50.00,
      "unit_selling_price": 75.00,
      "profit": 25.00
    }
  ],
  "budget": 5000.00
}
```

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `variables` | Array | Yes | Array of product variables to optimize |
| `variables[].name` | String | Yes | Product name |
| `variables[].lowerBound` | Number | Yes | Minimum quantity (can be 0) |
| `variables[].upperBound` | Number | Yes | Maximum quantity (or null for unlimited) |
| `variables[].integer` | Boolean | Yes | Whether quantity must be whole number |
| `variables[].multiplier` | Number | Yes | Cost per unit |
| `variables[].unit_selling_price` | Number | No | Selling price per unit |
| `variables[].profit` | Number | No | Profit per unit (overrides calculation) |
| `budget` | Number | Yes | Total budget available |

**Response:**

```json
{
  "max_profit": 1500.50,
  "result": {
    "Product A": 450.00,
    "Product B": 900.00
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `max_profit` | Number | Maximum achievable profit |
| `result` | Object | Map of product names to total cost allocated |

**Notes:**
- The `result` values represent the total amount spent on each product (units × cost)
- To get actual units: divide result value by the `multiplier` (cost per unit)
- The API respects `lowerBound` constraints - forcing minimum quantities may reduce total profit

**Example:**

```javascript
const response = await fetch('/api/optimize-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    variables: [
      {
        name: 'Widget A',
        lowerBound: 5,
        upperBound: 50,
        integer: true,
        multiplier: 20,
        unit_selling_price: 35
      }
    ],
    budget: 1000
  })
});

const data = await response.json();
// data.max_profit: 750
// data.result: { "Widget A": 1000 }
// Actual units: 1000 / 20 = 50 units
```

---

### 2. Geocoding API

**Endpoint:** `POST /api/geocode-proxy`

**Description:** Proxies requests to Google Maps Geocoding API to convert addresses to coordinates.

**Request Body:**

```json
{
  "address": "123 Main St, Johannesburg, Gauteng, South Africa"
}
```

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `address` | String | Yes | Full address to geocode |

**Response:**

```json
{
  "lat": -26.2041,
  "lng": 28.0473,
  "formatted_address": "123 Main St, Johannesburg, 2000, South Africa"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `lat` | Number | Latitude coordinate |
| `lng` | Number | Longitude coordinate |
| `formatted_address` | String | Google's formatted version of the address |

**Error Response:**

```json
{
  "error": "Address not found"
}
```

**Example:**

```javascript
const response = await fetch('/api/geocode-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: 'Sandton City, Johannesburg'
  })
});

const data = await response.json();
// data.lat: -26.1076
// data.lng: 28.0567
```

---

## Supabase Database Tables

### Products

**Table:** `products`

**Fields:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `supplier_id` | UUID | Foreign key to suppliers |
| `name` | TEXT | Product name |
| `description` | TEXT | Product description |
| `price` | NUMERIC | Product price |
| `main_category` | TEXT | Main category (Groceries, Products, Services, Freelancing) |
| `sub_category` | TEXT | Subcategory |
| `stock_quantity` | INTEGER | Available stock |
| `image_url` | TEXT | Product image URL |
| `is_active` | BOOLEAN | Whether product is active |
| `latitude` | NUMERIC | Supplier location latitude |
| `longitude` | NUMERIC | Supplier location longitude |
| `delivery_radius_km` | NUMERIC | Delivery radius in km (null = everywhere) |
| `no_delivery` | BOOLEAN | Collection only flag |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**RLS Policies:**
- Public read access for active products
- Suppliers can create/update/delete their own products

---

### Orders

**Table:** `orders`

**Fields:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `customer_id` | UUID | Foreign key to users |
| `supplier_id` | UUID | Foreign key to suppliers |
| `product_id` | UUID | Foreign key to products |
| `product_name` | TEXT | Product name snapshot |
| `quantity` | INTEGER | Order quantity |
| `unit_price` | NUMERIC | Price per unit |
| `total_amount` | NUMERIC | Total order amount |
| `status` | TEXT | Order status (pending, processing, completed, cancelled) |
| `delivery_address` | TEXT | Delivery address |
| `order_date` | TIMESTAMP | Order creation date |

**RLS Policies:**
- Customers can view their own orders
- Suppliers can view orders for their products

---

### Suppliers

**Table:** `suppliers`

**Fields:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (matches user ID) |
| `business_name` | TEXT | Business name |
| `description` | TEXT | Business description |
| `location` | TEXT | Business location |
| `logo_url` | TEXT | Logo image URL |
| `banner_url` | TEXT | Banner image URL |
| `latitude` | NUMERIC | Location latitude |
| `longitude` | NUMERIC | Location longitude |
| `is_active` | BOOLEAN | Whether business is active |
| `created_at` | TIMESTAMP | Creation timestamp |

**RLS Policies:**
- Public read access for active suppliers
- Suppliers can update their own profile

---

### Incomes

**Table:** `incomes`

**Fields:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `supplier_id` | UUID | Foreign key to suppliers |
| `source` | TEXT | Income source |
| `amount` | NUMERIC | Income amount |
| `description` | TEXT | Income description |
| `income_date` | DATE | Date of income |
| `order_id` | UUID | Foreign key to orders (optional) |
| `created_at` | TIMESTAMP | Creation timestamp |

**RLS Policies:**
- Suppliers can view and manage their own income records

---

### Expenses

**Table:** `expenses`

**Fields:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `supplier_id` | UUID | Foreign key to suppliers |
| `category` | TEXT | Expense category |
| `amount` | NUMERIC | Expense amount |
| `description` | TEXT | Expense description |
| `expense_date` | DATE | Date of expense |
| `created_at` | TIMESTAMP | Creation timestamp |

**RLS Policies:**
- Suppliers can view and manage their own expense records

---

## Rate Limits

### Supabase
- Standard Supabase rate limits apply (varies by plan)
- Free tier: 500 requests per second

### Custom APIs
- Optimization API: No explicit rate limit (proxied to external service)
- Geocoding API: Limited by Google Maps API quota

---

## Error Handling

All API endpoints follow standard HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

**Error Response Format:**

```json
{
  "error": "Error message description",
  "details": "Additional error details (optional)"
}
```

---

## Best Practices

1. **Always use environment variables** for API keys and secrets
2. **Implement retry logic** for network requests
3. **Cache responses** when appropriate (especially geocoding)
4. **Validate input** before making API calls
5. **Handle errors gracefully** with user-friendly messages
6. **Use TypeScript** for type safety with API responses
7. **Monitor API usage** to stay within rate limits

---

## Security

- All Supabase requests use RLS policies
- API keys should never be exposed in client code
- Use Supabase's built-in authentication for user management
- Custom API endpoints are proxied to hide external API keys
- Always validate and sanitize user input before database operations
