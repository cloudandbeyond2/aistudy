import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { serverURL } from '@/constants';
import axios from 'axios';
import { Mail, Calendar, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

interface Subscriber {
    _id: string;
    email: string;
    subscribedAt: string;
}

const AdminSubscribers = () => {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/admin/subscribers`);
            setSubscribers(res.data);
        } catch (error) {
            console.error('Failed to fetch subscribers:', error);
        } finally {
            setIsLoading(false);
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-500">Newsletter Subscribers</h1>
                    <p className="text-muted-foreground mt-1">Manage your platform's newsletter community</p>
                </div>
                <Card className="bg-primary/5 border-primary/10">
                    <CardContent className="py-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <UserCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-primary">{subscribers.length}</p>
                            <p className="text-xs font-bold text-muted-foreground uppercase">Total Subscribers</p>
                        </div>
                    </CardContent>
                </Card>
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
