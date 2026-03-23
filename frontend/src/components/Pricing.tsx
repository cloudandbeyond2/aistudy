import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Star } from 'lucide-react';
import { FreeCost, MonthCost, YearCost, serverURL } from '@/constants';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import { motion, easeOut } from 'framer-motion';

/* ================= CURRENCY MAP ================= */
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
};

/* ================= PLAN FEATURES ================= */

const ALL_FEATURES = [
  'Sub-Topic Limit',
  'Access Duration',
  'Theory & Image Course',
  'Create Courses',
  'AI Teacher Chat',
  'Course in 23+ Languages',
  'Video & Theory Course',
  'Resume Builder',
  'AI Notebook',
  'Interview Preparation',
  'Certification',
  'Priority Support',
  'Advanced Analytics',
];

/* -------------------- PLAN FEATURES -------------------- */

const PLAN_FEATURES = {
  free: {
    'Sub-Topic Limit': '5 per course',
    'Access Duration': '7 days',
    'Theory & Image Course': true,
    'Create Courses': '1 course only',
    'AI Teacher Chat': true,
    'Course in 23+ Languages': false,
    'Video & Theory Course': false,
    'Resume Builder': false,
    'AI Notebook': false,
    'Interview Preparation': false,
    'Certification': true,
    'Priority Support': false,
    'Advanced Analytics': false,
  },

  monthly: {
    'Sub-Topic Limit': '10 per course',
    'Access Duration': '1 month',
    'Theory & Image Course': true,
    'Create Courses': '20 courses only',
    'AI Teacher Chat': true,
    'Course in 23+ Languages': false,
    'Video & Theory Course': true,
    'Resume Builder': true,
    'AI Notebook': true,
    'Interview Preparation': true,
    'Certification': true,
    'Priority Support': true,
    'Advanced Analytics': true,
  },

  yearly: {
    'Sub-Topic Limit': '10 per course',
    'Access Duration': '1 year',
    'Theory & Image Course': true,
    'Create Courses': 'Unlimited',
    'AI Teacher Chat': true,
    'Course in 23+ Languages': true,
    'Video & Theory Course': true,
    'Resume Builder': true,
    'AI Notebook': true,
    'Interview Preparation': true,
    'Certification': true,
    'Priority Support': true,
    'Advanced Analytics': true,
  },
};

const Pricing = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  /* ================= FETCH PRICING ================= */
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${serverURL}/api/pricing`);

        if (res.data?.success && res.data?.pricing) {
          const data = Array.isArray(res.data.pricing)
            ? res.data.pricing
            : Object.values(res.data.pricing);
          setPlans(data);
        } else {
          setPlans(getDefaultPlans());
        }
      } catch (err) {
        setPlans(getDefaultPlans());
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricing();
  }, []);

  /* ================= FALLBACK ================= */
  const getDefaultPlans = () => [
    {
      planType: 'free',
      planName: 'Free',
      price: FreeCost,
      currency: 'INR',
      billingPeriod: '7 days access',
    },
    {
      planType: 'monthly',
      planName: 'Monthly',
      price: MonthCost,
      currency: 'INR',
      billingPeriod: 'month',
    },
    {
      planType: 'yearly',
      planName: 'Yearly',
      price: YearCost,
      currency: 'INR',
      billingPeriod: 'year',
    },
  ];

  /* ================= HELPERS ================= */
  const getCurrencySymbol = (currency?: string) =>
    CURRENCY_SYMBOLS[currency?.toUpperCase() || 'INR'] || '₹';

  /* ================= ANIMATION ================= */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOut },
    },
  };

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 md:py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Skeleton className="h-[520px] rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-[580px] rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-[520px] rounded-3xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </section>
    );
  }

  /* ================= UI ================= */
  return (
    <section
      id="pricing"
      className="py-16 sm:py-20 md:py-24 bg-white dark:bg-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <span className="text-primary font-bold uppercase tracking-widest text-xs sm:text-sm">
            Pricing Plans
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-3 sm:mt-4 text-slate-900 dark:text-white">
            Choose the Right Plan for <br className="hidden sm:block" />
            Your Learning Goals
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 sm:mt-4 text-sm sm:text-base max-w-2xl mx-auto">
            Select the perfect plan that fits your needs and start your learning journey today
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10"
        >
          {plans.map((plan, index) => {
            const planType = plan.planType.toLowerCase();
            const isFeatured = planType === 'monthly';
            const features = PLAN_FEATURES[planType as keyof typeof PLAN_FEATURES];
            const cleanName = plan.planName.replace(/plan/i, '').trim();

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={cn(
                  'relative flex flex-col rounded-2xl sm:rounded-3xl md:rounded-[40px] p-6 sm:p-8 md:p-10 transition-all duration-300',
                  isFeatured
                    ? 'bg-slate-900 text-white shadow-2xl scale-100 md:scale-105 z-10 py-8 sm:py-10 md:py-16 dark:bg-slate-800'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl py-6 sm:py-8 md:py-12'
                )}
              >
                {isFeatured && (
                  <div className="absolute -top-4 sm:-top-5 inset-x-0 flex justify-center">
                    <div className="bg-primary text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 sm:px-6 py-1.5 sm:py-2 rounded-full flex items-center gap-1 sm:gap-2 shadow-lg">
                      <Star className="h-3 w-3 fill-current" />
                      Most Popular
                    </div>
                  </div>
                )}

                <h3
                  className={cn(
                    'text-base sm:text-lg md:text-xl font-bold uppercase tracking-widest mb-3 sm:mb-4',
                    isFeatured
                      ? 'text-primary'
                      : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {cleanName}
                </h3>

                <div className="flex items-baseline gap-1 mb-6 sm:mb-8">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    {getCurrencySymbol(plan.currency)}
                    {Number(plan.price).toFixed(2)}
                  </span>
                  <span className="text-sm sm:text-base text-slate-400">/{plan.billingPeriod}</span>
                </div>

                <div className="space-y-3 sm:space-y-4 flex-grow mb-6 sm:mb-8 md:mb-10">
                  {ALL_FEATURES.map((feature, i) => {
                    const value = PLAN_FEATURES[planType as keyof typeof PLAN_FEATURES][feature];
                    const isAvailable = Boolean(value);

                    return (
                      <div key={i} className="flex items-start gap-2 sm:gap-3">
                        <div
                          className={cn(
                            'h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                            isAvailable
                              ? isFeatured
                                ? 'bg-primary/20 text-primary'
                                : 'bg-primary/10 text-primary'
                              : 'bg-slate-200 text-slate-400 dark:bg-slate-700'
                          )}
                        >
                          {isAvailable ? (
                            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                          ) : (
                            <span className="text-[10px] sm:text-xs">✕</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm sm:text-base md:text-lg font-medium',
                              isFeatured
                                ? 'text-slate-200'
                                : 'text-slate-700 dark:text-slate-300'
                            )}
                          >
                            {feature}
                          </p>

                          {typeof value === 'string' && (
                            <p className="text-xs sm:text-sm text-slate-400 truncate">
                              {value}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={() => navigate('/signup')}
                  size="lg"
                  className={cn(
                    'w-full h-12 sm:h-14 md:h-16 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all',
                    isFeatured
                      ? 'bg-primary text-white hover:bg-white hover:text-primary'
                      : 'bg-white dark:bg-slate-800 text-primary hover:bg-primary hover:text-white border dark:border-slate-700'
                  )}
                >
                  Choose {cleanName}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Badge for Tablet/Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 sm:mt-16 md:mt-20 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              No hidden fees
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              14-day money back guarantee
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
