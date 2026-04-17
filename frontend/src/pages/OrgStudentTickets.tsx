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
  const itemsPerPage = 10;

  const [statusFilter, setStatusFilter] = useState("All");

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
    const search = searchTerm.toLowerCase().replace("#", "");
    const ticketId = ticket._id.slice(-6).toLowerCase();
    const subject = ticket.subject?.toLowerCase() || "";
    const memberName = ticket.student?.name?.toLowerCase() || "";
    const role = ticket.student?.role?.toLowerCase() || "";

    const matchesSearch =
      subject.includes(search) ||
      memberName.includes(search) ||
      role.includes(search) ||
      ticketId.includes(search);

    const matchesStatus =
      statusFilter === "All" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
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

  try {
    await axios.post(
      `${serverURL}/api/student-tickets/${selectedTicket._id}/reply`,
      {
        sender: "org_admin",
        message: reply,
      }
    );

    setReply("");

    // refresh tickets
    await fetchTickets();

    // AUTO CLOSE CHAT
    setSelectedTicket(null);

  } catch (error) {
    console.error("Error sending reply", error);
  }
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
    <div className="space-y-6 sm:space-y-8 animate-fade-in px-2 sm:px-2 lg:px-4 max-w-[1400px] mx-auto relative pt-0 lg:pt-[65px]">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Member Support Center
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
          Manage and respond to student and staff requests.
        </p>
      </div>

      <Card className="border-none shadow-sm">
       <CardHeader className="pb-4">
  <div className="flex flex-col gap-4">
    
    {/* Header with optional badge */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <CardTitle className="text-xl sm:text-2xl font-bold">
        Student Support Tickets
      </CardTitle>
      <div className="text-xs text-muted-foreground sm:hidden">
        {searchTerm || statusFilter !== 'All' ? 'Filters active' : 'All tickets'}
      </div>
    </div>
    
    {/* Filters container */}
    <div className="flex flex-col md:flex-row gap-3">
      
      {/* SEARCH - expands on tablet+ */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by ID or Subject..."
          className="pl-9 bg-background w-full"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>
      
      {/* STATUS FILTER */}
      <select
        className="border rounded-md px-3 py-2 text-sm bg-background w-full md:w-40"
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setCurrentPage(1);
        }}
      >
        <option value="All">📋 All Status</option>
        <option value="Open">🟢 Open</option>
        <option value="In Progress">🟡 In Progress</option>
        <option value="Resolved">✅ Resolved</option>
      </select>
      
      {/* CLEAR BUTTON with icon for mobile */}
      <Button
        variant="outline"
        onClick={() => {
          setSearchTerm("");
          setStatusFilter("All");
          setCurrentPage(1);
        }}
        className="gap-2 w-full md:w-auto"
      >
        <span className="hidden sm:inline">Clear</span>
        <span className="sm:hidden">✕ Clear</span>
      </Button>
      
    </div>
    
    {/* Active filters indicator (mobile) */}
    {(searchTerm || statusFilter !== 'All') && (
      <div className="flex flex-wrap gap-2 sm:hidden">
        {searchTerm && (
          <Badge variant="secondary" className="text-xs">
            Search: {searchTerm}
            <button onClick={() => setSearchTerm('')} className="ml-1">✕</button>
          </Badge>
        )}
        {statusFilter !== 'All' && (
          <Badge variant="secondary" className="text-xs">
            Status: {statusFilter}
            <button onClick={() => setStatusFilter('All')} className="ml-1">✕</button>
          </Badge>
        )}
      </div>
    )}
    
  </div>
</CardHeader>

        <CardContent>
          <div className="rounded-md border bg-background overflow-hidden">
            <Table>
            <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[120px] font-semibold">Ticket ID</TableHead>
                  <TableHead className="font-semibold">Issue Details</TableHead>
                  <TableHead className="font-semibold">Member</TableHead>
                  <TableHead className="font-semibold text-center">Role</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
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
                      <TableRow key={ticket._id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{ticket._id.slice(-6).toUpperCase()}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                           <span className="font-medium text-foreground line-clamp-1">{ticket.subject}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1 italic">
                              {ticket.messages?.[0]?.message || "No description"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{ticket.student?.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              {ticket.student?.department || ticket.department || "General"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                           <Badge variant="outline" className="capitalize">
                             {ticket.student?.role || "Student"}
                           </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className={`${getStatusColor(ticket.status)} font-medium border-none`}>
                            {ticket.status}
                          </Badge>
                        </TableCell>

                        {/* Updated Date Column with Year */}
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
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
                            className="bg-gradient-to-r from-[#11405f] to-[#11a5e4] text-white hover:opacity-90   transition-colors"
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
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground italic">
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
          <DialogHeader className="p-4 border-b bg-background flex flex-row items-center justify-between space-y-0">
            <div className="flex flex-col truncate">
              <DialogTitle className="text-lg font-bold text-foreground truncate pr-4">
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
               className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={() => setSelectedTicket(null)}
              >
                <X className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
          </DialogHeader>

     <div className="flex flex-col h-[480px] bg-muted/40">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedTicket?.messages?.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.sender === "org_admin" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] shadow-sm ${
                    msg.sender === "org_admin"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : msg.sender === "ai"
                      ? "bg-violet-600/10 text-violet-900 dark:text-violet-200 border border-violet-500/20 rounded-tl-none"
                      : "bg-background border text-foreground rounded-tl-none"
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>

            {selectedTicket?.status !== "Resolved" ? (
           <div className="p-4 bg-background border-t flex gap-2">
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write your response..."
               onKeyDown={(e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendReply();
  }
}}
                />
                <Button onClick={sendReply} className="bg-blue-600">Send</Button>
              </div>
            ) : (
              <div className="p-4 bg-muted text-muted-foreground text-center text-sm font-medium">
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
