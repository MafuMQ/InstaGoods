

// Services 
import service1 from "@/assets/Electrical.webp";
import service2 from "@/assets/Road.webp";
import service3 from "@/assets/Plumbing.webp";
import service4 from "@/assets/Carpenter.webp";
import service5 from "@/assets/Painter.webp";
import service6 from "@/assets/Mechanic.webp";
import service7 from "@/assets/Locksmith.webp";
import service8 from "@/assets/Cleaning.webp";


// Groceries
import grocery1 from "@/assets/Milk.webp";
import grocery2 from "@/assets/Mince.webp";
import grocery3 from "@/assets/Toothpaste.webp";
import grocery4 from "@/assets/Apples.webp";
import grocery5 from "@/assets/Nivea.webp";
import grocery6 from "@/assets/Diapers.webp";
import grocery7 from "@/assets/Fish.webp";
import grocery8 from "@/assets/Sinutab.webp";

// Freelance
import freelance1 from "@/assets/Design.webp";
import freelance2 from "@/assets/Writing.webp";
import freelance3 from "@/assets/Software.webp";
import freelance4 from "@/assets/Webdev.webp";
import freelance5 from "@/assets/Business.webp";
import freelance6 from "@/assets/Financial.webp";
import freelance7 from "@/assets/Virtual.webp";
import freelance8 from "@/assets/Data.webp";

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
  
];

export const products: Product[] = [
  
];

export const services: Service[] = [
  {
    id: "service-1",
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
    id: "service-2",
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
    id: "service-3",
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
    id: "service-4",
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
    id: "service-5",
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
    id: "service-6",
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
    id: "service-7",
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
    id: "service-8",
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
    id: "grocery-1",
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
    id: "grocery-2",
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
    id: "grocery-3",
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
    id: "grocery-4",
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
    id: "grocery-5",
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
    id: "grocery-6",
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
    id: "grocery-7",
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
    id: "grocery-8",
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
    id: "freelance-1",
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
    id: "freelance-2",
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
    id: "freelance-3",
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
    id: "freelance-4",
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
    id: "freelance-5",
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
    id: "freelance-6",
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
    id: "freelance-7",
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
    id: "freelance-8",
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
  "Shop by Business",
];

export const subCategories: Record<string, string[]> = {
  "Groceries": ["All", "Dairy Products", "Meat", "Fruits & Vegies", "Frozen Food" , "Self Care", "Baby Care"],
  "Physical Goods": ["All", "Home & Living", "Kitchen & Dining", "Jewelry", "Stationery", "Baby"],
  "Services": ["All", "Electrical", "Plumbing", "Road Side","Home Repairs", "Moving", "Cleaning"],
  "Freelancing": ["All", "Creative", "Technical", "Consulting", "Administrative"],
  "Shop by Business": ["All", "Pick n' Pay", "Spar", "DisChem", "Clicks", "Woolworths"],
};


