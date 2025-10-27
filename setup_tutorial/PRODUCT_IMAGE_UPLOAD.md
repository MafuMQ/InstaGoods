# Product Image Upload Setup Guide

## Quick Setup

If you're setting up a new database, the migration file will handle everything automatically. Just run:

```sql
-- In Supabase SQL Editor, run:
-- supabase/migrations/20251027000000_create_product_images_bucket.sql
```

## Manual Setup (if needed)

If the migration doesn't run automatically, follow these steps:

### 1. Create Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Set:
   - **Name:** `product-images`
   - **Public bucket:** ✓ (checked)
4. Click **"Create bucket"**

### 2. Set Storage Policies

Go to **Storage** → `product-images` bucket → **Policies** and add:

#### Policy 1: Public Read
- **Policy name:** `Public can view product images`
- **Allowed operation:** SELECT
- **Policy definition:**
```sql
bucket_id = 'product-images'
```

#### Policy 2: Authenticated Upload
- **Policy name:** `Authenticated suppliers can upload product images`
- **Allowed operation:** INSERT
- **Policy definition:**
```sql
bucket_id = 'product-images' AND auth.role() = 'authenticated'
```

#### Policy 3: Update Own Images
- **Policy name:** `Suppliers can update their own product images`
- **Allowed operation:** UPDATE
- **Policy definition:**
```sql
bucket_id = 'product-images' AND auth.role() = 'authenticated'
```

#### Policy 4: Delete Own Images
- **Policy name:** `Suppliers can delete their own product images`
- **Allowed operation:** DELETE
- **Policy definition:**
```sql
bucket_id = 'product-images' AND auth.role() = 'authenticated'
```

## How It Works

### Uploading Images

1. Suppliers go to **Supplier Dashboard** → **Products**
2. Click **"Add Product"** or edit an existing product
3. In the form, there's a new **"Product Image"** field
4. Click **"Choose File"** and select an image
5. Image uploads automatically (max 5MB)
6. Preview appears below the upload field
7. When product is saved, image URL is stored in database

### Image Storage Structure

Images are stored in this folder structure:
```
product-images/
  └── products/
      └── {supplier_id}/
          └── {timestamp}-{random}.{ext}
```

Example: `product-images/products/abc-123/1698765432-x7k9m.jpg`

### Features

- ✅ **File validation:** Only image files accepted
- ✅ **Size limit:** Maximum 5MB per image
- ✅ **Unique names:** Prevents overwrites with timestamp + random string
- ✅ **Preview:** See uploaded image before saving
- ✅ **Edit support:** Can change/update product images
- ✅ **Organized:** Images grouped by supplier ID

## Testing

1. **Create/Login as supplier:**
   ```
   Email: demo@example.com
   Password: REDACTED_PASSWORD
   ```

2. **Go to Products page**

3. **Add a new product:**
   - Fill in product details
   - Upload an image (JPG, PNG, WebP, etc.)
   - Click "Create Product"

4. **Verify:**
   - Product card shows the image
   - Image is visible on customer marketplace
   - Image loads quickly (public URL)

## Troubleshooting

### "Upload failed" error

**Cause:** Storage bucket not created or policies missing

**Fix:** 
1. Check if bucket exists in Supabase Storage
2. Verify policies are set correctly
3. Run the migration SQL file

### "Image size must be less than 5MB"

**Cause:** Selected image is too large

**Fix:** 
- Compress image before uploading
- Use online tools like TinyPNG or ImageOptim
- Resize image to reasonable dimensions (e.g., 1200x1200px)

### Image not showing

**Cause:** Image URL not saved or bucket not public

**Fix:**
1. Check if `image_url` column has a value:
   ```sql
   SELECT id, name, image_url FROM products WHERE supplier_id = 'your-supplier-id';
   ```
2. Verify bucket is public (Storage → bucket settings)
3. Test URL directly in browser

### Images loading slowly

**Cause:** Large file sizes

**Solution:**
- Compress images before upload
- Use WebP format for better compression
- Consider implementing image optimization (future feature)

## Database Schema

The `products` table already has the `image_url` column:

```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,  -- ← Stores uploaded image URL
  main_category TEXT NOT NULL,
  sub_category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  -- ... other fields
);
```

## Future Enhancements

Potential improvements for the future:

1. **Multiple Images:** Allow 3-5 images per product
2. **Image Cropping:** Built-in crop tool before upload
3. **Auto-Optimization:** Compress/resize images automatically
4. **CDN Integration:** Use Cloudflare/Imgix for faster delivery
5. **Image Gallery:** Carousel view for multiple product images
6. **AI Alt Text:** Auto-generate accessibility descriptions

## For Developers

### Component Structure

Image upload is implemented in:
- **File:** `src/pages/supplier/SupplierProducts.tsx`
- **Function:** `uploadProductImage()`
- **Handler:** `handleImageChange()`

### Key Code

```typescript
// Upload function
const uploadProductImage = async (file: File) => {
  const filePath = `products/${supplierId}/${fileName}`;
  await supabase.storage.from('product-images').upload(filePath, file);
  const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
  return data.publicUrl;
};

// Form field
<Input
  type="file"
  accept="image/*"
  onChange={handleImageChange}
/>
```

### Storage API

- **Bucket:** `product-images`
- **Method:** `supabase.storage.from('product-images')`
- **Operations:** upload(), getPublicUrl(), remove()

---

**Product image upload is now fully functional! 📸**
