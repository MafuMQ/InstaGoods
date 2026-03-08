import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, type ElementType } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Bell,
  User,
  LogOut,
  Home,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * User profile information structure
 */
interface UserProfile {
  /** User's full name */
  name: string;
  /** User's email address */
  email: string;
  /** Optional avatar URL */
  avatar?: string;
}

/**
 * Props for the CustomerNav component
 */
interface CustomerNavProps {
  /** Callback function triggered when user signs out */
  onSignOut: () => void;
  /** Number of items in the shopping cart */
  cartCount?: number;
  /** Number of unread notifications */
  notificationCount?: number;
  /** Number of items in wishlist */
  wishlistCount?: number;
  /** Current user profile information */
  user?: UserProfile;
}

/**
 * Navigation item structure for type safety
 */
interface NavItem {
  /** The URL path to navigate to */
  to: string;
  /** The Lucide icon component to display */
  icon: ElementType;
  /** The display label for the navigation item */
  label: string;
  /** Optional badge count to display */
  badge?: number;
}

/**
 * Customer navigation component providing both mobile and desktop navigation.
 * 
 * Mobile: Collapsible sheet menu triggered by hamburger icon
 * Desktop: Fixed left sidebar with navigation links (collapsible)
 * 
 * Supports keyboard navigation and includes proper ARIA attributes for accessibility.
 */
const CustomerNav = ({ onSignOut, cartCount = 0, notificationCount = 0, wishlistCount = 0, user }: CustomerNavProps) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Navigation items configuration
  const navItems: NavItem[] = [
    { to: "/customer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/customer/orders", icon: ShoppingBag, label: "My Orders" },
    { to: "/cart", icon: ShoppingCart, label: "Cart", badge: cartCount },
    { to: "/wishlist", icon: Heart, label: "Wishlist", badge: wishlistCount },
    { to: "/customer/profile", icon: User, label: "Profile" },
  ];

  /**
   * Determines if a navigation item is currently active based on the current pathname
   * Supports both exact matching and prefix matching for nested routes
   * @param path - The path to check against the current location
   * @param usePrefixMatch - Whether to match path prefix (for nested routes)
   * @returns true if the path matches the current location pathname
   */
  const isActiveRoute = (path: string, usePrefixMatch: boolean = false): boolean => {
    if (usePrefixMatch) {
      return location.pathname.startsWith(path);
    }
    return location.pathname === path;
  };

  /**
   * Handles navigation link click in mobile view by closing the sheet menu
   */
  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  /**
   * Handles sign out action in mobile view by closing the sheet menu first
   */
  const handleMobileSignOut = () => {
    onSignOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* 
        Mobile Header 
        Visible on small screens (lg:hidden)
        Contains hamburger menu trigger and logo link
      */}
      <header 
        className="flex items-center gap-2 px-4 py-3 mb-2 lg:hidden bg-background border-b"
        role="banner"
      >
        <Sheet 
          open={isMobileMenuOpen} 
          onOpenChange={setIsMobileMenuOpen}
        >
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-64"
            aria-describedby="mobile-nav-description"
          >
            {/* Screen reader description for the mobile navigation */}
            <span id="mobile-nav-description" className="sr-only">
              Customer navigation menu
            </span>
            <nav 
              className="flex flex-col gap-4 mt-8" 
              aria-label="Mobile navigation"
            >
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(item.to);
                    const badgeCount = item.badge;
                    return (
                      <Link 
                        key={item.to} 
                        to={item.to} 
                        onClick={handleMobileNavClick}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start gap-2 relative"
                          aria-label={item.label}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          {item.label}
                          {badgeCount !== undefined && badgeCount > 0 && (
                            <Badge 
                              variant="secondary" 
                              className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                            >
                              {badgeCount > 99 ? "99+" : badgeCount}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    );
                  })}
              <Button 
                onClick={handleMobileSignOut} 
                variant="outline" 
                size="sm" 
                className="justify-start gap-2"
                aria-label="Sign out of your account"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign Out
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
        
        {/* Logo / Brand link - navigates to home page */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-lg font-bold"
          aria-label="InstaGoods - Go to homepage"
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">InstaGoods</span>
        </Link>
      </header>

      {/* 
        Desktop Sidebar Navigation 
        Hidden on small screens (hidden lg:flex)
        Fixed position left sidebar with full navigation
        Supports collapsible state
      */}
      <nav 
        className={`hidden lg:flex fixed left-0 top-0 h-full bg-card border-r transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-64"
        }`}
        role="navigation"
        aria-label="Desktop navigation"
      >
        <div className="flex flex-col py-4 px-2 w-full">
          {/* User Profile Display */}
          {user && !isSidebarCollapsed && (
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
          
          {user && isSidebarCollapsed && (
            <div className="flex justify-center mb-4">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
          )}

          {/* Collapse Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`mb-4 ${isSidebarCollapsed ? "justify-center" : "justify-end"} ml-auto`}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <span className="text-xs text-muted-foreground mr-2">Collapse</span>
                <ChevronLeft className="h-4 w-4" />
              </>
            )}
          </Button>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.to);
            const badgeCount = item.badge;
            return (
              <Link 
                key={item.to} 
                to={item.to}
                aria-current={isActive ? "page" : undefined}
              >
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`w-full justify-start p-4 gap-2 relative ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                  aria-label={item.label}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  {!isSidebarCollapsed && (
                    <>
                      {item.label}
                      {badgeCount !== undefined && badgeCount > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {badgeCount > 99 ? "99+" : badgeCount}
                        </Badge>
                      )}
                    </>
                  )}
                  {isSidebarCollapsed && badgeCount !== undefined && badgeCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                    >
                      {badgeCount > 99 ? "!" : badgeCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
          
          {/* Sign out button - separated with margin for visual grouping */}
          <Button 
            onClick={onSignOut} 
            variant="outline" 
            size="sm" 
            className="w-full justify-start gap-2 mt-2"
            aria-label="Sign out of your account"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign Out
          </Button>
        </div>
      </nav>
    </>
  );
};

export default CustomerNav;
