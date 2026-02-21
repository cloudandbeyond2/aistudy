
// import React, { useEffect, useMemo, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Search, MoreVertical, Eye, MailOpen, Reply, Trash } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { serverURL } from '@/constants';
// import axios from 'axios';
// import { Skeleton } from '@/components/ui/skeleton';



// const AdminContacts = () => {

//   const [data, setData] = useState([]);

//   const [searchQuery, setSearchQuery] = useState('');
//   const [isLoading, setIsLoading] = useState(true);

//   // Filtered data using memoization for better performance
//   const filteredData = useMemo(() => {
//     const query = searchQuery.toLowerCase().trim();
//     return data.filter((user) => {
//       const nameMatch = user.fname?.toLowerCase().includes(query);
//       const subMatch = user.lname?.toLowerCase().includes(query);
//       const emailMatch = user.email?.toLowerCase().includes(query);
//       const msgMatch = user.msg?.toLowerCase().includes(query);
//       return nameMatch || emailMatch || msgMatch || subMatch;
//     });
//   }, [data, searchQuery]);

//   useEffect(() => {
//     async function dashboardData() {
//       const postURL = serverURL + `/api/getcontact`;
//       const response = await axios.get(postURL);
//       setData(response.data)
//       setIsLoading(false);
//     }
//     dashboardData();
//   }, []);

//   const formatDate = (date: string) => {
//     const d = new Date(date);
//     const day = String(d.getDate()).padStart(2, '0');
//     const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
//     const year = d.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   function sendReply(email: string, subject: string) {
//     window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
//   }

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
//           <p className="text-muted-foreground mt-1">Manage user inquiries and messages</p>
//         </div>
//       </div>

//       <Card className="border-border/50">
//         <CardHeader className="pb-3">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//             <CardTitle>All Messages</CardTitle>
//             <div className="relative w-full sm:w-64">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 type="search"
//                 placeholder="Search messages..."
//                 className="w-full pl-8"
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
//                 <TableHead>Subject</TableHead>
//                 <TableHead>Message</TableHead>
//                 <TableHead>Date</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             {isLoading ?
//               <TableBody>
//                 <TableRow>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton className="h-5 w-24" />
//                   </TableCell>
//                 </TableRow>
//               </TableBody>
//               :
//               <TableBody>
//                 {filteredData.map((contact) => (
//                   <TableRow key={contact._id}>
//                     <TableCell className="font-medium">{contact.fname}</TableCell>
//                     <TableCell>{contact.email}</TableCell>
//                     <TableCell>{contact.lname}</TableCell>
//                     <TableCell>{contact.msg}</TableCell>
//                     <TableCell>{formatDate(contact.date)}</TableCell>
//                     <TableCell className="text-right">
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="icon">
//                             <MoreVertical className="h-4 w-4" />
//                             <span className="sr-only">Actions</span>
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           <DropdownMenuItem onClick={() => sendReply(contact.email, contact.lname)}>
//                             <Reply className="mr-2 h-4 w-4" />
//                             Reply
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </TableCell>
//                   </TableRow>
//                 ))}

//                 {filteredData.length === 0 && (
//                   <TableRow>
//                     <TableCell colSpan={7} className="text-center py-8">
//                       <div className="flex flex-col items-center justify-center text-muted-foreground">
//                         <Search className="h-8 w-8 mb-2" />
//                         <p>No contacts match your search criteria</p>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             }
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default AdminContacts;


import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MoreVertical, Reply } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { serverURL, adminEmail } from '@/constants';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_PAGE = 10;

const AdminContacts = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  /* ---------------- FILTER ---------------- */
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return data.filter((u) => {
      return (
        u.fname?.toLowerCase().includes(query) ||
        u.lname?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.msg?.toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery]);

  /* Reset page on search */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    async function dashboardData() {
      const res = await axios.get(`${serverURL}/api/getcontact`);
      setData(res.data);
      setIsLoading(false);
    }
    dashboardData();
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(
      d.getMonth() + 1
    ).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const sendReply = (email: string, subject: string) => {
    const ccMail = adminEmail || 'traininglabs2017@gmail.com';
    const encodedSubject = encodeURIComponent(subject || 'Reply to Inquiry');

    // Direct Gmail Compose URL
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&cc=${encodeURIComponent(ccMail)}&su=${encodedSubject}`;

    window.open(gmailUrl, '_blank');
  };



  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground mt-1">
          Manage user inquiries and messages
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>All Messages</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search messages..."
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
                <TableHead>Subject</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedData.length ? (
                paginatedData.map((contact) => (
                  <TableRow key={contact._id}>
                    <TableCell className="font-medium">
                      {contact.fname}
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.lname}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {contact.msg}
                    </TableCell>
                    <TableCell>{formatDate(contact.date)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setTimeout(() => {
                                sendReply(contact.email, contact.lname);
                              }, 100);
                            }}
                          >
                            <Reply className="mr-2 h-4 w-4" />
                            Reply
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No contacts match your search
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* ---------------- PAGINATION ---------------- */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>

              <div className="flex gap-1 flex-wrap justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant={page === currentPage ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[36px]"
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContacts;
