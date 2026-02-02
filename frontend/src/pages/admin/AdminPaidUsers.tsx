// import React, { useEffect, useMemo, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Search, Settings, Trash2 } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Skeleton } from '@/components/ui/skeleton';
// import { MonthType, serverURL, YearType } from '@/constants';
// import axios from 'axios';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Button } from '@/components/ui/button';
// import { useToast } from '@/hooks/use-toast';
// import { format } from 'date-fns';

// const AdminPaidUsers = () => {
//   const [data, setData] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [editName, setEditName] = useState('');
//   const [editEmail, setEditEmail] = useState('');
//   const [editType, setEditType] = useState('');
//   const { toast } = useToast();

//   /* ---------------------- Filter Logic ---------------------- */
//   const filteredData = useMemo(() => {
//     const query = searchQuery.toLowerCase().trim();
//     return data.filter((user) => {
//       const nameMatch = user.mName?.toLowerCase().includes(query);
//       const emailMatch = user.email?.toLowerCase().includes(query);
//       return nameMatch || emailMatch;
//     });
//   }, [data, searchQuery]);

//   /* ---------------------- Fetch Users ---------------------- */
//   useEffect(() => {
//     fetchData();
//   }, []);

//   async function fetchData() {
//     try {
//       const response = await axios.get(`${serverURL}/api/getpaid`);
//       setData(response.data);
//     } catch (error) {
//       console.error(error);
//       toast({
//         title: 'Error',
//         description: 'Failed to load users',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   /* ---------------------- Edit ---------------------- */
//   const handleEditClick = (user) => {
//     setSelectedUser(user);
//     setEditName(user.mName);
//     setEditEmail(user.email);
//     setEditType(user.type);
//     setIsEditDialogOpen(true);
//   };

//   /* ---------------------- Delete ---------------------- */
//   const handleDeleteClick = async (userId) => {
//     const confirmDelete = window.confirm(
//       'Are you sure you want to delete this user? This action cannot be undone.'
//     );

//     if (!confirmDelete) return;

//     try {
//       const response = await axios.post(
//         `${serverURL}/api/admin/deleteuser`,
//         { userId }
//       );

//       if (response.data.success) {
//         toast({
//           title: 'User deleted',
//           description: 'User has been successfully deleted.',
//         });
//         fetchData();
//       } else {
//         toast({
//           title: 'Error',
//           description: 'Failed to delete user',
//           variant: 'destructive',
//         });
//       }
//     } catch (error) {
//       console.error(error);
//       toast({
//         title: 'Error',
//         description: 'Internal Server Error',
//         variant: 'destructive',
//       });
//     }
//   };

//   /* ---------------------- Update ---------------------- */
//   const handleUpdateUser = async () => {
//     if (!selectedUser) return;

//     try {
//       const response = await axios.post(
//         `${serverURL}/api/admin/updateuser`,
//         {
//           userId: selectedUser._id,
//           mName: editName,
//           email: editEmail,
//           type: editType,
//         }
//       );

//       if (response.data.success) {
//         toast({
//           title: 'Success',
//           description: 'User updated successfully',
//         });
//         setIsEditDialogOpen(false);
//         fetchData();
//       } else {
//         toast({
//           title: 'Error',
//           description: 'Failed to update user',
//           variant: 'destructive',
//         });
//       }
//     } catch (error) {
//       console.error(error);
//       toast({
//         title: 'Error',
//         description: 'Internal Server Error',
//         variant: 'destructive',
//       });
//     }
//   };

//   /* ---------------------- Expiry Calculation ---------------------- */
//   const calculateExpiry = (date, type) => {
//     if (!date) return 'N/A';
//     const startDate = new Date(date);

//     if (type === MonthType) {
//       startDate.setMonth(startDate.getMonth() + 1);
//     } else if (type === YearType) {
//       startDate.setFullYear(startDate.getFullYear() + 1);
//     } else {
//       return 'Never';
//     }

//     return format(startDate, 'PPP');
//   };

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Paid Users</h1>
//         <p className="text-muted-foreground mt-1">
//           Manage your subscription users
//         </p>
//       </div>

//       <Card>
//         <CardHeader className="pb-3">
//           <div className="flex flex-col sm:flex-row justify-between gap-4">
//             <CardTitle>Active Subscriptions</CardTitle>
//             <div className="relative w-full sm:w-64">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 type="search"
//                 placeholder="Search paid users..."
//                 className="pl-8"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Email</TableHead>
//                 <TableHead>Plan</TableHead>
//                 <TableHead>Joined</TableHead>
//                 <TableHead>Expires</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {isLoading ? (
//                 [...Array(4)].map((_, i) => (
//                   <TableRow key={i}>
//                     <TableCell colSpan={6}>
//                       <Skeleton className="h-5 w-full" />
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : filteredData.length > 0 ? (
//                 filteredData.map((user) => (
//                   <TableRow key={user._id}>
//                     <TableCell className="font-medium">
//                       {user.mName}
//                     </TableCell>
//                     <TableCell>{user.email}</TableCell>
//                     <TableCell>
//                       <Badge
//                         variant={
//                           user.type !== MonthType ? 'default' : 'secondary'
//                         }
//                       >
//                         {user.type}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       {user.subscription?.date
//                         ? format(
//                             new Date(user.subscription.date),
//                             'PPP'
//                           )
//                         : 'N/A'}
//                     </TableCell>
//                     <TableCell>
//                       {calculateExpiry(
//                         user.subscription?.date,
//                         user.type
//                       )}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-2">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => handleEditClick(user)}
//                         >
//                           <Settings className="h-4 w-4" />
//                         </Button>

//                         {/* ✅ DELETE ICON (NO TOOLTIP) */}
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="text-destructive hover:text-destructive"
//                           onClick={() => handleDeleteClick(user._id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center py-8">
//                     No users found
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       {/* ---------------------- Edit Dialog ---------------------- */}
//       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Edit User</DialogTitle>
//             <DialogDescription>
//               Update user details and subscription plan.
//             </DialogDescription>
//           </DialogHeader>

//           <div className="grid gap-4 py-4">
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label className="text-right">Name</Label>
//               <Input
//                 className="col-span-3"
//                 value={editName}
//                 onChange={(e) => setEditName(e.target.value)}
//               />
//             </div>

//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label className="text-right">Email</Label>
//               <Input
//                 className="col-span-3"
//                 value={editEmail}
//                 onChange={(e) => setEditEmail(e.target.value)}
//               />
//             </div>

//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label className="text-right">Plan</Label>
//               <Select value={editType} onValueChange={setEditType}>
//                 <SelectTrigger className="col-span-3">
//                   <SelectValue placeholder="Select plan" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value={MonthType}>Monthly</SelectItem>
//                   <SelectItem value={YearType}>Yearly</SelectItem>
//                   <SelectItem value="forever">Lifetime</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <DialogFooter>
//             <Button onClick={handleUpdateUser}>Save changes</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default AdminPaidUsers;


import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Settings, Trash2 } from 'lucide-react';
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
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editType, setEditType] = useState('monthly');

  const { toast } = useToast();

  /* ---------------------- FILTER ---------------------- */
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return data.filter(
      (u) =>
        u.mName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  /* ---------------------- FETCH PAID USERS ---------------------- */
  const fetchData = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/getpaid`);
      setData(res.data);
    } catch (err) {
      console.error(err);
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

  /* ---------------------- EDIT ---------------------- */
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditName(user.mName);
    setEditEmail(user.email);
    setEditType(user.type);
    setIsEditDialogOpen(true);
  };

  /* ---------------------- DELETE ---------------------- */
  const handleDeleteClick = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;

    try {
      const res = await axios.post(
        `${serverURL}/api/admin/deleteuser`,
        { userId }
      );

      if (res.data.success) {
        toast({ title: 'User deleted successfully' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Delete failed',
        variant: 'destructive',
      });
    }
  };

  /* ---------------------- UPDATE ---------------------- */
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const res = await axios.post(
        `${serverURL}/api/admin/updateuser`,
        {
          userId: selectedUser._id,
          mName: editName,
          email: editEmail,
          type: editType,
        }
      );

      if (res.data.success) {
        toast({ title: 'User updated successfully' });
        setIsEditDialogOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Update failed',
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((user) => (
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
                      {user.subscriptionEnd
                        ? format(new Date(user.subscriptionEnd), 'PPP')
                        : 'Lifetime'}
                    </TableCell>
                    

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(user)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(user._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No paid users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ---------------------- EDIT DIALOG ---------------------- */}
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
