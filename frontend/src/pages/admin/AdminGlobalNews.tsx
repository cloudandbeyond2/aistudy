// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import { 
//   Trash2, 
//   MoreVertical, 
//   PlusCircle,
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   RefreshCcw
// } from 'lucide-react';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger
// } from '@/components/ui/dropdown-menu';
// import SEO from '@/components/SEO';
// import axios from 'axios';
// import { toast } from '@/hooks/use-toast';
// import { Badge } from '@/components/ui/badge';

// interface NewsItem {
//   _id: string;
//   title: string;
//   content: string;
//   createdAt: string;
// }

// const AdminGlobalNews = () => {
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [news, setNews] = useState<NewsItem[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
  
//   // Basic Pagination State
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   const API = "http://localhost:5001/api/global-news";

//   const fetchNews = async () => {
//     setIsLoading(true);
//     try {
//       const res = await axios.get(API);
//       setNews(res.data);
//     } catch (error) {
//       toast({ title: "Error", description: "Failed to fetch news", variant: "destructive" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchNews();
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await axios.post(API, { title, content });
//       setTitle("");
//       setContent("");
//       fetchNews();
//       toast({ title: "Success", description: "News posted successfully" });
//     } catch (error) {
//       toast({ title: "Error", description: "Failed to post news", variant: "destructive" });
//     }
//   };

//   const deleteNews = async (id: string) => {
//     try {
//       await axios.delete(`${API}/${id}`);
//       setNews(prev => prev.filter(item => item._id !== id));
//       toast({ title: "Deleted", description: "News item removed" });
//     } catch (error) {
//       toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
//     }
//   };

//   // 1. Search Logic
//   const filteredNews = useMemo(() => {
//     return news.filter(item => 
//       item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       item.content.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [news, searchQuery]);

//   // 2. Pagination Logic
//   const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredNews.slice(start, start + itemsPerPage);
//   }, [filteredNews, currentPage]);

//   // Reset to page 1 if search query changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchQuery]);

//   return (
//     <>
//       <SEO title="Manage Global News" description="Admin panel for global notifications" />

//       <div className="space-y-6 p-6">
//         <div className="flex justify-between items-end">
//           <div>
//             <h1 className="text-2xl font-bold">Global News</h1>
//             <p className="text-muted-foreground">Publish Global Updates — Send a notification to every active user's dashboard.</p>
//           </div>
//           <div className="flex items-center gap-2">
//              <Badge variant="outline" className="h-8 px-3">Total: {news.length}</Badge>
//              <Button variant="outline" size="icon" onClick={fetchNews} disabled={isLoading}>
//                 <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
//              </Button>
//           </div>
//         </div>

//         <Separator />
// <Card className="p-6 bg-background border border-border shadow-sm">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Input
//           placeholder="News Title (e.g. System Update)"
//   className="bg-background"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 required
//               />
//               <Input
//                 placeholder="News Content Summary"
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//                 required
//               />
//             </div>
//             <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
//               <PlusCircle className="mr-2 h-4 w-4" /> Post News
//             </Button>
//           </form>
//         </Card>

//         <div className="relative">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search news history..."
//             className="pl-8"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>

//         <Card>
//           <Table>
//             <TableHeader className="bg-muted/50">
//               <TableRow>
//                 <TableHead className="w-[300px]">Title</TableHead>
//                 <TableHead>Content</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {isLoading ? (
//                 <TableRow><TableCell colSpan={3} className="text-center py-10">Loading...</TableCell></TableRow>
//               ) : paginatedData.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No news items found.</TableCell>
//                 </TableRow>
//               ) : (
//                 paginatedData.map((item) => (
//                   <TableRow key={item._id} className="hover:bg-muted/30">
//                     <TableCell className="font-semibold">{item.title}</TableCell>
//                     <TableCell className="text-muted-foreground max-w-md truncate">{item.content}</TableCell>
//                     <TableCell className="text-right">
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           <DropdownMenuItem className="text-red-600" onClick={() => deleteNews(item._id)}>
//                             <Trash2 className="mr-2 h-4 w-4" /> Delete News
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>

//           {/* Pagination Controls */}
//           <div className="flex items-center justify-between p-4 border-t bg-muted/20">
//             <p className="text-sm text-muted-foreground">
//               Page {currentPage} of {Math.max(1, totalPages)}
//             </p>
//             <div className="flex items-center space-x-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
//                 disabled={currentPage === 1 || isLoading}
//               >
//                 <ChevronLeft className="h-4 w-4 mr-1" /> Previous
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
//                 disabled={currentPage === totalPages || totalPages === 0 || isLoading}
//               >
//                 Next <ChevronRight className="h-4 w-4 ml-1" />
//               </Button>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </>
//   );
// };

// export default AdminGlobalNews;

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Trash2, 
  MoreVertical, 
  PlusCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCcw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import SEO from '@/components/SEO';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

const AdminGlobalNews = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Change this to your production URL when ready
  const API = "http://localhost:5001/api/global-news";

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API);
      setNews(res.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch news", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API, { title, content });
      setTitle("");
      setContent("");
      fetchNews();
      toast({ title: "Success", description: "News posted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to post news", variant: "destructive" });
    }
  };

  const deleteNews = async (id: string) => {
    try {
      await axios.delete(`${API}/${id}`);
      setNews(prev => prev.filter(item => item._id !== id));
      toast({ title: "Deleted", description: "News item removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const filteredNews = useMemo(() => {
    return news.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [news, searchQuery]);

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNews.slice(start, start + itemsPerPage);
  }, [filteredNews, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <>
      <SEO title="Manage Global News" description="Admin panel for global notifications" />

      <div className="space-y-6 p-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold">Global News</h1>
            <p className="text-muted-foreground">Internal Dashboard Updates</p>
          </div>
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="h-8 px-3">Total: {news.length}</Badge>
             <Button variant="outline" size="icon" onClick={fetchNews} disabled={isLoading}>
                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
             </Button>
          </div>
        </div>

        <Separator />
        
        <Card className="p-6 bg-background border border-border shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="News Title (e.g. System Update)"
                className="bg-background"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Input
                placeholder="News Content Summary"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Post News
            </Button>
          </form>
        </Card>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search news history..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Card>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Content</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center py-10">Loading...</TableCell></TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No news items found.</TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item._id} className="hover:bg-muted/30">
                    <TableCell className="font-semibold">{item.title}</TableCell>
                    <TableCell className="text-muted-foreground max-w-md truncate">{item.content}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteNews(item._id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete News
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between p-4 border-t bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {Math.max(1, totalPages)}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0 || isLoading}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default AdminGlobalNews;
