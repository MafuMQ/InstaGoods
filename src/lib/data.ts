import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

export interface Supplier {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  totalSales: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  mainCategory: string;
  subCategory: string;
  supplierId: string;
  rating: number;
  reviews: number;
}

export const suppliers: Supplier[] = [
  {
    id: "1",
    name: "Earthen Crafts Studio",
    description: "Handcrafted ceramics and pottery made with love and traditional techniques.",
    location: "Portland, Oregon",
    rating: 4.9,
    totalSales: 1243,
  },
  {
    id: "2",
    name: "Fiber & Thread Co.",
    description: "Artisan textiles and macrame wall hangings for mindful living spaces.",
    location: "Austin, Texas",
    rating: 4.8,
    totalSales: 892,
  },
  {
    id: "3",
    name: "Leather & Lore",
    description: "Premium leather goods handcrafted with traditional bookbinding methods.",
    location: "Seattle, Washington",
    rating: 5.0,
    totalSales: 567,
  },
  {
    id: "4",
    name: "Woodwork Collective",
    description: "Sustainable wooden home goods crafted from locally sourced timber.",
    location: "Denver, Colorado",
    rating: 4.7,
    totalSales: 1089,
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Artisan Ceramic Mug",
    description: "Hand-thrown ceramic mug with unique glaze pattern. Each piece is one-of-a-kind.",
    price: 38,
    image: product1,
    mainCategory: "Physical Goods",
    subCategory: "Home & Living",
    supplierId: "1",
    rating: 4.9,
    reviews: 127,
  },
  {
    id: "2",
    name: "Macrame Wall Hanging",
    description: "Handwoven macrame wall art made from 100% natural cotton cord.",
    price: 65,
    image: product2,
    mainCategory: "Physical Goods",
    subCategory: "Home & Living",
    supplierId: "2",
    rating: 4.8,
    reviews: 93,
  },
  {
    id: "3",
    name: "Embossed Leather Journal",
    description: "Premium leather-bound journal with hand-embossed decorative pattern.",
    price: 52,
    image: product3,
    mainCategory: "Physical Goods",
    subCategory: "Stationery",
    supplierId: "3",
    rating: 5.0,
    reviews: 156,
  },
  {
    id: "4",
    name: "Wooden Serving Board",
    description: "Handcrafted cutting and serving board made from sustainable hardwood.",
    price: 45,
    image: product4,
    mainCategory: "Physical Goods",
    subCategory: "Kitchen & Dining",
    supplierId: "4",
    rating: 4.7,
    reviews: 84,
  },
  {
    id: "5",
    name: "Hand-Painted Vase",
    description: "Ceramic vase with delicate hand-painted botanical design.",
    price: 42,
    image: product5,
    mainCategory: "Physical Goods",
    subCategory: "Home & Living",
    supplierId: "1",
    rating: 4.9,
    reviews: 102,
  },
  {
    id: "6",
    name: "Brass Geometric Necklace",
    description: "Handmade brass pendant with intricate geometric pattern.",
    price: 34,
    image: product6,
    mainCategory: "Physical Goods",
    subCategory: "Jewelry",
    supplierId: "2",
    rating: 4.8,
    reviews: 78,
  },
];

export const mainCategories = [
  "All",
  "Physical Goods",
  "Services",
  "Deliverables",
  "On Demand Crafts",
];

export const subCategories: Record<string, string[]> = {
  "Physical Goods": ["All", "Home & Living", "Kitchen & Dining", "Jewelry", "Stationery"],
  "Services": ["All"],
  "Deliverables": ["All"],
  "On Demand Crafts": ["All"],
};
