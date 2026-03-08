// Enhanced Order Types for Post-Payment Integration System

export interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: OrderStatus;
  order_date: string | null;
  completed_date: string | null;
  supplier_id: string;
  // Enhanced fields
  product_image?: string;
  product_description?: string;
  estimated_delivery_date?: string | null;
  digital_access_code?: string | null;
  tracking_number?: string | null;
  delivery_address?: string | null;
  notes?: string | null;
}

export type OrderStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'cancelled' 
  | 'shipped' 
  | 'delivered';

export interface OrderGroup {
  // Grouping information for orders from the same transaction
  orderGroupId: string;
  orderIds: string[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderDate: string;
  completedDate?: string;
  items: OrderItem[];
}

export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  wishlistItems: number;
  cartValue: number;
  loyaltyPoints: number;
  availableCredits: number;
  tier: CustomerTier;
  tierProgress: number;
  nextTierThreshold: number;
  totalEarnedPoints: number;
  pendingDeliveries: number;
}

export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface TierConfig {
  tier: CustomerTier;
  name: string;
  minSpend: number;
  pointsPerRand: number; // Points earned per R1 spent
  benefits: string[];
  color: string;
}

// Tier configuration
export const TIER_CONFIG: Record<CustomerTier, TierConfig> = {
  bronze: {
    tier: 'bronze',
    name: 'Bronze',
    minSpend: 0,
    pointsPerRand: 1,
    benefits: ['Earn 1 point per R1 spent', 'Access to exclusive deals'],
    color: '#CD7F32'
  },
  silver: {
    tier: 'silver',
    name: 'Silver',
    minSpend: 5000,
    pointsPerRand: 1.5,
    benefits: ['Earn 1.5 points per R1 spent', 'Priority customer support', 'Access to exclusive deals'],
    color: '#C0C0C0'
  },
  gold: {
    tier: 'gold',
    name: 'Gold',
    minSpend: 15000,
    pointsPerRand: 2,
    benefits: ['Earn 2 points per R1 spent', 'Priority customer support', 'Exclusive member discounts', 'Free delivery on orders over R200'],
    color: '#FFD700'
  },
  platinum: {
    tier: 'platinum',
    name: 'Platinum',
    minSpend: 30000,
    pointsPerRand: 3,
    benefits: ['Earn 3 points per R1 spent', 'Dedicated account manager', 'Exclusive member discounts', 'Free delivery on all orders', 'Early access to new products'],
    color: '#E5E4E2'
  }
};

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  orderId: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  description: string;
  createdAt: string;
}

export interface CreditTransaction {
  id: string;
  customerId: string;
  orderId?: string;
  amount: number;
  type: 'added' | 'spent' | 'refund' | 'bonus';
  description: string;
  createdAt: string;
}

// Helper function to calculate tier from total spent
export const calculateTier = (totalSpent: number): CustomerTier => {
  if (totalSpent >= TIER_CONFIG.platinum.minSpend) return 'platinum';
  if (totalSpent >= TIER_CONFIG.gold.minSpend) return 'gold';
  if (totalSpent >= TIER_CONFIG.silver.minSpend) return 'silver';
  return 'bronze';
};

// Helper function to calculate tier progress percentage
export const calculateTierProgress = (totalSpent: number): { progress: number; nextTier: CustomerTier | null } => {
  if (totalSpent >= TIER_CONFIG.platinum.minSpend) {
    return { progress: 100, nextTier: null };
  }
  
  if (totalSpent >= TIER_CONFIG.gold.minSpend) {
    const progress = ((totalSpent - TIER_CONFIG.gold.minSpend) / 
      (TIER_CONFIG.platinum.minSpend - TIER_CONFIG.gold.minSpend)) * 100;
    return { progress, nextTier: 'platinum' };
  }
  
  if (totalSpent >= TIER_CONFIG.silver.minSpend) {
    const progress = ((totalSpent - TIER_CONFIG.silver.minSpend) / 
      (TIER_CONFIG.gold.minSpend - TIER_CONFIG.silver.minSpend)) * 100;
    return { progress, nextTier: 'gold' };
  }
  
  // Bronze to Silver
  const progress = (totalSpent / TIER_CONFIG.silver.minSpend) * 100;
  return { progress, nextTier: 'silver' };
};

// Helper function to calculate loyalty points from purchase
export const calculateLoyaltyPoints = (amount: number, tier: CustomerTier): number => {
  return Math.floor(amount * TIER_CONFIG[tier].pointsPerRand);
};

// Helper function to format estimated delivery date
export const calculateEstimatedDelivery = (orderDate: string, isDigital: boolean = false): string => {
  if (isDigital) {
    return 'Immediate - Digital Access';
  }
  
  const orderDateObj = new Date(orderDate);
  // Add 3-5 business days for delivery
  const deliveryDate = new Date(orderDateObj);
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  
  return deliveryDate.toLocaleDateString('en-ZA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Helper function to get status color
export const getStatusColor = (status: string | null): string => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return 'text-green-600 bg-green-50';
    case 'processing':
    case 'shipped':
      return 'text-blue-600 bg-blue-50';
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'cancelled':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// Interface for stored cart items during checkout
export interface StoredCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  supplierId: string;
  description?: string;
  isDigital?: boolean;
}

// Dashboard widget types
export interface DashboardWidget {
  id: string;
  type: 'orders' | 'loyalty' | 'credits' | 'tier' | 'stats' | 'quickActions';
  title: string;
  data: unknown;
}

// Post-payment result to pass between pages
export interface PaymentResult {
  success: boolean;
  orderId: string;
  orderIds: string[];
  amount: number;
  paymentMethod: string;
  items: StoredCartItem[];
  timestamp: string;
  loyaltyPointsEarned: number;
}
