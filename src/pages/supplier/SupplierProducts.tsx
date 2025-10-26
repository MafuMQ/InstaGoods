import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupplierAuth } from "@/hooks/useSupplierAuth";
import SupplierNav from "@/components/supplier/SupplierNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import { mainCategories, subCategories } from "@/lib/data";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  main_category: string;
  sub_category: string;
  stock_quantity: number;
  is_active: boolean;
  is_marketplace_visible: boolean;
}

const SupplierProducts = () => {
  const { loading, supplierId, signOut } = useSupplierAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    main_category: "Physical Goods",
    sub_category: "Home & Living",
    stock_quantity: "0",
    is_marketplace_visible: true,
  });

  useEffect(() => {
    if (supplierId) {
      fetchProducts();
    }
  }, [supplierId]);

  const fetchProducts = async () => {
    if (!supplierId) return;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("supplier_id", supplierId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error fetching products");
    } else {
      setProducts(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supplierId) {
      toast.error("Supplier not found. Please try logging in again.");
      return;
    }

    // Validate form data
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setSubmitting(true);

    const productData = {
      supplier_id: supplierId,
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      main_category: formData.main_category,
      sub_category: formData.sub_category,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      is_active: true,
      is_marketplace_visible: formData.is_marketplace_visible,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) {
          console.error("Error updating product:", error);
          toast.error(`Error updating product: ${error.message}`);
        } else {
          toast.success("Product updated successfully");
          setDialogOpen(false);
          fetchProducts();
          resetForm();
        }
      } else {
        const { error, data } = await supabase
          .from("products")
          .insert(productData)
          .select();

        if (error) {
          console.error("Error creating product:", error);
          toast.error(`Error creating product: ${error.message}`);
        } else {
          console.log("Product created successfully:", data);
          toast.success("Product created successfully");
          setDialogOpen(false);
          fetchProducts();
          resetForm();
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error deleting product");
    } else {
      toast.success("Product deleted successfully");
      fetchProducts();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      main_category: "Physical Goods",
      sub_category: "Home & Living",
      stock_quantity: "0",
      is_marketplace_visible: true,
    });
    setEditingProduct(null);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      main_category: product.main_category,
      sub_category: product.sub_category || "",
      stock_quantity: product.stock_quantity.toString(),
      is_marketplace_visible: product.is_marketplace_visible ?? true,
    });
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <SupplierNav onSignOut={signOut} />
      
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Products</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
              <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="main_category">Main Category</Label>
                    <Select
                      value={formData.main_category}
                      onValueChange={(value) => setFormData({ ...formData, main_category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mainCategories.filter(cat => cat !== "All").map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sub_category">Subcategory</Label>
                    <Select
                      value={formData.sub_category}
                      onValueChange={(value) => setFormData({ ...formData, sub_category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategories[formData.main_category]?.filter(cat => cat !== "All").map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketplace_visible"
                    checked={formData.is_marketplace_visible}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_marketplace_visible: checked === true })
                    }
                  />
                  <Label htmlFor="marketplace_visible" className="text-sm font-normal">
                    List this product on the main marketplace
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting 
                    ? "Creating..." 
                    : editingProduct ? "Update Product" : "Create Product"
                  }
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="p-6">
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-semibold">${product.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className="font-semibold">{product.stock_quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="text-sm">{product.sub_category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marketplace:</span>
                  <span className={`text-sm font-medium ${product.is_marketplace_visible ? 'text-green-600' : 'text-orange-600'}`}>
                    {product.is_marketplace_visible ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(product)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No products yet. Create your first product to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierProducts;
