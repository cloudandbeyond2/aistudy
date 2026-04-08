import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Brain,
  FileText,
} from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Footer from '@/components/Footer';
import InnerPageTopBar from '@/components/InnerPageTopBar';
import { cn } from '@/lib/utils';
import { formatPrice, toPriceNumber } from '@/lib/formatPricing';
import {
  FreeCost,
  FreeType,
  MonthCost,
  MonthType,
  YearCost,
  YearType,
  serverURL,
} from '@/constants';
import { PRICING_FEATURES, PRICING_PLAN_FEATURES } from '@/lib/pricingFeatures';
import { PRICING_FEATURE_ICONS } from '@/lib/pricingFeatures';

type PlanType = 'free' | 'monthly' | 'yearly';

type PlanData = {
  planType: PlanType;
  planName: string;
  price: number;
  currency: string;
};

const PLAN_ORDER: PlanType[] = ['free', 'monthly', 'yearly'];

const PLAN_META: Record<
  PlanType,
  {
    title: string;
    eyebrow: string;
    description: string;
    highlight: string;
    cta: string;
    pills: string[];
    summary: string;
  }
> = {
  free: {
    title: 'Free',
    eyebrow: 'Starter access',
    description: 'A low-friction way to test the platform before you commit to a paid plan.',
    highlight: 'Best for trying the platform',
    cta: 'Start Free',
    pills: ['7-day access', '1 course only', 'Certification included'],
    summary: 'Start small, learn the workflow, and decide if the platform fits your routine.',
  },
  monthly: {
    title: 'Monthly',
    eyebrow: 'Most flexible',
    description: 'The right middle ground for learners who want real progress without a long commitment.',
    highlight: 'Most popular choice',
    cta: 'Choose Monthly',
    pills: ['1 month access', '20 courses', 'Resume builder'],
    summary: 'A practical plan for active learners who want more depth, more tools, and more momentum.',
  },
  yearly: {
    title: 'Yearly',
    eyebrow: 'Best value',
    description: 'Ideal when you know you will keep learning and want the lowest monthly cost.',
    highlight: 'Best long-term value',
    cta: 'Choose Yearly',
    pills: ['1 year access', 'Unlimited courses', 'Priority support'],
    summary: 'The simplest option for consistent learners who want the full toolkit all year.',
  },
};

const QUICK_FACTS = [
  {
    title: 'Fast setup',
    detail: 'Get started in minutes without a long onboarding cycle.',
    icon: Clock3,
  },
  {
    title: 'Learner first',
    detail: 'Built for solo study, skill building, and personal growth.',
    icon: GraduationCap,
  },
  {
    title: 'Clear upgrades',
    detail: 'Move from free to monthly or yearly whenever you need more depth.',
    icon: Sparkles,
  },
  {
    title: 'Team access',
    detail: 'Schools, colleges, and companies should use the enquiry path instead.',
    icon: Users,
  },
];

const FAQ_ITEMS = [
  {
    q: 'Who is this pricing page for?',
    a: 'This page is for individual learners who want to use the product for their own study, practice, and career preparation.',
  },
  {
    q: 'What happens after I choose Monthly or Yearly?',
    a: 'You move to the payment flow for the selected plan. After payment, your access is upgraded immediately once the payment is confirmed.',
  },
  {
    q: 'Can I cancel or switch later?',
    a: 'Yes. You can move between plans as your needs change. If you only need a short-term boost, monthly is the safest starting point.',
  },
  {
    q: 'Does the free plan expire?',
    a: 'Yes. The free plan is intentionally short so you can try the platform, check the workflow, and decide whether to upgrade.',
  },
  {
    q: 'I need pricing for a school or company. Which page should I use?',
    a: 'Use the organization enquiry route. That lets the team discuss seats, access rules, branding, billing, and support expectations properly.',
  },
  {
    q: 'Do all plans include certification?',
    a: 'Yes. Certification is included across the individual plans, but the higher plans unlock more learning tools around it.',
  },
];

const buildFallbackPlans = (): PlanData[] => [
  { planType: 'free', planName: FreeType, price: toPriceNumber(FreeCost), currency: 'INR' },
  { planType: 'monthly', planName: MonthType, price: toPriceNumber(MonthCost), currency: 'INR' },
  { planType: 'yearly', planName: YearType, price: toPriceNumber(YearCost), currency: 'INR' },
];

const IndividualPricing = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PlanData[]>(buildFallbackPlans());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchPricing = async () => {
      try {
        const res = await axios.get(`${serverURL}/api/pricing`);
        if (!mounted) return;

        if (res.data?.success && res.data?.pricing) {
          const data = Array.isArray(res.data.pricing)
            ? res.data.pricing
            : Object.values(res.data.pricing);

          const normalized = data
            .map((plan: any) => ({
              planType: (plan.planType || 'free').toLowerCase() as PlanType,
              planName: plan.planName || plan.name || '',
              price: toPriceNumber(plan.price),
              currency: plan.currency || 'INR',
            }))
            .sort((a, b) => PLAN_ORDER.indexOf(a.planType) - PLAN_ORDER.indexOf(b.planType));

          setPlans(normalized);
        }
      } catch {
        if (mounted) {
          setPlans(buildFallbackPlans());
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPricing();
    return () => {
      mounted = false;
    };
  }, []);

  const heroStats = useMemo(
    () => [
      { label: 'Solo learners', value: '1 account' },
      { label: 'Upgrade path', value: 'Free to yearly' },
      { label: 'Support style', value: 'Self-serve first' },
    ],
    []
  );

  const handlePlanAction = (planType: PlanType, planName: string, price: number, currency: string) => {
    if (planType === 'free') {
      navigate('/signup');
      return;
    }

    navigate(`/dashboard/payment/${planType}`, {
      state: {
        planType,
        planName,
        price,
        currency,
      },
    });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, delay: index * 0.08, ease: 'easeOut' as const },
    }),
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#06101d] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <InnerPageTopBar variant="dark" className="px-0 pb-8" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-4xl space-y-6 text-center"
        >
          <Badge className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-1.5 text-cyan-100 hover:bg-cyan-400/10">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Individual pricing
          </Badge>

          <div className="space-y-4">
            <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Simple pricing for individual learners with a stronger visual system.
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              This page keeps the decision simple: try it free, go monthly for flexibility, or choose yearly for the best long-term value.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {['Fast setup', 'No clutter', 'Learner focused', 'Simple upgrades'].map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-white/15"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </motion.div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-sm font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {QUICK_FACTS.map((fact) => {
            const Icon = fact.icon;
            return (
              <Card key={fact.title} className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{fact.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{fact.detail}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-full bg-cyan-400 px-5 text-slate-950 shadow-lg shadow-cyan-400/20 hover:bg-cyan-300">
            <Link to="/organization-enquiry">
              Go to organization enquiry
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full border-white/15 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white">
            <Link to="/contact">Talk to support</Link>
          </Button>
        </div>

        <Separator className="my-12 bg-white/10" />

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Pricing plans
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            One view, three clear options
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
            Each plan is spaced out so the differences are easy to scan and the monthly plan can breathe as the main recommendation.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[560px] rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-sm"
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-3 lg:items-stretch">
            {plans.map((plan, index) => {
              const meta = PLAN_META[plan.planType];
              const features = PRICING_PLAN_FEATURES[plan.planType];
         const featureItems = PRICING_FEATURES.filter((feature) => {
  const value = features[feature];
  return value === true || typeof value === 'string';
});
              return (
                <motion.div
                  key={plan.planType}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className={cn('relative', plan.planType === 'monthly' ? 'lg:-mt-4' : '')}
                >
                  <Card
                    className={cn(
                 'relative flex h-full min-h-[650px] flex-col overflow-hidden rounded-[30px] border bg-[#0a1220]/95 shadow-[0_20px_60px_-45px_rgba(2,6,23,0.85)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_-48px_rgba(34,211,238,0.18)]',
                      plan.planType === 'monthly'
                        ? 'border-cyan-300/30 ring-1 ring-cyan-300/10'
                        : 'border-white/10'
                    )}
                  >
                    {plan.planType === 'monthly' && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
                    )}

                    <CardHeader className="space-y-4 p-6 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                            {meta.eyebrow}
                          </p>
                          <h3 className="text-2xl font-semibold text-white">{meta.title}</h3>
                        </div>
                        {plan.planType === 'monthly' && (
                          <Badge className="rounded-full bg-cyan-300 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-950">
                            Popular
                          </Badge>
                        )}
                        {plan.planType === 'yearly' && (
                          <Badge variant="outline" className="rounded-full border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
                            Value
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-end gap-2">
                          <span className="text-5xl font-semibold tracking-tight text-white">
                            {formatPrice(plan.price, plan.currency)}
                          </span>
                          <span className="pb-1 text-sm text-slate-400">
                            {plan.planType === 'free' ? '' : plan.planType === 'monthly' ? 'per month' : 'per year'}
                          </span>
                        </div>
                        <p className="text-sm leading-6 text-slate-300">{meta.summary}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {meta.pills.map((pill) => (
                          <Badge
                            key={pill}
                            variant="secondary"
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-200"
                          >
                            {pill}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col p-6 pt-0">
                      <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-medium text-white">{meta.highlight}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{meta.description}</p>
                      </div>

                    <ul className="space-y-3 flex-1">
                       {featureItems.map((feature) => {
  const value = features[feature];
  const Icon = PRICING_FEATURE_ICONS?.[feature];

  return (
    <li key={feature} className="flex items-start gap-3">

      <div className="mt-0.5 rounded-full bg-cyan-400/10 p-1 text-cyan-300">
        {Icon ? (
          <Icon className="h-3.5 w-3.5" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{feature}</p>

        {typeof value === 'string' && (
          <p className="mt-0.5 text-xs text-slate-400">{value}</p>
        )}
      </div>
    </li>
  );
})} </ul>

                  <div className="mt-auto pt-6">
                        <Button
                          onClick={() => handlePlanAction(plan.planType, plan.planName, plan.price, plan.currency)}
                          className={cn(
                            'h-12 w-full rounded-full font-semibold',
                            plan.planType === 'monthly'
                              ? 'bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-300/20 hover:bg-cyan-200'
                              : plan.planType === 'yearly'
                                ? 'bg-slate-950 text-white hover:bg-slate-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'
                                : 'bg-white text-slate-950 hover:bg-slate-100'
                          )}
                          variant={plan.planType === 'free' ? 'outline' : 'default'}
                        >
                          {meta.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <Separator className="my-12 bg-border/70" />

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <Badge className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-1.5 text-cyan-100 hover:bg-cyan-400/10">
              <HelpCircle className="mr-2 h-3.5 w-3.5" />
              FAQ
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Questions that usually decide the plan
            </h2>
            <p className="max-w-xl text-sm leading-6 text-slate-300">
              The point of this section is to remove ambiguity. If you still need a custom arrangement, the organization route is the correct next step.
            </p>

            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Good rule of thumb</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      If it is just you, this page is the right fit. If there are multiple learners, approvals, or billing owners, use the enquiry flow.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Need help deciding?</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      The support team can help you compare access duration, course limits, and upgrade timing before you pay.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {FAQ_ITEMS.map((item, index) => (
                  <AccordionItem key={item.q} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left text-sm font-medium text-white no-underline hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-6 text-slate-300">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <div className="mt-12 rounded-[30px] border border-cyan-300/15 bg-white/5 p-5 text-sm leading-6 text-slate-300 shadow-[0_18px_60px_-40px_rgba(34,211,238,0.16)] backdrop-blur-sm">
          Individual learners should use this page. Schools, colleges, companies, and training institutions should use the organization enquiry flow so access, billing, and support expectations stay clean.
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IndividualPricing;
