// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-nocheck
// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from '@/components/ui/button';
// import { toast } from "@/hooks/use-toast";
// import { 
//   PenLine, Save, Loader, User, Mail, Phone, MapPin, CircleUser
// } from "lucide-react";
// import { serverURL } from '@/constants';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { motion } from 'framer-motion';

// const StudentProfile = () => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [activeTab, setActiveTab] = useState("account");
//   const [processing, setProcessing] = useState(false);

//   const [formData, setFormData] = useState({
//     mName: sessionStorage.getItem('mName') || "",
//     email: sessionStorage.getItem('email') || "",
//     phone: sessionStorage.getItem('phone') || "",
//     dob: sessionStorage.getItem('dob') ? new Date(sessionStorage.getItem('dob')).toISOString().split('T')[0] : "",
//     password: "",
//     gender: sessionStorage.getItem('gender') || "",
//     country: sessionStorage.getItem('country') || "",
//     state: sessionStorage.getItem('state') || "",
//     city: sessionStorage.getItem('city') || "",
//     pin: sessionStorage.getItem('pin') || "",
//     address: sessionStorage.getItem('address') || "",
//     bio: sessionStorage.getItem('bio') || "",
//   });

//   const [originalData, setOriginalData] = useState(formData);
  
//   const navigate = useNavigate();

//   // Animation variants
//   const fadeInUp = {
//     initial: { opacity: 0, y: 20 },
//     animate: { opacity: 1, y: 0 },
//     exit: { opacity: 0, y: -20 },
//     transition: { duration: 0.3 }
//   };

//   useEffect(() => {
//     async function fetchProfile() {
//       const uid = sessionStorage.getItem('uid');
//       if (!uid) return;

//       try {
//         const response = await axios.get(`${serverURL}/api/getuser/${uid}`);
//         if (response.data.success) {
//           const user = response.data.user;
//           setFormData({
//             mName: user.mName || "",
//             email: user.email || "",
//             phone: user.phone || "",
//             dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
//             password: "",
//             gender: user.gender || "",
//             country: user.country || "",
//             state: user.state || "",
//             city: user.city || "",
//             pin: user.pin || "",
//             address: user.address || "",
//             bio: user.bio || "",
//           });

//           sessionStorage.setItem('mName', user.mName || "");
//           sessionStorage.setItem('email', user.email || "");
//           sessionStorage.setItem('dob', user.dob || "");
//           sessionStorage.setItem('gender', user.gender || "");
//           sessionStorage.setItem('phone', user.phone || "");
//           sessionStorage.setItem('country', user.country || "");
//           sessionStorage.setItem('state', user.state || "");
//           sessionStorage.setItem('city', user.city || "");
//           sessionStorage.setItem('pin', user.pin || "");
//           sessionStorage.setItem('address', user.address || "");
//           sessionStorage.setItem('bio', user.bio || "");
//         }
//       } catch (error) {
//         console.error("Failed to fetch profile:", error);
//         toast({ title: "Error", description: "Failed to fetch profile data." });
//       }
//     }
//     fetchProfile();
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.mName || !formData.email) {
//       toast({ title: "Couldn't update profile", description: "Please fill in all required fields." });
//       return;
//     }

//     setProcessing(true);
//     const uid = sessionStorage.getItem("uid");

//     try {
//       const response = await axios.post(`${serverURL}/api/profile`, {
//         uid,
//         mName: formData.mName,
//         email: formData.email,
//         password: formData.password,
//         phone: formData.phone,
//         dob: formData.dob || null,
//         gender: formData.gender,
//         country: formData.country,
//         state: formData.state,
//         city: formData.city,
//         pin: formData.pin,
//         address: formData.address,
//         bio: formData.bio,
//       });

//       if (response.data.success) {
//         toast({ title: "Profile updated", description: "Your profile information has been updated successfully." });
//         sessionStorage.setItem("mName", formData.mName);
//         sessionStorage.setItem("email", formData.email);
//         sessionStorage.setItem("dob", formData.dob);
//         sessionStorage.setItem("gender", formData.gender);
//         sessionStorage.setItem("phone", formData.phone);
//         sessionStorage.setItem('country', formData.country);
//         sessionStorage.setItem('state', formData.state);
//         sessionStorage.setItem('city', formData.city);
//         sessionStorage.setItem('pin', formData.pin);
//         sessionStorage.setItem('address', formData.address);
//         sessionStorage.setItem("bio", formData.bio);
//         setIsEditing(false);
//       }
//     } catch (error) {
//       toast({ title: "Error", description: "Internal Server Error" });
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
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
//             <div className="h-48 bg-gradient-to-r from-purple-500 to-blue-500" />
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
//                   <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
//                     <span>Free Member</span>
//                   </div>
//                 </div>
//                 {formData.bio && (
//                   <p className="text-sm text-muted-foreground mt-2 max-w-md">{formData.bio}</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Main Content Tabs */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.3 }}
//         >
//           <Tabs defaultValue="account" className="w-full" onValueChange={setActiveTab}>
//             <TabsList className="grid w-full grid-cols-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl max-w-md mx-auto">
//               <TabsTrigger
//                 value="account"
//                 className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm rounded-lg py-2 transition-all"
//               >
//                 <User className="h-4 w-4" />
//                 <span>Account</span>
//               </TabsTrigger>
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
//                           <Label className="flex items-center gap-2">
//                             <Phone className="h-4 w-4" />
//                             Phone Number
//                           </Label>
//                           <Input
//                             name="phone"
//                             value={formData.phone}
//                             onChange={handleChange}
//                             disabled={!isEditing}
//                             placeholder="+91 XXXXX XXXXX"
//                             className="transition-all focus:ring-2 focus:ring-blue-500"
//                           />
//                         </div>
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
//                           onChange={handleChange}
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
//                               onChange={handleChange}
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
//           </Tabs>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default StudentProfile;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";
import { 
  PenLine, Save, Loader, User, Mail, Phone, MapPin, CircleUser, 
  Calendar, Lock, Globe, Building, Home, Heart, BookOpen, 
  Award, Target, Shield, ChevronRight, Camera, Sparkles
} from "lucide-react";
import { serverURL } from '@/constants';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [avatarHover, setAvatarHover] = useState(false);

  const [formData, setFormData] = useState({
    mName: sessionStorage.getItem('mName') || "",
    email: sessionStorage.getItem('email') || "",
    phone: sessionStorage.getItem('phone') || "",
    dob: sessionStorage.getItem('dob') ? new Date(sessionStorage.getItem('dob')).toISOString().split('T')[0] : "",
    password: "",
    gender: sessionStorage.getItem('gender') || "",
    country: sessionStorage.getItem('country') || "",
    state: sessionStorage.getItem('state') || "",
    city: sessionStorage.getItem('city') || "",
    pin: sessionStorage.getItem('pin') || "",
    address: sessionStorage.getItem('address') || "",
  });

  const [originalData, setOriginalData] = useState(formData);
  
  const navigate = useNavigate();

  // Mock stats for the profile
  const profileStats = {
    coursesCompleted: 12,
    totalHours: 48,
    certificates: 8,
    streak: 15
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  const sections = [
    { id: "personal", label: "Personal Info", icon: User, color: "blue" },
    { id: "contact", label: "Contact Details", icon: Mail, color: "green" },
  ];

  useEffect(() => {
    async function fetchProfile() {
      const uid = sessionStorage.getItem('uid');
      if (!uid) return;

      try {
        const response = await axios.get(`${serverURL}/api/getuser/${uid}`);
        if (response.data.success) {
          const user = response.data.user;
          setFormData({
            mName: user.mName || "",
            email: user.email || "",
            phone: user.phone || "",
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
            password: "",
            gender: user.gender || "",
            country: user.country || "",
            state: user.state || "",
            city: user.city || "",
            pin: user.pin || "",
            address: user.address || "",
          });

          sessionStorage.setItem('mName', user.mName || "");
          sessionStorage.setItem('email', user.email || "");
          sessionStorage.setItem('dob', user.dob || "");
          sessionStorage.setItem('gender', user.gender || "");
          sessionStorage.setItem('phone', user.phone || "");
          sessionStorage.setItem('country', user.country || "");
          sessionStorage.setItem('state', user.state || "");
          sessionStorage.setItem('city', user.city || "");
          sessionStorage.setItem('pin', user.pin || "");
          sessionStorage.setItem('address', user.address || "");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({ title: "Error", description: "Failed to fetch profile data." });
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mName || !formData.email) {
      toast({ title: "Couldn't update profile", description: "Please fill in all required fields." });
      return;
    }

    setProcessing(true);
    const uid = sessionStorage.getItem("uid");

    try {
      const response = await axios.post(`${serverURL}/api/profile`, {
        uid,
        mName: formData.mName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dob: formData.dob || null,
        gender: formData.gender,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pin: formData.pin,
        address: formData.address,
      });

      if (response.data.success) {
        toast({ title: "Profile updated", description: "Your profile information has been updated successfully." });
        sessionStorage.setItem("mName", formData.mName);
        sessionStorage.setItem("email", formData.email);
        sessionStorage.setItem("dob", formData.dob);
        sessionStorage.setItem("gender", formData.gender);
        sessionStorage.setItem("phone", formData.phone);
        sessionStorage.setItem('country', formData.country);
        sessionStorage.setItem('state', formData.state);
        sessionStorage.setItem('city', formData.city);
        sessionStorage.setItem('pin', formData.pin);
        sessionStorage.setItem('address', formData.address);
        setIsEditing(false);
      }
    } catch (error) {
      toast({ title: "Error", description: "Internal Server Error" });
    } finally {
      setProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getInitials = (name) => {
    return name?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
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
              {/* <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>Dashboard</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">Profile</span>
              </div> */}
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent">
                Student Profile
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your academic journey and personal information
              </p>
            </div>
            {!isEditing && (
              <Button 
                onClick={() => { setOriginalData(formData); setIsEditing(true); }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              >
                <PenLine className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-8 border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50/20 dark:from-gray-800 dark:to-gray-800/50 overflow-hidden">
              <div className="relative h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="relative px-6 pb-6">
                <div className="flex justify-center -mt-12 mb-4">
                  <div 
                    className="relative group cursor-pointer"
                    onMouseEnter={() => setAvatarHover(true)}
                    onMouseLeave={() => setAvatarHover(false)}
                  >
                    <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl text-white">
                        {getInitials(formData.mName)}
                      </AvatarFallback>
                    </Avatar>
                    {avatarHover && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full transition-all">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold">{formData.mName || "Student Name"}</h2>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {formData.role || "Student"}
                  </Badge>
                  {formData.bio && (
                    <p className="text-sm text-muted-foreground mt-2">{formData.bio}</p>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Stats */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Learning Progress</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Profile Completion</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-3 text-center">
                        <BookOpen className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
                        <p className="text-2xl font-bold">{profileStats.coursesCompleted}</p>
                        <p className="text-xs text-muted-foreground">Courses</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3 text-center">
                        <Award className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                        <p className="text-2xl font-bold">{profileStats.certificates}</p>
                        <p className="text-xs text-muted-foreground">Certificates</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Quick Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Info</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{formData.email || "Not set"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{formData.phone || "Not set"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{formData.city ? `${formData.city}, ${formData.country}` : "Location not set"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right Side - Form Sections */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-xl">
              <CardContent className="p-0">
                <form onSubmit={handleSubmit}>
                  {/* Section Navigation */}
                  <div className="border-b border-border p-6 pb-0">
                    <div className="flex flex-wrap gap-2">
                      {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                              activeSection === section.id
                                ? `bg-${section.color}-50 text-${section.color}-600 border-b-2 border-${section.color}-500`
                                : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{section.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-6">
                    <AnimatePresence mode="wait">
                      {/* Personal Information Section */}
                      {activeSection === "personal" && (
                        <motion.div
                          key="personal"
                          {...fadeInUp}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <CircleUser className="h-4 w-4 text-indigo-500" />
                                Full Name <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                name="mName"
                                value={formData.mName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="transition-all focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter your full name"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-indigo-500" />
                                Date of Birth
                              </Label>
                              <Input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="transition-all focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Gender</Label>
                              <Select
                                value={formData.gender}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                                disabled={!isEditing}
                              >
                                <SelectTrigger className="transition-all focus:ring-2 focus:ring-indigo-500">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                  <SelectItem value="prefer_not">Prefer not to say</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-indigo-500" />
                                New Password
                              </Label>
                              <Input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="••••••••"
                                className="transition-all focus:ring-2 focus:ring-indigo-500"
                              />
                              <p className="text-xs text-muted-foreground">Leave blank to keep current password</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Contact Details Section */}
                      {activeSection === "contact" && (
                        <motion.div
                          key="contact"
                          {...fadeInUp}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-green-500" />
                                Email Address <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="transition-all focus:ring-2 focus:ring-green-500"
                                placeholder="student@example.com"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-green-500" />
                                Phone Number
                              </Label>
                              <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="+91 XXXXX XXXXX"
                                className="transition-all focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Address Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Country</Label>
                                <Input
                                  name="country"
                                  value={formData.country}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="India"
                                  className="transition-all focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>State</Label>
                                <Input
                                  name="state"
                                  value={formData.state}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="Tamil Nadu"
                                  className="transition-all focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>City</Label>
                                <Input
                                  name="city"
                                  value={formData.city}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="Chennai"
                                  className="transition-all focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>PIN Code</Label>
                                <Input
                                  name="pin"
                                  value={formData.pin}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="600001"
                                  className="transition-all focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                              <div className="md:col-span-2 space-y-2">
                                <Label>Address</Label>
                                <Input
                                  name="address"
                                  value={formData.address}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="Street, Area, Landmark"
                                  className="transition-all focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Education Section */}
                      {activeSection === "education" && (
                        <motion.div
                          key="education"
                          {...fadeInUp}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-purple-500" />
                                Education Level
                              </Label>
                              <Select
                                value={formData.education}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, education: value }))}
                                disabled={!isEditing}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select education level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="high_school">High School</SelectItem>
                                  <SelectItem value="undergraduate">Undergraduate</SelectItem>
                                  <SelectItem value="postgraduate">Postgraduate</SelectItem>
                                  <SelectItem value="phd">PhD</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-purple-500" />
                                Institute / College
                              </Label>
                              <Input
                                name="institute"
                                value={formData.institute}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Your institute name"
                                className="transition-all focus:ring-2 focus:ring-purple-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-purple-500" />
                                Year / Semester
                              </Label>
                              <Input
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="e.g., 3rd Year, 5th Semester"
                                className="transition-all focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Interests & Bio Section */}
                      {activeSection === "interests" && (
                        <motion.div
                          key="interests"
                          {...fadeInUp}
                          className="space-y-6"
                        >
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-pink-500" />
                              Bio
                            </Label>
                            <Textarea
                              name="bio"
                              value={formData.bio}
                              onChange={handleChange}
                              disabled={!isEditing}
                              placeholder="Tell us a little about yourself, your goals, and what you're passionate about..."
                              rows={4}
                              className="transition-all focus:ring-2 focus:ring-pink-500 resize-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Heart className="h-4 w-4 text-pink-500" />
                              Interests & Hobbies
                            </Label>
                            <Textarea
                              name="interests"
                              value={formData.interests}
                              onChange={handleChange}
                              disabled={!isEditing}
                              placeholder="What are you interested in? Coding, Design, Music, Sports, etc."
                              rows={3}
                              className="transition-all focus:ring-2 focus:ring-pink-500 resize-none"
                            />
                            <p className="text-xs text-muted-foreground">Separate multiple interests with commas</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    {isEditing && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 justify-end pt-6 mt-6 border-t"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => { setFormData(originalData); setIsEditing(false); }}
                          className="px-6"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={processing}
                          className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-6"
                        >
                          {processing && <Loader className="animate-spin h-4 w-4" />}
                          <Save className="h-4 w-4" />
                          {processing ? "Saving..." : "Save Changes"}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;