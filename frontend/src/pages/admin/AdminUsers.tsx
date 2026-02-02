import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Check, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { serverURL } from '@/constants';

const PLAN_FEATURES = {
  free: [
    'Generate 5 Sub-Topics',
    'Lifetime access',
    'Theory & Image Course',
    'AI Teacher Chat'
  ],
  monthly: [
    'Generate 10 Sub-Topics',
    '1 Month Access',
    'AI Teacher Chat',
    'Unlimited Courses',
    '23+ Languages',
    'Video & Theory Course'
  ],
  yearly: [
    'Generate 10 Sub-Topics',
    '1 Year Access',
    'AI Teacher Chat',
    'Unlimited Courses',
    '23+ Languages',
    'Video & Theory Course'
  ],
  forever: [
    'Unlimited Everything',
    'Lifetime Access',
    'AI Teacher Chat',
    'Unlimited Courses',
    'All Languages',
    'Video & Theory Course'
  ]
};

const ProfilePricing = () => {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<any[]>([]);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- GET USER ACTIVE PLAN ---------------- */
  const fetchUserPlan = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/getusers`, {
        withCredentials: true
      });

      if (res.data?.success) {
        const userType = res.data.user.type;
        setActiveType(userType);
        sessionStorage.setItem('type', userType);
      }
    } catch (err) {
      console.error('User fetch failed', err);
    }
  };

  /* ---------------- GET PRICING ---------------- */
  const fetchPricing = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/pricing`);
      if (res.data?.success) {
        const formatted = res.data.pricing.map((plan: any) => ({
          id: plan.planType,
          name: plan.planName,
          price: plan.price,
          currency: plan.currency || 'USD',
          planType: plan.planType,
          features: PLAN_FEATURES[plan.planType]
        }));
        setPlans(formatted);
      }
    } catch (err) {
      console.error('Pricing error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPlan();
    fetchPricing();
  }, []);

  /* ---------------- SELECT PLAN ---------------- */
  const handleSelectPlan = (plan: any) => {
    if (activeType === plan.id) return;

    navigate(`/dashboard/payment/${plan.id}`, {
      state: {
        price: plan.price,
        currency: plan.currency,
        planType: plan.planType,
        planName: plan.name
      }
    });
  };

  const currencySymbol = (c: string) =>
    ({ USD: '$', INR: '₹', EUR: '€' }[c] || '$');

  /* ---------------- UI ---------------- */
  return (
    <div className="container max-w-6xl mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="mt-2 text-muted-foreground">
          Your current plan is highlighted below
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isActive = activeType === plan.id;
          const isPopular = plan.planType === 'monthly';

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative transition-all duration-300',
                isActive
                  ? 'border-2 border-primary shadow-lg'
                  : 'border border-border/60',
                isPopular && 'scale-[1.04]'
              )}
            >
              {/* BADGES */}
              {isActive && (
                <span className="absolute top-4 right-4 bg-primary text-white text-xs px-3 py-1 rounded-full">
                  Current Plan
                </span>
              )}

              {isPopular && !isActive && (
                <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <CardHeader>
                <div className="flex items-center gap-2">
                  {isPopular && <Crown className="h-5 w-5 text-primary" />}
                  <CardTitle>{plan.name}</CardTitle>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {currencySymbol(plan.currency)}
                    {plan.price}
                  </span>
                  {plan.planType !== 'free' && (
                    <span className="text-muted-foreground ml-1">
                      /{plan.planType === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((f: string, i: number) => (
                    <li key={i} className="flex gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  disabled={isActive}
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full"
                  variant={isActive ? 'secondary' : 'default'}
                >
                  {isActive ? 'Active Plan' : 'Upgrade'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProfilePricing;
