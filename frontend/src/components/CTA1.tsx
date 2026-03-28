import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA1 = () => {
  const navigate = useNavigate();

  return (
    <section 
      className="py-24 md:py-32 relative overflow-hidden min-h-[600px] flex items-center"
      style={{
        background: "linear-gradient(90deg, #1b253f 0%, #2d3a8c 30%, #4b3bb0 65%, #6b2cc1 100%)"
      }}
    >
      {/* Background blobs for extra depth */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400 rounded-full blur-[150px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500 rounded-full blur-[150px] -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 md:p-20 rounded-[48px] shadow-2xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-bold mb-8 border border-white/20">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span>Ready to get started?</span>
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
              Build your learning space <br className="hidden md:block" />
              with AI.
            </h2>

            {/* Subtitle */}
            <p className="text-xl text-blue-100/80 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Create courses, organize schedules, and explore role-based tools
              in one clean platform. Join the future of education today.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => navigate("/signup")}
                size="lg"
                className="bg-white text-indigo-900 hover:bg-blue-50 font-black text-xl h-18 px-14 rounded-full shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 group"
              >
                Start Free
                <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA1;
