import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const slides = [
    {
        id: 1,
        image: "/slider1.png",
        title: "Revolutionize Your Learning",
        subtitle: "Experience the power of AI-driven course generation tailored to your needs.",
        cta: "Explore Courses",
        link: "/dashboard"
    },
    {
        id: 2,
        image: "/slider2.png",
        title: "Learn Anywhere, Anytime",
        subtitle: "Flexible learning paths designed for the modern student and professional.",
        cta: "Get Started",
        link: "/signup"
    },
    {
        id: 3,
        image: "/slider3.png",
        title: "AI-Powered Excellence",
        subtitle: "Turn concepts into comprehensive interactive courses in minutes.",
        cta: "Start Creating",
        link: "/dashboard"
    }
];

const ImageSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 6000);
        return () => clearInterval(timer);
    }, [currentSlide]);

    const nextSlide = () => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    return (
        <div className="relative h-[600px] md:h-[700px] lg:h-[800px] w-full overflow-hidden bg-slate-900">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.5 }
                    }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full max-w-7xl mx-auto px-6 md:px-10 flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="max-w-2xl"
                        >
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                                {slides[currentSlide].title}
                            </h1>
                            <p className="text-lg md:text-xl text-slate-200 mb-10 leading-relaxed max-w-lg">
                                {slides[currentSlide].subtitle}
                            </p>
                            <Button
                                onClick={() => navigate(slides[currentSlide].link)}
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-white font-bold h-14 px-8 rounded-full shadow-2xl shadow-primary/40 group overflow-hidden relative"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {slides[currentSlide].cta}
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </span>
                                <motion.div
                                    className="absolute inset-0 bg-white/10"
                                    initial={{ x: '-100%' }}
                                    whileHover={{ x: '100%' }}
                                    transition={{ duration: 0.4 }}
                                />
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 hidden md:flex"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 hidden md:flex"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setDirection(index > currentSlide ? 1 : -1);
                            setCurrentSlide(index);
                        }}
                        className={`h-2 transition-all duration-300 rounded-full ${index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageSlider;
