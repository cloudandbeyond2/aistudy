// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-nocheck
// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Briefcase, Clock, Eye, Download } from 'lucide-react';
// import SEO from '@/components/SEO';
// import axios from 'axios';
// import { serverURL } from '@/constants';

// const StudentProjects = () => {
//     const [projects, setProjects] = useState([]);
//     const [selectedProject, setSelectedProject] = useState<any>(null);
//     const [openView, setOpenView] = useState(false);

//     const orgId = sessionStorage.getItem('orgId');
//     const studentId = sessionStorage.getItem('uid');

//     useEffect(() => {
//         if (orgId && studentId) fetchProjects();
//     }, [orgId, studentId]);

//     const fetchProjects = async () => {
//         try {
//             const res = await axios.get(`${serverURL}/api/org/projects?organizationId=${orgId}&studentId=${studentId}`);
//             if (res.data.success) setProjects(res.data.projects);
//         } catch (e) {
//             console.error(e);
//         }
//     };

//     // ✅ CLEAN DOWNLOAD FORMAT
//     const handleDownload = (p: any) => {
//         const stripHTML = (html: string) => {
//             const div = document.createElement("div");
//             div.innerHTML = html;
//             return div.innerText;
//         };

//         const content = `
// ==============================
// ${p.title.toUpperCase()}
// ==============================

// DESCRIPTION:
// ${stripHTML(p.description)}

// --------------------------------

// GUIDANCE:
// ${stripHTML(p.guidance)}

// --------------------------------

// SUBTOPICS:
// ${p.subtopics?.join(', ') || 'N/A'}
//         `;

//         const blob = new Blob([content], { type: 'text/plain' });
//         const url = window.URL.createObjectURL(blob);

//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `${p.title}.txt`;
//         a.click();
//     };

//     return (
//         <div className="container mx-auto py-8 space-y-6">

//             <SEO title="My Projects" description="View your assigned projects" />

//             <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
//                 My Projects
//             </h1>

//             {/* PROJECT CARDS */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {projects.length > 0 ? projects.map((p: any) => (

//                     <Card key={p._id} className="relative group hover:shadow-lg transition-all">

//                         {/* 🔥 ACTION BUTTONS */}
//                         <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            
//                             {/* VIEW */}
//                             <Button
//                                 size="icon"
//                                 variant="secondary"
//                                 className="h-7 w-7"
//                                 onClick={() => {
//                                     setSelectedProject(p);
//                                     setOpenView(true);
//                                 }}
//                             >
//                                 <Eye className="w-4 h-4" />
//                             </Button>

//                             {/* DOWNLOAD */}
//                             <Button
//                                 size="icon"
//                                 variant="outline"
//                                 className="h-7 w-7"
//                                 onClick={() => handleDownload(p)}
//                             >
//                                 <Download className="w-4 h-4" />
//                             </Button>
//                         </div>

//                         <CardHeader>
//                             <div className="flex justify-between mb-2">
//                                 <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
//                                     {p.type}
//                                 </span>

//                                 {p.dueDate && (
//                                     <span className="text-xs flex items-center gap-1 text-muted-foreground">
//                                         <Clock className="w-3 h-3" />
//                                         {new Date(p.dueDate).toLocaleDateString()}
//                                     </span>
//                                 )}
//                             </div>

//                             <CardTitle className="text-lg line-clamp-1">{p.title}</CardTitle>

//                             <CardDescription className="line-clamp-3">
//                                 {(p.description || '').replace(/<[^>]*>?/gm, '')}
//                             </CardDescription>
//                         </CardHeader>

//                         <CardContent className="border-t pt-3">
//                             <span className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1 w-fit">
//                                 <Briefcase className="w-3 h-3" />
//                                 {p.department || 'General'}
//                             </span>
//                         </CardContent>

//                     </Card>

//                 )) : (
//                     <div className="col-span-full text-center py-10">
//                         No Projects Available
//                     </div>
//                 )}
//             </div>

//             {/* 🔥 VIEW MODAL */}
//             {openView && selectedProject && (
//                 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

//                     <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-[500px] max-h-[90vh] overflow-y-auto shadow-xl relative">

//                         {/* CLOSE */}
//                         <button
//                             className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
//                             onClick={() => setOpenView(false)}
//                         >
//                             ✕
//                         </button>

//                         {/* TAGS */}
//                         <div className="flex gap-2 mb-2">
//                             <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
//                                 {selectedProject.type}
//                             </span>

//                             {selectedProject.isAiGenerated && (
//                                 <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
//                                     AI
//                                 </span>
//                             )}
//                         </div>

//                         {/* TITLE */}
//                         <h2 className="text-xl font-semibold mb-2">
//                             {selectedProject.title}
//                         </h2>

//                         {/* DESCRIPTION */}
//                         <div
//                             className="prose prose-sm mb-4"
//                             dangerouslySetInnerHTML={{ __html: selectedProject.description }}
//                         />

//                         {/* 🔥 FULL GUIDANCE */}
//                         <div className="bg-muted p-3 rounded-lg text-sm max-h-[400px] overflow-y-auto">
//                             <p className="font-semibold mb-2">Guidance:</p>

//                             <div
//                                 className="prose prose-sm max-w-none 
//                                            prose-h2:mt-4 prose-h3:mt-3 
//                                            prose-p:mb-2 leading-relaxed"
//                                 dangerouslySetInnerHTML={{ __html: selectedProject.guidance }}
//                             />
//                         </div>

//                         {/* SUBTOPICS */}
//                         <div className="flex flex-wrap gap-2 mt-4">
//                             {selectedProject.subtopics?.map((st: string, i: number) => (
//                                 <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
//                                     {st}
//                                 </span>
//                             ))}
//                         </div>

//                         {/* FOOTER */}
//                         <div className="flex justify-between text-xs text-muted-foreground mt-4">
//                             <span>Dept: {selectedProject.department || 'All'}</span>
//                             <span>{new Date(selectedProject.createdAt).toLocaleDateString()}</span>
//                         </div>

//                     </div>
//                 </div>
//             )}

//         </div>
//     );
// };

// export default StudentProjects;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Clock, Eye, Download } from 'lucide-react';
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
        html = html.replace(/\*\*(.*?)\*\*/g, '<h3 class="text-blue-600 font-bold mt-4 mb-2">$1</h3>');

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
        <div className="container mx-auto py-8 space-y-6">

            <SEO title="My Projects" description="View your projects" />

            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
                My Projects
            </h1>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.length > 0 ? projects.map((p: any) => (

                    <Card key={p._id} className="relative group hover:shadow-lg">

                    

                        <CardHeader>
                            <div className="flex justify-between mb-2">
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                    {p.type}
                                </span>

                                {p.dueDate && (
                                    <span className="text-xs flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(p.dueDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            <CardTitle>{p.title}</CardTitle>

                            <CardDescription className="line-clamp-3">
                                {(p.description || '').replace(/<[^>]*>?/gm, '')}
                            </CardDescription>
                        </CardHeader>

               <CardContent className="border-t pt-3">
    <div className="flex items-center justify-between">

        {/* LEFT SIDE (Department) */}
        <span className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {p.department || 'General'}
        </span>

        {/* RIGHT SIDE (Actions) */}
        <div className="flex gap-2">
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
            >
                <Eye className="w-4 h-4" />
            </Button>

            <Button
                size="icon"
                variant="default"
                onClick={() => handleDownload(p)}
            >
                <Download className="w-4 h-4" />
            </Button>
        </div>

    </div>
</CardContent>

                    </Card>

                )) : (
                    <div className="text-center py-10">No Projects</div>
                )}
            </div>

            {/* MODAL */}
            {openView && selectedProject && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

                    <div className="bg-white rounded-xl p-6 w-[500px] max-h-[90vh] overflow-y-auto">

                        <button onClick={() => setOpenView(false)} className="float-right text-red-500">✕</button>

                        <h2 className="text-xl font-semibold mb-2">{selectedProject.title}</h2>

                        {/* DESCRIPTION */}
                        <div
                            className="prose prose-sm mb-4"
                            dangerouslySetInnerHTML={{ __html: selectedProject.description }}
                        />

                        {/* GUIDANCE */}
                        <div className="bg-muted p-8 rounded-lg">
                            <h4 className="font-semibold mb-2">Guidance:</h4>

                            <div
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: selectedProject.guidance }}
                            />
                        </div>

                        {/* SUBTOPICS */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {selectedProject.subtopics?.map((st: string, i: number) => (
                                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {st}
                                </span>
                            ))}
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default StudentProjects;