import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Check, Crown, Zap, Sparkles, Star, Rocket, Shield,
  Clock, Users, Globe, Lock, TrendingUp,
  Gift, ArrowRight, CheckCircle2, AlertTriangle,
  BookOpen, Video, MessageSquare, FileText, Award,
  BarChart, Headphones, Smartphone, Coffee,
  Target, Brain, Layers, Gem, Diamond, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import {
  FreeCost, FreeType, MonthCost, MonthType,
  YearCost, YearType, serverURL,
} from '@/constants';

/* ─── Feature config ──────────────────────────────────────── */
const ALL_FEATURES = [
  'Sub-Topic Limit','Access Duration','Theory & Image Course',
  'Create Courses','AI Teacher Chat','Course in 23+ Languages',
  'Video & Theory Course','Resume Builder','AI Notebook',
  'Interview Preparation','Certification','Priority Support','Advanced Analytics',
];

const FEATURE_ICONS: Record<string, any> = {
  'Sub-Topic Limit': Layers, 'Access Duration': Clock,
  'Theory & Image Course': BookOpen, 'Create Courses': FileText,
  'AI Teacher Chat': MessageSquare, 'Course in 23+ Languages': Globe,
  'Video & Theory Course': Video, 'Resume Builder': FileText,
  'AI Notebook': Brain, 'Interview Preparation': Target,
  'Certification': Award, 'Priority Support': Headphones,
  'Advanced Analytics': BarChart,
};

const PLAN_FEATURES: Record<string, Record<string, boolean | string>> = {
  free: {
    'Sub-Topic Limit':'5 per course','Access Duration':'7 days',
    'Theory & Image Course':true,'Create Courses':'1 course only',
    'AI Teacher Chat':true,'Course in 23+ Languages':false,
    'Video & Theory Course':false,'Resume Builder':false,'AI Notebook':false,
    'Interview Preparation':false,'Certification':true,
    'Priority Support':false,'Advanced Analytics':false,
  },
  monthly: {
    'Sub-Topic Limit':'10 per course','Access Duration':'1 month',
    'Theory & Image Course':true,'Create Courses':'20 courses only',
    'AI Teacher Chat':true,'Course in 23+ Languages':false,
    'Video & Theory Course':true,'Resume Builder':true,'AI Notebook':true,
    'Interview Preparation':true,'Certification':true,
    'Priority Support':true,'Advanced Analytics':true,
  },
  yearly: {
    'Sub-Topic Limit':'10 per course','Access Duration':'1 year',
    'Theory & Image Course':true,'Create Courses':'Unlimited',
    'AI Teacher Chat':true,'Course in 23+ Languages':true,
    'Video & Theory Course':true,'Resume Builder':true,'AI Notebook':true,
    'Interview Preparation':true,'Certification':true,
    'Priority Support':true,'Advanced Analytics':true,
  },
};

const PLAN_ORDER: Record<string, number> = { free:0, monthly:1, yearly:2 };

/* ─── Per-plan accent palette ─────────────────────────────── */
const PLAN_PALETTE: Record<string, any> = {
  free: {
    gradient: 'linear-gradient(135deg,#6b7280,#4b5563)',
    glow: 'rgba(107,114,128,0.3)',
    border: 'rgba(107,114,128,0.3)',
    badge: 'rgba(107,114,128,0.15)',
    badgeText: '#d1d5db',
    tagColor: '#9ca3af',
    icon: Sparkles,
    emoji: '✨',
    label: 'Free Forever',
    tagline: 'Start your journey',
    buttonText: 'Get Started Free',
    description: 'Perfect for beginners exploring the platform.',
  },
  monthly: {
    gradient: 'linear-gradient(135deg,#22d3ee,#0891b2)',
    glow: 'rgba(34,211,238,0.35)',
    border: 'rgba(34,211,238,0.3)',
    badge: 'rgba(34,211,238,0.15)',
    badgeText: '#67e8f9',
    tagColor: '#22d3ee',
    icon: Zap,
    emoji: '⚡',
    label: 'Most Flexible',
    tagline: 'Grow month by month',
    buttonText: 'Subscribe Monthly',
    description: 'For serious creators who want flexibility.',
  },
  yearly: {
    gradient: 'linear-gradient(135deg,#a855f7,#f472b6)',
    glow: 'rgba(168,85,247,0.45)',
    border: 'rgba(168,85,247,0.4)',
    badge: 'rgba(168,85,247,0.18)',
    badgeText: '#d8b4fe',
    tagColor: '#a855f7',
    icon: Crown,
    emoji: '👑',
    label: 'Best Value',
    tagline: 'Go all in — save big',
    buttonText: 'Subscribe Yearly',
    description: 'Unlock everything with maximum savings.',
    featured: true,
  },
};

/* ─── Feature row accent cycling ─────────────────────────── */
const ROW_ACCENTS = [
  'rgba(168,85,247,0.06)','rgba(34,211,238,0.05)',
  'rgba(244,114,182,0.05)','rgba(251,191,36,0.04)',
];

const fadeInUp: Variants = {
  hidden:{ opacity:0, y:28 },
  visible:{ opacity:1, y:0 },
};

const INITIAL_FEATURES_COUNT = 5;

/* ─── Main Component ──────────────────────────────────────── */
const Pricing1 = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserPlan, setCurrentUserPlan] = useState<string>('free');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string|null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<string|null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string,boolean>>({});
  const { toast } = useToast();

  /* ── Data fetching (unchanged logic) ── */
  useEffect(() => {
    fetchUserCurrentPlan();
    fetchPricing();
    const handleStorageChange = (e: StorageEvent) => {
      if(e.key==='user'||e.key==='type') fetchUserCurrentPlan();
    };
    window.addEventListener('storage', handleStorageChange);
    return ()=>window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchUserCurrentPlan = async () => {
    try {
      const userIdFromSession = sessionStorage.getItem('uid');
      const userStr = localStorage.getItem('user');
      if(userStr && userIdFromSession){
        try{
          const userData=JSON.parse(userStr);
          const userIdFromLocal=userData._id||userData.id;
          if(userIdFromLocal===userIdFromSession && userData.type){
            const userPlan=userData.type.toLowerCase();
            setCurrentUserPlan(userPlan);
            setSubscriptionEnd(userData.subscriptionEnd||null);
            sessionStorage.setItem('type',userPlan);
            return;
          } else { localStorage.removeItem('user'); localStorage.removeItem('token'); }
        } catch(e){ console.error('Error parsing user data:',e); }
      }
      const sessionPlan=sessionStorage.getItem('type');
      if(sessionPlan) setCurrentUserPlan(sessionPlan.toLowerCase());
      if(!userIdFromSession) return;
      try{
        const response=await axios.get(`${serverURL}/api/user/${userIdFromSession}`);
        if(response.data?.user?.type){
          const userPlan=response.data.user.type.toLowerCase();
          setCurrentUserPlan(userPlan);
          setSubscriptionEnd(response.data.user.subscriptionEnd||null);
          sessionStorage.setItem('type',userPlan);
          localStorage.setItem('user',JSON.stringify(response.data.user));
        }
      } catch(apiError){ console.error('API fetch failed:',apiError); }
    } catch(error){ console.error('Error in fetchUserCurrentPlan:',error); }
  };

  const fetchPricing = async () => {
    try {
      setIsLoading(true);
      const response=await axios.get(`${serverURL}/api/pricing`);
      if(response.data?.success && response.data?.pricing){
        const pricingData=Array.isArray(response.data.pricing)
          ? response.data.pricing : Object.values(response.data.pricing);
        const formattedPlans=pricingData.map((plan:any)=>{
          const planType=plan.planType||'free';
          const palette=PLAN_PALETTE[planType];
          return { id:planType, name:plan.planName||plan.name, price:plan.price||0,
            currency:plan.currency||'INR', features:PLAN_FEATURES[planType],
            planType, ...palette };
        });
        formattedPlans.sort((a:any,b:any)=>PLAN_ORDER[a.planType]-PLAN_ORDER[b.planType]);
        setPlans(formattedPlans);
      }
    } catch(error){
      setPlans([
        { id:'free', name:FreeType, price:FreeCost, currency:'INR', features:PLAN_FEATURES.free, planType:'free', ...PLAN_PALETTE.free },
        { id:'monthly', name:MonthType, price:MonthCost, currency:'INR', features:PLAN_FEATURES.monthly, planType:'monthly', ...PLAN_PALETTE.monthly },
        { id:'yearly', name:YearType, price:YearCost, currency:'INR', features:PLAN_FEATURES.yearly, planType:'yearly', ...PLAN_PALETTE.yearly },
      ]);
    } finally { setIsLoading(false); }
  };

  const handleSelectPlan = (plan:any) => {
    if(currentUserPlan===plan.id) return;
    navigate(`/dashboard/payment/${plan.id}`,{
      state:{ price:plan.price, currency:plan.currency, planType:plan.planType, planName:plan.name },
    });
  };

  const getCurrencySymbol = (currency:string) => ({ INR:'₹',USD:'$',EUR:'€',GBP:'£' })[currency]||'₹';

  const calculateSavings = () => {
    const mp=plans.find(p=>p.planType==='monthly');
    const yp=plans.find(p=>p.planType==='yearly');
    if(mp && yp && mp.price && yp.price){
      const savings=mp.price*12-yp.price;
      return { savings, percentage:((savings/(mp.price*12))*100).toFixed(0) };
    }
    return null;
  };
  const savings=calculateSavings();
  const toggleFeatures=(planId:string)=>setExpandedFeatures(prev=>({...prev,[planId]:!prev[planId]}));

  /* ── Loading state ── */
  if(isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#09090f' }}>
      <div className="text-center">
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full animate-spin"
            style={{ border:'3px solid transparent', borderTopColor:'#a855f7', borderRightColor:'#22d3ee' }} />
          <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-purple-400 animate-pulse" />
        </div>
        <p className="text-white/40 text-sm animate-pulse">Loading amazing plans...</p>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:'radial-gradient(ellipse 80% 50% at 50% 0%,rgba(109,40,217,0.14) 0%,transparent 65%), #09090f',
        fontFamily:"'Syne','Outfit',sans-serif",
      }}
    >
      {/* ── Ambient blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_,i)=>(
          <motion.div key={i} className="absolute w-px h-px rounded-full bg-white"
            style={{ top:`${Math.random()*100}%`, left:`${Math.random()*100}%` }}
            animate={{ opacity:[0.1,0.7,0.1] }}
            transition={{ duration:2+Math.random()*4, repeat:Infinity, delay:Math.random()*5 }} />
        ))}
        <motion.div animate={{ scale:[1,1.12,1], opacity:[0.07,0.13,0.07] }}
          transition={{ duration:8, repeat:Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-purple-500 blur-3xl" />
        <motion.div animate={{ scale:[1,1.1,1], opacity:[0.05,0.1,0.05] }}
          transition={{ duration:10, repeat:Infinity, delay:3 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cyan-400 blur-3xl" />
        <motion.div animate={{ scale:[1,1.08,1], opacity:[0.04,0.08,0.04] }}
          transition={{ duration:12, repeat:Infinity, delay:6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-pink-500 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-16 sm:py-20 px-5 sm:px-8 lg:px-10">

        {/* ── Header ── */}
        <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.7, type:'spring', stiffness:100 }}
          className="text-center mb-14 sm:mb-16"
        >
          <motion.div animate={{ rotate:[0,4,-4,0] }} transition={{ duration:3, repeat:Infinity, repeatDelay:2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background:'linear-gradient(90deg,rgba(168,85,247,0.18),rgba(34,211,238,0.12))', border:'1px solid rgba(168,85,247,0.35)' }}>
            <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase"
              style={{ background:'linear-gradient(90deg,#c084fc,#67e8f9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Choose Your Path
            </span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-4">
            Unlock Your{' '}
            <span style={{ background:'linear-gradient(110deg,#a855f7 0%,#22d3ee 50%,#f472b6 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Learning</span>
            <br />
            <span className="text-white">Superpowers</span>{' '}
            <span className="text-3xl sm:text-4xl md:text-5xl">🚀</span>
          </h1>

          <p className="text-white/40 text-sm sm:text-base max-w-2xl mx-auto">
            Choose the perfect plan to accelerate your course creation journey and unlock premium features designed for your success.
          </p>
        </motion.div>

        {/* ── Savings banner ── */}
        <AnimatePresence>
          {savings && savings.savings > 0 && (
            <motion.div initial={{ opacity:0, y:20, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:-20 }} transition={{ delay:0.5, type:'spring' }}
              className="mb-10 max-w-2xl mx-auto"
            >
              <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 text-center"
                style={{ background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.3)' }}>
                <div className="absolute inset-0 rounded-2xl animate-pulse"
                  style={{ background:'radial-gradient(ellipse at center,rgba(52,211,153,0.06) 0%,transparent 70%)' }} />
                <div className="relative flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-sm sm:text-base">
                  <Gift className="h-5 w-5 text-emerald-400 animate-bounce" />
                  <span className="font-black text-emerald-400">🎉 Limited Time</span>
                  <span className="text-emerald-300/80">
                    Save {savings.percentage}% (₹{savings.savings.toLocaleString()}) on Yearly!
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Plan cards ── */}
        <div className="grid lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
          {plans.map((plan, index) => {
            const isActive = currentUserPlan === plan.id;
            const isExpired = false;
            const isNotAvailable = false;
            const isHovered = hoveredPlan === plan.id;
            const palette = PLAN_PALETTE[plan.planType] || PLAN_PALETTE.free;
            const IconComponent = palette.icon;
            const isExpanded = expandedFeatures[plan.id] || false;
            const displayedFeatures = isExpanded ? ALL_FEATURES : ALL_FEATURES.slice(0, INITIAL_FEATURES_COUNT);
            const hasMoreFeatures = ALL_FEATURES.length > INITIAL_FEATURES_COUNT;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity:0, y:32 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay:index*0.12, duration:0.5 }}
                whileHover={{ y:-8, scale:1.015 }}
                onMouseEnter={()=>setHoveredPlan(plan.id)}
                onMouseLeave={()=>setHoveredPlan(null)}
                className="relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300"
                style={{
                  background: plan.featured ? 'rgba(168,85,247,0.07)' : 'rgba(255,255,255,0.03)',
                  border: isActive && !isExpired
                    ? '2px solid rgba(52,211,153,0.5)'
                    : isExpired
                    ? '2px solid rgba(248,113,113,0.5)'
                    : `1px solid ${palette.border}`,
                  boxShadow: isHovered
                    ? `0 0 48px ${palette.glow}`
                    : plan.featured
                    ? `0 0 32px ${palette.glow}`
                    : 'none',
                }}
              >
                {/* Noise texture */}
                <div className="absolute inset-0 opacity-[0.025] pointer-events-none rounded-3xl"
                  style={{ backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />

                {/* Hover glow bloom */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-500 opacity-0"
                  style={{ background:`radial-gradient(ellipse at 50% 0%,${palette.glow} 0%,transparent 65%)`,
                    opacity: isHovered ? 1 : 0 }} />

                {/* Top gradient line */}
                {plan.featured && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
                    style={{ background: palette.gradient }} />
                )}

                {/* Status badges */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-1 items-end">
                  {plan.featured && !isActive && !isExpired && (
                    <motion.div initial={{ x:60, opacity:0 }} animate={{ x:0, opacity:1 }}
                      transition={{ delay:0.6 }}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white"
                      style={{ background: palette.gradient, boxShadow:`0 4px 12px ${palette.glow}` }}>
                      <Star className="h-2.5 w-2.5 fill-current" /> Most Popular
                    </motion.div>
                  )}
                  {isActive && !isExpired && (
                    <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white"
                      style={{ background:'linear-gradient(135deg,#34d399,#059669)', boxShadow:'0 4px 12px rgba(52,211,153,0.4)' }}>
                      <CheckCircle2 className="h-2.5 w-2.5" /> Active Plan
                    </motion.div>
                  )}
                  {isExpired && (
                    <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white animate-pulse"
                      style={{ background:'linear-gradient(135deg,#f87171,#dc2626)' }}>
                      <AlertTriangle className="h-2.5 w-2.5" /> Expired
                    </motion.div>
                  )}
                </div>

                {/* Card header */}
                <div className="pt-8 sm:pt-10 px-6 sm:px-8 pb-6 text-center">
                  {/* Icon */}
                  <motion.div animate={{ scale:isHovered?1.1:1, rotate:isHovered?6:0 }}
                    transition={{ duration:0.3 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl flex items-center justify-center mb-5 text-2xl sm:text-3xl shadow-lg"
                    style={{ background: palette.gradient, boxShadow:`0 8px 28px ${palette.glow}` }}>
                    {palette.emoji}
                  </motion.div>

                  <h3 className="text-xl sm:text-2xl font-black text-white capitalize mb-2">{plan.name}</h3>

                  {/* Plan badge */}
                  <span className="inline-block text-[10px] font-black px-3 py-1 rounded-full mb-3 tracking-widest uppercase"
                    style={{ background:palette.badge, color:palette.badgeText, border:`1px solid ${palette.border}` }}>
                    {palette.label}
                  </span>

                  <p className="text-white/40 text-xs sm:text-sm">{palette.description}</p>
                </div>

                {/* Price */}
                <div className="px-6 sm:px-8 pb-5 text-center">
                  <motion.div animate={{ scale:isHovered?1.06:1 }} transition={{ duration:0.3 }}>
                    <span className="text-4xl sm:text-5xl font-black text-white">
                      {getCurrencySymbol(plan.currency)}{plan.price}
                    </span>
                    {plan.planType !== 'free' && (
                      <span className="text-white/35 text-sm ml-2">
                        /{plan.planType==='monthly'?'month':'year'}
                      </span>
                    )}
                  </motion.div>

                  {plan.planType==='yearly' && savings && (
                    <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
                      className="text-xs text-emerald-400 mt-1.5 font-bold">
                      Save ₹{savings.savings.toLocaleString()} annually 🎉
                    </motion.p>
                  )}
                </div>

                {/* Divider */}
                <div className="mx-6 sm:mx-8 mb-5 h-px" style={{ background:`linear-gradient(90deg,transparent,${palette.border},transparent)` }} />

                {/* Features list */}
                <div className="px-6 sm:px-8 flex-1 space-y-2.5">
                  <AnimatePresence mode="wait">
                    {displayedFeatures.map((feature, i) => {
                      const value = plan.features[feature];
                      const enabled = value===true || typeof value==='string';
                      const FeatureIcon = FEATURE_ICONS[feature] || Gem;

                      return (
                        <motion.div key={feature}
                          initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                          exit={{ opacity:0, x:-16 }} transition={{ delay:i*0.03 }}
                          className="flex items-start gap-3 p-2 rounded-xl transition-colors duration-200"
                          style={{ background: i%2===0 ? ROW_ACCENTS[0] : 'transparent' }}>
                          {/* Check / dash */}
                          <div className="mt-0.5 flex-shrink-0 w-4 h-4 flex items-center justify-center">
                            {enabled ? (
                              <div className="w-4 h-4 rounded-full flex items-center justify-center"
                                style={{ background: palette.gradient }}>
                                <Check className="h-2.5 w-2.5 text-white" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full"
                                style={{ border:'1.5px solid rgba(255,255,255,0.12)' }} />
                            )}
                          </div>

                          <div className="flex-1 flex items-center gap-1.5 min-w-0">
                            <FeatureIcon className="h-3 w-3 flex-shrink-0" style={{ color:enabled?palette.tagColor:'rgba(255,255,255,0.2)' }} />
                            <span className={`text-xs sm:text-sm truncate ${enabled?'text-white/80':'text-white/25 line-through'}`}>
                              {typeof value==='string' ? `${feature}: ${value}` : feature}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {hasMoreFeatures && (
                    <button onClick={()=>toggleFeatures(plan.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-black rounded-xl transition-all duration-200 hover:opacity-80 mt-1"
                      style={{ color:palette.tagColor, background:palette.badge }}>
                      {isExpanded ? (
                        <><ChevronUp className="h-3 w-3" /> Show less</>
                      ) : (
                        <><ChevronDown className="h-3 w-3" /> Show all {ALL_FEATURES.length} features</>
                      )}
                    </button>
                  )}
                </div>

                {/* CTA button */}
                <div className="p-6 sm:p-8 pt-5">
                  {isActive && !isExpired ? (
                    <button disabled
                      className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-default opacity-80"
                      style={{ background:'linear-gradient(135deg,#34d399,#059669)', color:'#fff' }}>
                      <CheckCircle2 className="h-4 w-4" /> Current Plan
                    </button>
                  ) : isExpired ? (
                    <button onClick={()=>handleSelectPlan(plan)}
                      className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                      style={{ background:'linear-gradient(135deg,#f87171,#dc2626)', color:'#fff', boxShadow:'0 6px 20px rgba(248,113,113,0.4)' }}>
                      <Rocket className="h-4 w-4" /> Renew Plan
                    </button>
                  ) : isNotAvailable ? (
                    <button disabled
                      className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                      style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.3)', border:'1px solid rgba(255,255,255,0.1)' }}>
                      <Lock className="h-4 w-4" /> Not Available
                    </button>
                  ) : (
                    <button onClick={()=>handleSelectPlan(plan)}
                      className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:scale-105 hover:opacity-90 transition-all duration-200 active:scale-95"
                      style={{ background: palette.gradient, color:'#fff', boxShadow:`0 6px 20px ${palette.glow}` }}>
                      {palette.buttonText}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}

                  <p className="text-center text-[10px] text-white/25 mt-3 flex items-center justify-center gap-1">
                    <Coffee className="h-3 w-3" /> {palette.tagline}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Compare all features button ── */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
          className="text-center mt-10 sm:mt-12">
          <button onClick={()=>setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all duration-200 hover:scale-105"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)' }}>
            <TrendingUp className="h-4 w-4" />
            {showComparison ? 'Hide comparison' : 'Compare all features'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        {/* ── Comparison table ── */}
        <AnimatePresence>
          {showComparison && (
            <motion.div initial={{ opacity:0, height:0, y:20 }} animate={{ opacity:1, height:'auto', y:0 }}
              exit={{ opacity:0, height:0, y:20 }} transition={{ duration:0.5 }}
              className="mt-8 overflow-hidden rounded-3xl"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>

              {/* Table header */}
              <div className="px-6 sm:px-8 py-5"
                style={{ background:'rgba(168,85,247,0.08)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-400" />
                  <h3 className="font-black text-white text-lg">Feature Comparison</h3>
                </div>
                <p className="text-white/35 text-sm mt-1">Compare all features across different plans</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px]">
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      <th className="p-4 text-left text-xs font-black text-white/40 uppercase tracking-widest">Feature</th>
                      {plans.map(plan => {
                        const pal = PLAN_PALETTE[plan.planType];
                        return (
                          <th key={plan.id} className="p-4 text-center text-xs font-black uppercase tracking-widest"
                            style={{ color: pal.tagColor }}>
                            {pal.emoji} {plan.name}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_FEATURES.map((feature, idx) => (
                      <tr key={idx}
                        className="transition-colors duration-150"
                        style={{ borderTop:'1px solid rgba(255,255,255,0.04)', background: idx%2===0?'rgba(255,255,255,0.01)':'transparent' }}>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-white/60 text-sm">
                            {React.createElement(FEATURE_ICONS[feature]||Gem,{ className:'h-3.5 w-3.5 text-white/30' })}
                            {feature}
                          </div>
                        </td>
                        {plans.map(plan => {
                          const value=plan.features[feature];
                          const enabled=value===true||typeof value==='string';
                          const pal=PLAN_PALETTE[plan.planType];
                          return (
                            <td key={plan.id} className="p-4 text-center">
                              {enabled ? (
                                typeof value==='string' ? (
                                  <span className="text-xs font-bold" style={{ color:pal.tagColor }}>{value}</span>
                                ) : (
                                  <div className="w-5 h-5 rounded-full mx-auto flex items-center justify-center"
                                    style={{ background:pal.gradient }}>
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )
                              ) : (
                                <div className="w-5 h-5 rounded-full mx-auto"
                                  style={{ border:'1.5px solid rgba(255,255,255,0.1)' }} />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Trust badges ── */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:1 }}
          className="mt-14 sm:mt-16 pt-8"
          style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 items-center">
            {[
              { icon:Shield, text:'Secure Payments', color:'#34d399', bg:'rgba(52,211,153,0.1)' },
              { icon:Users, text:'10,000+ Active Users', color:'#22d3ee', bg:'rgba(34,211,238,0.1)' },
              { icon:Globe, text:'Available Worldwide', color:'#a855f7', bg:'rgba(168,85,247,0.1)' },
              { icon:Star, text:'4.9/5 Rating', color:'#fbbf24', bg:'rgba(251,191,36,0.1)' },
              { icon:Smartphone, text:'Mobile Optimized', color:'#f472b6', bg:'rgba(244,114,182,0.1)' },
              { icon:Headphones, text:'24/7 Support', color:'#f87171', bg:'rgba(248,113,113,0.1)' },
            ].map((badge, idx) => (
              <motion.div key={idx} whileHover={{ scale:1.06, y:-2 }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm"
                style={{ background:badge.bg, border:`1px solid ${badge.color}30` }}>
                <badge.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" style={{ color:badge.color }} />
                <span className="text-white/50 whitespace-nowrap">{badge.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── FAQ CTA ── */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }}
          className="mt-10 sm:mt-12 text-center">
          <p className="text-white/25 text-xs sm:text-sm">
            Have questions?{' '}
            <button className="font-black hover:opacity-80 transition-opacity"
              style={{ color:'#a855f7' }}>
              Contact our support team
            </button>{' '}
            for personalized assistance.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing1;
