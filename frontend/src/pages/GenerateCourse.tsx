// import React, { useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
// import { Sparkles, Plus, Lock, AlertTriangle, BookOpen, Layers, Type, Globe, CheckCircle2, Info, Lightbulb, Award, CheckCircle, User, LogIn, Loader2 } from 'lucide-react';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import CoursePreview from '@/components/CoursePreview';
// import SEO from '@/components/SEO';
// import { useToast } from '@/hooks/use-toast';
// import { serverURL } from '@/constants';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { Progress } from '@/components/ui/progress';

// // ─── Plan limits (mirrors server/config/planLimits.js) ─────────────────────
// const PLAN_LIMITS: Record<string, { maxCourses: number; maxSubtopics: number; allowVideo: boolean; allowMultiLang: boolean }> = {
//   free: { maxCourses: 1, maxSubtopics: 5, allowVideo: false, allowMultiLang: false },
//   monthly: { maxCourses: 20, maxSubtopics: 10, allowVideo: true, allowMultiLang: false },
//   yearly: { maxCourses: Infinity, maxSubtopics: 10, allowVideo: true, allowMultiLang: true },
//   forever: { maxCourses: Infinity, maxSubtopics: 10, allowVideo: true, allowMultiLang: true },
// };

// const courseFormSchema = z.object({
//   topic: z.string().min(3, { message: "Topic must be at least 3 characters" }),
//   subtopics: z.array(z.string()),
//   topicsLimit: z.enum(["5", "10"]),
//   courseType: z.enum(["image & text course", "video & text course"]),
//   language: z.string().min(1, { message: "Please select a language" })
// });

// type CourseFormValues = z.infer<typeof courseFormSchema>;

// const GenerateCourse = () => {
//   const [subtopicInput, setSubtopicInput] = useState('');
//   const [subtopics, setSubtopics] = useState<string[]>([]);
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [generatedTopics, setGeneratedTopics] = useState({});
//   const [selectedValue, setSelectedValue] = useState('5');
//   const [selectedType, setSelectedType] = useState('image & text course');
//   const [lang, setLang] = useState('English');
//   const [courseCount, setCourseCount] = useState(0);
//   const [isCheckingAuth, setIsCheckingAuth] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [generationProgress, setGenerationProgress] = useState(0);
//   const [progressMessage, setProgressMessage] = useState('');
//   const [formProgress, setFormProgress] = useState(0);
//   const { toast } = useToast();
//   const navigate = useNavigate();

//   // ─── Check Authentication Status ───────────────────────────────────────────
//   useEffect(() => {
//     const checkAuth = () => {
//       const uid = sessionStorage.getItem('uid');
//       const userType = sessionStorage.getItem('type');
//       const userName = sessionStorage.getItem('mName');
      
//       if (uid && userType && userName) {
//         setIsAuthenticated(true);
//       } else {
//         setIsAuthenticated(false);
//       }
//       setIsCheckingAuth(false);
//     };

//     checkAuth();
//   }, []);

//   // ─── Derived plan state ───────────────────────────────────────────────────
//   const userType = (sessionStorage.getItem('type') || 'free') as string;
//   const subscriptionEndStr = sessionStorage.getItem('subscriptionEnd') || '';
//   const planLimits = PLAN_LIMITS[userType] || PLAN_LIMITS.free;
//   const userName = sessionStorage.getItem('mName') || 'Guest';

//   const isPlanExpired = (() => {
//     if (userType === 'forever') return false;
//     if (!subscriptionEndStr) return true; // No date set = treat as expired
//     return new Date(subscriptionEndStr) < new Date();
//   })();

//   const canUseVideo = planLimits.allowVideo;
//   const canUseMultiLang = planLimits.allowMultiLang;
//   const maxSubtopics = planLimits.maxSubtopics;
//   const remainingCourses =
//     planLimits.maxCourses === Infinity
//       ? Infinity
//       : Math.max(planLimits.maxCourses - courseCount, 0);

//   // Calculate login percentage (if logged in, show 100%)
//   const loginProgress = isAuthenticated ? 100 : 0;
  
//   const totalProgress = isAuthenticated ? formProgress : loginProgress;

//   const languages = [
//     { "code": "en", "name": "English" },
//     { "code": "ar", "name": "Arabic" },
//     { "code": "bn", "name": "Bengali" },
//     { "code": "bg", "name": "Bulgarian" },
//     { "code": "zh", "name": "Chinese" },
//     { "code": "hr", "name": "Croatian" },
//     { "code": "cs", "name": "Czech" },
//     { "code": "da", "name": "Danish" },
//     { "code": "nl", "name": "Dutch" },
//     { "code": "et", "name": "Estonian" },
//     { "code": "fi", "name": "Finnish" },
//     { "code": "fr", "name": "French" },
//     { "code": "de", "name": "German" },
//     { "code": "el", "name": "Greek" },
//     { "code": "he", "name": "Hebrew" },
//     { "code": "hi", "name": "Hindi" },
//     { "code": "hu", "name": "Hungarian" },
//     { "code": "id", "name": "Indonesian" },
//     { "code": "it", "name": "Italian" },
//     { "code": "ja", "name": "Japanese" },
//     { "code": "ko", "name": "Korean" },
//     { "code": "lv", "name": "Latvian" },
//     { "code": "lt", "name": "Lithuanian" },
//     { "code": "no", "name": "Norwegian" },
//     { "code": "pl", "name": "Polish" },
//     { "code": "pt", "name": "Portuguese" },
//     { "code": "ro", "name": "Romanian" },
//     { "code": "ru", "name": "Russian" },
//     { "code": "sr", "name": "Serbian" },
//     { "code": "sk", "name": "Slovak" },
//     { "code": "sl", "name": "Slovenian" },
//     { "code": "es", "name": "Spanish" },
//     { "code": "sw", "name": "Swahili" },
//     { "code": "sv", "name": "Swedish" },
//     { "code": "ta", "name": "Tamil" },
//     { "code": "th", "name": "Thai" },
//     { "code": "tr", "name": "Turkish" },
//     { "code": "uk", "name": "Ukrainian" },
//     { "code": "vi", "name": "Vietnamese" }
//   ];

//   useEffect(() => {
//     if (sessionStorage.getItem('role') === 'student') {
//       window.location.href = '/dashboard/student';
//       return;
//     }
//   }, []);

//   useEffect(() => {
//     async function fetchCourseCount() {
//       try {
//         const uid = sessionStorage.getItem('uid');
//         if (!uid) return;

//         const courseRes = await axios.get(`${serverURL}/api/getcourses`);
//         const myCourses = courseRes.data.filter((course: { user: string }) => course.user === uid);
//         setCourseCount(myCourses.length);
//       } catch (error) {
//         console.error('Error fetching course count:', error);
//       }
//     }

//     if (isAuthenticated) {
//       fetchCourseCount();
//     }
//   }, [isAuthenticated]);

//   const form = useForm<CourseFormValues>({
//     resolver: zodResolver(courseFormSchema),
//     defaultValues: {
//       topic: '',
//       subtopics: [],
//       topicsLimit: "5",
//       courseType: "image & text course",
//       language: "English"
//     }
//   });

//   // Calculate form progress whenever form values or subtopics change
//   useEffect(() => {
//     const calculateProgress = () => {
//       let progress = 0;
//       const values = form.getValues();
      
//       // Topic (20%)
//       if (values.topic?.length >= 3) progress += 20;
      
//       // Subtopics (20%)
//       if (subtopics.length > 0) progress += 20;
      
//       // Topics Limit (20%)
//       if (values.topicsLimit) progress += 20;
      
//       // Course Type (20%)
//       if (values.courseType) progress += 20;
      
//       // Language (20%)
//       if (values.language) progress += 20;
      
//       setFormProgress(progress);
//     };

//     calculateProgress();
//   }, [form.watch('topic'), form.watch('topicsLimit'), form.watch('courseType'), form.watch('language'), subtopics]);

//   // Watch form values to update progress on changes
//   useEffect(() => {
//     const subscription = form.watch(() => {
//       const values = form.getValues();
//       let progress = 0;
      
//       if (values.topic?.length >= 3) progress += 20;
//       if (subtopics.length > 0) progress += 20;
//       if (values.topicsLimit) progress += 20;
//       if (values.courseType) progress += 20;
//       if (values.language) progress += 20;
      
//       setFormProgress(progress);
//     });
    
//     return () => subscription.unsubscribe();
//   }, [form, subtopics]);

//   /** Show an upgrade/plan toast when a restricted feature is clicked */
//   const showUpgradeToast = (feature: string) => {
//     toast({
//       title: "Upgrade Required",
//       description: `${feature} is not available on your ${userType} plan. Please upgrade to access this feature.`,
//       variant: "destructive"
//     });
//   };

//   /** Show expiry toast and redirect to pricing */
//   const showExpiryToast = () => {
//     toast({
//       title: "Plan Expired",
//       description: "Your subscription has expired. Please renew your plan to continue generating courses.",
//       variant: "destructive"
//     });
//     setTimeout(() => navigate('/dashboard'), 1500);
//   };

//   const addSubtopic = () => {
//     if (isPlanExpired) {
//       showExpiryToast();
//       return;
//     }
//     if (subtopics.length >= maxSubtopics) {
//       toast({
//         title: "Subtopic Limit Reached",
//         description: `Your ${userType} plan allows a maximum of ${maxSubtopics} subtopics. ${userType === 'free' ? 'Upgrade to get up to 10.' : ''}`,
//         variant: "destructive"
//       });
//       return;
//     }
//     if (subtopicInput.trim() === '') return;
//     const updated = [...subtopics, subtopicInput.trim()];
//     setSubtopics(updated);
//     setSubtopicInput('');
//     form.setValue('subtopics', updated);
//   };

//   const onSubmit = async (data: CourseFormValues) => {
//     // Check authentication first
//     if (!isAuthenticated) {
//       toast({
//         title: "Login Required",
//         description: "Please login to generate courses",
//         variant: "destructive"
//       });
//       setTimeout(() => navigate('/login'), 1500);
//       return;
//     }

//     // Plan expiry gate
//     if (isPlanExpired) {
//       showExpiryToast();
//       return;
//     }

//     setIsLoading(true);
//     setGenerationProgress(10);
//     setProgressMessage("Preparing course generation...");
//     setIsSubmitted(true);

//     const subtopicsList: string[] = [];
//     data.subtopics.forEach(s => subtopicsList.push(s));

//     const mainTopic = data.topic;
//     const language = data.language;
//     const number = data.topicsLimit;

//     // Check if course already exists
//     try {
//       setGenerationProgress(20);
//       setProgressMessage("Checking course availability...");
      
//       const userId = sessionStorage.getItem('uid');
//       const checkURL = serverURL + `/api/check-existence?userId=${userId}&mainTopic=${encodeURIComponent(mainTopic)}`;
//       const checkRes = await axios.get(checkURL);

//       if (checkRes.data.exists) {
//         setIsLoading(false);
//         setGenerationProgress(0);
//         setProgressMessage("");
//         setIsSubmitted(false);
//         toast({
//           title: "Course Already Exists",
//           description: "You have already generated a course with this title. Please try a different topic.",
//           variant: "destructive"
//         });
//         return;
//       }
//     } catch (error) {
//       console.error('Error checking course existence:', error);
//     }

//     const prompt = `Course: "${mainTopic}"
//     Language: ${language}
//     Chapters: ${number}
//     Required Subtopics: ${subtopicsList.join(', ')}

//     Generate a detailed course structure in JSON with exactly ${number} chapters.`;

//     setGenerationProgress(30);
//     setProgressMessage("Sending request to AI...");
//     sendPrompt(prompt);
//   };

//   async function sendPrompt(prompt: string) {
//     const dataToSend = { prompt };
//     try {
//       setGenerationProgress(40);
//       setProgressMessage("AI is thinking...");
      
//       const postURL = serverURL + '/api/prompt';
//       const res = await axios.post(postURL, dataToSend);
      
//       setGenerationProgress(70);
//       setProgressMessage("Processing AI response...");
      
//       const generatedText = res.data.generatedText;

//       if (!generatedText) {
//         setIsLoading(false);
//         setGenerationProgress(0);
//         setProgressMessage("");
//         toast({
//           title: "Error",
//           description: "Course data is not available. Please try generating again.",
//         });
//         return;
//       }

//       setGenerationProgress(85);
//       setProgressMessage("Parsing course structure...");

//       const cleanedJsonString = generatedText.replace(/```json/g, '').replace(/```/g, '');
//       try {
//         const parsedJson = JSON.parse(cleanedJsonString);
        
//         setGenerationProgress(95);
//         setProgressMessage("Finalizing course...");
        
//         setTimeout(() => {
//           setGeneratedTopics(parsedJson);
//           setGenerationProgress(100);
//           setProgressMessage("Course generated successfully!");
          
//           setTimeout(() => {
//             setIsLoading(false);
//             setGenerationProgress(0);
//             setProgressMessage("");
//           }, 500);
//         }, 300);
//       } catch (error: any) {
//         console.error(error);
//         setIsLoading(false);
//         setGenerationProgress(0);
//         setProgressMessage("");
//         toast({
//           title: "Error",
//           description: error.response?.data?.message || error.message || "Internal Server Error",
//         });
//       }
//     } catch (error: any) {
//       setIsLoading(false);
//       setGenerationProgress(0);
//       setProgressMessage("");

//       // Handle backend plan errors gracefully
//       const errData = error.response?.data;
//       if (errData?.planExpired) {
//         showExpiryToast();
//         setIsSubmitted(false);
//         return;
//       }
//       if (errData?.courseLimitReached) {
//         setIsSubmitted(false);
//         toast({
//           title: "Course Limit Reached",
//           description: errData.message,
//           variant: "destructive"
//         });
//         return;
//       }

//       console.error(error);
//       toast({
//         title: "Error",
//         description: errData?.message || error.message || "Internal Server Error",
//       });
//     }
//   }

//   const handleEditTopics = () => {
//     setIsSubmitted(false);
//     setGenerationProgress(0);
//     setProgressMessage("");
//   };

//   const handleLogin = () => {
//     navigate('/login');
//   };

//   if (isCheckingAuth) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center space-y-4">
//           <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
//           <p className="text-muted-foreground">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isSubmitted) {
//     return (
//       <>
//         <SEO
//           title="Generate Course - Preview"
//           description="Preview your AI-generated course before creation"
//           keywords="course generation, preview, AI learning"
//         />
//         {isLoading && (
//           <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
//             <div className="max-w-md mx-auto p-4 space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span>{progressMessage}</span>
//                 <span className="font-mono">{generationProgress}%</span>
//               </div>
//               <Progress value={generationProgress} className="h-2" />
//             </div>
//           </div>
//         )}
//         <CoursePreview
//           isLoading={isLoading}
//           courseName={form.getValues('topic').toLowerCase()}
//           topics={generatedTopics}
//           type={selectedType}
//           lang={lang.toLowerCase()}
//           onClose={handleEditTopics}
//         />
//       </>
//     );
//   }

//   return (
//     <>
//       <SEO
//         title="Generate Course"
//         description="Create a customized AI-generated course"
//         keywords="course generation, AI learning, custom education"
//       />
//       <div className="animate-fade-in max-w-[1400px] mx-auto px-4 py-8 md:py-12">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient bg-gradient-to-r from-primary via-indigo-500 to-purple-600 mb-4 pb-2">
//             AI Course Generator
//           </h1>
//           <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
//             Harness the power of AI to create structured, comprehensive learning paths in seconds.
//           </p>
//         </div>

//         {/* Login Status and Progress Bar */}
//         <div className="max-w-3xl mx-auto mb-8 space-y-4">
//           <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
//             <div className="flex items-center gap-3">
//               {isAuthenticated ? (
//                 <>
//                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//                     <User className="h-5 w-5 text-primary" />
//                   </div>
//                   <div>
//                     <p className="font-semibold">Welcome back, {userName}!</p>
//                     <p className="text-sm text-muted-foreground">You're logged in and ready to create</p>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
//                     <LogIn className="h-5 w-5 text-amber-500" />
//                   </div>
//                   <div>
//                     <p className="font-semibold">Not logged in</p>
//                     <p className="text-sm text-muted-foreground">Please login to generate courses</p>
//                   </div>
//                 </>
//               )}
//             </div>
//             {!isAuthenticated && (
//               <Button onClick={handleLogin} variant="default" size="sm">
//                 <LogIn className="h-4 w-4 mr-2" />
//                 Login
//               </Button>
//             )}
//           </div>

//           {/* Progress Bar */}
//           <div className="space-y-2">
//             <div className="flex justify-between text-sm">
//               <span className="font-medium">Course Setup Progress</span>
//               <span className="text-primary font-mono">{totalProgress}%</span>
//             </div>
//             <Progress value={totalProgress} className="h-2" />
//             <div className="flex justify-between text-xs text-muted-foreground">
//               <span className={isAuthenticated ? "text-primary" : ""}>✓ Login</span>
//               <span className={formProgress >= 20 ? "text-primary" : ""}>✓ Topic</span>
//               <span className={formProgress >= 40 ? "text-primary" : ""}>✓ Subtopics</span>
//               <span className={formProgress >= 60 ? "text-primary" : ""}>✓ Modules</span>
//               <span className={formProgress >= 80 ? "text-primary" : ""}>✓ Format</span>
//               <span className={formProgress >= 100 ? "text-primary" : ""}>✓ Language</span>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
//           {/* Left Column: Instructions */}
//           <div className="lg:col-span-5 space-y-6">
//             <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden border-l-4 border-primary">
//               <CardContent className="p-6 space-y-4">
//                 <h3 className="text-xl font-bold flex items-center gap-2">
//                   <Info className="w-5 h-5 text-primary" /> General Instructions
//                 </h3>
//                 <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
//                   <div className="flex gap-3">
//                     <div className="mt-1 bg-primary/10 p-1.5 rounded-full h-fit"><Lightbulb className="w-4 h-4 text-primary" /></div>
//                     <p><strong>Topic Precision:</strong> Be specific! Instead of just "Python", try "Advanced Asynchronous Programming in Python" for better results.</p>
//                   </div>
//                   <div className="flex gap-3">
//                     <div className="mt-1 bg-primary/10 p-1.5 rounded-full h-fit"><Layers className="w-4 h-4 text-primary" /></div>
//                     <p><strong>Custom Subtopics:</strong> Guide the AI. Use the "Add Sub-topic" field to ensure the course covers the specific niche areas you care about.</p>
//                   </div>
//                   <div className="flex gap-3">
//                     <div className="mt-1 bg-primary/10 p-1.5 rounded-full h-fit"><Type className="w-4 h-4 text-primary" /></div>
//                     <p><strong>Module Depth:</strong> Choose <strong>5 Modules</strong> for a high-level crash course, or <strong>10 Modules</strong> for a deep dive into the subject matter.</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden border-l-4 border-emerald-500">
//               <CardContent className="p-6 space-y-4">
//                 <h3 className="text-xl font-bold flex items-center gap-2">
//                   <Award className="w-5 h-5 text-emerald-500" /> Certification Path
//                 </h3>
//                 <div className="space-y-4 text-sm leading-relaxed text-muted-foreground text-pretty">
//                   <p>Every course generated is eligible for a <strong>Certification of Completion</strong> to validate your learning journey.</p>
//                   <ul className="space-y-2">
//                     <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Complete all generated modules</li>
//                     <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Pass the AI-crafted Final Quiz</li>
//                     <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Achieve a minimum score of 70%</li>
//                   </ul>
//                   <p className="pt-2 text-xs italic">Successful candidates can immediately download their verified PDF certificate from the "My Courses" section.</p>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Plan Info Badge */}
//             {isAuthenticated && !isPlanExpired && (
//               <div className="flex items-start gap-3 p-4 rounded-xl border bg-primary/5 text-sm text-muted-foreground shadow-sm">
//                 <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
//                 <div className="space-y-1">
//                    <p className="font-semibold text-foreground capitalize">{userType} Plan Active</p>
//                    <p>
//                     <strong>{planLimits.maxCourses === Infinity ? 'Unlimited' : planLimits.maxCourses}</strong> course generation{planLimits.maxCourses === 1 ? '' : 's'}. 
//                     <strong>{maxSubtopics}</strong> custom subtopics allowed per generation.
//                    </p>
//                    {subscriptionEndStr && userType !== 'forever' && (
//                     <p className="text-xs opacity-70 italic mt-1">Plan expires on {new Date(subscriptionEndStr).toLocaleDateString()}</p>
//                    )}
//                 </div>
//               </div>
//             )}

//             {/* Stats Check - Only show if authenticated */}
//             {isAuthenticated && (
//               <div className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-muted/20 text-sm">
//                 <div className="flex items-center gap-2">
//                   <Layers className="h-4 w-4 text-indigo-500" />
//                   <span className="font-medium">Courses Created: <span className="text-foreground">{courseCount}</span></span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Sparkles className="h-4 w-4 text-amber-500" />
//                   <span className="font-medium">Remaining: <span className="text-foreground">{planLimits.maxCourses === Infinity ? '∞' : remainingCourses}</span></span>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Right Column: Form */}
//           <div className="lg:col-span-7 space-y-8">
//             {/* Plan Expiry Banner */}
//             {isAuthenticated && isPlanExpired && (
//               <div className="flex items-center gap-3 p-5 rounded-xl border-2 border-destructive/30 bg-destructive/5 text-destructive animate-pulse">
//                 <AlertTriangle className="h-6 w-6 flex-shrink-0" />
//                 <div>
//                   <p className="font-bold">Your subscription has expired</p>
//                   <p className="text-sm mt-0.5 font-medium">Please <a href="/dashboard/pricing" className="underline font-bold hover:text-destructive/80 transition-colors">renew your plan</a> to continue using the AI generator.</p>
//                 </div>
//               </div>
//             )}

//             {/* Not Logged In Banner */}
//             {!isAuthenticated && (
//               <div className="flex items-center gap-3 p-5 rounded-xl border-2 border-amber-500/30 bg-amber-500/5 text-amber-600">
//                 <LogIn className="h-6 w-6 flex-shrink-0" />
//                 <div>
//                   <p className="font-bold">Login Required</p>
//                   <p className="text-sm mt-0.5 font-medium">Please login to generate AI-powered courses and track your progress.</p>
//                 </div>
//               </div>
//             )}

//             <Form {...form}>
//               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                 <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
//                   <div className="bg-primary/5 p-4 md:p-6 border-b">
//                     <h2 className="text-xl font-semibold flex items-center gap-2">
//                       <BookOpen className="w-5 h-5 text-primary" /> Core Information
//                     </h2>
//                     <p className="text-sm text-muted-foreground mt-1">What would you like the AI to teach you?</p>
//                   </div>
//                   <CardContent className="p-4 md:p-6 space-y-8">
//                     <div className="space-y-6">
//                       <FormField
//                         control={form.control}
//                         name="topic"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="text-base font-medium">Course Topic</FormLabel>
//                             <FormControl>
//                               <Input 
//                                 className="h-12 text-base shadow-sm focus-visible:ring-primary/30" 
//                                 placeholder="e.g., Master the Art of Sushi Making" 
//                                 {...field} 
//                                 disabled={!isAuthenticated}
//                               />
//                             </FormControl>
//                           </FormItem>
//                         )}
//                       />

//                       <div className="space-y-3">
//                         <FormLabel className="text-base flex justify-between items-center group">
//                           <span>Advanced Subtopics <span className="text-muted-foreground font-normal text-sm ml-1">(Optional, max {maxSubtopics})</span></span>
//                           <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
//                             {subtopics.length}/{maxSubtopics} Added
//                           </span>
//                         </FormLabel>
//                         <div className="flex gap-2 relative">
//                           <Input
//                             className="h-12 pl-4 shadow-sm bg-background pr-[120px] focus-visible:ring-primary/30"
//                             placeholder="e.g., Data structures, React hooks..."
//                             value={subtopicInput}
//                             onChange={(e) => setSubtopicInput(e.target.value)}
//                             onKeyDown={(e) => {
//                               if (e.key === 'Enter') {
//                                 e.preventDefault();
//                                 addSubtopic();
//                               }
//                             }}
//                             disabled={!isAuthenticated}
//                           />
//                           <Button
//                             type="button"
//                             onClick={addSubtopic}
//                             className="absolute right-1.5 top-1.5 bottom-1.5 h-9"
//                             variant="secondary"
//                             disabled={!isAuthenticated}
//                           >
//                             <Plus className="mr-1 h-4 w-4" />
//                             Add
//                           </Button>
//                         </div>

//                         {subtopics.length > 0 && (
//                           <div className="flex flex-wrap gap-2 mt-3 animate-in fade-in slide-in-from-top-2">
//                             {subtopics.map((topic, index) => (
//                               <div key={index} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-medium">
//                                 <span>{topic}</span>
//                                 <Button
//                                   type="button"
//                                   variant="ghost"
//                                   size="sm"
//                                   className="h-5 w-5 p-0 rounded-full hover:bg-primary/20 hover:text-primary transition-colors"
//                                   onClick={() => {
//                                     const newSubtopics = subtopics.filter((_, i) => i !== index);
//                                     setSubtopics(newSubtopics);
//                                     form.setValue('subtopics', newSubtopics);
//                                   }}
//                                   disabled={!isAuthenticated}
//                                 >
//                                   ×
//                                 </Button>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
//                   <div className="bg-primary/5 p-4 md:p-6 border-b flex items-center justify-between">
//                     <div>
//                       <h2 className="text-xl font-semibold flex items-center gap-2">
//                         <Layers className="w-5 h-5 text-indigo-500" /> Structure & Format
//                       </h2>
//                       <p className="text-sm text-muted-foreground mt-1">Configure depth and media preferences.</p>
//                     </div>
//                   </div>
//                   <CardContent className="p-4 md:p-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                       {/* Number of Modules */}
//                       <div className="space-y-3">
//                         <FormLabel className="text-base font-medium flex items-center gap-2">
//                           Number of Modules
//                         </FormLabel>
//                         <FormField
//                           control={form.control}
//                           name="topicsLimit"
//                           render={({ field }) => (
//                             <FormItem className="mt-2">
//                               <FormControl>
//                                 <div className="space-y-2">
//                                   <div 
//                                     className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${field.value === "5" ? 'bg-primary/5 border-primary shadow-sm' : 'hover:border-primary/40 bg-background'} ${maxSubtopics < 5 || !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
//                                     onClick={() => { if (isAuthenticated && maxSubtopics >= 5) { setSelectedValue("5"); field.onChange("5"); } }}
//                                   >
//                                     <div className="flex-1 flex items-center justify-between pointer-events-none">
//                                       <div className="space-y-1">
//                                         <div className="font-semibold text-base text-foreground">5 Modules</div>
//                                         <p className="text-xs text-muted-foreground">Quick overview</p>
//                                       </div>
//                                       <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${field.value === "5" ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
//                                         {field.value === "5" && <CheckCircle2 className="w-3.5 h-3.5" />}
//                                       </div>
//                                     </div>
//                                   </div>

//                                   <div
//                                     onClick={() => { 
//                                       if (!isAuthenticated) return;
//                                       if (maxSubtopics < 10) showUpgradeToast('10 topics per course'); 
//                                       else { setSelectedValue("10"); field.onChange("10"); } 
//                                     }}
//                                     className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${field.value === "10" ? 'bg-indigo-50/50 border-indigo-500 shadow-sm' : 'hover:border-indigo-500/40 bg-background'} ${maxSubtopics < 10 || !isAuthenticated ? 'opacity-50 hover:border-border cursor-not-allowed' : ''}`}
//                                   >
//                                     <div className="flex-1 flex items-center justify-between pointer-events-none">
//                                       <div className="space-y-1">
//                                         <div className="font-semibold text-base text-foreground flex items-center gap-1.5">
//                                           10 Modules
//                                           {maxSubtopics < 10 && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
//                                         </div>
//                                         <p className="text-xs text-muted-foreground">In-depth guide</p>
//                                       </div>
//                                       <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${field.value === "10" ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-muted-foreground/30'}`}>
//                                         {field.value === "10" && <CheckCircle2 className="w-3.5 h-3.5" />}
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </FormControl>
//                             </FormItem>
//                           )}
//                         />
//                       </div>

//                       {/* Content Format */}
//                       <div className="space-y-3">
//                         <FormLabel className="text-base font-medium flex items-center gap-2">
//                            Content Format
//                         </FormLabel>
//                         <FormField
//                           control={form.control}
//                           name="courseType"
//                           render={({ field }) => (
//                             <FormItem className="mt-2">
//                               <FormControl>
//                                 <div className="space-y-2">
//                                   <div 
//                                     className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${field.value === "image & text course" ? 'bg-primary/5 border-primary shadow-sm' : 'hover:border-primary/40 bg-background'} ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
//                                     onClick={() => { if (isAuthenticated) { setSelectedType("image & text course"); field.onChange("image & text course"); } }}
//                                   >
//                                     <div className="flex-1 flex items-center justify-between pointer-events-none">
//                                       <div className="space-y-1">
//                                         <div className="font-semibold text-base text-foreground">Text & Images</div>
//                                         <p className="text-xs text-muted-foreground">Articles + Illustrations</p>
//                                       </div>
//                                       <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${field.value === "image & text course" ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
//                                         {field.value === "image & text course" && <CheckCircle2 className="w-3.5 h-3.5" />}
//                                       </div>
//                                     </div>
//                                   </div>

//                                   <div
//                                     onClick={() => { 
//                                       if (!isAuthenticated) return;
//                                       if (!canUseVideo) showUpgradeToast('Video & Theory courses'); 
//                                       else { setSelectedType("video & text course"); field.onChange("video & text course"); }
//                                     }}
//                                     className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${field.value === "video & text course" ? 'bg-indigo-50/50 border-indigo-500 shadow-sm' : 'hover:border-indigo-500/40 bg-background'} ${!canUseVideo || !isAuthenticated ? 'opacity-50 hover:border-border cursor-not-allowed' : ''}`}
//                                   >
//                                     <div className="flex-1 flex items-center justify-between pointer-events-none">
//                                       <div className="space-y-1">
//                                         <div className="font-semibold text-base text-foreground flex items-center gap-1.5">
//                                           Video & Text
//                                           {!canUseVideo && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
//                                         </div>
//                                         <p className="text-xs text-muted-foreground">Video lessons + Theory</p>
//                                       </div>
//                                       <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${field.value === "video & text course" ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-muted-foreground/30'}`}>
//                                         {field.value === "video & text course" && <CheckCircle2 className="w-3.5 h-3.5" />}
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </FormControl>
//                             </FormItem>
//                           )}
//                         />
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
//                   <div className="bg-primary/5 p-4 md:p-6 border-b flex items-center justify-between">
//                     <div>
//                       <h2 className="text-xl font-semibold flex items-center gap-2">
//                         <Globe className="w-5 h-5 text-emerald-500" /> Localization
//                       </h2>
//                       <p className="text-sm text-muted-foreground mt-1">Select the course language.</p>
//                     </div>
//                   </div>
//                   <CardContent className="p-4 md:p-6 text-pretty">
//                     <div className="max-w-md">
//                       <FormField
//                         control={form.control}
//                         name="language"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="flex items-center gap-2 text-base font-medium">
//                               Course Language
//                               {!canUseMultiLang && <span className="text-xs text-muted-foreground font-normal">(Multi-lang on Yearly plan)</span>}
//                             </FormLabel>
//                             <Select
//                               onValueChange={(val) => {
//                                 if (!isAuthenticated) return;
//                                 if (!canUseMultiLang && val !== 'English') {
//                                   showUpgradeToast('Multi-language support (23+ languages)');
//                                   return;
//                                 }
//                                 setLang(val);
//                                 field.onChange(val);
//                               }}
//                               value={lang}
//                               disabled={!isAuthenticated}
//                             >
//                               <FormControl>
//                                 <SelectTrigger className="h-12 shadow-sm focus:ring-emerald-500/30">
//                                   <SelectValue placeholder="Select language" />
//                                 </SelectTrigger>
//                               </FormControl>
//                               <SelectContent>
//                                 {languages.map((country) => (
//                                   <SelectItem
//                                     key={country.code}
//                                     value={country.name}
//                                     disabled={(!canUseMultiLang && country.name !== 'English') || !isAuthenticated}
//                                   >
//                                     {country.name}
//                                     {!canUseMultiLang && country.name !== 'English' && ' 🔒'}
//                                   </SelectItem>
//                                 ))}
//                               </SelectContent>
//                             </Select>
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <div className="pt-4 pb-12">
//                   <Button
//                     type="submit"
//                     disabled={!isAuthenticated || isPlanExpired || isLoading}
//                     size="lg"
//                     className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white disabled:opacity-50"
//                   >
//                     {!isAuthenticated ? (
//                       <>
//                         <LogIn className="mr-2 h-5 w-5" />
//                         Login to Generate
//                       </>
//                     ) : isLoading ? (
//                       <>
//                         <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                         {progressMessage || "Generating..."}
//                       </>
//                     ) : isPlanExpired ? (
//                       'Plan Expired — Renew to Generate'
//                     ) : (
//                       <>
//                         <Sparkles className="mr-2 h-5 w-5" />
//                         Generate Course Now
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </Form>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default GenerateCourse;

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Sparkles, Plus, Lock, AlertTriangle, BookOpen, Layers, Type, Globe, CheckCircle2, Info, Lightbulb, Award, CheckCircle, User, LogIn, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CoursePreview from '@/components/CoursePreview';
import SEO from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

// ─── Plan limits (mirrors server/config/planLimits.js) ─────────────────────
const PLAN_LIMITS: Record<string, { maxCourses: number; maxSubtopics: number; allowVideo: boolean; allowMultiLang: boolean }> = {
  free: { maxCourses: 1, maxSubtopics: 5, allowVideo: false, allowMultiLang: false },
  monthly: { maxCourses: 20, maxSubtopics: 10, allowVideo: true, allowMultiLang: false },
  yearly: { maxCourses: Infinity, maxSubtopics: 10, allowVideo: true, allowMultiLang: true },
  forever: { maxCourses: Infinity, maxSubtopics: 10, allowVideo: true, allowMultiLang: true },
};

const courseFormSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters" }),
  subtopics: z.array(z.string()),
  topicsLimit: z.enum(["5", "10"]),
  courseType: z.enum(["image & text course", "video & text course"]),
  language: z.string().min(1, { message: "Please select a language" })
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

const GenerateCourse = () => {
  const [subtopicInput, setSubtopicInput] = useState('');
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState({});
  const [selectedValue, setSelectedValue] = useState('5');
  const [selectedType, setSelectedType] = useState('image & text course');
  const [lang, setLang] = useState('English');
  const [courseCount, setCourseCount] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [formProgress, setFormProgress] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // ─── Check Authentication Status ───────────────────────────────────────────
  useEffect(() => {
    const checkAuth = () => {
      const uid = sessionStorage.getItem('uid');
      const userType = sessionStorage.getItem('type');
      const userName = sessionStorage.getItem('mName');
      
      if (uid && userType && userName) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  // ─── Derived plan state ───────────────────────────────────────────────────
  const userType = (sessionStorage.getItem('type') || 'free') as string;
  const subscriptionEndStr = sessionStorage.getItem('subscriptionEnd') || '';
  const planLimits = PLAN_LIMITS[userType] || PLAN_LIMITS.free;
  const userName = sessionStorage.getItem('mName') || 'Guest';

  const isPlanExpired = (() => {
    if (userType === 'forever') return false;
    if (!subscriptionEndStr) return true; // No date set = treat as expired
    return new Date(subscriptionEndStr) < new Date();
  })();

  const canUseVideo = planLimits.allowVideo;
  const canUseMultiLang = planLimits.allowMultiLang;
  const maxSubtopics = planLimits.maxSubtopics;
  const remainingCourses =
    planLimits.maxCourses === Infinity
      ? Infinity
      : Math.max(planLimits.maxCourses - courseCount, 0);

  // Calculate login percentage (if logged in, show 100%)
  const loginProgress = isAuthenticated ? 100 : 0;
  
  const totalProgress = isAuthenticated ? formProgress : loginProgress;

  const languages = [
    { "code": "en", "name": "English" },
    { "code": "ar", "name": "Arabic" },
    { "code": "bn", "name": "Bengali" },
    { "code": "bg", "name": "Bulgarian" },
    { "code": "zh", "name": "Chinese" },
    { "code": "hr", "name": "Croatian" },
    { "code": "cs", "name": "Czech" },
    { "code": "da", "name": "Danish" },
    { "code": "nl", "name": "Dutch" },
    { "code": "et", "name": "Estonian" },
    { "code": "fi", "name": "Finnish" },
    { "code": "fr", "name": "French" },
    { "code": "de", "name": "German" },
    { "code": "el", "name": "Greek" },
    { "code": "he", "name": "Hebrew" },
    { "code": "hi", "name": "Hindi" },
    { "code": "hu", "name": "Hungarian" },
    { "code": "id", "name": "Indonesian" },
    { "code": "it", "name": "Italian" },
    { "code": "ja", "name": "Japanese" },
    { "code": "ko", "name": "Korean" },
    { "code": "lv", "name": "Latvian" },
    { "code": "lt", "name": "Lithuanian" },
    { "code": "no", "name": "Norwegian" },
    { "code": "pl", "name": "Polish" },
    { "code": "pt", "name": "Portuguese" },
    { "code": "ro", "name": "Romanian" },
    { "code": "ru", "name": "Russian" },
    { "code": "sr", "name": "Serbian" },
    { "code": "sk", "name": "Slovak" },
    { "code": "sl", "name": "Slovenian" },
    { "code": "es", "name": "Spanish" },
    { "code": "sw", "name": "Swahili" },
    { "code": "sv", "name": "Swedish" },
    { "code": "ta", "name": "Tamil" },
    { "code": "th", "name": "Thai" },
    { "code": "tr", "name": "Turkish" },
    { "code": "uk", "name": "Ukrainian" },
    { "code": "vi", "name": "Vietnamese" }
  ];

  useEffect(() => {
    if (sessionStorage.getItem('role') === 'student') {
      window.location.href = '/dashboard/student';
      return;
    }
  }, []);

  useEffect(() => {
    async function fetchCourseCount() {
      try {
        const uid = sessionStorage.getItem('uid');
        if (!uid) return;

        const courseRes = await axios.get(`${serverURL}/api/getcourses`);
        const myCourses = courseRes.data.filter((course: { user: string }) => course.user === uid);
        setCourseCount(myCourses.length);
      } catch (error) {
        console.error('Error fetching course count:', error);
      }
    }

    if (isAuthenticated) {
      fetchCourseCount();
    }
  }, [isAuthenticated]);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      topic: '',
      subtopics: [],
      topicsLimit: "5",
      courseType: "image & text course",
      language: "English"
    }
  });

  // Calculate form progress whenever form values or subtopics change
  useEffect(() => {
    const calculateProgress = () => {
      let progress = 0;
      const values = form.getValues();
      
      // Topic (20%)
      if (values.topic?.length >= 3) progress += 20;
      
      // Subtopics (20%)
      if (subtopics.length > 0) progress += 20;
      
      // Topics Limit (20%)
      if (values.topicsLimit) progress += 20;
      
      // Course Type (20%)
      if (values.courseType) progress += 20;
      
      // Language (20%)
      if (values.language) progress += 20;
      
      setFormProgress(progress);
    };

    calculateProgress();
  }, [form.watch('topic'), form.watch('topicsLimit'), form.watch('courseType'), form.watch('language'), subtopics]);

  // Watch form values to update progress on changes
  useEffect(() => {
    const subscription = form.watch(() => {
      const values = form.getValues();
      let progress = 0;
      
      if (values.topic?.length >= 3) progress += 20;
      if (subtopics.length > 0) progress += 20;
      if (values.topicsLimit) progress += 20;
      if (values.courseType) progress += 20;
      if (values.language) progress += 20;
      
      setFormProgress(progress);
    });
    
    return () => subscription.unsubscribe();
  }, [form, subtopics]);

  /** Show an upgrade/plan toast when a restricted feature is clicked */
  const showUpgradeToast = (feature: string) => {
    toast({
      title: "Upgrade Required",
      description: `${feature} is not available on your ${userType} plan. Please upgrade to access this feature.`,
      variant: "destructive"
    });
  };

  /** Show expiry toast and redirect to pricing */
  const showExpiryToast = () => {
    toast({
      title: "Plan Expired",
      description: "Your subscription has expired. Please renew your plan to continue generating courses.",
      variant: "destructive"
    });
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  const addSubtopic = () => {
    if (isPlanExpired) {
      showExpiryToast();
      return;
    }
    if (subtopics.length >= maxSubtopics) {
      toast({
        title: "Subtopic Limit Reached",
        description: `Your ${userType} plan allows a maximum of ${maxSubtopics} subtopics. ${userType === 'free' ? 'Upgrade to get up to 10.' : ''}`,
        variant: "destructive"
      });
      return;
    }
    if (subtopicInput.trim() === '') return;
    const updated = [...subtopics, subtopicInput.trim()];
    setSubtopics(updated);
    setSubtopicInput('');
    form.setValue('subtopics', updated);
  };

  const onSubmit = async (data: CourseFormValues) => {
    // Check authentication first
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to generate courses",
        variant: "destructive"
      });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    // Plan expiry gate
    if (isPlanExpired) {
      showExpiryToast();
      return;
    }

    setIsLoading(true);
    setGenerationProgress(10);
    setProgressMessage("Preparing course generation...");
    setIsSubmitted(true);

    const subtopicsList: string[] = [];
    data.subtopics.forEach(s => subtopicsList.push(s));

    const mainTopic = data.topic;
    const language = data.language;
    const number = data.topicsLimit;

    // Check if course already exists
    try {
      setGenerationProgress(20);
      setProgressMessage("Checking course availability...");
      
      const userId = sessionStorage.getItem('uid');
      const checkURL = serverURL + `/api/check-existence?userId=${userId}&mainTopic=${encodeURIComponent(mainTopic)}`;
      const checkRes = await axios.get(checkURL);

      if (checkRes.data.exists) {
        setIsLoading(false);
        setGenerationProgress(0);
        setProgressMessage("");
        setIsSubmitted(false);
        toast({
          title: "Course Already Exists",
          description: "You have already generated a course with this title. Please try a different topic.",
          variant: "destructive"
        });
        return;
      }
    } catch (error) {
      console.error('Error checking course existence:', error);
    }

    const prompt = `Course: "${mainTopic}"
    Language: ${language}
    Chapters: ${number}
    Required Subtopics: ${subtopicsList.join(', ')}

    Generate a detailed course structure in JSON with exactly ${number} chapters.`;

    setGenerationProgress(30);
    setProgressMessage("Sending request to AI...");
    sendPrompt(prompt);
  };

  async function sendPrompt(promptText: string) {
    const dataToSend = { 
      prompt: promptText,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          course_topics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                subtopics: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" }
                    },
                    required: ["title"]
                  }
                }
              },
              required: ["title", "subtopics"]
            }
          }
        },
        required: ["course_topics"]
      }
    };

    try {
      setGenerationProgress(40);
      setProgressMessage("AI is thinking...");
      
      const postURL = serverURL + '/api/prompt';
      const res = await axios.post(postURL, dataToSend);
      
      setGenerationProgress(70);
      setProgressMessage("Processing AI response...");
      
      const generatedText = res.data.generatedText;

      if (!generatedText) {
        setIsLoading(false);
        setGenerationProgress(0);
        setProgressMessage("");
        toast({
          title: "Error",
          description: "Course data is not available. Please try generating again.",
        });
        return;
      }

      setGenerationProgress(85);
      setProgressMessage("Parsing course structure...");

      try {
        const parsedJson = JSON.parse(generatedText);
        
        setGenerationProgress(95);
        setProgressMessage("Finalizing course...");
        
        setTimeout(() => {
          setGeneratedTopics(parsedJson);
          setGenerationProgress(100);
          setProgressMessage("Course generated successfully!");
          
          setTimeout(() => {
            setIsLoading(false);
            setGenerationProgress(0);
            setProgressMessage("");
          }, 500);
        }, 300);
      } catch (error: any) {
        console.error(error);
        setIsLoading(false);
        setGenerationProgress(0);
        setProgressMessage("");
        toast({
          title: "Error",
          description: error.response?.data?.message || error.message || "Internal Server Error",
        });
      }
    } catch (error: any) {
      setIsLoading(false);
      setGenerationProgress(0);
      setProgressMessage("");

      // Handle backend plan errors gracefully
      const errData = error.response?.data;
      if (errData?.planExpired) {
        showExpiryToast();
        setIsSubmitted(false);
        return;
      }
      if (errData?.courseLimitReached) {
        setIsSubmitted(false);
        toast({
          title: "Course Limit Reached",
          description: errData.message,
          variant: "destructive"
        });
        return;
      }

      console.error(error);
      toast({
        title: "Error",
        description: errData?.message || error.message || "Internal Server Error",
      });
    }
  }

  const handleEditTopics = () => {
    setIsSubmitted(false);
    setGenerationProgress(0);
    setProgressMessage("");
  };

  const handleLogin = () => {
    navigate('/login');
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <>
        <SEO
          title="Generate Course - Preview"
          description="Preview your AI-generated course before creation"
          keywords="course generation, preview, AI learning"
        />
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="max-w-md w-full mx-auto p-8 space-y-6 bg-card rounded-2xl shadow-2xl border border-primary/20">
              <div className="text-center space-y-2">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <h3 className="text-xl font-semibold">Generating Your Course</h3>
                <p className="text-muted-foreground">Please wait while our AI creates your personalized learning path</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{progressMessage}</span>
                    <span className="text-primary font-mono">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-3" />
                </div>

                <div className="grid grid-cols-5 gap-2 text-xs text-center">
                  <div className={`p-2 rounded-lg ${generationProgress >= 20 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <div className="font-bold">1</div>
                    <div className="truncate">Prep</div>
                  </div>
                  <div className={`p-2 rounded-lg ${generationProgress >= 40 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <div className="font-bold">2</div>
                    <div className="truncate">Check</div>
                  </div>
                  <div className={`p-2 rounded-lg ${generationProgress >= 70 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <div className="font-bold">3</div>
                    <div className="truncate">AI</div>
                  </div>
                  <div className={`p-2 rounded-lg ${generationProgress >= 85 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <div className="font-bold">4</div>
                    <div className="truncate">Parse</div>
                  </div>
                  <div className={`p-2 rounded-lg ${generationProgress >= 95 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <div className="font-bold">5</div>
                    <div className="truncate">Final</div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-center italic">
                  This may take up to 30 seconds
                </div>
              </div>
            </div>
          </div>
        )}
        <CoursePreview
          isLoading={isLoading}
          courseName={form.getValues('topic').toLowerCase()}
          topics={generatedTopics}
          type={selectedType}
          lang={lang.toLowerCase()}
          onClose={handleEditTopics}
        />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Generate Course"
        description="Create a customized AI-generated course"
        keywords="course generation, AI learning, custom education"
      />
      <div className="animate-fade-in max-w-[1400px] mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient bg-gradient-to-r from-primary via-indigo-500 to-purple-600 mb-4 pb-2">
            AI Course Generator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Harness the power of AI to create structured, comprehensive learning paths in seconds.
          </p>
        </div>

        {/* Login Status and Progress Bar */}
        <div className="max-w-3xl mx-auto mb-8 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Welcome back, {userName}!</p>
                    <p className="text-sm text-muted-foreground">You're logged in and ready to create</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <LogIn className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Not logged in</p>
                    <p className="text-sm text-muted-foreground">Please login to generate courses</p>
                  </div>
                </>
              )}
            </div>
            {!isAuthenticated && (
              <Button onClick={handleLogin} variant="default" size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Course Setup Progress</span>
              <span className="text-primary font-mono">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className={isAuthenticated ? "text-primary" : ""}>✓ Login</span>
              <span className={formProgress >= 20 ? "text-primary" : ""}>✓ Topic</span>
              <span className={formProgress >= 40 ? "text-primary" : ""}>✓ Subtopics</span>
              <span className={formProgress >= 60 ? "text-primary" : ""}>✓ Modules</span>
              <span className={formProgress >= 80 ? "text-primary" : ""}>✓ Format</span>
              <span className={formProgress >= 100 ? "text-primary" : ""}>✓ Language</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Instructions */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden border-l-4 border-primary">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" /> General Instructions
                </h3>
                <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <div className="flex gap-3">
                    <div className="mt-1 bg-primary/10 p-1.5 rounded-full h-fit"><Lightbulb className="w-4 h-4 text-primary" /></div>
                    <p><strong>Topic Precision:</strong> Be specific! Instead of just "Python", try "Advanced Asynchronous Programming in Python" for better results.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 bg-primary/10 p-1.5 rounded-full h-fit"><Layers className="w-4 h-4 text-primary" /></div>
                    <p><strong>Custom Subtopics:</strong> Guide the AI. Use the "Add Sub-topic" field to ensure the course covers the specific niche areas you care about.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 bg-primary/10 p-1.5 rounded-full h-fit"><Type className="w-4 h-4 text-primary" /></div>
                    <p><strong>Module Depth:</strong> Choose <strong>5 Modules</strong> for a high-level crash course, or <strong>10 Modules</strong> for a deep dive into the subject matter.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden border-l-4 border-emerald-500">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-500" /> Certification Path
                </h3>
                <div className="space-y-4 text-sm leading-relaxed text-muted-foreground text-pretty">
                  <p>Every course generated is eligible for a <strong>Certification of Completion</strong> to validate your learning journey.</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Complete all generated modules</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Pass the AI-crafted Final Quiz</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Achieve a minimum score of 70%</li>
                  </ul>
                  <p className="pt-2 text-xs italic">Successful candidates can immediately download their verified PDF certificate from the "My Courses" section.</p>
                </div>
              </CardContent>
            </Card>

            {/* Plan Info Badge */}
            {isAuthenticated && !isPlanExpired && (
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-primary/5 text-sm text-muted-foreground shadow-sm">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                   <p className="font-semibold text-foreground capitalize">{userType} Plan Active</p>
                   <p>
                    <strong>{planLimits.maxCourses === Infinity ? 'Unlimited' : planLimits.maxCourses}</strong> course generation{planLimits.maxCourses === 1 ? '' : 's'}. 
                    <strong>{maxSubtopics}</strong> custom subtopics allowed per generation.
                   </p>
                   {subscriptionEndStr && userType !== 'forever' && (
                    <p className="text-xs opacity-70 italic mt-1">Plan expires on {new Date(subscriptionEndStr).toLocaleDateString()}</p>
                   )}
                </div>
              </div>
            )}

            {/* Stats Check - Only show if authenticated */}
            {isAuthenticated && (
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-muted/20 text-sm">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium">Courses Created: <span className="text-foreground">{courseCount}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Remaining: <span className="text-foreground">{planLimits.maxCourses === Infinity ? '∞' : remainingCourses}</span></span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7 space-y-8">
            {/* Plan Expiry Banner */}
            {isAuthenticated && isPlanExpired && (
              <div className="flex items-center gap-3 p-5 rounded-xl border-2 border-destructive/30 bg-destructive/5 text-destructive animate-pulse">
                <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                <div>
                  <p className="font-bold">Your subscription has expired</p>
                  <p className="text-sm mt-0.5 font-medium">Please <a href="/dashboard/pricing" className="underline font-bold hover:text-destructive/80 transition-colors">renew your plan</a> to continue using the AI generator.</p>
                </div>
              </div>
            )}

            {/* Not Logged In Banner */}
            {!isAuthenticated && (
              <div className="flex items-center gap-3 p-5 rounded-xl border-2 border-amber-500/30 bg-amber-500/5 text-amber-600">
                <LogIn className="h-6 w-6 flex-shrink-0" />
                <div>
                  <p className="font-bold">Login Required</p>
                  <p className="text-sm mt-0.5 font-medium">Please login to generate AI-powered courses and track your progress.</p>
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="bg-primary/5 p-4 md:p-6 border-b">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" /> Core Information
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">What would you like the AI to teach you?</p>
                  </div>
                  <CardContent className="p-4 md:p-6 space-y-8">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="topic"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Course Topic</FormLabel>
                            <FormControl>
                              <Input 
                                className="h-12 text-base shadow-sm focus-visible:ring-primary/30" 
                                placeholder="Start with a topic you’re curious about" 
                                {...field} 
                                disabled={!isAuthenticated}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="space-y-3">
                        <FormLabel className="text-base flex justify-between items-center group">
                          <span>Advanced Subtopics <span className="text-muted-foreground font-normal text-sm ml-1">(Optional, max {maxSubtopics})</span></span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            {subtopics.length}/{maxSubtopics} Added
                          </span>
                        </FormLabel>
                        <div className="flex gap-2 relative">
                          <Input
                            className="h-12 pl-4 shadow-sm bg-background pr-[120px] focus-visible:ring-primary/30"
                            placeholder="e.g., Data structures, React hooks..."
                            value={subtopicInput}
                            onChange={(e) => setSubtopicInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addSubtopic();
                              }
                            }}
                            disabled={!isAuthenticated}
                          />
                          <Button
                            type="button"
                            onClick={addSubtopic}
                            className="absolute right-1.5 top-1.5 bottom-1.5 h-9"
                            variant="secondary"
                            disabled={!isAuthenticated}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Add
                          </Button>
                        </div>

                        {subtopics.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3 animate-in fade-in slide-in-from-top-2">
                            {subtopics.map((topic, index) => (
                              <div key={index} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-medium">
                                <span>{topic}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 rounded-full hover:bg-primary/20 hover:text-primary transition-colors"
                                  onClick={() => {
                                    const newSubtopics = subtopics.filter((_, i) => i !== index);
                                    setSubtopics(newSubtopics);
                                    form.setValue('subtopics', newSubtopics);
                                  }}
                                  disabled={!isAuthenticated}
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="bg-primary/5 p-4 md:p-6 border-b flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-500" /> Structure & Format
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">Configure depth and media preferences.</p>
                    </div>
                  </div>
                  <CardContent className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Number of Modules */}
                      <div className="space-y-3">
                        <FormLabel className="text-base font-medium flex items-center gap-2">
                          Number of Modules
                        </FormLabel>
                        <FormField
                          control={form.control}
                          name="topicsLimit"
                          render={({ field }) => (
                            <FormItem className="mt-2">
                              <FormControl>
                                <div className="space-y-2">
                                  <div 
                                    className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${field.value === "5" ? 'bg-primary/5 border-primary shadow-sm' : 'hover:border-primary/40 bg-background'} ${maxSubtopics < 5 || !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => { if (isAuthenticated && maxSubtopics >= 5) { setSelectedValue("5"); field.onChange("5"); } }}
                                  >
                                    <div className="flex-1 flex items-center justify-between pointer-events-none">
                                      <div className="space-y-1">
                                        <div className="font-semibold text-base text-foreground">5 Modules</div>
                                        <p className="text-xs text-muted-foreground">Quick overview</p>
                                      </div>
                                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${field.value === "5" ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                                        {field.value === "5" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                      </div>
                                    </div>
                                  </div>

                                  <div
                                    onClick={() => { 
                                      if (!isAuthenticated) return;
                                      if (maxSubtopics < 10) showUpgradeToast('10 topics per course'); 
                                      else { setSelectedValue("10"); field.onChange("10"); } 
                                    }}
                                    className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${field.value === "10" ? 'bg-indigo-50/50 border-indigo-500 shadow-sm' : 'hover:border-indigo-500/40 bg-background'} ${maxSubtopics < 10 || !isAuthenticated ? 'opacity-50 hover:border-border cursor-not-allowed' : ''}`}
                                  >
                                    <div className="flex-1 flex items-center justify-between pointer-events-none">
                                      <div className="space-y-1">
                                        <div className="font-semibold text-base text-foreground flex items-center gap-1.5">
                                          10 Modules
                                          {maxSubtopics < 10 && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground">In-depth guide</p>
                                      </div>
                                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${field.value === "10" ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-muted-foreground/30'}`}>
                                        {field.value === "10" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Content Format */}
                      <div className="space-y-3">
                        <FormLabel className="text-base font-medium flex items-center gap-2">
                           Content Format
                        </FormLabel>
                        <FormField
                          control={form.control}
                          name="courseType"
                          render={({ field }) => (
                            <FormItem className="mt-2">
                              <FormControl>
                                <div className="space-y-2">
                                  <div 
                                    className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${field.value === "image & text course" ? 'bg-primary/5 border-primary shadow-sm' : 'hover:border-primary/40 bg-background'} ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => { if (isAuthenticated) { setSelectedType("image & text course"); field.onChange("image & text course"); } }}
                                  >
                                    <div className="flex-1 flex items-center justify-between pointer-events-none">
                                      <div className="space-y-1">
                                        <div className="font-semibold text-base text-foreground">Text & Images</div>
                                        <p className="text-xs text-muted-foreground">Articles + Illustrations</p>
                                      </div>
                                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${field.value === "image & text course" ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                                        {field.value === "image & text course" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                      </div>
                                    </div>
                                  </div>

                                  <div
                                    onClick={() => { 
                                      if (!isAuthenticated) return;
                                      if (!canUseVideo) showUpgradeToast('Video & Theory courses'); 
                                      else { setSelectedType("video & text course"); field.onChange("video & text course"); }
                                    }}
                                    className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${field.value === "video & text course" ? 'bg-indigo-50/50 border-indigo-500 shadow-sm' : 'hover:border-indigo-500/40 bg-background'} ${!canUseVideo || !isAuthenticated ? 'opacity-50 hover:border-border cursor-not-allowed' : ''}`}
                                  >
                                    <div className="flex-1 flex items-center justify-between pointer-events-none">
                                      <div className="space-y-1">
                                        <div className="font-semibold text-base text-foreground flex items-center gap-1.5">
                                          Video & Text
                                          {!canUseVideo && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Video lessons + Theory</p>
                                      </div>
                                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${field.value === "video & text course" ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-muted-foreground/30'}`}>
                                        {field.value === "video & text course" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="bg-primary/5 p-4 md:p-6 border-b flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Globe className="w-5 h-5 text-emerald-500" /> Localization
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">Select the course language.</p>
                    </div>
                  </div>
                  <CardContent className="p-4 md:p-6 text-pretty">
                    <div className="max-w-md">
                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-base font-medium">
                              Course Language
                              {!canUseMultiLang && <span className="text-xs text-muted-foreground font-normal">(Multi-lang on Yearly plan)</span>}
                            </FormLabel>
                            <Select
                              onValueChange={(val) => {
                                if (!isAuthenticated) return;
                                if (!canUseMultiLang && val !== 'English') {
                                  showUpgradeToast('Multi-language support (23+ languages)');
                                  return;
                                }
                                setLang(val);
                                field.onChange(val);
                              }}
                              value={lang}
                              disabled={!isAuthenticated}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12 shadow-sm focus:ring-emerald-500/30">
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {languages.map((country) => (
                                  <SelectItem
                                    key={country.code}
                                    value={country.name}
                                    disabled={(!canUseMultiLang && country.name !== 'English') || !isAuthenticated}
                                  >
                                    {country.name}
                                    {!canUseMultiLang && country.name !== 'English' && ' 🔒'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="pt-4 pb-12">
                  <Button
                    type="submit"
                    disabled={!isAuthenticated || isPlanExpired || isLoading}
                    size="lg"
                    className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white disabled:opacity-50"
                  >
                    {!isAuthenticated ? (
                      <>
                        <LogIn className="mr-2 h-5 w-5" />
                        Login to Generate
                      </>
                    ) : isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {progressMessage || "Generating..."}
                      </>
                    ) : isPlanExpired ? (
                      'Plan Expired — Renew to Generate'
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Course Now
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default GenerateCourse;