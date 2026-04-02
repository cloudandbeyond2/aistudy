import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, X, Briefcase, Sparkles, ClipboardCheck, Loader2, ListTodo, Activity, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';
import axios from 'axios';
import { serverURL } from '@/constants';
import { useNavigate } from 'react-router-dom';

const toTitleCase = (str: string) =>
  str?.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );

const StudentPortal = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [studentInfo, setStudentInfo] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [quizSummaries, setQuizSummaries] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();
    const role = sessionStorage.getItem('role');
    const isOrganizationUser = sessionStorage.getItem('isOrganization') === 'true';
    const orgId = sessionStorage.getItem('orgId');
    const studentId = sessionStorage.getItem('uid');
    const [existingInternship, setExistingInternship] = useState<any>(null);
    const [openRequestDialog, setOpenRequestDialog] = useState(false);
    const [requestData, setRequestData] = useState({ domain: 'Web Development', workNature: '' });
    const canAccessStudentPortal = isOrganizationUser || (role === 'student' && Boolean(orgId));

    const collegeName =
        studentInfo?.organizationDetails?.institutionName ||
        studentInfo?.organization?.name ||
        studentInfo?.organizationDetails?.inchargeName ||
        studentInfo?.organizationId?.organizationDetails?.institutionName ||
        studentInfo?.organizationId?.organization?.name ||
        'Not provided yet';

    const departmentName =
        studentInfo?.department?.name ||
        studentInfo?.studentDetails?.department ||
        'Not provided yet';

    const studentSnapshotDetails = [
        { label: 'College', value: collegeName },
        { label: 'Department', value: departmentName },
        { label: 'Academic Year', value: studentInfo?.studentDetails?.academicYear || 'Not provided yet' },
        { label: 'Section', value: studentInfo?.studentDetails?.section || 'Not provided yet' },
        { label: 'Roll Number', value: studentInfo?.studentDetails?.rollNo || 'Not provided yet' },
        { label: 'Class', value: studentInfo?.studentDetails?.studentClass || 'Not provided yet' }
    ];

    const getCourseThumbnail = (course: any) => {
        try {
            const jsonData = JSON.parse(course.content);
            const topics = jsonData.course_topics || jsonData?.[course.mainTopic?.toLowerCase()] || [];
            for (const topic of topics) {
                for (const sub of topic.subtopics || []) {
                    if (sub.image) return sub.image;
                }
            }
        } catch (e) {}
        return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3";
    };

    useEffect(() => {
        if (!canAccessStudentPortal) {
            navigate('/dashboard', { replace: true });
            return;
        }

        if (orgId && studentId) {
            Promise.all([
                fetchStudentInfo(),
                fetchCourses(),
                fetchNotifications(),
                fetchInternshipStatus()
            ]).finally(() => {
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [canAccessStudentPortal, navigate, orgId, studentId]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/notifications/get`, { userId: studentId });
            const unread = res.data.filter((n: any) => !n.isRead);
            setNotifications(unread);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const dismissNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await axios.post(`${serverURL}/api/notifications/read`, { id });
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error('Failed to dismiss notification:', error);
        }
    };

    const fetchStudentInfo = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/user/${studentId}`);
            if (res.data.success) setStudentInfo(res.data.user);
        } catch (e) {
            console.error('Error fetching student info:', e);
        }
    };

    const fetchInternshipStatus = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/internship/student/${studentId}?organizationId=${orgId}`);
            if (res.data.success) {
                setExistingInternship(res.data.internship);
            }
        } catch (e) {
            console.error('Failed to fetch internship status:', e);
        }
    };

    const handleRequestInternship = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/internship`, {
                studentId,
                organizationId: orgId,
                title: `${requestData.domain} Internship Request`,
                domain: requestData.domain,
                description: requestData.workNature,
                status: 'requested'
            });
            if (res.data.success) {
                toast({ title: "Request Sent", description: "Your internship request has been submitted to the admin." });
                setOpenRequestDialog(false);
                fetchInternshipStatus();
            }
        } catch (e) {
            console.error('Failed to send request:', e);
            toast({ title: "Error", description: "Failed to send request", variant: "destructive" });
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/student/courses?organizationId=${orgId}&studentId=${studentId}`);
            if (res.data.success) {
                const nextCourses = res.data.courses || [];
                setCourses(nextCourses);
                const courseIds = nextCourses.map((c: any) => String(c._id)).filter(Boolean);
                if (courseIds.length > 0) {
                    try {
                        const quizRes = await axios.post(`${serverURL}/api/getmyresults-batch`, { courseIds, userId: studentId });
                        if (quizRes.data?.success && Array.isArray(quizRes.data.results)) {
                            const map: Record<string, any> = {};
                            quizRes.data.results.forEach((r: any) => {
                                map[String(r.courseId)] = r;
                            });
                            setQuizSummaries(map);
                        }
                    } catch (e) {
                        console.error('Failed to fetch quiz summaries:', e);
                    }
                }
            }
        } catch (e) {
            console.error('Error fetching courses:', e);
        }
    };

    const LoadingSpinner = () => (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-lg">Loading your courses...</p>
        </div>
    );

    if (!canAccessStudentPortal) return null;

    return (
        <div className="container mx-auto py-8 animate-fade-in space-y-6">
            <SEO title="Student Portal" description="Access your courses and learning materials." />

            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl" />
                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-md">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-indigo-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
                            My Courses
                            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Welcome back, <span className="font-semibold text-primary">{studentInfo?.mName || "Scholar"}</span> 👋
                        </p>
                    </div>
                    {!loading && (
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-3 text-xs">
                                <div className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                                    <span className="block font-semibold text-primary">{courses.length}</span>
                                    <span className="text-muted-foreground">Courses</span>
                                </div>
                                <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <span className="block font-semibold text-green-600">
                                        {courses.filter(c => c.progressPercentage === 100).length}
                                    </span>
                                    <span className="text-muted-foreground">Completed</span>
                                </div>
                            </div>
                            <Button onClick={() => navigate('/dashboard/todo')} variant="outline" className="w-full md:w-auto justify-start gap-2">
                                <ListTodo className="w-4 h-4" /> Open Todo Center
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-4 mt-6 lg:grid-cols-[1.25fr_0.9fr]">
                <Card className="border-border/60 bg-card/50 shadow-xl">
                    <CardHeader className="space-y-2 pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">Student Snapshot</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground max-w-xl">
                                    Organization-specific profile data sourced from your institution.
                                </CardDescription>
                            </div>
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Profile</span>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {studentSnapshotDetails.map((detail) => (
                            <div key={detail.label} className="rounded-2xl border border-border/60 bg-background/60 p-3 text-sm">
                                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{detail.label}</p>
                                <p className="mt-1 text-base font-semibold text-foreground">{detail.value}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card className="border-border/60 bg-card/50 shadow-lg">
                    <CardHeader className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground max-w-[15rem]">
                                Stay on top of organization updates and alerts.
                            </CardDescription>
                        </div>
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Inbox</span>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p className="text-xs">Use the bell icon to mark notifications as read or clear them.</p>
                    </CardContent>
                </Card>
            </div>

            {notifications.length > 0 && (
                <div className="space-y-3 mt-4 mb-6">
                    {notifications.map((notif) => {
                        let alertColor = "bg-blue-100 text-blue-800 border-blue-200";
                        if (notif.type === 'success') alertColor = "bg-green-100 text-green-800 border-green-200";
                        if (notif.type === 'warning') alertColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
                        if (notif.type === 'error' || notif.type === 'danger') alertColor = "bg-red-100 text-red-800 border-red-200";
                        if (notif.type === 'info') alertColor = "bg-cyan-100 text-cyan-800 border-cyan-200";

                        return (
                            <div key={notif._id} className={`flex items-center justify-between p-4 rounded-md border shadow-sm cursor-pointer transition-colors ${alertColor}`} onClick={() => notif.link && navigate(notif.link)}>
                                <div className="font-medium">{notif.message}</div>
                                <button onClick={(e) => dismissNotification(notif._id, e)} className="p-1 hover:bg-black/10 rounded-full transition-colors flex-shrink-0">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {loading ? <LoadingSpinner /> : (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {courses.map((course: any, index) => {
                            const progress = course.progressPercentage || 0;
                            const thumbnail = getCourseThumbnail(course);
                            return (
                                <div key={course._id} className="group animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 border border-border/50 bg-card/60 backdrop-blur-md hover:border-primary/30 relative hover:-translate-y-1 cursor-pointer" onClick={() => navigate(`/course/${course._id}`)}>
                                        <div className="aspect-video relative overflow-hidden">
                                            <img src={thumbnail} alt={course.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute top-3 right-3">
                                                <span className={`text-xs px-2 py-1 rounded text-white shadow-lg ${progress === 100 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-orange-500 to-red-500"}`}>
                                                    {progress === 100 ? "Completed ✓" : "In Progress"}
                                                </span>
                                            </div>
                                        </div>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg leading-tight capitalize line-clamp-2 group-hover:text-primary transition-colors">{course.title || course.mainTopic}</CardTitle>
                                            <CardDescription className="text-xs">{course.type || "AI Generated Course"}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            <div className="mb-3">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-muted-foreground">Progress</span>
                                                    <span className="font-semibold text-primary">{progress}%</span>
                                                </div>
                                                <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span>{course.topics?.length || 0} topics</span>
                                                <span>AI Curated</span>
                                            </div>
                                        </CardContent>
                                        <div className="p-4" onClick={(e) => e.stopPropagation()}>
                                            <Button onClick={() => navigate(`/course/${course._id}`)} variant="ghost" className="w-full justify-between group-hover:bg-gradient-to-r group-hover:from-primary/10 group-hover:to-indigo-500/10 transition-all">
                                                <span>{progress === 0 ? "Start Learning" : progress === 100 ? "Review Course" : "Continue Learning"}</span>
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>

                    {courses.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-500" />
                            <div className="relative z-10 flex flex-col justify-between h-full gap-6">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider">
                                        <Sparkles className="w-3.5 h-3.5" /> Career Hub
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight">Professional Portfolio</h2>
                                    <p className="text-blue-100 text-sm leading-relaxed">Build your resume, track placement readiness, and showcase your projects.</p>
                                </div>
                                <Button size="sm" variant="secondary" className="rounded-full w-full font-bold shadow-md hover:shadow-white/10 transition-all group-hover:scale-105" onClick={() => navigate('/dashboard/student/career')}>
                                    Go to Career Hub
                                </Button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-500" />
                            <div className="relative z-10 flex flex-col justify-between h-full gap-6">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider">
                                        <Activity className="w-3.5 h-3.5" /> Internship Hub
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight">Internship Portal</h2>
                                    <p className="text-indigo-100 text-sm leading-relaxed">Log daily follow-ups, submit tasks, and view mentor study plans.</p>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="rounded-full w-full font-bold shadow-md hover:shadow-white/10 transition-all group-hover:scale-105" 
                                    onClick={() => {
                                        if (existingInternship) {
                                            navigate('/dashboard/student/internship');
                                        } else {
                                            setOpenRequestDialog(true);
                                        }
                                    }}
                                >
                                    {existingInternship ? "Open Internship Hub" : "Request Internship"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Dialog open={openRequestDialog} onOpenChange={setOpenRequestDialog}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-indigo-600" />
                                    Request Professional Internship
                                </DialogTitle>
                                <CardDescription>Select your domain and specify your interest to get a professional training roadmap.</CardDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Preferred Domain</Label>
                                    <select
                                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={requestData.domain}
                                        onChange={(e) => setRequestData({ ...requestData, domain: e.target.value })}
                                    >
                                        <option value="Web Development">Web Development</option>
                                        <option value="AI / Machine Learning">AI / Machine Learning</option>
                                        <option value="Data Science">Data Science</option>
                                        <option value="Mobile App Dev">Mobile App Dev</option>
                                        <option value="Cloud Computing">Cloud Computing</option>
                                        <option value="Digital Marketing">Digital Marketing</option>
                                        <option value="UI/UX Design">UI/UX Design</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Work Nature / Specific Interest</Label>
                                    <Textarea 
                                        placeholder="e.g. I am interested in React and Node.js backend development..."
                                        value={requestData.workNature}
                                        onChange={(e) => setRequestData({ ...requestData, workNature: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handleRequestInternship} className="h-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                                    Submit Internship Request
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    );
};

export default StudentPortal;
