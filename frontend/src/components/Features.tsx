import React, { useState } from 'react';
import { Zap, Book, Layers, BarChart, PenLine, RotateCw, Briefcase, Award, Users, FileText, Calendar, Video, Laptop } from 'lucide-react';
import { motion, easeOut, AnimatePresence } from 'framer-motion';

const featuresData = {
  students: [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI Course Generation",
      description: "Advanced AI algorithms analyze your inputs to auto-generate comprehensive courses instantly."
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Interactive AI Notebook",
      description: "Engage with an intelligent AI notebook that helps you document, summarize, and understand complex topics."
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Skill-Based Resume Builder",
      description: "Build a professional, skill-highlighted resume tailored to your specific career goals and achievements."
    },
    {
      icon: <Laptop className="h-6 w-6" />,
      title: "Portfolio & Projects",
      description: "Create stunning public portfolios and submit your work to the career hub project submission portal."
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Certificate Download",
      description: "Instantly download verified certificates upon completing your courses to showcase your new skills."
    },
    {
      icon: <Book className="h-6 w-6" />,
      title: "Online & Offline Courses",
      description: "Access a wide variety of interactive courses online or download materials for seamless offline learning."
    },
    {
      icon: <PenLine className="h-6 w-6" />,
      title: "Smart Assignments",
      description: "Tackle auto-generated quizzes, assignments, and dynamic assessments to reinforce your learning."
    },
    {
      icon: <RotateCw className="h-6 w-6" />,
      title: "AI Teacher Chat",
      description: "Get immediate answers to your questions from our specialized AI tutor while learning."
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Interview Preparation",
      description: "Premium access to daily current affairs, aptitude tests, and instantly generated AI quizzes."
    }
  ],
  organizations: [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Student Management",
      description: "Easily onboard, track, and manage student cohorts, their learning progress, and overall performance."
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Staff Management",
      description: "Manage faculty and staff roles, administrative permissions, and department assignments seamlessly."
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Schedule Management",
      description: "Organize classes, academic events, and comprehensive learning schedules efficiently across the organization."
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Online Meetings",
      description: "Integrated online meeting tools for virtual classrooms, remote faculty syncs, and direct student support."
    },
    {
      icon: <PenLine className="h-6 w-6" />,
      title: "Assignment Tracking",
      description: "Create, distribute, and track assignments across different departments and individual classes."
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Placement Readiness",
      description: "Track and improve student employability with AI-driven scoring and detailed placement analytics."
    },
    {
      icon: <Laptop className="h-6 w-6" />,
      title: "Project Galleries",
      description: "Centralized showcases for student portfolios and career hub project submissions to present to hiring partners."
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Verified Credentials",
      description: "Issue blockchain-secured certificates that employers and partners can verify instantly."
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Interview Preparation",
      description: "Empower students with premium access to current affairs, aptitude tests, and AI-driven mock quizzes."
    }
  ]
};

const Features = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'organizations'>('students');

  return (
    <section id="features" className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">
            Our Excellence
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-slate-900 dark:text-white leading-tight">
            Powerful Features for Modern <br className="hidden md:block" /> Learning Experience
          </h2>

          <div className="inline-flex p-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-12">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'students' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              For Students
            </button>
            <button
              onClick={() => setActiveTab('organizations')}
              className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'organizations' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              For Organizations
            </button>
          </div>
        </motion.div>

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, staggerChildren: 0.1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featuresData[activeTab].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-8 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />

                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Features;
