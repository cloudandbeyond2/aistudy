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
import { Search, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "resolved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
    default: return "bg-blue-100 text-blue-700 border-blue-200";
  }
};

const SupportTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false); 
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchTickets(); }, []);

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

  const openChat = async (ticket: any) => {
    setSelectedTicket(ticket);
    await axios.put(`${serverURL}/api/tickets/${ticket._id}/mark-read`, { role: "user" });
    fetchTickets();
  };

  const sendReply = async () => {
    if (!reply || !selectedTicket) return;
    await axios.post(`${serverURL}/api/tickets/${selectedTicket._id}/reply`, {
      sender: "user", message: reply,
    });
    setReply("");
    const res = await axios.get(`${serverURL}/api/tickets/user/${sessionStorage.getItem("uid")}`);
    const updatedTicket = res.data.tickets.find((t: any) => t._id === selectedTicket._id);
    setSelectedTicket(updatedTicket);
    fetchTickets();
  };

  const closeTicket = async (ticketId: string) => {
    await axios.put(`${serverURL}/api/tickets/${ticketId}/status`, { status: "Resolved" });
    setSelectedTicket(null);
    fetchTickets();
  };

  const handleSubmit = async () => {
    if (!subject || !description) return;
    await axios.post(`${serverURL}/api/tickets`, {
      subject, description,
      userId: sessionStorage.getItem("uid"),
      userType: sessionStorage.getItem("type"),
    });
    setSubject(""); 
    setDescription(""); 
    setOpen(false); 
    fetchTickets();
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const currentItems = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order History & Support</h1>
          <p className="text-muted-foreground text-sm">
            View and manage all payment transactions and support requests from this page.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="w-4 h-4 mr-2" /> Create Ticket
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">My Support Tickets</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by subject..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Updates</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((ticket) => {
                // Calculate unread count specifically for admin messages
                const unreadCount = ticket.messages?.filter(
                  (msg: any) => msg.sender === "admin" && !msg.readByUser
                ).length || 0;

                return (
                  <TableRow key={ticket._id}>
                    <TableCell className="font-medium">{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize shadow-none ${getStatusColor(ticket.status)}`}>
                        {ticket.status || "Open"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                   <TableCell>
  {(() => {
    // Calculate count of admin messages not yet read by the user
    const unreadCount = ticket.messages?.filter(
      (m: any) => m.sender === "admin" && !m.readByUser
    ).length || 0;

    return unreadCount > 0 ? (
      <Badge className="bg-blue-600 text-white animate-pulse flex items-center gap-1 px-2 py-0.5 rounded-full w-fit">
        🔔 {unreadCount}
      </Badge>
    ) : (
      <span className="text-gray-400 opacity-30 ml-2">🔔</span>
    );
  })()}
</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openChat(ticket)}>View</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline" size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium text-muted-foreground px-2">
              Page {currentPage} of {totalPages || 1}
            </div>
            <Button
              variant="outline" size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CHAT MODAL */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b flex flex-row items-center justify-between bg-white gap-4 pr-12">
            <DialogTitle className="text-lg font-semibold truncate flex-1">{selectedTicket?.subject}</DialogTitle>
            {selectedTicket?.status !== "Resolved" && (
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 h-8" onClick={() => closeTicket(selectedTicket._id)}>
                Mark Resolved
              </Button>
            )}
          </DialogHeader>
          <div className="flex flex-col h-[450px] bg-slate-50">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedTicket?.messages?.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.sender === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border rounded-tl-none shadow-sm"
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
              <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === 'Enter' && sendReply()} />
              <Button onClick={sendReply} className="bg-blue-600">Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CREATE TICKET MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                placeholder="Brief title of your issue" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Tell us more about your issue..." 
                className="min-h-[120px]"
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">Submit Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTickets;