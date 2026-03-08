import { useSearchParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import Header from "@/components/customer/Header";
import GroceryCard from "@/components/customer/GroceryCard";
import ProductCard from "@/components/customer/ProductCard";
import ServiceCard from "@/components/customer/ServiceCard";
import FreelanceCard from "@/components/customer/FreelanceCard";
import { products, services, groceries, freelance } from "@/lib/data";
import { Product, Service, Grocery, Freelance } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  SortAsc, 
  Package, 
  Wrench, 
  ShoppingCart, 
  Briefcase,
  X,
  Sparkles,
  ArrowRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SearchItem = Product | Service | Grocery | Freelance;

type CategoryFilter = "all" | "products" | "services" | "groceries" | "freelance";
type SortOption = "relevance" | "price-low" | "price-high" | "name";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [searchInput, setSearchInput] = useState(query);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showFilters, setShowFilters] = useState(false);

  // Combine all items
  const allItems: SearchItem[] = useMemo(() => {
    return [...products, ...services, ...groceries, ...freelance];
  }, []);

  // Get category for an item
  const getItemCategory = (item: SearchItem): CategoryFilter => {
    if ("mainCategory" in item) {
      if (item.mainCategory === "Groceries") return "groceries";
      if (item.mainCategory === "Physical Goods") return "products";
      if (item.mainCategory === "Services") return "services";
      if (item.mainCategory === "Freelancing") return "freelance";
    }
    return "products";
  };

  // Filter items based on query and category
  const filteredItems = useMemo(() => {
    let results = allItems.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );

    // Apply category filter
    if (categoryFilter !== "all") {
      results = results.filter(item => getItemCategory(item) === categoryFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        results.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        results.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Relevance - keep original order
        break;
    }

    return results;
  }, [allItems, query, categoryFilter, sortBy]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ query: searchInput.trim() });
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchInput("");
    setSearchParams({});
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const results = allItems.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );

    return {
      all: results.length,
      products: results.filter(i => getItemCategory(i) === "products").length,
      services: results.filter(i => getItemCategory(i) === "services").length,
      groceries: results.filter(i => getItemCategory(i) === "groceries").length,
      freelancing: results.filter(i => getItemCategory(i) === "freelance").length,
    };
  }, [allItems, query]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-6 sm:py-8">
        {/* Search Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-muted-foreground">
            {query ? (
              <>Results for "<span className="font-semibold text-foreground">{query}</span>"</>
            ) : (
              "Enter a search term to find products, services, groceries, and more"
            )}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for items..."
                className="pl-10 pr-10 h-12"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button type="submit" size="lg" className="hidden sm:flex">
              Search
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              className="sm:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Filters and Sort - Desktop */}
        <div className="hidden sm:flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All", icon: Search, count: categoryCounts.all },
              { value: "products", label: "Products", icon: Package, count: categoryCounts.products },
              { value: "services", label: "Services", icon: Wrench, count: categoryCounts.services },
              { value: "groceries", label: "Groceries", icon: ShoppingCart, count: categoryCounts.groceries },
              { value: "freelance", label: "Freelance", icon: Briefcase, count: categoryCounts.freelancing },
            ].map((cat) => (
              <Button
                key={cat.value}
                variant={categoryFilter === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat.value as CategoryFilter)}
                className="gap-2"
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
                <span className="ml-1 text-xs opacity-70">({cat.count})</span>
              </Button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Filters Panel */}
        {showFilters && (
          <div className="sm:hidden mb-6 p-4 bg-muted/50 rounded-lg animate-in slide-in-from-top-2">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All", count: categoryCounts.all },
                    { value: "products", label: "Products", count: categoryCounts.products },
                    { value: "services", label: "Services", count: categoryCounts.services },
                    { value: "groceries", label: "Groceries", count: categoryCounts.groceries },
                    { value: "freelance", label: "Freelance", count: categoryCounts.freelancing },
                  ].map((cat) => (
                    <Button
                      key={cat.value}
                      variant={categoryFilter === cat.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoryFilter(cat.value as CategoryFilter)}
                      className="text-xs"
                    >
                      {cat.label} ({cat.count})
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Sort by</label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {query ? (
          filteredItems.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Found {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
                {categoryFilter !== "all" && ` in ${categoryFilter}`}
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredItems.map((item, index) => {
                  if (getItemCategory(item) === "groceries") {
                    return <GroceryCard key={item.id} grocery={item as Grocery} />;
                  } else if (getItemCategory(item) === "products") {
                    return <ProductCard key={item.id} product={item as Product} />;
                  } else if (getItemCategory(item) === "services") {
                    return <ServiceCard key={item.id} service={item as Service} />;
                  } else if (getItemCategory(item) === "freelance") {
                    return <FreelanceCard key={item.id} freelance={item as Freelance} />;
                  }
                  return null;
                })}
              </div>
            </>
          ) : (
            /* No Results */
            <div className="text-center py-12 sm:py-16 animate-in fade-in zoom-in-95">
              <div className="mx-auto w-24 h-24 sm:w-32 sm:h-32 mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <Search className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">No results found</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                We couldn't find anything matching "{query}". Try adjusting your search or filters.
              </p>
              
              {/* Suggestions */}
              <div className="mb-8">
                <p className="text-sm font-medium mb-3">Suggestions:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Check your spelling</li>
                  <li>• Try more general keywords</li>
                  <li>• Try different filters</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/">
                  <Button variant="outline" className="gap-2">
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Back to Home
                  </Button>
                </Link>
                <Button variant="ghost" onClick={clearSearch}>
                  Clear Search
                </Button>
              </div>
            </div>
          )
        ) : (
          /* No Search Query */
          <div className="text-center py-12 sm:py-16 animate-in fade-in zoom-in-95">
            <div className="mx-auto w-24 h-24 sm:w-32 sm:h-32 mb-6 rounded-full bg-muted/50 flex items-center justify-center">
              <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">What are you looking for?</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Search for products, services, groceries, or freelance experts near you.
            </p>

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              <Link to="/?category=products">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Package className="h-6 w-6" />
                  <span className="text-xs">Products</span>
                </Button>
              </Link>
              <Link to="/?category=services">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Wrench className="h-6 w-6" />
                  <span className="text-xs">Services</span>
                </Button>
              </Link>
              <Link to="/?category=groceries">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-xs">Groceries</span>
                </Button>
              </Link>
              <Link to="/?category=freelance">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Briefcase className="h-6 w-6" />
                  <span className="text-xs">Freelance</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
