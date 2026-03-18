
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, Building2, HelpCircle } from 'lucide-react';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const AdminLimitRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [processDialog, setProcessDialog] = useState(false);
    const [adminComment, setAdminComment] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get(`${serverURL}/api/limit-requests`);
            if (response.data.success) {
                setRequests(response.data.requests);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch limit requests",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async (status) => {
        if (!selectedRequest) return;
        try {
            const response = await axios.post(`${serverURL}/api/limit-request/process`, {
                requestId: selectedRequest._id,
                status,
                adminComment
            });
            if (response.data.success) {
                toast({
                    title: "Success",
                    description: `Request ${status} successfully`
                });
                setProcessDialog(false);
                setSelectedRequest(null);
                setAdminComment('');
                fetchRequests();
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to process request",
                variant: "destructive"
            });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': 
                return <Badge variant="outline" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
            case 'approved': 
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</Badge>;
            case 'rejected': 
                return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
            default: 
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Limit Increase Requests</h1>
                    <p className="text-muted-foreground mt-1">Review and process organization student limit requests</p>
                </div>
            </div>

            <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Organization</TableHead>
                            <TableHead>Requested Slot</TableHead>
                            <TableHead>Custom Limit</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No requests found
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request: any) => (
                                <TableRow key={request._id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <span>{request.organizationId?.organizationDetails?.institutionName || request.organizationId?.email || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>Slot {request.requestedSlot} ({request.requestedSlot * 50} students)</TableCell>
                                    <TableCell>{request.requestedCustomLimit || 'None'}</TableCell>
                                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                                    <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        {request.status === 'pending' && (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setProcessDialog(true);
                                                }}
                                            >
                                                Process
                                            </Button>
                                        )}
                                        {request.status !== 'pending' && (
                                             <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setProcessDialog(true);
                                                }}
                                            >
                                                View
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={processDialog} onOpenChange={setProcessDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedRequest?.status === 'pending' ? 'Process Request' : 'Request Details'}</DialogTitle>
                        <DialogDescription>
                            Organization: {selectedRequest?.organizationId?.organizationDetails?.institutionName || selectedRequest?.organizationId?.email}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Requested Slot</p>
                                    <p className="font-semibold">Slot {selectedRequest.requestedSlot} ({selectedRequest.requestedSlot * 50} Students)</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Requested Custom Limit</p>
                                    <p className="font-semibold">{selectedRequest.requestedCustomLimit || 'None'}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Admin Comment</Label>
                                <Textarea 
                                    value={adminComment || selectedRequest.adminComment || ''} 
                                    onChange={(e) => setAdminComment(e.target.value)}
                                    placeholder="Add a comment for the organization..."
                                    disabled={selectedRequest.status !== 'pending'}
                                />
                            </div>

                            {selectedRequest.status !== 'pending' && (
                                <div className="p-3 bg-muted rounded-lg text-sm">
                                    <p className="font-medium flex items-center gap-2">
                                        Status: {getStatusBadge(selectedRequest.status)}
                                    </p>
                                    {selectedRequest.processedAt && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Processed on {new Date(selectedRequest.processedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        {selectedRequest?.status === 'pending' ? (
                            <>
                                <Button variant="destructive" onClick={() => handleProcess('rejected')}>Reject</Button>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleProcess('approved')}>Approve</Button>
                            </>
                        ) : (
                            <Button variant="secondary" onClick={() => setProcessDialog(false)}>Close</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminLimitRequests;
