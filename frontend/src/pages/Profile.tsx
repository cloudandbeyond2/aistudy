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
import { PenLine, Save, ShieldCheck, CreditCard, Loader,User, Settings, MessageSquare  } from "lucide-react";
import { MonthCost, MonthType, serverURL, YearCost, websiteURL } from '@/constants';
import axios from 'axios';
import { DownloadIcon, TrashIcon } from '@radix-ui/react-icons';
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

const PLAN_ORDER: Record<string, number> = {
  free: 0,
  monthly: 1,
  yearly: 2,
};

const PLAN_FEATURES: Record<string, string[]> = {
  free: ["Basic access"],
  monthly: ["All features", "Priority support"],
  yearly: ["All features", "Priority support", "Discounted price"],
};

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
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
  city: sessionStorage.getItem('city') || "",
  pin: sessionStorage.getItem('pin') || "",
  address: sessionStorage.getItem('address') || "",
});


const [originalData, setOriginalData] = useState(formData);



// const [currentDate, setCurrentDate] = useState(new Date());

// useEffect(() => {
//   const timer = setInterval(() => {
//     setCurrentDate(new Date());
//   }, 1000); // updates every second

//   return () => clearInterval(timer);
// }, []);


const [plans, setPlans] = useState<any[]>([]);
const [activeType, setActiveType] = useState<"free" | "monthly" | "yearly">("free");
const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

const [loadingUser, setLoadingUser] = useState(true);
const [loadingPlans, setLoadingPlans] = useState(true);

const loading = loadingUser || loadingPlans;

const activePlan = plans.find(
  (plan) => plan.planType === activeType
);


  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const [processingDelete, setProcessingDelete] = useState(false);
  const [processingCancel, setProcessingCancel] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [method, setMethod] = useState('');
  const [cost, setCost] = useState('');
  const [plan, setPlan] = useState('');
  const [jsonData, setJsonData] = useState({});

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    })
  }, []);



  // star bala
 const currentDate = new Date();
  const currentDay = currentDate.getDay(); // 0 = Sunday, 1 = Monday ...


  const days = [
    { label: "Sun", value: 0 },
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
  ];
    const fullDate = currentDate.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
useEffect(() => {
  const email = sessionStorage.getItem("email");
  if (!email) {
    setLoadingUser(false);
    return;
  }

  axios.get(`${serverURL}/api/getusers`)
    .then((res) => {
      const currentUser = res.data.find((u: any) => u.email === email);

      if (
        currentUser?.subscriptionEnd &&
        new Date(currentUser.subscriptionEnd) > new Date()
      ) {
        setActiveType(currentUser.type); // monthly | yearly
        setSubscriptionEnd(currentUser.subscriptionEnd);
      } else {
        setActiveType("free");
        setSubscriptionEnd(null);
      }
    })
    .catch(() => {
      setActiveType("free");
    })
    .finally(() => {
      setLoadingUser(false);
    });
}, []);


  /* ---------------- GET PRICING ---------------- */
  useEffect(() => {
  axios.get(`${serverURL}/api/pricing`)
    .then((res) => {
      const formatted = res.data.pricing.map((p: any) => ({
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
      }));

      formatted.sort(
        (a: any, b: any) => PLAN_ORDER[a.planType] - PLAN_ORDER[b.planType]
      );

      setPlans(formatted);
    })
    .catch(console.error)
    .finally(() => {
      setLoadingPlans(false);
    });
}, []);







  function redirectPricing() {
    navigate("/dashboard/pricing");
  }

  async function deleteProfile() {
    if (sessionStorage.getItem('adminEmail') === sessionStorage.getItem('email')) {
      toast({
        title: "Access Denied",
        description: "Admin profile cannot be deleted."
      });
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
        toast({
          title: "Profile Deleted",
          description: "Your profile has been deleted successfully"
        });
        setProcessingDelete(false);
        redirectLogin();
      } else {
        setProcessingDelete(false);
        toast({
          title: "Error",
          description: response.data.message,
        });
      }
    } catch (error) {
      setProcessingDelete(false);
      console.error(error);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
    }
  }

  const handleInstallClick = () => {
    if (!installPrompt) return
    installPrompt.prompt()
    installPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('User accepted install')
      }
      setInstallPrompt(null)
    })
  }

useEffect(() => {
  async function fetchProfile() {
    const uid = sessionStorage.getItem('uid');
    if (!uid) return;

    try {
      const response = await axios.get(`${serverURL}/api/getuser/${uid}`);
      if (response.data.success) {
        const user = response.data.user;

        // Update form data with fetched user info
        setFormData({
          mName: user.mName || "",
          email: user.email || "",
          phone: user.phone || "",
          dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
          password: "",
          role: user.role || "",
          userType: user.userType || "",
          profession: user.profession || "",
          experienceLevel: user.experienceLevel || "beginner",
          organizationName: user.organizationName || "",

          gender: user.gender || "",
          country: user.country || "",
          city: user.city || "",
          pin: user.pin || "",
          address: user.address || "",
        });

        // Update sessionStorage if needed
        sessionStorage.setItem('mName', user.mName || "");
        sessionStorage.setItem('email', user.email || "");
        sessionStorage.setItem('role', user.role);
        sessionStorage.setItem('userType', user.userType || "");
        sessionStorage.setItem('dob', user.dob || "");
        sessionStorage.setItem('gender', user.gender || "");
        sessionStorage.setItem('phone', user.phone || "");
        sessionStorage.setItem('country', user.country || "");
        sessionStorage.setItem('city', user.city || "");
        sessionStorage.setItem('pin', user.pin || "");
        sessionStorage.setItem('address', user.address || "");
        sessionStorage.setItem('profession', user.profession || "");
        sessionStorage.setItem('organizationName', user.organizationName || "");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast({
        title: "Error",
        description: "Failed to fetch profile data."
      });
    }
  }

  fetchProfile();
}, []);


const handleSubmit = async () => {
  if (!formData.mName || !formData.email) {
    toast({
      title: "Couldn't update profile",
      description: "Please fill in all required fields."
    });
    return;
  }

  setProcessing(true);

  const uid = sessionStorage.getItem("uid");
  const postURL = serverURL + "/api/profile";

  try {
    const response = await axios.post(postURL, {
      uid,

      // BASIC
      mName: formData.mName,
      email: formData.email,
      password: formData.password,

      // PROFILE
      phone: formData.phone,
      dob: formData.dob || null,
      gender: formData.gender,

      // LOCATION
      country: formData.country,
      city: formData.city,
      pin: formData.pin,
      address: formData.address,

      // USER TYPE
      userType: formData.userType,
      // CONDITIONAL
      profession:
        formData.userType === "individual" ? formData.profession : "",
      experienceLevel:
        formData.userType === "individual"
          ? formData.experienceLevel
          : "beginner",
      organizationName:
        formData.userType === "organization"
          ? formData.organizationName
          : "",
    });

    if (response.data.success) {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      });

      sessionStorage.setItem("mName", formData.mName);
      sessionStorage.setItem("email", formData.email);
      sessionStorage.setItem("userType", formData.userType);
      sessionStorage.setItem("dob", formData.dob);
      sessionStorage.setItem("gender", formData.gender);
      sessionStorage.setItem("phone", formData.phone);
      sessionStorage.setItem("country", formData.country);
      sessionStorage.setItem("city", formData.city);
      sessionStorage.setItem("pin", formData.pin);
      sessionStorage.setItem("address", formData.address);
      sessionStorage.setItem("profession", formData.profession);
      sessionStorage.setItem("organizationName", formData.organizationName);
      setIsEditing(false);
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Internal Server Error"
    });
  } finally {
    setProcessing(false);
  }
};

  async function getDetails() {
    if (sessionStorage.getItem('type') !== 'free') {
      const dataToSend = {
        uid: sessionStorage.getItem('uid'),
        email: sessionStorage.getItem('email'),
      };
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
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
      }
    }
  }

  async function cancelSubscription() {
    setProcessingCancel(true);
    const dataToSend = {
      id: jsonData.id,
      email: sessionStorage.getItem('email')
    };
    try {
      if (method === 'stripe') {
        const postURL = serverURL + '/api/stripecancel';
        await axios.post(postURL, dataToSend).then(res => {
          setProcessingCancel(false);
          toast({
            title: "Subscription Cancelled",
            description: "Your subscription has been cancelled.",
          });
          sessionStorage.setItem('type', 'free');
          window.location.href = websiteURL + '/dashboard/profile';
        });
      } else if (method === 'paypal') {
        const postURL = serverURL + '/api/paypalcancel';
        await axios.post(postURL, dataToSend).then(res => {
          setProcessingCancel(false);
          toast({
            title: "Subscription Cancelled",
            description: "Your subscription has been cancelled.",
          });
          sessionStorage.setItem('type', 'free');
          window.location.href = websiteURL + '/dashboard/profile';
        });
      } else if (method === 'paystack') {
        const dataToSends = {
          code: jsonData.subscription_code,
          token: jsonData.email_token,
          email: sessionStorage.getItem('email')
        };
        const postURL = serverURL + '/api/paystackcancel';
        await axios.post(postURL, dataToSends).then(res => {
          setProcessingCancel(false);
          toast({
            title: "Subscription Cancelled",
            description: "Your subscription has been cancelled.",
          });
          sessionStorage.setItem('type', 'free');
          window.location.href = websiteURL + '/dashboard/profile';
        });

      }
      else if (method === 'flutterwave') {
        const dataToSends = {
          code: jsonData.id,
          token: jsonData.plan,
          email: sessionStorage.getItem('email')
        };
        const postURL = serverURL + '/api/flutterwavecancel';
        await axios.post(postURL, dataToSends).then(res => {
          setProcessingCancel(false);
          toast({
            title: "Subscription Cancelled",
            description: "Your subscription has been cancelled.",
          });
          sessionStorage.setItem('type', 'free');
          window.location.href = websiteURL + '/dashboard/profile';
        });
      }
      else {
        const postURL = serverURL + '/api/razorpaycancel';
        await axios.post(postURL, dataToSend).then(res => {
          setProcessingCancel(false);
          toast({
            title: "Subscription Cancelled",
            description: "Your subscription has been cancelled.",
          });
          sessionStorage.setItem('type', 'free');
          window.location.href = websiteURL + '/dashboard/profile';
        });
      }
    } catch (error) {
      setProcessingCancel(false);
      console.error(error);
    }
  }

//   return (
//     // <div className="container max-w-4xl mx-auto py-6">
//   <div className="space-y-8 animate-fade-in">
    
//         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-indigo-500">My Profile</h1>
//             {/* <p className="text-muted-foreground mt-1">Continue learning where you left off</p> */}
//           </div>
//             {/* RIGHT */}
//             {/* Star bala */}
//   <div className="flex gap-3">
    

// <Button
//           variant={isEditing ? "default" : "outline"}
//           disabled={processing}
//           onClick={() => {
//             if (isEditing) {
//               handleSubmit();
//             } else {
//               setIsEditing(true);
//             }
//           }}
//         >
//           <>
//             {processing ? <Loader className="animate-spin mr-2 h-4 w-4" /> : <></>}
//             {isEditing ? (
//               <>
//                 <Save className="mr-2 h-4 w-4" />{processing ? 'Saving...' : 'Save'}
//               </>
//             ) : (
//               <>
//                 <PenLine className="mr-2 h-4 w-4" /> Edit Profile
//               </>
//             )}
//           </>
//         </Button>


//   </div>
//         </div>

//       <div className="container max-w-4xl mx-auto py-6">
    

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Profile Summary Card */}
//         <Card className="border border-emerald-400 rounded-xl h-[300px]">
//              <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
//             <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold">
//               {formData.mName.charAt(0).toUpperCase()}
//             </div>
//              <h2 className="text-lg font-semibold">{formData.mName}</h2>
//             <p className="text-sm text-muted-foreground">{formData.email}</p>

//             {/* <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
//               User
//             </span> */}

//             {/* <Separator />
//           </CardContent>
//           <CardContent> */}
//             <div className="space-y-4">


//               <Separator />

              // <div>
              //   <h3 className="font-medium text-sm text-muted-foreground mb-2">Account Status</h3>
              //   {sessionStorage.getItem('type') !== 'free' ?
              //     <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs rounded px-2 py-1 inline-flex items-center">
              //       <ShieldCheck className="h-3 w-3 mr-1" />
              //       Active Paid Plan
              //     </div>
              //     :
              //     <div className="bg-gray-200 dark:gray-700 text-black dark:text-black text-xs rounded px-2 py-1 inline-flex items-center">
              //       <ShieldCheck className="h-3 w-3 mr-1" />
              //       Active Free Plan
              //     </div>
              //   }
              // </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Tabs for Settings */}
//         <Card className="md:col-span-2">
//           <CardContent className="p-0">
//             <Tabs defaultValue="account" className="w-full">
//               <TabsList className="grid w-full grid-cols-4">
//                 <TabsTrigger value="account">Account</TabsTrigger>
//                 <TabsTrigger value="notifications">Settings</TabsTrigger>
//                 <TabsTrigger onClick={() => getDetails()} value="billing">Billing</TabsTrigger>
//                 <TabsTrigger value="testimonial">Testimonial</TabsTrigger>
//               </TabsList>

//              <TabsContent value="account" className="p-6">
//   <form onSubmit={handleSubmit}>
//     <div className="space-y-6">

//       {/* NAME + EMAIL */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="name">Full Name</Label>
//           <Input
//             id="mName"
//             name="mName"
//             value={formData.mName}
//             onChange={handleChange}
//             disabled={!isEditing}
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="email">Email</Label>
//           <Input
//             id="email"
//             name="email"
//             type="email"
//             value={formData.email}
//             onChange={handleChange}
//             disabled={!isEditing}
//           />
//         </div>
//       </div>

//       {/* PASSWORD */}
//       <div className="space-y-2">
//         <Label htmlFor="password">New Password</Label>
//         <Input
//           id="password"
//           name="password"
//           type="password"
//           value={formData.password}
//           onChange={handleChange}
//           disabled={!isEditing}
//         />
//       </div>

//       {/* DOB + PHONE */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label>Date of Birth</Label>
//           <Input
//             type="date"
//             name="dob"
//             value={formData.dob}
//             onChange={handleChange}
//             disabled={!isEditing}
//           />
//         </div>

//         <div className="space-y-2">
//           <Label>Phone Number</Label>
//           <Input
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//             disabled={!isEditing}
//             placeholder="+91 XXXXX XXXXX"
//           />
//         </div>
//       </div>

//       {/* GENDER */}
//       <div className="space-y-2">
//         <Label>Gender</Label>
//         <Select
//           value={formData.gender}
//           onValueChange={(value) =>
//             setFormData((prev) => ({ ...prev, gender: value }))
//           }
//           disabled={!isEditing}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select gender" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="male">Male</SelectItem>
//             <SelectItem value="female">Female</SelectItem>
//             <SelectItem value="other">Other</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* LOCATION */}
//       <div className="space-y-4">
//         <div className="space-y-2">
//           <Label>Country</Label>
//           <Input
//             name="country"
//             value={formData.country}
//             onChange={handleChange}
//             disabled={!isEditing}
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label>City</Label>
//             <Input
//               name="city"
//               value={formData.city}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label>PIN Code</Label>
//             <Input
//               name="pin"
//               value={formData.pin}
//               onChange={handleChange}
//               disabled={!isEditing}
//               placeholder="e.g. 600001"
//               inputMode="numeric"
//               maxLength={6}
//             />
//           </div>
//         </div>

//         <div className="space-y-2">
//           <Label>Address</Label>
//           <Input
//             name="address"
//             value={formData.address}
//             onChange={handleChange}
//             disabled={!isEditing}
//             placeholder="Street, Area, Landmark"
//           />
//         </div>
//       </div>

//       {/* USER TYPE */}
//       <div className="space-y-2">
//         <Label>User Type</Label>
//         <Select
//           value={formData.userType}
//           onValueChange={(value) =>
//             setFormData((prev) => ({ ...prev, userType: value }))
//           }
//           disabled={!isEditing}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select user type" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="individual">Individual</SelectItem>
//             <SelectItem value="organization">Organization</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* INDIVIDUAL */}
//       {formData.userType === "individual" && (
//         <>
//           <div className="space-y-2">
//             <Label>Profession</Label>
//             <Input
//               name="profession"
//               value={formData.profession}
//               onChange={handleChange}
//               disabled={!isEditing}
//               placeholder="e.g. Software Developer"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label>Experience Level</Label>
//             <Select
//               value={formData.experienceLevel}
//               onValueChange={(value) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   experienceLevel: value,
//                 }))
//               }
//               disabled={!isEditing}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select experience level" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="beginner">Beginner</SelectItem>
//                 <SelectItem value="intermediate">Intermediate</SelectItem>
//                 <SelectItem value="advanced">Advanced</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </>
//       )}

//       {/* ORGANIZATION */}
//       {formData.userType === "organization" && (
//         <div className="space-y-2">
//           <Label>Organization Name</Label>
//           <Input
//             name="organizationName"
//             value={formData.organizationName}
//             onChange={handleChange}
//             disabled={!isEditing}
//             placeholder="Company / Institute name"
//           />
//         </div>
//       )}

//     </div>
//   </form>
// </TabsContent>


              // <TabsContent value="notifications" className="p-6">
              //   <div className="space-y-4">
              //     <h3 className="text-lg font-medium">Settings</h3>

              //     <div className="space-y-4">
              //       {installPrompt && (
              //         <>
              //           <div className="flex items-center justify-between">
              //             <div className="space-y-0.5">
              //               <Label htmlFor="course-updates">Desktop App</Label>
              //               <p className="text-sm text-muted-foreground">Download the desktop application for Windows and Mac</p>
              //             </div>
              //             <Button onClick={handleInstallClick}><DownloadIcon /> Download</Button>
              //           </div>
              //           <Separator />
              //         </>
              //       )
              //       }

              //       <div className="flex items-center justify-between">
              //         <div className="space-y-0.5">
              //           <Label htmlFor="marketing">Delete Profile</Label>
              //           <p className="text-sm text-muted-foreground">Permanently remove profile and all associated data</p>
              //         </div>
              //         <Dialog>
              //           <DialogTrigger><Button className='bg-red-500 hover:bg-red-600'><TrashIcon /> Delete</Button></DialogTrigger>
              //           <DialogContent>
              //             <DialogHeader>
              //               <DialogTitle>Are you sure you want to delete your profile?</DialogTitle>
              //               <DialogDescription>
              //                 This action cannot be undone. This will permanently delete your account
              //                 and remove your data.
              //               </DialogDescription>
              //             </DialogHeader>
              //             <DialogFooter>
              //               <DialogTrigger asChild>
              //                 <Button
              //                   variant="outline"
              //                   className="w-40"
              //                 >
              //                   No
              //                 </Button>
              //               </DialogTrigger>
              //               <Button onClick={deleteProfile} className='bg-red-500 hover:bg-red-600 w-40'>{processingDelete ? <Loader className="animate-spin mr-2 h-4 w-4" /> : <></>}{processingDelete ? 'Deleting...' : 'Delete'}</Button>
              //             </DialogFooter>
              //           </DialogContent>
              //         </Dialog>
              //       </div>

              //     </div>
              //   </div>
              // </TabsContent>


//             <TabsContent value="billing" className="p-6">
//   <div className="space-y-4">
//     <h3 className="text-lg font-medium">Subscription Plan</h3>

//     {loading ? (
//       <p>Loading...</p>
//     ) : activeType === "free" ? (
//       /* FREE PLAN */
//       <Card>
//         <CardHeader>
//           <CardTitle>Free Plan</CardTitle>
//           <CardDescription>
//              {activePlan.currency}  {activePlan.price} /{" "} 7 days
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <p className="text-sm text-muted-foreground">
//             This plan is completely free and does not expire.
//           </p>
//         </CardContent>
//         <CardFooter>
//           <Button size="sm" onClick={redirectPricing}>
//             Upgrade Plan
//           </Button>
//         </CardFooter>
//       </Card>
//     ) : activePlan ? (
//       /* PAID PLAN */
//       <Card>
//         <CardHeader>
//           <CardTitle>{activePlan.name} Plan</CardTitle>
//           <CardDescription>
//             {activePlan.currency} {activePlan.price} /{" "}
//             {activePlan.planType === "monthly" ? "month" : "year"}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <p className="text-sm text-muted-foreground">
//             Your subscription is active.
//           </p>
//         </CardContent>
//       </Card>
//     ) : null}
//   </div>
// </TabsContent>


              
//               <TabsContent value="testimonial" className="p-6">
//                 <TestimonialSubmission />
//               </TabsContent>

//             </Tabs>
//           </CardContent>
//         </Card>

//       </div>
//       </div>
      
//     </div>
//   );

return (
  <div className="space-y-6 animate-fade-in">

    {/* ================= HEADER BAR ================= */}
   <Card className="shadow-md rounded-2xl border bg-background">
  <CardContent className="p-6">

    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

      {/* Left Section */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          User Profile
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

    </div>

  </CardContent>
</Card>


    {/* ================= COVER SECTION ================= */}
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

      {/* Cover */}
      <div className="h-64 bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-400" />

      {/* Profile Info */}
      <div className="relative px-6 pb-6">

        {/* Avatar */}
        <div className="absolute left-1/2 -top-14 -translate-x-1/2">
          <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            {formData.mName?.charAt(0)?.toUpperCase()}
          </div>
        </div>

        <div className="pt-16 text-center">
          <h3 className="text-lg font-semibold">{formData.mName}</h3>
        {sessionStorage.getItem('type') !== 'free' ?
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs rounded px-2 py-1 inline-flex items-center">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Active Paid Plan
                  </div>
                  :
                  <div className="bg-gray-200 dark:gray-700 text-black dark:text-black text-xs rounded px-2 py-1 inline-flex items-center">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Active Free Plan
                  </div>
                }
        </div>

      <div className="flex items-center gap-2 justify-end">
      {days.map((day, index) => {
        const isToday = currentDay === day.value;

        return (
          <div key={index} className="relative group">
            {/* Day Circle */}
            <div
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold cursor-pointer transition-all
                ${
                  isToday
                    ? "bg-indigo-600 text-white shadow-md scale-110"
                    : "bg-gray-100 text-gray-600 hover:bg-indigo-100"
                }
              `}
            >
              {day.label}
            </div>

            {/* Tooltip */}
            {isToday && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200">
                {fullDate}
              </div>
            )}
          </div>
        );
      })}
    </div>

      </div>
    </div>

    {/* ================= MAIN 2 COLUMN SECTION ================= */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ========== LEFT INTRODUCTION CARD ========== */}
      <Card className="rounded-2xl shadow-sm" style={{height: "fit-content"}}>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Introduction</h3>
          <p className="text-sm text-muted-foreground">
            Hello, I am {formData.mName}.
          </p>

          <Separator />

          <div className="space-y-2 text-sm">
            <p>🏫 {formData.organizationName || "Institute Name"}</p>
            <p>📧 {formData.email}</p>
            <p>📍 {formData.city}, {formData.country}</p>
          </div>
          
        </CardContent>
      </Card>

      {/* ========== RIGHT CONTENT ========== */}
      <div className="lg:col-span-2 space-y-6">



        {/* ================= YOUR EXISTING TABS ================= */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-0">

      <Tabs
  defaultValue="account"
  className="w-full"
  onValueChange={(value) => {
    if (value === "billing") {
      getDetails();
    }
  }}
>

{/* ================= TAB HEADER ================= */}
<TabsList className="grid w-full grid-cols-4 border-b rounded-none bg-muted/30 p-1">

  <TabsTrigger
    value="account"
    className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg py-2 transition-all"
  >
    <User className="h-4 w-4" />
    <span>Account</span>
  </TabsTrigger>

  <TabsTrigger
    value="notifications"
    className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg py-2 transition-all"
  >
    <Settings className="h-4 w-4" />
    <span>Settings</span>
  </TabsTrigger>

  <TabsTrigger
    value="billing"
    className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg py-2 transition-all"
  >
    <CreditCard className="h-4 w-4" />
    <span>Billing</span>
  </TabsTrigger>

  <TabsTrigger
    value="testimonial"
    className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg py-2 transition-all"
  >
    <MessageSquare className="h-4 w-4" />
    <span>Testimonial</span>
  </TabsTrigger>

</TabsList>


  {/* ================= ACCOUNT TAB ================= */}
  <TabsContent value="account" className="p-6">
<div className="flex gap-3 mb-6 justify-end">
  {!isEditing ? (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        setOriginalData(formData); // store current data
        setIsEditing(true);
      }}
    >
      <PenLine className="mr-2 h-4 w-4" />
      Edit Profile
    </Button>
  ) : (
    <>
      {/* SAVE BUTTON */}
      <Button
        type="button"
        disabled={processing}
        onClick={handleSubmit}
      >
        {processing && (
          <Loader className="animate-spin mr-2 h-4 w-4" />
        )}
        <Save className="mr-2 h-4 w-4" />
        {processing ? "Saving..." : "Save"}
      </Button>

      {/* CANCEL BUTTON */}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setFormData(originalData); // restore old data
          setIsEditing(false);       // disable edit mode
        }}
      >
        Cancel
      </Button>
    </>
  )}
</div>


 <form onSubmit={handleSubmit}>
    <div className="space-y-6">

      {/* NAME + EMAIL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="mName"
            name="mName"
            value={formData.mName}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* PASSWORD */}
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          disabled={!isEditing}
        />
      </div>

      {/* DOB + PHONE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
      </div>

      {/* GENDER */}
      <div className="space-y-2">
        <Label>Gender</Label>
        <Select
          value={formData.gender}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, gender: value }))
          }
          disabled={!isEditing}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* LOCATION */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Country</Label>
          <Input
            name="country"
            value={formData.country}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label>PIN Code</Label>
            <Input
              name="pin"
              value={formData.pin}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. 600001"
              inputMode="numeric"
              maxLength={6}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Address</Label>
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="Street, Area, Landmark"
          />
        </div>
      </div>

      {/* USER TYPE */}
      <div className="space-y-2">
        <Label>User Type</Label>
        <Select
  value={formData.userType}
  disabled={true}   // ALWAYS readonly
>
          <SelectTrigger>
            <SelectValue placeholder="Select user type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="organization">Organization</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* INDIVIDUAL */}
      {formData.userType === "individual" && (
        <>
          <div className="space-y-2">
            <Label>Profession</Label>
            <Input
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. Software Developer"
            />
          </div>

          <div className="space-y-2">
            <Label>Experience Level</Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  experienceLevel: value,
                }))
              }
              disabled={!isEditing}
            >
              <SelectTrigger>
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

      {/* ORGANIZATION */}
      {formData.userType === "organization" && (
        <div className="space-y-2">
          <Label>Organization Name</Label>
          <Input
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="Company / Institute name"
          />
        </div>
      )}

    </div>
  </form>
  </TabsContent>

  {/* ================= SETTINGS TAB ================= */}
  <TabsContent value="notifications" className="p-6">
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Settings</h3>

      <div className="flex items-center justify-between">
        <div>
          <Label>Delete Profile</Label>
          <p className="text-sm text-muted-foreground">
            Permanently remove profile and all associated data
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-red-500 hover:bg-red-600">
              Delete
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Are you sure you want to delete your profile?
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-40">
                  Cancel
                </Button>
              </DialogTrigger>

              <Button
                onClick={deleteProfile}
                className="bg-red-500 hover:bg-red-600 w-40"
              >
                {processingDelete && (
                  <Loader className="animate-spin mr-2 h-4 w-4" />
                )}
                {processingDelete ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </TabsContent>

  {/* ================= BILLING TAB ================= */}
  <TabsContent value="billing" className="p-6">
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Subscription Plan
      </h3>

      {loading ? (
        <p>Loading...</p>
      ) : activeType === "free" ? (
        <Card>
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>
              {activePlan?.currency} {activePlan?.price} / 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This plan is completely free.
            </p>
          </CardContent>
          <CardFooter>
            <Button size="sm" onClick={redirectPricing}>
              Upgrade Plan
            </Button>
          </CardFooter>
        </Card>
      ) : activePlan ? (
        <Card>
          <CardHeader>
            <CardTitle>{activePlan.name} Plan</CardTitle>
            <CardDescription>
              {activePlan.currency} {activePlan.price} /
              {activePlan.planType === "monthly"
                ? " month"
                : " year"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your subscription is active.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  </TabsContent>

  {/* ================= TESTIMONIAL TAB ================= */}
  <TabsContent value="testimonial" className="p-6">
    <TestimonialSubmission />
  </TabsContent>
</Tabs>


          </CardContent>
        </Card>

      </div>
    </div>

  </div>
);

};

export default Profile;