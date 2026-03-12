import { useMemo, useState } from 'react';
import { 
  Package, 
  Snowflake, 
  Wrench, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  calculateDeliveryFromAddresses,
  determineOrderType, 
  formatTimeRemaining,
  getTrackingProgress,
  OrderType,
  DeliveryMilestone,
  OrderAddress
} from '@/lib/order-tracking';
import { formatAddressForGeocode } from '@/lib/geocoding';

interface OrderTrackingTimelineProps {
  // Customer address from profiles table
  customerStreet?: string;
  customerCity?: string;
  customerState?: string;
  customerPostalCode?: string;
  customerCountry?: string;
  // Supplier info
  supplierLocation?: string;
  supplierCategory?: string;
  // Order info
  orderStatus: string;
  productCategory?: string;
  orderDate?: string;
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const isPast = diff < 0;
  const absDiff = Math.abs(diff);
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (isPast) return 'Completed';
  if (hours > 24) return `in ${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? 's' : ''}`;
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}

interface TimelineItemProps {
  milestone: DeliveryMilestone;
  index: number;
  statusColor: string;
}

function TimelineItem({ milestone, index, statusColor }: TimelineItemProps) {
  return (
    <div className="relative flex gap-3">
      <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        milestone.isCompleted 
          ? 'bg-green-500 text-white' 
          : milestone.isCurrent 
            ? `${statusColor} text-white animate-pulse`
            : 'bg-muted text-muted-foreground'
      }`}>
        {milestone.isCompleted ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : milestone.isCurrent ? (
          <Truck className="h-4 w-4" />
        ) : (
          <span className="text-xs font-medium">{index + 1}</span>
        )}
      </div>
      
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between">
          <span className={`font-medium text-sm ${
            milestone.isCompleted || milestone.isCurrent ? 'text-foreground' : 'text-muted-foreground'
          }`}>
            {milestone.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(milestone.estimatedTime)}
          </span>
        </div>
        <p className={`text-xs mt-0.5 ${milestone.isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
          {milestone.description}
        </p>
      </div>
    </div>
  );
}

export function OrderTrackingTimeline({
  customerStreet,
  customerCity,
  customerState,
  customerPostalCode,
  customerCountry,
  supplierLocation,
  supplierCategory,
  orderStatus,
  productCategory,
  orderDate
}: OrderTrackingTimelineProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [estimate, setEstimate] = useState<any>(null);

  // Determine order type
  const orderType = useMemo(() => 
    determineOrderType(supplierCategory, productCategory), 
    [supplierCategory, productCategory]
  );

  // Calculate delivery when component mounts
  useMemo(() => {
    const calculateTracking = async () => {
      setIsLoading(true);
      
      const customerAddress: OrderAddress = {
        street: customerStreet,
        city: customerCity,
        state: customerState,
        postalCode: customerPostalCode,
        country: customerCountry
      };
      
      const supplierAddress: OrderAddress = {
        city: supplierLocation
      };
      
      const result = await calculateDeliveryFromAddresses(
        customerAddress,
        supplierAddress,
        orderType,
        orderStatus
      );
      
      setEstimate(result);
      setIsLoading(false);
    };

    if (customerCity || supplierLocation) {
      calculateTracking();
    } else {
      setIsLoading(false);
    }
  }, [customerStreet, customerCity, customerState, customerPostalCode, customerCountry, supplierLocation, supplierCategory, orderStatus, productCategory]);

  const progress = estimate ? getTrackingProgress(orderType, orderStatus) : 0;

  const getTypeIcon = (type: OrderType) => {
    switch (type) {
      case 'perishable':
        return <Snowflake className="h-5 w-5 text-cyan-500" />;
      case 'service':
        return <Wrench className="h-5 w-5 text-purple-500" />;
      default:
        return <Package className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: OrderType) => {
    switch (type) {
      case 'perishable':
        return 'Perishable Goods';
      case 'service':
        return 'Service';
      default:
        return 'Physical Goods';
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      processing: 'bg-blue-500',
      scheduled: 'bg-purple-500',
      shipped: 'bg-indigo-500',
      cold_chain: 'bg-cyan-500',
      in_transit: 'bg-orange-500',
      en_route: 'bg-orange-500',
      arriving: 'bg-orange-600',
      out_for_delivery: 'bg-pink-500',
      in_progress: 'bg-purple-600',
      delivered: 'bg-green-500',
      completed: 'bg-green-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Calculating delivery...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!estimate) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Address information not available for tracking</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getTypeIcon(orderType)}
            Order Tracking
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {getTypeLabel(orderType)}
            </Badge>
            {estimate.isEstimate && (
              <Badge variant="secondary" className="text-xs">
                Estimate
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Address Summary */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {estimate.isEstimate 
                ? `~${estimate.distanceKm.toFixed(1)} km (estimated)`
                : `${estimate.distanceKm.toFixed(1)} km`
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatTimeRemaining(estimate.estimatedDeliveryDate)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Separator />

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-muted" />
          
          <div className="space-y-4">
            {estimate.milestones.map((milestone: DeliveryMilestone, index: number) => (
              <TimelineItem 
                key={milestone.status} 
                milestone={milestone} 
                index={index}
                statusColor={getStatusColor(milestone.status)}
              />
            ))}
          </div>
        </div>

        {orderDate && (
          <div className="pt-2 text-xs text-muted-foreground text-center">
            Ordered on {new Date(orderDate).toLocaleDateString('en-ZA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default OrderTrackingTimeline;
