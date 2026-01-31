import React from 'react';
import { Zap, Book, Layers, BarChart, PenLine, RotateCw } from 'lucide-react';
import { motion, easeOut } from "framer-motion";


const features = [
  {
    icon: <Zap className="h-8 w-8" />,
    title: "AI Generation",
    description: "Our advanced AI algorithms analyze your inputs to generate comprehensive courses."
  },
  {
    icon: <Book className="h-8 w-8" />,
    title: "Course Formats",
    description: "Choose between Image + Theory or Video + Theory formats for a personalized learning journey."
  },
  {
    icon: <PenLine className="h-8 w-8" />,
    title: "Smart Quizzes",
    description: "Generate relevant quizzes, assessments, and interactive elements to reinforce learning outcomes."
  },
  {
    icon: <Layers className="h-8 w-8" />,
    title: "Multilanguage",
    description: "Generate AI images, videos, or textual courses in 23+ multiple languages."
  },
  {
    icon: <RotateCw className="h-8 w-8" />,
    title: "AI Teacher Chat",
    description: "Chat with AI teacher to get answers to your questions while learning."
  },
  {
    icon: <BarChart className="h-8 w-8" />,
    title: "Export Tools",
    description: "Download your generated course in various formats for offline access."
  }
];

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // const itemVariants = {
  //   hidden: { opacity: 0, y: 20 },
  //   visible: {
  //     opacity: 1,
  //     y: 0,
  //     transition: {
  //       duration: 0.5,
  //       ease: "easeOut"
  //     }
  //   }
  // };
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeOut,
    },
  },
};

  return (
    <section id="features" className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Our Excellence</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
            Powerful Features for Modern <br className="hidden md:block" /> Learning Experience
          </h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group bg-slate-50 hover:bg-white p-10 rounded-3xl border border-slate-100 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-2xl"
            >
              <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center mb-8 text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
