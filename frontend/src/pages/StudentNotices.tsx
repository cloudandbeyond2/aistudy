
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import SEO from '@/components/SEO';
import axios from 'axios';
import { serverURL } from '@/constants';
import StyledText from '@/components/styledText';

const StudentNotices = () => {
    const [notices, setNotices] = useState([]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const orgId = sessionStorage.getItem('orgId');
    const studentId = sessionStorage.getItem('uid');

    useEffect(() => {
        if (orgId && studentId) {
            fetchNotices();
        }
    }, []);

    const fetchNotices = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/notices?organizationId=${orgId}&studentId=${studentId}`);
            if (res.data.success) {
                setNotices(res.data.notices);
            }
        } catch (e) {
            console.error('Error fetching notices:', e);
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <SEO title="Notices" description="Important announcements from your organization." />

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600">Notices</h1>
            </div>

            <div className="space-y-4">
                {notices.length > 0 ? notices.map((notice: any) => (
                    <Card key={notice._id} className="border-l-4 border-l-primary hover:shadow-md transition-all">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-primary" />
                                {notice.title}
                            </CardTitle>
                            <CardDescription>{new Date(notice.createdAt).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StyledText text={notice.content} />
                        </CardContent>
                    </Card>
                )) : (
                    <div className="text-center py-10 bg-muted/30 rounded-lg">
                        <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No new notices from your organization.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentNotices;
