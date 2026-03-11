import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Chief Medical Officer, Metro Health",
    quote: "MediCare Pro reduced our diagnostic turnaround by 40%. The AI insights are remarkably accurate and actionable.",
  },
  {
    name: "James Rodriguez",
    role: "Hospital Administrator, Valley Medical",
    quote: "The workflow automation alone saved us hundreds of staff hours per month. A complete game-changer for hospital operations.",
  },
  {
    name: "Dr. Aisha Patel",
    role: "Head of Cardiology, Unity Health",
    quote: "Predictive analytics helped us identify at-risk patients 72 hours earlier than traditional methods. Lives are being saved.",
  },
];

const Testimonials = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="section-glow-divider h-32 -mt-32" />
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">Trusted By Leaders</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-4">
            What Healthcare <span className="text-gradient-cyan">Professionals Say</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="glass-card p-8 hover:glow-blue transition-shadow duration-500"
              style={{ animationDelay: `${i * 2}s` }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-foreground/90 mb-6 leading-relaxed italic">"{t.quote}"</p>
              <div>
                <p className="font-display font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
