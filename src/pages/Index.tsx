import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import ShiftSection from "@/components/landing/ShiftSection";
import AgenticFlowSection from "@/components/landing/AgenticFlowSection";
import TrustSection from "@/components/landing/TrustSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <ShiftSection />
        <AgenticFlowSection />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
