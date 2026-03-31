import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Quote, Star, Sparkles, ChevronLeft, ChevronRight, User, Award, Clock, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { serverURL } from "@/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "./ui/badge";

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
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

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
    setCurrentIndex((prev) => (prev + 1) % (testimonials.length - 1));
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + (testimonials.length - 1)) % (testimonials.length - 1));
  };

  // Get two testimonials to display
  const getCurrentTestimonials = () => {
    if (testimonials.length === 0) return [];
    const first = testimonials[currentIndex];
    const second = testimonials[(currentIndex + 1) % testimonials.length];
    return [first, second];
  };

  // Toggle expand/collapse for a specific testimonial
  const toggleExpand = (testimonialId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [testimonialId]: !prev[testimonialId]
    }));
  };

  // Truncate text function
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  // Check if text needs truncation based on screen size
  const needsTruncation = (text: string, isExpanded: boolean) => {
    if (isExpanded) return false;
    // Different max lengths for different screen sizes
    const maxLength = window.innerWidth < 768 ? 100 : 150;
    return text.length > maxLength;
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-3xl dark:bg-slate-800" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  const currentTestimonials = getCurrentTestimonials();

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950/30 transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-300/20 dark:bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-300/10 dark:bg-sky-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* AI-Inspired Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              AI-POWERED INSIGHTS
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Our success is defined by how fast our learners grow.
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
              Real experiences from real people who transformed their journey with our AI platform
            </p>
          </div>
        </motion.div>

        {/* Main Testimonial Display - Two Cards */}
        <div className="relative">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {currentTestimonials.map((testimonial, idx) => {
                const isExpanded = expandedCards[testimonial._id] || false;
                const showToggle = needsTruncation(testimonial.message, isExpanded);
                const displayText = isExpanded 
                  ? testimonial.message 
                  : truncateText(testimonial.message, window.innerWidth < 768 ? 100 : 150);

                return (
                  <div
                    key={testimonial._id}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 p-6 md:p-8 transition-colors duration-300 relative h-full flex flex-col"
                  >
                    {/* Quote Icon */}
                    <div className="absolute top-6 right-6 opacity-10 dark:opacity-20">
                      <Quote className="h-16 w-16 md:h-20 md:w-20 text-sky-400" />
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 mb-4 md:mb-6">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 + idx * 0.05, type: "spring" as const, stiffness: 200 }}
                        >
                          <Star
                            className={`h-4 w-4 md:h-5 md:w-5 ${
                              i < testimonial.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            } transition-colors duration-300`}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {/* Testimonial Text with Show More/Show Less */}
                    <div className="flex-1">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className="text-base md:text-lg lg:text-xl text-[#0A192F] dark:text-gray-300 leading-relaxed mb-3 transition-colors duration-300"
                      >
                        "{displayText}"
                      </motion.div>
                      
                      {showToggle && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                          onClick={() => toggleExpand(testimonial._id)}
                          className="flex items-center gap-1 text-sm font-medium text-sky-500 hover:text-sky-600 transition-colors mb-4 md:mb-6"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              <span>Show Less</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              <span>Show More</span>
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>

                    {/* User Info - Same Avatar Footer for all cards */}
                    <div className="flex items-center gap-3 md:gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-slate-800">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4 + idx * 0.1, type: "spring" as const, stiffness: 200 }}
                        className="relative flex-shrink-0"
                      >
                        {testimonial.photoUrl ? (
                          <img
                            src={testimonial.photoUrl}
                            alt={testimonial.userName}
                            className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-full object-cover border-2 border-sky-400 shadow-lg"
                          />
                        ) : (
                          <div className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-full bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center shadow-lg">
                            <User className="h-5 w-5 md:h-6 md:w-6 text-white" />
                          </div>
                        )}
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
                          className="absolute -bottom-1 -right-1 bg-sky-400 rounded-full p-1 border-2 border-white dark:border-slate-900"
                        >
                          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-white" />
                        </motion.div>
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm md:text-base lg:text-lg text-[#0A192F] dark:text-white transition-colors duration-300 truncate">
                          {testimonial.userName}
                        </p>
                        <div className="flex items-center gap-1 text-xs md:text-sm text-sky-500">
                          <Award className="h-3 w-3 md:h-4 md:w-4 text-sky-500" />
                          <span className="truncate">{testimonial.profession}</span>
                        </div>
                      </div>
                      
                      {/* Optional: Add a small badge for verified */}
                      <div className="hidden sm:block">
                        <Badge variant="outline" className="text-[10px] md:text-xs bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                          Verified
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevTestimonial}
              className="p-2 md:p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-slate-700"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-sky-500" />
            </motion.button>
            
            <div className="flex gap-2 items-center">
              {Array.from({ length: Math.max(1, testimonials.length - 1) }).map((_, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-6 md:w-8 bg-sky-500"
                      : "w-1.5 md:w-2 bg-gray-300 dark:bg-slate-600 hover:bg-sky-300 dark:hover:bg-sky-600"
                  }`}
                />
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextTestimonial}
              className="p-2 md:p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-slate-700"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-sky-500" />
            </motion.button>
          </div>
        </div>

        {/* Mini Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-12 md:mt-16"
        >
          {[
            { label: "Average Rating", value: "4.8/5", icon: Star },
            { label: "Happy Users", value: "10K+", icon: User },
            { label: "Success Rate", value: "94%", icon: Award },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center border border-white/50 dark:border-slate-700/50 shadow-lg transition-colors duration-300"
            >
              <stat.icon className={`h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 md:mb-3 ${stat.icon === Star ? 'text-yellow-400' : 'text-sky-500'}`} />
              <p className="text-xl md:text-2xl font-bold text-[#0A192F] dark:text-white">{stat.value}</p>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;