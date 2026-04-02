import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Plus, Trash2, Building2, Users, Mail, Phone, 
    BookOpen, TrendingUp, Shield, Calendar, 
    ChevronRight, UserPlus, Award, Clock, Menu, X
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Swal from 'sweetalert2';

const DepartmentsTab = () => {
    const [openDeptDialog, setOpenDeptDialog] = useState(false);
    const [openDeptAdminDialog, setOpenDeptAdminDialog] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const role = sessionStorage.getItem('role');
    const deptId = sessionStorage.getItem('deptId');
    const activeTab = searchParams.get('tab') || (role === 'dept_admin' ? 'courses' : 'students');
    const { toast } = useToast();
    const [stats, setStats] = useState<{ studentCount: number; studentLimit: number; assignmentCount: number; submissionCount: number; placedCount: number }>({ 
        studentCount: 0, 
        studentLimit: 50, 
        assignmentCount: 0, 
        submissionCount: 0, 
        placedCount: 0 
    });
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [userDeptName, setUserDeptName] = useState('');
    const [userDeptId, setUserDeptId] = useState(deptId || '');
    const getDeptScopedDepartment = () => (role === 'dept_admin' ? (userDeptId || deptId || '') : '');
    const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');

    // Departments & Dept Admins
    const [departmentsList, setDepartmentsList] = useState<any[]>([]);
    const [deptAdmins, setDeptAdmins] = useState<any[]>([]);
    const [selectedDept, setSelectedDept] = useState<any>(null);
    const [activeAdminTab, setActiveAdminTab] = useState('all');
    const [activeTabState, setActiveTabState] = useState('departments');

    const [newDept, setNewDept] = useState({ name: '', description: '' });
    const [newDeptAdmin, setNewDeptAdmin] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        phone: '', 
        departmentId: '', 
        courseLimit: 0 
    });

    // Gradient colors matching the theme
    const themeGradient = "from-[#1b253f] via-[#2d3a8c] to-[#6b2cc1]";
    const themeGradientLight = "from-[#1b253f]/10 via-[#2d3a8c]/10 to-[#6b2cc1]/10";
    
    // Predefined gradient colors for avatars based on theme
    const avatarGradients = [
        'from-[#1b253f] to-[#2d3a8c]',
        'from-[#2d3a8c] to-[#4b3bb0]',
        'from-[#4b3bb0] to-[#6b2cc1]',
        'from-[#6b2cc1] to-[#8a3dd4]',
        'from-[#1b253f] to-[#4b3bb0]',
        'from-[#2d3a8c] to-[#6b2cc1]',
        'from-[#1b253f] to-[#6b2cc1]',
        'from-[#2d3a8c] to-[#8a3dd4]',
    ];

    const getAvatarGradient = (adminId: string) => {
        const hash = adminId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const index = hash % avatarGradients.length;
        return avatarGradients[index];
    };

    const getRandomGradient = () => {
        return avatarGradients[Math.floor(Math.random() * avatarGradients.length)];
    };

    const getDepartmentValue = (value: any) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') return value._id || value.name || '';
        return '';
    };

    const matchesCurrentDepartment = (value: any, departmentId?: any) => {
        const normalizedValue = getDepartmentValue(value);
        const normalizedDepartmentId = getDepartmentValue(departmentId);
        return Boolean(
            (userDeptName && normalizedValue === userDeptName) ||
            (deptId && normalizedValue === deptId) ||
            (deptId && normalizedDepartmentId === deptId)
        );
    };

    // Helper function to format date safely
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Date not available';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

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
            const myDept = departmentsList.find((d: any) => d._id === deptId);
            if (myDept) {
                setUserDeptName(myDept.name);
                setUserDeptId(myDept._id);
            }
        }
    }, [departmentsList, deptId, role, userDeptName]);

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

    const handleCreateDepartment = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/department/create`, {
                ...newDept,
                organizationId: orgId
            });

            if (res.data.success) {
                toast({ title: "Success", description: "Department created" });
                setNewDept({ name: '', description: '' });
                setOpenDeptDialog(false);
                fetchOrgDepartments();
            } else {
                toast({ title: "Error", description: res.data.message || "Failed to create department", variant: "destructive" });
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.response?.data?.message || "Failed to create department", variant: "destructive" });
        }
    };

    const handleDeleteDepartment = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: 'Delete Department?',
            html: `Are you sure you want to delete <strong style="color: #dc2626;">${name}</strong>?<br/>This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b2cc1',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            background: '#ffffff',
            color: '#1f2937',
            iconColor: '#f59e0b',
            customClass: {
                popup: 'rounded-xl shadow-2xl',
                title: 'text-xl font-bold',
                htmlContainer: 'text-gray-600',
                confirmButton: 'bg-red-600 hover:bg-red-700 transition-all duration-200 px-6 py-2 rounded-lg',
                cancelButton: 'bg-gradient-to-r from-[#2d3a8c] to-[#6b2cc1] hover:opacity-90 transition-all duration-200 px-6 py-2 rounded-lg text-white'
            }
        });

        if (result.isConfirmed) {
            try {
                const res = await axios.delete(`${serverURL}/api/org/department/${id}`);
                if (res.data.success) {
                    await Swal.fire({
                        title: 'Deleted!',
                        text: 'Department has been deleted.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        background: '#ffffff',
                        color: '#1f2937',
                        iconColor: '#10b981'
                    });
                    fetchOrgDepartments();
                } else {
                    toast({ title: "Error", description: res.data.message || "Failed to delete department", variant: "destructive" });
                }
            } catch (e: any) {
                toast({ title: "Error", description: e.response?.data?.message || "Failed to delete department", variant: "destructive" });
            }
        }
    };

    const handleAddDeptAdmin = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/dept-admin/add`, {
                ...newDeptAdmin,
                organizationId: orgId
            });

            if (res.data.success) {
                toast({ title: "Success", description: "Department Admin added" });
                setNewDeptAdmin({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    departmentId: '',
                    courseLimit: 0
                });
                setOpenDeptAdminDialog(false);
                fetchOrgDeptAdmins();
            } else {
                toast({ title: "Error", description: res.data.message || "Failed to add dept admin", variant: "destructive" });
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.response?.data?.message || "Failed to add dept admin", variant: "destructive" });
        }
    };

    const handleDeleteDeptAdmin = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: 'Delete Department Admin?',
            html: `Are you sure you want to delete <strong style="color: #dc2626;">${name}</strong>?<br/>This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b2cc1',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            background: '#ffffff',
            color: '#1f2937',
            iconColor: '#f59e0b',
            customClass: {
                popup: 'rounded-xl shadow-2xl',
                title: 'text-xl font-bold',
                htmlContainer: 'text-gray-600',
                confirmButton: 'bg-red-600 hover:bg-red-700 transition-all duration-200 px-6 py-2 rounded-lg',
                cancelButton: 'bg-gradient-to-r from-[#2d3a8c] to-[#6b2cc1] hover:opacity-90 transition-all duration-200 px-6 py-2 rounded-lg text-white'
            }
        });

        if (result.isConfirmed) {
            try {
                const res = await axios.delete(`${serverURL}/api/org/dept-admin/${id}`);
                if (res.data.success) {
                    await Swal.fire({
                        title: 'Deleted!',
                        text: 'Department Admin has been deleted.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        background: '#ffffff',
                        color: '#1f2937',
                        iconColor: '#10b981'
                    });
                    fetchOrgDeptAdmins();
                } else {
                    toast({ title: "Error", description: res.data.message || "Failed to delete dept admin", variant: "destructive" });
                }
            } catch (e: any) {
                toast({ title: "Error", description: e.response?.data?.message || "Failed to delete dept admin", variant: "destructive" });
            }
        }
    };

    const fetchAssignments = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/assignments?organizationId=${orgId}`);
            if (res.data.success) {
                let assignmentsData = res.data.assignments;
                if (role === 'dept_admin') {
                    assignmentsData = assignmentsData.filter((a: any) => matchesCurrentDepartment(a.department, a.departmentId));
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
        console.log('Fetching students for orgId:', orgId);
        try {
            const res = await axios.get(`${serverURL}/api/org/students?organizationId=${orgId}`);
            console.log('Students response:', res.data);
            if (res.data.success) {
                let studentsData = res.data.students;
                if (role === 'dept_admin') {
                    studentsData = studentsData.filter((s: any) =>
                        (userDeptName && s.department === userDeptName) ||
                        (deptId && (s.departmentId === deptId || s.department === deptId))
                    );
                }
                setStudents(studentsData);
            } else {
                console.error('Failed to fetch students:', res.data.message);
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
                    coursesData = coursesData.filter((c: any) =>
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

    const getInitials = (name: string) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const filteredAdmins = activeAdminTab === 'all' 
        ? deptAdmins 
        : deptAdmins.filter(admin => admin.department?._id === activeAdminTab);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Header Section with Theme Gradient */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1b253f] via-[#2d3a8c] to-[#6b2cc1] p-6 mb-6 lg:mb-8 text-white shadow-lg">
                    <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                                    Department Management
                                </h1>
                                <p className="text-white/80 text-sm sm:text-base mt-1">
                                    Manage your organization's departments and administrative staff
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <Dialog open={openDeptDialog} onOpenChange={setOpenDeptDialog}>
                                <DialogTrigger asChild>
                                    <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto text-white border border-white/30">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Department
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[95%] sm:max-w-md mx-auto rounded-xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl sm:text-2xl bg-gradient-to-r from-[#1b253f] to-[#6b2cc1] bg-clip-text text-transparent">
                                            Create New Department
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label className="text-sm font-semibold">Department Name</Label>
                                            <Input
                                                placeholder="e.g., Computer Science"
                                                value={newDept.name}
                                                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                                                className="focus:outline-none focus:ring-2 focus:ring-[#6b2cc1] focus:border-transparent"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-sm font-semibold">Description</Label>
                                            <Textarea
                                                placeholder="Describe the department's focus and objectives..."
                                                value={newDept.description}
                                                onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                                                className="min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#6b2cc1] focus:border-transparent"
                                            />
                                        </div>
                                        <Button 
                                            onClick={handleCreateDepartment} 
                                            className="mt-2 bg-gradient-to-r from-[#2d3a8c] to-[#6b2cc1] hover:opacity-90 transition-all"
                                        >
                                            Create Department
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={openDeptAdminDialog} onOpenChange={setOpenDeptAdminDialog}>
                                <DialogTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto text-white border-white/30"
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Add Admin
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[95%] sm:max-w-md mx-auto rounded-xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl sm:text-2xl bg-gradient-to-r from-[#1b253f] to-[#6b2cc1] bg-clip-text text-transparent">
                                            Add Department Admin
                                        </DialogTitle>
                                    </DialogHeader>
                                    <ScrollArea className="max-h-[70vh]">
                                        <div className="grid gap-4 py-4 pr-2">
                                            <div className="grid gap-2">
                                                <Label className="text-sm font-semibold">Full Name</Label>
                                                <Input
                                                    placeholder="John Doe"
                                                    value={newDeptAdmin.name}
                                                    onChange={(e) => setNewDeptAdmin({ ...newDeptAdmin, name: e.target.value })}
                                                    className="focus:outline-none focus:ring-2 focus:ring-[#6b2cc1] focus:border-transparent"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-sm font-semibold">Email</Label>
                                                <Input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    value={newDeptAdmin.email}
                                                    onChange={(e) => setNewDeptAdmin({ ...newDeptAdmin, email: e.target.value })}
                                                    className="focus:outline-none focus:ring-2 focus:ring-[#6b2cc1] focus:border-transparent"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-sm font-semibold">Password</Label>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={newDeptAdmin.password}
                                                    onChange={(e) => setNewDeptAdmin({ ...newDeptAdmin, password: e.target.value })}
                                                    className="focus:outline-none focus:ring-2 focus:ring-[#6b2cc1] focus:border-transparent"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-sm font-semibold">Phone (Optional)</Label>
                                                <Input
                                                    placeholder="+1 234 567 8900"
                                                    value={newDeptAdmin.phone}
                                                    onChange={(e) => setNewDeptAdmin({ ...newDeptAdmin, phone: e.target.value })}
                                                    className="focus:outline-none focus:ring-2 focus:ring-[#6b2cc1] focus:border-transparent"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-sm font-semibold">Department</Label>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b2cc1] focus:border-transparent"
                                                    value={newDeptAdmin.departmentId}
                                                    onChange={(e) => setNewDeptAdmin({ ...newDeptAdmin, departmentId: e.target.value })}
                                                >
                                                    <option value="">Select Department</option>
                                                    {departmentsList.map((dept) => (
                                                        <option key={dept._id} value={dept._id}>
                                                            {dept.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-sm font-semibold">Course Creation Limit</Label>
                                                <Input
                                                    type="number"
                                                    value={newDeptAdmin.courseLimit}
                                                    onChange={(e) =>
                                                        setNewDeptAdmin({
                                                            ...newDeptAdmin,
                                                            courseLimit: parseInt(e.target.value) || 0
                                                        })
                                                    }
                                                    placeholder="Max courses this admin can create"
                                                    className="focus:outline-none focus:ring-2 focus:ring-[#6b2cc1] focus:border-transparent"
                                                />
                                            </div>
                                            <Button 
                                                onClick={handleAddDeptAdmin} 
                                                className="mt-2 bg-gradient-to-r from-[#2d3a8c] to-[#6b2cc1] hover:opacity-90 transition-all"
                                            >
                                                Add Department Admin
                                            </Button>
                                        </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
    
    {/* Card 1 */}
    <Card className="bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-muted-foreground text-sm">Total Departments</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1 text-[#1b253f]">
                        {departmentsList.length}
                    </p>
                </div>
                <div className="p-3 rounded-lg bg-[#1b253f]/10">
                    <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-[#1b253f]" />
                </div>
            </div>
        </CardContent>
    </Card>

    {/* Card 2 */}
    <Card className="bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-muted-foreground text-sm">Department Admins</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1 text-[#2d3a8c]">
                        {deptAdmins.length}
                    </p>
                </div>
                <div className="p-3 rounded-lg bg-[#2d3a8c]/10">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-[#2d3a8c]" />
                </div>
            </div>
        </CardContent>
    </Card>

    {/* Card 3 */}
    <Card className="bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-muted-foreground text-sm">Total Students</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1 text-[#4b3bb0]">
                        {stats.studentCount}
                    </p>
                </div>
                <div className="p-3 rounded-lg bg-[#4b3bb0]/10">
                    <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-[#4b3bb0]" />
                </div>
            </div>
        </CardContent>
    </Card>

    {/* Card 4 */}
    <Card className="bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-muted-foreground text-sm">Active Courses</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1 text-[#6b2cc1]">
                        {courses.length}
                    </p>
                </div>
                <div className="p-3 rounded-lg bg-[#6b2cc1]/10">
                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-[#6b2cc1]" />
                </div>
            </div>
        </CardContent>
    </Card>

</div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="departments" className="space-y-4 lg:space-y-6" onValueChange={setActiveTabState}>
                    <TabsList className="grid w-full max-w-[300px] sm:max-w-md grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mx-auto sm:mx-0">
                       <TabsTrigger 
    value="departments" 
    className={`flex items-center gap-2 transition-all duration-300 text-sm sm:text-base ${
        activeTabState === 'departments' 
            ? 'bg-gradient-to-r from-[#2d3a8c] to-[#6b2cc1] !text-white shadow-lg transform scale-105' 
            : 'hover:scale-105'
    }`}
>
    <Building2 className={`w-4 h-4 transition-all duration-300 ${activeTabState === 'departments' ? 'animate-pulse' : ''}`} />
    Departments
</TabsTrigger>
<TabsTrigger 
    value="admins" 
    className={`flex items-center gap-2 transition-all duration-300 text-sm sm:text-base ${
        activeTabState === 'admins' 
            ? 'bg-gradient-to-r from-[#2d3a8c] to-[#6b2cc1] !text-white shadow-lg transform scale-105' 
            : 'hover:scale-105'
    }`}
>
    <Shield className={`w-4 h-4 transition-all duration-300 ${activeTabState === 'admins' ? 'animate-pulse' : ''}`} />
    Department Admins
</TabsTrigger>
                    </TabsList>

                    <TabsContent value="departments" className="space-y-4 lg:space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            {departmentsList.length > 0 ? (
                                departmentsList.map((dept) => (
                                    <Card key={dept._id} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105 border-0 shadow-lg">
                                        <div className={`h-1 sm:h-2 bg-gradient-to-r ${getRandomGradient()} animate-pulse`} />
                                        <CardHeader className="p-4 sm:p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r ${getRandomGradient()} flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-all duration-300`}>
                                                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-base sm:text-xl bg-gradient-to-r from-[#1b253f] to-[#6b2cc1] bg-clip-text text-transparent">
                                                            {dept.name}
                                                        </CardTitle>
                                                        <CardDescription className="text-xs sm:text-sm mt-1">
                                                            Created {formatDate(dept.createdAt)}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950 h-8 w-8 sm:h-10 sm:w-10"
                                                    onClick={() => handleDeleteDepartment(dept._id, dept.name)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 sm:p-6 pt-0">
                                            <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 sm:line-clamp-3">
                                                {dept.description || "No description provided"}
                                            </p>
                                            <Separator className="my-3 sm:my-4" />
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Users className="w-4 h-4" />
                                                    <span>Admins: {deptAdmins.filter(admin => admin.department?._id === dept._id).length}</span>
                                                </div>                        
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card className="col-span-full border-0 shadow-lg">
                                    <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                                        <Building2 className="w-16 h-16 text-muted-foreground mb-4 animate-pulse" />
                                        <p className="text-center text-sm sm:text-base text-muted-foreground">
                                            No departments created yet. Click "Add Department" to get started.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="admins" className="space-y-4 lg:space-y-6 animate-fadeIn">
                        {/* Department Filter for Admins */}
                        <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                            <Button
                                variant={activeAdminTab === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveAdminTab('all')}
                                className={`rounded-full transition-all duration-300 text-sm ${
                                    activeAdminTab === 'all' 
                                        ? 'bg-gradient-to-r from-[#2d3a8c] to-[#6b2cc1] shadow-lg transform scale-105' 
                                        : 'hover:scale-105 border-[#2d3a8c]/30 hover:border-[#6b2cc1]'
                                }`}
                            >
                                All Departments
                            </Button>
                            {departmentsList.map((dept) => (
                                <Button
                                    key={dept._id}
                                    variant={activeAdminTab === dept._id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveAdminTab(dept._id)}
                                    className={`rounded-full transition-all duration-300 text-sm ${
                                        activeAdminTab === dept._id 
                                            ? 'bg-gradient-to-r from-[#2d3a8c] to-[#6b2cc1] shadow-lg transform scale-105' 
                                            : 'hover:scale-105 border-[#2d3a8c]/30 hover:border-[#6b2cc1]'
                                    }`}
                                >
                                    {dept.name.length > 12 ? `${dept.name.substring(0, 10)}...` : dept.name}
                                </Button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            {filteredAdmins.length > 0 ? (
                                filteredAdmins.map((admin) => {
                                    const coursesUsed = admin.coursesCreatedCount || 0;
                                    const coursesLeft = Math.max(0, (admin.courseLimit || 0) - coursesUsed);
                                    const usagePercentage = admin.courseLimit > 0 ? (coursesUsed / admin.courseLimit) * 100 : 0;
                                    
                                    return (
                                        <Card key={admin._id} className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 shadow-lg">
                                            <CardHeader className="p-4 sm:p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <Avatar className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${getAvatarGradient(admin._id)} shadow-md transform group-hover:rotate-6 transition-all duration-300 flex-shrink-0`}>
                                                            <AvatarFallback className="bg-transparent text-white text-base sm:text-lg font-bold">
                                                                {getInitials(admin.mName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <CardTitle className="text-base sm:text-lg truncate bg-gradient-to-r from-[#1b253f] to-[#6b2cc1] bg-clip-text text-transparent">
                                                                {admin.mName}
                                                            </CardTitle>
                                                            <CardDescription className="flex items-center gap-1 mt-1 text-xs sm:text-sm">
                                                                <Mail className="w-3 h-3 flex-shrink-0" />
                                                                <span className="truncate">{admin.email}</span>
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950 h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
                                                        onClick={() => handleDeleteDeptAdmin(admin._id, admin.mName)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                                    <Badge variant="secondary" className="gap-1 bg-gradient-to-r from-[#2d3a8c]/10 to-[#6b2cc1]/10 text-[#2d3a8c] border-0">
                                                        <Building2 className="w-3 h-3" />
                                                        {admin.department?.name || 'No Department'}
                                                    </Badge>
                                                    {admin.phone && (
                                                        <Badge variant="outline" className="gap-1 border-[#2d3a8c]/30">
                                                            <Phone className="w-3 h-3" />
                                                            <span className="truncate max-w-[120px]">{admin.phone}</span>
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Course Usage</span>
                                                        <span className="font-semibold text-[#6b2cc1]">{coursesUsed} / {admin.courseLimit || 0}</span>
                                                    </div>
                                                    <Progress 
                                                        value={usagePercentage} 
                                                        className="h-2"
                                                        style={{ background: 'rgba(107, 44, 193, 0.1)' }}
                                                    />
                                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                        <span>Available: {coursesLeft} courses left</span>
                                                        <span className="flex items-center gap-1">
                                                            <Award className="w-3 h-3 text-[#6b2cc1]" />
                                                            Limit: {admin.courseLimit || 0}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4 text-[#6b2cc1]" />
                                                    <span>Joined: {formatDate(admin.createdAt)}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            ) : (
                                <Card className="col-span-full border-0 shadow-lg">
                                    <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                                        <Shield className="w-16 h-16 text-muted-foreground mb-4 animate-pulse" />
                                        <p className="text-center text-sm sm:text-base text-muted-foreground">
                                            No department admins found for this filter.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default DepartmentsTab;