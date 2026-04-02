import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import RichTextEditor from '@/components/RichTextEditor';
import { Bell, TrendingUp, Users, Trash2, Calendar, Eye, Sparkles, Send, Clock, MessageSquare, Pin, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Swal from 'sweetalert2';

interface Notice {
  _id: string;
  title: string;
  content: string;
  department?: string;
  audience?: string;
  createdAt: string;
  updatedAt?: string;
  isImportant?: boolean;
  isPinned?: boolean;
}

interface Department {
  _id: string;
  name: string;
  description?: string;
}

interface Stats {
  totalNotices: number;
  recentNotices: number;
  departmentNotices: number;
  importantNotices: number;
}

const NoticesTab = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = sessionStorage.getItem('role');
  const deptId = sessionStorage.getItem('deptId');
  const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');
  const { toast } = useToast();

  // State
  const [notices, setNotices] = useState<Notice[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [stats, setStats] = useState<Stats>({ totalNotices: 0, recentNotices: 0, departmentNotices: 0, importantNotices: 0 });
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    audience: 'all',
    department: '',
    isImportant: false,
    isPinned: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Helper functions
  const getDepartmentLabel = (deptId: string) => {
    const dept = departmentsList.find(d => d._id === deptId);
    return dept?.name || '';
  };

  const matchesCurrentDepartment = (noticeDept: string) => {
    if (role !== 'dept_admin') return true;
    if (!noticeDept) return true;
    return noticeDept === deptId;
  };

  const getDeptScopedDepartment = () => {
    return role === 'dept_admin' ? (deptId || '') : '';
  };

  // Fetch data
  const fetchNotices = async () => {
    if (!orgId) return;
    try {
      const res = await axios.get(`${serverURL}/api/org/notices?organizationId=${orgId}`);
      if (res.data.success) {
        let noticesData = res.data.notices;
        if (role === 'dept_admin') {
          noticesData = noticesData.filter((n: Notice) => matchesCurrentDepartment(n.department || ''));
        }
        
        // Sort: pinned first, then by date (newest first)
        const sortedNotices = [...noticesData].sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setNotices(sortedNotices);
        
        // Calculate stats
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentNotices = noticesData.filter((n: Notice) => new Date(n.createdAt) >= weekAgo).length;
        const departmentNotices = noticesData.filter((n: Notice) => n.department).length;
        const importantNotices = noticesData.filter((n: Notice) => n.isImportant).length;
        
        setStats({
          totalNotices: noticesData.length,
          recentNotices,
          departmentNotices,
          importantNotices
        });
      }
    } catch (e) {
      console.error('Failed to fetch notices:', e);
    }
  };

  const fetchDepartments = async () => {
    if (!orgId || role !== 'org_admin') return;
    try {
      const res = await axios.get(`${serverURL}/api/org/departments?organizationId=${orgId}`);
      if (res.data.success) setDepartmentsList(res.data.departments);
    } catch (e) {
      console.error("Failed to fetch departments", e);
    }
  };

  const handleCreateNotice = async () => {
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in both title and content',
        icon: 'error',
        confirmButtonColor: '#6b2cc1',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-xl shadow-xl',
          title: 'text-lg font-semibold text-gray-900',
          htmlContainer: 'text-gray-600',
          confirmButton: 'px-4 py-2 rounded-lg font-medium'
        }
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${serverURL}/api/org/notice/create`, {
        ...newNotice,
        organizationId: orgId,
        department: role === 'dept_admin' ? getDeptScopedDepartment() : newNotice.department
      });
      if (res.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Notice posted successfully',
          icon: 'success',
          confirmButtonColor: '#6b2cc1',
          background: '#ffffff',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: true,
          customClass: {
            popup: 'rounded-xl shadow-xl',
            title: 'text-lg font-semibold text-gray-900',
            htmlContainer: 'text-gray-600',
            confirmButton: 'px-4 py-2 rounded-lg font-medium',
            timerProgressBar: 'bg-gradient-to-r from-[#2d3a8c] to-[#6b2cc1]'
          }
        });
        setNewNotice({
          title: '',
          content: '',
          audience: 'all',
          department: '',
          isImportant: false,
          isPinned: false
        });
        fetchNotices();
      }
    } catch (e) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to post notice',
        icon: 'error',
        confirmButtonColor: '#6b2cc1',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-xl shadow-xl',
          title: 'text-lg font-semibold text-gray-900',
          htmlContainer: 'text-gray-600',
          confirmButton: 'px-4 py-2 rounded-lg font-medium'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id: string, title: string) => {
    setDeletingId(id);
    
    // SweetAlert confirmation dialog with white background
    const result = await Swal.fire({
      title: 'Delete Notice?',
      html: `Are you sure you want to delete "<strong class="text-red-600">${title}</strong>"?`,
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b2cc1',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.4)',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-xl font-bold text-gray-900',
        htmlContainer: 'text-gray-700',
        confirmButton: 'px-5 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all',
        cancelButton: 'px-5 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-[#2d3a8c] to-[#6b2cc1] hover:opacity-90 focus:ring-2 focus:ring-[#6b2cc1] focus:ring-offset-2 transition-all ml-3',
        icon: 'scale-110'
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${serverURL}/api/org/notice/${id}`);
        if (res.data.success) {
          // Update local state immediately for better UX
          setNotices(prevNotices => prevNotices.filter(notice => notice._id !== id));
          
          // Success toast with SweetAlert
          await Swal.fire({
            title: 'Deleted!',
            text: 'Notice has been deleted successfully.',
            icon: 'success',
            confirmButtonColor: '#6b2cc1',
            background: '#ffffff',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: true,
            customClass: {
              popup: 'rounded-xl shadow-xl',
              title: 'text-lg font-semibold text-gray-900',
              htmlContainer: 'text-gray-600',
              confirmButton: 'px-4 py-2 rounded-lg font-medium',
              timerProgressBar: 'bg-gradient-to-r from-[#2d3a8c] to-[#6b2cc1]'
            }
          });
          
          // Refresh stats
          fetchNotices();
        } else {
          throw new Error('Delete failed');
        }
      } catch (e) {
        // Error toast with SweetAlert
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to delete notice. Please try again.',
          icon: 'error',
          confirmButtonColor: '#6b2cc1',
          background: '#ffffff',
          customClass: {
            popup: 'rounded-xl shadow-xl',
            title: 'text-lg font-semibold text-gray-900',
            htmlContainer: 'text-gray-600',
            confirmButton: 'px-4 py-2 rounded-lg font-medium'
          }
        });
      }
    }
    
    setDeletingId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  useEffect(() => {
    if (!orgId) {
      console.warn('No organization ID found');
      return;
    }
    fetchNotices();
    fetchDepartments();
  }, [orgId]);

  useEffect(() => {
    if (role === 'dept_admin' && deptId) {
      fetchNotices();
    }
  }, [deptId, role]);

  // Stats cards data
  const statCards = [
    {
      title: "Total Notices",
      value: stats.totalNotices,
      icon: Bell,
      gradient: "from-sky-500 to-blue-600",
      bgGradient: "bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30"
    },
    {
      title: "This Week",
      value: stats.recentNotices,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30"
    },
    {
      title: "Department",
      value: stats.departmentNotices,
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30"
    },
    {
      title: "Important",
      value: stats.importantNotices,
      icon: Star,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
    }
  ];

  // Different card designs for variety
  const cardDesigns = [
    {
      borderGradient: "from-rose-500 to-orange-500",
      bgGradient: "from-rose-50/50 to-orange-50/50 dark:from-rose-950/20 dark:to-orange-950/20",
      iconBg: "bg-gradient-to-br from-rose-500 to-orange-500"
    },
    {
      borderGradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
      borderGradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500"
    },
    {
      borderGradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="space-y-8 py-10">
      {/* Gradient Header with Time Greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1b253f] via-[#2d3a8c] to-[#6b2cc1] p-6 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Announcement Desk</h1>
                <p className="text-white/80">Good {getTimeOfDay()}! Share updates with your learners</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur-sm">
                <Clock className="inline h-4 w-4 mr-2" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className={`border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${stat.bgGradient}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-3 text-white shadow-lg`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Notice Card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1b253f]/5 to-[#6b2cc1]/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#6b2cc1]" />
            Create New Notice
          </CardTitle>
          <CardDescription>Share important updates with your students and staff</CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Notice Title</Label>
              <Input
                id="title"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                placeholder="Enter a clear title for your announcement"
                className="border-2 focus-visible:ring-[#6b2cc1]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Target Department</Label>
              <select
                id="department"
                className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b2cc1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newNotice.department || ''}
                onChange={(e) => setNewNotice({ ...newNotice, department: e.target.value })}
                disabled={role === 'dept_admin'}
              >
                {role !== 'dept_admin' && <option value="">All Departments</option>}
                {departmentsList.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newNotice.isImportant}
                onChange={(e) => setNewNotice({ ...newNotice, isImportant: e.target.checked })}
                className="rounded border-gray-300 text-[#6b2cc1] focus:ring-[#6b2cc1]"
              />
              <span className="text-sm">Mark as Important</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newNotice.isPinned}
                onChange={(e) => setNewNotice({ ...newNotice, isPinned: e.target.checked })}
                className="rounded border-gray-300 text-[#6b2cc1] focus:ring-[#6b2cc1]"
              />
              <span className="text-sm">Pin to Top</span>
            </label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Notice Content</Label>
            <RichTextEditor
              value={newNotice.content}
              onChange={(content) => setNewNotice({ ...newNotice, content })}
              placeholder="Write your message here..."
              className="min-h-[200px]"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleCreateNotice}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#2d3a8c] to-[#6b2cc1] hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? (
                <>Posting...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Post Notice
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notices List - 3 Column Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">All Notices</h2>
          <Badge variant="secondary" className="px-3 py-1 bg-gradient-to-r from-[#2d3a8c]/10 to-[#6b2cc1]/10">
            {notices.length} {notices.length === 1 ? 'Notice' : 'Notices'}
          </Badge>
        </div>

        {notices.length === 0 ? (
          <Card className="border-dashed border-2 bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No notices found</p>
              <p className="text-sm text-muted-foreground/70">Create your first notice to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {notices.map((notice, index) => {
              const design = cardDesigns[index % cardDesigns.length];
              const isPinned = notice.isPinned;
              const isImportant = notice.isImportant;
              
              return (
                <div
                  key={notice._id}
                  className={`group relative transition-all duration-300 hover:scale-[1.02] ${
                    isPinned ? 'order-first' : ''
                  }`}
                >
                  {/* Gradient Border Card */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${design.borderGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`} />
                  <Card className={`relative overflow-hidden border-0 shadow-lg transition-all duration-300 h-full flex flex-col ${
                    isPinned ? 'ring-2 ring-[#6b2cc1] ring-offset-2 ring-offset-background' : ''
                  }`}>
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${design.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* Pinned Badge */}
                    {isPinned && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-2 py-1">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="relative pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`rounded-lg ${design.iconBg} p-2 text-white shadow-md`}>
                              {isImportant ? (
                                <AlertCircle className="h-4 w-4" />
                              ) : (
                                <MessageSquare className="h-4 w-4" />
                              )}
                            </div>
                            {isImportant && (
                              <Badge variant="destructive" className="bg-red-500">
                                Important
                              </Badge>
                            )}
                          </div>
                          <CardTitle className={`text-base line-clamp-2 ${isImportant ? 'text-red-600 dark:text-red-400' : ''}`}>
                            {notice.title}
                          </CardTitle>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(notice.createdAt)}
                            </span>
                            {notice.department && (
                              <Badge variant="outline" className="text-xs">
                                {getDepartmentLabel(notice.department)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          onClick={() => handleDeleteNotice(notice._id, notice.title)}
                          disabled={deletingId === notice._id}
                        >
                          {deletingId === notice._id ? (
                            <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="relative flex-1">
                      <div
                        className={`prose prose-sm dark:prose-invert text-muted-foreground ${
                          expandedNotice !== notice._id ? 'line-clamp-3' : ''
                        }`}
                        dangerouslySetInnerHTML={{ __html: notice.content }}
                      />
                      {notice.content.length > 150 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2 p-0 h-auto text-[#6b2cc1]"
                          onClick={() => setExpandedNotice(expandedNotice === notice._id ? null : notice._id)}
                        >
                          {expandedNotice === notice._id ? (
                            <>Show less</>
                          ) : (
                            <>
                              Read more
                              <Eye className="ml-1 h-3 w-3" />
                            </>
                          )}
                        </Button>
                      )}
                      
                      {/* Decorative element */}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="rounded-full bg-gradient-to-r from-[#2d3a8c]/10 to-[#6b2cc1]/10 p-1.5">
                          <CheckCircle2 className="h-3 w-3 text-[#6b2cc1]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticesTab;