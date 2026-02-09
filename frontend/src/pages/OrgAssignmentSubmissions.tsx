
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import SEO from '@/components/SEO';

const OrgAssignmentSubmissions = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [gradingLoading, setGradingLoading] = useState<string | null>(null);

    useEffect(() => {
        if (assignmentId) {
            fetchAssignmentDetails();
            fetchSubmissions();
        }
    }, [assignmentId]);

    const fetchAssignmentDetails = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/assignment/${assignmentId}`);
            if (res.data.success) {
                setAssignment(res.data.assignment);
            }
        } catch (e) {
            console.error("Failed to fetch assignment details", e);
        }
    };

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${serverURL}/api/org/assignment/${assignmentId}/submissions`);
            if (res.data.success) {
                setSubmissions(res.data.submissions);
            }
        } catch (e) {
            console.error("Failed to fetch submissions", e);
            toast({ title: "Error", description: "Failed to load submissions", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleGradeChange = async (submissionId: string, grade: string) => {
        setGradingLoading(submissionId);
        try {
            const res = await axios.post(`${serverURL}/api/org/assignment/submission/${submissionId}/grade`, {
                grade
            });

            if (res.data.success) {
                toast({ title: "Success", description: "Grade updated successfully" });
                // Update local state
                setSubmissions(submissions.map(sub =>
                    sub._id === submissionId ? { ...sub, grade, status: grade === 'E' ? 'resubmit_required' : 'graded' } : sub
                ));
            } else {
                toast({ title: "Error", description: res.data.message, variant: "destructive" });
            }
        } catch (e) {
            console.error("Grading error:", e);
            toast({ title: "Error", description: "Failed to update grade", variant: "destructive" });
        } finally {
            setGradingLoading(null);
        }
    };

    const getStatusBadge = (status: string, grade?: string) => {
        if (status === 'resubmit_required') return <Badge variant="destructive">Resubmit Required (Grade E)</Badge>;
        if (status === 'graded') return <Badge className='bg-green-600 hover:bg-green-700 text-white border-transparent'>Graded: {grade}</Badge>;
        if (status === 'submitted') return <Badge variant="secondary">Submitted</Badge>;
        return <Badge variant="outline">{status}</Badge>;
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <SEO title={`Submissions - ${assignment?.topic || 'Assignment'}`} description="View and grade assignments" />

            <Button variant="ghost" onClick={() => navigate('/dashboard/org')} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{assignment?.topic || 'Assignment Submissions'}</h1>
                    <p className="text-muted-foreground mt-1">{assignment?.description}</p>
                </div>
                {/* <Button variant="outline" onClick={fetchSubmissions}>Refresh</Button> */}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Student Submissions ({submissions.length})</CardTitle>
                    <CardDescription>Review and grade student work. Giving 'E' grade will require resubmission.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No submissions received yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>File</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Grade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((sub) => (
                                    <TableRow key={sub._id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{sub.studentId?.mName || 'Unknown'}</div>
                                                <div className="text-xs text-muted-foreground">{sub.studentId?.email}</div>
                                                <div className="text-xs text-muted-foreground">{sub.studentId?.studentDetails?.rollNo}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                                <span className="text-xs text-muted-foreground block">
                                                    {new Date(sub.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {sub.fileUrl ? (
                                                <a
                                                    href={`${serverURL}${sub.fileUrl}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center text-blue-600 hover:underline"
                                                >
                                                    <FileText className="w-4 h-4 mr-1" /> View File <ExternalLink className="w-3 h-3 ml-1" />
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground italic">No file</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(sub.status, sub.grade)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    defaultValue={sub.grade}
                                                    onValueChange={(val) => handleGradeChange(sub._id, val)}
                                                    disabled={gradingLoading === sub._id}
                                                >
                                                    <SelectTrigger className="w-[100px]">
                                                        <SelectValue placeholder="Grade" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="A">Grade A</SelectItem>
                                                        <SelectItem value="B">Grade B</SelectItem>
                                                        <SelectItem value="C">Grade C</SelectItem>
                                                        <SelectItem value="D">Grade D</SelectItem>
                                                        <SelectItem value="E">Grade E (Resubmit)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {gradingLoading === sub._id && <Loader2 className="w-4 h-4 animate-spin" />}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default OrgAssignmentSubmissions;
