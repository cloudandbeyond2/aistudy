
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Bell, Plus, Upload, Search, Trash2, CheckCircle, BarChart, Sparkles, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import SEO from '@/components/SEO';
import * as XLSX from 'xlsx';

const CourseForm = ({ course, setCourse, onSave, isEdit = false }: any) => {
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
        updatedTopics[topicIndex].subtopics[subIndex] = { ...updatedTopics[topicIndex].subtopics[subIndex], [field]: value };
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
        <div className="grid gap-6 py-4">
            <div className="grid gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="grid gap-2">
                    <Label>Course Title</Label>
                    <Input value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} placeholder="e.g., Python for Beginners" />
                </div>
                <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea value={course.description} onChange={(e) => setCourse({ ...course, description: e.target.value })} placeholder="Course overview..." />
                </div>
                <div className="grid gap-2">
                    <Label>Assign to Department (Optional)</Label>
                    <Input value={course.department} onChange={(e) => setCourse({ ...course, department: e.target.value })} placeholder="e.g., Computer Science" />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Lessons & Content</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => {
                        const topic = { title: '', subtopics: [], order: course.topics.length };
                        setCourse({ ...course, topics: [...course.topics, topic] });
                    }}>
                        <Plus className="w-4 h-4 mr-2" /> Add Lesson
                    </Button>
                </div>

                {course.topics.map((topic: any, tIdx: number) => (
                    <div key={tIdx} className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 p-3 flex justify-between items-center">
                            <div className="flex items-center gap-3 flex-1">
                                <span className="text-xs font-bold bg-muted p-1 px-2 rounded">{tIdx + 1}</span>
                                <Input
                                    className="h-8 py-0 bg-transparent border-none focus-visible:ring-0 font-medium"
                                    value={topic.title}
                                    onChange={(e) => updateTopic(tIdx, 'title', e.target.value)}
                                    placeholder="Lesson Title"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setExpandedTopic(expandedTopic === tIdx ? null : tIdx)}>
                                    {expandedTopic === tIdx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => removeTopic(tIdx)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                            </div>
                        </div>

                        {expandedTopic === tIdx && (
                            <div className="p-4 space-y-4 bg-card">
                                {topic.subtopics.map((sub: any, sIdx: number) => (
                                    <div key={sIdx} className="pl-6 border-l-2 border-primary/20 space-y-3 relative">
                                        <div className="flex justify-between items-center">
                                            <Input
                                                className="font-medium h-8"
                                                value={sub.title}
                                                onChange={(e) => updateSubtopic(tIdx, sIdx, 'title', e.target.value)}
                                                placeholder="Subtopic/Topic Title"
                                            />
                                            <Button size="sm" variant="ghost" onClick={() => removeSubtopic(tIdx, sIdx)}><X className="w-3 h-3" /></Button>
                                        </div>
                                        <Textarea
                                            value={sub.content}
                                            onChange={(e) => updateSubtopic(tIdx, sIdx, 'content', e.target.value)}
                                            placeholder="Content for this subtopic..."
                                            className="min-h-[100px] text-sm"
                                        />
                                    </div>
                                ))}
                                <Button type="button" variant="ghost" size="sm" className="w-full border-dashed border-2" onClick={() => {
                                    const updated = [...course.topics];
                                    updated[tIdx].subtopics.push({ title: '', content: '', order: 0 });
                                    setCourse({ ...course, topics: updated });
                                }}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Subtopic
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Quizzes</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => {
                        const quiz = { question: '', options: ['', '', '', ''], answer: '', explanation: '' };
                        setCourse({ ...course, quizzes: [...course.quizzes, quiz] });
                    }}>
                        <Plus className="w-4 h-4 mr-2" /> Add Question
                    </Button>
                </div>

                {course.quizzes.map((quiz: any, qIdx: number) => (
                    <div key={qIdx} className="p-4 border rounded-lg space-y-3 bg-muted/10">
                        <div className="flex justify-between items-start gap-3">
                            <Textarea
                                className="font-medium h-20"
                                value={quiz.question}
                                onChange={(e) => updateQuiz(qIdx, 'question', e.target.value)}
                                placeholder="Quiz Question"
                            />
                            <Button size="sm" variant="ghost" onClick={() => removeQuiz(qIdx)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {quiz.options.map((opt: string, oIdx: number) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                    <Input
                                        className={`h-8 ${quiz.answer === opt && opt !== '' ? 'border-primary bg-primary/5' : ''}`}
                                        value={opt}
                                        onChange={(e) => updateQuiz(qIdx, 'option', { optIndex: oIdx, text: e.target.value })}
                                        placeholder={`Option ${oIdx + 1}`}
                                    />
                                    <Button
                                        size="sm"
                                        variant={quiz.answer === opt && opt !== '' ? 'default' : 'ghost'}
                                        className="h-8 w-8 p-0"
                                        onClick={() => updateQuiz(qIdx, 'answer', opt)}
                                    >
                                        <Check className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Input
                            value={quiz.explanation}
                            onChange={(e) => updateQuiz(qIdx, 'explanation', e.target.value)}
                            placeholder="Explanation (Optional)"
                            className="h-8 text-xs"
                        />
                    </div>
                ))}
            </div>

            <Button className="w-full h-12 text-lg font-bold shadow-lg" onClick={onSave}>
                {isEdit ? 'Update Course' : 'Create Course'}
            </Button>
        </div>
    );
};

const OrgDashboard = () => {
    const { toast } = useToast();
    const [stats, setStats] = useState({ studentCount: 0, assignmentCount: 0, submissionCount: 0 });
    const [students, setStudents] = useState([]); // Simplified for now
    const [assignments, setAssignments] = useState([]);
    const [notices, setNotices] = useState([]);
    const [courses, setCourses] = useState([]);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', department: '', section: '', rollNo: '' });
    const [editStudent, setEditStudent] = useState<any>(null);
    const [newAssignment, setNewAssignment] = useState({ topic: '', description: '', dueDate: '', department: '' });
    const [newNotice, setNewNotice] = useState({ title: '', content: '', audience: 'all' });
    const [newCourse, setNewCourse] = useState<any>({ title: '', description: '', department: '', topics: [], quizzes: [] });
    const [editCourse, setEditCourse] = useState<any>(null);
    const [editAICourse, setEditAICourse] = useState<any>(null);
    const [orgSettings, setOrgSettings] = useState<any>(null);
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');
    const [courseSearch, setCourseSearch] = useState('');
    const orgId = sessionStorage.getItem('orgId');

    useEffect(() => {
        if (!orgId) {
            console.warn('No organization ID found. Please log out and log back in.');
            toast({
                title: "Warning",
                description: "Organization ID not found. Please log out and log back in.",
                variant: "destructive"
            });
            return;
        }
        fetchStats();
        fetchStudents();
        fetchCourses();
        fetchAssignments();
        fetchOrgSettings();
    }, [orgId, toast]);

    const fetchAssignments = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/assignments?organizationId=${orgId}`);
            if (res.data.success) {
                setAssignments(res.data.assignments);
            }
        } catch (e) {
            console.error("Failed to fetch assignments", e);
        }
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
                setStudents(res.data.students);
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
                setCourses(res.data.courses);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const handleAddStudent = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/student/add`, { ...newStudent, organizationId: orgId });
            if (res.data.success) {
                toast({ title: "Success", description: "Student added successfully" });
                setNewStudent({ name: '', email: '', password: '', department: '', section: '', rollNo: '' });
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

    const handleCreateCourse = async (courseData: any) => {
        try {
            const res = await axios.post(`${serverURL}/api/org/course/create`, {
                ...courseData,
                organizationId: orgId,
                createdBy: sessionStorage.getItem('uid')
            });
            if (res.data.success) {
                toast({ title: "Success", description: "Course created successfully" });
                setNewCourse({ title: '', description: '', department: '', topics: [], quizzes: [] });
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
                rollNo: editStudent.studentDetails?.rollNo
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

    const handleCreateAssignment = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/assignment/create`, { ...newAssignment, organizationId: orgId });
            if (res.data.success) {
                toast({ title: "Success", description: "Assignment created" });
                setNewAssignment({ topic: '', description: '', dueDate: '', department: '' });
                fetchAssignments();
            }
        } catch (e) {
            toast({ title: "Error", description: "Request failed" });
        }
    };

    const handleCreateNotice = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/notice/create`, { ...newNotice, organizationId: orgId });
            if (res.data.success) {
                toast({ title: "Success", description: "Notice posted" });
                setNewNotice({ title: '', content: '', audience: 'all' });
            }
        } catch (e) {
            toast({ title: "Error", description: "Request failed" });
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
                const studentsData = jsonData.map((row: any) => ({
                    name: row.Name || row.name || '',
                    email: row.Email || row.email || '',
                    password: row.Password || row.password || 'Student@123', // Default password if empty
                    department: row.Department || row.department || '',
                    section: row.Section || row.section || '',
                    rollNo: row.RollNo || row['Roll No'] || row.rollno || ''
                }));

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
            { Name: 'John Doe', Email: 'john@example.com', Password: 'Password123', Department: 'CS', Section: 'A', 'Roll No': '101' }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "student_bulk_upload_template.xlsx");
    };

    return (
        <div className="container mx-auto py-10 space-y-8 animate-fade-in">
            <SEO title="Organization Dashboard" description="Manage your organization, students, and curriculum." />

            <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Organization Dashboard
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
                    <Button>Settings</Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.studentCount || 0}</div>
                        <p className="text-xs text-muted-foreground">+20% from last month</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.assignmentCount || 0}</div>
                        <p className="text-xs text-muted-foreground">5 due this week</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.submissionCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Pending grading</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="students" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="courses">Courses</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="notices">Notices</TabsTrigger>
                </TabsList>

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
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button><Plus className="w-4 h-4 mr-2" /> Add Student</Button>
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
                                                <Input className="col-span-3" value={newStudent.department} onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Section</Label>
                                                <Input className="col-span-3" value={newStudent.section} onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })} />
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
                                                        {student.studentDetails?.department && `Dept: ${student.studentDetails.department}`}
                                                        {student.studentDetails?.section && ` • Section ${student.studentDetails.section}`}
                                                        {student.studentDetails?.rollNo && ` • Roll ${student.studentDetails.rollNo}`}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
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
                                                                    <Input className="col-span-3" value={editStudent.studentDetails?.department || ''} onChange={(e) => setEditStudent({ ...editStudent, studentDetails: { ...editStudent.studentDetails, department: e.target.value } })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Section</Label>
                                                                    <Input className="col-span-3" value={editStudent.studentDetails?.section || ''} onChange={(e) => setEditStudent({ ...editStudent, studentDetails: { ...editStudent.studentDetails, section: e.target.value } })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Roll No</Label>
                                                                    <Input className="col-span-3" value={editStudent.studentDetails?.rollNo || ''} onChange={(e) => setEditStudent({ ...editStudent, studentDetails: { ...editStudent.studentDetails, rollNo: e.target.value } })} />
                                                                </div>
                                                                <Button onClick={handleUpdateStudent}>Update Student</Button>
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
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button><Plus className="w-4 h-4 mr-2" /> Create Course</Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                                <DialogHeader><DialogTitle>Create New Course</DialogTitle></DialogHeader>
                                                <CourseForm course={newCourse} setCourse={setNewCourse} onSave={() => handleCreateCourse(newCourse)} />
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
                                                        <p className="text-sm text-muted-foreground">{description}</p>
                                                        <div className="flex gap-4 mt-2 text-xs font-medium text-muted-foreground">
                                                            <span>{topicCount} Topics</span>
                                                            {quizCount > 0 && <span>{quizCount} Quizzes</span>}
                                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                                {course.department ? `Dept: ${course.department}` : (course.content ? 'AI Generated' : 'All students')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
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
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button><Plus className="w-4 h-4 mr-2" /> New Assignment</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <Label>Topic</Label>
                                            <Input value={newAssignment.topic} onChange={(e) => setNewAssignment({ ...newAssignment, topic: e.target.value })} />
                                            <Label>Description</Label>
                                            <Textarea value={newAssignment.description} onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} />
                                            <Label>Due Date</Label>
                                            <Input type="date" value={newAssignment.dueDate} onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} />
                                            <Label>Department (Optional)</Label>
                                            <Input placeholder="e.g., Computer Science" value={newAssignment.department} onChange={(e) => setNewAssignment({ ...newAssignment, department: e.target.value })} />
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
                                                    <h3 className="font-semibold text-lg">{assignment.topic}</h3>
                                                    <p className="text-sm text-muted-foreground">{assignment.description}</p>
                                                    <div className="flex gap-4 mt-2 text-xs font-medium text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                        </span>
                                                        <span>{assignment.questions?.length || 0} Questions</span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm">View Submissions</Button>
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
                                    <Textarea value={newNotice.content} onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })} placeholder="Write your message here..." />
                                </div>
                                <Button onClick={handleCreateNotice}><Bell className="w-4 h-4 mr-2" /> Post Notice</Button>
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
                        />
                    )}
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
                                <Input
                                    id="department"
                                    value={editAICourse.department || ''}
                                    onChange={(e) => setEditAICourse({ ...editAICourse, department: e.target.value })}
                                    placeholder="e.g., Computer Science, Mathematics"
                                />
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
