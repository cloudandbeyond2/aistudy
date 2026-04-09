import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Check, Crown, Zap, Sparkles, Star, Rocket, Shield, 
  Infinity, Clock, Users, Globe, Lock, TrendingUp, 
  Gift, ArrowRight, CheckCircle2, AlertTriangle, 
  BookOpen, Video, MessageSquare, FileText, Award,
  BarChart, Headphones, Smartphone, Coffee, Heart,
  Target, Brain, Layers, Gem, Diamond, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import {
  FreeCost,
  FreeType,
  MonthCost,
  MonthType,
  YearCost,
  YearType,
  serverURL,
} from '@/constants';
import {
  PRICING_FEATURES as ALL_FEATURES,
  PRICING_FEATURE_ICONS as FEATURE_ICONS,
  PRICING_PLAN_FEATURES as PLAN_FEATURES,
  PRICING_PLAN_ORDER as PLAN_ORDER,
} from '@/lib/pricingFeatures';
import { formatPrice, toPriceNumber } from '@/lib/formatPricing';

/* -------------------- PLAN CONFIGURATION -------------------- */

const PLAN_CONFIG: Record<string, any> = {
  free: {
    icon: Sparkles,
    color: "text-gray-500",
    bg: "bg-gray-100 dark:bg-gray-800",
    badge: "Free Forever",
    description: "Perfect for beginners exploring our platform",
    tagline: "Start your journey",
    buttonText: "Get Started",
  },
  monthly: {
    icon: Zap,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/20",
    badge: "Most Flexible",
    description: "For serious creators who want maximum flexibility",
    tagline: "Grow with us",
    buttonText: "Subscribe Monthly",
  },
  yearly: {
    icon: Crown,
    color: "text-yellow-500",
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
    badge: "Best Value",
    description: "Unlock everything with maximum savings",
    tagline: "Go all in",
    buttonText: "Subscribe Yearly",
  },
};

/* -------------------- ANIMATION VARIANTS -------------------- */

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants: Variants = {
  rest: { 
    scale: 1, 
    y: 0 
  },
  hover: { 
    scale: 1.02, 
    y: -8,
    transition: { 
      duration: 0.3, 
      ease: "easeOut" as const
    }
  }
};

/* -------------------- COMPONENT -------------------- */

const ProfilePricing = () => {
  const navigate = useNavigate();
  const pricingRef = useRef<HTMLDivElement>(null);

  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserPlan, setCurrentUserPlan] = useState<string>('free');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  /* -------------------- FETCH USER PLAN & PRICING -------------------- */

  useEffect(() => {
    fetchUserCurrentPlan();
    fetchPricing();
  }, []);

const fetchUserCurrentPlan = async () => {
  try {
    const userIdFromSession = sessionStorage.getItem('uid');
    const userStr = localStorage.getItem('user');

    if (userStr && userIdFromSession) {
      try {
        const userData = JSON.parse(userStr);
        const userIdFromLocal =
          userData._id?.$oid ||     // ✅ handles MongoDB ObjectId format: { _id: { $oid: "..." } }
          userData._id ||            // ✅ handles plain string _id
          userData.id;               // ✅ handles id field fallback

        if (String(userIdFromLocal) === String(userIdFromSession) && userData.type) {
          const userPlan = userData.type.toLowerCase();
          setCurrentUserPlan(userPlan);
          setSubscriptionEnd(userData.subscriptionEnd || null);
          sessionStorage.setItem('type', userPlan); // ✅ overwrite stale session value immediately
          // console.log('✅ User plan set from validated localStorage:', userPlan);
          return;
        } else {
          // ✅ IDs didn't match — wipe everything stale
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          sessionStorage.removeItem('type'); // ✅ critical: clear stale 'monthly' before API call
          // console.warn('⚠️ ID mismatch — clearing stale local data');
        }
      } catch (e) {
        // console.error('Error parsing user data:', e);
        localStorage.removeItem('user');
        sessionStorage.removeItem('type'); // ✅ clear stale on parse error too
      }
    }

    // Fallback: sessionStorage (only if localStorage check didn't run or had no uid)
    // NOTE: we no longer use this as a fallback if localStorage cleared it above
    const sessionPlan = sessionStorage.getItem('type');
    if (sessionPlan && userIdFromSession) {
      const userPlan = sessionPlan.toLowerCase();
      setCurrentUserPlan(userPlan);
      // console.log('✅ User plan set from sessionStorage:', userPlan);
    }

    if (!userIdFromSession) return;

    // Always sync from API on hosting to get the authoritative plan
    try {
      const response = await axios.get(`${serverURL}/api/user/${userIdFromSession}`);
      if (response.data && response.data.user) {
        const user = response.data.user;
        if (user.type) {
          const userPlan = user.type.toLowerCase();
          setCurrentUserPlan(userPlan);
          setSubscriptionEnd(user.subscriptionEnd || null);
          sessionStorage.setItem('type', userPlan);     // ✅ authoritative value
          localStorage.setItem('user', JSON.stringify(user)); // ✅ refresh local cache
          // console.log('✅ User plan synced from API:', userPlan);
        }
      }
    } catch (apiError) {
      console.error('❌ API fetch failed:', apiError);
    }
  } catch (error) {
    console.error('❌ Error in fetchUserCurrentPlan:', error);
  }
};

  const fetchPricing = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${serverURL}/api/pricing`);

      if (response.data?.success && response.data?.pricing) {
        const pricingData = Array.isArray(response.data.pricing)
          ? response.data.pricing
          : Object.values(response.data.pricing);

        const formattedPlans = pricingData.map((plan: any) => {
          const planType = plan.planType || 'free';
          const config = PLAN_CONFIG[planType];

          return {
            id: planType,
            name: plan.planName || plan.name,
            price: toPriceNumber(plan.price),
            currency: plan.currency || 'INR',
            features: PLAN_FEATURES[planType],
            featured: planType === 'yearly',
            planType,
            ...config,
          };
        });

        formattedPlans.sort(
          (a: any, b: any) => PLAN_ORDER[a.planType] - PLAN_ORDER[b.planType]
        );

        setPlans(formattedPlans);
      }
    } catch (error) {
      console.error('❌ Error fetching pricing:', error);
      setPlans([
        {
          id: 'free',
          name: FreeType,
          price: FreeCost,
          currency: 'INR',
          features: PLAN_FEATURES.free,
          planType: 'free',
          ...PLAN_CONFIG.free,
        },
        {
          id: 'monthly',
          name: MonthType,
          price: MonthCost,
          currency: 'INR',
          features: PLAN_FEATURES.monthly,
          planType: 'monthly',
          ...PLAN_CONFIG.monthly,
        },
        {
          id: 'yearly',
          name: YearType,
          price: YearCost,
          currency: 'INR',
          features: PLAN_FEATURES.yearly,
          featured: true,
          planType: 'yearly',
          ...PLAN_CONFIG.yearly,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCurrentPlan();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'type') {
        fetchUserCurrentPlan();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /* -------------------- HELPERS -------------------- */

  const handleSelectPlan = (plan: any) => {
    if (currentUserPlan === plan.id) return;

    navigate(`/dashboard/payment/${plan.id}`, {
      state: {
        price: plan.price,
        currency: plan.currency,
        planType: plan.planType,
        planName: plan.name,
      },
    });
  };

  const calculateSavings = () => {
    const monthlyPlan = plans.find(p => p.planType === 'monthly');
    const yearlyPlan = plans.find(p => p.planType === 'yearly');
    if (monthlyPlan && yearlyPlan && monthlyPlan.price && yearlyPlan.price) {
      const monthlyYearlyCost = monthlyPlan.price * 12;
      const savings = monthlyYearlyCost - yearlyPlan.price;
      const percentage = ((savings / monthlyYearlyCost) * 100).toFixed(0);
      return { savings, percentage };
    }
    return null;
  };

  const savings = calculateSavings();

  const toggleFeatures = (planId: string) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  const INITIAL_FEATURES_COUNT = 5;

  /* -------------------- UI -------------------- */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-purple-500 border-r-pink-500 border-b-purple-500 border-l-pink-500 mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-purple-500 animate-pulse" />
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-muted-foreground"
          >
            Loading amazing plans...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
          className="text-center mb-16 relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full px-4 py-2 mb-6 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Choose Your Path to Success</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-pink-600 dark:from-white dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-4"
          >
            Unlock Your Learning
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Superpowers</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4"
          >
            Choose the perfect plan to accelerate your course creation journey and unlock premium features designed for your success
          </motion.p>

          {/* Current Plan Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="mt-8 inline-flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex-wrap justify-center"
          >
            <div className="flex items-center gap-2">
              {currentUserPlan === 'yearly' ? (
                <Crown className="h-5 w-5 text-yellow-500" />
              ) : currentUserPlan === 'monthly' ? (
                <Zap className="h-5 w-5 text-blue-500" />
              ) : (
                <Sparkles className="h-5 w-5 text-gray-500" />
              )}
              <span className="font-medium text-sm md:text-base">Current Plan:</span>
              <span className={`font-bold uppercase px-2 py-0.5 rounded-full text-xs md:text-sm ${
                currentUserPlan === 'yearly' 
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' 
                  : currentUserPlan === 'monthly' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {currentUserPlan}
              </span>
            </div>
            
            {currentUserPlan === 'yearly' && subscriptionEnd && new Date(subscriptionEnd) > new Date() && (
              <div className="flex items-center gap-1 text-xs md:text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4" />
                <span>Active until {new Date(subscriptionEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            )}
            
            {subscriptionEnd && new Date(subscriptionEnd) < new Date() && (
              <div className="flex items-center gap-1 text-xs md:text-sm text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3 w-3 md:h-4 md:w-4" />
                <span>Expired - Renew to continue benefits</span>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Savings Banner */}
        <AnimatePresence>
          {savings && savings.savings > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="mb-10 max-w-2xl mx-auto px-4"
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-4 md:p-5 text-center shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-pulse"></div>
                <div className="relative flex items-center justify-center gap-3 flex-wrap text-sm md:text-base">
                  <Gift className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400 animate-bounce" />
                  <span className="font-semibold text-green-700 dark:text-green-400">🎉 Limited Time Offer</span>
                  <span className="text-green-700 dark:text-green-400">Save {savings.percentage}% (₹{savings.savings.toLocaleString()}) when you choose the Yearly Plan!</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plans Grid - Responsive Layout */}
        {/* 
          Mobile (<768px): 1 column (default grid-cols-1)
          Tablet (768px - 1024px): 1 column (md:grid-cols-1)
          Laptop (>1024px but <1280px): 2 columns (lg:grid-cols-2)
          Desktop (>1280px): 3 columns (xl:grid-cols-3)
        */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 relative z-10"
        >
          {plans.map((plan, index) => {
            const isActive = currentUserPlan === plan.id;
            const isExpired = isActive && !!subscriptionEnd && new Date(subscriptionEnd) < new Date();
            const isNotAvailable = !isActive && PLAN_ORDER[plan.planType] < PLAN_ORDER[currentUserPlan];
            const isHovered = hoveredPlan === plan.id;
            const IconComponent = plan.icon;
            const isExpanded = expandedFeatures[plan.id] || false;
            const displayedFeatures = isExpanded ? ALL_FEATURES : ALL_FEATURES.slice(0, INITIAL_FEATURES_COUNT);
            const hasMoreFeatures = ALL_FEATURES.length > INITIAL_FEATURES_COUNT;

            return (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                custom={index}
                whileHover="hover"
                initial="rest"
                animate={isHovered ? "hover" : "rest"}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                className="relative"
              >
                <Card
                  className={`relative overflow-hidden transition-all duration-500 h-full ${
                    plan.featured && !isActive 
                      ? 'border-2 border-purple-500 shadow-2xl shadow-purple-500/20' 
                      : 'border border-gray-200 dark:border-gray-700'
                  } ${
                    isActive && !isExpired 
                      ? 'ring-2 ring-green-500 shadow-2xl shadow-green-500/20' 
                      : ''
                  } ${
                    isExpired 
                      ? 'ring-2 ring-red-500 shadow-2xl shadow-red-500/20' 
                      : ''
                  } backdrop-blur-sm bg-white/90 dark:bg-gray-900/90`}
                >
                  {/* Featured Badge */}
                  {plan.featured && !isActive && !isExpired && (
                    <motion.div 
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="absolute top-4 right-4 z-10"
                    >
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 md:px-4 md:py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <Star className="h-2 w-2 md:h-3 md:w-3 fill-current" />
                        MOST POPULAR
                      </div>
                    </motion.div>
                  )}

                  {/* Active Badge */}
                  {isActive && !isExpired && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 z-10"
                    >
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 md:px-4 md:py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <CheckCircle2 className="h-2 w-2 md:h-3 md:w-3" />
                        ACTIVE PLAN
                      </div>
                    </motion.div>
                  )}

                  {/* Expired Badge */}
                  {isExpired && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 z-10"
                    >
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 md:px-4 md:py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="h-2 w-2 md:h-3 md:w-3" />
                        EXPIRED
                      </div>
                    </motion.div>
                  )}

                  <CardHeader className="text-center pt-6 md:pt-8">
                    <motion.div 
                      animate={{ 
                        scale: isHovered ? 1.1 : 1,
                        rotate: isHovered ? 5 : 0
                      }}
                      transition={{ duration: 0.3 }}
                      className={`w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl ${plan.bg} flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <IconComponent className={`h-8 w-8 md:h-10 md:w-10 ${plan.color}`} />
                    </motion.div>
                    
                    <CardTitle className="text-xl md:text-2xl font-bold capitalize">{plan.name}</CardTitle>
                    
                    {plan.badge && (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="inline-block mt-2 text-xs font-medium px-2 py-1 md:px-3 md:py-1 rounded-full bg-primary/10 text-primary"
                      >
                        {plan.badge}
                      </motion.span>
                    )}
                    
                    <CardDescription className="mt-2 md:mt-3 text-xs md:text-sm">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="text-center">
                    <motion.div 
                      animate={{ scale: isHovered ? 1.05 : 1 }}
                      className="mb-4 md:mb-6"
                    >
                      <span className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        {formatPrice(plan.price, plan.currency)}
                      </span>
                      {plan.planType !== 'free' && (
                        <span className="text-muted-foreground ml-1 md:ml-2 text-sm md:text-base">
                          /{plan.planType === 'monthly' ? 'month' : 'year'}
                        </span>
                      )}
                    </motion.div>

                    {plan.planType === 'yearly' && savings && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs md:text-sm text-green-600 dark:text-green-400 mb-3 md:mb-4 font-medium"
                      >
                        Save ₹{savings.savings.toLocaleString()} annually
                      </motion.p>
                    )}

                    <div className="text-left space-y-2 md:space-y-3">
                      <AnimatePresence mode="wait">
                        {displayedFeatures.map((feature, i) => {
                          const value = plan.features[feature];
                          const enabled = value === true || typeof value === 'string';
                          const FeatureIcon = FEATURE_ICONS[feature] || Gem;

                          return (
                            <motion.div 
                              key={feature}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ delay: i * 0.02 }}
                              className="flex items-start gap-2 md:gap-3 group"
                            >
                              <div className={`mt-0.5 flex-shrink-0 ${enabled ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`}>
                                {enabled ? (
                                  <Check className="h-3 w-3 md:h-4 md:w-4" />
                                ) : (
                                  <div className="h-3 w-3 md:h-4 md:w-4 rounded-full border border-gray-300 dark:border-gray-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-1 md:gap-2">
                                  <FeatureIcon className="h-2 w-2 md:h-3 md:w-3 text-muted-foreground" />
                                  <span className={`text-xs md:text-sm ${enabled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 line-through dark:text-gray-500'}`}>
                                    {typeof value === 'string' ? `${feature}: ${value}` : feature}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      
                      {hasMoreFeatures && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="pt-2 md:pt-3"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFeatures(plan.id)}
                            className="w-full text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium gap-1 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-3 w-3" />
                                Show less features
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3" />
                                Show all {ALL_FEATURES.length} features
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="px-4 md:px-6 pb-4 md:pb-6">
                    {isActive && !isExpired ? (
                      <Button 
                        disabled 
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg cursor-default text-sm md:text-base"
                      >
                        <CheckCircle2 className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                        Current Plan
                      </Button>
                    ) : isExpired ? (
                      <Button
                        onClick={() => handleSelectPlan(plan)}
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg transform transition-all duration-300 hover:scale-105 text-sm md:text-base"
                      >
                        <Rocket className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                        Renew Plan
                      </Button>
                    ) : isNotAvailable ? (
                      <Button 
                        disabled 
                        className="w-full text-sm md:text-base" 
                        variant="outline"
                      >
                        <Lock className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                        Not Available
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full transition-all duration-300 transform hover:scale-105 text-sm md:text-base ${
                          plan.featured
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                            : ''
                        }`}
                        variant={plan.featured ? 'default' : 'outline'}
                      >
                        {plan.buttonText || (plan.planType === 'free' ? 'Downgrade' : 'Upgrade')}
                        <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    )}
                  </CardFooter>

                  {/* Tagline */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pb-4 md:pb-6 text-center"
                  >
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Coffee className="h-2 w-2 md:h-3 md:w-3" />
                      {plan.tagline}
                    </p>
                  </motion.div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Comparison Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12"
        >
          <Button 
            variant="ghost" 
            onClick={() => setShowComparison(!showComparison)}
            className="group gap-2 text-muted-foreground transition-colors hover:text-white text-sm md:text-base"
          >
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 group-hover:rotate-12 transition-transform" />
            {showComparison ? "Hide" : "Compare all features"}
            <ArrowRight className="h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Comparison Table */}
        <AnimatePresence>
          {showComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="mt-8 overflow-hidden px-2 sm:px-0"
            >
              <Card className="overflow-hidden shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Layers className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                    Feature Comparison
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Compare all features across different plans
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="p-3 md:p-4 text-left font-semibold text-sm md:text-base">Feature</th>
                        {plans.map(plan => (
                          <th key={plan.id} className="p-3 md:p-4 text-center font-semibold capitalize text-sm md:text-base">
                            {plan.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ALL_FEATURES.map((feature, idx) => (
                        <tr key={idx} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="p-3 md:p-4 font-medium text-sm md:text-base">
                            <div className="flex items-center gap-1 md:gap-2">
                              {React.createElement(FEATURE_ICONS[feature] || Gem, { className: "h-3 w-3 md:h-4 md:w-4 text-muted-foreground" })}
                              {feature}
                            </div>
                          </td>
                          {plans.map(plan => {
                            const value = plan.features[feature];
                            const enabled = value === true || typeof value === 'string';
                            return (
                              <td key={plan.id} className="p-3 md:p-4 text-center">
                                {enabled ? (
                                  <div className="flex items-center justify-center gap-1">
                                    {typeof value === 'string' ? (
                                      <span className="text-xs md:text-sm font-medium text-green-600 dark:text-green-400">{value}</span>
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                                    )}
                                  </div>
                                ) : (
                                  <div className="h-4 w-4 md:h-5 md:w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 mx-auto" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 items-center">
            {[
              { icon: Shield, text: "Secure Payments", color: "text-green-500" },
              { icon: Users, text: "10,000+ Active Users", color: "text-blue-500" },
              { icon: Globe, text: "Available Worldwide", color: "text-purple-500" },
              { icon: Star, text: "4.9/5 Rating", color: "text-yellow-500" },
              { icon: Smartphone, text: "Mobile Optimized", color: "text-indigo-500" },
              { icon: Headphones, text: "24/7 Support", color: "text-red-500" },
            ].map((badge, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm"
              >
                <badge.icon className={`h-4 w-4 md:h-5 md:w-5 ${badge.color}`} />
                <span className="text-xs md:text-sm text-muted-foreground">{badge.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-12 md:mt-16 text-center"
        >
          <p className="text-xs md:text-sm text-muted-foreground px-4">
            Have questions?{" "}
            <a 
              href="http://colossusiq.ai/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Contact our support team
            </a>{" "}
            for personalized assistance.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePricing;