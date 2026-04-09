import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  HelpCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Bell,
  Bot,
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import { serverURL } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StaffSupport() {

  const [formData, setFormData] = useState({
    subject: "",
    category: "Technical Issue",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // --- New state for ticket history ---
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const scrollRef = useRef<HTMLDivElement>(null);

  const uid = sessionStorage.getItem("uid");
  const orgId = sessionStorage.getItem("orgId");
  const deptName = sessionStorage.getItem("deptName");

  useEffect(() => {
    if (uid) fetchTickets();
  }, [uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/student-tickets/student/${uid}`);
      setTickets(res.data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets", error);
    }
  };

  const openChat = async (ticket: any) => {
    setSelectedTicket(ticket);
    try {
      await axios.put(`${serverURL}/api/student-tickets/${ticket._id}/mark-read`, { role: "student" });
      fetchTickets();
    } catch (err) {
      console.error("Mark read error", err);
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
      
      const updatedTickets = await axios.get(`${serverURL}/api/student-tickets/student/${uid}`);
      const newSelected = updatedTickets.data.tickets.find((t: any) => t._id === selectedTicket._id);
      setSelectedTicket(newSelected);

    } catch (err) {
      console.error("Reply error", err);
      Swal.fire({ icon: "error", title: "Failed to send reply" });
    }
  };

  const askAI = async () => {
    if (!selectedTicket?._id || aiLoading) return;

    const messageToAsk = reply.trim();

    try {
      setAiLoading(true);

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

      const updatedTickets = await axios.get(`${serverURL}/api/student-tickets/student/${uid}`);
      setTickets(updatedTickets.data.tickets || []);
      const newSelected = (updatedTickets.data.tickets || []).find((t: any) => t._id === selectedTicket._id);
      setSelectedTicket(newSelected || null);
    } catch (err: any) {
      console.error("AI reply error", err);
      const msg = err?.response?.data?.message || "Failed to get AI response";
      Swal.fire({ icon: "error", title: "AI Assistant", text: msg });
    } finally {
      setAiLoading(false);
    }
  };

  const faqs = [
    {
      q: "How do I update student grades?",
      a: "Navigate to the Grading tab and select the assignment."
    },
    {
      q: "Can I schedule a makeup class?",
      a: "Go to the Schedule tab and click request room."
    },
    {
      q: "How do I reset my password?",
      a: "Go to profile settings and choose security."
    },
    {
      q: "Where can I find archived courses?",
      a: "Use the archived filter in My Classes."
    },
    {
      q: "How do I upload course materials?",
      a: "Go to the Resources tab and upload files."
    }
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.message) {
      Swal.fire({ icon: "error", title: "Missing Information", text: "Please fill subject and message" });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${serverURL}/api/student-tickets`, {
        subject: formData.subject,
        message: formData.message,
        studentId: uid,
        orgId: orgId,
        department: deptName || "Staff"
      });

      Swal.fire({ icon: "success", title: "Ticket Submitted", text: "Your ticket has been sent to the organization admin." });
      setFormData({ subject: "", category: "Technical Issue", message: "" });
      fetchTickets();
    } catch (error) {
      console.error("Submit ticket error:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to submit ticket" });
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "In Progress": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const search = searchTerm.toLowerCase();
    const ticketId = ticket._id?.slice(-6).toLowerCase();
    const matchesSearch = ticket.subject?.toLowerCase().includes(search) || ticketId.includes(search);
    const matchesStatus = statusFilter === "All" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const currentTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 lg:p-8 dark:bg-slate-950 min-h-screen">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          Support Center
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Find answers to common questions or reach out to our support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b dark:border-slate-800 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl">Contact Support</CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit a ticket for technical assistance</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="e.g., Unable to sync grades"
                      className="bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    >
                      <option>Technical Issue</option>
                      <option>Account Access</option>
                      <option>Grading System</option>
                      <option>Feature Request</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Message</label>
                  <textarea
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of the issue..."
                    className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-4 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all min-h-[150px]"
                  ></textarea>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl text-base font-semibold shadow-lg shadow-blue-500/20 transition-all flex gap-2">
                  <Send size={18} />
                  {loading ? "Submitting..." : "Submit Support Ticket"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* TICKET HISTORY SECTION */}
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden mt-8">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-xl">My Support Tickets</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search ID or subject..."
                    className="pl-10 h-9 w-48 lg:w-64 bg-white dark:bg-slate-900 text-xs"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                    <TableRow>
                      <TableHead className="w-24">ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="w-28 text-center">Status</TableHead>
                      <TableHead className="w-32">Date</TableHead>
                      <TableHead className="w-24 text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTickets.length > 0 ? (
                      currentTickets.map((ticket) => {
                        const unreadCount = ticket.messages?.filter(
                          (m: any) => m.sender === "org_admin" && !m.readByStudent
                        ).length || 0;

                        return (
                          <TableRow key={ticket._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                            <TableCell className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter">
                              #{ticket._id.slice(-6)}
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              <div className="flex items-center gap-2">
                                <span className="truncate max-w-[200px]">{ticket.subject}</span>
                                {unreadCount > 0 && (
                                  <Badge className="bg-blue-600 hover:bg-blue-600 px-1.5 h-4 text-[10px]">{unreadCount}</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={`${getStatusColor(ticket.status)} border-current px-2 py-0.5 text-[10px] font-bold`}>
                                {ticket.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button size="sm" variant="ghost" onClick={() => openChat(ticket)} className="h-8 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                                View Chat
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-slate-500 text-sm">
                          <MessageSquare className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                          <p>No support tickets found.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredTickets.length > itemsPerPage && (
                <div className="p-4 border-t dark:border-slate-800 flex items-center justify-between">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-md" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                      <ChevronLeft size={14} />
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-md" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: FAQ & HELP */}
        <div className="space-y-8">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b dark:border-slate-800 p-6 flex flex-row items-center gap-3">
              <HelpCircle className="text-slate-500" size={20} />
              <CardTitle className="text-lg">Common Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y dark:divide-slate-800">
                {faqs.map((item, idx) => (
                  <div key={idx} className="group">
                    <button onClick={() => toggleFaq(idx)} className="w-full text-left p-4 flex justify-between items-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 pr-4">{item.q}</span>
                      {openFaqIndex === idx ? <ChevronUp size={16} className="text-blue-500" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </button>
                    {openFaqIndex === idx && (
                      <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed animate-in slide-in-from-top-1">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full transition-transform group-hover:scale-110"></div>
            <div className="relative">
              <h3 className="text-xl font-bold mb-6">Immediate Support</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-2 bg-white/20 rounded-lg h-fit"><Phone size={18} /></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-blue-100 tracking-wider">Help Desk</p>
                    <p className="text-base font-semibold">+91 82200 02535</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 bg-white/20 rounded-lg h-fit"><Mail size={18} /></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-blue-100 tracking-wider">Email Support</p>
                    <p className="text-base font-semibold truncate">colossusiq@gmail.com</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 bg-white/20 rounded-lg h-fit"><Clock size={18} /></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-blue-100 tracking-wider">Office Hours</p>
                    <p className="text-base font-semibold">9:00 AM - 6:00 PM (IST)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHAT DIALOG */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl [&>button]:hidden bg-white dark:bg-slate-950">
          <DialogHeader className="p-6 border-b dark:border-slate-800 flex flex-row items-center justify-between space-y-0 text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-4 truncate">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                <MessageSquare size={20} />
              </div>
              <div className="flex flex-col truncate">
                <DialogTitle className="text-base font-bold truncate pr-4">{selectedTicket?.subject}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">#{selectedTicket?._id?.slice(-6)}</span>
                  <Badge variant="outline" className={`${getStatusColor(selectedTicket?.status)} border-current px-2 py-0 text-[9px] font-bold`}>{selectedTicket?.status}</Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)} className="rounded-full h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X size={18} className="text-slate-500" />
            </Button>
          </DialogHeader>

          <div className="flex flex-col h-[450px]">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950/50">
              {selectedTicket?.messages?.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}>
                  <div className={`group relative max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all ${
                    msg.sender === "student" 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : msg.sender === "ai"
                    ? "bg-violet-600/10 text-violet-900 dark:text-violet-200 border border-violet-500/20 rounded-tl-none"
                    : "bg-white dark:bg-slate-900 border dark:border-slate-800 text-slate-900 dark:text-white rounded-tl-none"
                  }`}>
                    {msg.message}
                    <div className={`text-[9px] mt-1.5 font-medium opacity-70 ${msg.sender === "student" ? "text-blue-100" : msg.sender === "ai" ? "text-violet-500" : "text-slate-500"}`}>
                      {new Date(msg.createdAt).toLocaleString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 border-t dark:border-slate-800">
              {selectedTicket?.status !== "Resolved" ? (
                <div className="flex gap-2 items-center">
                  <Input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border-none focus-visible:ring-1 focus-visible:ring-blue-500 h-11"
                    onKeyDown={(e) => { if (e.key === "Enter") sendReply(); }}
                  />
                  <Button onClick={askAI} variant="outline" disabled={aiLoading} className="h-11 px-4 rounded-lg">
                    <Bot size={18} className="mr-2" />
                    {aiLoading ? "Thinking..." : "Ask AI"}
                  </Button>
                  <Button onClick={sendReply} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 h-11 px-5 rounded-lg transition-transform active:scale-95">
                    <Send size={18} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                   <Clock size={16} /> This ticket has been archived as resolved.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
