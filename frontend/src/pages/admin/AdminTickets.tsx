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
    case "resolved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
    default: return "bg-blue-100 text-blue-700 border-blue-200";
  }
};

const AdminTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState("");
  
  // Search and Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchTickets(); }, []);

  // Auto-scroll logic: triggers whenever selectedTicket updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/tickets`);
      setTickets(res.data.tickets || []);
    } catch (error) { console.error(error); }
  };

  const openChat = async (ticket: any) => {
    setSelectedTicket(ticket);
    await axios.put(`${serverURL}/api/tickets/${ticket._id}/mark-read`, { role: "admin" });
    fetchTickets();
  };

  const sendReply = async () => {
    if (!reply || !selectedTicket) return;
    await axios.post(`${serverURL}/api/tickets/${selectedTicket._id}/reply`, {
      sender: "admin", message: reply,
    });
    setReply("");
    const updated = await axios.get(`${serverURL}/api/tickets`);
    const newTicketData = updated.data.tickets.find((t: any) => t._id === selectedTicket._id);
    setSelectedTicket(newTicketData);
    fetchTickets();
  };

  // Logic: Filter -> Paginate
  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-6 space-y-6">
      {/* 1. Header & Subtitle */}
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold tracking-tight">Tickets</h1>
        <p className="text-md text-muted-foreground">
         Manage and respond to user support requests submitted through this platform.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* 2. Search Bar */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by subject..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Unread</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((ticket) => (
              <TableRow key={ticket._id}>
                <TableCell className="font-medium">{ticket.subject}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`capitalize ${getStatusColor(ticket.status)}`}>
                    {ticket.status || "Open"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {ticket.messages?.some((m: any) => m.sender === "user" && !m.readByAdmin) ? (
                    <Badge className="bg-blue-500">🔔 1</Badge>
                  ) : <span className="opacity-20">🔔</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => openChat(ticket)}>View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 3. Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <p className="text-sm text-gray-500 mr-4">Page {currentPage} of {totalPages || 1}</p>
        <Button
          variant="outline" size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline" size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle className="text-lg font-semibold truncate pr-10">
              {selectedTicket?.subject}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-[450px] bg-slate-50">
            {/* 4. Chat Scroll Section */}
            <div 
              ref={scrollRef} 
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
              {selectedTicket?.messages?.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                    msg.sender === "admin" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-slate-800 border rounded-tl-none"
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
              <Input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a message..."
                onKeyDown={(e) => e.key === 'Enter' && sendReply()}
              />
              <Button onClick={sendReply} className="bg-blue-600 hover:bg-blue-700">Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTickets;