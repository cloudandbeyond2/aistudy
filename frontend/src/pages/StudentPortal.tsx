import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, FileText, X, Briefcase, Sparkles, ClipboardCheck, Loader2, 
  ListTodo, Activity, Calendar, Award, TrendingUp, Clock, Target, 
  CheckCircle2, GraduationCap, Users, MessageSquare, ExternalLink,
  BarChart3, Star, Zap, Brain, Layers, Compass, Globe,
  Bell
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';
import axios from 'axios';
import { serverURL } from '@/constants';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

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
    const [activeTab, setActiveTab] = useState('overview');

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

    // Calculate statistics
    const totalCourses = courses.length;
    const completedCourses = courses.filter(c => c.progressPercentage === 100).length;
    const inProgressCourses = courses.filter(c => c.progressPercentage > 0 && c.progressPercentage < 100).length;
    const averageProgress = totalCourses > 0 
      ? Math.round(courses.reduce((acc, c) => acc + (c.progressPercentage || 0), 0) / totalCourses) 
      : 0;
    
    const upcomingDeadlines = [
      { title: "JavaScript Assignment", date: "2024-01-25", type: "assignment" },
      { title: "React Quiz", date: "2024-01-28", type: "quiz" },
      { title: "Project Submission", date: "2024-02-01", type: "project" },
    ];

    const recentActivities = [
      { action: "Completed Module 3 of Web Development", time: "2 hours ago", type: "completion" },
      { action: "Scored 85% in JavaScript Quiz", time: "Yesterday", type: "quiz" },
      { action: "Started React Basics course", time: "2 days ago", type: "start" },
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
        const unread = res.data.data.filter((n: any) => !n.isRead);

        setNotifications(unread);
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
    }
};

  const dismissNotification = async (id: string, e: React.MouseEvent) => {
  e.stopPropagation();

  // ✅ instant UI update
  setNotifications(prev => prev.filter(n => n._id !== id));

  try {
    await axios.post(`${serverURL}/api/notifications/read`, { id });
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
            const params = orgId ? { organizationId: orgId } : {};
            const res = await axios.get(`${serverURL}/api/internship/student/${studentId}`, { params });
            if (res.data.success) {
                if (res.data.internship) {
                    setExistingInternship(res.data.internship);
                    return;
                }

                const fallbackRes = await axios.get(`${serverURL}/api/internship`, {
                    params: {
                        studentId,
                        ...params
                    }
                });

                if (fallbackRes.data.success && Array.isArray(fallbackRes.data.internships)) {
                    const preferredInternship =
                        fallbackRes.data.internships.find((item: any) => item.status === 'active')
                        || fallbackRes.data.internships.find((item: any) => item.status === 'requested')
                        || null;

                    setExistingInternship(preferredInternship);
                }
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

    const handleTabChange = (value) => {
    setActiveTab(value);
    
    // Handle navigation for specific tabs
    if (value === 'todo') {
        navigate('/dashboard/todo');
    } else if (value === 'career') {
        if (existingInternship) {
            navigate('/dashboard/student/career');
        } else {
            setOpenRequestDialog(true);
        }
    } else if (value === 'internship') {
        if (existingInternship) {
            navigate('/dashboard/student/internship');
        } else {
            setOpenRequestDialog(true);
        }
    }
};

    const LoadingSpinner = () => (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600 animate-pulse" />
            </div>
            <p className="text-gray-500 text-lg mt-6 font-medium">Loading your personalized dashboard...</p>
        </div>
    );

    if (!canAccessStudentPortal) return null;

    return (
     <div className="min-h-screen bg-white animate-[fadeIn_0.5s_ease]">
            <SEO title="Student Portal" description="Access your courses and learning materials." />
            
            <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 space-y-4 sm:space-y-6 md:space-y-8">
                
                {/* Modern Hero Section with Stats - Responsive */}
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-white shadow-xl" style={{
                    background: "linear-gradient(135deg, #0B2B5E 0%, #1A6B8A 50%, #2BA0B8 100%)"
                }}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white/10 rounded-full -mr-16 sm:-mr-24 md:-mr-32 -mt-16 sm:-mt-24 md:-mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white/10 rounded-full -ml-16 sm:-ml-24 md:-ml-32 -mb-16 sm:-mb-24 md:-mb-32 blur-3xl"></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
                        <div className="space-y-2 sm:space-y-3 w-full lg:w-auto">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs sm:text-sm">
                                    <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 mr-1" /> Learning Platform
                                </Badge>
                            </div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                         Welcome, {studentInfo?.mName || "Scholar"}! 👋
                            </h1>
                            <p className="text-indigo-100 text-sm sm:text-base md:text-lg">Continue your journey to excellence</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 w-full lg:w-auto">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-center border border-white/20">
                                <div className="text-lg sm:text-xl md:text-2xl font-bold">{totalCourses}</div>
                                <div className="text-[10px] sm:text-xs text-indigo-100">Total Courses</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-center border border-white/20">
                                <div className="text-lg sm:text-xl md:text-2xl font-bold">{completedCourses}</div>
                                <div className="text-[10px] sm:text-xs text-indigo-100">Completed</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-center border border-white/20">
                                <div className="text-lg sm:text-xl md:text-2xl font-bold">{averageProgress}%</div>
                                <div className="text-[10px] sm:text-xs text-indigo-100">Avg Progress</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Tabs - Responsive */}
                <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6" onValueChange={handleTabChange}>
         
                    {/* Horizontal scrollable tabs for mobile */}
                    <div className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
                        <TabsList className="bg-gray-100 shadow-sm rounded-full p-1 h-auto inline-flex w-auto min-w-max sm:min-w-0">
                            <TabsTrigger 
                                value="overview"
                                className="rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0B2B5E] data-[state=active]:via-[#1A6B8A] data-[state=active]:to-[#2BA0B8] data-[state=active]:text-white data-[state=inactive]:text-gray-600"
                            >
                                <Compass className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> 
                                <span className="hidden xs:inline">Overview</span>
                                <span className="xs:hidden">Home</span>
                            </TabsTrigger>
                            
                            <TabsTrigger 
                                value="courses"
                                className="rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0B2B5E] data-[state=active]:via-[#1A6B8A] data-[state=active]:to-[#2BA0B8] data-[state=active]:text-white data-[state=inactive]:text-gray-600"
                            >
                                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> 
                                <span className="hidden xs:inline">My Courses</span>
                                <span className="xs:hidden">Courses</span>
                            </TabsTrigger>
                            
                            <TabsTrigger 
                                value="todo"
                                className="rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0B2B5E] data-[state=active]:via-[#1A6B8A] data-[state=active]:to-[#2BA0B8] data-[state=active]:text-white data-[state=inactive]:text-gray-600"
                            >
                                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> 
                                <span className="hidden xs:inline">Todo Center</span>
                                <span className="xs:hidden">Todo</span>
                            </TabsTrigger>
                            
                            <TabsTrigger 
                                value="career"
                                className="rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0B2B5E] data-[state=active]:via-[#1A6B8A] data-[state=active]:to-[#2BA0B8] data-[state=active]:text-white data-[state=inactive]:text-gray-600"
                            >
                                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> 
                                <span className="hidden xs:inline">Career Hub</span>
                                <span className="xs:hidden">Career</span>
                            </TabsTrigger>
                            
                            <TabsTrigger 
                                value="internship"
                                className="rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0B2B5E] data-[state=active]:via-[#1A6B8A] data-[state=active]:to-[#2BA0B8] data-[state=active]:text-white data-[state=inactive]:text-gray-600"
                            >
                                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> 
                                <span className="hidden xs:inline">Internship Portal</span>
                                <span className="xs:hidden">Internship</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Overview Tab - Responsive Grid Layout */}
                    <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            {/* Left Column - Takes full width on mobile, 2 cols on desktop */}
                            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                                {/* Student Profile Card */}
                            <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center gap-2 text-gray-800 text-base sm:text-lg md:text-xl">
                                            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                                            Student Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 p-2 sm:p-3 bg-indigo-50 rounded-xl">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] sm:text-xs text-gray-500">College</p>
                                                        <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{collegeName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-2 sm:p-3 bg-purple-50 rounded-xl">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] sm:text-xs text-gray-500">Department</p>
                                                        <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{departmentName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 p-2 sm:p-3 bg-pink-50 rounded-xl">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] sm:text-xs text-gray-500">Academic Year</p>
                                                        <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{studentInfo?.studentDetails?.academicYear || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-2 sm:p-3 bg-cyan-50 rounded-xl">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] sm:text-xs text-gray-500">Roll Number</p>
                                                        <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{studentInfo?.studentDetails?.rollNo || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Notifications */}
                            <div className="space-y-4 sm:space-y-6">
                                {/* Notifications Panel */}
                                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-gray-800 text-base sm:text-lg md:text-xl">
                                                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                                                Notifications
                                            </span>
                                            {notifications.length > 0 && (
                                         <Badge className="rounded-full text-xs animate-pulse bg-red-500 text-white">
  {notifications.length}
</Badge>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
  {notifications.length > 0 ? (
    <div className="space-y-2 sm:space-y-3">
      {notifications.slice(0, 3).map((notif) => (
       <div
  key={notif._id}
  className="p-2 sm:p-3 bg-white rounded-xl shadow-sm flex justify-between items-start hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
>
          {/* LEFT CONTENT */}
          <div
            className="flex-1 cursor-pointer"
            onClick={() => notif.link && navigate(notif.link)}
          >
            <p className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2">
              {notif.message}
            </p>

            {/* ✅ REAL TIME */}
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              {new Date(notif.date).toLocaleString()}
            </p>
          </div>

          {/* 🔥 DELETE BUTTON (THEME MATCHED) */}
          <button
            onClick={(e) => dismissNotification(notif._id, e)}
            className="ml-2 flex items-center justify-center w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition"
            title="Remove"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-6 sm:py-8">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
        <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
      </div>
      <p className="text-gray-500 text-xs sm:text-sm">
        No new notifications
      </p>
    </div>
  )}
</CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Courses Tab - Responsive Grid */}
                    <TabsContent value="courses" className="space-y-4 sm:space-y-6">
                        {loading ? <LoadingSpinner /> : (
                            <>
                                {courses.length === 0 ? (
                                    <div className="text-center py-12 sm:py-16 md:py-20 bg-gray-50 rounded-2xl shadow-sm">
                                        <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 mb-3 sm:mb-4" />
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No courses assigned yet</h3>
                                        <p className="text-gray-500 text-xs sm:text-sm px-4">Your organization will assign courses to you soon.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                                        {courses.map((course: any, index) => {
                                            const progress = course.progressPercentage || 0;
                                            const thumbnail = getCourseThumbnail(course);
                                            const quizData = quizSummaries[course._id];
                                            const averageScore = quizData?.averageScore || 0;
                                            
                                            return (
                                                <div 
                                                    key={course._id} 
                                                    className="group cursor-pointer animate-fade-in-up" 
                                                    style={{ animationDelay: `${index * 100}ms` }}
                                                    onClick={() => navigate(`/course/${course._id}`)}
                                                >
                                                 <Card className="overflow-hidden border-0 shadow-lg bg-white h-full flex flex-col hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                                                        <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden">
                                                            <img 
                                                                src={thumbnail} 
                                                                alt={course.title} 
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                                            <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3">
                                                                <Badge className={`${progress === 100 ? 'bg-green-500' : 'bg-orange-500'} text-white text-xs`}>
                                                                    {progress === 100 ? 'Completed' : `${progress}% Complete`}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <CardHeader className="p-3 sm:p-4">
                                                            <CardTitle className="text-sm sm:text-base md:text-lg line-clamp-2 group-hover:text-indigo-600 transition-colors text-gray-800">
                                                                {course.title || course.mainTopic}
                                                            </CardTitle>
                                                            <CardDescription className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
                                                                <Zap className="w-2 h-2 sm:w-3 sm:h-3" />
                                                                {course.type || "AI Generated Course"}
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="p-3 sm:p-4 pt-0 flex-1">
                                                            <div className="space-y-2 sm:space-y-3">
                                                                <div>
                                                                    <div className="flex justify-between text-[10px] sm:text-xs mb-1">
                                                                        <span className="text-gray-500">Progress</span>
                                                                        <span className="font-semibold text-indigo-600">{progress}%</span>
                                                                    </div>
                                                                    <Progress value={progress} className="h-1.5 sm:h-2" />
                                                                </div>
                                                                {averageScore > 0 && (
                                                                    <div className="flex items-center justify-between text-xs sm:text-sm">
                                                                        <span className="text-gray-500">Quiz Avg Score</span>
                                                                        <div className="flex items-center gap-1">
                                                                            <Star className="w-2 h-2 sm:w-3 sm:h-3 text-yellow-500 fill-yellow-500" />
                                                                            <span className="font-semibold text-gray-800">{averageScore}%</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-500">
                                                                    <span className="flex items-center gap-1">
                                                                        <Layers className="w-2 h-2 sm:w-3 sm:h-3" /> {course.topics?.length || 0} topics
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Brain className="w-2 h-2 sm:w-3 sm:h-3" /> AI Curated
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                        <div className="p-3 sm:p-4 pt-0">
                                                            <Button variant="ghost" className="w-full group-hover:bg-indigo-50 transition-colors text-gray-700 hover:text-indigo-700 text-xs sm:text-sm">
                                                                {progress === 0 ? 'Start Learning' : progress === 100 ? 'Review Course' : 'Continue Learning'}
                                                                <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3 ml-1 sm:ml-2" />
                                                            </Button>
                                                        </div>
                                                    </Card>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Internship Request Dialog - Responsive */}
                <Dialog open={openRequestDialog} onOpenChange={setOpenRequestDialog}>
                    <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl bg-white mx-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-gray-800">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                </div>
                                Request Internship
                            </DialogTitle>
                            <CardDescription className="text-gray-500 text-xs sm:text-sm">Fill out the details below to request an internship opportunity</CardDescription>
                        </DialogHeader>
                        <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label className="text-gray-700 text-xs sm:text-sm">Preferred Domain</Label>
                                <select
                                    className="flex h-9 sm:h-11 w-full rounded-xl border border-gray-200 bg-white text-gray-800 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={requestData.domain}
                                    onChange={(e) => setRequestData({ ...requestData, domain: e.target.value })}
                                >
                                    <option value="Web Development">🌐 Web Development</option>
                                    <option value="AI / Machine Learning">🤖 AI / Machine Learning</option>
                                    <option value="Data Science">📊 Data Science</option>
                                    <option value="Mobile App Dev">📱 Mobile App Development</option>
                                    <option value="Cloud Computing">☁️ Cloud Computing</option>
                                    <option value="Digital Marketing">📈 Digital Marketing</option>
                                    <option value="UI/UX Design">🎨 UI/UX Design</option>
                                </select>
                            </div>
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label className="text-gray-700 text-xs sm:text-sm">Work Nature / Specific Interest</Label>
                                <Textarea 
                                    placeholder="Describe your areas of interest and what you hope to learn..."
                                    value={requestData.workNature}
                                    onChange={(e) => setRequestData({ ...requestData, workNature: e.target.value })}
                                    className="rounded-xl focus:ring-2 focus:ring-indigo-500 border-gray-200 text-xs sm:text-sm"
                                    rows={3}
                                />
                            </div>
                            <Button onClick={handleRequestInternship} className="h-10 sm:h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-lg mt-1 sm:mt-2 text-xs sm:text-sm">
                                Submit Request
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default StudentPortal;
