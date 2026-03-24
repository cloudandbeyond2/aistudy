import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverURL } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { CheckCircle2, Clock3, XCircle, RotateCcw } from 'lucide-react';

const AdminQuizRetakeRequests = () => {
    const { toast } = useToast();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [adminComment, setAdminComment] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${serverURL}/api/quiz-retake-requests`);
            if (response.data?.success) {
                setRequests(response.data.requests || []);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load retake requests.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="mr-1 h-3 w-3" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
            case 'consumed':
                return <Badge variant="secondary"><RotateCcw className="mr-1 h-3 w-3" />Used</Badge>;
            default:
                return <Badge variant="outline"><Clock3 className="mr-1 h-3 w-3" />Pending</Badge>;
        }
    };

    const openDialog = (request: any) => {
        setSelectedRequest(request);
        setAdminComment(request?.adminComment || '');
        setDialogOpen(true);
    };

    const handleReview = async (status: 'approved' | 'rejected') => {
        if (!selectedRequest) return;
        setProcessing(true);
        try {
            const response = await axios.post(`${serverURL}/api/quiz-retake-requests/review`, {
                requestId: selectedRequest._id,
                status,
                adminComment,
                reviewerId: sessionStorage.getItem('email') || sessionStorage.getItem('uid') || ''
            });
            if (response.data?.success) {
                toast({
                    title: 'Updated',
                    description: `Retake request ${status}.`
                });
                setDialogOpen(false);
                setSelectedRequest(null);
                setAdminComment('');
                fetchRequests();
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Failed to update retake request.',
                variant: 'destructive'
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quiz Retake Requests</h1>
                <p className="text-muted-foreground mt-1">
                    Approve or reject learner retake requests before a new legacy quiz attempt is allowed.
                </p>
            </div>

            <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Latest Score</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Requested</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                                    No retake requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request) => (
                                <TableRow key={request._id}>
                                    <TableCell>
                                        <div className="font-medium">{request.studentName || 'Student'}</div>
                                        <div className="text-xs text-muted-foreground">{request.studentEmail || 'No email'}</div>
                                    </TableCell>
                                    <TableCell>{request.courseTitle || 'Course'}</TableCell>
                                    <TableCell>{request.latestPercentage || 0}%</TableCell>
                                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                                    <TableCell>{new Date(request.createdAt).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => openDialog(request)}>
                                            {request.status === 'pending' ? 'Review' : 'View'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Retake Request Review</DialogTitle>
                        <DialogDescription>
                            {selectedRequest?.studentName || 'Student'} requested another attempt for {selectedRequest?.courseTitle || 'this quiz'}.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4 py-2">
                            <div className="grid gap-3 sm:grid-cols-2 text-sm">
                                <div className="rounded-lg border p-3">
                                    <p className="text-muted-foreground">Latest percentage</p>
                                    <p className="text-lg font-semibold">{selectedRequest.latestPercentage || 0}%</p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-muted-foreground">Request status</p>
                                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                                </div>
                            </div>

                            <div className="rounded-lg border p-3 text-sm">
                                <p className="font-medium">Student reason</p>
                                <p className="mt-1 text-muted-foreground">{selectedRequest.requestReason || 'No reason provided.'}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Admin comment</p>
                                <Textarea
                                    value={adminComment}
                                    onChange={(e) => setAdminComment(e.target.value)}
                                    placeholder="Add your decision note for the learner."
                                    disabled={selectedRequest.status !== 'pending'}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        {selectedRequest?.status === 'pending' ? (
                            <>
                                <Button variant="destructive" onClick={() => handleReview('rejected')} disabled={processing}>
                                    Reject
                                </Button>
                                <Button onClick={() => handleReview('approved')} disabled={processing}>
                                    Approve
                                </Button>
                            </>
                        ) : (
                            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                                Close
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminQuizRetakeRequests;
