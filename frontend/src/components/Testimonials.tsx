import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import axios from "axios";
import { serverURL } from "@/constants";
import { Skeleton } from "@/components/ui/skeleton";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-muted/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-primary font-semibold uppercase tracking-wider text-xs sm:text-sm">
            Testimonials
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mt-2">
            What Our Users Say
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Carousel */}
        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[Autoplay({ delay: 2500 })]}
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((t) => {
              const isExpanded = expandedId === t._id;
              const isLong = t.message.length > 120;

              return (
                <CarouselItem
                  key={t._id}
                  className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <motion.div
                    onClick={() =>
                      setExpandedId(isExpanded ? null : t._id)
                    }
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="cursor-pointer group relative h-full bg-card border border-border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden before:absolute before:inset-0 before:opacity-0 before:transition-all before:duration-300 before:bg-gradient-to-br before:from-primary/10 before:via-primary/5 before:to-transparent hover:before:opacity-100"
                  >
                    {/* Quote icon */}
                    <Quote className="absolute opacity-5 w-10 h-10 top-4 right-4" />

                    {/* Message */}
                    <p className="text-sm sm:text-base text-muted-foreground italic mb-3">
                      “
                      {isExpanded || !isLong
                        ? t.message
                        : t.message.slice(0, 120) + "..."}
                      ”
                    </p>

                    {isLong && (
                      <span className="text-primary text-xs font-semibold mb-4">
                        {isExpanded ? "Show less" : "Read more"}
                      </span>
                    )}

                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < t.rating
                              ? "fill-primary text-primary"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>

                    {/* User */}
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {t.userName?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {t.userName}
                        </p>
                        <p className="text-xs text-primary truncate">
                          {t.profession}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Navigation */}
          <div className="hidden xl:flex">
            <CarouselPrevious className="-left-10" />
            <CarouselNext className="-right-10" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default Testimonials;