import React from "react";
import { motion } from "framer-motion";
import { Building, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageSlider from "./ImageSlider";

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-slate-950">

      {/* Background */}
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="absolute top-0 right-0 w-[600px] md:w-[800px] h-[400px] md:h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-0 left-0 w-[400px] md:w-[600px] h-[350px] md:h-[500px] bg-blue-600/20 rounded-full blur-[100px] opacity-50" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 relative z-10 w-full grid lg:grid-cols-2 gap-10 items-center">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col space-y-6"
        >

          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 py-1.5 px-3 text-xs md:text-sm text-white/80 backdrop-blur-sm self-start">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Next-Gen Learning & Placement Platform
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-tight">
            Empowering <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Futuristic
            </span>{" "}
            Learning
          </h1>

          {/* Description */}
          <p className="max-w-xl text-base md:text-lg text-slate-300 leading-relaxed">
            AI-driven courses, verifiable credentials, and seamless placement
            readiness bridging the gap between education and enterprise.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">

            <Button
              size="lg"
              className="h-12 md:h-14 px-6 md:px-8 rounded-full text-sm md:text-base font-semibold shadow-lg shadow-primary/25 bg-primary text-white group"
            >
              For Students
              <GraduationCap className="ml-2 h-5 w-5 group-hover:-translate-y-1 transition" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-12 md:h-14 px-6 md:px-8 rounded-full text-sm md:text-base font-semibold border-gray-300 text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 group"
            >
              For Organizations
              <Building className="ml-2 h-5 w-5 group-hover:-translate-y-1 transition" />
            </Button>

          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-md">

            {[
              { label: "Active Learners", value: "50k+" },
              { label: "Organizations", value: "250+" },
              { label: "Placement Rate", value: "94%" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-xl md:text-2xl font-bold text-white">
                  {stat.value}
                </span>
                <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}

          </div>
        </motion.div>

        {/* RIGHT SIDE IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative w-full"
        >

          <div className="absolute -inset-1 bg-gradient-to-tr from-primary/50 to-blue-500/50 rounded-3xl blur-2xl opacity-40"></div>

          <div className="relative w-full h-[280px] sm:h-[340px] md:h-[420px] lg:h-[450px] rounded-3xl overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-sm shadow-2xl p-2">

            <div className="w-full h-full rounded-2xl overflow-hidden relative">

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