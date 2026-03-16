import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { serverURL } from "@/constants";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { Search, ChevronLeft, ChevronRight, PlusCircle, X } from "lucide-react";
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
const sendReply = async () => {
  if (!reply.trim() || !selectedTicket) return;

  try {
    await axios.post(`${serverURL}/api/tickets/${selectedTicket._id}/reply`, {
      sender: "user",
      message: reply,
    });

    setReply("");

    // refresh ticket list
    await fetchTickets();

    // AUTO CLOSE CHAT
    setSelectedTicket(null);

  } catch (error) {
    console.error("Send reply error:", error);
  }
};
const closeTicket = async (ticketId) => {
  try {
    await axios.put(`${serverURL}/api/tickets/${ticketId}/status`, {
      status: "Resolved",
    });

    // close modal immediately
    setSelectedTicket(null);

    // refresh ticket list
    fetchTickets();

  } catch (error) {
    console.error("Error closing ticket:", error);
  }
};
  const handleSubmit = async () => {
    if (!subject || !description) return;

    await axios.post(`${serverURL}/api/tickets`, {
      subject,
      description,
      userId: sessionStorage.getItem("uid"),
      userType: sessionStorage.getItem("type"),
    });

    setSubject("");
    setDescription("");
    setOpen(false);

    fetchTickets();
  };

  /* SEARCH FILTER */
  const filteredTickets = tickets.filter((ticket) => {

  const search = searchTerm.toLowerCase().replace("#", "");

  const ticketId = ticket._id.slice(-6).toLowerCase();

  const subject = ticket.subject?.toLowerCase() || "";

  const matchesSearch =
    subject.includes(search) ||
    ticketId.includes(search);

  const matchesStatus =
    statusFilter === "All" || ticket.status === statusFilter;

  return matchesSearch && matchesStatus;

});

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const currentItems = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b pb-4">
       <div className="space-y-1">
  <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
    Organization Support Center
  </h1>

  <p className="text-sm md:text-base text-muted-foreground max-w-xl">
    Submit and manage support requests related to billing, system issues,
    feature requests, or account access.
  </p>
</div>
<Button
  onClick={() => setOpen(true)}
  className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2"
>
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* TICKETS TABLE */}
      <Card>
    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>My Support Tickets</CardTitle>
<div className="flex gap-3">

  {/* SEARCH */}
  <div className="relative w-64">
    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
    <Input
      placeholder="Search Ticket ID or Subject..."
      className="pl-8"
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      }}
    />
  </div>

  {/* STATUS FILTER */}
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

  {/* CLEAR FILTER */}
  <Button
    variant="outline"
    size="sm"
    onClick={() => {
      setSearchTerm("");
      setStatusFilter("All");
    }}
  >
    Clear
  </Button>

</div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Updates</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentItems.map((ticket) => {
                const unreadCount =
                  ticket.messages?.filter(
                    (m) => m.sender === "admin" && !m.readByUser
                  ).length || 0;

                return (
                  <TableRow key={ticket._id}>
                    <TableCell className="font-mono text-xs text-gray-500">
                      #{ticket._id.slice(-6).toUpperCase()}
                    </TableCell>

                    <TableCell className="font-medium">
                      {ticket.subject}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(ticket.status)}
                      >
                        {ticket.status || "Open"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                    {new Date(ticket.createdAt).toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})}
                    </TableCell>

                    <TableCell>
                      {unreadCount > 0 ? (
                        <Badge className="bg-blue-600 text-white">
                          🔔 {unreadCount}
                        </Badge>
                      ) : (
                        <span className="opacity-30">🔔</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openChat(ticket)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* PAGINATION */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages)
                )
              }
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CHAT MODAL */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
    <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden [&>button]:hidden">
  <DialogHeader className="p-4 pr-4 border-b">
  <div className="flex items-center justify-between">

    {/* LEFT SIDE */}
    <div className="flex items-center gap-3">
      <DialogTitle className="text-lg font-semibold">
        {selectedTicket?.subject}
      </DialogTitle>

      <Badge
        variant="outline"
        className={getStatusColor(selectedTicket?.status)}
      >
        {selectedTicket?.status}
      </Badge>
    </div>

    {/* RIGHT SIDE */}
   <div className="flex items-center gap-3">

  {selectedTicket?.status !== "Resolved" && (
    <Button
      size="sm"
      className="bg-emerald-600 hover:bg-emerald-700 text-white"
      onClick={() => closeTicket(selectedTicket._id)}
    >
      Mark Resolved
    </Button>
  )}

  {/* Custom Close Button */}
  <button
    onClick={() => setSelectedTicket(null)}
    className="w-8 h-8 flex items-center justify-center rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition"
  >
    <X size={16} />
  </button>

</div>

  </div>
</DialogHeader>

          <div className="flex flex-col h-[450px] bg-muted">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {selectedTicket?.messages?.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white"
                  : "bg-background border"
                    }`}
                  >
                    {msg.message}

                    <div className="text-[10px] opacity-60 mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
<div className="p-4 bg-background border-t flex gap-2">
            <Input
  className="bg-background"
  value={reply}
  onChange={(e) => setReply(e.target.value)}
  placeholder="Type a message..."
onKeyDown={(e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendReply();
  }
}}
/>

              <Button onClick={sendReply} className="bg-blue-600">
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CREATE TICKET */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Support Ticket</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Subject</Label>
              <Input
                placeholder="Brief title of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Tell us more about your issue..."
                className="min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTickets;