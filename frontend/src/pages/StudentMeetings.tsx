import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Clock, ExternalLink } from 'lucide-react';
import SEO from '@/components/SEO';
import axios from 'axios';
import { serverURL } from '@/constants';

const StudentMeetings = () => {
    const [meetings, setMeetings] = useState([]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const orgId = sessionStorage.getItem('orgId');
    const studentId = sessionStorage.getItem('uid');

    useEffect(() => {
        if (orgId && studentId) {
            fetchMeetings();
        }
    }, [orgId, studentId]);

    const fetchMeetings = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/meetings?organizationId=${orgId}&studentId=${studentId}`);
            if (res.data.success) setMeetings(res.data.meetings);
        } catch (e) {
            console.error('Error fetching meetings:', e);
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6 animate-fade-in">
            <SEO title="My Meetings" description="View your scheduled meetings." />

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600">My Meetings</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meetings.length > 0 ? meetings.map((m: any) => (
                    <Card key={m._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <Video className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle>{m.title}</CardTitle>
                                <CardDescription className="capitalize flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${new Date(m.date) > new Date() ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    {m.platform.replace('-', ' ')}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                                <span className="flex items-center gap-2 font-medium text-foreground">
                                    <Clock className="w-4 h-4" /> {new Date(m.date).toLocaleDateString()} at {m.time}
                                </span>
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => window.open(m.link, '_blank')}>
                                Join Meeting <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 bg-muted/30 rounded-lg border-2 border-dashed">
                        <Video className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-xl font-medium text-foreground">No Meetings Scheduled</h3>
                        <p className="text-muted-foreground mt-2">Upcoming Google Meet or Zoom sessions will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentMeetings;
