import { Link } from "react-router-dom";
import Header from "@/components/customer/Header";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container text-center">
            <h1 className="text-4xl font-bold text-background mb-4">
              About InstaGoods
            </h1>
            <p className="text-xl text-background/90 max-w-2xl mx-auto">
              Connecting artisans with people who appreciate handcrafted quality
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg">
            <h2 className="text-2xl font-bold mb-6">Our Story</h2>
            <p className="mb-6">
              InstaGoods was founded with a simple mission: to create a platform where independent artisans 
              can showcase their unique handcrafted products to a global audience. We believe in the value 
              of handmade items and the stories behind them.
            </p>
            
            <h2 className="text-2xl font-bold mb-6">What We Offer</h2>
            <ul className="mb-6 space-y-2">
              <li>A marketplace for unique handcrafted products</li>
              <li>Services from skilled professionals</li>
              <li>Locally sourced groceries</li>
              <li>Freelance opportunities for creatives</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-6">Our Values</h2>
            <p className="mb-6">
              We are committed to supporting small businesses and independent creators. Every purchase made 
              through InstaGoods directly supports the artisans who put their heart and soul into creating 
              something special just for you.
            </p>
            
            <div className="text-center mt-12">
              <Link to="/products" className="inline-block">
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md font-medium">
                  Discover Our Products
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;