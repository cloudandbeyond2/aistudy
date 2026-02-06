
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, BookOpen, Clock, FileText, CheckCircle } from 'lucide-react';
import SEO from '@/components/SEO';
import axios from 'axios';
import { serverURL } from '@/constants';

const StudentPortal = () => {
    const [assignments, setAssignments] = useState([]);
    const [notices, setNotices] = useState([]);
    const [courses, setCourses] = useState([]);
    const [studentInfo, setStudentInfo] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const orgId = sessionStorage.getItem('orgId'); // If stored
    const studentId = sessionStorage.getItem('uid');

    useEffect(() => {
        if (orgId && studentId) {
            fetchStudentInfo();
            fetchCourses();
            fetchAssignments();
            fetchNotices();
        }
    }, []);

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

    const fetchAssignments = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/assignments?organizationId=${orgId}`);
            if (res.data.success) {
                setAssignments(res.data.assignments);
            }
        } catch (e) {
            console.error('Error fetching assignments:', e);
        }
    };

    const fetchNotices = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/notices?organizationId=${orgId}`);
            if (res.data.success) {
                setNotices(res.data.notices);
            }
        } catch (e) {
            console.error('Error fetching notices:', e);
        }
    };

    return (
        <div className="container mx-auto py-8 animate-fade-in space-y-6">
            <SEO title="Student Portal" description="Access your courses, assignments, and grades." />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600">Student Portal</h1>
                    <p className="text-muted-foreground">
                        Welcome back, {studentInfo?.mName || 'Scholar'}!
                        {studentInfo?.studentDetails?.department && (
                            <span className="ml-2 text-primary font-medium">
                                • {studentInfo.studentDetails.department}
                                {studentInfo.studentDetails.section && ` - Section ${studentInfo.studentDetails.section}`}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Placeholder for notifications or profile quick link */}
                </div>
            </div>

            <Tabs defaultValue="courses" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
                    <TabsTrigger value="courses">My Courses</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="notices">Notices</TabsTrigger>
                </TabsList>

                <TabsContent value="courses">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.length > 0 ? courses.map((course: any) => {
                            const title = course.title || course.mainTopic;
                            const description = course.description || (course.content ? "AI Generated Course" : "");
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
                                <Card key={course._id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => window.location.href = `/course/${course._id}`}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-primary" />
                                            {title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">{description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                {topicCount} topics
                                            </span>
                                            <Button size="sm" variant="outline">View Course</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        }) : (
                            <div className="col-span-full text-center py-10 bg-muted/30 rounded-lg">
                                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                                <h3 className="text-lg font-medium">No Courses Assigned</h3>
                                <p className="text-muted-foreground">Your organization hasn't assigned any courses yet.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="assignments" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assignments.length > 0 ? assignments.map((assign: any) => (
                            <Card key={assign._id}>
                                <CardHeader>
                                    <CardTitle>{assign.topic}</CardTitle>
                                    <CardDescription>Due: {new Date(assign.dueDate).toLocaleDateString()}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="border-b pb-2 mb-2">{assign.description}</p>
                                    <Button className="w-full" size="sm" onClick={() => window.location.href = `/dashboard/student/assignment/${assign._id}`}>Start Assignment</Button>
                                </CardContent>
                            </Card>
                        )) : (
                            <div className="col-span-full text-center py-10 bg-muted/30 rounded-lg">
                                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                                <h3 className="text-lg font-medium">No Pending Assignments</h3>
                                <p className="text-muted-foreground">You're all caught up!</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="notices" className="space-y-4">
                    {notices.length > 0 ? notices.map((notice: any) => (
                        <Card key={notice._id} className="border-l-4 border-l-primary">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-primary" />
                                    {notice.title}
                                </CardTitle>
                                <CardDescription>{new Date(notice.createdAt).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {notice.content}
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">No new notices from your organization.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StudentPortal;
