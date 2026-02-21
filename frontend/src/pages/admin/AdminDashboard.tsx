// // // // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // // // // @ts-nocheck
// // // // import React, { useState, useEffect } from 'react';
// // // // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// // // // import {
// // // //   ChartContainer,
// // // //   ChartTooltip,
// // // //   ChartTooltipContent,
// // // //   ChartLegend,
// // // //   ChartLegendContent
// // // // } from '@/components/ui/chart';
// // // // import { Users, Play, RotateCcw, DollarSign, Building2 } from 'lucide-react';
// // // // import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
// // // // import { Skeleton } from '@/components/ui/skeleton';
// // // // import { serverURL } from '@/constants';
// // // // import axios from 'axios';
// // // // import AdminStatCard from '@/components/admin/AdminStatCard';

// // // // const usersPieData = [
// // // //   { name: 'Free', value: 0, color: '#F7F7F7' },
// // // //   { name: 'Paid', value: 0, color: '#393E46' },
// // // // ];

// // // // const coursesPieData = [
// // // //   { name: 'Text', value: 0, color: '#393E46' },
// // // //   { name: 'Video', value: 0, color: '#F7F7F7' },
// // // // ];

// // // // const userChartConfig = {
// // // //   free: { label: 'Free' },
// // // //   paid: { label: 'Paid' },
// // // // };

// // // // const courseChartConfig = {
// // // //   text: { label: 'Text' },
// // // //   video: { label: 'Video' },
// // // // };

// // // // const AdminDashboard = () => {
// // // //   const [isLoading, setIsLoading] = useState(true);
// // // //   const [data, setData] = useState({});

// // // //   useEffect(() => {
// // // //     async function dashboardData() {
// // // //       const postURL = serverURL + `/api/dashboard`;
// // // //       const response = await axios.post(postURL);
// // // //       sessionStorage.setItem('terms', response.data.admin.terms)
// // // //       sessionStorage.setItem('privacy', response.data.admin.privacy)
// // // //       sessionStorage.setItem('cancel', response.data.admin.cancel)
// // // //       sessionStorage.setItem('refund', response.data.admin.refund)
// // // //       sessionStorage.setItem('billing', response.data.admin.billing)
// // // //       usersPieData[0].value = response.data.paid;
// // // //       usersPieData[1].value = response.data.free;
// // // //       coursesPieData[0].value = response.data.courses - response.data.videoType;
// // // //       coursesPieData[1].value = response.data.videoType;
// // // //       setData(response.data);
// // // //       setIsLoading(false);
// // // //     }
// // // //     dashboardData();
// // // //   }, []);

// // // //   return (
// // //     // <div className="space-y-8 animate-fade-in">
// // //     //   <div className="flex items-center justify-between">
// // //     //     <div>
// // //     //       <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-500">Admin Dashboard</h1>
// // //     //       <p className="text-muted-foreground mt-1">Monitor and manage your platform</p>
// // //     //     </div>
// // //     //   </div>

// // //     //   {/* Stats Cards */}
// // //     //   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
// // //     //     {isLoading ? (
// // //     //       // Loading skeleton for stats cards
// // //     //       <>
// // //     //         {[1, 2, 3, 4].map((i) => (
// // //     //           <Card key={i} className="border-border/50">
// // //     //             <CardHeader className="pb-2">
// // //     //               <Skeleton className="h-5 w-24" />
// // //     //             </CardHeader>
// // //     //             <CardContent className="flex items-center justify-between">
// // //     //               <Skeleton className="h-8 w-8 rounded-full" />
// // //     //               <Skeleton className="h-8 w-16" />
// // //     //             </CardContent>
// // //     //           </Card>
// // //     //         ))}
// // //     //       </>
// // //     //     ) : (
// // //     //       // Modern stat cards with AdminStatCard component
// // //     //       <>
// // //     //         <AdminStatCard
// // //     //           title="Total Users"
// // //     //           value={data.users}
// // //     //           icon={Users}
// // //     //           description="Registered users"
// // //     //           gradient="from-blue-500 via-blue-600 to-indigo-600"
// // //     //           iconColor="text-blue-600"
// // //     //         />
// // //     //         <AdminStatCard
// // //     //           title="Total Courses"
// // //     //           value={data.courses}
// // //     //           icon={Play}
// // //     //           description="Generated courses"
// // //     //           gradient="from-purple-500 via-purple-600 to-pink-600"
// // //     //           iconColor="text-purple-600"
// // //     //         />
// // //     //         <AdminStatCard
// // //     //           title="Recurring Revenue"
// // //     //           value={`$${data.sum}`}
// // //     //           icon={RotateCcw}
// // //     //           description="Monthly subscriptions"
// // //     //           gradient="from-green-500 via-green-600 to-emerald-600"
// // //     //           iconColor="text-green-600"
// // //     //         />
// // //     //         <AdminStatCard
// // //     //           title="Total Revenue"
// // //     //           value={`$${data.total}`}
// // //     //           icon={DollarSign}
// // //     //           description="All-time earnings"
// // //     //           gradient="from-orange-500 via-orange-600 to-red-600"
// // //     //           iconColor="text-orange-600"
// // //     //         />
// // //     //         <AdminStatCard
// // //     //           title="Organizations"
// // //     //           value={data.organizations || 0}
// // //     //           icon={Building2}
// // //     //           description="Registered Institutions"
// // //     //           gradient="from-cyan-500 via-cyan-600 to-blue-600"
// // //     //           iconColor="text-cyan-600"
// // //     //         />
// // //     //         <AdminStatCard
// // //     //           title="Org Students"
// // //     //           value={data.orgStudents || 0}
// // //     //           icon={Users}
// // //     //           description="Students in organizations"
// // //     //           gradient="from-teal-500 via-teal-600 to-green-600"
// // //     //           iconColor="text-teal-600"
// // //     //         />
// // //     //       </>
// // //     //     )}
// // //     //   </div>

// // // //       {/* Charts */}
// // // //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// // // //         {isLoading ? (
// // // //           // Loading skeleton for charts
// // // //           <>
// // // //             {[1, 2].map((i) => (
// // // //               <Card key={i} className="border-border/50">
// // // //                 <CardHeader>
// // // //                   <Skeleton className="h-6 w-32" />
// // // //                 </CardHeader>
// // // //                 <CardContent className="h-80">
// // // //                   <div className="flex items-center justify-center h-full">
// // // //                     <div className="relative w-40 h-40">
// // // //                       <Skeleton className="w-40 h-40 rounded-full" />
// // // //                       <Skeleton className="w-20 h-20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
// // // //                     </div>
// // // //                   </div>
// // // //                   <div className="flex justify-center mt-4 space-x-6">
// // // //                     <div className="flex items-center">
// // // //                       <Skeleton className="h-3 w-3 mr-2" />
// // // //                       <Skeleton className="h-4 w-16" />
// // // //                     </div>
// // // //                     <div className="flex items-center">
// // // //                       <Skeleton className="h-3 w-3 mr-2" />
// // // //                       <Skeleton className="h-4 w-16" />
// // // //                     </div>
// // // //                   </div>
// // // //                 </CardContent>
// // // //               </Card>
// // // //             ))}
// // // //           </>
// // // //         ) : (
// // // //           <>
// // // //             <Card className="border-border/50">
// // // //               <CardHeader>
// // // //                 <CardTitle>Users</CardTitle>
// // // //               </CardHeader>
// // // //               <CardContent className="h-80">
// // // //                 <ChartContainer config={userChartConfig}>
// // // //                   <PieChart>
// // // //                     <Pie
// // // //                       data={usersPieData}
// // // //                       cx="50%"
// // // //                       cy="50%"
// // // //                       innerRadius={60}
// // // //                       outerRadius={100}
// // // //                       paddingAngle={1}
// // // //                       dataKey="value"
// // // //                       nameKey="name"
// // // //                     >
// // // //                       {usersPieData.map((entry, index) => (
// // // //                         <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--border)" />
// // // //                       ))}
// // // //                     </Pie>
// // // //                     <ChartTooltip
// // // //                       content={<ChartTooltipContent />}
// // // //                     />
// // // //                   </PieChart>
// // // //                 </ChartContainer>
// // // //                 <div className="flex justify-center mt-4 space-x-6">
// // // //                   <div className="flex items-center">
// // // //                     <div className="h-3 w-3 bg-gray-700 mr-2" />
// // // //                     <span>Paid - {usersPieData[1].value}</span>
// // // //                   </div>
// // // //                   <div className="flex items-center">
// // // //                     <div className="h-3 w-3 bg-gray-100 border border-border mr-2" />
// // // //                     <span>Free - {usersPieData[0].value}</span>
// // // //                   </div>
// // // //                 </div>
// // // //               </CardContent>
// // // //             </Card>

// // // //             <Card className="border-border/50">
// // // //               <CardHeader>
// // // //                 <CardTitle>Courses</CardTitle>
// // // //               </CardHeader>
// // // //               <CardContent className="h-80">
// // // //                 <ChartContainer config={courseChartConfig}>
// // // //                   <PieChart>
// // // //                     <Pie
// // // //                       data={coursesPieData}
// // // //                       cx="50%"
// // // //                       cy="50%"
// // // //                       innerRadius={60}
// // // //                       outerRadius={100}
// // // //                       paddingAngle={1}
// // // //                       dataKey="value"
// // // //                       nameKey="name"
// // // //                     >
// // // //                       {coursesPieData.map((entry, index) => (
// // // //                         <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--border)" />
// // // //                       ))}
// // // //                     </Pie>
// // // //                     <ChartTooltip
// // // //                       content={<ChartTooltipContent />}
// // // //                     />
// // // //                   </PieChart>
// // // //                 </ChartContainer>
// // // //                 <div className="flex justify-center mt-4 space-x-6">
// // // //                   <div className="flex items-center">
// // // //                     <div className="h-3 w-3 bg-gray-700 mr-2" />
// // // //                     <span>Text - {coursesPieData[0].value}</span>
// // // //                   </div>
// // // //                   <div className="flex items-center">
// // // //                     <div className="h-3 w-3 bg-gray-100 border border-border mr-2" />
// // // //                     <span>Video - {coursesPieData[1].value}</span>
// // // //                   </div>
// // // //                 </div>
// // // //               </CardContent>
// // // //             </Card>
// // // //           </>
// // // //         )}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default AdminDashboard;



// // // // @ts-nocheck
// // // import React, { useEffect, useState } from "react";
// // // import axios from "axios";
// // // import {
// // //   PieChart,
// // //   Pie,
// // //   Cell,
// // //   Tooltip,
// // //   ResponsiveContainer,
// // //   Legend,
// // // } from "recharts";

// // // export default function AdminDashboard() {
// // //   const [userTypeChart, setUserTypeChart] = useState([]);
// // //   const [courseChart, setCourseChart] = useState([]);

// // //   const [paidUsersCount, setPaidUsersCount] = useState(0);
// // //   const [freeUsersCount, setFreeUsersCount] = useState(0);

// // //   const [paidCourseCount, setPaidCourseCount] = useState(0);
// // //   const [freeCourseCount, setFreeCourseCount] = useState(0);

// // //   const [loading, setLoading] = useState(true);

// // //   useEffect(() => {
// // //     fetchDashboardData();
// // //   }, []);

// // //   const fetchDashboardData = async () => {
// // //     try {
// // //       const token = localStorage.getItem("token");

// // //       const [usersRes, coursesRes] = await Promise.all([
// // //         axios.get("http://localhost:5001/api/getusers", {
// // //           headers: { Authorization: `Bearer ${token}` },
// // //         }),
// // //         axios.get("http://localhost:5001/api/getcourses", {
// // //           headers: { Authorization: `Bearer ${token}` },
// // //         }),
// // //       ]);

// // //       const users = usersRes.data || [];
// // //       const courses = coursesRes.data || [];

// // //       // =========================================
// // //       // ✅ USER TYPE BASED COUNT
// // //       // =========================================

// // //       let paidUsers = 0;
// // //       let freeUsers = 0;

// // //       users.forEach((user) => {
// // //         const type = user.type?.toLowerCase();

// // //         if (type === "free") {
// // //           freeUsers++;
// // //         } else if (type === "monthly" || type === "yearly") {
// // //           paidUsers++;
// // //         }
// // //       });

// // //       setPaidUsersCount(paidUsers);
// // //       setFreeUsersCount(freeUsers);

// // //       setUserTypeChart([
// // //         { name: "Paid Users", value: paidUsers },
// // //         { name: "Free Users", value: freeUsers },
// // //       ]);

// // //       // =========================================
// // //       // ✅ COURSE COUNT BASED ON MATCHED USER
// // //       // =========================================

// // //       const userIdSet = new Set(users.map((u) => u._id));

// // //       let paidCourses = 0;
// // //       let freeCourses = 0;

// // //       courses.forEach((course) => {
// // //         if (userIdSet.has(course.user)) {
// // //           if (course.restricted === true) {
// // //             paidCourses++;
// // //           } else {
// // //             freeCourses++;
// // //           }
// // //         }
// // //       });

// // //       setPaidCourseCount(paidCourses);
// // //       setFreeCourseCount(freeCourses);

// // //       setCourseChart([
// // //         { name: "Paid Courses", value: paidCourses },
// // //         { name: "Free Courses", value: freeCourses },
// // //       ]);

// // //       setLoading(false);
// // //     } catch (error) {
// // //       console.error("Dashboard Error:", error);
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const COLORS1 = ["#2563EB", "#22C55E"];
// // //   const COLORS2 = ["#EF4444", "#F59E0B"];

// // //   if (loading) return <div className="p-6">Loading...</div>;

// // //   return (
// // //         <div className="space-y-8 animate-fade-in">
// // //       <div className="flex items-center justify-between">
// // //         <div>
// // //           <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-500">Admin Dashboard</h1>
// // //           <p className="text-muted-foreground mt-1">Monitor and manage your platform</p>
// // //         </div>
// // //       </div>

// // //       {/* Stats Cards */}
// // //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
// // //         {isLoading ? (
// // //           // Loading skeleton for stats cards
// // //           <>
// // //             {[1, 2, 3, 4].map((i) => (
// // //               <Card key={i} className="border-border/50">
// // //                 <CardHeader className="pb-2">
// // //                   <Skeleton className="h-5 w-24" />
// // //                 </CardHeader>
// // //                 <CardContent className="flex items-center justify-between">
// // //                   <Skeleton className="h-8 w-8 rounded-full" />
// // //                   <Skeleton className="h-8 w-16" />
// // //                 </CardContent>
// // //               </Card>
// // //             ))}
// // //           </>
// // //         ) : (
// // //           // Modern stat cards with AdminStatCard component
// // //           <>
// // //             <AdminStatCard
// // //               title="Total Users"
// // //               value={data.users}
// // //               icon={Users}
// // //               description="Registered users"
// // //               gradient="from-blue-500 via-blue-600 to-indigo-600"
// // //               iconColor="text-blue-600"
// // //             />
// // //             <AdminStatCard
// // //               title="Total Courses"
// // //               value={data.courses}
// // //               icon={Play}
// // //               description="Generated courses"
// // //               gradient="from-purple-500 via-purple-600 to-pink-600"
// // //               iconColor="text-purple-600"
// // //             />
// // //             <AdminStatCard
// // //               title="Recurring Revenue"
// // //               value={`$${data.sum}`}
// // //               icon={RotateCcw}
// // //               description="Monthly subscriptions"
// // //               gradient="from-green-500 via-green-600 to-emerald-600"
// // //               iconColor="text-green-600"
// // //             />
// // //             <AdminStatCard
// // //               title="Total Revenue"
// // //               value={`$${data.total}`}
// // //               icon={DollarSign}
// // //               description="All-time earnings"
// // //               gradient="from-orange-500 via-orange-600 to-red-600"
// // //               iconColor="text-orange-600"
// // //             />
// // //             <AdminStatCard
// // //               title="Organizations"
// // //               value={data.organizations || 0}
// // //               icon={Building2}
// // //               description="Registered Institutions"
// // //               gradient="from-cyan-500 via-cyan-600 to-blue-600"
// // //               iconColor="text-cyan-600"
// // //             />
// // //             <AdminStatCard
// // //               title="Org Students"
// // //               value={data.orgStudents || 0}
// // //               icon={Users}
// // //               description="Students in organizations"
// // //               gradient="from-teal-500 via-teal-600 to-green-600"
// // //               iconColor="text-teal-600"
// // //             />
// // //           </>
// // //         )}
// // //       </div>
// // //     <div className="p-6">
// // //       <div className="bg-white rounded-2xl shadow-lg p-8">
// // //         <h1 className="text-2xl font-bold mb-8">
// // //           User & Course Analytics
// // //         </h1>

// // //         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

// // //           {/* LEFT CHART - USER TYPE */}
// // //           <div>
// // //             <h2 className="text-lg font-semibold text-center mb-4">
// // //               Subscription Based Users
// // //             </h2>

// // //             <ResponsiveContainer width="100%" height={300}>
// // //               <PieChart>
// // //                 <Pie
// // //                   data={userTypeChart}
// // //                   dataKey="value"
// // //                   outerRadius={110}
// // //                   label
// // //                 >
// // //                   {userTypeChart.map((entry, index) => (
// // //                     <Cell key={index} fill={COLORS1[index % 2]} />
// // //                   ))}
// // //                 </Pie>
// // //                 <Tooltip />
// // //                 <Legend />
// // //               </PieChart>
// // //             </ResponsiveContainer>

// // //             <div className="text-center mt-4 font-medium">
// // //               Paid Users: {paidUsersCount} | Free Users: {freeUsersCount}
// // //             </div>
// // //           </div>

// // //           {/* RIGHT CHART - COURSE COUNT */}
// // //           <div>
// // //             <h2 className="text-lg font-semibold text-center mb-4">
// // //               Course Type Count
// // //             </h2>

// // //             <ResponsiveContainer width="100%" height={300}>
// // //               <PieChart>
// // //                 <Pie
// // //                   data={courseChart}
// // //                   dataKey="value"
// // //                   outerRadius={110}
// // //                   label
// // //                 >
// // //                   {courseChart.map((entry, index) => (
// // //                     <Cell key={index} fill={COLORS2[index % 2]} />
// // //                   ))}
// // //                 </Pie>
// // //                 <Tooltip />
// // //                 <Legend />
// // //               </PieChart>
// // //             </ResponsiveContainer>

// // //             <div className="text-center mt-4 font-medium">
// // //               Paid Courses: {paidCourseCount} | Free Courses: {freeCourseCount}
// // //             </div>
// // //           </div>

// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }


// // // @ts-nocheck
// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import {
// //   PieChart,
// //   Pie,
// //   Cell,
// //   Tooltip,
// //   ResponsiveContainer,
// //   Legend,
// // } from "recharts";
// // import { Users, Play, RotateCcw, DollarSign, Building2 } from "lucide-react";
// // import AdminStatCard from '@/components/admin/AdminStatCard';

// // export default function AdminDashboard() {

// //   const [stats, setStats] = useState({
// //     users: 0,
// //     courses: 0,
// //     organizations: 0,
// //     orgStudents: 0,
// //     revenue: 0,
// //     recurringRevenue: 0,
// //   });

// //   const [userTypeChart, setUserTypeChart] = useState([]);
// //   const [courseChart, setCourseChart] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     fetchDashboardData();
// //   }, []);

// // const fetchDashboardData = async () => {
// //   try {
// //     const token = localStorage.getItem("token");

// //     const [usersRes, coursesRes, orgRes, ordersRes] = await Promise.all([
// //       axios.get("http://localhost:5001/api/getusers", {
// //         headers: { Authorization: `Bearer ${token}` },
// //       }),
// //       axios.get("http://localhost:5001/api/getcourses", {
// //         headers: { Authorization: `Bearer ${token}` },
// //       }),
// //       axios.get("http://localhost:5001/api/organizations", {
// //         headers: { Authorization: `Bearer ${token}` },
// //       }),
// //       axios.get("http://localhost:5001/api/orders", {
// //         headers: { Authorization: `Bearer ${token}` },
// //       }),
// //     ]);

// //     const users = usersRes.data || [];
// //     const courses = coursesRes.data || [];
// //     const organizations = orgRes.data || [];
// //     const orders = ordersRes.data || [];

// //     // ================= USER TYPE COUNT =================
// //     let paidUsers = 0;
// //     let freeUsers = 0;

// //     users.forEach((user) => {
// //       const type = user.type?.toLowerCase();
// //       if (type === "free") freeUsers++;
// //       if (type === "monthly" || type === "yearly") paidUsers++;
// //     });

// //     setUserTypeChart([
// //       { name: "Paid Users", value: paidUsers },
// //       { name: "Free Users", value: freeUsers },
// //     ]);

// //     // ================= COURSE COUNT =================
// //     let paidCourses = 0;
// //     let freeCourses = 0;

// //     courses.forEach((course) => {
// //       if (course.restricted) paidCourses++;
// //       else freeCourses++;
// //     });

// //     setCourseChart([
// //       { name: "Paid Courses", value: paidCourses },
// //       { name: "Free Courses", value: freeCourses },
// //     ]);

// //     // ================= ORGANIZATION STUDENT COUNT =================
// //     let orgStudentsCount = 0;

// //     organizations.forEach((org) => {
// //       orgStudentsCount += org.students?.length || 0;
// //     });

// //     // ================= TOTAL REVENUE FROM ORDERS =================
// //     const totalRevenue = orders.reduce((sum, order) => {
// //       return sum + (order.price || 0);
// //     }, 0);

// //     // Optional: Recurring revenue logic (if needed)
// //     const recurringRevenue = paidUsers * 100; // keep or modify if needed

// //     setStats({
// //       users: users.length,
// //       courses: courses.length,
// //       organizations: organizations.length,
// //       orgStudents: orgStudentsCount,
// //       revenue: totalRevenue,
// //       recurringRevenue: recurringRevenue,
// //     });

// //     setLoading(false);
// //   } catch (error) {
// //     console.error("Dashboard Error:", error);
// //     setLoading(false);
// //   }
// // };

// //   const COLORS1 = ["#2563EB", "#22C55E"];
// //   const COLORS2 = ["#EF4444", "#F59E0B"];

// //   if (loading) return <div className="p-6">Loading...</div>;

// //   return (
// //     <div className="space-y-8 p-6">

// //       <h1 className="text-3xl font-bold">Admin Dashboard</h1>

// //       {/* ======== STAT CARDS ======== */}
// //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

// //         <AdminStatCard
// //           title="Total Users"
// //           value={stats.users}
// //           icon={Users}
// //           description="Registered users"
// //         />

// //         <AdminStatCard
// //           title="Total Courses"
// //           value={stats.courses}
// //           icon={Play}
// //           description="Generated courses"
// //         />

// //         <AdminStatCard
// //           title="Recurring Revenue"
// //           value={`₹${stats.recurringRevenue}`}
// //           icon={RotateCcw}
// //           description="Monthly subscriptions"
// //         />

// //       <AdminStatCard
// //   title="Total Revenue"
// //   value={`₹${stats.revenue}`}
// //   icon={DollarSign}
// //   description="All-time earnings"
// // />

// //         <AdminStatCard
// //           title="Organizations"
// //           value={stats.organizations}
// //           icon={Building2}
// //           description="Registered Institutions"
// //         />

// //         <AdminStatCard
// //           title="Org Students"
// //           value={stats.orgStudents}
// //           icon={Users}
// //           description="Students in organizations"
// //         />

// //       </div>

// //       {/* ======== CHART SECTION ======== */}
// //       <div className="bg-white rounded-2xl shadow-lg p-8">
// //         <h2 className="text-xl font-bold mb-6">
// //           User & Course Analytics
// //         </h2>

// //         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

// //           {/* USER CHART */}
// //           <ResponsiveContainer width="100%" height={300}>
// //             <PieChart>
// //               <Pie data={userTypeChart} dataKey="value" outerRadius={110} label>
// //                 {userTypeChart.map((_, index) => (
// //                   <Cell key={index} fill={COLORS1[index % 2]} />
// //                 ))}
// //               </Pie>
// //               <Tooltip />
// //               <Legend />
// //             </PieChart>
// //           </ResponsiveContainer>

// //           {/* COURSE CHART */}
// //           <ResponsiveContainer width="100%" height={300}>
// //             <PieChart>
// //               <Pie data={courseChart} dataKey="value" outerRadius={110} label>
// //                 {courseChart.map((_, index) => (
// //                   <Cell key={index} fill={COLORS2[index % 2]} />
// //                 ))}
// //               </Pie>
// //               <Tooltip />
// //               <Legend />
// //             </PieChart>
// //           </ResponsiveContainer>

// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // @ts-nocheck
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";
// import { Users, Play, RotateCcw, DollarSign, Building2 } from "lucide-react";
// import AdminStatCard from "@/components/admin/AdminStatCard";

// export default function AdminDashboard() {
//   const [stats, setStats] = useState({
//     users: 0,
//     courses: 0,
//     organizations: 0,
//     orgStudents: 0,
//     revenue: 0,
//     recurringRevenue: 0,
//   });

//   const [userTypeChart, setUserTypeChart] = useState([]);
//   const [courseChart, setCourseChart] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const [usersRes, coursesRes, orgRes, ordersRes] = await Promise.all([
//         axios.get("http://localhost:5001/api/getusers", {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         axios.get("http://localhost:5001/api/getcourses", {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         axios.get("http://localhost:5001/api/organizations", {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         axios.get("http://localhost:5001/api/orders", {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);

//       const users = usersRes.data || [];
//       const courses = coursesRes.data || [];
//       const organizations = orgRes.data || [];
//       const orders = ordersRes.data || [];

//       // ================= USER TYPE COUNT =================
//       let paidUsers = 0;
//       let freeUsers = 0;

//       users.forEach((user) => {
//         const type = user.type?.toLowerCase();
//         if (type === "free") freeUsers++;
//         if (type === "monthly" || type === "yearly") paidUsers++;
//       });

//       setUserTypeChart([
//         { name: "Paid Users", value: paidUsers },
//         { name: "Free Users", value: freeUsers },
//       ]);

//       // ================= COURSE COUNT =================
//       let paidCourses = 0;
//       let freeCourses = 0;

//       courses.forEach((course) => {
//         if (course.restricted) paidCourses++;
//         else freeCourses++;
//       });

//       setCourseChart([
//         { name: "Paid Courses", value: paidCourses },
//         { name: "Free Courses", value: freeCourses },
//       ]);

//       // ================= ORGANIZATION STUDENT COUNT =================
//       let orgStudentsCount = 0;

//       organizations.forEach((org) => {
//         orgStudentsCount += org.students?.length || 0;
//       });

//       // ================= TOTAL REVENUE (ALL TIME) =================
//       const totalRevenue = orders.reduce((sum, order) => {
//         return sum + (Number(order.price) || 0);
//       }, 0);

//       // ================= MONTHLY REVENUE (CURRENT MONTH) =================
//       const now = new Date();
//       const currentMonth = now.getMonth();
//       const currentYear = now.getFullYear();

//       const monthlyOrders = orders.filter((order) => {
//         if (!order.createdAt) return false;
//         const orderDate = new Date(order.createdAt);

//         return (
//           orderDate.getMonth() === currentMonth &&
//           orderDate.getFullYear() === currentYear
//         );
//       });

//       const monthlyRevenue = monthlyOrders.reduce((sum, order) => {
//         return sum + (Number(order.price) || 0);
//       }, 0);

//       setStats({
//         users: users.length,
//         courses: courses.length,
//         organizations: organizations.length,
//         orgStudents: orgStudentsCount,
//         revenue: totalRevenue,
//         recurringRevenue: monthlyRevenue,
//       });

//       setLoading(false);
//     } catch (error) {
//       console.error("Dashboard Error:", error);
//       setLoading(false);
//     }
//   };

//   const COLORS1 = ["#2563EB", "#22C55E"];
//   const COLORS2 = ["#EF4444", "#F59E0B"];

//   if (loading) return <div className="p-6">Loading...</div>;

//   return (
//     <div className="space-y-8 p-6">
//       <h1 className="text-3xl font-bold">Admin Dashboard</h1>

//       {/* ======== STAT CARDS ======== */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         <AdminStatCard
//           title="Total Users"
//           value={stats.users}
//           icon={Users}
//           description="Registered users"
//         />

//         <AdminStatCard
//           title="Total Courses"
//           value={stats.courses}
//           icon={Play}
//           description="Generated courses"
//         />

//         <AdminStatCard
//           title="Recurring Revenue"
//           value={`₹${stats.recurringRevenue.toLocaleString()}`}
//           icon={RotateCcw}
//           description="This month earnings"
//         />

//         <AdminStatCard
//           title="Total Revenue"
//           value={`₹${stats.revenue.toLocaleString()}`}
//           icon={DollarSign}
//           description="All-time earnings"
//         />

//         <AdminStatCard
//           title="Organizations"
//           value={stats.organizations}
//           icon={Building2}
//           description="Registered Institutions"
//         />

//         <AdminStatCard
//           title="Org Students"
//           value={stats.orgStudents}
//           icon={Users}
//           description="Students in organizations"
//         />
//       </div>

//       {/* ======== CHART SECTION ======== */}
//       <div className="bg-white rounded-2xl shadow-lg p-8">
//         <h2 className="text-xl font-bold mb-6">
//           User & Course Analytics
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* USER CHART */}
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie data={userTypeChart} dataKey="value" outerRadius={110} label>
//                 {userTypeChart.map((_, index) => (
//                   <Cell key={index} fill={COLORS1[index % 2]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>

//           {/* COURSE CHART */}
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie data={courseChart} dataKey="value" outerRadius={110} label>
//                 {courseChart.map((_, index) => (
//                   <Cell key={index} fill={COLORS2[index % 2]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// }

// @ts-nocheck
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, Play, RotateCcw, DollarSign, Building2 } from "lucide-react";
import AdminStatCard from "@/components/admin/AdminStatCard";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    organizations: 0,
    orgStudents: 0,
    revenue: 0,
    recurringRevenue: 0,
  });

  const [userTypeChart, setUserTypeChart] = useState([]);
  const [courseChart, setCourseChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [usersRes, coursesRes, orgRes, ordersRes] = await Promise.all([
        axios.get("http://localhost:5001/api/getusers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5001/api/getcourses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5001/api/organizations", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5001/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const users = usersRes.data || [];
      const courses = coursesRes.data || [];
      const organizations = orgRes.data || [];
      const orders = ordersRes.data || [];

      // ================= USER TYPE COUNT =================
      let paidUsers = 0;
      let freeUsers = 0;

      users.forEach((user) => {
        const type = user.type?.toLowerCase();
        if (type === "free") freeUsers++;
        if (type === "monthly" || type === "yearly") paidUsers++;
      });

      setUserTypeChart([
        { name: "Paid Users", value: paidUsers },
        { name: "Free Users", value: freeUsers },
      ]);

      // ================= COURSE COUNT =================
      let paidCourses = 0;
      let freeCourses = 0;

      courses.forEach((course) => {
        if (course.restricted) paidCourses++;
        else freeCourses++;
      });

      setCourseChart([
        { name: "Paid Courses", value: paidCourses },
        { name: "Free Courses", value: freeCourses },
      ]);

      // ================= ORGANIZATION STUDENT COUNT (FROM USERS) =================
      const orgStudentsCount = users.filter((user) => {
        return (
          user.role?.toLowerCase() === "student" &&
          user.organization
        );
      }).length;

      // ================= TOTAL REVENUE (ALL TIME) =================
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (Number(order.price) || 0);
      }, 0);

      // ================= MONTHLY REVENUE (CURRENT MONTH) =================
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyRevenue = orders
        .filter((order) => {
          if (!order.createdAt) return false;
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, order) => {
          return sum + (Number(order.price) || 0);
        }, 0);

      setStats({
        users: users.length,
        courses: courses.length,
        organizations: organizations.length,
        orgStudents: orgStudentsCount,
        revenue: totalRevenue,
        recurringRevenue: monthlyRevenue,
      });

      setLoading(false);
    } catch (error) {
      console.error("Dashboard Error:", error);
      setLoading(false);
    }
  };

  const COLORS1 = ["#2563EB", "#22C55E"];
  const COLORS2 = ["#EF4444", "#F59E0B"];

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* ======== STAT CARDS ======== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminStatCard
          title="Total Users"
          value={stats.users}
          icon={Users}
          description="Registered users"
        />

        <AdminStatCard
          title="Total Courses"
          value={stats.courses}
          icon={Play}
          description="Generated courses"
        />

        <AdminStatCard
          title="Recurring Revenue"
          value={`₹${stats.recurringRevenue.toLocaleString()}`}
          icon={RotateCcw}
          description="This month earnings"
        />

        <AdminStatCard
          title="Total Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          description="All-time earnings"
        />

        <AdminStatCard
          title="Organizations"
          value={stats.organizations}
          icon={Building2}
          description="Registered Institutions"
        />

        <AdminStatCard
          title="Org Students"
          value={stats.orgStudents}
          icon={Users}
          description="Students in organizations"
        />
      </div>

      {/* ======== CHART SECTION ======== */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-6">
          User & Course Analytics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* USER CHART */}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={userTypeChart} dataKey="value" outerRadius={110} label>
                {userTypeChart.map((_, index) => (
                  <Cell key={index} fill={COLORS1[index % 2]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          {/* COURSE CHART */}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={courseChart} dataKey="value" outerRadius={110} label>
                {courseChart.map((_, index) => (
                  <Cell key={index} fill={COLORS2[index % 2]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}