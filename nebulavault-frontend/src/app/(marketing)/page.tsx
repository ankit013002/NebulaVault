import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import BentoFeatures from "@/components/marketing/BentoFeatures";
import FeatureCards from "@/components/marketing/FeatureCard";
import TrustSection from "@/components/marketing/TrustSection";
import Showcase from "@/components/marketing/Showcase";
import Steps from "@/components/marketing/Steps";
import Pricing from "@/components/marketing/Pricing";
import FAQ from "@/components/marketing/FAQ";
import CTASection from "@/components/marketing/CTASection";
import Footer from "@/components/marketing/Footer";

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
