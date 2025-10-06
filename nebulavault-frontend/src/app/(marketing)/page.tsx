import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import FeatureCards from "@/components/marketing/FeatureCard";
import Showcase from "@/components/marketing/Showcase";
import Steps from "@/components/marketing/Steps";
import Pricing from "@/components/marketing/Pricing";
import FAQ from "@/components/marketing/FAQ";
import Footer from "@/components/marketing/Footer";

export const metadata = {
  title: "Nebula Vault — Your personal cloud, reimagined",
  description:
    "Secure, blazing-fast personal cloud with sharing, versioning, and a zero-trust gateway.",
};

export default function Page() {
  return (
    <>
      <Navbar />
      <main id="main" className="pt-16">
        <Hero />
        <FeatureCards />
        <Showcase />
        <Steps />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
