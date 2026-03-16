import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-xl font-semibold mb-3">{title}</h2>
    <div className="text-muted-foreground space-y-3 leading-relaxed">{children}</div>
  </section>
);

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />

    <main className="container py-10 flex-1">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          InstaGoods ("we", "us", or "our") is committed to protecting your personal information
          in compliance with the Protection of Personal Information Act 4 of 2013 (POPIA) and
          other applicable South African legislation. This policy explains what data we collect,
          why we collect it, and how we protect it.
        </p>

        <Section title="1. Information We Collect">
          <p>We collect information you provide directly, including:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Name, email address, and phone number when you register an account.</li>
            <li>Delivery address and location data when you place an order.</li>
            <li>Payment details processed securely through our payment provider — we do not store card numbers.</li>
            <li>Messages and communication sent through our platform.</li>
            <li>Business information provided by suppliers during registration.</li>
          </ul>
          <p>We also collect data automatically through your use of InstaGoods, such as device type, browser, IP address, and pages visited, for analytics and security purposes.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use your personal information to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Create and manage your account.</li>
            <li>Process and fulfil orders, and communicate order status.</li>
            <li>Connect customers with suppliers based on location.</li>
            <li>Improve our platform, products, and services.</li>
            <li>Send transactional emails and — with your consent — marketing communications.</li>
            <li>Detect fraud and ensure the security of our platform.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </Section>

        <Section title="3. Sharing Your Information">
          <p>We do not sell your personal information. We may share it with:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Suppliers</strong> — only the information necessary to fulfil your order (name, delivery address, contact details).</li>
            <li><strong>Service providers</strong> — including Supabase (database infrastructure), payment processors, and email delivery services — who are contractually bound to protect your data.</li>
            <li><strong>Law enforcement</strong> — when required by law or to protect the rights and safety of our users.</li>
          </ul>
        </Section>

        <Section title="4. Data Storage and Security">
          <p>Your data is stored on secure servers provided by Supabase, hosted within compliant cloud infrastructure. We apply industry-standard security measures including encryption in transit (TLS), access controls, and Row-Level Security (RLS) policies to restrict data access.</p>
          <p>While we take all reasonable precautions, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.</p>
        </Section>

        <Section title="5. Cookies">
          <p>We use essential cookies to maintain your session and authentication state. We may also use analytics cookies to understand how our platform is used. You can control cookie settings in your browser, though disabling essential cookies may prevent the platform from functioning correctly.</p>
        </Section>

        <Section title="6. Your Rights (POPIA)">
          <p>Under POPIA, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access the personal information we hold about you.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of your information (subject to legal retention requirements).</li>
            <li>Object to the processing of your information.</li>
            <li>Lodge a complaint with the Information Regulator of South Africa.</li>
          </ul>
          <p>To exercise any of these rights, contact us at <a href="mailto:privacy@instagoods.co.za" className="text-primary underline">privacy@instagoods.co.za</a>.</p>
        </Section>

        <Section title="7. Retention">
          <p>We retain your personal information for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account at any time.</p>
        </Section>

        <Section title="8. Children">
          <p>InstaGoods is not directed at children under 18. We do not knowingly collect personal information from minors. If you believe a child has provided us with personal data, please contact us immediately.</p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or a prominent notice on our platform. Continued use of InstaGoods after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="10. Contact Us">
          <p>
            For privacy-related enquiries, contact our Information Officer at{" "}
            <a href="mailto:privacy@instagoods.co.za" className="text-primary underline">privacy@instagoods.co.za</a>{" "}
            or write to us at InstaGoods, South Africa.
          </p>
        </Section>
      </div>
    </main>

    <Footer />
  </div>
);

export default PrivacyPolicy;
