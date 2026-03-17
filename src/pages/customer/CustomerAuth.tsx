import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { User, Phone, MapPin, Calendar } from "lucide-react";
import { useCart } from "@/context/CartContext";

// Form Errors Type
interface FormErrors {
  [key: string]: string;
}

// Country list
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", 
  "Bahrain", "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", 
  "China", "Colombia", "Croatia", "Czech Republic", "Denmark", "Egypt", 
  "Finland", "France", "Germany", "Ghana", "Greece", "Hong Kong", 
  "Hungary", "India", "Indonesia", "Ireland", "Israel", "Italy", 
  "Japan", "Jordan", "Kenya", "Kuwait", "Lebanon", "Malaysia", 
  "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria", 
  "Norway", "Oman", "Pakistan", "Peru", "Philippines", "Poland", 
  "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", 
  "Singapore", "South Africa", "South Korea", "Spain", "Sri Lanka", 
  "Sweden", "Switzerland", "Taiwan", "Thailand", "Turkey", 
  "United Arab Emirates", "United Kingdom", "United States", "Vietnam"
];

// Validation schemas
const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format (e.g., +1234567890)");

// Legal age constant (18 years)
const LEGAL_AGE = 18;

const CustomerAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getCartCount, hasCheckedCart } = useCart();
  const [loading, setLoading] = useState(false);
  
  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // KYC state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Address state
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("South Africa");
  
  // Errors state
  const [errors, setErrors] = useState<FormErrors>({});

  // Check if user was redirected from cart with items (return-to-cart scenario)
  const returnToCart = searchParams.get("returnToCart") === "true";
  // Check if user came from checkout flow - should go to payment after sign in
  const fromCheckout = searchParams.get("fromCheckout") === "true";

  // Determine redirect based on cart status - waits for cart to be loaded
  const getRedirectPath = useCallback((): string => {
    // If user came from checkout flow, go to payment
    if (fromCheckout && getCartCount() > 0) {
      return "/payment";
    }
    // If returnToCart is set and cart has items, go back to cart
    if (returnToCart && getCartCount() > 0) {
      return "/cart";
    }
    // If cart has items (regardless of returnToCart), go to cart
    if (getCartCount() > 0) {
      return "/cart";
    }
    // Empty cart - go to dashboard with empty cart indicator
    return "/customer/dashboard?emptyCart=true";
  }, [getCartCount, returnToCart, fromCheckout]);

  // Handle post-login/authentication redirect with cart check
  const handlePostAuthRedirect = useCallback(() => {
    // Wait for cart to be checked from localStorage
    if (!hasCheckedCart) {
      setTimeout(handlePostAuthRedirect, 50);
      return;
    }
    
    const redirectPath = getRedirectPath();
    navigate(redirectPath, { replace: true });
  }, [hasCheckedCart, getRedirectPath, navigate]);

  // Check if user has customer role and handle redirect
  const checkCustomerRoleAndRedirect = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "customer")
      .maybeSingle();

    if (error) {
      console.error("Error checking customer role:", error);
      return false;
    }

    return data?.role === "customer";
  };

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkCustomerRoleAndRedirect(session.user.id).then((isCustomer) => {
          if (isCustomer) {
            handlePostAuthRedirect();
          }
        });
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle successful sign-in or sign-up events
      if (event === "SIGNED_IN" && session) {
        // Store login time for session tracking
        sessionStorage.setItem("lastLoginTime", Date.now().toString());
        
        checkCustomerRoleAndRedirect(session.user.id).then((isCustomer) => {
          if (isCustomer) {
            handlePostAuthRedirect();
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [handlePostAuthRedirect]);

  // Validate date of birth - must be valid date and user must be of legal age
  const validateDateOfBirth = (dob: string): { valid: boolean; message?: string } => {
    if (!dob) {
      return { valid: false, message: "Date of birth is required" };
    }

    const date = new Date(dob);
    const today = new Date();
    
    if (isNaN(date.getTime())) {
      return { valid: false, message: "Invalid date format" };
    }
    
    if (date >= today) {
      return { valid: false, message: "Date of birth cannot be in the future" };
    }

    // Calculate age
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }

    if (age < LEGAL_AGE) {
      return { valid: false, message: `You must be at least ${LEGAL_AGE} years old to register` };
    }

    return { valid: true };
  };

  // Validate phone number format
  const validatePhoneNumber = (phone: string): { valid: boolean; message?: string } => {
    if (!phone) {
      return { valid: false, message: "Phone number is required" };
    }
    
    const phoneValidation = phoneSchema.safeParse(phone);
    if (!phoneValidation.success) {
      return { valid: false, message: "Invalid phone number format" };
    }
    
    return { valid: true };
  };

  // Validate all KYC fields
  const validateKYCFields = (): boolean => {
    const newErrors: FormErrors = {};

    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Date of birth validation
    const dobValidation = validateDateOfBirth(dateOfBirth);
    if (!dobValidation.valid) {
      newErrors.dateOfBirth = dobValidation.message;
    }

    // Phone number validation
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.valid) {
      newErrors.phoneNumber = phoneValidation.message;
    }

    // Address validation
    if (!streetAddress.trim()) {
      newErrors.streetAddress = "Street address is required";
    }
    if (!city.trim()) {
      newErrors.city = "City is required";
    }
    if (!state.trim()) {
      newErrors.state = "State/Province is required";
    }
    if (!postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      setErrors((prev) => ({ ...prev, email: emailValidation.error.errors[0].message }));
      return;
    }

    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      setErrors((prev) => ({ ...prev, password: passwordValidation.error.errors[0].message }));
      return;
    }

    // Validate all KYC fields
    if (!validateKYCFields()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);

    // Sign up the user
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          full_name: `${firstName} ${lastName}`,
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      if (signUpError.message.includes("already registered")) {
        setErrors((prev) => ({ ...prev, email: "This email is already registered. Please sign in instead." }));
      } else {
        setErrors((prev) => ({ ...prev, email: "Sign up failed: " + signUpError.message }));
      }
      return;
    }

    // Get the user
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Add customer role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: "customer"
        });

      if (roleError) {
        setLoading(false);
        setErrors((prev) => ({ ...prev, form: "Account created but failed to set customer role: " + roleError.message }));
        toast.error("Account created but failed to set customer role");
        return;
      }

      // Profile already exists (created by trigger), update with KYC data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          email: user.email,
          full_name: `${firstName} ${lastName}`,
          first_name: firstName,
          last_name: lastName,
          phone: phoneNumber,
          date_of_birth: dateOfBirth,
          address_street: streetAddress,
          address_city: city,
          address_state: state,
          address_postal_code: postalCode,
          address_country: country,
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Failed to create profile:", profileError);
      }

      setLoading(false);
      toast.success("Account created successfully!");
      
      // For new accounts, redirect to dashboard with newAccount flag
      // (cart will be empty since it's a new account)
      navigate("/customer/dashboard?newAccount=true&emptyCart=true", { replace: true });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      setErrors((prev) => ({ ...prev, signinEmail: emailValidation.error.errors[0].message }));
      return;
    }

    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      setErrors((prev) => ({ ...prev, signinPassword: passwordValidation.error.errors[0].message }));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setErrors((prev) => ({ ...prev, signinEmail: "Sign in failed: " + error.message }));
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Store login time for session tracking
      sessionStorage.setItem("lastLoginTime", Date.now().toString());
      
      // Use the same redirect logic as auth state change
      handlePostAuthRedirect();
    }
    setLoading(false);
  };

  // Clear error when user starts typing
  const handleInputChange = (field: string, value: string, setter: (value: string) => void) => {
    setter(value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 sm:p-4">
      <Card className="w-full max-w-2xl p-4 sm:p-6">
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
                  onChange={(e) => handleInputChange("signinEmail", e.target.value, setEmail)}
                  required
                  className={errors.signinEmail ? "border-destructive" : ""}
                />
                {errors.signinEmail && (
                  <p className="text-sm text-destructive mt-1">{errors.signinEmail}</p>
                )}
              </div>
              <div>
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => handleInputChange("signinPassword", e.target.value, setPassword)}
                  required
                  className={errors.signinPassword ? "border-destructive" : ""}
                />
                {errors.signinPassword && (
                  <p className="text-sm text-destructive mt-1">{errors.signinPassword}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signup-firstname">First Name *</Label>
                    <Input
                      id="signup-firstname"
                      type="text"
                      value={firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value, setFirstName)}
                      placeholder="Enter your first name"
                      className={errors.firstName ? "border-destructive" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="signup-lastname">Last Name *</Label>
                    <Input
                      id="signup-lastname"
                      type="text"
                      value={lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value, setLastName)}
                      placeholder="Enter your last name"
                      className={errors.lastName ? "border-destructive" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signup-dob">Date of Birth *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-dob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value, setDateOfBirth)}
                        className={`pl-10 ${errors.dateOfBirth ? "border-destructive" : ""}`}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="text-sm text-destructive mt-1">{errors.dateOfBirth}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="signup-phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value, setPhoneNumber)}
                        placeholder="+1234567890"
                        className={`pl-10 ${errors.phoneNumber ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-sm text-destructive mt-1">{errors.phoneNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Residential Address
                </h3>
                
                <div>
                  <Label htmlFor="signup-street">Street Address *</Label>
                  <Input
                    id="signup-street"
                    type="text"
                    value={streetAddress}
                    onChange={(e) => handleInputChange("streetAddress", e.target.value, setStreetAddress)}
                    placeholder="123 Main Street, Apt 4B"
                    className={errors.streetAddress ? "border-destructive" : ""}
                  />
                  {errors.streetAddress && (
                    <p className="text-sm text-destructive mt-1">{errors.streetAddress}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signup-city">City *</Label>
                    <Input
                      id="signup-city"
                      type="text"
                      value={city}
                      onChange={(e) => handleInputChange("city", e.target.value, setCity)}
                      placeholder="Johannesburg"
                      className={errors.city ? "border-destructive" : ""}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="signup-state">Province *</Label>
                    <Input
                      id="signup-state"
                      type="text"
                      value={state}
                      onChange={(e) => handleInputChange("state", e.target.value, setState)}
                      placeholder="Gauteng"
                      className={errors.state ? "border-destructive" : ""}
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signup-postal">Postal Code *</Label>
                    <Input
                      id="signup-postal"
                      type="text"
                      value={postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value, setPostalCode)}
                      placeholder="10001"
                      className={errors.postalCode ? "border-destructive" : ""}
                    />
                    {errors.postalCode && (
                      <p className="text-sm text-destructive mt-1">{errors.postalCode}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="signup-country">Country *</Label>
                    <Select value={country} onValueChange={(value) => {
                      setCountry(value);
                      setErrors((prev) => ({ ...prev, country: "" }));
                    }}>
                      <SelectTrigger className={errors.country ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="text-sm text-destructive mt-1">{errors.country}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Credentials */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Account Credentials</h3>
                
                <div>
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => handleInputChange("email", e.target.value, setEmail)}
                    placeholder="your@email.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="signup-password">Password *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => handleInputChange("password", e.target.value, setPassword)}
                    placeholder="At least 6 characters"
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">{errors.password}</p>
                  )}
                </div>
              </div>

              {errors.form && (
                <p className="text-sm text-destructive text-center">{errors.form}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default CustomerAuth;
