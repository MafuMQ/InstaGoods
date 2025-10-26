import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupplierAuth } from "@/hooks/useSupplierAuth";
import SupplierNav from "@/components/supplier/SupplierNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Target, Plus, Trash2, Calculator, TrendingUp, DollarSign } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  main_category: string;
  sub_category: string;
}

interface OptimizationVariable {
  name: string;
  lowerBound: number;
  upperBound: number | null;
  integer: boolean;
  multiplier: number;
  profit?: number;
  unit_selling_price?: number;
  profit_per_dollar?: number;
}

interface OptimizationResult {
  max_profit: number;
  result: Record<string, number>;
}

const SupplierOptimize = () => {
  const { loading, supplierId, signOut } = useSupplierAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [variables, setVariables] = useState<Record<string, OptimizationVariable>>({});
  const [budget, setBudget] = useState<string>("");
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  useEffect(() => {
    if (supplierId) {
      fetchProducts();
    }
  }, [supplierId]);

  const fetchProducts = async () => {
    if (!supplierId) return;

    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, main_category, sub_category")
      .eq("supplier_id", supplierId)
      .eq("is_active", true)
      .order("name");

    if (error) {
      toast.error("Error fetching products");
    } else {
      setProducts(data || []);
    }
  };

  const handleProductToggle = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
      // Initialize variable data for new product
      const product = products.find(p => p.id === productId);
      if (product && !variables[productId]) {
        setVariables(prev => ({
          ...prev,
          [productId]: {
            name: product.name,
            lowerBound: 0,
            upperBound: product.stock_quantity,
            integer: true,
            multiplier: 1,
            unit_selling_price: product.price,
          }
        }));
      }
    } else {
      newSelected.delete(productId);
      // Remove variable data for unselected product
      setVariables(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    }
    setSelectedProducts(newSelected);
  };

  const updateVariable = (productId: string, field: keyof OptimizationVariable, value: any) => {
    setVariables(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleOptimize = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Please select at least one product");
      return;
    }

    if (!budget || parseFloat(budget) <= 0) {
      toast.error("Please enter a valid budget");
      return;
    }

    // Validate all variables have required data
    const variableArray: OptimizationVariable[] = [];
    const errors: string[] = [];
    
    for (const productId of selectedProducts) {
      const variable = variables[productId];
      if (!variable) {
        errors.push(`Missing data for product ${productId}`);
        continue;
      }

      // Ensure we have at least one profit metric or can calculate it
      if (!variable.profit && !variable.unit_selling_price && !variable.profit_per_dollar) {
        errors.push(`Please provide profit data for ${variable.name}`);
        continue;
      }

      // Validate multiplier (cost)
      if (!variable.multiplier || variable.multiplier <= 0) {
        errors.push(`Please provide a valid cost multiplier for ${variable.name}`);
        continue;
      }

      variableArray.push(variable);
    }

    if (errors.length > 0) {
      toast.error(errors[0]); // Show first error
      return;
    }

    const requestBody = {
      variables: variableArray,
      budget: parseFloat(budget)
    };

  // Debug: log all upperBounds being sent
  console.log('DEBUG: variables sent to API:', variableArray.map(v => ({ name: v.name, upperBound: v.upperBound })));
  console.log("Sending optimization request:", JSON.stringify(requestBody, null, 2));

    setOptimizing(true);
    setResult(null);

    try {
  // Use /api/optimize for local dev (Vite proxy), /api/optimize-proxy for production (Vercel)
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const apiUrl = isLocal ? "/api/optimize" : "/api/optimize-proxy";

  console.log("Sending optimization request:", requestBody);
  console.log("Using API endpoint:", apiUrl);

  const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log("API Response:", responseText);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${responseText}`);
      }

      const result: OptimizationResult = JSON.parse(responseText);
      setResult(result);
      toast.success("Optimization completed successfully!");
    } catch (error) {
      console.error("Optimization error:", error);
      toast.error(`Optimization failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setOptimizing(false);
    }
  };

  const clearAll = () => {
    setSelectedProducts(new Set());
    setVariables({});
    setBudget("");
    setResult(null);
  };

  const loadExample = () => {
    if (products.length === 0) {
      toast.error("No products available. Create some products first.");
      return;
    }

    // Clear existing selections
    setSelectedProducts(new Set());
    setVariables({});
    setResult(null);

    // Select first few products as example
    const exampleProducts = products.slice(0, Math.min(3, products.length));
    const newSelected = new Set<string>();
    const newVariables: Record<string, OptimizationVariable> = {};

    exampleProducts.forEach((product, index) => {
      newSelected.add(product.id);
      newVariables[product.id] = {
        name: product.name,
        lowerBound: 0,
        upperBound: Math.min(product.stock_quantity, 20),
        integer: true,
        multiplier: Math.round(product.price * 0.6 * 100) / 100, // 60% cost ratio
        unit_selling_price: product.price,
      };
    });

    setSelectedProducts(newSelected);
    setVariables(newVariables);
    setBudget("1000");
    
    toast.success("Example data loaded! Click 'Optimize' to see results.");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <SupplierNav onSignOut={signOut} />
      
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8" />
              Product Optimization
            </h1>
            <p className="text-muted-foreground mt-2">
              Find the optimal product mix to maximize profit within your budget. 
              Set production costs, selling prices, and quantity limits, then let the optimizer determine 
              how many units of each product to produce for maximum profitability.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={loadExample}>
              Load Example
            </Button>
            <Button variant="outline" onClick={clearAll}>
              Clear All
            </Button>
            <Button 
              onClick={handleOptimize} 
              disabled={optimizing || selectedProducts.size === 0}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              {optimizing ? "Optimizing..." : "Optimize"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Select Products
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No products available. Create some products first.
                    </p>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p><strong>How to use optimization:</strong></p>
                      <ol className="text-left space-y-1 max-w-xs mx-auto">
                        <li>1. Create products in the Products tab</li>
                        <li>2. Select products to optimize</li>
                        <li>3. Set cost multipliers and constraints</li>
                        <li>4. Enter your budget</li>
                        <li>5. Click Optimize to get results</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={(checked) => 
                          handleProductToggle(product.id, checked === true)
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${product.price} • Stock: {product.stock_quantity}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {product.sub_category}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Variable Configuration */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Configure Variables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="budget">Total Budget ($)</Label>
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g., 1000"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Total amount available for production/procurement costs
                    </p>
                  </div>

                  {Array.from(selectedProducts).map((productId) => {
                    const product = products.find(p => p.id === productId);
                    const variable = variables[productId];
                    if (!product || !variable) return null;

                    return (
                      <div key={productId} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{product.name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleProductToggle(productId, false)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Min Quantity</Label>
                            <Input
                              type="number"
                              value={variable.lowerBound}
                              onChange={(e) => updateVariable(productId, 'lowerBound', parseInt(e.target.value) || 0)}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Max Quantity</Label>
                            <Input
                              type="number"
                              value={variable.upperBound === null || variable.upperBound === undefined ? '' : variable.upperBound}
                              onChange={(e) => {
                                const val = e.target.value;
                                const parsed = val === '' ? null : parseInt(val);
                                updateVariable(productId, 'upperBound', parsed);
                                console.log('DEBUG: Set upperBound for', product.name, 'to', parsed);
                              }}
                              placeholder="No limit"
                              className="text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Cost to Produce/Acquire</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={variable.multiplier}
                              onChange={(e) => updateVariable(productId, 'multiplier', parseFloat(e.target.value) || 1)}
                              className="text-sm"
                              placeholder="Cost per unit"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Selling Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={variable.unit_selling_price || ''}
                              onChange={(e) => updateVariable(productId, 'unit_selling_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                              className="text-sm"
                              placeholder={`Default: $${product.price}`}
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Profit per Unit (optional override)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variable.profit || ''}
                            onChange={(e) => updateVariable(productId, 'profit', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="Auto-calculated from selling price - cost"
                            className="text-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Calculated profit per unit: ${variable.unit_selling_price && variable.multiplier ? 
                              ((variable.unit_selling_price || product.price) - variable.multiplier).toFixed(2) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {selectedProducts.size > 0 && (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <h4 className="font-medium mb-2">Quick Summary</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Selected Products:</span>
                          <span>{selectedProducts.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Budget:</span>
                          <span>${budget || "0"}</span>
                        </div>
                        {budget && parseFloat(budget) > 0 && (
                          <div className="text-xs text-muted-foreground pt-2">
                            The optimizer will find the best quantity mix within your budget
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedProducts.size === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Select products to configure optimization variables
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Optimization Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                        ${result.max_profit.toFixed(2)}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-300">
                        Maximum Profit
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Optimal Product Mix:</h4>
                      {Object.entries(result.result).map(([productName, optimizedValue]) => {
                        // Find the corresponding variable to get cost and price info
                        const variable = Object.values(variables).find(v => v.name === productName);
                        if (!variable) return null;
                        
                        // Calculate real-world values
                        const actualUnits = Math.round(optimizedValue / variable.multiplier);
                        const totalCost = optimizedValue; // This is the total amount spent (cost * units)
                        const costPerUnit = variable.multiplier;
                        const sellingPrice = variable.unit_selling_price || 0;
                        const profitPerUnit = variable.profit || (sellingPrice - costPerUnit);
                        const totalProfit = actualUnits * profitPerUnit;
                        
                        return (
                          <div key={productName} className="p-4 bg-muted rounded-lg border">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-lg">{productName}</span>
                              <Badge variant="secondary" className="font-bold text-lg">
                                {actualUnits} units
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Total Investment:</div>
                                <div className="font-semibold text-blue-600">${totalCost.toFixed(2)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Cost per Unit:</div>
                                <div className="font-semibold">${costPerUnit.toFixed(2)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Sell Price per Unit:</div>
                                <div className="font-semibold">${sellingPrice.toFixed(2)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Total Profit:</div>
                                <div className="font-semibold text-green-600">${totalProfit.toFixed(2)}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Total Budget:</span>
                          <span>${budget}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Products Selected:</span>
                          <span>{Object.keys(result.result).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Units:</span>
                          <span>
                            {Object.entries(result.result).reduce((total, [productName, optimizedValue]) => {
                              const variable = Object.values(variables).find(v => v.name === productName);
                              return total + (variable ? Math.round(optimizedValue / variable.multiplier) : 0);
                            }, 0)} units
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Investment:</span>
                          <span>${Object.values(result.result).reduce((sum, val) => sum + val, 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configure your products and budget,</p>
                    <p>then click "Optimize" to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierOptimize;
