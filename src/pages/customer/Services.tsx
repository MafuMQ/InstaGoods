import { useState } from "react";
import Header from "@/components/customer/Header";
import ServiceCard from "@/components/customer/ServiceCard";
import CategoryNav from "@/components/customer/CategoryNav";
import { services } from "@/lib/data";

const Services = () => {
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");

  const filteredServices = services.filter((p) => {
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

  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
