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
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDialog, setConfirmDialog] = useState(false);
const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
const [statusFilter, setStatusFilter] = useState("all");

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
        // if (status === 'completed') {
        //     const confirmDelete = window.confirm(
        //         'WARNING: This will permanently delete the user and all their associated data (courses, certificates, etc.). This cannot be undone. Are you sure?'
        //     );
        //     if (!confirmDelete) return;
        // }

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
const filteredRequests = requests.filter((req) => {

  const q = searchQuery.toLowerCase();

  const matchesSearch =
    req.user?.mName?.toLowerCase().includes(q) ||
    req.user?.email?.toLowerCase().includes(q) ||
    req.reason?.toLowerCase().includes(q);

  const matchesStatus =
    statusFilter === "all" || req.status === statusFilter;

  return matchesSearch && matchesStatus;
});

   return (
  <div className="space-y-6">

    {/* Page Title */}
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Account Deletion Requests
        </h2>
        <p className="text-muted-foreground mt-2">
          Review and manage requests from users wishing to delete their accounts.
        </p>
      </div>
    </div>

    <Card>

      {/* Header */}
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Deletion Requests</CardTitle>
            <CardDescription>
              All pending and past requests
            </CardDescription>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

            <div className="flex gap-2 mt-3">

<Button
variant={statusFilter === "all" ? "default" : "outline"}
size="sm"
onClick={() => setStatusFilter("all")}
>
All
</Button>

<Button
variant={statusFilter === "pending" ? "default" : "outline"}
size="sm"
onClick={() => setStatusFilter("pending")}
>
Pending
</Button>

<Button
variant={statusFilter === "completed" ? "default" : "outline"}
size="sm"
onClick={() => setStatusFilter("completed")}
>
Completed
</Button>

<Button
variant={statusFilter === "rejected" ? "default" : "outline"}
size="sm"
onClick={() => setStatusFilter("rejected")}
>
Rejected
</Button>

</div>
        </div>
      </CardHeader>

      {/* Table */}
      <CardContent>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>

        ) : filteredRequests.length === 0 ? (
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

                {filteredRequests.map((request) => (

                  <TableRow key={request._id}>

                    <TableCell>
                      {request.user ? (
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {request.user.mName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {request.user.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">
                          User Deleted
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="max-w-xs truncate">
                      {request.reason || "No reason provided"}
                    </TableCell>

                    <TableCell>
                      {format(new Date(request.createdAt), "MMM d, yyyy h:mm a")}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          request.status === "completed"
                            ? "default"
                            : request.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          request.status === "completed"
                            ? "bg-green-500"
                            : ""
                        }
                      >
                        {request.status.toUpperCase()}
                      </Badge>
                    </TableCell>

                   <TableCell className="text-right space-x-2">

  {request.status === "pending" && request.user ? (

    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {
          setSelectedRequest(request._id);
          setConfirmDialog(true);
        }}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Approve & Delete
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAction(request._id, "rejected")}
      >
        <XCircle className="mr-2 h-4 w-4" />
        Reject
      </Button>
    </>

  ) : (

    <span className="text-sm text-muted-foreground italic">
      No actions
    </span>

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


    {/* Confirmation Dialog */}
    <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
      <DialogContent>

        <DialogHeader>
          <DialogTitle>Confirm Account Deletion</DialogTitle>
          <DialogDescription>
            This will permanently delete the user and ALL their data including
            courses, certificates and records. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>

          <Button
            variant="outline"
            onClick={() => setConfirmDialog(false)}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={() => {
              if (selectedRequest) {
                handleAction(selectedRequest, "completed");
                setConfirmDialog(false);
              }
            }}
          >
            Delete User
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>

  </div>
);
};

export default AdminDeletionRequests;
