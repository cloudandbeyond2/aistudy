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
        if (res.data.success) {
            // Sort by creation date descending (newest created first)
            const sorted = [...res.data.meetings].sort((a: any, b: any) => {
                const dateA = new Date(a.createdAt || a._id).getTime();
                const dateB = new Date(b.createdAt || b._id).getTime();
                return dateB - dateA;
            });
            setMeetings(sorted);
        }
    } catch (e) {
        console.error('Error fetching meetings:', e);
    }
};

    return (
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 animate-fade-in">
            <SEO title="My Meetings" description="View your scheduled meetings." />

            <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600">
                    My Meetings
                </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {meetings.length > 0 ? meetings.map((m: any) => (
                    <Card key={m._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-3 sm:gap-4 p-4 sm:p-6">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <Video className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                                <CardTitle className="text-base sm:text-lg truncate">
                                    {m.title}
                                </CardTitle>
                                <CardDescription className="capitalize flex items-center gap-1 text-xs sm:text-sm">
                                    <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${new Date(m.date) > new Date() ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    {m.platform.replace('-', ' ')}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground bg-muted/50 p-2 sm:p-3 rounded-md">
                                <span className="flex items-center gap-2 font-medium text-foreground whitespace-nowrap">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" /> 
                                    {new Date(m.date).toLocaleDateString()} at {m.time}
                                </span>
                            </div>
                            {(() => {
                                const isExpired = new Date(m.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
                                return (
                                    <Button
                                        className={`w-full text-sm sm:text-base py-2 sm:py-2.5 ${isExpired ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                                        onClick={() => !isExpired && window.open(m.link, '_blank')}
                                        disabled={isExpired}
                                    >
                                        {isExpired ? 'Meeting Expired' : 'Join Meeting'}
                                        {!isExpired && <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />}
                                    </Button>
                                );
                            })()}
                        </CardContent>
                    </Card>
                )) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 px-4 bg-muted/30 rounded-lg border-2 border-dashed">
                        <Video className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-3 sm:mb-4 opacity-20" />
                        <h3 className="text-lg sm:text-xl font-medium text-foreground text-center">No Meetings Scheduled</h3>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2 text-center">
                            Upcoming Google Meet or Zoom sessions will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentMeetings;