import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import Swal from 'sweetalert2';
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  UserPlus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
  Mail,
  Phone,
  Briefcase,
  Star,
  Activity,
  BarChart3,
  Filter,
  Search as SearchIcon,
  Download,
  RefreshCw,
  ChevronRight,
  Building2,
  GraduationCap,
  Target,
  Zap,
  Shield,
  PieChart,
  UserCheck,
  UserX,
  Timer,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';

const StaffTab = () => {
    const [searchParams] = useSearchParams();
    const role = sessionStorage.getItem('role');
    const deptId = sessionStorage.getItem('deptId');
    const activeTab = searchParams.get('tab') || (role === 'dept_admin' ? 'courses' : 'students');
    const { toast } = useToast();
    
    // Core state
    const [stats, setStats] = useState({ studentCount: 0, studentLimit: 50, assignmentCount: 0, submissionCount: 0, placedCount: 0 });
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [userDeptName, setUserDeptName] = useState('');
    const [userDeptId, setUserDeptId] = useState(deptId || '');
    const [deptAdmins, setDeptAdmins] = useState([]);
    const [departmentsList, setDepartmentsList] = useState([]);
    const [assignmentSubmissionStats, setAssignmentSubmissionStats] = useState({});
    const [assignmentStatsLoading, setAssignmentStatsLoading] = useState(false);
    const [assignmentDeskFilter, setAssignmentDeskFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    
    const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');
    const staffPerPage = 6;

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'NA';
    };

    const getDepartmentValue = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') return value._id || value.name || '';
        return '';
    };

    const matchesCurrentDepartment = (value, departmentId) => {
        const normalizedValue = getDepartmentValue(value);
        const normalizedDepartmentId = getDepartmentValue(departmentId);
        return Boolean(
            (userDeptName && normalizedValue === userDeptName) ||
            (deptId && normalizedValue === deptId) ||
            (deptId && normalizedDepartmentId === deptId)
        );
    };

    // Core fetch functions
    const fetchOrgDepartments = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/departments?organizationId=${orgId}`);
            if (res.data.success) setDepartmentsList(res.data.departments);
        } catch (e) {
            console.error("Failed to fetch departments", e);
        }
    };

    const fetchOrgDeptAdmins = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/dept-admins?organizationId=${orgId}`);
            if (res.data.success) setDeptAdmins(res.data.admins);
        } catch (e) {
            console.error("Failed to fetch dept admins", e);
        }
    };

    const fetchAssignments = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/assignments?organizationId=${orgId}`);
            if (res.data.success) {
                let assignmentsData = res.data.assignments;
                if (role === 'dept_admin') {
                    assignmentsData = assignmentsData.filter((a) => matchesCurrentDepartment(a.department, a.departmentId));
                }
                setAssignments(assignmentsData);
            }
        } catch (e) {
            console.error("Failed to fetch assignments", e);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/dashboard/stats?organizationId=${orgId}`);
            if (res.data.success) {
                setStats(res.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/students?organizationId=${orgId}`);
            if (res.data.success) {
                let studentsData = res.data.students;
                if (role === 'dept_admin') {
                    studentsData = studentsData.filter((s) =>
                        (userDeptName && s.department === userDeptName) ||
                        (deptId && (s.departmentId === deptId || s.department === deptId))
                    );
                }
                setStudents(studentsData);
            }
        } catch (e) {
            console.error('Error fetching students:', e);
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

    // Effects
    useEffect(() => {
        if (!orgId) {
            console.warn('No organization ID found. Please log out and log back in.');
            return;
        }
        fetchStats();
        fetchStudents();
        fetchCourses();
        fetchAssignments();
        fetchOrgDepartments();
        fetchOrgDeptAdmins();
    }, [orgId]);

    useEffect(() => {
        if (role === 'dept_admin' && (userDeptName || deptId)) {
            fetchStats();
            fetchStudents();
            fetchCourses();
            fetchAssignments();
        }
    }, [userDeptName, deptId, role]);

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
        if (activeTab !== 'assignments') return;
        if (!assignments.length) {
            setAssignmentSubmissionStats({});
            return;
        }

        const fetchAssignmentSubmissionStats = async () => {
            setAssignmentStatsLoading(true);
            try {
                const statsEntries = await Promise.all(
                    assignments.map(async (assignment) => {
                        try {
                            const res = await axios.get(`${serverURL}/api/org/assignment/${assignment._id}/submissions`);
                            const submissions = Array.isArray(res.data?.submissions) ? res.data.submissions : [];
                            const graded = submissions.filter((submission) => submission.status === 'graded').length;
                            const resubmit = submissions.filter((submission) => submission.status === 'resubmit_required').length;
                            const pending = submissions.length - graded - resubmit;

                            return [
                                assignment._id,
                                {
                                    total: submissions.length,
                                    graded,
                                    pending,
                                    resubmit,
                                }
                            ];
                        } catch (error) {
                            console.error(`Failed to fetch submissions for assignment ${assignment._id}`, error);
                            return [
                                assignment._id,
                                { total: 0, graded: 0, pending: 0, resubmit: 0 }
                            ];
                        }
                    })
                );

                setAssignmentSubmissionStats(Object.fromEntries(statsEntries));
            } finally {
                setAssignmentStatsLoading(false);
            }
        };

        fetchAssignmentSubmissionStats();
    }, [activeTab, assignments]);

    // Filter and sort admins
    const filteredAdmins = deptAdmins.filter(admin => {
        const matchesSearch = admin.mName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             admin.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDepartment === 'all' || 
                            admin.department?._id === selectedDepartment ||
                            admin.department === selectedDepartment;
        return matchesSearch && matchesDept;
    }).sort((a, b) => {
        if (sortBy === 'name') {
            return (a.mName || '').localeCompare(b.mName || '');
        }
        if (sortBy === 'courses') {
            const aCourses = a.coursesCreatedCount || 0;
            const bCourses = b.coursesCreatedCount || 0;
            return bCourses - aCourses;
        }
        if (sortBy === 'lastLogin') {
            const aDate = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
            const bDate = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
            return bDate - aDate;
        }
        return 0;
    });

    // Statistics
    const totalDeptAdmins = deptAdmins.length;
    const avgCoursesPerAdmin = (deptAdmins.reduce((sum, admin) => sum + (admin.coursesCreatedCount || 0), 0) / totalDeptAdmins).toFixed(1);
    const adminsAtLimit = deptAdmins.filter(admin => (admin.coursesCreatedCount || 0) >= (admin.courseLimit || 0)).length;
    const activeAdmins = deptAdmins.filter(admin => {
        const lastLogin = new Date(admin.lastLoginAt || 0);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastLogin > thirtyDaysAgo;
    }).length;

    // Gradient styles
    const gradientPrimary = 'bg-gradient-to-r from-[#11405f] to-[#11a5e4]';
    const gradientSecondary = 'bg-gradient-to-r from-[#0d3552] to-[#1a6a9e]';
    const gradientText = 'bg-gradient-to-r from-[#11405f] to-[#11a5e4] bg-clip-text text-transparent';
    const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / staffPerPage));
    const paginatedAdmins = filteredAdmins.slice(
        (currentPage - 1) * staffPerPage,
        currentPage * staffPerPage
    );
    const paginationStart = filteredAdmins.length === 0 ? 0 : (currentPage - 1) * staffPerPage + 1;
    const paginationEnd = Math.min(currentPage * staffPerPage, filteredAdmins.length);
    const visiblePageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
        if (totalPages <= 5) return true;
        return Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedDepartment, sortBy, viewMode]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <>
            {role === 'org_admin' && (
                <div className="min-h-screen bg-gradient-to-br from-[#11405f]/5 via-white to-[#11a5e4]/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8 space-y-6 sm:space-y-8">
                        {/* Header Section */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 ${gradientPrimary} rounded-xl shadow-lg`}>
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className={`text-3xl font-bold ${gradientText}`}>
                                            Staff Directory
                                        </h1>
                                        <p className="text-muted-foreground">
                                            Manage department administrators and monitor their performance
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-[#11405f]/5 dark:from-slate-900 dark:to-slate-800/50">
                                <CardContent className="p-4 sm:p-5 lg:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                                            <p className="text-3xl font-bold mt-2">{totalDeptAdmins}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Department Administrators</p>
                                        </div>
                                        <div className={`h-12 w-12 ${gradientPrimary} rounded-xl flex items-center justify-center shadow-lg`}>
                                            <Users className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-[#11a5e4]/10 dark:from-slate-900 dark:to-slate-800/50">
                                <CardContent className="p-4 sm:p-5 lg:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                                            <p className="text-3xl font-bold mt-2">{activeAdmins}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Active in last 30 days</p>
                                        </div>
                                        <div className={`h-12 w-12 ${gradientPrimary} rounded-xl flex items-center justify-center shadow-lg`}>
                                            <Activity className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-[#1a6a9e]/10 dark:from-slate-900 dark:to-slate-800/50">
                                <CardContent className="p-4 sm:p-5 lg:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Avg. Courses/Admin</p>
                                            <p className="text-3xl font-bold mt-2">{avgCoursesPerAdmin}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Courses per staff member</p>
                                        </div>
                                        <div className={`h-12 w-12 ${gradientPrimary} rounded-xl flex items-center justify-center shadow-lg`}>
                                            <BookOpen className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-[#11405f]/10 dark:from-slate-900 dark:to-slate-800/50">
                                <CardContent className="p-4 sm:p-5 lg:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">At Course Limit</p>
                                            <p className="text-3xl font-bold mt-2">{adminsAtLimit}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Need limit increase</p>
                                        </div>
                                        <div className={`h-12 w-12 ${gradientPrimary} rounded-xl flex items-center justify-center shadow-lg`}>
                                            <AlertCircle className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filters Section */}
                            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                            <CardContent className="p-4 sm:p-5 lg:p-6">
                                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                    <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:flex xl:items-center xl:gap-3">
                                        <div className="relative w-full xl:w-[320px] xl:flex-none">
                                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="Search staff..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11a5e4]"
                                            />
                                        </div>
                                        
                                        <select
                                            value={selectedDepartment}
                                            onChange={(e) => setSelectedDepartment(e.target.value)}
                                            className="w-full xl:w-[220px] xl:flex-none px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-[#11a5e4]"
                                        >
                                            <option value="all">All Departments</option>
                                            {departmentsList.map((dept) => (
                                                <option key={dept._id} value={dept._id}>{dept.name}</option>
                                            ))}
                                        </select>
                                        
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full xl:w-[220px] xl:flex-none px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-[#11a5e4]"
                                        >
                                            <option value="name">Sort by Name</option>
                                            <option value="courses">Sort by Courses Created</option>
                                            <option value="lastLogin">Sort by Last Login</option>
                                        </select>
                                    </div>
                                    
                                    <div className="grid w-full grid-cols-2 gap-2 md:w-full md:grid-cols-2 xl:w-auto xl:flex xl:items-center xl:gap-2 xl:flex-none">
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                            className={`w-full gap-2 xl:min-w-[92px] ${viewMode === 'grid' ? gradientPrimary : ''}`}
                                        >
                                            <BarChart3 className="h-4 w-4" />
                                            Grid
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                            className={`w-full gap-2 xl:min-w-[92px] ${viewMode === 'list' ? gradientPrimary : ''}`}
                                        >
                                            <Users className="h-4 w-4" />
                                            List
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Staff Cards Grid */}
                        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3' : 'grid-cols-1'} gap-4 sm:gap-5 lg:gap-6`}>
                            {paginatedAdmins.map((admin) => {
                                const departmentLabel = admin.department?.name || admin.department?.title || admin.department || 'No department';
                                const lastLogin = admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'No login activity';
                                const coursesCreated = admin.coursesCreatedCount || 0;
                                const courseLimit = admin.courseLimit || 0;
                                const coursesLeft = Math.max(0, courseLimit - coursesCreated);
                                const usagePercentage = (coursesCreated / courseLimit) * 100;
                                
                                const getActivityStatus = () => {
                                    if (!admin.lastLoginAt) return 'inactive';
                                    const lastLoginDate = new Date(admin.lastLoginAt);
                                    const now = new Date();
                                    const daysSinceLogin = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
                                    if (daysSinceLogin <= 7) return 'active';
                                    if (daysSinceLogin <= 30) return 'moderate';
                                    return 'inactive';
                                };
                                
                                const activityStatus = getActivityStatus();
                                const statusColors = {
                                    active: 'bg-[#11a5e4]/15 text-[#11405f] dark:bg-[#11a5e4]/20 dark:text-[#8fdcff]',
                                    moderate: 'bg-[#11405f]/10 text-[#11405f] dark:bg-[#11405f]/20 dark:text-[#8fdcff]',
                                    inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                };
                                
                                const statusLabels = {
                                    active: 'Active',
                                    moderate: 'Moderate',
                                    inactive: 'Inactive'
                                };

                                return viewMode === 'grid' ? (
                                    <Card key={admin._id} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                        {/* Gradient Border Effect */}
                                        <div className={`absolute inset-0 ${gradientPrimary} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`} style={{ padding: '1px' }}>
                                            <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl m-[1px]" />
                                        </div>
                                        
                                        <CardContent className="p-4 sm:p-5 lg:p-6 relative">
                                            {/* Header Section */}
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
                                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                    <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-4 ring-[#11a5e4]/15 dark:ring-[#11a5e4]/20 flex-shrink-0">
                                                        <AvatarFallback className={`${gradientPrimary} text-white text-lg`}>
                                                            {getInitials(admin.mName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-base sm:text-lg truncate">{admin.mName || 'Staff Member'}</h3>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1 min-w-0">
                                                            <Mail className="h-3 w-3" />
                                                            <span className="truncate">{admin.email || 'No email'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={`${gradientPrimary} text-white border-0 w-fit`}>
                                                    Dept Admin
                                                </Badge>
                                            </div>
                                            
                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                                                    <p className="text-xs text-muted-foreground mb-1">Courses Created</p>
                                                    <p className="text-2xl font-bold">{coursesCreated}</p>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                                                    <p className="text-xs text-muted-foreground mb-1">Remaining Slots</p>
                                                    <p className={`text-2xl font-bold ${coursesLeft <= 0 ? 'text-red-500' : 'text-[#11a5e4]'}`}>
                                                        {coursesLeft}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-muted-foreground">Course Limit Usage</span>
                                                    <span className="font-medium">{Math.round(usagePercentage)}%</span>
                                                </div>
                                                <Progress 
                                                    value={usagePercentage} 
                                                    className="h-2"
                                                    style={{
                                                        background: 'linear-gradient(90deg, #11405f 0%, #1a6a9e 45%, #11a5e4 100%)'
                                                    }}
                                                />
                                            </div>
                                            
                                            {/* Department and Status */}
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    <span>{departmentLabel}</span>
                                                </div>
                                                <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[activityStatus]}`}>
                                                        {statusLabels[activityStatus]}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground break-all sm:break-normal">
                                                        <Clock className="h-3 w-3" />
                                                        Last login: {lastLogin}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full gap-2 hover:border-[#11a5e4] hover:text-[#11405f] transition-colors"
                                                    onClick={async () => {
                                                        const result = await Swal.fire({
                                                            title: 'Request course limit change',
                                                            input: 'number',
                                                            inputLabel: `Current limit: ${courseLimit}`,
                                                            inputAttributes: { min: '0', step: '1' },
                                                            inputValue: String(courseLimit),
                                                            showCancelButton: true,
                                                            confirmButtonText: 'Send Request',
                                                            customClass: {
                                                                popup: 'rounded-xl',
                                                                confirmButton: gradientPrimary + ' text-white border-0'
                                                            }
                                                        });

                                                        if (!result.isConfirmed) return;
                                                        const requestedCourseLimit = parseInt(String(result.value || ''), 10);
                                                        if (!Number.isFinite(requestedCourseLimit) || requestedCourseLimit < 0) {
                                                            toast({ title: "Error", description: "Please enter a valid limit", variant: "destructive" });
                                                            return;
                                                        }

                                                        try {
                                                            const requesterId = sessionStorage.getItem('uid') || sessionStorage.getItem('orgId') || '';
                                                            const res = await axios.post(`${serverURL}/api/org/staff/course-limit/request`, {
                                                                organizationId: orgId,
                                                                requesterId,
                                                                staffId: admin._id,
                                                                requestedCourseLimit
                                                            });
                                                            if (res.data?.success) {
                                                                toast({ title: "Request Sent", description: res.data.message || "Request submitted" });
                                                            } else {
                                                                toast({ title: "Error", description: res.data?.message || "Failed to submit request", variant: "destructive" });
                                                            }
                                                        } catch (e) {
                                                            toast({ title: "Error", description: e.response?.data?.message || e.message || "Request failed", variant: "destructive" });
                                                        }
                                                    }}
                                                >
                                                    <Settings className="h-3 w-3" />
                                                    Request Limit
                                                </Button>
                                                <Button size="sm" variant="ghost" className="w-full sm:w-auto hover:bg-[#11a5e4]/10">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card key={admin._id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                    <Avatar className="h-12 w-12 flex-shrink-0">
                                                        <AvatarFallback className={`${gradientPrimary} text-white`}>
                                                            {getInitials(admin.mName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                            <h3 className="font-semibold truncate">{admin.mName || 'Staff Member'}</h3>
                                                            <Badge className={`${gradientPrimary} text-white border-0 text-xs`}>
                                                                Dept Admin
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground truncate">{admin.email || 'No email'}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:flex xl:flex-wrap xl:items-center xl:justify-end xl:gap-6 w-full xl:w-auto">
                                                    <div className="text-center">
                                                        <p className="text-xs text-muted-foreground">Courses</p>
                                                        <p className="text-lg font-bold">{coursesCreated}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-muted-foreground">Limit</p>
                                                        <p className="text-lg font-bold">{courseLimit}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-muted-foreground">Remaining</p>
                                                        <p className={`text-lg font-bold ${coursesLeft <= 0 ? 'text-red-500' : 'text-[#11a5e4]'}`}>
                                                            {coursesLeft}
                                                        </p>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-full text-xs font-medium text-center ${statusColors[activityStatus]}`}>
                                                        {statusLabels[activityStatus]}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="col-span-2 sm:col-span-4 xl:col-span-1 gap-2 hover:border-[#11a5e4] hover:text-[#11405f] transition-colors w-full xl:w-auto"
                                                        onClick={async () => {
                                                            const result = await Swal.fire({
                                                                title: 'Request course limit change',
                                                                input: 'number',
                                                                inputLabel: `Current limit: ${courseLimit}`,
                                                                inputAttributes: { min: '0', step: '1' },
                                                                inputValue: String(courseLimit),
                                                                showCancelButton: true,
                                                                confirmButtonText: 'Send Request'
                                                            });

                                                            if (!result.isConfirmed) return;
                                                            const requestedCourseLimit = parseInt(String(result.value || ''), 10);
                                                            if (!Number.isFinite(requestedCourseLimit) || requestedCourseLimit < 0) {
                                                                toast({ title: "Error", description: "Please enter a valid limit", variant: "destructive" });
                                                                return;
                                                            }

                                                            try {
                                                                const requesterId = sessionStorage.getItem('uid') || sessionStorage.getItem('orgId') || '';
                                                                const res = await axios.post(`${serverURL}/api/org/staff/course-limit/request`, {
                                                                    organizationId: orgId,
                                                                    requesterId,
                                                                    staffId: admin._id,
                                                                    requestedCourseLimit
                                                                });
                                                                if (res.data?.success) {
                                                                    toast({ title: "Request Sent", description: res.data.message || "Request submitted" });
                                                                } else {
                                                                    toast({ title: "Error", description: res.data?.message || "Failed to submit request", variant: "destructive" });
                                                                }
                                                            } catch (e) {
                                                                toast({ title: "Error", description: e.response?.data?.message || e.message || "Request failed", variant: "destructive" });
                                                            }
                                                        }}
                                                    >
                                                        <Settings className="h-3 w-3 mr-2" />
                                                        Request Limit
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        
                        {filteredAdmins.length === 0 && (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                            <Users className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold">No staff members found</h3>
                                        <p className="text-muted-foreground">Try adjusting your search or filters</p>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => {
                                                setSearchQuery('');
                                                setSelectedDepartment('all');
                                            }}
                                            className="mt-2 hover:border-[#11a5e4] hover:text-[#11405f] transition-colors"
                                        >
                                            Clear Filters
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {filteredAdmins.length > 0 && (
                            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                                <CardContent className="p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                                            Showing {paginationStart}-{paginationEnd} of {filteredAdmins.length} staff members
                                        </p>
                                        <div className="flex flex-col gap-2 sm:items-end">
                                            <div className="grid w-full grid-cols-3 items-center gap-2 sm:flex sm:w-auto sm:justify-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                                    disabled={currentPage === 1}
                                                    className="w-full sm:w-auto min-w-0 sm:min-w-[88px]"
                                                >
                                                    Previous
                                                </Button>
                                                <span className="text-center text-xs sm:text-sm text-muted-foreground px-1">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="w-full sm:w-auto min-w-0 sm:min-w-[88px]"
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                            <div className="hidden md:flex flex-wrap items-center justify-center gap-1">
                                                {visiblePageNumbers.map((page, index) => {
                                                    const previousPage = visiblePageNumbers[index - 1];
                                                    const showGap = previousPage && page - previousPage > 1;

                                                    return (
                                                        <React.Fragment key={page}>
                                                            {showGap ? (
                                                                <span className="px-1 text-xs text-muted-foreground">...</span>
                                                            ) : null}
                                                            <Button
                                                                variant={currentPage === page ? 'default' : 'outline'}
                                                                size="sm"
                                                                onClick={() => setCurrentPage(page)}
                                                                className={`h-8 min-w-[2rem] px-2 text-xs sm:text-sm ${currentPage === page ? gradientPrimary : ''}`}
                                                            >
                                                                {page}
                                                            </Button>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default StaffTab;
