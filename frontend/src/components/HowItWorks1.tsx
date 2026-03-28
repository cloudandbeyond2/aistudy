/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, ListChecks, BookOpen, Award, ChevronRight, ChevronLeft, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STEP_ACCENTS = [
  {
    gradient: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
    glow: "rgba(168,85,247,0.4)",
    border: "rgba(168,85,247,0.35)",
    text: "#d8b4fe",
    badge: "rgba(168,85,247,0.2)",
    badgeText: "#d8b4fe",
    bar: "linear-gradient(90deg, #a855f7, #7c3aed)",
  },
  {
    gradient: "linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)",
    glow: "rgba(34,211,238,0.35)",
    border: "rgba(34,211,238,0.3)",
    text: "#67e8f9",
    badge: "rgba(34,211,238,0.15)",
    badgeText: "#67e8f9",
    bar: "linear-gradient(90deg, #22d3ee, #0891b2)",
  },
  {
    gradient: "linear-gradient(135deg, #f472b6 0%, #db2777 100%)",
    glow: "rgba(244,114,182,0.35)",
    border: "rgba(244,114,182,0.3)",
    text: "#f9a8d4",
    badge: "rgba(244,114,182,0.15)",
    badgeText: "#f9a8d4",
    bar: "linear-gradient(90deg, #f472b6, #db2777)",
  },
  {
    gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    glow: "rgba(251,191,36,0.35)",
    border: "rgba(251,191,36,0.3)",
    text: "#fde68a",
    badge: "rgba(251,191,36,0.15)",
    badgeText: "#fde68a",
    bar: "linear-gradient(90deg, #fbbf24, #f59e0b)",
  },
];

const steps = [
  {
    id: 1,
    emoji: "🔍",
    icon: <Search className="h-6 w-6" />,
    title: "Topic Discovery",
    subtitle: "Smart Suggestions",
    description: "Enter any topic you're curious about. If you're unsure, our AI suggests trending and relevant paths to ensure you start with clarity.",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="w-4/5 h-12 rounded-2xl flex items-center px-4 gap-3"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(168,85,247,0.4)",
          }}
        >
          <Search className="h-4 w-4 text-purple-400" />
          <div className="h-2 w-32 rounded-full bg-slate-700" />
          <div
            className="ml-auto h-7 w-16 rounded-xl text-[10px] font-bold text-white flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
          >
            Search
          </div>
        </div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 px-3 py-2 rounded-xl text-[10px] font-bold text-purple-300"
          style={{
            background: "rgba(168,85,247,0.15)",
            border: "1px solid rgba(168,85,247,0.3)",
          }}
        >
          Try "Quantum Physics" ✨
        </motion.div>
      </div>
    ),
  },
  {
    id: 2,
    emoji: "🗺️",
    icon: <ListChecks className="h-6 w-6" />,
    title: "Smart Structuring",
    subtitle: "Auto-Roadmap",
    description: "Witness the magic as AI instantly breaks down your topic into logical, comprehensive subtopics, building a perfect learning roadmap.",
    visual: (
      <div className="space-y-3 w-full px-8">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.2 }}
            className="h-11 rounded-2xl flex items-center px-4 gap-3"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(34,211,238,0.25)",
            }}
          >
            <div
              className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] text-white font-black"
              style={{ background: "linear-gradient(135deg, #22d3ee, #0891b2)" }}
            >
              {i}
            </div>
            <div className="h-2 w-24 rounded-full bg-slate-700" />
            <div className="ml-auto h-2 w-10 rounded-full bg-slate-800" />
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 3,
    emoji: "⚡",
    icon: <BookOpen className="h-6 w-6" />,
    title: "Instant Content",
    subtitle: "AI Creation",
    description: "Our core engine transforms the structure into a full-scale course with deep theory, interactive visuals, and future-ready insights.",
    visual: (
      <div className="relative w-full h-full p-6">
        <div
          className="w-full h-full rounded-2xl p-5 space-y-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(244,114,182,0.25)",
          }}
        >
          <div className="h-3 w-1/2 rounded-full bg-slate-700" />
          <div className="h-2 w-full rounded-full bg-slate-800" />
          <div className="h-2 w-full rounded-full bg-slate-800" />
          <div className="h-2 w-3/4 rounded-full bg-slate-800" />
          <div
            className="aspect-video w-full rounded-xl opacity-30"
            style={{ background: "linear-gradient(135deg, #f472b6, #db2777)" }}
          />
        </div>
      </div>
    ),
  },
  {
    id: 4,
    emoji: "🏆",
    icon: <Award className="h-6 w-6" />,
    title: "Mastery & Rewards",
    subtitle: "Certified",
    description: "Learn 2x faster with optimized modules. Complete your journey to earn a certificate that validates your new industry-ready skills.",
    visual: (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-32 h-40 rounded-2xl flex flex-col items-center p-4 relative"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "2px solid rgba(251,191,36,0.4)",
            boxShadow: "0 0 32px rgba(251,191,36,0.2)",
          }}
        >
          <div className="h-2 w-16 bg-slate-700 rounded-full mb-2" />
          <div className="h-1 w-20 bg-slate-800 rounded-full mb-1" />
          <div className="h-1 w-20 bg-slate-800 rounded-full mb-4" />
          <Trophy className="h-12 w-12 text-amber-400" />
          <div
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center text-xs"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
          >
            ⭐
          </div>
        </motion.div>
      </div>
    ),
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  const accent = STEP_ACCENTS[activeStep];

  useEffect(() => {
    const duration = 5000;
    const intervalTime = 50;
    const increment = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setStepProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((s) => (s + 1) % steps.length);
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeStep]);

  const nextStep = () => {
    setStepProgress(0);
    setActiveStep((prev) => (prev + 1) % steps.length);
  };

  const prevStep = () => {
    setStepProgress(0);
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const handleStepClick = (index: number) => {
    setStepProgress(0);
    setActiveStep(index);
  };

  return (
    <main
      className="min-h-screen font-sans antialiased"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(109,40,217,0.15) 0%, transparent 70%), #09090f",
      }}
    >
      <section className="py-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              animate={{ rotate: [0, 4, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{
                background: "linear-gradient(90deg, rgba(168,85,247,0.2), rgba(34,211,238,0.15))",
                border: "1px solid rgba(168,85,247,0.35)",
              }}
            >
              <span className="text-sm">⚙️</span>
              <span
                className="text-xs font-black tracking-widest uppercase"
                style={{
                  background: "linear-gradient(90deg, #c084fc, #67e8f9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Sequential AI Processing
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white leading-none"
              style={{ fontFamily: "'Syne', 'Outfit', sans-serif" }}
            >
              How the{" "}
              <span
                style={{
                  background: "linear-gradient(110deg, #a855f7 0%, #22d3ee 55%, #f472b6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                magic
              </span>{" "}
              happens ✨
            </motion.h2>
            <p className="text-slate-400 max-w-xl mx-auto text-base md:text-lg">
              Watch as our AI processes each module sequentially, ensuring maximum precision and a future-ready learning structure.
            </p>
          </div>

          {/* Main card */}
          <div
            className="rounded-[2.5rem] p-5 md:p-10 relative overflow-hidden transition-all duration-700"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${accent.border}`,
              boxShadow: `0 0 60px ${accent.glow}`,
            }}
          >
            {/* Noise texture */}
            <div
              className="absolute inset-0 opacity-[0.025] pointer-events-none rounded-[2.5rem]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
              }}
            />

            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Left: Content */}
              <div className="space-y-8 relative z-10">

                {/* Progress bars */}
                <div className="flex gap-2">
                  {steps.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleStepClick(i)}
                      className="h-1.5 flex-1 rounded-full relative overflow-hidden transition-all duration-300"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                      {i < activeStep && (
                        <div
                          className="absolute inset-0"
                          style={{ background: STEP_ACCENTS[i].bar }}
                        />
                      )}
                      {i === activeStep && (
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            background: accent.bar,
                            width: `${stepProgress}%`,
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Step content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    {/* Step header */}
                    <div className="flex items-center gap-4">
                      <div
                        className="h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg text-xl"
                        style={{
                          background: accent.gradient,
                          boxShadow: `0 8px 24px ${accent.glow}`,
                        }}
                      >
                        {steps[activeStep].emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            Step 0{activeStep + 1}
                          </span>
                          <span
                            className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                            style={{
                              background: accent.badge,
                              color: accent.badgeText,
                              border: `1px solid ${accent.border}`,
                            }}
                          >
                            Processing {Math.round(stepProgress)}%
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-white">
                          {steps[activeStep].title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                      {steps[activeStep].description}
                    </p>

                    {/* Step dots */}
                    <div className="flex items-center gap-2 pt-1">
                      {steps.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleStepClick(i)}
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: i === activeStep ? 28 : 8,
                            background:
                              i === activeStep
                                ? accent.bar
                                : "rgba(255,255,255,0.12)",
                          }}
                        />
                      ))}
                    </div>

                    {/* Nav buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={prevStep}
                        className="h-12 w-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 hover:scale-105"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextStep}
                        className="h-12 px-6 rounded-2xl font-black text-white flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:opacity-90"
                        style={{
                          background: accent.gradient,
                          boxShadow: `0 6px 20px ${accent.glow}`,
                        }}
                      >
                        {activeStep === steps.length - 1 ? "Let's go! 🚀" : "Next Step"}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right: Visual */}
              <div
                className="relative aspect-square lg:aspect-auto lg:h-[380px] rounded-3xl flex items-center justify-center overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${accent.border}`,
                }}
              >
                {/* Glow blob inside visual box */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at center, ${accent.glow} 0%, transparent 70%)`,
                    opacity: 0.35,
                  }}
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, scale: 0.88, rotate: -4 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 1.08, rotate: 4 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full flex items-center justify-center relative z-10"
                  >
                    {steps[activeStep].visual}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
