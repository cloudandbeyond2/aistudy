// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import {
  BookOpen,
  CheckCircle2,
  Edit,
  Eye,
  Filter,
  Image as ImageIcon,
  Layers3,
  Search,
  ShieldCheck,
  Video,
} from 'lucide-react';

import { serverURL } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ITEMS_PER_PAGE = 10;

const getCourseTypeLabel = (type) =>
  type === 'text & image course' || type === 'theory & image course' ? 'Image' : 'Video';

const AdminCourses = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [detailCourse, setDetailCourse] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editRestricted, setEditRestricted] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesRes, usersRes] = await Promise.all([
          axios.get(`${serverURL}/api/getcourses`),
          axios.get(`${serverURL}/api/getusers`),
        ]);

        const courses = coursesRes.data || [];
        const users = usersRes.data || [];

        const userMap = {};
        users.forEach((user) => {
          userMap[user._id] = user;
        });

        const mergedCourses = courses.map((course) => ({
          ...course,
          userDetails: userMap[course.user] || null,
        }));

        setData(mergedCourses);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'Failed to load courses',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const stats = useMemo(() => {
    return {
      total: data.length,
      completed: data.filter((course) => course.completed).length,
      restricted: data.filter((course) => course.restricted).length,
      video: data.filter((course) => getCourseTypeLabel(course.type) === 'Video').length,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = data.filter((course) => {
      const searchMatch =
        !query ||
        course.mainTopic?.toLowerCase().includes(query) ||
        course.userDetails?.mName?.toLowerCase().includes(query) ||
        course.userDetails?.email?.toLowerCase().includes(query) ||
        course.userDetails?.organizationName?.toLowerCase().includes(query);

      const courseStatus = course.completed ? 'completed' : 'pending';
      const courseType = getCourseTypeLabel(course.type).toLowerCase();
      const visibility = course.restricted ? 'restricted' : 'active';

      return (
        searchMatch &&
        (statusFilter === 'all' || statusFilter === courseStatus) &&
        (typeFilter === 'all' || typeFilter === courseType) &&
        (visibilityFilter === 'all' || visibilityFilter === visibility)
      );
    });

    return [...filtered].sort((left, right) => {
      if (sortBy === 'alphabetical') {
        return String(left.mainTopic || '').localeCompare(String(right.mainTopic || ''));
      }
      if (sortBy === 'creator') {
        return String(left.userDetails?.mName || '').localeCompare(String(right.userDetails?.mName || ''));
      }
      return new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime();
    });
  }, [data, searchQuery, statusFilter, typeFilter, visibilityFilter, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, statusFilter, typeFilter, visibilityFilter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleEditClick = (course) => {
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

      const response = await axios.post(`${serverURL}/api/admin/updatecourse`, payload);

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Course updated successfully',
        });

        setData((prev) =>
          prev.map((course) =>
            course._id === selectedCourse._id
              ? { ...course, completed: payload.completed, restricted: payload.restricted }
              : course
          )
        );

        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update course',
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setVisibilityFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        <p className="text-muted-foreground">
          Super-admin overview for course quality, visibility, creator ownership, and catalog governance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Total courses</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-emerald-600">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Restricted</CardDescription>
            <CardTitle className="text-3xl text-amber-600">{stats.restricted}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Video-led courses</CardDescription>
            <CardTitle className="text-3xl">{stats.video}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-2xl">Course catalog</CardTitle>
            <CardDescription>
              Search by title or creator, then review visibility and completion status before making changes.
            </CardDescription>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.8fr_repeat(4,minmax(0,1fr))]">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search course title, creator, email, organization..."
                className="pl-9"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>

            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger><SelectValue placeholder="Visibility" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All visibility</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="creator">Creator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Reset filters
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Type & Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell className="align-top">
                        <div className="flex items-start gap-3">
                          {course.photo ? (
                            <img
                              src={course.photo}
                              alt={course.mainTopic}
                              className="h-14 w-20 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-20 items-center justify-center rounded-md bg-slate-100">
                              <BookOpen className="h-5 w-5 text-slate-500" />
                            </div>
                          )}
                          <div className="space-y-1">
                            <div className="font-medium">{course.mainTopic}</div>
                            <div className="text-sm text-muted-foreground">{course._id}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="align-top">
                        <div className="space-y-1 text-sm">
                          <div className="font-medium">{course.userDetails?.mName || 'Unknown'}</div>
                          <div className="text-muted-foreground">{course.userDetails?.email || 'No email'}</div>
                          <div className="text-muted-foreground">{course.userDetails?.organizationName || 'Independent creator'}</div>
                        </div>
                      </TableCell>

                      <TableCell className="align-top">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {getCourseTypeLabel(course.type) === 'Video' ? (
                              <Video className="mr-1 h-3.5 w-3.5" />
                            ) : (
                              <ImageIcon className="mr-1 h-3.5 w-3.5" />
                            )}
                            {getCourseTypeLabel(course.type)}
                          </Badge>
                          <Badge variant={course.completed ? 'default' : 'secondary'}>
                            {course.completed ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell className="align-top">
                        <Badge variant={course.restricted ? 'destructive' : 'outline'}>
                          {course.restricted ? 'Restricted' : 'Active'}
                        </Badge>
                      </TableCell>

                      <TableCell className="align-top text-sm">
                        {course.date ? format(new Date(course.date), 'PPP') : 'N/A'}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setDetailCourse(course)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(course)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No courses matched the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>
                Previous
              </Button>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <Button key={page} size="sm" variant={page === currentPage ? 'default' : 'outline'} onClick={() => setCurrentPage(page)}>
                    {page}
                  </Button>
                ))}
              </div>
              <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(detailCourse)} onOpenChange={(open) => !open && setDetailCourse(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Course details</DialogTitle>
            <DialogDescription>
              Super-admin review of creator context, visibility, and course metadata.
            </DialogDescription>
          </DialogHeader>
          {detailCourse && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-slate-200 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Course overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div><span className="text-muted-foreground">Title</span><div className="font-medium">{detailCourse.mainTopic}</div></div>
                  <div><span className="text-muted-foreground">Course ID</span><div className="font-medium break-all">{detailCourse._id}</div></div>
                  <div><span className="text-muted-foreground">Type</span><div className="font-medium">{detailCourse.type || 'N/A'}</div></div>
                  <div><span className="text-muted-foreground">Created on</span><div className="font-medium">{detailCourse.date ? format(new Date(detailCourse.date), 'PPP p') : 'N/A'}</div></div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={detailCourse.completed ? 'default' : 'secondary'}>{detailCourse.completed ? 'Completed' : 'Pending'}</Badge>
                    <Badge variant={detailCourse.restricted ? 'destructive' : 'outline'}>{detailCourse.restricted ? 'Restricted' : 'Active'}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Creator profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div><span className="text-muted-foreground">Creator</span><div className="font-medium">{detailCourse.userDetails?.mName || 'Unknown'}</div></div>
                  <div><span className="text-muted-foreground">Email</span><div className="font-medium">{detailCourse.userDetails?.email || 'N/A'}</div></div>
                  <div><span className="text-muted-foreground">Role</span><div className="font-medium">{detailCourse.userDetails?.role || 'user'}</div></div>
                  <div><span className="text-muted-foreground">Organization</span><div className="font-medium">{detailCourse.userDetails?.organizationName || 'Independent creator'}</div></div>
                  <div><span className="text-muted-foreground">Plan</span><div className="font-medium">{detailCourse.userDetails?.type || 'free'}</div></div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update course status and restrictions.</DialogDescription>
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
              <ShieldCheck className="mr-2 h-4 w-4" />
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourses;
