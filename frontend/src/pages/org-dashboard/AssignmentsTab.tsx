import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Bell, Plus, Upload, Search, Trash2, DollarSign, CheckCircle, RotateCcw, BarChart, Sparkles, ChevronDown, ChevronUp, Check, X, Clock, Video, Briefcase, Download, ExternalLink, Eye, TrendingUp, Award, Shield, Camera, Mic, AlertTriangle, BookOpen, FileQuestion, Calendar, CheckCircle2, ArrowUpCircle, GraduationCap, FolderOpen, MessageSquare, Star, Zap, Menu, XCircle, Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import SEO from '@/components/SEO';
import * as XLSX from 'xlsx';
import RichTextEditor from '@/components/RichTextEditor';
import AdminStatCard from "@/components/admin/AdminStatCard";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Swal from 'sweetalert2';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const themeStyles = {
  hero: 'bg-brand-gradient text-primary-foreground',
  statCard: 'border border-border bg-card',
  primaryButton: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all duration-300',
  primaryBadge: 'bg-primary text-primary-foreground',
  brandHover: 'hover:border-primary/40 hover:text-primary transition-colors',
  brandGhost: 'hover:bg-primary/10 hover:text-primary transition-colors',
  focusRing: 'focus:ring-ring focus:border-ring',
  select: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
};

const defaultQuizSettings = {
    examMode: true,
    quizMode: 'secure',
    attemptLimit: 2,
    cooldownMinutes: 60,
    passPercentage: 50,
    questionCount: 10,
    difficultyMode: 'mixed',
    shuffleQuestions: true,
    shuffleOptions: true,
    reviewMode: 'after_submit_with_answers',
    positiveMarkPerCorrect: 1,
    negativeMarkingEnabled: false,
    negativeMarkPerWrong: 0.25,
    sectionPatternEnabled: false,
    sections: {
        easy: 0,
        medium: 0,
        difficult: 0
    },
    proctoring: {
        requireCamera: true,
        requireMicrophone: true,
        detectFullscreenExit: true,
        detectTabSwitch: true,
        detectCopyPaste: true,
        detectContextMenu: true,
        detectNoise: true
    }
};

const createEmptyQuiz = () => ({
    question: '',
    options: ['', '', '', ''],
    answer: '',
    explanation: '',
    difficulty: 'medium'
});

const createEmptyCourse = () => ({
    title: '',
    description: '',
    department: '',
    topics: [],
    quizzes: [],
    quizSettings: { ...defaultQuizSettings, proctoring: { ...defaultQuizSettings.proctoring } }
});

const AssignmentsTab = () => {
    const [openDeptDialog, setOpenDeptDialog] = useState(false);
    const [openDeptAdminDialog, setOpenDeptAdminDialog] = useState(false);
    const [openStudentDialog, setOpenStudentDialog] = useState(false);
    const [openCourseDialog, setOpenCourseDialog] = useState(false);
    const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
    const [openMaterialDialog, setOpenMaterialDialog] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const role = sessionStorage.getItem('role');
    const deptId = sessionStorage.getItem('deptId');
    const activeTab = searchParams.get('tab') || (role === 'dept_admin' ? 'courses' : 'students');
    const { toast } = useToast();
    const [stats, setStats] = useState<{ studentCount: number; studentLimit: number; assignmentCount: number; submissionCount: number; placedCount: number }>({ studentCount: 0, studentLimit: 50, assignmentCount: 0, submissionCount: 0, placedCount: 0 });
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [assignmentSubmissionStats, setAssignmentSubmissionStats] = useState<Record<string, { total: number; graded: number; pending: number; resubmit: number }>>({});
    const [assignmentStatsLoading, setAssignmentStatsLoading] = useState(false);
    const [assignmentDeskFilter, setAssignmentDeskFilter] = useState<'all' | 'review' | 'dueSoon' | 'overdue'>('all');
    const [notices, setNotices] = useState([]);
    const [courses, setCourses] = useState([]);
    const [previewProject, setPreviewProject] = useState<any>(null);
    const [userDeptName, setUserDeptName] = useState('');
    const [userDeptId, setUserDeptId] = useState(deptId || '');
    const getDeptScopedDepartment = () => (role === 'dept_admin' ? (userDeptId || deptId || '') : '');
    const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');
    
    // Responsive hooks
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', department: '', section: '', studentClass: '', rollNo: '', academicYear: '' });
    const [editStudent, setEditStudent] = useState<any>(null);
    const [placementStudent, setPlacementStudent] = useState<any>(null);
    const [newAssignment, setNewAssignment] = useState({ topic: '', description: '', dueDate: '', department: '' });
    const [editAssignment, setEditAssignment] = useState<any>(null);
    const [newNotice, setNewNotice] = useState({ title: '', content: '', audience: 'all', department: '' });
    const [newCourse, setNewCourse] = useState<any>(createEmptyCourse());
    const [editCourse, setEditCourse] = useState<any>(null);
    const [editAICourse, setEditAICourse] = useState<any>(null);
    const [previewCourse, setPreviewCourse] = useState<any>(null);
    const [orgSettings, setOrgSettings] = useState<any>(null);
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');
    const [courseSearch, setCourseSearch] = useState('');
    const [quizReportsMap, setQuizReportsMap] = useState<Record<string, any>>({});
    const [quizReportsLoading, setQuizReportsLoading] = useState(false);
    const [selectedQuizReport, setSelectedQuizReport] = useState<any>(null);
    const [openQuizReportDialog, setOpenQuizReportDialog] = useState(false);
    const [expandedQuizAttemptId, setExpandedQuizAttemptId] = useState('');
    const [openLimitIncreaseDialog, setOpenLimitIncreaseDialog] = useState(false);
    const [limitIncreaseData, setLimitIncreaseData] = useState({ requestedSlot: 1, requestedCustomLimit: 0 });
    const [openDeptCourseLimitDialog, setOpenDeptCourseLimitDialog] = useState(false);
    const [deptCourseLimitData, setDeptCourseLimitData] = useState({ requestedCourseLimit: 5 });
    const [deptLimitRequests, setDeptLimitRequests] = useState<any[]>([]);

    const [meetings, setMeetings] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [openMeetingDialog, setOpenMeetingDialog] = useState(false);
    const [openProjectDialog, setOpenProjectDialog] = useState(false);

    const [newMeeting, setNewMeeting] = useState({ title: '', link: '', platform: 'google-meet', date: '', time: '', department: getDeptScopedDepartment() });
    const [newProject, setNewProject] = useState({ title: '', description: '', type: 'Project', department: '', dueDate: '', guidance: '', subtopics: [] as string[], isAiGenerated: false });
    const [projectAiTopic, setProjectAiTopic] = useState('');
    const [isGeneratingProject, setIsGeneratingProject] = useState(false);

    const [departmentsList, setDepartmentsList] = useState<any[]>([]);
    const [deptAdmins, setDeptAdmins] = useState<any[]>([]);

    const [staffLoginLogs, setStaffLoginLogs] = useState<any[]>([]);
    const [staffLoginLoading, setStaffLoginLoading] = useState(false);
    const [newDept, setNewDept] = useState({ name: '', description: '' });
    const [newDeptAdmin, setNewDeptAdmin] = useState({ name: '', email: '', password: '', phone: '', departmentId: '', courseLimit: 0 });
    const [newMaterial, setNewMaterial] = useState({
        title: '',
        description: '',
        fileUrl: '',
        file: null,
        type: 'PDF',
        department: ''
    });

    const resetProjectForm = () => {
        setNewProject({
            title: '',
            description: '',
            type: 'Project',
            department: getDeptScopedDepartment(),
            dueDate: '',
            guidance: '',
            subtopics: [],
            isAiGenerated: false
        });
        setProjectAiTopic('');
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
    
    const getDepartmentLabel = (value: any) => {
        const normalizedValue = getDepartmentValue(value);
        if (!normalizedValue || normalizedValue === 'all') return '';
        return departmentsList.find((d: any) => d._id === normalizedValue || d.name === normalizedValue)?.name || normalizedValue;
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
        fetchMeetings();
        fetchProjects();
        fetchMaterials();
        fetchOrgDepartments();
        fetchOrgDeptAdmins();
        fetchNotices();
        fetchDeptLimitRequests();
    }, [orgId]);

    useEffect(() => {
        if (role === 'dept_admin' && (userDeptName || deptId)) {
            fetchStats();
            fetchStudents();
            fetchCourses();
            fetchAssignments();
            fetchMeetings();
            fetchProjects();
            fetchMaterials();
            fetchNotices();
            fetchDeptLimitRequests();
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

    useEffect(() => {
        if (role === 'dept_admin' && (userDeptId || deptId)) {
            const targetId = getDeptScopedDepartment();
            setNewAssignment(prev => ({ ...prev, department: targetId }));
            setNewMeeting(prev => ({ ...prev, department: targetId }));
            setNewProject(prev => ({ ...prev, department: targetId }));
            setNewMaterial(prev => ({ ...prev, department: targetId }));
            setNewNotice(prev => ({ ...prev, department: targetId }));
            setNewCourse(prev => ({ ...prev, department: targetId }));
            setNewStudent(prev => ({ ...prev, department: targetId }));
        }
    }, [userDeptId, deptId, role]);

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

    const fetchMeetings = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/meetings?organizationId=${orgId}`);
            if (res.data.success) {
                let meetingsData = res.data.meetings;
                if (role === 'dept_admin') {
                    meetingsData = meetingsData.filter((m: any) => matchesCurrentDepartment(m.department, m.departmentId));
                }
                setMeetings(meetingsData);
            }
        } catch (e) {
            console.error("Failed to fetch meetings", e);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/projects?organizationId=${orgId}`);
            if (res.data.success) {
                let projectsData = res.data.projects;
                if (role === 'dept_admin') {
                    projectsData = projectsData.filter((p: any) => matchesCurrentDepartment(p.department, p.departmentId));
                }
                setProjects(projectsData);
            }
        } catch (e) {
            console.error("Failed to fetch projects", e);
        }
    };

    const fetchMaterials = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/materials?organizationId=${orgId}`);
            if (res.data.success) {
                let materialsData = res.data.materials;
                if (role === 'dept_admin') {
                    materialsData = materialsData.filter((m: any) => matchesCurrentDepartment(m.department, m.departmentId));
                }
                setMaterials(materialsData);
            }
        } catch (e) {
            console.error("Failed to fetch materials", e);
        }
    };

    const fetchDeptLimitRequests = async () => {
        try {
            const endpoint = role === 'dept_admin' 
                ? `${serverURL}/api/org/dept-admin/course-limit/requests?organizationId=${orgId}&deptAdminId=${sessionStorage.getItem('uid')}`
                : `${serverURL}/api/org/dept-admin/course-limit/requests?organizationId=${orgId}`;
            const res = await axios.get(endpoint);
            if (res.data.success) {
                setDeptLimitRequests(res.data.requests);
            }
        } catch (e) {
            console.error("Failed to fetch dept limit requests", e);
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

    const handleViewSubmissions = (assignment: any) => {
        navigate(`/dashboard/org/assignment/${assignment._id}/submissions`);
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
    }

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
    }

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
                void fetchQuizReports(coursesData.map((c: any) => String(c._id)));
            }
        } catch (e) {
            console.error(e);
        }
    }

    const fetchStaffLoginActivity = async () => {
        if (role !== 'org_admin') return;
        if (!orgId) return;
        const requesterId = sessionStorage.getItem('uid') || '';
        if (!requesterId) return;

        setStaffLoginLoading(true);
        try {
            const res = await axios.get(`${serverURL}/api/org/staff/activity?organizationId=${orgId}&requesterId=${requesterId}&limit=200`);
            if (res.data?.success) {
                setStaffLoginLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
            }
        } catch (e) {
            console.error('Failed to fetch staff login activity', e);
        } finally {
            setStaffLoginLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'activity' && role === 'org_admin') {
            fetchStaffLoginActivity();
        }
    }, [activeTab, orgId, role]);

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
                    assignments.map(async (assignment: any) => {
                        try {
                            const res = await axios.get(`${serverURL}/api/org/assignment/${assignment._id}/submissions`);
                            const submissions = Array.isArray(res.data?.submissions) ? res.data.submissions : [];
                            const graded = submissions.filter((submission: any) => submission.status === 'graded').length;
                            const resubmit = submissions.filter((submission: any) => submission.status === 'resubmit_required').length;
                            const pending = submissions.length - graded - resubmit;

                            return [
                                assignment._id,
                                {
                                    total: submissions.length,
                                    graded,
                                    pending,
                                    resubmit,
                                }
                            ] as const;
                        } catch (error) {
                            console.error(`Failed to fetch submissions for assignment ${assignment._id}`, error);
                            return [
                                assignment._id,
                                { total: 0, graded: 0, pending: 0, resubmit: 0 }
                            ] as const;
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

    const fetchQuizReports = async (courseIds?: string[]) => {
        if (!orgId) return;
        setQuizReportsLoading(true);
        try {
            const requesterId = sessionStorage.getItem('uid');
            if (!requesterId) return;
            const res = await axios.get(`${serverURL}/api/org-quiz/reports?organizationId=${orgId}&requesterId=${requesterId}`);
            if (res.data?.success) {
                const reports = Array.isArray(res.data.reports) ? res.data.reports : [];
                const filtered = Array.isArray(courseIds) && courseIds.length > 0
                    ? reports.filter((r: any) => courseIds.includes(String(r.courseId)))
                    : reports;
                const nextMap: Record<string, any> = {};
                filtered.forEach((r: any) => {
                    nextMap[String(r.courseId)] = r;
                });
                setQuizReportsMap(nextMap);
            }
        } catch (e) {
            console.error('Failed to fetch quiz reports', e);
        } finally {
            setQuizReportsLoading(false);
        }
    };

    const fetchNotices = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/notices?organizationId=${orgId}`);
            if (res.data.success) {
                let noticesData = res.data.notices;
                if (role === 'dept_admin') {
                    noticesData = noticesData.filter((n: any) => matchesCurrentDepartment(n.department, n.departmentId));
                }
                setNotices(noticesData);
            }
        } catch (e) {
            console.error('Failed to fetch notices:', e);
        }
    }

    const handleCreateAssignment = async () => {
        try {
            const assignmentData = {
                ...newAssignment,
                organizationId: orgId,
            };
            const res = await axios.post(`${serverURL}/api/org/assignment/create`, assignmentData);
            if (res.data.success) {
                toast({ title: 'Success', description: 'Assignment created successfully' });
                setNewAssignment({
                    topic: '',
                    description: '',
                    dueDate: '',
                    department: getDeptScopedDepartment()
                });
                fetchAssignments();
                setOpenAssignmentDialog(false);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to create assignment' });
        }
    };

    const handleUpdateAssignment = async () => {
        try {
            const assignmentData = {
                ...editAssignment,
                organizationId: orgId,
            };
            const res = await axios.put(`${serverURL}/api/org/assignment/${editAssignment._id}`, assignmentData);
            if (res.data.success) {
                toast({ title: 'Success', description: 'Assignment updated successfully' });
                setEditAssignment(null);
                fetchAssignments();
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update assignment' });
        }
    };



const handleDeleteAssignment = async (id: string) => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You won’t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'No, cancel',
        buttonsStyling: false,
        customClass: {
            confirmButton: 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 ml-2',
            cancelButton: 'inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
        },
    });

    if (!result.isConfirmed) return;

    try {
        const res = await axios.delete(`${serverURL}/api/org/assignment/${id}`);
        if (res.data.success) {
            Swal.fire('Deleted!', 'Assignment deleted successfully.', 'success');
            fetchAssignments();
        }
    } catch (error) {
        Swal.fire('Error!', 'Failed to delete assignment.', 'error');
    }
};

    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const meetingsTodayCount = meetings.filter((meeting: any) => {
        if (!meeting?.date) return false;
        return new Date(meeting.date).toISOString().slice(0, 10) === todayKey;
    }).length;
    const upcomingMeetingsCount = meetings.filter((meeting: any) => {
        if (!meeting?.date) return false;
        const meetingDateTime = new Date(`${meeting.date}T${meeting.time || '00:00'}`);
        return meetingDateTime >= now;
    }).length;
    const aiProjectCount = projects.filter((project: any) => Boolean(project?.isAiGenerated)).length;
    const dueSoonProjectsCount = projects.filter((project: any) => {
        if (!project?.dueDate) return false;
        const dueDate = new Date(project.dueDate);
        return dueDate >= now && dueDate.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000;
    }).length;
    const recentNoticesCount = notices.filter((notice: any) => {
        if (!notice?.createdAt) return false;
        return new Date(notice.createdAt) >= weekAgo;
    }).length;
    const orgWideNoticeCount = notices.filter((notice: any) => !notice?.department).length;
    const assignmentInsights = assignments.map((assignment: any) => {
        const dueDate = assignment?.dueDate ? new Date(assignment.dueDate) : null;
        const statsForAssignment = assignmentSubmissionStats[assignment._id] || { total: 0, graded: 0, pending: 0, resubmit: 0 };
        const isOverdue = Boolean(dueDate && dueDate < new Date(new Date().setHours(0, 0, 0, 0)));
        const isDueSoon = Boolean(
            dueDate &&
            dueDate >= now &&
            dueDate.getTime() - now.getTime() <= 3 * 24 * 60 * 60 * 1000
        );
        const needsReview = statsForAssignment.pending > 0 || statsForAssignment.resubmit > 0;

        return {
            assignment,
            stats: statsForAssignment,
            isOverdue,
            isDueSoon,
            needsReview,
        };
    });
    const overdueAssignments = assignmentInsights.filter((entry) => entry.isOverdue);
    const dueSoonAssignments = assignmentInsights.filter((entry) => entry.isDueSoon);
    const reviewAssignments = assignmentInsights.filter((entry) => entry.needsReview);
    const filteredAssignmentInsights =
        assignmentDeskFilter === 'review'
            ? reviewAssignments
            : assignmentDeskFilter === 'dueSoon'
            ? dueSoonAssignments
            : assignmentDeskFilter === 'overdue'
            ? overdueAssignments
            : assignmentInsights;

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'overdue':
                return 'bg-destructive';
            case 'dueSoon':
                return 'bg-accent';
            case 'active':
                return 'bg-primary';
            case 'review':
                return 'bg-secondary';
            default:
                return 'bg-primary';
        }
    };

    const renderAssignmentCard = ({ assignment, stats: statsForAssignment, isOverdue, isDueSoon, needsReview }: any) => {
        const status = isOverdue ? 'overdue' : (isDueSoon ? 'dueSoon' : 'active');
        
        return (
            <div key={assignment._id} className="group rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className={`h-1 ${getStatusColor(status)}`} />
                <div className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="min-w-0 flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <h3 className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors break-words">
                                    {assignment.topic}
                                </h3>
                                {isOverdue && (
                                    <Badge className="border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/15 text-xs">
                                        <AlertTriangle className="w-3 h-3 mr-1" /> Overdue
                                    </Badge>
                                )}
                                {isDueSoon && !isOverdue && (
                                    <Badge className="border-accent/20 bg-accent/10 text-accent hover:bg-accent/15 text-xs">
                                        <Clock className="w-3 h-3 mr-1" /> Due Soon
                                    </Badge>
                                )}
                                {needsReview && !isOverdue && !isDueSoon && (
                                    <Badge variant="outline" className="border-secondary/20 bg-secondary/10 text-secondary-foreground text-xs">
                                        <Eye className="w-3 h-3 mr-1" /> Review Needed
                                    </Badge>
                                )}
                            </div>
                            <div className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3" dangerouslySetInnerHTML={{ __html: assignment.description }} />
                            <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs font-medium">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <FileQuestion className="w-3 h-3 flex-shrink-0" />
                                    <span>Questions: {assignment.questions?.length || 0}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Users className="w-3 h-3 flex-shrink-0" />
                                    <span>Submissions: {statsForAssignment.total}</span>
                                </div>
                                {statsForAssignment.pending > 0 && (
                                    <div className="flex items-center gap-1 text-secondary">
                                        <Clock className="w-3 h-3 flex-shrink-0" />
                                        <span>Pending: {statsForAssignment.pending}</span>
                                    </div>
                                )}
                                {statsForAssignment.resubmit > 0 && (
                                    <div className="flex items-center gap-1 text-accent">
                                        <RotateCcw className="w-3 h-3 flex-shrink-0" />
                                        <span>Resubmit: {statsForAssignment.resubmit}</span>
                                    </div>
                                )}
                                {getDepartmentLabel(assignment.department) && (
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <FolderOpen className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">Dept: {getDepartmentLabel(assignment.department)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0 w-full lg:w-auto mt-3 lg:mt-0">
                            <Button 
                                variant="outline" 
                                size={isMobile ? "default" : "sm"} 
                                onClick={() => handleViewSubmissions(assignment)}
                                className={`flex-1 lg:flex-none ${themeStyles.brandHover}`}
                            >
                                <Eye className="w-4 h-4 mr-1" /> Submissions
                            </Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size={isMobile ? "default" : "sm"} 
                                        onClick={() => setEditAssignment({
                                            ...assignment,
                                            dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : ''
                                        })}
                                        className={`flex-1 lg:flex-none ${themeStyles.brandGhost}`}
                                    >
                                        Edit
                                    </Button>
                                </DialogTrigger>
                                {editAssignment && editAssignment._id === assignment._id && (
                                    <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle className="text-lg sm:text-xl font-bold text-brand-gradient">
                                                Edit Assignment
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div>
                                                <Label className="text-sm font-semibold mb-2 block">Topic</Label>
                                                <Input 
                                                    value={editAssignment.topic} 
                                                    onChange={(e) => setEditAssignment({ ...editAssignment, topic: e.target.value })}
                                                    className={themeStyles.focusRing}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-semibold mb-2 block">Description</Label>
                                                <RichTextEditor
                                                    value={editAssignment.description || ''}
                                                    onChange={(content) => setEditAssignment({ ...editAssignment, description: content })}
                                                    placeholder="Assignment instructions..."
                                                    className="min-h-[150px]"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-semibold mb-2 block">Due Date</Label>
                                                <Input 
                                                    type="date" 
                                                    value={editAssignment.dueDate} 
                                                    onChange={(e) => setEditAssignment({ ...editAssignment, dueDate: e.target.value })}
                                                    className={themeStyles.focusRing}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-semibold mb-2 block">Department (Optional)</Label>
                                                <select
                                                    className={themeStyles.select}
                                                    value={editAssignment.department || ''}
                                                    onChange={(e) => setEditAssignment({ ...editAssignment, department: e.target.value })}
                                                    disabled={role === 'dept_admin'}
                                                >
                                                    {role !== 'dept_admin' && <option value="">All Students</option>}
                                                    {departmentsList.map((d: any) => (
                                                        <option key={d._id} value={d._id}>{d.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={handleUpdateAssignment}
                                            className={themeStyles.primaryButton}
                                        >
                                            Update Assignment
                                        </Button>
                                    </DialogContent>
                                )}
                            </Dialog>
                            <Button 
                                variant="ghost" 
                                size={isMobile ? "default" : "sm"} 
                                onClick={() => handleDeleteAssignment(assignment._id)}
                                className="flex-1 lg:flex-none hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Filter buttons component
    const FilterButtons = () => (
        <div className="flex flex-wrap gap-2 mb-6">
            <Button
                key="filter-all"
                type="button"
                variant={assignmentDeskFilter === 'all' ? 'default' : 'outline'}
                size={isMobile ? "default" : "sm"}
                onClick={() => {
                    setAssignmentDeskFilter('all');
                    setMobileFilterOpen(false);
                }}
                className={assignmentDeskFilter === 'all' ? themeStyles.primaryButton : themeStyles.brandHover}
            >
                All Assignments
            </Button>
            <Button
                key="filter-review"
                type="button"
                variant={assignmentDeskFilter === 'review' ? 'default' : 'outline'}
                size={isMobile ? "default" : "sm"}
                onClick={() => {
                    setAssignmentDeskFilter('review');
                    setMobileFilterOpen(false);
                }}
                className={assignmentDeskFilter === 'review' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' : 'hover:border-secondary/40 hover:text-secondary'}
            >
                <Eye className="w-4 h-4 mr-2" /> Review Needed
            </Button>
            <Button
                key="filter-duesoon"
                type="button"
                variant={assignmentDeskFilter === 'dueSoon' ? 'default' : 'outline'}
                size={isMobile ? "default" : "sm"}
                onClick={() => {
                    setAssignmentDeskFilter('dueSoon');
                    setMobileFilterOpen(false);
                }}
                className={assignmentDeskFilter === 'dueSoon' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 'hover:border-accent/40 hover:text-accent'}
            >
                <Clock className="w-4 h-4 mr-2" /> Due Soon
            </Button>
            <Button
                key="filter-overdue"
                type="button"
                variant={assignmentDeskFilter === 'overdue' ? 'default' : 'outline'}
                size={isMobile ? "default" : "sm"}
                onClick={() => {
                    setAssignmentDeskFilter('overdue');
                    setMobileFilterOpen(false);
                }}
                className={assignmentDeskFilter === 'overdue' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'hover:border-destructive/40 hover:text-destructive'}
            >
                <AlertTriangle className="w-4 h-4 mr-2" /> Overdue
            </Button>
        </div>
    );

    return (
        <>
            {/* ASSIGNMENTS TAB */}
            <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 md:px-6 pb-8 py-10">
                {/* Header Section with Gradient - Responsive */}
                <div className={`${themeStyles.hero} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg`} >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="w-full sm:w-auto">
                            <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Assignment Desk</h1>
                            <p className="text-primary-foreground/70 text-xs sm:text-sm">Create assignments and monitor overdue, review-needed, and due-soon work</p>
                        </div>
                        <Button 
                            onClick={() => setOpenAssignmentDialog(true)}
                            className="bg-background/15 hover:bg-background/25 text-primary-foreground border-primary-foreground/20 backdrop-blur-sm w-full sm:w-auto"
                            size={isMobile ? "default" : "default"}
                        >
                            <Plus className="w-4 h-4 mr-2" /> New Assignment
                        </Button>
                    </div>
                </div>

                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <div className={`${themeStyles.statCard} rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground font-semibold">Active Assignments</p>
                                <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-brand-gradient">
                                    {assignments.length}
                                </p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-brand-gradient-soft flex items-center justify-center">
                                <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                            </div>
                        </div>
                    </div>
                    <div className={`${themeStyles.statCard} rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground font-semibold">Overdue</p>
                                <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-destructive">
                                    {overdueAssignments.length}
                                </p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-destructive" />
                            </div>
                        </div>
                    </div>
                    <div className={`${themeStyles.statCard} rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground font-semibold">Due In 3 Days</p>
                                <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-accent">
                                    {dueSoonAssignments.length}
                                </p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-accent" />
                            </div>
                        </div>
                    </div>
                    <div className={`${themeStyles.statCard} rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground font-semibold">Needs Review</p>
                                <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-secondary">
                                    {reviewAssignments.length}
                                </p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                                <Eye className="w-4 h-4 sm:w-6 sm:h-6 text-secondary" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Section - Responsive */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                        {/* Mobile Filter Button */}
                        {isMobile && (
                            <div className="mb-4">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setMobileFilterOpen(true)}
                                    className="w-full justify-between"
                                >
                                    <span className="flex items-center gap-2">
                                        <Filter className="w-4 h-4" />
                                        Filter Assignments
                                    </span>
                                    <Badge variant="secondary" className="ml-2">
                                        {assignmentDeskFilter === 'all' ? 'All' : 
                                         assignmentDeskFilter === 'review' ? 'Review' :
                                         assignmentDeskFilter === 'dueSoon' ? 'Due Soon' : 'Overdue'}
                                    </Badge>
                                </Button>
                                
                                {/* Mobile Filter Sheet */}
                                <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                                    <SheetContent side="bottom" className="h-auto rounded-t-2xl">
                                        <div className="py-4">
                                            <h3 className="text-lg font-semibold mb-4">Filter Assignments</h3>
                                            <FilterButtons />
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        )}
                        
                        {/* Desktop Filter Buttons */}
                        {!isMobile && <FilterButtons />}

                        {/* Assignments List */}
                        <div className="space-y-4">
                            {assignmentStatsLoading && (
                                <div key="loading" className="rounded-lg border border-dashed p-6 sm:p-8 text-center">
                                    <div className="animate-pulse flex flex-col items-center">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-gradient opacity-50 mb-3"></div>
                                        <p className="text-xs sm:text-sm text-muted-foreground">Loading submission insights...</p>
                                    </div>
                                </div>
                            )}
                            {assignments.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                        <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                            {assignmentDeskFilter === 'review'
                                                ? 'Review Needed Assignments'
                                                : assignmentDeskFilter === 'dueSoon'
                                                ? 'Due Soon Assignments'
                                                : assignmentDeskFilter === 'overdue'
                                                ? 'Overdue Assignments'
                                                : 'All Assignments'}
                                        </h3>
                                        <Badge variant="secondary" className={`${themeStyles.primaryBadge} text-xs`}>
                                            {filteredAssignmentInsights.length} {filteredAssignmentInsights.length === 1 ? 'item' : 'items'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {filteredAssignmentInsights.length > 0 ? (
                                            filteredAssignmentInsights.map(renderAssignmentCard)
                                        ) : (
                                            <div key="no-results" className="rounded-lg border border-dashed p-8 sm:p-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50" />
                                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                                        No assignments match this filter.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div key="empty" className="rounded-lg border border-dashed p-8 sm:p-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50" />
                                        <p className="text-sm sm:text-base text-muted-foreground">No assignments active.</p>
                                        <Button 
                                            onClick={() => setOpenAssignmentDialog(true)}
                                            variant="outline"
                                            className={`mt-2 ${themeStyles.brandHover}`}
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Create First Assignment
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Assignment Dialog - Responsive */}
            <Dialog open={openAssignmentDialog} onOpenChange={setOpenAssignmentDialog}>
                <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl font-bold text-brand-gradient">
                            Create Assignment / Assessment
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            Fill in the details to create a new assignment for your students.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div>
                            <Label className="text-sm font-semibold mb-2 block">Topic</Label>
                            <Input 
                                value={newAssignment.topic} 
                                onChange={(e) => setNewAssignment({ ...newAssignment, topic: e.target.value })}
                                placeholder="Enter assignment topic"
                                className={themeStyles.focusRing}
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-semibold mb-2 block">Description</Label>
                            <RichTextEditor
                                value={newAssignment.description || ''}
                                onChange={(content) => setNewAssignment({ ...newAssignment, description: content })}
                                placeholder="Assignment instructions..."
                                className="min-h-[150px]"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-semibold mb-2 block">Due Date</Label>
                            <Input 
                                type="date" 
                                value={newAssignment.dueDate} 
                                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                                className={themeStyles.focusRing}
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-semibold mb-2 block">Department (Optional)</Label>
                            <select
                                className={themeStyles.select}
                                value={newAssignment.department}
                                onChange={(e) => setNewAssignment({ ...newAssignment, department: e.target.value })}
                                disabled={role === 'dept_admin'}
                            >
                                {role !== 'dept_admin' && <option value="">All Students</option>}
                                {departmentsList.map((d: any) => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <Button 
                        onClick={handleCreateAssignment}
                        className={themeStyles.primaryButton}
                    >
                        Create Assignment
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AssignmentsTab;
