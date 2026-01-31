
// // // // import React, { useEffect, useRef, useState } from 'react';
// // // // import { Button } from '@/components/ui/button';
// // // // import { cn } from '@/lib/utils';
// // // // import { Check } from 'lucide-react';
// // // // import { FreeCost, FreeType, MonthCost, MonthType, YearCost, YearType, serverURL } from '@/constants';
// // // // import { useNavigate } from 'react-router-dom';
// // // // import { Skeleton } from '@/components/ui/skeleton';
// // // // import axios from 'axios';

// // // // interface PricingPlan {
// // // //   planType: string;
// // // //   planName: string;
// // // //   price: number;
// // // //   currency: string;
// // // //   billingPeriod: string;
// // // // }

// // // // const PLAN_FEATURES = {
// // // //   free: [
// // // //     "Generate 5 Sub-Topics",
// // // //     "Lifetime access",
// // // //     "Theory & Image Course",
// // // //     "Ai Teacher Chat",
// // // //   ],
// // // //   monthly: [
// // // //     "Generate 10 Sub-Topics",
// // // //     "1 Month Access",
// // // //     "Theory & Image Course",
// // // //     "Ai Teacher Chat",
// // // //     "Course In 23+ Languages",
// // // //     "Create Unlimited Course",
// // // //     "Video & Theory Course",
// // // //   ],
// // // //   yearly: [
// // // //     "Generate 10 Sub-Topics",
// // // //     "1 Year Access",
// // // //     "Theory & Image Course",
// // // //     "Ai Teacher Chat",
// // // //     "Course In 23+ Languages",
// // // //     "Create Unlimited Course",
// // // //     "Video & Theory Course",
// // // //   ]
// // // // };

// // // // const Pricing = () => {
// // // //   const pricingRef = useRef<HTMLDivElement>(null);
// // // //   const navigate = useNavigate();
// // // //   const [plans, setPlans] = useState<any[]>([]);
// // // //   const [isLoading, setIsLoading] = useState(true);

// // // //   useEffect(() => {
// // // //     fetchPricing();
// // // //   }, []);

// // // //   const fetchPricing = async () => {
// // // //     try {
// // // //       setIsLoading(true);
// // // //       const response = await axios.get(`${serverURL}/api/pricing`);
      
// // // //       if (response.data.success && response.data.pricing) {
// // // //         const pricingData = Array.isArray(response.data.pricing)
// // // //           ? response.data.pricing
// // // //           : Object.values(response.data.pricing);

// // // //         // Sort and format pricing data
// // // //         const formattedPlans = pricingData.map((plan: any) => {
// // // //           const planType = plan.planType || 'free';
// // // //           const isFeatured = planType === 'monthly';

// // // //           return {
// // // //             name: plan.planName || plan.name,
// // // //             description: "",
// // // //             price: plan.price || 0,
// // // //             currency: plan.currency || 'USD',
// // // //             features: PLAN_FEATURES[planType as keyof typeof PLAN_FEATURES] || [],
// // // //             featured: isFeatured,
// // // //             cta: "Get Started",
// // // //             billing: planType === 'free' ? 'forever' : planType === 'monthly' ? 'monthly' : 'yearly',
// // // //             planType: planType
// // // //           };
// // // //         });

// // // //         // Sort: free, monthly, yearly
// // // //         formattedPlans.sort((a: any, b: any) => {
// // // //           const order = { free: 0, monthly: 1, yearly: 2 };
// // // //           return (order[a.planType as keyof typeof order] || 3) - (order[b.planType as keyof typeof order] || 3);
// // // //         });

// // // //         setPlans(formattedPlans);
// // // //       }
// // // //     } catch (error) {
// // // //       console.error('Error fetching pricing:', error);
// // // //       // Fallback to defaults
// // // //       const defaultPlans = [
// // // //         {
// // // //           name: FreeType,
// // // //           description: "",
// // // //           price: FreeCost,
// // // //           currency: 'USD',
// // // //           features: PLAN_FEATURES.free,
// // // //           featured: false,
// // // //           cta: "Get Started",
// // // //           billing: "forever",
// // // //           planType: 'free'
// // // //         },
// // // //         {
// // // //           name: MonthType,
// // // //           description: "",
// // // //           price: MonthCost,
// // // //           currency: 'USD',
// // // //           features: PLAN_FEATURES.monthly,
// // // //           featured: true,
// // // //           cta: "Get Started",
// // // //           billing: "monthly",
// // // //           planType: 'monthly'
// // // //         },
// // // //         {
// // // //           name: YearType,
// // // //           description: "",
// // // //           price: YearCost,
// // // //           currency: 'USD',
// // // //           features: PLAN_FEATURES.yearly,
// // // //           featured: false,
// // // //           cta: "Get Started",
// // // //           billing: "yearly",
// // // //           planType: 'yearly'
// // // //         }
// // // //       ];
// // // //       setPlans(defaultPlans);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     if (!isLoading && plans.length > 0) {
// // // //       const observerOptions = {
// // // //         root: null,
// // // //         rootMargin: '0px',
// // // //         threshold: 0.1,
// // // //       };

// // // //       const observer = new IntersectionObserver((entries) => {
// // // //         entries.forEach(entry => {
// // // //           if (entry.isIntersecting) {
// // // //             entry.target.classList.add('animate-fade-up');
// // // //             entry.target.classList.remove('opacity-0');
// // // //             observer.unobserve(entry.target);
// // // //           }
// // // //         });
// // // //       }, observerOptions);

// // // //       const titleEl = document.querySelector('.pricing-title');
// // // //       if (titleEl) observer.observe(titleEl);

// // // //       const switcherEl = document.querySelector('.pricing-switcher');
// // // //       if (switcherEl) observer.observe(switcherEl);

// // // //       const elements = pricingRef.current?.querySelectorAll('.pricing-card');
// // // //       elements?.forEach((el, index) => {
// // // //         el.setAttribute('style', `transition-delay: ${index * 100}ms`);
// // // //         observer.observe(el);
// // // //       });

// // // //       return () => {
// // // //         if (titleEl) observer.unobserve(titleEl);
// // // //         if (switcherEl) observer.unobserve(switcherEl);
// // // //         elements?.forEach(el => {
// // // //           observer.unobserve(el);
// // // //         });
// // // //       };
// // // //     }
// // // //   }, [isLoading, plans]);

// // //   // const getCurrencySymbol = (currency: string) => {
// // //   //   const symbols: { [key: string]: string } = {
// // //   //     'USD': '$',
// // //   //     'EUR': '€',
// // //   //     'GBP': '£',
// // //   //     'INR': '₹',
// // //   //     'JPY': '¥',
// // //   //     'AUD': 'A$',
// // //   //     'CAD': 'C$',
// // //   //     'SGD': 'S$'
// // //   //   };
// // //   //   return symbols[currency] || '$';
// // //   // };

// // // //   if (isLoading) {
// // // //     return (
// // // //       <section className="py-20 md:py-32 px-6 md:px-10 relative">
// // // //         <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
// // // //         <div className="max-w-7xl mx-auto">
// // // //           <div className="text-center mb-8">
// // // //             <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
// // // //               Pricing
// // // //             </span>
// // // //             <Skeleton className="h-12 w-full max-w-2xl mx-auto mb-4" />
// // // //             <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
// // // //           </div>

// // // //           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
// // // //             {[1, 2, 3].map((i) => (
// // // //               <Skeleton key={i} className="h-96 rounded-xl" />
// // // //             ))}
// // // //           </div>
// // // //         </div>
// // // //       </section>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <section id="pricing" className="py-20 md:py-32 px-6 md:px-10 relative">
// // // //       <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
// // // //       <div className="max-w-7xl mx-auto">
// // // //         <div className="text-center mb-8">
// // // //           <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
// // // //             Pricing
// // // //           </span>
// // // //           <h2 className="pricing-title opacity-0 font-display text-3xl md:text-4xl lg:text-5xl font-bold">
// // // //             Simple, <span className="text-primary">Transparent</span> Pricing
// // // //           </h2>
// // // //           <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
// // // //             Choose the plan that works best for your needs. All plans include our core AI course generation technology.
// // // //           </p>
// // // //         </div>

// // // //         {/* Billing toggle */}
// // // //         <div className="pricing-switcher opacity-0 flex justify-center items-center space-x-4 mb-16">
// // // //         </div>

// // // //         {/* Pricing cards */}
// // // //         <div
// // // //           ref={pricingRef}
// // // //           className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
// // // //         >
// // // //           {plans.map((plan, index) => (
// // // //             <div
// // // //               key={index}
// // // //               className={cn(
// // // //                 "pricing-card opacity-0 bg-card rounded-xl overflow-hidden transition-all duration-300 flex flex-col",
// // // //                 plan.featured ?
// // // //                   "border-2 border-primary shadow-lg shadow-primary/10 lg:-mt-6 lg:mb-6" :
// // // //                   "border border-border/50 shadow-sm hover:shadow-md"
// // // //               )}
// // // //             >
// // // //               {plan.featured && (
// // // //                 <div className="bg-primary py-1.5 text-center">
// // // //                   <span className="text-sm font-medium text-white">Most Popular</span>
// // // //                 </div>
// // // //               )}
// // // //               <div className="p-8 flex-1">
// // // //                 <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
// // // //                 <p className="text-muted-foreground mt-2 mb-6">{plan.description}</p>

// // // //                 <div className="mb-6">
// // // //                   <span className="font-display text-4xl font-bold">
// // // //                     {getCurrencySymbol(plan.currency)}{plan.price.toFixed(2)}
// // // //                   </span>
// // // //                   <span className="text-muted-foreground ml-2">{plan.billing === 'monthly' ? '/mo' : plan.billing === 'yearly' ? '/yr' : ''}</span>
// // // //                 </div>

// // // //                 <ul className="space-y-3 mb-8">
// // // //                   {plan.features.map((feature: string, i: number) => (
// // // //                     <li key={i} className="flex">
// // // //                       <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
// // // //                       <span>{feature}</span>
// // // //                     </li>
// // // //                   ))}
// // // //                 </ul>
// // // //               </div>

// // // //               <div className="p-8 pt-0">
// // // //                 <Button
// // // //                   onClick={() => navigate("/dashboard")}
// // // //                   className={cn(
// // // //                     "w-full",
// // // //                     plan.featured ? "bg-primary hover:bg-primary/90" : ""
// // // //                   )}
// // // //                   variant={plan.featured ? "default" : "outline"}
// // // //                 >
// // // //                   {plan.cta}
// // // //                 </Button>
// // // //               </div>
// // // //             </div>
// // // //           ))}
// // // //         </div>
// // // //       </div>
// // // //     </section>
// // // //   );
// // // // };

// // // // export default Pricing;



// // // import React, { useEffect, useState, useRef } from 'react';
// // // import { Button } from '@/components/ui/button';
// // // import { cn } from '@/lib/utils';
// // // import { Check, Star } from 'lucide-react';
// // // import { FreeCost, FreeType, MonthCost, MonthType, YearCost, YearType, serverURL } from '@/constants';
// // // import { useNavigate } from 'react-router-dom';
// // // import { Skeleton } from '@/components/ui/skeleton';
// // // import axios from 'axios';
// // // import { motion, easeOut } from "framer-motion";


// // // interface PricingPlan {
// // //   planType: string;
// // //   planName: string;
// // //   price: number;
// // //   currency: string;
// // //   billingPeriod: string;
// // // }

// // // const PLAN_FEATURES = {
// // //   free: [
// // //     "Generate 5 Sub-Topics",
// // //     "Lifetime access",
// // //     "Theory & Image Course",
// // //     "Ai Teacher Chat",
// // //   ],
// // //   monthly: [
// // //     "Generate 10 Sub-Topics",
// // //     "1 Month Access",
// // //     "Theory & Image Course",
// // //     "Ai Teacher Chat",
// // //   ],
// // //   yearly: [
// // //     "Generate Unlimited Sub-Topics",
// // //     "1 Year Access",
// // //     "Theory & Image Course",
// // //     "Ai Teacher Chat",
// // //   ],
// // // };

// // // const Pricing = () => {

// // //   const [plans, setPlans] = useState<any[]>([]);
// // //   const [isLoading, setIsLoading] = useState(true);
// // //   const navigate = useNavigate();
// // // const pricingRef = useRef<HTMLDivElement>(null);
// // // //   useEffect(() => {
// // // // const fetchPricing = async () => {
// // // //     try {
// // // //       setIsLoading(true);
// // // //       const response = await axios.get(`${serverURL}/api/pricing`);
      
// // // //       if (response.data.success && response.data.pricing) {
// // // //         const pricingData = Array.isArray(response.data.pricing)
// // // //           ? response.data.pricing
// // // //           : Object.values(response.data.pricing);

// // // //           setPlans(response.data);
// // // //         } else {
// // // //           setPlans([
// // // //             { planType: FreeType, planName: 'Free', price: FreeCost, currency: '$', billingPeriod: 'lifetime' },
// // // //             { planType: MonthType, planName: 'Monthly', price: MonthCost, currency: '$', billingPeriod: 'month' },
// // // //             { planType: YearType, planName: 'Yearly', price: YearCost, currency: '$', billingPeriod: 'year' },
// // // //           ]);
// // // //         }
// // // //       } catch (error) {
// // // //         console.error("Error fetching pricing:", error);
// // // //         setPlans([
// // // //           { planType: FreeType, planName: 'Free', price: FreeCost, currency: '$', billingPeriod: 'lifetime' },
// // // //           { planType: MonthType, planName: 'Monthly', price: MonthCost, currency: '$', billingPeriod: 'month' },
// // // //           { planType: YearType, planName: 'Yearly', price: YearCost, currency: '$', billingPeriod: 'year' },
// // // //         ]);
// // // //       } finally {
// // // //         setIsLoading(false);
// // // //       }
// // // //     };

// // // //     fetchPricing();
// // // //   }, []);

// // // useEffect(() => {
// // //   const fetchPricing = async () => {
// // //     try {
// // //       setIsLoading(true);

// // //       const response = await axios.get(`${serverURL}/api/pricing`);

// // //       if (response.data?.success && response.data?.pricing) {
// // //         const pricingData = Array.isArray(response.data.pricing)
// // //           ? response.data.pricing
// // //           : Object.values(response.data.pricing);

// // //         setPlans(pricingData);
// // //       } else {
// // //         setPlans(getDefaultPlans());
// // //       }
// // //     } catch (error) {
// // //       console.error("Error fetching pricing:", error);
// // //       setPlans(getDefaultPlans());
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   fetchPricing();
// // // }, []);
// // // const getDefaultPlans = () => [
// // //   {
// // //     planType: FreeType,
// // //     planName: 'Free',
// // //     price: FreeCost,
// // //     currency: 'USD',
// // //     billingPeriod: 'lifetime',
// // //   },
// // //   {
// // //     planType: MonthType,
// // //     planName: 'Monthly',
// // //     price: MonthCost,
// // //     currency: 'USD',
// // //     billingPeriod: 'month',
// // //   },
// // //   {
// // //     planType: YearType,
// // //     planName: 'Yearly',
// // //     price: YearCost,
// // //     currency: 'USD',
// // //     billingPeriod: 'year',
// // //   },
// // // ];


// // //   const containerVariants = {
// // //     hidden: { opacity: 0 },
// // //     visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
// // //   };

// // //   // const itemVariants = {
// // //   //   hidden: { opacity: 0, y: 20 },
// // //   //   visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
// // //   // };

// // //   const itemVariants = {
// // //   hidden: { opacity: 0, y: 20 },
// // //   visible: {
// // //     opacity: 1,
// // //     y: 0,
// // //     transition: {
// // //       duration: 0.5,
// // //       ease: easeOut,
// // //     },
// // //   },
// // // };

// // //   const getCurrencySymbol = (currency: string) => {
// // //     const symbols: { [key: string]: string } = {
// // //       'USD': '$',
// // //       'EUR': '€',
// // //       'GBP': '£',
// // //       'INR': '₹',
// // //       'JPY': '¥',
// // //       'AUD': 'A$',
// // //       'CAD': 'C$',
// // //       'SGD': 'S$'
// // //     };
// // //     return symbols[currency] || '$';
// // //   };

// // //   if (isLoading) {
// // //     return (
// // //       <section className="py-24 bg-white">
// // //         <div className="max-w-7xl mx-auto px-6 md:px-10">
// // //           <div className="text-center mb-16">
// // //             <Skeleton className="h-4 w-24 mx-auto mb-4" />
// // //             <Skeleton className="h-12 w-96 mx-auto" />
// // //           </div>
// // //           <div className="grid md:grid-cols-3 gap-8">
// // //             <Skeleton className="h-[500px] rounded-3xl" />
// // //             <Skeleton className="h-[550px] rounded-3xl" />
// // //             <Skeleton className="h-[500px] rounded-3xl" />
// // //           </div>
// // //         </div>
// // //       </section>
// // //     );
// // //   }

// // //   return (
// // //     <section id="pricing" className="py-24 md:py-32 bg-white relative overflow-hidden">
// // //       <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
// // //         <motion.div
// // //           initial={{ opacity: 0, y: 20 }}
// // //           whileInView={{ opacity: 1, y: 0 }}
// // //           viewport={{ once: true }}
// // //           transition={{ duration: 0.6 }}
// // //           className="text-center mb-20"
// // //         >
// // //           <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Pricing Plans</span>
// // //           <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
// // //             Choose the Right Plan for <br className="hidden md:block" /> Your Learning Goals
// // //           </h2>
// // //           <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
// // //         </motion.div>

// // //         <motion.div
// // //           variants={containerVariants}
// // //           initial="hidden"
// // //           whileInView="visible"
// // //           viewport={{ once: true, margin: "-100px" }}
// // //           className="grid md:grid-cols-3 gap-10 items-end"
// // //         >
// // //           {plans.map((plan, index) => {
// // //             const isFeatured = plan.planType === MonthType;
// // //             const features = isFeatured ? PLAN_FEATURES.monthly : (plan.planType === YearType ? PLAN_FEATURES.yearly : PLAN_FEATURES.free);

// // //             return (
// // //               <motion.div
// // //                 key={index}
// // //                  ref={pricingRef}
// // //                 variants={itemVariants}
// // //                 className={cn(
// // //                   "relative group flex flex-col p-10 rounded-[40px] transition-all duration-300",
// // //                   isFeatured
// // //                     ? "bg-slate-900 text-white shadow-2xl shadow-primary/30 scale-105 z-10 py-16"
// // //                     : "bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-xl py-12"
// // //                 )}
// // //               >
// // //                 {isFeatured && (
// // //                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold uppercase tracking-widest px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
// // //                     <Star className="h-3 w-3 fill-current" /> Most Popular
// // //                   </div>
// // //                 )}

// // //                 <div className="mb-8">
// // //                   <h3 className={cn("text-xl font-bold mb-4 uppercase tracking-widest", isFeatured ? "text-primary" : "text-slate-500")}>
// // //                     {plan.planName}
// // //                   </h3>
// // //                   <div className="flex items-baseline gap-1">
// // //                     <span className="font-display text-4xl font-bold">
// // //                     {getCurrencySymbol(plan.currency)}{plan.price.toFixed(2)}
// // //                   </span>
// // //                     <span className={cn("text-lg", isFeatured ? "text-slate-400" : "text-slate-500")}>/{plan.billingPeriod}</span>
// // //                   </div>
// // //                 </div>

// // //                 <div className="space-y-4 mb-10 flex-grow">
// // //                   {features.map((feature, fIndex) => (
// // //                     <div key={fIndex} className="flex items-center gap-3">
// // //                       <div className={cn(
// // //                         "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0",
// // //                         isFeatured ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
// // //                       )}>
// // //                         <Check className="h-4 w-4" />
// // //                       </div>
// // //                       <span className={cn("text-lg", isFeatured ? "text-slate-300" : "text-slate-600")}>{feature}</span>
// // //                     </div>
// // //                   ))}
// // //                 </div>

// // //                 <Button
// // //                   onClick={() => navigate("/signup")}
// // //                   size="lg"
// // //                   className={cn(
// // //                     "w-full h-16 rounded-full font-bold text-lg shadow-lg transition-all duration-300 active:scale-95",
// // //                     isFeatured
// // //                       ? "bg-primary hover:bg-white hover:text-primary text-white"
// // //                       : "bg-white text-primary hover:bg-primary hover:text-white border border-primary/20"
// // //                   )}
// // //                 >
// // //                   Choose {plan.planName} Plan
// // //                 </Button>
// // //               </motion.div>
// // //             );
// // //           })}
// // //         </motion.div>
// // //       </div>
// // //     </section>
// // //   );
// // // };

// // // export default Pricing;


// // import React, { useEffect, useState, useRef } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { cn } from '@/lib/utils';
// // import { Check, Star } from 'lucide-react';
// // import {
// //   FreeCost,
// //   FreeType,
// //   MonthCost,
// //   MonthType,
// //   YearCost,
// //   YearType,
// //   serverURL
// // } from '@/constants';
// // import { useNavigate } from 'react-router-dom';
// // import { Skeleton } from '@/components/ui/skeleton';
// // import axios from 'axios';
// // import { motion, easeOut } from 'framer-motion';

// // const PLAN_FEATURES = {
// //   free: [
// //     'Generate 5 Sub-Topics',
// //     'Lifetime access',
// //     'Theory & Image Course',
// //     'Ai Teacher Chat',
// //   ],
// //   monthly: [
// //     'Generate 10 Sub-Topics',
// //     '1 Month Access',
// //     'Theory & Image Course',
// //     'Ai Teacher Chat',
// //   ],
// //   yearly: [
// //     'Generate Unlimited Sub-Topics',
// //     '1 Year Access',
// //     'Theory & Image Course',
// //     'Ai Teacher Chat',
// //   ],
// // };

// // const Pricing = () => {
// //   const [plans, setPlans] = useState<any[]>([]);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const navigate = useNavigate();
// //   const pricingRef = useRef<HTMLDivElement>(null);

// //   // ================= FETCH PRICING =================
// //   useEffect(() => {
// //     const fetchPricing = async () => {
// //       try {
// //         setIsLoading(true);
// //         const response = await axios.get(`${serverURL}/api/pricing`);

// //         if (response.data?.success && response.data?.pricing) {
// //           const pricingData = Array.isArray(response.data.pricing)
// //             ? response.data.pricing
// //             : Object.values(response.data.pricing);

// //           setPlans(pricingData);
// //         } else {
// //           setPlans(getDefaultPlans());
// //         }
// //       } catch (error) {
// //         console.error('Pricing API error:', error);
// //         setPlans(getDefaultPlans());
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     fetchPricing();
// //   }, []);

// //   // ================= FALLBACK =================
// //   const getDefaultPlans = () => [
// //     {
// //       planType: 'free',
// //       planName: 'Free',
// //       price: FreeCost,
// //       currency: 'USD',
// //       billingPeriod: 'lifetime',
// //     },
// //     {
// //       planType: 'monthly',
// //       planName: 'Monthly',
// //       price: MonthCost,
// //       currency: 'USD',
// //       billingPeriod: 'month',
// //     },
// //     {
// //       planType: 'yearly',
// //       planName: 'Yearly',
// //       price: YearCost,
// //       currency: 'USD',
// //       billingPeriod: 'year',
// //     },
// //   ];

// //   // ================= ANIMATION =================
// //   const containerVariants = {
// //     hidden: { opacity: 0 },
// //     visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
// //   };

// //   const itemVariants = {
// //     hidden: { opacity: 0, y: 20 },
// //     visible: {
// //       opacity: 1,
// //       y: 0,
// //       transition: { duration: 0.5, ease: easeOut },
// //     },
// //   };

// //   const getCurrencySymbol = (currency: string) =>
// //     currency === 'USD' ? '$' : '₹';

// //   // ================= LOADING =================
// //   if (isLoading) {
// //     return (
// //       <section className="py-24 bg-white">
// //         <div className="max-w-7xl mx-auto px-6 md:px-10">
// //           <div className="grid md:grid-cols-3 gap-8">
// //             <Skeleton className="h-[500px] rounded-3xl" />
// //             <Skeleton className="h-[550px] rounded-3xl" />
// //             <Skeleton className="h-[500px] rounded-3xl" />
// //           </div>
// //         </div>
// //       </section>
// //     );
// //   }

// //   // ================= UI =================
// //   return (
// //     <section id="pricing" className="py-24 bg-white">
// //       <div className="max-w-7xl mx-auto px-6 md:px-10">
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           whileInView={{ opacity: 1, y: 0 }}
// //           viewport={{ once: true }}
// //           transition={{ duration: 0.6 }}
// //           className="text-center mb-20"
// //         >
// //           <span className="text-primary font-bold uppercase tracking-widest text-sm">
// //             Pricing Plans
// //           </span>
// //           <h2 className="text-3xl md:text-5xl font-bold mt-4">
// //             Choose the Right Plan for <br className="hidden md:block" />
// //             Your Learning Goals
// //           </h2>
// //         </motion.div>

// //         <motion.div
// //           variants={containerVariants}
// //           initial="hidden"
// //           whileInView="visible"
// //           viewport={{ once: true }}
// //           className="grid md:grid-cols-3 gap-10 items-end"
// //         >
// //           {plans.map((plan, index) => {
// //             const planType = plan.planType?.toLowerCase();
// //             const isFeatured = planType === 'monthly';
// //             const features = PLAN_FEATURES[planType as keyof typeof PLAN_FEATURES];

// //             return (
// //               <motion.div
// //                 key={index}
// //                 ref={pricingRef}
// //                 variants={itemVariants}
// //                 className={cn(
// //                   'relative flex flex-col rounded-[40px] transition-all duration-300 p-10',
// //                   isFeatured
// //                     ? 'bg-slate-900 text-white shadow-2xl scale-105 z-10 py-16'
// //                     : 'bg-slate-50 border border-slate-100 hover:shadow-xl py-12'
// //                 )}
// //               >
// //                 {isFeatured && (
// //                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold uppercase tracking-widest px-6 py-2 rounded-full flex items-center gap-2">
// //                     <Star className="h-3 w-3 fill-current" /> Most Popular
// //                   </div>
// //                 )}

// //                 <h3
// //                   className={cn(
// //                     'text-xl font-bold uppercase tracking-widest mb-4',
// //                     isFeatured ? 'text-primary' : 'text-slate-500'
// //                   )}
// //                 >
// //                   {plan.planName}
// //                 </h3>

// //                 <div className="flex items-baseline gap-1 mb-8">
// //                   <span className="text-4xl font-bold">
// //                     {getCurrencySymbol(plan.currency)}
// //                     {plan.price.toFixed(2)}
// //                   </span>
// //                   <span className="text-slate-400">/{plan.billingPeriod}</span>
// //                 </div>

// //                 <div className="space-y-4 flex-grow mb-10">
// //                   {features.map((feature, i) => (
// //                     <div key={i} className="flex items-center gap-3">
// //                       <div
// //                         className={cn(
// //                           'h-6 w-6 rounded-full flex items-center justify-center',
// //                           isFeatured
// //                             ? 'bg-primary/20 text-primary'
// //                             : 'bg-primary/10 text-primary'
// //                         )}
// //                       >
// //                         <Check className="h-4 w-4" />
// //                       </div>
// //                       <span
// //                         className={cn(
// //                           'text-lg',
// //                           isFeatured ? 'text-slate-300' : 'text-slate-600'
// //                         )}
// //                       >
// //                         {feature}
// //                       </span>
// //                     </div>
// //                   ))}
// //                 </div>

// //                 <Button
// //                   onClick={() => navigate('/signup')}
// //                   size="lg"
// //                   className={cn(
// //                     'w-full h-16 rounded-full font-bold text-lg transition-all',
// //                     isFeatured
// //                       ? 'bg-primary text-white hover:bg-white hover:text-primary'
// //                       : 'bg-white text-primary hover:bg-primary hover:text-white border'
// //                   )}
// //                 >
// //                   Choose {plan.planName} Plan
// //                 </Button>
// //               </motion.div>
// //             );
// //           })}
// //         </motion.div>
// //       </div>
// //     </section>
// //   );
// // };

// // export default Pricing;


// import React, { useEffect, useState, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { cn } from '@/lib/utils';
// import { Check, Star } from 'lucide-react';
// import {
//   FreeCost,
//   MonthCost,
//   YearCost,
//   serverURL
// } from '@/constants';
// import { useNavigate } from 'react-router-dom';
// import { Skeleton } from '@/components/ui/skeleton';
// import axios from 'axios';
// import { motion, easeOut } from 'framer-motion';

// /* ================= CURRENCY MAP ================= */
// const CURRENCY_SYMBOLS: Record<string, string> = {
//   USD: '$',
//   INR: '₹',
//   EUR: '€',
//   GBP: '£',
// };

// /* ================= PLAN FEATURES ================= */
// const PLAN_FEATURES = {
//   free: [
//     'Generate 5 Sub-Topics',
//     'Lifetime access',
//     'Theory & Image Course',
//     'Ai Teacher Chat',
//   ],
//   monthly: [
//     'Generate 10 Sub-Topics',
//     '1 Month Access',
//     'Theory & Image Course',
//     'Ai Teacher Chat',
//   ],
//   yearly: [
//     'Generate Unlimited Sub-Topics',
//     '1 Year Access',
//     'Theory & Image Course',
//     'Ai Teacher Chat',
//   ],
// };

// const Pricing = () => {
//   const [plans, setPlans] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();
//   const pricingRef = useRef<HTMLDivElement>(null);

//   /* ================= FETCH PRICING ================= */
//   useEffect(() => {
//     const fetchPricing = async () => {
//       try {
//         setIsLoading(true);
//         const response = await axios.get(`${serverURL}/api/pricing`);

//         if (response.data?.success && response.data?.pricing) {
//           const pricingData = Array.isArray(response.data.pricing)
//             ? response.data.pricing
//             : Object.values(response.data.pricing);

//           setPlans(pricingData);
//         } else {
//           setPlans(getDefaultPlans());
//         }
//       } catch (error) {
//         console.error('Pricing API error:', error);
//         setPlans(getDefaultPlans());
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchPricing();
//   }, []);

//   /* ================= FALLBACK ================= */
//   const getDefaultPlans = () => [
//     {
//       planType: 'free',
//       planName: 'Free',
//       price: FreeCost,
//       currency: 'USD',
//       billingPeriod: 'lifetime',
//     },
//     {
//       planType: 'monthly',
//       planName: 'Monthly',
//       price: MonthCost,
//       currency: 'USD',
//       billingPeriod: 'month',
//     },
//     {
//       planType: 'yearly',
//       planName: 'Yearly',
//       price: YearCost,
//       currency: 'USD',
//       billingPeriod: 'year',
//     },
//   ];

//   /* ================= HELPERS ================= */
//   const getCurrencySymbol = (currency?: string) => {
//     if (!currency) return '$';
//     return CURRENCY_SYMBOLS[currency.toUpperCase()] || '$';
//   };

//   /* ================= ANIMATION ================= */
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.5, ease: easeOut },
//     },
//   };

//   /* ================= LOADING ================= */
//   if (isLoading) {
//     return (
//       <section className="py-24 bg-white">
//         <div className="max-w-7xl mx-auto px-6 md:px-10">
//           <div className="grid md:grid-cols-3 gap-8">
//             <Skeleton className="h-[500px] rounded-3xl" />
//             <Skeleton className="h-[550px] rounded-3xl" />
//             <Skeleton className="h-[500px] rounded-3xl" />
//           </div>
//         </div>
//       </section>
//     );
//   }

//   /* ================= UI ================= */
//   return (
//     <section id="pricing" className="py-24 bg-white">
//       <div className="max-w-7xl mx-auto px-6 md:px-10">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-20"
//         >
//           <span className="text-primary font-bold uppercase tracking-widest text-sm">
//             Pricing Plans
//           </span>
//           <h2 className="text-3xl md:text-5xl font-bold mt-4">
//             Choose the Right Plan for <br className="hidden md:block" />
//             Your Learning Goals
//           </h2>
//         </motion.div>

//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           className="grid md:grid-cols-3 gap-10 items-end"
//         >
//           {plans.map((plan, index) => {
//             const planType = plan.planType?.toLowerCase();
//             const isFeatured = planType === 'monthly';
//             const features =
//               PLAN_FEATURES[planType as keyof typeof PLAN_FEATURES];

//             return (
//               <motion.div
//                 key={index}
//                 ref={pricingRef}
//                 variants={itemVariants}
//                 className={cn(
//                   'relative flex flex-col rounded-[40px] transition-all duration-300 p-10',
//                   isFeatured
//                     ? 'bg-slate-900 text-white shadow-2xl scale-105 z-10 py-16'
//                     : 'bg-slate-50 border border-slate-100 hover:shadow-xl py-12'
//                 )}
//               >
//                {isFeatured && (
//   <div className="absolute -top-5 inset-x-0 flex justify-center">
//     <div className="bg-primary text-white text-xs font-bold uppercase tracking-widest px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
//       <Star className="h-3 w-3 fill-current" />
//       Most Popular
//     </div>
//   </div>
// )}


//                 <h3
//                   className={cn(
//                     'text-xl font-bold uppercase tracking-widest mb-4',
//                     isFeatured ? 'text-primary' : 'text-slate-500'
//                   )}
//                 >
//                   {plan.planName}
//                 </h3>

//                 {/* PRICE */}
//                 <div className="flex items-baseline gap-1 mb-8">
//                   <span className="text-4xl font-bold">
//                     {getCurrencySymbol(plan.currency)}
//                     {Number(plan.price).toFixed(2)}
//                   </span>
//                   <span className="text-slate-400">
//                     /{plan.billingPeriod}
//                   </span>
//                 </div>

//                 {/* FEATURES */}
//                 <div className="space-y-4 flex-grow mb-10">
//                   {features.map((feature, i) => (
//                     <div key={i} className="flex items-center gap-3">
//                       <div
//                         className={cn(
//                           'h-6 w-6 rounded-full flex items-center justify-center',
//                           isFeatured
//                             ? 'bg-primary/20 text-primary'
//                             : 'bg-primary/10 text-primary'
//                         )}
//                       >
//                         <Check className="h-4 w-4" />
//                       </div>
//                       <span
//                         className={cn(
//                           'text-lg',
//                           isFeatured
//                             ? 'text-slate-300'
//                             : 'text-slate-600'
//                         )}
//                       >
//                         {feature}
//                       </span>
//                     </div>
//                   ))}
//                 </div>

//                 <Button
//                   onClick={() => navigate('/signup')}
//                   size="lg"
//                   className={cn(
//                     'w-full h-16 rounded-full font-bold text-lg transition-all',
//                     isFeatured
//                       ? 'bg-primary text-white hover:bg-white hover:text-primary'
//                       : 'bg-white text-primary hover:bg-primary hover:text-white border'
//                   )}
//                 >
//                   Choose {plan.planName} Plan
//                 </Button>
//               </motion.div>
//             );
//           })}
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default Pricing;
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
const PLAN_FEATURES = {
  free: [
    'Generate 5 Sub-Topics',
    'Access valid for 7 days',
    'Theory & Image Course',
    'Ai Teacher Chat',
  ],
  monthly: [
    'Generate 10 Sub-Topics',
    '1 Month Access',
    'Theory & Image Course',
    'Ai Teacher Chat',
  ],
  yearly: [
    'Generate Unlimited Sub-Topics',
    '1 Year Access',
    'Theory & Image Course',
    'Ai Teacher Chat',
  ],
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
        console.error('Pricing API error:', err);
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
      billingPeriod: 'lifetime',
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
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-3 gap-8">
          <Skeleton className="h-[520px] rounded-3xl" />
          <Skeleton className="h-[580px] rounded-3xl" />
          <Skeleton className="h-[520px] rounded-3xl" />
        </div>
      </section>
    );
  }

  /* ================= UI ================= */
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-primary font-bold uppercase tracking-widest text-sm">
            Pricing Plans
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4">
            Choose the Right Plan for <br className="hidden md:block" />
            Your Learning Goals
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-10 items-end"
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
                  'relative flex flex-col rounded-[40px] p-10 transition-all',
                  isFeatured
                    ? 'bg-slate-900 text-white shadow-2xl scale-105 z-10 py-16'
                    : 'bg-slate-50 border border-slate-100 hover:shadow-xl py-12'
                )}
              >
                {isFeatured && (
                  <div className="absolute -top-5 inset-x-0 flex justify-center">
                    <div className="bg-primary text-white text-xs font-bold uppercase tracking-widest px-6 py-2 rounded-full flex items-center gap-2 shadow-lg">
                      <Star className="h-3 w-3 fill-current" />
                      Most Popular
                    </div>
                  </div>
                )}

                <h3
                  className={cn(
                    'text-xl font-bold uppercase tracking-widest mb-4',
                    isFeatured ? 'text-primary' : 'text-slate-500'
                  )}
                >
                  {cleanName}
                </h3>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-bold">
                    {getCurrencySymbol(plan.currency)}
                    {Number(plan.price).toFixed(2)}
                  </span>
                  <span className="text-slate-400">/{plan.billingPeriod}</span>
                </div>

                <div className="space-y-4 flex-grow mb-10">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={cn(
                          'h-6 w-6 rounded-full flex items-center justify-center',
                          isFeatured
                            ? 'bg-primary/20 text-primary'
                            : 'bg-primary/10 text-primary'
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      <span
                        className={cn(
                          'text-lg',
                          isFeatured ? 'text-slate-300' : 'text-slate-600'
                        )}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => navigate('/signup')}
                  size="lg"
                  className={cn(
                    'w-full h-16 rounded-full font-bold text-lg transition-all',
                    isFeatured
                      ? 'bg-primary text-white hover:bg-white hover:text-primary'
                      : 'bg-white text-primary hover:bg-primary hover:text-white border'
                  )}
                >
                  Choose {cleanName}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
