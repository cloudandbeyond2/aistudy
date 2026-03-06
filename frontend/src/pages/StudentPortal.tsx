import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, X, Briefcase, Sparkles, ClipboardCheck } from 'lucide-react';
import SEO from '@/components/SEO';
import axios from 'axios';
import { serverURL } from '@/constants';
import { useNavigate } from 'react-router-dom';

const StudentPortal = () => {
    const [courses, setCourses] = useState([]);
    const [studentInfo, setStudentInfo] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const navigate = useNavigate();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const orgId = sessionStorage.getItem('orgId'); // If stored
    const studentId = sessionStorage.getItem('uid');

    useEffect(() => {
        if (orgId && studentId) {
            fetchStudentInfo();
            fetchCourses();
            fetchNotifications();
        }
    }, [orgId, studentId]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/notifications/get`, { userId: studentId });
            // API returns the array directly, filter for unread
            const unread = res.data.filter((n: any) => !n.isRead);
            setNotifications(unread);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const dismissNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent redirect if clicking X
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
            if (res.data.success) {
                setStudentInfo(res.data.user);
            }
        } catch (e) {
            console.error('Error fetching student info:', e);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/student/courses?organizationId=${orgId}&studentId=${studentId}`);
            if (res.data.success) {
                setCourses(res.data.courses);
            }
        } catch (e) {
            console.error('Error fetching courses:', e);
        }
    };

    return (
        <div className="container mx-auto py-8 animate-fade-in space-y-6">
            <SEO title="Student Portal" description="Access your courses and learning materials." />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600">My Courses</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, <span className="font-medium text-foreground">{studentInfo?.mName || 'Scholar'}</span>!
                        {studentInfo?.studentDetails?.department && (
                            <span className="ml-2 text-primary font-medium">
                                • {studentInfo.studentDetails.department}
                                {studentInfo.studentDetails.section && ` - Section ${studentInfo.studentDetails.section}`}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Notifications Section */}
            {notifications.length > 0 && (
                <div className="space-y-3 mt-4 mb-6">
                    {notifications.map((notif) => {
                        let alertColor = "bg-blue-100 text-blue-800 border-blue-200"; // default primary
                        if (notif.type === 'success') alertColor = "bg-green-100 text-green-800 border-green-200";
                        if (notif.type === 'warning') alertColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
                        if (notif.type === 'error' || notif.type === 'danger') alertColor = "bg-red-100 text-red-800 border-red-200";
                        if (notif.type === 'info') alertColor = "bg-cyan-100 text-cyan-800 border-cyan-200";

                        return (
                            <div
                                key={notif._id}
                                className={`flex items-center justify-between p-4 rounded-md border shadow-sm cursor-pointer transition-colors ${alertColor}`}
                                onClick={() => {
                                    if (notif.link) {
                                        navigate(notif.link);
                                    }
                                }}
                            >
                                <div className="font-medium">
                                    {notif.message}
                                </div>
                                <button
                                    onClick={(e) => dismissNotification(notif._id, e)}
                                    className="p-1 hover:bg-black/10 rounded-full transition-colors flex-shrink-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length > 0 ? courses.map((course: any) => {
                    const title = course.title || course.mainTopic;
                    const rawDescription = course.description || (course.content ? "AI Generated Course" : "");
                    const description = rawDescription.replace(/<[^>]*>?/gm, '');
                    let topicCount = 0;
                    if (course.topics) {
                        topicCount = course.topics.length;
                    } else if (course.content) {
                        try {
                            const content = JSON.parse(course.content);
                            topicCount = content.course_topics?.length || 0;
                        } catch (e) {
                            console.error("Error parsing course content", e);
                        }
                    }

                    return (
                        <Card key={course._id} className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary group" onClick={() => window.location.href = `/course/${course._id}`}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    {title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2">{description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-4 h-4" />
                                            {topicCount} topics
                                        </span>
                                        <span className="font-medium text-primary">{course.progressPercentage || 0}% Complete</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-primary h-full transition-all duration-500"
                                            style={{ width: `${course.progressPercentage || 0}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground">
                                            {course.progressPercentage >= 100 ? 'View Course' : course.progressPercentage > 0 ? 'Continue Learning' : 'Start Learning'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                }) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 bg-muted/30 rounded-lg border-2 border-dashed">
                        <BookOpen className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-foreground">No Courses Assigned</h3>
                        <p className="text-muted-foreground mt-2">Your organization hasn't assigned any courses yet.</p>
                    </div>
                )}
            </div>

            <div className="mt-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-500" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" /> Career Module
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Your Career Growth Hub</h2>
                        <p className="text-blue-100 text-lg max-w-xl">
                            Build your professional portfolio, track placement readiness, and showcase your projects to the world.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                            <div className="flex items-center gap-1.5 text-sm bg-black/10 px-3 py-1.5 rounded-lg border border-white/10">
                                <ClipboardCheck className="w-4 h-4" /> AI Resume Builder
                            </div>
                            <div className="flex items-center gap-1.5 text-sm bg-black/10 px-3 py-1.5 rounded-lg border border-white/10">
                                <Briefcase className="w-4 h-4" /> Placement Score
                            </div>
                        </div>
                    </div>
                    <Button
                        size="lg"
                        variant="secondary"
                        className="rounded-full px-8 py-6 h-auto text-lg font-bold shadow-lg hover:shadow-white/10 transition-all group-hover:scale-105"
                        onClick={() => navigate('/dashboard/student/career')}
                    >
                        Go to Career Hub
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StudentPortal;
