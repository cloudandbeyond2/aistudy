import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Link as LinkIcon, ExternalLink } from 'lucide-react';
import SEO from '@/components/SEO';
import axios from 'axios';
import { serverURL } from '@/constants';

const StudentMaterials = () => {
    const [materials, setMaterials] = useState([]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const orgId = sessionStorage.getItem('orgId');
    const studentId = sessionStorage.getItem('uid');

    useEffect(() => {
        if (orgId && studentId) {
            fetchMaterials();
        }
    }, [orgId, studentId]);

    const fetchMaterials = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/materials?organizationId=${orgId}&studentId=${studentId}`);
            if (res.data.success) setMaterials(res.data.materials);
        } catch (e) {
            console.error('Error fetching materials:', e);
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6 animate-fade-in">
            <SEO title="My Materials" description="View and download learning materials." />

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600">My Materials</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.length > 0 ? materials.map((m: any) => (
                    <Card key={m._id} className="hover:bg-muted/50 transition-colors group cursor-pointer border-l-4 border-l-secondary" onClick={() => window.open(m.fileUrl, '_blank')}>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                                <Download className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-base truncate">{m.title}</CardTitle>
                                <CardDescription className="text-[10px] uppercase font-bold tracking-wider mt-1">{m.type}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground group-hover:text-primary justify-start px-0 mt-2">
                                Access Material <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 bg-muted/30 rounded-lg border-2 border-dashed">
                        <Download className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-xl font-medium text-foreground">No Materials Available</h3>
                        <p className="text-muted-foreground mt-2">Resources shared by your organization will be listed here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentMaterials;
