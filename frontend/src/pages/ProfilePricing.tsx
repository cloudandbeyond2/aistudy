// // // // // import React, { useEffect, useRef, useState } from 'react';
// // // // // import { useNavigate } from 'react-router-dom';
// // // // // import axios from 'axios';
// // // // // import { Button } from '@/components/ui/button';
// // // // // import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// // // // // import { Check, Crown, Zap } from 'lucide-react';
// // // // // import { FreeCost, FreeType, MonthCost, MonthType, YearCost, YearType, serverURL } from '@/constants';

// // // // // // ===== Feature List (same order for all plans) =====
// // // // // const ALL_FEATURES = [
// // // // //   'Sub-Topic Limit',
// // // // //   'Access Duration',
// // // // //   'Theory & Image Course',
// // // // //   'AI Teacher Chat',
// // // // //   'Create Courses',
// // // // //   'Course in 23+ Languages',
// // // // //   'Video & Theory Course',
// // // // //   'Priority Support',
// // // // //   'Advanced Analytics',
// // // // // ];

// // // // // // ===== Feature Matrix (YES / NO / VALUE) =====
// // // // // const PLAN_FEATURES: Record<string, Record<string, boolean | string>> = {
// // // // //   free: {
// // // // //     'Sub-Topic Limit': '5 only',
// // // // //     'Access Duration': '7 days',
// // // // //     'Theory & Image Course': true,
// // // // //     'AI Teacher Chat': true,
// // // // //     'Create Courses': '1 course only',
// // // // //     'Course in 23+ Languages': false,
// // // // //     'Video & Theory Course': false,
// // // // //     'Priority Support': false,
// // // // //     'Advanced Analytics': false,
// // // // //   },

// // // // //   monthly: {
// // // // //     'Sub-Topic Limit': '10 per course',
// // // // //     'Access Duration': '1 month',
// // // // //     'Theory & Image Course': true,
// // // // //     'AI Teacher Chat': true,
// // // // //     'Create Courses': '20 courses',
// // // // //     'Course in 23+ Languages': true,
// // // // //     'Video & Theory Course': true,
// // // // //     'Priority Support': false,
// // // // //     'Advanced Analytics': false,
// // // // //   },

// // // // //   yearly: {
// // // // //     'Sub-Topic Limit': 'Unlimited',
// // // // //     'Access Duration': '1 year',
// // // // //     'Theory & Image Course': true,
// // // // //     'AI Teacher Chat': true,
// // // // //     'Create Courses': 'Unlimited',
// // // // //     'Course in 23+ Languages': true,
// // // // //     'Video & Theory Course': true,
// // // // //     'Priority Support': true,
// // // // //     'Advanced Analytics': true,
// // // // //   },
// // // // // };

// // // // // const ProfilePricing = () => {
// // // // //   const navigate = useNavigate();
// // // // //   const pricingRef = useRef<HTMLDivElement>(null);

// // // // //   const [plans, setPlans] = useState<any[]>([]);
// // // // //   const [isLoading, setIsLoading] = useState(true);

// // // // //   // ✅ Normalize active plan value
// // // // //   const activePlan = sessionStorage.getItem('type')?.toLowerCase() || 'free';

// // // // //   useEffect(() => {
// // // // //     fetchPricing();
// // // // //   }, []);

// // // // //   const handleSelectPlan = (plan: any) => {
// // // // //     if (activePlan === plan.id) return;

// // // // //     navigate(`/dashboard/payment/${plan.id}`, {
// // // // //       state: {
// // // // //         price: plan.price,
// // // // //         currency: plan.currency,
// // // // //         planType: plan.planType,
// // // // //         planName: plan.name,
// // // // //       },
// // // // //     });
// // // // //   };

// // // // //   const fetchPricing = async () => {
// // // // //     try {
// // // // //       setIsLoading(true);
// // // // //       const response = await axios.get(`${serverURL}/api/pricing`);

// // // // //       if (response.data?.success && response.data?.pricing) {
// // // // //         const pricingData = Array.isArray(response.data.pricing)
// // // // //           ? response.data.pricing
// // // // //           : Object.values(response.data.pricing);

// // // // //         const formattedPlans = pricingData.map((plan: any) => {
// // // // //           const planType = plan.planType || 'free';

// // // // //           return {
// // // // //             id: planType, // free | monthly | yearly
// // // // //             name: plan.planName || plan.name,
// // // // //             description: '',
// // // // //             price: plan.price || 0,
// // // // //             currency: plan.currency || 'INR',
// // // // //             features: PLAN_FEATURES[planType] || {},
// // // // //             featured: planType === 'yearly',
// // // // //             billing: planType === 'free' ? 'lifetime' : planType,
// // // // //             planType,
// // // // //           };
// // // // //         });

// // // // //         const order = { free: 0, monthly: 1, yearly: 2 } as any;
// // // // //         formattedPlans.sort((a: any, b: any) => order[a.planType] - order[b.planType]);

// // // // //         setPlans(formattedPlans);
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.error('Pricing fetch failed', error);

// // // // //       // 🔁 Fallback
// // // // //       setPlans([
// // // // //         {
// // // // //           id: 'free',
// // // // //           name: FreeType,
// // // // //           description: '',
// // // // //           price: FreeCost,
// // // // //           currency: 'INR',
// // // // //           features: PLAN_FEATURES.free,
// // // // //           featured: false,
// // // // //           billing: 'lifetime',
// // // // //           planType: 'free',
// // // // //         },
// // // // //         {
// // // // //           id: 'monthly',
// // // // //           name: MonthType,
// // // // //           description: '',
// // // // //           price: MonthCost,
// // // // //           currency: 'INR',
// // // // //           features: PLAN_FEATURES.monthly,
// // // // //           featured: false,
// // // // //           billing: 'monthly',
// // // // //           planType: 'monthly',
// // // // //         },
// // // // //         {
// // // // //           id: 'yearly',
// // // // //           name: YearType,
// // // // //           description: '',
// // // // //           price: YearCost,
// // // // //           currency: 'INR',
// // // // //           features: PLAN_FEATURES.yearly,
// // // // //           featured: true,
// // // // //           billing: 'yearly',
// // // // //           planType: 'yearly',
// // // // //         },
// // // // //       ]);
// // // // //     } finally {
// // // // //       setIsLoading(false);
// // // // //     }
// // // // //   };

// // // // //   const getCurrencySymbol = (currency: string) => {
// // // // //     const symbols: any = {
// // // // //       USD: '$',
// // // // //       EUR: '€',
// // // // //       GBP: '£',
// // // // //       INR: '₹',
// // // // //       JPY: '¥',
// // // // //     };
// // // // //     return symbols[currency] || '₹';
// // // // //   };

// // // // //   return (
// // // // //     <div ref={pricingRef} className="container max-w-6xl mx-auto py-8">
// // // // //       <div className="text-center mb-10">
// // // // //         <h1 className="text-3xl font-bold">Choose Your Plan</h1>
// // // // //         <p className="mt-3 text-muted-foreground">
// // // // //           Select the perfect plan to boost your course creation productivity
// // // // //         </p>
// // // // //       </div>

// // // // //       <div className="grid md:grid-cols-3 gap-6">
// // // // //         {plans.map((plan) => (
// // // // //           <Card
// // // // //             key={plan.id}
// // // // //             className={`relative transition-all duration-300 hover:shadow-lg ${
// // // // //               plan.featured ? 'border-primary shadow-primary/20' : 'border-border/50'
// // // // //             }`}
// // // // //           >
// // // // //             {plan.featured && (
// // // // //               <span className="absolute top-3 right-3 text-xs font-semibold bg-primary text-white px-3 py-1 rounded-full">
// // // // //                 MOST POPULAR
// // // // //               </span>
// // // // //             )}

// // // // //             <CardHeader>
// // // // //               <div className="flex items-center gap-2">
// // // // //                 {plan.planType === 'yearly' && <Crown className="h-5 w-5 text-primary" />}
// // // // //                 {plan.planType === 'monthly' && <Zap className="h-5 w-5 text-primary" />}
// // // // //                 <CardTitle>{plan.name}</CardTitle>
// // // // //               </div>
// // // // //               <CardDescription>{plan.description}</CardDescription>
// // // // //             </CardHeader>

// // // // //             <CardContent>
// // // // //               <div className="mb-6">
// // // // //                 <span className="text-4xl font-bold">
// // // // //                   {getCurrencySymbol(plan.currency)}{plan.price}
// // // // //                 </span>
// // // // //                 {plan.planType !== 'free' && (
// // // // //                   <span className="text-muted-foreground ml-2">
// // // // //                     /{plan.planType === 'monthly' ? 'month' : 'year'}
// // // // //                   </span>
// // // // //                 )}
// // // // //               </div>

// // // // //               <ul className="space-y-3">
// // // // //                 {ALL_FEATURES.map((feature, index) => {
// // // // //                   const value = plan.features[feature];
// // // // //                   const enabled = value === true || typeof value === 'string';

// // // // //                   return (
// // // // //                     <li key={index} className="flex gap-3 items-center">
// // // // //                       {enabled ? (
// // // // //                         <Check className="h-5 w-5 text-primary shrink-0" />
// // // // //                       ) : (
// // // // //                         <span className="h-5 w-5 rounded-full border border-muted-foreground/40 shrink-0" />
// // // // //                       )}
// // // // //                       <span className={enabled ? '' : 'text-muted-foreground line-through'}>
// // // // //                         {typeof value === 'string' ? `${feature}: ${value}` : feature}
// // // // //                       </span>
// // // // //                     </li>
// // // // //                   );
// // // // //                 })}
// // // // //               </ul>
// // // // //             </CardContent>

// // // // //             <CardFooter className="pt-4">
// // // // //               {activePlan === plan.id ? (
// // // // //                 <Button disabled className="w-full bg-muted text-muted-foreground cursor-not-allowed">
// // // // //                   Active Plan
// // // // //                 </Button>
// // // // //               ) : (
// // // // //                 <Button
// // // // //                   onClick={() => handleSelectPlan(plan)}
// // // // //                   className={`w-full ${plan.featured ? 'bg-primary hover:bg-primary/90' : ''}`}
// // // // //                   variant={plan.featured ? 'default' : 'outline'}
// // // // //                 >
// // // // //                   Choose {plan.planType}
// // // // //                 </Button>
// // // // //               )}
// // // // //             </CardFooter>
// // // // //           </Card>
// // // // //         ))}
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default ProfilePricing;
// // // // import React, { useEffect, useRef, useState } from 'react';
// // // // import { useNavigate } from 'react-router-dom';
// // // // import axios from 'axios';
// // // // import { Button } from '@/components/ui/button';
// // // // import {
// // // //   Card,
// // // //   CardContent,
// // // //   CardDescription,
// // // //   CardFooter,
// // // //   CardHeader,
// // // //   CardTitle,
// // // // } from '@/components/ui/card';
// // // // import { Check, Crown, Zap } from 'lucide-react';
// // // // import {
// // // //   FreeCost,
// // // //   FreeType,
// // // //   MonthCost,
// // // //   MonthType,
// // // //   YearCost,
// // // //   YearType,
// // // //   serverURL,
// // // // } from '@/constants';

// // // // /* -------------------------------- FEATURES -------------------------------- */

// // // // const ALL_FEATURES = [
// // // //   'Sub-Topic Limit',
// // // //   'Access Duration',
// // // //   'Theory & Image Course',
// // // //   'Create Courses',
// // // //   'AI Teacher Chat',
// // // //   'Course in 23+ Languages',
// // // //   'Video & Theory Course',
// // // //   'Priority Support',
// // // //   'Advanced Analytics',
// // // // ];

// // // // const PLAN_FEATURES: Record<string, Record<string, boolean | string>> = {
// // // //   free: {
// // // //     'Sub-Topic Limit': '5 only',
// // // //     'Access Duration': '7 days',
// // // //     'Theory & Image Course': true,
// // // //     'Create Courses': '1 course only',
// // // //     'AI Teacher Chat': true,
// // // //     'Course in 23+ Languages': false,
// // // //     'Video & Theory Course': false,
// // // //     'Priority Support': false,
// // // //     'Advanced Analytics': false,
// // // //   },

// // // //   monthly: {
// // // //     'Sub-Topic Limit': '10 per course',
// // // //     'Access Duration': '1 month',
// // // //     'Theory & Image Course': true,
// // // //     'AI Teacher Chat': true,
// // // //     'Create Courses': '20 courses only',
// // // //     'Course in 23+ Languages': true,
// // // //     'Video & Theory Course': true,
// // // //     'Priority Support': false,
// // // //     'Advanced Analytics': false,
// // // //   },

// // // //   yearly: {
// // // //     'Sub-Topic Limit': 'Unlimited',
// // // //     'Access Duration': '1 year',
// // // //     'Theory & Image Course': true,
// // // //     'AI Teacher Chat': true,
// // // //     'Create Courses': 'Unlimited',
// // // //     'Course in 23+ Languages': true,
// // // //     'Video & Theory Course': true,
// // // //     'Priority Support': true,
// // // //     'Advanced Analytics': true,
// // // //   },
// // // // };

// // // // /* ------------------------------- COMPONENT -------------------------------- */

// // // // const ProfilePricing = () => {
// // // //   const navigate = useNavigate();
// // // //   const pricingRef = useRef<HTMLDivElement>(null);

// // // //   const [plans, setPlans] = useState<any[]>([]);
// // // //   const [isLoading, setIsLoading] = useState(true);

// // // //   // free | monthly | yearly
// // // //   const activePlan = sessionStorage.getItem('type');

// // // //   useEffect(() => {
// // // //     fetchPricing();
// // // //   }, []);

// // // //   /* ----------------------------- FETCH PRICING ----------------------------- */

// // // //   const fetchPricing = async () => {
// // // //     try {
// // // //       setIsLoading(true);
// // // //       const response = await axios.get(`${serverURL}/api/pricing`);

// // // //       if (response.data?.success && response.data?.pricing) {
// // // //         const pricingData = Array.isArray(response.data.pricing)
// // // //           ? response.data.pricing
// // // //           : Object.values(response.data.pricing);

// // // //         const formattedPlans = pricingData.map((plan: any) => {
// // // //           const planType = plan.planType || 'free';

// // // //           return {
// // // //             id: planType,
// // // //             name: plan.planName || plan.name,
// // // //             description: '',
// // // //             price: plan.price || 0,
// // // //             currency: plan.currency || 'INR',
// // // //             features: PLAN_FEATURES[planType],
// // // //             featured: planType === 'yearly',
// // // //             billing: planType,
// // // //             planType,
// // // //           };
// // // //         });

// // // //         const order: any = { free: 0, monthly: 1, yearly: 2 };
// // // //         formattedPlans.sort((a: any, b: any) => order[a.planType] - order[b.planType]);

// // // //         setPlans(formattedPlans);
// // // //       }
// // // //     } catch (error) {
// // // //       setPlans([
// // // //         {
// // // //           id: 'free',
// // // //           name: FreeType,
// // // //           price: FreeCost,
// // // //           currency: 'INR',
// // // //           features: PLAN_FEATURES.free,
// // // //           planType: 'free',
// // // //         },
// // // //         {
// // // //           id: 'monthly',
// // // //           name: MonthType,
// // // //           price: MonthCost,
// // // //           currency: 'INR',
// // // //           features: PLAN_FEATURES.monthly,
// // // //           planType: 'monthly',
// // // //         },
// // // //         {
// // // //           id: 'yearly',
// // // //           name: YearType,
// // // //           price: YearCost,
// // // //           currency: 'INR',
// // // //           features: PLAN_FEATURES.yearly,
// // // //           featured: true,
// // // //           planType: 'yearly',
// // // //         },
// // // //       ]);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   /* ----------------------------- HELPERS ----------------------------- */

// // // //   const handleSelectPlan = (plan: any) => {
// // // //     if (activePlan === plan.id) return;

// // // //     navigate(`/dashboard/payment/${plan.id}`, {
// // // //       state: {
// // // //         price: plan.price,
// // // //         currency: plan.currency,
// // // //         planType: plan.planType,
// // // //         planName: plan.name,
// // // //       },
// // // //     });
// // // //   };

// // // //   const getCurrencySymbol = (currency: string) => {
// // // //     const symbols: any = { INR: '₹', USD: '$', EUR: '€' };
// // // //     return symbols[currency] || '₹';
// // // //   };

// // // //   /* -------------------------------- UI -------------------------------- */

// // // //   return (
// // // //     <div ref={pricingRef} className="container max-w-6xl mx-auto py-8">
// // // //       <div className="text-center mb-10">
// // // //         <h1 className="text-3xl font-bold">Choose Your Plan</h1>
// // // //         <p className="mt-3 text-muted-foreground">
// // // //           Select the perfect plan to boost your course creation productivity
// // // //         </p>
// // // //       </div>

// // // //       <div className="grid md:grid-cols-3 gap-6">
// // // //         {plans.map((plan) => {
// // // //           const isActive = activePlan === plan.id;
// // // //           const isFreeDisabled = plan.planType === 'free' && activePlan !== 'free' && activePlan;

// // // //           return (
// // // //             <Card
// // // //               key={plan.id}
// // // //               className={`relative ${
// // // //                 plan.featured ? 'border-primary shadow-primary/20' : ''
// // // //               }`}
// // // //             >
// // // //               {plan.featured && (
// // // //                 <span className="absolute top-3 right-3 text-xs font-semibold bg-primary text-white px-3 py-1 rounded-full">
// // // //                   MOST POPULAR
// // // //                 </span>
// // // //               )}

// // // //               <CardHeader>
// // // //                 <div className="flex items-center gap-2">
// // // //                   {plan.planType === 'yearly' && <Crown className="h-5 w-5 text-primary" />}
// // // //                   {plan.planType === 'monthly' && <Zap className="h-5 w-5 text-primary" />}
// // // //                   <CardTitle>{plan.name}</CardTitle>
// // // //                 </div>
// // // //                 <CardDescription />
// // // //               </CardHeader>

// // // //               <CardContent>
// // // //                 <div className="mb-6">
// // // //                   <span className="text-4xl font-bold">
// // // //                     {getCurrencySymbol(plan.currency)}
// // // //                     {plan.price}
// // // //                   </span>
// // // //                   {plan.planType !== 'free' && (
// // // //                     <span className="text-muted-foreground ml-2">
// // // //                       /{plan.planType === 'monthly' ? 'month' : 'year'}
// // // //                     </span>
// // // //                   )}
// // // //                 </div>

// // // //                 <ul className="space-y-3">
// // // //                   {ALL_FEATURES.map((feature, i) => {
// // // //                     const value = plan.features[feature];
// // // //                     const enabled = value === true || typeof value === 'string';

// // // //                     return (
// // // //                       <li key={i} className="flex gap-3 items-center">
// // // //                         {enabled ? (
// // // //                           <Check className="h-5 w-5 text-primary" />
// // // //                         ) : (
// // // //                           <span className="h-5 w-5 rounded-full border" />
// // // //                         )}
// // // //                         <span className={enabled ? '' : 'line-through text-muted-foreground'}>
// // // //                           {typeof value === 'string'
// // // //                             ? `${feature}: ${value}`
// // // //                             : feature}
// // // //                         </span>
// // // //                       </li>
// // // //                     );
// // // //                   })}
// // // //                 </ul>
// // // //               </CardContent>

// // // //               <CardFooter>
// // // //                 {isActive && (
// // // //                   <Button disabled className="w-full">
// // // //                     Active Plan
// // // //                   </Button>
// // // //                 )}

// // // //                 {isFreeDisabled && (
// // // //                   <Button disabled className="w-full">
// // // //                     Not Available
// // // //                   </Button>
// // // //                 )}

// // // //                 {!isActive && !isFreeDisabled && (
// // // //                   <Button
// // // //                     onClick={() => handleSelectPlan(plan)}
// // // //                     className="w-full"
// // // //                     variant={plan.featured ? 'default' : 'outline'}
// // // //                   >
// // // //                     Choose {plan.planType}
// // // //                   </Button>
// // // //                 )}
// // // //               </CardFooter>
// // // //             </Card>
// // // //           );
// // // //         })}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default ProfilePricing;
// // // import React, { useEffect, useRef, useState } from 'react';
// // // import { useLocation, useNavigate } from 'react-router-dom';
// // // import axios from 'axios';
// // // import { Button } from '@/components/ui/button';
// // // import {
// // //   Card,
// // //   CardContent,
// // //   CardDescription,
// // //   CardFooter,
// // //   CardHeader,
// // //   CardTitle,
// // // } from '@/components/ui/card';
// // // import { Check, Crown, Zap } from 'lucide-react';
// // // import {
// // //   FreeCost,
// // //   FreeType,
// // //   MonthCost,
// // //   MonthType,
// // //   YearCost,
// // //   YearType,
// // //   serverURL,
// // // } from '@/constants';

// // // /* -------------------- FEATURE ORDER -------------------- */

// // // const ALL_FEATURES = [
// // //   'Sub-Topic Limit',
// // //   'Access Duration',
// // //   'Theory & Image Course',
// // //   'Create Courses',
// // //   'AI Teacher Chat',
// // //   'Course in 23+ Languages',
// // //   'Video & Theory Course',
// // //   'Priority Support',
// // //   'Advanced Analytics',
// // // ];

// // // /* -------------------- PLAN FEATURES -------------------- */

// // // const PLAN_FEATURES: Record<string, Record<string, boolean | string>> = {
// // //   free: {
// // //     'Sub-Topic Limit': '5 only',
// // //     'Access Duration': '7 days',
// // //     'Theory & Image Course': true,
// // //     'Create Courses': '1 course only',
// // //     'AI Teacher Chat': true,
// // //     'Course in 23+ Languages': false,
// // //     'Video & Theory Course': false,
// // //     'Priority Support': false,
// // //     'Advanced Analytics': false,
// // //   },

// // //   monthly: {
// // //     'Sub-Topic Limit': '10 per course',
// // //     'Access Duration': '1 month',
// // //     'Theory & Image Course': true,
// // //     'Create Courses': '20 courses only',
// // //     'AI Teacher Chat': true,
// // //     'Course in 23+ Languages': true,
// // //     'Video & Theory Course': true,
// // //     'Priority Support': false,
// // //     'Advanced Analytics': false,
// // //   },

// // //   yearly: {
// // //     'Sub-Topic Limit': 'Unlimited',
// // //     'Access Duration': '1 year',
// // //     'Theory & Image Course': true,
// // //     'Create Courses': 'Unlimited',
// // //     'AI Teacher Chat': true,
// // //     'Course in 23+ Languages': true,
// // //     'Video & Theory Course': true,
// // //     'Priority Support': true,
// // //     'Advanced Analytics': true,
// // //   },
// // // };

// // // /* -------------------- PLAN ORDER (IMPORTANT) -------------------- */

// // // const PLAN_ORDER: Record<string, number> = {
// // //   free: 0,
// // //   monthly: 1,
// // //   yearly: 2,
// // // };

// // // /* -------------------- COMPONENT -------------------- */

// // // const ProfilePricing = () => {
// // //   const navigate = useNavigate();
// // //   const pricingRef = useRef<HTMLDivElement>(null);

// // //   const [plans, setPlans] = useState<any[]>([]);
// // //   const [isLoading, setIsLoading] = useState(true);
// // // const location = useLocation();
// // //   // free | monthly | yearly
// // //   //const activePlan = sessionStorage.getItem('type') || 'free';
// // //   const [activePlan, setActivePlan] = useState(
// // //   sessionStorage.getItem('type') || 'free'
// // // );

// // //   useEffect(() => {
// // //     fetchPricing();
// // //     const storedPlan = sessionStorage.getItem('type') || 'free';
// // //   setActivePlan(storedPlan);
// // //   }, [location.pathname]);
// // //   useEffect(() => {
// // //   const updatePlan = () => {
// // //     setActivePlan(sessionStorage.getItem("type") || "free");
// // //   };

// // //   window.addEventListener("storage", updatePlan);

// // //   return () => {
// // //     window.removeEventListener("storage", updatePlan);
// // //   };
// // // }, []);

// // //   /* -------------------- FETCH PRICING -------------------- */

// // //   const fetchPricing = async () => {
// // //     try {
// // //       setIsLoading(true);
// // //       const response = await axios.get(`${serverURL}/api/pricing`);

// // //       if (response.data?.success && response.data?.pricing) {
// // //         const pricingData = Array.isArray(response.data.pricing)
// // //           ? response.data.pricing
// // //           : Object.values(response.data.pricing);

// // //         const formattedPlans = pricingData.map((plan: any) => {
// // //           const planType = plan.planType || 'free';

// // //           return {
// // //             id: planType,
// // //             name: plan.planName || plan.name,
// // //             price: plan.price || 0,
// // //             currency: plan.currency || 'INR',
// // //             features: PLAN_FEATURES[planType],
// // //             featured: planType === 'yearly',
// // //             planType,
// // //           };
// // //         });

// // //         const order: any = { free: 0, monthly: 1, yearly: 2 };
// // //         formattedPlans.sort((a: any, b: any) => order[a.planType] - order[b.planType]);

// // //         setPlans(formattedPlans);
// // //       }
// // //     } catch (error) {
// // //       setPlans([
// // //         {
// // //           id: 'free',
// // //           name: FreeType,
// // //           price: FreeCost,
// // //           currency: 'INR',
// // //           features: PLAN_FEATURES.free,
// // //           planType: 'free',
// // //         },
// // //         {
// // //           id: 'monthly',
// // //           name: MonthType,
// // //           price: MonthCost,
// // //           currency: 'INR',
// // //           features: PLAN_FEATURES.monthly,
// // //           planType: 'monthly',
// // //         },
// // //         {
// // //           id: 'yearly',
// // //           name: YearType,
// // //           price: YearCost,
// // //           currency: 'INR',
// // //           features: PLAN_FEATURES.yearly,
// // //           featured: true,
// // //           planType: 'yearly',
// // //         },
// // //       ]);
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   /* -------------------- HELPERS -------------------- */

// // //   const handleSelectPlan = (plan: any) => {
// // //     if (activePlan === plan.id) return;

// // //     navigate(`/dashboard/payment/${plan.id}`, {
// // //       state: {
// // //         price: plan.price,
// // //         currency: plan.currency,
// // //         planType: plan.planType,
// // //         planName: plan.name,
// // //       },
// // //     });
// // //   };

// // //   const getCurrencySymbol = (currency: string) => {
// // //     const symbols: any = { INR: '₹', USD: '$', EUR: '€' };
// // //     return symbols[currency] || '₹';
// // //   };

// // //   /* -------------------- UI -------------------- */

// // //   return (
// // //     <div ref={pricingRef} className="container max-w-6xl mx-auto py-8">
// // //       <div className="text-center mb-10">
// // //         <h1 className="text-3xl font-bold">Choose Your Plan</h1>
// // //         <p className="mt-3 text-muted-foreground">
// // //           Select the perfect plan to boost your course creation productivity
// // //         </p>
// // //       </div>

// // //       <div className="grid md:grid-cols-3 gap-6">
// // //         {plans.map((plan) => {
// // //           const isActive = activePlan === plan.id;

// // //           // 🔒 BLOCK DOWNGRADES
// // //           const isNotAvailable =
// // //             activePlan &&
// // //             PLAN_ORDER[plan.planType] < PLAN_ORDER[activePlan];

// // //           return (
// // //             <Card
// // //               key={plan.id}
// // //               className={`relative ${
// // //                 plan.featured ? 'border-primary shadow-primary/20' : ''
// // //               }`}
// // //             >
// // //               {plan.featured && (
// // //                 <span className="absolute top-3 right-3 text-xs font-semibold bg-primary text-white px-3 py-1 rounded-full">
// // //                   MOST POPULAR
// // //                 </span>
// // //               )}

// // //               <CardHeader>
// // //                 <div className="flex items-center gap-2">
// // //                   {plan.planType === 'yearly' && <Crown className="h-5 w-5 text-primary" />}
// // //                   {plan.planType === 'monthly' && <Zap className="h-5 w-5 text-primary" />}
// // //                   <CardTitle>{plan.name}</CardTitle>
// // //                 </div>
// // //                 <CardDescription />
// // //               </CardHeader>

// // //               <CardContent>
// // //                 <div className="mb-6">
// // //                   <span className="text-4xl font-bold">
// // //                     {getCurrencySymbol(plan.currency)}
// // //                     {plan.price}
// // //                   </span>
// // //                   {plan.planType !== 'free' && (
// // //                     <span className="text-muted-foreground ml-2">
// // //                       /{plan.planType === 'monthly' ? 'month' : 'year'}
// // //                     </span>
// // //                   )}
// // //                 </div>

// // //                 <ul className="space-y-3">
// // //                   {ALL_FEATURES.map((feature, i) => {
// // //                     const value = plan.features[feature];
// // //                     const enabled = value === true || typeof value === 'string';

// // //                     return (
// // //                       <li key={i} className="flex gap-3 items-center">
// // //                         {enabled ? (
// // //                           <Check className="h-5 w-5 text-primary" />
// // //                         ) : (
// // //                           <span className="h-5 w-5 rounded-full border" />
// // //                         )}
// // //                         <span className={enabled ? '' : 'line-through text-muted-foreground'}>
// // //                           {typeof value === 'string'
// // //                             ? `${feature}: ${value}`
// // //                             : feature}
// // //                         </span>
// // //                       </li>
// // //                     );
// // //                   })}
// // //                 </ul>
// // //               </CardContent>

// // //               <CardFooter>
// // //                 {isActive && (
// // //                   <Button disabled className="w-full">
// // //                     Active Plan
// // //                   </Button>
// // //                 )}

// // //                 {!isActive && isNotAvailable && (
// // //                   <Button disabled className="w-full">
// // //                     Not Available
// // //                   </Button>
// // //                 )}

// // //                 {!isActive && !isNotAvailable && (
// // //                   <Button
// // //                     onClick={() => handleSelectPlan(plan)}
// // //                     className="w-full"
// // //                     variant={plan.featured ? 'default' : 'outline'}
// // //                   >
// // //                     Choose {plan.planType}
// // //                   </Button>
// // //                 )}
// // //               </CardFooter>
// // //             </Card>
// // //           );
// // //         })}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default ProfilePricing;


// // import React, { useEffect, useRef, useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import axios from 'axios';
// // import { Button } from '@/components/ui/button';
// // import {
// //   Card,
// //   CardContent,
// //   CardFooter,
// //   CardHeader,
// //   CardTitle,
// // } from '@/components/ui/card';
// // import { Check, Crown, Zap } from 'lucide-react';
// // import {
// //   FreeCost,
// //   FreeType,
// //   MonthCost,
// //   MonthType,
// //   YearCost,
// //   YearType,
// //   serverURL,
// // } from '@/constants';

// // /* -------------------- FEATURE ORDER -------------------- */

// // const ALL_FEATURES = [
// //   'Sub-Topic Limit',
// //   'Access Duration',
// //   'Theory & Image Course',
// //   'Create Courses',
// //   'AI Teacher Chat',
// //   'Course in 23+ Languages',
// //   'Video & Theory Course',
// //   'Priority Support',
// //   'Advanced Analytics',
// // ];

// // /* -------------------- PLAN FEATURES -------------------- */

// // const PLAN_FEATURES: Record<string, Record<string, boolean | string>> = {
// //   free: {
// //     'Sub-Topic Limit': '5 only',
// //     'Access Duration': '7 days',
// //     'Theory & Image Course': true,
// //     'Create Courses': '1 course only',
// //     'AI Teacher Chat': true,
// //     'Course in 23+ Languages': false,
// //     'Video & Theory Course': false,
// //     'Priority Support': false,
// //     'Advanced Analytics': false,
// //   },
// //   monthly: {
// //     'Sub-Topic Limit': '10 per course',
// //     'Access Duration': '1 month',
// //     'Theory & Image Course': true,
// //     'Create Courses': '20 courses only',
// //     'AI Teacher Chat': true,
// //     'Course in 23+ Languages': true,
// //     'Video & Theory Course': true,
// //     'Priority Support': false,
// //     'Advanced Analytics': false,
// //   },
// //   yearly: {
// //     'Sub-Topic Limit': 'Unlimited',
// //     'Access Duration': '1 year',
// //     'Theory & Image Course': true,
// //     'Create Courses': 'Unlimited',
// //     'AI Teacher Chat': true,
// //     'Course in 23+ Languages': true,
// //     'Video & Theory Course': true,
// //     'Priority Support': true,
// //     'Advanced Analytics': true,
// //   },
// // };

// // /* -------------------- PLAN ORDER -------------------- */

// // const PLAN_ORDER: Record<string, number> = {
// //   free: 0,
// //   monthly: 1,
// //   yearly: 2,
// // };

// // /* -------------------- COMPONENT -------------------- */

// // const ProfilePricing = () => {
// //   const navigate = useNavigate();
// //   const pricingRef = useRef<HTMLDivElement>(null);

// //   const [plans, setPlans] = useState<any[]>([]);
// //   const [isLoading, setIsLoading] = useState(true);

// //   // 🔥 Reactive Active Plan
// //   const [activePlan, setActivePlan] = useState(
// //     sessionStorage.getItem('type') || 'free'
// //   );

// //   /* -------------------- LISTEN FOR PLAN CHANGE -------------------- */

// //   useEffect(() => {
// //     const handlePlanChange = () => {
// //       setActivePlan(sessionStorage.getItem('type') || 'free');
// //     };

// //     window.addEventListener('storage', handlePlanChange);

// //     return () => {
// //       window.removeEventListener('storage', handlePlanChange);
// //     };
// //   }, []);

// //   /* -------------------- FETCH PRICING -------------------- */

// //   useEffect(() => {
// //     fetchPricing();
// //   }, []);

// //   const fetchPricing = async () => {
// //     try {
// //       setIsLoading(true);
// //       const response = await axios.get(`${serverURL}/api/pricing`);

// //       if (response.data?.success && response.data?.pricing) {
// //         const pricingData = Array.isArray(response.data.pricing)
// //           ? response.data.pricing
// //           : Object.values(response.data.pricing);

// //         const formattedPlans = pricingData.map((plan: any) => {
// //           const planType = plan.planType || 'free';

// //           return {
// //             id: planType,
// //             name: plan.planName || plan.name,
// //             price: plan.price || 0,
// //             currency: plan.currency || 'INR',
// //             features: PLAN_FEATURES[planType],
// //             featured: planType === 'yearly',
// //             planType,
// //           };
// //         });

// //         formattedPlans.sort(
// //           (a: any, b: any) =>
// //             PLAN_ORDER[a.planType] - PLAN_ORDER[b.planType]
// //         );

// //         setPlans(formattedPlans);
// //       }
// //     } catch (error) {
// //       setPlans([
// //         {
// //           id: 'free',
// //           name: FreeType,
// //           price: FreeCost,
// //           currency: 'INR',
// //           features: PLAN_FEATURES.free,
// //           planType: 'free',
// //         },
// //         {
// //           id: 'monthly',
// //           name: MonthType,
// //           price: MonthCost,
// //           currency: 'INR',
// //           features: PLAN_FEATURES.monthly,
// //           planType: 'monthly',
// //         },
// //         {
// //           id: 'yearly',
// //           name: YearType,
// //           price: YearCost,
// //           currency: 'INR',
// //           features: PLAN_FEATURES.yearly,
// //           featured: true,
// //           planType: 'yearly',
// //         },
// //       ]);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   /* -------------------- SELECT PLAN -------------------- */

// //   const handleSelectPlan = (plan: any) => {
// //     if (activePlan === plan.id) return;

// //     navigate(`/dashboard/payment/${plan.id}`, {
// //       state: {
// //         price: plan.price,
// //         currency: plan.currency,
// //         planType: plan.planType,
// //         planName: plan.name,
// //       },
// //     });
// //   };

// //   const getCurrencySymbol = (currency: string) => {
// //     const symbols: any = { INR: '₹', USD: '$', EUR: '€' };
// //     return symbols[currency] || '₹';
// //   };

// //   /* -------------------- UI -------------------- */

// //   return (
// //     <div ref={pricingRef} className="container max-w-6xl mx-auto py-8">
// //       <div className="text-center mb-10">
// //         <h1 className="text-3xl font-bold">Choose Your Plan</h1>
// //         <p className="mt-3 text-muted-foreground">
// //           Select the perfect plan to boost your course creation productivity
// //         </p>
// //       </div>

// //       <div className="grid md:grid-cols-3 gap-6">
// //         {plans.map((plan) => {
// //           const isActive = activePlan === plan.id;
// //           const isNotAvailable =
// //             PLAN_ORDER[plan.planType] < PLAN_ORDER[activePlan];

// //           return (
// //             <Card
// //               key={plan.id}
// //               className={`relative ${
// //                 plan.featured ? 'border-primary shadow-primary/20' : ''
// //               }`}
// //             >
// //               {plan.featured && (
// //                 <span className="absolute top-3 right-3 text-xs font-semibold bg-primary text-white px-3 py-1 rounded-full">
// //                   MOST POPULAR
// //                 </span>
// //               )}

// //               <CardHeader>
// //                 <div className="flex items-center gap-2">
// //                   {plan.planType === 'yearly' && (
// //                     <Crown className="h-5 w-5 text-primary" />
// //                   )}
// //                   {plan.planType === 'monthly' && (
// //                     <Zap className="h-5 w-5 text-primary" />
// //                   )}
// //                   <CardTitle>{plan.name}</CardTitle>
// //                 </div>
// //               </CardHeader>

// //               <CardContent>
// //                 <div className="mb-6">
// //                   <span className="text-4xl font-bold">
// //                     {getCurrencySymbol(plan.currency)}
// //                     {plan.price}
// //                   </span>
// //                   {plan.planType !== 'free' && (
// //                     <span className="text-muted-foreground ml-2">
// //                       /{plan.planType === 'monthly' ? 'month' : 'year'}
// //                     </span>
// //                   )}
// //                 </div>

// //                 <ul className="space-y-3">
// //                   {ALL_FEATURES.map((feature, i) => {
// //                     const value = plan.features[feature];
// //                     const enabled =
// //                       value === true || typeof value === 'string';

// //                     return (
// //                       <li key={i} className="flex gap-3 items-center">
// //                         {enabled ? (
// //                           <Check className="h-5 w-5 text-primary" />
// //                         ) : (
// //                           <span className="h-5 w-5 rounded-full border" />
// //                         )}
// //                         <span
// //                           className={
// //                             enabled
// //                               ? ''
// //                               : 'line-through text-muted-foreground'
// //                           }
// //                         >
// //                           {typeof value === 'string'
// //                             ? `${feature}: ${value}`
// //                             : feature}
// //                         </span>
// //                       </li>
// //                     );
// //                   })}
// //                 </ul>
// //               </CardContent>

// //               <CardFooter>
// //                 {isActive && (
// //                   <Button disabled className="w-full">
// //                     Active Plan
// //                   </Button>
// //                 )}

// //                 {!isActive && isNotAvailable && (
// //                   <Button disabled className="w-full">
// //                     Not Available
// //                   </Button>
// //                 )}

// //                 {!isActive && !isNotAvailable && (
// //                   <Button
// //                     onClick={() => handleSelectPlan(plan)}
// //                     className="w-full"
// //                     variant={plan.featured ? 'default' : 'outline'}
// //                   >
// //                     Choose {plan.planType}
// //                   </Button>
// //                 )}
// //               </CardFooter>
// //             </Card>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // };

// // export default ProfilePricing;
// import React, { useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Check, Crown, Zap } from 'lucide-react';
// import {
//   FreeCost,
//   FreeType,
//   MonthCost,
//   MonthType,
//   YearCost,
//   YearType,
//   serverURL,
// } from '@/constants';

// /* -------------------- FEATURE ORDER -------------------- */

// const ALL_FEATURES = [
//   'Sub-Topic Limit',
//   'Access Duration',
//   'Theory & Image Course',
//   'Create Courses',
//   'AI Teacher Chat',
//   'Course in 23+ Languages',
//   'Video & Theory Course',
//   'Priority Support',
//   'Advanced Analytics',
// ];

// /* -------------------- PLAN FEATURES -------------------- */

// const PLAN_FEATURES: Record<string, Record<string, boolean | string>> = {
//   free: {
//     'Sub-Topic Limit': '5 only',
//     'Access Duration': '7 days',
//     'Theory & Image Course': true,
//     'Create Courses': '1 course only',
//     'AI Teacher Chat': true,
//     'Course in 23+ Languages': false,
//     'Video & Theory Course': false,
//     'Priority Support': false,
//     'Advanced Analytics': false,
//   },
//   monthly: {
//     'Sub-Topic Limit': '10 per course',
//     'Access Duration': '1 month',
//     'Theory & Image Course': true,
//     'Create Courses': '20 courses only',
//     'AI Teacher Chat': true,
//     'Course in 23+ Languages': true,
//     'Video & Theory Course': true,
//     'Priority Support': false,
//     'Advanced Analytics': false,
//   },
//   yearly: {
//     'Sub-Topic Limit': 'Unlimited',
//     'Access Duration': '1 year',
//     'Theory & Image Course': true,
//     'Create Courses': 'Unlimited',
//     'AI Teacher Chat': true,
//     'Course in 23+ Languages': true,
//     'Video & Theory Course': true,
//     'Priority Support': true,
//     'Advanced Analytics': true,
//   },
// };

// /* -------------------- PLAN ORDER -------------------- */

// const PLAN_ORDER: Record<string, number> = {
//   free: 0,
//   monthly: 1,
//   yearly: 2,
// };

// /* -------------------- COMPONENT -------------------- */

// const ProfilePricing = () => {
//   const navigate = useNavigate();
//   const pricingRef = useRef<HTMLDivElement>(null);

//   const [plans, setPlans] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentUserPlan, setCurrentUserPlan] = useState<string>('free'); // Default to free

//   /* -------------------- FETCH PRICING & USER PLAN -------------------- */

//   useEffect(() => {
//     fetchPricing();
//     fetchUserCurrentPlan(); // Fetch user's current plan from API
//   }, []);

//   // Fetch user's current subscription plan from backend
//   const fetchUserCurrentPlan = async () => {
//     try {
//       const token = localStorage.getItem('token'); // or wherever you store your auth token
//       if (!token) {
//         setCurrentUserPlan('free');
//         return;
//       }

//       const response = await axios.get(`${serverURL}/api/user/subscription`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       if (response.data?.success && response.data?.plan) {
//         const userPlan = response.data.plan;
//         setCurrentUserPlan(userPlan);
//         // Also update sessionStorage as a backup
//         sessionStorage.setItem('type', userPlan);
//       } else {
//         // Fallback to sessionStorage
//         const storedPlan = sessionStorage.getItem('type') || 'free';
//         setCurrentUserPlan(storedPlan);
//       }
//     } catch (error) {
//       console.error('Error fetching user plan:', error);
//       // Fallback to sessionStorage
//       const storedPlan = sessionStorage.getItem('type') || 'free';
//       setCurrentUserPlan(storedPlan);
//     }
//   };

//   const fetchPricing = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get(`${serverURL}/api/pricing`);

//       if (response.data?.success && response.data?.pricing) {
//         const pricingData = Array.isArray(response.data.pricing)
//           ? response.data.pricing
//           : Object.values(response.data.pricing);

//         const formattedPlans = pricingData.map((plan: any) => {
//           const planType = plan.planType || 'free';

//           return {
//             id: planType,
//             name: plan.planName || plan.name,
//             price: plan.price || 0,
//             currency: plan.currency || 'INR',
//             features: PLAN_FEATURES[planType],
//             featured: planType === 'yearly',
//             planType,
//           };
//         });

//         formattedPlans.sort(
//           (a: any, b: any) =>
//             PLAN_ORDER[a.planType] - PLAN_ORDER[b.planType]
//         );

//         setPlans(formattedPlans);
//       }
//     } catch (error) {
//       // Fallback to constants if API fails
//       setPlans([
//         {
//           id: 'free',
//           name: FreeType,
//           price: FreeCost,
//           currency: 'INR',
//           features: PLAN_FEATURES.free,
//           planType: 'free',
//         },
//         {
//           id: 'monthly',
//           name: MonthType,
//           price: MonthCost,
//           currency: 'INR',
//           features: PLAN_FEATURES.monthly,
//           planType: 'monthly',
//         },
//         {
//           id: 'yearly',
//           name: YearType,
//           price: YearCost,
//           currency: 'INR',
//           features: PLAN_FEATURES.yearly,
//           featured: true,
//           planType: 'yearly',
//         },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };


//   /* -------------------- HELPERS -------------------- */

//   const handleSelectPlan = (plan: any) => {
//     if (currentUserPlan === plan.id) return;

//     navigate(`/dashboard/payment/${plan.id}`, {
//       state: {
//         price: plan.price,
//         currency: plan.currency,
//         planType: plan.planType,
//         planName: plan.name,
//       },
//     });
//   };

//   const getCurrencySymbol = (currency: string) => {
//     const symbols: any = { INR: '₹', USD: '$', EUR: '€' };
//     return symbols[currency] || '₹';
//   };

//   /* -------------------- UI -------------------- */

//   if (isLoading) {
//     return (
//       <div className="container max-w-6xl mx-auto py-8">
//         <div className="text-center">Loading plans...</div>
//       </div>
//     );
//   }

//   return (
//     <div ref={pricingRef} className="container max-w-6xl mx-auto py-8">
//       <div className="text-center mb-10">
//         <h1 className="text-3xl font-bold">Choose Your Plan</h1>
//         <p className="mt-3 text-muted-foreground">
//           Select the perfect plan to boost your course creation productivity
//         </p>
//       </div>

//       <div className="grid md:grid-cols-3 gap-6">
//         {plans.map((plan) => {
//           const isActive = currentUserPlan === plan.id; // Use state instead of sessionStorage

//           const isNotAvailable =
//             PLAN_ORDER[plan.planType] < PLAN_ORDER[currentUserPlan];

//           return (
//             <Card
//               key={plan.id}
//               className={`relative ${
//                 plan.featured ? 'border-primary shadow-primary/20' : ''
//               }`}
//             >
//               {plan.featured && (
//                 <span className="absolute top-3 right-3 text-xs font-semibold bg-primary text-white px-3 py-1 rounded-full">
//                   MOST POPULAR
//                 </span>
//               )}

//               <CardHeader>
//                 <div className="flex items-center gap-2">
//                   {plan.planType === 'yearly' && (
//                     <Crown className="h-5 w-5 text-primary" />
//                   )}
//                   {plan.planType === 'monthly' && (
//                     <Zap className="h-5 w-5 text-primary" />
//                   )}
//                   <CardTitle>{plan.name}</CardTitle>
//                 </div>
//               </CardHeader>

//               <CardContent>
//                 <div className="mb-6">
//                   <span className="text-4xl font-bold">
//                     {getCurrencySymbol(plan.currency)}
//                     {plan.price}
//                   </span>
//                   {plan.planType !== 'free' && (
//                     <span className="text-muted-foreground ml-2">
//                       /{plan.planType === 'monthly' ? 'month' : 'year'}
//                     </span>
//                   )}
//                 </div>

//                 <ul className="space-y-3">
//                   {ALL_FEATURES.map((feature, i) => {
//                     const value = plan.features[feature];
//                     const enabled =
//                       value === true || typeof value === 'string';

//                     return (
//                       <li key={i} className="flex gap-3 items-center">
//                         {enabled ? (
//                           <Check className="h-5 w-5 text-primary" />
//                         ) : (
//                           <span className="h-5 w-5 rounded-full border" />
//                         )}
//                         <span
//                           className={
//                             enabled
//                               ? ''
//                               : 'line-through text-muted-foreground'
//                           }
//                         >
//                           {typeof value === 'string'
//                             ? `${feature}: ${value}`
//                             : feature}
//                         </span>
//                       </li>
//                     );
//                   })}
//                 </ul>
//               </CardContent>

//               <CardFooter>
//                 {isActive && (
//                   <Button disabled className="w-full">
//                     Active Plan
//                   </Button>
//                 )}

//                 {!isActive && isNotAvailable && (
//                   <Button disabled className="w-full">
//                     Not Available
//                   </Button>
//                 )}

//                 {!isActive && !isNotAvailable && (
//                   <Button
//                     onClick={() => handleSelectPlan(plan)}
//                     className="w-full"
//                     variant={plan.featured ? 'default' : 'outline'}
//                   >
//                     Choose {plan.planType}
//                   </Button>
//                 )}
//               </CardFooter>
//             </Card>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default ProfilePricing;

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
import { Check, Crown, Zap } from 'lucide-react';
import {
  FreeCost,
  FreeType,
  MonthCost,
  MonthType,
  YearCost,
  YearType,
  serverURL,
} from '@/constants';

/* -------------------- FEATURE ORDER -------------------- */

const ALL_FEATURES = [
  'Sub-Topic Limit',
  'Access Duration',
  'Theory & Image Course',
  'Create Courses',
  'AI Teacher Chat',
  'Course in 23+ Languages',
  'Video & Theory Course',
  'Resume Builder',
  'Priority Support',
  'Advanced Analytics',
];

/* -------------------- PLAN FEATURES -------------------- */

const PLAN_FEATURES: Record<string, Record<string, boolean | string>> = {
  free: {
    'Sub-Topic Limit': '5 only',
    'Access Duration': '7 days',
    'Theory & Image Course': true,
    'Create Courses': '1 course only',
    'AI Teacher Chat': true,
    'Course in 23+ Languages': false,
    'Video & Theory Course': false,
    'Resume Builder': false,
    'Priority Support': false,
    'Advanced Analytics': false,
  },
  monthly: {
    'Sub-Topic Limit': '10 per course',
    'Access Duration': '1 month',
    'Theory & Image Course': true,
    'Create Courses': '20 courses only',
    'AI Teacher Chat': true,
    'Course in 23+ Languages': true,
    'Video & Theory Course': true,
    'Resume Builder': true,
    'Priority Support': false,
    'Advanced Analytics': false,
  },
  yearly: {
    'Sub-Topic Limit': 'Unlimited',
    'Access Duration': '1 year',
    'Theory & Image Course': true,
    'Create Courses': 'Unlimited',
    'AI Teacher Chat': true,
    'Course in 23+ Languages': true,
    'Video & Theory Course': true,
    'Resume Builder': true,
    'Priority Support': true,
    'Advanced Analytics': true,
  },
};

/* -------------------- PLAN ORDER -------------------- */

const PLAN_ORDER: Record<string, number> = {
  free: 0,
  monthly: 1,
  yearly: 2,
};

/* -------------------- COMPONENT -------------------- */

const ProfilePricing = () => {
  const navigate = useNavigate();
  const pricingRef = useRef<HTMLDivElement>(null);

  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserPlan, setCurrentUserPlan] = useState<string>('free');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  /* -------------------- FETCH USER PLAN & PRICING -------------------- */

  useEffect(() => {
    fetchUserCurrentPlan();
    fetchPricing();
  }, []);

  // Fetch user's current subscription plan
  const fetchUserCurrentPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const userIdFromSession = sessionStorage.getItem('uid'); // The authoritative ID for this session

      // Get user ID from localStorage
      const userStr = localStorage.getItem('user');

      // FIRST: Try to get user data from localStorage, but ONLY if it belongs to the current session user
      if (userStr && userIdFromSession) {
        try {
          const userData = JSON.parse(userStr);
          const userIdFromLocal = userData._id || userData.id;

          if (userIdFromLocal === userIdFromSession && userData.type) {
            const userPlan = userData.type.toLowerCase();
            setCurrentUserPlan(userPlan);
            setSubscriptionEnd(userData.subscriptionEnd || null);
            sessionStorage.setItem('type', userPlan);
            console.log('✅ User plan set from validated localStorage:', userPlan);
            return; // Exit if we got valid local data
          } else {
            console.log('⚠️ localStorage data belongs to a different user, ignoring.');
            // Clear stale localStorage data if it doesn't match
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      // SECOND: Fallback to sessionStorage "type" if we have it
      const sessionPlan = sessionStorage.getItem('type');
      if (sessionPlan) {
        const userPlan = sessionPlan.toLowerCase();
        setCurrentUserPlan(userPlan);
        console.log('✅ User plan set from sessionStorage:', userPlan);
      }

      // THIRD: If not validated or need fresh data, fetch from API
      if (!userIdFromSession) {
        return;
      }

      try {
        // Use the specific user endpoint which is more reliable than fetching all
        const response = await axios.get(`${serverURL}/api/user/${userIdFromSession}`);

        if (response.data && response.data.user) {
          const user = response.data.user;
          if (user.type) {
            const userPlan = user.type.toLowerCase();
            setCurrentUserPlan(userPlan);
            setSubscriptionEnd(user.subscriptionEnd || null);
            sessionStorage.setItem('type', userPlan);

            // Sync back to localStorage for other components
            localStorage.setItem('user', JSON.stringify(user));
            console.log('✅ User plan synced from API:', userPlan);
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

          return {
            id: planType,
            name: plan.planName || plan.name,
            price: plan.price || 0,
            currency: plan.currency || 'INR',
            features: PLAN_FEATURES[planType],
            featured: planType === 'yearly',
            planType,
          };
        });

        formattedPlans.sort(
          (a: any, b: any) =>
            PLAN_ORDER[a.planType] - PLAN_ORDER[b.planType]
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
        },
        {
          id: 'monthly',
          name: MonthType,
          price: MonthCost,
          currency: 'INR',
          features: PLAN_FEATURES.monthly,
          planType: 'monthly',
        },
        {
          id: 'yearly',
          name: YearType,
          price: YearCost,
          currency: 'INR',
          features: PLAN_FEATURES.yearly,
          featured: true,
          planType: 'yearly',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to refresh user data after payment
  const refreshUserData = async () => {
    await fetchUserCurrentPlan();
  };

  // Call refresh when component mounts and when returning from payment
  useEffect(() => {
    fetchUserCurrentPlan();

    // Listen for storage events (in case plan is updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'type') {
        fetchUserCurrentPlan();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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

  const getCurrencySymbol = (currency: string) => {
    const symbols: any = { INR: '₹', USD: '$', EUR: '€' };
    return symbols[currency] || '₹';
  };

  /* -------------------- UI -------------------- */

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="text-center">Loading plans...</div>
      </div>
    );
  }

  return (
    <div ref={pricingRef} className="container max-w-6xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="mt-3 text-muted-foreground">
          Select the perfect plan to boost your course creation productivity
        </p>
        {/* Debug info - shows current plan */}
        <div className="mt-4 p-3 bg-muted rounded-md inline-block">
          <p className="text-sm">
            Current Plan: <span className="font-bold text-primary uppercase">{currentUserPlan}</span>
            {currentUserPlan === 'yearly' && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Active Subscription
              </span>
            )}
            {subscriptionEnd && new Date(subscriptionEnd) < new Date() && (
              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                Expired
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isActive = currentUserPlan === plan.id;
          const isExpired = isActive && !!subscriptionEnd && new Date(subscriptionEnd) < new Date();
          const isNotAvailable = !isActive &&
            PLAN_ORDER[plan.planType] < PLAN_ORDER[currentUserPlan];

          return (
            <Card
              key={plan.id}
              className={`relative transition-all duration-300 ${plan.featured ? 'border-primary shadow-lg' : ''
                } ${isActive ? (isExpired ? 'border-red-500 ring-2 ring-red-500 shadow-red-100' : 'ring-2 ring-green-500 border-green-500 shadow-green-100') : ''}`}
            >
              {plan.featured && !isActive && (
                <span className="absolute top-3 right-3 text-xs font-semibold bg-primary text-white px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}

              {isActive && !isExpired && (
                <span className="absolute top-3 right-3 text-xs font-semibold bg-green-600 text-white px-3 py-1 rounded-full">
                  ACTIVE PLAN
                </span>
              )}

              {isExpired && (
                <span className="absolute top-3 right-3 text-xs font-semibold bg-red-600 text-white px-3 py-1 rounded-full animate-pulse">
                  EXPIRED
                </span>
              )}

              <CardHeader>
                <div className="flex items-center gap-2">
                  {plan.planType === 'yearly' && (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  )}
                  {plan.planType === 'monthly' && (
                    <Zap className="h-5 w-5 text-blue-500" />
                  )}
                  <CardTitle>{plan.name}</CardTitle>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {getCurrencySymbol(plan.currency)}
                    {plan.price}
                  </span>
                  {plan.planType !== 'free' && (
                    <span className="text-muted-foreground ml-2">
                      /{plan.planType === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                </div>

                <ul className="space-y-3">
                  {ALL_FEATURES.map((feature, i) => {
                    const value = plan.features[feature];
                    const enabled = value === true || typeof value === 'string';

                    return (
                      <li key={i} className="flex gap-3 items-start">
                        {enabled ? (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <span className="h-5 w-5 rounded-full border border-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            enabled
                              ? 'text-gray-700'
                              : 'line-through text-gray-400'
                          }
                        >
                          {typeof value === 'string'
                            ? `${feature}: ${value}`
                            : feature}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>

              <CardFooter>
                {isActive && (
                  <Button disabled className="w-full bg-green-600 hover:bg-green-700">
                    ✓ Current Plan
                  </Button>
                )}

                {!isActive && isNotAvailable && (
                  <Button disabled className="w-full" variant="outline">
                    Not Available
                  </Button>
                )}

                {!isActive && !isNotAvailable && (
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    className="w-full"
                    variant={plan.featured ? 'default' : 'outline'}
                  >
                    {plan.planType === 'free' ? 'Downgrade' : 'Upgrade'} to {plan.planType}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProfilePricing;