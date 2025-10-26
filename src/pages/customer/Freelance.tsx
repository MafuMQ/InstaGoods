import { useState } from "react";
import Header from "@/components/customer/Header";
import FreelanceCard from "@/components/customer/FreelanceCard";
import CategoryNav from "@/components/customer/CategoryNav";
import { freelance } from "@/lib/data";

const Freelance = () => {
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");

  const filteredFreelance = freelance.filter((p) => {
    if (selectedMainCategory === "All") return true;
    if (p.mainCategory !== selectedMainCategory) return false;
    if (selectedSubCategory === "All") return true;
    return p.subCategory === selectedSubCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-2">See All Available Services</h1>
        <p className="text-muted-foreground mb-8">
          Explore our curated collection of handcrafted items
        </p>

        <div className="mb-8">
          <CategoryNav
            selectedMainCategory={selectedMainCategory}
            selectedSubCategory={selectedSubCategory}
            onMainCategoryChange={(category) => {
              setSelectedMainCategory(category);
              setSelectedSubCategory("All");
            }}
            onSubCategoryChange={setSelectedSubCategory}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFreelance.map((freelance) => (
            <FreelanceCard key={freelance.id} freelance={freelance} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Freelance;
