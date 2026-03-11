import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, Activity, BarChart3, Workflow, Shield, Video } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Diagnostics Engine",
    description: "Advanced neural networks analyze patient data to provide real-time diagnostic suggestions with 97% accuracy.",
    span: "md:col-span-2",
  },
  {
    icon: Activity,
    title: "Smart Patient Monitoring",
    description: "Continuous vital sign tracking with anomaly detection and automated alert systems.",
    span: "",
  },
  {
    icon: BarChart3,
    title: "Predictive Health Analytics",
    description: "Forecast patient outcomes and resource needs using machine learning models trained on millions of records.",
    span: "",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    description: "Streamline hospital operations from admissions to discharge with intelligent process automation.",
    span: "md:col-span-2",
  },
  {
    icon: Shield,
    title: "Secure Medical Data Vault",
    description: "End-to-end encrypted storage with zero-knowledge architecture ensuring complete data sovereignty.",
    span: "",
  },
  {
    icon: Video,
    title: "Telehealth Integration",
    description: "Seamless virtual consultations with AI-assisted diagnosis and real-time collaboration tools.",
    span: "",
  },
];

const TiltCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    setTilt({ x: y, y: x });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.2s ease-out",
      }}
      className={`glass-card p-8 group hover:glow-cyan cursor-pointer ${feature.span}`}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
        <feature.icon className="w-6 h-6 text-accent" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
    </motion.div>
  );
};

const BentoGrid = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="features" ref={ref} className="relative py-32 px-6">
      <div className="section-glow-divider h-32 -mt-32" />
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">Capabilities</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-4">
            Intelligent Tools for <span className="text-gradient-cyan">Modern Healthcare</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <TiltCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
