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

interface DeletionRequest {
    _id: string;
    user?: {
        _id: string;
        mName: string;
        email: string;
    };
    reason: string;
    status: 'pending' | 'completed' | 'rejected';
    createdAt: string;
}

const AdminDeletionRequests = () => {
    const [requests, setRequests] = useState<DeletionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            const response = await axios.get(`${serverURL}/api/admin/deletion-requests`);
            if (response.data.success) {
                setRequests(response.data.requests);
            }
        } catch (error) {
            console.error('Failed to fetch deletion requests', error);
            toast({
                title: 'Error',
                description: 'Failed to load deletion requests',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId: string, status: 'completed' | 'rejected') => {
        if (status === 'completed') {
            const confirmDelete = window.confirm(
                'WARNING: This will permanently delete the user and all their associated data (courses, certificates, etc.). This cannot be undone. Are you sure?'
            );
            if (!confirmDelete) return;
        }

        setActionLoading(requestId);
        try {
            const response = await axios.put(`${serverURL}/api/admin/deletion-request`, {
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
                    <h2 className="text-3xl font-bold tracking-tight">Account Deletion Requests</h2>
                    <p className="text-muted-foreground mt-2">
                        Review and manage requests from users wishing to delete their accounts.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Deletion Requests</CardTitle>
                    <CardDescription>All pending and past requests</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            No deletion requests found.
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User Details</TableHead>
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
                                                    <span className="text-muted-foreground italic">User Deleted</span>
                                                )}
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
                                                        request.status === 'completed'
                                                            ? 'default'
                                                            : request.status === 'rejected'
                                                                ? 'destructive'
                                                                : 'secondary'
                                                    }
                                                    className={request.status === 'completed' ? 'bg-green-500' : ''}
                                                >
                                                    {request.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {request.status === 'pending' && request.user && (
                                                    <>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleAction(request._id, 'completed')}
                                                            disabled={actionLoading === request._id}
                                                        >
                                                            {actionLoading === request._id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                    Approve & Delete
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

export default AdminDeletionRequests;
