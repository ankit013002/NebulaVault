import Navbar from "./_components/Navbar";
import Hero from "./_components/Hero";
import BentoFeatures from "./_components/BentoFeatures";
import FeatureCards from "./_components/FeatureCard";
import TrustSection from "./_components/TrustSection";
import Showcase from "./_components/Showcase";
import Steps from "./_components/Steps";
import Pricing from "./_components/Pricing";
import FAQ from "./_components/FAQ";
import CTASection from "./_components/CTASection";
import Footer from "./_components/Footer";

export const metadata = {
  title: "NebulaVault — Your personal cloud, reimagined",
  description:
    "Secure, blazing-fast personal cloud with sharing, versioning, AI-powered search, and a zero-trust gateway.",
};

export default function Page() {
  return (
    <>
      <Navbar />
      <main id="main" className="pt-16">
        {/* Hero */}
        <Hero />

        {/* Features — bento grid "Engineered for Permanence" */}
        {/* id="features" is set inside BentoFeatures */}
        <BentoFeatures />

        {/* Features — 6-card detail grid */}
        <FeatureCards />

        {/* Security — compliance & trust section */}
        {/* id="security" is set inside TrustSection */}
        <TrustSection />

        {/* Showcase — live file-table preview */}
        <Showcase />

        {/* Steps — how it works */}
        <Steps />

        {/* Pricing — monthly / yearly */}
        {/* id="pricing" is set inside Pricing */}
        <Pricing />

        {/* Support / FAQ */}
        {/* id="faq" is set inside FAQ */}
        <FAQ />

        {/* Final CTA */}
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
