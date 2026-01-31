import React from 'react';
import ImageSlider from './ImageSlider';

const Hero = () => {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      <div className="absolute inset-0 bg-grid-slate-900/[0.02] bg-[center_top] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative">
        <ImageSlider />
      </div>

      {/* Stats / Proof Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {[
            { label: "Students", value: "50k+" },
            { label: "Active Courses", value: "2.5k+" },
            { label: "Expert Instructors", value: "450+" },
            { label: "Satisfaction Rate", value: "99.9%" }
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
