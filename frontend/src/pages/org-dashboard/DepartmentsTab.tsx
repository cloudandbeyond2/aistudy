import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Plus, Trash2, Building2, Users, Mail, Phone, 
    BookOpen, TrendingUp, Shield, Calendar, Lock,
    UserPlus, Award, Edit2
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
    const [openEditDeptDialog, setOpenEditDeptDialog] = useState(false);
    const [openEditAdminDialog, setOpenEditAdminDialog] = useState(false);
    const role = sessionStorage.getItem('role');
    const deptId = sessionStorage.getItem('deptId');
   
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
    const [activeAdminTab, setActiveAdminTab] = useState('all');
    const [activeTabState, setActiveTabState] = useState('departments');

    const [newDept, setNewDept] = useState({ name: '', description: '' });
    const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
    const [createDeptError, setCreateDeptError] = useState('');
    const [isUpdatingDepartment, setIsUpdatingDepartment] = useState(false);
    const [editDept, setEditDept] = useState({ id: '', name: '', description: '' });
    const [newDeptAdmin, setNewDeptAdmin] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        phone: '', 
        departmentId: '', 
        courseLimit: 0 
    });

     const validatePassword = (password: string) => {
  const errors: string[] = [];

  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("One number");
  if (!/[!@#$%^&*]/.test(password)) errors.push("One special character");

  return errors;
};
    const passwordRules = validatePassword(newDeptAdmin.password);
    const [isCreatingDeptAdmin, setIsCreatingDeptAdmin] = useState(false);
    const [createDeptAdminErrors, setCreateDeptAdminErrors] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        departmentId: '',
        courseLimit: ''
    });
    const [isUpdatingDeptAdmin, setIsUpdatingDeptAdmin] = useState(false);
    const [editDeptAdmin, setEditDeptAdmin] = useState({ 
        id: '',
        name: '', 
        email: '', 
        password: '',
        phone: '', 
        departmentId: '', 
        courseLimit: 0 
    });
    const [editDeptAdminPasswordError, setEditDeptAdminPasswordError] = useState('');
    const [editDeptAdminPhoneError, setEditDeptAdminPhoneError] = useState('');
    const [editDeptAdminCourseLimitError, setEditDeptAdminCourseLimitError] = useState('');
    const [remainingOrgCourseBalance, setRemainingOrgCourseBalance] = useState<number | null>(null);

    // Predefined gradient colors for avatars based on new theme
    const avatarGradients = [
        'from-[#11405f] to-[#1a6a9e]',
        'from-[#1a6a9e] to-[#11a5e4]',
        'from-[#11405f] to-[#11a5e4]',
        'from-[#0d3552] to-[#0e8fc9]',
        'from-[#11405f] to-[#1e7ab3]',
        'from-[#1e7ab3] to-[#11a5e4]',
        'from-[#0a2d45] to-[#11a5e4]',
        'from-[#11405f] to-[#2090c9]',
    ];

    const getAvatarGradient = (adminId: string) => {
        const hash = adminId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const index = hash % avatarGradients.length;
        return avatarGradients[index];
    };

    const getRandomGradient = () => {
        return avatarGradients[Math.floor(Math.random() * avatarGradients.length)];
    };

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    const normalizePhoneNumber = (value: string) => value.replace(/\D/g, '');
    const validatePhoneNumber = (value: string) => {
        const digits = normalizePhoneNumber(value.trim());
        if (!digits) return '';
        return digits.length === 10 ? '' : 'Phone number must contain exactly 10 digits.';
    };

    const getPasswordStrength = (password: string) => {
        if (!password) return '';
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[@$!%*?&]/.test(password)) strength++;

        if (strength <= 2) return 'Weak';
        if (strength <= 4) return 'Medium';
        return 'Strong';
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
        fetchOrgCourseBalance();
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

    const fetchOrgCourseBalance = async () => {
        try {
            const [statsRes, planRes] = await Promise.all([
                axios.get(`${serverURL}/api/org/dashboard/stats?organizationId=${orgId}`),
                axios.get(`${serverURL}/api/admin/org-plan?organizationId=${orgId}`)
            ]);

            if (statsRes.data.success && planRes.data.success && planRes.data.plan) {
                const totalCoursesCount = Number(statsRes.data.totalCoursesCount || 0);
                const aiCourseSlots = Number(planRes.data.plan.aiCourseSlots || 0);
                setRemainingOrgCourseBalance(Math.max(0, aiCourseSlots - totalCoursesCount));
            } else {
                setRemainingOrgCourseBalance(null);
            }
        } catch (e) {
            console.error("Failed to fetch organization course balance", e);
            setRemainingOrgCourseBalance(null);
        }
    };

    const getCourseLimitErrorMessage = (courseLimit: number) => {
        if (courseLimit < 0) {
            return 'Course creation limit cannot be negative.';
        }

        if (remainingOrgCourseBalance !== null && courseLimit > remainingOrgCourseBalance) {
            return `Course creation limit cannot exceed the organization's remaining balance of ${remainingOrgCourseBalance} course${remainingOrgCourseBalance === 1 ? '' : 's'}.`;
        }

        return '';
    };

    const clampCourseLimit = (value: number) => {
        const normalizedValue = Math.max(0, value || 0);
        if (remainingOrgCourseBalance === null) {
            return normalizedValue;
        }

        return Math.min(normalizedValue, remainingOrgCourseBalance);
    };

    const handleCreateDepartment = async () => {
        if (isCreatingDepartment) return;
        if (!newDept.name.trim()) {
            setCreateDeptError('Department name is required.');
            return;
        }

        try {
            setCreateDeptError('');
            setIsCreatingDepartment(true);
            const res = await axios.post(`${serverURL}/api/org/department/create`, {
                ...newDept,
                name: newDept.name.trim(),
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
        } finally {
            setIsCreatingDepartment(false);
        }
    };

    const handleUpdateDepartment = async () => {
        if (isUpdatingDepartment) return;

        try {
            setIsUpdatingDepartment(true);
            const res = await axios.put(`${serverURL}/api/org/department/${editDept.id}`, {
                name: editDept.name,
                description: editDept.description
            });

            if (res.data.success) {
                toast({ title: "Success", description: "Department updated successfully" });
                setOpenEditDeptDialog(false);
                setEditDept({ id: '', name: '', description: '' });
                fetchOrgDepartments();
            } else {
                toast({ title: "Error", description: res.data.message || "Failed to update department", variant: "destructive" });
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.response?.data?.message || "Failed to update department", variant: "destructive" });
        } finally {
            setIsUpdatingDepartment(false);
        }
    };

    const handleDeleteDepartment = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: 'Delete Department?',
            html: `Are you sure you want to delete <strong style="color: #dc2626;">${name}</strong>?<br/>This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#11a5e4',
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
                cancelButton: 'bg-gradient-to-r from-[#11405f] to-[#11a5e4] hover:opacity-90 transition-all duration-200 px-6 py-2 rounded-lg text-white'
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
        if (isCreatingDeptAdmin) return;

        const trimmedName = newDeptAdmin.name.trim();
        const trimmedEmail = newDeptAdmin.email.trim();
        const trimmedPassword = newDeptAdmin.password.trim();
        const trimmedPhone = newDeptAdmin.phone.trim();
        const validationErrors = {
            name: trimmedName ? '' : 'Full name is required.',
            email: !trimmedEmail
                ? 'Email is required.'
                : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
                    ? 'Enter a valid email address.'
                    : '',
            password: trimmedPassword ? '' : 'Password is required.',
            phone: validatePhoneNumber(trimmedPhone),
            departmentId: newDeptAdmin.departmentId ? '' : 'Department is required.',
            courseLimit: getCourseLimitErrorMessage(newDeptAdmin.courseLimit)
        };

        setCreateDeptAdminErrors(validationErrors);
        if (Object.values(validationErrors).some(Boolean)) return;

        try {
            setIsCreatingDeptAdmin(true);
            const res = await axios.post(`${serverURL}/api/org/dept-admin/add`, {
                ...newDeptAdmin,
                name: trimmedName,
                email: trimmedEmail,
                password: trimmedPassword,
                phone: trimmedPhone ? normalizePhoneNumber(trimmedPhone) : '',
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
                setCreateDeptAdminErrors({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    departmentId: '',
                    courseLimit: ''
                });
                setOpenDeptAdminDialog(false);
                fetchOrgDeptAdmins();
                fetchOrgCourseBalance();
            } else {
                toast({ title: "Error", description: res.data.message || "Failed to add dept admin", variant: "destructive" });
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.response?.data?.message || "Failed to add dept admin", variant: "destructive" });
        } finally {
            setIsCreatingDeptAdmin(false);
        }
    };

    const handleUpdateDeptAdmin = async () => {
        if (isUpdatingDeptAdmin) return;

        try {
            const trimmedPassword = editDeptAdmin.password.trim();
            const trimmedPhone = editDeptAdmin.phone.trim();
            const phoneError = validatePhoneNumber(trimmedPhone);
            if (phoneError) {
                setEditDeptAdminPhoneError(phoneError);
                return;
            }

            if (trimmedPassword && !strongPasswordRegex.test(trimmedPassword)) {
                setEditDeptAdminPasswordError('Password must contain uppercase, lowercase, number & special character');
                return;
            }

            const courseLimitError = getCourseLimitErrorMessage(editDeptAdmin.courseLimit);
            if (courseLimitError) {
                setEditDeptAdminCourseLimitError(courseLimitError);
                return;
            }

            setEditDeptAdminPasswordError('');
            setEditDeptAdminPhoneError('');
            setEditDeptAdminCourseLimitError('');
            setIsUpdatingDeptAdmin(true);
            const res = await axios.put(`${serverURL}/api/org/dept-admin/${editDeptAdmin.id}`, {
                name: editDeptAdmin.name,
                email: editDeptAdmin.email,
                phone: trimmedPhone ? normalizePhoneNumber(trimmedPhone) : '',
                departmentId: editDeptAdmin.departmentId,
                courseLimit: editDeptAdmin.courseLimit,
                ...(trimmedPassword ? { password: trimmedPassword } : {})
            });

            if (res.data.success) {
                toast({ title: "Success", description: "Department Admin updated successfully" });
                setOpenEditAdminDialog(false);
                setEditDeptAdmin({ 
                    id: '', 
                    name: '', 
                    email: '', 
                    password: '',
                    phone: '', 
                    departmentId: '', 
                    courseLimit: 0 
                });
                fetchOrgDeptAdmins();
                fetchOrgCourseBalance();
            } else {
                toast({ title: "Error", description: res.data.message || "Failed to update department admin", variant: "destructive" });
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.response?.data?.message || "Failed to update department admin", variant: "destructive" });
        } finally {
            setIsUpdatingDeptAdmin(false);
        }
    };

    const handleDeleteDeptAdmin = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: 'Delete Department Admin?',
            html: `Are you sure you want to delete <strong style="color: #dc2626;">${name}</strong>?<br/>This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#11a5e4',
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
                cancelButton: 'bg-gradient-to-r from-[#11405f] to-[#11a5e4] hover:opacity-90 transition-all duration-200 px-6 py-2 rounded-lg text-white'
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
        <div className="min-h-screen">
            <div className="space-y-6 sm:space-y-8 animate-fade-in px-2 sm:px-2 lg:px-4 max-w-[1400px] mx-auto relative pt-0 lg:pt-[65px]">
                {/* Header Section with New Theme Gradient */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#294861] via-[#2d5876] to-[#3b7398] p-6 mb-6 lg:mb-8 text-white shadow-lg">
                    <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/6 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
                    <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="students-theme-hero-icon rounded-xl p-2 backdrop-blur-sm">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                                    Department Management
                                </h1>
                                <p className="students-theme-hero-subtitle text-sm sm:text-base mt-1">
                                    Manage your organization's departments and administrative staff
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <Dialog
                                open={openDeptDialog}
                                onOpenChange={(open) => {
                                    setOpenDeptDialog(open);
                                    if (open) setIsCreatingDepartment(false);
                                    if (open) setCreateDeptError('');
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button className="students-theme-hero-badge shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto text-white border">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Department
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="students-theme-dialog w-[95%] sm:max-w-md mx-auto rounded-xl">
                                    <DialogHeader>
                                        <DialogTitle className="students-theme-title text-xl sm:text-2xl">
                                            Create New Department
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label className="text-sm font-semibold">Department Name</Label>
                                            <Input
                                                placeholder="e.g., Computer Science"
                                                value={newDept.name}
                                                onChange={(e) => {
                                                    setNewDept({ ...newDept, name: e.target.value });
                                                    if (createDeptError) setCreateDeptError('');
                                                }}
                                                className="students-theme-input"
                                            />
                                            {createDeptError ? (
                                                <p className="text-sm text-red-600">{createDeptError}</p>
                                            ) : null}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-sm font-semibold">Description</Label>
                                            <Textarea
                                                placeholder="Describe the department's focus and objectives..."
                                                value={newDept.description}
                                                onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                                                className="students-theme-input min-h-[100px]"
                                            />
                                        </div>
                                        <Button 
                                            onClick={handleCreateDepartment} 
                                            disabled={isCreatingDepartment}
                                            className="mt-2 bg-gradient-to-r from-[#11405f] to-[#11a5e4] hover:opacity-90 transition-all"
                                        >
                                            {isCreatingDepartment ? 'Creating...' : 'Create Department'}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog
                                open={openDeptAdminDialog}
                                onOpenChange={(open) => {
                                    setOpenDeptAdminDialog(open);
                                    if (open) {
                                        setIsCreatingDeptAdmin(false);
                                        setNewDeptAdmin({
                                            name: '',
                                            email: '',
                                            password: '',
                                            phone: '',
                                            departmentId: '',
                                            courseLimit: 0
                                        });
                                        setCreateDeptAdminErrors({
                                            name: '',
                                            email: '',
                                            password: '',
                                            phone: '',
                                            departmentId: '',
                                            courseLimit: ''
                                        });
                                    }
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button 
                                        className="students-theme-hero-badge !bg-white/12 hover:!bg-white/20 shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto !text-white !border-white/30"
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Add Admin
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="students-theme-dialog w-[95%] sm:max-w-md mx-auto rounded-xl">
                                    <DialogHeader>
                                        <DialogTitle className="students-theme-title text-xl sm:text-2xl">
                                            Add Department Admin
                                        </DialogTitle>
                                    </DialogHeader>
                                    <ScrollArea className="max-h-[70vh]">
                                        <div className="grid gap-4 py-4 pr-2">
                                            <div className="grid gap-2">
                                                <Label className="text-sm font-semibold">Full Name</Label>
                                                <Input
                                                    name="dept-admin-name"
                                                    autoComplete="off"
                                                    autoCorrect="off"
                                                    spellCheck={false}
                                                    placeholder="John Doe"
                                                    value={newDeptAdmin.name}
                                                    onChange={(e) => {
                                                        setNewDeptAdmin({ ...newDeptAdmin, name: e.target.value });
                                                        if (createDeptAdminErrors.name) {
                                                            setCreateDeptAdminErrors({ ...createDeptAdminErrors, name: '' });
                                                        }
                                                    }}
                                                    className="students-theme-input"
                                                />
                                                {createDeptAdminErrors.name ? (
                                                    <p className="text-sm text-red-600">{createDeptAdminErrors.name}</p>
                                                ) : null}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-sm font-semibold">Email</Label>
                                                <Input
                                                    name="dept-admin-email"
                                                    type="email"
                                                    autoComplete="off"
                                                    autoCorrect="off"
                                                    spellCheck={false}
                                                    placeholder="john@example.com"
                                                    value={newDeptAdmin.email}
                                                    onChange={(e) => {
                                                        setNewDeptAdmin({ ...newDeptAdmin, email: e.target.value });
                                                        if (createDeptAdminErrors.email) {
                                                            setCreateDeptAdminErrors({ ...createDeptAdminErrors, email: '' });
                                                        }
                                                    }}
                                                    className="students-theme-input"
                                                />
                                                {createDeptAdminErrors.email ? (
                                                    <p className="text-sm text-red-600">{createDeptAdminErrors.email}</p>
                                                ) : null}
                                            </div>
                                          <div className="grid gap-2">
  <Label className="text-sm font-semibold">Password</Label>

  <Input
    type="password"
    name="dept-admin-password"
    placeholder="••••••••"
    value={newDeptAdmin.password}
    onChange={(e) => {
      const value = e.target.value;
      setNewDeptAdmin({ ...newDeptAdmin, password: value });
    }}
    className="students-theme-input"
  />

  {/* Final error */}
  {passwordRules.length > 0 && (
    <p className="text-sm text-red-600">Password is not strong enough</p>
  )}
  
</div>
                                            <div className="grid gap-2">
                                                <Label className="text-sm font-semibold">Phone (Optional)</Label>
                                                <Input
                                                    name="dept-admin-phone"
                                                    autoComplete="off"
                                                    inputMode="numeric"
                                                    maxLength={10}
                                                    placeholder="+1 234 567 8900"
                                                    value={newDeptAdmin.phone}
                                                    onChange={(e) => {
                                                        const digits = normalizePhoneNumber(e.target.value).slice(0, 10);
                                                        setNewDeptAdmin({ ...newDeptAdmin, phone: digits });
                                                        if (createDeptAdminErrors.phone) {
                                                            setCreateDeptAdminErrors({ ...createDeptAdminErrors, phone: '' });
                                                        }
                                                    }}
                                                    className="students-theme-input"
                                                />
                                                {createDeptAdminErrors.phone ? (
                                                    <p className="text-sm text-red-600">{createDeptAdminErrors.phone}</p>
                                                ) : null}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-sm font-semibold">Department</Label>
                                                <select
                                                    className="students-theme-select flex h-10 w-full rounded-md px-3 py-2 text-sm"
                                                    value={newDeptAdmin.departmentId}
                                                    onChange={(e) => {
                                                        setNewDeptAdmin({ ...newDeptAdmin, departmentId: e.target.value });
                                                        if (createDeptAdminErrors.departmentId) {
                                                            setCreateDeptAdminErrors({ ...createDeptAdminErrors, departmentId: '' });
                                                        }
                                                    }}
                                                >
                                                    <option value="">Select Department</option>
                                                    {departmentsList.map((dept) => (
                                                        <option key={dept._id} value={dept._id}>
                                                            {dept.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {createDeptAdminErrors.departmentId ? (
                                                    <p className="text-sm text-red-600">{createDeptAdminErrors.departmentId}</p>
                                                ) : null}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-sm font-semibold">Course Creation Limit</Label>
            <Input
                type="number"
                min={0}
                max={remainingOrgCourseBalance ?? undefined}
                value={newDeptAdmin.courseLimit}
                onChange={(e) => {
                    const nextValue = clampCourseLimit(parseInt(e.target.value) || 0);
                    setNewDeptAdmin({
                        ...newDeptAdmin,
                        courseLimit: nextValue
                    });
                    setCreateDeptAdminErrors({
                        ...createDeptAdminErrors,
                        courseLimit: getCourseLimitErrorMessage(nextValue)
                    });
                }}
                placeholder="Max courses this admin can create"
                className="students-theme-input"
            />
                                                <p className="text-xs text-slate-600">
                                                    {remainingOrgCourseBalance !== null
                                                        ? `Remaining organization balance: ${remainingOrgCourseBalance} course${remainingOrgCourseBalance === 1 ? '' : 's'}`
                                                        : 'Organization course balance unavailable right now.'}
                                                </p>
                                                {createDeptAdminErrors.courseLimit ? (
                                                    <p className="text-sm text-red-600">{createDeptAdminErrors.courseLimit}</p>
                                                ) : null}
                                            </div>
                                            <Button 
                                                onClick={handleAddDeptAdmin} 
                                                disabled={isCreatingDeptAdmin}
                                                className="mt-2 bg-gradient-to-r from-[#11405f] to-[#11a5e4] hover:opacity-90 transition-all"
                                            >
                                                {isCreatingDeptAdmin ? 'Adding...' : 'Add Department Admin'}
                                            </Button>
                                        </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                    {/* Card 1 */}
                    <Card className="students-theme-surface shadow-md hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm">Total Departments</p>
                                    <p className="text-2xl sm:text-3xl font-bold mt-1 text-[#11405f]">
                                        {departmentsList.length}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-[#11405f]/10">
                                    <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-[#11405f]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2 */}
                    <Card className="students-theme-surface shadow-md hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm">Department Admins</p>
                                    <p className="text-2xl sm:text-3xl font-bold mt-1 text-[#1a6a9e]">
                                        {deptAdmins.length}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-[#11a5e4]/10">
                                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-[#11a5e4]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 3 */}
                    <Card className="students-theme-surface shadow-md hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm">Total Students</p>
                                    <p className="text-2xl sm:text-3xl font-bold mt-1 text-[#1e7ab3]">
                                        {stats.studentCount}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-[#11a5e4]/10">
                                    <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-[#11a5e4]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 4 */}
                    <Card className="students-theme-surface shadow-md hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm">Active Courses</p>
                                    <p className="text-2xl sm:text-3xl font-bold mt-1 text-[#11a5e4]">
                                        {courses.length}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-[#11a5e4]/10">
                                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-[#11a5e4]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="departments" className="space-y-4 lg:space-y-6" onValueChange={setActiveTabState}>
                    <TabsList className="students-theme-surface grid w-full max-w-full sm:max-w-md grid-cols-2 p-1 rounded-lg mx-auto sm:mx-0 h-auto gap-1">
                        <TabsTrigger 
                            value="departments" 
                            className={`min-w-0 h-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 text-center whitespace-normal break-words leading-tight transition-all duration-300 text-xs sm:text-base ${
                                activeTabState === 'departments' 
                                    ? 'bg-gradient-to-r from-[#11405f] to-[#11a5e4] !text-white shadow-lg transform scale-105' 
                                    : 'students-theme-outline-btn hover:scale-105'
                            }`}
                        >
                            <Building2 className={`w-4 h-4 transition-all duration-300 ${activeTabState === 'departments' ? 'animate-pulse' : ''}`} />
                            <span className="block max-w-full">Departments</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="admins" 
                            className={`min-w-0 h-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 text-center whitespace-normal break-words leading-tight transition-all duration-300 text-xs sm:text-base ${
                                activeTabState === 'admins' 
                                    ? 'bg-gradient-to-r from-[#11405f] to-[#11a5e4] !text-white shadow-lg transform scale-105' 
                                    : 'students-theme-outline-btn hover:scale-105'
                            }`}
                        >
                            <Shield className={`w-4 h-4 transition-all duration-300 ${activeTabState === 'admins' ? 'animate-pulse' : ''}`} />
                            <span className="block max-w-full">Department Admins</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="departments" className="space-y-4 lg:space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            {departmentsList.length > 0 ? (
                                departmentsList.map((dept) => (
                                    <Card key={dept._id} className="students-theme-student-card group hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105 shadow-lg">
                                        <div className={`h-1 sm:h-2 bg-gradient-to-r ${getRandomGradient()} animate-pulse`} />
                                        <CardHeader className="p-4 sm:p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r ${getRandomGradient()} flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-all duration-300`}>
                                                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="students-theme-title text-base sm:text-xl">
                                                            {dept.name}
                                                        </CardTitle>
                                                        <CardDescription className="students-theme-description text-xs sm:text-sm mt-1">
                                                            Created {formatDate(dept.createdAt)}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 h-8 w-8 sm:h-10 sm:w-10"
                                                        onClick={() => {
                                                            setEditDept({
                                                                id: dept._id,
                                                                name: dept.name,
                                                                description: dept.description || ''
                                                            });
                                                            setOpenEditDeptDialog(true);
                                                        }}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950 h-8 w-8 sm:h-10 sm:w-10"
                                                        onClick={() => handleDeleteDepartment(dept._id, dept.name)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 sm:p-6 pt-0">
                                            <p className="students-theme-description text-sm sm:text-base line-clamp-2 sm:line-clamp-3">
                                                {dept.description || "No description provided"}
                                            </p>
                                            <Separator className="students-theme-card-divider my-3 sm:my-4" />
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
                                <Card className="students-theme-surface col-span-full shadow-lg">
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
                                        ? 'bg-gradient-to-r from-[#11405f] to-[#11a5e4] shadow-lg transform scale-105' 
                                        : 'students-theme-outline-btn hover:scale-105'
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
                                            ? 'bg-gradient-to-r from-[#11405f] to-[#11a5e4] shadow-lg transform scale-105' 
                                            : 'students-theme-outline-btn hover:scale-105'
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
                                        <Card key={admin._id} className="students-theme-student-card group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                                            <CardHeader className="p-4 sm:p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <Avatar className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${getAvatarGradient(admin._id)} shadow-md transform group-hover:rotate-6 transition-all duration-300 flex-shrink-0`}>
                                                            <AvatarFallback className="bg-transparent text-white text-base sm:text-lg font-bold">
                                                                {getInitials(admin.mName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <CardTitle className="students-theme-title text-base sm:text-lg truncate">
                                                                {admin.mName}
                                                            </CardTitle>
                                                            <CardDescription className="students-theme-description flex items-center gap-1 mt-1 text-xs sm:text-sm">
                                                                <Mail className="w-3 h-3 flex-shrink-0" />
                                                                <span className="truncate">{admin.email}</span>
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
                                                            onClick={() => {
                                                                setEditDeptAdmin({
                                                                    id: admin._id,
                                                                    name: admin.mName,
                                                                    email: admin.email,
                                                                    password: '',
                                                                    phone: admin.phone || '',
                                                                    departmentId: admin.department?._id || '',
                                                                    courseLimit: admin.courseLimit || 0
                                                                });
                                                                setEditDeptAdminPasswordError('');
                                                                setOpenEditAdminDialog(true);
                                                            }}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950 h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
                                                            onClick={() => handleDeleteDeptAdmin(admin._id, admin.mName)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                                    <Badge
  variant="secondary"
  className="gap-1 bg-gradient-to-r from-[#11405f] to-[#11a5e4] text-white border-0"
>
  <Building2 className="w-3 h-3 text-white" />
  {admin.department?.name || 'No Department'}
</Badge>
                                                    {admin.phone && (
                                                        <Badge variant="outline" className="gap-1 border-[#11405f]/30">
                                                            <Phone className="w-3 h-3" />
                                                            <span className="truncate max-w-[120px]">{admin.phone}</span>
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Course Usage</span>
                                                        <span className="font-semibold text-[#11a5e4]">{coursesUsed} / {admin.courseLimit || 0}</span>
                                                    </div>
                                                    <Progress 
                                                        value={usagePercentage} 
                                                        className="h-2"
                                                        style={{ background: 'rgba(17, 165, 228, 0.1)' }}
                                                    />
                                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                        <span>Available: {coursesLeft} courses left</span>
                                                        <span className="flex items-center gap-1">
                                                            <Award className="w-3 h-3 text-[#11a5e4]" />
                                                            Limit: {admin.courseLimit || 0}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Separator className="students-theme-card-divider" />

                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4 text-[#11a5e4]" />
                                                    <span>Joined: {formatDate(admin.createdAt)}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            ) : (
                                <Card className="students-theme-surface col-span-full shadow-lg">
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

            {/* Edit Department Dialog */}
            <Dialog
                open={openEditDeptDialog}
                onOpenChange={(open) => {
                    setOpenEditDeptDialog(open);
                    if (open) setIsUpdatingDepartment(false);
                }}
            >
                <DialogContent className="students-theme-dialog w-[95%] sm:max-w-md mx-auto rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="students-theme-title text-xl sm:text-2xl">
                            Edit Department
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label className="text-sm font-semibold">Department Name</Label>
                            <Input
                                placeholder="e.g., Computer Science"
                                value={editDept.name}
                                onChange={(e) => setEditDept({ ...editDept, name: e.target.value })}
                                className="students-theme-input"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-semibold">Description</Label>
                            <Textarea
                                placeholder="Describe the department's focus and objectives..."
                                value={editDept.description}
                                onChange={(e) => setEditDept({ ...editDept, description: e.target.value })}
                                className="students-theme-input min-h-[100px]"
                            />
                        </div>
                        <div className="flex gap-3 mt-2">
                            <Button 
                                onClick={handleUpdateDepartment} 
                                disabled={isUpdatingDepartment}
                                className="flex-1 bg-gradient-to-r from-[#11405f] to-[#11a5e4] hover:opacity-90 transition-all"
                            >
                                {isUpdatingDepartment ? 'Updating...' : 'Update Department'}
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => setOpenEditDeptDialog(false)}
                                className="students-theme-outline-btn flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Department Admin Dialog */}
            <Dialog
                open={openEditAdminDialog}
                onOpenChange={(open) => {
                    setOpenEditAdminDialog(open);
                    setEditDeptAdminPasswordError('');
                    setEditDeptAdminPhoneError('');
                    setEditDeptAdminCourseLimitError('');
                    if (open) setIsUpdatingDeptAdmin(false);
                }}
            >
                <DialogContent className="students-theme-dialog w-[95%] sm:max-w-md mx-auto rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="students-theme-title text-xl sm:text-2xl">
                            Edit Department Admin
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[70vh]">
                        <div className="grid gap-4 py-4 pr-2">
                            <div className="grid gap-2">
                                <Label className="text-sm font-semibold">Full Name</Label>
                                <Input
                                    name="dept-admin-edit-name"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    placeholder="John Doe"
                                    value={editDeptAdmin.name}
                                    onChange={(e) => setEditDeptAdmin({ ...editDeptAdmin, name: e.target.value })}
                                    className="students-theme-input"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-sm font-semibold">Email</Label>
                                <Input
                                    name="dept-admin-edit-email"
                                    type="email"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    placeholder="john@example.com"
                                    value={editDeptAdmin.email}
                                    onChange={(e) => setEditDeptAdmin({ ...editDeptAdmin, email: e.target.value })}
                                    className="students-theme-input"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-sm font-semibold">Phone (Optional)</Label>
                                <Input
                                    name="dept-admin-edit-phone"
                                    autoComplete="off"
                                    inputMode="numeric"
                                    maxLength={10}
                                    placeholder="+1 234 567 8900"
                                    value={editDeptAdmin.phone}
                                    onChange={(e) => {
                                        const digits = normalizePhoneNumber(e.target.value).slice(0, 10);
                                        setEditDeptAdmin({ ...editDeptAdmin, phone: digits });
                                        if (editDeptAdminPhoneError) {
                                            setEditDeptAdminPhoneError('');
                                        }
                                    }}
                                    className="students-theme-input"
                                />
                                {editDeptAdminPhoneError ? (
                                    <p className="text-sm text-red-600">{editDeptAdminPhoneError}</p>
                                ) : (
                                    <p className="text-xs text-slate-600">
                                        Enter exactly 10 digits if you provide a phone number.
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Change Password
                                </Label>
                                <Input
                                    type="password"
                                    name="dept-admin-edit-password"
                                    autoComplete="new-password"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    placeholder="Leave blank to keep current password"
                                    value={editDeptAdmin.password}
                                    onChange={(e) => {
                                        setEditDeptAdmin({ ...editDeptAdmin, password: e.target.value });
                                        if (editDeptAdminPasswordError) {
                                            setEditDeptAdminPasswordError('');
                                        }
                                    }}
                                    className="students-theme-input"
                                />
                                {editDeptAdmin.password ? (
                                    <p className="text-xs text-slate-600">
                                        Password strength: <strong>{getPasswordStrength(editDeptAdmin.password)}</strong>
                                    </p>
                                ) : null}
                                {editDeptAdminPasswordError ? (
                                    <p className="text-sm text-red-600">{editDeptAdminPasswordError}</p>
                                ) : (
                                    <p className="text-xs text-slate-600">
                                        Use at least 8 characters with uppercase, lowercase, number, and special character.
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-sm font-semibold">Department</Label>
                                <select
                                    className="students-theme-select flex h-10 w-full rounded-md px-3 py-2 text-sm"
                                    value={editDeptAdmin.departmentId}
                                    onChange={(e) => setEditDeptAdmin({ ...editDeptAdmin, departmentId: e.target.value })}
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
                                min={0}
                                max={remainingOrgCourseBalance ?? undefined}
                                value={editDeptAdmin.courseLimit}
                                onChange={(e) => {
                                    const nextValue = clampCourseLimit(parseInt(e.target.value) || 0);
                                    setEditDeptAdmin({
                                        ...editDeptAdmin,
                                        courseLimit: nextValue
                                    });
                                    setEditDeptAdminCourseLimitError(getCourseLimitErrorMessage(nextValue));
                                }}
                                placeholder="Max courses this admin can create"
                                className="students-theme-input"
                            />
                                <p className="text-xs text-slate-600">
                                    {remainingOrgCourseBalance !== null
                                        ? `Remaining organization balance: ${remainingOrgCourseBalance} course${remainingOrgCourseBalance === 1 ? '' : 's'}`
                                        : 'Organization course balance unavailable right now.'}
                                </p>
                                {editDeptAdminCourseLimitError ? (
                                    <p className="text-sm text-red-600">{editDeptAdminCourseLimitError}</p>
                                ) : null}
                            </div>
                            <div className="flex gap-3 mt-2">
                                <Button 
                                    onClick={handleUpdateDeptAdmin} 
                                    disabled={isUpdatingDeptAdmin}
                                    className="flex-1 bg-gradient-to-r from-[#11405f] to-[#11a5e4] hover:opacity-90 transition-all"
                                >
                                    {isUpdatingDeptAdmin ? 'Updating...' : 'Update Admin'}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setOpenEditAdminDialog(false)}
                                    className="students-theme-outline-btn flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DepartmentsTab;
