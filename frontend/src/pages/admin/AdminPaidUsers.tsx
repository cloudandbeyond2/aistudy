import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Settings, Trash2, Ban, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { serverURL } from '@/constants';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const AdminPaidUsers = () => {
  const { toast } = useToast();

  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editType, setEditType] = useState('monthly');

  /* ====================== EXPIRY LOGIC ====================== */
  const getSubscriptionStatus = (endDate, type) => {
    if (type === 'forever') return 'active';
    if (!endDate) return 'active';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (today.getTime() > end.getTime()) return 'expired';
    if (today.getTime() === end.getTime()) return 'alert';

    return 'active';
  };

  /* ====================== FETCH USERS ====================== */
  const fetchData = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/getpaid`);
      setData(res.data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load paid users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ====================== FILTER ====================== */
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return data.filter(
      (u) =>
        u.mName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  /* ====================== EDIT ====================== */
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditName(user.mName);
    setEditEmail(user.email);
    setEditType(user.type);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      await axios.post(`${serverURL}/api/admin/updateuser`, {
        userId: selectedUser._id,
        mName: editName,
        email: editEmail,
        type: editType,
      });

      toast({ title: 'User updated successfully' });
      setIsEditDialogOpen(false);
      fetchData();
    } catch {
      toast({
        title: 'Error',
        description: 'Update failed',
        variant: 'destructive',
      });
    }
  };

  const handleBlockToggle = async (userId, currentBlockedStatus) => {
    try {
      const response = await axios.post(`${serverURL}/api/admin/block-user`, {
        userId,
        isBlocked: !currentBlockedStatus,
      });

      if (response.data.success) {
        toast({
          title: `User ${!currentBlockedStatus ? 'blocked' : 'unblocked'
            } successfully`,
        });
        fetchData();
      }
    } catch {
      toast({ title: 'Server error', variant: 'destructive' });
    }
  };

  const handleDeleteClick = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;

    try {
      await axios.post(`${serverURL}/api/admin/deleteuser`, { userId });
      toast({ title: 'User deleted successfully' });
      fetchData();
    } catch {
      toast({
        title: 'Error',
        description: 'Delete failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paid Users</h1>
        <p className="text-muted-foreground mt-1">
          Manage active subscriptions
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>Active Subscriptions</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedData.length ? (
                paginatedData.map((user) => {
                  const status = getSubscriptionStatus(
                    user.subscriptionEnd,
                    user.type
                  );

                  return (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">
                        {user.mName}
                      </TableCell>

                      <TableCell>{user.email}</TableCell>

                      <TableCell>
                        <Badge>{user.type}</Badge>
                      </TableCell>

                      <TableCell>
                        {user.subscriptionStart
                          ? format(new Date(user.subscriptionStart), 'PPP')
                          : 'N/A'}
                      </TableCell>

                      <TableCell>
                        {user.type === 'forever'
                          ? 'Lifetime'
                          : user.subscriptionEnd
                            ? format(new Date(user.subscriptionEnd), 'PPP')
                            : 'N/A'}
                      </TableCell>

                      <TableCell>
                        {status === 'expired' && (
                          <Badge className="bg-red-900 text-white font-bold">
                            Expired
                          </Badge>
                        )}

                        {status === 'alert' && (
                          <Badge className="bg-yellow-500 text-black font-semibold">
                            Expiring Today
                          </Badge>
                        )}

                        {status === 'active' && (
                          <Badge className="bg-green-600 text-white">
                            Active
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              handleBlockToggle(user._id, user.isBlocked)
                            }
                          >
                            {user.isBlocked ? (
                              <UserCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <Ban className="h-4 w-4 text-destructive" />
                            )}
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditClick(user)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDeleteClick(user._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No paid users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="flex justify-end gap-2 mt-6">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>

              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user info and subscription plan
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <Input
                className="col-span-3"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Email</Label>
              <Input
                className="col-span-3"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Plan</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free (7 days)</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="forever">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleUpdateUser}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPaidUsers;