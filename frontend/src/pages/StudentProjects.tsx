import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Clock } from 'lucide-react';
import SEO from '@/components/SEO';
import axios from 'axios';
import { serverURL } from '@/constants';

const StudentProjects = () => {
    const [projects, setProjects] = useState([]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const orgId = sessionStorage.getItem('orgId');
    const studentId = sessionStorage.getItem('uid');

    useEffect(() => {
        if (orgId && studentId) {
            fetchProjects();
        }
    }, [orgId, studentId]);

    const fetchProjects = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/projects?organizationId=${orgId}&studentId=${studentId}`);
            if (res.data.success) setProjects(res.data.projects);
        } catch (e) {
            console.error('Error fetching projects:', e);
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6 animate-fade-in">
            <SEO title="My Projects" description="View your assigned projects and research work." />

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600">My Projects</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.length > 0 ? projects.map((p: any) => (
                    <Card key={p._id} className="hover:shadow-md transition-shadow h-full flex flex-col">
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold uppercase tracking-wider">{p.type}</span>
                                {p.dueDate && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(p.dueDate).toLocaleDateString()}</span>}
                            </div>
                            <CardTitle className="text-lg line-clamp-1">{p.title}</CardTitle>
                            <CardDescription className="line-clamp-3 mt-2 flex-grow">
                                {(p.description || '').replace(/<[^>]*>?/gm, '')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto pt-4 border-t">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded"><Briefcase className="w-3 h-3" /> {p.department || 'General'}</span>
                            </div>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 bg-muted/30 rounded-lg border-2 border-dashed">
                        <Briefcase className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-xl font-medium text-foreground">No Projects Yet</h3>
                        <p className="text-muted-foreground mt-2">Projects assigned to you will be displayed here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentProjects;
