
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle } from 'lucide-react';
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
                            <p className="border-b pb-2 mb-4 line-clamp-3 text-sm text-muted-foreground">{assign.description}</p>
                            {assign.isSubmitted ? (
                                <Button className="w-full" size="sm" variant="secondary" disabled>
                                    <CheckCircle className="w-4 h-4 mr-2" /> Submitted
                                </Button>
                            ) : (
                                <Button className="w-full" size="sm" onClick={() => window.location.href = `/dashboard/student/assignment/${assign._id}`}>
                                    Start Assignment
                                </Button>
                            )}
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
