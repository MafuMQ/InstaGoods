import { haversineDistance } from './distance';
import { geocodeAddress, getDefaultLocation, formatAddressForGeocode, GeocodeResult } from './geocoding';

// Order type definitions
export type OrderType = 'physical' | 'perishable' | 'service';

// Tracking status for each order type
export type PhysicalGoodsStatus = 
  | 'pending' 
  | 'processing' 
  | 'shipped' 
  | 'in_transit' 
  | 'out_for_delivery' 
  | 'delivered';

export type PerishableGoodsStatus = 
  | 'pending' 
  | 'processing' 
  | 'cold_chain' 
  | 'in_transit' 
  | 'out_for_delivery' 
  | 'delivered';

export type ServiceStatus = 
  | 'pending' 
  | 'scheduled' 
  | 'en_route' 
  | 'arriving' 
  | 'in_progress' 
  | 'completed';

export type OrderStatus = PhysicalGoodsStatus | PerishableGoodsStatus | ServiceStatus;

// Address interface for order tracking
export interface OrderAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// Delivery milestone interface
export interface DeliveryMilestone {
  status: OrderStatus;
  description: string;
  estimatedTime: Date;
  isCompleted: boolean;
  isCurrent: boolean;
}

// Delivery estimate result
export interface DeliveryEstimate {
  distanceKm: number;
  estimatedHours: number;
  estimatedDeliveryDate: Date;
  milestones: DeliveryMilestone[];
  // Address information for display
  customerAddress?: string;
  supplierAddress?: string;
  isEstimate?: boolean; // True if estimate was calculated without coordinates
}

// Tracking configuration for each order type
interface TrackingConfig {
  baseSpeedKmh: number;
  processingHours: number;
  deliveryWindowHours: number;
  color: string;
  icon: string;
}

const TRACKING_CONFIGS: Record<OrderType, TrackingConfig> = {
  physical: {
    baseSpeedKmh: 50,
    processingHours: 2,
    deliveryWindowHours: 4,
    color: '#3b82f6',
    icon: 'package'
  },
  perishable: {
    baseSpeedKmh: 70,
    processingHours: 1,
    deliveryWindowHours: 2,
    color: '#10b981',
    icon: 'snowflake'
  },
  service: {
    baseSpeedKmh: 40,
    processingHours: 0,
    deliveryWindowHours: 1,
    color: '#8b5cf6',
    icon: 'wrench'
  }
};

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

// Generate status milestones based on order type and distance
function generateMilestones(
  distanceKm: number, 
  orderType: OrderType, 
  currentStatus: string
): DeliveryMilestone[] {
  const config = TRACKING_CONFIGS[orderType];
  const now = new Date();
  
  let milestones: DeliveryMilestone[] = [];
  
  if (orderType === 'perishable') {
    milestones = [
      { status: 'pending', description: 'Order received - preparing for immediate dispatch', estimatedTime: addHours(now, 0), isCompleted: currentStatus !== 'pending', isCurrent: currentStatus === 'pending' },
      { status: 'processing', description: 'Order being prepared for cold-chain transport', estimatedTime: addHours(now, config.processingHours), isCompleted: ['cold_chain', 'in_transit', 'out_for_delivery', 'delivered'].includes(currentStatus), isCurrent: currentStatus === 'processing' },
      { status: 'cold_chain', description: 'Temperature-controlled transport initiated', estimatedTime: addHours(now, config.processingHours + 0.5), isCompleted: ['in_transit', 'out_for_delivery', 'delivered'].includes(currentStatus), isCurrent: currentStatus === 'cold_chain' },
      { status: 'in_transit', description: 'In transit with temperature monitoring', estimatedTime: addHours(now, config.processingHours + 1 + distanceKm / config.baseSpeedKmh), isCompleted: ['out_for_delivery', 'delivered'].includes(currentStatus), isCurrent: currentStatus === 'in_transit' },
      { status: 'out_for_delivery', description: 'Final mile delivery - keep refrigerated', estimatedTime: addHours(now, config.processingHours + 2 + distanceKm / config.baseSpeedKmh), isCompleted: currentStatus === 'delivered', isCurrent: currentStatus === 'out_for_delivery' },
      { status: 'delivered', description: 'Delivered - enjoy your fresh products!', estimatedTime: addHours(now, config.processingHours + 3 + distanceKm / config.baseSpeedKmh), isCompleted: currentStatus === 'delivered', isCurrent: false }
    ];
  } else if (orderType === 'service') {
    milestones = [
      { status: 'pending', description: 'Service request received', estimatedTime: addHours(now, 0), isCompleted: currentStatus !== 'pending', isCurrent: currentStatus === 'pending' },
      { status: 'scheduled', description: 'Appointment scheduled with service provider', estimatedTime: addHours(now, 24), isCompleted: ['en_route', 'arriving', 'in_progress', 'completed'].includes(currentStatus), isCurrent: currentStatus === 'scheduled' },
      { status: 'en_route', description: 'Service provider traveling to your location', estimatedTime: addHours(now, 25 + distanceKm / config.baseSpeedKmh), isCompleted: ['arriving', 'in_progress', 'completed'].includes(currentStatus), isCurrent: currentStatus === 'en_route' },
      { status: 'arriving', description: 'Provider arriving at your location', estimatedTime: addHours(now, 26 + distanceKm / config.baseSpeedKmh), isCompleted: ['in_progress', 'completed'].includes(currentStatus), isCurrent: currentStatus === 'arriving' },
      { status: 'in_progress', description: 'Service being performed', estimatedTime: addHours(now, 27 + distanceKm / config.baseSpeedKmh), isCompleted: currentStatus === 'completed', isCurrent: currentStatus === 'in_progress' },
      { status: 'completed', description: 'Service completed - thank you for your business!', estimatedTime: addHours(now, 28 + distanceKm / config.baseSpeedKmh), isCompleted: currentStatus === 'completed', isCurrent: false }
    ];
  } else {
    milestones = [
      { status: 'pending', description: 'Order received', estimatedTime: addHours(now, 0), isCompleted: currentStatus !== 'pending', isCurrent: currentStatus === 'pending' },
      { status: 'processing', description: 'Order being prepared for shipment', estimatedTime: addHours(now, config.processingHours), isCompleted: ['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(currentStatus), isCurrent: currentStatus === 'processing' },
      { status: 'shipped', description: 'Package dispatched from warehouse', estimatedTime: addHours(now, config.processingHours + 1), isCompleted: ['in_transit', 'out_for_delivery', 'delivered'].includes(currentStatus), isCurrent: currentStatus === 'shipped' },
      { status: 'in_transit', description: 'In transit to delivery address', estimatedTime: addHours(now, config.processingHours + 2 + distanceKm / config.baseSpeedKmh), isCompleted: ['out_for_delivery', 'delivered'].includes(currentStatus), isCurrent: currentStatus === 'in_transit' },
      { status: 'out_for_delivery', description: 'Out for delivery', estimatedTime: addHours(now, config.processingHours + 3 + distanceKm / config.baseSpeedKmh), isCompleted: currentStatus === 'delivered', isCurrent: currentStatus === 'out_for_delivery' },
      { status: 'delivered', description: 'Delivered to recipient', estimatedTime: addHours(now, config.processingHours + 4 + distanceKm / config.baseSpeedKmh), isCompleted: currentStatus === 'delivered', isCurrent: false }
    ];
  }
  
  return milestones;
}

/**
 * Calculate delivery estimate using addresses (not coordinates)
 * This will geocode addresses if needed
 */
export async function calculateDeliveryFromAddresses(
  customerAddress: OrderAddress,
  supplierAddress: OrderAddress,
  orderType: OrderType,
  currentStatus: string
): Promise<DeliveryEstimate> {
  // Format addresses for display
  const customerAddressStr = formatAddressForGeocode(
    customerAddress.street || '',
    customerAddress.city || '',
    customerAddress.state,
    customerAddress.country
  );
  
  const supplierAddressStr = supplierAddress.city || supplierAddress.street || 'Supplier Location';
  
  // Try to geocode both addresses
  const customerGeo = await geocodeAddress(customerAddressStr);
  const supplierGeo = await geocodeAddress(supplierAddress.city || 'Johannesburg');
  
  let distanceKm = 0;
  let isEstimate = false;
  
  if (customerGeo.success && customerGeo.location && supplierGeo.success && supplierGeo.location) {
    // Both geocoded successfully - calculate actual distance
    distanceKm = haversineDistance(
      customerGeo.location.lat,
      customerGeo.location.lng,
      supplierGeo.location.lat,
      supplierGeo.location.lng
    );
  } else {
    // Could not geocode - use default estimate based on order type
    isEstimate = true;
    distanceKm = orderType === 'perishable' ? 15 : orderType === 'service' ? 20 : 25;
  }
  
  const config = TRACKING_CONFIGS[orderType];
  const travelHours = distanceKm / config.baseSpeedKmh;
  const totalHours = config.processingHours + travelHours;
  const estimatedDeliveryDate = addHours(new Date(), totalHours);
  const milestones = generateMilestones(distanceKm, orderType, currentStatus);
  
  return {
    distanceKm: Math.round(distanceKm * 100) / 100,
    estimatedHours: Math.round(totalHours * 100) / 100,
    estimatedDeliveryDate,
    milestones,
    customerAddress: customerAddressStr,
    supplierAddress: supplierAddressStr,
    isEstimate
  };
}

/**
 * Calculate delivery estimate using existing coordinates
 */
export function calculateDeliveryETA(
  customerLat: number,
  customerLng: number,
  supplierLat: number,
  supplierLng: number,
  orderType: OrderType,
  currentStatus: string = 'pending'
): DeliveryEstimate {
  const distanceKm = haversineDistance(customerLat, customerLng, supplierLat, supplierLng);
  
  const config = TRACKING_CONFIGS[orderType];
  const travelHours = distanceKm / config.baseSpeedKmh;
  const totalHours = config.processingHours + travelHours;
  const estimatedDeliveryDate = addHours(new Date(), totalHours);
  const milestones = generateMilestones(distanceKm, orderType, currentStatus);
  
  return {
    distanceKm: Math.round(distanceKm * 100) / 100,
    estimatedHours: Math.round(totalHours * 100) / 100,
    estimatedDeliveryDate,
    milestones,
    isEstimate: false
  };
}

/**
 * Get tracking configuration for an order type
 */
export function getTrackingConfig(orderType: OrderType): TrackingConfig {
  return TRACKING_CONFIGS[orderType];
}

/**
 * Determine order type from order data or supplier category
 */
export function determineOrderType(
  supplierCategory?: string,
  productCategory?: string
): OrderType {
  const perishableKeywords = ['food', 'grocery', 'fresh', 'frozen', 'dairy', 'meat', 'vegetables', 'fruit', 'bakery', 'flowers', 'plants'];
  
  if (supplierCategory) {
    const categoryLower = supplierCategory.toLowerCase();
    if (perishableKeywords.some(k => categoryLower.includes(k))) {
      return 'perishable';
    }
  }
  
  if (productCategory) {
    const productLower = productCategory.toLowerCase();
    if (perishableKeywords.some(k => productLower.includes(k))) {
      return 'perishable';
    }
  }
  
  const serviceKeywords = ['service', 'repair', 'installation', 'cleaning', 'maintenance', 'consulting', 'professional'];
  
  if (supplierCategory) {
    const categoryLower = supplierCategory.toLowerCase();
    if (serviceKeywords.some(k => categoryLower.includes(k))) {
      return 'service';
    }
  }
  
  return 'physical';
}

/**
 * Format estimated time remaining
 */
export function formatTimeRemaining(estimatedDeliveryDate: Date): string {
  const now = new Date();
  const diffMs = estimatedDeliveryDate.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Arriving now';
  }
  
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffMinutes = diffMs / (1000 * 60);
  
  if (diffHours >= 24) {
    const days = Math.floor(diffHours / 24);
    return `${days} day${days > 1 ? 's' : ''} away`;
  } else if (diffHours >= 1) {
    const hours = Math.floor(diffHours);
    const mins = Math.floor((diffHours - hours) * 60);
    return `${hours}h ${mins}m away`;
  } else {
    const mins = Math.floor(diffMinutes);
    return `${mins} minute${mins > 1 ? 's' : ''} away`;
  }
}

/**
 * Get progress percentage for current status
 */
export function getTrackingProgress(orderType: OrderType, currentStatus: string): number {
  const statusOrder: Record<string, number> = {};
  
  if (orderType === 'perishable') {
    Object.assign(statusOrder, {
      'pending': 0, 'processing': 17, 'cold_chain': 34, 'in_transit': 51, 'out_for_delivery': 84, 'delivered': 100
    });
  } else if (orderType === 'service') {
    Object.assign(statusOrder, {
      'pending': 0, 'scheduled': 17, 'en_route': 34, 'arriving': 51, 'in_progress': 84, 'completed': 100
    });
  } else {
    Object.assign(statusOrder, {
      'pending': 0, 'processing': 17, 'shipped': 34, 'in_transit': 51, 'out_for_delivery': 84, 'delivered': 100
    });
  }
  
  return statusOrder[currentStatus] ?? 0;
}
