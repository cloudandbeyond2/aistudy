// // import React, { useEffect, useRef, useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import axios from 'axios';
// // import { Button } from '@/components/ui/button';
// // import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// // import { Check, Crown, Zap } from 'lucide-react';
// // import { FreeCost, FreeType, MonthCost, MonthType, YearCost, YearType, serverURL } from '@/constants';

// // // ===== Feature List (same order for all plans) =====
// // const ALL_FEATURES = [
// //   'Sub-Topic Limit',
// //   'Access Duration',
// //   'Theory & Image Course',
// //   'AI Teacher Chat',
// //   'Create Courses',
// //   'Course in 23+ Languages',
// //   'Video & Theory Course',
// //   'Priority Support',
// //   'Advanced Analytics',
// // ];

// // // ===== Feature Matrix (YES / NO / VALUE) =====
// // const PLAN_FEATURES: Record<string, Record<string, boolean | string>> = {
// //   free: {
// //     'Sub-Topic Limit': '5 only',
// //     'Access Duration': '7 days',
// //     'Theory & Image Course': true,
// //     'AI Teacher Chat': true,
// //     'Create Courses': '1 course only',
// //     'Course in 23+ Languages': false,
// //     'Video & Theory Course': false,
// //     'Priority Support': false,
// //     'Advanced Analytics': false,
// //   },

// //   monthly: {
// //     'Sub-Topic Limit': '10 per course',
// //     'Access Duration': '1 month',
// //     'Theory & Image Course': true,
// //     'AI Teacher Chat': true,
// //     'Create Courses': '20 courses',
// //     'Course in 23+ Languages': true,
// //     'Video & Theory Course': true,
// //     'Priority Support': false,
// //     'Advanced Analytics': false,
// //   },

// //   yearly: {
// //     'Sub-Topic Limit': 'Unlimited',
// //     'Access Duration': '1 year',
// //     'Theory & Image Course': true,
// //     'AI Teacher Chat': true,
// //     'Create Courses': 'Unlimited',
// //     'Course in 23+ Languages': true,
// //     'Video & Theory Course': true,
// //     'Priority Support': true,
// //     'Advanced Analytics': true,
// //   },
// // };

// // const ProfilePricing = () => {
// //   const navigate = useNavigate();
// //   const pricingRef = useRef<HTMLDivElement>(null);

// //   const [plans, setPlans] = useState<any[]>([]);
// //   const [isLoading, setIsLoading] = useState(true);

// //   // ✅ Normalize active plan value
// //   const activePlan = sessionStorage.getItem('type')?.toLowerCase() || 'free';

// //   useEffect(() => {
// //     fetchPricing();
// //   }, []);

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
// //             id: planType, // free | monthly | yearly
// //             name: plan.planName || plan.name,
// //             description: '',
// //             price: plan.price || 0,
// //             currency: plan.currency || 'INR',
// //             features: PLAN_FEATURES[planType] || {},
// //             featured: planType === 'yearly',
// //             billing: planType === 'free' ? 'lifetime' : planType,
// //             planType,
// //           };
// //         });

// //         const order = { free: 0, monthly: 1, yearly: 2 } as any;
// //         formattedPlans.sort((a: any, b: any) => order[a.planType] - order[b.planType]);

// //         setPlans(formattedPlans);
// //       }
// //     } catch (error) {
// //       console.error('Pricing fetch failed', error);

// //       // 🔁 Fallback
// //       setPlans([
// //         {
// //           id: 'free',
// //           name: FreeType,
// //           description: '',
// //           price: FreeCost,
// //           currency: 'INR',
// //           features: PLAN_FEATURES.free,
// //           featured: false,
// //           billing: 'lifetime',
// //           planType: 'free',
// //         },
// //         {
// //           id: 'monthly',
// //           name: MonthType,
// //           description: '',
// //           price: MonthCost,
// //           currency: 'INR',
// //           features: PLAN_FEATURES.monthly,
// //           featured: false,
// //           billing: 'monthly',
// //           planType: 'monthly',
// //         },
// //         {
// //           id: 'yearly',
// //           name: YearType,
// //           description: '',
// //           price: YearCost,
// //           currency: 'INR',
// //           features: PLAN_FEATURES.yearly,
// //           featured: true,
// //           billing: 'yearly',
// //           planType: 'yearly',
// //         },
// //       ]);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const getCurrencySymbol = (currency: string) => {
// //     const symbols: any = {
// //       USD: '$',
// //       EUR: '€',
// //       GBP: '£',
// //       INR: '₹',
// //       JPY: '¥',
// //     };
// //     return symbols[currency] || '₹';
// //   };

// //   return (
// //     <div ref={pricingRef} className="container max-w-6xl mx-auto py-8">
// //       <div className="text-center mb-10">
// //         <h1 className="text-3xl font-bold">Choose Your Plan</h1>
// //         <p className="mt-3 text-muted-foreground">
// //           Select the perfect plan to boost your course creation productivity
// //         </p>
// //       </div>

// //       <div className="grid md:grid-cols-3 gap-6">
// //         {plans.map((plan) => (
// //           <Card
// //             key={plan.id}
// //             className={`relative transition-all duration-300 hover:shadow-lg ${
// //               plan.featured ? 'border-primary shadow-primary/20' : 'border-border/50'
// //             }`}
// //           >
// //             {plan.featured && (
// //               <span className="absolute top-3 right-3 text-xs font-semibold bg-primary text-white px-3 py-1 rounded-full">
// //                 MOST POPULAR
// //               </span>
// //             )}

// //             <CardHeader>
// //               <div className="flex items-center gap-2">
// //                 {plan.planType === 'yearly' && <Crown className="h-5 w-5 text-primary" />}
// //                 {plan.planType === 'monthly' && <Zap className="h-5 w-5 text-primary" />}
// //                 <CardTitle>{plan.name}</CardTitle>
// //               </div>
// //               <CardDescription>{plan.description}</CardDescription>
// //             </CardHeader>

// //             <CardContent>
// //               <div className="mb-6">
// //                 <span className="text-4xl font-bold">
// //                   {getCurrencySymbol(plan.currency)}{plan.price}
// //                 </span>
// //                 {plan.planType !== 'free' && (
// //                   <span className="text-muted-foreground ml-2">
// //                     /{plan.planType === 'monthly' ? 'month' : 'year'}
// //                   </span>
// //                 )}
// //               </div>

// //               <ul className="space-y-3">
// //                 {ALL_FEATURES.map((feature, index) => {
// //                   const value = plan.features[feature];
// //                   const enabled = value === true || typeof value === 'string';

// //                   return (
// //                     <li key={index} className="flex gap-3 items-center">
// //                       {enabled ? (
// //                         <Check className="h-5 w-5 text-primary shrink-0" />
// //                       ) : (
// //                         <span className="h-5 w-5 rounded-full border border-muted-foreground/40 shrink-0" />
// //                       )}
// //                       <span className={enabled ? '' : 'text-muted-foreground line-through'}>
// //                         {typeof value === 'string' ? `${feature}: ${value}` : feature}
// //                       </span>
// //                     </li>
// //                   );
// //                 })}
// //               </ul>
// //             </CardContent>

// //             <CardFooter className="pt-4">
// //               {activePlan === plan.id ? (
// //                 <Button disabled className="w-full bg-muted text-muted-foreground cursor-not-allowed">
// //                   Active Plan
// //                 </Button>
// //               ) : (
// //                 <Button
// //                   onClick={() => handleSelectPlan(plan)}
// //                   className={`w-full ${plan.featured ? 'bg-primary hover:bg-primary/90' : ''}`}
// //                   variant={plan.featured ? 'default' : 'outline'}
// //                 >
// //                   Choose {plan.planType}
// //                 </Button>
// //               )}
// //             </CardFooter>
// //           </Card>
// //         ))}
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

// /* -------------------------------- FEATURES -------------------------------- */

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
//     'AI Teacher Chat': true,
//     'Create Courses': '20 courses only',
//     'Course in 23+ Languages': true,
//     'Video & Theory Course': true,
//     'Priority Support': false,
//     'Advanced Analytics': false,
//   },

//   yearly: {
//     'Sub-Topic Limit': 'Unlimited',
//     'Access Duration': '1 year',
//     'Theory & Image Course': true,
//     'AI Teacher Chat': true,
//     'Create Courses': 'Unlimited',
//     'Course in 23+ Languages': true,
//     'Video & Theory Course': true,
//     'Priority Support': true,
//     'Advanced Analytics': true,
//   },
// };

// /* ------------------------------- COMPONENT -------------------------------- */

// const ProfilePricing = () => {
//   const navigate = useNavigate();
//   const pricingRef = useRef<HTMLDivElement>(null);

//   const [plans, setPlans] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // free | monthly | yearly
//   const activePlan = sessionStorage.getItem('type');

//   useEffect(() => {
//     fetchPricing();
//   }, []);

//   /* ----------------------------- FETCH PRICING ----------------------------- */

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
//             description: '',
//             price: plan.price || 0,
//             currency: plan.currency || 'INR',
//             features: PLAN_FEATURES[planType],
//             featured: planType === 'yearly',
//             billing: planType,
//             planType,
//           };
//         });

//         const order: any = { free: 0, monthly: 1, yearly: 2 };
//         formattedPlans.sort((a: any, b: any) => order[a.planType] - order[b.planType]);

//         setPlans(formattedPlans);
//       }
//     } catch (error) {
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

//   /* ----------------------------- HELPERS ----------------------------- */

//   const handleSelectPlan = (plan: any) => {
//     if (activePlan === plan.id) return;

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

//   /* -------------------------------- UI -------------------------------- */

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
//           const isActive = activePlan === plan.id;
//           const isFreeDisabled = plan.planType === 'free' && activePlan !== 'free' && activePlan;

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
//                   {plan.planType === 'yearly' && <Crown className="h-5 w-5 text-primary" />}
//                   {plan.planType === 'monthly' && <Zap className="h-5 w-5 text-primary" />}
//                   <CardTitle>{plan.name}</CardTitle>
//                 </div>
//                 <CardDescription />
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
//                     const enabled = value === true || typeof value === 'string';

//                     return (
//                       <li key={i} className="flex gap-3 items-center">
//                         {enabled ? (
//                           <Check className="h-5 w-5 text-primary" />
//                         ) : (
//                           <span className="h-5 w-5 rounded-full border" />
//                         )}
//                         <span className={enabled ? '' : 'line-through text-muted-foreground'}>
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

//                 {isFreeDisabled && (
//                   <Button disabled className="w-full">
//                     Not Available
//                   </Button>
//                 )}

//                 {!isActive && !isFreeDisabled && (
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
    'Priority Support': true,
    'Advanced Analytics': true,
  },
};

/* -------------------- PLAN ORDER (IMPORTANT) -------------------- */

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

  // free | monthly | yearly
  const activePlan = sessionStorage.getItem('type') || 'free';

  useEffect(() => {
    fetchPricing();
  }, []);

  /* -------------------- FETCH PRICING -------------------- */

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

        const order: any = { free: 0, monthly: 1, yearly: 2 };
        formattedPlans.sort((a: any, b: any) => order[a.planType] - order[b.planType]);

        setPlans(formattedPlans);
      }
    } catch (error) {
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

  /* -------------------- HELPERS -------------------- */

  const handleSelectPlan = (plan: any) => {
    if (activePlan === plan.id) return;

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

  return (
    <div ref={pricingRef} className="container max-w-6xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="mt-3 text-muted-foreground">
          Select the perfect plan to boost your course creation productivity
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isActive = activePlan === plan.id;

          // 🔒 BLOCK DOWNGRADES
          const isNotAvailable =
            activePlan &&
            PLAN_ORDER[plan.planType] < PLAN_ORDER[activePlan];

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.featured ? 'border-primary shadow-primary/20' : ''
              }`}
            >
              {plan.featured && (
                <span className="absolute top-3 right-3 text-xs font-semibold bg-primary text-white px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}

              <CardHeader>
                <div className="flex items-center gap-2">
                  {plan.planType === 'yearly' && <Crown className="h-5 w-5 text-primary" />}
                  {plan.planType === 'monthly' && <Zap className="h-5 w-5 text-primary" />}
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <CardDescription />
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
                      <li key={i} className="flex gap-3 items-center">
                        {enabled ? (
                          <Check className="h-5 w-5 text-primary" />
                        ) : (
                          <span className="h-5 w-5 rounded-full border" />
                        )}
                        <span className={enabled ? '' : 'line-through text-muted-foreground'}>
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
                  <Button disabled className="w-full">
                    Active Plan
                  </Button>
                )}

                {!isActive && isNotAvailable && (
                  <Button disabled className="w-full">
                    Not Available
                  </Button>
                )}

                {!isActive && !isNotAvailable && (
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    className="w-full"
                    variant={plan.featured ? 'default' : 'outline'}
                  >
                    Choose {plan.planType}
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
