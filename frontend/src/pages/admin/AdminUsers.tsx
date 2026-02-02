
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Search, MoreVertical, Edit, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editType, setEditType] = useState('');
  const { toast } = useToast();

  // Filtered data using memoization for better performance
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return data.filter((user) => {
      const nameMatch = user.mName?.toLowerCase().includes(query);
      const emailMatch = user.email?.toLowerCase().includes(query);
      const typeDisplay = user.type !== 'free' ? 'paid' : 'free';
      const typeMatch = typeDisplay.includes(query);
      return nameMatch || emailMatch || typeMatch;
    });
  }, [data, searchQuery]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const postURL = serverURL + `/api/getusers`;
    const response = await axios.get(postURL);
    setData(response.data);
    setIsLoading(false);
  }

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditName(user.mName);
    setEditEmail(user.email);
    setEditType(user.type);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (userId) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const postURL = serverURL + '/api/admin/deleteuser';
        const response = await axios.post(postURL, { userId });
        if (response.data.success) {
          toast({
            title: "User deleted",
            description: "User has been successfully deleted.",
          });
          fetchData();
        } else {
          toast({
            title: "Error",
            description: "Failed to delete user",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Internal Server Error",
          variant: "destructive"
        });
      }
    }
  };

  const handleUpdateUser = async () => {
  if (!selectedUser) return;

  const { startDate, endDate } = getSubscriptionDates(editType);

  try {
    const postURL = serverURL + '/api/admin/updateuser';
    const response = await axios.post(postURL, {
      userId: selectedUser._id,
      mName: editName,
      email: editEmail,
      type: editType,
      subscriptionStart: startDate,
      subscriptionEnd: endDate,
    });

    if (response.data.success) {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsEditDialogOpen(false);
      fetchData();
    } else {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "Internal Server Error",
      variant: "destructive",
    });
  }
};


  const getSubscriptionDates = (type: string) => {
  const startDate = new Date();
  let endDate: Date | null = null;

  switch (type) {
    case MonthType:
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      break;

    case YearType:
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;

    case 'forever':
      endDate = null;
      break;

    case 'free':
    default:
      return { startDate: null, endDate: null };
  }

  return { startDate, endDate };
};


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">Manage your user accounts</p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Users</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="w-full pl-8"
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
            {isLoading ?
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                </TableRow>
              </TableBody>
              :
              <TableBody>
                {filteredData.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.mName}</TableCell>
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
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(user._id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-8 w-8 mb-2" />
                        <p>No users match your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            }
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and subscription plan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Plan
              </Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger className="col-span-3">
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
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateUser}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
