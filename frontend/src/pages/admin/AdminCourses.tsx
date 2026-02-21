// import React, { useEffect, useMemo, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Search, Edit } from 'lucide-react';
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
// import { serverURL } from '@/constants';
// import axios from 'axios';
// import { Skeleton } from '@/components/ui/skeleton';
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
// import { useToast } from '@/hooks/use-toast';

// const ITEMS_PER_PAGE = 10;

// const AdminCourses = () => {
//   const [data, setData] = useState<any[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isLoading, setIsLoading] = useState(true);

//   const [currentPage, setCurrentPage] = useState(1);

//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [selectedCourse, setSelectedCourse] = useState<any>(null);
//   const [editStatus, setEditStatus] = useState('');
//   const [editRestricted, setEditRestricted] = useState('');

//   const { toast } = useToast();

//   /* ================= FETCH DATA ================= */
//   useEffect(() => {
//     async function dashboardData() {
//       try {
//         const [coursesRes, usersRes] = await Promise.all([
//           axios.get(`${serverURL}/api/getcourses`),
//           axios.get(`${serverURL}/api/getusers`),
//         ]);

//         const courses = coursesRes.data;
//         const users = usersRes.data;

//         const userMap: any = {};
//         users.forEach((user: any) => {
//           userMap[user._id] = user;
//         });

//         const mergedCourses = courses.map((course: any) => ({
//           ...course,
//           userDetails: userMap[course.user] || null,
//         }));

//         setData(mergedCourses);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     dashboardData();
//   }, []);

//   /* ================= SEARCH FILTER ================= */
//   const filteredData = useMemo(() => {
//     const query = searchQuery.toLowerCase().trim();
//     return data.filter((course) => {
//       const titleMatch = course.mainTopic
//         ?.toLowerCase()
//         .includes(query);
//       const userMatch = course.userDetails?.mName
//         ?.toLowerCase()
//         .includes(query);
//       return titleMatch || userMatch;
//     });
//   }, [data, searchQuery]);

//   /* Reset page on search */
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchQuery]);

//   /* ================= PAGINATION ================= */
//   const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

//   const paginatedData = useMemo(() => {
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     return filteredData.slice(
//       startIndex,
//       startIndex + ITEMS_PER_PAGE
//     );
//   }, [filteredData, currentPage]);

//   /* ================= EDIT ================= */
//   const handleEditClick = (course: any) => {
//     setSelectedCourse(course);
//     setEditStatus(course.completed ? 'completed' : 'pending');
//     setEditRestricted(course.restricted ? 'restricted' : 'unrestricted');
//     setIsEditDialogOpen(true);
//   };

//   const handleUpdateCourse = async () => {
//     if (!selectedCourse) return;

//     try {
//       const response = await axios.post(
//         `${serverURL}/api/admin/updatecourse`,
//         {
//           courseId: selectedCourse._id,
//           completed: editStatus === 'completed',
//           restricted: editRestricted === 'restricted',
//         }
//       );

//       if (response.data.success) {
//         toast({
//           title: 'Success',
//           description: 'Course updated successfully',
//         });

//         setIsEditDialogOpen(false);

//         const refresh = await axios.get(`${serverURL}/api/getcourses`);
//         setData(refresh.data);
//       }
//     } catch (err) {
//       toast({
//         title: 'Error',
//         description: 'Failed to update course',
//         variant: 'destructive',
//       });
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold">Courses</h1>
//         <p className="text-muted-foreground">
//           Manage your course catalog
//         </p>
//       </div>

//       {/* Table */}
//       <Card>
//         <CardHeader>
//           <div className="flex justify-between items-center gap-4">
//             <CardTitle>All Courses</CardTitle>
//             <div className="relative w-64">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search..."
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
//                 <TableHead>Title</TableHead>
//                 <TableHead>Type</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Restricted</TableHead>
//                 <TableHead>User</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {isLoading ? (
//                 Array.from({ length: 5 }).map((_, i) => (
//                   <TableRow key={i}>
//                     <TableCell colSpan={6}>
//                       <Skeleton className="h-5 w-full" />
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : paginatedData.length > 0 ? (
//                 paginatedData.map((course) => (
//                   <TableRow key={course._id}>
//                     <TableCell className="font-medium">
//                       {course.mainTopic}
//                     </TableCell>
//                     <TableCell>
//                       <Badge>
//                         {course.type !== 'text & image course'
//                           ? 'Video'
//                           : 'Image'}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       <Badge
//                         variant={
//                           course.completed ? 'default' : 'secondary'
//                         }
//                       >
//                         {course.completed ? 'Completed' : 'Pending'}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       <Badge
//                         variant={
//                           course.restricted
//                             ? 'destructive'
//                             : 'outline'
//                         }
//                       >
//                         {course.restricted ? 'Restricted' : 'Active'}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       {course.userDetails?.mName || 'Unknown'}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() =>
//                           handleEditClick(course)
//                         }
//                       >
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={6}
//                     className="text-center py-8"
//                   >
//                     No results found
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//           {totalPages > 1 && (
//   <div className="mt-6 flex flex-col sm:flex-row sm:justify-end items-center gap-2">
//     {/* Previous */}
//     <Button
//       size="sm"
//       variant="outline"
//       disabled={currentPage === 1}
//       onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//     >
//       Previous
//     </Button>

//     {/* Page Numbers */}
//     <div className="flex gap-1 flex-wrap justify-center">
//       {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//         <Button
//           key={page}
//           size="sm"
//           variant={page === currentPage ? 'default' : 'outline'}
//           onClick={() => setCurrentPage(page)}
//           className="min-w-[36px]"
//         >
//           {page}
//         </Button>
//       ))}
//     </div>

//     {/* Next */}
//     <Button
//       size="sm"
//       variant="outline"
//       disabled={currentPage === totalPages}
//       onClick={() =>
//         setCurrentPage((p) => Math.min(p + 1, totalPages))
//       }
//     >
//       Next
//     </Button>
//   </div>
// )}

//         </CardContent>
        
//       </Card>

    

//       {/* Edit Dialog */}
//       <Dialog
//         open={isEditDialogOpen}
//         onOpenChange={setIsEditDialogOpen}
//       >
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Edit Course</DialogTitle>
//             <DialogDescription>
//               Update course status and restrictions
//             </DialogDescription>
//           </DialogHeader>

//           <div className="grid gap-4 py-4">
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label className="text-right">Status</Label>
//               <Select
//                 value={editStatus}
//                 onValueChange={setEditStatus}
//               >
//                 <SelectTrigger className="col-span-3">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="pending">Pending</SelectItem>
//                   <SelectItem value="completed">
//                     Completed
//                   </SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label className="text-right">Restriction</Label>
//               <Select
//                 value={editRestricted}
//                 onValueChange={setEditRestricted}
//               >
//                 <SelectTrigger className="col-span-3">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="unrestricted">
//                     Active
//                   </SelectItem>
//                   <SelectItem value="restricted">
//                     Restricted
//                   </SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <DialogFooter>
//             <Button onClick={handleUpdateCourse}>
//               Save changes
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default AdminCourses;

// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Edit } from 'lucide-react';
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
import { serverURL } from '@/constants';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 10;

const AdminCourses = () => {
  const [data, setData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editRestricted, setEditRestricted] = useState('');

  const { toast } = useToast();

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesRes, usersRes] = await Promise.all([
          axios.get(`${serverURL}/api/getcourses`),
          axios.get(`${serverURL}/api/getusers`),
        ]);

        const courses = coursesRes.data;
        const users = usersRes.data;

        const userMap: any = {};
        users.forEach((user: any) => {
          userMap[user._id] = user;
        });

        const mergedCourses = courses.map((course: any) => ({
          ...course,
          userDetails: userMap[course.user] || null,
        }));

        setData(mergedCourses);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  /* ================= SEARCH ================= */
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return data.filter((course) => {
      const titleMatch = course.mainTopic?.toLowerCase().includes(query);
      const userMatch = course.userDetails?.mName
        ?.toLowerCase()
        .includes(query);
      return titleMatch || userMatch;
    });
  }, [data, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  /* ================= EDIT ================= */
  const handleEditClick = (course: any) => {
    setSelectedCourse(course);
    setEditStatus(course.completed ? 'completed' : 'pending');
    setEditRestricted(course.restricted ? 'restricted' : 'unrestricted');
    setIsEditDialogOpen(true);
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;

    try {
      const payload = {
        courseId: selectedCourse._id,
        completed: editStatus === 'completed',
        restricted: editRestricted === 'restricted',
      };

      const response = await axios.post(
        `${serverURL}/api/admin/updatecourse`,
        payload
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Course updated successfully',
        });

        // ✅ SAFE LOCAL UPDATE (KEEP userDetails)
        setData((prev) =>
          prev.map((course) =>
            course._id === selectedCourse._id
              ? {
                  ...course,
                  completed: payload.completed,
                  restricted: payload.restricted,
                }
              : course
          )
        );

        setIsEditDialogOpen(false);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update course',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="text-muted-foreground">
          Manage your course catalog
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center gap-4">
            <CardTitle>All Courses</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
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
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Restricted</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium">
                      {course.mainTopic}
                    </TableCell>

                    <TableCell>
                      <Badge>
                        {course.type !== 'text & image course'
                          ? 'Video'
                          : 'Image'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={course.completed ? 'default' : 'secondary'}>
                        {course.completed ? 'Completed' : 'Pending'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={course.restricted ? 'destructive' : 'outline'}>
                        {course.restricted ? 'Restricted' : 'Active'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {course.userDetails && course.userDetails.mName
                        ? course.userDetails.mName
                        : 'Unknown'}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update course status and restrictions
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Restriction</Label>
              <Select value={editRestricted} onValueChange={setEditRestricted}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unrestricted">Active</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleUpdateCourse}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourses;