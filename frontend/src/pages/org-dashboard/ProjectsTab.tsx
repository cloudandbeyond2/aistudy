import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import RichTextEditor from '@/components/RichTextEditor';
import { Badge } from "@/components/ui/badge";
import Swal from 'sweetalert2';
import { 
  Plus, FileText, Sparkles, Briefcase, Clock, Eye, Trash2, 
  Users, Calendar, ChevronRight, FolderOpen, Lightbulb, 
  Target, Rocket, Zap, Layers, Award, TrendingUp, Shield,
  CheckCircle2, AlertCircle, BookOpen, Code, Globe, Server,
  Database, Cpu, Brain, BarChart3, ArrowRight, X, Download,
  ExternalLink, Star, Heart, MessageSquare, Share2, Tag
} from 'lucide-react';

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

const pageGradientClass = "bg-brand-gradient";
const pageGradientTextClass = "bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent";

const ProjectTab = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const role = sessionStorage.getItem('role');
    const deptId = sessionStorage.getItem('deptId');
    const { toast } = useToast();
    
    // Initialize activeTab before any hooks that use it
    const activeTab = searchParams.get('tab') || (role === 'dept_admin' ? 'courses' : 'students');
    
    const [stats, setStats] = useState({ studentCount: 0, studentLimit: 50, assignmentCount: 0, submissionCount: 0, placedCount: 0 });
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [assignmentSubmissionStats, setAssignmentSubmissionStats] = useState({});
    const [assignmentStatsLoading, setAssignmentStatsLoading] = useState(false);
    const [assignmentDeskFilter, setAssignmentDeskFilter] = useState('all');
    const [notices, setNotices] = useState([]);
    const [courses, setCourses] = useState([]);
    const [previewProject, setPreviewProject] = useState(null);
    const [userDeptName, setUserDeptName] = useState('');
    const [userDeptId, setUserDeptId] = useState(deptId || '');
    const getDeptScopedDepartment = () => (role === 'dept_admin' ? (userDeptId || deptId || '') : '');
    const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');

    const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', department: '', section: '', studentClass: '', rollNo: '', academicYear: '' });
    const [newAssignment, setNewAssignment] = useState({ topic: '', description: '', dueDate: '', department: '' });
    const [newNotice, setNewNotice] = useState({ title: '', content: '', audience: 'all', department: '' });
    const [newCourse, setNewCourse] = useState(createEmptyCourse());
    const [quizReportsMap, setQuizReportsMap] = useState({});
    const [quizReportsLoading, setQuizReportsLoading] = useState(false);
    const [deptLimitRequests, setDeptLimitRequests] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [projects, setProjects] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [openMeetingDialog, setOpenMeetingDialog] = useState(false);
    const [openProjectDialog, setOpenProjectDialog] = useState(false);
    const [newMeeting, setNewMeeting] = useState({ title: '', link: '', platform: 'google-meet', date: '', time: '', department: getDeptScopedDepartment() });
    const [newProject, setNewProject] = useState({ title: '', description: '', type: 'Project', department: '', dueDate: '', guidance: '', subtopics: [], isAiGenerated: false });
    const [projectAiTopic, setProjectAiTopic] = useState('');
    const [isGeneratingProject, setIsGeneratingProject] = useState(false);
    const [departmentsList, setDepartmentsList] = useState([]);
    const [deptAdmins, setDeptAdmins] = useState([]);
    const [staffLoginLogs, setStaffLoginLogs] = useState([]);
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

    // Create refs for DOM elements
    const subtopicInputRef = useRef(null);

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
    
    const getDepartmentLabel = (value) => {
        const normalizedValue = getDepartmentValue(value);
        if (!normalizedValue || normalizedValue === 'all') return '';
        return departmentsList.find((d) => d._id === normalizedValue || d.name === normalizedValue)?.name || normalizedValue;
    };

    // Fetch functions
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
                    meetingsData = meetingsData.filter((m) => matchesCurrentDepartment(m.department, m.departmentId));
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
                    projectsData = projectsData.filter((p) => matchesCurrentDepartment(p.department, p.departmentId));
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
                    materialsData = materialsData.filter((m) => matchesCurrentDepartment(m.department, m.departmentId));
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
    }

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
                    coursesData = coursesData.filter((c) =>
                        (userDeptName && c.department === userDeptName) ||
                        (deptId && (c.departmentId === deptId || c.department === deptId))
                    );
                }
                setCourses(coursesData);
                void fetchQuizReports(coursesData.map((c) => String(c._id)));
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

    const fetchQuizReports = async (courseIds) => {
        if (!orgId) return;
        setQuizReportsLoading(true);
        try {
            const requesterId = sessionStorage.getItem('uid');
            if (!requesterId) return;
            const res = await axios.get(`${serverURL}/api/org-quiz/reports?organizationId=${orgId}&requesterId=${requesterId}`);
            if (res.data?.success) {
                const reports = Array.isArray(res.data.reports) ? res.data.reports : [];
                const filtered = Array.isArray(courseIds) && courseIds.length > 0
                    ? reports.filter((r) => courseIds.includes(String(r.courseId)))
                    : reports;
                const nextMap = {};
                filtered.forEach((r) => {
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
                    noticesData = noticesData.filter((n) => matchesCurrentDepartment(n.department, n.departmentId));
                }
                setNotices(noticesData);
            }
        } catch (e) {
            console.error('Failed to fetch notices:', e);
        }
    }

    const handleCreateProject = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/project/create`, { ...newProject, organizationId: orgId });
            if (res.data.success) {
                toast({ title: "Success", description: "Project/Practical added" });
                resetProjectForm();
                setOpenProjectDialog(false);
                fetchProjects();
            }
        } catch (e) {
            toast({ title: "Error", description: e.response?.data?.message || "Failed to add project" });
        }
    };

    const handleGenerateProjectContent = async () => {
        if (!projectAiTopic) {
            toast({ title: "Required", description: "Please enter a topic or keywords" });
            return;
        }

        setIsGeneratingProject(true);
        
        let progressInterval;
        let progress = 0;
        
        Swal.fire({
            title: '🤖 AI Project Generator',
            html: `
                <div class="text-left space-y-4">
                    <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Topic:</span>
                        <span class="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs sm:text-sm break-all">${projectAiTopic.substring(0, 40)}${projectAiTopic.length > 40 ? '...' : ''}</span>
                    </div>
                    <div class="w-full bg-muted rounded-full h-3">
                        <div id="progress-bar" class="h-3 rounded-full transition-all duration-300 bg-brand-gradient" style="width: 0%;"></div>
                    </div>
                    <div id="progress-status" class="flex items-center justify-center gap-2 text-sm mt-2">
                        <span id="progress-icon">⏳</span>
                        <span id="progress-message">Initializing...</span>
                    </div>
                    <div id="progress-percentage" class="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">0%</div>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                progressInterval = setInterval(() => {
                    if (progress < 90) {
                        progress += Math.random() * 2;
                        if (progress > 90) progress = 90;
                        
                        const progressBar = document.getElementById('progress-bar');
                        const progressPercentage = document.getElementById('progress-percentage');
                        const progressMessage = document.getElementById('progress-message');
                        
                        if (progressBar) progressBar.style.width = `${progress}%`;
                        if (progressPercentage) progressPercentage.textContent = `${Math.round(progress)}%`;
                        
                        if (progress < 20) {
                            if (progressMessage) progressMessage.textContent = 'Analyzing topic...';
                        } else if (progress < 40) {
                            if (progressMessage) progressMessage.textContent = 'Researching content...';
                        } else if (progress < 60) {
                            if (progressMessage) progressMessage.textContent = 'Generating structure...';
                        } else if (progress < 80) {
                            if (progressMessage) progressMessage.textContent = 'Writing content...';
                        } else {
                            if (progressMessage) progressMessage.textContent = 'Almost there...';
                        }
                    }
                }, 200);
            }
        });

        try {
            const startTime = Date.now();
            const res = await axios.post(`${serverURL}/api/org/project/generate`, { 
                topic: projectAiTopic,
                type: newProject.type 
            });

            if (progressInterval) clearInterval(progressInterval);
            const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

            if (res.data.success) {
                const { title, description, guidance, subtopics } = res.data.content;
                
                const progressBar = document.getElementById('progress-bar');
                const progressPercentage = document.getElementById('progress-percentage');
                const progressMessage = document.getElementById('progress-message');
                const progressIcon = document.getElementById('progress-icon');
                
                if (progressBar) progressBar.style.width = '100%';
                if (progressPercentage) progressPercentage.textContent = '100%';
                if (progressMessage) progressMessage.textContent = `Complete! (${totalTime}s)`;
                if (progressIcon) progressIcon.textContent = '✅';
                
                await new Promise(resolve => setTimeout(resolve, 500));
                Swal.close();
                
                const formattedGuidance = guidance ? formatGuidanceText(guidance) : '';
                const formattedDescription = description ? formatGuidanceText(description) : '';
                
                setNewProject({
                    ...newProject,
                    title: title || '',
                    description: formattedDescription || description || '',
                    guidance: formattedGuidance,
                    subtopics: subtopics || [],
                    isAiGenerated: true
                });
                
                toast({ title: "Success", description: `Project generated in ${totalTime}s` });
            }
        } catch (e) {
            if (progressInterval) clearInterval(progressInterval);
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Generation Failed',
                text: e.response?.data?.message || 'Failed to generate content',
                confirmButtonColor: 'hsl(var(--primary))'
            });
        } finally {
            setIsGeneratingProject(false);
        }
    };

    const formatGuidanceText = (text) => {
        if (!text) return '';
        
        const lines = text.split('\n');
        let html = '';
        let inList = false;
        let listType = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trimRight();
            
            if (line.startsWith('### ')) {
                if (inList) {
                    html += `</${listType}>`;
                    inList = false;
                }
                html += `<h3 class="text-base sm:text-lg font-bold mt-4 sm:mt-6 mb-2 sm:mb-3 text-primary">${line.substring(4)}</h3>`;
            }
            else if (line.startsWith('## ')) {
                if (inList) {
                    html += `</${listType}>`;
                    inList = false;
                }
                html += `<h2 class="text-lg sm:text-xl font-bold mt-4 sm:mt-5 mb-2 sm:mb-3 text-primary">${line.substring(3)}</h2>`;
            }
            else if (line.startsWith('# ')) {
                if (inList) {
                    html += `</${listType}>`;
                    inList = false;
                }
                html += `<h1 class="text-xl sm:text-2xl font-bold mt-5 sm:mt-6 mb-3 sm:mb-4 text-primary">${line.substring(2)}</h1>`;
            }
            else if (line.match(/^(Phase|Step|Part)\s+\d+[:.]/i)) {
                if (inList) {
                    html += `</${listType}>`;
                    inList = false;
                }
                html += `<h3 class="text-base sm:text-lg font-bold mt-4 sm:mt-6 mb-2 sm:mb-3 text-primary">${line}</h3>`;
            }
            else if (line.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*:$/) || (line.length < 60 && line.endsWith(':'))) {
                if (inList) {
                    html += `</${listType}>`;
                    inList = false;
                }
                html += `<h4 class="font-bold text-sm sm:text-base mt-3 sm:mt-4 mb-1 sm:mb-2">${line}</h4>`;
            }
            else if (line.startsWith('•') || line.startsWith('- ') || line.startsWith('* ')) {
                if (!inList || listType !== 'ul') {
                    if (inList) html += `</${listType}>`;
                    html += '<ul class="list-disc pl-4 sm:pl-6 my-2 sm:my-3 space-y-1">';
                    inList = true;
                    listType = 'ul';
                }
                const content = line.substring(line.indexOf(' ') + 1).trim();
                const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>');
                html += `<li class="text-xs sm:text-sm">${formattedContent}</li>`;
            }
            else if (line.match(/^\d+[.)]\s/)) {
                if (!inList || listType !== 'ol') {
                    if (inList) html += `</${listType}>`;
                    html += '<ol class="list-decimal pl-4 sm:pl-6 my-2 sm:my-3 space-y-1">';
                    inList = true;
                    listType = 'ol';
                }
                const content = line.replace(/^\d+[.)]\s/, '');
                const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>');
                html += `<li class="text-xs sm:text-sm">${formattedContent}</li>`;
            }
            else if (line.length > 0) {
                if (inList) {
                    html += `</${listType}>`;
                    inList = false;
                }
                const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>');
                html += `<p class="text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed">${formattedLine}</p>`;
            }
            else if (line === '' && !inList) {
                html += '<div class="h-2 sm:h-3"></div>';
            }
        }
        
        if (inList) {
            html += `</${listType}>`;
        }
        
        return html;
    };

    const handleDeleteProject = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Project?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'hsl(var(--primary))',
            cancelButtonColor: 'hsl(var(--muted-foreground))',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const res = await axios.delete(`${serverURL}/api/org/project/${id}`);
                if (res.data.success) {
                    await Swal.fire({
                        title: 'Deleted!',
                        text: 'Project has been deleted.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchProjects();
                }
            } catch (e) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete project',
                    icon: 'error',
                    confirmButtonColor: 'hsl(var(--primary))'
                });
            }
        }
    };

    // UseEffect hooks after all functions are defined
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
            const myDept = departmentsList.find((d) => d._id === deptId);
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

    // Calculate stats
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const meetingsTodayCount = meetings.filter((meeting) => {
        if (!meeting?.date) return false;
        return new Date(meeting.date).toISOString().slice(0, 10) === todayKey;
    }).length;
    const upcomingMeetingsCount = meetings.filter((meeting) => {
        if (!meeting?.date) return false;
        const meetingDateTime = new Date(`${meeting.date}T${meeting.time || '00:00'}`);
        return meetingDateTime >= now;
    }).length;
    const aiProjectCount = projects.filter((project) => Boolean(project?.isAiGenerated)).length;
    const dueSoonProjectsCount = projects.filter((project) => {
        if (!project?.dueDate) return false;
        const dueDate = new Date(project.dueDate);
        return dueDate >= now && dueDate.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000;
    }).length;
    const recentNoticesCount = notices.filter((notice) => {
        if (!notice?.createdAt) return false;
        return new Date(notice.createdAt) >= weekAgo;
    }).length;
    const orgWideNoticeCount = notices.filter((notice) => !notice?.department).length;
    const assignmentInsights = assignments.map((assignment) => {
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

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in px-2 sm:px-2 lg:px-4 max-w-[1400px] mx-auto relative pt-0 lg:pt-[65px]">
        {/* Hero Section - Desktop Optimized */}
        <div className={`relative rounded-2xl overflow-hidden mb-6 lg:mb-8 ${pageGradientClass}`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative px-8 lg:px-12 xl:px-16 py-12 lg:py-16 xl:py-20 text-primary-foreground">
                <div className="max-w-3xl xl:max-w-4xl">
                    <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-5">
                        <div className="bg-primary-foreground/20 p-2.5 lg:p-3 rounded-xl backdrop-blur-sm">
                            <Briefcase className="w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" />
                        </div>
                        <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-white">Projects & Labs Desk</h1>
                    </div>
                    <p className="text-primary-foreground/90 text-base lg:text-lg xl:text-xl mb-6 lg:mb-8">
                        Manage practical work, guided research, and applied skill-building projects for your students.
                        Create structured assignments with AI assistance and track progress seamlessly.
                    </p>
                    <div className="flex flex-wrap gap-3 lg:gap-4">
                        <Button 
                            onClick={() => setOpenProjectDialog(true)}
                            className="bg-background text-primary hover:bg-muted shadow-lg text-base lg:text-lg px-6 lg:px-8 py-2.5 lg:py-3"
                        >
                            <Plus className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
                            Create New Project
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        {/* Stats Cards - 4 Column Desktop Layout */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 xl:gap-6">
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <CardContent className="p-5 lg:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm lg:text-base text-muted-foreground mb-1">Total Projects</p>
                    <p className={`text-2xl lg:text-3xl xl:text-4xl font-bold ${pageGradientTextClass}`}>
                        {projects.length}
                    </p>
                </div>
                <div className="bg-brand-gradient p-3 lg:p-4 rounded-xl text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
                    <Briefcase className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
            </div>
        </CardContent>
    </Card>

    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <CardContent className="p-5 lg:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm lg:text-base text-muted-foreground mb-1">AI Generated</p>
                    <p className="text-2xl lg:text-3xl xl:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        {aiProjectCount}
                    </p>
                </div>
                <div className="bg-primary/10 p-3 lg:p-4 rounded-xl text-primary shadow-lg group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
            </div>
        </CardContent>
    </Card>

    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <CardContent className="p-5 lg:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm lg:text-base text-muted-foreground mb-1">Due This Week</p>
                    <p className="text-2xl lg:text-3xl xl:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-accent">
                        {dueSoonProjectsCount}
                    </p>
                </div>
                <div className="bg-secondary/10 p-3 lg:p-4 rounded-xl text-secondary shadow-lg group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
            </div>
        </CardContent>
    </Card>

    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <CardContent className="p-5 lg:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm lg:text-base text-muted-foreground mb-1">Active Projects</p>
                    <p className="text-2xl lg:text-3xl xl:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary">
                        {projects.filter(p => !p.dueDate || new Date(p.dueDate) >= now).length}
                    </p>
                </div>
                <div className="bg-accent/10 p-3 lg:p-4 rounded-xl text-accent shadow-lg group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
            </div>
        </CardContent>
    </Card>
</div>

        {/* Projects Grid - 4 Column Desktop Layout with Equal Height Cards */}
        <Card className="border-0 shadow-xl overflow-hidden">
            <CardHeader className="border-b bg-muted/30 p-5 lg:p-6 xl:p-7">
                <div>
                    <CardTitle className="text-lg lg:text-xl xl:text-2xl flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                        All Projects
                    </CardTitle>
                    <CardDescription className="text-sm lg:text-base">
                        Browse and manage all your projects and practical assignments
                    </CardDescription>
                </div>
            </CardHeader>
            
            <CardContent className="p-5 lg:p-6 xl:p-7">
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6 xl:gap-7">
                        {projects.map((project) => (
                            <div 
                                key={project._id} 
                                className="group relative bg-card rounded-xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
                            >
                                {/* Gradient Top Border */}
                                <div className={`absolute top-0 left-0 right-0 h-1 ${pageGradientClass}`}></div>
                                
                                {/* Action Buttons */}
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <Button 
                                        size="icon" 
                                        variant="outline" 
                                        className="h-8 w-8 bg-background/90 backdrop-blur-sm hover:bg-background shadow-md rounded-full"
                                        onClick={() => setPreviewProject(project)}
                                    >
                                        <Eye className="h-4 w-4 text-primary" />
                                    </Button>
                                    <Button 
                                        size="icon" 
                                        variant="destructive" 
                                        className="h-8 w-8 shadow-md rounded-full"
                                        onClick={() => handleDeleteProject(project._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Type Badge */}
                                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                                    <Badge className="bg-primary text-primary-foreground border-0 text-xs">
                                        {project.type || 'Project'}
                                    </Badge>
                                    {project.isAiGenerated && (
                                        <Badge className="bg-primary text-primary-foreground border-0 text-xs">
                                            <Sparkles className="w-3 h-3 mr-1" /> AI
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <CardHeader className="pt-12 pb-3 px-4">
                                        <CardTitle className="text-base lg:text-lg font-bold line-clamp-2 min-h-[3rem] lg:min-h-[3.5rem]">
                                            {project.title}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 text-xs">
                                            {project.dueDate && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Due: {new Date(project.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-3 px-4 pb-4 flex-1">
                                        {/* Description Preview */}
                                        {project.description && (
                                            <div className="text-sm text-muted-foreground line-clamp-3 prose prose-sm dark:prose-invert max-w-none"
                                                 dangerouslySetInnerHTML={{ 
                                                     __html: project.description.length > 150 
                                                         ? project.description.substring(0, 150) + '...' 
                                                         : project.description 
                                                 }} 
                                            />
                                        )}

                                        {/* Guidance Preview */}
                                        {project.guidance && (
                                            <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-muted">
                                                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                                                    <Briefcase className="w-3 h-3" />
                                                    Guidance Preview:
                                                </p>
                                                <div className="text-xs line-clamp-2 prose prose-sm dark:prose-invert max-w-none"
                                                     dangerouslySetInnerHTML={{ 
                                                         __html: project.guidance.length > 100 
                                                             ? project.guidance.substring(0, 100) + '...' 
                                                             : project.guidance 
                                                     }} />
                                            </div>
                                        )}

                                        {/* Subtopics/Tags */}
                                        {project.subtopics && project.subtopics.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {project.subtopics.slice(0, 3).map((tag, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs bg-muted/30 px-2 py-0.5">
                                                        {tag.length > 15 ? tag.substring(0, 12) + '...' : tag}
                                                    </Badge>
                                                ))}
                                                {project.subtopics.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{project.subtopics.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        {/* Footer - Push to bottom */}
                                        <div className="flex justify-between items-center pt-3 mt-auto border-t text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5" />
                                                {getDepartmentLabel(project.department) || 'All'}
                                            </span>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-primary hover:text-white p-0 h-auto text-sm"
                                                onClick={() => setPreviewProject(project)}
                                            >
                                                View Details
                                                <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 lg:py-20 text-center border-2 border-dashed rounded-xl bg-muted/10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-brand-gradient p-4 lg:p-5 rounded-full shadow-lg">
                                <Briefcase className="w-8 h-8 lg:w-10 lg:h-10 text-primary-foreground" />
                            </div>
                            <h3 className="text-lg lg:text-xl font-semibold">No Projects Yet</h3>
                            <p className="text-sm lg:text-base text-muted-foreground max-w-md">
                                Get started by creating your first project. Click the button below to create a structured project with AI assistance.
                            </p>
                            <Button 
                                onClick={() => setOpenProjectDialog(true)}
                                className="bg-brand-gradient text-primary-foreground text-sm lg:text-base"
                            >
                                <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                                Create Your First Project
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Project Creation Dialog - Desktop Optimized */}
        <Dialog open={openProjectDialog} onOpenChange={(open) => {
            setOpenProjectDialog(open);
            if (!open) resetProjectForm();
        }}>
            <DialogTrigger asChild>
                <div className="hidden">Trigger</div>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-5xl max-h-[90vh] overflow-y-auto p-6 lg:p-8">
                <DialogHeader>
            <DialogTitle className={`text-2xl lg:text-3xl font-bold ${pageGradientTextClass}`}>
                Create New Project / Practical
            </DialogTitle>
                    <DialogDescription className="text-base lg:text-lg">
                        Build structured assignments with AI assistance and detailed guidance
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 lg:gap-8 py-4">
                    {/* AI Generation Section */}
                    <div className="bg-muted/30 rounded-xl p-5 lg:p-6 border border-border">
                        <div className="flex flex-col lg:flex-row items-start gap-5">
                            <div className="bg-brand-gradient p-3 lg:p-4 rounded-xl shadow-lg">
                                <Sparkles className="w-6 h-6 lg:w-7 lg:h-7 text-primary-foreground" />
                            </div>
                            <div className="flex-1 w-full">
                                <h3 className="text-lg lg:text-xl font-semibold mb-2">AI Content Generator</h3>
                                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                                    Enter a topic and let AI generate a complete project structure with phases, steps, and requirements.
                                </p>
                                <div className="flex flex-col lg:flex-row gap-3">
                                    <Input 
                                        placeholder="e.g., IoT based Smart Waste Management System" 
                                        value={projectAiTopic} 
                                        onChange={(e) => setProjectAiTopic(e.target.value)}
                                        className="bg-background flex-1 text-base"
                                    />
                                    <Button 
                                        type="button" 
                                        onClick={handleGenerateProjectContent}
                                        disabled={isGeneratingProject}
                                        className="bg-brand-gradient text-primary-foreground whitespace-nowrap text-base"
                                    >
                                        {isGeneratingProject ? "Generating..." : "Generate with AI"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                            Basic Information
                        </h3>
                        <div className="grid gap-4">
                            <div>
                                <Label className="text-base font-semibold">Project Title *</Label>
                                <Input 
                                    value={newProject.title} 
                                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} 
                                    placeholder="e.g., Building a Complete E-Learning Platform"
                                    className="mt-1 text-base"
                                />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-base font-semibold">Project Type</Label>
                                    <select
                                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base mt-1"
                                        value={newProject.type}
                                        onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                                    >
                                        <option value="Project">Project</option>
                                        <option value="Practical">Practical</option>
                                        <option value="Research">Research</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-base font-semibold">Due Date</Label>
                                    <Input 
                                        type="date" 
                                        value={newProject.dueDate} 
                                        onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })} 
                                        className="mt-1 text-base"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project Overview */}
                    <div>
                        <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center gap-2">
                            <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                            Project Overview
                        </h3>
                        <RichTextEditor
                            value={newProject.description || ''}
                            onChange={(content) => setNewProject({ ...newProject, description: content })}
                            placeholder="Write a comprehensive project overview including goals, objectives, and expected outcomes..."
                            className="min-h-[200px] lg:min-h-[250px]"
                        />
                    </div>

                    {/* Project Guidance */}
                    <div>
                        <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                            Project Guidance & Implementation Steps
                        </h3>
                        <div className="border-2 rounded-xl overflow-hidden">
                            <RichTextEditor
                                value={newProject.guidance || ''}
                                onChange={(content) => setNewProject({ ...newProject, guidance: content })}
                                placeholder="Add detailed guidance with phases, steps, and requirements..."
                                className="min-h-[450px] lg:min-h-[500px]"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center gap-2">
                            <Tag className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                            Tags & Topics
                        </h3>
                        <div className="flex flex-col lg:flex-row gap-3">
                            <Input 
                                ref={subtopicInputRef}
                                placeholder="Add tags (e.g., PHP, MySQL, Authentication)" 
                                className="flex-1 text-base"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = e.currentTarget.value.trim();
                                        if (val) {
                                            setNewProject({ ...newProject, subtopics: [...newProject.subtopics, val] });
                                            e.currentTarget.value = '';
                                        }
                                        e.preventDefault();
                                    }
                                }}
                            />
                            <Button 
                                type="button" 
                                variant="outline"
                                className="text-base"
                                onClick={() => {
                                    if (subtopicInputRef.current && subtopicInputRef.current.value.trim()) {
                                        setNewProject({ 
                                            ...newProject, 
                                            subtopics: [...newProject.subtopics, subtopicInputRef.current.value.trim()] 
                                        });
                                        subtopicInputRef.current.value = '';
                                    }
                                }}
                            >
                                Add Tag
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {newProject.subtopics.map((st, i) => (
                                <Badge key={i} variant="secondary" className="flex items-center gap-1 py-1.5 px-3 text-sm">
                                    {st}
                                    <X className="w-3 h-3 cursor-pointer hover:text-destructive ml-1" onClick={() => setNewProject({ ...newProject, subtopics: newProject.subtopics.filter((_, idx) => idx !== i) })} />
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Department */}
                    <div>
                        <Label className="text-base font-semibold">Department (Optional)</Label>
                        <select
                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base mt-1"
                            value={newProject.department}
                            onChange={(e) => setNewProject({ ...newProject, department: e.target.value })}
                            disabled={role === 'dept_admin'}
                        >
                            {role !== 'dept_admin' && <option value="">All Students</option>}
                            {departmentsList.map((d) => (
                                <option key={d._id} value={d._id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <Button 
                        onClick={handleCreateProject} 
                        className="w-full h-12 lg:h-14 text-base lg:text-lg font-bold bg-brand-gradient text-primary-foreground"
                        // className="bg-brand-gradient text-primary-foreground"
                    >
                        <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                        Publish Project
                    </Button>
                </div>
            </DialogContent>
        </Dialog>

        {/* Project Preview Dialog - Desktop Optimized */}
        <Dialog open={!!previewProject} onOpenChange={(open) => !open && setPreviewProject(null)}>
            <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto p-6 lg:p-8">
                <DialogHeader>
            <DialogTitle className={`text-2xl lg:text-3xl font-bold ${pageGradientTextClass}`}>
                {previewProject?.title}
            </DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-3 text-base">
                <Badge className="bg-brand-gradient text-primary-foreground border-0 text-sm">
                    {previewProject?.type || 'Project'}
                </Badge>
                {previewProject?.isAiGenerated && (
                    <Badge variant="outline" className="bg-secondary/10 text-secondary-foreground border-border text-sm">
                        <Sparkles className="w-3 h-3 mr-1" /> AI Generated
                    </Badge>
                )}
                        <span>•</span>
                        <span>Dept: {getDepartmentLabel(previewProject?.department) || 'All'}</span>
                        {previewProject?.dueDate && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Due: {new Date(previewProject.dueDate).toLocaleDateString()}
                                </span>
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>
                
                {previewProject && (
                    <div className="space-y-6 lg:space-y-8 py-4">
                        {previewProject?.description && (
                            <div>
                                <h3 className="text-lg lg:text-xl font-semibold mb-3 flex items-center gap-2">
                                    <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                                    Project Overview
                                </h3>
                                <div className="prose prose-base lg:prose-lg dark:prose-invert max-w-none p-5 lg:p-6 bg-muted/20 rounded-xl border"
                                     dangerouslySetInnerHTML={{ __html: previewProject.description }} />
                            </div>
                        )}
                        
                        {previewProject?.guidance && (
                            <div>
                                <h3 className="text-lg lg:text-xl font-semibold mb-3 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                                    Implementation Steps
                                </h3>
                                <div className="prose prose-base lg:prose-lg dark:prose-invert max-w-none p-5 lg:p-6 bg-muted/20 rounded-xl border"
                                     dangerouslySetInnerHTML={{ __html: previewProject.guidance }} />
                            </div>
                        )}
                        
                        {previewProject?.subtopics?.length > 0 && (
                            <div>
                                <h3 className="text-lg lg:text-xl font-semibold mb-3 flex items-center gap-2">
                                    <Tag className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                                    Tags
                                </h3>
                                <div className="flex flex-wrap gap-2 p-4 lg:p-5 bg-muted/20 rounded-xl border">
                                    {previewProject.subtopics.map((st, i) => (
                                        <Badge key={i} variant="secondary" className="py-1.5 px-3 text-sm">
                                            {st}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    </div>
);
};

export default ProjectTab;
