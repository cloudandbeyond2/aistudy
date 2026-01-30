
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { FreeCost, FreeType, MonthCost, MonthType, YearCost, YearType, serverURL } from '@/constants';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';

interface PricingPlan {
  planType: string;
  planName: string;
  price: number;
  currency: string;
  billingPeriod: string;
}

const PLAN_FEATURES = {
  free: [
    "Generate 5 Sub-Topics",
    "Lifetime access",
    "Theory & Image Course",
    "Ai Teacher Chat",
  ],
  monthly: [
    "Generate 10 Sub-Topics",
    "1 Month Access",
    "Theory & Image Course",
    "Ai Teacher Chat",
    "Course In 23+ Languages",
    "Create Unlimited Course",
    "Video & Theory Course",
  ],
  yearly: [
    "Generate 10 Sub-Topics",
    "1 Year Access",
    "Theory & Image Course",
    "Ai Teacher Chat",
    "Course In 23+ Languages",
    "Create Unlimited Course",
    "Video & Theory Course",
  ]
};

const Pricing = () => {
  const pricingRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${serverURL}/api/pricing`);
      
      if (response.data.success && response.data.pricing) {
        const pricingData = Array.isArray(response.data.pricing)
          ? response.data.pricing
          : Object.values(response.data.pricing);

        // Sort and format pricing data
        const formattedPlans = pricingData.map((plan: any) => {
          const planType = plan.planType || 'free';
          const isFeatured = planType === 'monthly';

          return {
            name: plan.planName || plan.name,
            description: "",
            price: plan.price || 0,
            currency: plan.currency || 'USD',
            features: PLAN_FEATURES[planType as keyof typeof PLAN_FEATURES] || [],
            featured: isFeatured,
            cta: "Get Started",
            billing: planType === 'free' ? 'forever' : planType === 'monthly' ? 'monthly' : 'yearly',
            planType: planType
          };
        });

        // Sort: free, monthly, yearly
        formattedPlans.sort((a: any, b: any) => {
          const order = { free: 0, monthly: 1, yearly: 2 };
          return (order[a.planType as keyof typeof order] || 3) - (order[b.planType as keyof typeof order] || 3);
        });

        setPlans(formattedPlans);
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
      // Fallback to defaults
      const defaultPlans = [
        {
          name: FreeType,
          description: "",
          price: FreeCost,
          currency: 'USD',
          features: PLAN_FEATURES.free,
          featured: false,
          cta: "Get Started",
          billing: "forever",
          planType: 'free'
        },
        {
          name: MonthType,
          description: "",
          price: MonthCost,
          currency: 'USD',
          features: PLAN_FEATURES.monthly,
          featured: true,
          cta: "Get Started",
          billing: "monthly",
          planType: 'monthly'
        },
        {
          name: YearType,
          description: "",
          price: YearCost,
          currency: 'USD',
          features: PLAN_FEATURES.yearly,
          featured: false,
          cta: "Get Started",
          billing: "yearly",
          planType: 'yearly'
        }
      ];
      setPlans(defaultPlans);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && plans.length > 0) {
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-up');
            entry.target.classList.remove('opacity-0');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      const titleEl = document.querySelector('.pricing-title');
      if (titleEl) observer.observe(titleEl);

      const switcherEl = document.querySelector('.pricing-switcher');
      if (switcherEl) observer.observe(switcherEl);

      const elements = pricingRef.current?.querySelectorAll('.pricing-card');
      elements?.forEach((el, index) => {
        el.setAttribute('style', `transition-delay: ${index * 100}ms`);
        observer.observe(el);
      });

      return () => {
        if (titleEl) observer.unobserve(titleEl);
        if (switcherEl) observer.unobserve(switcherEl);
        elements?.forEach(el => {
          observer.unobserve(el);
        });
      };
    }
  }, [isLoading, plans]);

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'JPY': '¥',
      'AUD': 'A$',
      'CAD': 'C$',
      'SGD': 'S$'
    };
    return symbols[currency] || '$';
  };

  if (isLoading) {
    return (
      <section className="py-20 md:py-32 px-6 md:px-10 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
              Pricing
            </span>
            <Skeleton className="h-12 w-full max-w-2xl mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 md:py-32 px-6 md:px-10 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
            Pricing
          </span>
          <h2 className="pricing-title opacity-0 font-display text-3xl md:text-4xl lg:text-5xl font-bold">
            Simple, <span className="text-primary">Transparent</span> Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for your needs. All plans include our core AI course generation technology.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="pricing-switcher opacity-0 flex justify-center items-center space-x-4 mb-16">
        </div>

        {/* Pricing cards */}
        <div
          ref={pricingRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "pricing-card opacity-0 bg-card rounded-xl overflow-hidden transition-all duration-300 flex flex-col",
                plan.featured ?
                  "border-2 border-primary shadow-lg shadow-primary/10 lg:-mt-6 lg:mb-6" :
                  "border border-border/50 shadow-sm hover:shadow-md"
              )}
            >
              {plan.featured && (
                <div className="bg-primary py-1.5 text-center">
                  <span className="text-sm font-medium text-white">Most Popular</span>
                </div>
              )}
              <div className="p-8 flex-1">
                <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground mt-2 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="font-display text-4xl font-bold">
                    {getCurrencySymbol(plan.currency)}{plan.price.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground ml-2">{plan.billing === 'monthly' ? '/mo' : plan.billing === 'yearly' ? '/yr' : ''}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex">
                      <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 pt-0">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className={cn(
                    "w-full",
                    plan.featured ? "bg-primary hover:bg-primary/90" : ""
                  )}
                  variant={plan.featured ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
