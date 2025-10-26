import { useSearchParams } from "react-router-dom";
import Header from "@/components/customer/Header";
import GroceryCard from "@/components/customer/GroceryCard";
import ProductCard from "@/components/customer/ProductCard";
import ServiceCard from "@/components/customer/ServiceCard";
import FreelanceCard from "@/components/customer/FreelanceCard";
import { products, services, groceries, freelance } from "@/lib/data";
import { Product, Service, Grocery, Freelance } from "@/lib/data";

type SearchItem = Product | Service | Grocery | Freelance;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  // Combine all items
  const allItems: SearchItem[] = [...products, ...services, ...groceries, ...freelance];

  // Filter items based on query
  const filteredItems = allItems.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-2">Search Results</h1>
        <p className="text-muted-foreground mb-8">
          {query ? `Results for "${query}"` : "No search query provided"}
        </p>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              if ("mainCategory" in item && item.mainCategory === "Groceries") {
                return <GroceryCard key={item.id} grocery={item as Grocery} />;
              } else if ("mainCategory" in item && item.mainCategory === "Physical Goods") {
                return <ProductCard key={item.id} product={item as Product} />;
              } else if ("mainCategory" in item && item.mainCategory === "Services") {
                return <ServiceCard key={item.id} service={item as Service} />;
              } else if ("mainCategory" in item && item.mainCategory === "Freelancing") {
                return <FreelanceCard key={item.id} freelance={item as Freelance} />;
              }
              return null;
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">No results found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;