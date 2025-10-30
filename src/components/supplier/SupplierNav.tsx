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
}

const SupplierNav = ({ onSignOut }: SupplierNavProps) => {
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
    <nav className="border-b bg-card">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
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
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Desktop Sign Out */}
          <Button onClick={onSignOut} variant="outline" size="sm" className="hidden lg:flex">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default SupplierNav;
