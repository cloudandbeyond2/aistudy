import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 md:py-32 bg-slate-900 relative overflow-hidden">
      {/* Abstract Background Design */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full filter blur-[120px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500 rounded-full filter blur-[120px] -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 md:p-20 rounded-[40px] shadow-2xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-bold mb-8 border border-primary/20">
              <Sparkles className="h-4 w-4" />
              <span>Join 50,000+ Learners Today</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
              Ready to Master Any Subject <br className="hidden md:block" /> with the Power of AI?
            </h2>

            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Start generating high-quality courses instantly. No credit card required to get started.
              Transform your learning journey today.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button
                onClick={() => navigate("/signup")}
                size="lg"
                className="bg-primary hover:bg-white hover:text-primary text-white font-black text-xl h-16 px-12 rounded-full shadow-2xl shadow-primary/40 transition-all active:scale-95"
              >
                Get Started for Free
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
