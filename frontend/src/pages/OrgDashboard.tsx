import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Bell, Plus, Upload, Search, Trash2, DollarSign, CheckCircle, RotateCcw, BarChart, Sparkles, ChevronDown, ChevronUp, Check, X, Clock, Video, Briefcase, Download, ExternalLink, Eye, TrendingUp, Award } from 'lucide-react';
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

const CourseForm = ({ course, setCourse, onSave, isEdit = false, departments = [], role }: any) => {
    if (!course) return null;
    const [expandedTopic, setExpandedTopic] = useState<number | null>(null);

    const updateTopic = (index: number, field: string, value: any) => {
        const updatedTopics = [...course.topics];
        updatedTopics[index] = { ...updatedTopics[index], [field]: value };
        setCourse({ ...course, topics: updatedTopics });
    };

    const removeTopic = (index: number) => {
        const updatedTopics = course.topics.filter((_: any, i: number) => i !== index);
        setCourse({ ...course, topics: updatedTopics });
    };

    const updateSubtopic = (topicIndex: number, subIndex: number, field: string, value: any) => {
        const updatedTopics = [...course.topics];
        let finalValue = value;

        // Extract YouTube ID if it's a videoUrl
        if (field === 'videoUrl' && value) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = value.match(regExp);
            if (match && match[2].length === 11) {
                finalValue = match[2];
            }
        }

        updatedTopics[topicIndex].subtopics[subIndex] = { ...updatedTopics[topicIndex].subtopics[subIndex], [field]: finalValue };
        setCourse({ ...course, topics: updatedTopics });
    };

    const removeSubtopic = (topicIndex: number, subIndex: number) => {
        const updatedTopics = [...course.topics];
        updatedTopics[topicIndex].subtopics = updatedTopics[topicIndex].subtopics.filter((_: any, i: number) => i !== subIndex);
        setCourse({ ...course, topics: updatedTopics });
    };

    const updateQuiz = (index: number, field: string, value: any) => {
        const updatedQuizzes = [...course.quizzes];
        if (field === 'option') {
            updatedQuizzes[index].options[value.optIndex] = value.text;
        } else {
            updatedQuizzes[index] = { ...updatedQuizzes[index], [field]: value };
        }
        setCourse({ ...course, quizzes: updatedQuizzes });
    };

    const removeQuiz = (index: number) => {
        const updatedQuizzes = course.quizzes.filter((_: any, i: number) => i !== index);
        setCourse({ ...course, quizzes: updatedQuizzes });
    };


    return (
        <div className="space-y-8 py-4 px-1 max-w-4xl mx-auto">
            {/* Basic Information */}
            <div className="space-y-4">
                <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Basic Information</h3>
                    <p className="text-sm text-muted-foreground">Essential details about your course.</p>
                </div>
                <div className="grid gap-6 p-5 border rounded-xl bg-card shadow-sm">
                    <div className="grid gap-3">
                        <Label className="text-sm font-medium">Course Title <span className="text-destructive">*</span></Label>
                        <Input className="h-11 text-base bg-muted/50 focus:bg-background transition-colors" value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} placeholder="e.g., Complete Python Developer in 2024" />
                    </div>
                    <div className="grid gap-3">
                        <Label className="text-sm font-medium">Course Overview</Label>
                        <RichTextEditor
                            value={course.description || ''}
                            onChange={(content) => setCourse({ ...course, description: content })}
                            placeholder="Write a compelling description..."
                            className="min-h-[160px] border-muted/60"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                            <Label className="text-sm font-medium">Assign to Department</Label>
                            <select
                                className="flex h-11 w-full rounded-md border border-input bg-muted/50 focus:bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={course.department}
                                onChange={(e) => setCourse({ ...course, department: e.target.value })}
                            >
                                {role !== 'dept_admin' && <option value="">All Students (Default)</option>}
                                {departments.map((d: any) => (
                                    <option key={d._id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-3">
                            <Label className="text-sm font-medium">Course Type</Label>
                            <select
                                className="flex h-11 w-full rounded-md border border-input bg-muted/50 focus:bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={course.type || 'video & text course'}
                                onChange={(e) => setCourse({ ...course, type: e.target.value })}
                            >
                                <option value="video & text course">Video & Text Course</option>
                                <option value="image & text course">Image & Text Course</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Curriculum */}
            <div className="space-y-4">
                <div className="border-b pb-2 flex justify-between items-end">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2"><Video className="w-5 h-5 text-blue-500" /> Curriculum Setup</h3>
                        <p className="text-sm text-muted-foreground">Structure your course into lessons and topics.</p>
                    </div>
                    <Button type="button" size="sm" onClick={() => {
                        const topic = { title: '', subtopics: [], order: course.topics.length };
                        setCourse({ ...course, topics: [...course.topics, topic] });
                        setExpandedTopic(course.topics.length);
                    }}>
                        <Plus className="w-4 h-4 mr-2" /> Add Lesson
                    </Button>
                </div>

                <div className="space-y-4">
                    {course.topics.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/10">
                            <Video className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p>No lessons added yet.</p>
                        </div>
                    )}
                    {course.topics.map((topic: any, tIdx: number) => (
                        <div key={tIdx} className="border rounded-xl bg-card shadow-sm overflow-hidden transition-all duration-200">
                            <div
                                className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${expandedTopic === tIdx ? 'bg-primary/5 border-b' : 'hover:bg-muted/50'}`}
                                onClick={() => setExpandedTopic(expandedTopic === tIdx ? null : tIdx)}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                        {tIdx + 1}
                                    </div>
                                    <Input
                                        className="h-9 max-w-md bg-transparent border-transparent hover:border-input focus:bg-background focus:border-input font-semibold text-base transition-all"
                                        value={topic.title}
                                        onChange={(e) => updateTopic(tIdx, 'title', e.target.value)}
                                        placeholder="Lesson Title"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <Badge variant="secondary" className="mr-2">{topic.subtopics.length} items</Badge>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setExpandedTopic(expandedTopic === tIdx ? null : tIdx); }}>
                                        {expandedTopic === tIdx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); removeTopic(tIdx); }}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                            </div>

                            {expandedTopic === tIdx && (
                                <div className="p-5 space-y-6 bg-muted/10">
                                    {topic.subtopics.length === 0 && (
                                        <p className="text-sm text-center text-muted-foreground py-2 tracking-wide uppercase font-medium">No contents in this lesson</p>
                                    )}
                                    {topic.subtopics.map((sub: any, sIdx: number) => (
                                        <div key={sIdx} className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-border last:before:bottom-auto last:before:h-2">
                                            <div className="absolute left-1.5 top-2 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background z-10"></div>
                                            <div className="bg-card border rounded-lg p-4 shadow-sm hover:border-primary/30 transition-colors space-y-4">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1 space-y-1">
                                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Subtopic Title</Label>
                                                        <Input
                                                            className="font-medium h-9 focus-visible:ring-1"
                                                            value={sub.title}
                                                            onChange={(e) => updateSubtopic(tIdx, sIdx, 'title', e.target.value)}
                                                            placeholder="What will students learn?"
                                                        />
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0 mt-5" onClick={() => removeSubtopic(tIdx, sIdx)}><Trash2 className="w-4 h-4" /></Button>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Video Link (Optional)</Label>
                                                    <div className="flex items-center relative">
                                                        <Video className="w-4 h-4 absolute left-3" style={{ color: '#ff0000' }} />
                                                        <Input
                                                            className="h-9 pl-9"
                                                            value={sub.videoUrl || ''}
                                                            onChange={(e) => updateSubtopic(tIdx, sIdx, 'videoUrl', e.target.value)}
                                                            placeholder="YouTube Video URL"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Learning Material</Label>
                                                    <RichTextEditor
                                                        value={sub.content || ''}
                                                        onChange={(content) => updateSubtopic(tIdx, sIdx, 'content', content)}
                                                        placeholder="Add comprehensive text, code blocks, or images here..."
                                                        className="min-h-[200px]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => {
                                        const updated = [...course.topics];
                                        updated[tIdx].subtopics.push({ title: '', content: '', videoUrl: '', order: 0 });
                                        setCourse({ ...course, topics: updated });
                                    }}>
                                        <Plus className="w-4 h-4 mr-2 text-primary" /> Add Subtopic Item
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Quizzes */}
            <div className="space-y-4 pt-4 border-t">
                <div className="border-b pb-2 flex justify-between items-end">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" /> Assessment Quizzes</h3>
                        <p className="text-sm text-muted-foreground">Add multiple choice questions to test knowledge.</p>
                    </div>
                    <Button type="button" size="sm" variant="secondary" onClick={() => {
                        const quiz = { question: '', options: ['', '', '', ''], answer: '', explanation: '' };
                        setCourse({ ...course, quizzes: [...course.quizzes, quiz] });
                    }}>
                        <Plus className="w-4 h-4 mr-2" /> Add Question
                    </Button>
                </div>

                <div className="grid gap-4">
                    {course.quizzes.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/10">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p>No quiz questions added yet.</p>
                        </div>
                    )}
                    {course.quizzes.map((quiz: any, qIdx: number) => (
                        <div key={qIdx} className="p-5 border rounded-xl shadow-sm bg-card hover:border-emerald-500/30 transition-colors">
                            <div className="flex justify-between items-start gap-4 mb-4">
                                <div className="flex-1 space-y-1.5">
                                    <Label className="text-sm text-muted-foreground font-semibold flex items-center gap-2">
                                        <span className="bg-muted px-2 py-0.5 rounded text-xs text-foreground">Q{qIdx + 1}</span>
                                        Question Text
                                    </Label>
                                    <Textarea
                                        className="font-medium text-base resize-y min-h-[80px] focus-visible:ring-emerald-500/50"
                                        value={quiz.question}
                                        onChange={(e) => updateQuiz(qIdx, 'question', e.target.value)}
                                        placeholder="What is..."
                                    />
                                </div>
                                <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeQuiz(qIdx)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {quiz.options.map((opt: string, oIdx: number) => {
                                    const isCorrect = quiz.answer === opt && opt !== '';
                                    return (
                                        <div key={oIdx} className={`flex items-center gap-2 p-2 px-3 border rounded-lg transition-colors ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-muted/30 border-transparent hover:border-input'}`}>
                                            <Button
                                                size="icon"
                                                variant={isCorrect ? 'default' : 'outline'}
                                                className={`h-7 w-7 rounded-full shrink-0 ${isCorrect ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                                                onClick={() => updateQuiz(qIdx, 'answer', opt)}
                                                disabled={!opt.trim()}
                                                title="Mark as correct answer"
                                            >
                                                <Check className={`w-3.5 h-3.5 ${isCorrect ? 'text-white' : 'opacity-30'}`} />
                                            </Button>
                                            <Input
                                                className={`h-9 border-none shadow-none focus-visible:ring-0 ${isCorrect ? 'bg-transparent text-emerald-900 font-medium' : 'bg-transparent'}`}
                                                value={opt}
                                                onChange={(e) => updateQuiz(qIdx, 'option', { optIndex: oIdx, text: e.target.value })}
                                                placeholder={`Option ${oIdx + 1}`}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-1.5 bg-muted/30 p-3 rounded-lg border border-dashed">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Explanation (Optional)</Label>
                                <Input
                                    value={quiz.explanation}
                                    onChange={(e) => updateQuiz(qIdx, 'explanation', e.target.value)}
                                    placeholder="Explain why the answer is correct..."
                                    className="h-9 bg-background/50 border-transparent focus:border-input focus:bg-background"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t pb-8">
                <Button className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20" size="lg" onClick={onSave}>
                    {isEdit ? 'Save Changes' : 'Publish Course'} <ExternalLink className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
};

const OrgDashboard = () => {
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
    const [stats, setStats] = useState<{ studentCount: number; assignmentCount: number; submissionCount: number; placedCount: number }>({ studentCount: 0, assignmentCount: 0, submissionCount: 0, placedCount: 0 });
    const [students, setStudents] = useState([]); // Simplified for now
    const [assignments, setAssignments] = useState([]);
    const [notices, setNotices] = useState([]);
    const [courses, setCourses] = useState([]);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', department: '', section: '', studentClass: '', rollNo: '', academicYear: '' });
    const [editStudent, setEditStudent] = useState<any>(null);
    const [placementStudent, setPlacementStudent] = useState<any>(null);
    const [newAssignment, setNewAssignment] = useState({ topic: '', description: '', dueDate: '', department: '' });
    const [editAssignment, setEditAssignment] = useState<any>(null); // New state for editing assignments
    const [newNotice, setNewNotice] = useState({ title: '', content: '', audience: 'all', department: '' });
    const [newCourse, setNewCourse] = useState<any>({ title: '', description: '', department: '', topics: [], quizzes: [] });
    const [editCourse, setEditCourse] = useState<any>(null);
    const [editAICourse, setEditAICourse] = useState<any>(null);
    const [previewCourse, setPreviewCourse] = useState<any>(null);
    const [orgSettings, setOrgSettings] = useState<any>(null);
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');
    const [courseSearch, setCourseSearch] = useState('');

    // New features state
    const [meetings, setMeetings] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [openMeetingDialog, setOpenMeetingDialog] = useState(false);
    const [openProjectDialog, setOpenProjectDialog] = useState(false);
    const [newMeeting, setNewMeeting] = useState({ title: '', link: '', platform: 'google-meet', date: '', time: '', department: '' });
    const [newProject, setNewProject] = useState({ title: '', description: '', type: 'Project', department: '', dueDate: '' });

    // Departments & Dept Admins
    const [departmentsList, setDepartmentsList] = useState<any[]>([]);
    const [deptAdmins, setDeptAdmins] = useState<any[]>([]);
    const [newDept, setNewDept] = useState({ name: '', description: '' });
    const [newDeptAdmin, setNewDeptAdmin] = useState({ name: '', email: '', password: '', phone: '', departmentId: '' });
    // const [newMaterial, setNewMaterial] = useState({ title: '', description: '', fileUrl: '', type: 'PDF', department: '' });
    const [newMaterial, setNewMaterial] = useState({
        title: '',
        description: '',
        fileUrl: '',
        file: null,
        type: 'PDF',
        department: ''
    });

    const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');
    const [userDeptName, setUserDeptName] = useState('');
    const [userDeptId, setUserDeptId] = useState(deptId || '');
    const getDeptScopedDepartment = () => (role === 'dept_admin' ? (userDeptId || deptId || '') : '');
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
        fetchOrgSettings();
        fetchMeetings();
        fetchProjects();
        fetchMaterials();
        fetchOrgDepartments();
        fetchOrgDeptAdmins();
        fetchNotices();
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
        }
    }, [userDeptName, deptId, role]);

    useEffect(() => {
        // Find department name if missing but ID exists
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

    const handleCreateDepartment = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/department/create`, {
                ...newDept,
                organizationId: orgId
            });

            if (res.data.success) {
                toast({ title: "Success", description: "Department created" });

                setNewDept({ name: '', description: '' });

                setOpenDeptDialog(false);   // ⭐ CLOSE POPUP

                fetchOrgDepartments();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to create department" });
        }
    };

    const handleDeleteDepartment = async (id: string) => {
        if (!confirm('Delete this department?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/department/${id}`);
            if (res.data.success) {
                toast({ title: "Success", description: "Department deleted" });
                fetchOrgDepartments();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete department" });
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
                    departmentId: ''
                });

                setOpenDeptAdminDialog(false);   // ⭐ CLOSE POPUP

                fetchOrgDeptAdmins();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to add dept admin" });
        }
    };
    const handleDeleteDeptAdmin = async (id: string) => {
        if (!confirm('Delete this department admin?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/dept-admin/${id}`);
            if (res.data.success) {
                toast({ title: "Success", description: "Dept Admin deleted" });
                fetchOrgDeptAdmins();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete dept admin" });
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

    const handleCreateMeeting = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/meeting/create`, { ...newMeeting, organizationId: orgId });
            if (res.data.success) {
                toast({ title: "Success", description: "Meeting scheduled successfully" });

                setNewMeeting({
                    title: '',
                    link: '',
                    platform: 'google-meet',
                    date: '',
                    time: '',
                    department: ''
                });

                setOpenMeetingDialog(false); // close popup

                fetchMeetings();
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.response?.data?.message || "Failed to schedule meeting" });
        }
    };

    const handleDeleteMeeting = async (id: string) => {
        if (!confirm('Delete this meeting?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/meeting/${id}`);
            if (res.data.success) {
                toast({ title: "Success", description: "Meeting deleted" });
                fetchMeetings();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete meeting" });
        }
    };

    const handleCreateProject = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/project/create`, { ...newProject, organizationId: orgId });
            if (res.data.success) {
                toast({ title: "Success", description: "Project/Practical added" });

                setNewProject({
                    title: '',
                    description: '',
                    type: 'Project',
                    department: '',
                    dueDate: ''
                });

                setOpenProjectDialog(false); // close popup

                fetchProjects();
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.response?.data?.message || "Failed to add project" });
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm('Delete this project?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/project/${id}`);
            if (res.data.success) {
                toast({ title: "Success", description: "Project deleted" });
                fetchProjects();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete project" });
        }
    };

    const handleCreateMaterial = async () => {
        try {
            let res;

            if (newMaterial.type === 'PDF' && newMaterial.file) {
                const formData = new FormData();
                formData.append('title', newMaterial.title);
                formData.append('description', newMaterial.description);
                formData.append('type', newMaterial.type);
                formData.append('department', newMaterial.department);
                formData.append('organizationId', orgId);
                formData.append('file', newMaterial.file);

                res = await axios.post(
                    `${serverURL}/api/org/material/create`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            } else {
                res = await axios.post(`${serverURL}/api/org/material/create`, {
                    ...newMaterial,
                    organizationId: orgId,
                });
            }

            if (res.data.success) {
                toast({ title: "Success", description: "Material added successfully" });

                setNewMaterial({
                    title: '',
                    description: '',
                    fileUrl: '',
                    file: null,
                    type: 'PDF',
                    department: getDeptScopedDepartment()
                });

                setOpenMaterialDialog(false);   // ⭐ CLOSE POPUP

                fetchMaterials();
            }

        } catch (e) {
            toast({ title: "Error", description: "Failed to add material" });
        }
    };

    const handleDeleteMaterial = async (id: string) => {
        if (!confirm('Delete this material?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/material/${id}`);
            if (res.data.success) {
                toast({ title: "Success", description: "Material deleted" });
                fetchMaterials();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete material" });
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

    const fetchOrgSettings = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/details/${orgId}`);
            if (res.data.success) {
                setOrgSettings(res.data.organization);
            }
        } catch (e) {
            console.error("Failed to fetch org settings", e);
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
            }
        } catch (e) {
            console.error(e);
        }
    }

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

    const handleAddStudent = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/student/add`, { ...newStudent, organizationId: orgId });
            if (res.data.success) {
                toast({ title: "Success", description: "Student added successfully" });
                setNewStudent({ name: '', email: '', password: '', department: '', section: '', studentClass: '', rollNo: '', academicYear: '' });
                setOpenStudentDialog(false);   // ⭐ CLOSE POPUP
                fetchStudents(); // Refresh the student list
                fetchStats(); // Refresh stats
            } else {
                toast({ title: "Error", description: res.data.message });
            }
        } catch (e: any) {
            console.error(e);
            toast({ title: "Error", description: e.response?.data?.message || "Request failed" });
        }
    };

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
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/assignment/${id}`);
            if (res.data.success) {
                toast({ title: 'Success', description: 'Assignment deleted successfully' });
                fetchAssignments();
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete assignment' });
        }
    };

    const handleCreateCourse = async (courseData) => {
        try {
            const res = await axios.post(`${serverURL}/api/org/course/create`, {
                ...courseData,
                organizationId: orgId,
                createdBy: sessionStorage.getItem('uid')
            });

            if (res.data.success) {
                toast({ title: "Success", description: "Course created successfully" });

                setNewCourse({
                    title: '',
                    description: '',
                    department: '',
                    topics: [],
                    quizzes: []
                });

                setOpenCourseDialog(false);   // ⭐ CLOSE POPUP

                fetchCourses();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to create course" });
        }
    };

    const handleUpdateCourse = async () => {
        if (!editCourse) return;
        try {
            const res = await axios.put(`${serverURL}/api/org/course/${editCourse._id}`, editCourse);
            if (res.data.success) {
                toast({ title: "Success", description: "Course updated successfully" });
                setEditCourse(null);
                fetchCourses();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to update course" });
        }
    };

    const handleUpdateAICourse = async () => {
        if (!editAICourse) return;
        console.log("Attempting to update AI course:", editAICourse);
        console.log("Course ID:", editAICourse._id);
        console.log("Update URL:", `${serverURL}/api/org/course/${editAICourse._id}`);

        try {
            const res = await axios.put(`${serverURL}/api/org/course/${editAICourse._id}`, {
                mainTopic: editAICourse.mainTopic,
                department: editAICourse.department
            });
            console.log("Update response:", res.data);
            if (res.data.success) {
                toast({ title: "Success", description: "AI Course updated successfully" });
                setEditAICourse(null);
                fetchCourses();
            } else {
                toast({ title: "Error", description: res.data.message || "Failed to update AI course" });
            }
        } catch (e: any) {
            console.error("Update AI course error:", e);
            console.error("Error response:", e.response?.data);
            const errorMessage = e.response?.data?.message || e.message || "Failed to update AI course";
            toast({ title: "Error", description: errorMessage });
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/course/${courseId}`);
            if (res.data.success) {
                toast({ title: "Success", description: "Course deleted successfully" });
                fetchCourses();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete course" });
        }
    };

    const addTopic = (isEdit: boolean = false) => {
        const topic = { title: '', subtopics: [], order: isEdit ? editCourse.topics.length : newCourse.topics.length };
        if (isEdit) {
            setEditCourse({ ...editCourse, topics: [...editCourse.topics, topic] });
        } else {
            setNewCourse({ ...newCourse, topics: [...newCourse.topics, topic] });
        }
    };

    const addSubtopic = (topicIndex: number, isEdit: boolean = false) => {
        const subtopic = { title: '', content: '', order: 0 };
        if (isEdit) {
            const updatedTopics = [...editCourse.topics];
            updatedTopics[topicIndex].subtopics.push(subtopic);
            setEditCourse({ ...editCourse, topics: updatedTopics });
        } else {
            const updatedTopics = [...newCourse.topics];
            updatedTopics[topicIndex].subtopics.push(subtopic);
            setNewCourse({ ...newCourse, topics: updatedTopics });
        }
    };

    const addQuiz = (isEdit: boolean = false) => {
        const quiz = { question: '', options: ['', '', '', ''], answer: '', explanation: '' };
        if (isEdit) {
            setEditCourse({ ...editCourse, quizzes: [...editCourse.quizzes, { ...quiz }] });
        } else {
            setNewCourse({ ...newCourse, quizzes: [...newCourse.quizzes, { ...quiz }] });
        }
    };

    const departments = Array.from(new Set(students.map((s: any) => s.studentDetails?.department).filter(Boolean)));

    const handleUpdateStudent = async () => {
        if (!editStudent) return;
        try {
            const res = await axios.put(`${serverURL}/api/org/student/${editStudent._id}`, {
                name: editStudent.mName,
                email: editStudent.email,
                department: editStudent.studentDetails?.department,
                section: editStudent.studentDetails?.section,
                rollNo: editStudent.studentDetails?.rollNo,
                studentClass: editStudent.studentDetails?.studentClass,
                academicYear: editStudent.studentDetails?.academicYear,
            });
            if (res.data.success) {
                toast({ title: "Success", description: "Student updated successfully" });
                setEditStudent(null);
                fetchStudents();
            } else {
                toast({ title: "Error", description: res.data.message });
            }
        } catch (e: any) {
            console.error(e);
            toast({ title: "Error", description: e.response?.data?.message || "Request failed" });
        }
    };

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
                toast({ title: "Error", description: res.data.message });
            }
        } catch (e: any) {
            console.error(e);
            toast({ title: "Error", description: e.response?.data?.message || "Request failed" });
        }
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (!confirm('Are you sure you want to delete this student?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/student/${studentId}`);
            if (res.data.success) {
                toast({ title: "Success", description: "Student deleted successfully" });
                fetchStudents();
                fetchStats();
            } else {
                toast({ title: "Error", description: res.data.message });
            }
        } catch (e: any) {
            console.error(e);
            toast({ title: "Error", description: e.response?.data?.message || "Request failed" });
        }
    };

    const handleCreateNotice = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/notice/create`, { ...newNotice, organizationId: orgId });
            if (res.data.success) {
                toast({ title: "Success", description: "Notice posted" });
                setNewNotice({
                    title: '',
                    content: '',
                    audience: 'all',
                    department: getDeptScopedDepartment()
                });
                fetchNotices();
            }
        } catch (e) {
            toast({ title: "Error", description: "Request failed" });
        }
    };

    const handleDeleteNotice = async (id: string) => {
        if (!confirm('Are you sure you want to delete this notice?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/notice/${id}`);
            if (res.data.success) {
                toast({ title: "Success", description: "Notice deleted" });
                fetchNotices();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete notice" });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    toast({ title: "Error", description: "The Excel file is empty", variant: "destructive" });
                    setIsUploading(false);
                    return;
                }

                // Map Excel columns to our expected format
                // Expected columns: Name, Email, Password, Department, Section, Roll No
                const studentsData = jsonData
                    .map((row: any) => ({
                        name: row.Name || row.name || '',
                        email: row.Email || row.email || '',
                        password: row.Password || row.password || 'Student@123', // Default password if empty
                        department: row.Department || row.department || '',
                        section: row.Section || row.section || '',
                        rollNo: row.RollNo || row['Roll No'] || row.rollno || '',
                        academicYear: row['Academic Year'] || row.AcademicYear || row.academicYear || ''
                    }))
                    .filter(student => student.name.trim() !== '' || student.email.trim() !== '');

                // Validate data
                const invalidRows = studentsData.filter(h => !h.email || !h.name);
                if (invalidRows.length > 0) {
                    toast({
                        title: "Warning",
                        description: `${invalidRows.length} rows are missing Name or Email and will likely fail.`,
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
                        description: `Successfully added ${res.data.message.split(' ')[1]} students.`
                    });
                    if (res.data.errors && res.data.errors.length > 0) {
                        toast({
                            title: "Note",
                            description: `${res.data.errors.length} rows were skipped (possibly existing emails).`,
                            variant: "destructive"
                        });
                    }
                    setIsBulkUploadOpen(false);
                    fetchStudents();
                    fetchStats();
                } else {
                    toast({ title: "Error", description: res.data.message, variant: "destructive" });
                }
            } catch (error) {
                console.error("Bulk upload error:", error);
                toast({ title: "Error", description: "Failed to process the Excel file", variant: "destructive" });
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const downloadTemplate = () => {
        const template = [
            { Name: 'John Doe', Email: 'john@example.com', Password: 'Password123', Department: 'CS', Section: 'A', 'Roll No': '101', 'Academic Year': '2024-2025' }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "student_bulk_upload_template.xlsx");
    };

    return (
        <div className="container mx-auto py-10 space-y-8 animate-fade-in">
            <SEO title="Organization Dashboard" description="Manage your organization, students, and curriculum." />

            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent border border-blue-600/10 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-md hover:border-blue-600/20">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-colors" />
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        Welcome back, {sessionStorage.getItem('mName') || 'Admin'}! <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                    </h2>
                    <p className="text-muted-foreground mt-2 text-lg">
                        {role === 'dept_admin' && userDeptName ? `Managing the ${userDeptName} department's growth and student success.` : "Manage your organization's growth and student success with ease."}
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        {role === 'dept_admin' && userDeptName ? `${userDeptName} Department Dashboard` : 'Organization Dashboard'}
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage students, assignments, and announcements</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                    <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Upload className="w-4 h-4 mr-2" /> Bulk Upload</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Bulk Student Upload</DialogTitle>
                                <DialogDescription>
                                    Upload an Excel file containing student details.
                                    Columns should be: **Name, Email, Password, Department, Section, Roll No**.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="excel-file">Choose Excel File</Label>
                                    <Input
                                        id="excel-file"
                                        type="file"
                                        accept=".xlsx, .xls"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                    {isUploading && <p className="text-sm text-primary animate-pulse">Processing upload...</p>}
                                </div>
                                <div className="p-4 bg-muted rounded-lg text-xs space-y-2">
                                    <p className="font-semibold">Instructions:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Download the template to see the correct format.</li>
                                        <li>Email must be unique for each student.</li>
                                        <li>If password is blank, "Student@123" will be used.</li>
                                    </ul>
                                </div>
                                <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full">
                                    Download Template
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    {/* <Button>Settings</Button> */}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

                <AdminStatCard
                    title="Total Students"
                    value={role === 'dept_admin' ? students.length : stats.studentCount}
                    icon={Users}
                    description="+20% from last month"
                    className="border-l-4 border-l-emerald-500"
                />
                <AdminStatCard
                    title="Active Assignments"
                    value={role === 'dept_admin' ? assignments.length : stats.assignmentCount}
                    icon={FileText}
                    description="5 due this week"
                    className="border-l-4 border-l-blue-500"
                />
                <AdminStatCard
                    title="Students Placed"
                    value={role === 'dept_admin' ? students.filter((s: any) => s.studentDetails?.isPlacementClosed).length : (stats.placedCount || 0)}
                    icon={Briefcase}
                    description="Career success"
                    className="border-l-4 border-l-indigo-500"
                />
                {role !== 'dept_admin' && (
                    <AdminStatCard
                        title="Submissions"
                        value={stats.submissionCount}
                        icon={BarChart}
                        description="Pending grading"
                        className="border-l-4 border-l-amber-500"
                    />
                )}
            </div>

            <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })} className="w-full">
                <TabsList className="flex flex-wrap h-auto w-full gap-1 p-1 bg-muted rounded-xl mb-6">
                    {role !== 'dept_admin' && (
                        <>
                            <TabsTrigger value="departments" className="flex-1 min-w-[120px]">Departments</TabsTrigger>
                            {/* <TabsTrigger value="students" className="flex-1 min-w-[120px]">Students</TabsTrigger> */}
                        </>
                    )}
                    <TabsTrigger value="students" className="flex-1 min-w-[120px]">Students</TabsTrigger>
                    <TabsTrigger value="courses" className="flex-1 min-w-[120px]">Courses</TabsTrigger>
                    <TabsTrigger value="assignments" className="flex-1 min-w-[120px]">Assignments</TabsTrigger>
                    <TabsTrigger value="meetings" className="flex-1 min-w-[120px]">Meetings</TabsTrigger>
                    <TabsTrigger value="projects" className="flex-1 min-w-[120px]">Projects/Research</TabsTrigger>
                    <TabsTrigger value="materials" className="flex-1 min-w-[120px]">Materials</TabsTrigger>
                    <TabsTrigger value="notices" className="flex-1 min-w-[120px]">Noticeboard</TabsTrigger>
                    <TabsTrigger value="career" className="flex-1 min-w-[120px]"><Briefcase className="w-3.5 h-3.5 mr-1" />Career & Placement</TabsTrigger>

                </TabsList>

                {/* DEPARTMENTS TAB */}
                <TabsContent value="departments" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Departments Management */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Departments</CardTitle>
                                    <CardDescription>Create and manage organizational departments.</CardDescription>
                                </div>
                                <Dialog open={openDeptDialog} onOpenChange={setOpenDeptDialog}>
                                    <DialogTrigger asChild onClick={() => setOpenDeptDialog(true)}>
                                        <Button size="sm">
                                            <Plus className="w-4 h-4 mr-2" /> Add Dept
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Department</DialogTitle>
                                        </DialogHeader>

                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label>Department Name</Label>
                                                <Input
                                                    value={newDept.name}
                                                    onChange={(e) =>
                                                        setNewDept({ ...newDept, name: e.target.value })
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={newDept.description}
                                                    onChange={(e) =>
                                                        setNewDept({ ...newDept, description: e.target.value })
                                                    }
                                                />
                                            </div>

                                            <Button onClick={handleCreateDepartment}>
                                                Create Department
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {departmentsList.length > 0 ? departmentsList.map((dept: any) => (
                                        <div key={dept._id} className="p-3 border rounded-lg flex justify-between items-center bg-muted/20">
                                            <div>
                                                <p className="font-semibold text-sm">{dept.name}</p>
                                                <p className="text-xs text-muted-foreground">{dept.description}</p>
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteDepartment(dept._id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )) : (
                                        <p className="text-center text-sm text-muted-foreground py-4">No departments created yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dept Admins Management */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Department Admins</CardTitle>
                                    <CardDescription>Assign admins to specific departments.</CardDescription>
                                </div>
                                <Dialog open={openDeptAdminDialog} onOpenChange={setOpenDeptAdminDialog}>
                                    <DialogTrigger asChild onClick={() => setOpenDeptAdminDialog(true)}>
                                        <Button size="sm">
                                            <Plus className="w-4 h-4 mr-2" /> Add Admin
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Department Admin</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label>Full Name</Label>
                                                <Input value={newDeptAdmin.name} onChange={(e) => setNewDeptAdmin({ ...newDeptAdmin, name: e.target.value })} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Email</Label>
                                                <Input value={newDeptAdmin.email} onChange={(e) => setNewDeptAdmin({ ...newDeptAdmin, email: e.target.value })} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Password</Label>
                                                <Input type="password" value={newDeptAdmin.password} onChange={(e) => setNewDeptAdmin({ ...newDeptAdmin, password: e.target.value })} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Department</Label>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={newDeptAdmin.departmentId}
                                                    onChange={(e) => setNewDeptAdmin({ ...newDeptAdmin, departmentId: e.target.value })}
                                                >
                                                    <option value="">Select Department</option>
                                                    {departmentsList.map((d: any) => (
                                                        <option key={d._id} value={d._id}>{d.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <Button onClick={handleAddDeptAdmin}>Add Admin</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {deptAdmins.length > 0 ? deptAdmins.map((admin: any) => (
                                        <div key={admin._id} className="p-3 border rounded-lg flex justify-between items-center bg-muted/20">
                                            <div>
                                                <p className="font-semibold text-sm">{admin.mName}</p>
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold uppercase tracking-wider">{admin.department?.name || 'No Dept'}</span>
                                                    <p className="text-xs text-muted-foreground">{admin.email}</p>
                                                </div>
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteDeptAdmin(admin._id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )) : (
                                        <p className="text-center text-sm text-muted-foreground py-4">No department admins assigned yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* STUDENTS TAB */}
                <TabsContent value="students" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Students</CardTitle>
                            <CardDescription>Add, view, and manage student accounts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <Input
                                    placeholder="Search students..."
                                    className="max-w-sm"
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                />
                                <Dialog open={openStudentDialog} onOpenChange={setOpenStudentDialog}>
                                    <DialogTrigger asChild onClick={() => setOpenStudentDialog(true)}>
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" /> Add Student
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Student</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Name</Label>
                                                <Input className="col-span-3" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Email</Label>
                                                <Input className="col-span-3" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Password</Label>
                                                <Input className="col-span-3" type="password" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Department</Label>
                                                <select
                                                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={newStudent.department}
                                                    onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                                                >
                                                    <option value="">Select Department</option>
                                                    {departmentsList.map((d: any) => (
                                                        <option key={d._id} value={d._id}>{d.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Class</Label>
                                                <Input className="col-span-3" value={newStudent.studentClass} onChange={(e) => setNewStudent({ ...newStudent, studentClass: e.target.value })} placeholder="e.g. 10th" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Section</Label>
                                                <Input className="col-span-3" value={newStudent.section} onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Academic Year</Label>
                                                <Input className="col-span-3" value={newStudent.academicYear} onChange={(e) => setNewStudent({ ...newStudent, academicYear: e.target.value })} placeholder="e.g. 2023-2024" />
                                            </div>
                                        </div>
                                        <Button onClick={handleAddStudent}>Save Student</Button>
                                    </DialogContent>
                                </Dialog>
                            </div>


                            {/* Student List */}
                            <div className="space-y-2">
                                {students.length > 0 ? (
                                    students.filter((s: any) =>
                                        (s.mName || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
                                        (s.email || '').toLowerCase().includes(studentSearch.toLowerCase())
                                    ).map((student: any) => (
                                        <div key={student._id} className="p-4 border rounded-lg flex justify-between items-center bg-card">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    {student.mName?.substring(0, 2).toUpperCase() || 'ST'}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{student.mName || student.email}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {student.studentDetails?.studentClass && ` • Class ${student.studentDetails.studentClass}`}
                                                        {student.studentDetails?.section && ` • Section ${student.studentDetails.section}`}
                                                        {student.studentDetails?.rollNo && ` • Roll ${student.studentDetails.rollNo}`}
                                                        {student.studentDetails?.academicYear && ` • Year ${student.studentDetails.academicYear}`}
                                                    </p>
                                                    {(student.studentDetails?.placementCompany || student.studentDetails?.isPlacementClosed) && (
                                                        <p className="text-xs font-semibold text-emerald-600 mt-1">
                                                            {student.studentDetails?.isPlacementClosed ? 'Placed' : 'Placement Info'}: {student.studentDetails?.placementPosition ? student.studentDetails?.placementPosition + ' @' : ''} {student.studentDetails?.placementCompany}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Created: {new Date(student.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => setEditStudent(student)}>Edit</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Student</DialogTitle>
                                                        </DialogHeader>
                                                        {editStudent && (
                                                            <div className="grid gap-4 py-4">
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Name</Label>
                                                                    <Input className="col-span-3" value={editStudent.mName} onChange={(e) => setEditStudent({ ...editStudent, mName: e.target.value })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Email</Label>
                                                                    <Input className="col-span-3" value={editStudent.email} onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Department</Label>
                                                                    <select
                                                                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                        value={editStudent.studentDetails?.department || ''}
                                                                        onChange={(e) => setEditStudent({ ...editStudent, studentDetails: { ...editStudent.studentDetails, department: e.target.value } })}
                                                                    >
                                                                        <option value="">Select Department</option>
                                                                        {departmentsList.map((d: any) => (
                                                                            <option key={d._id} value={d._id}>{d.name}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Class</Label>
                                                                    <Input className="col-span-3" value={editStudent.studentDetails?.studentClass || ''} onChange={(e) => setEditStudent({ ...editStudent, studentDetails: { ...editStudent.studentDetails, studentClass: e.target.value } })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Section</Label>
                                                                    <Input className="col-span-3" value={editStudent.studentDetails?.section || ''} onChange={(e) => setEditStudent({ ...editStudent, studentDetails: { ...editStudent.studentDetails, section: e.target.value } })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Roll No</Label>
                                                                    <Input className="col-span-3" value={editStudent.studentDetails?.rollNo || ''} onChange={(e) => setEditStudent({ ...editStudent, studentDetails: { ...editStudent.studentDetails, rollNo: e.target.value } })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Academic Year</Label>
                                                                    <Input className="col-span-3" value={editStudent.studentDetails?.academicYear || ''} onChange={(e) => setEditStudent({ ...editStudent, studentDetails: { ...editStudent.studentDetails, academicYear: e.target.value } })} placeholder="e.g. 2023-2024" />
                                                                </div>
                                                                <Button onClick={handleUpdateStudent}>Update Student</Button>
                                                            </div>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => setPlacementStudent(student)}>
                                                            <Briefcase className="w-4 h-4 mr-2" /> Placement
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Update Placement Details</DialogTitle>
                                                        </DialogHeader>
                                                        {placementStudent && (
                                                            <div className="grid gap-4 py-4">
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Company</Label>
                                                                    <Input className="col-span-3" value={placementStudent.studentDetails?.placementCompany || ''} onChange={(e) => setPlacementStudent({ ...placementStudent, studentDetails: { ...placementStudent.studentDetails, placementCompany: e.target.value } })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Position</Label>
                                                                    <Input className="col-span-3" value={placementStudent.studentDetails?.placementPosition || ''} onChange={(e) => setPlacementStudent({ ...placementStudent, studentDetails: { ...placementStudent.studentDetails, placementPosition: e.target.value } })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Status</Label>
                                                                    <div className="col-span-3 flex items-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="w-4 h-4 mr-2"
                                                                            checked={placementStudent.studentDetails?.isPlacementClosed || false}
                                                                            onChange={(e) => setPlacementStudent({ ...placementStudent, studentDetails: { ...placementStudent.studentDetails, isPlacementClosed: e.target.checked } })}
                                                                        />
                                                                        <Label>Placement Closed</Label>
                                                                    </div>
                                                                </div>
                                                                <Button onClick={handleUpdatePlacement}>Save Placement</Button>
                                                            </div>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(student._id)}>
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No students added yet. Click "Add Student" to get started.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* COURSES TAB */}
                <TabsContent value="courses" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Courses</CardTitle>
                            <CardDescription>Create and assign courses to your students.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between gap-2">
                                <Input
                                    placeholder="Search courses..."
                                    className="max-w-sm"
                                    value={courseSearch}
                                    onChange={(e) => setCourseSearch(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    {(orgSettings?.allowAICreation !== false) && (
                                        <Button variant="outline" onClick={() => window.location.href = '/dashboard/generate-course'}>
                                            <Sparkles className="w-4 h-4 mr-2" /> AI Generate
                                        </Button>
                                    )}
                                    {(orgSettings?.allowManualCreation !== false) && (
                                        <Dialog open={openCourseDialog} onOpenChange={setOpenCourseDialog}>
                                            <DialogTrigger asChild onClick={() => setOpenCourseDialog(true)}>
                                                <Button>
                                                    <Plus className="w-4 h-4 mr-2" /> Create Course
                                                </Button>
                                            </DialogTrigger>

                                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>Create New Course</DialogTitle>
                                                </DialogHeader>

                                                <CourseForm
                                                    course={newCourse}
                                                    setCourse={setNewCourse}
                                                    onSave={() => handleCreateCourse(newCourse)}
                                                    departments={departmentsList}
                                                    role={role}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </div>

                            {/* Course List */}
                            <div className="space-y-4">
                                {courses.length > 0 ? (
                                    courses.filter((c: any) =>
                                        (c.title || c.mainTopic || '').toLowerCase().includes(courseSearch.toLowerCase()) ||
                                        (c.description || '').toLowerCase().includes(courseSearch.toLowerCase())
                                    ).map((course: any) => {
                                        const title = course.title || course.mainTopic;
                                        const description = course.description || (course.content ? "AI Generated Course" : "");
                                        let topicCount = 0;
                                        let quizCount = 0;

                                        if (course.topics) {
                                            topicCount = course.topics.length;
                                            quizCount = course.quizzes?.length || 0;
                                        } else if (course.content) {
                                            try {
                                                const content = JSON.parse(course.content);
                                                topicCount = content.course_topics?.length || 0;
                                                quizCount = content.quizzes?.length || 0;
                                            } catch (e) {
                                                console.error("Error parsing course content", e);
                                            }
                                        }

                                        return (
                                            <div key={course._id} className="p-4 border rounded-lg bg-card">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg">{title}</h3>
                                                        <div className="text-sm text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: description }} />
                                                        <div className="flex gap-4 mt-2 text-xs font-medium text-muted-foreground">
                                                            <span>{topicCount} Topics</span>
                                                            {quizCount > 0 && <span>{quizCount} Quizzes</span>}
                                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                                {course.department ? `Dept: ${departmentsList.find(d => d._id === course.department || d.name === course.department)?.name || course.department}` : (course.content ? 'AI Generated' : 'All students')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => setPreviewCourse({ ...course })}>
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        {course.topics ? (
                                                            <Button variant="ghost" size="sm" onClick={() => setEditCourse({ ...course })}>Edit</Button>
                                                        ) : course.content ? (
                                                            <Button variant="ghost" size="sm" onClick={() => setEditAICourse({ ...course })}>Edit</Button>
                                                        ) : null}
                                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCourse(course._id)}>
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>No courses created yet. Create your first course or use AI to generate one.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ASSIGNMENTS TAB */}
                <TabsContent value="assignments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assignments</CardTitle>
                            <CardDescription>Create and track assignments.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Dialog open={openAssignmentDialog} onOpenChange={setOpenAssignmentDialog}>
                                    <DialogTrigger asChild onClick={() => setOpenAssignmentDialog(true)}>
                                        <Button><Plus className="w-4 h-4 mr-2" /> New Assignment</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <Label>Topic</Label>
                                            <Input value={newAssignment.topic} onChange={(e) => setNewAssignment({ ...newAssignment, topic: e.target.value })} />
                                            <Label>Description</Label>
                                            <RichTextEditor
                                                value={newAssignment.description || ''}
                                                onChange={(content) => setNewAssignment({ ...newAssignment, description: content })}
                                                placeholder="Assignment instructions..."
                                                className="min-h-[150px]"
                                            />
                                            <Label>Due Date</Label>
                                            <Input type="date" value={newAssignment.dueDate} onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} />
                                            <Label>Department (Optional)</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                        <Button onClick={handleCreateAssignment}>Create</Button>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div className="space-y-4">
                                {assignments.length > 0 ? (
                                    assignments.map((assignment: any) => (
                                        <div key={assignment._id} className="p-4 border rounded-lg bg-card">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-lg">{assignment.topic}</h3>
                                                        {(() => {
                                                            const isExpired = new Date(assignment.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
                                                            return (
                                                                <Badge variant={isExpired ? "destructive" : "secondary"} className={isExpired ? "" : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"}>
                                                                    {isExpired ? "Expired" : "Active"}
                                                                </Badge>
                                                            );
                                                        })()}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: assignment.description }} />
                                                    <div className="flex gap-4 mt-2 text-xs font-medium text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                        </span>
                                                        <span>{assignment.questions?.length || 0} Questions</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleViewSubmissions(assignment)}>
                                                        View Submissions
                                                    </Button>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="sm" onClick={() => setEditAssignment({
                                                                ...assignment,
                                                                dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : ''
                                                            })}>
                                                                Edit
                                                            </Button>
                                                        </DialogTrigger>
                                                        {editAssignment && editAssignment._id === assignment._id && (
                                                            <DialogContent>
                                                                <DialogHeader><DialogTitle>Edit Assignment</DialogTitle></DialogHeader>
                                                                <div className="grid gap-4 py-4">
                                                                    <Label>Topic</Label>
                                                                    <Input value={editAssignment.topic} onChange={(e) => setEditAssignment({ ...editAssignment, topic: e.target.value })} />
                                                                    <Label>Description</Label>
                                                                    <RichTextEditor
                                                                        value={editAssignment.description || ''}
                                                                        onChange={(content) => setEditAssignment({ ...editAssignment, description: content })}
                                                                        placeholder="Assignment instructions..."
                                                                        className="min-h-[150px]"
                                                                    />
                                                                    <Label>Due Date</Label>
                                                                    <Input type="date" value={editAssignment.dueDate} onChange={(e) => setEditAssignment({ ...editAssignment, dueDate: e.target.value })} />
                                                                    <Label>Department (Optional)</Label>
                                                                    <select
                                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                                                <Button onClick={handleUpdateAssignment}>Update</Button>
                                                            </DialogContent>
                                                        )}
                                                    </Dialog>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteAssignment(assignment._id)}>
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        No assignments active.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MEETINGS TAB */}
                <TabsContent value="meetings" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Online Meetings</CardTitle>
                                <CardDescription>Schedule and manage Google Meet or Zoom sessions.</CardDescription>
                            </div>
                            <Dialog open={openMeetingDialog} onOpenChange={setOpenMeetingDialog}>
                                <DialogTrigger asChild onClick={() => setOpenMeetingDialog(true)}>
                                    <Button><Plus className="w-4 h-4 mr-2" /> Schedule Meeting</Button>
                                </DialogTrigger>
                                <DialogContent>
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
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                        <div className="grid grid-cols-2 gap-4">
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
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                        <Button onClick={handleCreateMeeting}>Schedule Meeting</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {meetings.length > 0 ? meetings.map((m: any) => (
                                    <div key={m._id} className="p-4 border rounded-lg flex justify-between items-start bg-card hover:shadow-md transition-all">
                                        <div className="flex gap-4">
                                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Video className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{m.title}</h3>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(m.date).toLocaleDateString()} at {m.time}</span>
                                                    <span className="capitalize">{m.platform.replace('-', ' ')}</span>
                                                    {getDepartmentLabel(m.department) && <span className="text-primary font-medium">Dept: {getDepartmentLabel(m.department)}</span>}
                                                </div>
                                                <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 flex items-center gap-1">
                                                    {m.link.substring(0, 40)}... <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => handleDeleteMeeting(m._id)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-10 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                        No meetings scheduled yet.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PROJECTS TAB */}
                <TabsContent value="projects" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Projects & Research</CardTitle>
                                <CardDescription>Assign practical projects, research topics, or lab work.</CardDescription>
                            </div>
                            <Dialog open={openProjectDialog} onOpenChange={setOpenProjectDialog}>
                                <DialogTrigger asChild onClick={() => setOpenProjectDialog(true)}>
                                    <Button><Plus className="w-4 h-4 mr-2" /> Add Project</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Project/Practical</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label>Project Title</Label>
                                            <Input value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} placeholder="e.g., AI Research Phase 1" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Type</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={newProject.type}
                                                onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                                            >
                                                <option value="Project">Project</option>
                                                <option value="Practical">Practical</option>
                                                <option value="Research">Research</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Description</Label>
                                            <RichTextEditor
                                                value={newProject.description || ''}
                                                onChange={(content) => setNewProject({ ...newProject, description: content })}
                                                placeholder="Project guidelines..."
                                                className="min-h-[150px]"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>Due Date</Label>
                                                <Input type="date" value={newProject.dueDate} onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Department (Optional)</Label>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={newProject.department}
                                                    onChange={(e) => setNewProject({ ...newProject, department: e.target.value })}
                                                    disabled={role === 'dept_admin'}
                                                >
                                                    {role !== 'dept_admin' && <option value="">All Students</option>}
                                                    {departmentsList.map((d: any) => (
                                                        <option key={d._id} value={d._id}>{d.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <Button onClick={handleCreateProject}>Add Project</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projects.length > 0 ? projects.map((p: any) => (
                                    <Card key={p._id} className="relative group overflow-hidden border-primary/20">
                                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => handleDeleteProject(p._id)}><Trash2 className="w-3 h-3" /></Button>
                                        </div>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold uppercase tracking-wider">{p.type}</span>
                                            </div>
                                            <CardTitle className="text-base line-clamp-1">{p.title}</CardTitle>
                                            <div className="line-clamp-2 text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: p.description }} />
                                        </CardHeader>
                                        <CardContent className="pt-0 text-[11px] text-muted-foreground flex justify-between">
                                            <span>Dept: {getDepartmentLabel(p.department) || 'All'}</span>
                                            {p.dueDate && <span>Due: {new Date(p.dueDate).toLocaleDateString()}</span>}
                                        </CardContent>
                                    </Card>
                                )) : (
                                    <div className="col-span-full py-10 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                        No projects or research topics added.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MATERIALS TAB */}
                <TabsContent value="materials" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Study Materials & Notes</CardTitle>
                                <CardDescription>Share documents, PDF notes, and useful links with students.</CardDescription>
                            </div>
                            <Dialog open={openMaterialDialog} onOpenChange={setOpenMaterialDialog}>
                                <DialogTrigger asChild onClick={() => setOpenMaterialDialog(true)}>
                                    <Button><Plus className="w-4 h-4 mr-2" /> Add Material</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Study Material</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label>Material Title</Label>
                                            <Input value={newMaterial.title} onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })} placeholder="e.g., Python Course Notes" />
                                        </div>
                                        {/* TYPE BASED FIELD */}
                                        <div className="grid gap-2">
                                            <Label>
                                                {newMaterial.type === 'PDF' ? 'Upload PDF File' : 'Link / URL'}
                                            </Label>

                                            {newMaterial.type === 'PDF' ? (
                                                <Input
                                                    type="file"
                                                    accept="application/pdf"
                                                    onChange={(e: any) =>
                                                        setNewMaterial({ ...newMaterial, file: e.target.files[0] })
                                                    }
                                                />
                                            ) : (
                                                <Input
                                                    value={newMaterial.fileUrl}
                                                    onChange={(e) =>
                                                        setNewMaterial({ ...newMaterial, fileUrl: e.target.value })
                                                    }
                                                    placeholder="https://..."
                                                />
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Type</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={newMaterial.type}
                                                onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                                            >
                                                <option value="PDF">PDF Document</option>
                                                <option value="Link">External Link</option>
                                                <option value="Slide">Slides/PPT</option>
                                                <option value="Video">Video Resource</option>
                                            </select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Department (Optional)</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={newMaterial.department}
                                                onChange={(e) => setNewMaterial({ ...newMaterial, department: e.target.value })}
                                                disabled={role === 'dept_admin'}
                                            >
                                                {role !== 'dept_admin' && <option value="">All Students</option>}
                                                {departmentsList.map((d: any) => (
                                                    <option key={d._id} value={d._id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button onClick={handleCreateMaterial}>Add Material</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>

                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {materials.length > 0 ? materials.map((m: any) => (
                                    <div key={m._id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary">
                                                <Download className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{m.title}</p>
                                                <p className="text-[10px] text-muted-foreground">{m.type} • {m.department ? (departmentsList.find(d => d._id === m.department || d.name === m.department)?.name || m.department) : 'All'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:text-primary transition-colors">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteMaterial(m._id)}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-10 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                        No materials added yet.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* NOTICES TAB */}
                <TabsContent value="notices" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notice board</CardTitle>
                            <CardDescription>Broadcast messages to students.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Title</Label>
                                    <Input value={newNotice.title} onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })} placeholder="Announcement Title" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Message</Label>
                                    <RichTextEditor
                                        value={newNotice.content || ''}
                                        onChange={(content) => setNewNotice({ ...newNotice, content: content })}
                                        placeholder="Write your message here..."
                                        className="min-h-[200px]"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Department (Optional)</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newNotice.department || ''}
                                        onChange={(e) => setNewNotice({ ...newNotice, department: e.target.value })}
                                        disabled={role === 'dept_admin'}
                                    >
                                        {role !== 'dept_admin' && <option value="">All Students</option>}
                                        {departmentsList.map((d: any) => (
                                            <option key={d._id} value={d._id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <Button onClick={handleCreateNotice}><Bell className="w-4 h-4 mr-2" /> Post Notice</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-8 space-y-4">
                        <h3 className="text-lg font-medium">Recent Notices</h3>
                        {notices.length === 0 ? (
                            <p className="text-muted-foreground">No notices found.</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {notices.map((notice: any) => (
                                    <Card key={notice._id}>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-base truncate pr-2" title={notice.title}>{notice.title}</CardTitle>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 flex-shrink-0" onClick={() => handleDeleteNotice(notice._id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <CardDescription className="text-xs">
                                                {new Date(notice.createdAt).toLocaleDateString()}
                                                {getDepartmentLabel(notice.department) && (
                                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary text-[10px]">
                                                        {getDepartmentLabel(notice.department)}
                                                    </span>
                                                )}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div
                                                className="text-sm text-muted-foreground line-clamp-3 prose prose-sm dark:prose-invert"
                                                dangerouslySetInnerHTML={{ __html: notice.content }}
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* CAREER TAB */}
                <TabsContent value="career" className="space-y-6">
                    <Card className="border-l-4 border-l-blue-600">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                                Career & Placement Module
                            </CardTitle>
                            <CardDescription>
                                Track student placement readiness scores, verify student projects, and view issued certificates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
                                    <h4 className="text-sm font-semibold mb-1">Students Tracked</h4>
                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{role === 'dept_admin' ? students.length : (stats.studentCount || 0)}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 dark:bg-violet-900/10 dark:border-violet-900/20">
                                    <h4 className="text-sm font-semibold mb-1">Students Placed</h4>
                                    <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">
                                        {role === 'dept_admin' ? students.filter((s: any) => s.studentDetails?.isPlacementClosed).length : (stats.placedCount || 0)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20">
                                    <h4 className="text-sm font-semibold mb-1">Verified Projects</h4>
                                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{projects.length || 0}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20">
                                    <h4 className="text-sm font-semibold mb-1">Avg. Readiness Score</h4>
                                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">0%</p>
                                </div>
                            </div>

                            <div className="flex justify-center pt-4">
                                <Button size="lg" onClick={() => navigate('/dashboard/org/career')} className="px-8 rounded-full shadow-lg shadow-blue-500/20">
                                    Open Full Career Dashboard <ExternalLink className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Course Dialog - Moved outside loop for stability */}
            <Dialog open={!!editCourse} onOpenChange={(open) => !open && setEditCourse(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Course: {editCourse?.title}</DialogTitle>
                    </DialogHeader>
                    {editCourse && (
                        <CourseForm
                            course={editCourse}
                            setCourse={setEditCourse}
                            onSave={handleUpdateCourse}
                            isEdit
                            departments={departmentsList}
                            role={role}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Course Preview Dialog */}
            <Dialog open={!!previewCourse} onOpenChange={(open) => !open && setPreviewCourse(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{previewCourse?.title || previewCourse?.mainTopic || 'Course Preview'}</DialogTitle>
                        <DialogDescription>
                            {previewCourse?.department ? `Assigned to: ${previewCourse.department}` : 'Assigned to all students'}
                        </DialogDescription>
                    </DialogHeader>
                    {previewCourse && (() => {
                        let parsedContent = null;
                        if (previewCourse.content) {
                            try {
                                parsedContent = JSON.parse(previewCourse.content);
                            } catch (e) {
                                console.error('Error parsing course content', e);
                            }
                        }

                        const description = previewCourse.description || parsedContent?.course_description || '';
                        const topics = previewCourse.topics || parsedContent?.course_topics || [];
                        const quizzes = previewCourse.quizzes || parsedContent?.quizzes || [];

                        return (
                            <div className="py-4 space-y-6">
                                {description && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Description</h4>
                                        <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg"
                                            dangerouslySetInnerHTML={{ __html: description }} />
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-semibold mb-3">Course Content</h4>
                                    <div className="space-y-4">
                                        {topics.length > 0 ? topics.map((topic: any, idx: number) => (
                                            <div key={idx} className="border rounded-lg overflow-hidden">
                                                <div className="bg-muted/50 p-3 font-medium flex gap-3">
                                                    <span className="text-xs bg-muted px-2 py-1 rounded font-bold">{idx + 1}</span>
                                                    {topic.title || topic.topic}
                                                </div>
                                                <div className="p-4 space-y-3 bg-card">
                                                    {topic.subtopics && topic.subtopics.length > 0 ? (
                                                        topic.subtopics.map((sub: any, sIdx: number) => (
                                                            <div key={sIdx} className="pl-4 border-l-2 border-primary/20">
                                                                <h5 className="font-medium text-sm mb-1">{sub.title || sub.subtopic}</h5>
                                                                {sub.videoUrl && (
                                                                    <a href={sub.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 flex items-center gap-1 mb-2">
                                                                        <Video className="w-3 h-3" /> External Video Link
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground pl-4">No subtopics defined.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="p-4 border border-dashed rounded-lg text-sm text-muted-foreground text-center">
                                                No topics available for this course.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {quizzes.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3">Quizzes</h4>
                                        <div className="space-y-3">
                                            {quizzes.map((quiz: any, qIdx: number) => (
                                                <div key={qIdx} className="p-4 border rounded-lg bg-card text-sm">
                                                    <p className="font-medium mb-2">{qIdx + 1}. {quiz.question}</p>
                                                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                                        {quiz.options && quiz.options.map((opt: string, oIdx: number) => (
                                                            <li key={oIdx} className={opt === quiz.answer ? "text-primary font-medium" : ""}>
                                                                {opt}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Edit AI Course Dialog */}
            <Dialog open={!!editAICourse} onOpenChange={(open) => !open && setEditAICourse(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit AI-Generated Course</DialogTitle>
                        <DialogDescription>Update the course title and department assignment</DialogDescription>
                    </DialogHeader>
                    {editAICourse && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="mainTopic">Course Title</Label>
                                <Input
                                    id="mainTopic"
                                    value={editAICourse.mainTopic || ''}
                                    onChange={(e) => setEditAICourse({ ...editAICourse, mainTopic: e.target.value })}
                                    placeholder="Enter course title"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="department">Department (Optional)</Label>
                                <select
                                    id="department"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={editAICourse.department || ''}
                                    onChange={(e) => setEditAICourse({ ...editAICourse, department: e.target.value })}
                                    disabled={role === 'dept_admin'}
                                >
                                    {role !== 'dept_admin' && <option value="">All Students</option>}
                                    {departmentsList.map((d: any) => (
                                        <option key={d._id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    Assign to a specific department or leave empty for all students
                                </p>
                            </div>
                            <Button onClick={handleUpdateAICourse} className="w-full">
                                Update Course
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default OrgDashboard;
