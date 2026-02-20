import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { serverURL } from '@/constants';
import axios from 'axios';
import { Mail, Calendar, UserCheck, Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Subscriber {
    _id: string;
    email: string;
    subscribedAt: string;
}

const AdminSubscribers = () => {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [open, setOpen] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/admin/subscribers`);
            setSubscribers(res.data);
        } catch (error) {
            console.error('Failed to fetch subscribers:', error);
            toast.error("Failed to fetch subscribers");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) {
            toast.error("Please fill in both subject and message");
            return;
        }

        setIsSending(true);
        try {
            const res = await axios.post(`${serverURL}/api/admin/send-message`, {
                subject,
                message
            });

            if (res.data.success) {
                toast.success(res.data.message);
                setOpen(false);
                setSubject('');
                setMessage('');
            }
        } catch (error: any) {
            console.error('Failed to send message:', error);
            toast.error(error.response?.data?.message || "Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-500">Newsletter Subscribers</h1>
                    <p className="text-muted-foreground mt-1">Manage your platform's newsletter community</p>
                </div>

                <div className="flex items-center gap-3">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-lg transition-all duration-300">
                                <Send className="h-4 w-4" />
                                Common Message
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px] border-primary/10">
                            <form onSubmit={handleSendMessage}>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-primary" />
                                        Send Message to All Subscribers
                                    </DialogTitle>
                                    <DialogDescription>
                                        This email will be sent to all {subscribers.length} active subscribers.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <label htmlFor="subject" className="text-sm font-semibold">Subject</label>
                                        <Input
                                            id="subject"
                                            placeholder="Enter email subject"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="focus-visible:ring-primary"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="message" className="text-sm font-semibold">Message</label>
                                        <Textarea
                                            id="message"
                                            placeholder="Write your message here..."
                                            className="min-h-[200px] focus-visible:ring-primary"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setOpen(false)}
                                        className="hover:bg-muted"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSending}
                                        className="min-w-[120px] bg-primary hover:bg-primary/90"
                                    >
                                        {isSending ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                Sending...
                                            </div>
                                        ) : "Send Blast"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Card className="bg-primary/5 border-primary/10">
                        <CardContent className="py-2 px-4 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <UserCheck className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xl font-black text-primary leading-tight">{subscribers.length}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Subscribers</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card className="border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Subscriber List
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b bg-muted/20">
                                    <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider">Email Address</th>
                                    <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-right">Subscription Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-12 text-center text-muted-foreground italic">
                                            No subscribers found yet.
                                        </td>
                                    </tr>
                                ) : (
                                    subscribers.map((subscriber) => (
                                        <tr key={subscriber._id} className="hover:bg-muted/10 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                                        <Mail className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-medium">{subscriber.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(subscriber.subscribedAt), 'PPP')}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground/60">
                                                        {format(new Date(subscriber.subscribedAt), 'p')}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminSubscribers;
