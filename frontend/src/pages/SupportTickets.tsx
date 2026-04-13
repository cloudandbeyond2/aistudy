import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { serverURL } from "@/constants";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { Search, ChevronLeft, ChevronRight, PlusCircle, X, Filter, Loader2 } from "lucide-react";

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "resolved":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "in progress":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "open":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default:
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  }
};

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState("");

  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState("All");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ── Loading states ────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);   // Create Ticket button
  const [sending, setSending] = useState(false);         // Send Reply button

  const itemsPerPage = 10;
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    const userId = sessionStorage.getItem("uid");
    if (!userId) return;
    const res = await axios.get(`${serverURL}/api/tickets/user/${userId}`);
    setTickets(res.data.tickets || []);
  };

  const openChat = async (ticket) => {
    setSelectedTicket(ticket);
    await axios.put(`${serverURL}/api/tickets/${ticket._id}/mark-read`, {
      role: "user",
    });
    fetchTickets();
  };

  // ── Send Reply + Notify Admin ─────────────────────────────────────────────────
  const sendReply = async () => {
    if (!reply.trim() || !selectedTicket) return;

    const userEmail = sessionStorage.getItem("email");
    const userName  = sessionStorage.getItem("name") || "User";

    setSending(true); // ← start spinner
    try {
      await axios.post(`${serverURL}/api/tickets/${selectedTicket._id}/reply`, {
        sender:  "user",
        message: reply,
      });

      await axios.post(`${serverURL}/api/notify-admin`, {
        fromEmail: userEmail,
        fromName:  userName,
        ticketId:  selectedTicket._id,
        subject:   selectedTicket.subject,
        message:   reply,
        type:      "reply",
      });

      Swal.fire({
        icon:              "success",
        title:             "Reply Sent!",
        text:              "Your message has been sent and admin has been notified.",
        confirmButtonText: "OK",
        confirmButtonColor: "#2563eb",
        timer:             3000,
        timerProgressBar:  true,
      });

      setReply("");
      await fetchTickets();
      setSelectedTicket(null);

    } catch (error) {
      console.error("Send reply error:", error);
      Swal.fire({
        icon:              "error",
        title:             "Failed to Send",
        text:              "Something went wrong. Please try again.",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSending(false); // ← stop spinner always
    }
  };

  const closeTicket = async (ticketId) => {
    try {
      await axios.put(`${serverURL}/api/tickets/${ticketId}/status`, {
        status: "Resolved",
      });
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error("Error closing ticket:", error);
    }
  };

  // ── Create Ticket + Notify Admin ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!subject || !description) return;

    const userEmail = sessionStorage.getItem("email");
    const userName  = sessionStorage.getItem("name") || "User";
    const userId    = sessionStorage.getItem("uid");
    const userType  = sessionStorage.getItem("type");

    setSubmitting(true); // ← start spinner
    try {
      const res = await axios.post(`${serverURL}/api/tickets`, {
        subject,
        description,
        userId,
        userType,
      });

      const newTicketId = res.data.ticket?._id || res.data._id;

      await axios.post(`${serverURL}/api/notify-admin`, {
        fromEmail: userEmail,
        fromName:  userName,
        ticketId:  newTicketId,
        subject,
        message:   description,
        type:      "new",
      });

      Swal.fire({
        icon:              "success",
        title:             "Ticket Submitted!",
        text:              "Your ticket has been created. Our team will get back to you shortly.",
        confirmButtonText: "OK",
        confirmButtonColor: "#2563eb",
        timer:             3000,
        timerProgressBar:  true,
      });

      setSubject("");
      setDescription("");
      setOpen(false);
      fetchTickets();

    } catch (error) {
      console.error("Create ticket error:", error);
      Swal.fire({
        icon:              "error",
        title:             "Failed to Submit",
        text:              "Something went wrong. Please try again.",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSubmitting(false); // ← stop spinner always
    }
  };

  /* SEARCH FILTER */
  const filteredTickets = tickets.filter((ticket) => {
    const search   = searchTerm.toLowerCase().replace("#", "");
    const ticketId = ticket._id.slice(-6).toLowerCase();
    const subject  = ticket.subject?.toLowerCase() || "";

    const matchesSearch = subject.includes(search) || ticketId.includes(search);
    const matchesStatus = statusFilter === "All" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages   = Math.ceil(filteredTickets.length / itemsPerPage);
  const currentItems = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in px-2 sm:px-2 lg:px-4 max-w-[1400px] mx-auto relative pt-0 lg:pt-[65px]">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
            Organization Support Center
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl">
            Submit and manage support requests related to billing, system issues,
            feature requests, or account access.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-sm px-3 sm:px-4 py-2 w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* TICKETS TABLE */}
      <Card>
        <CardHeader className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="text-base sm:text-lg md:text-xl">
            My Support Tickets
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredTickets.length})
            </span>
          </CardTitle>

          {/* Desktop */}
          <div className="hidden lg:flex gap-3">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search Ticket ID or Subject..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-background text-foreground"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <Button variant="outline" size="sm"
              onClick={() => { setSearchTerm(""); setStatusFilter("All"); }}
            >
              Clear
            </Button>
          </div>

          {/* Tablet */}
          <div className="hidden md:flex lg:hidden gap-3">
            <div className="relative w-56">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-background text-foreground"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <Button variant="outline" size="sm"
              onClick={() => { setSearchTerm(""); setStatusFilter("All"); }}
            >
              Clear
            </Button>
          </div>

          {/* Mobile */}
          <div className="flex flex-col gap-2 md:hidden">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-8 text-sm"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <Button variant="outline" size="sm"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="shrink-0 px-3"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {showMobileFilters && (
              <div className="flex flex-col gap-2 p-3 bg-muted rounded-lg">
                <label className="text-xs font-medium text-muted-foreground">
                  Filter by Status
                </label>
                <select
                  className="border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="All">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <div className="flex gap-2 mt-1">
                  <Button variant="outline" size="sm"
                    onClick={() => { setSearchTerm(""); setStatusFilter("All"); setShowMobileFilters(false); }}
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                  <Button size="sm"
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
          <div className="relative w-full overflow-x-auto">
            <div className="min-w-[800px] lg:min-w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Ticket</TableHead>
                    <TableHead className="w-[100px]">Subject</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead className="w-[100px]">Updates</TableHead>
                    <TableHead className="w-[100px] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((ticket) => {
                      const unreadCount =
                        ticket.messages?.filter(
                          (m) => m.sender === "admin" && !m.readByUser
                        ).length || 0;

                      return (
                        <TableRow key={ticket._id}>
                          <TableCell className="font-mono text-xs text-gray-500">
                            #{ticket._id.slice(-6).toUpperCase()}
                          </TableCell>
                          <TableCell className="font-medium">{ticket.subject}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(ticket.status)}>
                              {ticket.status || "Open"}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {new Date(ticket.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            {unreadCount > 0 ? (
                              <Badge className="bg-blue-600 text-white">🔔 {unreadCount}</Badge>
                            ) : (
                              <span className="opacity-30">🔔</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => openChat(ticket)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No tickets found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* PAGINATION */}
          {filteredTickets.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4 mt-4">
              <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of{" "}
                {filteredTickets.length} tickets
              </div>
              <div className="flex items-center space-x-2 order-1 sm:order-2">
                <Button variant="outline" size="sm"
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
                <Button variant="outline" size="sm"
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
        </CardContent>
      </Card>

      {/* CHAT MODAL */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[550px] w-[95vw] max-h-[90vh] p-0 overflow-hidden [&>button]:hidden">
          <DialogHeader className="p-3 sm:p-4 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-base sm:text-lg font-semibold break-words flex-1">
                  {selectedTicket?.subject}
                </DialogTitle>
                <Badge variant="outline" className={getStatusColor(selectedTicket?.status)}>
                  {selectedTicket?.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {selectedTicket?.status !== "Resolved" && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm"
                    onClick={() => closeTicket(selectedTicket._id)}
                  >
                    Mark Resolved
                  </Button>
                )}
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition"
                >
                  <X size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col h-[50vh] sm:h-[450px] bg-muted">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {selectedTicket?.messages?.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm ${
                      msg.sender === "user" ? "bg-blue-600 text-white" : "bg-background border"
                    }`}
                  >
                    <p className="break-words">{msg.message}</p>
                    <div className="text-[9px] sm:text-[10px] opacity-60 mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── SEND BUTTON with spinner ── */}
            <div className="p-3 sm:p-4 bg-background border-t flex gap-2">
              <Input
                className="bg-background text-sm"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !sending) { e.preventDefault(); sendReply(); }
                }}
              />
              <Button
                onClick={sendReply}
                disabled={sending}
                className="bg-blue-600 shrink-0 min-w-[72px]"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    Sending
                  </>
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CREATE TICKET */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Create New Support Ticket
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-sm sm:text-base">Subject</Label>
              <Input
                placeholder="Brief title of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={submitting}
                className="text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm sm:text-base">Description</Label>
              <Textarea
                placeholder="Tell us more about your issue..."
                className="min-h-[100px] sm:min-h-[120px] text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            {/* ── SUBMIT BUTTON with spinner ── */}
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto min-w-[130px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Ticket"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default SupportTickets;
