import { Link } from "react-router-dom";
import Header from "@/components/customer/Header";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[340px] flex items-center justify-center overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/80" />
        <div className="relative z-10 text-center w-full">
          <h1 className="text-5xl font-extrabold text-background mb-4 drop-shadow-lg">Empowering Local Commerce</h1>
          <p className="text-2xl text-background/90 max-w-2xl mx-auto font-medium drop-shadow">
            Discover, shop, and support unique businesses and creators near you.
          </p>
        </div>
      </section>

      {/* Mission & How It Works */}
      <section className="container py-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-primary">Our Mission</h2>
            <p className="mb-6 text-lg text-muted-foreground">
              InstaGoods is dedicated to connecting local creators, small businesses, and service providers with people who value quality, authenticity, and community. We believe every purchase is a chance to make a difference—supporting dreams, families, and neighborhoods.
            </p>
            <h2 className="text-2xl font-semibold mb-3">How It Works</h2>
            <ul className="list-disc pl-5 space-y-2 text-base">
              <li>Browse a curated marketplace of products, services, and groceries from local suppliers.</li>
              <li>Connect directly with sellers and service providers in your area.</li>
              <li>Enjoy secure, seamless shopping and fast local delivery or collection.</li>
            </ul>
          </div>
          <div className="flex flex-col items-center justify-center">
            <img src="/assets/hero-banner.jpg" alt="Local marketplace" className="rounded-xl shadow-lg w-full max-w-md mb-6" />
            <div className="text-center">
              <span className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold text-lg">Shop Local. Make an Impact.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose InstaGoods */}
      <section className="container py-8">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose InstaGoods?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-card rounded-lg shadow">
            <div className="mb-4 text-primary">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/><path d="M12 6v6l4.25 2.52" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Support Local</h3>
            <p className="text-muted-foreground">Every purchase helps small businesses and independent creators thrive in your community.</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow">
            <div className="mb-4 text-primary">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Curated Quality</h3>
            <p className="text-muted-foreground">We handpick the best products, services, and groceries so you always get something special.</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow">
            <div className="mb-4 text-primary">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Trusted & Easy</h3>
            <p className="text-muted-foreground">Shop securely, connect easily, and enjoy fast local delivery or collection—hassle free.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to explore your local marketplace?</h2>
        <Link to="/" className="inline-block">
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-md font-semibold text-lg shadow">
            Start Shopping
          </button>
        </Link>
      </section>
    </div>
  );
};

export default About;