import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CTASection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="section-glow-divider h-32 -mt-32" />
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.8 }}
          className="glass-card p-12 md:p-16 text-center glow-cyan relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
              Transform Healthcare Operations with{" "}
              <span className="text-gradient-cyan">Intelligent AI Infrastructure</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
              Join 500+ healthcare institutions already using MediCare Pro to deliver better patient outcomes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="btn-glow px-8 py-4 rounded-xl font-display font-semibold text-accent-foreground text-lg">
                Get Started Free
              </button>
              <button className="glass-card px-8 py-4 rounded-xl font-display font-semibold text-foreground hover:border-accent/40 transition-colors">
                Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
