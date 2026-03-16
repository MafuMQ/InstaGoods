import { useState } from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const faqSections: { title: string; items: FAQItem[] }[] = [
  {
    title: "Orders & Purchasing",
    items: [
      {
        question: "How do I place an order?",
        answer:
          "Browse products on the homepage or use the search bar to find what you need. Add items to your cart, then go to your cart and proceed to checkout. You'll receive a confirmation once your order is placed.",
      },
      {
        question: "Can I order from multiple suppliers at once?",
        answer:
          "Yes — your cart can hold items from different suppliers. Each supplier will fulfil their portion of your order separately, and delivery fees may vary per supplier.",
      },
      {
        question: "How do I track my order?",
        answer: (
          <>
            Log in and visit{" "}
            <Link to="/customer/orders" className="text-primary underline">
              My Orders
            </Link>{" "}
            to see real-time status updates for all your orders. You can also contact the supplier directly through the messaging feature.
          </>
        ),
      },
      {
        question: "Can I cancel or change an order?",
        answer:
          "You can request a cancellation before the supplier confirms fulfilment. Once an order is confirmed or dispatched it cannot be changed. Please contact the supplier as soon as possible if you need to cancel.",
      },
    ],
  },
  {
    title: "Delivery",
    items: [
      {
        question: "How does delivery work?",
        answer:
          "Each supplier sets their own delivery area, fee, and timeframe. Delivery details are shown on every product listing. Some suppliers also offer collection-only options.",
      },
      {
        question: "What if my order doesn't arrive?",
        answer: (
          <>
            First contact the supplier directly through your order page. If the issue is not resolved within 3 business days, email us at{" "}
            <a href="mailto:support@instagoods.co.za" className="text-primary underline">
              support@instagoods.co.za
            </a>{" "}
            and we'll help mediate and, where applicable, issue a refund.
          </>
        ),
      },
      {
        question: "Can I collect my order instead of having it delivered?",
        answer:
          "Yes, if the supplier offers collection. Look for the \u2018Collection available\u2019 label on product listings and confirm the collection address with the supplier via the messaging feature.",
      },
    ],
  },
  {
    title: "Payments & Refunds",
    items: [
      {
        question: "What payment methods are accepted?",
        answer:
          "We accept major credit and debit cards (Visa, Mastercard) processed securely through our payment provider. Card details are never stored on our servers.",
      },
      {
        question: "Is my payment information safe?",
        answer:
          "Yes. All transactions are encrypted with TLS and processed by a PCI-DSS compliant payment provider. InstaGoods never stores your card number.",
      },
      {
        question: "How do I get a refund?",
        answer: (
          <>
            If your item arrived damaged, incorrect, or was not delivered, contact the supplier within 48 hours of the expected delivery. If unresolved, escalate to{" "}
            <a href="mailto:support@instagoods.co.za" className="text-primary underline">
              support@instagoods.co.za
            </a>
            . See our{" "}
            <Link to="/refund" className="text-primary underline">
              Refund Policy
            </Link>{" "}
            for full details.
          </>
        ),
      },
      {
        question: "How long do refunds take?",
        answer:
          "Once approved, refunds are returned to your original payment method within 3–7 business days, depending on your bank.",
      },
    ],
  },
  {
    title: "Accounts & Profiles",
    items: [
      {
        question: "Do I need an account to shop?",
        answer:
          "You can browse InstaGoods without an account, but you'll need to sign in to place orders, save items to your wishlist, and message suppliers.",
      },
      {
        question: "How do I reset my password?",
        answer: (
          <>
            On the{" "}
            <Link to="/customer-auth" className="text-primary underline">
              sign-in page
            </Link>
            , click "Forgot password?" and enter your email. You'll receive a reset link within a few minutes.
          </>
        ),
      },
      {
        question: "How do I delete my account?",
        answer: (
          <>
            Email{" "}
            <a href="mailto:privacy@instagoods.co.za" className="text-primary underline">
              privacy@instagoods.co.za
            </a>{" "}
            with your account email and request. We'll process your deletion within 5 business days in accordance with our{" "}
            <Link to="/privacy" className="text-primary underline">
              Privacy Policy
            </Link>
            .
          </>
        ),
      },
    ],
  },
  {
    title: "Selling on InstaGoods",
    items: [
      {
        question: "How do I become a supplier?",
        answer: (
          <>
            Sign up via the{" "}
            <Link to="/auth" className="text-primary underline">
              Supplier Portal
            </Link>
            . Once registered, complete your business profile and start listing products immediately.
          </>
        ),
      },
      {
        question: "Is there a fee to sell on InstaGoods?",
        answer:
          "InstaGoods is currently free to join for suppliers. We may introduce commission-based pricing in future — existing suppliers will be given advance notice.",
      },
      {
        question: "How do I get paid for my sales?",
        answer:
          "Payments are collected at checkout and settled to your registered bank account. Payment schedules and supplier payout details are managed through the Supplier Dashboard.",
      },
      {
        question: "What products can I list?",
        answer: (
          <>
            Suppliers can list physical goods, groceries, services, and freelance offerings. All listings must comply with South African law. Prohibited items include counterfeit goods, illegal substances, and anything that violates our{" "}
            <Link to="/terms" className="text-primary underline">
              Terms of Service
            </Link>
            .
          </>
        ),
      },
    ],
  },
];

const FAQAccordionItem = ({ question, answer }: FAQItem) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b last:border-b-0">
      <button
        className="w-full flex items-center justify-between py-4 px-4 text-left gap-4 hover:text-primary transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="font-medium">{question}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="pb-4 px-4 text-muted-foreground text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQ = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />

    <main className="container py-10 flex-1">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-10">
          Can't find what you're looking for?{" "}
          <Link to="/contact" className="text-primary underline">
            Contact us
          </Link>{" "}
          and we'll get back to you as soon as possible.
        </p>

        <div className="space-y-10">
          {faqSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold mb-2 text-primary">{section.title}</h2>
              <div className="rounded-xl border divide-y overflow-hidden">
                {section.items.map((item, i) => (
                  <div key={item.question} className={i % 2 === 0 ? "bg-background" : "bg-muted/40"}>
                    <FAQAccordionItem {...item} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>

    <Footer />
  </div>
);

export default FAQ;
