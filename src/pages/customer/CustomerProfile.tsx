import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import CustomerNav from "@/components/customer/CustomerNav";
import { Loading } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Clock,
  Shield,
  UserCog,
  Edit2,
  Save
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface ProfileData {
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string | null;
}

interface OrderSummary {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  completedOrders: number;
}

interface RecentOrder {
  id: string;
  order_date: string;
  status: string;
  total_amount: number;
  product_name: string;
}

const CustomerProfile = () => {
  const { loading: authLoading, customerId, signOut } = useCustomerAuth();
  const [profile, setProfile] = useState<ProfileData>({
    email: "",
    full_name: "",
    avatar_url: null,
    created_at: null,
  });
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [saving, setSaving] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (customerId) {
      fetchProfileData();
    }
  }, [customerId]);

  const fetchProfileData = async () => {
    if (!customerId) return;

    setDataLoading(true);
    setError(null);

    try {
      // Get the actual user from auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("User not authenticated");
        setDataLoading(false);
        return;
      }

      // Fetch profile data using the auth user ID
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("email, full_name, avatar_url, created_at")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setError("Failed to load profile data");
      } else if (profileData) {
        setProfile({
          email: profileData.email || "",
          full_name: profileData.full_name || "",
          avatar_url: profileData.avatar_url,
          created_at: profileData.created_at,
        });
      }

      // Fetch orders using the auth user ID (customer_id in orders is the profile ID)
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, order_date, status, total_amount, product_name")
        .eq("customer_id", user.id)
        .order("order_date", { ascending: false });

      if (!ordersError && ordersData) {
        // Calculate order summary
        const totalOrders = ordersData.length;
        const totalSpent = ordersData.reduce((sum, order) => sum + Number(order.total_amount), 0);
        const pendingOrders = ordersData.filter(o => o.status === "pending").length;
        const completedOrders = ordersData.filter(o => o.status === "completed").length;

        setOrderSummary({
          totalOrders,
          totalSpent,
          pendingOrders,
          completedOrders,
        });

        // Get 5 most recent orders
        setRecentOrders(ordersData.slice(0, 5));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("An unexpected error occurred");
    } finally {
      setDataLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Not authenticated");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile: " + error.message);
    } else {
      toast.success("Profile updated successfully");
      setIsEditing(false);
    }

    setSaving(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerNav onSignOut={signOut} />
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <CustomerNav onSignOut={signOut} />
      
      <div className="mx-auto max-w-7xl py-4 md:py-8 px-4 lg:ml-64 lg:max-w-[calc(100vw-16rem)]">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold">My Profile</h1>
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Verified Customer
          </Badge>
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading />
          </div>
        ) : error ? (
          <Card className="p-6 border-red-200 bg-red-50">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={fetchProfileData}
            >
              Try Again
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Profile Information Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  Personal Information
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="gap-2"
                >
                  {isEditing ? (
                    <>
                      <Edit2 className="h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Avatar and Name Section */}
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-primary" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">{profile.full_name || "No name set"}</p>
                    <p className="text-sm text-muted-foreground">Customer Account</p>
                    {profile.created_at && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Member since {format(new Date(profile.created_at), "MMMM yyyy")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfileData();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </Card>

            {/* Order Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-xl md:text-2xl font-bold">{orderSummary.totalOrders}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-xl md:text-2xl font-bold">R{orderSummary.totalSpent.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                    <p className="text-xl md:text-2xl font-bold">{orderSummary.pendingOrders}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Completed</p>
                    <p className="text-xl md:text-2xl font-bold">{orderSummary.completedOrders}</p>
                  </div>
                  <Package className="h-8 w-8 text-green-600" />
                </div>
              </Card>
            </div>

            {/* Recent Orders Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Orders
                </h2>
                {orderSummary.totalOrders > 5 && (
                  <Button variant="link" asChild>
                    <a href="/customer/orders">View All Orders</a>
                  </Button>
                )}
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                  <Button className="mt-4" asChild>
                    <a href="/">Start Shopping</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold truncate">Order #{order.id.slice(0, 8)}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{order.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.order_date 
                            ? formatDistanceToNow(new Date(order.order_date), { addSuffix: true })
                            : "Date not available"}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold">R{Number(order.total_amount).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Account Metadata */}
            <Card className="p-6 bg-muted/30">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </h2>
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Account Created:</span>
                  <span className="font-medium">
                    {profile.created_at 
                      ? format(new Date(profile.created_at), "MMMM d, yyyy 'at' h:mm a")
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Account Type:</span>
                  <span className="font-medium">Customer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Verification Status:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Verified
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;
