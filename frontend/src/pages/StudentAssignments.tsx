
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, Download } from 'lucide-react';
import SEO from '@/components/SEO';
import axios from 'axios';
import { serverURL } from '@/constants';

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const orgId = sessionStorage.getItem('orgId');
    const studentId = sessionStorage.getItem('uid');

    useEffect(() => {
        if (orgId && studentId) {
            fetchAssignments();
        }
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/assignments?organizationId=${orgId}&studentId=${studentId}`);
            if (res.data.success) {
                setAssignments(res.data.assignments);
            }
        } catch (e) {
            console.error('Error fetching assignments:', e);
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <SEO title="My Assignments" description="View and submit your assignments." />

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600">My Assignments</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignments.length > 0 ? assignments.map((assign: any) => (
                    <Card key={assign._id} className="hover:shadow-md transition-all">
                        <CardHeader>
                            <CardTitle className="line-clamp-1">{assign.topic}</CardTitle>
                            <CardDescription>Due: {new Date(assign.dueDate).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <p className="border-b pb-2 line-clamp-3 text-sm text-muted-foreground flex-1">{assign.description}</p>
                                {assign.latestGrade && (
                                    <div className="ml-2 flex flex-col items-end">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase">Grade</span>
                                        <span className={`text-lg font-bold ${assign.latestGrade === 'A' ? 'text-green-600' : assign.latestGrade === 'B' ? 'text-blue-600' : assign.latestGrade === 'E' ? 'text-red-600' : 'text-gray-700'}`}>
                                            {assign.latestGrade}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {(() => {
                                const isOverdue = new Date() > new Date(assign.dueDate);
                                const isResubmit = assign.latestSubmissionStatus === 'resubmit_required';

                                if (['A', 'B', 'C', 'D'].includes(assign.latestGrade)) {
                                    return (
                                        <div className="space-y-2">
                                            <Button className="w-full" size="sm" variant="secondary" disabled>
                                                <CheckCircle className="w-4 h-4 mr-2" /> Graded: {assign.latestGrade}
                                            </Button>
                                            <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white" size="sm" onClick={() => window.location.href = `/dashboard/student/assignment/certificate/${assign.latestSubmissionId}`}>
                                                <Download className="w-4 h-4 mr-2" /> Download Certificate
                                            </Button>
                                        </div>
                                    );
                                }

                                if (assign.isSubmitted) {
                                    return (
                                        <Button className="w-full" size="sm" variant="secondary" disabled>
                                            <CheckCircle className="w-4 h-4 mr-2" /> Submitted
                                        </Button>
                                    );
                                }

                                if (isOverdue) {
                                    return (
                                        <Button className="w-full" size="sm" variant="outline" disabled className="text-destructive border-destructive/50 bg-destructive/5">
                                            <span className="mr-2">⚠️</span> Overdue
                                        </Button>
                                    );
                                }

                                if (isResubmit) {
                                    return (
                                        <Button className="w-full" size="sm" variant="destructive" onClick={() => window.location.href = `/dashboard/student/assignment/${assign._id}`}>
                                            Resubmit Required (Grade E)
                                        </Button>
                                    );
                                }

                                return (
                                    <Button className="w-full" size="sm" onClick={() => window.location.href = `/dashboard/student/assignment/${assign._id}`}>
                                        Start Assignment
                                    </Button>
                                );
                            })()}
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
        </div>
    );
};

export default StudentAssignments;
