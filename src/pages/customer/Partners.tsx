import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/customer/Header";
import ServiceCard from "@/components/customer/ServiceCard";
import { ProviderBadge, ProviderFilterBadge, ProviderType } from "@/components/customer/ProviderBadge";
import { services, suppliers } from "@/lib/data";
import { Search, MapPin, Star, Users, Briefcase, ArrowRight, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const Partners = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProviderType, setSelectedProviderType] = useState<ProviderType | "all">("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");

  // Get external services only
  const externalServices = useMemo(() => {
    return services.filter(service => 
      service.providerType === 'external' || !service.providerType
    );
  }, []);

  // Get unique categories from external services
  const categories = useMemo(() => {
    const cats = new Set(externalServices.map(s => s.mainCategory));
    return ["All", ...Array.from(cats)];
  }, [externalServices]);

  // Get unique subcategories
  const subCategories = useMemo(() => {
    const subs = new Set(externalServices.map(s => s.subCategory));
    return ["All", ...Array.from(subs)];
  }, [externalServices]);

  // Filter services
  const filteredServices = useMemo(() => {
    return externalServices.filter((service) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          service.name.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          suppliers.find(s => s.id === service.supplierId)?.name.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (selectedCategory !== "All" && service.mainCategory !== selectedCategory) return false;
      
      // Subcategory filter
      if (selectedSubCategory !== "All" && service.subCategory !== selectedSubCategory) return false;
      
      return true;
    });
  }, [externalServices, searchQuery, selectedCategory, selectedSubCategory]);

  // Get counts for filters
  const providerCounts = useMemo(() => {
    return {
      all: externalServices.length,
      internal: services.filter(s => s.providerType === 'internal').length,
      external: externalServices.length
    };
  }, [externalServices]);

  // Featured partners (hardcoded for demo)
  const featuredPartners = [
    {
      id: "6",
      name: "Easy Fix Plumber",
      description: "All in one Plumbing Solutions",
      location: "Centurion, Gauteng",
      rating: 4.8,
      serviceCount: 3,
      verificationLevel: "premium" as const
    },
    {
      id: "5",
      name: "Electrical",
      description: "Professional Electrical Technician",
      location: "Soweto, Gauteng",
      rating: 4.9,
      serviceCount: 2,
      verificationLevel: "verified" as const
    },
    {
      id: "8",
      name: "Construction",
      description: "Home improvement and renovation experts",
      location: "Boksburg, Gauteng",
      rating: 4.7,
      serviceCount: 2,
      verificationLevel: "verified" as const
    }
  ];

  // Category cards for the hero section
  const partnerCategories = [
    { name: "Home Services", icon: Briefcase, count: 24, color: "bg-blue-100 text-blue-700" },
    { name: "Auto Services", icon: MapPin, count: 18, color: "bg-green-100 text-green-700" },
    { name: "Tech Support", icon: Users, count: 15, color: "bg-purple-100 text-purple-700" },
    { name: "Creative Services", icon: Star, count: 22, color: "bg-pink-100 text-pink-700" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-blue-50 to-slate-100 py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-6">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Verified Partner Network</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              External Partner Network
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Connect with verified external service providers across South Africa. 
              All partners are vetted for quality and reliability.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search partners by name, service, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-white border-slate-200 shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Partner Categories */}
      <section className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {partnerCategories.map((cat) => (
            <Card 
              key={cat.name}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setSelectedCategory(cat.name === "Home Services" ? "Services" : "All");
              }}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-lg ${cat.color}`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                  <p className="text-sm text-slate-500">{cat.count} partners</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Provider Type Filters */}
      <section className="container pb-4">
        <div className="flex flex-wrap gap-3">
          <ProviderFilterBadge
            type="all"
            count={providerCounts.all}
            active={selectedProviderType === "all"}
            onClick={() => setSelectedProviderType("all")}
          />
          <ProviderFilterBadge
            type="external"
            count={providerCounts.external}
            active={selectedProviderType === "external"}
            onClick={() => setSelectedProviderType("external")}
          />
        </div>
      </section>

      {/* Featured Partners */}
      <section className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Featured Partners</h2>
          <Link to="/supplier/6">
            <Button variant="ghost" className="gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredPartners.map((partner) => (
            <Card key={partner.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">{partner.name}</h3>
                    <p className="text-sm text-slate-500">{partner.description}</p>
                  </div>
                  <ProviderBadge 
                    providerType="external" 
                    verificationLevel={partner.verificationLevel}
                    showLabel={false}
                  />
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{partner.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{partner.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{partner.serviceCount} services</span>
                  </div>
                </div>
                
                <Link to={`/supplier/${partner.id}`}>
                  <Button className="w-full">View Profile</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* All Partner Services */}
      <section className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            All Partner Services
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({filteredServices.length} results)
            </span>
          </h2>
        </div>

        {/* Subcategory Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {subCategories.map((sub) => (
            <Button
              key={sub}
              variant={selectedSubCategory === sub ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubCategory(sub)}
              className="rounded-full"
            >
              {sub}
            </Button>
          ))}
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No services found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        )}
      </section>

      {/* Become a Partner CTA */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Become a Partner</h2>
            <p className="text-slate-300 mb-8">
              Join our network of verified service providers and reach more customers. 
              Get access to powerful tools and support to grow your business.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Verified badge</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Customer referrals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Business analytics</span>
              </div>
            </div>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="gap-2">
                Apply Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">About</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about">Our Story</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/help-center">Help Center</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">InstaGoods</h3>
              <p className="text-muted-foreground text-sm">
                Empowering local creators. Discover, shop, and support unique businesses near you.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground text-sm">
            © 2025 InstaGoods. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Partners;
