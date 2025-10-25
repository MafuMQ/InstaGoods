import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  LogOut,
  Home,
  TrendingUp,
} from "lucide-react";

interface SupplierNavProps {
  onSignOut: () => void;
}

const SupplierNav = ({ onSignOut }: SupplierNavProps) => {
  const location = useLocation();

  const navItems = [
    { to: "/supplier/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/supplier/products", icon: Package, label: "Products" },
    { to: "/supplier/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/supplier/incomes", icon: TrendingUp, label: "Incomes" },
    { to: "/supplier/expenses", icon: DollarSign, label: "Expenses" },
  ];

  return (
    <nav className="border-b bg-card">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold">
              <Home className="h-5 w-5" />
              Artisan Market
            </Link>
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
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
          <Button onClick={onSignOut} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default SupplierNav;
