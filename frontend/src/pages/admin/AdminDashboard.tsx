

// @ts-nocheck
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

import {
  Users,
  Play,
  RotateCcw,
  DollarSign,
  School,
  Building2,
  ShoppingBag,
  Calendar,
  Download,
  Activity,
   Filter,
  Zap,
} from "lucide-react";

import AdminStatCard from "@/components/admin/AdminStatCard";
import { serverURL } from "@/constants";
import { format, subDays } from "date-fns";



export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

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
  const [orgChart, setOrgChart] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);
  const [aiUsageChart, setAiUsageChart] = useState([]);
  const [aiFeatureChart, setAiFeatureChart] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
const [orgEnquiryChart, setOrgEnquiryChart] = useState([]);


  /* ================= FIXED ENQUIRY CHART ================= */


useEffect(() => {
  fetchEnquiryData();
}, []);

const fetchEnquiryData = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${serverURL}/api/organization-enquiries`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const enquiries = res.data || [];

    /* ================= GROUP BY referBy ================= */

    const enquiryCounts = enquiries.reduce((acc, curr) => {
      let source = curr.referBy;

      if (!source || source === "—") {
        source = "Direct";
      } else {
        source =
          source.charAt(0).toUpperCase() +
          source.slice(1).toLowerCase();
      }

      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const colors = [
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#10b981",
      "#f59e0b",
    ];

    const chartData = Object.entries(enquiryCounts).map(
      ([name, count], index) => ({
        name,
        count,
        color: colors[index % colors.length],
      })
    );

    setOrgEnquiryChart(chartData);
  } catch (error) {
    console.error("Error fetching enquiry data:", error);
  }
};

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);
const [organizations, setOrganizations] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [usersRes, coursesRes, orgRes, ordersRes] = await Promise.all([
        axios.get(`${serverURL}/api/getusers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${serverURL}/api/getcourses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${serverURL}/api/organizations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${serverURL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const users = usersRes.data || [];
      const courses = coursesRes.data || [];
      const organizations = orgRes.data || [];
      const orders = ordersRes.data || [];

      /* ================= USER DISTRIBUTION ================= */

      const paidUsers = users.filter(
        (u) => u.type === "monthly" || u.type === "yearly"
      ).length;

      const freeUsers = users.filter((u) => u.type === "free").length;

      setUserTypeChart([
        { name: "Paid Users", value: paidUsers },
        { name: "Free Users", value: freeUsers },
      ]);

      /* ================= COURSE DISTRIBUTION ================= */

      const paidCourses = courses.filter((c) => c.restricted).length;
      const freeCourses = courses.length - paidCourses;

      setCourseChart([
        { name: "Paid Courses", value: paidCourses },
        { name: "Free Courses", value: freeCourses },
      ]);

      /* ================= ORGANIZATIONS ================= */

      const orgStudents = users.filter(
        (u) => u.role === "student" && u.organization
      ).length;

      const orgCounts = {};
      users.forEach((u) => {
        if (u.organization) {
          orgCounts[u.organization] =
            (orgCounts[u.organization] || 0) + 1;
        }
      });
      

      const orgChartData = Object.entries(orgCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setOrgChart(orgChartData);

      /* ================= REVENUE ================= */

      const now = new Date();
      const days = Number(timeRange);

      const totalRevenue = orders.reduce(
        (sum, o) => sum + Number(o.price || 0),
        0
      );

      const monthRevenue = orders
        .filter((o) => {
          if (!o.createdAt) return false;
          const d = new Date(o.createdAt);
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum, o) => sum + Number(o.price || 0), 0);

      setStats({
        users: users.length,
        courses: courses.length,
        organizations: organizations.length,
        orgStudents,
        revenue: totalRevenue,
        recurringRevenue: monthRevenue,
      });
      

      /* ================= REVENUE TREND ================= */

      const filteredOrders = orders.filter((order) => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        if (isNaN(orderDate)) return false;
        return orderDate >= subDays(now, days - 1);
      });

      const revenueMap = {};

      filteredOrders.forEach((order) => {
        const key = format(new Date(order.createdAt), "yyyy-MM-dd");
        revenueMap[key] =
          (revenueMap[key] || 0) + Number(order.price || 0);
      });

      const revenueDays = [];

      for (let i = days - 1; i >= 0; i--) {
        const dateObj = subDays(now, i);
        const key = format(dateObj, "yyyy-MM-dd");

        revenueDays.push({
          date: format(dateObj, "MMM dd"),
          revenue: revenueMap[key] || 0,
        });
      }

      setRevenueChart(revenueDays);

      /* ================= RECENT ORDERS ================= */

      // const latest = [...orders]
      //   .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      //   .slice(0, 5)
      //   .map((o) => ({
      //     id: o._id,
      //     userName: o.userName || "User",
      //     price: o.price,
      //   }));
const latest = [...orders]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(0, 5)
  .map((o) => ({
    id: o._id,
    userName: o.userName || "User",
    price: o.price,
    date: o.createdAt,
    provider: o.provider,
    status: o.status,
  }));
      setRecentOrders(latest);

      /* ================= AI MOCK DATA ================= */

      setAiUsageChart(
        Array.from({ length: days }).map((_, i) => ({
          date: `Day ${i + 1}`,
          queries: Math.floor(Math.random() * 100),
          generations: Math.floor(Math.random() * 80),
        }))
      );

      setAiFeatureChart([
        { subject: "Quiz", A: 120 },
        { subject: "Flashcards", A: 98 },
        { subject: "Summary", A: 86 },
        { subject: "Chat", A: 99 },
        { subject: "PDF Notes", A: 65 },
      ]);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const COLORS_USER = ["#3B82F6", "#CBD5E1"];
  const COLORS_COURSE = ["#10b981", "#CBD5E1"];

  if (loading) return <div className="p-10">Loading...</div>;


  
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-slate-500">
              Overview of your platform
            </p>
          </div>
        </div>

        {/* STAT CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AdminStatCard
            title="Over All Revenue"
            value={`₹${Math.round(stats.revenue).toLocaleString("en-IN")}`}
            icon={DollarSign}
            description="All-time earnings"
            className="border-l-4 border-l-emerald-500"
          />
          <AdminStatCard
            title="This Month Revenue"
            value={`₹${Math.round(stats.recurringRevenue).toLocaleString("en-IN")}`}
            icon={RotateCcw}
            description="Current month earnings"
            className="border-l-4 border-l-blue-500"
          />
          <AdminStatCard
            title="Total Users"
            value={stats.users}
            icon={Users}
            description="Active registered users"
            className="border-l-4 border-l-amber-500"
          />
          <AdminStatCard
            title="Total Courses"
            value={stats.courses}
            icon={Play}
            description="Content library size"
            className="border-l-4 border-l-rose-500"
          />
          <AdminStatCard
            title="Organizations"
            value={stats.organizations}
            icon={Building2}
            description="Registered Institutions"
            className="border-l-4 border-l-indigo-500"
          />
          <AdminStatCard
            title="Org Students"
            value={stats.orgStudents}
            icon={School}
            description="Students in organizations"
            className="border-l-4 border-l-violet-500"
          />
           {/* <AdminStatCard
            title="Org Over All Revenue"
            value={stats.organizations}
            icon={Building2}
            description="Registered Institutions"
            className="border-l-4 border-l-indigo-500"
          />
          <AdminStatCard
            title="Org This Month Revenue"
            value={stats.orgStudents}
            icon={School}
            description="Students in organizations"
            className="border-l-4 border-l-violet-500"
          /> */}
        </div>

     {/* MAIN ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
     {/* DISTRIBUTION + ORDERS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      
            {/* User Distribution */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
  <h2 className="mb-4 text-lg font-semibold text-slate-900">
    User Distribution
  </h2>

  <div className="h-[220px] w-full flex flex-col items-center justify-center">
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={userTypeChart}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {userTypeChart.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS_USER[index % COLORS_USER.length]}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>

    {/* ✅ Custom Responsive Legend */}
    <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-sm sm:text-base">
      {userTypeChart.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm"
            style={{
              backgroundColor:
                COLORS_USER[index % COLORS_USER.length],
            }}
          />
          <span className="text-slate-700 font-medium">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  </div>
</div>

        {/* Organization Enquiries Chart */}
           <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1 flex flex-col gap-6">
            <div className="pt-6 border-t border-slate-100">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Enquiry Sources</h2>
                  <p className="text-sm text-slate-500">Referral breakdown</p>
                </div>
                {/* <div className="rounded-lg bg-orange-50 p-1">
                  <Filter className="h-5 w-5 text-orange-500" />
                </div> */}
              </div>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orgEnquiryChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="name"
                    >
                      {orgEnquiryChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
</div>

        </div>
       

          
 {/* REVENUE TRENDS */}
       <div className="bg-white p-6 rounded-xl shadow-sm">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-lg font-semibold">
        Revenue Trends
      </h2>
      <p className="text-sm text-slate-500">
        Last {timeRange} days performance
      </p>
    </div>
    <Activity className="text-slate-400" size={20} />
  </div>

  <ResponsiveContainer width="100%" height={250}>
    <AreaChart data={revenueChart}>
      <defs>
        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
        </linearGradient>
      </defs>

      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="date" />
      <YAxis tickFormatter={(v) => `₹${v}`} />
      <Tooltip formatter={(v) => [`₹${v}`, "Revenue"]} />

      <Area
        type="monotone"
        dataKey="revenue"
        stroke="#3b82f6"
        strokeWidth={2}
        fill="url(#colorRevenue)"
      />
    </AreaChart>
  </ResponsiveContainer>
</div>
          </div>

          {/* RIGHT */}
          <div className="space-y-8">

            {/* Top Organizations */}
               {/* Course Distribution */}
           <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
  <h2 className="mb-4 text-lg font-semibold text-slate-900">
    Course Types
  </h2>

  <div className="h-[220px] w-full flex flex-col items-center justify-center">
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={courseChart}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {courseChart.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                COLORS_COURSE[index % COLORS_COURSE.length]
              }
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>

    {/* ✅ Custom Responsive Legend */}
    <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-sm sm:text-base">
      {courseChart.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm"
            style={{
              backgroundColor:
                COLORS_COURSE[index % COLORS_COURSE.length],
            }}
          />
          <span className="text-slate-700 font-medium">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  </div>
</div>

           {/* 3. AI FEATURE USAGE (Radar Chart) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">AI Feature Usage</h2>
                <p className="text-sm text-slate-500">Popular study tools</p>
              </div>
              <div className="rounded-lg bg-pink-50 p-1">
                <Zap className="h-5 w-5 text-pink-500" />
              </div>
            </div>
            <div className="h-[250px] w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={aiFeatureChart}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar
                    name="Usage"
                    dataKey="A"
                    stroke="#ec4899"
                    fill="#ec4899"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          </div>
        </div>
            {/* ======== RECENT ORDERS SECTION ======== */}
    
<div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
  <div className="flex items-center gap-2 mb-6">
    <ShoppingBag className="w-6 h-6 text-primary" />
    <h2 className="text-xl font-bold">Recent Orders</h2>
    <span className="text-sm text-muted-foreground ml-2">
      (Last 5 orders)
    </span>
  </div>

  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-border">
      <thead className="bg-muted/40">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Order ID
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            User
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Amount
          </th>
           <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
             Provider
           </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Date
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Status
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-border">
        {recentOrders.length > 0 ? (
          recentOrders.map((order, index) => (
         <tr
  key={order.id || index}
  className="hover:bg-muted/50 transition-colors"
>
  {/* Order ID */}
  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
    #{typeof order.id === "string"
      ? order.id.slice(-6)
      : order.id}
  </td>

  {/* User */}
  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
    {order.userName}
  </td>

  {/* Amount */}
  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
    ₹{Math.round(order.price).toLocaleString("en-IN")}
  </td>

  {/* Provider */}
  <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-muted-foreground">
    {order.provider}
  </td>

  {/* Date */}
  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
    {order.date
      ? new Date(order.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-"}
  </td>

  {/* Status */}
  <td className="px-6 py-4 whitespace-nowrap">
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
        order.status === "success"
          ? "bg-green-500/10 text-green-600"
          : order.status === "pending"
          ? "bg-yellow-500/10 text-yellow-600"
          : order.status === "failed"
          ? "bg-red-500/10 text-red-600"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {order.status}
    </span>
  </td>
</tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={6}
              className="px-6 py-8 text-center text-muted-foreground"
            >
              No recent orders found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
  

      </div>
    </div>
  );
}