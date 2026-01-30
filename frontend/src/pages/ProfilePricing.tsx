
// import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown, Zap } from 'lucide-react';
// import { FreeCost, FreeType, MonthCost, MonthType, YearCost, YearType } from '@/constants';
import React, { useEffect, useRef, useState } from 'react';
// import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
// import { Check } from 'lucide-react';
import { FreeCost, FreeType, MonthCost, MonthType, YearCost, YearType, serverURL } from '@/constants';
// import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';


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

const ProfilePricing = () => {
  const navigate = useNavigate();
  
  // const handleSelectPlan = (planId: string) => {
  //   if(sessionStorage.getItem('type') === 'forever'){
  //     return;
  //   }else if(sessionStorage.getItem('type') === planId){
  //     return;
  //   }
  //   navigate(`/dashboard/payment/${planId}`);
  // };
  {/* Star bala */}
const handleSelectPlan = (plan: any) => {
  const currentPlan = sessionStorage.getItem('type');

  if (currentPlan === plan.id) {
    return;
  }

  navigate(`/dashboard/payment/${plan.id}`, {
    state: {
      price: plan.price,
      currency: plan.currency,
      planType: plan.planType,
      planName: plan.name
    }
  });
};



  const pricingRef = useRef<HTMLDivElement>(null);
  // const navigate = useNavigate();
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
            id: planType, // ✅ needed for routing
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

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="mt-3 text-muted-foreground">
          Select the perfect plan to boost your course creation productivity
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`
              relative overflow-hidden transition-all duration-300 hover:shadow-lg
              ${plan.isPopular ? 'border-primary shadow-md shadow-primary/10' : 'border-border/50'}
            `}
          >
            <CardHeader>
              <div className="flex items-center">
                {plan.name === 'Professional' ? (
                  <Crown className="h-5 w-5 text-primary mr-2" />
                ) : plan.name === 'Enterprise' ? (
                  <Zap className="h-5 w-5 text-primary mr-2" />
                ) : null}
                <CardTitle>{plan.name}</CardTitle>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">{getCurrencySymbol(plan.currency)}{plan.price.toFixed(2)}</span>
                <span className="text-muted-foreground ml-2">{plan.billingPeriod === 'monthly' ? '/mo' : plan.billingPeriod === 'yearly' ? '/yr' : ''}</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex">
                    <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {/* <Button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full ${plan.isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                variant={plan.isPopular ? "default" : "outline"}
              >
                {sessionStorage.getItem('type') === plan.id ? 'Current Plan' : 'Change Plan'}
              </Button> */}
              <Button
  onClick={() => handleSelectPlan(plan)}
  className={`w-full ${plan.isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
  variant={plan.isPopular ? "default" : "outline"}
>
  {sessionStorage.getItem('type') === plan.id ? 'Current Plan' : 'Change Plan'}
</Button>

            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProfilePricing;
