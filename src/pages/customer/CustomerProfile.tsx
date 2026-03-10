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
  Calendar, 
  Shield,
  UserCog,
  Edit2,
  Save
} from "lucide-react";
import { format } from "date-fns";

interface ProfileData {
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string | null;
}

const CustomerProfile = () => {
  const { loading: authLoading, customerId, signOut, user: authUser } = useCustomerAuth();
  const [profile, setProfile] = useState<ProfileData>({
    email: "",
    full_name: "",
    avatar_url: null,
    created_at: null,
  });
  const [saving, setSaving] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Format user data for CustomerNav
  const user = authUser ? {
    name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture
  } : undefined;

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerNav onSignOut={signOut} user={user} />
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <CustomerNav onSignOut={signOut} user={user} />
      
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
