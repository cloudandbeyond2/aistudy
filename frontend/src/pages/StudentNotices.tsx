// // import React, { useState, useEffect, useMemo } from 'react';
// // import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// // import { Bell, Sparkles, TrendingUp, Calendar, Pin, AlertCircle, Filter, LayoutGrid, LayoutList, Search, Tag, X, Clock } from 'lucide-react';
// // import SEO from '@/components/SEO';
// // import axios from 'axios';
// // import { serverURL } from '@/constants';
// // import StyledText from '@/components/styledText';
// // import { Badge } from '@/components/ui/badge';
// // import { Button } from '@/components/ui/button';
// // import { Input } from '@/components/ui/input';
// // import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// // // Add this interface at the top of your file (before the component)
// // interface Notice {
// //     _id: string;
// //     title: string;
// //     content: string;
// //     createdAt: string;
// //     priority: 'high' | 'medium' | 'low';
// //     category: string;
// //     aiSummary: string;
// //     readTime: number;
// // }

// // const StudentNotices = () => {
// //     const [notices, setNotices] = useState([]);
// //     const [loading, setLoading] = useState(true);
// //     const [viewMode, setViewMode] = useState('grid'); // grid, list
// //     const [searchQuery, setSearchQuery] = useState('');
// //     const [filterPriority, setFilterPriority] = useState('all'); // all, high, medium, low
// //     const [sortBy, setSortBy] = useState('date'); // date, priority, relevance
// //     const [selectedCategory, setSelectedCategory] = useState('all');
// //     const [isFilterOpen, setIsFilterOpen] = useState(false);
    
// //     const orgId = sessionStorage.getItem('orgId');
// //     const studentId = sessionStorage.getItem('uid');

// //     useEffect(() => {
// //         if (orgId && studentId) {
// //             fetchNotices();
// //         }
// //     }, []);

// //     const fetchNotices = async () => {
// //         try {
// //             setLoading(true);
// //             const res = await axios.get(`${serverURL}/api/org/notices?organizationId=${orgId}&studentId=${studentId}`);
// //             if (res.data.success) {
// //                 // Add AI-simulated priority and categories based on content
// //                 const enrichedNotices = res.data.notices.map(notice => ({
// //                     ...notice,
// //                     priority: calculatePriority(notice),
// //                     category: detectCategory(notice),
// //                     aiSummary: generateAISummary(notice),
// //                     readTime: calculateReadTime(notice.content)
// //                 }));
// //                 setNotices(enrichedNotices);
// //             }
// //         } catch (e) {
// //             console.error('Error fetching notices:', e);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     // AI-simulated functions
// //     const calculatePriority = (notice) => {
// //         const keywords = {
// //             high: ['urgent', 'important', 'deadline', 'mandatory', 'required', 'exam', 'payment'],
// //             medium: ['reminder', 'update', 'change', 'notice', 'schedule'],
// //             low: ['information', 'optional', 'event', 'activity', 'announcement']
// //         };
        
// //         const content = `${notice.title} ${notice.content}`.toLowerCase();
// //         if (keywords.high.some(k => content.includes(k))) return 'high';
// //         if (keywords.medium.some(k => content.includes(k))) return 'medium';
// //         return 'low';
// //     };

// //     const detectCategory = (notice) => {
// //         const categories = {
// //             'Academic': ['exam', 'assignment', 'class', 'course', 'grade', 'result'],
// //             'Events': ['event', 'workshop', 'seminar', 'webinar', 'conference'],
// //             'Administrative': ['fee', 'registration', 'document', 'form', 'application'],
// //             'Announcements': ['announcement', 'update', 'new', 'launch'],
// //             'Deadlines': ['deadline', 'last date', 'due', 'submission']
// //         };
        
// //         const content = `${notice.title} ${notice.content}`.toLowerCase();
// //         for (const [category, keywords] of Object.entries(categories)) {
// //             if (keywords.some(k => content.includes(k))) return category;
// //         }
// //         return 'General';
// //     };

// //     const generateAISummary = (notice) => {
// //         const content = notice.content;
// //         if (content.length > 150) {
// //             return content.substring(0, 150) + '...';
// //         }
// //         return content;
// //     };

// //     const calculateReadTime = (content) => {
// //         const wordsPerMinute = 200;
// //         const wordCount = content.split(/\s+/).length;
// //         return Math.ceil(wordCount / wordsPerMinute);
// //     };

// //     // Filtering and sorting
// //     const filteredNotices = useMemo(() => {
// //         let filtered = [...notices];
        
// //         // Search filter
// //         if (searchQuery) {
// //             filtered = filtered.filter(notice => 
// //                 notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //                 notice.content.toLowerCase().includes(searchQuery.toLowerCase())
// //             );
// //         }
        
// //         // Priority filter
// //         if (filterPriority !== 'all') {
// //             filtered = filtered.filter(notice => notice.priority === filterPriority);
// //         }
        
// //         // Category filter
// //         if (selectedCategory !== 'all') {
// //             filtered = filtered.filter(notice => notice.category === selectedCategory);
// //         }
        
// //         // Sorting - with proper typing
// //         filtered.sort((a: Notice, b: Notice) => {
// //             if (sortBy === 'date') {
// //                 return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
// //             } else if (sortBy === 'priority') {
// //                 const priorityOrder = { high: 3, medium: 2, low: 1 };
// //                 return priorityOrder[b.priority] - priorityOrder[a.priority];
// //             }
// //             return 0;
// //         });
        
// //         return filtered;
// //     }, [notices, searchQuery, filterPriority, selectedCategory, sortBy]);

// //     const categories = useMemo(() => {
// //         const cats = new Set(notices.map(n => n.category));
// //         return ['all', ...Array.from(cats)];
// //     }, [notices]);

// //     const getPriorityColor = (priority) => {
// //         switch(priority) {
// //             case 'high': return 'bg-red-100 text-red-800 border-red-200';
// //             case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
// //             case 'low': return 'bg-green-100 text-green-800 border-green-200';
// //             default: return 'bg-gray-100 text-gray-800';
// //         }
// //     };

// //     const getPriorityIcon = (priority) => {
// //         switch(priority) {
// //             case 'high': return <AlertCircle className="w-3 h-3" />;
// //             case 'medium': return <Bell className="w-3 h-3" />;
// //             default: return <Sparkles className="w-3 h-3" />;
// //         }
// //     };

// //     // Clear all filters
// //     const clearFilters = () => {
// //         setSearchQuery('');
// //         setFilterPriority('all');
// //         setSelectedCategory('all');
// //         setSortBy('date');
// //     };

// //     // Check if any filter is active
// //     const hasActiveFilters = searchQuery !== '' || filterPriority !== 'all' || selectedCategory !== 'all' || sortBy !== 'date';

// //     if (loading) {
// //         return (
// //             <div className="container mx-auto py-8 px-4">
// //                 <div className="flex items-center justify-center min-h-[400px]">
// //                     <div className="text-center space-y-4">
// //                         <div className="relative">
// //                             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
// //                             <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
// //                         </div>
// //                         <p className="text-muted-foreground">AI is analyzing your notices...</p>
// //                     </div>
// //                 </div>
// //             </div>
// //         );
// //     }

// //     // Filter content component (used in both desktop and mobile)
// //     const FilterContent = () => (
// //         <div className="space-y-6">
// //             {/* Category Filter */}
// //             <div className="space-y-2">
// //                 <label className="text-sm font-medium flex items-center gap-2">
// //                     <Tag className="w-4 h-4" />
// //                     Category
// //                 </label>
// //                 <Select value={selectedCategory} onValueChange={setSelectedCategory}>
// //                     <SelectTrigger className="w-full">
// //                         <SelectValue placeholder="All Categories" />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                         {categories.map(cat => (
// //                             <SelectItem key={cat} value={cat}>
// //                                 {cat === 'all' ? 'All Categories' : cat}
// //                             </SelectItem>
// //                         ))}
// //                     </SelectContent>
// //                 </Select>
// //             </div>

// //             {/* Priority Filter */}
// //             <div className="space-y-2">
// //                 <label className="text-sm font-medium flex items-center gap-2">
// //                     <AlertCircle className="w-4 h-4" />
// //                     Priority
// //                 </label>
// //                 <Select value={filterPriority} onValueChange={setFilterPriority}>
// //                     <SelectTrigger className="w-full">
// //                         <SelectValue placeholder="All Priorities" />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                         <SelectItem value="all">All Priorities</SelectItem>
// //                         <SelectItem value="high">High Priority</SelectItem>
// //                         <SelectItem value="medium">Medium Priority</SelectItem>
// //                         <SelectItem value="low">Low Priority</SelectItem>
// //                     </SelectContent>
// //                 </Select>
// //             </div>

// //             {/* Sort By */}
// //             <div className="space-y-2">
// //                 <label className="text-sm font-medium flex items-center gap-2">
// //                     <TrendingUp className="w-4 h-4" />
// //                     Sort By
// //                 </label>
// //                 <Select value={sortBy} onValueChange={setSortBy}>
// //                     <SelectTrigger className="w-full">
// //                         <SelectValue placeholder="Sort by" />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                         <SelectItem value="date">Date (Newest First)</SelectItem>
// //                         <SelectItem value="priority">Priority (High to Low)</SelectItem>
// //                     </SelectContent>
// //                 </Select>
// //             </div>

// //             {/* Clear Filters Button */}
// //             {hasActiveFilters && (
// //                 <Button variant="outline" onClick={clearFilters} className="w-full">
// //                     <X className="w-4 h-4 mr-2" />
// //                     Clear All Filters
// //                 </Button>
// //             )}
// //         </div>
// //     );

// //     return (
// //         <div className="min-h-screen bg-gradient-to-br via-white">
// //             <div className="container mx-auto py-6 sm:py-8 px-3 sm:px-4 space-y-5 sm:space-y-6">
// //                 <SEO title="Notices" description="AI-powered announcements from your organization." />

// //                 {/* Header with AI badge - Responsive */}
// //                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
// //                     <div className="space-y-1 sm:space-y-2">
// //                         <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
// //                             <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-sky-400 to-blue-500 bg-clip-text text-transparent">
// //                                 Smart Notices
// //                             </h1>
// //                             <Badge variant="secondary" className="gap-1 text-xs sm:text-sm">
// //                                 <Sparkles className="w-3 h-3" />
// //                                 AI Powered
// //                             </Badge>
// //                         </div>
// //                         <p className="text-xs sm:text-sm text-muted-foreground">
// //                             {filteredNotices.length} notices • Last updated {new Date().toLocaleDateString()}
// //                         </p>
// //                     </div>
                    
// //                     {/* View Toggle - Hidden on mobile, visible on tablet+ */}
// //                     <div className="hidden sm:flex gap-2">
// //                         <Button 
// //                             variant={viewMode === 'grid' ? 'default' : 'outline'} 
// //                             size="sm"
// //                             onClick={() => setViewMode('grid')}
// //                         >
// //                             <LayoutGrid className="w-4 h-4" />
// //                         </Button>
// //                         <Button 
// //                             variant={viewMode === 'list' ? 'default' : 'outline'} 
// //                             size="sm"
// //                             onClick={() => setViewMode('list')}
// //                         >
// //                             <LayoutList className="w-4 h-4" />
// //                         </Button>
// //                     </div>
// //                 </div>

// //                 {/* Search and Filters - Responsive Layout */}
// //                 <div className="flex flex-col sm:flex-row gap-3">
// //                     {/* Search Input - Full width on mobile, flex-grow on desktop */}
// //                     <div className="relative flex-1">
// //                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
// //                         <Input
// //                             placeholder="Search notices by title or content..."
// //                             value={searchQuery}
// //                             onChange={(e) => setSearchQuery(e.target.value)}
// //                             className="pl-10 w-full"
// //                         />
// //                     </div>
                    
// //                     {/* Desktop Filters - Hidden on mobile, shown on tablet+ */}
// //                     <div className="hidden md:flex gap-2">
// //                         <Select value={filterPriority} onValueChange={setFilterPriority}>
// //                             <SelectTrigger className="w-[140px]">
// //                                 <SelectValue placeholder="All Priorities" />
// //                             </SelectTrigger>
// //                             <SelectContent>
// //                                 <SelectItem value="all">All Priorities</SelectItem>
// //                                 <SelectItem value="high">High Priority</SelectItem>
// //                                 <SelectItem value="medium">Medium Priority</SelectItem>
// //                                 <SelectItem value="low">Low Priority</SelectItem>
// //                             </SelectContent>
// //                         </Select>
                        
// //                         <Select value={sortBy} onValueChange={setSortBy}>
// //                             <SelectTrigger className="w-[140px]">
// //                                 <SelectValue placeholder="Sort by" />
// //                             </SelectTrigger>
// //                             <SelectContent>
// //                                 <SelectItem value="date">Sort by Date</SelectItem>
// //                                 <SelectItem value="priority">Sort by Priority</SelectItem>
// //                             </SelectContent>
// //                         </Select>
// //                     </div>

// //                     {/* Mobile Filter Button - Shown only on mobile */}
// //                     <div className="flex gap-2 sm:hidden">
// //                         <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
// //                             <SheetTrigger asChild>
// //                                 <Button variant="outline" className="flex-1">
// //                                     <Filter className="w-4 h-4 mr-2" />
// //                                     Filters
// //                                     {hasActiveFilters && (
// //                                         <Badge variant="secondary" className="ml-2 bg-primary/20">
// //                                             Active
// //                                         </Badge>
// //                                     )}
// //                                 </Button>
// //                             </SheetTrigger>
// //                             <SheetContent side="bottom" className="rounded-t-xl max-h-[85vh] overflow-y-auto">
// //                                 <SheetHeader>
// //                                     <SheetTitle>Filter & Sort</SheetTitle>
// //                                 </SheetHeader>
// //                                 <div className="mt-6">
// //                                     <FilterContent />
// //                                 </div>
// //                                 <div className="mt-6 pt-4 border-t">
// //                                     <Button 
// //                                         className="w-full" 
// //                                         onClick={() => setIsFilterOpen(false)}
// //                                     >
// //                                         Apply Filters
// //                                     </Button>
// //                                 </div>
// //                             </SheetContent>
// //                         </Sheet>

// //                         {/* View Toggle for Mobile */}
// //                         <div className="flex gap-2">
// //                             <Button 
// //                                 variant={viewMode === 'grid' ? 'default' : 'outline'} 
// //                                 size="sm"
// //                                 onClick={() => setViewMode('grid')}
// //                             >
// //                                 <LayoutGrid className="w-4 h-4" />
// //                             </Button>
// //                             <Button 
// //                                 variant={viewMode === 'list' ? 'default' : 'outline'} 
// //                                 size="sm"
// //                                 onClick={() => setViewMode('list')}
// //                             >
// //                                 <LayoutList className="w-4 h-4" />
// //                             </Button>
// //                         </div>
// //                     </div>

// //                     {/* Active Filters Display - Shown when filters are active (mobile & desktop) */}
// //                     {hasActiveFilters && (
// //                         <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
// //                             {searchQuery && (
// //                                 <Badge variant="secondary" className="gap-1 text-xs">
// //                                     Search: {searchQuery}
// //                                     <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSearchQuery('')} />
// //                                 </Badge>
// //                             )}
// //                             {filterPriority !== 'all' && (
// //                                 <Badge variant="secondary" className="gap-1 text-xs">
// //                                     Priority: {filterPriority}
// //                                     <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFilterPriority('all')} />
// //                                 </Badge>
// //                             )}
// //                             {selectedCategory !== 'all' && (
// //                                 <Badge variant="secondary" className="gap-1 text-xs">
// //                                     Category: {selectedCategory}
// //                                     <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSelectedCategory('all')} />
// //                                 </Badge>
// //                             )}
// //                             {sortBy !== 'date' && (
// //                                 <Badge variant="secondary" className="gap-1 text-xs">
// //                                     Sort: {sortBy === 'priority' ? 'Priority' : 'Date'}
// //                                     <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSortBy('date')} />
// //                                 </Badge>
// //                             )}
// //                         </div>
// //                     )}
// //                 </div>

// //                 {/* Category Pills - Quick filter on mobile and desktop */}
// //                 {/* {categories.length > 1 && (
// //                     <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
// //                         {categories.map(cat => (
// //                             <Badge
// //                                 key={cat}
// //                                 variant={selectedCategory === cat ? 'default' : 'outline'}
// //                                 className="cursor-pointer whitespace-nowrap px-3 py-1 text-xs sm:text-sm"
// //                                 onClick={() => setSelectedCategory(cat === selectedCategory ? 'all' : cat)}
// //                             >
// //                                 {cat === 'all' ? 'All' : cat}
// //                                 {cat !== 'all' && (
// //                                     <span className="ml-1 text-xs opacity-70">
// //                                         ({notices.filter(n => n.category === cat).length})
// //                                     </span>
// //                                 )}
// //                             </Badge>
// //                         ))}
// //                     </div>
// //                 )} */}

// //                 {/* Notices Display - Responsive Grid/List */}
// //                 {filteredNotices.length > 0 ? (
// //                     <div className={
// //                         viewMode === 'grid' 
// //                             ? "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
// //                             : "space-y-3 sm:space-y-4"
// //                     }>
// //                         {filteredNotices.map((notice) => (
// //                             <Card 
// //     key={notice._id} 
// //     className={`group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
// //         viewMode === 'list' 
// //             ? 'flex flex-col sm:flex-row sm:items-stretch' 
// //             : 'flex flex-col'
// //     } ${
// //         notice.priority === 'high' 
// //             ? 'border-l-4 border-l-red-500 shadow-md hover:shadow-red-100/50' 
// //             : notice.priority === 'medium'
// //             ? 'border-l-4 border-l-amber-500 hover:shadow-amber-100/30'
// //             : 'border-l-4 border-l-emerald-500 hover:shadow-emerald-100/30'
// //     } bg-white/80 backdrop-blur-sm`}
// // >
// //     {/* Animated gradient overlay on hover */}
// //     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
    
// //     {/* Priority ribbon - modern design */}
// //     {notice.priority === 'high' && (
// //         <>
// //             <div className="absolute top-3 right-3 z-10">
// //                 <div className="relative">
// //                     <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-50 animate-pulse" />
// //                     <div className="relative bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
// //                         <AlertCircle className="w-3 h-3" />
// //                         URGENT
// //                     </div>
// //                 </div>
// //             </div>
// //             {/* Corner accent */}
// //             <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500/20 to-transparent rounded-bl-full pointer-events-none" />
// //         </>
// //     )}
    
// //     {notice.priority === 'medium' && (
// //         <div className="absolute top-3 right-3 z-10">
// //             <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
// //                 <Bell className="w-3 h-3" />
// //                 IMPORTANT
// //             </div>
// //         </div>
// //     )}
    
// //     <CardHeader className={`
// //         ${viewMode === 'list' ? 'flex-1 p-4 sm:p-5 lg:p-6' : 'p-4 sm:p-5 lg:p-6'}
// //         ${notice.priority === 'high' ? 'pb-2' : 'pb-2'}
// //     `}>
// //         <div className="flex items-start justify-between gap-2">
// //             <div className="flex-1 min-w-0">
// //                 {/* Title with icon and priority dot */}
// //                 <div className="flex items-center gap-2 mb-2">
// //                     <div className={`
// //                         p-1.5 rounded-lg transition-all duration-300 group-hover:scale-110
// //                         ${notice.priority === 'high' ? 'bg-red-100 text-red-600' : 
// //                           notice.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 
// //                           'bg-emerald-100 text-emerald-600'}
// //                     `}>
// //                         <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
// //                     </div>
// //                     <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
// //                         notice.priority === 'high' ? 'bg-red-500' : 
// //                         notice.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
// //                     }`} />
// //                 </div>
                
// //                 <CardTitle className="text-base sm:text-lg lg:text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
// //                     {notice.title}
// //                 </CardTitle>
                
// //                 {/* Tags row - responsive flex wrap */}
// //                 <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
// //                     <Badge variant="outline" className={`
// //                         ${getPriorityColor(notice.priority)} 
// //                         text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full
// //                         transition-all duration-300 hover:scale-105
// //                     `}>
// //                         <span className="flex items-center gap-1">
// //                             {getPriorityIcon(notice.priority)}
// //                             {notice.priority.toUpperCase()}
// //                         </span>
// //                     </Badge>
                    
// //                     <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] sm:text-xs rounded-full">
// //                         <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
// //                         {notice.category}
// //                     </Badge>
                    
// //                     <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] sm:text-xs rounded-full">
// //                         <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
// //                         {new Date(notice.createdAt).toLocaleDateString(undefined, { 
// //                             month: 'short', 
// //                             day: 'numeric' 
// //                         })}
// //                     </Badge>
                    
// //                     {/* <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] sm:text-xs rounded-full">
// //                         <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
// //                         {notice.readTime} min read
// //                     </Badge> */}
// //                 </div>
// //             </div>
// //         </div>
// //     </CardHeader>
    
// //     <CardContent className={`
// //         ${viewMode === 'list' ? 'p-4 sm:p-5 lg:p-6 pt-0' : 'p-4 sm:p-5 lg:p-6 pt-0'}
// //         flex-1
// //     `}>
// //         {/* AI Summary with modern styling */}
// //         <div className={`
// //             relative overflow-hidden rounded-xl p-3 sm:p-4
// //             bg-gradient-to-br 
// //             ${notice.priority === 'high' ? 'from-red-50/80 to-rose-50/80 border border-red-100' : 
// //               notice.priority === 'medium' ? 'from-amber-50/80 to-orange-50/80 border border-amber-100' : 
// //               'from-emerald-50/80 to-teal-50/80 border border-emerald-100'}
// //             transition-all duration-300 hover:shadow-md
// //         `}>
// //             {/* Decorative blur element */}
// //             <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl" />
            
// //             <div className="flex items-start gap-2 relative z-10">
// //                 <div className={`
// //                     p-1 rounded-full shrink-0
// //                     ${notice.priority === 'high' ? 'bg-red-100' : 
// //                       notice.priority === 'medium' ? 'bg-amber-100' : 'bg-emerald-100'}
// //                 `}>
// //                     <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
// //                 </div>
// //                 <div className="min-w-0 flex-1">
// //                     <div className="flex items-center gap-2 mb-1 flex-wrap">
// //                         <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
// //                             AI Summary
// //                         </p>
// //                         <div className="flex items-center gap-1">
// //                             <div className="w-1 h-1 rounded-full bg-primary/40" />
// //                             <span className="text-[9px] sm:text-[10px] text-muted-foreground/60">
// //                                 {notice.readTime} min read
// //                             </span>
// //                         </div>
// //                     </div>
// //                     <StyledText 
// //                         text={notice.aiSummary} 
                        
// //                     />
// //                 </div>
// //             </div>
// //         </div>
        
     
// //     </CardContent>
    
// //     {/* Bottom progress bar for read status (optional) */}
// //     <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
// // </Card>
// //                         ))}
// //                     </div>
// //                 ) : (
// //                     <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl">
// //                         <div className="relative inline-block">
// //                             <Bell className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground/30" />
// //                             <Sparkles className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
// //                         </div>
// //                         <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-1 sm:mb-2">No notices found</h3>
// //                         <p className="text-sm sm:text-base text-muted-foreground px-4">
// //                             {searchQuery || hasActiveFilters ? "Try adjusting your search or filters" : "No notices available from your organization"}
// //                         </p>
// //                         {hasActiveFilters && (
// //                             <Button variant="link" onClick={clearFilters} className="mt-2 sm:mt-3">
// //                                 Clear all filters
// //                             </Button>
// //                         )}
// //                     </div>
// //                 )}
// //             </div>
// //         </div>
// //     );
// // };

// // export default StudentNotices;

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
    let res = [...notices];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(n =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }
    if (filterPriority !== 'all') res = res.filter(n => n.priority === filterPriority);
    if (selectedCat    !== 'all') res = res.filter(n => n.category === selectedCat);

    res.sort((a, b) => {
      if ( a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned &&  b.isPinned) return  1;
      if (sortBy === 'priority') {
        const ord: Record<string, number> = { high: 3, medium: 2, low: 1 };
        return ord[b.priority] - ord[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return res;
  }, [notices, searchQuery, filterPriority, selectedCat, sortBy]);

  const categories = useMemo(() => {
    const cats = new Set(notices.map(n => n.category));
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
      {viewNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setViewNotice(null)} />
          <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-background rounded-2xl shadow-2xl flex flex-col">

            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-border">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-sky-500 to-blue-500 leading-tight pr-4">
                  {viewNotice.title}
                </h2>
                <button
                  onClick={() => setViewNotice(null)}
                  className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted border border-border transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge className={`${PRIORITY_BADGE[viewNotice.priority]} border text-xs font-semibold`}>
                  <span className="flex items-center gap-1">
                    {getPriorityIcon(viewNotice.priority)}
                    {viewNotice.priority.toUpperCase()}
                  </span>
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                  <Tag className="w-3 h-3 mr-1" />{viewNotice.category}
                </Badge>
                {viewNotice.isPinned && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                    <Pin className="w-3 h-3 mr-1" />Pinned
                  </Badge>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />{fmtDate(viewNotice.createdAt)}
                </span>
                <span>•</span>
                <span className="text-xs text-muted-foreground/70">{viewNotice.readTime} min read</span>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary uppercase tracking-wide">
                <FileText className="w-4 h-4" />Full Notice
              </h3>
              <div
                className="prose prose-base dark:prose-invert max-w-none p-5 bg-muted/20 rounded-xl border border-border leading-relaxed text-foreground"
                dangerouslySetInnerHTML={{ __html: viewNotice.content }}
              />
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex justify-end">
              <Button
                onClick={() => setViewNotice(null)}
                className="min-w-[120px] bg-gradient-to-r from-primary via-sky-500 to-blue-500 text-white hover:opacity-90"
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