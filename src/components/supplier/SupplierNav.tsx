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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSupplierNav } from "@/contexts/SupplierNavContext";

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
  const { collapsed, setCollapsed } = useSupplierNav();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

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
      <nav
        className={`hidden lg:flex fixed left-0 top-0 h-full bg-card border-r transition-all duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex flex-col py-4 px-2 w-full">
          {/* Collapse Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="absolute top-4 -right-3 h-6 w-6 rounded-full bg-card border shadow-sm hover:bg-muted p-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          {/* User Profile Display - Hidden when collapsed */}
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
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

          {/* Collapsed user avatar */}
          {collapsed && user && (
            <div className="flex justify-center mb-4">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
          )}

          <div className={`flex flex-col gap-1 ${collapsed ? "items-center" : ""}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} title={collapsed ? item.label : undefined}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`${collapsed ? "w-10 px-0 justify-center" : "w-full justify-start"} gap-2`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
          <Button
            onClick={onSignOut}
            variant="outline"
            size="sm"
            className={`${collapsed ? "w-10 px-0 justify-center mt-2" : "w-full justify-start gap-2 mt-2"}`}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && "Sign Out"}
          </Button>
        </div>
      </nav>
    </>
  );
};

export default SupplierNav;
