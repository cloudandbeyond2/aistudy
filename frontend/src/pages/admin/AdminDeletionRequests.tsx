import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import {
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  Search,
  ShieldAlert,
  Trash2,
  XCircle,
} from 'lucide-react';

import { serverURL } from '@/constants';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface RequestUser {
  _id: string;
  mName?: string;
  email?: string;
  role?: string;
  type?: string;
  phone?: string;
  date?: string;
  isOrganization?: boolean;
  organizationDetails?: {
    institutionName?: string;
  };
  organization?: {
    name?: string;
    email?: string;
  };
  organizationId?: {
    mName?: string;
    email?: string;
    organizationDetails?: {
      institutionName?: string;
    };
  };
  department?: {
    name?: string;
    description?: string;
  };
}

interface DeletionRequest {
  _id: string;
  user?: RequestUser | null;
  reason: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
}

const getOrganizationName = (user?: RequestUser | null) =>
  user?.organizationDetails?.institutionName ||
  user?.organizationId?.organizationDetails?.institutionName ||
  user?.organization?.name ||
  user?.organizationId?.mName ||
  'Independent user';

const getStatusBadgeClass = (status: DeletionRequest['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500/15 text-emerald-700 border-emerald-200';
    case 'rejected':
      return 'bg-rose-500/15 text-rose-700 border-rose-200';
    default:
      return 'bg-amber-500/15 text-amber-700 border-amber-200';
  }
};

const AdminDeletionRequests = () => {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null);
  const [viewRequest, setViewRequest] = useState<DeletionRequest | null>(null);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${serverURL}/api/admin/deletion-requests`);
      if (response.data.success) {
        setRequests(response.data.requests || []);
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
        fetchRequests();
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

  const filteredRequests = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return requests.filter((request) => {
      const matchesSearch =
        !q ||
        request.user?.mName?.toLowerCase().includes(q) ||
        request.user?.email?.toLowerCase().includes(q) ||
        request.reason?.toLowerCase().includes(q) ||
        getOrganizationName(request.user).toLowerCase().includes(q) ||
        request.user?.department?.name?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((request) => request.status === 'pending').length,
      completed: requests.filter((request) => request.status === 'completed').length,
      rejected: requests.filter((request) => request.status === 'rejected').length,
    };
  }, [requests]);

  const openDeleteDialog = (request: DeletionRequest) => {
    setSelectedRequest(request);
    setConfirmDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Account Deletion Requests</h2>
        <p className="text-muted-foreground">
          Review each request with user context before approving a permanent account deletion.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Total requests</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Pending review</CardDescription>
            <CardTitle className="text-3xl text-amber-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Completed deletions</CardDescription>
            <CardTitle className="text-3xl text-emerald-600">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Rejected requests</CardDescription>
            <CardTitle className="text-3xl text-rose-600">{stats.rejected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Deletion queue</CardTitle>
            <CardDescription>
              Search requests, inspect user information, then approve or reject safely.
            </CardDescription>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.6fr_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, email, reason, organization, department..."
                className="pl-9"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
              No deletion requests found for the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Requested On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell className="align-top">
                        {request.user ? (
                          <div className="space-y-1">
                            <div className="font-medium">{request.user.mName || 'Unnamed user'}</div>
                            <div className="text-sm text-muted-foreground">{request.user.email}</div>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {request.user.role && <Badge variant="outline">{request.user.role}</Badge>}
                              {request.user.type && <Badge variant="secondary">{request.user.type}</Badge>}
                            </div>
                          </div>
                        ) : (
                          <span className="italic text-muted-foreground">User already deleted</span>
                        )}
                      </TableCell>

                      <TableCell className="align-top">
                        <div className="space-y-1 text-sm">
                          <div className="font-medium">{getOrganizationName(request.user)}</div>
                          <div className="text-muted-foreground">
                            {request.user?.department?.name || 'No department assigned'}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="max-w-sm align-top text-sm text-muted-foreground">
                        <div className="line-clamp-3">
                          {request.reason?.trim() || 'No reason provided'}
                        </div>
                      </TableCell>

                      <TableCell className="align-top text-sm">
                        {format(new Date(request.createdAt), 'MMM d, yyyy h:mm a')}
                      </TableCell>

                      <TableCell className="align-top">
                        <Badge variant="outline" className={getStatusBadgeClass(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right align-top">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setViewRequest(request)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>

                          {request.status === 'pending' && request.user ? (
                            <>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={actionLoading === request._id}
                                onClick={() => openDeleteDialog(request)}
                              >
                                {actionLoading === request._id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Approve
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                disabled={actionLoading === request._id}
                                onClick={() => handleAction(request._id, 'rejected')}
                              >
                                {actionLoading === request._id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="mr-2 h-4 w-4" />
                                )}
                                Reject
                              </Button>
                            </>
                          ) : (
                            <span className="text-sm italic text-muted-foreground">No actions</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(viewRequest)} onOpenChange={(open) => !open && setViewRequest(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deletion request details</DialogTitle>
            <DialogDescription>
              Review the request reason and account information before taking action.
            </DialogDescription>
          </DialogHeader>

          {viewRequest && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-slate-200 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Request summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <Badge variant="outline" className={getStatusBadgeClass(viewRequest.status)}>
                      {viewRequest.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Requested on</div>
                    <div className="font-medium">{format(new Date(viewRequest.createdAt), 'PPP p')}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Reason</div>
                    <div className="rounded-lg bg-slate-50 p-3 text-slate-700">
                      {viewRequest.reason?.trim() || 'No reason provided'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">User information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Name</div>
                    <div className="font-medium">{viewRequest.user?.mName || 'User already deleted'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium">{viewRequest.user?.email || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Role</div>
                    <div className="font-medium">{viewRequest.user?.role || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Plan</div>
                    <div className="font-medium">{viewRequest.user?.type || 'free'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Organization</div>
                    <div className="font-medium">{getOrganizationName(viewRequest.user)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Department</div>
                    <div className="font-medium">{viewRequest.user?.department?.name || 'No department assigned'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Phone</div>
                    <div className="font-medium">{viewRequest.user?.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Joined</div>
                    <div className="font-medium">
                      {viewRequest.user?.date ? format(new Date(viewRequest.user.date), 'PPP') : 'N/A'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm account deletion</DialogTitle>
            <DialogDescription>
              This permanently deletes the user and linked data. Review the request details first if you are unsure.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <ShieldAlert className="h-4 w-4" />
                Destructive action
              </div>
              <div>User: {selectedRequest.user?.mName || 'Deleted user'}</div>
              <div>Email: {selectedRequest.user?.email || 'N/A'}</div>
              <div>Requested: {format(new Date(selectedRequest.createdAt), 'PPP p')}</div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!selectedRequest || actionLoading === selectedRequest._id}
              onClick={() => {
                if (!selectedRequest) return;
                handleAction(selectedRequest._id, 'completed');
                setConfirmDialog(false);
              }}
            >
              {selectedRequest && actionLoading === selectedRequest._id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Delete user permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDeletionRequests;
