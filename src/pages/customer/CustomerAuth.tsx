import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const CustomerAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Check if user has customer role
        checkCustomerRole(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        checkCustomerRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkCustomerRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error checking customer role:", error);
      return;
    }

    // If user has customer role, redirect to payment page
    if (data?.role === "customer") {
      navigate("/payment");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      toast.error(emailValidation.error.errors[0].message);
      return;
    }

    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      toast.error(passwordValidation.error.errors[0].message);
      return;
    }

    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (signUpError) {
      setLoading(false);
      if (signUpError.message.includes("already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error("Sign up failed: " + signUpError.message);
      }
      // Cart is NOT cleared on failed signup - user keeps their items
      return;
    }

    // After successful signup, add customer role
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: "customer"
        });

      if (roleError) {
        setLoading(false);
        toast.error("Account created but failed to set customer role: " + roleError.message);
        return;
      }

      // Add to profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          full_name: fullName
        });

      if (profileError) {
        console.error("Failed to create profile:", profileError);
      }

      setLoading(false);
      toast.success("Account created successfully! You are now logged in.");
      navigate("/payment");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      toast.error(emailValidation.error.errors[0].message);
      return;
    }

    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      toast.error(passwordValidation.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error("Sign in failed: " + error.message);
      // Cart is NOT cleared on failed sign in - user keeps their items
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 sm:p-4">
      <Card className="w-full max-w-md p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">Customer Login</h1>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default CustomerAuth;