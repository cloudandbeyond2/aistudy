// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Lock, BookOpen, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import StatsCard from "@/components/dashboard/StatsCard";
import ProgressRing from "@/components/dashboard/ProgressRing";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid
} from "recharts";
import axios from "axios";
import { serverURL } from "@/constants"; 



const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const Analytics = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  const plan = sessionStorage.getItem("type");
  const isPaid = ["monthly", "yearly", "forever"].includes(plan);

useEffect(() => {
  const fetchCourses = async () => {
    try {
      const userId = sessionStorage.getItem("uid");

   const res = await axios.get(
  `${serverURL}/api/courses?userId=${userId}&page=1&limit=1000`
);

      const data = res.data.courses || res.data;
      setCourses(data);

    } catch (err) {
      console.error("Analytics fetch error:", err);
    }
  };

  fetchCourses();
}, []);
useEffect(() => {
  const trackAnalytics = async () => {
    try {
      const userId = sessionStorage.getItem("uid");

      if (courses.length > 0) {

        const res = await axios.post(`${serverURL}/api/analytics`, {
          userId,
          courseId: courses[0]._id,
          action: "viewed"
        });
      }

    } catch (err) {
      console.error("Tracking failed", err);
    }
  };

  trackAnalytics();
}, [courses]);

  // ✅ CENTRALIZED STATS (NO DUPLICATION)
  const stats = useMemo(() => {
    const total = courses.length;
    const completed = courses.filter(c => c.completed === true).length;
    const inProgress = total - completed;
    const percent = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, inProgress, percent };
  }, [courses]);

  // ✅ PIE DATA (TOPIC DISTRIBUTION)
  const topicData = useMemo(() => {
  const completedCourses = courses.filter(c => c.completed);

  const counts = {};

  completedCourses.forEach(c => {
    const topic = c.mainTopic || "Other";
    counts[topic] = (counts[topic] || 0) + 1;
  });

  let data = Object.entries(counts).map(([name, value]) => ({
    name,
    value
  }));

  return data;
}, [courses]);
  // ✅ BAR DATA (PROGRESS)
  const progressData = useMemo(() => [
    { name: "Completed", value: stats.completed },
    { name: "In Progress", value: stats.inProgress }
  ], [stats]);

  const redirectPricing = () => {
    navigate("/dashboard/pricing");
  };

  // ✅ SMART COURSE PICKER
// ✅ SIMPLE: pick any unfinished course
const getSmartCourse = () => {
  const inProgressCourses = courses.filter(c => !c.completed);

  if (inProgressCourses.length === 0) return null;

  // 👉 just pick first unfinished course
  return inProgressCourses[0];
};
// ✅ BUTTON HANDLER
const handleContinueLearning = () => {
  navigate("/dashboard");
};

// 🔥 TEMP ACTIVITY DATA (replace later with backend)
const activityData = [
  { date: "2026-03-15", count: 1 },
  { date: "2026-03-16", count: 2 },
  { date: "2026-03-17", count: 0 },
  { date: "2026-03-18", count: 3 },
  { date: "2026-03-19", count: 1 },
];

// 🔥 SIMPLE STREAK CALC (for now)
const currentStreak = 3;
const longestStreak = 7;
  return (
    <div className="space-y-8">

        {/* 🔷 Page Heading */}
<div className="flex items-center gap-4 p-4 rounded-2xl border bg-white shadow-sm">
  
  <div className="p-3 rounded-xl bg-indigo-100">
    <BookOpen className="h-6 w-6 text-indigo-600" />
  </div>

  <div>
    <h1 className="text-2xl font-bold text-gray-900">
      Analytics Dashboard
    </h1>
    <p className="text-sm text-gray-500">
      Track your learning progress, course performance, and insights.
    </p>
  </div>
</div>

      {/* 🔥 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Courses" value={stats.total} icon={BookOpen} />
        <StatsCard title="Completed" value={stats.completed} icon={CheckCircle} />
        <StatsCard title="In Progress" value={stats.inProgress} icon={Clock} />
      </div>

     {/* 🔵 Progress + Extra Section */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

  {/* ✅ LEFT: Overall Completion Card */}
  <Card className="rounded-3xl shadow-sm">
    <CardHeader>
      <CardTitle>Overall Completion</CardTitle>
      <CardDescription>Your learning progress</CardDescription>
    </CardHeader>

    <CardContent className="flex items-center justify-center flex-col">
      <ProgressRing progress={stats.percent} />
      <p className="mt-3 text-lg font-semibold text-gray-700">
        {stats.percent.toFixed(0)}% Completed
      </p>
    </CardContent>
  </Card>
{/* ✅ RIGHT: Interactive Action Card */}
<Card className="rounded-3xl shadow-sm">
  <CardHeader>
    <CardTitle>Learning Actions</CardTitle>
    <CardDescription>Stay on track with your courses</CardDescription>
  </CardHeader>

  <CardContent className="space-y-5">

    {/* 🧠 Dynamic Message */}
    {/* 🧠 SMART USER MESSAGE */}
{/* 🧠 SMART USER MESSAGE */}
{stats.percent === 0 && (
  <div className="p-3 rounded-xl bg-gray-100 text-gray-800 font-medium">
    🚀 You’re just getting started. Begin your first course now!
  </div>
)}

{stats.percent > 0 && stats.percent < 25 && (
  <div className="p-3 rounded-xl bg-yellow-50 text-yellow-700 font-semibold">
    📚 You’ve started learning! Try to stay consistent and build momentum.
  </div>
)}

{stats.percent >= 25 && stats.percent < 75 && (
  <div className="p-3 rounded-xl bg-blue-50 text-blue-700 font-semibold">
    💪 Good progress! You're on the right track — keep going!
  </div>
)}

{stats.percent >= 75 && stats.percent < 100 && (
  <div className="p-3 rounded-xl bg-purple-50 text-purple-700 font-semibold">
    🔥 Almost there! Finish your remaining courses.
  </div>
)}

{stats.percent === 100 && (
  <div className="p-3 rounded-xl bg-green-50 text-green-700 font-semibold">
    🎉 Amazing! You’ve completed all your courses!
  </div>
)}

    {/* 🎯 Action Buttons */}
    <div className="flex gap-3 flex-wrap">

      {/* 👉 Go to In Progress */}
      {stats.inProgress > 0 && (
        <Button
          variant="default"
     onClick={handleContinueLearning}
        >
          Continue Learning
        </Button>
      )}
    </div>

    

  </CardContent>
</Card>

</div>

      {/* 🚀 Advanced Analytics */}
      <div className="mt-12 space-y-6">

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            Advanced Analytics
          </h2>

          {!isPaid && (
            <Badge variant="secondary" className="gap-1 px-3 py-1">
              <Lock className="h-3 w-3" /> Premium Feature
            </Badge>
          )}
        </div>

        <div className="relative">

         
          {/* 🔒 LOCK */}
          {!isPaid && (
            <div className="absolute inset-0 z-20 backdrop-blur-[6px] bg-background/40 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/20 p-8 text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Unlock Advanced Insights</h3>
              <p className="text-muted-foreground mb-6">
                Get detailed visualizations of your learning patterns.
              </p>
              <Button onClick={redirectPricing}>Upgrade</Button>
            </div>
          )}

          {/* 📊 Charts */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${!isPaid ? "opacity-40 pointer-events-none" : ""}`}>

            {/* 🟣 Pie */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Topic Distribution</CardTitle>
                <CardDescription>Courses by topic</CardDescription>
              </CardHeader>

             <CardContent className="h-[300px] flex items-center justify-center">
  {topicData.length === 0 ? (
    <div className="text-center text-gray-500">
      <p className="text-sm font-medium">No completed courses yet</p>
      <p className="text-xs">
        Complete courses to see topic distribution
      </p>
    </div>
  ) : (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={topicData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
        >
          {topicData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )}
</CardContent>
            </Card>

            {/* 🟢 Bar */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Status overview</CardDescription>
              </CardHeader>

              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value">
                      <Cell fill="#10B981" />
                      <Cell fill="#4F46E5" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
