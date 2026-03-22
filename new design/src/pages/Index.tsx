import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ParticleBackground from "@/components/ParticleBackground";
import BentoGrid from "@/components/BentoGrid";
import AIWorkflow from "@/components/AIWorkflow";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <ParticleBackground />
      <Navbar />
      <HeroSection />
      <BentoGrid />
      <AIWorkflow />
      <Testimonials />
      <CTASection />
      <FooterSection />
    </div>
  );
};

export default Index;
