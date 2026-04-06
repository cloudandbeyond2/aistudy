import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import Swal from 'sweetalert2';
import {
  Video,
  Plus,
  Clock,
  TrendingUp,
  ExternalLink,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Globe,
  ChevronRight,
  Menu,
  Pencil,
  X as CloseIcon,
  Loader2
} from 'lucide-react';

const themeStyles = {
    hero: 'bg-brand-gradient text-primary-foreground',
    heroGlass: 'bg-background/15 text-primary-foreground border-primary-foreground/20',
    primaryButton: 'bg-primary text-primary-foreground hover:bg-primary/90 transition-all',
    statCard: 'border-0 shadow-lg overflow-hidden',
    statBar: 'h-1 bg-brand-gradient',
    iconPrimary: 'rounded-lg bg-brand-gradient p-2 sm:p-3 text-primary-foreground shadow-lg',
    iconSoft: 'rounded-lg bg-brand-gradient-soft p-2 sm:p-3 text-primary shadow-lg',
    focusSelect: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
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

const createEmptyCourse = () => ({
    title: '',
    description: '',
    department: '',
    topics: [],
    quizzes: [],
    quizSettings: { ...defaultQuizSettings, proctoring: { ...defaultQuizSettings.proctoring } }
});

const normalizeExternalLink = (value: string) => {
    const trimmed = String(value || '').trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^\/\//.test(trimmed)) return `https:${trimmed}`;
    return `https://${trimmed.replace(/^\/+/, '')}`;
};

const MeetingTab = () => {
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
    const [userDeptName, setUserDeptName] = useState(sessionStorage.getItem('deptName') || '');
    const [userDeptId, setUserDeptId] = useState(deptId || sessionStorage.getItem('deptId') || '');
    const getDeptScopedDepartment = () => (role === 'dept_admin' ? (userDeptId || deptId || '') : '');
    const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');

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
 const [editMeeting, setEditMeeting] = useState(null);
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
    const [showBootstrapLoader, setShowBootstrapLoader] = useState(true);

    useEffect(() => {
        const timer = window.setTimeout(() => setShowBootstrapLoader(false), 2000);
        return () => window.clearTimeout(timer);
    }, []);

    // Responsive hooks
    const isMobile = useMediaQuery('(max-width: 640px)');
    const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
    const isDesktop = useMediaQuery('(min-width: 1025px)');

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
            !normalizedValue ||
            normalizedValue === 'all' ||
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

  const handleCreateMeeting = async () => {
  try {
    const payload = {
      ...newMeeting,
      link: normalizeExternalLink(newMeeting.link),
      organizationId: orgId
    };

    if (editMeeting) {
      // ✅ UPDATE EXISTING (NO DUPLICATE)
      const res = await axios.put(
        `${serverURL}/api/org/meeting/${editMeeting._id}`,
        payload
      );

      if (res.data.success) {
        toast({ title: "Updated", description: "Meeting updated successfully" });
      }

    } else {
      // ✅ CREATE NEW
      const res = await axios.post(
        `${serverURL}/api/org/meeting/create`,
        payload
      );

      if (res.data.success) {
        toast({ title: "Created", description: "Meeting scheduled successfully" });
      }
    }

    // 🔥 RESET AFTER SAVE
    setEditMeeting(null);

    setNewMeeting({
      title: '',
      link: '',
      platform: 'google-meet',
      date: '',
      time: '',
      department: ''
    });

    setOpenMeetingDialog(false);
    fetchMeetings();

  } catch (e) {
    toast({ title: "Error", description: "Operation failed" });
  }
};

const handleEditMeeting = (meeting) => {
  setEditMeeting(meeting);

  setNewMeeting({
    title: meeting.title,
    link: meeting.link,
    platform: meeting.platform,
    date: meeting.date,
    time: meeting.time,
    department: meeting.department || ''
  });

  setOpenMeetingDialog(true);
};

    const handleDeleteMeeting = async (id: string) => {
        const result = await Swal.fire({
            title: 'Delete this meeting?',
            text: "You can't undo this action",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'No',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 ml-2',
                cancelButton: 'inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
            },
        });

        if (!result.isConfirmed) return;

        try {
            const res = await axios.delete(`${serverURL}/api/org/meeting/${id}`);
            if (res.data.success) {
                Swal.fire('Deleted!', 'Meeting deleted successfully.', 'success');
                fetchMeetings();
            }
        } catch (e) {
            Swal.fire('Error!', 'Failed to delete meeting.', 'error');
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

    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
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

    const bootstrapLoader = (
        <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card/70 px-8 py-10 text-center shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div>
                    <p className="text-sm font-semibold text-foreground">Loading Sessions</p>
                    <p className="text-sm text-muted-foreground">Preparing department meetings...</p>
                </div>
            </div>
        </div>
    );

    return showBootstrapLoader ? bootstrapLoader : (
        <>
            <div className="space-y-4 py-4 sm:py-6 md:py-8 lg:py-10 px-3 sm:px-4 md:px-6">
                {/* Hero Section */}
                <div className={`rounded-xl p-4 sm:p-5 md:p-6 ${themeStyles.hero}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Session Desk</h2>
                            <p className="text-sm sm:text-base text-primary-foreground/80">
                                {isMobile ? 'Plan live sessions' : 'Plan live classes, mentoring slots, and virtual department sessions.'}
                            </p>
                        </div>
                        <Dialog open={openMeetingDialog} onOpenChange={setOpenMeetingDialog}>
                            <DialogTrigger asChild onClick={() => setOpenMeetingDialog(true)}>
                                <Button className={`w-full sm:w-auto ${themeStyles.heroGlass}`}>
                                    <Plus className="w-4 h-4 mr-2" /> 
                                    {isMobile ? 'Schedule' : 'Plan Session'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="z-[9999] w-[95%] sm:w-full max-w-md sm:max-w-lg mx-auto rounded-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
                                <DialogHeader>
                                    <DialogTitle>Schedule New Meeting</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Meeting Title</Label>
                                        <Input value={newMeeting.title} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} placeholder="e.g., Weekly Sync" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Platform</Label>
                                        <select
                                            className={themeStyles.focusSelect}
                                            value={newMeeting.platform}
                                            onChange={(e) => setNewMeeting({ ...newMeeting, platform: e.target.value as any })}
                                        >
                                            <option value="google-meet">Google Meet</option>
                                            <option value="zoom">Zoom</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Meeting Link</Label>
                                        <Input value={newMeeting.link} onChange={(e) => setNewMeeting({ ...newMeeting, link: e.target.value })} placeholder="https://meet.google.com/..." />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Date</Label>
                                            <Input type="date" value={newMeeting.date} onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Time</Label>
                                            <Input type="time" value={newMeeting.time} onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Department (Optional)</Label>
                                        <select
                                            className={themeStyles.focusSelect}
                                            value={newMeeting.department}
                                            onChange={(e) => setNewMeeting({ ...newMeeting, department: e.target.value })}
                                            disabled={role === 'dept_admin'}
                                        >
                                            {role !== 'dept_admin' && <option value="">All Students</option>}
                                            {departmentsList.map((d: any) => (
                                                <option key={d._id} value={d._id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                         <Button
  onClick={handleCreateMeeting}
  className={`${themeStyles.primaryButton} w-full`}
>
  {editMeeting ? "Update Meeting" : "Schedule Meeting"}
</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <Card className={themeStyles.statCard}>
                        <div className={themeStyles.statBar}></div>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className={themeStyles.iconPrimary}>
                                    <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Total Sessions</p>
                                    <p className="text-2xl sm:text-3xl font-bold">{meetings.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className={themeStyles.statCard}>
                        <div className={themeStyles.statBar}></div>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className={themeStyles.iconSoft}>
                                    <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Scheduled Today</p>
                                    <p className="text-2xl sm:text-3xl font-bold">{meetingsTodayCount}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className={`${themeStyles.statCard} sm:col-span-2 lg:col-span-1`}>
                        <div className={themeStyles.statBar}></div>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className={themeStyles.iconPrimary}>
                                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Upcoming Queue</p>
                                    <p className="text-2xl sm:text-3xl font-bold">{upcomingMeetingsCount}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Meetings List */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-lg sm:text-xl">All Scheduled Sessions</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Manage and view all your scheduled meetings</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                            {meetings.length > 0 ? meetings.map((m: any) => (
                                (() => {
                                    const meetingDate = m?.date ? new Date(m.date) : null;
                                    const isExpired = Boolean(meetingDate && meetingDate < todayStart);

                                    return (
                                <div key={m._id} className="p-3 sm:p-4 rounded-xl border bg-card hover:shadow-xl transition-all duration-300 group">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-brand-gradient flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                                                <Video className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm sm:text-base truncate">{m.title}</h3>
                                                <div className="flex flex-wrap gap-2 gap-y-1 text-xs sm:text-sm text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(m.date).toLocaleDateString()} at {m.time}
                                                    </span>
                                                    <span className="capitalize px-1.5 sm:px-2 py-0.5 rounded-full bg-muted text-xs">
                                                        {m.platform.replace('-', ' ')}
                                                    </span>
                                                    {isExpired && (
                                                        <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold dark:bg-rose-950/40 dark:text-rose-300">
                                                            Expired
                                                        </span>
                                                    )}
                                                    {getDepartmentLabel(m.department) && (
                                                        <span className="text-primary font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-primary/10 text-xs">
                                                            {getDepartmentLabel(m.department)}
                                                        </span>
                                                    )}
                                                </div>
                                                <a 
                                                    href={normalizeExternalLink(m.link)} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-xs text-primary hover:text-primary/80 hover:underline mt-2 flex items-center gap-1 truncate"
                                                >
                                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate">{m.link.length > 40 ? `${m.link.substring(0, 40)}...` : m.link}</span>
                                                </a>
                                            </div>
                                        </div>
                                       
                                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">

  {/* ✏️ EDIT */}
  <Button
    size="icon"
    variant="ghost"
    className="h-8 w-8 rounded-lg bg-brand-gradient-soft text-primary hover:bg-brand-gradient hover:text-primary-foreground shadow-sm"
    onClick={() => handleEditMeeting(m)}
  >
    <Pencil className="w-4 h-4" />
  </Button>

  {/* 🗑️ DELETE */}
  <Button 
    size="icon" 
    variant="ghost" 
    className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
    onClick={() => handleDeleteMeeting(m._id)}
  >
    <Trash2 className="w-4 h-4" />
  </Button>

                                        </div>
                                    </div>
                                </div>
                                    );
                                })()
                            )) : (
                                <div className="col-span-full py-8 sm:py-12 text-center border-2 border-dashed rounded-xl">
                                    <Video className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-muted-foreground" />
                                    <p className="text-sm sm:text-base text-muted-foreground mb-3">No meetings scheduled yet.</p>
                                    <Button 
                                        variant="outline" 
                                        size={isMobile ? "sm" : "default"}
                                        className="mt-2"
                                        onClick={() => setOpenMeetingDialog(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Schedule your first session
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default MeetingTab;
