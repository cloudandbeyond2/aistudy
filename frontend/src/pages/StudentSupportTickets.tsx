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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  PlusCircle, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  X,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Bot
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StudentSupportTickets = () => {
  const { toast } = useToast();

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [reply, setReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  
  const itemsPerPage = 10;

  const scrollRef = useRef<HTMLDivElement>(null);
  const studentId = sessionStorage.getItem("uid");
  const orgId = sessionStorage.getItem("orgId");

  useEffect(() => {
    if (studentId) fetchTickets();
    
    // Detect view mode based on screen size
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("cards");
      } else {
        setViewMode("table");
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [studentId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/student-tickets/student/${studentId}`);
      setTickets(res.data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets", error);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const search = searchTerm.toLowerCase();

    const ticketId = ticket._id?.slice(-6).toLowerCase();

    const matchesSearch =
      ticket.subject?.toLowerCase().includes(search) ||
      ticket.status?.toLowerCase().includes(search) ||
      ticketId.includes(search);

    const matchesStatus =
      statusFilter === "All" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const currentTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openChat = async (ticket: any) => {
    setSelectedTicket(ticket);
    try {
      await axios.put(`${serverURL}/api/student-tickets/${ticket._id}/mark-read`, { role: "student" });
      fetchTickets();
    } catch (err) {
      console.error("Mark read error", err);
    }
  };

  const createTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      toast({ title: "Subject & Description required", variant: "destructive" });
      return;
    }

    try {
      await axios.post(`${serverURL}/api/student-tickets`, {
        subject,
        message: description,
        studentId,
        orgId,
      });

      toast({ title: "Ticket Created Successfully" });
      setSubject("");
      setDescription("");
      setOpenCreate(false);
      fetchTickets();
    } catch (error) {
      toast({ title: "Failed to create ticket", variant: "destructive" });
      console.error(error);
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedTicket?._id) return;

    try {
      await axios.post(
        `${serverURL}/api/student-tickets/${selectedTicket._id}/reply`,
        {
          sender: "student",
          message: reply,
        }
      );

      setReply("");
      await fetchTickets();

    } catch (err) {
      console.error("Reply error", err);
    }
  };

  const askAI = async () => {
    if (!selectedTicket?._id || aiLoading) return;

    const messageToAsk = reply.trim();

    try {
      setAiLoading(true);

      // If user typed something, save it into the ticket thread first.
      if (messageToAsk) {
        await axios.post(`${serverURL}/api/student-tickets/${selectedTicket._id}/reply`, {
          sender: "student",
          message: messageToAsk,
        });
        setReply("");
      }

      await axios.post(`${serverURL}/api/student-tickets/${selectedTicket._id}/ai-reply`, {
        message: messageToAsk || undefined,
      });

      const updatedTickets = await axios.get(`${serverURL}/api/student-tickets/student/${studentId}`);
      setTickets(updatedTickets.data.tickets || []);
      const newSelected = (updatedTickets.data.tickets || []).find((t: any) => t._id === selectedTicket._id);
      setSelectedTicket(newSelected || null);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to get AI response";
      toast({ title: "AI Assistant", description: msg, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "In Progress":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "In Progress":
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  // Mobile Card Component
  const TicketCard = ({ ticket }: { ticket: any }) => {
    const unreadCount = ticket.messages?.filter(
      (m: any) => m.sender === "org_admin" && !m.readByStudent
    ).length || 0;

    const ticketId = `#${ticket._id.slice(-6).toUpperCase()}`;

    return (
      <div className="bg-background border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-gray-500">
                {ticketId}
              </span>
              {unreadCount > 0 && (
                <Badge className="bg-blue-600 text-white text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-base mb-2 line-clamp-2">
              {ticket.subject}
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge
                variant="outline"
                className={`${getStatusColor(ticket.status)} flex items-center gap-1 text-xs`}
              >
                {getStatusIcon(ticket.status)}
                <span>{ticket.status}</span>
              </Badge>
              <span className="text-xs text-gray-500">
                {new Date(ticket.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => openChat(ticket)}
          className="w-full mt-3"
        >
          View Chat
        </Button>
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-background min-h-screen max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Support Center
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
            Send your issues to your organization admin and track their progress in real-time.
          </p>
        </div>

        <Button 
          onClick={() => setOpenCreate(true)} 
          className="bg-blue-600 hover:bg-blue-700 shadow-md w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between gap-4 pb-4">
          <CardTitle className="text-lg sm:text-xl">
            My Support Tickets
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredTickets.length})
            </span>
          </CardTitle>

          {/* Desktop & Laptop View (lg and above) */}
          <div className="hidden lg:flex gap-3">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ID, subject or status..."
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <select
              className="border rounded-md px-3 py-2 text-sm bg-background text-foreground"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setCurrentPage(1);
              }}
            >
              Clear
            </Button>
          </div>

          {/* Tablet View (md to lg) */}
          <div className="hidden md:flex lg:hidden gap-3">
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 text-sm bg-background"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <select
              className="border rounded-md px-3 py-2 text-sm bg-background text-foreground"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setCurrentPage(1);
              }}
            >
              Clear
            </Button>
          </div>

          {/* Mobile View (below md) */}
          <div className="flex flex-col gap-2 md:hidden">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-9 text-sm bg-background"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="shrink-0 px-3"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Mobile Filter Dropdown */}
            {showMobileFilters && (
              <div className="flex flex-col gap-2 p-3 bg-muted rounded-lg animate-in slide-in-from-top-2">
                <label className="text-xs font-medium text-muted-foreground">Filter by Status</label>
                <select
                  className="border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                
                <div className="flex gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("All");
                      setShowMobileFilters(false);
                      setCurrentPage(1);
                    }}
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Table View - Desktop and Tablet */}
          {viewMode === "table" && (
            <>
              <div className="rounded-md border bg-background overflow-x-auto">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="font-semibold w-[100px]">Ticket ID</TableHead>
                        <TableHead className="font-semibold min-w-[200px]">Subject</TableHead>
                        <TableHead className="font-semibold w-[120px]">Status</TableHead>
                        <TableHead className="font-semibold w-[120px]">Date</TableHead>
                        <TableHead className="font-semibold w-[100px] text-center">Unread</TableHead>
                        <TableHead className="text-right font-semibold w-[100px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {currentTickets.length > 0 ? (
                        currentTickets.map((ticket) => {
                          const unreadCount =
                            ticket.messages?.filter(
                              (m: any) => m.sender === "org_admin" && !m.readByStudent
                            ).length || 0;

                          const ticketId = `#${ticket._id.slice(-6).toUpperCase()}`;

                          return (
                            <TableRow key={ticket._id} className="hover:bg-muted/40">
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {ticketId}
                              </TableCell>

                              <TableCell className="font-medium">
                                <div className="max-w-[300px] truncate">
                                  {ticket.subject}
                                </div>
                              </TableCell>

                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={`${getStatusColor(ticket.status)} flex items-center gap-1 w-fit font-medium`}
                                >
                                  {getStatusIcon(ticket.status)}
                                  <span>{ticket.status}</span>
                                </Badge>
                              </TableCell>

                              <TableCell className="whitespace-nowrap text-sm">
                                {new Date(ticket.createdAt).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </TableCell>

                              <TableCell className="text-center">
                                {unreadCount > 0 ? (
                                  <Badge className="bg-blue-600 text-white animate-pulse">
                                    {unreadCount}
                                  </Badge>
                                ) : (
                                  <Bell className="w-4 h-4 text-slate-300 mx-auto" />
                                )}
                              </TableCell>

                              <TableCell className="text-right">
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  onClick={() => openChat(ticket)}
                                  className="hover:bg-blue-600 hover:text-white transition-colors"
                                >
                                  View Chat
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                              <MessageSquare className="w-12 h-12 text-gray-400" />
                              <p>No support tickets found.</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOpenCreate(true)}
                                className="mt-2"
                              >
                                Create your first ticket
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination for Desktop/Tablet */}
              {filteredTickets.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4 mt-4 border-t">
                  <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of{" "}
                    {filteredTickets.length} tickets
                  </div>
                  <div className="flex items-center space-x-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 sm:h-9 sm:w-auto"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Previous</span>
                    </Button>

                    <span className="text-xs sm:text-sm whitespace-nowrap">
                      Page {currentPage} of {totalPages || 1}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="h-8 w-8 sm:h-9 sm:w-auto"
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Card View - Mobile */}
          {viewMode === "cards" && (
            <>
              <div className="grid grid-cols-1 gap-3">
                {currentTickets.length > 0 ? (
                  currentTickets.map((ticket) => (
                    <TicketCard key={ticket._id} ticket={ticket} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <MessageSquare className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-500">No support tickets found.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOpenCreate(true)}
                        className="mt-2"
                      >
                        Create your first ticket
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination for Mobile */}
              {filteredTickets.length > 0 && (
                <div className="flex flex-col items-center gap-3 py-4 mt-4 border-t">
                  <div className="text-xs text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of{" "}
                    {filteredTickets.length} tickets
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="text-xs">
                      Page {currentPage} of {totalPages || 1}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="h-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* CHAT MODAL */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[550px] w-[95vw] max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl [&>button]:hidden">
          <DialogHeader className="p-3 sm:p-4 border-b bg-background">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs sm:text-sm">
                  #{selectedTicket?._id?.slice(-6).toUpperCase()}
                </span>
                <span className="truncate max-w-[200px] sm:max-w-none">
                  {selectedTicket?.subject}
                </span>
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(selectedTicket?.status)} flex items-center gap-1 text-xs`}
                >
                  {getStatusIcon(selectedTicket?.status)}
                  <span>{selectedTicket?.status}</span>
                </Badge>
              </DialogTitle>
              
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 transition absolute right-2 top-2 sm:right-4 sm:top-4"
              >
                <X size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="flex flex-col h-[50vh] sm:h-[480px] bg-muted/40">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {selectedTicket?.messages?.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-[13px] sm:text-[14px] shadow-sm ${
                    msg.sender === "student"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : msg.sender === "ai"
                      ? "bg-violet-600/10 text-violet-900 dark:text-violet-200 border border-violet-500/20 rounded-tl-none"
                      : "bg-background border text-foreground rounded-tl-none"
                  }`}>
                    <p className="break-words">{msg.message}</p>
                    <div className={`text-[9px] sm:text-[10px] mt-1 ${
                      msg.sender === "student" ? "text-blue-100" : msg.sender === "ai" ? "text-violet-500" : "text-gray-500"
                    }`}>
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedTicket?.status !== "Resolved" ? (
              <div className="p-3 sm:p-4 bg-background border-t flex gap-2">
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                  className="text-sm"
                />
                <Button onClick={askAI} variant="outline" disabled={aiLoading} className="shrink-0">
                  <Bot className="w-4 h-4 mr-2" />
                  {aiLoading ? "Thinking..." : "Ask AI"}
                </Button>
                <Button onClick={sendReply} className="bg-blue-600 hover:bg-blue-700 shrink-0">
                  Send
                </Button>
              </div>
            ) : (
              <div className="p-3 sm:p-4 bg-emerald-500/10 text-center text-xs sm:text-sm text-emerald-400 font-medium border-t border-emerald-500/20">
                This ticket has been marked as Resolved.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* CREATE TICKET MODAL */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-[500px] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Create New Ticket
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Please provide as much detail as possible to help us assist you better.
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Subject</label>
              <Input
                placeholder="e.g., Assignment visibility issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Detailed Description</label>
              <Textarea
                placeholder="Briefly describe the problem..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] sm:min-h-[120px] text-sm"
              />
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setOpenCreate(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={createTicket} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              Submit Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentSupportTickets;
