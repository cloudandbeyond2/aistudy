import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Edit, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { serverURL, MonthType, YearType } from '@/constants';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const AdminUsers = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editType, setEditType] = useState('');

  const { toast } = useToast();

  // ---------------- FETCH USERS ----------------
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await axios.get(`${serverURL}/api/getusers`);
      setData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  // ---------------- FILTER ----------------
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return data.filter((user) => {
      const nameMatch = user.mName?.toLowerCase().includes(query);
      const emailMatch = user.email?.toLowerCase().includes(query);
      const typeMatch = (user.type !== 'free' ? 'paid' : 'free').includes(query);
      return nameMatch || emailMatch || typeMatch;
    });
  }, [data, searchQuery]);

  // reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // ---------------- PAGINATION ----------------
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // ---------------- EDIT / DELETE ----------------
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditName(user.mName);
    setEditEmail(user.email);
    setEditType(user.type);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await axios.post(`${serverURL}/api/admin/deleteuser`, { userId });
      if (response.data.success) {
        toast({ title: 'User deleted successfully' });
        fetchData();
      } else {
        toast({ title: 'Delete failed', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Server error', variant: 'destructive' });
    }
  };

  const getSubscriptionDates = (type) => {
    const startDate = new Date();
    let endDate = null;

    if (type === MonthType) {
      endDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
    } else if (type === YearType) {
      endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
    } else if (type === 'free') {
      return { startDate: null, endDate: null };
    }

    return { startDate, endDate };
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    const { startDate, endDate } = getSubscriptionDates(editType);

    try {
      const response = await axios.post(`${serverURL}/api/admin/updateuser`, {
        userId: selectedUser._id,
        mName: editName,
        email: editEmail,
        type: editType,
        subscriptionStart: startDate,
        subscriptionEnd: endDate,
      });

      if (response.data.success) {
        toast({ title: 'User updated successfully' });
        setIsEditDialogOpen(false);
        fetchData();
      } else {
        toast({ title: 'Update failed', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Server error', variant: 'destructive' });
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center gap-4">
            <CardTitle>All Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
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
                <TableHead>Type</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.mName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.type !== 'free' ? 'default' : 'secondary'}>
                        {user.type !== 'free' ? 'Paid' : 'Free'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.date ? format(new Date(user.date), 'PPP') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => handleEditClick(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(user._id)}>
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-end gap-2 mt-6">
              <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
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

              <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
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
            <DialogDescription>Update user details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" />
            <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" />

            <Select value={editType} onValueChange={setEditType}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="forever">Lifetime</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button onClick={handleUpdateUser}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
