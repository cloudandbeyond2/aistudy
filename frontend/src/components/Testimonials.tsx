
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { appName, serverURL } from '@/constants';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

interface Testimonial {
  _id: string;
  userName: string;
  message: string;
  rating: number;
  profession: string;
}

const DEFAULT_TESTIMONIALS = [
  {
    _id: '1',
    userName: "Sarah Johnson",
    message: `${appName} saved me at least 40 hours of work on my last course. What used to take weeks now takes minutes, and the quality is even better.`,
    rating: 5,
    profession: "Online Course Creator"
  },
  {
    _id: '2',
    userName: "Prof. David Chen",
    message: `As a university professor, I was skeptical about AI-generated content. But ${appName} perfectly structured my research into a comprehensive course for my students.`,
    rating: 5,
    profession: "Computer Science Department"
  },
  {
    _id: '3',
    userName: "Michael Rodriguez",
    message: `Our training team uses ${appName} to create onboarding content for new employees. We've reduced development time by 80% while improving engagement metrics.`,
    rating: 5,
    profession: "Head of L&D, TechCorp"
  },
  {
    _id: '4',
    userName: "Emma Wilson",
    message: "The quiz generation feature alone is worth the subscription. It creates thoughtful assessments that actually test comprehension, not just memorization.",
    rating: 4,
    profession: "Educational Consultant"
  }
];

const Testimonials = () => {
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${serverURL}/api/testimonials`);
      if (response.data.success && response.data.testimonials && response.data.testimonials.length > 0) {
        setTestimonials(response.data.testimonials);
      } else {
        // Use default testimonials if no approved testimonials found
        setTestimonials(DEFAULT_TESTIMONIALS);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Use default testimonials on error
      setTestimonials(DEFAULT_TESTIMONIALS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && testimonials.length > 0) {
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-up');
            entry.target.classList.remove('opacity-0');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      const titleEl = document.querySelector('.testimonials-title');
      if (titleEl) observer.observe(titleEl);

      const elements = testimonialsRef.current?.querySelectorAll('.testimonial-item');
      elements?.forEach((el, index) => {
        el.setAttribute('style', `transition-delay: ${index * 100}ms`);
        observer.observe(el);
      });

      return () => {
        if (titleEl) observer.unobserve(titleEl);
        elements?.forEach(el => {
          observer.unobserve(el);
        });
      };
    }
  }, [isLoading, testimonials]);

  if (isLoading) {
    return (
      <section className="py-20 md:py-32 px-6 md:px-10 bg-secondary/50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <Skeleton className="inline-block px-3 py-1 rounded-full h-6 w-24 mb-4" />
            <Skeleton className="h-12 w-full max-w-2xl mx-auto mb-4" />
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-32 px-6 md:px-10 bg-secondary/50 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
            Testimonials
          </span>
          <h2 className="testimonials-title opacity-0 font-display text-3xl md:text-4xl lg:text-5xl font-bold">
            Trusted by <span className="text-primary">Educators</span> &<br className="hidden md:block" />
            <span className="text-primary">Learning Professionals</span>
          </h2>
        </div>

        <div
          ref={testimonialsRef}
          className="grid md:grid-cols-2 gap-8"
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial._id}
              className="testimonial-item opacity-0 bg-card shadow-sm hover:shadow-md transition-all duration-300 rounded-xl p-8 border border-border/50 flex flex-col"
            >
              <div className="flex mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
                {Array.from({ length: 5 - testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-muted-foreground" />
                ))}
              </div>
              <blockquote className="flex-1 text-lg font-medium mb-6">
                "{testimonial.message}"
              </blockquote>
              <div>
                <p className="font-semibold">{testimonial.userName}</p>
                <p className="text-muted-foreground text-sm">{testimonial.profession}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
