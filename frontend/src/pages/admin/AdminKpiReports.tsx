// @ts-nocheck
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { serverURL } from '@/constants';
import {
  BarChart3, Download, Building2, Users, BookOpen, TrendingUp,
  GraduationCap, Search, ChevronDown, ChevronUp, FileSpreadsheet
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function AdminKpiReports() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('institutionName');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const uid = sessionStorage.getItem('uid');
      const res = await axios.get(`${serverURL}/api/admin/reports/overall`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'user-id': uid
        }
      });
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const exportToExcel = () => {
    if (!reportData) return;

    // Summary sheet
    const summaryData = [
      ['KPI Report - Overall Summary'],
      ['Generated On', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
      [],
      ['Metric', 'Value'],
      ['Total Users', reportData.summary.totalUsers],
      ['Total Students', reportData.summary.totalStudents],
      ['Total Organizations', reportData.summary.totalOrganizations],
      ['Total Courses', reportData.summary.totalCourses],
      ['Placement Ready Students', reportData.summary.placementReady],
      ['Avg Placement Score', reportData.summary.avgPlacementScore],
    ];

    // Organization breakdown sheet
    const orgHeaders = ['Institution Name', 'Email', 'Total Students', 'Total Courses', 'Placement Ready', 'Avg Placement Score'];
    const orgRows = reportData.organizations.map(org => [
      org.institutionName,
      org.email,
      org.totalStudents,
      org.totalCourses,
      org.placementReady,
      org.avgPlacementScore
    ]);

    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    ws1['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

    const ws2 = XLSX.utils.aoa_to_sheet([orgHeaders, ...orgRows]);
    ws2['!cols'] = [{ wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Organizations');

    XLSX.writeFile(wb, `KPI_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        Failed to load report data. Please try again.
      </div>
    );
  }

  const { summary, organizations } = reportData;

  // Filter & sort organizations
  const filtered = organizations
    .filter(org =>
      org.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';
      if (typeof aVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  // Chart data
  const barData = organizations
    .filter(o => o.totalStudents > 0)
    .sort((a, b) => b.totalStudents - a.totalStudents)
    .slice(0, 8)
    .map(o => ({
      name: o.institutionName?.length > 18 ? o.institutionName.substring(0, 18) + '…' : o.institutionName,
      students: o.totalStudents,
      ready: o.placementReady
    }));

  const pieData = [
    { name: 'Placement Ready', value: summary.placementReady },
    { name: 'Not Ready', value: summary.totalStudents - summary.placementReady }
  ];

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="h-3 w-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            KPI Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Overall platform performance and organization-wise breakdown
          </p>
        </div>
        <button
          onClick={exportToExcel}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export to Excel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Users', value: summary.totalUsers, icon: Users, color: 'border-l-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Total Students', value: summary.totalStudents, icon: GraduationCap, color: 'border-l-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30' },
          { label: 'Organizations', value: summary.totalOrganizations, icon: Building2, color: 'border-l-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
          { label: 'Total Courses', value: summary.totalCourses, icon: BookOpen, color: 'border-l-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Placement Ready', value: summary.placementReady, icon: TrendingUp, color: 'border-l-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Avg Score', value: `${summary.avgPlacementScore}%`, icon: BarChart3, color: 'border-l-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
        ].map((card, i) => (
          <div key={i} className={`rounded-xl border ${card.color} border-l-4 bg-card p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Students by Organization</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Students" />
                <Bar dataKey="ready" fill="#10b981" radius={[4, 4, 0, 0]} name="Placement Ready" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-12">No organization data available</p>
          )}
        </div>

        {/* Pie Chart */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Placement Readiness</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={index === 0 ? '#10b981' : '#cbd5e1'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Organization Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold">Organization-wise Breakdown</h3>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/40">
                {[
                  { key: 'institutionName', label: 'Institution' },
                  { key: 'email', label: 'Email' },
                  { key: 'totalStudents', label: 'Students' },
                  { key: 'totalCourses', label: 'Courses' },
                  { key: 'placementReady', label: 'Placement Ready' },
                  { key: 'avgPlacementScore', label: 'Avg Score' },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      <SortIcon field={col.key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No organizations found
                  </td>
                </tr>
              ) : (
                filtered.map((org, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{org.institutionName}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{org.email}</td>
                    <td className="px-6 py-4 text-sm">{org.totalStudents}</td>
                    <td className="px-6 py-4 text-sm">{org.totalCourses}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        org.placementReady > 0
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {org.placementReady}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${org.avgPlacementScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{org.avgPlacementScore}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
