import React, { useState } from 'react';
import {
  Zap, Book, Layers, BarChart, PenLine, RotateCw,
  Briefcase, Award, Users, FileText, Calendar, Video, Laptop
} from 'lucide-react';
import { motion, easeOut, AnimatePresence } from 'framer-motion';

/* ─── Per-card accent cycling ─────────────────────────────── */
const ACCENTS = [
  { gradient: "linear-gradient(135deg,#a855f7,#7c3aed)", glow: "rgba(168,85,247,0.35)", border: "rgba(168,85,247,0.28)", badge: "rgba(168,85,247,0.15)", badgeText: "#d8b4fe" },
  { gradient: "linear-gradient(135deg,#22d3ee,#0891b2)", glow: "rgba(34,211,238,0.3)",  border: "rgba(34,211,238,0.25)",  badge: "rgba(34,211,238,0.12)",  badgeText: "#67e8f9" },
  { gradient: "linear-gradient(135deg,#f472b6,#db2777)", glow: "rgba(244,114,182,0.3)", border: "rgba(244,114,182,0.25)", badge: "rgba(244,114,182,0.12)", badgeText: "#f9a8d4" },
  { gradient: "linear-gradient(135deg,#fbbf24,#f59e0b)", glow: "rgba(251,191,36,0.3)",  border: "rgba(251,191,36,0.25)",  badge: "rgba(251,191,36,0.12)",  badgeText: "#fde68a" },
  { gradient: "linear-gradient(135deg,#34d399,#059669)", glow: "rgba(52,211,153,0.3)",  border: "rgba(52,211,153,0.25)",  badge: "rgba(52,211,153,0.12)",  badgeText: "#6ee7b7" },
  { gradient: "linear-gradient(135deg,#f87171,#dc2626)", glow: "rgba(248,113,113,0.3)", border: "rgba(248,113,113,0.25)", badge: "rgba(248,113,113,0.12)", badgeText: "#fca5a5" },
];

/* ─── Feature data ────────────────────────────────────────── */
const featuresData = {
  students: [
    { emoji:"⚡", icon:<Zap className="h-6 w-6"/>,      title:"AI Course Generation",      description:"Advanced AI algorithms analyze your inputs to auto-generate comprehensive courses instantly." },
    { emoji:"📓", icon:<Layers className="h-6 w-6"/>,   title:"Interactive AI Notebook",   description:"Engage with an intelligent AI notebook that helps you document, summarize, and understand complex topics." },
    { emoji:"📝", icon:<FileText className="h-6 w-6"/>, title:"Skill-Based Resume Builder", description:"Build a professional, skill-highlighted resume tailored to your specific career goals and achievements." },
    { emoji:"💻", icon:<Laptop className="h-6 w-6"/>,   title:"Portfolio & Projects",      description:"Create stunning public portfolios and submit your work to the career hub project submission portal." },
    { emoji:"🏆", icon:<Award className="h-6 w-6"/>,    title:"Certificate Download",      description:"Instantly download verified certificates upon completing your courses to showcase your new skills." },
    { emoji:"📚", icon:<Book className="h-6 w-6"/>,     title:"Online & Offline Courses",  description:"Access a wide variety of interactive courses online or download materials for seamless offline learning." },
    { emoji:"✏️", icon:<PenLine className="h-6 w-6"/>,  title:"Smart Assignments",         description:"Tackle auto-generated quizzes, assignments, and dynamic assessments to reinforce your learning." },
    { emoji:"🤖", icon:<RotateCw className="h-6 w-6"/>, title:"AI Teacher Chat",           description:"Get immediate answers to your questions from our specialized AI tutor while learning." },
    { emoji:"💼", icon:<Briefcase className="h-6 w-6"/>,title:"Interview Preparation",     description:"Premium access to daily current affairs, aptitude tests, and instantly generated AI quizzes." },
  ],
  organizations: [
    { emoji:"👥", icon:<Users className="h-6 w-6"/>,    title:"Student Management",    description:"Easily onboard, track, and manage student cohorts, their learning progress, and overall performance." },
    { emoji:"📊", icon:<BarChart className="h-6 w-6"/>, title:"Staff Management",      description:"Manage faculty and staff roles, administrative permissions, and department assignments seamlessly." },
    { emoji:"📅", icon:<Calendar className="h-6 w-6"/>, title:"Schedule Management",   description:"Organize classes, academic events, and comprehensive learning schedules efficiently." },
    { emoji:"🎥", icon:<Video className="h-6 w-6"/>,    title:"Online Meetings",       description:"Integrated online meeting tools for virtual classrooms, remote faculty syncs, and direct student support." },
    { emoji:"✏️", icon:<PenLine className="h-6 w-6"/>,  title:"Assignment Tracking",   description:"Create, distribute, and track assignments across different departments and individual classes." },
    { emoji:"💼", icon:<Briefcase className="h-6 w-6"/>,title:"Placement Readiness",   description:"Track and improve student employability with AI-driven scoring and detailed placement analytics." },
    { emoji:"🖼️", icon:<Laptop className="h-6 w-6"/>,   title:"Project Galleries",     description:"Centralized showcases for student portfolios and career hub project submissions to present to hiring partners." },
    { emoji:"🏅", icon:<Award className="h-6 w-6"/>,    title:"Verified Credentials",  description:"Issue blockchain-secured certificates that employers and partners can verify instantly." },
    { emoji:"🎯", icon:<Briefcase className="h-6 w-6"/>,title:"Interview Preparation", description:"Empower students with premium access to current affairs, aptitude tests, and AI-driven mock quizzes." },
  ]
};

/* ─── Tab config ──────────────────────────────────────────── */
const TABS = [
  { key: "students",      label: "For Students 🎓",      activeGrad: "linear-gradient(135deg,#a855f7,#22d3ee)" },
  { key: "organizations", label: "For Organizations 🏢",  activeGrad: "linear-gradient(135deg,#f472b6,#fbbf24)" },
] as const;

/* ─── Component ───────────────────────────────────────────── */
const Features = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'organizations'>('students');
  const activeTabMeta = TABS.find(t => t.key === activeTab)!;

  return (
    <section
      id="features"
      className="py-20 sm:py-28 md:py-32 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(109,40,217,0.12) 0%, transparent 65%), #09090f",
        fontFamily: "'Syne','Outfit',sans-serif",
      }}
    >
      {/* Background stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px rounded-full bg-white"
            style={{ top:`${Math.random()*100}%`, left:`${Math.random()*100}%` }}
            animate={{ opacity:[0.1,0.7,0.1] }}
            transition={{ duration:2+Math.random()*4, repeat:Infinity, delay:Math.random()*5 }}
          />
        ))}
        <motion.div
          animate={{ scale:[1,1.12,1], opacity:[0.07,0.13,0.07] }}
          transition={{ duration:8, repeat:Infinity }}
          className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-purple-500 blur-3xl"
        />
        <motion.div
          animate={{ scale:[1,1.1,1], opacity:[0.05,0.1,0.05] }}
          transition={{ duration:10, repeat:Infinity, delay:3 }}
          className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-cyan-400 blur-3xl"
        />
        <motion.div
          animate={{ scale:[1,1.08,1], opacity:[0.04,0.09,0.04] }}
          transition={{ duration:12, repeat:Infinity, delay:6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-pink-500 blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-10 relative z-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity:0, y:24 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          {/* Badge */}
          <motion.div
            animate={{ rotate:[0,4,-4,0] }}
            transition={{ duration:3, repeat:Infinity, repeatDelay:2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{
              background:"linear-gradient(90deg,rgba(168,85,247,0.18),rgba(34,211,238,0.12))",
              border:"1px solid rgba(168,85,247,0.35)",
            }}
          >
            <span className="text-sm">✨</span>
            <span
              className="text-[10px] sm:text-xs font-black tracking-widest uppercase"
              style={{ background:"linear-gradient(90deg,#c084fc,#67e8f9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}
            >
              Our Excellence
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4 text-white">
            Powerful Features for{" "}
            <span
              style={{ background:"linear-gradient(110deg,#a855f7 0%,#22d3ee 55%,#f472b6 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}
            >
              Modern Learning
            </span>{" "}
            🔥
          </h2>
          <p className="text-white/40 text-sm sm:text-base max-w-xl mx-auto mb-10">
            Everything you need to learn smarter, grow faster, and stand out — all in one place.
          </p>

          {/* ── Tab Switcher ── */}
          <div
            className="inline-flex p-1.5 rounded-2xl gap-1"
            style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="relative px-5 sm:px-8 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300"
                  style={{
                    color: isActive ? "#fff" : "rgba(255,255,255,0.35)",
                    background: isActive ? tab.activeGrad : "transparent",
                    boxShadow: isActive ? "0 4px 16px rgba(168,85,247,0.35)" : "none",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Cards Grid ── */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity:0, y:20 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-20 }}
              transition={{ duration:0.4 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
            >
              {featuresData[activeTab].map((feature, index) => {
                const acc = ACCENTS[index % ACCENTS.length];
                return (
                  <motion.div
                    key={`${activeTab}-${index}`}
                    initial={{ opacity:0, y:24 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ delay:index*0.07, ease:easeOut }}
                    whileHover={{ y:-6, scale:1.02 }}
                    className="group relative rounded-3xl p-6 sm:p-7 overflow-hidden cursor-pointer transition-all duration-300"
                    style={{
                      background:"rgba(255,255,255,0.03)",
                      border:`1px solid ${acc.border}`,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px ${acc.glow}`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                  >
                    {/* Glow bloom */}
                    <div
                      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background:`radial-gradient(ellipse at 0% 0%,${acc.glow} 0%,transparent 65%)` }}
                    />

                    {/* Noise texture */}
                    <div
                      className="absolute inset-0 opacity-[0.025] pointer-events-none rounded-3xl"
                      style={{ backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }}
                    />

                    <div className="relative z-10">
                      {/* Tag pill */}
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase mb-5"
                        style={{ background:acc.badge, color:acc.badgeText, border:`1px solid ${acc.border}` }}
                      >
                        <span>{feature.emoji}</span>
                        <span>Feature</span>
                      </div>

                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white transition-transform duration-400 group-hover:scale-110 shadow-lg"
                        style={{ background:acc.gradient, boxShadow:`0 6px 20px ${acc.glow}` }}
                      >
                        {feature.icon}
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-white mb-2 group-hover:opacity-90 transition-opacity">
                        {feature.title}
                      </h3>
                      <p className="text-white/40 text-xs sm:text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Bottom gradient line */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background:acc.gradient }}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Features;
