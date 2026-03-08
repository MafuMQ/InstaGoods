import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  LogOut,
  Home,
  MessageSquare,
  TrendingUp,
  Target,
  Menu,
} from "lucide-react";

interface SupplierNavProps {
  onSignOut: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const SupplierNav = ({ onSignOut, user }: SupplierNavProps) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: "/supplier/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/supplier/products", icon: Package, label: "Products" },
    { to: "/supplier/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/supplier/incomes", icon: TrendingUp, label: "Incomes" },
    { to: "/supplier/expenses", icon: DollarSign, label: "Expenses" },
    { to: "/supplier/service-requests", icon: MessageSquare, label: "Service Requests" },
    { to: "/supplier/optimize", icon: Target, label: "Optimize" },
    { to: "/supplier/shop-settings", icon: Home, label: "Shop Settings" },
  ];

  return (
    <>
      {/* Mobile header: sheet trigger + logo (visible on small screens) */}
      <div className="flex items-center gap-2 px-4 py-3 mb-2 lg:hidden bg-background border-b">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            {/* User Profile Display for Mobile */}
            {user && (
              <div className="flex items-center gap-3 px-2 py-3 mb-4 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <Button onClick={() => { onSignOut(); setOpen(false); }} variant="outline" size="sm" className="justify-start gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <Home className="h-5 w-5" />
          <span className="hidden sm:inline">InstaGoods</span>
        </Link>
      </div>

      {/* Desktop fixed sidebar (hidden on small screens) */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-card border-r">
        <div className="flex flex-col py-4 px-4 w-full">
          {/* User Profile Display */}
          {user && (
            <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">{user.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            </div>
          )}
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
          <Button onClick={onSignOut} variant="outline" size="sm" className="w-full justify-start gap-2 mt-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>
    </>
  );
};

export default SupplierNav;
