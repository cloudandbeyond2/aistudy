// import React, { useState, useEffect } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { useToast } from '@/hooks/use-toast';
// import axios from 'axios';
// import { serverURL } from '@/constants';
// import Swal from 'sweetalert2';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   Check, X, Clock, Eye, ArrowUpCircle, TrendingUp, Users, 
//   BookOpen, AlertCircle, Filter, Search, ChevronRight, 
//   Calendar, User, Building2, Sparkles, BarChart3, 
//   CheckCircle2, XCircle, Clock8, EyeIcon, RefreshCw,
//   Award, Target, Zap, Shield, Loader2, Mail, Phone,
//   LayoutGrid, List, Menu, X as CloseIcon, FileQuestion,
//   FileText, Layers, Globe, Star
// } from 'lucide-react';

// // Type definitions for better TypeScript support
// type AnimationVariant = {
//   initial: {
//     opacity: number;
//     y?: number;
//     x?: number;
//     scale?: number;
//   };
//   animate: {
//     opacity: number;
//     y?: number;
//     x?: number;
//     scale?: number;
//     transition?: {
//       type: "spring" | "tween" | "keyframes" | "inertia";
//       stiffness?: number;
//       damping?: number;
//       duration?: number;
//       delay?: number;
//     };
//   };
//   exit?: {
//     opacity: number;
//     y?: number;
//     x?: number;
//     scale?: number;
//     transition?: {
//       duration: number;
//     };
//   };
// };

// const ApprovalsTab = () => {
//     const [searchParams] = useSearchParams();
//     const navigate = useNavigate();
//     const role = sessionStorage.getItem('role');
//     const deptId = sessionStorage.getItem('deptId');
//     const { toast } = useToast();
    
//     // Core state for approvals
//     const [courses, setCourses] = useState([]);
//     const [deptLimitRequests, setDeptLimitRequests] = useState([]);
//     const [userDeptName, setUserDeptName] = useState('');
//     const [userDeptId, setUserDeptId] = useState(deptId || '');
//     const [departmentsList, setDepartmentsList] = useState([]);
//     const [previewCourse, setPreviewCourse] = useState(null);
//     const [activeApprovalTab, setActiveApprovalTab] = useState('requests');
//     const [searchQuery, setSearchQuery] = useState('');
//     const [selectedDepartment, setSelectedDepartment] = useState('all');
//     const [refreshing, setRefreshing] = useState(false);
//     const [viewMode, setViewMode] = useState('grid');
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//     const [animateTabChange, setAnimateTabChange] = useState(false);
//     const [hoveredTab, setHoveredTab] = useState(null);
    
//     const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');

//     // Helper functions
//     const getDepartmentValue = (value) => {
//         if (!value) return '';
//         if (typeof value === 'string') return value;
//         if (typeof value === 'object') return value._id || value.name || '';
//         return '';
//     };
    

//     const getDepartmentLabel = (value) => {
//         const normalizedValue = getDepartmentValue(value);
//         if (!normalizedValue || normalizedValue === 'all') return '';
//         return departmentsList.find((d) => d._id === normalizedValue || d.name === normalizedValue)?.name || normalizedValue;
//     };

//     const getInitials = (name) => {
//         return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'NA';
//     };

//     // Fetch functions
//     const fetchOrgDepartments = async () => {
//         try {
//             const res = await axios.get(`${serverURL}/api/org/departments?organizationId=${orgId}`);
//             if (res.data.success) setDepartmentsList(res.data.departments);
//         } catch (e) {
//             console.error("Failed to fetch departments", e);
//         }
//     };

//     const fetchCourses = async () => {
//         try {
//             const res = await axios.get(`${serverURL}/api/org/courses?organizationId=${orgId}`);
//             if (res.data.success) {
//                 let coursesData = res.data.courses;
//                 if (role === 'dept_admin') {
//                     coursesData = coursesData.filter((c) =>
//                         (userDeptName && c.department === userDeptName) ||
//                         (deptId && (c.departmentId === deptId || c.department === deptId))
//                     );
//                 }
//                 setCourses(coursesData);
//             }
//         } catch (e) {
//             console.error(e);
//         }
//     };

//     const fetchDeptLimitRequests = async () => {
//         try {
//             const endpoint = role === 'dept_admin' 
//                 ? `${serverURL}/api/org/dept-admin/course-limit/requests?organizationId=${orgId}&deptAdminId=${sessionStorage.getItem('uid')}`
//                 : `${serverURL}/api/org/dept-admin/course-limit/requests?organizationId=${orgId}`;
//             const res = await axios.get(endpoint);
//             if (res.data.success) {
//                 setDeptLimitRequests(res.data.requests);
//             }
//         } catch (e) {
//             console.error("Failed to fetch dept limit requests", e);
//         }
//     };

//     const refreshAllData = async () => {
//         setRefreshing(true);
//         await Promise.all([fetchCourses(), fetchDeptLimitRequests(), fetchOrgDepartments()]);
//         setRefreshing(false);
//         toast({ title: "Refreshed", description: "All approval data has been updated" });
//     };

//     // Approval handlers
//     const handleReviewOrgCourse = async (courseId, approvalStatus, approvalNote = '') => {
//         const reviewerId = sessionStorage.getItem('uid') || '';
//         if (!reviewerId) return;
//         try {
//             const res = await axios.post(`${serverURL}/api/org/course/${courseId}/review`, {
//                 reviewerId,
//                 approvalStatus,
//                 approvalNote
//             });
//             if (res.data?.success) {
//                 toast({ title: "Success", description: res.data.message || "Course updated" });
//                 fetchCourses();
//             } else {
//                 toast({ title: "Error", description: res.data?.message || "Failed to update course" });
//             }
//         } catch (e) {
//             toast({ title: "Error", description: e.response?.data?.message || e.message || "Request failed" });
//         }
//     };

//     const handleProcessDeptCourseLimitRequest = async (requestId, status, adminComment = '') => {
//         try {
//             const orgAdminId = sessionStorage.getItem('uid') || '';
//             const res = await axios.post(`${serverURL}/api/org/dept-admin/course-limit/process`, {
//                 organizationId: orgId,
//                 orgAdminId,
//                 requestId,
//                 status,
//                 adminComment
//             });

//             if (res.data.success) {
//                 toast({ title: "Success", description: `Request ${status} successfully` });
//                 fetchDeptLimitRequests();
//             } else {
//                 toast({ title: "Error", description: res.data.message || `Failed to ${status} request`, variant: "destructive" });
//             }
//         } catch (e) {
//             toast({ title: "Error", description: e.response?.data?.message || e.message || `Failed to ${status} request`, variant: "destructive" });
//         }
//     };

//     // Effects
//     useEffect(() => {
//         if (!orgId) {
//             console.warn('No organization ID found. Please log out and log back in.');
//             return;
//         }
//         fetchCourses();
//         fetchOrgDepartments();
//         fetchDeptLimitRequests();
//     }, [orgId]);

//     useEffect(() => {
//         if (role === 'dept_admin' && deptId && departmentsList.length > 0 && !userDeptName) {
//             const myDept = departmentsList.find((d) => d._id === deptId);
//             if (myDept) {
//                 setUserDeptName(myDept.name);
//                 setUserDeptId(myDept._id);
//             }
//         }
//     }, [departmentsList, deptId, role, userDeptName]);

//     useEffect(() => {
//         setAnimateTabChange(true);
//         const timer = setTimeout(() => setAnimateTabChange(false), 300);
//         return () => clearTimeout(timer);
//     }, [activeApprovalTab]);

//     // Filter pending items
//     const pendingLimitRequests = deptLimitRequests.filter((r) => r.status === 'pending');
//     const pendingCourses = courses.filter((c) => {
//         const isOrgCourse = Boolean(c?.title && !c?.content);
//         if (!isOrgCourse) return false;
//         const approval = c?.approvalStatus || 'pending';
//         return approval === 'pending';
//     });

//     // Filtered data
//     const filteredLimitRequests = pendingLimitRequests.filter(request => {
//         const matchesSearch = request.deptAdminId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                              request.deptAdminId?.email?.toLowerCase().includes(searchQuery.toLowerCase());
//         const matchesDept = selectedDepartment === 'all' || 
//                             request.deptAdminId?.department?._id === selectedDepartment ||
//                             request.deptAdminId?.department === selectedDepartment;
//         return matchesSearch && matchesDept;
//     });

//     const filteredCourses = pendingCourses.filter(course => {
//         const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                              course.createdBy?.name?.toLowerCase().includes(searchQuery.toLowerCase());
//         const matchesDept = selectedDepartment === 'all' || 
//                             course.department === selectedDepartment ||
//                             course.departmentId === selectedDepartment;
//         return matchesSearch && matchesDept;
//     });

//     // Statistics
//     const totalPending = pendingLimitRequests.length + pendingCourses.length;
//     const coursePendingCount = pendingCourses.length;
//     const requestPendingCount = pendingLimitRequests.length;

//     // Corrected animation variants with proper easing types
//     const tabButtonVariants = {
//         initial: { 
//             scale: 1,
//             transition: { type: "spring" as const, stiffness: 400, damping: 17 }
//         },
//         hover: { 
//             scale: 1.05,
//             y: -2,
//             transition: { type: "spring" as const, stiffness: 400, damping: 10 }
//         },
//         tap: { 
//             scale: 0.95,
//             transition: { type: "spring" as const, stiffness: 400, damping: 17 }
//         },
//         active: { 
//             scale: 1,
//             y: 0,
//             transition: { type: "spring" as const, stiffness: 400, damping: 17 }
//         }
//     };

//     const iconVariants = {
//         initial: { rotate: 0, scale: 1 },
//         hover: { rotate: 15, scale: 1.2, transition: { type: "spring" as const, stiffness: 300 } },
//         active: { rotate: 0, scale: 1.1, transition: { type: "spring" as const, stiffness: 300 } }
//     };

//     const badgeVariants = {
//         initial: { scale: 0, opacity: 0 },
//         animate: { scale: 1, opacity: 1, transition: { type: "spring" as const, stiffness: 500, damping: 15 } },
//         hover: { scale: 1.1, transition: { type: "spring" as const, stiffness: 400 } }
//     };

//     // Corrected pulse animation with proper easing
//     const pulseAnimation = {
//         scale: [1, 1.05, 1],
//         transition: {
//             duration: 2,
//             repeat: Infinity,
//             ease: "easeInOut" as const
//         }
//     };

//     // Corrected float animation with proper easing
//     const floatAnimation = {
//         y: [0, -10, 0],
//         transition: {
//             duration: 3,
//             repeat: Infinity,
//             ease: "easeInOut" as const
//         }
//     };

//     const containerVariants = {
//         hidden: { opacity: 0 },
//         visible: {
//             opacity: 1,
//             transition: {
//                 staggerChildren: 0.1,
//                 delayChildren: 0.2,
//                 type: "tween" as const,
//                 duration: 0.3
//             }
//         }
//     };

//     const itemVariants = {
//         hidden: { y: 20, opacity: 0 },
//         visible: {
//             y: 0,
//             opacity: 1,
//             transition: { 
//                 type: "spring" as const, 
//                 stiffness: 100,
//                 damping: 12
//             }
//         }
//     };

//     const fadeInUp = {
//         initial: { opacity: 0, y: 30 },
//         animate: { 
//             opacity: 1, 
//             y: 0,
//             transition: {
//                 type: "spring" as const,
//                 stiffness: 100,
//                 damping: 15,
//                 duration: 0.5
//             }
//         }
//     };

//     const slideInRight = {
//         initial: { x: 50, opacity: 0 },
//         animate: { 
//             x: 0, 
//             opacity: 1,
//             transition: {
//                 type: "spring" as const,
//                 stiffness: 100,
//                 damping: 15
//             }
//         }
//     };

//     const tabContentVariants = {
//         enter: (direction: string) => ({
//             x: direction === 'requests' ? -50 : 50,
//             opacity: 0,
//             scale: 0.95
//         }),
//         center: {
//             x: 0,
//             opacity: 1,
//             scale: 1,
//             transition: {
//                 type: "spring" as const,
//                 stiffness: 300,
//                 damping: 25,
//                 duration: 0.3
//             }
//         },
//         exit: (direction: string) => ({
//             x: direction === 'requests' ? 50 : -50,
//             opacity: 0,
//             scale: 0.95,
//             transition: {
//                 duration: 0.2
//             }
//         })
//     };

//     // Get the direction for tab animation
//     const getTabDirection = () => {
//         return activeApprovalTab === 'requests' ? 'requests' : 'courses';
//     };

//     return (
//         <>
//             {role === 'org_admin' && (
//                 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
//                     <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
//                         {/* Header Section with Float Animation */}
//                         <motion.div 
//                             variants={fadeInUp}
//                             initial="initial"
//                             animate="animate"
//                             className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
//                         >
//                             <div className="space-y-2">
//                                 <motion.div 
//                                     animate={floatAnimation}
//                                     className="flex items-center gap-3"
//                                 >
//                                     <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
//                                         <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
//                                     </div>
//                                     <div>
//                                         <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
//                                             Approval Center
//                                         </h1>
//                                         <p className="text-sm sm:text-base text-muted-foreground">
//                                             Review and manage course and limit increase requests
//                                         </p>
//                                     </div>
//                                 </motion.div>
//                             </div>
                            
//                             <motion.div 
//                                 variants={slideInRight}
//                                 initial="initial"
//                                 animate="animate"
//                                 className="flex items-center gap-3"
//                             >
//                                 <Button 
//                                     variant="outline" 
//                                     className="gap-2 text-sm sm:text-base relative overflow-hidden group"
//                                     onClick={refreshAllData}
//                                     disabled={refreshing}
//                                 >
//                                     <motion.div
//                                         animate={refreshing ? { rotate: 360 } : {}}
//                                         transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                                     >
//                                         {refreshing ? (
//                                             <Loader2 className="h-4 w-4" />
//                                         ) : (
//                                             <RefreshCw className="h-4 w-4" />
//                                         )}
//                                     </motion.div>
//                                     <span className="hidden sm:inline">Refresh</span>
//                                 </Button>
//                             </motion.div>
//                         </motion.div>

//                         {/* Stats Cards with Enhanced Animations */}
//                         <motion.div 
//                             variants={containerVariants}
//                             initial="hidden"
//                             animate="visible"
//                             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
//                         >
//                             {[
//                                 { label: "Total Pending", value: totalPending, desc: "Items awaiting review", icon: AlertCircle, color: "blue", gradient: "from-blue-500 to-blue-600" },
//                                 { label: "Course Approvals", value: coursePendingCount, desc: "Courses waiting approval", icon: BookOpen, color: "emerald", gradient: "from-emerald-500 to-teal-600" },
//                                 { label: "Limit Requests", value: requestPendingCount, desc: "Course limit increase", icon: TrendingUp, color: "purple", gradient: "from-purple-500 to-pink-600" },
//                                 { label: "Avg. Response Time", value: "24h", desc: "Typical approval time", icon: Clock, color: "amber", gradient: "from-amber-500 to-orange-600" }
//                             ].map((stat, idx) => (
//                                 <motion.div 
//                                     key={idx} 
//                                     variants={itemVariants}
//                                     whileHover={{ scale: 1.05, y: -5 }}
//                                     transition={{ type: "spring", stiffness: 300 }}
//                                 >
//                                     <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 hover:shadow-2xl transition-all duration-300 overflow-hidden group">
//                                         <CardContent className="p-4 sm:p-6 relative">
//                                             <motion.div 
//                                                 className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
//                                             />
//                                             <div className="flex items-center justify-between">
//                                                 <div>
//                                                     <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.label}</p>
//                                                     <motion.p 
//                                                         initial={{ scale: 0 }}
//                                                         animate={{ scale: 1 }}
//                                                         transition={{ type: "spring", delay: idx * 0.1 }}
//                                                         className="text-2xl sm:text-3xl font-bold mt-2"
//                                                     >
//                                                         {stat.value}
//                                                     </motion.p>
//                                                     <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
//                                                 </div>
//                                                 <motion.div 
//                                                     whileHover={{ rotate: 12, scale: 1.1 }}
//                                                     className={`h-10 w-10 sm:h-12 sm:w-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-xl flex items-center justify-center`}
//                                                 >
//                                                     <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
//                                                 </motion.div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 </motion.div>
//                             ))}
//                         </motion.div>
  
//                         {/* Pending Courses Section with Enhanced Design */}
//                         <motion.div
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
//                         >
//                             <Card className="border-none shadow-xl bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-800/50 overflow-hidden">
//                                 <CardHeader className="px-0 pt-0">
//                                     <motion.div 
//                                         initial={{ x: -20, opacity: 0 }}
//                                         animate={{ x: 0, opacity: 1 }}
//                                         transition={{ delay: 0.4 }}
//                                         className="px-6 pt-6"
//                                     >
//                                         <CardTitle className="text-2xl flex items-center gap-2">
//                                             <motion.div
//                                                 animate={pulseAnimation}
//                                                 className="inline-block"
//                                             >
//                                                 <Clock className="w-6 h-6 text-blue-500" />
//                                             </motion.div>
//                                             Pending Approval Requests
//                                         </CardTitle>
//                                         <CardDescription>Review and approve courses submitted by department admins or other staff members.</CardDescription>
//                                     </motion.div>
//                                 </CardHeader>
//                                 <CardContent className="px-4 space-y-4">
//                                     {courses.filter((c: any) => c.approvalStatus === 'pending').length > 0 ? (
//                                         <div className="grid gap-4">
//                                             {courses.filter((c: any) => c.approvalStatus === 'pending').map((course: any, idx: number) => (
//                                                 <motion.div
//                                                     key={course._id}
//                                                     initial={{ opacity: 0, x: -30 }}
//                                                     animate={{ opacity: 1, x: 0 }}
//                                                     transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
//                                                     whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
//                                                     className="group p-6 border rounded-2xl bg-card hover:shadow-md transition-all duration-300 border-blue-100 hover:border-blue-200"
//                                                 >
//                                                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//                                                         <div className="flex-1 space-y-1">
//                                                             <div className="flex items-center gap-2">
//                                                                 <motion.h3 
//                                                                     whileHover={{ x: 5 }}
//                                                                     className="font-bold text-xl text-foreground group-hover:text-blue-600 transition-colors capitalize"
//                                                                 >
//                                                                     {course.title || course.mainTopic}
//                                                                 </motion.h3>
//                                                                 <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
//                                                                     {departmentsList.find(d => d._id === course.department || d.name === course.department)?.name || course.department || 'General'}
//                                                                 </Badge>
//                                                             </div>
//                                                             <p className="text-muted-foreground line-clamp-2 text-sm italic">"{course.description || 'No description provided'}"</p>
//                                                             <div className="flex flex-wrap gap-4 mt-3 text-xs font-semibold text-muted-foreground items-center">
//                                                                 <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
//                                                                     <BookOpen className="w-3.5 h-3.5 text-blue-500" />
//                                                                     <span>{course.topics?.length || 0} Lessons</span>
//                                                                 </div>
//                                                                 <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
//                                                                     <FileQuestion className="w-3.5 h-3.5 text-indigo-500" />
//                                                                     <span>{course.quizzes?.length || 0} Quizzes</span>
//                                                                 </div>
//                                                                 <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
//                                                                     <Calendar className="w-3.5 h-3.5 text-emerald-500" />
//                                                                     <span>Submitted: {new Date(course.updatedAt || course.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                         <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
//                                                             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                                                                 <Button 
//                                                                     variant="outline" 
//                                                                     size="sm" 
//                                                                     className="flex-1 md:flex-none h-10 px-4 rounded-xl border-blue-200 hover:bg-blue-50 hover:text-blue-600"
//                                                                     onClick={() => setPreviewCourse({ ...course })}
//                                                                 >
//                                                                     <Eye className="w-4 h-4 mr-2" /> Preview
//                                                                 </Button>
//                                                             </motion.div>
//                                                             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                                                                 <Button 
//                                                                     className="flex-1 md:flex-none h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200"
//                                                                     size="sm"
//                                                                     onClick={() => handleReviewOrgCourse(course._id, 'approved', 'Course approved for students.')}
//                                                                 >
//                                                                     <Check className="w-4 h-4 mr-2" /> Approve
//                                                                 </Button>
//                                                             </motion.div>
//                                                             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                                                                 <Button 
//                                                                     variant="ghost" 
//                                                                     size="sm"
//                                                                     className="flex-1 md:flex-none h-10 px-4 rounded-xl text-destructive hover:bg-red-50 hover:text-red-600"
//                                                                     onClick={async () => {
//                                                                         const result = await Swal.fire({
//                                                                             title: 'Reject this course?',
//                                                                             input: 'textarea',
//                                                                             inputLabel: 'Feedback for the creator',
//                                                                             inputPlaceholder: 'Explain what needs to be changed before approval...',
//                                                                             showCancelButton: true,
//                                                                             confirmButtonText: 'Reject Course',
//                                                                             confirmButtonColor: '#dc2626',
//                                                                             cancelButtonText: 'Cancel',
//                                                                             customClass: {
//                                                                                 popup: 'rounded-3xl',
//                                                                                 confirmButton: 'rounded-xl',
//                                                                                 cancelButton: 'rounded-xl'
//                                                                             }
//                                                                         });

//                                                                         if (result.isConfirmed) {
//                                                                             await handleReviewOrgCourse(course._id, 'rejected', String(result.value || ''));
//                                                                         }
//                                                                     }}
//                                                                 >
//                                                                     <X className="w-4 h-4 mr-2" /> Reject
//                                                                 </Button>
//                                                             </motion.div>
//                                                         </div>
//                                                     </div>
//                                                 </motion.div>
//                                             ))}
//                                         </div>
//                                     ) : (
//                                         <motion.div 
//                                             initial={{ scale: 0.9, opacity: 0 }}
//                                             animate={{ scale: 1, opacity: 1 }}
//                                             transition={{ type: "spring", stiffness: 200 }}
//                                             className="flex flex-col items-center justify-center py-20 bg-muted/20 border-2 border-dashed rounded-3xl animate-in fade-in zoom-in duration-500"
//                                         >
//                                             <motion.div 
//                                                 animate={{ rotate: [0, 10, -10, 0] }}
//                                                 transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
//                                                 className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4"
//                                             >
//                                                 <CheckCircle2 className="w-8 h-8" />
//                                             </motion.div>
//                                             <h3 className="text-xl font-bold text-foreground">All Caught Up!</h3>
//                                             <p className="text-muted-foreground text-center max-w-xs mt-2">
//                                                 There are no courses waiting for your approval at this time.
//                                             </p>
//                                         </motion.div>
//                                     )}
//                                 </CardContent>
//                             </Card>
//                         </motion.div>

//                         {/* Enhanced Tabs Section with Beautiful Animations */}
//                         <motion.div
//                             initial={{ opacity: 0, y: 30 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
//                         >
//                             <Card className="border-0 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm overflow-hidden">
//                                 <CardContent className="p-0">
//                                     <div className="border-b px-4 sm:px-6 pt-4 sm:pt-6">
//                                         <div className="flex items-center justify-between">
//                                             <div className="flex gap-2 relative">
//                                                 {/* Animated Tab Buttons */}
//                                                 <motion.button
//                                                     onClick={() => setActiveApprovalTab('requests')}
//                                                     variants={tabButtonVariants}
//                                                     initial="initial"
//                                                     animate={activeApprovalTab === 'requests' ? "active" : "initial"}
//                                                     whileHover="hover"
//                                                     whileTap="tap"
//                                                     onHoverStart={() => setHoveredTab('requests')}
//                                                     onHoverEnd={() => setHoveredTab(null)}
//                                                     className={`relative px-4 sm:px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 ${
//                                                         activeApprovalTab === 'requests'
//                                                             ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
//                                                             : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
//                                                     }`}
//                                                 >
//                                                     <motion.div
//                                                         variants={iconVariants}
//                                                         initial="initial"
//                                                         animate={hoveredTab === 'requests' ? "hover" : activeApprovalTab === 'requests' ? "active" : "initial"}
//                                                     >
//                                                         <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
//                                                     </motion.div>
//                                                     <span className="font-medium text-sm sm:text-base">
//                                                         Limit Requests
//                                                     </span>
//                                                     {requestPendingCount > 0 && (
//                                                         <motion.div
//                                                             variants={badgeVariants}
//                                                             initial="initial"
//                                                             animate="animate"
//                                                             whileHover="hover"
//                                                         >
//                                                             <Badge 
//                                                                 variant="secondary" 
//                                                                 className={`ml-1 text-xs ${
//                                                                     activeApprovalTab === 'requests'
//                                                                         ? 'bg-white/20 text-white hover:bg-white/30'
//                                                                         : 'bg-blue-100 text-blue-700'
//                                                                 }`}
//                                                             >
//                                                                 {requestPendingCount}
//                                                             </Badge>
//                                                         </motion.div>
//                                                     )}
//                                                     {activeApprovalTab === 'requests' && (
//                                                         <motion.div
//                                                             layoutId="activeTabBackground"
//                                                             className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 -z-10"
//                                                             initial={false}
//                                                             transition={{ type: "spring", stiffness: 300, damping: 30 }}
//                                                         />
//                                                     )}
//                                                 </motion.button>

//                                                 <motion.button
//                                                     onClick={() => setActiveApprovalTab('courses')}
//                                                     variants={tabButtonVariants}
//                                                     initial="initial"
//                                                     animate={activeApprovalTab === 'courses' ? "active" : "initial"}
//                                                     whileHover="hover"
//                                                     whileTap="tap"
//                                                     onHoverStart={() => setHoveredTab('courses')}
//                                                     onHoverEnd={() => setHoveredTab(null)}
//                                                     className={`relative px-4 sm:px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 ${
//                                                         activeApprovalTab === 'courses'
//                                                             ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
//                                                             : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
//                                                     }`}
//                                                 >
//                                                     <motion.div
//                                                         variants={iconVariants}
//                                                         initial="initial"
//                                                         animate={hoveredTab === 'courses' ? "hover" : activeApprovalTab === 'courses' ? "active" : "initial"}
//                                                     >
//                                                         <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
//                                                     </motion.div>
//                                                     <span className="font-medium text-sm sm:text-base">
//                                                         Course Approvals
//                                                     </span>
//                                                     {coursePendingCount > 0 && (
//                                                         <motion.div
//                                                             variants={badgeVariants}
//                                                             initial="initial"
//                                                             animate="animate"
//                                                             whileHover="hover"
//                                                         >
//                                                             <Badge 
//                                                                 variant="secondary" 
//                                                                 className={`ml-1 text-xs ${
//                                                                     activeApprovalTab === 'courses'
//                                                                         ? 'bg-white/20 text-white hover:bg-white/30'
//                                                                         : 'bg-emerald-100 text-emerald-700'
//                                                                 }`}
//                                                             >
//                                                                 {coursePendingCount}
//                                                             </Badge>
//                                                         </motion.div>
//                                                     )}
//                                                     {activeApprovalTab === 'courses' && (
//                                                         <motion.div
//                                                             layoutId="activeTabBackground"
//                                                             className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 -z-10"
//                                                             initial={false}
//                                                             transition={{ type: "spring", stiffness: 300, damping: 30 }}
//                                                         />
//                                                     )}
//                                                 </motion.button>

//                                                 {/* Animated Underline Indicator */}
//                                                 <motion.div
//                                                     className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
//                                                     initial={false}
//                                                     animate={{
//                                                         width: activeApprovalTab === 'requests' ? 'calc(50% - 4px)' : 'calc(50% - 4px)',
//                                                         x: activeApprovalTab === 'requests' ? 0 : 'calc(100% + 4px)',
//                                                     }}
//                                                     transition={{ type: "spring", stiffness: 300, damping: 30 }}
//                                                 />
//                                             </div>
                                            
//                                             {/* View Toggle for Desktop */}
//                                             {activeApprovalTab === 'requests' && filteredLimitRequests.length > 0 && (
//                                                 <div className="hidden sm:flex gap-2">
//                                                     <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
//                                                         <Button
//                                                             variant={viewMode === 'grid' ? 'default' : 'outline'}
//                                                             size="sm"
//                                                             onClick={() => setViewMode('grid')}
//                                                             className="gap-2"
//                                                         >
//                                                             <LayoutGrid className="h-4 w-4" />
//                                                         </Button>
//                                                     </motion.div>
//                                                     <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
//                                                         <Button
//                                                             variant={viewMode === 'list' ? 'default' : 'outline'}
//                                                             size="sm"
//                                                             onClick={() => setViewMode('list')}
//                                                             className="gap-2"
//                                                         >
//                                                             <List className="h-4 w-4" />
//                                                         </Button>
//                                                     </motion.div>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* Filters with Animation */}
//                                     <motion.div 
//                                         initial={{ y: -20, opacity: 0 }}
//                                         animate={{ y: 0, opacity: 1 }}
//                                         transition={{ delay: 0.6 }}
//                                         className="p-4 sm:p-6 border-b"
//                                     >
//                                         <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
//                                             <div className="relative flex-1">
//                                                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                                                 <input
//                                                     type="text"
//                                                     placeholder={`Search ${activeApprovalTab === 'requests' ? 'staff members...' : 'courses...'}`}
//                                                     value={searchQuery}
//                                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                                     className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
//                                                 />
//                                             </div>
//                                             <select
//                                                 value={selectedDepartment}
//                                                 onChange={(e) => setSelectedDepartment(e.target.value)}
//                                                 className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
//                                             >
//                                                 <option value="all">All Departments</option>
//                                                 {departmentsList.map((dept) => (
//                                                     <option key={dept._id} value={dept._id}>{dept.name}</option>
//                                                 ))}
//                                             </select>
//                                         </div>
//                                     </motion.div>

//                                     {/* Animated Tab Content */}
//                                     <AnimatePresence mode="wait" custom={getTabDirection()}>
//                                         {/* Limit Requests Tab */}
//                                         {activeApprovalTab === 'requests' && (
//                                             <motion.div
//                                                 key="requests"
//                                                 custom={getTabDirection()}
//                                                 variants={tabContentVariants}
//                                                 initial="enter"
//                                                 animate="center"
//                                                 exit="exit"
//                                                 className="p-4 sm:p-6"
//                                             >
//                                                 {filteredLimitRequests.length === 0 ? (
//                                                     <motion.div 
//                                                         initial={{ scale: 0.9, opacity: 0 }}
//                                                         animate={{ scale: 1, opacity: 1 }}
//                                                         transition={{ type: "spring", stiffness: 200 }}
//                                                         className="text-center py-12"
//                                                     >
//                                                         <motion.div 
//                                                             animate={{ rotate: [0, 360] }}
//                                                             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
//                                                             className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4"
//                                                         >
//                                                             <CheckCircle2 className="h-8 w-8 text-green-500" />
//                                                         </motion.div>
//                                                         <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
//                                                         <p className="text-muted-foreground">No pending limit increase requests at the moment</p>
//                                                     </motion.div>
//                                                 ) : (
//                                                     <motion.div 
//                                                         variants={containerVariants}
//                                                         initial="hidden"
//                                                         animate="visible"
//                                                         className={`${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6' : 'space-y-4'}`}
//                                                     >
//                                                         {filteredLimitRequests.map((request, idx) => (
//                                                             <motion.div
//                                                                 key={request._id}
//                                                                 variants={itemVariants}
//                                                                 whileHover={{ scale: 1.02, y: -5 }}
//                                                                 transition={{ type: "spring", stiffness: 300 }}
//                                                                 className="group relative overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-xl transition-all duration-300"
//                                                             >
//                                                                 <motion.div 
//                                                                     className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//                                                                     initial={false}
//                                                                     animate={false}
//                                                                 />
//                                                                 <div className="p-4 sm:p-6 relative">
//                                                                     <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
//                                                                         <div className="flex items-center gap-3 sm:gap-4">
//                                                                             <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
//                                                                                 <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-blue-100 dark:ring-blue-900">
//                                                                                     <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
//                                                                                         {getInitials(request.deptAdminId?.name)}
//                                                                                     </AvatarFallback>
//                                                                                 </Avatar>
//                                                                             </motion.div>
//                                                                             <div>
//                                                                                 <h3 className="font-semibold text-base sm:text-lg">
//                                                                                     {request.deptAdminId?.name || 'Department Admin'}
//                                                                                 </h3>
//                                                                                 <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
//                                                                                     <Mail className="h-3 w-3" />
//                                                                                     <span className="truncate">{request.deptAdminId?.email || 'No email'}</span>
//                                                                                 </div>
//                                                                             </div>
//                                                                         </div>
//                                                                         <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 self-start sm:self-auto">
//                                                                             <Clock className="w-3 h-3 mr-1" />
//                                                                             Pending
//                                                                         </Badge>
//                                                                     </div>

//                                                                     <div className="space-y-3 mb-4">
//                                                                         <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
//                                                                             <div className="flex items-center gap-2">
//                                                                                 <TrendingUp className="h-4 w-4 text-blue-500" />
//                                                                                 <span className="text-xs sm:text-sm font-medium">Requested Limit</span>
//                                                                             </div>
//                                                                             <motion.span 
//                                                                                 initial={{ scale: 0 }}
//                                                                                 animate={{ scale: 1 }}
//                                                                                 transition={{ type: "spring", stiffness: 200, delay: idx * 0.1 }}
//                                                                                 className="text-base sm:text-lg font-bold text-blue-600"
//                                                                             >
//                                                                                 {request.requestedCourseLimit} courses
//                                                                             </motion.span>
//                                                                         </div>
                                                                        
//                                                                         <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-muted-foreground">
//                                                                             <div className="flex items-center gap-2">
//                                                                                 <Building2 className="h-4 w-4" />
//                                                                                 <span>Dept: {request.deptAdminId?.department?.name || 'N/A'}</span>
//                                                                             </div>
//                                                                             <div className="flex items-center gap-2">
//                                                                                 <Calendar className="h-4 w-4" />
//                                                                                 <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
//                                                                             </div>
//                                                                         </div>
//                                                                     </div>

//                                                                     <div className="flex flex-col sm:flex-row gap-2 pt-2">
//                                                                         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
//                                                                             <Button
//                                                                                 className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md text-sm"
//                                                                                 size="sm"
//                                                                                 onClick={() => handleProcessDeptCourseLimitRequest(request._id, 'approved')}
//                                                                             >
//                                                                                 <Check className="w-4 h-4 mr-2" />
//                                                                                 Approve
//                                                                             </Button>
//                                                                         </motion.div>
//                                                                         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
//                                                                             <Button
//                                                                                 variant="outline"
//                                                                                 size="sm"
//                                                                                 className="w-full border-red-200 text-red-600 hover:bg-red-50 text-sm"
//                                                                                 onClick={async () => {
//                                                                                     const result = await Swal.fire({
//                                                                                         title: 'Reject Request?',
//                                                                                         input: 'textarea',
//                                                                                         inputLabel: 'Reason (optional)',
//                                                                                         inputPlaceholder: 'Enter reason for rejection...',
//                                                                                         showCancelButton: true,
//                                                                                         confirmButtonText: 'Reject',
//                                                                                         confirmButtonColor: '#dc2626'
//                                                                                     });
//                                                                                     if (result.isConfirmed) {
//                                                                                         await handleProcessDeptCourseLimitRequest(request._id, 'rejected', result.value || '');
//                                                                                     }
//                                                                                 }}
//                                                                             >
//                                                                                 <X className="w-4 h-4 mr-2" />
//                                                                                 Reject
//                                                                             </Button>
//                                                                         </motion.div>
//                                                                     </div>
//                                                                 </div>
//                                                             </motion.div>
//                                                         ))}
//                                                     </motion.div>
//                                                 )}
//                                             </motion.div>
//                                         )}

//                                         {/* Course Approvals Tab */}
//                                         {activeApprovalTab === 'courses' && (
//                                             <motion.div
//                                                 key="courses"
//                                                 custom={getTabDirection()}
//                                                 variants={tabContentVariants}
//                                                 initial="enter"
//                                                 animate="center"
//                                                 exit="exit"
//                                                 className="p-4 sm:p-6"
//                                             >
//                                                 {filteredCourses.length === 0 ? (
//                                                     <motion.div 
//                                                         initial={{ scale: 0.9, opacity: 0 }}
//                                                         animate={{ scale: 1, opacity: 1 }}
//                                                         transition={{ type: "spring", stiffness: 200 }}
//                                                         className="text-center py-12"
//                                                     >
//                                                         <motion.div 
//                                                             animate={{ rotate: [0, 360] }}
//                                                             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
//                                                             className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4"
//                                                         >
//                                                             <CheckCircle2 className="h-8 w-8 text-green-500" />
//                                                         </motion.div>
//                                                         <h3 className="text-lg font-semibold mb-2">No Pending Courses</h3>
//                                                         <p className="text-muted-foreground">All courses have been reviewed and approved</p>
//                                                     </motion.div>
//                                                 ) : (
//                                                     <motion.div 
//                                                         variants={containerVariants}
//                                                         initial="hidden"
//                                                         animate="visible"
//                                                         className="space-y-4"
//                                                     >
//                                                         {filteredCourses.map((course, idx) => {
//                                                             const title = course.title || 'Untitled';
//                                                             const dept = course.department 
//                                                                 ? `Dept: ${getDepartmentLabel(course.department) || course.department}` 
//                                                                 : 'All students';
//                                                             const createdBy = course.createdBy?.name || 'Staff Member';
//                                                             const createdAt = course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Recently';

//                                                             return (
//                                                                 <motion.div
//                                                                     key={course._id}
//                                                                     variants={itemVariants}
//                                                                     whileHover={{ y: -5, scale: 1.01 }}
//                                                                     className="group relative overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-xl transition-all duration-300"
//                                                                 >
//                                                                     <motion.div 
//                                                                         className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
//                                                                         initial={{ scaleX: 0 }}
//                                                                         animate={{ scaleX: 1 }}
//                                                                         transition={{ duration: 0.5, delay: idx * 0.1 }}
//                                                                     />
//                                                                     <div className="p-4 sm:p-6">
//                                                                         <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
//                                                                             <div className="flex-1 min-w-0">
//                                                                                 <div className="flex flex-wrap items-center gap-2 mb-3">
//                                                                                     <motion.h3 
//                                                                                         whileHover={{ x: 5 }}
//                                                                                         className="font-semibold text-lg sm:text-xl truncate capitalize"
//                                                                                     >
//                                                                                         {title}
//                                                                                     </motion.h3>
//                                                                                     <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
//                                                                                         <Clock8 className="w-3 h-3 mr-1" />
//                                                                                         Pending
//                                                                                     </Badge>
//                                                                                 </div>
                                                                                
//                                                                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4">
//                                                                                     <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
//                                                                                         <Building2 className="h-4 w-4 flex-shrink-0" />
//                                                                                         <span className="truncate">{dept}</span>
//                                                                                     </div>
//                                                                                     <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
//                                                                                         <User className="h-4 w-4 flex-shrink-0" />
//                                                                                         <span>Created by: {createdBy}</span>
//                                                                                     </div>
//                                                                                     <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
//                                                                                         <Calendar className="h-4 w-4 flex-shrink-0" />
//                                                                                         <span>Created: {createdAt}</span>
//                                                                                     </div>
//                                                                                     {course.topics?.length > 0 && (
//                                                                                         <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
//                                                                                             <BookOpen className="h-4 w-4 flex-shrink-0" />
//                                                                                             <span>{course.topics.length} topics</span>
//                                                                                         </div>
//                                                                                     )}
//                                                                                 </div>
//                                                                             </div>
                                                                            
//                                                                             <div className="flex flex-row sm:flex-row lg:flex-col gap-2 lg:min-w-[180px]">
//                                                                                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                                                                                     <Button 
//                                                                                         variant="outline" 
//                                                                                         size="sm" 
//                                                                                         className="gap-2 text-sm w-full"
//                                                                                         onClick={() => setPreviewCourse({ ...course })}
//                                                                                     >
//                                                                                         <EyeIcon className="w-4 h-4" />
//                                                                                         Preview
//                                                                                     </Button>
//                                                                                 </motion.div>
//                                                                                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                                                                                     <Button
//                                                                                         size="sm"
//                                                                                         className="gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-sm w-full"
//                                                                                         onClick={() => handleReviewOrgCourse(course._id, 'approved', '')}
//                                                                                     >
//                                                                                         <Check className="w-4 h-4" />
//                                                                                         Approve
//                                                                                     </Button>
//                                                                                 </motion.div>
//                                                                                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                                                                                     <Button
//                                                                                         variant="outline"
//                                                                                         size="sm"
//                                                                                         className="gap-2 border-red-200 text-red-600 hover:bg-red-50 text-sm w-full"
//                                                                                         onClick={async () => {
//                                                                                             const result = await Swal.fire({
//                                                                                                 title: 'Reject this course?',
//                                                                                                 input: 'textarea',
//                                                                                                 inputLabel: 'Reason for rejection',
//                                                                                                 inputPlaceholder: 'Provide feedback to the staff member...',
//                                                                                                 showCancelButton: true,
//                                                                                                 confirmButtonText: 'Reject',
//                                                                                                 confirmButtonColor: '#dc2626'
//                                                                                             });

//                                                                                             if (result.isConfirmed) {
//                                                                                                 await handleReviewOrgCourse(course._id, 'rejected', String(result.value || ''));
//                                                                                             }
//                                                                                         }}
//                                                                                     >
//                                                                                         <X className="w-4 h-4" />
//                                                                                         Reject
//                                                                                     </Button>
//                                                                                 </motion.div>
//                                                                             </div>
//                                                                         </div>
//                                                                     </div>
//                                                                 </motion.div>
//                                                             );
//                                                         })}
//                                                     </motion.div>
//                                                 )}
//                                             </motion.div>
//                                         )}
//                                     </AnimatePresence>
//                                 </CardContent>
//                             </Card>
//                         </motion.div>
//                     </div>

//                     {/* Preview Course Modal with Enhanced Animation */}
//                     <AnimatePresence>
//                         {previewCourse && (
//                             <motion.div
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//                                 onClick={() => setPreviewCourse(null)}
//                             >
//                                 <motion.div
//                                     initial={{ scale: 0.8, opacity: 0, y: 50 }}
//                                     animate={{ scale: 1, opacity: 1, y: 0 }}
//                                     exit={{ scale: 0.8, opacity: 0, y: 50 }}
//                                     transition={{ type: "spring", damping: 25, stiffness: 300 }}
//                                     className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
//                                     onClick={(e) => e.stopPropagation()}
//                                 >
//                                     <div className="sticky top-0 bg-white dark:bg-slate-900 border-b p-4 sm:p-5 flex items-center justify-between">
//                                         <motion.div 
//                                             initial={{ x: -20, opacity: 0 }}
//                                             animate={{ x: 0, opacity: 1 }}
//                                             className="flex items-center gap-3"
//                                         >
//                                             <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
//                                                 <Eye className="h-5 w-5 text-white" />
//                                             </div>
//                                             <h3 className="font-semibold text-lg sm:text-xl">Course Preview</h3>
//                                         </motion.div>
//                                         <motion.div whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>
//                                             <Button variant="ghost" size="icon" onClick={() => setPreviewCourse(null)} className="rounded-full hover:bg-slate-100">
//                                                 <X className="h-5 w-5" />
//                                             </Button>
//                                         </motion.div>
//                                     </div>
//                                     <motion.div 
//                                         initial={{ opacity: 0 }}
//                                         animate={{ opacity: 1 }}
//                                         transition={{ delay: 0.2 }}
//                                         className="p-4 sm:p-6 overflow-y-auto max-h-[calc(85vh-80px)] space-y-6"
//                                     >
//                                         <motion.div
//                                             initial={{ y: 20, opacity: 0 }}
//                                             animate={{ y: 0, opacity: 1 }}
//                                             transition={{ delay: 0.3 }}
//                                         >
//                                             <h2 className="text-xl sm:text-2xl font-bold capitalize bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
//                                                 {previewCourse.title}
//                                             </h2>
//                                             <div className="flex flex-wrap items-center gap-3 mt-2">
//                                                 <Badge variant="outline" className="bg-blue-50 text-blue-700">
//                                                     {previewCourse.department ? 'Department Course' : 'Organization Course'}
//                                                 </Badge>
//                                                 {previewCourse.createdBy?.name && (
//                                                     <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
//                                                         <User className="h-3 w-3" />
//                                                         {previewCourse.createdBy.name}
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </motion.div>
                                        
//                                         {previewCourse.description && (
//                                             <motion.div
//                                                 initial={{ y: 20, opacity: 0 }}
//                                                 animate={{ y: 0, opacity: 1 }}
//                                                 transition={{ delay: 0.4 }}
//                                             >
//                                                 <h4 className="font-semibold mb-2 text-base sm:text-lg">Description</h4>
//                                                 <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{previewCourse.description}</p>
//                                             </motion.div>
//                                         )}
                                        
//                                         {previewCourse.topics?.length > 0 && (
//                                             <motion.div
//                                                 initial={{ y: 20, opacity: 0 }}
//                                                 animate={{ y: 0, opacity: 1 }}
//                                                 transition={{ delay: 0.5 }}
//                                             >
//                                                 <h4 className="font-semibold mb-3 text-base sm:text-lg">Topics Covered</h4>
//                                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                                                     {previewCourse.topics.map((topic, idx) => (
//                                                         <motion.div 
//                                                             key={idx} 
//                                                             initial={{ x: -20, opacity: 0 }}
//                                                             animate={{ x: 0, opacity: 1 }}
//                                                             transition={{ delay: 0.5 + idx * 0.05 }}
//                                                             className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
//                                                         >
//                                                             <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
//                                                             <span className="text-xs sm:text-sm">{topic}</span>
//                                                         </motion.div>
//                                                     ))}
//                                                 </div>
//                                             </motion.div>
//                                         )}
                                        
//                                         {previewCourse.department && (
//                                             <motion.div
//                                                 initial={{ y: 20, opacity: 0 }}
//                                                 animate={{ y: 0, opacity: 1 }}
//                                                 transition={{ delay: 0.6 }}
//                                             >
//                                                 <h4 className="font-semibold mb-2">Department</h4>
//                                                 <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
//                                                     <Building2 className="h-4 w-4" />
//                                                     {getDepartmentLabel(previewCourse.department) || previewCourse.department}
//                                                 </p>
//                                             </motion.div>
//                                         )}
//                                     </motion.div>
//                                     <motion.div 
//                                         initial={{ y: 20, opacity: 0 }}
//                                         animate={{ y: 0, opacity: 1 }}
//                                         transition={{ delay: 0.7 }}
//                                         className="sticky bottom-0 bg-white dark:bg-slate-900 border-t p-4 flex justify-end gap-3"
//                                     >
//                                         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                                             <Button variant="outline" onClick={() => setPreviewCourse(null)} className="text-sm">
//                                                 Close
//                                             </Button>
//                                         </motion.div>
//                                         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                                             <Button 
//                                                 className="bg-gradient-to-r from-emerald-500 to-green-600 text-sm"
//                                                 onClick={() => {
//                                                     handleReviewOrgCourse(previewCourse._id, 'approved', '');
//                                                     setPreviewCourse(null);
//                                                 }}
//                                             >
//                                                 <Check className="w-4 h-4 mr-2" />
//                                                 Approve Course
//                                             </Button>
//                                         </motion.div>
//                                     </motion.div>
//                                 </motion.div>
//                             </motion.div>
//                         )}
//                     </AnimatePresence>
//                 </div>
//             )}
//         </>
//     );
// };

// export default ApprovalsTab;

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, Clock, Eye, ArrowUpCircle, TrendingUp, Users, 
  BookOpen, AlertCircle, Filter, Search, ChevronRight, 
  Calendar, User, Building2, Sparkles, BarChart3, 
  CheckCircle2, XCircle, Clock8, EyeIcon, RefreshCw,
  Award, Target, Zap, Shield, Loader2, Mail, Phone,
  LayoutGrid, List, Menu, X as CloseIcon, FileQuestion,
  FileText, Layers, Globe, Star
} from 'lucide-react';

// Type definitions for better TypeScript support
type AnimationVariant = {
  initial: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
  };
  animate: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
    transition?: {
      type: "spring" | "tween" | "keyframes" | "inertia";
      stiffness?: number;
      damping?: number;
      duration?: number;
      delay?: number;
    };
  };
  exit?: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
    transition?: {
      duration: number;
    };
  };
};

const ApprovalsTab = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const role = sessionStorage.getItem('role');
    const deptId = sessionStorage.getItem('deptId');
    const { toast } = useToast();
    
    // Core state for approvals
    const [courses, setCourses] = useState([]);
    const [deptLimitRequests, setDeptLimitRequests] = useState([]);
    const [userDeptName, setUserDeptName] = useState('');
    const [userDeptId, setUserDeptId] = useState(deptId || '');
    const [departmentsList, setDepartmentsList] = useState([]);
    const [previewCourse, setPreviewCourse] = useState(null);
    const [activeApprovalTab, setActiveApprovalTab] = useState('requests');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [animateTabChange, setAnimateTabChange] = useState(false);
    const [hoveredTab, setHoveredTab] = useState(null);
    
    const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');

    const gradientPrimary = 'students-theme-hero';
    const gradientSurface = 'students-theme-surface';
    const gradientCard = 'students-theme-student-card';
    const gradientText = 'students-theme-title';
    const gradientBorder = 'bg-primary';

    // Helper functions
    const getDepartmentValue = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') return value._id || value.name || '';
        return '';
    };
    

    const getDepartmentLabel = (value) => {
        const normalizedValue = getDepartmentValue(value);
        if (!normalizedValue || normalizedValue === 'all') return '';
        return departmentsList.find((d) => d._id === normalizedValue || d.name === normalizedValue)?.name || normalizedValue;
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'NA';
    };

    // Fetch functions
    const fetchOrgDepartments = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/departments?organizationId=${orgId}`);
            if (res.data.success) setDepartmentsList(res.data.departments);
        } catch (e) {
            console.error("Failed to fetch departments", e);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/courses?organizationId=${orgId}`);
            if (res.data.success) {
                let coursesData = res.data.courses;
                if (role === 'dept_admin') {
                    coursesData = coursesData.filter((c) =>
                        (userDeptName && c.department === userDeptName) ||
                        (deptId && (c.departmentId === deptId || c.department === deptId))
                    );
                }
                setCourses(coursesData);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchDeptLimitRequests = async () => {
        try {
            const endpoint = role === 'dept_admin' 
                ? `${serverURL}/api/org/dept-admin/course-limit/requests?organizationId=${orgId}&deptAdminId=${sessionStorage.getItem('uid')}`
                : `${serverURL}/api/org/dept-admin/course-limit/requests?organizationId=${orgId}`;
            const res = await axios.get(endpoint);
            if (res.data.success) {
                setDeptLimitRequests(res.data.requests);
            }
        } catch (e) {
            console.error("Failed to fetch dept limit requests", e);
        }
    };

    const refreshAllData = async () => {
        setRefreshing(true);
        await Promise.all([fetchCourses(), fetchDeptLimitRequests(), fetchOrgDepartments()]);
        setRefreshing(false);
        toast({ title: "Refreshed", description: "All approval data has been updated" });
    };

    // Approval handlers
    const handleReviewOrgCourse = async (courseId, approvalStatus, approvalNote = '') => {
        const reviewerId = sessionStorage.getItem('uid') || '';
        if (!reviewerId) return;
        try {
            const res = await axios.post(`${serverURL}/api/org/course/${courseId}/review`, {
                reviewerId,
                approvalStatus,
                approvalNote
            });
            if (res.data?.success) {
                toast({ title: "Success", description: res.data.message || "Course updated" });
                fetchCourses();
            } else {
                toast({ title: "Error", description: res.data?.message || "Failed to update course" });
            }
        } catch (e) {
            toast({ title: "Error", description: e.response?.data?.message || e.message || "Request failed" });
        }
    };

    const handleProcessDeptCourseLimitRequest = async (requestId, status, adminComment = '') => {
        try {
            const orgAdminId = sessionStorage.getItem('uid') || '';
            const res = await axios.post(`${serverURL}/api/org/dept-admin/course-limit/process`, {
                organizationId: orgId,
                orgAdminId,
                requestId,
                status,
                adminComment
            });

            if (res.data.success) {
                toast({ title: "Success", description: `Request ${status} successfully` });
                fetchDeptLimitRequests();
            } else {
                toast({ title: "Error", description: res.data.message || `Failed to ${status} request`, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: e.response?.data?.message || e.message || `Failed to ${status} request`, variant: "destructive" });
        }
    };

    // Effects
    useEffect(() => {
        if (!orgId) {
            console.warn('No organization ID found. Please log out and log back in.');
            return;
        }
        fetchCourses();
        fetchOrgDepartments();
        fetchDeptLimitRequests();
    }, [orgId]);

    useEffect(() => {
        if (role === 'dept_admin' && deptId && departmentsList.length > 0 && !userDeptName) {
            const myDept = departmentsList.find((d) => d._id === deptId);
            if (myDept) {
                setUserDeptName(myDept.name);
                setUserDeptId(myDept._id);
            }
        }
    }, [departmentsList, deptId, role, userDeptName]);

    useEffect(() => {
        setAnimateTabChange(true);
        const timer = setTimeout(() => setAnimateTabChange(false), 300);
        return () => clearTimeout(timer);
    }, [activeApprovalTab]);

    // Filter pending items
    const pendingLimitRequests = deptLimitRequests.filter((r) => r.status === 'pending');
    const pendingCourses = courses.filter((c) => {
        const isOrgCourse = Boolean(c?.title && !c?.content);
        if (!isOrgCourse) return false;
        const approval = c?.approvalStatus || 'pending';
        return approval === 'pending';
    });

    // Filtered data
    const filteredLimitRequests = pendingLimitRequests.filter(request => {
        const matchesSearch = request.deptAdminId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             request.deptAdminId?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDepartment === 'all' || 
                            request.deptAdminId?.department?._id === selectedDepartment ||
                            request.deptAdminId?.department === selectedDepartment;
        return matchesSearch && matchesDept;
    });

    const filteredCourses = pendingCourses.filter(course => {
        const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             course.createdBy?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDepartment === 'all' || 
                            course.department === selectedDepartment ||
                            course.departmentId === selectedDepartment;
        return matchesSearch && matchesDept;
    });

    // Statistics
    const totalPending = pendingLimitRequests.length + pendingCourses.length;
    const coursePendingCount = pendingCourses.length;
    const requestPendingCount = pendingLimitRequests.length;

    // Animation variants
    const tabButtonVariants = {
        initial: { 
            scale: 1,
            transition: { type: "spring" as const, stiffness: 400, damping: 17 }
        },
        hover: { 
            scale: 1.05,
            y: -2,
            transition: { type: "spring" as const, stiffness: 400, damping: 10 }
        },
        tap: { 
            scale: 0.95,
            transition: { type: "spring" as const, stiffness: 400, damping: 17 }
        },
        active: { 
            scale: 1,
            y: 0,
            transition: { type: "spring" as const, stiffness: 400, damping: 17 }
        }
    };

    const iconVariants = {
        initial: { rotate: 0, scale: 1 },
        hover: { rotate: 15, scale: 1.2, transition: { type: "spring" as const, stiffness: 300 } },
        active: { rotate: 0, scale: 1.1, transition: { type: "spring" as const, stiffness: 300 } }
    };

    const badgeVariants = {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: { type: "spring" as const, stiffness: 500, damping: 15 } },
        hover: { scale: 1.1, transition: { type: "spring" as const, stiffness: 400 } }
    };

    const pulseAnimation = {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut" as const
        }
    };

    const floatAnimation = {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut" as const
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
                type: "tween" as const,
                duration: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { 
                type: "spring" as const, 
                stiffness: 100,
                damping: 12
            }
        }
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { 
            opacity: 1, 
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 15,
                duration: 0.5
            }
        }
    };

    const slideInRight = {
        initial: { x: 50, opacity: 0 },
        animate: { 
            x: 0, 
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 15
            }
        }
    };

    const tabContentVariants = {
        enter: (direction: string) => ({
            x: direction === 'requests' ? -50 : 50,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 300,
                damping: 25,
                duration: 0.3
            }
        },
        exit: (direction: string) => ({
            x: direction === 'requests' ? 50 : -50,
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.2
            }
        })
    };

    const getTabDirection = () => {
        return activeApprovalTab === 'requests' ? 'requests' : 'courses';
    };

    return (
        <>
            {role === 'org_admin' && (
                <div className="students-theme min-h-screen">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
                        {/* Header Section with Float Animation */}
                        <motion.div 
                            variants={fadeInUp}
                            initial="initial"
                            animate="animate"
                            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
                        >
                            <div className="space-y-2">
                                <motion.div 
                                    animate={floatAnimation}
                                    className="flex items-center gap-3"
                                >
                                    <div className="students-theme-surface p-2 rounded-xl shadow-lg">
                                        <Shield className="students-theme-title h-5 w-5 sm:h-6 sm:w-6" />
                                    </div>
                                    <div>
                                        <h1 className="students-theme-title text-2xl sm:text-3xl font-bold">
                                            Approval Center
                                        </h1>
                                        <p className="text-sm sm:text-base text-muted-foreground">
                                            Review and manage course and limit increase requests
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                            
                            <motion.div 
                                variants={slideInRight}
                                initial="initial"
                                animate="animate"
                                className="flex items-center gap-3"
                            >
                                <Button 
                                    variant="outline" 
                                    className="students-theme-outline-btn gap-2 text-sm sm:text-base relative overflow-hidden group transition-colors"
                                    onClick={refreshAllData}
                                    disabled={refreshing}
                                >
                                    <motion.div
                                        animate={refreshing ? { rotate: 360 } : {}}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        {refreshing ? (
                                            <Loader2 className="h-4 w-4" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4" />
                                        )}
                                    </motion.div>
                                    <span className="hidden sm:inline">Refresh</span>
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Stats Cards with Enhanced Animations */}
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                        >
                            {[
                                { label: "Total Pending", value: totalPending, desc: "Items awaiting review", icon: AlertCircle },
                                { label: "Course Approvals", value: coursePendingCount, desc: "Courses waiting approval", icon: BookOpen },
                                { label: "Limit Requests", value: requestPendingCount, desc: "Course limit increase", icon: TrendingUp },
                                { label: "Avg. Response Time", value: "24h", desc: "Typical approval time", icon: Clock }
                            ].map((stat, idx) => (
                                <motion.div 
                                    key={idx} 
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Card className={`${gradientSurface} shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group`}>
                                        <CardContent className="p-4 sm:p-6 relative">
                                            <motion.div 
                                                    className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                            />
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.label}</p>
                                                    <motion.p 
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: "spring", delay: idx * 0.1 }}
                                                        className="text-2xl sm:text-3xl font-bold mt-2"
                                                    >
                                                        {stat.value}
                                                    </motion.p>
                                                    <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                                                </div>
                                                <motion.div 
                                                    whileHover={{ rotate: 12, scale: 1.1 }}
                                                    className="students-theme-hero h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shadow-lg"
                                                >
                                                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                                </motion.div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
  
                        {/* Pending Courses Section with Enhanced Design */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                        >
                            <Card className={`${gradientSurface} shadow-xl overflow-hidden`}>
                                <CardHeader className="px-0 pt-0">
                                    <motion.div 
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="px-6 pt-6"
                                    >
                                        <CardTitle className="text-2xl flex items-center gap-2">
                                            <motion.div
                                                animate={pulseAnimation}
                                                className="inline-block"
                                            >
                                                <Clock className="students-theme-title w-6 h-6" />
                                            </motion.div>
                                            Pending Approval Requests
                                        </CardTitle>
                                        <CardDescription>Review and approve courses submitted by department admins or other staff members.</CardDescription>
                                    </motion.div>
                                </CardHeader>
                                <CardContent className="px-4 space-y-4">
                                    {courses.filter((c: any) => c.approvalStatus === 'pending').length > 0 ? (
                                        <div className="grid gap-4">
                                            {courses.filter((c: any) => c.approvalStatus === 'pending').map((course: any, idx: number) => (
                                                <motion.div
                                                    key={course._id}
                                                    initial={{ opacity: 0, x: -30 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                                                    whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                                                    className="students-theme-list-card group p-6 border rounded-2xl hover:shadow-md transition-all duration-300"
                                                >
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <motion.h3 
                                                                    whileHover={{ x: 5 }}
                                                                    className="students-theme-title font-bold text-xl group-hover:text-foreground transition-colors capitalize"
                                                                >
                                                                    {course.title || course.mainTopic}
                                                                </motion.h3>
                                                                <Badge className="students-theme-badge border-0">
                                                                    {departmentsList.find(d => d._id === course.department || d.name === course.department)?.name || course.department || 'General'}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-muted-foreground line-clamp-2 text-sm italic">"{course.description || 'No description provided'}"</p>
                                                            <div className="flex flex-wrap gap-4 mt-3 text-xs font-semibold text-muted-foreground items-center">
                                                                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                                                    <BookOpen className="students-theme-title w-3.5 h-3.5" />
                                                                    <span>{course.topics?.length || 0} Lessons</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                                                    <FileQuestion className="students-theme-title w-3.5 h-3.5" />
                                                                    <span>{course.quizzes?.length || 0} Quizzes</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                                                    <Calendar className="students-theme-title w-3.5 h-3.5" />
                                                                    <span>Submitted: {new Date(course.updatedAt || course.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
                                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    className="students-theme-outline-btn flex-1 md:flex-none h-10 px-4 rounded-xl transition-colors"
                                                                    onClick={() => setPreviewCourse({ ...course })}
                                                                >
                                                                    <Eye className="w-4 h-4 mr-2" /> Preview
                                                                </Button>
                                                            </motion.div>
                                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                <Button 
                                                                    className="students-theme-hero flex-1 md:flex-none h-10 px-4 rounded-xl text-white shadow-lg hover:opacity-90"
                                                                    size="sm"
                                                                    onClick={() => handleReviewOrgCourse(course._id, 'approved', 'Course approved for students.')}
                                                                >
                                                                    <Check className="w-4 h-4 mr-2" /> Approve
                                                                </Button>
                                                            </motion.div>
                                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    className="flex-1 md:flex-none h-10 px-4 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                    onClick={async () => {
                                                                        const result = await Swal.fire({
                                                                            title: 'Reject this course?',
                                                                            input: 'textarea',
                                                                            inputLabel: 'Feedback for the creator',
                                                                            inputPlaceholder: 'Explain what needs to be changed before approval...',
                                                                            showCancelButton: true,
                                                                            confirmButtonText: 'Reject Course',
                                                                            confirmButtonColor: '#dc2626',
                                                                            cancelButtonText: 'Cancel',
                                                                            customClass: {
                                                                                popup: 'rounded-3xl',
                                                                                confirmButton: 'rounded-xl',
                                                                                cancelButton: 'rounded-xl'
                                                                            }
                                                                        });

                                                                        if (result.isConfirmed) {
                                                                            await handleReviewOrgCourse(course._id, 'rejected', String(result.value || ''));
                                                                        }
                                                                    }}
                                                                >
                                                                    <X className="w-4 h-4 mr-2" /> Reject
                                                                </Button>
                                                            </motion.div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <motion.div 
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", stiffness: 200 }}
                                            className="flex flex-col items-center justify-center py-20 bg-muted/20 border-2 border-dashed rounded-3xl animate-in fade-in zoom-in duration-500"
                                        >
                                            <motion.div 
                                                animate={{ rotate: [0, 10, -10, 0] }}
                                                transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                                                className="students-theme-checkbox w-16 h-16 rounded-full flex items-center justify-center mb-4"
                                            >
                                                <CheckCircle2 className="w-8 h-8" />
                                            </motion.div>
                                            <h3 className="text-xl font-bold text-foreground">All Caught Up!</h3>
                                            <p className="text-muted-foreground text-center max-w-xs mt-2">
                                                There are no courses waiting for your approval at this time.
                                            </p>
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Enhanced Tabs Section with Beautiful Animations */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                        >
                            <Card className={`${gradientSurface} shadow-xl overflow-hidden`}>
                                <CardContent className="p-0">
                                    <div className="border-b px-4 sm:px-6 pt-4 sm:pt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2 relative">
                                                {/* Animated Tab Buttons */}
                                                <motion.button
                                                    onClick={() => setActiveApprovalTab('requests')}
                                                    variants={tabButtonVariants}
                                                    initial="initial"
                                                    animate={activeApprovalTab === 'requests' ? "active" : "initial"}
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                    onHoverStart={() => setHoveredTab('requests')}
                                                    onHoverEnd={() => setHoveredTab(null)}
                                                    className={`relative px-4 sm:px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                                                        activeApprovalTab === 'requests'
                                                            ? `${gradientPrimary} text-white shadow-lg`
                                                            : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <motion.div
                                                        variants={iconVariants}
                                                        initial="initial"
                                                        animate={hoveredTab === 'requests' ? "hover" : activeApprovalTab === 'requests' ? "active" : "initial"}
                                                    >
                                                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    </motion.div>
                                                    <span className="font-medium text-sm sm:text-base">
                                                        Limit Requests
                                                    </span>
                                                    {requestPendingCount > 0 && (
                                                        <motion.div
                                                            variants={badgeVariants}
                                                            initial="initial"
                                                            animate="animate"
                                                            whileHover="hover"
                                                        >
                                                            <Badge 
                                                                variant="secondary" 
                                                                className={`ml-1 text-xs ${
                                                                    activeApprovalTab === 'requests'
                                                                        ? 'bg-white/20 text-white hover:bg-white/30'
                                                                        : 'students-theme-badge'
                                                                }`}
                                                            >
                                                                {requestPendingCount}
                                                            </Badge>
                                                        </motion.div>
                                                    )}
                                                    {activeApprovalTab === 'requests' && (
                                                        <motion.div
                                                            layoutId="activeTabBackground"
                                                            className={`absolute inset-0 rounded-xl ${gradientPrimary} -z-10`}
                                                            initial={false}
                                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                        />
                                                    )}
                                                </motion.button>

                                                <motion.button
                                                    onClick={() => setActiveApprovalTab('courses')}
                                                    variants={tabButtonVariants}
                                                    initial="initial"
                                                    animate={activeApprovalTab === 'courses' ? "active" : "initial"}
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                    onHoverStart={() => setHoveredTab('courses')}
                                                    onHoverEnd={() => setHoveredTab(null)}
                                                    className={`relative px-4 sm:px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                                                        activeApprovalTab === 'courses'
                                                            ? `${gradientPrimary} text-white shadow-lg`
                                                            : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <motion.div
                                                        variants={iconVariants}
                                                        initial="initial"
                                                        animate={hoveredTab === 'courses' ? "hover" : activeApprovalTab === 'courses' ? "active" : "initial"}
                                                    >
                                                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    </motion.div>
                                                    <span className="font-medium text-sm sm:text-base">
                                                        Course Approvals
                                                    </span>
                                                    {coursePendingCount > 0 && (
                                                        <motion.div
                                                            variants={badgeVariants}
                                                            initial="initial"
                                                            animate="animate"
                                                            whileHover="hover"
                                                        >
                                                            <Badge 
                                                                variant="secondary" 
                                                                className={`ml-1 text-xs ${
                                                                    activeApprovalTab === 'courses'
                                                                        ? 'bg-white/20 text-white hover:bg-white/30'
                                                                        : 'students-theme-badge'
                                                                }`}
                                                            >
                                                                {coursePendingCount}
                                                            </Badge>
                                                        </motion.div>
                                                    )}
                                                    {activeApprovalTab === 'courses' && (
                                                        <motion.div
                                                            layoutId="activeTabBackground"
                                                            className={`absolute inset-0 rounded-xl ${gradientPrimary} -z-10`}
                                                            initial={false}
                                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                        />
                                                    )}
                                                </motion.button>

                                                {/* Animated Underline Indicator */}
                                                <motion.div
                                                    className={`absolute bottom-0 left-0 h-0.5 ${gradientBorder}`}
                                                    initial={false}
                                                    animate={{
                                                        width: activeApprovalTab === 'requests' ? 'calc(50% - 4px)' : 'calc(50% - 4px)',
                                                        x: activeApprovalTab === 'requests' ? 0 : 'calc(100% + 4px)',
                                                    }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                />
                                            </div>
                                            
                                            {/* View Toggle for Desktop */}
                                            {activeApprovalTab === 'requests' && filteredLimitRequests.length > 0 && (
                                                <div className="hidden sm:flex gap-2">
                                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                        <Button
                                                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => setViewMode('grid')}
                                                            className={`gap-2 ${viewMode === 'grid' ? gradientPrimary : ''} text-white`}
                                                        >
                                                            <LayoutGrid className="h-4 w-4" />
                                                        </Button>
                                                    </motion.div>
                                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                        <Button
                                                            variant={viewMode === 'list' ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => setViewMode('list')}
                                                            className={`gap-2 ${viewMode === 'list' ? gradientPrimary : ''} text-white`}
                                                        >
                                                            <List className="h-4 w-4" />
                                                        </Button>
                                                    </motion.div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Filters with Animation */}
                                    <motion.div 
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="p-4 sm:p-6 border-b"
                                    >
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    placeholder={`Search ${activeApprovalTab === 'requests' ? 'staff members...' : 'courses...'}`}
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="students-theme-input w-full pl-10 pr-4 py-2 rounded-lg text-sm transition-all duration-300"
                                                />
                                            </div>
                                            <select
                                                value={selectedDepartment}
                                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                                className="students-theme-select px-3 py-2 rounded-lg text-sm transition-all duration-300"
                                            >
                                                <option value="all">All Departments</option>
                                                {departmentsList.map((dept) => (
                                                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </motion.div>

                                    {/* Animated Tab Content */}
                                    <AnimatePresence mode="wait" custom={getTabDirection()}>
                                        {/* Limit Requests Tab */}
                                        {activeApprovalTab === 'requests' && (
                                            <motion.div
                                                key="requests"
                                                custom={getTabDirection()}
                                                variants={tabContentVariants}
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                className="p-4 sm:p-6"
                                            >
                                                {filteredLimitRequests.length === 0 ? (
                                                    <motion.div 
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ type: "spring", stiffness: 200 }}
                                                        className="text-center py-12"
                                                    >
                                                        <motion.div 
                                                            animate={{ rotate: [0, 360] }}
                                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                            className="students-theme-checkbox inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                                                        >
                                                            <CheckCircle2 className="h-8 w-8 text-primary" />
                                                        </motion.div>
                                                        <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                                                        <p className="text-muted-foreground">No pending limit increase requests at the moment</p>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div 
                                                        variants={containerVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        className={`${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6' : 'space-y-4'}`}
                                                    >
                                                        {filteredLimitRequests.map((request, idx) => (
                                                            <motion.div
                                                                key={request._id}
                                                                variants={itemVariants}
                                                                whileHover={{ scale: 1.02, y: -5 }}
                                                                transition={{ type: "spring", stiffness: 300 }}
                                                                className="group relative overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-xl transition-all duration-300"
                                                            >
                                                                <motion.div 
                                                                    className={`absolute inset-0 ${gradientPrimary} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                                                                    initial={false}
                                                                    animate={false}
                                                                />
                                                                <div className="p-4 sm:p-6 relative">
                                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                                                        <div className="flex items-center gap-3 sm:gap-4">
                                                                            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                                                                                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-primary/20">
                                                                                    <AvatarFallback className={`${gradientPrimary} text-white`}>
                                                                                        {getInitials(request.deptAdminId?.name)}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                            </motion.div>
                                                                            <div>
                                                                                <h3 className="font-semibold text-base sm:text-lg">
                                                                                    {request.deptAdminId?.name || 'Department Admin'}
                                                                                </h3>
                                                                                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                                                                    <Mail className="h-3 w-3" />
                                                                                    <span className="truncate">{request.deptAdminId?.email || 'No email'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <Badge variant="outline" className="students-theme-badge self-start sm:self-auto">
                                                                            <Clock className="w-3 h-3 mr-1" />
                                                                            Pending
                                                                        </Badge>
                                                                    </div>

                                                                    <div className="space-y-3 mb-4">
                                                                        <div className="students-theme-checkbox flex items-center justify-between p-3 rounded-lg">
                                                                            <div className="flex items-center gap-2">
                                                                                <TrendingUp className="students-theme-title h-4 w-4" />
                                                                                <span className="text-xs sm:text-sm font-medium">Requested Limit</span>
                                                                            </div>
                                                                            <motion.span 
                                                                                initial={{ scale: 0 }}
                                                                                animate={{ scale: 1 }}
                                                                                transition={{ type: "spring", stiffness: 200, delay: idx * 0.1 }}
                                                                                className="students-theme-title text-base sm:text-lg font-bold"
                                                                            >
                                                                                {request.requestedCourseLimit} courses
                                                                            </motion.span>
                                                                        </div>
                                                                        
                                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                                                            <div className="flex items-center gap-2">
                                                                                <Building2 className="h-4 w-4" />
                                                                                <span>Dept: {request.deptAdminId?.department?.name || 'N/A'}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Calendar className="h-4 w-4" />
                                                                                <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                                                                            <Button
                                                                                className={`w-full ${gradientPrimary} text-white shadow-md text-sm hover:opacity-90`}
                                                                                size="sm"
                                                                                onClick={() => handleProcessDeptCourseLimitRequest(request._id, 'approved')}
                                                                            >
                                                                                <Check className="w-4 h-4 mr-2" />
                                                                                Approve
                                                                            </Button>
                                                                        </motion.div>
                                                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="w-full text-destructive hover:bg-destructive/10 text-sm"
                                                                                onClick={async () => {
                                                                                    const result = await Swal.fire({
                                                                                        title: 'Reject Request?',
                                                                                        input: 'textarea',
                                                                                        inputLabel: 'Reason (optional)',
                                                                                        inputPlaceholder: 'Enter reason for rejection...',
                                                                                        showCancelButton: true,
                                                                                        confirmButtonText: 'Reject',
                                                                                        confirmButtonColor: '#dc2626'
                                                                                    });
                                                                                    if (result.isConfirmed) {
                                                                                        await handleProcessDeptCourseLimitRequest(request._id, 'rejected', result.value || '');
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <X className="w-4 h-4 mr-2" />
                                                                                Reject
                                                                            </Button>
                                                                        </motion.div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}

                                        {/* Course Approvals Tab */}
                                        {activeApprovalTab === 'courses' && (
                                            <motion.div
                                                key="courses"
                                                custom={getTabDirection()}
                                                variants={tabContentVariants}
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                className="p-4 sm:p-6"
                                            >
                                                {filteredCourses.length === 0 ? (
                                                    <motion.div 
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ type: "spring", stiffness: 200 }}
                                                        className="text-center py-12"
                                                    >
                                                        <motion.div 
                                                            animate={{ rotate: [0, 360] }}
                                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                            className="students-theme-checkbox inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                                                        >
                                                            <CheckCircle2 className="h-8 w-8 text-primary" />
                                                        </motion.div>
                                                        <h3 className="text-lg font-semibold mb-2">No Pending Courses</h3>
                                                        <p className="text-muted-foreground">All courses have been reviewed and approved</p>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div 
                                                        variants={containerVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        className="space-y-4"
                                                    >
                                                        {filteredCourses.map((course, idx) => {
                                                            const title = course.title || 'Untitled';
                                                            const dept = course.department 
                                                                ? `Dept: ${getDepartmentLabel(course.department) || course.department}` 
                                                                : 'All students';
                                                            const createdBy = course.createdBy?.name || 'Staff Member';
                                                            const createdAt = course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Recently';

                                                            return (
                                                                <motion.div
                                                                    key={course._id}
                                                                    variants={itemVariants}
                                                                    whileHover={{ y: -5, scale: 1.01 }}
                                                                    className="group relative overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-xl transition-all duration-300"
                                                                >
                                                                    <motion.div 
                                                                        className={`absolute top-0 left-0 right-0 h-1 ${gradientPrimary}`}
                                                                        initial={{ scaleX: 0 }}
                                                                        animate={{ scaleX: 1 }}
                                                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                                    />
                                                                    <div className="p-4 sm:p-6">
                                                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                                                    <motion.h3 
                                                                                        whileHover={{ x: 5 }}
                                                                                        className="font-semibold text-lg sm:text-xl truncate capitalize"
                                                                                    >
                                                                                        {title}
                                                                                    </motion.h3>
                                                                                    <Badge variant="outline" className="students-theme-badge">
                                                                                        <Clock8 className="w-3 h-3 mr-1" />
                                                                                        Pending
                                                                                    </Badge>
                                                                                </div>
                                                                                
                                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4">
                                                                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                                                                        <Building2 className="h-4 w-4 flex-shrink-0" />
                                                                                        <span className="truncate">{dept}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                                                                        <User className="h-4 w-4 flex-shrink-0" />
                                                                                        <span>Created by: {createdBy}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                                                                        <Calendar className="h-4 w-4 flex-shrink-0" />
                                                                                        <span>Created: {createdAt}</span>
                                                                                    </div>
                                                                                    {course.topics?.length > 0 && (
                                                                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                                                                            <BookOpen className="h-4 w-4 flex-shrink-0" />
                                                                                            <span>{course.topics.length} topics</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            <div className="flex flex-row sm:flex-row lg:flex-col gap-2 lg:min-w-[180px]">
                                                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                                    <Button 
                                                                                        variant="outline" 
                                                                                        size="sm" 
                                                                                        className="students-theme-outline-btn gap-2 text-sm w-full transition-colors"
                                                                                        onClick={() => setPreviewCourse({ ...course })}
                                                                                    >
                                                                                        <EyeIcon className="w-4 h-4" />
                                                                                        Preview
                                                                                    </Button>
                                                                                </motion.div>
                                                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                                    <Button
                                                                                        size="sm"
                                                                                        className={`gap-2 ${gradientPrimary} text-white shadow-lg hover:opacity-90 text-sm w-full`}
                                                                                        onClick={() => handleReviewOrgCourse(course._id, 'approved', '')}
                                                                                    >
                                                                                        <Check className="w-4 h-4" />
                                                                                        Approve
                                                                                    </Button>
                                                                                </motion.div>
                                                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        className="gap-2 text-destructive hover:bg-destructive/10 text-sm w-full"
                                                                                        onClick={async () => {
                                                                                            const result = await Swal.fire({
                                                                                                title: 'Reject this course?',
                                                                                                input: 'textarea',
                                                                                                inputLabel: 'Reason for rejection',
                                                                                                inputPlaceholder: 'Provide feedback to the staff member...',
                                                                                                showCancelButton: true,
                                                                                                confirmButtonText: 'Reject',
                                                                                                confirmButtonColor: '#dc2626'
                                                                                            });

                                                                                            if (result.isConfirmed) {
                                                                                                await handleReviewOrgCourse(course._id, 'rejected', String(result.value || ''));
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        <X className="w-4 h-4" />
                                                                                        Reject
                                                                                    </Button>
                                                                                </motion.div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Preview Course Modal with Enhanced Animation */}
                    <AnimatePresence>
                        {previewCourse && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                                onClick={() => setPreviewCourse(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    className="students-theme-dialog rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="sticky top-0 border-b p-4 sm:p-5 flex items-center justify-between bg-background/95 backdrop-blur-sm">
                                        <motion.div 
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className={`p-2 ${gradientPrimary} rounded-xl`}>
                                                <Eye className="h-5 w-5 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-lg sm:text-xl">Course Preview</h3>
                                        </motion.div>
                                        <motion.div whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>
                                            <Button variant="ghost" size="icon" onClick={() => setPreviewCourse(null)} className="rounded-full hover:bg-slate-100">
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </motion.div>
                                    </div>
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="p-4 sm:p-6 overflow-y-auto max-h-[calc(85vh-80px)] space-y-6"
                                    >
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <h2 className={`text-xl sm:text-2xl font-bold capitalize ${gradientText}`}>
                                                {previewCourse.title}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                                <Badge className={`${gradientPrimary} text-white`}>
                                                    {previewCourse.department ? 'Department Course' : 'Organization Course'}
                                                </Badge>
                                                {previewCourse.createdBy?.name && (
                                                    <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {previewCourse.createdBy.name}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                        
                                        {previewCourse.description && (
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                <h4 className="font-semibold mb-2 text-base sm:text-lg">Description</h4>
                                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{previewCourse.description}</p>
                                            </motion.div>
                                        )}
                                        
                                        {previewCourse.topics?.length > 0 && (
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                <h4 className="font-semibold mb-3 text-base sm:text-lg">Topics Covered</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {previewCourse.topics.map((topic, idx) => (
                                                        <motion.div 
                                                            key={idx} 
                                                            initial={{ x: -20, opacity: 0 }}
                                                            animate={{ x: 0, opacity: 1 }}
                                                            transition={{ delay: 0.5 + idx * 0.05 }}
                                                            className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                                                        >
                                                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                                            <span className="text-xs sm:text-sm">{topic}</span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                        
                                        {previewCourse.department && (
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.6 }}
                                            >
                                                <h4 className="font-semibold mb-2">Department</h4>
                                                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                                                    <Building2 className="h-4 w-4" />
                                                    {getDepartmentLabel(previewCourse.department) || previewCourse.department}
                                                </p>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                    <motion.div 
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className="sticky bottom-0 border-t p-4 flex justify-end gap-3 bg-background/95 backdrop-blur-sm"
                                    >
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button variant="outline" onClick={() => setPreviewCourse(null)} className="students-theme-outline-btn text-sm">
                                                Close
                                            </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button 
                                                className={`${gradientPrimary} text-white shadow-lg text-sm hover:opacity-90`}
                                                onClick={() => {
                                                    handleReviewOrgCourse(previewCourse._id, 'approved', '');
                                                    setPreviewCourse(null);
                                                }}
                                            >
                                                <Check className="w-4 h-4 mr-2" />
                                                Approve Course
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </>
    );
};

export default ApprovalsTab;
