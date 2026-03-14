# Agent API Documentation

Public read-only endpoints designed for AI agent integrations. No authentication required from the caller — credentials are handled server-side by the Vercel proxy layer.

## Base URLs

| Layer | Base URL | When to use |
|---|---|---|
| Vercel proxy (recommended) | `https://<your-vercel-app>.vercel.app/api` | Production agents — no auth headers needed |
| Supabase direct | `https://tkixhgkaseiyshhgjgkp.supabase.co/functions/v1` | Local testing / bypass proxy |

## Authentication

### Via Vercel proxy
No auth headers required. The proxy injects credentials server-side automatically.

### Via Supabase directly
Include the anon key in both headers:
```
apikey: <VITE_SUPABASE_PUBLISHABLE_KEY>
Authorization: Bearer <VITE_SUPABASE_PUBLISHABLE_KEY>
```

---

## Endpoints

### 1. `GET /agent-categories`

Returns all product categories and their subcategories currently available in the marketplace.

**Parameters:** none

**Examples:**
```
GET https://<your-vercel-app>.vercel.app/api/agent-categories
GET https://tkixhgkaseiyshhgjgkp.supabase.co/functions/v1/agent-categories
```

**Response:**
```json
{
  "count": 3,
  "categories": [
    {
      "name": "Food",
      "sub_categories": ["Bread", "Dairy", "Vegetables"]
    },
    {
      "name": "Services",
      "sub_categories": ["Cleaning", "Plumbing"]
    }
  ]
}
```

---

### 2. `GET /agent-products`

Search and filter marketplace products. All parameters are optional — omitting `lat`/`lng` returns all visible products without distance filtering.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `lat` | float | User's latitude |
| `lng` | float | User's longitude |
| `radius_km` | float | Max delivery radius in km (default: `50`) |
| `category` | string | Filter by main category (partial match, case-insensitive) |
| `search` | string | Keyword search on product name and description |
| `min_price` | float | Minimum price filter |
| `max_price` | float | Maximum price filter |

When `lat`/`lng` are provided, results are:
- Filtered to only products that can reach the location (within delivery radius, or available everywhere, or collection-only)
- Sorted by distance ascending
- Annotated with `distance_km` and `delivery_available` fields

**Examples:**

All products:
```
GET https://<your-vercel-app>.vercel.app/api/agent-products
```

Products near Johannesburg:
```
GET https://<your-vercel-app>.vercel.app/api/agent-products?lat=-26.2041&lng=28.0473
```

Food products within 10km:
```
GET https://<your-vercel-app>.vercel.app/api/agent-products?lat=-26.2041&lng=28.0473&radius_km=10&category=Food
```

Keyword search with price cap:
```
GET https://<your-vercel-app>.vercel.app/api/agent-products?search=bread&max_price=50
```

**Response:**
```json
{
  "count": 2,
  "products": [
    {
      "id": "uuid",
      "name": "Sourdough Bread",
      "description": "Fresh daily",
      "price": 35,
      "image_url": "https://...",
      "main_category": "Food",
      "sub_category": "Bread",
      "stock_quantity": 20,
      "available_everywhere": false,
      "no_delivery": false,
      "delivery_location": "Sandton, Johannesburg",
      "delivery_lat": -26.1076,
      "delivery_lng": 28.0567,
      "delivery_radius_km": 15,
      "collection_available": true,
      "delivery_fee": 25,
      "distance_km": 3.2,
      "delivery_available": true,
      "suppliers": {
        "id": "uuid",
        "business_name": "The Bread Co.",
        "description": "Artisan bakery",
        "location": "Sandton",
        "phone": "+27 11 000 0000",
        "provider_type": "supplier"
      }
    }
  ]
}
```

---

### 3. `GET /agent-product-detail`

Returns full details for a single product by ID.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | UUID | Yes | The product's UUID |

**Example:**
```
GET https://<your-vercel-app>.vercel.app/api/agent-product-detail?id=123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "product": {
    "id": "uuid",
    "name": "Sourdough Bread",
    "description": "Fresh daily baked sourdough",
    "price": 35,
    "image_url": "https://...",
    "main_category": "Food",
    "sub_category": "Bread",
    "stock_quantity": 20,
    "available_everywhere": false,
    "no_delivery": false,
    "delivery_location": "Sandton, Johannesburg",
    "delivery_lat": -26.1076,
    "delivery_lng": 28.0567,
    "delivery_radius_km": 15,
    "collection_available": true,
    "delivery_fee": 25,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-06-01T00:00:00Z",
    "suppliers": {
      "id": "uuid",
      "business_name": "The Bread Co.",
      "description": "Artisan bakery",
      "location": "Sandton",
      "phone": "+27 11 000 0000",
      "provider_type": "supplier",
      "business_type": "food",
      "review_status": "approved"
    }
  }
}
```

**Error response (404):**
```json
{ "error": "Product not found" }
```

---

## Error Responses

All endpoints return errors in the same shape:

```json
{ "error": "Description of what went wrong" }
```

| HTTP Status | Meaning |
|---|---|
| `400` | Missing or invalid required parameter |
| `401` | Missing or invalid auth headers |
| `404` | Resource not found |
| `500` | Internal server error |

---

## Suggested Agent Workflow

1. Call `/api/agent-categories` to present the user with available product types
2. Collect the user's location (lat/lng) and desired category
3. Call `/api/agent-products` with those filters to show available options
4. Call `/api/agent-product-detail` on a chosen product to confirm stock, price, and supplier info before proceeding to order
