// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-nocheck
// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from '@/components/ui/button';
// import { Separator } from "@/components/ui/separator";
// import { toast } from "@/hooks/use-toast";
// import { 
//   PenLine, Save, ShieldCheck, CreditCard, Loader, User, Settings, 
//   MessageSquare, Linkedin, Twitter, Globe, BookOpen, Award, Ticket, 
//   Bell, AlertTriangle, Sparkles, Crown, Calendar, MapPin, Mail, 
//   Phone, Briefcase, Building, Heart, TrendingUp, Star, Gift,
//   Moon, Sun, Monitor, Download, LogOut, Trash2, CheckCircle2,
//   ArrowRight, CircleUser, Layers, Zap, Brain, Target, Rocket
// } from "lucide-react";
// import { Switch } from '@/components/ui/switch';
// import { MonthCost, MonthType, serverURL, YearCost, websiteURL } from '@/constants';
// import axios from 'axios';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { useNavigate } from 'react-router-dom';
// import TestimonialSubmission from '@/components/TestimonialSubmission';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { motion, AnimatePresence } from 'framer-motion';

// const PLAN_ORDER: Record<string, number> = {
//   free: 0,
//   monthly: 1,
//   yearly: 2,
// };

// const PLAN_FEATURES: Record<string, string[]> = {
//   free: ["Basic access", "Community support"],
//   monthly: ["All premium features", "Priority support", "Advanced analytics", "Certification"],
//   yearly: ["All premium features", "24/7 Priority support", "Advanced analytics", "Certification", "Save 20%"],
// };

// const normalizePlanType = (value?: string | null): "free" | "monthly" | "yearly" => {
//   const normalized = String(value || '').toLowerCase().trim();
//   if (normalized === 'monthly' || normalized === 'yearly') return normalized;
//   return 'free';
// };

// const Profile = () => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [activeTab, setActiveTab] = useState("account");
//   const [stats, setStats] = useState({
//     courses: 0,
//     certifications: 0,
//     tickets: 0,
//     streak: 0,
//     completed: 0,
//   });

//   const countries = [
//   { name: "India", code: "+91", length: 10 },
//   { name: "USA", code: "+1", length: 10 },
//   { name: "UK", code: "+44", length: 10 },
//   { name: "UAE", code: "+971", length: 9 },
// ];

//   const [notifications, setNotifications] = useState({
//     mail: true,
//     payments: true,
//     chat: true,
//     marketing: false,
//   });
//   const [savingSettings, setSavingSettings] = useState(false);
//   const [requestingDeletion, setRequestingDeletion] = useState(false);
//   const [deletionReason, setDeletionReason] = useState('');
//   const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
//   const [isExpired, setIsExpired] = useState(false);
//   const [theme, setTheme] = useState('light');

//   const [formData, setFormData] = useState({
//     mName: sessionStorage.getItem('mName') || "",
//     email: sessionStorage.getItem('email') || "",
//     phone: sessionStorage.getItem('phone') || "",
//     dob: sessionStorage.getItem('dob') ? new Date(sessionStorage.getItem('dob')).toISOString().split('T')[0] : "",
//     password: "",
//     userType: sessionStorage.getItem('userType') || "",
//     profession: sessionStorage.getItem('profession') || "",
//     experienceLevel: sessionStorage.getItem('experienceLevel') || "beginner",
//     organizationName: sessionStorage.getItem('organizationName') || "",
//     gender: sessionStorage.getItem('gender') || "",
//     country: sessionStorage.getItem('country') || "",
//     state: sessionStorage.getItem('state') || "",
//     city: sessionStorage.getItem('city') || "",
//     pin: sessionStorage.getItem('pin') || "",
//     address: sessionStorage.getItem('address') || "",
//     bio: sessionStorage.getItem('bio') || "",
//   });

//   const [originalData, setOriginalData] = useState(formData);
//   const [plans, setPlans] = useState<any[]>([]);
//   const [activeType, setActiveType] = useState<"free" | "monthly" | "yearly">(
//     normalizePlanType(sessionStorage.getItem('type'))
//   );
//   const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
//   const [loadingUser, setLoadingUser] = useState(true);
//   const [loadingPlans, setLoadingPlans] = useState(true);
//   const loading = loadingUser || loadingPlans;
//   const activePlan = plans.find((plan) => plan.planType === activeType);
//   const navigate = useNavigate();
//   const [processing, setProcessing] = useState(false);
//   const [processingDelete, setProcessingDelete] = useState(false);
//   const [processingCancel, setProcessingCancel] = useState(false);
//   const [installPrompt, setInstallPrompt] = useState(null);
//   const [method, setMethod] = useState('');
//   const [cost, setCost] = useState('');
//   const [plan, setPlan] = useState('');
//   const [jsonData, setJsonData] = useState({});
//   const [selectedCountry, setSelectedCountry] = useState(countries[0]);
//   const [socialLinks, setSocialLinks] = useState({
//     linkedin: "",
//     twitter: "",
//     website: "",
//     github: "",
//   });

//   // Animation variants
//   const fadeInUp = {
//     initial: { opacity: 0, y: 20 },
//     animate: { opacity: 1, y: 0 },
//     exit: { opacity: 0, y: -20 },
//     transition: { duration: 0.3 }
//   };

//   const staggerContainer = {
//     animate: { transition: { staggerChildren: 0.1 } }
//   };

//   useEffect(() => {
//     window.addEventListener('beforeinstallprompt', (e) => {
//       e.preventDefault();
//       setInstallPrompt(e);
//     });
//   }, []);

//   useEffect(() => {
//     const fetchStats = async () => {
//       const uid = sessionStorage.getItem("uid");
//       if (!uid) return;
//       try {
//         const response = await axios.get(`${serverURL}/api/user-stats/${uid}`);
//         if (response.data.success) {
//           setStats(response.data.stats);
//         }
//       } catch (error) {
//         console.error("Failed to fetch stats:", error);
//       }
//     };
//     fetchStats();
//   }, []);

//   useEffect(() => {
//     const fetchSettings = async () => {
//       const uid = sessionStorage.getItem("uid");
//       if (!uid) return;
//       try {
//         const response = await axios.get(`${serverURL}/api/getuser/${uid}`);
//         if (response.data.success && response.data.user.notifications) {
//           setNotifications(response.data.user.notifications);
//         }
//       } catch (error) {
//         console.error("Failed to fetch settings:", error);
//       }
//     };
//     fetchSettings();
//   }, []);

//   const updateNotifications = async (updated: typeof notifications) => {
//     const uid = sessionStorage.getItem("uid");
//     if (!uid) return;
//     setSavingSettings(true);
//     try {
//       const response = await axios.post(`${serverURL}/api/update-settings`, {
//         userId: uid,
//         notifications: updated,
//       });
//       if (response.data.success) {
//         toast({ title: "Saved", description: "Notification settings updated." });
//       }
//     } catch {
//       toast({ title: "Error", description: "Failed to save settings." });
//     } finally {
//       setSavingSettings(false);
//     }
//   };

//   const handleToggle = (key: keyof typeof notifications) => {
//     const updated = { ...notifications, [key]: !notifications[key] };
//     setNotifications(updated);
//     updateNotifications(updated);
//   };

//   const requestDeletion = async (reason: string) => {
//     const uid = sessionStorage.getItem("uid");
//     if (!uid) return;
//     setRequestingDeletion(true);
//     try {
//       const response = await axios.post(`${serverURL}/api/request-deletion`, {
//         userId: uid,
//         reason,
//       });
//       if (response.data.success) {
//         toast({ title: "Request Submitted", description: response.data.message });
//       } else {
//         toast({ title: "Notice", description: response.data.message });
//       }
//     } catch {
//       toast({ title: "Error", description: "Failed to submit deletion request." });
//     } finally {
//       setRequestingDeletion(false);
//       setDeletionReason('');
//     }
//   };

//   const currentDate = new Date();
//   const fullDate = currentDate.toLocaleDateString("en-IN", {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });

//   useEffect(() => {
//     const uid = sessionStorage.getItem("uid");
//     if (!uid) {
//       setLoadingUser(false);
//       return;
//     }

//     axios.get(`${serverURL}/api/getuser/${uid}`)
//       .then((res) => {
//         const user = res.data?.user;
//         if (!user) return;

//         const nextType = normalizePlanType(user.type);
//         sessionStorage.setItem('type', nextType);
//         if (user.subscriptionEnd) {
//           const expiryDate = new Date(user.subscriptionEnd);
//           const today = new Date();
//           if (expiryDate > today) {
//             setActiveType(nextType);
//             setSubscriptionEnd(user.subscriptionEnd);
//             setIsExpired(false);
//           } else {
//             setActiveType("free");
//             setSubscriptionEnd(user.subscriptionEnd);
//             setIsExpired(true);
//           }
//         } else {
//           setActiveType(nextType);
//           setIsExpired(false);
//         }
//       })
//       .catch(() => setActiveType("free"))
//       .finally(() => setLoadingUser(false));
//   }, []);

//   useEffect(() => {
//     axios.get(`${serverURL}/api/pricing`)
//       .then((res) => {
//         const formatted = res.data.pricing.map((p: any) => ({
//           planType: p.planType,
//           name: p.planType === "free" ? "Free" : p.planType === "monthly" ? "Monthly" : "Yearly",
//           price: p.price,
//           currency: p.currency,
//           features: PLAN_FEATURES[p.planType],
//         }));
//         formatted.sort((a: any, b: any) => PLAN_ORDER[a.planType] - PLAN_ORDER[b.planType]);
//         setPlans(formatted);
//       })
//       .catch(console.error)
//       .finally(() => setLoadingPlans(false));
//   }, []);

//   function redirectPricing() {
//     navigate("/dashboard/pricing");
//   }

//   async function deleteProfile() {
//     if (sessionStorage.getItem('adminEmail') === sessionStorage.getItem('email')) {
//       toast({ title: "Access Denied", description: "Admin profile cannot be deleted." });
//     } else {
//       startDeletion();
//     }
//   }

//   function redirectLogin() {
//     sessionStorage.clear();
//     navigate("/login");
//   }

//   async function startDeletion() {
//     setProcessingDelete(true);
//     const uid = sessionStorage.getItem('uid');
//     const postURL = serverURL + '/api/deleteuser';
//     try {
//       const response = await axios.post(postURL, { userId: uid });
//       if (response.data.success) {
//         toast({ title: "Profile Deleted", description: "Your profile has been deleted successfully" });
//         setProcessingDelete(false);
//         redirectLogin();
//       } else {
//         setProcessingDelete(false);
//         toast({ title: "Error", description: response.data.message });
//       }
//     } catch (error) {
//       setProcessingDelete(false);
//       console.error(error);
//       toast({ title: "Error", description: "Internal Server Error" });
//     }
//   }

//   const handleInstallClick = () => {
//     if (!installPrompt) return;
//     installPrompt.prompt();
//     installPrompt.userChoice.then((choice) => {
//       if (choice.outcome === 'accepted') {
//         console.log('User accepted install');
//       }
//       setInstallPrompt(null);
//     });
//   };

//   useEffect(() => {
//     async function fetchProfile() {
//       const uid = sessionStorage.getItem('uid');
//       if (!uid) return;
      

//       try {
//         const response = await axios.get(`${serverURL}/api/getuser/${uid}`);
//         if (response.data.success) {
//           const user = response.data.user;

//           const fullPhone = user.phone || "";

// // find matching country
// const matched = countries.find(c => fullPhone.startsWith(c.code));

// let phoneNumber = fullPhone;

// if (matched) {
//   setSelectedCountry(matched);
//   phoneNumber = fullPhone.replace(matched.code, "");
// }
//           setFormData({
//             mName: user.mName || "",
//             email: user.email || "",
//           phone: phoneNumber,
//             dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
//             password: "",
//             userType: user.userType || "",
//             profession: user.profession || "",
//             experienceLevel: user.experienceLevel || "beginner",
//             organizationName: user.organizationName || "",
//             gender: user.gender || "",
//             country: user.country || "",
//             state: user.state || "",
//             city: user.city || "",
//             pin: user.pin || "",
//             address: user.address || "",
//             bio: user.bio || "",
//           });

//           setSocialLinks({
//             linkedin: user.linkedin || "",
//             twitter: user.twitter || "",
//             website: user.website || "",
//             github: user.github || "",
//           });

//           sessionStorage.setItem('mName', user.mName || "");
//           sessionStorage.setItem('email', user.email || "");
//           sessionStorage.setItem('userType', user.userType || "");
//           sessionStorage.setItem('dob', user.dob || "");
//           sessionStorage.setItem('gender', user.gender || "");
//           sessionStorage.setItem('phone', user.phone || "");
//           sessionStorage.setItem('country', user.country || "");
//           sessionStorage.setItem('state', user.state || "");
//           sessionStorage.setItem('city', user.city || "");
//           sessionStorage.setItem('pin', user.pin || "");
//           sessionStorage.setItem('address', user.address || "");
//           sessionStorage.setItem('profession', user.profession || "");
//           sessionStorage.setItem('organizationName', user.organizationName || "");
//           sessionStorage.setItem('bio', user.bio || "");
//         }
//       } catch (error) {
//         console.error("Failed to fetch profile:", error);
//         toast({ title: "Error", description: "Failed to fetch profile data." });
//       }
//     }
//     fetchProfile();
//   }, []);
// const validateForm = () => {

//   // ✅ Name
//   if (!formData.mName.trim()) {
//     toast({ title: "Name required", description: "Enter your name" });
//     return false;
//   }

//   // ✅ Email
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(formData.email)) {
//     toast({ title: "Invalid email", description: "Enter valid email" });
//     return false;
//   }

//   // ✅ Phone validation
// const phoneRegex = new RegExp(`^\\d{${selectedCountry.length}}$`);

// if (!phoneRegex.test(formData.phone)) {
//   toast({
//     title: "Invalid Phone",
//     description: `Enter exactly ${selectedCountry.length} digits`
//   });
//   return false;
// }

//   // ✅ DOB
//   if (!formData.dob) {
//     toast({ title: "DOB required", description: "Select your date of birth" });
//     return false;
//   }

//   // ✅ Gender
//   if (!formData.gender) {
//     toast({ title: "Gender required", description: "Select gender" });
//     return false;
//   }

//   // ✅ Password (only if entered)
//   if (formData.password && formData.password.length < 6) {
//     toast({ title: "Weak password", description: "Min 6 characters" });
//     return false;
//   }

//   // ✅ Country
//   if (!formData.country.trim()) {
//     toast({ title: "Country required", description: "Enter country" });
//     return false;
//   }

//   // ✅ State
//   if (!formData.state.trim()) {
//     toast({ title: "State required", description: "Enter state" });
//     return false;
//   }

//   // ✅ City
//   if (!formData.city.trim()) {
//     toast({ title: "City required", description: "Enter city" });
//     return false;
//   }

//   // ✅ PIN
//   const pinRegex = /^\d{6}$/;
//   if (!pinRegex.test(formData.pin)) {
//     toast({ title: "Invalid PIN", description: "6 digits only" });
//     return false;
//   }

//   // ✅ Address
//   if (!formData.address.trim()) {
//     toast({ title: "Address required", description: "Enter address" });
//     return false;
//   }

//   return true;
// };

// const handleSubmit = async (e) => {
//   e.preventDefault(); // stop page reload

//   // run validation
//   if (!validateForm()) return;

//   setProcessing(true);
//   const uid = sessionStorage.getItem("uid");
//   const postURL = serverURL + "/api/profile";

//   try {
//     const response = await axios.post(postURL, {
//       uid,
//       mName: formData.mName,
//       email: formData.email,
//       password: formData.password,
//      phone: selectedCountry.code + formData.phone,
//       dob: formData.dob || null,
//       gender: formData.gender,
//       country: formData.country,
//       state: formData.state,
//       city: formData.city,
//       pin: formData.pin,
//       address: formData.address,
//       userType: formData.userType,
//       profession: formData.userType === "individual" ? formData.profession : "",
//       experienceLevel: formData.userType === "individual" ? formData.experienceLevel : "beginner",
//       organizationName: formData.userType === "organization" ? formData.organizationName : "",
//       bio: formData.bio,
//       linkedin: socialLinks.linkedin,
//       twitter: socialLinks.twitter,
//       website: socialLinks.website,
//       github: socialLinks.github,
//     });

//     if (response.data.success) {
//       toast({
//         title: "Profile updated",
//         description: "Your profile updated successfully"
//       });

//       setIsEditing(false);
//     }

//   } catch (error) {
//     toast({ title: "Error", description: "Internal Server Error" });
//   } finally {
//     setProcessing(false);
//   }
// };


//   async function getDetails() {
//     if (sessionStorage.getItem('type') !== 'free') {
//       const dataToSend = { uid: sessionStorage.getItem('uid'), email: sessionStorage.getItem('email') };
//       try {
//         const postURL = serverURL + '/api/subscriptiondetail';
//         await axios.post(postURL, dataToSend).then(res => {
//           setMethod(res.data.method);
//           setJsonData(res.data.session);
//           setPlan(sessionStorage.getItem('type'));
//           setCost(sessionStorage.getItem('plan') === 'Monthly Plan' ? '' + MonthCost : '' + YearCost);
//         });
//       } catch (error) {
//         console.error(error);
//         toast({ title: "Error", description: "Internal Server Error" });
//       }
//     }
//   }

//   async function cancelSubscription() {
//     setProcessingCancel(true);
//     const dataToSend = { id: jsonData.id, email: sessionStorage.getItem('email') };
//     try {
//       if (method === 'stripe') {
//         const postURL = serverURL + '/api/stripecancel';
//         await axios.post(postURL, dataToSend).then(res => {
//           setProcessingCancel(false);
//           toast({ title: "Subscription Cancelled", description: "Your subscription has been cancelled." });
//           sessionStorage.setItem('type', 'free');
//           window.location.href = websiteURL + '/dashboard/profile';
//         });
//       } else if (method === 'paypal') {
//         const postURL = serverURL + '/api/paypalcancel';
//         await axios.post(postURL, dataToSend).then(res => {
//           setProcessingCancel(false);
//           toast({ title: "Subscription Cancelled", description: "Your subscription has been cancelled." });
//           sessionStorage.setItem('type', 'free');
//           window.location.href = websiteURL + '/dashboard/profile';
//         });
//       } else if (method === 'paystack') {
//         const dataToSends = { code: jsonData.subscription_code, token: jsonData.email_token, email: sessionStorage.getItem('email') };
//         const postURL = serverURL + '/api/paystackcancel';
//         await axios.post(postURL, dataToSends).then(res => {
//           setProcessingCancel(false);
//           toast({ title: "Subscription Cancelled", description: "Your subscription has been cancelled." });
//           sessionStorage.setItem('type', 'free');
//           window.location.href = websiteURL + '/dashboard/profile';
//         });
//       } else if (method === 'flutterwave') {
//         const dataToSends = { code: jsonData.id, token: jsonData.plan, email: sessionStorage.getItem('email') };
//         const postURL = serverURL + '/api/flutterwavecancel';
//         await axios.post(postURL, dataToSends).then(res => {
//           setProcessingCancel(false);
//           toast({ title: "Subscription Cancelled", description: "Your subscription has been cancelled." });
//           sessionStorage.setItem('type', 'free');
//           window.location.href = websiteURL + '/dashboard/profile';
//         });
//       } else {
//         const postURL = serverURL + '/api/razorpaycancel';
//         await axios.post(postURL, dataToSend).then(res => {
//           setProcessingCancel(false);
//           toast({ title: "Subscription Cancelled", description: "Your subscription has been cancelled." });
//           sessionStorage.setItem('type', 'free');
//           window.location.href = websiteURL + '/dashboard/profile';
//         });
//       }
//     } catch (error) {
//       setProcessingCancel(false);
//       console.error(error);
//     }
//   }

//   const handleSocialChange = (platform: string, value: string) => {
//     setSocialLinks(prev => ({ ...prev, [platform]: value }));
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const getPlanIcon = () => {
//     if (isExpired) return <AlertTriangle className="h-5 w-5 text-red-500" />;
//     if (activeType !== "free") return <Crown className="h-5 w-5 text-blue-500" />;
//     return <Sparkles className="h-5 w-5 text-purple-500" />;
//   };

//   const getPlanColor = () => {
//     if (isExpired) return "from-red-500 to-orange-500";
//     if (activeType !== "free") return "from-blue-500 to-indigo-600";
//     return "from-purple-500 to-blue-500";
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
//       <div className="container mx-auto px-4 py-8 max-w-7xl">
//         {/* Header Section */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="mb-8"
//         >
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//             <div>
//               <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                 My Profile
//               </h1>
//               <p className="text-muted-foreground mt-1">
//                 Manage your account, preferences, and learning journey
//               </p>
//             </div>
//             <div className="flex gap-2">
//               {installPrompt && (
//                 <Button variant="outline" onClick={handleInstallClick} className="gap-2">
//                   <Download className="h-4 w-4" />
//                   Install App
//                 </Button>
//               )}
//               <Button variant="outline" onClick={() => navigate("/dashboard")} className="gap-2">
//                 <ArrowRight className="h-4 w-4" />
//                 Back to Dashboard
//               </Button>
//             </div>
//           </div>
//         </motion.div>

//         {/* Hero Profile Card */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//           className="relative mb-8"
//         >
//           <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-3xl" />
//           <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20">
//             <div className={`h-48 bg-gradient-to-r ${getPlanColor()}`} />
//             <div className="relative px-6 pb-6">
//               <div className="absolute left-6 -top-12">
//                 <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
//                   <span className="text-4xl font-bold text-white">
//                     {formData.mName?.charAt(0)?.toUpperCase()}
//                   </span>
//                 </div>
//               </div>
//               <div className="pt-16 pl-36">
//                 <div className="flex items-center gap-3 flex-wrap">
//                   <h2 className="text-2xl font-bold">{formData.mName}</h2>
//                   <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
//                     isExpired 
//                       ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
//                       : activeType !== "free"
//                       ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
//                       : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
//                   }`}>
//                     {!loadingUser && getPlanIcon()}
//                     <span>
//                       {loadingUser
//                         ? "Loading plan..."
//                         : isExpired 
//                         ? "Expired Plan" 
//                         : activeType !== "free" 
//                         ? `${activeType === "monthly" ? "Monthly" : "Yearly"} Pro` 
//                         : "Free Member"}
//                     </span>
//                   </div>
//                 </div>
//                 {/* <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
//                   <Calendar className="h-3 w-3" />
//                   Member since {fullDate}
//                 </p> */}
//                 {formData.bio && (
//                   <p className="text-sm text-muted-foreground mt-2 max-w-md">{formData.bio}</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Stats Grid */}
//         <motion.div
//           variants={staggerContainer}
//           initial="initial"
//           animate="animate"
//           className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
//         >
//           {[
//             { icon: BookOpen, label: "Courses", value: stats.courses, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
//             { icon: Award, label: "Certificates", value: stats.certifications, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
//             { icon: Target, label: "Completed", value: stats.completed || 0, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
//             // { icon: TrendingUp, label: "Streak", value: stats.streak || 0, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
//             { icon: Ticket, label: "Tickets", value: stats.tickets, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
//           ].map((stat, idx) => (
//             <motion.div
//               key={idx}
//               variants={fadeInUp}
//               className={`${stat.bg} rounded-xl p-4 text-center transition-all hover:scale-105 cursor-pointer`}
//             >
//               <stat.icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
//               <p className="text-2xl font-bold">{stat.value}</p>
//               <p className="text-xs text-muted-foreground">{stat.label}</p>
//             </motion.div>
//           ))}
//         </motion.div>

//         {/* Main Content Tabs */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.3 }}
//         >
//           <Tabs defaultValue="account" className="w-full" onValueChange={setActiveTab}>
//             <TabsList className="grid w-full grid-cols-5 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
//               {[
//                 { value: "account", icon: User, label: "Account" },
//                 { value: "settings", icon: Settings, label: "Settings" },
//                 { value: "billing", icon: CreditCard, label: "Billing" },
//                 { value: "social", icon: Globe, label: "Social" },
//                 { value: "testimonial", icon: MessageSquare, label: "Feedback" },
//               ].map((tab) => (
//                 <TabsTrigger
//                   key={tab.value}
//                   value={tab.value}
//                   className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm rounded-lg py-2 transition-all"
//                 >
//                   <tab.icon className="h-4 w-4" />
//                   <span className="hidden sm:inline">{tab.label}</span>
//                 </TabsTrigger>
//               ))}
//             </TabsList>

//             {/* Account Tab */}
//             <TabsContent value="account">
//               <Card className="rounded-xl shadow-lg border-0">
//                 <CardHeader className="flex flex-row items-center justify-between">
//                   <div>
//                     <CardTitle className="flex items-center gap-2">
//                       <User className="h-5 w-5 text-blue-500" />
//                       Personal Information
//                     </CardTitle>
//                     <CardDescription>Manage your personal details and preferences</CardDescription>
//                   </div>
//                   {!isEditing && (
//                     <Button variant="outline" onClick={() => { setOriginalData(formData); setIsEditing(true); }}>
//                       <PenLine className="mr-2 h-4 w-4" />
//                       Edit Profile
//                     </Button>
//                   )}
//                 </CardHeader>
//                 <CardContent>
//                   <form onSubmit={handleSubmit}>
//                     <div className="space-y-6">
//                       {/* Basic Info Grid */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="space-y-2">
//                           <Label className="flex items-center gap-2">
//                             <CircleUser className="h-4 w-4" />
//                             Full Name
//                           </Label>
//                           <Input
//                             name="mName"
//                             value={formData.mName}
//                             onChange={handleChange}
//                             disabled={!isEditing}
//                             className="transition-all focus:ring-2 focus:ring-blue-500"
//                           />
//                         </div>
//                         <div className="space-y-2">
//                           <Label className="flex items-center gap-2">
//                             <Mail className="h-4 w-4" />
//                             Email Address
//                           </Label>
//                           <Input
//                             name="email"
//                             type="email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             disabled={!isEditing}
//                             className="transition-all focus:ring-2 focus:ring-blue-500"
//                           />
//                         </div>
//                         <div className="space-y-2">
//   <Label className="flex items-center gap-2">
//     <Phone className="h-4 w-4" />
//     Phone Number
//   </Label>

//   <div className="flex gap-2">
    
//     {/* Country */}
//     <select
//       value={selectedCountry.code}
//       onChange={(e) => {
//         const country = countries.find(c => c.code === e.target.value);
//         setSelectedCountry(country);
//         setFormData(prev => ({ ...prev, phone: "" }));
//       }}
//       disabled={!isEditing}
//       className="h-10 rounded-md border px-3 text-sm"
//     >
//       {countries.map((c) => (
//         <option key={c.code} value={c.code}>
//           {c.name} ({c.code})
//         </option>
//       ))}
//     </select>

//     {/* Phone */}
//     <Input
//       value={formData.phone}
//       onChange={(e) => {
//         const value = e.target.value
//           .replace(/\D/g, "")
//           .slice(0, selectedCountry.length);

//         setFormData(prev => ({ ...prev, phone: value }));
//       }}
//       placeholder={`Enter ${selectedCountry.length} digits`}
//       disabled={!isEditing}
//       className="flex-1"
//     />

//   </div>
// </div>
//                         <div className="space-y-2">
//                           <Label>Date of Birth</Label>
//                           <Input
//                             type="date"
//                             name="dob"
//                             value={formData.dob}
//                             onChange={handleChange}
//                             disabled={!isEditing}
//                             className="transition-all focus:ring-2 focus:ring-blue-500"
//                           />
//                         </div>
//                         <div className="space-y-2">
//                           <Label>Gender</Label>
//                           <Select
//                             value={formData.gender}
//                             onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
//                             disabled={!isEditing}
//                           >
//                             <SelectTrigger className="transition-all focus:ring-2 focus:ring-blue-500">
//                               <SelectValue placeholder="Select gender" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="male">Male</SelectItem>
//                               <SelectItem value="female">Female</SelectItem>
//                               <SelectItem value="other">Other</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>
//                         <div className="space-y-2">
//                           <Label>New Password</Label>
//                           <Input
//                             name="password"
//                             type="password"
//                             value={formData.password}
//                             onChange={handleChange}
//                             disabled={!isEditing}
//                             placeholder="Leave blank to keep current"
//                             className="transition-all focus:ring-2 focus:ring-blue-500"
//                           />
//                         </div>
//                       </div>

//                       {/* Bio */}
//                       <div className="space-y-2">
//                         <Label>Bio</Label>
//                         <Textarea
//                           name="bio"
//                           value={formData.bio}
//                      onChange={(e) => {
//   const value = e.target.value.slice(0, 200);
//   setFormData(prev => ({ ...prev, bio: value }));
// }}
//                           disabled={!isEditing}
//                           placeholder="Tell us a little about yourself..."
//                           rows={3}
//                           className="transition-all focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>

//                       {/* Location */}
//                       <div className="space-y-4">
//                         <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
//                           <MapPin className="h-4 w-4" />
//                           Location
//                         </h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <div className="space-y-2">
//                             <Label>Country</Label>
//                             <Input
//                               name="country"
//                               value={formData.country}
//                               onChange={handleChange}
//                               disabled={!isEditing}
//                               className="transition-all focus:ring-2 focus:ring-blue-500"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label>State</Label>
//                             <Input
//                               name="state"
//                               value={formData.state}
//                               onChange={handleChange}
//                               disabled={!isEditing}
//                               className="transition-all focus:ring-2 focus:ring-blue-500"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label>City</Label>
//                             <Input
//                               name="city"
//                               value={formData.city}
//                               onChange={handleChange}
//                               disabled={!isEditing}
//                               className="transition-all focus:ring-2 focus:ring-blue-500"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label>PIN Code</Label>
//                             <Input
//                               name="pin"
//                               value={formData.pin}
//                             onChange={(e) => {
//   const value = e.target.value.replace(/\D/g, "").slice(0, 6);
//   setFormData(prev => ({ ...prev, pin: value }));
// }}
//                               disabled={!isEditing}
//                               placeholder="e.g. 600001"
//                               className="transition-all focus:ring-2 focus:ring-blue-500"
//                             />
//                           </div>
//                           <div className="md:col-span-2 space-y-2">
//                             <Label>Address</Label>
//                             <Input
//                               name="address"
//                               value={formData.address}
//                               onChange={handleChange}
//                               disabled={!isEditing}
//                               placeholder="Street, Area, Landmark"
//                               className="transition-all focus:ring-2 focus:ring-blue-500"
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       {/* User Type Section */}
//                       <div className="space-y-4">
//                         <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
//                           <Briefcase className="h-4 w-4" />
//                           Professional Information
//                         </h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <div className="space-y-2">
//                             <Label>User Type</Label>
//                             <Select value={formData.userType} disabled={true}>
//                               <SelectTrigger>
//                                 <SelectValue placeholder="Select user type" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 <SelectItem value="individual">Individual</SelectItem>
//                                 <SelectItem value="organization">Organization</SelectItem>
//                               </SelectContent>
//                             </Select>
//                           </div>

//                           {formData.userType === "individual" && (
//                             <>
//                               <div className="space-y-2">
//                                 <Label>Profession</Label>
//                                 <Input
//                                   name="profession"
//                                   value={formData.profession}
//                                   onChange={handleChange}
//                                   disabled={!isEditing}
//                                   placeholder="e.g. Software Developer"
//                                   className="transition-all focus:ring-2 focus:ring-blue-500"
//                                 />
//                               </div>
//                               <div className="space-y-2">
//                                 <Label>Experience Level</Label>
//                                 <Select
//                                   value={formData.experienceLevel}
//                                   onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
//                                   disabled={!isEditing}
//                                 >
//                                   <SelectTrigger className="transition-all focus:ring-2 focus:ring-blue-500">
//                                     <SelectValue placeholder="Select experience level" />
//                                   </SelectTrigger>
//                                   <SelectContent>
//                                     <SelectItem value="beginner">Beginner</SelectItem>
//                                     <SelectItem value="intermediate">Intermediate</SelectItem>
//                                     <SelectItem value="advanced">Advanced</SelectItem>
//                                   </SelectContent>
//                                 </Select>
//                               </div>
//                             </>
//                           )}

//                           {formData.userType === "organization" && (
//                             <div className="space-y-2">
//                               <Label>Organization Name</Label>
//                               <Input
//                                 name="organizationName"
//                                 value={formData.organizationName}
//                                 onChange={handleChange}
//                                 disabled={!isEditing}
//                                 placeholder="Company / Institute name"
//                                 className="transition-all focus:ring-2 focus:ring-blue-500"
//                               />
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       {/* Action Buttons */}
//                       {isEditing && (
//                         <div className="flex gap-3 justify-end pt-6 border-t">
//                           <Button type="submit" disabled={processing} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
//                             {processing && <Loader className="animate-spin h-4 w-4" />}
//                             <Save className="h-4 w-4" />
//                             {processing ? "Saving..." : "Save Changes"}
//                           </Button>
//                           <Button
//                             type="button"
//                             variant="outline"
//                             onClick={() => { setFormData(originalData); setIsEditing(false); }}
//                           >
//                             Cancel
//                           </Button>
//                         </div>
//                       )}
//                     </div>
//                   </form>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Settings Tab */}
//             <TabsContent value="settings">
//               <Card className="rounded-xl shadow-lg border-0">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Settings className="h-5 w-5 text-blue-500" />
//                     Preferences & Notifications
//                   </CardTitle>
//                   <CardDescription>Customize your experience and notification preferences</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   {/* Notification Preferences */}
//                   <div className="space-y-4">
//                     <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
//                       <Bell className="h-4 w-4" />
//                       Notification Preferences
//                     </h3>
//                     {[
//                       { key: "mail", label: "Email Notifications", desc: "Receive email updates about your courses and account" },
//                       { key: "payments", label: "Payment Alerts", desc: "Get notified about subscription renewals and billing" },
//                       { key: "chat", label: "Chat Notifications", desc: "Receive notifications from the course assistant" },
//                       { key: "marketing", label: "Marketing Updates", desc: "Get updates about new courses and features" },
//                     ].map((item) => (
//                       <div key={item.key} className="flex items-center justify-between rounded-lg border p-4 transition-all hover:shadow-sm">
//                         <div>
//                           <Label className="font-medium">{item.label}</Label>
//                           <p className="text-sm text-muted-foreground">{item.desc}</p>
//                         </div>
//                         <Switch
//                           checked={notifications[item.key]}
//                           disabled={savingSettings}
//                           onCheckedChange={() => handleToggle(item.key as keyof typeof notifications)}
//                         />
//                       </div>
//                     ))}
//                   </div>

//                   <Separator />

               

                 

//                   {/* Danger Zone */}
//                   <div className="space-y-3">
//                     <h3 className="text-sm font-medium text-red-500 uppercase tracking-wider flex items-center gap-2">
//                       <AlertTriangle className="h-4 w-4" />
//                       Danger Zone
//                     </h3>
//                     <div className="flex items-center justify-between rounded-lg border border-red-200 p-4 bg-red-50/30 dark:bg-red-900/10">
//                       <div>
//                         <Label className="font-medium">Request Account Deletion</Label>
//                         <p className="text-sm text-muted-foreground">
//                           Submit a request to permanently remove your account. An admin will review and process it.
//                         </p>
//                       </div>
//                       <Dialog>
//                         <DialogTrigger asChild>
//                           <Button variant="destructive" className="gap-2">
//                             <Trash2 className="h-4 w-4" />
//                             Request Deletion
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent>
//                           <DialogHeader>
//                             <DialogTitle>Request Account Deletion</DialogTitle>
//                             <DialogDescription>
//                               Your account will not be deleted immediately. An admin will review your request.
//                             </DialogDescription>
//                           </DialogHeader>
//                           <div className="space-y-3 py-2">
//                             <Label htmlFor="deletion-reason">Reason (optional)</Label>
//                             <Input
//                               id="deletion-reason"
//                               placeholder="Why do you want to delete your account?"
//                               value={deletionReason}
//                               onChange={(e) => setDeletionReason(e.target.value)}
//                             />
//                           </div>
//                           <DialogFooter>
//                             <DialogTrigger asChild>
//                               <Button variant="outline">Cancel</Button>
//                             </DialogTrigger>
//                             <Button onClick={() => requestDeletion(deletionReason)} variant="destructive" disabled={requestingDeletion}>
//                               {requestingDeletion && <Loader className="animate-spin mr-2 h-4 w-4" />}
//                               Submit Request
//                             </Button>
//                           </DialogFooter>
//                         </DialogContent>
//                       </Dialog>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Billing Tab */}
//             <TabsContent value="billing">
//               <Card className="rounded-xl shadow-lg border-0">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <CreditCard className="h-5 w-5 text-blue-500" />
//                     Subscription & Billing
//                   </CardTitle>
//                   <CardDescription>Manage your subscription plan and payment methods</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   {loading ? (
//                     <div className="flex justify-center py-8">
//                       <Loader className="animate-spin h-8 w-8 text-blue-500" />
//                     </div>
//                   ) : activeType === "free" ? (
//                     <div className="text-center py-8">
//                       <Sparkles className="h-16 w-16 text-purple-500 mx-auto mb-4" />
//                       <h3 className="text-xl font-semibold mb-2">Free Plan</h3>
//                       <p className="text-muted-foreground mb-6">
//                         {activePlan?.currency} {activePlan?.price} / 7 days
//                       </p>
//                       <Button onClick={redirectPricing} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
//                         Upgrade to Pro
//                         <Rocket className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   ) : (
//                     <div className="space-y-6">
//                       <div className={`p-6 rounded-xl bg-gradient-to-r ${getPlanColor()}`}>
//                         <div className="flex items-center gap-2 text-white mb-2">
//                           <Crown className="h-6 w-6" />
//                           <h3 className="text-xl font-semibold">{activePlan?.name} Plan</h3>
//                         </div>
//                         <p className="text-white/90 text-2xl font-bold mb-4">
//                           {activePlan?.currency} {activePlan?.price} / {activePlan?.planType === "monthly" ? "month" : "year"}
//                         </p>
//                         <ul className="space-y-2 text-white/90">
//                           {activePlan?.features.map((feature: string, idx: number) => (
//                             <li key={idx} className="flex items-center gap-2">
//                               <CheckCircle2 className="h-4 w-4" />
//                               {feature}
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                       {subscriptionEnd && (
//                         <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
//                           <p className="text-sm text-muted-foreground">Your subscription will renew on:</p>
//                           <p className="font-semibold">{new Date(subscriptionEnd).toLocaleDateString()}</p>
//                         </div>
//                       )}
//                       <Button variant="destructive" onClick={cancelSubscription} disabled={processingCancel} className="w-full">
//                         {processingCancel && <Loader className="animate-spin mr-2 h-4 w-4" />}
//                         Cancel Subscription
//                       </Button>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Social Tab */}
//             <TabsContent value="social">
//               <Card className="rounded-xl shadow-lg border-0">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Globe className="h-5 w-5 text-blue-500" />
//                     Social Connections
//                   </CardTitle>
//                   <CardDescription>Connect your social profiles to enhance your learning network</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   {[
//                     { platform: "linkedin", icon: Linkedin, color: "text-blue-600", placeholder: "https://linkedin.com/in/username" },
//                     { platform: "twitter", icon: Twitter, color: "text-blue-400", placeholder: "https://twitter.com/username" },
//                     { platform: "github", icon: "Github", color: "text-gray-800 dark:text-gray-200", placeholder: "https://github.com/username" },
//                     { platform: "website", icon: Globe, color: "text-green-600", placeholder: "https://yourwebsite.com" },
//                   ].map((social) => (
//                     <div key={social.platform} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
//                       <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${social.color}`}>
//                         {social.icon === "Github" ? (
//                           <span className="text-xl font-bold">GH</span>
//                         ) : (
//                           <social.icon className="h-5 w-5" />
//                         )}
//                       </div>
//                       <div className="flex-1">
//                         <Label className="capitalize">{social.platform}</Label>
//                         <Input
//                           value={socialLinks[social.platform]}
//                           onChange={(e) => handleSocialChange(social.platform, e.target.value)}
//                           placeholder={social.placeholder}
//                           disabled={!isEditing}
//                           className="mt-1 transition-all focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>
//                     </div>
//                   ))}
//                   {!isEditing && (
//                     <Button variant="outline" onClick={() => { setOriginalData(formData); setIsEditing(true); }} className="w-full">
//                       <PenLine className="mr-2 h-4 w-4" />
//                       Edit Social Links
//                     </Button>
//                   )}
//                   {isEditing && (
//                     <div className="flex gap-3 justify-end pt-4">
//                 <Button 
// type="submit"
//   className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
// >
//                         <Save className="h-4 w-4" />
//                         Save Social Links
//                       </Button>
//                       <Button variant="outline" onClick={() => { setIsEditing(false); }}>
//                         Cancel
//                       </Button>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Testimonial Tab */}
//             <TabsContent value="testimonial">
//               <Card className="rounded-xl shadow-lg border-0">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <MessageSquare className="h-5 w-5 text-blue-500" />
//                     Share Your Experience
//                   </CardTitle>
//                   <CardDescription>Help others by sharing your learning journey</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <TestimonialSubmission />
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Profile;


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  PenLine, Save, ShieldCheck, CreditCard, Loader, User, Settings, 
  MessageSquare, Linkedin, Twitter, Globe, BookOpen, Award, Ticket, 
  Bell, AlertTriangle, Sparkles, Crown, Calendar, MapPin, Mail, 
  Phone, Briefcase, Building, Heart, TrendingUp, Star, Gift,
  Moon, Sun, Monitor, Download, LogOut, Trash2, CheckCircle2,
  ArrowRight, CircleUser, Layers, Zap, Brain, Target, Rocket
} from "lucide-react";
import { Switch } from '@/components/ui/switch';
import { MonthCost, MonthType, serverURL, YearCost, websiteURL } from '@/constants';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useNavigate } from 'react-router-dom';
import TestimonialSubmission from '@/components/TestimonialSubmission';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

const PLAN_ORDER: Record<string, number> = {
  free: 0,
  monthly: 1,
  yearly: 2,
};

const PLAN_FEATURES: Record<string, string[]> = {
  free: ["Basic access", "Community support"],
  monthly: ["All premium features", "Priority support", "Advanced analytics", "Certification"],
  yearly: ["All premium features", "24/7 Priority support", "Advanced analytics", "Certification", "Save 20%"],
};

const normalizePlanType = (value?: string | null): "free" | "monthly" | "yearly" => {
  const normalized = String(value || '').toLowerCase().trim();
  if (normalized === 'monthly' || normalized === 'yearly') return normalized;
  return 'free';
};

const resolvePrivilegedPlanType = (value?: string | null) => {
  const normalized = normalizePlanType(value);
  if (normalized !== 'free') return normalized;
  const email = sessionStorage.getItem('email');
  const adminEmail = sessionStorage.getItem('adminEmail');
  if (email && adminEmail && adminEmail === email) return 'yearly';
  return normalized;
};

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const isAdminAccount = sessionStorage.getItem("adminEmail") === sessionStorage.getItem("email");
  const isOrgAdmin = sessionStorage.getItem("role") === "org_admin" || isAdminAccount;
  const [stats, setStats] = useState({
    courses: 0,
    certifications: 0,
    tickets: 0,
    streak: 0,
    completed: 0,
  });

  const countries = [
  { name: "India", code: "+91", length: 10 },
  { name: "USA", code: "+1", length: 10 },
  { name: "UK", code: "+44", length: 10 },
  { name: "UAE", code: "+971", length: 9 },
];

  const [notifications, setNotifications] = useState({
    mail: true,
    payments: true,
    chat: true,
    marketing: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [requestingDeletion, setRequestingDeletion] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [theme, setTheme] = useState('light');

  const [formData, setFormData] = useState({
    mName: sessionStorage.getItem('mName') || "",
    email: sessionStorage.getItem('email') || "",
    phone: sessionStorage.getItem('phone') || "",
    dob: sessionStorage.getItem('dob') ? new Date(sessionStorage.getItem('dob')).toISOString().split('T')[0] : "",
    password: "",
    userType: sessionStorage.getItem('userType') || "",
    profession: sessionStorage.getItem('profession') || "",
    experienceLevel: sessionStorage.getItem('experienceLevel') || "beginner",
    organizationName: sessionStorage.getItem('organizationName') || "",
    gender: sessionStorage.getItem('gender') || "",
    country: sessionStorage.getItem('country') || "",
    state: sessionStorage.getItem('state') || "",
    city: sessionStorage.getItem('city') || "",
    pin: sessionStorage.getItem('pin') || "",
    address: sessionStorage.getItem('address') || "",
    bio: sessionStorage.getItem('bio') || "",
  });

  const [originalData, setOriginalData] = useState(formData);
  const [errors, setErrors] = useState({});
  const [plans, setPlans] = useState<any[]>([]);
  const [activeType, setActiveType] = useState<"free" | "monthly" | "yearly">(
    resolvePrivilegedPlanType(sessionStorage.getItem('type'))
  );
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const loading = loadingUser || loadingPlans;
  const activePlan = plans.find((plan) => plan.planType === activeType);
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [processingDelete, setProcessingDelete] = useState(false);
  const [processingCancel, setProcessingCancel] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [method, setMethod] = useState('');
  const [cost, setCost] = useState('');
  const [plan, setPlan] = useState('');
  const [jsonData, setJsonData] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: "",
    twitter: "",
    website: "",
    github: "",
  });

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const uid = sessionStorage.getItem("uid");
      if (!uid) return;
      try {
        const response = await axios.get(`${serverURL}/api/user-stats/${uid}`);
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      const uid = sessionStorage.getItem("uid");
      if (!uid) return;
      try {
        const response = await axios.get(`${serverURL}/api/getuser/${uid}`);
        if (response.data.success && response.data.user.notifications) {
          setNotifications(response.data.user.notifications);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const updateNotifications = async (updated: typeof notifications) => {
    const uid = sessionStorage.getItem("uid");
    if (!uid) return;
    setSavingSettings(true);
    try {
      const response = await axios.post(`${serverURL}/api/update-settings`, {
        userId: uid,
        notifications: updated,
      });
      if (response.data.success) {
        toast({ title: "Saved", description: "Notification settings updated." });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save settings." });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggle = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    updateNotifications(updated);
  };

  const requestDeletion = async (reason: string) => {
    const uid = sessionStorage.getItem("uid");
    if (!uid) return;
    setRequestingDeletion(true);
    try {
      const response = await axios.post(`${serverURL}/api/request-deletion`, {
        userId: uid,
        reason,
      });
      if (response.data.success) {
        toast({ title: "Request Submitted", description: response.data.message });
      } else {
        toast({ title: "Notice", description: response.data.message });
      }
    } catch {
      toast({ title: "Error", description: "Failed to submit deletion request." });
    } finally {
      setRequestingDeletion(false);
      setDeletionReason('');
    }
  };

  const currentDate = new Date();
  const fullDate = currentDate.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const uid = sessionStorage.getItem("uid");
    if (!uid) {
      setLoadingUser(false);
      return;
    }

    axios.get(`${serverURL}/api/getuser/${uid}`)
      .then((res) => {
        const user = res.data?.user;
        if (!user) return;

        const adminEmail = sessionStorage.getItem('adminEmail');
        const currentEmail = sessionStorage.getItem('email');
        const privilegedAccount = Boolean(adminEmail && currentEmail && adminEmail === currentEmail);
        const nextType = normalizePlanType(user.type);
        const effectiveType = privilegedAccount && nextType === 'free' ? 'yearly' : nextType;
        sessionStorage.setItem('type', effectiveType);
        if (user.subscriptionEnd) {
          const expiryDate = new Date(user.subscriptionEnd);
          const today = new Date();
          if (privilegedAccount || expiryDate > today) {
            setActiveType(effectiveType);
            setSubscriptionEnd(user.subscriptionEnd);
            setIsExpired(false);
          } else {
            setActiveType("free");
            setSubscriptionEnd(user.subscriptionEnd);
            setIsExpired(true);
          }
        } else {
          setActiveType(effectiveType);
          setIsExpired(false);
        }
      })
      .catch(() => setActiveType(resolvePrivilegedPlanType(sessionStorage.getItem('type'))))
      .finally(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    axios.get(`${serverURL}/api/pricing`)
      .then((res) => {
        const formatted = res.data.pricing.map((p: any) => ({
          planType: p.planType,
          name: p.planType === "free" ? "Free" : p.planType === "monthly" ? "Monthly" : "Yearly",
          price: p.price,
          currency: p.currency,
          features: PLAN_FEATURES[p.planType],
        }));
        formatted.sort((a: any, b: any) => PLAN_ORDER[a.planType] - PLAN_ORDER[b.planType]);
        setPlans(formatted);
      })
      .catch(console.error)
      .finally(() => setLoadingPlans(false));
  }, []);

  function redirectPricing() {
    navigate("/dashboard/pricing");
  }

  async function deleteProfile() {
    if (sessionStorage.getItem('adminEmail') === sessionStorage.getItem('email')) {
      toast({ title: "Access Denied", description: "Admin profile cannot be deleted." });
    } else {
      startDeletion();
    }
  }

  function redirectLogin() {
    sessionStorage.clear();
    navigate("/login");
  }

  async function startDeletion() {
    setProcessingDelete(true);
    const uid = sessionStorage.getItem('uid');
    const postURL = serverURL + '/api/deleteuser';
    try {
      const response = await axios.post(postURL, { userId: uid });
      if (response.data.success) {
        toast({ title: "Profile Deleted", description: "Your profile has been deleted successfully" });
        setProcessingDelete(false);
        redirectLogin();
      } else {
        setProcessingDelete(false);
        toast({ title: "Error", description: response.data.message });
      }
    } catch (error) {
      setProcessingDelete(false);
      console.error(error);
      toast({ title: "Error", description: "Internal Server Error" });
    }
  }

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('User accepted install');
      }
      setInstallPrompt(null);
    });
  };

  useEffect(() => {
    async function fetchProfile() {
      const uid = sessionStorage.getItem('uid');
      if (!uid) return;
      

      try {
        const response = await axios.get(`${serverURL}/api/getuser/${uid}`);
        if (response.data.success) {
          const user = response.data.user;

          const fullPhone = user.phone || "";

// find matching country
const matched = countries.find(c => fullPhone.startsWith(c.code));

let phoneNumber = fullPhone;

if (matched) {
  setSelectedCountry(matched);
  phoneNumber = fullPhone.replace(matched.code, "");
}
          setFormData({
            mName: user.mName || "",
            email: user.email || "",
          phone: phoneNumber,
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
            password: "",
            userType: user.userType || "",
            profession: user.profession || "",
            experienceLevel: user.experienceLevel || "beginner",
            organizationName: user.organizationName || "",
            gender: user.gender || "",
            country: user.country || "",
            state: user.state || "",
            city: user.city || "",
            pin: user.pin || "",
            address: user.address || "",
            bio: user.bio || "",
          });

          setSocialLinks({
            linkedin: user.linkedin || "",
            twitter: user.twitter || "",
            website: user.website || "",
            github: user.github || "",
          });

          sessionStorage.setItem('mName', user.mName || "");
          sessionStorage.setItem('email', user.email || "");
          sessionStorage.setItem('userType', user.userType || "");
          sessionStorage.setItem('dob', user.dob || "");
          sessionStorage.setItem('gender', user.gender || "");
          sessionStorage.setItem('phone', user.phone || "");
          sessionStorage.setItem('country', user.country || "");
          sessionStorage.setItem('state', user.state || "");
          sessionStorage.setItem('city', user.city || "");
          sessionStorage.setItem('pin', user.pin || "");
          sessionStorage.setItem('address', user.address || "");
          sessionStorage.setItem('profession', user.profession || "");
          sessionStorage.setItem('organizationName', user.organizationName || "");
          sessionStorage.setItem('bio', user.bio || "");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({ title: "Error", description: "Failed to fetch profile data." });
      }
    }
    fetchProfile();
  }, []);
 const validateAccountForm = () => {
  let newErrors: Record<string, string> = {};

  if (!formData.mName.trim()) {
    newErrors.mName = isOrgAdmin ? "Organization name is required" : "Full name is required";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = "Please enter a valid email address";
  }

  if (!new RegExp(`^\\d{${selectedCountry.length}}$`).test(formData.phone)) {
    newErrors.phone = `Phone must be ${selectedCountry.length} digits`;
  }

  if (!formData.gender) {
    newErrors.gender = "Please select your gender";
  }

  if (formData.userType === "individual" && !formData.profession?.trim()) {
    newErrors.profession = "Profession is required";
  }

  if (formData.password.trim()) {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!strongRegex.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number & special character";
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
  const validateSocialForm = () => {
  let newErrors: Record<string, string> = {};

  if (socialLinks.linkedin &&
    !/^https?:\/\/(www\.)?linkedin\.com\/.+$/i.test(socialLinks.linkedin)
  ) {
    newErrors.linkedin = "Invalid LinkedIn URL";
  }

  if (socialLinks.twitter &&
    !/^https?:\/\/(www\.)?(twitter|x)\.com\/.+$/i.test(socialLinks.twitter)
  ) {
    newErrors.twitter = "Invalid Twitter/X URL";
  }

  if (socialLinks.github &&
    !/^https?:\/\/(www\.)?github\.com\/.+$/i.test(socialLinks.github)
  ) {
    newErrors.github = "Invalid GitHub URL";
  }

  if (socialLinks.website &&
    !/^https?:\/\/.+\..+/.test(socialLinks.website)
  ) {
    newErrors.website = "Invalid website URL";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ validate based on active tab
  if (activeTab === "account") {
    if (!validateAccountForm()) return;
  }

  if (activeTab === "social") {
    if (!validateSocialForm()) return;
  }

  setProcessing(true);
  const uid = sessionStorage.getItem("uid");
  const postURL = serverURL + "/api/profile";

  try {
    const payload = {
      uid,
      mName: formData.mName,
      email: formData.email,
      phone: selectedCountry.code + formData.phone,
      dob: formData.dob || null,
      gender: formData.gender,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      pin: formData.pin,
      address: formData.address,
      userType: formData.userType,
      profession: formData.userType === "individual" ? formData.profession : "",
      experienceLevel: formData.userType === "individual" ? formData.experienceLevel : "beginner",
      organizationName: formData.userType === "organization" ? formData.organizationName : "",
      bio: formData.bio,
      linkedin: socialLinks.linkedin,
      twitter: socialLinks.twitter,
      website: socialLinks.website,
      github: socialLinks.github,
    };

    // ✅ password only if entered
    if (formData.password.trim()) {
      payload.password = formData.password;
    }

    const response = await axios.post(postURL, payload);

    if (response.data.success) {
      toast({
        title: "Profile updated",
        description: "Your profile updated successfully"
      });
      setIsEditing(false);
    }

  } catch (error) {
    toast({ title: "Error", description: "Internal Server Error" });
  } finally {
    setProcessing(false);
  }
};

  async function getDetails() {
    if (sessionStorage.getItem('type') !== 'free') {
      const dataToSend = { uid: sessionStorage.getItem('uid'), email: sessionStorage.getItem('email') };
      try {
        const postURL = serverURL + '/api/subscriptiondetail';
        await axios.post(postURL, dataToSend).then(res => {
          setMethod(res.data.method);
          setJsonData(res.data.session);
          setPlan(sessionStorage.getItem('type'));
          setCost(sessionStorage.getItem('plan') === 'Monthly Plan' ? '' + MonthCost : '' + YearCost);
        });
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Internal Server Error" });
      }
    }
  }

  async function cancelSubscription() {
    if (sessionStorage.getItem('adminEmail') === sessionStorage.getItem('email')) {
      toast({ title: "Admin Access", description: "Admin accounts keep premium access." });
      return;
    }
    setProcessingCancel(true);
    const dataToSend = { id: jsonData.id, email: sessionStorage.getItem('email') };
    try {
      if (method === 'stripe') {
        const postURL = serverURL + '/api/stripecancel';
        await axios.post(postURL, dataToSend).then(res => {
          setProcessingCancel(false);
          toast({ title: "Subscription Cancelled", description: "Your subscription has been cancelled." });
          sessionStorage.setItem('type', 'free');
          window.location.href = websiteURL + '/dashboard/profile';
        });
      } else if (method === 'paypal') {
        const postURL = serverURL + '/api/paypalcancel';
        await axios.post(postURL, dataToSend).then(res => {
          setProcessingCancel(false);
          toast({ title: "Subscription Cancelled", description: "Your subscription has been cancelled." });
          sessionStorage.setItem('type', 'free');
          window.location.href = websiteURL + '/dashboard/profile';
        });
      } else if (method === 'paystack') {
        const dataToSends = { code: jsonData.subscription_code, token: jsonData.email_token, email: sessionStorage.getItem('email') };
        const postURL = serverURL + '/api/paystackcancel';
        await axios.post(postURL, dataToSends).then(res => {
          setProcessingCancel(false);
          toast({ title: "Subscription Cancelled", description: "Your subscription has been cancelled." });
          sessionStorage.setItem('type', 'free');
          window.location.href = websiteURL + '/dashboard/profile';
        });
      } else if (method === 'flutterwave') {
        const dataToSends = { code: jsonData.id, token: jsonData.plan, email: sessionStorage.getItem('email') };
        const postURL = serverURL + '/api/flutterwavecancel';
        await axios.post(postURL, dataToSends).then(res => {
          setProcessingCancel(false);
          toast({ title: "Subscription Cancelled", description: "Your subscription has been cancelled." });
          sessionStorage.setItem('type', 'free');
          window.location.href = websiteURL + '/dashboard/profile';
        });
      } else {
        const postURL = serverURL + '/api/razorpaycancel';
        await axios.post(postURL, dataToSend).then(res => {
          setProcessingCancel(false);
          toast({ title: "Subscription Cancelled", description: "Your subscription has been cancelled." });
          sessionStorage.setItem('type', 'free');
          window.location.href = websiteURL + '/dashboard/profile';
        });
      }
    } catch (error) {
      setProcessingCancel(false);
      console.error(error);
    }
  }

  const handleSocialChange = (platform, value) => {
  setSocialLinks(prev => ({ ...prev, [platform]: value }));

  // remove error instantly
  setErrors(prev => ({ ...prev, [platform]: "" }));
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  // ✅ place here (above return, inside component)
const getPasswordStrength = (password) => {
  if (!password) return "";

  let strength = 0;

  if (password.length >= 6) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;

  if (strength <= 1) return "Weak";
  if (strength <= 3) return "Medium";
  return "Strong";
};

  const getPlanIcon = () => {
    if (isExpired) return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (activeType !== "free") return <Crown className="h-5 w-5 text-blue-500" />;
    return <Sparkles className="h-5 w-5 text-purple-500" />;
  };

  const getPlanColor = () => {
    if (isExpired) return "from-red-500 to-orange-500";
    if (activeType !== "free") return "from-blue-500 to-indigo-600";
    return "from-purple-500 to-blue-500";
  };

  const profileTabs = [
    { value: "account", icon: User, label: "Account" },
    { value: "settings", icon: Settings, label: "Settings" },
    ...(!isOrgAdmin ? [{ value: "billing", icon: CreditCard, label: "Billing" }] : []),
    { value: "social", icon: Globe, label: "Social" },
    { value: "testimonial", icon: MessageSquare, label: "Feedback" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {isOrgAdmin ? "Organization Profile" : "My Profile"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isOrgAdmin
                  ? "Manage your organization account details and preferences"
                  : "Manage your account, preferences, and learning journey"}
              </p>
            </div>
            <div className="flex gap-2">
              {installPrompt && (
                <Button variant="outline" onClick={handleInstallClick} className="gap-2">
                  <Download className="h-4 w-4" />
                  Install App
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Hero Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-3xl" />
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className={`h-48 bg-gradient-to-r ${getPlanColor()}`} />
            <div className="relative px-6 pb-6">
              <div className="absolute left-6 -top-12">
                <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {formData.mName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="pt-16 pl-36">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold">{formData.mName}</h2>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    isExpired 
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : activeType !== "free"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  }`}>
                    {!loadingUser && getPlanIcon()}
                    <span>
                      {loadingUser
                        ? "Loading plan..."
                        : isExpired 
                        ? "Expired Plan" 
                        : activeType !== "free" 
                        ? `${activeType === "monthly" ? "Monthly" : "Yearly"} Pro` 
                        : "Free Member"}
                    </span>
                  </div>
                </div>
                {/* <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Member since {fullDate}
                </p> */}
                {formData.bio && (
                  <p className="text-sm text-muted-foreground mt-2 max-w-md">{formData.bio}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {!isOrgAdmin && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { icon: BookOpen, label: "Courses", value: stats.courses, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
              { icon: Award, label: "Certificates", value: stats.certifications, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
              { icon: Target, label: "Completed", value: stats.completed || 0, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
              { icon: Ticket, label: "Tickets", value: stats.tickets, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className={`${stat.bg} rounded-xl p-4 text-center transition-all hover:scale-105 cursor-pointer`}
              >
                <stat.icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs defaultValue="account" className="w-full" onValueChange={setActiveTab}>
            <TabsList className={`grid w-full mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl ${isOrgAdmin ? "grid-cols-4" : "grid-cols-5"}`}>
              {profileTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm rounded-lg py-2 transition-all"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account">
              <Card className="rounded-xl shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      {isOrgAdmin ? "Organization Information" : "Personal Information"}
                    </CardTitle>
                    <CardDescription>
                      {isOrgAdmin
                        ? "Manage your organization details and preferences"
                        : "Manage your personal details and preferences"}
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" onClick={() => { setOriginalData(formData); setIsEditing(true); }}>
                      <PenLine className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                  
                    <div className="space-y-6">
                      {/* Basic Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
    <CircleUser className="h-4 w-4" />
    {isOrgAdmin ? "Organization Name" : "Full Name"} <span className="text-red-500 ml-1">*</span>
</Label>
                          <Input
                            name="mName"
                            value={formData.mName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="transition-all focus:ring-2 focus:ring-blue-500"
                          /> {errors.mName && (
    <p className="text-red-500 text-xs mt-1">
      {errors.mName}
    </p>
  )}
                          
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
    <Mail className="h-4 w-4" />
    Email Address <span className="text-red-500 ml-1">*</span>
</Label>
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="transition-all focus:ring-2 focus:ring-blue-500"
                          />  {errors.email && (
    <p className="text-red-500 text-xs mt-1">
      {errors.email}
    </p>
  )}
                        </div>
                        <div className="space-y-2">
  <Label className="flex items-center gap-2">
    <Phone className="h-4 w-4" />
    Phone Number <span className="text-red-500 ml-1">*</span>
</Label>

  <div className="flex gap-2">
    
    {/* Country */}
    <select
      value={selectedCountry.code}
      onChange={(e) => {
        const country = countries.find(c => c.code === e.target.value);
        setSelectedCountry(country);
        setFormData(prev => ({ ...prev, phone: "" }));
      }}
      disabled={!isEditing}
      className="h-10 rounded-md border px-3 text-sm"
    >
      {countries.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name} ({c.code})
        </option>
      ))}
    </select>

    {/* Phone */}
    <Input
      value={formData.phone}
      onChange={(e) => {
        const value = e.target.value
          .replace(/\D/g, "")
          .slice(0, selectedCountry.length);

        setFormData(prev => ({ ...prev, phone: value }));
      }}
      placeholder={`Enter ${selectedCountry.length} digits`}
      disabled={!isEditing}
      className="flex-1"
    />

  </div>
    {/* ✅ CORRECT PLACE */}
  {errors.phone && (
    <p className="text-red-500 text-xs mt-1">
      {errors.phone}
    </p>
  )}
</div>
                        <div className="space-y-2">
                        <Label>Date of Birth <span className="text-xs text-muted-foreground ml-1">(optional)</span></Label>
                          <Input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="transition-all focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                       <Label>Gender <span className="text-red-500 ml-1">*</span></Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                            disabled={!isEditing}
                          >
                            
                            <SelectTrigger className="transition-all focus:ring-2 focus:ring-blue-500">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.gender && (
  <p className="text-red-500 text-xs mt-1">
    {errors.gender}
  </p>
)}
                        </div>
                        <div className="space-y-2">
  <Label>
    New Password <span className="text-xs text-muted-foreground ml-1">(optional)</span>
  </Label>
  <Input
    name="password"
    type="password"
    value={formData.password}
    onChange={handleChange}
    disabled={!isEditing}
    placeholder="Leave blank to keep current"
    className={`transition-all focus:ring-2 ${
      errors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
    }`}
  />
  {errors.password && (
    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
  )}
  {formData.password && !errors.password && (
    <p className="text-green-600 text-xs mt-1">
      Password strength: <strong>{getPasswordStrength(formData.password)}</strong>
    </p>
  )}
</div>
  </div>

                      {/* Bio */}
                      <div className="space-y-2">
                      <Label>Bio <span className="text-xs text-muted-foreground ml-1">(optional)</span></Label>
                        <Textarea
                          name="bio"
                          value={formData.bio}
                     onChange={(e) => {
  const value = e.target.value.slice(0, 200);
  setFormData(prev => ({ ...prev, bio: value }));
}}
                          disabled={!isEditing}
                          placeholder="Tell us a little about yourself..."
                          rows={3}
                          className="transition-all focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Location */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                     <Label>Country <span className="text-xs text-muted-foreground ml-1">(optional)</span></Label>
                            <Input
                              name="country"
                              value={formData.country}
                              onChange={handleChange}
                              disabled={!isEditing}
                              className="transition-all focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                          <Label>State <span className="text-xs text-muted-foreground ml-1">(optional)</span></Label>
                            <Input
                              name="state"
                              value={formData.state}
                              onChange={handleChange}
                              disabled={!isEditing}
                              className="transition-all focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                          <Label>City <span className="text-xs text-muted-foreground ml-1">(optional)</span></Label>
                            <Input
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              disabled={!isEditing}
                              className="transition-all focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                           <Label>PIN Code <span className="text-xs text-muted-foreground ml-1">(optional)</span></Label>
                            <Input
                              name="pin"
                              value={formData.pin}
                            onChange={(e) => {
  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
  setFormData(prev => ({ ...prev, pin: value }));
}}
                              disabled={!isEditing}
                              placeholder="e.g. 600001"
                              className="transition-all focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                          <Label>Address <span className="text-xs text-muted-foreground ml-1">(optional)</span></Label>
                            <Input
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              disabled={!isEditing}
                              placeholder="Street, Area, Landmark"
                              className="transition-all focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* User Type Section */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Professional Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>User Type</Label>
                            <Select value={formData.userType} disabled={true}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select user type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="individual">Individual</SelectItem>
                                <SelectItem value="organization">Organization</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
{formData.userType === "individual" && (
    <>
        <div className="space-y-2">
            <Label>Profession <span className="text-red-500 ml-1">*</span></Label>
           <Input
  name="profession"
  value={formData.profession}
  onChange={handleChange}
  disabled={!isEditing}
  placeholder="e.g. Software Developer"
  className="transition-all focus:ring-2 focus:ring-blue-500"
/>

{errors.profession && (
  <p className="text-red-500 text-xs mt-1">
    {errors.profession}
  </p>
)}
        </div>
        <div className="space-y-2">
            <Label>Experience Level <span className="text-xs text-muted-foreground ml-1">(optional)</span></Label>
            <Select
                value={formData.experienceLevel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
                disabled={!isEditing}
            >
                <SelectTrigger className="transition-all focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </>
)}

{formData.userType === "organization" && (
    <div className="space-y-2">
        <Label>Organization Name <span className="text-red-500 ml-1">*</span></Label>
        <Input
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="Company / Institute name"
            className="transition-all focus:ring-2 focus:ring-blue-500"
        />
    </div>
)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {isEditing && (
                        <div className="flex gap-3 justify-end pt-6 border-t">
                          <Button type="submit" disabled={processing} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            {processing && <Loader className="animate-spin h-4 w-4" />}
                            <Save className="h-4 w-4" />
                            {processing ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => { setFormData(originalData); setIsEditing(false); }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="rounded-xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-500" />
                    Preferences & Notifications
                  </CardTitle>
               <CardDescription>
    Manage your personal details and preferences.{" "}
    Fields marked <span className="text-red-500 font-medium">*</span> are required.
</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notification Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notification Preferences
                    </h3>
                    {[
                      { key: "mail", label: "Email Notifications", desc: "Receive email updates about your courses and account" },
                      { key: "payments", label: "Payment Alerts", desc: "Get notified about subscription renewals and billing" },
                      { key: "chat", label: "Chat Notifications", desc: "Receive notifications from the course assistant" },
                      { key: "marketing", label: "Marketing Updates", desc: "Get updates about new courses and features" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between rounded-lg border p-4 transition-all hover:shadow-sm">
                        <div>
                          <Label className="font-medium">{item.label}</Label>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch
                          checked={notifications[item.key]}
                          disabled={savingSettings}
                          onCheckedChange={() => handleToggle(item.key as keyof typeof notifications)}
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Danger Zone */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-red-500 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Danger Zone
                    </h3>
                    <div className="flex items-center justify-between rounded-lg border border-red-200 p-4 bg-red-50/30 dark:bg-red-900/10">
                      <div>
                        <Label className="font-medium">Request Account Deletion</Label>
                        <p className="text-sm text-muted-foreground">
                          Submit a request to permanently remove your account. An admin will review and process it.
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Request Deletion
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Account Deletion</DialogTitle>
                            <DialogDescription>
                              Your account will not be deleted immediately. An admin will review your request.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3 py-2">
                            <Label htmlFor="deletion-reason">Reason (optional)</Label>
                            <Input
                              id="deletion-reason"
                              placeholder="Why do you want to delete your account?"
                              value={deletionReason}
                              onChange={(e) => setDeletionReason(e.target.value)}
                            />
                          </div>
                          <DialogFooter>
                            <DialogTrigger asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogTrigger>
                            <Button onClick={() => requestDeletion(deletionReason)} variant="destructive" disabled={requestingDeletion}>
                              {requestingDeletion && <Loader className="animate-spin mr-2 h-4 w-4" />}
                              Submit Request
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            {!isOrgAdmin && <TabsContent value="billing">
              <Card className="rounded-xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                    Subscription & Billing
                  </CardTitle>
                  <CardDescription>Manage your subscription plan and payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader className="animate-spin h-8 w-8 text-blue-500" />
                    </div>
                  ) : activeType === "free" ? (
                    <div className="text-center py-8">
                      <Sparkles className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Free Plan</h3>
                      <p className="text-muted-foreground mb-6">
                        {activePlan?.currency} {activePlan?.price} / 7 days
                      </p>
                      <Button onClick={redirectPricing} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                        Upgrade to Pro
                        <Rocket className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className={`p-6 rounded-xl bg-gradient-to-r ${getPlanColor()}`}>
                        <div className="flex items-center gap-2 text-white mb-2">
                          <Crown className="h-6 w-6" />
                          <h3 className="text-xl font-semibold">{activePlan?.name} Plan</h3>
                        </div>
                        <p className="text-white/90 text-2xl font-bold mb-4">
                          {activePlan?.currency} {activePlan?.price} / {activePlan?.planType === "monthly" ? "month" : "year"}
                        </p>
                        <ul className="space-y-2 text-white/90">
                          {activePlan?.features.map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {subscriptionEnd && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">Your subscription will renew on:</p>
                          <p className="font-semibold">{new Date(subscriptionEnd).toLocaleDateString()}</p>
                        </div>
                      )}
                      <Button variant="destructive" onClick={cancelSubscription} disabled={processingCancel} className="w-full">
                        {processingCancel && <Loader className="animate-spin mr-2 h-4 w-4" />}
                        Cancel Subscription
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>}

            {/* Social Tab */}
            <TabsContent value="social">
              <Card className="rounded-xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    Social Connections
                  </CardTitle>
                  <CardDescription>Connect your social profiles to enhance your learning network</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { platform: "linkedin", icon: Linkedin, color: "text-blue-600", placeholder: "https://linkedin.com/in/username" },
                    { platform: "twitter", icon: Twitter, color: "text-blue-400", placeholder: "https://twitter.com/username" },
                    { platform: "github", icon: "Github", color: "text-gray-800 dark:text-gray-200", placeholder: "https://github.com/username" },
                    { platform: "website", icon: Globe, color: "text-green-600", placeholder: "https://yourwebsite.com" },
                  ].map((social) => (
                    <div key={social.platform} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                      <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${social.color}`}>
                        {social.icon === "Github" ? (
                          <span className="text-xl font-bold">GH</span>
                        ) : (
                          <social.icon className="h-5 w-5" />
                        )}
                      </div>
                     <div className="flex-1">
  <Label className="capitalize">{social.platform}</Label>

  <Input
    value={socialLinks[social.platform]}
    onChange={(e) => handleSocialChange(social.platform, e.target.value)}
    placeholder={social.placeholder}
    disabled={!isEditing}
    className={`mt-1 ${
      errors[social.platform] ? "border-red-500" : ""
    }`}
  />

  {/* ✅ ADD THIS BACK */}
  {errors[social.platform] && (
    <p className="text-red-500 text-xs mt-1">
      {errors[social.platform]}
    </p>
  )}
</div>
                    </div>
                  ))}
                  {!isEditing && (
                    <Button variant="outline" onClick={() => { setOriginalData(formData); setIsEditing(true); }} className="w-full">
                      <PenLine className="mr-2 h-4 w-4" />
                      Edit Social Links
                    </Button>
                  )}
                  {isEditing && (
                    <div className="flex gap-3 justify-end pt-4">
                <Button
  type="button"
  onClick={() => {
   if (validateSocialForm()) {
  handleSubmit({ preventDefault: () => {} } as any);
}
  }}
>
                        <Save className="h-4 w-4" />
                        Save Social Links
                      </Button>
                      <Button variant="outline" onClick={() => { setIsEditing(false); }}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Testimonial Tab */}
            <TabsContent value="testimonial">
              <Card className="rounded-xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Share Your Experience
                  </CardTitle>
                  <CardDescription>Help others by sharing your learning journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <TestimonialSubmission />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
