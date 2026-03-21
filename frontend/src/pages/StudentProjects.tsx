// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Clock, Eye, Download, X } from 'lucide-react';
import SEO from '@/components/SEO';
import axios from 'axios';
import { serverURL } from '@/constants';
import html2pdf from "html2pdf.js";

const StudentProjects = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [openView, setOpenView] = useState(false);

    const orgId = sessionStorage.getItem('orgId');
    const studentId = sessionStorage.getItem('uid');

    useEffect(() => {
        if (orgId && studentId) fetchProjects();
    }, [orgId, studentId]);

    const fetchProjects = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/projects?organizationId=${orgId}&studentId=${studentId}`);
            if (res.data.success) setProjects(res.data.projects);
        } catch (e) {
            console.error(e);
        }
    };

    // ✅ FORMAT GUIDANCE TEXT (Markdown → HTML)
    const formatGuidanceText = (text: string) => {
        if (!text) return '';

        let html = text;

        // Headings (**text** → h3)
        html = html.replace(/\*\*(.*?)\*\*/g, '<h3 class="text-blue-600 dark:text-blue-400 font-bold mt-4 mb-2">$1</h3>');

        // Numbered list
        html = html.replace(/\n?\d+\.\s/g, '<li>');
        html = html.replace(/(<li>.*?)(?=<li>|$)/g, '$1</li>');
        html = html.replace(/(<li>.*<\/li>)/g, '<ol class="list-decimal pl-5 mb-3">$1</ol>');

        // Bullet list
        html = html.replace(/\*\s/g, '<li>');
        html = html.replace(/(<li>.*?)(?=<li>|$)/g, '$1</li>');

        // Paragraphs
        html = html.replace(/\n{2,}/g, '</p><p>');
        html = `<p>${html}</p>`;

        return html;
    };

    const cleanMarkdown = (text: string) => {
        return text.replace(/\*\*(.*?)\*\*/g, '$1');
    };

    // ✅ DOWNLOAD SAME FORMAT
    const handleDownload = (p: any) => {
        const htmlToText = (html: string) => {
            const div = document.createElement("div");
            div.innerHTML = html;

            let text = '';

            const cleanText = (str: string) => {
                return str
                    .replace(/\*\*(.*?)\*\*/g, '$1') // ✅ remove **bold**
                    .replace(/\*/g, '') // remove leftover *
                    .replace(/\n+/g, ' ') // clean extra new lines
                    .trim();
            };

            const walk = (node: any) => {
                if (node.nodeType === 3) {
                    text += cleanText(node.nodeValue);
                }

                if (['H1', 'H2', 'H3'].includes(node.tagName)) {
                    text += `\n\n${cleanText(node.innerText).toUpperCase()}\n---------------------\n`;
                }

                if (node.tagName === 'P') {
                    text += `\n${cleanText(node.innerText)}\n`;
                }

                if (node.tagName === 'LI') {
                    text += `\n• ${cleanText(node.innerText)}`;
                }

                node.childNodes.forEach(walk);
            };

            walk(div);
            return text;
        };

        const content = `
==============================
${p.title.toUpperCase()}
==============================

DESCRIPTION:
${htmlToText(p.description)}

GUIDANCE:
${htmlToText(cleanMarkdown(p.guidance))}

SUBTOPICS:
${p.subtopics?.join(', ') || 'N/A'}
        `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${p.title}.txt`;
        a.click();
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
            
            <SEO title="My Projects" description="View your projects" />

            {/* Responsive Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
                    My Projects
                </h1>
                
                {/* Optional: Add project count badge for mobile */}
                {projects.length > 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
                    </div>
                )}
            </div>

            {/* Responsive Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {projects.length > 0 ? projects.map((p: any) => (
                    <Card 
                        key={p._id} 
                        className="relative group hover:shadow-lg transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 flex flex-col h-full"
                    >
                        <CardHeader className="pb-2">
                            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                <span className="text-xs bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground px-2 py-1 rounded whitespace-nowrap">
                                    {p.type}
                                </span>

                                {p.dueDate && (
                                    <span className="text-xs flex items-center gap-1 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                        <Clock className="w-3 h-3 flex-shrink-0" />
                                        <span className="hidden xs:inline">{new Date(p.dueDate).toLocaleDateString()}</span>
                                        <span className="xs:hidden">{new Date(p.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    </span>
                                )}
                            </div>

                            <CardTitle className="text-base sm:text-lg lg:text-xl dark:text-gray-100 line-clamp-2">
                                {p.title}
                            </CardTitle>

                            <CardDescription className="line-clamp-2 sm:line-clamp-3 dark:text-gray-400 text-xs sm:text-sm">
                                {(p.description || '').replace(/<[^>]*>?/gm, '').substring(0, 100)}
                                {(p.description || '').length > 100 ? '...' : ''}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="border-t dark:border-gray-700 pt-3 mt-auto">
                            <div className="flex items-center justify-between gap-2">
                                {/* LEFT SIDE (Department) */}
                                <span className="text-xs bg-muted dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded flex items-center gap-1 truncate max-w-[60%]">
                                    <Briefcase className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{p.department || 'General'}</span>
                                </span>

                                {/* RIGHT SIDE (Actions) */}
                                <div className="flex gap-1 sm:gap-2">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedProject({
                                                ...p,
                                                description: formatGuidanceText(p.description),
                                                guidance: formatGuidanceText(p.guidance)
                                            });
                                            setOpenView(true);
                                        }}
                                        className="h-8 w-8 sm:h-9 sm:w-9 dark:border-gray-600 dark:hover:bg-gray-700"
                                    >
                                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </Button>

                                    <Button
                                        size="icon"
                                        variant="default"
                                        onClick={() => handleDownload(p)}
                                        className="h-8 w-8 sm:h-9 sm:w-9"
                                    >
                                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="col-span-full text-center py-10 sm:py-16 lg:py-20 text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                            <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 opacity-50" />
                            <p className="text-base sm:text-lg">No Projects Found</p>
                            <p className="text-sm text-gray-400">Check back later for new assignments</p>
                        </div>
                    </div>
                )}
            </div>

            {/* RESPONSIVE MODAL - DARK MODE SUPPORT */}
            {openView && selectedProject && (
                <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex justify-center items-center z-50 p-2 sm:p-4">
                    
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-[95%] sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        
                        {/* Modal Header - Responsive */}
                        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-3">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold dark:text-gray-100 line-clamp-2 flex-1">
                                {selectedProject.title}
                            </h2>
                            <button 
                                onClick={() => setOpenView(false)} 
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex-shrink-0"
                            >
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>

                        {/* Modal Content - Responsive Padding */}
                        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                            
                            {/* DESCRIPTION */}
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 dark:text-gray-200">Description</h3>
                                <div
                                    className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: selectedProject.description }}
                                />
                            </div>

                            {/* GUIDANCE */}
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 dark:text-gray-200">Guidance</h3>
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-lg border dark:border-gray-700">
                                    <div
                                        className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: selectedProject.guidance }}
                                    />
                                </div>
                            </div>

                            {/* SUBTOPICS - Responsive Tags */}
                            {selectedProject.subtopics?.length > 0 && (
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 dark:text-gray-200">Subtopics</h3>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        {selectedProject.subtopics.map((st: string, i: number) => (
                                            <span key={i} className="text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border dark:border-gray-700">
                                                {st}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional Project Info - Responsive Grid */}
                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t dark:border-gray-700">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
                                    <p className="text-sm sm:text-base font-medium dark:text-gray-300 break-words">{selectedProject.type}</p>
                                </div>
                                {selectedProject.dueDate && (
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Due Date</p>
                                        <p className="text-sm sm:text-base font-medium dark:text-gray-300">
                                            {new Date(selectedProject.dueDate).toLocaleDateString(undefined, { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Department</p>
                                    <p className="text-sm sm:text-base font-medium dark:text-gray-300 break-words">{selectedProject.department || 'General'}</p>
                                </div>
                                {selectedProject.createdAt && (
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                                        <p className="text-sm sm:text-base font-medium dark:text-gray-300">
                                            {new Date(selectedProject.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer - Responsive Buttons */}
                        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => setOpenView(false)}
                                className="w-full sm:w-auto dark:border-gray-600 dark:hover:bg-gray-800"
                            >
                                Close
                            </Button>
                            <Button 
                                variant="default" 
                                onClick={() => handleDownload(selectedProject)}
                                className="w-full sm:w-auto"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Optional: Add responsive CSS for extra small screens */}
            <style jsx>{`
                @media (max-width: 480px) {
                    .xs\\:inline {
                        display: inline;
                    }
                    .xs\\:hidden {
                        display: none;
                    }
                }
                @media (min-width: 481px) {
                    .xs\\:inline {
                        display: none;
                    }
                    .xs\\:hidden {
                        display: inline;
                    }
                }
            `}</style>
        </div>
    );
};

export default StudentProjects;