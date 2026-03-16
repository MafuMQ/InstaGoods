import { Link } from "react-router-dom";
import { Twitter, Instagram, Facebook, Mail, MapPin, Phone } from "lucide-react";

const socialLinks = [
  {
    href: "https://twitter.com/instagoods",
    icon: Twitter,
    label: "Twitter",
  },
  {
    href: "https://instagram.com/instagoods",
    icon: Instagram,
    label: "Instagram",
  },
  {
    href: "https://facebook.com/instagoods",
    icon: Facebook,
    label: "Facebook",
  },
  {
    href: "mailto:hello@instagoods.co.za",
    icon: Mail,
    label: "Email",
  },
];

const footerLinks = {
  shop: [
    { to: "/", label: "Home" },
    { to: "/products", label: "All Products" },
    { to: "/categories", label: "Categories" },
  ],
  support: [
    { to: "/help-center", label: "Help Center" },
    { to: "/contact", label: "Contact Us" },
    { to: "/faq", label: "FAQ" },
  ],
  company: [
    { to: "/about", label: "Our Story" },
    { to: "/careers", label: "Careers" },
    { to: "/blog", label: "Blog" },
  ],
  legal: [
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Service" },
    { to: "/refund", label: "Refund Policy" },
  ],
};

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link 
        to={to} 
        className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-primary transition-colors duration-200 p-2 rounded-full hover:bg-primary/10"
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </a>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="font-bold text-xl">InstaGoods</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Empowering local businesses. Discover, shop, and support local businesses near you.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>South Africa</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:hello@instagoods.co.za" className="hover:text-primary transition-colors">
                  hello@instagoods.co.za
                </a>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <FooterLink key={link.to} to={link.to}>{link.label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <FooterLink key={link.to} to={link.to}>{link.label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* Company & Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 mb-6">
              {footerLinks.company.map((link) => (
                <FooterLink key={link.to} to={link.to}>{link.label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <FooterLink key={link.to} to={link.to}>{link.label}</FooterLink>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-1">Stay Updated</h3>
              <p className="text-muted-foreground text-sm">
                Subscribe to get special offers and updates
              </p>
            </div>
            <form className="flex w-full max-w-sm gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div> */}

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">© {currentYear} InstaGoods</span>
            <span className="hidden sm:inline">All rights reserved.</span>
          </div>
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <SocialIcon key={social.label} {...social} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
