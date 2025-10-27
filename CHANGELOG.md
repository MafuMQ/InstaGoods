# Changelog

All notable changes to the InstaGoods project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Payment gateway integration
- Email notifications system
- Mobile app version
- Admin dashboard
- Review and rating system

---

## [1.0.0] - 2025-10-27

### Added - Mobile Responsiveness Update
- **Complete mobile responsive design** across all pages
  - Supplier portal fully optimized for mobile devices
  - Customer-facing pages responsive on all screen sizes
  - Hamburger menus for mobile navigation
  - Touch-friendly buttons and controls
  - Responsive grids and layouts (1 col mobile → 2 col tablet → 3+ col desktop)

#### Supplier Portal Pages Made Responsive
- `SupplierNav` - Mobile hamburger menu with Sheet drawer
- `SupplierDashboard` - Responsive stats grid and cards
- `SupplierProducts` - Mobile-friendly product management
- `SupplierOrders` - Stacked order cards on mobile
- `SupplierIncomes` - Responsive income tracking
- `SupplierExpenses` - Mobile-optimized expense cards
- `SupplierServiceRequests` - Adaptive service request layout
- `SupplierOptimize` - Fixed button layout, responsive controls
- `SupplierShopSettings` - Mobile-friendly settings form
- `Auth` - Responsive login/signup forms

#### Customer Pages Made Responsive
- `Header` - Mobile search and navigation
- `ProductDetail` - Stacked layout on mobile
- `GroceryDetail` - Mobile-optimized detail view
- `Cart` - Responsive cart items and checkout
- `Index` - Already responsive, improved state preservation

### Fixed
- Product ID collision issue between static and database data
- Navigation state not preserved when browsing back
- Optimize page button layout wrapping issues
- Product detail pages showing wrong products

### Changed
- Renamed "Shop by Store" to "Shop by Business" throughout app
- Updated all sample supplier locations to Gauteng, South Africa
- Improved scroll position restoration on navigation
- Enhanced filter state persistence

### Technical Improvements
- Implemented consistent responsive patterns:
  - Text sizes: `text-2xl sm:text-3xl lg:text-4xl`
  - Padding: `px-4 sm:px-6`, `py-4 sm:py-8`
  - Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
  - Flex direction: `flex-col sm:flex-row`
- Added sessionStorage for state preservation
- Implemented React Router location.state for navigation context

---

## [0.9.0] - 2025-10-20

### Added
- **Product Optimization Tool** for suppliers
  - Linear programming solver integration
  - Budget constraint optimization
  - Min/max quantity controls
  - Profit maximization calculations
- **Financial Management** system
  - Income tracking with order linkage
  - Expense categorization and reporting
  - Dashboard analytics with charts

### Features
- Service request management for suppliers
- Location-based product filtering
- Shopping cart with persistent storage
- Wishlist functionality
- Multi-category support (Groceries, Products, Services, Freelancing)

---

## [0.8.0] - 2025-10-10

### Added
- **Supplier Portal** with full dashboard
  - Product CRUD operations
  - Order management system
  - Business profile settings
- **Customer Pages**
  - Product browsing and search
  - Category navigation
  - Business directory (Shop by Business)
- Help Center and Contact Us pages
- About page with modern design

### Changed
- Migrated to Supabase for backend
- Implemented Row Level Security
- Added auto-supplier creation trigger

---

## [0.7.0] - 2025-09-25

### Added
- **Location Services**
  - Google Maps integration
  - Geocoding API
  - Delivery radius calculations
  - Location autocomplete
- **Static Demo Data**
  - 18 sample suppliers in South Africa
  - Product examples across all categories
  - Service and freelancing listings

### Technical
- Haversine formula for distance calculation
- LocationContext for global location state
- Geocoding proxy API endpoint

---

## [0.6.0] - 2025-09-15

### Added
- **Authentication System**
  - Supabase Auth integration
  - Supplier signup/login
  - JWT token management
  - Protected routes
- **Database Schema**
  - Users, Suppliers, Products tables
  - Orders and transactions
  - Income and expense tracking

---

## [0.5.0] - 2025-09-01

### Added
- **UI Component Library**
  - shadcn/ui integration
  - 50+ reusable components
  - Consistent design system
  - Tailwind CSS styling
- Product cards for different categories
- Responsive grid layouts

---

## [0.4.0] - 2025-08-20

### Added
- **Routing System**
  - React Router v6
  - Customer routes
  - Supplier routes
  - 404 page
- Navigation state preservation
- Scroll position restoration

---

## [0.3.0] - 2025-08-10

### Added
- **Context Providers**
  - CartContext for shopping cart
  - WishlistContext for favorites
  - ServiceRequestContext for service quotes
- LocalStorage persistence
- Context hooks

---

## [0.2.0] - 2025-08-01

### Added
- **Project Structure**
  - Component organization
  - Page layouts
  - Custom hooks
  - Utility functions
- TypeScript configuration
- ESLint setup
- Tailwind configuration

---

## [0.1.0] - 2025-07-20

### Added
- **Initial Project Setup**
  - Vite configuration
  - React 18 installation
  - TypeScript integration
  - Basic folder structure
- README and documentation structure
- Git repository initialization

---

## Version Numbering

- **Major version (X.0.0)**: Breaking changes, major new features
- **Minor version (0.X.0)**: New features, backwards compatible
- **Patch version (0.0.X)**: Bug fixes, minor improvements

---

## Links

- [Repository](https://github.com/your-username/instagoods)
- [Documentation](./docs/)
- [Issue Tracker](https://github.com/your-username/instagoods/issues)
- [Releases](https://github.com/your-username/instagoods/releases)

---

**Note:** Dates in this changelog are examples and should be updated to reflect actual release dates.
