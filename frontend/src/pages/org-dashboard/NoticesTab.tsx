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

const themeStyles = {
  hero: 'bg-brand-gradient text-primary-foreground',
  heroGlass: 'bg-background/15 text-primary-foreground border-primary-foreground/20',
  statCard: 'border border-border bg-card',
  statIcon: 'bg-brand-gradient text-primary-foreground',
  cardGlow: 'bg-brand-gradient-soft',
  titleGradient: 'text-brand-gradient',
  primaryButton: 'bg-primary text-primary-foreground hover:bg-primary/90 transition-all',
  primaryBadge: 'bg-primary/10 text-primary border-primary/20',
  focusRing: 'border-2 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
  select: 'flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
};

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
        buttonsStyling: false,
        customClass: {
          popup: 'rounded-xl shadow-xl',
          title: 'text-lg font-semibold text-foreground',
          htmlContainer: 'text-muted-foreground',
          confirmButton: 'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90'
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
          buttonsStyling: false,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: true,
          customClass: {
            popup: 'rounded-xl shadow-xl',
            title: 'text-lg font-semibold text-foreground',
            htmlContainer: 'text-muted-foreground',
            confirmButton: 'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90',
            timerProgressBar: 'bg-brand-gradient'
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
        buttonsStyling: false,
        customClass: {
          popup: 'rounded-xl shadow-xl',
          title: 'text-lg font-semibold text-foreground',
          htmlContainer: 'text-muted-foreground',
          confirmButton: 'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90'
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
      html: `Are you sure you want to delete "<strong class="text-destructive">${title}</strong>"?`,
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      backdrop: 'rgba(0,0,0,0.4)',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-xl font-bold text-foreground',
        htmlContainer: 'text-muted-foreground',
        confirmButton: 'px-5 py-2.5 rounded-lg font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all',
        cancelButton: 'px-5 py-2.5 rounded-lg font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all ml-3',
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
            buttonsStyling: false,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: true,
            customClass: {
              popup: 'rounded-xl shadow-xl',
              title: 'text-lg font-semibold text-foreground',
              htmlContainer: 'text-muted-foreground',
              confirmButton: 'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90',
              timerProgressBar: 'bg-brand-gradient'
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
          buttonsStyling: false,
          customClass: {
            popup: 'rounded-xl shadow-xl',
            title: 'text-lg font-semibold text-foreground',
            htmlContainer: 'text-muted-foreground',
            confirmButton: 'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90'
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
      icon: Bell
    },
    {
      title: "This Week",
      value: stats.recentNotices,
      icon: TrendingUp
    },
    {
      title: "Department",
      value: stats.departmentNotices,
      icon: Users
    },
    {
      title: "Important",
      value: stats.importantNotices,
      icon: Star
    }
  ];

  // Different card designs for variety
  const cardDesigns = [
    {
      borderGradient: "bg-brand-gradient",
      bgGradient: "bg-brand-gradient-soft",
      iconBg: "bg-primary"
    },
    {
      borderGradient: "bg-brand-gradient",
      bgGradient: "bg-brand-gradient-soft",
      iconBg: "bg-secondary"
    },
    {
      borderGradient: "bg-brand-gradient",
      bgGradient: "bg-brand-gradient-soft",
      iconBg: "bg-accent"
    },
    {
      borderGradient: "bg-brand-gradient",
      bgGradient: "bg-brand-gradient-soft",
      iconBg: "bg-primary"
    }
  ];

  return (
    <div className="space-y-8 py-10">
      {/* Gradient Header with Time Greeting */}
      <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg ${themeStyles.hero}`}>
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-background/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-background/10 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2 backdrop-blur-sm ${themeStyles.heroGlass}`}>
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Announcement Desk</h1>
                <p className="text-primary-foreground/80">Good {getTimeOfDay()}! Share updates with your learners</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className={`rounded-full px-4 py-2 text-sm backdrop-blur-sm ${themeStyles.heroGlass}`}>
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
          <Card key={index} className={`${themeStyles.statCard} shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className={`rounded-xl p-3 shadow-lg ${themeStyles.statIcon}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Notice Card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className={`h-5 w-5 ${themeStyles.titleGradient}`} />
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
                className={themeStyles.focusRing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Target Department</Label>
              <select
                id="department"
                className={themeStyles.select}
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
                className="rounded border-input text-primary focus:ring-ring"
              />
              <span className="text-sm">Mark as Important</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newNotice.isPinned}
                onChange={(e) => setNewNotice({ ...newNotice, isPinned: e.target.checked })}
                className="rounded border-input text-primary focus:ring-ring"
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
              className={themeStyles.primaryButton}
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
          <Badge variant="secondary" className={`px-3 py-1 ${themeStyles.primaryBadge}`}>
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
                  <div className={`absolute inset-0 rounded-2xl ${design.borderGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`} />
                  <Card className={`relative overflow-hidden border-0 shadow-lg transition-all duration-300 h-full flex flex-col ${
                    isPinned ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                  }`}>
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 ${design.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* Pinned Badge */}
                    {isPinned && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-accent text-accent-foreground border-0 px-2 py-1">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="relative pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`rounded-lg ${design.iconBg} p-2 text-primary-foreground shadow-md`}>
                              {isImportant ? (
                                <AlertCircle className="h-4 w-4" />
                              ) : (
                                <MessageSquare className="h-4 w-4" />
                              )}
                            </div>
                            {isImportant && (
                              <Badge variant="destructive" className="bg-destructive text-destructive-foreground">
                                Important
                              </Badge>
                            )}
                          </div>
                          <CardTitle className={`text-base line-clamp-2 ${isImportant ? 'text-destructive' : ''}`}>
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
                          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteNotice(notice._id, notice.title)}
                          disabled={deletingId === notice._id}
                        >
                          {deletingId === notice._id ? (
                            <div className="h-4 w-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
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
                          className="mt-2 p-0 h-auto text-primary"
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
                        <div className="rounded-full bg-primary/10 p-1.5">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
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
