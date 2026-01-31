
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, MoreVertical, Edit, Trash, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { serverURL } from '@/constants';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const AdminCourses = () => {

  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editRestricted, setEditRestricted] = useState('');
  const { toast } = useToast();

  // Filtered data using memoization for better performance
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return data.filter((course) => {
      const nameMatch = course.mainTopic?.toLowerCase().includes(query);
      // const userMatch = course.user?.toLowerCase().includes(query);
         const userMatch = course.userDetails?.mName?.toLowerCase().includes(query);
      return nameMatch || userMatch;
    });
  }, [data, searchQuery]);
useEffect(() => {
  async function dashboardData() {
    try {
      const postURL = serverURL + `/api/getcourses`;
      const userURL = serverURL + `/api/getusers`;

      const [coursesRes, usersRes] = await Promise.all([
        axios.get(postURL),
        axios.get(userURL)
      ]);

      const courses = coursesRes.data;
      const users = usersRes.data;

      // 🔥 Create userId → user map
      const userMap = {};
      users.forEach(user => {
        userMap[user._id] = user;
      });

      // 🔥 Attach mName & email to each course
      const mergedCourses = courses.map(course => ({
        ...course,
        userDetails: userMap[course.user] || null
      }));

      // ✅ console logs
      // mergedCourses.forEach(course => {
      //   console.log('Course:', course.mainTopic);
      //   console.log('mName:', course.userDetails?.mName);
      //   console.log('email:', course.userDetails?.email);
      // });

      setData(mergedCourses);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
    }
  }

  dashboardData();
}, []);


  const handleEditClick = (course) => {
    setSelectedCourse(course);
    setEditStatus(course.completed ? 'completed' : 'pending');
    setEditRestricted(course.restricted ? 'restricted' : 'unrestricted');
    setIsEditDialogOpen(true);
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;

    try {
      const postURL = serverURL + '/api/admin/updatecourse';
      const response = await axios.post(postURL, {
        courseId: selectedCourse._id,
        completed: editStatus === 'completed',
        restricted: editRestricted === 'restricted'
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
        setIsEditDialogOpen(false);
        // Refresh data
        const refreshURL = serverURL + `/api/getcourses`;
        const refreshResponse = await axios.get(refreshURL);
        setData(refreshResponse.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to update course",
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
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground mt-1">Manage your course catalog</p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Courses</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses..."
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
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Restricted</TableHead>
                <TableHead>User</TableHead>
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
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                </TableRow>
              </TableBody>
              :
              <TableBody>
                {filteredData.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium">{course.mainTopic}</TableCell>
                    <TableCell>
                      <Badge variant={course.type !== 'text & image course' ? 'default' : 'outline'}>
                        {course.type !== 'text & image course' ? 'Video' : 'Image'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.completed === true ? 'default' : 'secondary'}>
                        {course.completed === true ? 'Completed' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.restricted === true ? 'destructive' : 'outline'}>
                        {course.restricted === true ? 'Restricted' : 'Active'}
                      </Badge>
                    </TableCell>
                    {/* <TableCell>{course.user}</TableCell> */}
                    <TableCell>
  {course.userDetails?.mName || 'Unknown'}
</TableCell>

                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(course)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-8 w-8 mb-2" />
                        <p>No courses match your search criteria</p>
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
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update course status and restrictions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="restricted" className="text-right">
                Restriction
              </Label>
              <Select value={editRestricted} onValueChange={setEditRestricted}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select restriction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unrestricted">Active</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateCourse}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourses;
