import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { serverURL } from '@/constants';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface CancellationRequest {
    _id: string;
    user?: {
        _id: string;
        mName: string;
        email: string;
    };
    plan: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

const AdminCancellationRequests = () => {
    const [requests, setRequests] = useState<CancellationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            const response = await axios.get(`${serverURL}/api/admin/cancellation-requests`);
            if (response.data.success) {
                setRequests(response.data.requests);
            }
        } catch (error) {
            console.error('Failed to fetch cancellation requests', error);
            toast({
                title: 'Error',
                description: 'Failed to load cancellation requests',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId: string, status: 'approved' | 'rejected') => {
        setActionLoading(requestId);
        try {
            const response = await axios.put(`${serverURL}/api/admin/cancellation-request`, {
                requestId,
                status,
            });

            if (response.data.success) {
                toast({
                    title: 'Success',
                    description: response.data.message,
                });
                fetchRequests(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to update request', error);
            toast({
                title: 'Error',
                description: 'Failed to update request status',
                variant: 'destructive',
            });
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Plan Cancellation Requests</h2>
                    <p className="text-muted-foreground mt-2">
                        Review and manage requests from users wishing to cancel their paid plans.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Cancellation Requests</CardTitle>
                    <CardDescription>All pending and past requests</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            No cancellation requests found.
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User Details</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Requested On</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((request) => (
                                        <TableRow key={request._id}>
                                            <TableCell>
                                                {request.user ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{request.user.mName}</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {request.user.email}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground italic">User Not Found</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {request.plan}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {request.reason || <span className="text-muted-foreground italic">No reason provided</span>}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(request.createdAt), 'MMM d, yyyy h:mm a')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        request.status === 'approved'
                                                            ? 'default'
                                                            : request.status === 'rejected'
                                                                ? 'destructive'
                                                                : 'secondary'
                                                    }
                                                    className={request.status === 'approved' ? 'bg-green-500 hover:bg-green-600' : ''}
                                                >
                                                    {request.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {request.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => handleAction(request._id, 'approved')}
                                                            disabled={actionLoading === request._id}
                                                        >
                                                            {actionLoading === request._id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                    Approve
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleAction(request._id, 'rejected')}
                                                            disabled={actionLoading === request._id}
                                                        >
                                                            {actionLoading === request._id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                    Reject
                                                                </>
                                                            )}
                                                        </Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminCancellationRequests;
