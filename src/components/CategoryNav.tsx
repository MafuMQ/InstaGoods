import { mainCategories, subCategories } from "@/lib/data";
import { Button } from "@/components/ui/button";

interface CategoryNavProps {
  selectedMainCategory: string;
  selectedSubCategory: string;
  onMainCategoryChange: (category: string) => void;
  onSubCategoryChange: (category: string) => void;
}

const CategoryNav = ({ 
  selectedMainCategory, 
  selectedSubCategory,
  onMainCategoryChange,
  onSubCategoryChange 
}: CategoryNavProps) => {
  const showSubCategories = selectedMainCategory !== "All" && 
    subCategories[selectedMainCategory]?.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2 text-muted-foreground">Main Categories</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {mainCategories.map((category) => (
            <Button
              key={category}
              variant={selectedMainCategory === category ? "default" : "outline"}
              onClick={() => onMainCategoryChange(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {showSubCategories && (
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Subcategories</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {subCategories[selectedMainCategory].map((subCat) => (
              <Button
                key={subCat}
                variant={selectedSubCategory === subCat ? "default" : "outline"}
                onClick={() => onSubCategoryChange(subCat)}
                className="whitespace-nowrap"
                size="sm"
              >
                {subCat}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryNav;
