import { Link } from "react-router-dom";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { mainCategories, subCategories } from "@/lib/data";
import {
  ShoppingBag,
  Utensils,
  Wrench,
  Briefcase,
  Store,
} from "lucide-react";

const categoryMeta: Record<string, { icon: React.ElementType; description: string; color: string }> = {
  Groceries: {
    icon: Utensils,
    description: "Fresh produce, dairy, meat, pantry staples and more from local suppliers.",
    color: "bg-green-50 border-green-200 hover:border-green-400",
  },
  "Physical Goods": {
    icon: ShoppingBag,
    description: "Home décor, kitchenware, jewellery, stationery and lifestyle products.",
    color: "bg-blue-50 border-blue-200 hover:border-blue-400",
  },
  Services: {
    icon: Wrench,
    description: "Electricians, plumbers, cleaners, movers and other skilled tradespeople.",
    color: "bg-orange-50 border-orange-200 hover:border-orange-400",
  },
  Freelancing: {
    icon: Briefcase,
    description: "Creative, technical, consulting and administrative freelance professionals.",
    color: "bg-purple-50 border-purple-200 hover:border-purple-400",
  },
  "Shop by Business": {
    icon: Store,
    description: "Browse products directly from your favourite local businesses.",
    color: "bg-pink-50 border-pink-200 hover:border-pink-400",
  },
};

const Categories = () => {
  const browseable = mainCategories.filter((c) => c !== "All");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container py-8 sm:py-12 flex-1">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Categories</h1>
        <p className="text-muted-foreground mb-10">
          Explore everything InstaGoods has to offer, organised by category.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {browseable.map((cat) => {
            const meta = categoryMeta[cat];
            const Icon = meta?.icon ?? ShoppingBag;
            const subs = subCategories[cat]?.filter((s) => s !== "All") ?? [];

            return (
              <Link
                key={cat}
                to="/"
                state={{ selectedMainCategory: cat }}
                className={`block rounded-xl border-2 p-6 transition-colors duration-200 ${meta?.color ?? "bg-muted border-border hover:border-primary"}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="h-6 w-6 text-foreground/70" />
                  <h2 className="text-xl font-semibold">{cat}</h2>
                </div>
                {meta?.description && (
                  <p className="text-sm text-muted-foreground mb-4">{meta.description}</p>
                )}
                {subs.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {subs.map((sub) => (
                      <Link
                        key={sub}
                        to="/"
                        state={{ selectedMainCategory: cat, selectedSubCategory: sub }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs px-3 py-1 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors"
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Categories;
