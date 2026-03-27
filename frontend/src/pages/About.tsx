import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Laptop,
  Layers3,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  ShieldCheck,
  MessageSquare,
  Zap,
} from 'lucide-react';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { appName, companyName } from '@/constants';

const highlights = [
  {
    icon: Sparkles,
    title: 'AI-first learning',
    text: 'Generate courses, learning flows, and study support from a single platform.',
  },
  {
    icon: Layers3,
    title: 'Role-based panels',
    text: 'Users, students, staff, and organizations each get a tailored workspace.',
  },
  {
    icon: ShieldCheck,
    title: 'Structured operations',
    text: 'Scheduling, support, pricing, and reporting are kept organized in one system.',
  },
];

const stats = [
  { value: '4', label: 'Core panels' },
  { value: '12+', label: 'Product modules' },
  { value: '24/7', label: 'Access model' },
  { value: '100%', label: 'Responsive UI' },
];

const valueCards = [
  { icon: Target, title: 'Clarity', text: 'Simple flows and readable interfaces make the product easier to trust and use.' },
  { icon: TrendingUp, title: 'Growth', text: 'Tools are designed to help learners and institutions scale without rework.' },
  { icon: BadgeCheck, title: 'Quality', text: 'Consistent layouts, strong hierarchy, and polished interactions across devices.' },
  { icon: MessageSquare, title: 'Support', text: 'Users can move from learning to help requests without leaving the ecosystem.' },
];

const workflow = [
  { step: '01', title: 'Choose a role', text: 'The public experience leads into a role-aware application shell.' },
  { step: '02', title: 'Create faster', text: 'Build courses, schedule work, manage tasks, and generate content with fewer steps.' },
  { step: '03', title: 'Track progress', text: 'Dashboards and records stay visible across daily learning and admin operations.' },
  { step: '04', title: 'Scale confidently', text: 'Organizations can extend the platform without changing the core experience.' },
];

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO
        title="About Us"
        description="Learn what Colossus IQ does, who it serves, and how the platform is structured for corporate learning."
        keywords="about us, corporate learning, AI education, student dashboard, staff portal"
      />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(30,138,138,0.08),transparent_25%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)]">
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,138,138,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_30%)]" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-screen"
            style={{ backgroundImage: "url('/bexon/images/pattern-bg.webp')" }}
          />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-7"
            >
              <Badge className="rounded-full bg-white/10 px-4 py-1.5 text-cyan-100 hover:bg-white/10">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                About {appName}
              </Badge>

              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                  Corporate learning software built to look premium and behave clearly.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  {companyName || appName} combines AI course generation, planning, scheduling, support, and
                  role-based dashboards into a single responsive platform for learners and institutions.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-12 rounded-full bg-primary px-6 text-white hover:bg-primary/90">
                  <Link to="/signup">
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
                  <Link to="/contact">Talk to Us</Link>
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-4">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <div className="text-2xl font-semibold text-white">{item.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-slate-400">{item.label}</div>
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
              <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-2 backdrop-blur">
                <img
                  src="/bexon/images/about-1.webp"
                  alt="About Colossus IQ"
                  className="h-[420px] w-full rounded-[26px] object-cover"
                />
                <div className="absolute bottom-5 left-5 right-5 rounded-[24px] border border-white/10 bg-slate-950/80 p-4 backdrop-blur">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { label: 'Learning', value: 'AI assisted', icon: BookOpen },
                      { label: 'Planning', value: 'Schedules', icon: CalendarDays },
                      { label: 'Users', value: 'Role aware', icon: Users },
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

        <section className="px-4 py-20 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="rounded-full px-4 py-1.5">
                <Building2 className="mr-2 h-3.5 w-3.5" />
                Why we built it
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                A clean platform for learning, operations, and student support.
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                The application is built for real usage: clear roles, practical dashboards, structured tasks,
                scheduling, and content tools that support daily work.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {highlights.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                >
                  <Card className="h-full border-slate-200/80 bg-white/90 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)]">
                    <CardContent className="space-y-4 p-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="text-sm leading-7 text-muted-foreground">{item.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[34px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.35)] md:p-8">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="rounded-full px-4 py-1.5">
                <Zap className="mr-2 h-3.5 w-3.5" />
                Core values
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                What the product should feel like.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {valueCards.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5"
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_28px_80px_-55px_rgba(15,23,42,0.35)]">
                <img src="/bexon/images/hero-img.webp" alt="Product workflow preview" className="h-[420px] w-full object-cover" />
              </div>
            </motion.div>

            <div className="space-y-6">
              <Badge variant="secondary" className="rounded-full px-4 py-1.5">
                <Laptop className="mr-2 h-3.5 w-3.5" />
                How it works
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                A structured workflow from sign-in to learning and administration.
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {workflow.map((item) => (
                  <div key={item.step} className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        {item.step}
                      </div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['Responsive', 'Role based', 'Corporate style', 'Interactive'].map((label) => (
                  <Badge key={label} variant="outline" className="rounded-full px-3 py-1">
                    <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-primary" />
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[34px] bg-slate-950 px-6 py-10 text-white md:px-10">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <Badge className="rounded-full bg-white/10 px-4 py-1.5 text-cyan-100 hover:bg-white/10">
                  <GraduationCap className="mr-2 h-3.5 w-3.5" />
                  Built for real teams
                </Badge>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  One product. Multiple panels. Consistent experience.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  {appName} keeps the public site polished while the logged-in dashboards stay practical for
                  users, students, staff, and organizations.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button asChild className="h-12 rounded-full bg-white px-6 text-slate-950 hover:bg-slate-100">
                  <Link to="/signup">Create Account</Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
                  <Link to="/blog">Read Blog</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default About;
