
export interface Supplier {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  totalSales: number;
  providerType?: 'internal' | 'external';
  providerVerificationLevel?: 'basic' | 'verified' | 'premium';
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
  // Provider type for segregation
  providerType?: 'internal' | 'external';
  providerVerificationLevel?: 'basic' | 'verified' | 'premium';
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

];

export const groceries: Grocery[] = [

];

export const freelance: Freelance[] = [

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
  "Groceries": ["All", "Dairy Products", "Meat", "Fruits & Veggies", "Bakery & Bread", "Frozen Food", "Beverages", "Snacks & Treats", "Pantry Essentials"],
  "Physical Goods": ["All", "Home & Living", "Kitchen & Dining", "Jewelry", "Stationery", "Health & Beauty", "Baby Products"],
  "Services": ["All", "Electrical", "Plumbing", "Road Side", "Home Repairs", "Moving", "Cleaning"],
  "Freelancing": ["All", "Creative", "Technical", "Consulting", "Administrative"],
  "Shop by Business": ["All", "Pick n' Pay", "Spar", "DisChem", "Clicks", "Woolworths"],
};


