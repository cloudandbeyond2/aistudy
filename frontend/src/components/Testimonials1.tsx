import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, User, Zap } from "lucide-react";
import axios from "axios";
import { serverURL } from "@/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface Testimonial {
  _id: string;
  userName: string;
  message: string;
  profession: string;
  rating: number;
  photoUrl?: string;
  approved: boolean;
}

const EMOJI_RATINGS = ["😐", "🙂", "😊", "🤩", "🔥"];

const CARD_ACCENTS = [
  {
    border: "border-[#a855f7]",
    glow: "shadow-[0_0_32px_0_rgba(168,85,247,0.35)]",
    badge: "bg-[#a855f7]/20 text-[#d8b4fe]",
    dot: "bg-[#a855f7]",
    quote: "text-[#a855f7]",
    ring: "ring-[#a855f7]",
  },
  {
    border: "border-[#22d3ee]",
    glow: "shadow-[0_0_32px_0_rgba(34,211,238,0.3)]",
    badge: "bg-[#22d3ee]/20 text-[#67e8f9]",
    dot: "bg-[#22d3ee]",
    quote: "text-[#22d3ee]",
    ring: "ring-[#22d3ee]",
  },
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await axios.get(`${serverURL}/api/testimonials`);
        const approved = res.data?.testimonials?.filter(
          (t: Testimonial) => t.approved
        );
        setTestimonials(approved || []);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setTestimonials([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length === 0 || isLoading) return;
    const interval = setInterval(() => nextTestimonial(), 5000);
    return () => clearInterval(interval);
  }, [testimonials.length, isLoading, currentIndex]);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const getVisibleItems = () => {
    if (testimonials.length === 0) return [];
    if (testimonials.length === 1) return [testimonials[0]];
    const first = testimonials[currentIndex];
    const second = testimonials[(currentIndex + 1) % testimonials.length];
    return [first, second];
  };

  const visibleItems = getVisibleItems();

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 480 : -480,
      opacity: 0,
      scale: 0.94,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.55, type: "spring", stiffness: 240, damping: 24 },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -480 : 480,
      opacity: 0,
      scale: 0.94,
      transition: { duration: 0.38 },
    }),
  };

  if (isLoading) {
    return (
      <section className="py-20 md:py-32 bg-[#0a0a14]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-3xl bg-[#1a1a2e]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section
      className="relative py-20 md:py-32 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(109,40,217,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(6,182,212,0.12) 0%, transparent 70%), #09090f",
      }}
    >
      {/* Floating blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, -18, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 left-[8%] w-40 h-40 rounded-full bg-purple-600/20 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 22, 0], scale: [1, 0.94, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-[6%] w-52 h-52 rounded-full bg-cyan-500/15 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 14, 0], y: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-32 rounded-full bg-indigo-700/10 blur-3xl"
        />

        {/* Scattered stars */}
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/40"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{
              background:
                "linear-gradient(90deg, rgba(168,85,247,0.25), rgba(34,211,238,0.18))",
              border: "1px solid rgba(168,85,247,0.4)",
            }}
          >
            <Zap className="h-3.5 w-3.5 text-yellow-300" />
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{
                background:
                  "linear-gradient(90deg, #c084fc, #67e8f9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Student Wins ✨
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-none"
            style={{ fontFamily: "'Syne', 'Outfit', sans-serif" }}
          >
            <span className="text-white">Real students.</span>
            <br />
            <span
              style={{
                background:
                  "linear-gradient(110deg, #a855f7 0%, #22d3ee 55%, #f472b6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Unreal results. 🚀
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg max-w-md mx-auto"
          >
            Don't just take our word for it — hear it straight from the learners
            levelling up every day.
          </motion.p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
            >
              {visibleItems.map((item, cardIdx) => {
                const accent = CARD_ACCENTS[cardIdx % CARD_ACCENTS.length];
                const ratingEmoji = EMOJI_RATINGS[Math.min(item.rating - 1, 4)] ?? "⭐";

                return (
                  <div
                    key={item._id}
                    className={`relative rounded-3xl border ${accent.border} ${accent.glow} p-7 md:p-9 flex flex-col h-full overflow-hidden transition-transform duration-300 hover:-translate-y-1`}
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                      backdropFilter: "blur(18px)",
                    }}
                  >
                    {/* Card noise texture overlay */}
                    <div
                      className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-3xl"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
                      }}
                    />

                    {/* Big quote mark */}
                    <div className={`absolute top-5 right-6 text-6xl font-black leading-none ${accent.quote} opacity-20 select-none`}>
                      "
                    </div>

                    {/* Rating row */}
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-2xl">{ratingEmoji}</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${i < item.rating ? "text-yellow-400" : "text-slate-700"}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="ml-auto text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Verified
                      </span>
                    </div>

                    {/* Message */}
                    <p className="text-slate-200 text-base md:text-lg leading-relaxed mb-8 flex-grow">
                      "{item.message}"
                    </p>

                    {/* Divider */}
                    <div
                      className={`h-px mb-6 opacity-30`}
                      style={{
                        background:
                          cardIdx === 0
                            ? "linear-gradient(90deg, #a855f7, transparent)"
                            : "linear-gradient(90deg, #22d3ee, transparent)",
                      }}
                    />

                    {/* Author */}
                    <div className="flex items-center gap-3 mt-auto">
                      <div className={`ring-2 ${accent.ring} ring-offset-2 ring-offset-[#09090f] rounded-full`}>
                        {item.photoUrl ? (
                          <img
                            src={item.photoUrl}
                            alt={item.userName}
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="h-11 w-11 rounded-full flex items-center justify-center"
                            style={{
                              background:
                                cardIdx === 0
                                  ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                                  : "linear-gradient(135deg, #22d3ee, #0891b2)",
                            }}
                          >
                            <User size={18} className="text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">
                          {item.userName}
                        </p>
                        <span
                          className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${accent.badge}`}
                        >
                          {item.profession}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-5 mt-12">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-2xl text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <ChevronLeft size={20} />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: idx === currentIndex ? 28 : 8,
                    background:
                      idx === currentIndex
                        ? "linear-gradient(90deg, #a855f7, #22d3ee)"
                        : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-3 rounded-2xl text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
