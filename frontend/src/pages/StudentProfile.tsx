// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-nocheck
// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from '@/components/ui/button';
// import { toast } from "@/hooks/use-toast";
// import { 
//   PenLine, Save, Loader, User, Mail, Phone, MapPin, CircleUser, 
//   Calendar, Lock, Globe, Building, Home, Heart, BookOpen, 
//   Award, Target, Shield, ChevronRight, Camera, Sparkles
// } from "lucide-react";
// import { serverURL } from '@/constants';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Progress } from "@/components/ui/progress";

// const StudentProfile = () => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [processing, setProcessing] = useState(false);
//   const [activeSection, setActiveSection] = useState("personal");
//   const [avatarHover, setAvatarHover] = useState(false);
// const [errors, setErrors] = useState({});
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
//   });

//   const countries = [
//   { name: "India", code: "+91", length: 10 },
//   { name: "USA", code: "+1", length: 10 },
//   { name: "UK", code: "+44", length: 10 },
//   { name: "UAE", code: "+971", length: 9 },
// ];
//   const [originalData, setOriginalData] = useState(formData);
//   const [selectedCountry, setSelectedCountry] = useState(countries[0]);
//   const navigate = useNavigate();

//   // Mock stats for the profile
//   const [profileStats, setProfileStats] = useState({
//   coursesCompleted: 0,
//   certificates: 0
// });
// useEffect(() => {
//   const uid = sessionStorage.getItem("uid");
//   if (!uid) return;

//   axios.get(`${serverURL}/api/user-stats/${uid}`)
//     .then(res => {
//       if (res.data.success) {
//         setProfileStats({
//           // If the API provides the count, use it; otherwise, default to 2 based on your current UI
//           coursesCompleted: res.data.stats.courses || 2, 
//           certificates: res.data.stats.certifications || 0
//         });
//       }
//     })
//     .catch(err => {
//       console.log("Stats fetch failed, using local defaults", err);
//       // Hardcoded fallback to match your dashboard image if API is down
//       setProfileStats({ coursesCompleted: 2, certificates: 0 });
//     });
// }, []);

//   // Animation variants
//   const fadeInUp = {
//     initial: { opacity: 0, y: 20 },
//     animate: { opacity: 1, y: 0 },
//     exit: { opacity: 0, y: -20 },
//     transition: { duration: 0.3 }
//   };

//   const sections = [
//     { id: "personal", label: "Personal Info", icon: User, color: "blue" },
//     { id: "contact", label: "Contact Details", icon: Mail, color: "green" },
//   ];

//   useEffect(() => {
//     async function fetchProfile() {
//       const uid = sessionStorage.getItem('uid');
//       if (!uid) return;

//       try {
//         const response = await axios.get(`${serverURL}/api/getuser/${uid}`);
//         if (response.data.success) {
//           const user = response.data.user;

// const fullPhone = user.phone || "";
// const matched = countries.find(c => fullPhone.startsWith(c.code));

// let phoneNumber = fullPhone;

// if (matched) {
//   setSelectedCountry(matched);
//   phoneNumber = fullPhone.replace(matched.code, "");
// }
//   setFormData({
//             mName: user.mName || "",
//             email: user.email || "",
//             phone: phoneNumber,
//             dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
//             password: "",
//             gender: user.gender || "",
//             country: user.country || "",
//             state: user.state || "",
//             city: user.city || "",
//             pin: user.pin || "",
//             address: user.address || "",
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
//         }
//       } catch (error) {
//         console.error("Failed to fetch profile:", error);
//         toast({ title: "Error", description: "Failed to fetch profile data." });
//       }
//     }
//     fetchProfile();
//   }, []);

//   // ✅ ADD HERE 👇
//   // ✅ ADD THIS HERE
// const getPasswordStrength = (password) => {
//   if (!password) return "";

//   let strength = 0;

//   if (password.length >= 8) strength++;
//   if (/[A-Z]/.test(password)) strength++;
//   if (/[a-z]/.test(password)) strength++;
//   if (/[0-9]/.test(password)) strength++;
//   if (/[@$!%*?&]/.test(password)) strength++;

//   if (strength <= 2) return "Weak";
//   if (strength <= 4) return "Medium";
//   return "Strong";
// };
// const handleChange = (e) => {
//   const { name, value } = e.target;
//   setFormData(prev => ({
//     ...prev,
//     [name]: value
//   }));
//    setErrors(prev => ({
//     ...prev,
//     [name]: ""
//   }));
// };const validateForm = () => {
//   let newErrors = {};

//   // Name
//   if (!formData.mName.trim()) {
//     newErrors.mName = "Full name is required";
//   }

//   // Email
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(formData.email)) {
//     newErrors.email = "Enter valid email";
//   }

//   // Phone
//   if (!formData.phone) {
//     newErrors.phone = "Phone number required";
//   } else {
//     const phoneRegex = new RegExp(`^\\d{${selectedCountry.length}}$`);
//     if (!phoneRegex.test(formData.phone)) {
//       newErrors.phone = `Enter ${selectedCountry.length} digits`;
//     }
//   }

//   // DOB
//   if (!formData.dob) {
//     newErrors.dob = "DOB required";
//   }

//   // Password
//   const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

// if (formData.password && !strongRegex.test(formData.password)) {
//   newErrors.password =
//     "Password must contain uppercase, lowercase, number & special character";
// }

//   // Country
//   if (!formData.country.trim()) {
//     newErrors.country = "Country required";
//   }

//   // State
//   if (!formData.state.trim()) {
//     newErrors.state = "State required";
//   }

//   // City
//   if (!formData.city.trim()) {
//     newErrors.city = "City required";
//   }

//   // PIN
//   if (!/^\d{6}$/.test(formData.pin)) {
//     newErrors.pin = "Enter 6 digit PIN";
//   }

//   // Address
//   if (!formData.address.trim()) {
//     newErrors.address = "Address required";
//   }

//   setErrors(newErrors);

//   // Optional toast
//   if (Object.keys(newErrors).length > 0) {
//     toast({
//       title: "Validation Error",
//       description: "Please fix highlighted fields"
//     });
//   }

//   return Object.keys(newErrors).length === 0;
// };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

    
    
//    if (!validateForm()) return;
//     setProcessing(true);
//     const uid = sessionStorage.getItem("uid");

//     try {
//       const response = await axios.post(`${serverURL}/api/profile`, {
//         uid,
//         mName: formData.mName,
//         email: formData.email,
//         password: formData.password,
//      phone: selectedCountry.code + formData.phone,
//         dob: formData.dob || null,
//         gender: formData.gender,
//         country: formData.country,
//         state: formData.state,
//         city: formData.city,
//         pin: formData.pin,
//         address: formData.address,
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
//         setIsEditing(false);
//       }
//     } catch (error) {
//       toast({ title: "Error", description: "Internal Server Error" });
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const getInitials = (name) => {
//     return name?.charAt(0)?.toUpperCase() || "U";
//   };

//   // Add this calculation before the return statement
//   const completionPercentage = formData.mName && formData.email && formData.phone && formData.address ? 90 : 50;
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
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
//               {/* <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
//                 <span>Dashboard</span>
//                 <ChevronRight className="h-4 w-4" />
//                 <span className="text-foreground font-medium">Profile</span>
//               </div> */}
//               <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent">
//                 Student Profile
//               </h1>
//               <p className="text-muted-foreground mt-1">
//                 Manage your academic journey and personal information
//               </p>
//             </div>
//             {!isEditing && (
//               <Button 
//                 onClick={() => { setOriginalData(formData); setIsEditing(true); }}
//                 className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
//               >
//                 <PenLine className="mr-2 h-4 w-4" />
//                 Edit Profile
//               </Button>
//             )}
//           </div>
//         </motion.div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Sidebar - Profile Overview */}
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.5, delay: 0.1 }}
//             className="lg:col-span-1"
//           >
//             <Card className="sticky top-8 border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50/20 dark:from-gray-800 dark:to-gray-800/50 overflow-hidden">
//               <div className="relative h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
//                 <div className="absolute inset-0 bg-black/20" />
//               </div>
//               <div className="relative px-6 pb-6">
//                 <div className="flex justify-center -mt-12 mb-4">
//                   <div 
//                     className="relative group cursor-pointer"
//                     onMouseEnter={() => setAvatarHover(true)}
//                     onMouseLeave={() => setAvatarHover(false)}
//                   >
//                     <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
//                       <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl text-white">
//                         {getInitials(formData.mName)}
//                       </AvatarFallback>
//                     </Avatar>
//                     {avatarHover && (
//                       <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full transition-all">
//                         <Camera className="h-6 w-6 text-white" />
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="text-center space-y-2">
//                   <h2 className="text-xl font-bold">{formData.mName || "Student Name"}</h2>
//                   <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
//                   {formData.role || "Student"}
//                   </Badge>
//                   {formData.bio && (
//                     <p className="text-sm text-muted-foreground mt-2">{formData.bio}</p>
//                   )}
//                 </div>

//                 <Separator className="my-6" />

//                 {/* Stats */}
//                 <div className="space-y-4">
//                   <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Learning Progress</h3>
//                   <div className="space-y-3">
//                     <div>
//                       <div className="flex justify-between text-sm mb-1">
//                         <span>Profile Completion</span>
//                         <span className="font-medium">85%</span>
//                       </div>
//                       <Progress value={85} className="h-2" />
//                     </div>
//                     <div className="grid grid-cols-2 gap-3">
//                       <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-3 text-center">
//                         <BookOpen className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
//                         <p className="text-2xl font-bold">{profileStats.coursesCompleted}</p>
//                         <p className="text-xs text-muted-foreground">Courses</p>
//                       </div>
//                       <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3 text-center">
//                         <Award className="h-5 w-5 text-purple-600 mx-auto mb-1" />
//                         <p className="text-2xl font-bold">{profileStats.certificates}</p>
//                         <p className="text-xs text-muted-foreground">Certificates</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <Separator className="my-6" />

//                 {/* Quick Info */}
//                 <div className="space-y-3">
//                   <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Info</h3>
//                   <div className="space-y-2">
//                     <div className="flex items-center gap-2 text-sm">
//                       <Mail className="h-4 w-4 text-muted-foreground" />
//                       <span className="truncate">{formData.email || "Not set"}</span>
//                     </div>
//                     <div className="flex items-center gap-2 text-sm">
//                       <Phone className="h-4 w-4 text-muted-foreground" />
//                       <span>{formData.phone || "Not set"}</span>
//                     </div>
//                     <div className="flex items-center gap-2 text-sm">
//                       <MapPin className="h-4 w-4 text-muted-foreground" />
//                       <span>{formData.city ? `${formData.city}, ${formData.country}` : "Location not set"}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </Card>
//           </motion.div>

//           {/* Right Side - Form Sections */}
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//             className="lg:col-span-2"
//           >
//             <Card className="border-0 shadow-xl">
//               <CardContent className="p-0">
//                 <form onSubmit={handleSubmit}>
//                   {/* Section Navigation */}
//                   <div className="border-b border-border p-6 pb-0">
//                     <div className="flex flex-wrap gap-2">
//                       {sections.map((section) => {
//                         const Icon = section.icon;
//                         return (
//                           <button
//                             key={section.id}
//                             type="button"
//                             onClick={() => setActiveSection(section.id)}
//                             className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
//                               activeSection === section.id
//                                 ? `bg-${section.color}-50 text-${section.color}-600 border-b-2 border-${section.color}-500`
//                                 : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
//                             }`}
//                           >
//                             <Icon className="h-4 w-4" />
//                             <span className="text-sm font-medium">{section.label}</span>
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   <div className="p-6">
//                     <AnimatePresence mode="wait">
//                       {/* Personal Information Section */}
//                       {activeSection === "personal" && (
//                         <motion.div
//                           key="personal"
//                           {...fadeInUp}
//                           className="space-y-6"
//                         >
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div className="space-y-2">
//                               <Label className="flex items-center gap-2">
//                                 <CircleUser className="h-4 w-4 text-indigo-500" />
//                                 Full Name <span className="text-red-500">*</span>
//                               </Label>
//                               <Input
//                                 name="mName"
//                                 value={formData.mName}
//                                 onChange={handleChange}
//                                 disabled={!isEditing}
//                                 className="transition-all focus:ring-2 focus:ring-indigo-500"
//                                 placeholder="Enter your full name"
//                               />
//                               {errors.mName && (
//   <p className="text-red-500 text-xs mt-1">{errors.mName}</p>
// )}
//                             </div>
                            
//                             <div className="space-y-2">
//                               <Label className="flex items-center gap-2">
//                                 <Calendar className="h-4 w-4 text-indigo-500" />
//                                 Date of Birth
//                               </Label>
//                               <Input
//                                 type="date"
//                                 name="dob"
//                                 value={formData.dob}
//                                 onChange={handleChange}
//                                 disabled={!isEditing}
//                                 className="transition-all focus:ring-2 focus:ring-indigo-500"
//                               />
//                             </div>

//                             <div className="space-y-2">
//                               <Label>Gender</Label>
//                               <Select
//                                 value={formData.gender}
//                                 onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
//                                 disabled={!isEditing}
//                               >
//                                 <SelectTrigger className="transition-all focus:ring-2 focus:ring-indigo-500">
//                                   <SelectValue placeholder="Select gender" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   <SelectItem value="male">Male</SelectItem>
//                                   <SelectItem value="female">Female</SelectItem>
//                                   <SelectItem value="other">Other</SelectItem>
//                                   <SelectItem value="prefer_not">Prefer not to say</SelectItem>
//                                 </SelectContent>
//                               </Select>
//                             </div>

//                             <div className="space-y-2">
//                               <Label className="flex items-center gap-2">
//                                 <Lock className="h-4 w-4 text-indigo-500" />
//                                 New Password
//                               </Label>
//                               <Input
//                                 name="password"
//                                 type="password"
//                                 value={formData.password}
//                                 onChange={handleChange}
//                                 disabled={!isEditing}
//                                 placeholder="••••••••"
//                                 className="transition-all focus:ring-2 focus:ring-indigo-500"
//                               />
//                               {/* Error */}
// {errors.password && (
//   <p className="text-red-500 text-xs mt-1">
//     {errors.password}
//   </p>
// )}

// {/* Strength */}
// {formData.password && !errors.password && (
//   <p
//     className={`text-xs mt-1 ${
//       getPasswordStrength(formData.password) === "Strong"
//         ? "text-green-600"
//         : getPasswordStrength(formData.password) === "Medium"
//         ? "text-yellow-600"
//         : "text-red-500"
//     }`}
//   >
//     Password strength:{" "}
//     <strong>{getPasswordStrength(formData.password)}</strong>
//   </p>
// )}
//                               {/* <p className="text-xs text-muted-foreground">Leave blank to keep current password</p> */}
//                             </div>
//                           </div>
//                         </motion.div>
//                       )}

//                       {/* Contact Details Section */}
//                       {activeSection === "contact" && (
//                         <motion.div
//                           key="contact"
//                           {...fadeInUp}
//                           className="space-y-6"
//                         >
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div className="space-y-2">
//                               <Label className="flex items-center gap-2">
//                                 <Mail className="h-4 w-4 text-green-500" />
//                                 Email Address <span className="text-red-500">*</span>
//                               </Label>
//                               <Input
//                                 name="email"
//                                 type="email"
//                                 value={formData.email}
//                                 onChange={handleChange}
//                                 disabled={!isEditing}
//                                 className="transition-all focus:ring-2 focus:ring-green-500"
//                                 placeholder="student@example.com"
//                               />
//                               {errors.email && (
//   <p className="text-red-500 text-xs mt-1">
//     {errors.email}
//   </p>
// )}
//                             </div>

//                             <div className="space-y-2">
//   <Label className="flex items-center gap-2">
//     <Phone className="h-4 w-4 text-green-500" />
//     Phone Number <span className="text-red-500">*</span>
//   </Label>

//   {/* Input Row */}
//   <div className="flex gap-2">
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

//     <Input
//       value={formData.phone}
//       onChange={(e) => {
//         const value = e.target.value
//           .replace(/\D/g, "")
//           .slice(0, selectedCountry.length);

//         setFormData(prev => ({ ...prev, phone: value }));
//          // ✅ clear phone error
//   setErrors(prev => ({
//     ...prev,
//     phone: ""
//   }));
// }}
//       placeholder={`Enter ${selectedCountry.length} digits`}
//       disabled={!isEditing}
//       className="flex-1"
//     />
//   </div>

//   {/* ✅ ERROR BELOW */}
//   {errors.phone && (
//     <p className="text-red-500 text-xs mt-1">
//       {errors.phone}
//     </p>
//   )}
// </div>
// </div>
//                           <div className="space-y-4">
//                             <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
//                               <MapPin className="h-4 w-4" />
//                               Address Information
//                             </h3>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                               <div className="space-y-2">
//                                 <Label>Country</Label>
//                                 <Input
//                                   name="country"
//                                   value={formData.country}
//                                   onChange={handleChange}
//                                   disabled={!isEditing}
//                                   placeholder="India"
//                                   className="transition-all focus:ring-2 focus:ring-green-500"
//                                 />
//                               </div>
//                               <div className="space-y-2">
//                                 <Label>State</Label>
//                                 <Input
//                                   name="state"
//                                   value={formData.state}
//                                   onChange={handleChange}
//                                   disabled={!isEditing}
//                                   placeholder="Tamil Nadu"
//                                   className="transition-all focus:ring-2 focus:ring-green-500"
//                                 />
//                               </div>
//                               <div className="space-y-2">
//                                 <Label>City</Label>
//                                 <Input
//                                   name="city"
//                                   value={formData.city}
//                                   onChange={handleChange}
//                                   disabled={!isEditing}
//                                   placeholder="Chennai"
//                                   className="transition-all focus:ring-2 focus:ring-green-500"
//                                 />
//                               </div>
//                               <div className="space-y-2">
//                                 <Label>PIN Code</Label>
//                                 <Input
//                                   name="pin"
//                                   value={formData.pin}
//                                onChange={(e) => {
//   const value = e.target.value.replace(/\D/g, "").slice(0, 6);
//   setFormData(prev => ({ ...prev, pin: value }));
// }}
//                                   disabled={!isEditing}
//                                   placeholder="600001"
//                                   className="transition-all focus:ring-2 focus:ring-green-500"
//                                 />
//                               </div>
//                               <div className="md:col-span-2 space-y-2">
//                                 <Label>Address</Label>
//                                 <Input
//                                   name="address"
//                                   value={formData.address}
//                                   onChange={handleChange}
//                                   disabled={!isEditing}
//                                   placeholder="Street, Area, Landmark"
//                                   className="transition-all focus:ring-2 focus:ring-green-500"
//                                 />
//                               </div>
//                             </div>
//                           </div>
//                         </motion.div>
//                       )}

//                       {/* Education Section */}
//                       {activeSection === "education" && (
//                         <motion.div
//                           key="education"
//                           {...fadeInUp}
//                           className="space-y-6"
//                         >
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div className="space-y-2">
//                               <Label className="flex items-center gap-2">
//                                 <BookOpen className="h-4 w-4 text-purple-500" />
//                                 Education Level
//                               </Label>
//                               <Select
//                                 value={formData.education}
//                                 onValueChange={(value) => setFormData(prev => ({ ...prev, education: value }))}
//                                 disabled={!isEditing}
//                               >
//                                 <SelectTrigger>
//                                   <SelectValue placeholder="Select education level" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   <SelectItem value="high_school">High School</SelectItem>
//                                   <SelectItem value="undergraduate">Undergraduate</SelectItem>
//                                   <SelectItem value="postgraduate">Postgraduate</SelectItem>
//                                   <SelectItem value="phd">PhD</SelectItem>
//                                   <SelectItem value="other">Other</SelectItem>
//                                 </SelectContent>
//                               </Select>
//                             </div>

//                             <div className="space-y-2">
//                               <Label className="flex items-center gap-2">
//                                 <Building className="h-4 w-4 text-purple-500" />
//                                 Institute / College
//                               </Label>
//                               <Input
//                                 name="institute"
//                                 value={formData.institute}
//                                 onChange={handleChange}
//                                 disabled={!isEditing}
//                                 placeholder="Your institute name"
//                                 className="transition-all focus:ring-2 focus:ring-purple-500"
//                               />
//                             </div>

//                             <div className="space-y-2">
//                               <Label className="flex items-center gap-2">
//                                 <Target className="h-4 w-4 text-purple-500" />
//                                 Year / Semester
//                               </Label>
//                               <Input
//                                 name="year"
//                                 value={formData.year}
//                                 onChange={handleChange}
//                                 disabled={!isEditing}
//                                 placeholder="e.g., 3rd Year, 5th Semester"
//                                 className="transition-all focus:ring-2 focus:ring-purple-500"
//                               />
//                             </div>
//                           </div>
//                         </motion.div>
//                       )}

//                       {/* Interests & Bio Section */}
//                       {activeSection === "interests" && (
//                         <motion.div
//                           key="interests"
//                           {...fadeInUp}
//                           className="space-y-6"
//                         >
//                           <div className="space-y-2">
//                             <Label className="flex items-center gap-2">
//                               <Sparkles className="h-4 w-4 text-pink-500" />
//                               Bio
//                             </Label>
//                             <Textarea
//                               name="bio"
//                               value={formData.bio}
//                               onChange={handleChange}
//                               disabled={!isEditing}
//                               placeholder="Tell us a little about yourself, your goals, and what you're passionate about..."
//                               rows={4}
//                               className="transition-all focus:ring-2 focus:ring-pink-500 resize-none"
//                             />
//                           </div>

//                           <div className="space-y-2">
//                             <Label className="flex items-center gap-2">
//                               <Heart className="h-4 w-4 text-pink-500" />
//                               Interests & Hobbies
//                             </Label>
//                             <Textarea
//                               name="interests"
//                               value={formData.interests}
//                               onChange={handleChange}
//                               disabled={!isEditing}
//                               placeholder="What are you interested in? Coding, Design, Music, Sports, etc."
//                               rows={3}
//                               className="transition-all focus:ring-2 focus:ring-pink-500 resize-none"
//                             />
//                             <p className="text-xs text-muted-foreground">Separate multiple interests with commas</p>
//                           </div>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>

//                     {/* Action Buttons */}
//                     {isEditing && (
//                       <motion.div 
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="flex gap-3 justify-end pt-6 mt-6 border-t"
//                       >
//                         <Button
//                           type="button"
//                           variant="outline"
//                           onClick={() => { setFormData(originalData); setIsEditing(false); }}
//                           className="px-6"
//                         >
//                           Cancel
//                         </Button>
//                         <Button 
//                           type="submit" 
//                           disabled={processing}
//                           className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-6"
//                         >
//                           {processing && <Loader className="animate-spin h-4 w-4" />}
//                           <Save className="h-4 w-4" />
//                           {processing ? "Saving..." : "Save Changes"}
//                         </Button>
//                       </motion.div>
//                     )}
//                   </div>
//                 </form>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </div>
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
  Award, Target, Shield, ChevronRight, Camera, Sparkles,
  CreditCard, Moon, Sun, X
} from "lucide-react";
import DigitalIDCard from "@/components/DigitalIDCard";
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
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [avatarHover, setAvatarHover] = useState(false);
  const [courseCount, setCourseCount] = useState(0);
  const [showIdCard, setShowIdCard] = useState(false);
  const [idCardTheme, setIdCardTheme] = useState<'dark' | 'light'>('dark');
  const [digitalIdModuleEnabled, setDigitalIdModuleEnabled] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [orgData, setOrgData] = useState<any>(null);
const [errors, setErrors] = useState({});
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

  const countries = [
  { name: "India", code: "+91", length: 10 },
  { name: "USA", code: "+1", length: 10 },
  { name: "UK", code: "+44", length: 10 },
  { name: "UAE", code: "+971", length: 9 },
];
  const [originalData, setOriginalData] = useState(formData);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const navigate = useNavigate();

  // Mock stats for the profile
  const [profileStats, setProfileStats] = useState({
  coursesCompleted: 0,
  certificates: 0
});
useEffect(() => {
  async function fetchCourseCount() {
    try {
      const orgId = sessionStorage.getItem("orgId");
      const studentId = sessionStorage.getItem("uid");

      const res = await axios.get(
        `${serverURL}/api/student/courses?organizationId=${orgId}&studentId=${studentId}`
      );

      if (res.data.success) {
        const total = res.data.courses.length;

        setCourseCount(total);

        setProfileStats(prev => ({
          ...prev,
          coursesCompleted: total
        }));
      }

    } catch (err) {
      console.error(err);
    }
  }

  fetchCourseCount();
}, []);
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
          setUserData(user);

const fullPhone = user.phone || "";
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

          // Fetch organization branding
          const orgId = user.organizationId?._id || user.organizationId || sessionStorage.getItem('orgId');
          if (orgId && typeof orgId === 'string' && orgId !== 'undefined') {
            try {
              const orgRes = await axios.get(`${serverURL}/api/getuser/${orgId}`);
              if (orgRes.data.success) {
                const orgInfo = orgRes.data.user;
                setOrgData({
                  name: orgInfo.organizationDetails?.institutionName || orgInfo.mName,
                  logo: orgInfo.logo,
                  address: orgInfo.address
                });
              }
            } catch (err) {
              console.error("Failed to fetch organization branding:", err);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({ title: "Error", description: "Failed to fetch profile data." });
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const settingsRes = await axios.get(`${serverURL}/api/settings`);
            if (settingsRes.data && settingsRes.data.digitalIdEnabled) {
                const di = settingsRes.data.digitalIdEnabled;
                const userType = sessionStorage.getItem('type') || 'free';
                if (di.org_admin || di.student || di[userType as keyof typeof userType]) {
                    setDigitalIdModuleEnabled(true);
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    };
    fetchSettings();
  }, []);

  // ✅ ADD HERE 👇
  // ✅ ADD THIS HERE
const getPasswordStrength = (password) => {
  if (!password) return "";

  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;

  if (strength <= 2) return "Weak";
  if (strength <= 4) return "Medium";
  return "Strong";
};
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
   setErrors(prev => ({
    ...prev,
    [name]: ""
  }));
};const validateForm = () => {
  let newErrors = {};

  // Name
  if (!formData.mName.trim()) {
    newErrors.mName = "Full name is required";
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    newErrors.email = "Enter valid email";
  }

  // Phone
  if (!formData.phone) {
    newErrors.phone = "Phone number required";
  } else {
    const phoneRegex = new RegExp(`^\\d{${selectedCountry.length}}$`);
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = `Enter ${selectedCountry.length} digits`;
    }
  }

  // DOB
  if (!formData.dob) {
    newErrors.dob = "DOB required";
  }

  // Password
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

if (formData.password && !strongRegex.test(formData.password)) {
  newErrors.password =
    "Password must contain uppercase, lowercase, number & special character";
}

  // Country
  if (!formData.country.trim()) {
    newErrors.country = "Country required";
  }

  // State
  if (!formData.state.trim()) {
    newErrors.state = "State required";
  }

  // City
  if (!formData.city.trim()) {
    newErrors.city = "City required";
  }

  // PIN
  if (!/^\d{6}$/.test(formData.pin)) {
    newErrors.pin = "Enter 6 digit PIN";
  }

  // Address
  if (!formData.address.trim()) {
    newErrors.address = "Address required";
  }

  setErrors(newErrors);

  // Optional toast
  if (Object.keys(newErrors).length > 0) {
    toast({
      title: "Validation Error",
      description: "Please fix highlighted fields"
    });
  }

  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    
    
   if (!validateForm()) return;
    setProcessing(true);
    const uid = sessionStorage.getItem("uid");

    try {
      const response = await axios.post(`${serverURL}/api/profile`, {
        uid,
        mName: formData.mName,
        email: formData.email,
        password: formData.password,
     phone: selectedCountry.code + formData.phone,
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

  const getInitials = (name) => {
    return name?.charAt(0)?.toUpperCase() || "U";
  };

  // Add this calculation before the return statement
  const completionPercentage = formData.mName && formData.email && formData.phone && formData.address ? 90 : 50;
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
              <div className="flex gap-2">
                {digitalIdModuleEnabled && (
                  <Button 
                    variant="default" 
                    onClick={() => setShowIdCard(true)} 
                    className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <CreditCard className="h-4 w-4" />
                    Digital ID Card
                  </Button>
                )}
                <Button 
                  onClick={() => { setOriginalData(formData); setIsEditing(true); }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <PenLine className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
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
                              {errors.mName && (
  <p className="text-red-500 text-xs mt-1">{errors.mName}</p>
)}
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
                              {/* Error */}
{errors.password && (
  <p className="text-red-500 text-xs mt-1">
    {errors.password}
  </p>
)}

{/* Strength */}
{formData.password && !errors.password && (
  <p
    className={`text-xs mt-1 ${
      getPasswordStrength(formData.password) === "Strong"
        ? "text-green-600"
        : getPasswordStrength(formData.password) === "Medium"
        ? "text-yellow-600"
        : "text-red-500"
    }`}
  >
    Password strength:{" "}
    <strong>{getPasswordStrength(formData.password)}</strong>
  </p>
)}
                              {/* <p className="text-xs text-muted-foreground">Leave blank to keep current password</p> */}
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
                              {errors.email && (
  <p className="text-red-500 text-xs mt-1">
    {errors.email}
  </p>
)}
                            </div>

                            <div className="space-y-2">
  <Label className="flex items-center gap-2">
    <Phone className="h-4 w-4 text-green-500" />
    Phone Number <span className="text-red-500">*</span>
  </Label>

  {/* Input Row */}
  <div className="flex gap-2">
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

    <Input
      value={formData.phone}
      onChange={(e) => {
        const value = e.target.value
          .replace(/\D/g, "")
          .slice(0, selectedCountry.length);

        setFormData(prev => ({ ...prev, phone: value }));
         // ✅ clear phone error
  setErrors(prev => ({
    ...prev,
    phone: ""
  }));
}}
      placeholder={`Enter ${selectedCountry.length} digits`}
      disabled={!isEditing}
      className="flex-1"
    />
  </div>

  {/* ✅ ERROR BELOW */}
  {errors.phone && (
    <p className="text-red-500 text-xs mt-1">
      {errors.phone}
    </p>
  )}
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
                               onChange={(e) => {
  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
  setFormData(prev => ({ ...prev, pin: value }));
}}
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
      
      {/* Digital ID Card Dialog */}
      <Dialog open={showIdCard} onOpenChange={(open) => {
          setShowIdCard(open);
          if (!open) setIdCardTheme('dark');
      }}>
          <DialogContent className="max-w-md p-4 bg-transparent border-none shadow-none max-h-[95vh] overflow-y-auto custom-scrollbar">
              <div className="relative flex flex-col items-center">
                  <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -right-2 -top-2 z-50 bg-white/10 text-white hover:bg-white/20 rounded-full"
                      onClick={() => setShowIdCard(false)}
                  >
                      <X className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex justify-center gap-3 mb-6 w-full px-4">
                      <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIdCardTheme('dark')}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                              idCardTheme === 'dark' 
                              ? 'bg-slate-900 text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                              : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'
                          }`}
                      >
                          <Moon className="w-4 h-4" />
                          DARK
                      </motion.button>
                      <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIdCardTheme('light')}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                              idCardTheme === 'light' 
                              ? 'bg-white text-slate-900 border-white shadow-lg' 
                              : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'
                          }`}
                      >
                          <Sun className="w-4 h-4" />
                          LIGHT
                      </motion.button>
                  </div>

                  {userData && (
                      <div className="w-full flex justify-center">
                          <DigitalIDCard 
                              student={{
                                ...userData,
                                mName: formData.mName,
                              }} 
                              organization={orgData}
                              theme={idCardTheme}
                          />
                      </div>
                  )}
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentProfile;

