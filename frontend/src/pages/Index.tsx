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
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { appName, FreeCost, MonthCost, YearCost } from '@/constants';

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
    description: 'The interface adapts for schools, universities, organizations, and job seekers.',
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

const pricingPlans = [
  {
    name: 'Free',
    price: FreeCost,
    billing: '7 days access',
    featured: false,
    features: ['AI content chat', '1 course creation', 'Certificate download', 'Basic support'],
  },
  {
    name: 'Monthly',
    price: MonthCost,
    billing: 'per month',
    featured: true,
    features: ['Course generation', 'Smart workspace', 'Resume Builder', 'Interview Prep', 'Priority support'],
  },
  {
    name: 'Yearly',
    price: YearCost,
    billing: 'per year',
    featured: false,
    features: ['Unlimited courses', 'Video + theory modules', 'Advanced analytics', 'Priority support'],
  },
];

const sectionHeading = 'mx-auto max-w-3xl text-center';

const getDashboardPath = () => {
  const role = sessionStorage.getItem('role') || '';
  if (role === 'student') return '/dashboard/student';
  if (role === 'dept_admin') return '/dashboard/staff';
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

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    window.scrollTo({
      top: section.offsetTop - 80,
      behavior: 'smooth',
    });
  };

  const heroHighlights = [
    'Generate learning content, study notes, outlines, and learning plans from one system.',
    'Built for schools, universities, organizations, and job seekers.',
    'Responsive design with a calm hierarchy and clear navigation.',
  ];

  const platformMetrics = [
    { label: 'Learners reached', value: '50K+' },
    { label: 'Institutions', value: '250+' },
    { label: 'Career outcomes', value: '94%' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <SEO title="Home" description="Colossus IQ is an AI-based learning system for schools, universities, organizations, and job seekers." />
      <Header />

      <main className="bg-[radial-gradient(circle_at_top_left,rgba(30,138,138,0.08),transparent_30%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)]">
        <section id="home" className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,138,138,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_30%)]" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-screen"
            style={{ backgroundImage: "url('/bexon/images/pattern-bg.webp')" }}
          />
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 md:px-6 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:px-8 lg:py-28">
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-7"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-cyan-100 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Colossus IQ is an AI-based learning system
              </div>

              <div className="space-y-4">
                <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                  Smart learning for schools, universities, organizations, and job seekers.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  {appName} connects AI-powered learning workflows, scheduling, assessments, resumes, support,
                  and role-based dashboards into one smart platform for modern institutions and teams.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handlePrimaryAction} className="h-12 rounded-full bg-primary px-6 text-white hover:bg-primary/90">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => scrollToSection('pricing')}
                  variant="outline"
                  className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
                >
                  View Pricing
                </Button>
                <Button
                  onClick={() => scrollToSection('features')}
                  variant="ghost"
                  className="h-12 rounded-full px-6 text-white hover:bg-white/10 hover:text-white"
                >
                  Explore Features
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                {platformMetrics.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                    <div className="text-2xl font-semibold text-white">{item.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3">
                {heroHighlights.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
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
              <div className="absolute -inset-1 rounded-[34px] bg-gradient-to-tr from-primary/50 via-cyan-400/30 to-blue-500/40 blur-2xl opacity-60" />
              <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-2 pb-28 shadow-[0_32px_120px_-60px_rgba(15,23,42,0.95)] backdrop-blur sm:pb-2">
                <div className="overflow-hidden rounded-[26px] bg-slate-900">
                  <img
                    src="/bexon/images/hero-img.webp"
                    alt="Colossus IQ dashboard preview"
                    className="h-[280px] w-full object-cover sm:h-[360px] lg:h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
                </div>

                <div className="absolute left-4 top-4 rounded-3xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur sm:left-6 sm:top-6 sm:px-4 sm:py-3">
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
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
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
                  <Card className="group h-full overflow-hidden border-slate-200/80 bg-white/90 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_34px_80px_-45px_rgba(15,23,42,0.42)]">
                    <CardHeader className="space-y-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <CardDescription className="text-sm leading-7">{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pb-6">
                      {item.points.map((point) => (
                        <div key={point} className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
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
          <div className="mx-auto max-w-7xl rounded-[40px] border border-white/10 bg-slate-950 px-6 py-10 text-white shadow-[0_32px_100px_-60px_rgba(15,23,42,0.95)] md:px-10 md:py-14">
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
                    className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur"
                  >
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Audience</p>
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {item.items.map((subItem) => (
                        <div key={subItem} className="flex items-center gap-2 text-sm text-slate-300">
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
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <motion.div
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                className="relative"
              >
                <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_28px_80px_-55px_rgba(15,23,42,0.35)]">
                  <img src="/bexon/images/about-1.webp" alt="Smart learning preview" className="h-[420px] w-full object-cover" />
                </div>
                <div className="absolute -bottom-5 left-5 rounded-[24px] border border-white/40 bg-white/95 p-4 shadow-lg">
                  <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Experience</div>
                  <div className="mt-1 text-3xl font-semibold text-slate-950">13+</div>
                  <div className="mt-1 max-w-[220px] text-sm text-muted-foreground">
                    Built for real learning workflows across institutions and teams.
                  </div>
                </div>
              </motion.div>

              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                    <Clock className="h-3.5 w-3.5" />
                    How it works
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                    A clean workflow from discovery to setup, learning, and scale.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                    The site uses strong hierarchy and a guided flow to make the AI-based learning platform feel understandable
                    at first glance.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {workflowSteps.map((item) => (
                    <div key={item.step} className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                          {item.step}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5">
                  <div className="flex flex-wrap gap-2">
                    {['Responsive layouts', 'Soft glass surfaces', 'AI-based learning', 'Learning at scale'].map((item) => (
                      <Badge key={item} variant="secondary" className="rounded-full px-3 py-1">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 py-20 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className={sectionHeading}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                <BarChart3 className="h-3.5 w-3.5" />
                Pricing plans
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                Simple pricing for learners, staff, and organizations.
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                    Clear tiers, no clutter, and a simple presentation that helps people compare quickly.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.07 }}
                  className={[
                    'relative rounded-[28px] border p-6 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)] transition-transform duration-300 hover:-translate-y-1',
                    plan.featured
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200/80 bg-white/90',
                  ].join(' ')}
                >
                  {plan.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
                      Most popular
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className={`text-xs uppercase tracking-[0.3em] ${plan.featured ? 'text-cyan-100' : 'text-muted-foreground'}`}>
                      {plan.name}
                    </p>
                    <div className={`text-4xl font-semibold ${plan.featured ? 'text-white' : 'text-slate-950'}`}>
                      ${plan.price}
                    </div>
                    <p className={`text-sm ${plan.featured ? 'text-slate-300' : 'text-muted-foreground'}`}>
                      {plan.billing}
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className={`h-4 w-4 ${plan.featured ? 'text-cyan-300' : 'text-primary'}`} />
                        <span className={plan.featured ? 'text-slate-200' : 'text-slate-700'}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={[
                      'mt-8 h-12 w-full rounded-full',
                      plan.featured
                        ? 'bg-white text-slate-950 hover:bg-slate-100'
                        : 'bg-primary text-white hover:bg-primary/90',
                    ].join(' ')}
                  >
                    Choose {plan.name}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[34px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_28px_80px_-55px_rgba(15,23,42,0.35)] md:p-8">
              <div className="text-center">
                <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Trusted by teams</div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                  Used by schools, universities, companies, and training institutions that need structure and visibility.
                </h2>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {clientLogos.map((logo) => (
                  <div key={logo} className="flex items-center justify-center rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4">
                    <img src={logo} alt="Client logo" className="max-h-10 w-auto object-contain opacity-90" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="px-4 pb-20 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[34px] bg-slate-950 px-6 py-10 text-white md:px-10">
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
                  <Button onClick={handleOrganizationAction} className="h-12 rounded-full bg-white px-6 text-slate-950 hover:bg-slate-100">
                    Request a Demo
                  </Button>
                  <Button
                    onClick={handleContactAction}
                    variant="outline"
                    className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
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
