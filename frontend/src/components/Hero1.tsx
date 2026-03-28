

// import React from "react";
// import { motion } from "framer-motion";
// import { Building, GraduationCap } from "lucide-react";
// import { Button } from "@/components/ui/button";

// import { useNavigate } from "react-router-dom";
// import ImageSlider from "../ImageSlider";

// const Hero1 = () => {

//   const navigate = useNavigate();

//   const handleStudentClick = () => {
//     const uid = sessionStorage.getItem("uid");

//     if (uid) {
//       navigate("/dashboard/student");
//     } else {
//       navigate("/login");
//     }
//   };

//   const handleOrganizationClick = () => {
//     const uid = sessionStorage.getItem("uid");

//     if (uid) {
//       navigate("/dashboard");
//     } else {
//       navigate("/organization-enquiry");
//     }
//   };

//   return (
//     <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-slate-950">

//       {/* Background */}
//       <div className="absolute inset-0 bg-grid-white/[0.02]" />
//       <div className="absolute top-0 right-0 w-[600px] md:w-[800px] h-[400px] md:h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
//       <div className="absolute bottom-0 left-0 w-[400px] md:w-[600px] h-[350px] md:h-[500px] bg-blue-600/20 rounded-full blur-[100px] opacity-50" />

//       <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 relative z-10 w-full grid lg:grid-cols-2 gap-10 items-center ">

//         {/* LEFT CONTENT */}
//         <motion.div
//           initial={{ opacity: 0, x: -30 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.8 }}
//           className="flex flex-col space-y-6"
//         >

//           {/* Badge */}
//           <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 py-1.5 px-3 text-xs md:text-sm text-white/80 backdrop-blur-sm self-start mt-[10px]">
//             <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
//             Next-Gen Learning & Placement Platform
//           </div>

//           {/* Heading */}
//           <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-tight">
//             Empowering <br />
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
//               Futuristic
//             </span>{" "}
//             Learning with AI
//           </h1>

//           {/* Description */}
//           <p className="max-w-xl text-base md:text-lg text-slate-300 leading-relaxed">
//             AI-driven courses, verifiable credentials, and seamless placement
//             readiness bridging the gap between education and enterprise.
//           </p>

//           {/* Buttons */}
//           <div className="flex flex-col sm:flex-row gap-4 pt-2">

//             <Button
//               size="lg"
//               onClick={handleStudentClick}
//               className="h-12 md:h-14 px-6 md:px-8 rounded-full text-sm md:text-base font-semibold shadow-lg shadow-primary/25 bg-primary text-white group"
//             >
//               For Students
//               <GraduationCap className="ml-2 h-5 w-5 group-hover:-translate-y-1 transition" />
//             </Button>

//             <Button
//               size="lg"
//               onClick={handleOrganizationClick}
//               variant="outline"
//               className="h-12 md:h-14 px-6 md:px-8 rounded-full text-sm md:text-base font-semibold border-gray-300 text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 group"
//             >
//               For Organizations
//               <Building className="ml-2 h-5 w-5 group-hover:-translate-y-1 transition" />
//             </Button>

//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-md">

//             {[
//               { label: "Active Learners", value: "50k+" },
//               { label: "Organizations", value: "250+" },
//               { label: "Placement Rate", value: "94%" },
//             ].map((stat, i) => (
//               <div key={i} className="flex flex-col">
//                 <span className="text-xl md:text-2xl font-bold text-white">
//                   {stat.value}
//                 </span>
//                 <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider">
//                   {stat.label}
//                 </span>
//               </div>
//             ))}

//           </div>

//         </motion.div>

//         {/* RIGHT SIDE IMAGE */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 1, delay: 0.2 }}
//           className="relative w-full"
//         >

//           <div className="absolute -inset-1 bg-gradient-to-tr from-primary/50 to-blue-500/50 rounded-3xl blur-2xl opacity-40"></div>

//           <div className="relative w-full h-[280px] sm:h-[340px] md:h-[420px] lg:h-[450px] rounded-3xl overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-sm shadow-2xl p-2">

//             <div className="w-full h-full rounded-2xl overflow-hidden relative">

//               <ImageSlider />

//               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10 pointer-events-none"></div>

//             </div>

//           </div>

//         </motion.div>

//       </div>
//     </section>
//   );
// };

// export default Hero1;

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  GraduationCap,
  BrainCircuit,
  Zap,
  Globe,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

/* ─── Button ─────────────────────────────────────────────── */
const Button = ({ children, className = "", variant = "primary", size = "md", ...props }: any) => {
  const base = "inline-flex items-center justify-center rounded-2xl font-black transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none";
  const variants: any = {
    primary: "bg-white text-slate-950 hover:scale-105 shadow-[0_0_24px_rgba(255,255,255,0.25)]",
    outline: "border border-white/20 text-white hover:bg-white/10 backdrop-blur-md hover:scale-105",
  };
  const sizes: any = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-5 py-2.5 text-base gap-2",
    lg: "px-7 py-3.5 text-base sm:text-lg gap-2",
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

/* ─── Floating particles + SVG lines ─────────────────────── */
const NeuralBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg className="w-full h-full opacity-[0.18]" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
          <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[
        "M100 200 Q 400 100 700 400",
        "M800 100 Q 500 300 200 600",
        "M50 500 Q 300 200 650 700",
        "M900 400 Q 600 600 300 900",
        "M200 800 Q 500 500 850 200",
        "M400 50 Q 700 300 900 700",
      ].map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="url(#lg1)"
          strokeWidth="1.2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 1.2 }}
        />
      ))}
    </svg>

    {/* Stars */}
    {[...Array(22)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-white"
        style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
        animate={{ opacity: [0.1, 0.8, 0.1] }}
        transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
      />
    ))}

    {/* Blobs */}
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.2, 0.12] }}
      transition={{ duration: 6, repeat: Infinity }}
      className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-500 blur-3xl"
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.18, 0.1] }}
      transition={{ duration: 8, repeat: Infinity, delay: 2 }}
      className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-cyan-400 blur-3xl"
    />
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 10, repeat: Infinity, delay: 4 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-pink-500/20 blur-3xl"
    />
  </div>
);

/* ─── Orbiting AI Core ────────────────────────────────────── */
const NODE_ICONS = [
  { Icon: Cpu, color: "#60a5fa", bg: "rgba(96,165,250,0.15)" },
  { Icon: Layers, color: "#c084fc", bg: "rgba(192,132,252,0.15)" },
  { Icon: Zap, color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
  { Icon: Globe, color: "#34d399", bg: "rgba(52,211,153,0.15)" },
];

const AICore = () => (
  <div className="relative w-full aspect-square max-w-[340px] sm:max-w-[420px] lg:max-w-[500px] mx-auto flex items-center justify-center">
    {/* Rings */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 rounded-full"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    />
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      className="absolute inset-8 rounded-full"
      style={{ border: "1px dashed rgba(168,85,247,0.3)" }}
    />
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="absolute inset-16 rounded-full"
      style={{ border: "1px solid rgba(34,211,238,0.15)" }}
    />

    {/* Core */}
    <motion.div
      animate={{
        scale: [1, 1.08, 1],
        boxShadow: [
          "0 0 40px rgba(168,85,247,0.4)",
          "0 0 90px rgba(168,85,247,0.7)",
          "0 0 40px rgba(168,85,247,0.4)",
        ],
      }}
      transition={{ duration: 4, repeat: Infinity }}
      className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full flex items-center justify-center z-20"
      style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 60%, #22d3ee 100%)" }}
    >
      <BrainCircuit className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white drop-shadow-lg" />
      <motion.div
        animate={{ opacity: [0, 0.35, 0], scale: [0.8, 1.6, 0.8] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute inset-0 rounded-full bg-white"
      />
    </motion.div>

    {/* Orbiting nodes */}
    {NODE_ICONS.map(({ Icon, color, bg }, i) => (
      <motion.div
        key={i}
        animate={{ rotate: 360 }}
        transition={{ duration: 28 + i * 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
        style={{ transformOrigin: "center", transform: `rotate(${i * 90}deg)` }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center backdrop-blur-xl shadow-2xl"
          style={{ background: bg, border: `1px solid ${color}40` }}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} />
        </div>
      </motion.div>
    ))}
  </div>
);

/* ─── Feature Cards ───────────────────────────────────────── */
const FEATURES = [
  {
    title: "Neural Pathfinding",
    desc: "AI maps the most efficient route to your dream career from where you are right now.",
    icon: <BrainCircuit className="w-7 h-7" />,
    gradient: "linear-gradient(135deg, #3b82f6, #22d3ee)",
    glow: "rgba(59,130,246,0.3)",
    emoji: "🧠",
  },
  {
    title: "Adaptive Content",
    desc: "Course materials that evolve in real-time based on your vibe and learning style.",
    icon: <Layers className="w-7 h-7" />,
    gradient: "linear-gradient(135deg, #a855f7, #f472b6)",
    glow: "rgba(168,85,247,0.3)",
    emoji: "⚡",
  },
  {
    title: "Verified Mastery",
    desc: "Blockchain-backed credentials that prove your skills to employers worldwide.",
    icon: <Sparkles className="w-7 h-7" />,
    gradient: "linear-gradient(135deg, #f59e0b, #f472b6)",
    glow: "rgba(245,158,11,0.3)",
    emoji: "🏆",
  },
];

/* ─── Main Component ──────────────────────────────────────── */
export default function Hero1() {   
  return (
    <div
      className="min-h-screen text-white"
      style={{ fontFamily: "'Syne', 'Outfit', sans-serif" }}
    >
      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex items-center pt-16 sm:pt-20 pb-20 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 70% 50%, rgba(168,85,247,0.25) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 10% 80%, rgba(34,211,238,0.15) 0%, transparent 60%), #09090f",
        }}
      >
        <NeuralBackground />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7 sm:mb-8"
              style={{
                background: "linear-gradient(90deg, rgba(168,85,247,0.2), rgba(34,211,238,0.15))",
                border: "1px solid rgba(168,85,247,0.35)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span
                className="text-[10px] sm:text-xs font-black tracking-widest uppercase"
                style={{
                  background: "linear-gradient(90deg, #c084fc, #67e8f9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Next-Gen Learning & Placement Platform
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[0.92] mb-6 sm:mb-8">
              The Future of
              <br />
              <span
                style={{
                  background: "linear-gradient(110deg, #ffffff 0%, #c084fc 40%, #67e8f9 70%, #f9a8d4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Knowledge
              </span>
              <br />
              <span className="text-white/60">is Generative</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-white/55 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8 sm:mb-10">
              Replace outdated curriculum with real-time intelligence. ColossusIQ generates immersive courses and verifiable credentials — a seamless AI-powered pipeline from education to global enterprise. 🚀
            </p>

            {/* CTAs */}
            <div className="flex flex-col xs:flex-row gap-3 justify-center lg:justify-start">
              <Button variant="primary" size="lg" className="group">
                Start Learning
                <GraduationCap className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="group">
                For Organizations
                <Building className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Trust */}
            <div className="mt-12 sm:mt-14 pt-6 sm:pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
                Trusted by industry leaders
              </p>
              <div className="flex flex-wrap gap-6 sm:gap-8 opacity-35 hover:opacity-60 transition-opacity duration-500 justify-center lg:justify-start">
                {["TECH•CORP", "EDU•FLOW", "NEXA•AI"].map((name) => {
                  const [a, b] = name.split("•");
                  return (
                    <div key={name} className="font-black text-lg sm:text-xl tracking-tighter">
                      {a}
                      <span className="text-purple-400">•{b}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right: AI Core */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.25 }}
            className="relative flex justify-center"
          >
            <AICore />

            {/* Floating card — top right */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-2 right-0 sm:right-2 p-3 sm:p-4 rounded-2xl max-w-[160px] sm:max-w-[200px]"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(52,211,153,0.2)" }}
                >
                  <Zap className="w-3.5 h-3.5 text-green-400" />
                </div>
                <span className="text-[11px] font-black text-white">Real-time Gen</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-white/45 leading-relaxed">
                Course structure generated in 2.4s based on your goals.
              </p>
            </motion.div>

            {/* Floating card — bottom left */}
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 left-0 sm:left-2 p-3 sm:p-4 rounded-2xl max-w-[160px] sm:max-w-[200px]"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(96,165,250,0.2)" }}
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-[11px] font-black text-white">Global Reach</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-white/45 leading-relaxed">
                Connect with 250+ partner organizations worldwide.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-t from-[#09090f] to-transparent pointer-events-none" />
      </section>

      {/* ── Features ── */}
      <section
        className="py-20 sm:py-28 relative overflow-hidden"
        style={{ background: "#09090f" }}
      >
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
            <motion.div
              animate={{ rotate: [0, 4, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
              style={{
                background: "linear-gradient(90deg, rgba(168,85,247,0.15), rgba(34,211,238,0.12))",
                border: "1px solid rgba(168,85,247,0.3)",
              }}
            >
              <span className="text-sm">✨</span>
              <span
                className="text-[10px] sm:text-xs font-black tracking-widest uppercase"
                style={{
                  background: "linear-gradient(90deg, #c084fc, #67e8f9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Core Features
              </span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-white leading-tight">
              Redefining the{" "}
              <span
                style={{
                  background: "linear-gradient(110deg, #a855f7, #22d3ee, #f472b6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Learning Lifecycle
              </span>
            </h2>
            <p className="text-white/45 text-sm sm:text-base leading-relaxed">
              From initial curiosity to professional mastery — our AI orchestrates every step of your educational journey.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-6 sm:p-8 rounded-3xl relative overflow-hidden group cursor-pointer transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 50% 0%, ${f.glow} 0%, transparent 70%)`,
                  }}
                />

                {/* Emoji pill */}
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black mb-5 uppercase tracking-wider"
                  style={{
                    background: `${f.glow}`,
                    border: `1px solid ${f.glow}`,
                  }}
                >
                  <span>{f.emoji}</span>
                  <span className="text-white/70">Featured</span>
                </div>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform duration-500"
                  style={{
                    background: f.gradient,
                    boxShadow: `0 8px 24px ${f.glow}`,
                  }}
                >
                  {f.icon}
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white mb-3">{f.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>

                {/* Bottom gradient line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: f.gradient }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
