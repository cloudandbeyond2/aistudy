import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText } from 'lucide-react';
import SEO from '@/components/SEO';
import axios from 'axios';
import { serverURL } from '@/constants';

const StudentPortal = () => {
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

    return (
        <div className="container mx-auto py-8 animate-fade-in space-y-6">
            <SEO title="Student Portal" description="Access your courses." />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600">Student Dashboard</h1>
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
            </div>

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
        </div>
    );
};

export default StudentPortal;
