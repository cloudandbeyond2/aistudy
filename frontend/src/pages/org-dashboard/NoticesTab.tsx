
// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import axios from 'axios';
// import { serverURL } from '@/constants';
// import RichTextEditor from '@/components/RichTextEditor';
// import {
//   Bell, TrendingUp, Users, Trash2, Calendar, Eye,
//   Sparkles, Send, Clock, MessageSquare, Pin, Star,
//   AlertCircle, CheckCircle2, Pencil, X, Save, FileText, Tag
// } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';
// import Swal from 'sweetalert2';
 
 
// // ─── Types ────────────────────────────────────────────────────────────────────
// interface Notice {
//   _id: string;
//   title: string;
//   content: string;
//   department?: string;
//   audience?: string;
//   createdAt: string;
//   isImportant?: boolean;
//   isPinned?: boolean;
// }
 
// interface Department {
//   _id: string;
//   name: string;
// }
 
// interface Stats {
//   totalNotices: number;
//   recentNotices: number;
//   departmentNotices: number;
//   importantNotices: number;
// }
 
// interface NoticeForm {
//   title: string;
//   content: string;
//   audience: string;
//   department: string;
//   isImportant: boolean;
//   isPinned: boolean;
// }
 
// const EMPTY_FORM: NoticeForm = {
//   title: '',
//   content: '',
//   audience: 'all',
//   department: '',
//   isImportant: false,
//   isPinned: false,
// };
 
// // ─── Theme ────────────────────────────────────────────────────────────────────
// const themeStyles = {
//   hero: 'bg-brand-gradient text-primary-foreground',
//   heroGlass: 'bg-background/15 text-primary-foreground border-primary-foreground/20',
//   statCard: 'border border-border bg-card',
//   statIcon: 'bg-brand-gradient text-primary-foreground',
//   primaryButton: 'bg-primary text-primary-foreground hover:bg-primary/90 transition-all',
//   primaryBadge: 'bg-primary/10 text-primary border-primary/20',
//   focusRing: 'border-2 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
//   select:
//     'flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ' +
//     'ring-offset-background focus-visible:outline-none focus-visible:ring-2 ' +
//     'focus-visible:ring-ring focus-visible:ring-offset-2 ' +
//     'disabled:cursor-not-allowed disabled:opacity-50',
// };
 
// const cardDesigns = [
//   { borderGradient: 'bg-brand-gradient', bgGradient: 'bg-brand-gradient-soft', iconBg: 'bg-primary' },
//   { borderGradient: 'bg-brand-gradient', bgGradient: 'bg-brand-gradient-soft', iconBg: 'bg-secondary' },
//   { borderGradient: 'bg-brand-gradient', bgGradient: 'bg-brand-gradient-soft', iconBg: 'bg-accent' },
//   { borderGradient: 'bg-brand-gradient', bgGradient: 'bg-brand-gradient-soft', iconBg: 'bg-primary' },
// ];
 
// const swalBase = {
//   buttonsStyling: false,
//   customClass: {
//     popup: 'rounded-xl shadow-xl',
//     title: 'text-lg font-semibold text-foreground',
//     htmlContainer: 'text-muted-foreground',
//     confirmButton:
//       'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium ' +
//       'bg-primary text-primary-foreground hover:bg-primary/90',
//   },
// };
 
// // ─── Reusable Checkbox (avoids synthetic-event issues) ────────────────────────
// const CheckboxField = ({
//   id,
//   label,
//   checked,
//   onChange,
// }: {
//   id: string;
//   label: string;
//   checked: boolean;
//   onChange: (val: boolean) => void;
// }) => (
// <label htmlFor={id} className="flex items-center gap-2 cursor-pointer select-none">
// <input
//       id={id}
//       type="checkbox"
//       checked={checked}
//       onChange={(e) => onChange(e.target.checked)}
//       className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
//     />
// <span className="text-sm font-medium">{label}</span>
// </label>
// );
 
// // ═════════════════════════════════════════════════════════════════════════════
// const NoticesTab = () => {
//   const role      = sessionStorage.getItem('role');
//   const deptId    = sessionStorage.getItem('deptId') || '';
//   const deptName  = sessionStorage.getItem('deptName') || '';
//   const orgId     = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid') || '';
 
//   const [notices,         setNotices]         = useState<Notice[]>([]);
//   const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
//   const [stats,           setStats]           = useState<Stats>({
//     totalNotices: 0, recentNotices: 0, departmentNotices: 0, importantNotices: 0,
//   });
 
//   // Create form
//   const [newNotice,    setNewNotice]    = useState<NoticeForm>({ ...EMPTY_FORM });
//   const [isSubmitting, setIsSubmitting] = useState(false);
 
//   // View
//   const [expandedNotice, setExpandedNotice] = useState<string | null>(null);
//   const [deletingId,     setDeletingId]     = useState<string | null>(null);
 
//   // Edit modal
//   const [editNotice, setEditNotice] = useState<Notice | null>(null);
//   const [editForm,   setEditForm]   = useState<NoticeForm>({ ...EMPTY_FORM });
//   const [isUpdating, setIsUpdating] = useState(false);
 
//   // ─── Helpers ────────────────────────────────────────────────────────────
//   const isDeptAdmin       = role === 'dept_admin';
//   const getDeptLabel      = (id: string) => departmentsList.find(d => d._id === id)?.name || '';
//   const getScopedDept     = () => isDeptAdmin ? deptId : '';
//   const getDeptScopedLabel = () => deptName || getDeptLabel(deptId) || 'Current Department';
 
//   const matchesDept = (noticeDept: string) => {
//     if (!isDeptAdmin) return true;
//     if (!noticeDept)  return true;   // org-wide: visible to all
//     return noticeDept === deptId;
//   };
 
//   const formatDate = (ds: string) => {
//     const date = new Date(ds);
//     const ms   = Date.now() - date.getTime();
//     const mins = Math.floor(ms / 60000);
//     const hrs  = Math.floor(ms / 3_600_000);
//     const days = Math.floor(ms / 86_400_000);
//     if (mins < 1)  return 'Just now';
//     if (mins < 60) return `${mins} min ago`;
//     if (hrs  < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
//     if (days < 7)  return `${days} day${days > 1 ? 's' : ''} ago`;
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//   };
 
//   const getTimeOfDay = () => {
//     const h = new Date().getHours();
//     return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
//   };
 
//   // ─── Data fetching ───────────────────────────────────────────────────────
//   const fetchNotices = async () => {
//     if (!orgId) return;
//     try {
//       const res = await axios.get(`${serverURL}/api/org/notices?organizationId=${orgId}`);
//       if (!res.data.success) return;
 
//       let data: Notice[] = res.data.notices;
//       if (isDeptAdmin) data = data.filter(n => matchesDept(n.department || ''));
 
//       const sorted = [...data].sort((a, b) => {
//         if (a.isPinned && !b.isPinned) return -1;
//         if (!a.isPinned && b.isPinned) return  1;
//         return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//       });
 
//       setNotices(sorted);
//       const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
//       setStats({
//         totalNotices:      data.length,
//         recentNotices:     data.filter(n => new Date(n.createdAt) >= weekAgo).length,
//         departmentNotices: data.filter(n => n.department).length,
//         importantNotices:  data.filter(n => n.isImportant).length,
//       });
//     } catch (e) {
//       console.error('Failed to fetch notices:', e);
//     }
//   };
 
//   const fetchDepartments = async () => {
//     if (!orgId || isDeptAdmin) return;
//     try {
//       const res = await axios.get(`${serverURL}/api/org/departments?organizationId=${orgId}`);
//       if (res.data.success) setDepartmentsList(res.data.departments);
//     } catch (e) {
//       console.error('Failed to fetch departments', e);
//     }
//   };
 
//   useEffect(() => { if (orgId) { fetchNotices(); fetchDepartments(); } }, [orgId]);
//   useEffect(() => { if (isDeptAdmin && deptId) fetchNotices(); }, [deptId, role]);
 
//   // ─── Edit ────────────────────────────────────────────────────────────────
//   const handleOpenEdit = (notice: Notice) => {
//     setEditNotice(notice);
//     setEditForm({
//       title:       notice.title,
//       content:     notice.content,
//       audience:    notice.audience || 'all',
//       department:  notice.department || '',
//       isImportant: !!notice.isImportant,
//       isPinned:    !!notice.isPinned,
//     });
//   };
 
//   const handleCloseEdit = () => {
//     setEditNotice(null);
//     setEditForm({ ...EMPTY_FORM });
//   };
 
//   const handleUpdateNotice = async () => {
//     if (!editForm.title.trim() || !editForm.content.trim()) {
//       Swal.fire({ ...swalBase, title: 'Error!', text: 'Please fill in both title and content.', icon: 'error' });
//       return;
//     }
//     setIsUpdating(true);
//     try {
//       const res = await axios.put(`${serverURL}/api/org/notice/${editNotice!._id}`, {
//         ...editForm,
//         organizationId: orgId,
//         department: isDeptAdmin ? getScopedDept() : editForm.department,
//       });
//       if (res.data.success) {
//         Swal.fire({ ...swalBase, title: 'Updated!', text: 'Notice updated successfully.', icon: 'success', timer: 2000, timerProgressBar: true, showConfirmButton: true });
//         handleCloseEdit();
//         fetchNotices();
//       }
//     } catch {
//       Swal.fire({ ...swalBase, title: 'Error!', text: 'Failed to update notice.', icon: 'error' });
//     } finally {
//       setIsUpdating(false);
//     }
//   };
 
//   // ─── Create ──────────────────────────────────────────────────────────────
//   const handleCreateNotice = async () => {
//     if (!newNotice.title.trim() || !newNotice.content.trim()) {
//       Swal.fire({ ...swalBase, title: 'Error!', text: 'Please fill in both title and content.', icon: 'error' });
//       return;
//     }
//     setIsSubmitting(true);
//     try {
//       const res = await axios.post(`${serverURL}/api/org/notice/create`, {
//         ...newNotice,
//         organizationId: orgId,
//         department: isDeptAdmin ? getScopedDept() : newNotice.department,
//       });
//       if (res.data.success) {
//         Swal.fire({ ...swalBase, title: 'Success!', text: 'Notice posted successfully.', icon: 'success', timer: 2000, timerProgressBar: true, showConfirmButton: true });
//         setNewNotice({ ...EMPTY_FORM });
//         fetchNotices();
//       }
//     } catch {
//       Swal.fire({ ...swalBase, title: 'Error!', text: 'Failed to post notice.', icon: 'error' });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
 
//   // ─── Delete ──────────────────────────────────────────────────────────────
//   const handleDeleteNotice = async (id: string, title: string) => {
//     setDeletingId(id);
//     const result = await Swal.fire({
//       title: 'Delete Notice?',
//       html: `Are you sure you want to delete "<strong>${title}</strong>"?`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Yes, delete it!',
//       cancelButtonText: 'Cancel',
//       backdrop: 'rgba(0,0,0,0.4)',
//       buttonsStyling: false,
//       customClass: {
//         popup:         'rounded-xl shadow-2xl',
//         title:         'text-xl font-bold text-foreground',
//         htmlContainer: 'text-muted-foreground',
//         confirmButton: 'px-5 py-2.5 rounded-lg font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-all',
//         cancelButton:  'px-5 py-2.5 rounded-lg font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-all ml-3',
//         icon:          'scale-110',
//       },
//     });
//     if (result.isConfirmed) {
//       try {
//         const res = await axios.delete(`${serverURL}/api/org/notice/${id}`);
//         if (res.data.success) {
//           setNotices(prev => prev.filter(n => n._id !== id));
//           await Swal.fire({ ...swalBase, title: 'Deleted!', text: 'Notice deleted successfully.', icon: 'success', timer: 2000, timerProgressBar: true, showConfirmButton: true });
//           fetchNotices();
//         } else throw new Error();
//       } catch {
//         Swal.fire({ ...swalBase, title: 'Error!', text: 'Failed to delete notice.', icon: 'error' });
//       }
//     }
//     setDeletingId(null);
//   };
 
//   useEffect(() => {
//     if (!orgId) {
//       console.warn('No organization ID found');
//       return;
//     }
//     fetchNotices();
//     fetchDepartments();
//   }, [orgId]);
 
//   useEffect(() => {
//     if (role === 'dept_admin' && deptId) {
//       fetchNotices();
//     }
//   }, [deptId, role]);
 
//   // Stats cards data
//   const statCards = [
//     {
//       title: "Total Notices",
//       value: stats.totalNotices,
//       icon: Bell
//     },
//     {
//       title: "This Week",
//       value: stats.recentNotices,
//       icon: TrendingUp
//     },
//     {
//       title: "Department",
//       value: stats.departmentNotices,
//       icon: Users
//     },
//     {
//       title: "Important",
//       value: stats.importantNotices,
//       icon: Star
//     }
//   ];
 
//   // Different card designs for variety
//   const cardDesigns = [
//     {
//       borderGradient: "bg-brand-gradient",
//       bgGradient: "bg-brand-gradient-soft",
//       iconBg: "bg-primary"
//     },
//     {
//       borderGradient: "bg-brand-gradient",
//       bgGradient: "bg-brand-gradient-soft",
//       iconBg: "bg-secondary"
//     },
//     {
//       borderGradient: "bg-brand-gradient",
//       bgGradient: "bg-brand-gradient-soft",
//       iconBg: "bg-accent"
//     },
//     {
//       borderGradient: "bg-brand-gradient",
//       bgGradient: "bg-brand-gradient-soft",
//       iconBg: "bg-primary"
//     }
//   ];
 
//   return (
// <div className="container space-y-8 py-10">
//       {/* Gradient Header with Time Greeting */}
// <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg ${themeStyles.hero}`}>
// <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-background/10 blur-3xl" />
// <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-background/10 blur-2xl" />
// <div className="relative flex items-center justify-between">
// <div className="flex items-center gap-3">
// <div className={`rounded-xl p-2 backdrop-blur-sm ${themeStyles.heroGlass}`}>
// <Bell className="h-6 w-6" />
// </div>
// <div>
// <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-white">Announcement Desk</h1>
// <p className="text-primary-foreground/80">Good {getTimeOfDay()}! Share updates with your learners</p>
// </div>
// </div>
// <div className="hidden md:block">
// <div className={`rounded-full px-4 py-2 text-sm backdrop-blur-sm ${themeStyles.heroGlass}`}>
// <Clock className="inline h-4 w-4 mr-2" />
//               {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
// </div>
// </div>
// </div>
// </div>
 
//       {/* ── STATS ──────────────────────────────────────────────────────── */}
// <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         {statCards.map((stat, i) => (
// <Card key={i} className={`${themeStyles.statCard} shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
// <CardContent className="p-6">
// <div className="flex items-center justify-between">
// <div>
// <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
// <p className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</p>
// </div>
// <div className={`rounded-xl p-3 shadow-lg ${themeStyles.statIcon}`}>
// <stat.icon className="h-5 w-5" />
// </div>
// </div>
// </CardContent>
// </Card>
//         ))}
// </div>
 
//       {/* ── CREATE FORM ────────────────────────────────────────────────── */}
// <Card className="border-0 shadow-lg overflow-hidden">
// <CardHeader className="pb-2 px-3 sm:px-5">
// <CardTitle className="flex items-center gap-1.5 text-lg">
// <Sparkles className="h-5 w-5 text-primary" />
// <span className="font-semibold">Create New Notice</span>
// </CardTitle>
// <CardDescription className="ml-6">
//             Share important updates with your students and staff
// </CardDescription>
// </CardHeader>
 
//         <CardContent className="space-y-4">
 
//         <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
//             {/* Title */}
// <div className="space-y-2">
// <Label htmlFor="title">Notice Title</Label>
// <Input
//                 id="title"
//                 value={newNotice.title}
//                 onChange={(e) => setNewNotice(prev => ({ ...prev, title: e.target.value }))}
//                 placeholder="Enter a clear title for your announcement"
//                 className={themeStyles.focusRing}
//               />
// </div>
 
//             {/* Department */}
// <div className="space-y-2">
// <Label>Target Department</Label>
//               {isDeptAdmin ? (
// <div className="flex h-10 items-center rounded-md border-2 border-input bg-muted/30 px-3 text-sm font-medium">
//                   {getDeptScopedLabel()}
// </div>
//               ) : (
// <select
//                   className={themeStyles.select}
//                   value={newNotice.department}
//                   onChange={(e) => setNewNotice(prev => ({ ...prev, department: e.target.value }))}
// >
// <option value="">All Departments</option>
//                   {departmentsList.map(d => (
// <option key={d._id} value={d._id}>{d.name}</option>
//                   ))}
// </select>
//               )}
// </div>
// </div>
 
//           {/* ── CHECKBOXES (fixed) ── */}
// <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
// <CheckboxField
//               id="create-isImportant"
//               label="Mark as Important"
//               checked={newNotice.isImportant}
//               onChange={(val) => setNewNotice(prev => ({ ...prev, isImportant: val }))}
//             />
// <CheckboxField
//               id="create-isPinned"
//               label="Pin to Top"
//               checked={newNotice.isPinned}
//               onChange={(val) => setNewNotice(prev => ({ ...prev, isPinned: val }))}
//             />
// </div>
 
//           {/* Content — ✅ functional updater prevents stale closure reset */}
// <div className="space-y-2">
// <Label>Notice Content</Label>
// <RichTextEditor
//               value={newNotice.content}
//               onChange={(content) => setNewNotice(prev => ({ ...prev, content }))}
//               placeholder="Write your message here..."
//               className="min-h-[200px]"
//             />
// </div>
 
//    <div className="flex justify-center sm:justify-end">
// <Button onClick={handleCreateNotice} disabled={isSubmitting} className={themeStyles.primaryButton}>
//               {isSubmitting ? 'Posting...' : <><Send className="mr-2 h-4 w-4" />Post Notice</>}
// </Button>
// </div>
// </CardContent>
// </Card>
 
//       {/* ── NOTICES LIST ───────────────────────────────────────────────── */}
// <div className="space-y-4">
// <div className="flex items-center justify-between">
// <h2 className="text-xl font-semibold tracking-tight">All Notices</h2>
// <Badge variant="secondary" className={`px-3 py-1 ${themeStyles.primaryBadge}`}>
//             {notices.length} {notices.length === 1 ? 'Notice' : 'Notices'}
// </Badge>
// </div>
 
//         {notices.length === 0 ? (
// <Card className="border-dashed border-2 bg-muted/20">
// <CardContent className="flex flex-col items-center justify-center py-12">
// <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
// <p className="text-muted-foreground">No notices found</p>
// <p className="text-sm text-muted-foreground/70">Create your first notice to get started</p>
// </CardContent>
// </Card>
//         ) : (
// <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//             {notices.map((notice, index) => {
//               const design      = cardDesigns[index % cardDesigns.length];
//               const isPinned    = !!notice.isPinned;
//               const isImportant = !!notice.isImportant;
 
//               return (
// <div
//                   key={notice._id}
//                   className={`group relative transition-all duration-300 hover:scale-[1.02] ${isPinned ? 'order-first' : ''}`}
// >
// <div className={`absolute inset-0 rounded-2xl ${design.borderGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`} />
 
//                   <Card className={`relative overflow-hidden border-0 shadow-lg h-full flex flex-col ${isPinned ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
// <CardHeader className="relative pb-3">
// <div className="flex items-start justify-between gap-2">
// <div className="flex-1">
// <div className="flex items-center gap-2 mb-2 flex-wrap">
 
//   {/* icon */}
// <div className="rounded-lg bg-blue-500 p-2 text-white shadow-md">
//     {isImportant ? <AlertCircle className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
// </div>
 
//   {/* ✅ PINNED (FIXED POSITION) */}
//   {isPinned && (
// <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs px-2 py-0.5">
// <Pin className="h-3 w-3 mr-1" />Pinned
// </Badge>
//   )}
 
//   {/* IMPORTANT */}
//   {isImportant && (
// <Badge variant="destructive">Important</Badge>
//   )}
 
// </div>
// <CardTitle className={`text-base line-clamp-2 ${isImportant ? 'text-destructive' : ''}`}>
//                             {notice.title}
// </CardTitle>
// <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
// <span className="flex items-center gap-1">
// <Calendar className="h-3 w-3" />{formatDate(notice.createdAt)}
// </span>
//                             {notice.department && (
// <Badge variant="outline" className="text-xs">
//                                 {getDeptLabel(notice.department)}
// </Badge>
//                             )}
// </div>
// </div>
 
//                         <div className="flex items-center gap-1.5 shrink-0">
// <Button
//                             size="icon" variant="ghost"
//                             className="h-8 w-8 rounded-lg bg-brand-gradient-soft text-primary hover:bg-brand-gradient hover:text-primary-foreground shadow-sm"
//                             onClick={() => handleOpenEdit(notice)}
// >
// <Pencil className="w-4 h-4" />
// </Button>
// <Button
//                             size="icon" variant="ghost"
//                             disabled={deletingId === notice._id}
//                             className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
//                             onClick={() => handleDeleteNotice(notice._id, notice.title)}
// >
// <Trash2 className="w-4 h-4" />
// </Button>
// </div>
// </div>
// </CardHeader>
 
//                     <CardContent className="relative flex-1">
// <div
//                         className={`prose prose-sm dark:prose-invert text-muted-foreground ${expandedNotice !== notice._id ? 'line-clamp-3' : ''}`}
//                         dangerouslySetInnerHTML={{ __html: notice.content }}
//                       />
//                       {notice.content.length > 150 && (
// <Button
//                           variant="link" size="sm"
//                           className="mt-2 p-0 h-auto text-primary"
//                           onClick={() => setExpandedNotice(expandedNotice === notice._id ? null : notice._id)}
// >
//                           {expandedNotice === notice._id ? 'Show less' : <><Eye className="mr-1 h-3 w-3" />Read more</>}
// </Button>
//                       )}
// <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
// <div className="rounded-full bg-primary/10 p-1.5">
// <CheckCircle2 className="h-3 w-3 text-primary" />
// </div>
// </div>
// </CardContent>
// </Card>
// </div>
//               );
//             })}
// </div>
//         )}
// </div>
// </div>
//   );
// };
 
// export default NoticesTab;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { serverURL } from '@/constants';
import RichTextEditor from '@/components/RichTextEditor';
import {
  Bell, TrendingUp, Users, Trash2, Calendar, Eye,
  Sparkles, Send, Clock, MessageSquare, Pin, Star,
  AlertCircle, CheckCircle2, Pencil, X, Save
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Swal from 'sweetalert2';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Notice {
  _id: string;
  title: string;
  content: string;
  department?: string;
  audience?: string;
  createdAt: string;
  isImportant?: boolean;
  isPinned?: boolean;
}

interface Department {
  _id: string;
  name: string;
}

interface Stats {
  totalNotices: number;
  recentNotices: number;
  departmentNotices: number;
  importantNotices: number;
}

interface NoticeForm {
  title: string;
  content: string;
  audience: string;
  department: string;
  isImportant: boolean;
  isPinned: boolean;
}

const EMPTY_FORM: NoticeForm = {
  title: '',
  content: '',
  audience: 'all',
  department: '',
  isImportant: false,
  isPinned: false,
};

// ─── Theme ────────────────────────────────────────────────────────────────────
const themeStyles = {
  hero: 'bg-brand-gradient text-primary-foreground',
  heroGlass: 'bg-background/15 text-primary-foreground border-primary-foreground/20',
  statCard: 'border border-border bg-card',
  statIcon: 'bg-brand-gradient text-primary-foreground',
  primaryButton: 'bg-primary text-primary-foreground hover:bg-primary/90 transition-all',
  primaryBadge: 'bg-primary/10 text-primary border-primary/20',
  focusRing: 'border-2 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
  select:
    'flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ' +
    'ring-offset-background focus-visible:outline-none focus-visible:ring-2 ' +
    'focus-visible:ring-ring focus-visible:ring-offset-2 ' +
    'disabled:cursor-not-allowed disabled:opacity-50',
};

const cardDesigns = [
  { borderGradient: 'bg-brand-gradient', bgGradient: 'bg-brand-gradient-soft', iconBg: 'bg-primary' },
  { borderGradient: 'bg-brand-gradient', bgGradient: 'bg-brand-gradient-soft', iconBg: 'bg-secondary' },
  { borderGradient: 'bg-brand-gradient', bgGradient: 'bg-brand-gradient-soft', iconBg: 'bg-accent' },
  { borderGradient: 'bg-brand-gradient', bgGradient: 'bg-brand-gradient-soft', iconBg: 'bg-primary' },
];

const swalBase = {
  buttonsStyling: false,
  customClass: {
    popup: 'rounded-xl shadow-xl',
    title: 'text-lg font-semibold text-foreground',
    htmlContainer: 'text-muted-foreground',
    confirmButton:
      'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium ' +
      'bg-primary text-primary-foreground hover:bg-primary/90',
  },
};

// ─── Reusable Checkbox (avoids synthetic-event issues) ────────────────────────
const CheckboxField = ({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) => (
  <label htmlFor={id} className="flex items-center gap-2 cursor-pointer select-none">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
    />
    <span className="text-sm font-medium">{label}</span>
  </label>
);

// ═════════════════════════════════════════════════════════════════════════════
const NoticesTab = () => {
  const role      = sessionStorage.getItem('role');
  const deptId    = sessionStorage.getItem('deptId') || '';
  const deptName  = sessionStorage.getItem('deptName') || '';
  const orgId     = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid') || '';

  const [notices,         setNotices]         = useState<Notice[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [stats,           setStats]           = useState<Stats>({
    totalNotices: 0, recentNotices: 0, departmentNotices: 0, importantNotices: 0,
  });

  // Create form
  const [newNotice,    setNewNotice]    = useState<NoticeForm>({ ...EMPTY_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);
  const [deletingId,     setDeletingId]     = useState<string | null>(null);

  // Edit modal
  const [editNotice, setEditNotice] = useState<Notice | null>(null);
  const [editForm,   setEditForm]   = useState<NoticeForm>({ ...EMPTY_FORM });
  const [isUpdating, setIsUpdating] = useState(false);

  // ─── Helpers ────────────────────────────────────────────────────────────
  const isDeptAdmin       = role === 'dept_admin';
  const getDeptLabel      = (id: string) => departmentsList.find(d => d._id === id)?.name || '';
  const getScopedDept     = () => isDeptAdmin ? deptId : '';
  const getDeptScopedLabel = () => deptName || getDeptLabel(deptId) || 'Current Department';

  const matchesDept = (noticeDept: string) => {
    if (!isDeptAdmin) return true;
    if (!noticeDept)  return true;   // org-wide: visible to all
    return noticeDept === deptId;
  };

  const formatDate = (ds: string) => {
    const date = new Date(ds);
    const ms   = Date.now() - date.getTime();
    const mins = Math.floor(ms / 60000);
    const hrs  = Math.floor(ms / 3_600_000);
    const days = Math.floor(ms / 86_400_000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    if (hrs  < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    if (days < 7)  return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTimeOfDay = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
  };

  // ─── Data fetching ───────────────────────────────────────────────────────
  const fetchNotices = async () => {
    if (!orgId) return;
    try {
      const res = await axios.get(`${serverURL}/api/org/notices?organizationId=${orgId}`);
      if (!res.data.success) return;

      let data: Notice[] = res.data.notices;
      if (isDeptAdmin) data = data.filter(n => matchesDept(n.department || ''));

      const sorted = [...data].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return  1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setNotices(sorted);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      setStats({
        totalNotices:      data.length,
        recentNotices:     data.filter(n => new Date(n.createdAt) >= weekAgo).length,
        departmentNotices: data.filter(n => n.department).length,
        importantNotices:  data.filter(n => n.isImportant).length,
      });
    } catch (e) {
      console.error('Failed to fetch notices:', e);
    }
  };

  const fetchDepartments = async () => {
    if (!orgId || isDeptAdmin) return;
    try {
      const res = await axios.get(`${serverURL}/api/org/departments?organizationId=${orgId}`);
      if (res.data.success) setDepartmentsList(res.data.departments);
    } catch (e) {
      console.error('Failed to fetch departments', e);
    }
  };

  useEffect(() => { if (orgId) { fetchNotices(); fetchDepartments(); } }, [orgId]);
  useEffect(() => { if (isDeptAdmin && deptId) fetchNotices(); }, [deptId, role]);

  // ─── Edit ────────────────────────────────────────────────────────────────
  const handleOpenEdit = (notice: Notice) => {
    setEditNotice(notice);
    setEditForm({
      title:       notice.title,
      content:     notice.content,
      audience:    notice.audience || 'all',
      department:  notice.department || '',
      isImportant: !!notice.isImportant,
      isPinned:    !!notice.isPinned,
    });
  };

  const handleCloseEdit = () => {
    setEditNotice(null);
    setEditForm({ ...EMPTY_FORM });
  };

  const handleUpdateNotice = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      Swal.fire({ ...swalBase, title: 'Error!', text: 'Please fill in both title and content.', icon: 'error' });
      return;
    }
    setIsUpdating(true);
    try {
      const res = await axios.put(`${serverURL}/api/org/notice/${editNotice!._id}`, {
        ...editForm,
        organizationId: orgId,
        department: isDeptAdmin ? getScopedDept() : editForm.department,
      });
      if (res.data.success) {
        Swal.fire({ ...swalBase, title: 'Updated!', text: 'Notice updated successfully.', icon: 'success', timer: 2000, timerProgressBar: true, showConfirmButton: true });
        handleCloseEdit();
        fetchNotices();
      }
    } catch {
      Swal.fire({ ...swalBase, title: 'Error!', text: 'Failed to update notice.', icon: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  // ─── Create ──────────────────────────────────────────────────────────────
  const handleCreateNotice = async () => {
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      Swal.fire({ ...swalBase, title: 'Error!', text: 'Please fill in both title and content.', icon: 'error' });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${serverURL}/api/org/notice/create`, {
        ...newNotice,
        organizationId: orgId,
        department: isDeptAdmin ? getScopedDept() : newNotice.department,
      });
      if (res.data.success) {
        Swal.fire({ ...swalBase, title: 'Success!', text: 'Notice posted successfully.', icon: 'success', timer: 2000, timerProgressBar: true, showConfirmButton: true });
        setNewNotice({ ...EMPTY_FORM });
        fetchNotices();
      }
    } catch {
      Swal.fire({ ...swalBase, title: 'Error!', text: 'Failed to post notice.', icon: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────
  const handleDeleteNotice = async (id: string, title: string) => {
    setDeletingId(id);
    const result = await Swal.fire({
      title: 'Delete Notice?',
      html: `Are you sure you want to delete "<strong>${title}</strong>"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      backdrop: 'rgba(0,0,0,0.4)',
      buttonsStyling: false,
      customClass: {
        popup:         'rounded-xl shadow-2xl',
        title:         'text-xl font-bold text-foreground',
        htmlContainer: 'text-muted-foreground',
        confirmButton: 'px-5 py-2.5 rounded-lg font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-all',
        cancelButton:  'px-5 py-2.5 rounded-lg font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-all ml-3',
        icon:          'scale-110',
      },
    });
    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${serverURL}/api/org/notice/${id}`);
        if (res.data.success) {
          setNotices(prev => prev.filter(n => n._id !== id));
          await Swal.fire({ ...swalBase, title: 'Deleted!', text: 'Notice deleted successfully.', icon: 'success', timer: 2000, timerProgressBar: true, showConfirmButton: true });
          fetchNotices();
        } else throw new Error();
      } catch {
        Swal.fire({ ...swalBase, title: 'Error!', text: 'Failed to delete notice.', icon: 'error' });
      }
    }
    setDeletingId(null);
  };

  // ─── Stat cards ──────────────────────────────────────────────────────────
  const statCards = [
    { title: 'Total Notices',  value: stats.totalNotices,      icon: Bell      },
    { title: 'This Week',      value: stats.recentNotices,     icon: TrendingUp },
    { title: 'Department',     value: stats.departmentNotices, icon: Users     },
    { title: 'Important',      value: stats.importantNotices,  icon: Star      },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="container space-y-8 py-10">

      {/* ── EDIT MODAL ─────────────────────────────────────────────────── */}
      {editNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={handleCloseEdit} />

          <div className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-background rounded-2xl shadow-2xl flex flex-col">

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-2">
              <div>
                <h2 className="text-xl font-bold text-primary">Edit Notice</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Update the details below and save</p>
              </div>
              <button onClick={handleCloseEdit} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-title" className="font-semibold text-sm">
                  Notice Title <span className="text-primary">*</span>
                </Label>
              <Input
  id="edit-title"
  value={editForm.title}
  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
  placeholder="Enter title..."
  className="w-full h-10 sm:h-11 text-sm px-3 truncate placeholder:text-xs sm:placeholder:text-sm"
/>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-sm">Target Department</Label>
                {isDeptAdmin ? (
                  <div className="flex h-10 items-center rounded-md border-2 border-input bg-muted/30 px-3 text-sm font-medium">
                    {getDeptScopedLabel()}
                  </div>
                ) : (
                  <select
                    className={themeStyles.select}
                    value={editForm.department}
                    onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="">All Departments</option>
                    {departmentsList.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* ── CHECKBOXES (fixed) ── */}
       <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                <CheckboxField
                  id="edit-isImportant"
                  label="Mark as Important"
                  checked={editForm.isImportant}
                  onChange={(val) => setEditForm(prev => ({ ...prev, isImportant: val }))}
                />
                <CheckboxField
                  id="edit-isPinned"
                  label="Pin to Top"
                  checked={editForm.isPinned}
                  onChange={(val) => setEditForm(prev => ({ ...prev, isPinned: val }))}
                />
              </div>

              {/* Content — ✅ functional updater prevents stale closure reset */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-sm">
                  Notice Content <span className="text-primary">*</span>
                </Label>
                <RichTextEditor
                  value={editForm.content}
                  onChange={(content) => setEditForm(prev => ({ ...prev, content }))}
                  placeholder="Update your message here..."
                  className="min-h-[180px]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 pb-2">
                <Button variant="outline" onClick={handleCloseEdit} className="flex-1 h-11 font-semibold border-2">
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateNotice}
                  disabled={isUpdating}
                  className="flex-1 h-11 font-semibold bg-brand-gradient text-primary-foreground hover:opacity-90"
                >
                  {isUpdating ? 'Saving...' : <><Save className="mr-2 h-4 w-4" />Save Changes</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg ${themeStyles.hero}`}>
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-background/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-background/10 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-2 backdrop-blur-sm ${themeStyles.heroGlass}`}>
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-white">Announcement Desk</h1>
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

      {/* ── STATS ──────────────────────────────────────────────────────── */}
   <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={i} className={`${themeStyles.statCard} shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
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

      {/* ── CREATE FORM ────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="pb-3 px-3">
          <CardTitle className="flex items-center gap-1.5 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">Create New Notice</span>
          </CardTitle>
          <CardDescription className="ml-6">
            Share important updates with your students and staff
          </CardDescription>
        </CardHeader>

      <CardContent className="space-y-3 p-3 sm:p-6">

         <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {/* Title */}
            <div className="space-y-2">
  <Label htmlFor="title">Notice Title</Label>
  <Input
    id="title"
    value={newNotice.title}
    onChange={(e) => setNewNotice(prev => ({ ...prev, title: e.target.value }))}
    // Use a shorter string for mobile, longer for desktop
    placeholder={window.innerWidth < 400 ? "Enter title..." : "Enter a clear title for your announcement"}
    className={`
      ${themeStyles.focusRing}
      text-sm
      placeholder:text-[10px] 
      xs:placeholder:text-xs 
      sm:placeholder:text-sm
      placeholder:font-normal
    `}
  />
</div>

            {/* Department */}
            <div className="space-y-2">
              <Label>Target Department</Label>
              {isDeptAdmin ? (
                <div className="flex h-10 items-center rounded-md border-2 border-input bg-muted/30 px-3 text-sm font-medium">
                  {getDeptScopedLabel()}
                </div>
              ) : (
                <select
                  className={themeStyles.select}
                  value={newNotice.department}
                  onChange={(e) => setNewNotice(prev => ({ ...prev, department: e.target.value }))}
                >
                  <option value="">All Departments</option>
                  {departmentsList.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* ── CHECKBOXES (fixed) ── */}
       <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            <CheckboxField
              id="create-isImportant"
              label="Mark as Important"
              checked={newNotice.isImportant}
              onChange={(val) => setNewNotice(prev => ({ ...prev, isImportant: val }))}
            />
            <CheckboxField
              id="create-isPinned"
              label="Pin to Top"
              checked={newNotice.isPinned}
              onChange={(val) => setNewNotice(prev => ({ ...prev, isPinned: val }))}
            />
          </div>

          {/* Content — ✅ functional updater prevents stale closure reset */}
          <div className="space-y-2">
            <Label>Notice Content</Label>
            <RichTextEditor
              value={newNotice.content}
              onChange={(content) => setNewNotice(prev => ({ ...prev, content }))}
              placeholder="Write your message here..."
              className="min-h-[200px]"
            />
          </div>

        <div className="flex justify-end">
            <Button onClick={handleCreateNotice} disabled={isSubmitting} className={themeStyles.primaryButton}>
              {isSubmitting ? 'Posting...' : <><Send className="mr-2 h-4 w-4" />Post Notice</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── NOTICES LIST ───────────────────────────────────────────────── */}
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
              const design      = cardDesigns[index % cardDesigns.length];
              const isPinned    = !!notice.isPinned;
              const isImportant = !!notice.isImportant;

              return (
                <div
                  key={notice._id}
                  className={`group relative transition-all duration-300 hover:scale-[1.02] ${isPinned ? 'order-first' : ''}`}
                >
                  <div className={`absolute inset-0 rounded-2xl ${design.borderGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`} />

                  <Card className={`relative overflow-hidden border-0 shadow-lg h-full flex flex-col ${isPinned ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                    <div className={`absolute inset-0 ${design.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                    <CardHeader className="relative pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                       <div className="rounded-lg bg-primary p-2 text-white shadow-md">
                           <MessageSquare className="h-4 w-4 text-white" />
                            </div>


 <div className="flex items-center gap-2 mb-2">
  {/* PINNED */}
  {notice.isPinned && (
    <div className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full shadow flex items-center gap-1">
      <Pin className="w-2.5 h-2.5" />
      Pinned
    </div>
  )}

  {/* IMPORTANT */}
  {notice.isImportant && (
    <div className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full shadow flex items-center gap-1">
      <AlertCircle className="w-2.5 h-2.5" />
      Important
    </div>
  )}

</div>              </div>
                          <CardTitle className={`text-base line-clamp-2 ${isImportant ? 'text-primary' : ''}`}>
                            {notice.title}
                          </CardTitle>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />{formatDate(notice.createdAt)}
                            </span>
                            {notice.department && (
                              <Badge variant="outline" className="text-xs">
                                {getDeptLabel(notice.department)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="icon" variant="ghost"
                            className="h-8 w-8 rounded-lg bg-brand-gradient-soft text-primary hover:bg-brand-gradient hover:text-primary-foreground shadow-sm"
                            onClick={() => handleOpenEdit(notice)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon" variant="ghost"
                            disabled={deletingId === notice._id}
                            className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                            onClick={() => handleDeleteNotice(notice._id, notice.title)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="relative flex-1">
                      <div
                        className={`prose prose-sm dark:prose-invert text-muted-foreground ${expandedNotice !== notice._id ? 'line-clamp-3' : ''}`}
                        dangerouslySetInnerHTML={{ __html: notice.content }}
                      />
                      {notice.content.length > 150 && (
                        <Button
                          variant="link" size="sm"
                          className="mt-2 p-0 h-auto text-primary"
                          onClick={() => setExpandedNotice(expandedNotice === notice._id ? null : notice._id)}
                        >
                          {expandedNotice === notice._id ? 'Show less' : <><Eye className="mr-1 h-3 w-3" />Read more</>}
                        </Button>
                      )}
                     
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