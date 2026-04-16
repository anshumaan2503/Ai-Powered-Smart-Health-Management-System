import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const scrambleChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const headline = "The Future of Intelligent Healthcare Infrastructure";

const useTextScramble = (text: string, duration = 2000) => {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    const length = text.length;
    const interval = duration / (length * 3);
    let iteration = 0;

    const timer = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (i < iteration / 3) return char;
            if (char === " ") return " ";
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          })
          .join("")
      );
      iteration++;
      if (iteration > length * 3) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [text, duration]);

  return display;
};

const FloatingAsset = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!ref.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setOffset({ x, y });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, x: offset.x, y: offset.y }}
      transition={{ duration: 0.8, delay, type: "spring", stiffness: 50 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const HeroSection = () => {
  const scrambledText = useTextScramble(headline, 2500);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      {/* Floating medical assets */}
      <FloatingAsset className="absolute top-32 left-[10%] hidden lg:block" delay={0.5}>
        <div className="w-16 h-16 border-2 border-accent/30 rounded-xl rotate-45 animate-float flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-8 h-8 -rotate-45 text-accent/60" fill="currentColor">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
          </svg>
        </div>
      </FloatingAsset>

      <FloatingAsset className="absolute top-48 right-[12%] hidden lg:block" delay={0.8}>
        <div className="w-20 h-20 animate-float-slow">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="30" stroke="hsl(185 100% 50% / 0.3)" strokeWidth="1" fill="none" />
            <circle cx="50" cy="50" r="20" stroke="hsl(217 100% 56% / 0.3)" strokeWidth="1" fill="none" />
            <circle cx="50" cy="50" r="10" stroke="hsl(185 100% 50% / 0.5)" strokeWidth="1.5" fill="hsl(185 100% 50% / 0.1)" />
            <path d="M50 15 Q65 35 50 50 Q35 65 50 85" stroke="hsl(185 100% 50% / 0.4)" strokeWidth="1" fill="none" />
            <path d="M50 15 Q35 35 50 50 Q65 65 50 85" stroke="hsl(217 100% 56% / 0.4)" strokeWidth="1" fill="none" />
          </svg>
        </div>
      </FloatingAsset>

      <FloatingAsset className="absolute bottom-32 left-[15%] hidden lg:block" delay={1}>
        <div className="w-14 h-14 animate-float-slower">
          <svg viewBox="0 0 60 60" className="w-full h-full">
            <polygon points="30,5 55,20 55,40 30,55 5,40 5,20" stroke="hsl(217 100% 56% / 0.3)" strokeWidth="1" fill="hsl(217 100% 56% / 0.05)" />
            <circle cx="30" cy="30" r="8" stroke="hsl(185 100% 50% / 0.5)" strokeWidth="1" fill="hsl(185 100% 50% / 0.1)" />
          </svg>
        </div>
      </FloatingAsset>

      <FloatingAsset className="absolute bottom-40 right-[8%] hidden lg:block" delay={1.2}>
        <div className="w-12 h-12 animate-float">
          <svg viewBox="0 0 48 48" className="w-full h-full text-accent/40">
            <path d="M24 4L28 16H40L30 24L34 36L24 28L14 36L18 24L8 16H20L24 4Z" fill="currentColor" />
          </svg>
        </div>
      </FloatingAsset>

      <motion.div style={{ y, opacity }} className="relative z-10 text-center max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm text-muted-foreground">AI-Powered Healthcare Platform</span>
        </motion.div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
          <span className="text-gradient-cyan">{scrambledText}</span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          A unified AI-powered ecosystem for hospitals to manage patients, automate workflows, 
          and generate predictive healthcare insights in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button className="btn-glow px-8 py-4 rounded-xl font-display font-semibold text-accent-foreground text-lg">
            Get Started Free
          </button>
          <button className="glass-card px-8 py-4 rounded-xl font-display font-semibold text-foreground hover:border-accent/40 transition-colors">
            Watch Demo
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="mt-16 flex items-center justify-center gap-8 text-muted-foreground text-sm"
        >
          <span>🏥 500+ Hospitals</span>
          <span className="w-px h-4 bg-border" />
          <span>⚡ 99.9% Uptime</span>
          <span className="w-px h-4 bg-border" />
          <span>🔒 HIPAA Compliant</span>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
