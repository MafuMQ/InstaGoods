import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import CustomerNav from "@/components/customer/CustomerNav";
import { Loading } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const CustomerProfile = () => {
  const { loading, customerId, signOut } = useCustomerAuth();
  const [profile, setProfile] = useState({
    email: "",
    full_name: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customerId) {
      fetchProfile();
    }
  }, [customerId]);

  const fetchProfile = async () => {
    if (!customerId) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        setProfile({
          email: data.email || user.email || "",
          full_name: data.full_name || "",
        });
      }
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
    }

    setSaving(false);
  };

  if (loading) {
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
        <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8">My Profile</h1>

        <Card className="p-6 max-w-2xl">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CustomerProfile;
