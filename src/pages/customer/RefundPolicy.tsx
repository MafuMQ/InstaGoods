import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { Link } from "react-router-dom";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-xl font-semibold mb-3">{title}</h2>
    <div className="text-muted-foreground space-y-3 leading-relaxed">{children}</div>
  </section>
);

const RefundPolicy = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />

    <main className="container py-10 flex-1">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          At InstaGoods, we want you to be completely satisfied with every purchase. This policy
          outlines your rights and the process for returns and refunds in accordance with the
          Consumer Protection Act 68 of 2008 (CPA) of South Africa.
        </p>

        <Section title="1. Your Rights Under the CPA">
          <p>As a consumer in South Africa, you are entitled to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Return goods that are defective, unsafe, or not fit for their intended purpose within 6 months of purchase.</li>
            <li>A full refund, replacement, or repair at your choice when goods fail to meet the above standards.</li>
            <li>Return unsolicited goods at the supplier's cost.</li>
          </ul>
        </Section>

        <Section title="2. Eligibility for Returns">
          <p>A return may be requested if:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The item received is significantly different from its description or photos on the listing.</li>
            <li>The item arrived damaged or defective.</li>
            <li>The wrong item was delivered.</li>
            <li>The item did not arrive within the agreed delivery timeframe.</li>
          </ul>
          <p>Returns for change-of-mind (items that are as described and undamaged) are handled at the discretion of the individual supplier. Please check the supplier's own return policy on their shop page.</p>
        </Section>

        <Section title="3. Non-Returnable Items">
          <p>The following items generally cannot be returned unless defective:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Perishable food items (fresh produce, dairy, meat) that have been delivered in proper condition.</li>
            <li>Personalised or custom-made products.</li>
            <li>Downloadable digital services once delivered.</li>
            <li>Hygiene products that have been opened (e.g. cosmetics, underwear).</li>
          </ul>
        </Section>

        <Section title="4. How to Request a Refund">
          <p>To initiate a return or refund:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Contact the supplier directly through your order page within <strong>48 hours</strong> of receiving the item.</li>
            <li>Include your order number, a description of the issue, and photos where applicable.</li>
            <li>If the supplier does not respond within 3 business days, escalate to InstaGoods support at <a href="mailto:support@instagoods.co.za" className="text-primary underline">support@instagoods.co.za</a> with your order details.</li>
          </ol>
        </Section>

        <Section title="5. Refund Processing">
          <p>Once a refund is approved:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Refunds are processed back to the original payment method.</li>
            <li>Processing typically takes <strong>3–7 business days</strong> depending on your bank.</li>
            <li>Delivery fees are non-refundable unless the entire order was incorrect or undelivered.</li>
          </ul>
        </Section>

        <Section title="6. Cancelled Orders">
          <p>Orders may be cancelled before a supplier has confirmed fulfilment. Once an order is confirmed or dispatched, cancellation is at the supplier's discretion.</p>
          <p>If a supplier cancels your order, you will receive a full refund including any delivery fee paid.</p>
        </Section>

        <Section title="7. Disputes">
          <p>If you are unable to resolve a dispute with a supplier, InstaGoods will review the case and may facilitate a resolution. We may request evidence from both parties.</p>
          <p>InstaGoods reserves the right to issue a refund directly to the customer and recover the amount from the supplier in cases of clear supplier fault.</p>
        </Section>

        <Section title="8. Contact Us">
          <p>
            For refund-related enquiries, email{" "}
            <a href="mailto:support@instagoods.co.za" className="text-primary underline">support@instagoods.co.za</a>{" "}
            or visit our <Link to="/contact" className="text-primary underline">Contact Us</Link> page.
          </p>
        </Section>
      </div>
    </main>

    <Footer />
  </div>
);

export default RefundPolicy;
