import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Layers3,
  Laptop,
  MessageSquare,
  Rocket,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Brain,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Testimonials from '@/components/Testimonials';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { appName } from '@/constants';

const clientLogos = [
  '/bexon/images/brand-1.webp',
  '/bexon/images/brand-2.webp',
  '/bexon/images/brand-3.webp',
  '/bexon/images/brand-4.webp',
  '/bexon/images/brand-5.webp',
  '/bexon/images/brand-6.webp',
];

const featureCards = [
  {
    icon: Sparkles,
    title: 'AI Learning Engine',
    description: 'Generate courses, lesson flows, notes, summaries, and topic outlines from one prompt.',
    points: ['Course outlines', 'Study notes', 'Theory support'],
  },
  {
    icon: Brain,
    title: 'Smart Learning Workspace',
    description: 'Capture notes, summarize concepts, and keep a clean learning workspace for every user.',
    points: ['Summaries', 'Revision notes', 'Study prompts'],
  },
  {
    icon: CalendarDays,
    title: 'Lesson Planner',
    description: 'Organize class schedules, sessions, and learning timelines with a single planning flow.',
    points: ['Daily agenda', 'Weekly view', 'Timeline control'],
  },
  {
    icon: Target,
    title: 'Assessment Builder',
    description: 'Create assignments, quizzes, and checks that help measure progress clearly.',
    points: ['Quizzes', 'Assignments', 'Progress checks'],
  },
  {
    icon: FileText,
    title: 'Career Toolkit',
    description: 'Build a polished resume and interview prep flow for job seekers and graduates.',
    points: ['Resume builder', 'Interview prep', 'Export ready'],
  },
  {
    icon: Award,
    title: 'Certificates & Outcomes',
    description: 'Track certificates, readiness, and career progress with measurable outcomes.',
    points: ['Verified proof', 'Placement view', 'Readiness tracking'],
  },
  {
    icon: MessageSquare,
    title: 'Support & Collaboration',
    description: 'Handle learner, staff, and organization requests in one response workflow.',
    points: ['Unified inbox', 'Status tracking', 'Role filters'],
  },
  {
    icon: TrendingUp,
    title: 'Attendance & Reporting',
    description: 'Keep an eye on attendance, completion, and performance with clear reporting.',
    points: ['Attendance', 'Completion', 'Analytics'],
  },
];

const audienceCards = [
  {
    icon: Users,
    title: 'Schools',
    items: ['Teacher dashboard', 'Class schedule cards', 'Attendance sidebar', 'Assignment inbox'],
  },
  {
    icon: GraduationCap,
    title: 'Universities',
    items: ['Department overview', 'Timetable grid', 'Course progress', 'Academic reports'],
  },
  {
    icon: Building2,
    title: 'Organizations',
    items: ['Admin console', 'Onboarding flow', 'KPI tiles', 'Workflow routing'],
  },
  {
    icon: BarChart3,
    title: 'Job Seekers',
    items: ['Resume workspace', 'Interview checklist', 'Certificate shelf', 'Career progress'],
  },
];

const workflowSteps = [
  {
    step: '01',
    title: 'Choose your audience',
    description: 'The interface adapts for schools, universities, organizations and job seekers.',
  },
  {
    step: '02',
    title: 'Generate content',
    description: 'Create courses, lesson flows, notes, and learning plans from one system.',
  },
  {
    step: '03',
    title: 'Track learning',
    description: 'Monitor assignments, schedules, reports, and completion states with clear visuals.',
  },
  {
    step: '04',
    title: 'Scale across places',
    description: 'Use the same smart learning system across campuses, teams, and training centers.',
  },
];

const sectionHeading = 'mx-auto max-w-3xl text-center';
const featureCardClass =
  "group relative h-full overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_34px_90px_-48px_rgba(8,145,178,0.38)]";
const audienceCardClass =
  "group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/7 hover:shadow-[0_30px_80px_-42px_rgba(34,211,238,0.2)]";
const logoTileClass =
  "group flex items-center justify-center rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:bg-white hover:shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)]";

const getDashboardPath = () => {
  const role = sessionStorage.getItem('role') || '';
  if (role === 'student') return '/dashboard/student';
  if (role === 'dept_admin') return '/dashboard/dept';
  if (role === 'org_admin') return '/dashboard/org';
  return '/dashboard';
};

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleHashLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const destinationElement = document.getElementById(href.substring(1));
      if (!destinationElement) return;

      e.preventDefault();
      window.scrollTo({
        top: destinationElement.offsetTop - 80,
        behavior: 'smooth',
      });
      window.history.pushState(null, '', href);
    };

    document.addEventListener('click', handleHashLinkClick);
    return () => document.removeEventListener('click', handleHashLinkClick);
  }, []);

  const handlePrimaryAction = () => {
    const uid = sessionStorage.getItem('uid');
    navigate(uid ? getDashboardPath() : '/login');
  };

  const handleOrganizationAction = () => {
    navigate('/organization-enquiry');
  };

  const handleContactAction = () => {
    navigate('/contact');
  };

  const heroHighlights = [
    'Generate learning content, study notes, outlines, and learning plans from one system.',
    'Built for schools, universities, organizations and job seekers.',
    'Responsive design with a calm hierarchy and clear navigation.',
  ];

  const platformMetrics = [
    { label: 'Learners reached', value: '50K+' },
    { label: 'Institutions', value: '250+' },
    { label: 'Career outcomes', value: '94%' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <SEO title="Home" description="Colossus IQ is an AI-based learning system for schools, universities, organizations and job seekers." />
      <Header />

      <main className="bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.08),transparent_30%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)]">
        <section id="home" className="relative overflow-hidden bg-[#06101d] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_30%),linear-gradient(180deg,rgba(6,16,29,1)_0%,rgba(8,13,24,1)_100%)]" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-8 mix-blend-screen"
            style={{ backgroundImage: "url('/bexon/images/pattern-bg.webp')" }}
          />
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 md:px-6 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:px-8 lg:py-28">
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-7"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold text-cyan-100 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Colossus IQ is an AI-based learning system
              </div>

              <div className="space-y-4">
                <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                  Smart learning for schools, universities, organizations and job seekers.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  {appName} connects AI-powered learning workflows, scheduling, assessments, resumes, support,
                  and role-based dashboards into one smart platform for modern institutions and teams.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handlePrimaryAction} className="h-12 rounded-full bg-white px-6 text-slate-950 hover:bg-slate-100">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => navigate('/pricing/individual')}
                  variant="outline"
                  className="h-12 rounded-full border-cyan-400/20 bg-white/5 px-6 text-white hover:border-cyan-300/30 hover:bg-white/10 hover:text-white"
                >
                  View Pricing
                </Button>
                <Button
                  onClick={() => scrollToSection('features')}
                  variant="ghost"
                  className="h-12 rounded-full px-6 text-slate-200 hover:bg-white/10 hover:text-white"
                >
                  Explore Features
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                {platformMetrics.map((item) => (
                  <div key={item.label} className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/10 hover:shadow-[0_18px_50px_-30px_rgba(45,212,191,0.24)]">
                    <div className="text-2xl font-semibold text-white">{item.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3">
                {heroHighlights.map((item) => (
                  <div key={item} className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/10 hover:shadow-[0_18px_50px_-30px_rgba(45,212,191,0.2)]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-300" />
                    <p className="text-sm leading-6 text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-1 rounded-[34px] bg-gradient-to-tr from-cyan-400/40 via-sky-400/25 to-emerald-400/25 blur-2xl opacity-60" />
              <div className="group relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-2 pb-28 shadow-[0_32px_120px_-60px_rgba(6,16,29,0.95)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_36px_140px_-60px_rgba(45,212,191,0.24)] sm:pb-2">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="overflow-hidden rounded-[26px] bg-slate-900">
                  <img
                    src="/bexon/images/hero-img.webp"
                    alt="Colossus IQ dashboard preview"
                    className="h-[280px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:h-[360px] lg:h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
                </div>

                <div className="absolute left-4 top-4 rounded-3xl border border-cyan-300/20 bg-slate-950/50 px-3 py-2 backdrop-blur sm:left-6 sm:top-6 sm:px-4 sm:py-3">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-300">Live platform</p>
                  <div className="mt-1 text-3xl font-semibold text-white">24/7</div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 rounded-[24px] border border-white/10 bg-slate-950/80 p-3 backdrop-blur sm:bottom-5 sm:left-5 sm:right-5 sm:p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { label: 'AI content', value: 'Generated fast', icon: BookOpen },
                      { label: 'Learning', value: 'Smart + guided', icon: CalendarDays },
                      { label: 'Support', value: 'Role aware', icon: MessageSquare },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/10 hover:shadow-[0_18px_50px_-30px_rgba(34,211,238,0.18)]">
                        <div className="flex items-center gap-2 text-cyan-100">
                          <item.icon className="h-4 w-4" />
                          <span className="text-xs uppercase tracking-[0.25em] text-slate-300">{item.label}</span>
                        </div>
                        <div className="mt-2 text-sm font-semibold text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="px-4 py-20 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className={sectionHeading}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Core features
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                Practical tools for content, learning, assessment, and career readiness.
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                Schools, universities, organizations, training centers, and job seekers can all use the same
                system to manage learning and track outcomes.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {featureCards.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                >
                  <Card className={`${featureCardClass} group/card`}>
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_30%),linear-gradient(180deg,rgba(6,16,29,0.98)_0%,rgba(8,13,24,0.98)_100%)]" />
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-[0.08] mix-blend-screen"
                        style={{ backgroundImage: "url('/bexon/images/pattern-bg.webp')" }}
                      />
                    </div>
                    <CardHeader className="space-y-4">
                      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
                      <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover/card:scale-110 group-hover/card:bg-white/10 group-hover/card:text-cyan-100">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="relative text-xl transition-colors duration-300 group-hover/card:text-white">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="relative text-sm leading-7 transition-colors duration-300 group-hover/card:text-slate-300">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-2 pb-6">
                      {item.points.map((point) => (
                        <div key={point} className="flex items-center gap-2 text-sm text-slate-700 transition-colors duration-300 group-hover/card:text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-primary transition-colors duration-300 group-hover/card:text-cyan-300" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="px-4 pb-20 md:px-6 lg:px-8">
          <div className="group relative mx-auto max-w-7xl rounded-[40px] border border-white/10 bg-slate-950 px-6 py-10 text-white shadow-[0_32px_100px_-60px_rgba(15,23,42,0.95)] transition-all duration-300 hover:border-cyan-300/20 hover:shadow-[0_34px_120px_-60px_rgba(34,211,238,0.22)] md:px-10 md:py-14">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <motion.div
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                  <Layers3 className="h-3.5 w-3.5" />
                  Built for every audience
                </div>
                <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  One smart learning system for schools, universities, organizations, and job seekers.
                </h2>
                <p className="max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                  Each audience gets a tailored dashboard, navigation pattern, and action set, while the learning
                  flow and reporting stay consistent across the product.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    'Schools get class-first dashboards and attendance tools.',
                    'Universities get timetable and department views.',
                    'Organizations get staff, onboarding, and KPI controls.',
                    'Job seekers get career, resume, and interview tools.',
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200 backdrop-blur">
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45 }}
                className="grid gap-4 sm:grid-cols-2"
              >
                {audienceCards.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`${audienceCardClass} group/audience`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-transform duration-300 group-hover/audience:scale-110">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Audience</p>
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {item.items.map((subItem) => (
                        <div key={subItem} className="flex items-center gap-2 text-sm text-slate-300 transition-transform duration-300 group-hover/audience:translate-x-1">
                          <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                          <span>{subItem}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-4 pb-20 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[34px] border border-slate-200/80 bg-white/90 px-5 py-10 shadow-[0_28px_80px_-55px_rgba(15,23,42,0.28)] md:px-8 md:py-14 lg:px-10">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="rounded-full px-4 py-1.5">
                <Clock className="mr-2 h-3.5 w-3.5" />
                How it works
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                A simple path from discovery to setup, learning, and growth.
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                The flow is arranged to reduce friction, keep decisions obvious, and help each audience move through the product with confidence.
              </p>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <motion.div
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                className="relative"
              >
                <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-slate-50 shadow-[0_26px_60px_-42px_rgba(15,23,42,0.28)]">
                  <img
                    src="/bexon/images/about-1.webp"
                    alt="Smart learning preview"
                    className="h-[360px] w-full object-cover sm:h-[420px]"
                  />
                </div>
                <div className="absolute -bottom-5 left-5 max-w-[240px] rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.18)]">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Experience</div>
                  <div className="mt-1 text-3xl font-semibold text-slate-950">13+</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">
                    Built for real learning workflows across institutions and teams.
                  </div>
                </div>
              </motion.div>

              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {workflowSteps.map((item) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.35 }}
                      className="group relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-slate-50 p-5 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.2)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_24px_60px_-36px_rgba(8,145,178,0.3)]"
                    >
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_30%),linear-gradient(180deg,rgba(6,16,29,0.98)_0%,rgba(8,13,24,0.98)_100%)]" />
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-[0.08] mix-blend-screen"
                          style={{ backgroundImage: "url('/bexon/images/pattern-bg.webp')" }}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary transition-all duration-300 group-hover:bg-white/10 group-hover:text-cyan-100">
                          {item.step}
                        </div>
                        <h3 className="relative text-lg font-semibold text-slate-950 transition-colors duration-300 group-hover:text-white">
                          {item.title}
                        </h3>
                      </div>
                      <p className="relative mt-3 text-sm leading-7 text-slate-600 transition-colors duration-300 group-hover:text-slate-300">
                        {item.description}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.16)]">
                  <div className="flex flex-wrap gap-2">
                    {['Responsive layouts', 'Soft surfaces', 'AI-based learning', 'Learning at scale'].map((item) => (
                      <Badge key={item} variant="secondary" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700 hover:bg-slate-100">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="group relative rounded-[34px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_28px_80px_-55px_rgba(15,23,42,0.35)] transition-all duration-300 hover:border-primary/25 hover:shadow-[0_34px_90px_-50px_rgba(15,23,42,0.35)] md:p-8">
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="text-center">
                <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Trusted by Teams</div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                  Used by Schools, Universities, Companies, and Training Institutions that need structure and visibility.
                </h2>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {clientLogos.map((logo) => (
                  <div key={logo} className={logoTileClass}>
                    <img src={logo} alt="Client logo" className="max-h-10 w-auto object-contain opacity-90 transition-transform duration-300 group-hover:scale-105" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Testimonials />

        <section id="contact" className="px-4 pb-20 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="group relative rounded-[34px] bg-slate-950 px-6 py-10 text-white transition-all duration-300 hover:shadow-[0_34px_120px_-60px_rgba(34,211,238,0.18)] md:px-10">
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-cyan-100">
                    <Rocket className="h-3.5 w-3.5" />
                    Colossus IQ for modern learning teams
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                    Join with a custom setup for learning, growth, and operational scale.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                    Share your goals, team size, timeline, and support needs so we can route you to the right enquiry path.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button onClick={handleOrganizationAction} className="h-12 rounded-full bg-white px-6 text-slate-950 transition-all duration-300 hover:bg-slate-100 hover:shadow-[0_18px_40px_-24px_rgba(255,255,255,0.4)]">
                    Request a Demo
                  </Button>
                  <Button
                    onClick={handleContactAction}
                    variant="outline"
                    className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white hover:shadow-[0_18px_40px_-24px_rgba(34,211,238,0.18)]"
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
