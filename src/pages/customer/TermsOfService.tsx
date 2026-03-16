import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-xl font-semibold mb-3">{title}</h2>
    <div className="text-muted-foreground space-y-3 leading-relaxed">{children}</div>
  </section>
);

const TermsOfService = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />

    <main className="container py-10 flex-1">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          Welcome to InstaGoods. By accessing or using our platform, you agree to be bound by
          these Terms of Service. Please read them carefully. If you do not agree, you may not
          use InstaGoods.
        </p>

        <Section title="1. About InstaGoods">
          <p>InstaGoods is an online marketplace connecting customers with local suppliers of goods and services in South Africa. We act as a platform provider and are not a party to transactions between customers and suppliers.</p>
        </Section>

        <Section title="2. Eligibility">
          <p>You must be at least 18 years old to create an account and use InstaGoods. By using our platform, you confirm that you meet this requirement and that the information you provide is accurate and complete.</p>
        </Section>

        <Section title="3. Accounts">
          <ul className="list-disc pl-5 space-y-1">
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>You must notify us immediately of any unauthorised use of your account.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
          </ul>
        </Section>

        <Section title="4. Supplier Obligations">
          <p>Suppliers using InstaGoods agree to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide accurate product descriptions, prices, and availability.</li>
            <li>Fulfil orders within the timeframes communicated to customers.</li>
            <li>Comply with all applicable South African laws, including consumer protection and food safety regulations.</li>
            <li>Maintain appropriate insurance and licences for their business activities.</li>
            <li>Not list counterfeit, illegal, or prohibited items.</li>
          </ul>
        </Section>

        <Section title="5. Customer Obligations">
          <p>Customers agree to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide accurate delivery and contact information.</li>
            <li>Pay for orders at the time of purchase.</li>
            <li>Use the platform lawfully and not attempt to defraud suppliers.</li>
            <li>Not abuse the review or messaging systems.</li>
          </ul>
        </Section>

        <Section title="6. Orders and Payments">
          <p>When you place an order, you enter into a contract directly with the supplier. InstaGoods facilitates the transaction but is not responsible for the performance of the contract.</p>
          <p>Payments are processed securely through our payment provider. Prices are displayed in South African Rand (ZAR) including VAT where applicable.</p>
        </Section>

        <Section title="7. Delivery">
          <p>Delivery terms, fees, and timelines are set by each individual supplier. InstaGoods is not responsible for late or failed deliveries. Please review the supplier's delivery information before placing an order.</p>
        </Section>

        <Section title="8. Prohibited Conduct">
          <p>You may not use InstaGoods to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>List or purchase illegal goods or services.</li>
            <li>Harass, threaten, or harm other users.</li>
            <li>Engage in fraudulent activity.</li>
            <li>Scrape, copy, or reproduce platform content without permission.</li>
            <li>Introduce viruses, malware, or other harmful code.</li>
            <li>Circumvent our security measures or access other users' accounts.</li>
          </ul>
        </Section>

        <Section title="9. Intellectual Property">
          <p>All content, trademarks, and software on InstaGoods are owned by or licensed to InstaGoods. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
          <p>By uploading content (product images, descriptions, etc.) to the platform, you grant InstaGoods a non-exclusive, royalty-free licence to use, display, and reproduce that content for platform purposes.</p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>To the maximum extent permitted by South African law, InstaGoods is not liable for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Indirect, incidental, or consequential damages.</li>
            <li>Loss of profits, data, or business opportunity.</li>
            <li>Actions or omissions of suppliers or third parties.</li>
            <li>Service interruptions or technical errors.</li>
          </ul>
          <p>Our total liability to you for any claim shall not exceed the amount paid by you for the relevant transaction.</p>
        </Section>

        <Section title="11. Dispute Resolution">
          <p>We encourage customers and suppliers to resolve disputes directly. If resolution is not possible, you may contact InstaGoods support at <a href="mailto:support@instagoods.co.za" className="text-primary underline">support@instagoods.co.za</a>.</p>
          <p>These Terms are governed by the laws of the Republic of South Africa. Any disputes shall be subject to the jurisdiction of South African courts.</p>
        </Section>

        <Section title="12. Changes to These Terms">
          <p>We may update these Terms from time to time. We will notify you of material changes by email or a notice on the platform. Continued use of InstaGoods after changes take effect constitutes acceptance of the revised Terms.</p>
        </Section>

        <Section title="13. Contact Us">
          <p>
            For questions about these Terms, contact us at{" "}
            <a href="mailto:legal@instagoods.co.za" className="text-primary underline">legal@instagoods.co.za</a>.
          </p>
        </Section>
      </div>
    </main>

    <Footer />
  </div>
);

export default TermsOfService;
