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
    }, [orgId, studentId]);

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
                                            {course.progressPercentage > 0 ? 'Continue Learning' : 'Start Learning'}
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
        </div>
    );
};

export default StudentPortal;
