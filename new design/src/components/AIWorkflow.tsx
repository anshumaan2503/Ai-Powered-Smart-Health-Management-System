import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  { label: "Patient Data Intake", description: "Secure data collection from multiple sources" },
  { label: "AI Analysis", description: "Neural networks process clinical data" },
  { label: "Predictive Modeling", description: "ML models forecast outcomes" },
  { label: "Clinical Insights", description: "Actionable recommendations delivered" },
];

const AIWorkflow = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="ai-insights" ref={ref} className="relative py-32 px-6">
      <div className="section-glow-divider h-32 -mt-32" />
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20"
        >
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">How It Works</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-4">
            AI-Driven <span className="text-gradient-cyan">Data Pipeline</span>
          </h2>
        </motion.div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="relative flex flex-col items-center text-center z-10"
            >
              <div className="w-20 h-20 rounded-full glass-card flex items-center justify-center mb-4 glow-cyan animate-pulse-glow" style={{ animationDelay: `${i * 0.5}s` }}>
                <span className="font-display text-2xl font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">{step.label}</h3>
              <p className="text-sm text-muted-foreground max-w-[180px]">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIWorkflow;
