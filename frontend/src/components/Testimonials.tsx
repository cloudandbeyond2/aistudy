import React, { useEffect, useState } from "react";
import { motion, Variants, easeOut } from "framer-motion";
import { Star } from "lucide-react";
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

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeOut,
    },
  },
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/testimonials`);

        if (response.data?.success) {
          const approvedTestimonials = response.data.testimonials.filter(
            (t: Testimonial) => t.approved
          );
          setTestimonials(approvedTestimonials);
        }
      } catch (error) {
        setTestimonials([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="testimonials"
      className="py-20 md:py-28 bg-muted/30 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="text-primary font-bold tracking-widest uppercase text-xs sm:text-sm mb-3 block">
            Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 text-foreground leading-tight">
            Trusted by Learners <br className="hidden md:block" /> Around the Globe
          </h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
        </motion.div>

        {/* Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 3000,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial) => (
              <CarouselItem
                key={testimonial._id}
                className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="bg-card p-6 sm:p-8 h-full rounded-3xl border border-border text-center flex flex-col items-center transition hover:shadow-lg"
                >
                  {/* Avatar */}
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary mb-4">
                    {testimonial.userName.charAt(0)}
                  </div>

                  {/* Name */}
                  <h4 className="font-semibold text-lg text-foreground">
                    {testimonial.userName}
                  </h4>

                  {/* Profession */}
                  <p className="text-primary text-sm mb-3">
                    {testimonial.profession}
                  </p>

                  {/* Rating */}
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>

                  {/* Message */}
                  <p className="text-muted-foreground italic text-sm sm:text-base leading-relaxed">
                    “{testimonial.message}”
                  </p>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Arrows (desktop only) */}
          <div className="hidden xl:block">
            <CarouselPrevious className="-left-12 hover:bg-primary hover:text-white border-primary/20" />
            <CarouselNext className="-right-12 hover:bg-primary hover:text-white border-primary/20" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default Testimonials;