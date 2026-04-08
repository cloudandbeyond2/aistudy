// @ts-nocheck
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { serverURL } from '@/constants';
import {
  BarChart3, Download, Users, TrendingUp, GraduationCap, Search,
  ChevronDown, ChevronUp, FileSpreadsheet, Filter, ArrowLeft
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function OrgKpiReports() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const orgId = sessionStorage.getItem('orgId');

  useEffect(() => {
    fetchReport();
  }, [selectedYear, selectedDept]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const uid = sessionStorage.getItem('uid');
      const params = new URLSearchParams({ organizationId: orgId });
      if (selectedYear) params.append('academicYear', selectedYear);
      if (selectedDept) params.append('department', selectedDept);

      const res = await axios.get(`${serverURL}/api/org/reports/students?${params}`, {
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
    if (!reportData || !reportData.students) return;

    const headers = [
      'Name', 'Email', 'Phone', 'Department', 'Section', 'Roll No',
      'Academic Year', 'Class', 'Placement Score', 'Placement Status',
      'Has Resume', 'Projects', 'Certificates', 'GitHub', 'LinkedIn',
      'Available for Placement', 'Skills'
    ];

    const rows = reportData.students.map(s => [
      s.name, s.email, s.phone, s.department, s.section, s.rollNo,
      s.academicYear, s.studentClass, s.placementScore, s.placementStatus,
      s.hasResume ? 'Yes' : 'No', s.projectsCount, s.certificatesCount,
      s.githubUrl, s.linkedinUrl,
      s.isAvailableForPlacement ? 'Yes' : 'No',
      (s.skills || []).join(', ')
    ]);

    // Summary sheet
    const summaryData = [
      ['Organization Student KPI Report'],
      ['Generated On', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
      ['Academic Year Filter', selectedYear || 'All'],
      ['Department Filter', selectedDept || 'All'],
      [],
      ['Metric', 'Value'],
      ['Total Students', reportData.stats.totalStudents],
      ['Placement Ready (Score ≥ 60)', reportData.stats.placementReady],
      ['Average Placement Score', reportData.stats.avgScore],
      ['Students with Resume', reportData.stats.withResume],
    ];

    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    ws1['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

    const ws2 = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws2['!cols'] = headers.map(() => ({ wch: 18 }));
    XLSX.utils.book_append_sheet(wb, ws2, 'Students');

    const yearLabel = selectedYear ? `_${selectedYear}` : '';
    XLSX.writeFile(wb, `Student_KPI_Report${yearLabel}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Excellent': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Ready': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'In Progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const students = reportData?.students || [];
  const stats = reportData?.stats || {};
  const filters = reportData?.filters || {};

  // Filter & sort
  const filtered = students
    .filter(s =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';
      if (typeof aVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });

  // Chart data
  const statusCounts = { 'Excellent': 0, 'Ready': 0, 'In Progress': 0, 'Not Ready': 0 };
  students.forEach(s => { statusCounts[s.placementStatus] = (statusCounts[s.placementStatus] || 0) + 1; });

  const pieData = Object.entries(statusCounts)
    .filter(([_, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const pieColors = { 'Excellent': '#10b981', 'Ready': '#3b82f6', 'In Progress': '#f59e0b', 'Not Ready': '#94a3b8' };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="h-3 w-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6 animate-fade-in pt-0 md:pt-0 lg:pt-[60px]">
      <SEO title="KPI Reports" description="Organization KPI Reports" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* <Link to="/dashboard/org" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link> */}
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Student KPI Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Academic year-wise student information and placement status
          </p>
        </div>
        <button
          onClick={exportToExcel}
          disabled={students.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export to Excel
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filters:</span>
        </div>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[180px]"
        >
          <option value="">All Academic Years</option>
          {(filters.academicYears || []).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[180px]"
        >
          <option value="">All Departments</option>
          {(filters.departments || []).map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.totalStudents || 0, icon: Users, color: 'border-l-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Placement Ready', value: stats.placementReady || 0, icon: TrendingUp, color: 'border-l-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Avg Score', value: `${stats.avgScore || 0}%`, icon: BarChart3, color: 'border-l-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'With Resume', value: stats.withResume || 0, icon: GraduationCap, color: 'border-l-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30' },
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
      {pieData.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Placement Readiness Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
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
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={pieColors[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Student Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold">
              Student Details
              {filtered.length !== students.length && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (Showing {filtered.length} of {students.length})
                </span>
              )}
            </h3>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or roll no..."
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
                  { key: 'name', label: 'Name' },
                  { key: 'rollNo', label: 'Roll No' },
                  { key: 'department', label: 'Department' },
                  { key: 'academicYear', label: 'Academic Year' },
                  { key: 'placementScore', label: 'Score' },
                  { key: 'placementStatus', label: 'Status' },
                  { key: 'hasResume', label: 'Resume' },
                  { key: 'projectsCount', label: 'Projects' },
                  { key: 'certificatesCount', label: 'Certificates' },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none whitespace-nowrap"
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
                  <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                    {students.length === 0 ? 'No students found for this organization' : 'No results match your search'}
                  </td>
                </tr>
              ) : (
                filtered.map((student, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{student.rollNo || '-'}</td>
                    <td className="px-4 py-3 text-sm">{student.department || '-'}</td>
                    <td className="px-4 py-3 text-sm">{student.academicYear || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${student.placementScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{student.placementScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.placementStatus)}`}>
                        {student.placementStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {student.hasResume ? (
                        <span className="text-emerald-600">✓</span>
                      ) : (
                        <span className="text-slate-400">✗</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">{student.projectsCount}</td>
                    <td className="px-4 py-3 text-sm text-center">{student.certificatesCount}</td>
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
