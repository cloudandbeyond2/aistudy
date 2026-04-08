
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles, BookOpen, CheckCircle, Clock,
  Lock, TrendingUp, Target, Zap, Star,
  Award, RefreshCw, Search,
  Inbox, GraduationCap, MousePointerClick,
  Flame, Brain, Activity,
  BarChart3, PieChart as PieChartIcon, Gauge, Rocket,
  Medal, AlertCircle, Compass, Timer,
  Diamond, Lightbulb, ChevronRight, Trophy,
  Calendar, TrendingDown, Eye, BookMarked,
  Layers, Hash, LayoutDashboard, ArrowUp, ArrowDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatsCard from "@/components/dashboard/StatsCard";
import ProgressRing from "@/components/dashboard/ProgressRing";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import axios from "axios";
import { serverURL } from "@/constants";
import { cn } from "@/lib/utils";

// ─── Brand Colors ────────────────────────────────────────────────
const C = {
  dark:    "#0f3554",
  mid:     "#0ea5e9",
  light:   "#e0f2fe",
  accent:  "#f59e0b",
  success: "#10b981",
  danger:  "#ef4444",
  purple:  "#8b5cf6",
  grad:    "linear-gradient(135deg,#0f3554 0%,#0ea5e9 100%)",
  gradWarm:"linear-gradient(135deg,#f59e0b 0%,#f97316 100%)",
  gradGreen:"linear-gradient(135deg,#10b981 0%,#059669 100%)",
  gradPurple:"linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%)",
  pie: ["#0f3554","#0ea5e9","#f59e0b","#10b981","#8b5cf6","#ef4444","#06b6d4","#f97316"],
};

// ─── Tiny Accent Bar ────────────────────────────────────────────
const Accent = ({ gradient = C.grad }) => (
  <div className="h-1 w-full rounded-t-2xl" style={{ background: gradient }} />
);

// ─── Empty States ───────────────────────────────────────────────
const EmptyChart = ({ message, icon: Icon = Inbox }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-3">
    <div className="bg-slate-50 p-4 rounded-full">
      <Icon className="h-8 w-8 text-slate-300" />
    </div>
    <p className="text-sm text-slate-400 font-medium max-w-[180px] leading-snug">{message}</p>
  </div>
);

// ─── Metric Card ─────────────────────────────────────────────────
const MetricCard = ({ title, value, icon: Icon, subtitle, gradient = C.grad, badge, badgeUp }) => (
  <div className="rounded-2xl p-4 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3">
    <div className="flex items-start justify-between">
      <div className="p-2.5 rounded-xl" style={{ background: C.light }}>
        <Icon className="h-5 w-5" style={{ color: C.mid }} />
      </div>
      {badge !== undefined && (
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5",
          badgeUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
        )}>
          {badgeUp ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
          {badge}
        </span>
      )}
    </div>
    <div>
      <p className="text-2xl font-black tracking-tight" style={{ color: C.dark }}>{value}</p>
      <p className="text-xs font-semibold text-slate-500 mt-0.5">{title}</p>
      {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ─── Week Bar Chart (Streak Timeline) ────────────────────────────
const WeekBars = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end justify-between gap-1.5 h-28 px-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t-md transition-all duration-300"
            style={{
              height: `${Math.max((d.value / max) * 80, d.value > 0 ? 6 : 2)}px`,
              background: d.value > 0 ? C.grad : "#e2e8f0",
            }}
          />
          <span className="text-[9px] font-bold text-slate-400">{d.day}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Achievement Badge ───────────────────────────────────────────
const Achievement = ({ title, description, icon: Icon, progress, locked }) => (
  <div className={cn(
    "rounded-xl p-3.5 border flex items-start gap-3 transition-all",
    locked ? "bg-slate-50 border-slate-100 opacity-50" : "bg-white border-amber-100 shadow-sm"
  )}>
    <div className={cn("p-2 rounded-xl shrink-0", locked ? "bg-slate-200" : "bg-gradient-to-br from-amber-100 to-orange-100")}>
      <Icon className={cn("h-4 w-4", locked ? "text-slate-400" : "text-amber-600")} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-slate-800 truncate">{title}</p>
        {!locked && progress >= 100 && (
          <Badge className="bg-emerald-100 text-emerald-700 text-[9px] shrink-0">✓ Done</Badge>
        )}
      </div>
      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{description}</p>
      {!locked && progress < 100 && (
        <div className="mt-1.5">
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: C.grad }} />
          </div>
          <p className="text-[9px] text-slate-400 mt-0.5">{Math.floor(progress)}%</p>
        </div>
      )}
    </div>
  </div>
);

// ─── Insight Card ────────────────────────────────────────────────
const Insight = ({ title, description, type = "tip" }) => {
  const map = {
    tip:     { bg: C.light, icon: C.mid,     text: C.dark },
    warning: { bg: "#fef3c7", icon: "#d97706", text: "#92400e" },
    success: { bg: "#d1fae5", icon: "#059669", text: "#065f46" },
  };
  const s = map[type];
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: s.bg }}>
      <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" style={{ color: s.icon }} />
      <div>
        <p className="text-xs font-bold" style={{ color: s.text }}>{title}</p>
        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{description}</p>
      </div>
    </div>
  );
};

// ─── Leaderboard Row ─────────────────────────────────────────────
const LeaderRow = ({ rank, topic, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const medals = ["🥇","🥈","🥉"];
  return (
    <div className="flex items-center gap-3">
      <span className="text-base w-6 shrink-0">{medals[rank] || `${rank + 1}.`}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-slate-700 truncate">{topic}</p>
          <p className="text-xs font-bold shrink-0 ml-2" style={{ color: C.mid }}>{count}</p>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: C.grad }} />
        </div>
      </div>
    </div>
  );
};

// ─── Custom Tooltip ──────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 px-3 py-2">
      <p className="text-[10px] font-semibold text-slate-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-bold" style={{ color: p.color || C.mid }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────
const Analytics = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const plan = sessionStorage.getItem("type");
  const isPaid = ["monthly", "yearly", "forever"].includes(plan);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const userId = sessionStorage.getItem("uid");
        const res = await axios.get(`${serverURL}/api/courses?userId=${userId}&page=1&limit=1000`);
        setCourses(res.data.courses || res.data || []);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // ── Core Stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = courses.length;
    const completed = courses.filter(c => c.completed).length;
    const inProgress = total - completed;
    const percent = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, inProgress, percent };
  }, [courses]);

  // ── Weekly Activity ──────────────────────────────────────────────
  const weeklyProgress = useMemo(() => {
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const count = courses.filter(c => {
        const d = new Date(c.updatedAt || c.createdAt);
        return d.toDateString() === date.toDateString();
      }).length;
      return { day: days[date.getDay()], value: count };
    });
  }, [courses]);

  // ── Streak ───────────────────────────────────────────────────────
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = weeklyProgress.length - 1; i >= 0; i--) {
      if (weeklyProgress[i].value > 0) streak++;
      else if (i < weeklyProgress.length - 1) break;
    }
    return streak;
  }, [weeklyProgress]);

  // ── Topic Distribution ───────────────────────────────────────────
  const topicData = useMemo(() => {
    const counts = {};
    courses.filter(c => c.completed).forEach(c => {
      const t = c.mainTopic || "General";
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [courses]);

  // ── All Topics (incl. in-progress) ──────────────────────────────
  const allTopicData = useMemo(() => {
    const counts = {};
    courses.forEach(c => {
      const t = c.mainTopic || "General";
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [courses]);

  // ── Monthly Velocity ─────────────────────────────────────────────
  const velocityData = useMemo(() => {
    const months = {};
    courses.forEach(c => {
      const date = new Date(c.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) months[key] = { enrolled: 0, completed: 0 };
      months[key].enrolled++;
      if (c.completed) months[key].completed++;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, val]) => ({
        month: key.slice(5) + "/" + key.slice(2, 4),
        enrolled: val.enrolled,
        completed: val.completed,
      }));
  }, [courses]);

  // ── Time of Day ──────────────────────────────────────────────────
  const timeBreakdown = useMemo(() => {
    const t = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    courses.forEach(c => {
      const h = new Date(c.updatedAt || c.createdAt).getHours();
      if (h < 6) t.Night++;
      else if (h < 12) t.Morning++;
      else if (h < 18) t.Afternoon++;
      else t.Evening++;
    });
    return Object.entries(t).map(([name, value]) => ({ name, value }));
  }, [courses]);

  // ── Radar (Skills) ───────────────────────────────────────────────
  const radarData = useMemo(() => {
    if (allTopicData.length === 0) return [];
    const max = Math.max(...allTopicData.map(t => t.value));
    return allTopicData.slice(0, 6).map(t => ({
      subject: t.name.length > 10 ? t.name.slice(0, 10) + "…" : t.name,
      value: Math.round((t.value / max) * 100),
    }));
  }, [allTopicData]);

  // ── Engagement Score ─────────────────────────────────────────────
  const engagementScore = useMemo(() => {
    if (!courses.length) return 0;
    const recent = courses.filter(c => {
      const daysAgo = (Date.now() - new Date(c.updatedAt || c.createdAt)) / 86400000;
      return daysAgo <= 7;
    }).length;
    return Math.min(100, Math.floor(recent * 12 + stats.percent * 0.4));
  }, [courses, stats.percent]);

  // ── XP ───────────────────────────────────────────────────────────
  const totalXP = Math.floor(stats.completed * 150 + stats.inProgress * 30 + currentStreak * 20);

  // ── Recommendations ──────────────────────────────────────────────
  const recommendations = useMemo(() => {
    const r = [];
    if (stats.inProgress > 3)
      r.push({ title: "Focus Mode", description: `${stats.inProgress} courses in progress. Try completing one this week.`, type: "tip" });
    if (currentStreak === 0 && courses.length > 0)
      r.push({ title: "Restart Your Streak", description: "No activity today — even 5 minutes keeps the streak alive!", type: "warning" });
    if (stats.percent >= 75 && stats.percent < 100)
      r.push({ title: "Almost There!", description: `${(100 - stats.percent).toFixed(0)}% left. Finish your remaining courses!`, type: "success" });
    if (stats.percent === 100 && courses.length > 0)
      r.push({ title: "Legend Status 🏆", description: "You've completed everything! Explore new topics to keep growing.", type: "success" });
    if (r.length === 0 && courses.length > 0)
      r.push({ title: "Great Pace!", description: "You're building consistent learning habits. Keep it up!", type: "success" });
    if (courses.length === 0)
      r.push({ title: "Get Started", description: "Enroll in your first course to unlock personalized insights.", type: "tip" });
    return r;
  }, [stats, currentStreak, courses.length]);

  // ── Achievements ─────────────────────────────────────────────────
  const achievements = useMemo(() => {
    const topMax = topicData.length > 0 ? Math.max(...topicData.map(t => t.value)) : 0;
    return [
      { title: "First Step",      description: "Complete your first course",           icon: Medal,   progress: stats.completed >= 1 ? 100 : 0, locked: stats.completed === 0 },
      { title: "On Fire",         description: "Maintain a 3-day learning streak",     icon: Flame,   progress: Math.min(100, (currentStreak / 3) * 100), locked: currentStreak < 3 },
      { title: "Topic Master",    description: "Complete 3 courses in one topic",       icon: Target,  progress: Math.min(100, (topMax / 3) * 100), locked: topMax < 3 },
      { title: "Speed Learner",   description: "Complete 10 courses total",            icon: Zap,     progress: Math.min(100, (stats.completed / 10) * 100), locked: stats.completed < 10 },
      { title: "Explorer",        description: "Explore 5 different topics",           icon: Compass, progress: Math.min(100, (allTopicData.length / 5) * 100), locked: allTopicData.length < 5 },
      { title: "Completionist",   description: "Complete 100% of your courses",        icon: Trophy,  progress: stats.percent, locked: stats.percent < 100 },
    ];
  }, [stats, currentStreak, topicData, allTopicData]);

  // ── Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" style={{ color: C.mid }} />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-7xl mx-auto space-y-5 px-3 sm:px-4 lg:px-6 pb-20">

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: C.light }}>
            <BarChart3 className="h-6 w-6" style={{ color: C.mid }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: C.dark }}>
              {stats.percent === 100 ? "🏆 Mastery Achieved!" : stats.percent > 50 ? "🔥 Great Momentum!" : "📊 Analytics Dashboard"}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {greeting}! You've completed <span className="font-bold" style={{ color: C.mid }}>{stats.completed}</span> of <span className="font-bold">{stats.total}</span> courses.
            </p>
          </div>
        </div>
        {!isPaid && (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full gap-1.5 w-fit">
            <Lock className="h-3 w-3" /> Free Tier
          </Badge>
        )}
      </div>

      {/* ── METRIC GRID ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard title="Total Courses"    value={stats.total}                    icon={BookOpen}       badge="new"   badgeUp={true}  subtitle="Enrolled" />
        <MetricCard title="Completed"        value={stats.completed}                icon={CheckCircle}    badge={`${stats.percent.toFixed(0)}%`} badgeUp={stats.percent > 50} />
        <MetricCard title="In Progress"      value={stats.inProgress}               icon={Clock}          subtitle="Active now" />
        <MetricCard title="Streak"           value={`${currentStreak}d`}            icon={Flame}          badge={currentStreak > 0 ? "active" : "0d"} badgeUp={currentStreak > 0} />
        <MetricCard title="Total XP"         value={totalXP.toLocaleString()}       icon={Star}           badge="+XP"   badgeUp={true} />
        <MetricCard title="Engagement"       value={`${engagementScore}%`}          icon={Activity}       badge={engagementScore > 50 ? "high" : "low"} badgeUp={engagementScore > 50} />
      </div>

      {/* ── OVERALL COMPLETION + SMART TIPS ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Progress Ring */}
        <Card className="rounded-2xl shadow-sm border-0 overflow-hidden">
          <Accent />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold" style={{ color: C.dark }}>Curriculum Mastery</CardTitle>
            <CardDescription>Your overall completion across all courses</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <ProgressRing progress={stats.percent} size={160} strokeWidth={14} />
            <div className="text-center mt-4">
              <span className="text-4xl font-black" style={{ color: C.dark }}>{stats.percent.toFixed(0)}%</span>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Complete</p>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="text-center">
                <p className="text-lg font-black" style={{ color: C.success }}>{stats.completed}</p>
                <p className="text-[10px] text-slate-400 font-semibold">Done</p>
              </div>
              <div className="w-px bg-slate-100" />
              <div className="text-center">
                <p className="text-lg font-black" style={{ color: C.accent }}>{stats.inProgress}</p>
                <p className="text-[10px] text-slate-400 font-semibold">Pending</p>
              </div>
              <div className="w-px bg-slate-100" />
              <div className="text-center">
                <p className="text-lg font-black" style={{ color: C.dark }}>{stats.total}</p>
                <p className="text-[10px] text-slate-400 font-semibold">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Smart Recommendations */}
        <Card className="rounded-2xl shadow-sm border-0 overflow-hidden">
          <Accent gradient={C.gradWarm} />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: C.dark }}>
              <Lightbulb className="h-4 w-4 text-amber-500" /> Smart Recommendations
            </CardTitle>
            <CardDescription>Personalized insights for your learning path</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((r, i) => <Insight key={i} {...r} />)}
          </CardContent>
        </Card>
      </div>
 {/* ── ACHIEVEMENTS ─────────────────────────────────────────── */}
      <Card className="rounded-2xl shadow-sm border-0 overflow-hidden">
        <Accent gradient={C.gradWarm} />
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: C.dark }}>
            <Award className="h-4 w-4 text-amber-500" /> Achievements & Milestones
          </CardTitle>
          <CardDescription>Unlock badges by reaching learning goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((a, i) => <Achievement key={i} {...a} />)}
          </div>
        </CardContent>
      </Card>

      {/* ── CTA ROW ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          className="flex-1 h-11 rounded-xl font-bold text-white shadow-md hover:-translate-y-0.5 transition-all"
          style={{ background: C.grad }}
          onClick={() => navigate("/dashboard")}
        >
          Continue Learning Journey <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
        {stats.inProgress > 0 && (
          <Button
            variant="outline"
            className="h-11 rounded-xl font-bold sm:w-auto"
            style={{ borderColor: C.mid, color: C.mid }}
            onClick={() => navigate("/dashboard?filter=in-progress")}
          >
            Resume {stats.inProgress} Pending {stats.inProgress === 1 ? "Course" : "Courses"}
          </Button>
        )}
      </div>
      {/* ── WEEKLY ACTIVITY + VELOCITY ────────────────────────────── */}
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly */}
        <Card className="rounded-2xl shadow-sm border-0 overflow-hidden">
          <Accent />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: C.dark }}>
              <Calendar className="h-4 w-4" style={{ color: C.mid }} /> This Week
            </CardTitle>
            <CardDescription>Daily learning activity</CardDescription>
          </CardHeader>
          <CardContent>
            <WeekBars data={weeklyProgress} />
            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl" style={{ background: C.light }}>
              <Flame className="h-4 w-4 text-orange-500 shrink-0" />
              <p className="text-xs font-bold" style={{ color: C.dark }}>
                {currentStreak} {currentStreak === 1 ? "day" : "days"} streak
                {currentStreak >= 3 ? " 🔥" : currentStreak > 0 ? " 👍" : " — start today!"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Velocity */}
    <Card className="rounded-2xl shadow-sm border-0 overflow-hidden">
          <Accent gradient={C.gradGreen} />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: C.dark }}>
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Monthly Velocity
            </CardTitle>
            <CardDescription>Enrolled vs Completed per month</CardDescription>
          </CardHeader>
          <CardContent>
            {velocityData.length === 0 ? (
              <div className="h-40"><EmptyChart message="Enroll in courses to see monthly trends." icon={Rocket} /></div>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={velocityData}>
                    <defs>
                      <linearGradient id="gEnrolled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.mid} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={C.mid} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.success} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={C.success} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="enrolled"  stroke={C.mid}     fill="url(#gEnrolled)"  strokeWidth={2} name="Enrolled" />
                    <Area type="monotone" dataKey="completed" stroke={C.success} fill="url(#gCompleted)" strokeWidth={2} name="Completed" />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── TOPIC LEADERBOARD + TIME OF DAY ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Topic Leaderboard */}
        <Card className="rounded-2xl shadow-sm border-0 overflow-hidden">
          <Accent gradient={C.gradPurple} />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: C.dark }}>
              <Hash className="h-4 w-4 text-purple-500" /> Top Topics
            </CardTitle>
            <CardDescription>Your most studied subject areas</CardDescription>
          </CardHeader>
          <CardContent>
            {allTopicData.length === 0 ? (
              <div className="h-40"><EmptyChart message="Enroll in courses to see topic distribution." icon={Layers} /></div>
            ) : (
              <div className="space-y-3">
                {allTopicData.slice(0, 5).map((t, i) => (
                  <LeaderRow key={i} rank={i} topic={t.name} count={t.value} total={courses.length} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time of Day */}
        <Card className="rounded-2xl shadow-sm border-0 overflow-hidden">
          <Accent gradient={C.gradWarm} />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: C.dark }}>
              <Timer className="h-4 w-4 text-amber-500" /> When You Learn
            </CardTitle>
            <CardDescription>Peak learning hours breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {timeBreakdown.every(t => t.value === 0) ? (
              <div className="h-40"><EmptyChart message="Engage with courses to see your peak learning hours." icon={Clock} /></div>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={22} name="Activity">
                      {timeBreakdown.map((_, i) => (
                        <Cell key={i} fill={[C.mid, C.accent, C.purple, C.dark][i % 4]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── SKILL RADAR ──────────────────────────────────────────── */}
      {radarData.length >= 3 && (
        <Card className="rounded-2xl shadow-sm border-0 overflow-hidden">
          <Accent />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: C.dark }}>
              <Brain className="h-4 w-4" style={{ color: C.mid }} /> Skill Radar
            </CardTitle>
            <CardDescription>Your topic mastery visualized</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
  data={radarData} 
  cx="50%" 
  cy="50%" 
  outerRadius="80%"
>
               <PolarGrid stroke="#cbd5f5" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: C.dark }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Mastery" dataKey="value" stroke={C.mid} fill={C.mid} fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

     

      {/* ── PREMIUM / ADVANCED ANALYTICS ────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black flex items-center gap-2" style={{ color: C.dark }}>
            <Diamond className="h-5 w-5" style={{ color: C.mid }} /> Advanced Analytics
          </h2>
          {!isPaid && (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 rounded-full gap-1">
              <Lock className="h-3 w-3" /> Premium
            </Badge>
          )}
        </div>

        <div className="relative">
          {!isPaid && (
            <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/50 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 p-8 text-center">
              <div className="bg-white p-4 rounded-full shadow-lg mb-4">
                <Sparkles className="h-9 w-9" style={{ color: C.mid }} />
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: C.dark }}>Unlock Pro Insights</h3>
              <p className="text-slate-500 max-w-sm mb-6 text-sm">Get topic mastery breakdowns, detailed progress charts, and full learning history.</p>
              <Button
                onClick={() => navigate("/dashboard/pricing")}
                style={{ background: C.grad }}
                className="h-11 px-8 rounded-full font-bold shadow-lg"
              >
                Upgrade Now
              </Button>
            </div>
          )}

          <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-5", !isPaid && "opacity-20 pointer-events-none select-none")}>
            {/* Topic Mastery Pie */}
            <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
              <Accent />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Topic Mastery</CardTitle>
                <CardDescription>Completed courses by subject</CardDescription>
              </CardHeader>
              <CardContent>
                {topicData.length === 0 ? (
                  <div className="h-64"><EmptyChart message="Complete courses to see topic breakdown." icon={PieChartIcon} /></div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={topicData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4}>
                          {topicData.map((_, i) => <Cell key={i} fill={C.pie[i % C.pie.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Breakdown Bar */}
            <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
              <Accent gradient={C.gradGreen} />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Progress Breakdown</CardTitle>
                <CardDescription>Completion status overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ name: "Completed", value: stats.completed }, { name: "In Progress", value: stats.inProgress }]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={72} name="Courses">
                        <Cell fill={C.success} />
                        <Cell fill={C.accent} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

