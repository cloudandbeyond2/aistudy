import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Building2,
  Cloud,
  Globe2,
  Layers3,
  ShieldCheck,
  Sparkles,
  ServerCog,
  Target,
  TrendingUp,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { appName, companyName } from '@/constants';

const companyFacts = [
  { icon: Building2, label: 'Legal entity', value: companyName },
  { icon: Sparkles, label: 'Brand', value: 'CloudandBeyond' },
  { icon: Globe2, label: 'Experience', value: '15+ years' },
  { icon: Cloud, label: 'Product scope', value: 'AI + cloud platforms' },
];

const buildAreas = [
  {
    icon: Bot,
    title: 'AI applications',
    text: 'Prompt-driven workflows, automation, content support, and intelligent product experiences for modern teams.',
  },
  {
    icon: Cloud,
    title: 'ERP software',
    text: 'Business systems for operations, administration, workflows, reporting, and process control.',
  },
  {
    icon: Layers3,
    title: 'Hosting and server provider',
    text: 'Infrastructure support for reliable deployment, hosting, maintenance, and performance at scale.',
  },
  {
    icon: Workflow,
    title: 'Microsoft application services',
    text: 'Tier 1 and tier 2 Microsoft application service builds with structured support and delivery.',
  },
  {
    icon: ServerCog,
    title: 'Mobile applications',
    text: 'Mobile-first product experiences built for daily use, field teams, and on-the-go access.',
  },
  {
    icon: Bot,
    title: 'Web application creators',
    text: 'Custom web applications and builders designed for rapid delivery and long-term scalability.',
  },
];

const operatingPillars = [
  {
    step: '01',
    title: 'Shape the product',
    text: 'We start with the audience, the operational problem, and the outcomes the platform needs to support.',
  },
  {
    step: '02',
    title: 'Design the system',
    text: 'We define the roles, navigation, data flow, and UI patterns before moving into implementation.',
  },
  {
    step: '03',
    title: 'Build for scale',
    text: 'We focus on maintainable interfaces, responsive layouts, and reliable infrastructure for growth.',
  },
  {
    step: '04',
    title: 'Support expansion',
    text: 'The platform can grow into new modules, new audiences, and new market needs without losing clarity.',
  },
];

const audiences = [
  { title: 'Schools and universities', text: 'Learning spaces, dashboards, content workflows, and student support.' },
  { title: 'Organizations', text: 'Internal tools, onboarding systems, planning, and managed workflows.' },
  { title: 'Startups and product teams', text: 'Large-scale product builders that need speed, structure, and control.' },
  { title: 'Learners and job seekers', text: 'Smart learning tools, progress tracking, and career-ready experiences.' },
];

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO
        title="About Us"
        description={`${companyName} is the developer behind Colossus IQ and CloudandBeyond, building AI-based large-scale application builders and cloud application builders for USA-facing and global teams.`}
        keywords="about us, Infilabs Pvt Ltd, CloudandBeyond, AI application builder, cloud application builder"
      />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.08),transparent_25%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)]">
        <section className="relative overflow-hidden bg-[#06101d] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_30%),linear-gradient(180deg,rgba(6,16,29,1)_0%,rgba(8,13,24,1)_100%)]" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-8 mix-blend-screen"
            style={{ backgroundImage: "url('/bexon/images/pattern-bg.webp')" }}
          />
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute right-4 top-4 z-20 md:right-6 md:top-6">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full border-white/15 bg-white/95 px-4 text-sm font-medium text-slate-800 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] hover:border-cyan-300/30 hover:bg-white hover:text-slate-900"
            >
              <Link to="/">Back to Website</Link>
            </Button>
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 md:px-6 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:px-8 lg:py-28">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-7"
            >
              <Badge className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-cyan-100 hover:bg-cyan-400/10">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                About Colossus IQ by {companyName}
              </Badge>

              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
                  Colossus IQ is an AI-based learning system developed by Infilabs Pvt Ltd.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  {companyName} is the developer behind Colossus IQ and the CloudandBeyond brand. We operate as a
                  USA-facing company with more than 15 years of experience building AI applications, ERP software,
                  hosting and server solutions, Microsoft application services, mobile applications, and web
                  application creators for modern institutions and product teams.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-12 rounded-full bg-white px-6 text-slate-950 hover:bg-slate-100">
                  <Link to="/contact">
                    Contact Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-cyan-400/20 bg-white/5 px-6 text-white hover:border-cyan-300/30 hover:bg-white/10 hover:text-white"
                >
                  <Link to="/organization-enquiry">Organization Enquiry</Link>
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {companyFacts.map((item) => (
                  <div
                    key={item.label}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/10 hover:shadow-[0_18px_50px_-30px_rgba(45,212,191,0.24)]"
                  >
                    <item.icon className="h-5 w-5 text-cyan-300" />
                    <div className="mt-3 text-[11px] uppercase tracking-[0.25em] text-slate-400">{item.label}</div>
                    <div className="mt-1 text-sm font-semibold text-white">{item.value}</div>
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
              <div className="group relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-4 shadow-[0_32px_120px_-60px_rgba(6,16,29,0.95)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_36px_140px_-60px_rgba(45,212,191,0.24)]">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="rounded-[26px] border border-white/10 bg-slate-950/70 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Company overview</p>
                      <h2 className="mt-3 text-2xl font-semibold text-white">Colossus IQ and Infilabs story</h2>
                    </div>
                    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                      USA market
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-cyan-100">
                        <ServerCog className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-[0.25em] text-slate-400">Scale</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-200">
                        Large-scale systems that handle roles, dashboards, routing, and operational workloads.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-cyan-100">
                        <Workflow className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-[0.25em] text-slate-400">Flow</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-200">
                        AI-assisted application builders for content, learning, and enterprise workflows.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-cyan-100">
                      <BadgeCheck className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-[0.25em] text-slate-400">What we deliver</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['AI app builder', 'Cloud apps', 'Learning systems', 'Admin tooling', 'Role-based UI'].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
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
                What we build
              </Badge>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                AI and cloud products backed by deep product and delivery experience.
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                We focus on products that need structure: AI systems, ERP modules, hosting workflows, Microsoft
                service layers, mobile apps, and web app builders that can grow without turning into a mess.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {buildAreas.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                >
                  <Card className="h-full border-slate-200/80 bg-white/90 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_34px_90px_-50px_rgba(15,23,42,0.35)]">
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
                How we work
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                From product idea to scalable platform.
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                Our process is designed to keep the product clear, the architecture stable, and the delivery aligned
                with enterprise and institutional needs.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {operatingPillars.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                      {item.step}
                    </div>
                    <Target className="h-5 w-5 text-slate-300" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[34px] border border-slate-200/80 bg-slate-950 px-6 py-10 text-white shadow-[0_28px_80px_-55px_rgba(15,23,42,0.35)] md:px-10">
              <div className="mx-auto max-w-3xl text-center">
                <Badge className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-cyan-100 hover:bg-cyan-400/10">
                  <Users className="mr-2 h-3.5 w-3.5" />
                  Who we build for
                </Badge>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  Solutions for learning, operations, ERP, and application teams.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300 md:text-base">
                  {appName} is one of the products developed by {companyName}. The broader CloudandBeyond platform
                  is designed for institutions and teams that need readable interfaces, strong workflows, and
                  software that can grow with the business.
                </p>
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {audiences.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/10 hover:shadow-[0_18px_50px_-30px_rgba(45,212,191,0.18)]"
                  >
                    <div className="flex items-center gap-2 text-cyan-100">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Audience</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-white/5 px-5 py-5 text-center md:flex-row md:text-left">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Next step</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    Talk to us about your next AI or cloud platform.
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    If you need an application builder, a learning platform, or a large-scale product system, we can
                    help shape the architecture and the UI.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="h-11 rounded-full bg-white px-5 text-slate-950 hover:bg-slate-100">
                    <Link to="/contact">Contact Team</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full border-white/15 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
                  >
                    <Link to="/blog">Read Blog</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default About;
