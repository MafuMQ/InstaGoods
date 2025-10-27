import Header from "@/components/customer/Header";

const HelpCenter = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <section className="container py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4 text-primary">Help Center</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Find answers to common questions, get support, and learn how to make the most of InstaGoods.
        </p>
        <div className="text-left space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-2">How do I place an order?</h2>
            <p>Browse products or services, add items to your cart, and follow the checkout process. You’ll receive confirmation and updates by email.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">How do I contact a seller?</h2>
            <p>Visit the seller’s shop page and use the contact or message button to reach out directly.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">What payment methods are accepted?</h2>
            <p>We accept major credit/debit cards and secure online payments. All transactions are encrypted for your safety.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Need more help?</h2>
            <p>Email us at <a href="mailto:support@instagoods.com" className="text-primary underline">support@instagoods.com</a> or use our <a href="/contact" className="text-primary underline">Contact Us</a> page.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default HelpCenter;
