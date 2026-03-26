import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Quote, Star, Sparkles, ChevronLeft, ChevronRight, User, Award } from "lucide-react";
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
      } catch {
        setTestimonials([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Fixed slide variants with proper Framer Motion types
  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.5,
      },
    }),
  };

  if (isLoading) {
    return (
      <section className="py-20 md:py-32 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-3xl dark:bg-slate-800" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  const current = testimonials[currentIndex];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950/30 transition-colors duration-300">
      {/* Animated Background Elements - Dark mode adjustments */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-300/10 dark:bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* AI-Inspired Header - Dark mode text adjustments */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/50 dark:bg-indigo-900/30 backdrop-blur-sm border border-indigo-200 dark:border-indigo-700/50 mb-4"
          >
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs md:text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide">
              AI-POWERED INSIGHTS
            </span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-indigo-800 to-purple-900 dark:from-slate-100 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
           Our success is defined by how fast our learners grow.
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg max-w-2xl mx-auto transition-colors duration-300">
            Real experiences from real people who transformed their journey with our AI platform
          </p>
        </motion.div>

        {/* Main Testimonial Display */}
        <div className="relative">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 p-8 md:p-12 transition-colors duration-300"
            >
              {/* Quote Icon - Dark mode opacity adjustment */}
              <div className="absolute top-6 right-6 opacity-10 dark:opacity-20">
                <Quote className="h-20 w-20 text-indigo-600 dark:text-indigo-400" />
              </div>

              {/* Rating with Animation */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1, type: "spring" as const, stiffness: 200 }}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        i < current.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      } transition-colors duration-300`}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Testimonial Text - Dark mode text color */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 transition-colors duration-300"
              >
                "{current.message}"
              </motion.p>

              {/* User Info - Dark mode adjustments */}
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" as const, stiffness: 200 }}
                  className="relative"
                >
                  {current.photoUrl ? (
                    <img
                      src={current.photoUrl}
                      alt={current.userName}
                      className="h-14 w-14 rounded-full object-cover border-2 border-indigo-500 dark:border-indigo-400 shadow-lg"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-slate-900"
                  >
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </motion.div>
                </motion.div>

                <div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white transition-colors duration-300">
                    {current.userName}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400">
                    <Award className="h-4 w-4" />
                    <span>{current.profession}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons - Dark mode */}
          <div className="flex justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-slate-700"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </motion.button>
            
            <div className="flex gap-2 items-center">
              {testimonials.map((_, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-8 bg-indigo-600 dark:bg-indigo-500"
                      : "w-2 bg-gray-300 dark:bg-slate-600 hover:bg-indigo-300 dark:hover:bg-indigo-600"
                  }`}
                />
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-slate-700"
            >
              <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>

        {/* Mini Stats Cards - Dark mode */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
        >
          {[
            { label: "Average Rating", value: "4.8/5", icon: Star },
            { label: "Happy Users", value: "10K+", icon: User },
            { label: "Success Rate", value: "94%", icon: Award },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/50 dark:border-slate-700/50 shadow-lg transition-colors duration-300"
            >
              <stat.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;