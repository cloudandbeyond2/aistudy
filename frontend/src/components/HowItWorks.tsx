import React from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick, Lightbulb, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    title: "Define Your Goal",
    description: "Start by entering your topic, subject, or learning objective. Our AI is ready to transform your vision into a structured course.",
    icon: <Lightbulb className="h-10 w-10 text-primary" />,
    color: "from-blue-500/20 to-indigo-500/20",
    number: "01"
  },
  {
    title: "AI Generation",
    description: "Choose your preferred format—theory, images, or video. Watch as the AI crafts comprehensive lessons, quizzes, and assessments.",
    icon: <MousePointerClick className="h-10 w-10 text-primary" />,
    color: "from-purple-500/20 to-pink-500/20",
    number: "02"
  },
  {
    title: "Start Learning",
    description: "Access your personalized course instantly. Use the AI Teacher Chat for guidance and track your progress through interactive elements.",
    icon: <GraduationCap className="h-10 w-10 text-primary" />,
    color: "from-green-500/20 to-emerald-500/20",
    number: "03"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Process</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">How It Works</h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group"
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-primary/30 to-transparent -translate-x-12 z-0" />
              )}

              <div className="flex flex-col items-center text-center">
                <div className={cn(
                  "h-32 w-32 rounded-3xl bg-gradient-to-br flex items-center justify-center mb-8 relative transition-transform duration-500 group-hover:scale-110 shadow-lg shadow-primary/5",
                  step.color
                )}>
                  <div className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-lg shadow-lg">
                    {step.number}
                  </div>
                  <div className="h-20 w-20 rounded-2xl bg-white flex items-center justify-center shadow-inner">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed max-w-sm">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-full h-1/2 bg-white skew-y-3 -translate-y-1/2 -z-0" />
    </section>
  );
};

export default HowItWorks;
