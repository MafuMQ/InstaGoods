# 🛒 InstaGoods

**A modern multi-vendor marketplace platform for groceries, products, services, and freelancing.**

InstaGoods is a comprehensive e-commerce solution that connects suppliers with customers, enabling businesses to sell physical products, offer services, and manage their operations efficiently. Built with modern web technologies and designed to be fully responsive across all devices.

### For Customers
**Browse Products & Services**: Explore a wide range of offerings from multiple suppliers

- **Multi-Category Shopping**: Browse groceries, products, services, and freelancing opportunities

- **Location-Based Filtering**: See only items available in your delivery area

- **Smart Search**: Find products by name, category, or business

- **Shopping Cart & Wishlist**: Save items for later or checkout instantlynpm run dev

- **Service Requests**: Request quotes from service providers

- **Business Discovery**: Browse and filter by individual businesses

- **Delivery Options**: Support for delivery, collection-only, and nationwide shipping


### For Suppliers (Business Owners)

- **Product Management**: Add, edit, and manage your product catalog

- **Order Tracking**: Monitor and update order statuses in real-time

- **Financial Management**: Track income and expenses with detailed reports

- **Service Request Handling**: Accept and manage customer service requests

- **Inventory Control**: Set stock levels, delivery radius, and pricing

- **Business Optimization**: Built-in optimization tool to maximize profit within budget constraints

- **Business Profile**: Customize your shop with logo, banner, and description

- **Dashboard Analytics**: View key metrics and performance indicators

- Click on "New codespace" to launch a new Codespace environment.

### Technical Features

- **Responsive Design**: Fully optimized for mobile, tablet, and desktop

- **Real-time Updates**: Live data synchronization with Supabase

- **Secure Authentication**: Row-level security and role-based access control

- **Geographic Services**: Location-based product filtering and delivery radius calculation

This project is built with:

- **State Preservation**: Smart navigation that remembers your scroll position and filters

- **Modern UI/UX**: Built with shadcn/ui components and Tailwind CSS

- **Vite**: Fast development and build tool

- TypeScript

- React

- shadcn-ui

- Tailwind CSS

## 🚀 Quick Start For Development


### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **bun**
- **Supabase Account** (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/MafuMQ/InstaGoods.git
or
git clone git@github.com:MafuMQ/InstaGoods.git
cd InstaGoods

# Install dependencies
npm install

# Set up environment variables
# Copy .env.template to .env and fill in your Supabase credentials
cp .env.template .env

# Start development server
npm run dev
```

The app will be available at a given link, e.g. `http://localhost:8080`

### Database Setup

Before using the application, you need to set up the database. See the complete guide in [`setup_tutorial/DATABASE_SETUP.md`](./setup_tutorial/DATABASE_SETUP.md).

**Quick summary:**
1. Create a Supabase project
2. Run the SQL migration files in order:
   - `database-setup-1-tables.sql`
   - `database-setup-2-policies.sql`
   - `database-setup-3-triggers.sql`
3. Optionally load sample data with `sample-data.sql`

---

## 📚 Project Structure

```
InstaGoods/
├── api/                        # Serverless API endpoints
│   ├── geocode-proxy.js       # Google Maps geocoding proxy
│   └── optimize-proxy.js      # Optimization algorithm proxy
├── public/                     # Static assets
├── setup_tutorial/             # Database setup scripts and docs
├── src/
│   ├── assets/                # Images and static files
│   ├── components/            # React components
│   │   ├── customer/          # Customer-facing components
│   │   ├── supplier/          # Supplier portal components
│   │   └── ui/                # Reusable UI components (shadcn)
│   ├── context/               # React Context providers
│   │   ├── CartContext.tsx
│   │   ├── LocationContext.tsx
│   │   └── WishlistContext.tsx
│   ├── hooks/                 # Custom React hooks
│   ├── integrations/          # External service integrations
│   │   └── supabase/          # Supabase client and queries
│   ├── lib/                   # Utility functions
│   │   ├── data.ts           # Static demo data
│   │   ├── distance.ts       # Geographic calculations
│   │   ├── geocode.ts        # Location services
│   │   └── utils.ts          # General utilities
│   ├── pages/                 # Page components
│   │   ├── customer/         # Customer-facing pages
│   │   └── supplier/         # Supplier portal pages
│   ├── App.tsx               # Main app component
│   └── main.tsx              # App entry point
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **React Router v6** - Client-side routing with state preservation
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Lucide React** - Beautiful icon set

### Backend & Services
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication & authorization
  - Row Level Security (RLS)
  - Storage for images
- **Google Maps API** - Geocoding and location services
- **Vercel Functions** - Serverless API endpoints

### State Management
- **React Context API** - Global state for cart, wishlist, location
- **TanStack Query** - Server state management and caching

### UI Components & Libraries
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form management with validation
- **Zod** - Schema validation
- **date-fns** - Date manipulation
- **Recharts** - Data visualization
- **Sonner** - Toast notifications
- **Vaul** - Drawer component for mobile

### Mobile Development
- **Capacitor** - Native mobile app wrapper
  - Android platform support
  - Native device API access
  - WebView-based architecture
  - Hot reload during development

---

## 🎨 Key Features Explained

### 1. Location-Based Shopping

The app uses geographic coordinates to filter products based on delivery availability:
- Suppliers set a delivery radius (in km) for each product
- Customers set their location to see available products
- Distance calculation uses the Haversine formula
- Products can be marked as "collection only" or "delivers everywhere"

### 2. Multi-Vendor Support

Each supplier has their own:
- Product catalog
- Order management system
- Financial tracking (income/expenses)
- Business profile and settings
- Service request inbox

### 3. Product Optimization Tool

Suppliers can use the built-in optimization tool to:
- Select multiple products to optimize
- Set budget constraints
- Define min/max quantities
- Specify costs and selling prices
- Get optimal product mix recommendations to maximize profit

The tool uses linear programming to solve constrained optimization problems.

### 4. State Preservation

Smart navigation that remembers:
- Scroll position when browsing products
- Applied filters and search queries
- Category selections
- User preferences

This provides a seamless browsing experience without losing context.

### 5. Responsive Design

Fully optimized for all screen sizes:
- **Mobile**: Hamburger menus, stacked layouts, touch-friendly buttons
- **Tablet**: Adaptive grids, optimized spacing
- **Desktop**: Multi-column layouts, hover effects

---

## 📖 Documentation

- **[Database Setup Guide](./setup_tutorial/DATABASE_SETUP.md)** - Complete database configuration
- **[API Documentation](./docs/API.md)** - API endpoints and usage
- **[Component Guide](./docs/COMPONENTS.md)** - Component architecture and usage
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - How to deploy to production
- **[Mobile Development Guide](./docs/MOBILE_DEVELOPMENT.md)** - Android development with Capacitor

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Building
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint

# Mobile Development (Capacitor)
npm run cap:sync              # Build and sync all platforms
npm run cap:sync:android      # Build and sync Android only
npm run cap:open:android      # Open Android project in Android Studio
npm run cap:run:android       # Build, sync, and run on Android
npm run cap:build:android     # Build Android APK for testing
```

---

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The API endpoints in `/api` will be deployed as Vercel Serverless Functions.

### Other Platforms

The app can be deployed to any static hosting service:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Azure Static Web Apps

Just run `npm run build` and deploy the `dist` folder.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).

[![CC BY-SA 4.0](https://licensebuttons.net/l/by-sa/4.0/88x31.png)](http://creativecommons.org/licenses/by-sa/4.0/)

This means you are free to:
- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material for any purpose, even commercially

Under the following terms:
- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original

See the [LICENSE](./LICENSE) file for full details.

---

## 🙏 Acknowledgments

- Template created with [Lovable](https://lovable.dev) - AI-powered development
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Backend powered by [Supabase](https://supabase.com)

---

## 📧 Support

For questions or issues:
- Open an issue on GitHub
- Contact the development team
- Check the documentation in `/docs`

---

**Made with ❤️ for local businesses and communities**
