
// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Building2,
  CalendarClock,
  CreditCard,
  DollarSign,
  GraduationCap,
  RefreshCw,
  School,
  ShieldAlert,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";

import AdminStatCard from "@/components/admin/AdminStatCard";
import { serverURL } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const USER_SEGMENT_COLORS = ["#2563eb", "#0f766e", "#7c3aed", "#f59e0b", "#e11d48"];
const ORDER_STATUS_COLORS = {
  success: "#16a34a",
  pending: "#f59e0b",
  failed: "#ef4444",
  cancelled: "#64748b",
};

const formatCurrency = (value = 0) => `INR ${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;

const getRiskTone = (count, type = "warning") => {
  if (!count) return "border-slate-200 bg-slate-50 text-slate-700";
  if (type === "danger") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
};

const getOrderStatusClassName = (status) => {
  switch (status) {
    case "success":
      return "bg-emerald-100 text-emerald-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "failed":
      return "bg-rose-100 text-rose-700";
    case "cancelled":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const getOrderSearchToken = (order) => {
  return (
    order?.transactionId ||
    order?.subscriptionId ||
    order?.razorpayPaymentId ||
    order?.userEmail ||
    order?.userName ||
    ""
  );
};

const safeParseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("30");
  const [kpiWindow, setKpiWindow] = useState("today");
  const [overview, setOverview] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const response = await axios.get(`${serverURL}/api/admin/dashboard/overview`, {
        headers,
        params: { rangeDays: timeRange },
      });

      setOverview(response.data || null);
    } catch (error) {
      console.error("Admin dashboard fetch error:", error);
      setOverview(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totals = overview?.totals || {};
  const planHealth = overview?.planHealth || { active: 0, expiringSoon: 0, expired: 0, pendingPayment: 0, failedPayment: 0 };

  const kpiPayload = overview?.windows?.[kpiWindow] || { signups: 0, orders: { revenue: 0, success: 0, pending: 0, failed: 0, cancelled: 0 } };
  const kpiOrders = kpiPayload.orders || { revenue: 0, success: 0, pending: 0, failed: 0, cancelled: 0 };
  const kpiLabel = kpiWindow === "today" ? "Today" : kpiWindow === "week" ? "Last 7 days" : "This month";

  const userSegments = overview?.userSegments || [];
  const courseSegments = overview?.courseSegments || [];
  const enquirySources = overview?.enquirySources || [];
  const topOrganizations = overview?.topOrganizations || [];
  const recentOrders = overview?.recentOrders || [];
  const recentUsers = overview?.recentUsers || [];

  const orderStatusData = useMemo(() => {
    const base = overview?.orderStatus || [];
    return base.map((item) => {
      const statusKey = String(item.name || "").toLowerCase();
      if (statusKey.includes("success")) return { ...item, fill: ORDER_STATUS_COLORS.success };
      if (statusKey.includes("pending")) return { ...item, fill: ORDER_STATUS_COLORS.pending };
      if (statusKey.includes("failed")) return { ...item, fill: ORDER_STATUS_COLORS.failed };
      if (statusKey.includes("cancel")) return { ...item, fill: ORDER_STATUS_COLORS.cancelled };
      return { ...item, fill: "#94a3b8" };
    });
  }, [overview]);

  const revenueTrend = useMemo(() => {
    const base = overview?.revenueTrend || [];
    return base.map((point) => {
      const date = safeParseDate(point.date);
      return {
        date: date ? format(date, "MMM dd") : "",
        revenue: Number(point.revenue || 0),
      };
    });
  }, [overview]);

  const operationalCards = useMemo(() => {
    const failedOrders = orderStatusData.find((item) => String(item.name).toLowerCase().includes("failed"))?.value || 0;

    return [
      {
        title: "Expiring organizations",
        value: planHealth.expiringSoon,
        description: "Plans ending within 15 days need follow-up.",
        path: "/admin/org-plans",
        button: "View collections",
        tone: getRiskTone(planHealth.expiringSoon),
      },
      {
        title: "Pending collections",
        value: planHealth.pendingPayment,
        description: "Institutions waiting for payment confirmation.",
        path: "/admin/org-plans",
        button: "Review billing",
        tone: getRiskTone(planHealth.pendingPayment),
      },
      {
        title: "Failed orders",
        value: failedOrders,
        description: "Payment failures that may need manual correction.",
        path: "/admin/orders",
        button: "Open orders",
        tone: getRiskTone(failedOrders, "danger"),
      },
      {
        title: "Blocked institutions",
        value: totals.blockedOrganizations || 0,
        description: "Institution accounts with restricted access.",
        path: "/admin/orgs",
        button: "Check organizations",
        tone: getRiskTone(totals.blockedOrganizations || 0, "danger"),
      },
    ];
  }, [orderStatusData, planHealth, totals.blockedOrganizations]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">Operational overview for revenue, users, institutions, billing risk, and growth.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              type="single"
              value={kpiWindow}
              onValueChange={(value) => value && setKpiWindow(value)}
              className="rounded-md border bg-card p-1"
            >
              <ToggleGroupItem value="today" className="px-3">Today</ToggleGroupItem>
              <ToggleGroupItem value="week" className="px-3">This week</ToggleGroupItem>
              <ToggleGroupItem value="month" className="px-3">This month</ToggleGroupItem>
            </ToggleGroup>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchDashboardData} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Control Center</CardTitle>
                  <CardDescription>Priority queues for collections, failed payments, and institutional risk.</CardDescription>
                </div>
                <Badge variant="outline" className="border-sky-200 text-sky-700">Super Admin View</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {operationalCards.map((item) => (
                <div key={item.title} className={`rounded-xl border p-4 ${item.tone}`}>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="mt-1 text-3xl font-bold">{item.value}</div>
                    </div>
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <p className="mb-4 text-sm opacity-90">{item.description}</p>
                  <Button
                    variant="ghost"
                    className="h-auto px-0 text-current hover:bg-transparent"
                    onClick={() => navigate(item.path)}
                  >
                    {item.button}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Platform Health</CardTitle>
              <CardDescription>Key ratios and operating posture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-sm text-muted-foreground">Premium conversion</div>
                <div className="mt-1 text-3xl font-bold">
                  {totals.totalUsers ? Math.round((Number(totals.paidUsers || 0) / Number(totals.totalUsers || 1)) * 100) : 0}%
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{totals.paidUsers || 0} paid of {totals.totalUsers || 0} users</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-muted-foreground">Active organization plans</span>
                  <span className="font-semibold">{planHealth.active}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-muted-foreground">Expired organization plans</span>
                  <span className="font-semibold text-rose-600">{planHealth.expired}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-muted-foreground">Pending collections</span>
                  <span className="font-semibold text-amber-600">{planHealth.pendingPayment}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-muted-foreground">Blocked institutions</span>
                  <span className="font-semibold text-rose-600">{totals.blockedOrganizations || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard title="Total Revenue" value={formatCurrency(totals.revenueAllTime || 0)} icon={DollarSign} className="border-l-4 border-l-emerald-500" />
          <AdminStatCard title={`Revenue (${kpiLabel})`} value={formatCurrency(kpiOrders.revenue || 0)} icon={Wallet} className="border-l-4 border-l-blue-500" />
          <AdminStatCard title={`New Users (${kpiLabel})`} value={kpiPayload.signups || 0} icon={Users} className="border-l-4 border-l-amber-500" />
          <AdminStatCard title={`Successful Orders (${kpiLabel})`} value={kpiOrders.success || 0} icon={CreditCard} className="border-l-4 border-l-violet-500" />

          <AdminStatCard title="Total Users" value={totals.totalUsers || 0} icon={Users} className="border-l-4 border-l-indigo-500" />
          <AdminStatCard title="Total Courses" value={totals.totalCourses || 0} icon={BookOpen} className="border-l-4 border-l-sky-500" />
          <AdminStatCard title="Organizations" value={totals.totalOrganizations || 0} icon={Building2} className="border-l-4 border-l-fuchsia-500" />
          <AdminStatCard title="Free Users" value={totals.freeUsers || 0} icon={GraduationCap} className="border-l-4 border-l-slate-500" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Successful order revenue over the selected time range.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#dashboardRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Billing Status</CardTitle>
              <CardDescription>Order pipeline by transaction status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={orderStatusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {orderStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="grid gap-2">
                {orderStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>User Mix</CardTitle>
              <CardDescription>How the platform user base is segmented.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={userSegments} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={4}>
                    {userSegments.map((entry, index) => (
                      <Cell key={entry.name} fill={USER_SEGMENT_COLORS[index % USER_SEGMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-4 grid gap-2">
                {userSegments.map((segment, index) => (
                  <div key={segment.name} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: USER_SEGMENT_COLORS[index % USER_SEGMENT_COLORS.length] }} />
                      <span className="text-sm text-muted-foreground">{segment.name}</span>
                    </div>
                    <span className="font-semibold">{segment.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Institution Watchlist</CardTitle>
                <CardDescription>Top organizations by linked accounts.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orgs")}>
                Open
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {topOrganizations.length ? (
                topOrganizations.map((org, index) => (
                  <div key={`${org.name}-${index}`} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{org.name || "Organization"}</div>
                        <div className="text-sm text-muted-foreground">Rank #{index + 1}</div>
                      </div>
                      <Badge variant="outline">{org.count || 0} users</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No organization-linked users found yet.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Top organization enquiry channels.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/organization-enquiries")}>
                Open
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {enquirySources.length ? (
                enquirySources.map((source) => (
                  <div key={source.name} className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{source.name}</span>
                      <Badge variant="outline">{source.value}</Badge>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${Math.max(12, (source.value / Math.max(...enquirySources.map((item) => item.value), 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No enquiry data available.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest billing activity across the platform.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")}>
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.length ? (
                      recentOrders.map((order) => {
                        const token = getOrderSearchToken(order);
                        const orderDate = safeParseDate(order.createdAt || order.date);
                        return (
                          <TableRow
                            key={order._id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => token && navigate(`/admin/orders?q=${encodeURIComponent(token)}`)}
                          >
                            <TableCell className="font-medium">#{String(order._id || "").slice(-6)}</TableCell>
                            <TableCell>
                              <div>{order.userName || "User"}</div>
                              <div className="text-xs text-muted-foreground">{order.userEmail || "No email"}</div>
                            </TableCell>
                            <TableCell>{formatCurrency(order.price || order.amount)}</TableCell>
                            <TableCell className="capitalize">{order.provider || "N/A"}</TableCell>
                            <TableCell>{orderDate ? format(orderDate, "dd MMM yyyy") : "N/A"}</TableCell>
                            <TableCell>
                              <Badge className={getOrderStatusClassName(order.status)}>{order.status || "unknown"}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No recent orders found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Recent Signups</CardTitle>
                  <CardDescription>Latest accounts entering the system.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")}>
                  View users
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentUsers.length ? (
                  recentUsers.map((user) => {
                    const createdAt = safeParseDate(user.createdAt);
                    const emailToken = user.email || user.mName || "";
                    return (
                      <div
                        key={user._id}
                        className="cursor-pointer rounded-lg border p-4 hover:bg-muted/50"
                        onClick={() => emailToken && navigate(`/admin/users?q=${encodeURIComponent(emailToken)}`)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium">{user.mName || "Unnamed user"}</div>
                            <div className="text-sm text-muted-foreground">{user.email || "No email"}</div>
                            <div className="mt-1 text-xs text-muted-foreground">Joined {createdAt ? format(createdAt, "dd MMM yyyy") : "N/A"}</div>
                          </div>
                          <Badge variant="outline">{user.adminCategory || user.role || "user"}</Badge>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No recent user records found.</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Content Split</CardTitle>
                <CardDescription>Premium vs free course inventory.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={courseSegments} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={4}>
                      {courseSegments.map((entry, index) => (
                        <Cell key={entry.name} fill={index === 0 ? "#10b981" : "#cbd5e1"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="grid gap-2">
                  {courseSegments.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: index === 0 ? "#10b981" : "#cbd5e1" }} />
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Button variant="outline" className="justify-between" onClick={() => navigate("/admin/users")}>
            <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Users</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="justify-between" onClick={() => navigate("/admin/paid-users")}>
            <span className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Paid Users</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="justify-between" onClick={() => navigate("/admin/org-plans")}>
            <span className="flex items-center gap-2"><CalendarClock className="h-4 w-4" /> Organization Collections</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="justify-between" onClick={() => navigate("/admin/orders")}>
            <span className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Orders</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {(planHealth.expiringSoon > 0 || planHealth.failedPayment > 0) && (
          <Card className="border-amber-200 bg-amber-50/60 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <div className="font-semibold text-amber-900">Billing attention needed</div>
                  <div className="text-sm text-amber-800">
                    {planHealth.expiringSoon} organization plan(s) are expiring soon and {planHealth.failedPayment} collection(s) show failed payment state.
                  </div>
                </div>
              </div>
              <Button onClick={() => navigate("/admin/org-plans")}>Resolve billing issues</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
