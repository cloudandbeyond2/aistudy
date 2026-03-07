import React from 'react';
import { motion, easeOut } from 'framer-motion';
import { Briefcase, FileText, CheckCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

const solutions = [
    {
        title: "Placement Readiness",
        description: "AI-driven scoring system to evaluate and improve student employability based on real-world metrics and industry requirements.",
        icon: <BarChartIcon className="h-6 w-6" />,
        color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "AI Resume Builder",
        description: "Automated CV structuring that highlights core competencies, project work, and academic achievements tailored for organizations.",
        icon: <FileText className="h-6 w-6" />,
        color: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
        image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Project Showcase",
        description: "A centralized gallery displaying student developer portfolios, rich code metadata, and live application links in one place.",
        icon: <Database className="h-6 w-6" />,
        color: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Verified Certificates",
        description: "Blockchain-secured digital credentials distributed across the organization with built-in instant verification.",
        icon: <CheckCircle className="h-6 w-6" />,
        color: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
        image: "https://images.unsplash.com/photo-1589330694653-efa6475306e1?q=80&w=2070&auto=format&fit=crop"
    }
];

function BarChartIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" x2="12" y1="20" y2="10" />
            <line x1="18" x2="18" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="16" />
        </svg>
    )
}

const OrgSolutions = () => {
    return (
        <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">
                        For Organizations
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
                        Streamline Student Placement & <br className="hidden md:block" /> Career Management
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
                        A complete suite of tools to bridge the gap between academic institutions and the professional world. Elevate your organization's placement capabilities.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-stretch">
                    {solutions.map((solution, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1, ease: easeOut }}
                            className="flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="md:w-2/5 h-48 md:h-auto overflow-hidden relative">
                                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply z-10" />
                                <img
                                    src={solution.image}
                                    alt={solution.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <div className="md:w-3/5 p-8 flex flex-col justify-center">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${solution.color}`}>
                                    {solution.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                                    {solution.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                                    {solution.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 text-center"
                >
                    <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-primary/25 transition-all">
                        Partner With Us
                        <Briefcase className="ml-2 h-5 w-5" />
                    </Button>
                </motion.div>
            </div>
        </section>
    );
};

export default OrgSolutions;
