
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
import { Bell, PlusCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StudentSupportTickets = () => {
  const { toast } = useToast();

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [reply, setReply] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const scrollRef = useRef<HTMLDivElement>(null);
  const studentId = sessionStorage.getItem("uid");
  // IMPORTANT: Ensure your backend knows which organization this student belongs to
  const orgId = sessionStorage.getItem("orgId"); 

  useEffect(() => {
    if (studentId) fetchTickets();
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
    const searchStr = searchTerm.toLowerCase();
    return (
      ticket.subject?.toLowerCase().includes(searchStr) ||
      ticket.status?.toLowerCase().includes(searchStr)
    );
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
      // Added orgId to the payload as it's often required for the admin to see it
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
    if (!reply.trim()) return;
    try {
      await axios.post(`${serverURL}/api/student-tickets/${selectedTicket._id}/reply`, {
        sender: "student",
        message: reply,
      });
      setReply("");
      // Refresh current chat
      const res = await axios.get(`${serverURL}/api/student-tickets/student/${studentId}`);
      const updated = res.data.tickets.find((t: any) => t._id === selectedTicket._id);
      setSelectedTicket(updated);
      setTickets(res.data.tickets);
    } catch (err) {
        console.error("Reply error", err);
    }
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
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Support Center
          </h1>
          <p className="text-muted-foreground text-base max-w-xl">
            Send your issues to your organization admin and track their progress in real-time.
          </p>
        </div>
        <Button onClick={() => setOpenCreate(true)} className="bg-blue-600 hover:bg-blue-700 shadow-md">
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl">My Support Tickets</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by subject..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold text-center">Unread</TableHead>
                  <TableHead className="text-right font-semibold pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTickets.length > 0 ? (
                  currentTickets.map((ticket) => {
                    const unreadCount = ticket.messages?.filter(
                      (m: any) => m.sender === "org_admin" && !m.readByStudent
                    ).length || 0;

                    return (
                      <TableRow key={ticket._id} className="hover:bg-slate-50/30">
                        <TableCell className="font-medium">{ticket.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getStatusColor(ticket.status)} font-medium`}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">
                          {unreadCount > 0 ? (
                            <Badge className="bg-blue-600 text-white animate-pulse">{unreadCount}</Badge>
                          ) : (
                            <Bell className="w-4 h-4 text-slate-300 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button size="sm" variant="secondary" onClick={() => openChat(ticket)}>
                            View Chat
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                      No support tickets found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* CHAT MODAL */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {selectedTicket?.subject}
              <Badge variant="outline" className={`${getStatusColor(selectedTicket?.status)} text-[10px]`}>
                {selectedTicket?.status}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-[480px] bg-slate-50/50">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedTicket?.messages?.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] shadow-sm ${
                    msg.sender === "student" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border text-slate-700 rounded-tl-none"
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
                  placeholder="Type your message..."
                  onKeyDown={(e) => e.key === "Enter" && sendReply()}
                />
                <Button onClick={sendReply} className="bg-blue-600">Send</Button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 text-center text-sm text-emerald-700 font-medium border-t">
                This ticket has been marked as Resolved.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* CREATE TICKET MODAL */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Subject</label>
              <Input
                placeholder="e.g., Assignment visibility issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Detailed Description</label>
              <Textarea
                placeholder="Briefly describe the problem..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button onClick={createTicket} className="bg-blue-600">Submit Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentSupportTickets;