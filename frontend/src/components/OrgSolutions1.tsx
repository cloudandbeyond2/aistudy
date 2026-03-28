import React from 'react';
import { motion, easeOut } from 'framer-motion';
import { FileText, CheckCircle, Database, Briefcase } from 'lucide-react';
import verify from '../assets/images/verify.jpg';
 
function BarChartIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}
 
const solutions = [
  {
    title: "Placement Readiness",
    emoji: "📊",
    description: "AI-driven scoring system to evaluate and improve student employability based on real-world metrics and industry requirements.",
    icon: <BarChartIcon className="h-6 w-6" />,
    gradient: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
    glow: "rgba(52,211,153,0.35)",
    border: "rgba(52,211,153,0.3)",
    badge: "rgba(52,211,153,0.15)",
    badgeText: "#6ee7b7",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    tag: "AI Powered",
  },
  {
    title: "AI Resume Builder",
    emoji: "📝",
    description: "Automated CV structuring that highlights core competencies, project work, and academic achievements tailored for organizations.",
    icon: <FileText className="h-6 w-6" />,
    gradient: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
    glow: "rgba(168,85,247,0.35)",
    border: "rgba(168,85,247,0.3)",
    badge: "rgba(168,85,247,0.15)",
    badgeText: "#d8b4fe",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070&auto=format&fit=crop",
    tag: "Smart CV",
  },
  {
    title: "Project Showcase",
    emoji: "🖥️",
    description: "A centralized gallery displaying student developer portfolios, rich code metadata, and live application links in one place.",
    icon: <Database className="h-6 w-6" />,
    gradient: "linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)",
    glow: "rgba(34,211,238,0.35)",
    border: "rgba(34,211,238,0.3)",
    badge: "rgba(34,211,238,0.15)",
    badgeText: "#67e8f9",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    tag: "Portfolio",
  },
  {
    title: "Verified Certificates",
    emoji: "🏆",
    description: "Blockchain-secured digital credentials distributed across the organization with built-in instant verification.",
    icon: <CheckCircle className="h-6 w-6" />,
    gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    glow: "rgba(251,191,36,0.35)",
    border: "rgba(251,191,36,0.3)",
    badge: "rgba(251,191,36,0.15)",
    badgeText: "#fde68a",
    image: verify,
    tag: "Blockchain",
  },
];
 
const OrgSolutions1 = () => {
  return (
    <section
      className="py-20 sm:py-28 md:py-32 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(109,40,217,0.12) 0%, transparent 65%), #09090f",
        fontFamily: "'Syne', 'Outfit', sans-serif",
      }}
    >
      {/* Background stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px rounded-full bg-white"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            animate={{ opacity: [0.1, 0.7, 0.1] }}
            transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
          />
        ))}
 
        {/* Blobs */}
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-purple-500 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 9, repeat: Infinity, delay: 3 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cyan-400 blur-3xl"
        />
      </div>
 
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-10 relative z-10">
 
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <motion.div
            animate={{ rotate: [0, 4, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{
              background: "linear-gradient(90deg, rgba(168,85,247,0.18), rgba(34,211,238,0.12))",
              border: "1px solid rgba(168,85,247,0.35)",
            }}
          >
            <span className="text-sm">🏢</span>
            <span
              className="text-[10px] sm:text-xs font-black tracking-widest uppercase"
              style={{
                background: "linear-gradient(90deg, #c084fc, #67e8f9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              For Organizations
            </span>
          </motion.div>
 
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-5 text-white">
            Streamline Student{" "}
            <span
              style={{
                background: "linear-gradient(110deg, #a855f7 0%, #22d3ee 55%, #f472b6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Placement
            </span>
            {" "}& Career<br className="hidden sm:block" /> Management 🚀
          </h2>
 
          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-white/45 leading-relaxed">
            A complete suite of tools to bridge the gap between academic institutions and the professional world. Elevate your organization's placement capabilities.
          </p>
        </motion.div>
 
        {/* Cards grid */}
        <div className="grid lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-7">
          {solutions.map((s, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: easeOut }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="flex flex-col sm:flex-row rounded-3xl overflow-hidden relative group transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${s.border}`,
                boxShadow: `0 0 0 rgba(0,0,0,0)`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${s.glow}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 rgba(0,0,0,0)`;
              }}
            >
              {/* Glow overlay on hover */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 0% 50%, ${s.glow} 0%, transparent 60%)`,
                }}
              />
 
              {/* Image */}
              <div className="sm:w-2/5 h-44 sm:h-auto overflow-hidden relative flex-shrink-0">
                {/* Gradient tint over image */}
                <div
                  className="absolute inset-0 z-10 mix-blend-multiply"
                  style={{ background: s.gradient, opacity: 0.45 }}
                />
                <img
                  src={s.image}
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
 
                {/* Tag pill on image */}
                <div
                  className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase"
                  style={{ background: s.badge, color: s.badgeText, border: `1px solid ${s.border}`, backdropFilter: "blur(8px)" }}
                >
                  {s.tag}
                </div>
              </div>
 
              {/* Content */}
              <div className="sm:w-3/5 p-6 sm:p-8 flex flex-col justify-center relative z-10">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform duration-400"
                  style={{
                    background: s.gradient,
                    boxShadow: `0 6px 20px ${s.glow}`,
                  }}
                >
                  {s.icon}
                </div>
 
                {/* Emoji + title */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{s.emoji}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{s.title}</h3>
                </div>
 
                <p className="text-white/45 text-sm sm:text-base leading-relaxed">
                  {s.description}
                </p>
 
                {/* Bottom gradient line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: s.gradient }}
                />
              </div>
            </motion.div>
          ))}
        </div>
 
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 sm:mt-16 text-center"
        >
          <button
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-base sm:text-lg text-white transition-all duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #a855f7 0%, #22d3ee 100%)",
              boxShadow: "0 8px 32px rgba(168,85,247,0.4)",
            }}
          >
            Partner With Us
            <Briefcase className="h-5 w-5" />
          </button>
 
          <p className="mt-4 text-white/30 text-xs tracking-wide">
            No commitment required · Free consultation
          </p>
        </motion.div>
      </div>
    </section>
  );
};
 
export default OrgSolutions1;