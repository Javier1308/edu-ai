import Navbar from "@/components/edu/Navbar";
import Hero from "@/components/edu/Hero";
import HowItWorks from "@/components/edu/HowItWorks";
import Features from "@/components/edu/Features";
import CTA from "@/components/edu/CTA";
import Footer from "@/components/edu/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-warm-sand text-deep-forest">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
