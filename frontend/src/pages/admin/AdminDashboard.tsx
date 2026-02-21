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