// Products
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/Wall.jpg";
import product8 from "@/assets/Bag.jpg";

// Services 
import service1 from "@/assets/Electrical.jpg";
import service2 from "@/assets/Road.jpg";
import service3 from "@/assets/Plumbing.jpg";
import service4 from "@/assets/Carpenter.jpg";
import service5 from "@/assets/Painter.jpg";
import service6 from "@/assets/Mechanic.jpg";
import service7 from "@/assets/Locksmith.jpg";
import service8 from "@/assets/Cleaning.jpg";


// Groceries
import grocery1 from "@/assets/Milk.jpg";
import grocery2 from "@/assets/Mince.jpg";
import grocery3 from "@/assets/Toothpaste.jpg";
import grocery4 from "@/assets/Apples.jpg";
import grocery5 from "@/assets/Nivea.jpg";
import grocery6 from "@/assets/Diapers.jpg";
import grocery7 from "@/assets/Fish.jpg";
import grocery8 from "@/assets/Sinutab.jpg";

// Freelance
import freelance1 from "@/assets/Design.jpg";
import freelance2 from "@/assets/Writing.jpg";
import freelance3 from "@/assets/Software.jpg";
import freelance4 from "@/assets/Webdev.jpg";
import freelance5 from "@/assets/Business.jpg";
import freelance6 from "@/assets/Financial.jpg";
import freelance7 from "@/assets/Virtual.jpg";
import freelance8 from "@/assets/Data.jpg";


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
  region?: string; // e.g. "Cape Town", "Online", etc.
  location?: { lat: number; lng: number }; // coordinates for distance calculation
  deliveryRadiusKm?: number; // max delivery distance in km (if applicable)
  availableEverywhere?: boolean; // true for online/remote/anywhere
  delivery_location?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  delivery_fee?: number;
  collection_available?: boolean;
  no_delivery?: boolean;
}

export interface Service {
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
  region?: string;
  location?: { lat: number; lng: number };
  deliveryRadiusKm?: number;
  availableEverywhere?: boolean;
}

export interface Grocery {
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
  region?: string;
  location?: { lat: number; lng: number };
  deliveryRadiusKm?: number;
  availableEverywhere?: boolean;
}

export interface Freelance {
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
  region?: string;
  location?: { lat: number; lng: number };
  deliveryRadiusKm?: number;
  availableEverywhere?: boolean;
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
  {
    id: "5",
    name: "Electrical",
    description: "Electrical Technician",
    location: "Portland, Oregon",
    rating: 4.9,
    totalSales: 1243,
  },
  {
    id: "6",
    name: "Easy Fix Plumber",
    description: "All in one Plumbing Solutions",
    location: "Austin, Texas",
    rating: 4.8,
    totalSales: 892,
  },
  {
    id: "7",
    name: "Road Side Assistance",
    description: "Road side assistance 24/7",
    location: "Seattle, Washington",
    rating: 5.0,
    totalSales: 567,
  },
  {
    id: "8",
    name: "Construction",
    description: "Sustainable wooden home goods crafted from locally sourced timber.",
    location: "Denver, Colorado",
    rating: 4.7,
    totalSales: 1089,
  },
  {
    id: "9",
    name: "Pick n' Pay",
    description: "PnP",
    location: "Portland, Oregon",
    rating: 4.9,
    totalSales: 1243,
  },
  {
    id: "10",
    name: "Spar",
    description: "Spar Stores",
    location: "Austin, Texas",
    rating: 4.8,
    totalSales: 892,
  },
  {
    id: "11",
    name: "DisChem",
    description: "DisChem Pharmacy",
    location: "Seattle, Washington",
    rating: 5.0,
    totalSales: 567,
  },
  {
    id: "12",
    name: "Clicks",
    description: "Clicks Pharmacy",
    location: "Denver, Colorado",
    rating: 4.7,
    totalSales: 1089,
  },
  {
    id: "13",
    name: "Woolworths",
    description: "Woolies",
    location: "Denver, Colorado",
    rating: 4.7,
    totalSales: 1089,
  },
  {
    id: "14",
    name: "Canva",
    description: "Canva Creator",
    location: "Austin, Texas",
    rating: 4.8,
    totalSales: 892,
  },
  {
    id: "15",
    name: "Sky_",
    description: "Ghostwriter",
    location: "Seattle, Washington",
    rating: 5.0,
    totalSales: 567,
  },
  {
    id: "16",
    name: "Jesper",
    description: "Web Developer",
    location: "Seattle, Washington",
    rating: 5.0,
    totalSales: 567,
  },
  {
    id: "17",
    name: "PowerBI",
    description: "Microsoft Expert",
    location: "Denver, Colorado",
    rating: 4.7,
    totalSales: 1089,
  },
  {
    id: "18",
    name: "Data Tech",
    description: "Data Analyst",
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
    supplierId: "9",
    rating: 4.9,
    reviews: 127,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 10,
    availableEverywhere: false,
  },
  {
    id: "2",
    name: "Macrame Wall Hanging",
    description: "Handwoven macrame wall art made from 100% natural cotton cord.",
    price: 65,
    image: product2,
    mainCategory: "Physical Goods",
    subCategory: "Home & Living",
    supplierId: "10",
    rating: 4.8,
    reviews: 93,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 15,
    availableEverywhere: false,
  },
  {
    id: "3",
    name: "Embossed Leather Journal",
    description: "Premium leather-bound journal with hand-embossed decorative pattern.",
    price: 52,
    image: product3,
    mainCategory: "Physical Goods",
    subCategory: "Stationery",
    supplierId: "11",
    rating: 5.0,
    reviews: 156,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 100,
    availableEverywhere: true,
  },
  {
    id: "4",
    name: "Wooden Serving Board",
    description: "Handcrafted cutting and serving board made from sustainable hardwood.",
    price: 45,
    image: product4,
    mainCategory: "Physical Goods",
    subCategory: "Kitchen & Dining",
    supplierId: "12",
    rating: 4.7,
    reviews: 84,
    region: "Sandton",
    location: { lat: -26.1076, lng: 28.0567 },
    deliveryRadiusKm: 8,
    availableEverywhere: false,
  },
  {
    id: "5",
    name: "Hand-Painted Vase",
    description: "Ceramic vase with delicate hand-painted botanical design.",
    price: 42,
    image: product5,
    mainCategory: "Physical Goods",
    subCategory: "Home & Living",
    supplierId: "13",
    rating: 4.9,
    reviews: 102,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 20,
    availableEverywhere: false,
  },
  {
    id: "6",
    name: "Brass Geometric Necklace",
    description: "Handmade brass pendant with intricate geometric pattern.",
    price: 34,
    image: product6,
    mainCategory: "Physical Goods",
    subCategory: "Jewelry",
    supplierId: "9",
    rating: 4.8,
    reviews: 78,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 12,
    availableEverywhere: false,
  },
  {
    id: "7",
    name: "Spiro wood layered wall art",
    description: "600mm diameter wood layered wall art in a Spirograph insprired pattern",
    price: 1690,
    image: product7,
    mainCategory: "Physical Goods",
    subCategory: "Home & Living",
    supplierId: "10",
    rating: 4.9,
    reviews: 102,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 18,
    availableEverywhere: false,
  },
  {
    id: "8",
    name: "Macrame Shopper Bag",
    description: "The perfect boho-chic bag to hold all your things! ",
    price: 352,
    image: product8,
    mainCategory: "Physical Goods",
    subCategory: "Jewelry",
    supplierId: "11",
    rating: 4.8,
    reviews: 78,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 25,
    availableEverywhere: false,
  },
];

export const services: Service[] = [
  {
    id: "1",
    name: "Electrical installation",
    description: "Professional electrical installation for homes and offices.",
    price: 380,
    image: service1,
    mainCategory: "Services",
    subCategory: "Electrical",
    supplierId: "5",
    rating: 4.9,
    reviews: 127,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 25,
    availableEverywhere: false,
  },
  {
    id: "2",
    name: "Roadside Assistance",
    description: "24/7 Raodside Assintance",
    price: 450,
    image: service2,
    mainCategory: "Services",
    subCategory: "Road Side",
    supplierId: "5",
    rating: 4.8,
    reviews: 93,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 20,
    availableEverywhere: false,
  },
  {
    id: "3",
    name: "Plumbing",
    description: "Residential and commercial plumbing services.",
    price: 520,
    image: service3,
    mainCategory: "Services",
    subCategory: "Plumbing",
    supplierId: "6",
    rating: 5.0,
    reviews: 156,
    region: "Sandton",
    location: { lat: -26.1076, lng: 28.0567 },
    deliveryRadiusKm: 15,
    availableEverywhere: false,
  },
  {
    id: "4",
    name: "Carpenter",
    description: "Builds and repairs wooden structures, frameworks, and fixtures",
    price: 450,
    image: service4,
    mainCategory: "Services",
    subCategory: "Home Repairs",
    supplierId: "7",
    rating: 4.7,
    reviews: 84,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 50,
    availableEverywhere: false,
  },
  {
    id: "5",
    name: "Painter ",
    description: "Professional painting for homes and offices.",
    price: 420,
    image:service5,
    mainCategory: "Services",
    subCategory: "Home Repairs",
    supplierId: "8",
    rating: 4.9,
    reviews: 102,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 30,
    availableEverywhere: false,
  },
  {
    id: "6",
    name: "Auto Machanic",
    description: "Auto Machanic",
    price: 340,
    image: service6,
    mainCategory: "Services",
    subCategory: "Road Side",
    supplierId: "8",
    rating: 4.8,
    reviews: 78,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 30,
    availableEverywhere: false,
  },
  {
    id: "7",
    name: "Locksmith",
    description: "Locksmith - For all your House and Vehicle",
    price: 200,
    image: service7,
    mainCategory: "Services",
    subCategory: "Home Repairs",
    supplierId: "7",
    rating: 4.9,
    reviews: 102,
    region: "Sandton",
    location: { lat: -26.1076, lng: 28.0567 },
    deliveryRadiusKm: 15,
    availableEverywhere: false,
  },
  {
    id: "8",
    name: "House & Car Cleaning",
    description: "House and car cleaning services",
    price: 340,
    image: service8,
    mainCategory: "Services",
    subCategory: "Cleaning",
    supplierId: "6",
    rating: 4.8,
    reviews: 78,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 25,
    availableEverywhere: false,
  },
];

export const groceries: Grocery[] = [
  {
    id: "1",
    name: "Full Cream Milk 6x 1L",
    description: "Hand-thrown ceramic mug with unique glaze pattern. Each piece is one-of-a-kind.",
    price: 100,
    image: grocery1,
    mainCategory: "Groceries",
    subCategory: "Dairy Products",
    supplierId: "9",
    rating: 4.9,
    reviews: 127,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 10,
    availableEverywhere: false,
  },
  {
    id: "2",
    name: "100g Minced Meat",
    description: "Handwoven macrame wall art made from 100% natural cotton cord.",
    price: 65,
    image: grocery2,
    mainCategory: "Groceries",
    subCategory: "Meat",
    supplierId: "10",
    rating: 4.8,
    reviews: 93,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 15,
    availableEverywhere: false,
  },
  {
    id: "3",
    name: "Aquafresh Toothpaste",
    description: "Premium leather-bound journal with hand-embossed decorative pattern.",
    price: 32,
    image: grocery3,
    mainCategory: "Groceries",
    subCategory: "Self Care",
    supplierId: "11",
    rating: 5.0,
    reviews: 156,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 100,
    availableEverywhere: true,
  },
  {
    id: "4",
    name: "Granny Smith Apples",
    description: "Granny Smith Apples",
    price: 25,
    image: grocery4,
    mainCategory: "Groceries",
    subCategory: "Fruits & Vegies",
    supplierId: "13",
    rating: 4.7,
    reviews: 84,
    region: "Sandton",
    location: { lat: -26.1076, lng: 28.0567 },
    deliveryRadiusKm: 8,
    availableEverywhere: false,
  },
  {
    id: "5",
    name: "Nivea Men Deep Anti-Perspirant Roll On",
    description: "Nivea Men Deep Anti-Perspirant Roll On",
    price: 32,
    image: grocery5,
    mainCategory: "Groceries",
    subCategory: "Self Care",
    supplierId: "12",
    rating: 4.9,
    reviews: 102,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 20,
    availableEverywhere: false,
  },
  {
    id: "6",
    name: "Pampers Diapers ",
    description: "Handmade brass pendant with intricate geometric pattern.",
    price: 200,
    image: grocery6,
    mainCategory: "Groceries",
    subCategory: "Baby Care",
    supplierId: "11",
    rating: 4.8,
    reviews: 78,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 25,
    availableEverywhere: false,
  },
  {
    id: "7",
    name: "Hake Medallions",
    description: "Freshly Frozen Hake Medallions 450 g",
    price: 42,
    image: grocery7,
    mainCategory: "Groceries",
    subCategory: "Frozen Food",
    supplierId: "13",
    rating: 4.9,
    reviews: 102,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 18,
    availableEverywhere: false,
  },
  {
    id: "8",
    name: "Sinutab",
    description: "Nasal Spray 10ml",
    price: 34,
    image: grocery8,
    mainCategory: "Groceries",
    subCategory: "Self Care",
    supplierId: "11",
    rating: 4.8,
    reviews: 78,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 25,
    availableEverywhere: false,
  },
];

export const freelance: Freelance[] = [
  {
    id: "1",
    name: "Graphic Design",
    description: "Visual content for branding, advertisements, and websites",
    price: 100,
    image: freelance1,
    mainCategory: "Freelancing",
    subCategory: "Creative",
    supplierId: "14",
    rating: 4.9,
    reviews: 127,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 100,
    availableEverywhere: true,
  },
  {
    id: "2",
    name: "Writing and Editing",
    description: "Copywriting, blogging, technical writing, and ghostwriting",
    price: 65,
    image: freelance2,
    mainCategory: "Freelancing",
    subCategory: "Creative",
    supplierId: "15",
    rating: 4.8,
    reviews: 93,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 50,
    availableEverywhere: false,
  },
  {
    id: "3",
    name: "Software Development",
    description: "Creating applications or software solutions tailored to client needs.",
    price: 32,
    image: freelance3,
    mainCategory: "Freelancing",
    subCategory: "Creative",
    supplierId: "16",
    rating: 5.0,
    reviews: 156,
    region: "Sandton",
    location: { lat: -26.1076, lng: 28.0567 },
    deliveryRadiusKm: 30,
    availableEverywhere: false,
  },
  {
    id: "4",
    name: "Web Development",
    description: "Building and maintaining websites, including front-end and back-end development.",
    price: 25,
    image: freelance4,
    mainCategory: "Freelancing",
    subCategory: "Technical",
    supplierId: "16",
    rating: 4.7,
    reviews: 84,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 20,
    availableEverywhere: false,
  },
  {
    id: "5",
    name: "Business Consulting",
    description: "Advising companies on improving operations, marketing strategies, or financial management.",
    price: 32,
    image: freelance5,
    mainCategory: "Freelancing",
    subCategory: "Consulting",
    supplierId: "17",
    rating: 4.9,
    reviews: 102,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 40,
    availableEverywhere: false,
  },
  {
    id: "6",
    name: "Financial Consulting",
    description: "Offering expertise in budgeting, investments, and financial planning.",
    price: 200,
    image: freelance6,
    mainCategory: "Freelancing",
    subCategory: "Consulting",
    supplierId: "17",
    rating: 4.8,
    reviews: 78,
    region: "Sandton",
    location: { lat: -26.1076, lng: 28.0567 },
    deliveryRadiusKm: 25,
    availableEverywhere: false,
  },
  {
    id: "7",
    name: "Virtual Assistance",
    description: "Providing administrative support remotely, such as managing emails and scheduling.",
    price: 200,
    image: freelance7,
    mainCategory: "Freelancing",
    subCategory: "Administrative",
    supplierId: "18",
    rating: 4.8,
    reviews: 78,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 100,
    availableEverywhere: true,
  },
  {
    id: "8",
    name: "Data Entry",
    description: "Handling data input tasks for various businesses, requiring minimal skills.",
    price: 200,
    image: freelance8,
    mainCategory: "Freelancing",
    subCategory: "Administrative",
    supplierId: "18",
    rating: 4.8,
    reviews: 78,
    region: "Johannesburg",
    location: { lat: -26.2041, lng: 28.0473 },
    deliveryRadiusKm: 100,
    availableEverywhere: true,
  },
];

export const mainCategories = [
  "All",
  "Groceries",
  "Physical Goods",
  "Services",
  "Freelancing",
  "Shop by Store",
];

export const subCategories: Record<string, string[]> = {
  "Groceries": ["All", "Dairy Products", "Meat", "Fruits & Vegies", "Frozen Food" , "Self Care", "Baby Care"],
  "Physical Goods": ["All", "Home & Living", "Kitchen & Dining", "Jewelry", "Stationery", "Baby"],
  "Services": ["All", "Electrical", "Plumbing", "Road Side","Home Repairs", "Moving", "Cleaning"],
  "Freelancing": ["All", "Creative", "Technical", "Consulting", "Administrative"],
  "Shop by Store": ["All", "Pick n' Pay", "Spar", "DisChem", "Clicks", "Woolworths"],
};


