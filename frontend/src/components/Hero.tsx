import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Building, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageSlider from './ImageSlider';

const Hero = () => {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden bg-slate-950">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[center_top]" />
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] mix-blend-screen opacity-50" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20 relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col space-y-8"
        >
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 py-1.5 px-3 text-sm font-medium text-white/80 backdrop-blur-sm self-start">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Next-Gen Learning & Placement Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Empowering <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Futuristic
            </span> Learning
          </h1>

          <p className="max-w-xl text-lg md:text-xl text-slate-300 leading-relaxed">
            AI-driven courses, verifiable credentials, and seamless placement readiness bridging the gap between education and enterprise.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button size="lg" className="h-14 px-8 rounded-full text-base font-semibold shadow-lg shadow-primary/25 group">
              For Students
              <GraduationCap className="ml-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-base font-semibold border-white/20 text-white hover:bg-white/10 group backdrop-blur-sm">
              For Organizations
              <Building className="ml-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 pt-8 mt-4 border-t border-white/10">
            {[
              { label: "Active Learners", value: "50k+" },
              { label: "Organizations", value: "250+" },
              { label: "Placement Rate", value: "94%" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Content / Image Slider in a sleek wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="absolute -inset-1 bg-gradient-to-tr from-primary/50 to-blue-500/50 rounded-[2.5rem] blur-2xl opacity-50"></div>
          <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-sm shadow-2xl p-2 aspect-[4/3]">
            <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
              <ImageSlider />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10 pointer-events-none"></div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
