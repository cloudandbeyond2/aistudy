import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import * as XLSX from 'xlsx';
import { Badge } from "@/components/ui/badge";
import { 
    Plus, Upload, Trash2, Briefcase, Users, Download, FileSpreadsheet, 
    UserPlus, GraduationCap, Mail, BookOpen, Award, TrendingUp, Loader2, Search,
    X, Save, Edit2, User, AtSign, Lock, Building, Hash, Calendar as CalendarIcon,
    School, UsersRound, PieChart, Menu, LayoutGrid, List, MessageSquare, Send,
    UserX,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DigitalIDCard from '@/components/DigitalIDCard';
import { CreditCard } from 'lucide-react';
  import Swal from "sweetalert2";
const StudentsTab = () => {
    const [openStudentDialog, setOpenStudentDialog] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const role = sessionStorage.getItem('role');
    const deptId = sessionStorage.getItem('deptId');
    const { toast } = useToast();
    const [stats, setStats] = useState({ studentCount: 0, studentLimit: 50 });
    const [students, setStudents] = useState([]);
    const [departmentsList, setDepartmentsList] = useState([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedClass, setSelectedClass] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    
    const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');

    const [newStudent, setNewStudent] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        department: '', 
        section: '', 
        studentClass: '', 
        rollNo: '', 
        academicYear: '' 
    });
    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [newStudentErrors, setNewStudentErrors] = useState({
        name: '',
        email: '',
        password: '',
        department: ''
    });
    const [editStudent, setEditStudent] = useState<any>(null);
    const [placementStudent, setPlacementStudent] = useState<any>(null);
    const [notifyStudent, setNotifyStudent] = useState<any>(null);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isSendingNotification, setIsSendingNotification] = useState(false);
    const [selectedIdCardStudent, setSelectedIdCardStudent] = useState<any>(null);
    const [digitalIdModuleEnabled, setDigitalIdModuleEnabled] = useState(false);
    const [fullOrgData, setFullOrgData] = useState<any>(null);
    const studentsPerPage = 8;
    const primaryGradient = "from-[#11405f] to-[#11a5e4]";
    const secondaryGradient = "from-[#0f4d73] to-[#1597d6]";
    const accentGradient = "from-[#0d3552] to-[#1a6a9e]";

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    };

    const resolveDepartmentId = (value: any) => {
        const normalizedValue = String(value || '').trim();
        if (!normalizedValue) return '';

        const matchedDepartment = departmentsList.find((department: any) =>
            department._id === normalizedValue ||
            department.name === normalizedValue ||
            department.name?.toLowerCase() === normalizedValue.toLowerCase()
        );

        return matchedDepartment?._id || normalizedValue;
    };

    // Helper function to get department value consistently
    const getDepartmentId = (student: any) => {
        const departmentValue =
            student.studentDetails?.departmentId ||
            student.studentDetails?.department ||
            student.departmentId ||
            student.department ||
            '';

        return resolveDepartmentId(departmentValue);
    };

    const getDepartmentName = (departmentValue: string) => {
        const departmentId = resolveDepartmentId(departmentValue);
        const dept = departmentsList.find((d: any) => d._id === departmentId);
        return dept ? dept.name : departmentValue;
    };

    const prepareStudentForEdit = (student: any) => ({
        ...student,
        password: '',
        studentDetails: {
            ...student?.studentDetails,
            department: role === 'dept_admin' && deptId ? deptId : getDepartmentId(student),
            departmentId: role === 'dept_admin' && deptId ? deptId : getDepartmentId(student),
        }
    });

    // Fetch departments
    const fetchOrgDepartments = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/departments?organizationId=${orgId}`);
            if (res.data.success) {
                setDepartmentsList(res.data.departments);
                if (role === 'dept_admin' && deptId) {
                    setNewStudent(prev => ({ ...prev, department: deptId }));
                }
            }
        } catch (e) {
            console.error("Failed to fetch departments", e);
        }
    };

    // Fetch stats
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

    // Fetch students
    const fetchStudents = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/students?organizationId=${orgId}`);
            if (res.data.success) {
                let studentsData = res.data.students;
                if (role === 'dept_admin' && deptId) {
                    studentsData = studentsData.filter((s: any) => {
                        const studentDeptId = getDepartmentId(s);
                        return studentDeptId === deptId;
                    });
                }
                setStudents(studentsData);
            }
        } catch (e) {
            console.error('Error fetching students:', e);
        }
    };

    const fetchModuleSettings = async () => {
        try {
            const settingsRes = await axios.get(`${serverURL}/api/settings`);
            console.log("Module Settings Fetched:", settingsRes.data);
            if (settingsRes.data) {
                const di = settingsRes.data.digitalIdEnabled;
                if (di) {
                    const userRole = sessionStorage.getItem('role');
                    const userType = sessionStorage.getItem('type') || 'free';
                    console.log("User Context:", { userRole, userType });
                    
                    if (userRole === 'org_admin' || userRole === 'dept_admin') {
                      if (di.org_admin) setDigitalIdModuleEnabled(true);
                    } else if (userRole === 'student') {
                      if (di.student) setDigitalIdModuleEnabled(true);
                    } else if (di[userType as keyof typeof di]) {
                      setDigitalIdModuleEnabled(true);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching module settings", error);
        }
    };

    const fetchOrgDetails = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/getuser/${orgId}`);
            if (res.data.success) {
                setFullOrgData(res.data.user);
            }
        } catch (error) {
            console.error("Error fetching org details", error);
        }
    };

    // Add single student
    const handleAddStudent = async () => {
        if (isAddingStudent) return;

        const trimmedName = newStudent.name.trim();
        const trimmedEmail = newStudent.email.trim();
        const trimmedPassword = newStudent.password.trim();
        const validationErrors = {
            name: trimmedName ? '' : 'Full name is required.',
            email: !trimmedEmail
                ? 'Email is required.'
                : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
                    ? 'Enter a valid email address.'
                    : '',
            password: trimmedPassword ? '' : 'Password is required.',
            department: role === 'dept_admin' || newStudent.department
                ? ''
                : 'Department is required.'
        };

        setNewStudentErrors(validationErrors);
        if (Object.values(validationErrors).some(Boolean)) return;
        
        try {
            setIsAddingStudent(true);
            const res = await axios.post(`${serverURL}/api/org/student/add`, { 
                ...newStudent, 
                name: trimmedName,
                email: trimmedEmail,
                password: trimmedPassword,
                organizationId: orgId 
            });
            if (res.data.success) {
                toast({ title: "Success", description: "Student added successfully" });
                setNewStudent({ 
                    name: '', email: '', password: '', department: role === 'dept_admin' ? deptId : '', 
                    section: '', studentClass: '', rollNo: '', academicYear: '' 
                });
                setNewStudentErrors({
                    name: '',
                    email: '',
                    password: '',
                    department: ''
                });
                setOpenStudentDialog(false);
                fetchStudents();
                fetchStats();
            } else {
                toast({ title: "Error", description: res.data.message, variant: "destructive" });
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: e.response?.data?.message || "Request failed", variant: "destructive" });
        } finally {
            setIsAddingStudent(false);
        }
    };

    // Bulk upload students from Excel
    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    toast({ 
                        title: "Error", 
                        description: "The Excel file is empty", 
                        variant: "destructive" 
                    });
                    setIsUploading(false);
                    return;
                }

                const studentsData = jsonData
                    .map((row: any) => {
                        let departmentId = row.Department || row.department || '';
                        if (departmentId && !departmentsList.some((d: any) => d._id === departmentId)) {
                            const dept = departmentsList.find((d: any) => d.name === departmentId);
                            if (dept) departmentId = dept._id;
                        }
                        if (role === 'dept_admin' && deptId) {
                            departmentId = deptId;
                        }
                        return {
                            name: row.Name || row.name || '',
                            email: row.Email || row.email || '',
                            password: row.Password || row.password || 'Student@123',
                            department: departmentId,
                            section: row.Section || row.section || '',
                            rollNo: row.RollNo || row['Roll No'] || row.rollno || '',
                            academicYear: row['Academic Year'] || row.AcademicYear || row.academicYear || '',
                             studentClass: row.Class || row.class || ''   // ✅ ADD THIS
                        };
                    })
                    .filter(student => student.name.trim() !== '' && student.email.trim() !== '');

                const invalidRows = studentsData.filter(s => !s.email || !s.name);
                if (invalidRows.length > 0) {
                    toast({
                        title: "Warning",
                        description: `${invalidRows.length} rows are missing Name or Email and will be skipped.`,
                        variant: "destructive"
                    });
                }

                const res = await axios.post(`${serverURL}/api/org/student/bulk-upload`, {
                    students: studentsData,
                    organizationId: orgId
                });

                if (res.data.success) {
                    toast({
                        title: "Success",
                        description: `Successfully added ${res.data.addedCount || studentsData.length} students.`
                    });
                    setIsBulkUploadOpen(false);
                    fetchStudents();
                    fetchStats();
                } else {
                    toast({ title: "Error", description: res.data.message, variant: "destructive" });
                }
            } catch (error) {
                console.error("Bulk upload error:", error);
                toast({ 
                    title: "Error", 
                    description: "Failed to process the Excel file", 
                    variant: "destructive" 
                });
            } finally {
                setIsUploading(false);
                e.target.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // Update student
    const handleUpdateStudent = async () => {
        if (!editStudent) return;
        try {
            const trimmedPassword = editStudent.password?.trim() || '';
            const res = await axios.put(`${serverURL}/api/org/student/${editStudent._id}`, {
                name: editStudent.mName,
                email: editStudent.email,
                department: editStudent.studentDetails?.department || editStudent.studentDetails?.departmentId,
                section: editStudent.studentDetails?.section,
                rollNo: editStudent.studentDetails?.rollNo,
                studentClass: editStudent.studentDetails?.studentClass,
                academicYear: editStudent.studentDetails?.academicYear,
                ...(trimmedPassword ? { password: trimmedPassword } : {}),
            });
            if (res.data.success) {
                toast({ title: "Success", description: "Student updated successfully" });
                setEditDialogOpen(false);
                setEditStudent(null);
                fetchStudents();
            } else {
                toast({ title: "Error", description: res.data.message, variant: "destructive" });
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: e.response?.data?.message || "Request failed", variant: "destructive" });
        }
    };

    // Update placement
    const handleUpdatePlacement = async () => {
        if (!placementStudent) return;
        try {
            const res = await axios.put(`${serverURL}/api/org/student/${placementStudent._id}`, {
                placementCompany: placementStudent.studentDetails?.placementCompany,
                placementPosition: placementStudent.studentDetails?.placementPosition,
                isPlacementClosed: placementStudent.studentDetails?.isPlacementClosed,
            });
            if (res.data.success) {
                toast({ title: "Success", description: "Placement details updated" });
                setPlacementStudent(null);
                fetchStudents();
            } else {
                toast({ title: "Error", description: res.data.message, variant: "destructive" });
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: e.response?.data?.message || "Request failed", variant: "destructive" });
        }
    };

    // Delete student


const handleDeleteStudent = async (studentId: string) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This student will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#0ea5e9", // blue
    cancelButtonColor: "#64748b",  // gray
    confirmButtonText: "Yes, delete",
    cancelButtonText: "No, cancel",
    reverseButtons: true
  });

  if (!result.isConfirmed) return;

  try {
    const res = await axios.delete(`${serverURL}/api/org/student/${studentId}`);

    if (res.data.success) {
      Swal.fire({
        title: "Deleted!",
        text: "Student deleted successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

      fetchStudents();
      fetchStats();
    } else {
      Swal.fire("Error", res.data.message, "error");
    }

  } catch (e: any) {
    console.error(e);
    Swal.fire(
      "Error",
      e.response?.data?.message || "Request failed",
      "error"
    );
  }
};
    
    // Send Individual Notification
    const handleSendNotification = async () => {
        if (!notifyStudent || !notificationMessage.trim()) {
            toast({ title: "Error", description: "Please enter a message", variant: "destructive" });
            return;
        }
        try {
            setIsSendingNotification(true);
            const res = await axios.post(`${serverURL}/api/notifications/send-individual`, {
                userId: notifyStudent._id,
                message: notificationMessage.trim()
            });
            if (res.data.success) {
                toast({ title: "Success", description: "Notification sent successfully" });
                setNotifyStudent(null);
                setNotificationMessage('');
            } else {
                toast({ title: "Error", description: res.data.message, variant: "destructive" });
            }
        } catch (e: any) {
            console.error(e);
            toast({ title: "Error", description: e.response?.data?.message || "Failed to send notification", variant: "destructive" });
        } finally {
            setIsSendingNotification(false);
        }
    };

    // Download Excel template
    const downloadTemplate = () => {
      const template = [
  ['Name', 'Email', 'Password', 'Department', 'Section', 'Class', 'Roll No', 'Academic Year'],
  ['John Doe', 'john@example.com', 'Student@123', 'Computer Science', 'A', 'BSc CS', '001', '2023-2024'],
  ['Jane Smith', 'jane@example.com', 'Student@123', 'Computer Science', 'A', 'BSc CS', '002', '2023-2024']
];
        
        const ws = XLSX.utils.aoa_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Students');
        XLSX.writeFile(wb, 'student_bulk_upload_template.xlsx');
    };

    // Get unique classes from students
    const uniqueClasses = [...new Set(students.map((s: any) => s.studentDetails?.studentClass).filter(Boolean))];
    
    // Filter students
    const filteredStudents = students.filter((student: any) => {
        const studentDeptId = getDepartmentId(student);
        const matchesSearch = (student.mName || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
                             (student.email || '').toLowerCase().includes(studentSearch.toLowerCase());
        const matchesDept = selectedDepartment === 'all' || studentDeptId === selectedDepartment;
        const matchesClass = selectedClass === 'all' || student.studentDetails?.studentClass === selectedClass;
        return matchesSearch && matchesDept && matchesClass;
    });

    const totalPages = Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage));
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * studentsPerPage,
        currentPage * studentsPerPage
    );
    const paginationStart = filteredStudents.length === 0 ? 0 : (currentPage - 1) * studentsPerPage + 1;
    const paginationEnd = Math.min(currentPage * studentsPerPage, filteredStudents.length);
    const visiblePageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
        if (totalPages <= 5) return true;
        return Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
    });

    const isDeptAdmin = role === 'dept_admin';

    // Calculate stats for the current department/org cohort
    const visibleStudentCount = isDeptAdmin ? students.length : stats.studentCount;
    const visibleStudentLimit = stats.studentLimit || 0;
    const placedCount = students.filter((s: any) => s.studentDetails?.isPlacementClosed).length;
    const placementRate = visibleStudentCount > 0 ? ((placedCount / visibleStudentCount) * 100).toFixed(1) : 0;
    const utilizationRate = visibleStudentLimit > 0 ? (visibleStudentCount / visibleStudentLimit) * 100 : 0;
    const remainingSlots = Math.max(0, visibleStudentLimit - visibleStudentCount);
    const totalPlacedCount = isDeptAdmin ? placedCount : (placedCount || placedCount);
    const totalPlacementRate = visibleStudentCount > 0 ? ((totalPlacedCount / visibleStudentCount) * 100).toFixed(1) : 0;

    useEffect(() => {
        setCurrentPage(1);
    }, [studentSearch, selectedDepartment, selectedClass, viewMode]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        if (!orgId) {
            console.warn('No organization ID found.');
            return;
        }
        fetchStats();
        fetchStudents();
        fetchOrgDepartments();
        fetchModuleSettings();
        fetchOrgDetails();
    }, [orgId]);

    useEffect(() => {
        if (role === 'dept_admin' && deptId) {
            fetchStats();
            fetchStudents();
            setSelectedDepartment(deptId);
        }
    }, [deptId, role]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen "
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Page Header */}
                <div className="students-theme-hero relative overflow-hidden rounded-2xl p-6 mb-6 lg:mb-8 text-white shadow-lg">
                    <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="students-theme-hero-icon rounded-xl p-2 backdrop-blur-sm">
                                <UsersRound className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                                    Student Management
                                </h1>
                                <p className="students-theme-hero-subtitle text-sm sm:text-base mt-1">
                                    Manage student accounts, track placements, and monitor academic progress
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                     <Badge variant="outline" className="students-theme-hero-badge px-3 py-2 text-sm text-white">
    <UsersRound className="w-4 h-4 mr-2" />
    {visibleStudentCount} Active
</Badge>
<Badge variant="outline" className="students-theme-hero-badge px-3 py-2 text-sm text-white">
    <PieChart className="w-4 h-4 mr-2" />
    {placementRate}% Placed
</Badge>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - Responsive Grid */}
             {/* Stats Cards - Equal Height with Laptop Optimization */}
<motion.div 
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className={`grid grid-cols-1 sm:grid-cols-2 ${isDeptAdmin ? 'xl:grid-cols-3' : 'xl:grid-cols-4'} gap-4 md:gap-5 lg:gap-6 mb-6 md:mb-8`}
>
    {/* Total Students Card */}
    <motion.div variants={itemVariants} className="h-full">
        <Card className={`bg-gradient-to-br ${accentGradient} text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full`}>
            <CardContent className="p-4 md:p-5 lg:p-6 flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className="flex-1">
                            <p className="text-cyan-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Total Students</p>
                            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 lg:mt-2">{visibleStudentCount}</p>
                            <p className="text-[10px] sm:text-xs text-cyan-100 mt-1 lg:mt-2">Capacity: {visibleStudentLimit} students</p>
                        </div>
                        <div className="bg-white/15 rounded-xl p-2 md:p-2.5 lg:p-3 backdrop-blur-sm">
                            <Users className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                        </div>
                    </div>
                    
                    {/* Stats Row */}
                    <div className="flex justify-between items-baseline mb-3">
                        <span className="text-cyan-100 text-[10px] sm:text-xs">Utilization</span>
                        <span className="text-white text-sm sm:text-base font-semibold">
                            {utilizationRate.toFixed(1)}%
                        </span>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div>
                    <div className="bg-white/20 rounded-full h-2">
                        <div 
                            className="bg-white rounded-full h-2 transition-all duration-500"
                            style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>

    {/* Placed Students Card */}
    <motion.div variants={itemVariants} className="h-full">
        <Card className={`bg-gradient-to-br ${accentGradient} text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full`}>
            
            <CardContent className="p-4 md:p-5 lg:p-6 flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className="flex-1">
                            <p className="text-cyan-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Placed Students</p>
                            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 lg:mt-2">{totalPlacedCount}</p>
                            <p className="text-[10px] sm:text-xs text-cyan-100 mt-1 lg:mt-2">Placement Rate: {totalPlacementRate}%</p>
                        </div>
                        <div className="bg-white/15 rounded-xl p-2 md:p-2.5 lg:p-3 backdrop-blur-sm">
                            <Award className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                        </div>
                    </div>
                    
                    {/* Stats Row */}
                    <div className="flex justify-between items-baseline mb-3">
                        <span className="text-cyan-100 text-[10px] sm:text-xs">Success Rate</span>
                        <span className="text-white text-sm sm:text-base font-semibold">{totalPlacementRate}%</span>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div>
                    <div className="bg-white/20 rounded-full h-2">
                        <div 
                            className="bg-white rounded-full h-2 transition-all duration-500"
                            style={{ width: `${Math.min(Number(totalPlacementRate) || 0, 100)}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>

    {!isDeptAdmin && (
    <>
    <motion.div variants={itemVariants} className="h-full">
        <Card className={`bg-gradient-to-br ${accentGradient} text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full`}>
            <CardContent className="p-4 md:p-5 lg:p-6 flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className="flex-1">
                            <p className="text-cyan-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Departments</p>
                            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 lg:mt-2">{departmentsList.length}</p>
                            <p className="text-[10px] sm:text-xs text-cyan-100 mt-1 lg:mt-2">Active Departments</p>
                        </div>
                        <div className="bg-white/15 rounded-xl p-2 md:p-2.5 lg:p-3 backdrop-blur-sm">
                            <BookOpen className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-baseline mb-3">
                        <span className="text-cyan-100 text-[10px] sm:text-xs">Distribution</span>
                        <span className="text-white text-sm sm:text-base font-semibold">{departmentsList.length} Total</span>
                    </div>
                </div>
                
                <div className="flex gap-1">
                    {departmentsList.slice(0, 5).map((_, idx) => (
                        <div key={idx} className="flex-1 bg-white/20 rounded-full h-2">
                            <div className="bg-white rounded-full h-2 w-full" />
                        </div>
                    ))}
                    {departmentsList.length > 5 && (
                        <div className="flex-1 bg-white/20 rounded-full h-2 relative group">
                            <div className="bg-white/40 rounded-full h-2 w-full" />
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white text-[#11405f] text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                +{departmentsList.length - 5} more
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    </motion.div>
    </>
    )}

    {/* Capacity Used Card */}
    <motion.div variants={itemVariants} className="h-full">
        <Card className={`bg-gradient-to-br ${accentGradient} text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full`}>
            <CardContent className="p-4 md:p-5 lg:p-6 flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className="flex-1">
                            <p className="text-cyan-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Capacity Used</p>
                            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 lg:mt-2">
                                {visibleStudentLimit > 0 ? utilizationRate.toFixed(1) : 0}%
                            </p>
                            <p className="text-[10px] sm:text-xs text-cyan-100 mt-1 lg:mt-2">
                                {visibleStudentCount} of {visibleStudentLimit} students
                            </p>
                        </div>
                        <div className="bg-white/15 rounded-xl p-2 md:p-2.5 lg:p-3 backdrop-blur-sm">
                            <TrendingUp className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                        </div>
                    </div>
                    
                    {/* Stats Row */}
                    <div className="flex justify-between items-baseline mb-3">
                        <span className="text-cyan-100 text-[10px] sm:text-xs">Available Slots</span>
                        <span className="text-white text-sm sm:text-base font-semibold">{remainingSlots} left</span>
                    </div>
                </div>
                
                {/* Capacity Progress Bar */}
                <div>
                    <div className="bg-white/20 rounded-full h-2">
                        <div 
                            className="bg-white rounded-full h-2 transition-all duration-500"
                            style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>
</motion.div>

                {/* Main Card */}
<Card className="students-theme-surface overflow-hidden">
  <CardHeader className="students-theme-surface-header p-3 sm:p-4 md:p-6 border-b">
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div className="flex-1">
        <CardTitle className="students-theme-title text-lg sm:text-xl md:text-2xl">Student Directory</CardTitle>
        <CardDescription className="students-theme-description text-xs sm:text-sm">View and manage all student records</CardDescription>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
        <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto justify-center gap-2 text-sm font-medium border-[#11a5e4] text-[#11405f] hover:bg-[#11a5e4] hover:text-white transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Bulk Upload
            </Button>
          </DialogTrigger>
          <DialogContent className="students-theme-dialog max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="students-theme-title text-lg">Bulk Upload Students</DialogTitle>
              <DialogDescription className="students-theme-description text-xs sm:text-sm">
                Upload an Excel file with student details. Download the template to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button variant="outline" onClick={downloadTemplate} className="students-theme-outline-btn gap-2">
                <Download className="w-4 h-4" />
                Download Template
              </Button>
              <div className="students-theme-dropzone border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleBulkUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="bulk-upload-input"
                />
                <label
                  htmlFor="bulk-upload-input"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 mb-2 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-muted-foreground" />
                  )}
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {isUploading ? 'Uploading...' : 'Click to upload Excel file'}
                  </span>
                </label>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog
          open={openStudentDialog}
          onOpenChange={(open) => {
            setOpenStudentDialog(open);
            if (open) {
              setIsAddingStudent(false);
              setNewStudentErrors({
                name: '',
                email: '',
                password: '',
                department: ''
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="w-full sm:w-auto justify-center gap-2 text-sm font-medium bg-gradient-to-r from-[#11405f] to-[#11a5e4] text-white hover:opacity-90 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="students-theme-dialog max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle className="students-theme-title text-lg">Add New Student</DialogTitle>
              <DialogDescription className="students-theme-description text-xs sm:text-sm">
                Fill in the details to add a new student to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <Input 
                    className="students-theme-input pl-8 sm:pl-9 text-sm"
                    value={newStudent.name} 
                    onChange={(e) => {
                      setNewStudent({ ...newStudent, name: e.target.value });
                      if (newStudentErrors.name) {
                        setNewStudentErrors({ ...newStudentErrors, name: '' });
                      }
                    }} 
                    placeholder="Enter full name"
                  />
                </div>
                {newStudentErrors.name ? (
                  <p className="text-xs text-red-600">{newStudentErrors.name}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Email *</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <Input 
                    type="email"
                    className="students-theme-input pl-8 sm:pl-9 text-sm"
                    value={newStudent.email} 
                    onChange={(e) => {
                      setNewStudent({ ...newStudent, email: e.target.value });
                      if (newStudentErrors.email) {
                        setNewStudentErrors({ ...newStudentErrors, email: '' });
                      }
                    }} 
                    placeholder="student@example.com"
                  />
                </div>
                {newStudentErrors.email ? (
                  <p className="text-xs text-red-600">{newStudentErrors.email}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <Input 
                    type="password"
                    className="students-theme-input pl-8 sm:pl-9 text-sm"
                    value={newStudent.password} 
                    onChange={(e) => {
                      setNewStudent({ ...newStudent, password: e.target.value });
                      if (newStudentErrors.password) {
                        setNewStudentErrors({ ...newStudentErrors, password: '' });
                      }
                    }} 
                    placeholder="Enter password"
                  />
                </div>
                {newStudentErrors.password ? (
                  <p className="text-xs text-red-600">{newStudentErrors.password}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Department</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <select
                    className="students-theme-select w-full pl-8 sm:pl-9 pr-3 py-2 text-sm"
                    value={newStudent.department}
                    onChange={(e) => {
                      setNewStudent({ ...newStudent, department: e.target.value });
                      if (newStudentErrors.department) {
                        setNewStudentErrors({ ...newStudentErrors, department: '' });
                      }
                    }}
                    disabled={role === 'dept_admin'}
                  >
                    <option value="">Select Department</option>
                    {departmentsList.map((d: any) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                {role === 'dept_admin' && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    Department is set to your assigned department
                  </p>
                )}
                {newStudentErrors.department ? (
                  <p className="text-xs text-red-600">{newStudentErrors.department}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Class</Label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <Input 
                    className="students-theme-input pl-8 sm:pl-9 text-sm"
                    value={newStudent.studentClass} 
                    onChange={(e) => setNewStudent({ ...newStudent, studentClass: e.target.value })} 
                    placeholder="e.g., 10th, 12th"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Section</Label>
                <Input 
                  className="students-theme-input text-sm"
                  value={newStudent.section} 
                  onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })} 
                  placeholder="A, B, C"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Roll Number</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <Input 
                    className="students-theme-input pl-8 sm:pl-9 text-sm"
                    value={newStudent.rollNo} 
                    onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })} 
                    placeholder="Enter roll number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Academic Year</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <Input 
                    className="students-theme-input pl-8 sm:pl-9 text-sm"
                    value={newStudent.academicYear} 
                    onChange={(e) => setNewStudent({ ...newStudent, academicYear: e.target.value })} 
                    placeholder="2023-2024"
                  />
                </div>
              </div>
            </div>
            <Button onClick={handleAddStudent} disabled={isAddingStudent} className={`w-full bg-gradient-to-r ${accentGradient} text-white hover:opacity-95`}>
              {isAddingStudent ? 'Adding...' : 'Add Student'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </CardHeader>
  
  <CardContent className="p-0">
    <div className="flex flex-col lg:flex-row">
      {/* LEFT SIDEBAR - FILTERS */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-gray-50/40">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm sm:text-base text-[#11405f] flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h3>
            {(selectedDepartment !== 'all' || selectedClass !== 'all' || studentSearch) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStudentSearch('');
                  setSelectedDepartment('all');
                  setSelectedClass('all');
                }}
                className="text-xs text-[#11a5e4] hover:text-[#11405f] h-auto p-0"
              >
                Clear all
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-700">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  className="students-theme-input pl-9 text-sm bg-white"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
            </div>
            
            {/* Department Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-700">Department</Label>
              <select
                className="students-theme-select w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:border-[#11a5e4] focus:ring-1 focus:ring-[#11a5e4]"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                disabled={role === 'dept_admin'}
              >
                <option value="all">All Departments</option>
                {departmentsList.map((d: any) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            
            {/* Class Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-700">Class</Label>
              <select
                className="students-theme-select w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:border-[#11a5e4] focus:ring-1 focus:ring-[#11a5e4]"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="all">All Classes</option>
                {uniqueClasses.map((className: string) => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>

            {/* Active Filters Display */}
            {(selectedDepartment !== 'all' || selectedClass !== 'all' || studentSearch) && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-2">Active filters:</p>
                <div className="flex flex-wrap gap-1.5">
                  {studentSearch && (
                    <Badge variant="secondary" className="text-xs bg-[#11a5e4]/10 text-[#11405f]">
                      Search: {studentSearch}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" 
                        onClick={() => setStudentSearch('')}
                      />
                    </Badge>
                  )}
                  {selectedDepartment !== 'all' && (
                    <Badge variant="secondary" className="text-xs bg-[#11a5e4]/10 text-[#11405f]">
                      Dept: {departmentsList.find(d => d._id === selectedDepartment)?.name}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" 
                        onClick={() => setSelectedDepartment('all')}
                      />
                    </Badge>
                  )}
                  {selectedClass !== 'all' && (
                    <Badge variant="secondary" className="text-xs bg-[#11a5e4]/10 text-[#11405f]">
                      Class: {selectedClass}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" 
                        onClick={() => setSelectedClass('all')}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT - STUDENT LIST */}
      <div className="flex-1">
        <div className="p-4 sm:p-6">
          {/* View Toggle & Results Count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Found <span className="font-semibold text-[#11405f]">{filteredStudents.length}</span> students
              </p>
            </div>
            
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`h-8 px-3 ${viewMode === 'grid' ? 'bg-gradient-to-r from-[#11405f] to-[#11a5e4] text-white' : ''}`}
              >
                <LayoutGrid className="w-3.5 h-3.5 mr-1" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`h-8 px-3 ${viewMode === 'list' ? 'bg-gradient-to-r from-[#11405f] to-[#11a5e4] text-white' : ''}`}
              >
                <List className="w-3.5 h-3.5 mr-1" />
                List
              </Button>
            </div>
          </div>
          
          {/* Student List/Grid */}
          <AnimatePresence mode="wait">
            {filteredStudents.length > 0 ? (
              viewMode === 'grid' ? (
                <motion.div 
                  key="grid"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4"
                >
                  {paginatedStudents.map((student: any) => {
                    const studentDeptId = getDepartmentId(student);
                    const departmentName = getDepartmentName(studentDeptId);
                    
                    return (
                      <motion.div
                        key={student._id}
                        variants={cardVariants}
                        layout
                        whileHover={{ y: -4 }}
                        className="group"
                      >
                   <Card className="students-theme-student-card transition-all duration-300 cursor-pointer h-full">
  <CardContent className="p-3 sm:p-4">
    <div className="flex items-start justify-between mb-3 sm:mb-4">
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        {/* Avatar - Left Side */}
        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${primaryGradient} flex items-center justify-center text-white text-base sm:text-lg font-bold`}>
            {student.mName?.substring(0, 2).toUpperCase() || 'ST'}
          </div>
          {student.studentDetails?.isPlacementClosed && (
            <div className="absolute -top-1 -right-1">
              <Badge className="bg-[#11a5e4] text-white text-[10px] sm:text-xs">
                <Award className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                Placed
              </Badge>
            </div>
          )}
        </div>
        
        {/* mName - Right Side */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base truncate">{student.mName}</h3>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Button 
          variant="ghost" 
          size="sm"
          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
          onClick={() => {
            setEditStudent(prepareStudentForEdit(student));
            setEditDialogOpen(true);
          }}
        >
          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            setNotifyStudent(student);
          }}
          title="Send Notification"
        >
          <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
        </Button>
        {digitalIdModuleEnabled && (
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIdCardStudent(student);
            }}
            title="View Digital ID"
          >
            <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
          onClick={() => handleDeleteStudent(student._id)}
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
        </Button>
      </div>
    </div>
    
    <div className="space-y-1 sm:space-y-2">
      <p className="text-xs text-muted-foreground flex items-center gap-1 sm:gap-2 truncate">
        <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
        <span className="truncate text-[11px] sm:text-xs">{student.email}</span>
      </p>
      {departmentName && (
        <p className="text-[11px] sm:text-xs flex items-center gap-1 sm:gap-2">
          <Building className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          {departmentName}
        </p>
      )}
      {student.studentDetails?.studentClass && (
        <p className="text-[11px] sm:text-xs flex items-center gap-1 sm:gap-2">
          <GraduationCap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          Class {student.studentDetails.studentClass}
          {student.studentDetails?.section && ` - ${student.studentDetails.section}`}
        </p>
      )}
      {student.studentDetails?.placementCompany && (
        <div className="students-theme-card-divider mt-1 sm:mt-2 pt-1 sm:pt-2 border-t">
          <p className="text-[10px] sm:text-xs font-semibold text-[#11405f] flex items-center gap-1 truncate">
            <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
            <span className="truncate">
              {student.studentDetails.placementPosition || 'Placed'} @ {student.studentDetails.placementCompany}
            </span>
          </p>
        </div>
      )}
    </div>
    
    <div className="mt-3 sm:mt-4">
      <Button 
        variant="outline" 
        size="sm" 
        className="students-theme-outline-btn w-full text-[11px] sm:text-xs"
        onClick={() => setPlacementStudent(student)}
      >
        <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-2" />
        Update Placement
      </Button>
    </div>
  </CardContent>
</Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div 
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {paginatedStudents.map((student: any, index: number) => {
                    const studentDeptId = getDepartmentId(student);
                    const departmentName = getDepartmentName(studentDeptId);
                    
                    return (
                      <motion.div
                        key={student._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="students-theme-list-card p-3 sm:p-4 border rounded-lg hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full sm:w-auto">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${primaryGradient} flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0`}>
                              {student.mName?.substring(0, 2).toUpperCase() || 'ST'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                <p className="font-semibold text-sm sm:text-base truncate">{student.mName}</p>
                                {student.studentDetails?.isPlacementClosed && (
                                  <Badge className="bg-[#11a5e4] text-white text-[10px] sm:text-xs">
                                    Placed
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">{student.email}</p>
                              <div className="flex flex-wrap gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                                {departmentName && (
                                  <span>Dept: {departmentName}</span>
                                )}
                                {student.studentDetails?.studentClass && (
                                  <span>Class: {student.studentDetails.studentClass}</span>
                                )}
                                {student.studentDetails?.section && (
                                  <span>Section: {student.studentDetails.section}</span>
                                )}
                                {student.studentDetails?.rollNo && (
                                  <span>Roll: {student.studentDetails.rollNo}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 sm:gap-2 w-full sm:w-auto justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              onClick={() => {
                                setEditStudent(prepareStudentForEdit(student));
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              onClick={() => setPlacementStudent(student)}
                            >
                              <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              onClick={() => setNotifyStudent(student)}
                              title="Send Notification"
                            >
                              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                            </Button>
                            {digitalIdModuleEnabled && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                onClick={() => setSelectedIdCardStudent(student)}
                                title="View Digital ID"
                              >
                                <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              onClick={() => handleDeleteStudent(student._id)}
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <UserX className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No students found</h3>
                <p className="text-sm text-gray-500">Try adjusting your filters or add a new student</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Pagination */}
          {filteredStudents.length > 0 && (
            <div className="students-theme-pagination flex flex-col gap-3 border-t pt-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Showing {paginationStart}-{paginationEnd} of {filteredStudents.length} students
              </p>
              <div className="flex flex-col gap-2 xs:flex-row xs:items-center xs:justify-center sm:justify-end">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="students-theme-outline-btn min-w-[88px]"
                  >
                    Previous
                  </Button>
                  <span className="min-w-[96px] text-center text-xs sm:text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="students-theme-outline-btn min-w-[88px]"
                  >
                    Next
                  </Button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1">
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
                          className={currentPage === page
                            ? `h-8 min-w-[2rem] px-2 text-xs sm:text-sm bg-gradient-to-r ${accentGradient} text-white hover:opacity-95`
                            : `h-8 min-w-[2rem] px-2 text-xs sm:text-sm students-theme-outline-btn`}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </CardContent>
</Card>

                {/* Edit Student Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    if (!open) setEditStudent(null);
                }}>
                    <DialogContent className="students-theme-dialog max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                        <DialogHeader>
                            <DialogTitle className="students-theme-title flex items-center gap-2 text-lg">
                                <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                Edit Student Details
                            </DialogTitle>
                            <DialogDescription className="students-theme-description text-xs sm:text-sm">
                                Update the student's information below.
                            </DialogDescription>
                        </DialogHeader>
                        {editStudent && (
                            <div className="space-y-4 sm:space-y-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-xs sm:text-sm">
                                            <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                            Full Name
                                        </Label>
                                        <Input 
                                            className="students-theme-input text-sm"
                                            value={editStudent.mName || ''} 
                                            onChange={(e) => setEditStudent({ ...editStudent, mName: e.target.value })} 
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-xs sm:text-sm">
                                            <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                                            Email Address
                                        </Label>
                                        <Input 
                                            type="email"
                                            className="students-theme-input text-sm"
                                            value={editStudent.email || ''} 
                                            onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })} 
                                            placeholder="student@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-xs sm:text-sm">
                                            <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                                            Password
                                        </Label>
                                        <Input
                                            type="password"
                                            className="students-theme-input text-sm"
                                            value={editStudent.password || ''}
                                            onChange={(e) => setEditStudent({ ...editStudent, password: e.target.value })}
                                            placeholder="Leave blank to keep current password"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-xs sm:text-sm">
                                            <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                                            Department
                                        </Label>
                                        <select
                                            className="students-theme-select w-full px-3 py-2"
                                            value={editStudent.studentDetails?.department || editStudent.studentDetails?.departmentId || ''}
                                            onChange={(e) => setEditStudent({ 
                                                ...editStudent, 
                                                studentDetails: { ...editStudent.studentDetails, department: e.target.value, departmentId: e.target.value } 
                                            })}
                                            disabled={role === 'dept_admin'}
                                        >
                                            <option value="">Select Department</option>
                                            {departmentsList.map((d: any) => (
                                                <option key={d._id} value={d._id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-xs sm:text-sm">
                                            <School className="w-3 h-3 sm:w-4 sm:h-4" />
                                            Class
                                        </Label>
                                        <Input 
                                            className="students-theme-input text-sm"
                                            value={editStudent.studentDetails?.studentClass || ''} 
                                            onChange={(e) => setEditStudent({ 
                                                ...editStudent, 
                                                studentDetails: { ...editStudent.studentDetails, studentClass: e.target.value } 
                                            })} 
                                            placeholder="e.g., 10th, 12th"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-xs sm:text-sm">
                                            Section
                                        </Label>
                                        <Input 
                                            className="students-theme-input text-sm"
                                            value={editStudent.studentDetails?.section || ''} 
                                            onChange={(e) => setEditStudent({ 
                                                ...editStudent, 
                                                studentDetails: { ...editStudent.studentDetails, section: e.target.value } 
                                            })} 
                                            placeholder="A, B, C"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-xs sm:text-sm">
                                            <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
                                            Roll Number
                                        </Label>
                                        <Input 
                                            className="students-theme-input text-sm"
                                            value={editStudent.studentDetails?.rollNo || ''} 
                                            onChange={(e) => setEditStudent({ 
                                                ...editStudent, 
                                                studentDetails: { ...editStudent.studentDetails, rollNo: e.target.value } 
                                            })} 
                                            placeholder="Enter roll number"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-xs sm:text-sm">
                                            <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                            Academic Year
                                        </Label>
                                        <Input 
                                            className="students-theme-input text-sm"
                                            value={editStudent.studentDetails?.academicYear || ''} 
                                            onChange={(e) => setEditStudent({ 
                                                ...editStudent, 
                                                studentDetails: { ...editStudent.studentDetails, academicYear: e.target.value } 
                                            })} 
                                            placeholder="2023-2024"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 pt-4">
                                    <Button onClick={handleUpdateStudent} className={`flex-1 gap-2 text-sm bg-gradient-to-r ${accentGradient} text-white hover:opacity-95`}>
                                        <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                                        Save Changes
                                    </Button>
                                    <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="students-theme-outline-btn gap-2 text-sm">
                                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Placement Dialog */}
                <Dialog open={!!placementStudent} onOpenChange={() => setPlacementStudent(null)}>
                    <DialogContent className="students-theme-dialog mx-4">
                        <DialogHeader>
                            <DialogTitle className="students-theme-title text-lg">Update Placement Details</DialogTitle>
                            <DialogDescription className="students-theme-description text-xs sm:text-sm">
                                Enter placement information for {placementStudent?.mName}
                            </DialogDescription>
                        </DialogHeader>
                        {placementStudent && (
                            <div className="space-y-3 sm:space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="text-xs sm:text-sm">Company Name</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                                        <Input 
                                            className="students-theme-input pl-8 sm:pl-9 text-sm"
                                            value={placementStudent.studentDetails?.placementCompany || ''} 
                                            onChange={(e) => setPlacementStudent({ 
                                                ...placementStudent, 
                                                studentDetails: { ...placementStudent.studentDetails, placementCompany: e.target.value } 
                                            })} 
                                            placeholder="e.g., Google, Microsoft"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs sm:text-sm">Position/Role</Label>
                                    <Input 
                                        className="students-theme-input text-sm"
                                        value={placementStudent.studentDetails?.placementPosition || ''} 
                                        onChange={(e) => setPlacementStudent({ 
                                            ...placementStudent, 
                                            studentDetails: { ...placementStudent.studentDetails, placementPosition: e.target.value } 
                                        })} 
                                        placeholder="e.g., Software Engineer"
                                    />
                                </div>
                                <div className="students-theme-checkbox flex items-center gap-2 p-2 sm:p-3 rounded-lg border">
                                    <input
                                        type="checkbox"
                                        id="placementClosed"
                                        className="w-3 h-3 sm:w-4 sm:h-4"
                                        checked={placementStudent.studentDetails?.isPlacementClosed || false}
                                        onChange={(e) => setPlacementStudent({ 
                                            ...placementStudent, 
                                            studentDetails: { ...placementStudent.studentDetails, isPlacementClosed: e.target.checked } 
                                        })}
                                    />
                                    <Label htmlFor="placementClosed" className="cursor-pointer text-xs sm:text-sm">
                                        Placement Confirmed
                                    </Label>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button onClick={handleUpdatePlacement} className={`flex-1 gap-2 text-sm bg-gradient-to-r ${accentGradient} text-white hover:opacity-95`}>
                                        <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                                        Save Placement
                                    </Button>
                                    <Button variant="outline" onClick={() => setPlacementStudent(null)} className="students-theme-outline-btn gap-2 text-sm">
                                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Send Notification Dialog */}
                <Dialog open={!!notifyStudent} onOpenChange={() => {
                    setNotifyStudent(null);
                    setNotificationMessage('');
                }}>
                    <DialogContent className="students-theme-dialog mx-4">
                        <DialogHeader>
                            <DialogTitle className="students-theme-title flex items-center gap-2 text-lg">
                                <MessageSquare className="w-4 h-4 text-emerald-500" />
                                Send Message to {notifyStudent?.mName}
                            </DialogTitle>
                            <DialogDescription className="students-theme-description text-xs sm:text-sm">
                                The student will receive this notification in their portal.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-xs sm:text-sm">Message Content</Label>
                                <textarea
                                    className="students-theme-textarea min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Type your message here..."
                                    value={notificationMessage}
                                    onChange={(e) => setNotificationMessage(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button 
                                    onClick={handleSendNotification} 
                                    disabled={isSendingNotification}
                                    className={`flex-1 gap-2 text-sm bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-95`}
                                >
                                    {isSendingNotification ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3 h-3 sm:w-4 sm:h-4" />}
                                    Send Notification
                                </Button>
                                <Button variant="outline" onClick={() => setNotifyStudent(null)} className="students-theme-outline-btn gap-2 text-sm">
                                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                <Dialog open={!!selectedIdCardStudent} onOpenChange={(open) => !open && setSelectedIdCardStudent(null)}>
                    <DialogContent className="max-w-md p-0 bg-transparent border-none shadow-none">
                        <div className="relative">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-2 top-2 z-50 text-white/50 hover:text-white"
                                onClick={() => setSelectedIdCardStudent(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            {selectedIdCardStudent && (
                                <DigitalIDCard 
                                    student={selectedIdCardStudent} 
                                    organization={fullOrgData ? {
                                        name: fullOrgData.organizationDetails?.institutionName || fullOrgData.mName,
                                        logo: fullOrgData.logo
                                    } : undefined}
                                />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </motion.div>
    );
};

export default StudentsTab;
