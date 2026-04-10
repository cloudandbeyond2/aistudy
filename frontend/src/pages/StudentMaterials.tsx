import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Link as LinkIcon, ExternalLink, FileText, Image, Video, File } from 'lucide-react';
import SEO from '@/components/SEO';
import axios from 'axios';
import { serverURL } from '@/constants';

const StudentMaterials = () => {
    const [materials, setMaterials] = useState([]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const orgId = sessionStorage.getItem('orgId');
    const studentId = sessionStorage.getItem('uid');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (orgId && studentId) {
            fetchMaterials();
        }
        
        // Check if mobile on mount and on resize
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, [orgId, studentId]);

    const resolveMaterialUrl = (fileUrl: string) => {
        const trimmed = String(fileUrl || '').trim();
        if (!trimmed) return '';
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        if (trimmed.startsWith('/')) return `${serverURL}${trimmed}`;
        return `${serverURL}/${trimmed}`;
    };

    const fetchMaterials = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/materials?organizationId=${orgId}&studentId=${studentId}`);
            if (res.data.success) setMaterials(res.data.materials);
        } catch (e) {
            console.error('Error fetching materials:', e);
        }
    };

    const getFileIcon = (type) => {
        const fileType = type?.toLowerCase() || '';
        if (fileType.includes('pdf')) return <FileText className="w-5 h-5 md:w-6 md:h-6" />;
        if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('png')) return <Image className="w-5 h-5 md:w-6 md:h-6" />;
        if (fileType.includes('video')) return <Video className="w-5 h-5 md:w-6 md:h-6" />;
        return <Download className="w-5 h-5 md:w-6 md:h-6" />;
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 animate-fade-in">
            <SEO title="My Materials" description="View and download learning materials." />

            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600">
                    My Materials
                </h1>
                <div className="text-xs sm:text-sm text-muted-foreground">
                    {materials.length} {materials.length === 1 ? 'item' : 'items'}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {materials.length > 0 ? materials.map((m: any) => (
                    <Card 
                        key={m._id} 
                        className="hover:bg-muted/50 transition-all group cursor-pointer border-l-4 border-l-secondary hover:shadow-md active:scale-[0.98] transition-transform"
                        onClick={() => {
                            const materialUrl = resolveMaterialUrl(m.fileUrl);
                            if (materialUrl) window.open(materialUrl, '_blank', 'noopener,noreferrer');
                        }}
                    >
                        <CardHeader className="flex flex-row items-center gap-3 sm:gap-4 space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                                {getFileIcon(m.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-sm sm:text-base font-semibold truncate">
                                    {m.title}
                                </CardTitle>
                                <CardDescription className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wider mt-0.5 sm:mt-1">
                                    {m.type || 'Document'}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                                <Button 
  onClick={(e) => {
    e.stopPropagation();

    const fileUrl = resolveMaterialUrl(m.fileUrl);
    if (fileUrl) window.open(fileUrl, '_blank', 'noopener,noreferrer');
  }}
>
                                    <span className="truncate">Access Material</span>
                                    <ExternalLink className="w-3 h-3 ml-1 sm:ml-2 shrink-0" />
                                </Button>
                                {m.fileSize && (
                                    <span className="text-[10px] sm:text-xs text-muted-foreground text-center sm:text-left">
                                        {(m.fileSize / 1024).toFixed(1)} KB
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4 bg-muted/30 rounded-lg border-2 border-dashed">
                        <Download className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-3 sm:mb-4 opacity-20" />
                        <h3 className="text-lg sm:text-xl font-medium text-foreground text-center">
                            No Materials Available
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2 text-center max-w-xs sm:max-w-md">
                            Resources shared by your organization will be listed here.
                        </p>
                    </div>
                )}
            </div>

            {/* Optional: Add a floating action button for mobile if needed */}
            {isMobile && materials.length > 0 && (
                <div className="fixed bottom-4 right-4 md:hidden">
                    <Button 
                        size="icon" 
                        className="rounded-full shadow-lg h-12 w-12"
                        onClick={() => {
                            // Optional: Add functionality like refresh or filter
                            fetchMaterials();
                        }}
                    >
                        <Download className="h-5 w-5" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default StudentMaterials;
