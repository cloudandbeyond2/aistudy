import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { serverURL } from "@/constants";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "resolved":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "in progress":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "open":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-amber-100 text-amber-700 border-amber-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-700 border-red-200";
    case "normal":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const AdminTickets = () => {

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState("all");
const [priorityFilter, setPriorityFilter] = useState("all");
const [unreadFilter, setUnreadFilter] = useState("all");

  const itemsPerPage = 8;

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/tickets`);
      setTickets(res.data.tickets || []);
    } catch (error) {
      console.error(error);
    }
  };

  const openChat = async (ticket: any) => {
    setSelectedTicket(ticket);

    await axios.put(`${serverURL}/api/tickets/${ticket._id}/mark-read`, {
      role: "admin",
    });

    fetchTickets();
  };

  const sendReply = async () => {
  if (!reply || !selectedTicket) return;

  await axios.post(`${serverURL}/api/tickets/${selectedTicket._id}/reply`, {
    sender: "admin",
    message: reply,
  });

  setReply("");

  // refresh ticket list
  await fetchTickets();

  // close chat modal automatically
  setSelectedTicket(null);
};

  const getUnreadCount = (ticket: any) => {
    return ticket.messages?.filter(
      (m: any) => m.sender === "user" && !m.readByAdmin
    ).length || 0;
  };
const filteredTickets = tickets.filter((ticket) => {

  const search = searchTerm.toLowerCase().replace("#","");

  // ticket id displayed in UI
  const ticketId = ticket._id?.slice(-6).toLowerCase();

  const subject = ticket.subject?.toLowerCase() || "";

  const userName =
    ticket.userDisplay?.toLowerCase() ||
    ticket.userId?.mName?.toLowerCase() ||
    "";

  const matchesSearch =
    subject.includes(search) ||
    ticketId.includes(search) ||
    userName.includes(search);

  const matchesStatus =
    statusFilter === "all" ||
    ticket.status?.toLowerCase() === statusFilter.toLowerCase();

  const matchesPriority =
    priorityFilter === "all" ||
    ticket.priority?.toLowerCase() === priorityFilter.toLowerCase();

  const unreadCount = getUnreadCount(ticket);

  const matchesUnread =
    unreadFilter === "all" ||
    (unreadFilter === "unread" && unreadCount > 0) ||
    (unreadFilter === "read" && unreadCount === 0);

  return matchesSearch && matchesStatus && matchesPriority && matchesUnread;

});
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);

  
  const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day ago`;
  };

  return (
    <div className="p-6 space-y-6">

      <div className="mb-8">
  <h1 className="text-4xl font-bold">Tickets</h1>
  <p className="text-muted-foreground mt-1">
    Manage and respond to support tickets submitted by paid users and organization administrators.
  </p>
</div>

      {/* SEARCH */}
      <div className="flex flex-wrap gap-3 items-center">

  {/* Search */}
  <div className="relative w-64">
   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Search..."
      className="pl-9"
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      }}
    />
  </div>

  {/* Status Filter */}
  <select
     className="border rounded-md px-3 py-2 text-sm bg-background text-foreground"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="all">All Status</option>
    <option value="Open">Open</option>
    <option value="In Progress">In Progress</option>
    <option value="Resolved">Resolved</option>
  </select>

  {/* Priority Filter */}
  <select
     className="border rounded-md px-3 py-2 text-sm bg-background text-foreground"
    value={priorityFilter}
    onChange={(e) => setPriorityFilter(e.target.value)}
  >
    <option value="all">All Priority</option>
    <option value="High">High</option>
    <option value="Normal">Normal</option>
  </select>

  {/* Unread Filter */}
  <select
     className="border rounded-md px-3 py-2 text-sm bg-background text-foreground"
    value={unreadFilter}
    onChange={(e) => setUnreadFilter(e.target.value)}
  >
    <option value="all">All Messages</option>
    <option value="unread">Unread</option>
    <option value="read">Replied</option>
  </select>

  {/* CLEAR BUTTON */}
  <Button
    variant="outline"
    onClick={() => {
      setSearchTerm("");
      setStatusFilter("all");
      setPriorityFilter("all");
      setUnreadFilter("all");
      setCurrentPage(1);
    }}
  >
    Clear
  </Button>


</div>

      {/* TABLE */}
      <div className="rounded-md border">

        <Table>

          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead>Last Update</TableHead>
              <TableHead>Unread</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>

            {currentItems.map((ticket) => {

              const unread = getUnreadCount(ticket);

              return (

                <TableRow key={ticket._id}>
<TableCell className="font-mono text-xs text-muted-foreground">
  #{ticket._id.slice(-6).toUpperCase()}
</TableCell>

                  <TableCell className="font-medium">
                    {ticket.subject}
                  </TableCell>

                  <TableCell>
                    {ticket.userDisplay || ticket.userId?.mName || "User"}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(ticket.status)}>
                      {ticket.status}
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
                    {formatTimeAgo(ticket.lastMessageAt || ticket.createdAt)}
                  </TableCell>

                  <TableCell>
                    {unread > 0 ? (
                      <Badge className="bg-blue-600">🔔 {unread}</Badge>
                    ) : (
                      <span className="opacity-30">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => openChat(ticket)}>
                      View
                    </Button>
                  </TableCell>

                </TableRow>

              );
            })}

          </TableBody>

        </Table>

      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <p className="text-sm text-gray-500 mr-4">
          Page {currentPage} of {totalPages || 1}
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* CHAT DIALOG */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>

        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">

       <DialogHeader className="p-4 border-b bg-background">
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
          </DialogHeader>

     <div className="flex flex-col h-[450px] bg-muted/40">

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >

              {selectedTicket?.messages?.map((msg: any, i: number) => (

                <div
                  key={i}
                  className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                >

                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      msg.sender === "admin"
                        ? "bg-blue-600 text-white"
                      : "bg-background border"
                    }`}
                  >

                    {msg.message}

                    <div className="text-[10px] opacity-60 mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString()}
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
  placeholder="Write a message..."
  onKeyDown={(e) => e.key === "Enter" && sendReply()}
/>
              <Button onClick={sendReply} className="bg-blue-600 hover:bg-blue-700">
                Send
              </Button>

            </div>

          </div>

        </DialogContent>

      </Dialog>

    </div>
  );
};

export default AdminTickets;