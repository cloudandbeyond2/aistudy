
// import { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { serverURL } from "@/constants";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "@/components/ui/table";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Bell, Search, ChevronLeft, ChevronRight, X } from "lucide-react";

// const OrgStudentTickets = () => {
//   const [tickets, setTickets] = useState<any[]>([]);
//   const [selectedTicket, setSelectedTicket] = useState<any>(null);
//   const [reply, setReply] = useState("");
  
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   const scrollRef = useRef<HTMLDivElement>(null);
//   const orgId = sessionStorage.getItem("orgId");

//   useEffect(() => {
//     fetchTickets();
//   }, []);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [selectedTicket]);

//   const fetchTickets = async () => {
//     try {
//       const res = await axios.get(`${serverURL}/api/student-tickets/org/${orgId}`);
//       setTickets(res.data.tickets || []);
//     } catch (error) {
//       console.error("Error fetching tickets", error);
//     }
//   };

//   const filteredTickets = tickets.filter((ticket) => {
//     const searchStr = searchTerm.toLowerCase();
//     return (
//       ticket.subject?.toLowerCase().includes(searchStr) ||
//       ticket.student?.name?.toLowerCase().includes(searchStr) ||
//       ticket.student?.email?.toLowerCase().includes(searchStr)
//     );
//   });

//   const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentTickets = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);

//   const openChat = async (ticket: any) => {
//     setSelectedTicket(ticket);
//     await axios.put(`${serverURL}/api/student-tickets/${ticket._id}/mark-read`, { role: "org_admin" });
//     fetchTickets();
//   };

//   const sendReply = async () => {
//     if (!reply.trim()) return;
//     await axios.post(`${serverURL}/api/student-tickets/${selectedTicket._id}/reply`, {
//       sender: "org_admin",
//       message: reply,
//     });
//     setReply("");
//     const res = await axios.get(`${serverURL}/api/student-tickets/org/${orgId}`);
//     const updated = res.data.tickets.find((t: any) => t._id === selectedTicket._id);
//     setSelectedTicket(updated);
//     setTickets(res.data.tickets);
//   };

//   const handleMarkResolved = async (ticketId: string) => {
//     await axios.put(`${serverURL}/api/student-tickets/${ticketId}/status`, { status: "Resolved" });
//     const res = await axios.get(`${serverURL}/api/student-tickets/org/${orgId}`);
//     const updated = res.data.tickets.find((t: any) => t._id === ticketId);
//     setSelectedTicket(updated);
//     setTickets(res.data.tickets);
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Resolved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
//       case "In Progress": return "bg-amber-100 text-amber-700 border-amber-200";
//       default: return "bg-blue-100 text-blue-700 border-blue-200";
//     }
//   };

//   return (
//     <div className="p-6 space-y-6 bg-slate-50/30 min-h-screen">
//       <div className="space-y-4">
//         <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
//           Student Support Center
//         </h1>
//         <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
//           Manage and respond to student requests.
//         </p>
//       </div>

//       <Card className="border-none shadow-sm">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
//           <CardTitle>Student Support Tickets</CardTitle>
//           <div className="relative w-72">
//             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search..."
//               className="pl-9 bg-white"
//               value={searchTerm}
//               onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
//             />
//           </div>
//         </CardHeader>

//        <CardContent>
//   <div className="rounded-md border bg-white overflow-hidden">
//     <Table>
//       <TableHeader className="bg-slate-50/50">
//         <TableRow>
//           <TableHead className="font-semibold">Subject</TableHead>
//           <TableHead className="font-semibold">Student</TableHead>
//           <TableHead className="font-semibold">Department</TableHead>
//           <TableHead className="font-semibold">Status</TableHead>
//           <TableHead className="font-semibold text-center">Unread</TableHead>
//           <TableHead className="text-right font-semibold pr-6">Action</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {currentTickets.length > 0 ? (
//           currentTickets.map((ticket) => {
//             // Count unread messages specifically for this ticket
//             const unreadCount = ticket.messages?.filter(
//               (m: any) => m.sender === "student" && !m.readByOrg
//             ).length || 0;

//             return (
//               <TableRow key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
//                 <TableCell className="font-medium text-slate-700">{ticket.subject}</TableCell>
//                 <TableCell>
//                   <div className="flex flex-col">
//                     <span className="font-semibold text-slate-900">{ticket.student?.name}</span>
//                     <span className="text-xs text-muted-foreground">{ticket.student?.email}</span>
//                   </div>
//                 </TableCell>
//                 <TableCell>
//                   <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal">
//                     {ticket.student?.department || "General"}
//                   </Badge>
//                 </TableCell>
//                 <TableCell>
//                   <Badge variant="outline" className={getStatusColor(ticket.status)}>
//                     {ticket.status}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="text-center">
//                   {unreadCount > 0 ? (
//                     <div className="flex justify-center">
//                       <span className="relative flex h-5 w-5">
//                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
//                         <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-600 text-[10px] text-white items-center justify-center font-bold">
//                           {unreadCount}
//                         </span>
//                       </span>
//                     </div>
//                   ) : (
//                     <Bell className="w-4 h-4 text-slate-200 mx-auto" />
//                   )}
//                 </TableCell>
//                 <TableCell className="text-right pr-6">
//                   <Button 
//                     size="sm" 
//                     variant="secondary" 
//                     className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
//                     onClick={() => openChat(ticket)}
//                   >
//                     View
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             );
//           })
//         ) : (
//           <TableRow>
//             <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
//               No tickets found.
//             </TableCell>
//           </TableRow>
//         )}
//       </TableBody>
//     </Table>
//   </div>

//   {/* 📄 PAGINATION CONTROLS */}
//   <div className="flex items-center justify-between px-2 py-4">
//     <p className="text-sm text-muted-foreground">
//       Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
//       <span className="font-medium">{Math.min(indexOfLastItem, filteredTickets.length)}</span> of{" "}
//       <span className="font-medium">{filteredTickets.length}</span> tickets
//     </p>
//     <div className="flex items-center space-x-2">
//       <Button
//         variant="outline"
//         size="sm"
//         onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//         disabled={currentPage === 1}
//       >
//         <ChevronLeft className="h-4 w-4" />
//       </Button>
//       <div className="text-sm font-medium">
//         Page {currentPage} of {totalPages || 1}
//       </div>
//       <Button
//         variant="outline"
//         size="sm"
//         onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//         disabled={currentPage === totalPages || totalPages === 0}
//       >
//         <ChevronRight className="h-4 w-4" />
//       </Button>
//     </div>
//   </div>
// </CardContent>
//       </Card>

//       {/* FIXED DIALOG: Integrated custom Close button to avoid overlap */}
//       <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
//         <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl [&>button]:hidden">
//           <DialogHeader className="p-4 border-b bg-white flex flex-row items-center justify-between space-y-0">
//             <DialogTitle className="text-lg font-bold text-slate-800 truncate pr-4">
//               {selectedTicket?.subject}
//             </DialogTitle>
            
//             <div className="flex items-center gap-2 shrink-0">
//               {/* Mark Resolved Button */}
//               {selectedTicket?.status !== "Resolved" && (
//                 <Button 
//                   size="sm" 
//                   variant="outline" 
//                   className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8 text-xs px-3"
//                   onClick={() => handleMarkResolved(selectedTicket._id)}
//                 >
//                   Mark Resolved
//                 </Button>
//               )}
              
//               {/* Separated Close (X) button with hover state */}
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8 rounded-full hover:bg-slate-100"
//                 onClick={() => setSelectedTicket(null)}
//               >
//                 <X className="h-4 w-4 text-slate-500" />
//               </Button>
//             </div>
//           </DialogHeader>

//           <div className="flex flex-col h-[480px] bg-slate-50">
//             <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
//               {selectedTicket?.messages?.map((msg: any, i: number) => (
//                 <div key={i} className={`flex ${msg.sender === "org_admin" ? "justify-end" : "justify-start"}`}>
//                   <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] shadow-sm ${
//                     msg.sender === "org_admin" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border text-slate-700 rounded-tl-none"
//                   }`}>
//                     {msg.message}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {selectedTicket?.status !== "Resolved" ? (
//               <div className="p-4 bg-white border-t flex gap-2">
//                 <Input
//                   value={reply}
//                   onChange={(e) => setReply(e.target.value)}
//                   placeholder="Write your response..."
//                   onKeyDown={(e) => e.key === "Enter" && sendReply()}
//                 />
//                 <Button onClick={sendReply} className="bg-blue-600">Send</Button>
//               </div>
//             ) : (
//               <div className="p-4 bg-slate-100 text-center text-sm text-slate-500 font-medium">
//                 This ticket has been resolved.
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default OrgStudentTickets;
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { serverURL } from "@/constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Bell, Search, ChevronLeft, ChevronRight, X } from "lucide-react";

const OrgStudentTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const scrollRef = useRef<HTMLDivElement>(null);
  const orgId = sessionStorage.getItem("orgId");

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/student-tickets/org/${orgId}`);
      setTickets(res.data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets", error);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      ticket.subject?.toLowerCase().includes(searchStr) ||
      ticket.student?.name?.toLowerCase().includes(searchStr) ||
      ticket._id?.toLowerCase().includes(searchStr)
    );
  });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);

  const openChat = async (ticket: any) => {
    setSelectedTicket(ticket);
    await axios.put(`${serverURL}/api/student-tickets/${ticket._id}/mark-read`, { role: "org_admin" });
    fetchTickets();
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    await axios.post(`${serverURL}/api/student-tickets/${selectedTicket._id}/reply`, {
      sender: "org_admin",
      message: reply,
    });
    setReply("");
    const res = await axios.get(`${serverURL}/api/student-tickets/org/${orgId}`);
    const updated = res.data.tickets.find((t: any) => t._id === selectedTicket._id);
    setSelectedTicket(updated);
    setTickets(res.data.tickets);
  };

  const handleMarkResolved = async (ticketId: string) => {
    await axios.put(`${serverURL}/api/student-tickets/${ticketId}/status`, { status: "Resolved" });
    const res = await axios.get(`${serverURL}/api/student-tickets/org/${orgId}`);
    const updated = res.data.tickets.find((t: any) => t._id === ticketId);
    setSelectedTicket(updated);
    setTickets(res.data.tickets);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "In Progress": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50/30 min-h-screen">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Student Support Center
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
          Manage and respond to student requests.
        </p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Student Support Tickets</CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID or Subject..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[120px] font-semibold">Ticket ID</TableHead>
                  <TableHead className="font-semibold">Issue Details</TableHead>
                  <TableHead className="font-semibold">Student</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  {/* Updated Header */}
                  <TableHead className="font-semibold">Date Created</TableHead> 
                  <TableHead className="font-semibold text-center">Unread</TableHead>
                  <TableHead className="text-right font-semibold pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTickets.length > 0 ? (
                  currentTickets.map((ticket) => {
                    const unreadCount = ticket.messages?.filter(
                      (m: any) => m.sender === "student" && !m.readByOrg
                    ).length || 0;

                    return (
                      <TableRow key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{ticket._id.slice(-6).toUpperCase()}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 line-clamp-1">{ticket.subject}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1 italic">
                              {ticket.messages?.[0]?.message || "No description"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{ticket.student?.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              {ticket.student?.department || "General"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className={`${getStatusColor(ticket.status)} font-medium border-none`}>
                            {ticket.status}
                          </Badge>
                        </TableCell>

                        {/* Updated Date Column with Year */}
                        <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                          {new Date(ticket.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>

                        <TableCell className="text-center">
                          {unreadCount > 0 ? (
                            <div className="flex justify-center">
                              <span className="relative flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-600 text-[10px] text-white items-center justify-center font-bold">
                                  {unreadCount}
                                </span>
                              </span>
                            </div>
                          ) : (
                            <Bell className="w-4 h-4 text-slate-200 mx-auto" />
                          )}
                        </TableCell>

                        <TableCell className="text-right pr-6">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            onClick={() => openChat(ticket)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                      No support tickets found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-2 py-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">{Math.min(indexOfLastItem, filteredTickets.length)}</span> of{" "}
              <span className="font-medium">{filteredTickets.length}</span> tickets
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl [&>button]:hidden">
          <DialogHeader className="p-4 border-b bg-white flex flex-row items-center justify-between space-y-0">
            <div className="flex flex-col truncate">
              <DialogTitle className="text-lg font-bold text-slate-800 truncate pr-4">
                {selectedTicket?.subject}
              </DialogTitle>
              <span className="text-xs text-muted-foreground">From: {selectedTicket?.student?.name}</span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {selectedTicket?.status !== "Resolved" && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8 text-xs px-3"
                  onClick={() => handleMarkResolved(selectedTicket._id)}
                >
                  Mark Resolved
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-slate-100"
                onClick={() => setSelectedTicket(null)}
              >
                <X className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex flex-col h-[480px] bg-slate-50">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedTicket?.messages?.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.sender === "org_admin" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] shadow-sm ${
                    msg.sender === "org_admin" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border text-slate-700 rounded-tl-none"
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>

            {selectedTicket?.status !== "Resolved" ? (
              <div className="p-4 bg-white border-t flex gap-2">
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write your response..."
                  onKeyDown={(e) => e.key === "Enter" && sendReply()}
                />
                <Button onClick={sendReply} className="bg-blue-600">Send</Button>
              </div>
            ) : (
              <div className="p-4 bg-slate-100 text-center text-sm text-slate-500 font-medium">
                This ticket has been resolved.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrgStudentTickets;