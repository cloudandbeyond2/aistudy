// // import React, { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import { Check, Crown } from "lucide-react";

// // import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Skeleton } from "@/components/ui/skeleton";
// // import { serverURL } from "@/constants";

// // /* ---------------- Plan Order ---------------- */
// // const PLAN_ORDER: Record<string, number> = {
// //   free: 0,
// //   monthly: 1,
// //   yearly: 2,
// // };

// // /* ---------------- Features ---------------- */
// // const PLAN_FEATURES: Record<string, string[]> = {
// //   free: [
// //     "Generate 5 Sub-Topics",
// //     "Lifetime access",
// //     "Theory & Image Course",
// //     "AI Teacher Chat",
// //   ],
// //   monthly: [
// //     "Generate 10 Sub-Topics",
// //     "1 Month Access",
// //     "Theory & Image Course",
// //     "AI Teacher Chat",
// //     "23+ Languages",
// //     "Unlimited Courses",
// //     "Video & Theory Course",
// //   ],
// //   yearly: [
// //     "Generate 10 Sub-Topics",
// //     "1 Year Access",
// //     "Theory & Image Course",
// //     "AI Teacher Chat",
// //     "23+ Languages",
// //     "Unlimited Courses",
// //     "Video & Theory Course",
// //   ],
// // };

// // const ProfilePricing = () => {
// //   const navigate = useNavigate();

// //   const [plans, setPlans] = useState<any[]>([]);
// //   const [activeType, setActiveType] = useState<string>("free");
// //   const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
// //   const [loading, setLoading] = useState(true);

// //   /* ---------------- GET ACTIVE USER ---------------- */
// //   useEffect(() => {
// //     const email = sessionStorage.getItem("email");

// //     axios.get(`${serverURL}/api/getusers`).then((res) => {
// //       const users = res.data;

// //       const currentUser = users.find((u: any) => u.email === email);

// //       if (!currentUser) {
// //         setActiveType("free");
// //         return;
// //       }

// //       if (currentUser.subscriptionEnd && new Date(currentUser.subscriptionEnd) > new Date()) {
// //         setActiveType(currentUser.type);
// //         setSubscriptionEnd(currentUser.subscriptionEnd);
// //       } else {
// //         setActiveType("free");
// //         setSubscriptionEnd(null);
// //       }
// //     });
// //   }, []);

// //   /* ---------------- GET PRICING ---------------- */
// //   useEffect(() => {
// //     axios.get(`${serverURL}/api/pricing`).then((res) => {
// //       const formatted = res.data.pricing.map((p: any) => ({
// //         id: p.planType,
// //         planType: p.planType,
// //         name:
// //           p.planType === "free"
// //             ? "Free Plan"
// //             : p.planType === "monthly"
// //             ? "Monthly Plan"
// //             : "Yearly Plan",
// //         price: p.price,
// //         currency: p.currency,
// //         features: PLAN_FEATURES[p.planType],
// //         popular: p.planType === "yearly", // Yearly is Most Popular
// //       }));

// //       // Sort normally by PLAN_ORDER
// //       formatted.sort((a: any, b: any) => PLAN_ORDER[a.planType] - PLAN_ORDER[b.planType]);

// //       // Move popular plan to the end (rightmost)
// //       const popularIndex = formatted.findIndex((p) => p.popular);
// //       if (popularIndex !== -1) {
// //         const [popularPlan] = formatted.splice(popularIndex, 1);
// //         formatted.push(popularPlan);
// //       }

// //       setPlans(formatted);
// //       setLoading(false);
// //     });
// //   }, []);

// //   /* ---------------- UPGRADE ---------------- */
// //   const handleUpgrade = (plan: any) => {
// //     navigate(`/dashboard/payment/${plan.planType}`, {
// //       state: {
// //         price: plan.price,
// //         planType: plan.planType,
// //         planName: plan.name,
// //       },
// //     });
// //   };

// //   if (loading) {
// //     return (
// //       <div className="grid md:grid-cols-3 gap-6">
// //         {[1, 2, 3].map((i) => (
// //           <Skeleton key={i} className="h-[420px] rounded-xl" />
// //         ))}
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="max-w-6xl mx-auto py-12">
// //       <h1 className="text-3xl font-bold text-center mb-2">Choose Your Plan</h1>
// //       <p className="text-center text-muted-foreground mb-10">
// //         Upgrade anytime. Cancel anytime.
// //       </p>

// //       <div className="grid md:grid-cols-3 gap-8">
// //         {plans.map((plan) => {
// //           const isActive = plan.planType === activeType;
// //           const canUpgrade = PLAN_ORDER[plan.planType] > PLAN_ORDER[activeType];

// //           return (
// //             <Card
// //               key={plan.id}
// //               className={`relative rounded-2xl border transition-transform duration-200 ${
// //                 plan.popular ? "border-primary shadow-lg scale-105" : ""
// //               }`}
// //             >
// //               {isActive && (
// //                 <span className="absolute top-4 right-4 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
// //                   Active
// //                 </span>
// //               )}

// //           {plan.popular && (
// //   <span className="absolute top-4 right-4 bg-purple-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
// //     <Crown className="w-4 h-4 text-white" /> Most Popular
// //   </span>
// // )}

// //               <CardHeader>
// //                 <div className="flex items-center gap-2">
// //                   <h3 className="text-xl font-semibold">{plan.name}</h3>
// //                 </div>

// //                 <div className="mt-4 text-3xl font-bold">
// //                   ₹{plan.price}
// //                   <span className="text-sm text-muted-foreground">
// //                     {plan.planType === "monthly"
// //                       ? "/month"
// //                       : plan.planType === "yearly"
// //                       ? "/year"
// //                       : ""}
// //                   </span>
// //                 </div>

// //                 {isActive && subscriptionEnd && (
// //                   <p className="text-xs text-muted-foreground mt-1">
// //                     Valid till {new Date(subscriptionEnd).toDateString()}
// //                   </p>
// //                 )}
// //               </CardHeader>

// //               <CardContent>
// //                 <ul className="space-y-3">
// //                   {plan.features.map((f: string, i: number) => (
// //                     <li key={i} className="flex gap-3">
// //                       <Check className="w-5 h-5 text-primary" />
// //                       {f}
// //                     </li>
// //                   ))}
// //                 </ul>
// //               </CardContent>

// //               <CardFooter>
// //                 {isActive ? (
// //                   <Button className="w-full" disabled variant="secondary">
// //                     Active Plan
// //                   </Button>
// //                 ) : canUpgrade ? (
// //                   <Button className="w-full" onClick={() => handleUpgrade(plan)}>
// //                     Upgrade
// //                   </Button>
// //                 ) : (
// //                   <Button className="w-full" disabled variant="outline">
// //                     Not Available
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

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Check } from "lucide-react";

// import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { serverURL } from "@/constants";

// /* ---------------- Plan Order ---------------- */
// const PLAN_ORDER: Record<string, number> = {
//   free: 0,
//   monthly: 1,
//   yearly: 2,
// };

// /* ---------------- Features ---------------- */
// const PLAN_FEATURES: Record<string, string[]> = {
//   free: [
//     "Generate 5 Sub-Topics",
//     "Access valid for 7 days",
//     "Theory & Image Course",
//     "AI Teacher Chat",
//   ],
//   monthly: [
//     "Generate 10 Sub-Topics",
//     "1 Month Access",
//     "Theory & Image Course",
//     "AI Teacher Chat",
//   ],
//   yearly: [
//     "Generate Unlimited Sub-Topics",
//     "1 Year Access",
//     "Theory & Image Course",
//     "AI Teacher Chat",
//   ],
// };

// const ProfilePricing = () => {
//   const navigate = useNavigate();

//   const [plans, setPlans] = useState<any[]>([]);
//   const [activeType, setActiveType] = useState<string>("free");
//   const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   /* ---------------- GET ACTIVE USER ---------------- */
//   useEffect(() => {
//     const email = sessionStorage.getItem("email");

//     axios.get(`${serverURL}/api/getusers`).then((res) => {
//       const users = res.data;
//       const currentUser = users.find((u: any) => u.email === email);

//       if (!currentUser) {
//         setActiveType("free");
//         setLoading(false);
//         return;
//       }

//       if (currentUser.subscriptionEnd && new Date(currentUser.subscriptionEnd) > new Date()) {
//         setActiveType(currentUser.type);
//         setSubscriptionEnd(currentUser.subscriptionEnd);
//       } else {
//         setActiveType("free");
//         setSubscriptionEnd(null);
//       }

//       setLoading(false);
//     });
//   }, []);

//   /* ---------------- GET PRICING ---------------- */
//   useEffect(() => {
//     axios.get(`${serverURL}/api/pricing`).then((res) => {
//       const formatted = res.data.pricing.map((p: any) => ({
//         id: p.planType,
//         planType: p.planType,
//         name:
//           p.planType === "free"
//             ? "Free"
//             : p.planType === "monthly"
//             ? "Monthly"
//             : "Yearly",
//         price: p.price,
//         currency: p.currency,
//         features: PLAN_FEATURES[p.planType],
//         popular: p.planType === "monthly", // Monthly is Most Popular
//       }));

//       // Sort by PLAN_ORDER
//       formatted.sort((a: any, b: any) => PLAN_ORDER[a.planType] - PLAN_ORDER[b.planType]);

//       setPlans(formatted);
//       setLoading(false);
//     });
//   }, []);

//   /* ---------------- UPGRADE ---------------- */
//   const handleUpgrade = (plan: any) => {
//     navigate(`/dashboard/payment/${plan.planType}`, {
//       state: {
//         price: plan.price,
//         planType: plan.planType,
//         planName: plan.name,
//       },
//     });
//   };

//   if (loading) {
//     return (
//       <div className="grid md:grid-cols-3 gap-6">
//         {[1, 2, 3].map((i) => (
//           <Skeleton key={i} className="h-[420px] rounded-xl" />
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto py-12">
//       <h1 className="text-3xl font-bold text-center mb-2">Choose Your Plan</h1>
//       <p className="text-center text-muted-foreground mb-10">
//         Upgrade anytime. Cancel anytime.
//       </p>

//       <div className="grid md:grid-cols-3 gap-8">
//         {plans.map((plan) => {
//           const isActive = plan.planType === activeType;
//           const canUpgrade = PLAN_ORDER[plan.planType] > PLAN_ORDER[activeType];

//           return (
//             <Card
//               key={plan.id}
//               className={`relative rounded-2xl border transition-transform duration-200 ${
//                 plan.popular
//                   ? "border-primary shadow-2xl scale-105"
//                   : "border-gray-200"
//               }`}
//             >
//               {plan.popular && (
//                 <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
//                   MOST POPULAR
//                 </span>
//               )}

//               <CardHeader className="text-center mt-4">
//                 <h3 className="text-xl font-bold">{plan.name}</h3>

//                 <div className="mt-4 text-3xl font-extrabold">
//                   ₹{plan.price}
//                   <span className="text-sm text-muted-foreground ml-1">
//                     {plan.planType === "monthly"
//                       ? "/Month"
//                       : plan.planType === "yearly"
//                       ? "/Year"
//                       : "/Lifetime"}
//                   </span>
//                 </div>

//                 {isActive && subscriptionEnd && (
//                   <p className="text-xs text-muted-foreground mt-1">
//                     Valid till {new Date(subscriptionEnd).toDateString()}
//                   </p>
//                 )}
//               </CardHeader>

//               <CardContent>
//                 <ul className="space-y-3">
//                   {plan.features.map((f: string, i: number) => (
//                     <li key={i} className="flex items-center gap-3">
//                       <Check className="w-5 h-5 text-primary" />
//                       {f}
//                     </li>
//                   ))}
//                 </ul>
//               </CardContent>

//               <CardFooter className="pt-6">
//                 <Button
//                   className="w-full font-semibold"
//                   onClick={() => handleUpgrade(plan)}
//                   variant={isActive ? "secondary" : "default"}
//                   disabled={isActive}
//                 >
//                   {isActive
//                     ? "Active Plan"
//                     : plan.planType === "free"
//                     ? "Choose Free"
//                     : plan.planType === "monthly"
//                     ? "Choose Monthly"
//                     : "Choose Yearly"}
//                 </Button>
//               </CardFooter>
//             </Card>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default ProfilePricing;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Check } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { serverURL } from "@/constants";

/* ---------------- Plan Order ---------------- */
const PLAN_ORDER: Record<string, number> = {
  free: 0,
  monthly: 1,
  yearly: 2,
};

/* ---------------- Features ---------------- */
const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    "Generate 5 Sub-Topics",
    "Access valid for 7 days",
    "Theory & Image Course",
    "AI Teacher Chat",
  ],
  monthly: [
    "Generate 10 Sub-Topics",
    "1 Month Access",
    "Theory & Image Course",
    "AI Teacher Chat",
  ],
  yearly: [
    "Generate Unlimited Sub-Topics",
    "1 Year Access",
    "Theory & Image Course",
    "AI Teacher Chat",
  ],
};

const ProfilePricing = () => {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<any[]>([]);
  const [activeType, setActiveType] = useState<string>("free");
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- GET ACTIVE USER ---------------- */
  useEffect(() => {
    const email = sessionStorage.getItem("email");

    axios.get(`${serverURL}/api/getusers`).then((res) => {
      const users = res.data;
      const currentUser = users.find((u: any) => u.email === email);

      if (!currentUser) {
        setActiveType("free");
        setLoading(false);
        return;
      }

      if (
        currentUser.subscriptionEnd &&
        new Date(currentUser.subscriptionEnd) > new Date()
      ) {
        setActiveType(currentUser.type);
        setSubscriptionEnd(currentUser.subscriptionEnd);
      } else {
        setActiveType("free");
        setSubscriptionEnd(null);
      }

      setLoading(false);
    });
  }, []);

  /* ---------------- GET PRICING ---------------- */
  useEffect(() => {
    axios.get(`${serverURL}/api/pricing`).then((res) => {
      const formatted = res.data.pricing.map((p: any) => ({
        id: p.planType,
        planType: p.planType,
        name:
          p.planType === "free"
            ? "Free"
            : p.planType === "monthly"
            ? "Monthly"
            : "Yearly",
        price: p.price,
        currency: p.currency,
        features: PLAN_FEATURES[p.planType],
        popular: p.planType === "yearly", // ✅ Yearly is Most Popular
      }));

      formatted.sort(
        (a: any, b: any) => PLAN_ORDER[a.planType] - PLAN_ORDER[b.planType]
      );

      setPlans(formatted);
      setLoading(false);
    });
  }, []);

  /* ---------------- UPGRADE ---------------- */
  const handleUpgrade = (plan: any) => {
    navigate(`/dashboard/payment/${plan.planType}`, {
      state: {
        price: plan.price,
        planType: plan.planType,
        planName: plan.name,
      },
    });
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[420px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-2">
        Choose Your Plan
      </h1>
      <p className="text-center text-muted-foreground mb-10">
        Upgrade anytime. Cancel anytime.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isActive = plan.planType === activeType;

          // ❌ Free is not available if user already upgraded
          const isDowngrade =
            plan.planType === "free" && activeType !== "free";

          return (
            <Card
              key={plan.id}
              className={`relative rounded-2xl border transition-transform duration-200 ${
                plan.popular
                  ? "border-primary shadow-2xl scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  MOST POPULAR
                </span>
              )}

              <CardHeader className="text-center mt-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>

                <div className="mt-4 text-3xl font-extrabold">
                  ₹{plan.price}
                  <span className="text-sm text-muted-foreground ml-1">
                    {plan.planType === "monthly"
                      ? "/Month"
                      : plan.planType === "yearly"
                      ? "/Year"
                      : "/Lifetime"}
                  </span>
                </div>

                {isActive && subscriptionEnd && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Valid till{" "}
                    {new Date(subscriptionEnd).toDateString()}
                  </p>
                )}
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  className="w-full font-semibold"
                  onClick={() => handleUpgrade(plan)}
                  variant={
                    isActive || isDowngrade ? "secondary" : "default"
                  }
                  disabled={isActive || isDowngrade}
                >
                  {isActive
                    ? "Active Plan"
                    : isDowngrade
                    ? "Not Available"
                    : plan.planType === "free"
                    ? "Choose Free"
                    : plan.planType === "monthly"
                    ? "Choose Monthly"
                    : "Choose Yearly"}
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
