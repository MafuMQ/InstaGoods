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

      {/* Desktop fixed sidebar (hidden on small screens) */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-card border-r">
        <div className="flex flex-col py-4 px-4">
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
