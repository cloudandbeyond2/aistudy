// import React, { useState, useEffect, useMemo } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   Bell, Sparkles, TrendingUp, Calendar, AlertCircle,
//   Filter, LayoutGrid, LayoutList, Search, Tag, X, FileText, Pin
// } from 'lucide-react';
// import SEO from '@/components/SEO';
// import axios from 'axios';
// import { serverURL } from '@/constants';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle,
// } from '@/components/ui/sheet';
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from '@/components/ui/select';

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface RawNotice {
//   _id: string;
//   title: string;
//   content: string;
//   createdAt: string;
//   department?: string;
//   isImportant?: boolean;
//   isPinned?: boolean;
// }

// interface Notice extends RawNotice {
//   priority: 'high' | 'medium' | 'low';
//   category: string;
//   readTime: number;
// }

// // ─── Enrichment helpers (defined OUTSIDE component — no re-creation) ──────────
// const HIGH_KW   = ['urgent', 'important', 'deadline', 'mandatory', 'required', 'exam', 'payment'];
// const MEDIUM_KW = ['reminder', 'update', 'change', 'notice', 'schedule'];

// const calcPriority = (n: RawNotice): 'high' | 'medium' | 'low' => {
//   const txt = `${n.title} ${n.content}`.toLowerCase();

//   if (HIGH_KW.some(k => txt.includes(k))) return 'high';

//   if (n.isImportant) return 'medium'; // ✅ FIX

//   if (MEDIUM_KW.some(k => txt.includes(k))) return 'medium';

//   return 'low';
// };

// const CATEGORY_MAP: Record<string, string[]> = {
//   Academic:       ['exam', 'assignment', 'class', 'course', 'grade', 'result'],
//   Events:         ['event', 'workshop', 'seminar', 'webinar', 'conference'],
//   Administrative: ['fee', 'registration', 'document', 'form', 'application'],
//   Announcements:  ['announcement', 'update', 'new', 'launch'],
//   Deadlines:      ['deadline', 'last date', 'due', 'submission'],
// };

// const detectCategory = (n: RawNotice): string => {
//   const txt = `${n.title} ${n.content}`.toLowerCase();
//   for (const [cat, kws] of Object.entries(CATEGORY_MAP)) {
//     if (kws.some(k => txt.includes(k))) return cat;
//   }
//   return 'General';
// };

// const calcReadTime = (content: string): number => {
//   const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
//   return Math.max(1, Math.ceil(words / 200));
// };

// const enrich = (raw: RawNotice): Notice => ({
//   ...raw,
//   priority: calcPriority(raw),
//   category: detectCategory(raw),
//   readTime: calcReadTime(raw.content),
// });

// // ─── Priority style maps ──────────────────────────────────────────────────────
// const PRIORITY_BADGE: Record<string, string> = {
//   high:   'bg-red-100 text-red-800 border-red-200',
//   medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//   low:    'bg-green-100 text-green-800 border-green-200',
// };

// const PRIORITY_BORDER: Record<string, string> = {
//   high:   'border-l-4 border-l-red-500',
//   medium: 'border-l-4 border-l-amber-500',
//   low:    'border-l-4 border-l-emerald-500',
// };

// const PRIORITY_BTN: Record<string, string> = {
//   high:   'text-red-600 hover:bg-red-50',
//   medium: 'text-amber-600 hover:bg-amber-50',
//   low:    'text-emerald-600 hover:bg-emerald-50',
// };

// const PRIORITY_ICON: Record<string, string> = {
//   high:   'bg-red-100 text-red-600',
//   medium: 'bg-amber-100 text-amber-600',
//   low:    'bg-emerald-100 text-emerald-600',
// };

// const PRIORITY_DOT: Record<string, string> = {
//   high:   'bg-red-500',
//   medium: 'bg-amber-500',
//   low:    'bg-emerald-500',
// };

// const getPriorityIcon = (priority: string) => {
//   if (priority === 'high')   return <AlertCircle className="w-3 h-3" />;
//   if (priority === 'medium') return <Bell className="w-3 h-3" />;
//   return <Sparkles className="w-3 h-3" />;
// };

// const fmtDate = (ds: string) =>
//   new Date(ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// // ═════════════════════════════════════════════════════════════════════════════
// const StudentNotices = () => {
//   const [notices,        setNotices]        = useState<Notice[]>([]);
//   const [loading,        setLoading]        = useState(true);
//   const [viewMode,       setViewMode]       = useState<'grid' | 'list'>('grid');
//   const [searchQuery,    setSearchQuery]    = useState('');
//   const [filterPriority, setFilterPriority] = useState('all');
//   const [sortBy,         setSortBy]         = useState('date');
//   const [selectedCat,    setSelectedCat]    = useState('all');
//   const [isFilterOpen,   setIsFilterOpen]   = useState(false);
//   const [viewNotice,     setViewNotice]     = useState<Notice | null>(null);

//   const orgId        = sessionStorage.getItem('orgId')   || '';
//   const studentId    = sessionStorage.getItem('uid')     || '';
//   const studentDeptId = sessionStorage.getItem('deptId') || '';

//   // ─── Fetch ──────────────────────────────────────────────────────────────
//   const fetchNotices = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(
//         `${serverURL}/api/org/notices?organizationId=${orgId}&studentId=${studentId}`
//       );
//       if (res.data.success) {
//         // Show org-wide notices (no dept) OR notices for the student's dept
//         const filtered: RawNotice[] = (res.data.notices as RawNotice[]).filter(n => {
//           if (!n.department)    return true;  // org-wide
//           if (!studentDeptId)   return true;  // dept unknown — show all
//           return n.department === studentDeptId;
//         });
//         setNotices(filtered.map(enrich));
//       }
//     } catch (e) {
//       console.error('Error fetching notices:', e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { if (orgId && studentId) fetchNotices(); }, []);

//   // ─── Filter + sort ───────────────────────────────────────────────────────
//   const filteredNotices = useMemo(() => {
//     let res = [...notices];
//     if (searchQuery) {
//       const q = searchQuery.toLowerCase();
//       res = res.filter(n =>
//         n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
//       );
//     }
//     if (filterPriority !== 'all') res = res.filter(n => n.priority === filterPriority);
//     if (selectedCat    !== 'all') res = res.filter(n => n.category === selectedCat);

//     res.sort((a, b) => {
//       if ( a.isPinned && !b.isPinned) return -1;
//       if (!a.isPinned &&  b.isPinned) return  1;
//       if (sortBy === 'priority') {
//         const ord: Record<string, number> = { high: 3, medium: 2, low: 1 };
//         return ord[b.priority] - ord[a.priority];
//       }
//       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//     });
//     return res;
//   }, [notices, searchQuery, filterPriority, selectedCat, sortBy]);

//   const categories = useMemo(() => {
//     const cats = new Set(notices.map(n => n.category));
//     return ['all', ...Array.from(cats)];
//   }, [notices]);

//   const hasActiveFilters =
//     searchQuery !== '' || filterPriority !== 'all' || selectedCat !== 'all' || sortBy !== 'date';

//   const clearFilters = () => {
//     setSearchQuery(''); setFilterPriority('all'); setSelectedCat('all'); setSortBy('date');
//   };

//   // ─── Loading ─────────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
//         <div className="text-center space-y-4">
//           <div className="relative">
//             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
//             <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
//           </div>
//           <p className="text-muted-foreground">Loading your notices...</p>
//         </div>
//       </div>
//     );
//   }

//   // ─── Filter panel ────────────────────────────────────────────────────────
//   const FilterContent = () => (
//     <div className="space-y-6">
//       <div className="space-y-2">
//         <label className="text-sm font-medium flex items-center gap-2"><Tag className="w-4 h-4" />Category</label>
//         <Select value={selectedCat} onValueChange={setSelectedCat}>
//           <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
//           <SelectContent>
//             {categories.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All Categories' : c}</SelectItem>)}
//           </SelectContent>
//         </Select>
//       </div>
//       <div className="space-y-2">
//         <label className="text-sm font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" />Priority</label>
//         <Select value={filterPriority} onValueChange={setFilterPriority}>
//           <SelectTrigger><SelectValue placeholder="All Priorities" /></SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Priorities</SelectItem>
//             <SelectItem value="high">High Priority</SelectItem>
//             <SelectItem value="medium">Medium Priority</SelectItem>
//             <SelectItem value="low">Low Priority</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//       <div className="space-y-2">
//         <label className="text-sm font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4" />Sort By</label>
//         <Select value={sortBy} onValueChange={setSortBy}>
//           <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
//           <SelectContent>
//             <SelectItem value="date">Date (Newest First)</SelectItem>
//             <SelectItem value="priority">Priority (High to Low)</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//       {hasActiveFilters && (
//         <Button variant="outline" onClick={clearFilters} className="w-full">
//           <X className="w-4 h-4 mr-2" />Clear All Filters
//         </Button>
//       )}
//     </div>
//   );

//   // ═══════════════════════════════════════════════════════════════════════════
//   return (
//     <div className="min-h-screen">

//       {/* ── FULL NOTICE MODAL ──────────────────────────────────────────── */}
//       {viewNotice && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/60" onClick={() => setViewNotice(null)} />
//           <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-background rounded-2xl shadow-2xl flex flex-col">

//             {/* Header */}
//             <div className="px-6 pt-6 pb-4 border-b border-border">
//               <div className="flex items-start justify-between gap-3 mb-3">
//                 <h2 className="text-2xl font-bold text-blue-600 leading-tight pr-4">
//   {viewNotice.title}
// </h2>
//                 <button
//                   onClick={() => setViewNotice(null)}
//                   className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted border border-border transition-colors"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//               <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
//                 <Badge className={`${PRIORITY_BADGE[viewNotice.priority]} border text-xs font-semibold`}>
//                   <span className="flex items-center gap-1">
//                     {getPriorityIcon(viewNotice.priority)}
//                     {viewNotice.priority.toUpperCase()}
//                   </span>
//                 </Badge>
//                 <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
//                   <Tag className="w-3 h-3 mr-1" />{viewNotice.category}
//                 </Badge>
//                 {viewNotice.isPinned && (
//                   <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
//                     <Pin className="w-3 h-3 mr-1" />Pinned
//                   </Badge>
//                 )}
//                 <span>•</span>
//                 <span className="flex items-center gap-1">
//                   <Calendar className="w-3.5 h-3.5" />{fmtDate(viewNotice.createdAt)}
//                 </span>
//                 <span>•</span>
//                 <span className="text-xs text-muted-foreground/70">{viewNotice.readTime} min read</span>
//               </div>
//             </div>

//             {/* Content */}
//             <div className="px-6 py-6">
//              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary uppercase tracking-wide">
//   <FileText className="w-4 h-4" />Full Notice
// </h3>
//               <div
//                 className="prose prose-base dark:prose-invert max-w-none p-5 bg-muted/20 rounded-xl border border-border leading-relaxed text-foreground"
//                 dangerouslySetInnerHTML={{ __html: viewNotice.content }}
//               />
//             </div>

//             {/* Footer */}
//             <div className="px-6 pb-6 flex justify-end">
//               <Button
//                 onClick={() => setViewNotice(null)}
//                 className="min-w-[120px] bg-gradient-to-r from-primary via-sky-500 to-blue-500 text-white hover:opacity-90"
//               >
//                 Close
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="container mx-auto py-6 sm:py-8 px-3 sm:px-4 space-y-5 sm:space-y-6">
//         <SEO title="Notices" description="Announcements from your organization." />

//         {/* ── PAGE HEADER ────────────────────────────────────────────── */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//           <div className="space-y-1">
//             <div className="flex items-center gap-2 flex-wrap">
//               <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-sky-400 to-blue-500 bg-clip-text text-transparent">
//                 Smart Notices
//               </h1>
//               <Badge variant="secondary" className="gap-1 text-xs sm:text-sm">
//                 <Sparkles className="w-3 h-3" />AI Powered
//               </Badge>
//             </div>
//             <p className="text-xs sm:text-sm text-muted-foreground">
//               {filteredNotices.length} notices • Last updated {new Date().toLocaleDateString()}
//             </p>
//           </div>
//           <div className="hidden sm:flex gap-2">
//             <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
//               <LayoutGrid className="w-4 h-4" />
//             </Button>
//             <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
//               <LayoutList className="w-4 h-4" />
//             </Button>
//           </div>
//         </div>

//         {/* ── SEARCH + FILTERS ───────────────────────────────────────── */}
//         <div className="flex flex-col sm:flex-row gap-3">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//             <Input
//               placeholder="Search notices by title or content..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 w-full"
//             />
//           </div>

//           {/* Desktop */}
//           <div className="hidden md:flex gap-2">
//             <Select value={filterPriority} onValueChange={setFilterPriority}>
//               <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Priorities" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Priorities</SelectItem>
//                 <SelectItem value="high">High Priority</SelectItem>
//                 <SelectItem value="medium">Medium Priority</SelectItem>
//                 <SelectItem value="low">Low Priority</SelectItem>
//               </SelectContent>
//             </Select>
//             <Select value={sortBy} onValueChange={setSortBy}>
//               <SelectTrigger className="w-[140px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="date">Sort by Date</SelectItem>
//                 <SelectItem value="priority">Sort by Priority</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Mobile */}
//           <div className="flex gap-2 sm:hidden">
//             <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
//               <SheetTrigger asChild>
//                 <Button variant="outline" className="flex-1">
//                   <Filter className="w-4 h-4 mr-2" />Filters
//                   {hasActiveFilters && <Badge variant="secondary" className="ml-2 bg-primary/20">Active</Badge>}
//                 </Button>
//               </SheetTrigger>
//               <SheetContent side="bottom" className="rounded-t-xl max-h-[85vh] overflow-y-auto">
//                 <SheetHeader><SheetTitle>Filter &amp; Sort</SheetTitle></SheetHeader>
//                 <div className="mt-6"><FilterContent /></div>
//                 <div className="mt-6 pt-4 border-t">
//                   <Button className="w-full" onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
//                 </div>
//               </SheetContent>
//             </Sheet>
//             <div className="flex gap-2">
//               <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
//                 <LayoutGrid className="w-4 h-4" />
//               </Button>
//               <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
//                 <LayoutList className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Active filter chips */}
//         {hasActiveFilters && (
//           <div className="flex flex-wrap gap-2">
//             {searchQuery && (
//               <Badge variant="secondary" className="gap-1 text-xs">
//                 Search: {searchQuery}
//                 <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSearchQuery('')} />
//               </Badge>
//             )}
//             {filterPriority !== 'all' && (
//               <Badge variant="secondary" className="gap-1 text-xs">
//                 Priority: {filterPriority}
//                 <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFilterPriority('all')} />
//               </Badge>
//             )}
//             {selectedCat !== 'all' && (
//               <Badge variant="secondary" className="gap-1 text-xs">
//                 Category: {selectedCat}
//                 <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSelectedCat('all')} />
//               </Badge>
//             )}
//           </div>
//         )}

//         {/* ── NOTICES ────────────────────────────────────────────────── */}
//         {filteredNotices.length > 0 ? (
//           <div className={
//             viewMode === 'grid'
//               ? 'grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
//               : 'space-y-3 sm:space-y-4'
//           }>
//             {filteredNotices.map((notice) => (
//               <Card
//                 key={notice._id}
//                 className={`group relative overflow-hidden pt-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl flex flex-col ${PRIORITY_BORDER[notice.priority]} bg-white/80 backdrop-blur-sm`}
//               >
//                 {/* Pinned badge */}
//                 {notice.isPinned && (
//                <div className="absolute top-2 left-3 z-10">
//                     <div className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full shadow flex items-center gap-1">
//                       <Pin className="w-2.5 h-2.5" />PINNED
//                     </div>
//                   </div>
//                 )}

//                 {/* Shimmer */}
//                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
// {/* 🔴 URGENT ribbon */}
// {notice.priority === 'high' && (
//   <>
//     <div className="absolute top-3 right-3 z-10">
//       <div className="relative">
//         <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-50 animate-pulse" />
//         <div className="relative bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
//           <AlertCircle className="w-3 h-3" />
//           URGENT
//         </div>
//       </div>
//     </div>

//     {/* corner glow */}
//     <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500/20 to-transparent rounded-bl-full pointer-events-none" />
//   </>
// )}

// {/* 🟡 IMPORTANT ribbon */}
// {notice.priority === 'medium' && (
//   <div className="absolute top-3 right-3 z-10">
//     <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
//       <Bell className="w-3 h-3" />
//       IMPORTANT
//     </div>
//   </div>
// )}

//                  <CardHeader className="p-4 sm:p-5 lg:p-6 pb-3">
//     <div className="flex items-start gap-2">
//       <div className="flex-1 min-w-0">

//         {/* icon + dot */}
//         <div className="flex items-center gap-2 mb-2">
//           <div className={`p-1.5 rounded-lg ${PRIORITY_ICON[notice.priority]}`}>
//             <Bell className="w-4 h-4" />
//           </div>
//           <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[notice.priority]}`} />
//         </div>

//         {/* title */}
//         <CardTitle className="text-base sm:text-lg font-bold line-clamp-2">
//           {notice.title}
//         </CardTitle>

//         {/* badges */}
//         <div className="flex flex-wrap gap-2 mt-3">
//           {/* priority, category, date badges */}
//         </div>

//       </div>
//     </div>
//   </CardHeader>

//   {/* ✅ CONTENT */}
//   <CardContent className="p-4 sm:p-5 lg:p-6 pt-2 flex-1 flex flex-col">

//     {/* bottom section */}
//     <div className="mt-auto pt-3 border-t flex items-center justify-between">
//       <span className="text-xs text-muted-foreground">
//         {notice.readTime} min read
//       </span>

//       <Button
//         variant="ghost"
//         size="sm"
//         className="text-xs font-semibold relative z-10"
//         onClick={() => setViewNotice(notice)}
//       >
//         Read Full Notice →
//       </Button>
//     </div>

//   </CardContent>

//                 <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//               </Card>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl">
//             <div className="relative inline-block">
//               <Bell className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground/30" />
//               <Sparkles className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
//             </div>
//             <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">No notices found</h3>
//             <p className="text-sm sm:text-base text-muted-foreground px-4">
//               {hasActiveFilters ? 'Try adjusting your search or filters' : 'No notices available from your organization'}
//             </p>
//             {hasActiveFilters && (
//               <Button variant="link" onClick={clearFilters} className="mt-3">Clear all filters</Button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StudentNotices;

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bell, Sparkles, TrendingUp, Calendar, AlertCircle,
  Filter, LayoutGrid, LayoutList, Search, Tag, X, FileText, Pin
} from 'lucide-react';
import SEO from '@/components/SEO';
import axios from 'axios';
import { serverURL } from '@/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Types ────────────────────────────────────────────────────────────────────
interface RawNotice {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  department?: string;
  isImportant?: boolean;
  isPinned?: boolean;
}

interface Notice extends RawNotice {
  priority: 'high' | 'medium' | 'low';
  category: string;
  readTime: number;
}

// ─── Enrichment helpers (defined OUTSIDE component — no re-creation) ──────────
const HIGH_KW   = ['urgent', 'important', 'deadline', 'mandatory', 'required', 'exam', 'payment'];
const MEDIUM_KW = ['reminder', 'update', 'change', 'notice', 'schedule'];


const calcPriority = (n: RawNotice): 'high' | 'medium' | 'low' => {
  if (n.isImportant) return 'high';
  const txt = `${n.title} ${n.content}`.toLowerCase();
  if (HIGH_KW.some(k => txt.includes(k)))   return 'high';
  if (MEDIUM_KW.some(k => txt.includes(k))) return 'medium';
  return 'low';
};

const CATEGORY_MAP: Record<string, string[]> = {
  Academic:       ['exam', 'assignment', 'class', 'course', 'grade', 'result'],
  Events:         ['event', 'workshop', 'seminar', 'webinar', 'conference'],
  Administrative: ['fee', 'registration', 'document', 'form', 'application'],
  Announcements:  ['announcement', 'update', 'new', 'launch'],
  Deadlines:      ['deadline', 'last date', 'due', 'submission'],
};

const detectCategory = (n: RawNotice): string => {
  const txt = `${n.title} ${n.content}`.toLowerCase();
  for (const [cat, kws] of Object.entries(CATEGORY_MAP)) {
    if (kws.some(k => txt.includes(k))) return cat;
  }
  return 'General';
};

const calcReadTime = (content: string): number => {
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const enrich = (raw: RawNotice): Notice => ({
  ...raw,
  priority: calcPriority(raw),
  category: detectCategory(raw),
  readTime: calcReadTime(raw.content),
});

// ─── Priority style maps ──────────────────────────────────────────────────────
const PRIORITY_BADGE: Record<string, string> = {
  high:   'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low:    'bg-green-100 text-green-800 border-green-200',
};

const PRIORITY_BORDER: Record<string, string> = {
  high:   'border-l-4 border-l-red-500',
  medium: 'border-l-4 border-l-amber-500',
  low:    'border-l-4 border-l-emerald-500',
};

const PRIORITY_BTN: Record<string, string> = {
  high:   'text-red-600 hover:text-red-700 hover:bg-red-100',
  medium: 'text-amber-600 hover:text-amber-700 hover:bg-amber-100',
  low:    'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100',
};
const PRIORITY_ICON: Record<string, string> = {
  high:   'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low:    'bg-emerald-100 text-emerald-600',
};

const PRIORITY_DOT: Record<string, string> = {
  high:   'bg-red-500',
  medium: 'bg-amber-500',
  low:    'bg-emerald-500',
};

const getPriorityIcon = (priority: string) => {
  if (priority === 'high')   return <AlertCircle className="w-3 h-3" />;
  if (priority === 'medium') return <Bell className="w-3 h-3" />;
  return <Sparkles className="w-3 h-3" />;
};

const fmtDate = (ds: string) =>
  new Date(ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ═════════════════════════════════════════════════════════════════════════════
const StudentNotices = () => {
  const [notices,        setNotices]        = useState<Notice[]>([]);
  const [loading,        setLoading]        = useState(true);
   const [showImportant, setShowImportant] = useState(false);
  const [viewMode,       setViewMode]       = useState<'grid' | 'list'>('grid');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy,         setSortBy]         = useState('date');
  const [selectedCat,    setSelectedCat]    = useState('all');
  const [isFilterOpen,   setIsFilterOpen]   = useState(false);
  const [viewNotice,     setViewNotice]     = useState<Notice | null>(null);

  const orgId        = sessionStorage.getItem('orgId')   || '';
  const studentId    = sessionStorage.getItem('uid')     || '';
  const studentDeptId = sessionStorage.getItem('deptId') || '';

  // ─── Fetch ──────────────────────────────────────────────────────────────
  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${serverURL}/api/org/notices?organizationId=${orgId}&studentId=${studentId}`
      );
      if (res.data.success) {
        // Show org-wide notices (no dept) OR notices for the student's dept
        const filtered: RawNotice[] = (res.data.notices as RawNotice[]).filter(n => {
          if (!n.department)    return true;  // org-wide
          if (!studentDeptId)   return true;  // dept unknown — show all
          return n.department === studentDeptId;
        });
        setNotices(filtered.map(enrich));
      }
    } catch (e) {
      console.error('Error fetching notices:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (orgId && studentId) fetchNotices(); }, []);

  // ─── Filter + sort ───────────────────────────────────────────────────────
 const filteredNotices = useMemo(() => {
  let result = [...notices];

  // 🔍 1. SEARCH FILTER
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();

    result = result.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q)
    );
  }

  // 🎯 2. PRIORITY FILTER
  if (filterPriority !== 'all') {
    result = result.filter(n => n.priority === filterPriority);
  }

  // ⭐ IMPORTANT FILTER (ADD HERE 👇)
  if (showImportant) {
    result = result.filter(n => n.isImportant);
  }

  // 🏷️ 3. CATEGORY FILTER (safe compare)
  if (selectedCat !== 'all') {
    result = result.filter(
      n => n.category.toLowerCase() === selectedCat.toLowerCase()
    );
  }

  // 📌 4. SORTING (separate clean logic)
  result = result.sort((a, b) => {
    // Always keep pinned on top
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sortBy === 'priority') {
      const order: Record<string, number> = {
        high: 3,
        medium: 2,
        low: 1
      };
      return order[b.priority] - order[a.priority];
    }

    // default → date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return result;
}, [notices, searchQuery, filterPriority, selectedCat, sortBy, showImportant]);

  const categories = useMemo(() => {
    const cats = new Set(
  notices.map(n => n.category || 'General')
);
    return ['all', ...Array.from(cats)];
  }, [notices]);

  const hasActiveFilters =
    searchQuery !== '' || filterPriority !== 'all' || selectedCat !== 'all' || sortBy !== 'date';

  const clearFilters = () => {
    setSearchQuery(''); setFilterPriority('all'); setSelectedCat('all'); setSortBy('date');
  };

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading your notices...</p>
        </div>
      </div>
    );
  }

  // ─── Filter panel ────────────────────────────────────────────────────────
  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2"><Tag className="w-4 h-4" />Category</label>
        <Select value={selectedCat} onValueChange={setSelectedCat}>
          <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            {categories.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All Categories' : c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" />Priority</label>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger><SelectValue placeholder="All Priorities" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4" />Sort By</label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date (Newest First)</SelectItem>
            <SelectItem value="priority">Priority (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="w-4 h-4 mr-2" />Clear All Filters
        </Button>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen">

      {/* ── FULL NOTICE MODAL ──────────────────────────────────────────── */}
     {/* ── FULL NOTICE MODAL ──────────────────────────────────────────── */}
{viewNotice && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setViewNotice(null)} />
    <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-950 rounded-2xl shadow-2xl flex flex-col border border-border">

      {/* Header - Increased padding and added bg tint */}
      <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-start justify-between gap-4 mb-5">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 leading-tight pr-6">
            {viewNotice.title}
          </h2>
          <button
            onClick={() => setViewNotice(null)}
            className="shrink-0 text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted border border-border transition-all hover:rotate-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Badges Row - Better spacing */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge className={`${PRIORITY_BADGE[viewNotice.priority]} border px-2.5 py-1 text-[10px] font-bold tracking-wider`}>
            <span className="flex items-center gap-1.5">
              {getPriorityIcon(viewNotice.priority)}
              {viewNotice.priority.toUpperCase()}
            </span>
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-2.5 py-1 text-[10px]">
            <Tag className="w-3 h-3 mr-1" />{viewNotice.category}
          </Badge>
          {viewNotice.isPinned && (
            <Badge className="bg-blue-600 text-white border-none px-2.5 py-1 text-[10px]">
              <Pin className="w-3 h-3 mr-1" />Pinned
            </Badge>
          )}
          <div className="flex items-center gap-4 ml-auto text-muted-foreground/80 font-medium text-xs">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />{fmtDate(viewNotice.createdAt)}
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{viewNotice.readTime} min read</span>
          </div>
        </div>
      </div>

      {/* Content Section - Added margin-top for breathing room */}
      <div className="px-6 sm:px-8 py-8">
        <h3 className="text-xs font-bold mb-5 flex items-center gap-2 text-slate-400 uppercase tracking-[0.2em]">
          <FileText className="w-4 h-4" />
          Full Notice
        </h3>
        <div
          className="prose prose-blue dark:prose-invert max-w-none p-6 sm:p-8 bg-slate-50/30 dark:bg-slate-900/30 rounded-2xl border border-dashed border-border leading-relaxed text-foreground text-base sm:text-lg"
          dangerouslySetInnerHTML={{ __html: viewNotice.content }}
        />
      </div>

      {/* Footer */}
      <div className="px-6 sm:px-8 pb-8 flex justify-end">
        <Button
          onClick={() => setViewNotice(null)}
          className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          Close
        </Button>
      </div>
    </div>
  </div>
)}

      <div className="container mx-auto py-6 sm:py-8 px-3 sm:px-4 space-y-5 sm:space-y-6">
        <SEO title="Notices" description="Announcements from your organization." />

        {/* ── PAGE HEADER ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-sky-400 to-blue-500 bg-clip-text text-transparent">
                Smart Notices
              </h1>
              {/* <Badge variant="secondary" className="gap-1 text-xs sm:text-sm">
                <Sparkles className="w-3 h-3" />AI Powered
              </Badge> */}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {filteredNotices.length} notices • Last updated {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="hidden sm:flex gap-2">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ── SEARCH + FILTERS ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notices by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Desktop */}
          <div className="hidden md:flex gap-2">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Priorities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="priority">Sort by Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile */}
          <div className="flex gap-2 sm:hidden">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Filter className="w-4 h-4 mr-2" />Filters
                  {hasActiveFilters && <Badge variant="secondary" className="ml-2 bg-primary/20">Active</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-xl max-h-[85vh] overflow-y-auto">
                <SheetHeader><SheetTitle>Filter &amp; Sort</SheetTitle></SheetHeader>
                <div className="mt-6"><FilterContent /></div>
                <div className="mt-6 pt-4 border-t">
                  <Button className="w-full" onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                <LayoutList className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Search: {searchQuery}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSearchQuery('')} />
              </Badge>
            )}
            {filterPriority !== 'all' && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Priority: {filterPriority}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFilterPriority('all')} />
              </Badge>
            )}
            {selectedCat !== 'all' && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Category: {selectedCat}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSelectedCat('all')} />
              </Badge>
            )}
          </div>
        )}

        {/* ── NOTICES ────────────────────────────────────────────────── */}
        {filteredNotices.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-3 sm:space-y-4'
          }>
            {filteredNotices.map((notice) => (
              <Card
                key={notice._id}
                className={`group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl flex flex-col ${PRIORITY_BORDER[notice.priority]} bg-white/80 backdrop-blur-sm`}
              >
                {/* Pinned badge */}
               {/* PINNED */}
<div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-10">

  {notice.isPinned && (
    <div className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full shadow flex items-center gap-1">
      <Pin className="w-2.5 h-2.5" />
      Pinned
    </div>
  )}

  {notice.isImportant && (
    <div className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full shadow flex items-center gap-1">
      <AlertCircle className="w-2.5 h-2.5" />
      Important
    </div>
  )}

</div>
                <CardHeader className="p-4 sm:p-5 lg:p-6 pb-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg group-hover:scale-110 transition-transform ${PRIORITY_ICON[notice.priority]}`}>
                          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${PRIORITY_DOT[notice.priority]}`} />
                      </div>

                      <CardTitle className="text-base sm:text-lg lg:text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                        {notice.title}
                      </CardTitle>

                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                        <Badge variant="outline" className={`${PRIORITY_BADGE[notice.priority]} text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full`}>
                          <span className="flex items-center gap-1">
                            {getPriorityIcon(notice.priority)}
                            {notice.priority.toUpperCase()}
                          </span>
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] sm:text-xs rounded-full">
                          <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />{notice.category}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] sm:text-xs rounded-full">
                          <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                          {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 lg:p-6 pt-0 flex-1 flex flex-col">
                  <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground/50">
                      {notice.readTime} min read
                    </span>
                  <Button
  variant="ghost" 
  size="sm"
  className={`text-xs font-semibold px-3 py-1.5 rounded-lg h-auto transition-colors ${PRIORITY_BTN[notice.priority]} hover:text-primary`} 
  onClick={() => setViewNotice(notice)}
>
  Read Full Notice →
</Button>
                  </div>
                </CardContent>

                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl">
            <div className="relative inline-block">
              <Bell className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground/30" />
              <Sparkles className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">No notices found</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              {hasActiveFilters ? 'Try adjusting your search or filters' : 'No notices available from your organization'}
            </p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-3">Clear all filters</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotices;