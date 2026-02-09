
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverURL } from '@/constants';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';

const certificateTemplate = '/assets/images/certificate_template.jpg';


const OrgAssignmentCertificate = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [certificateData, setCertificateData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const certificateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchCertificateData();
    }, [submissionId]);

    const fetchCertificateData = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/assignment/certificate/${submissionId}`);
            if (res.data.success) {
                setCertificateData(res.data.certificate);
            } else {
                toast({ title: "Error", description: "Could not fetch certificate data", variant: "destructive" });
                navigate('/dashboard/student/assignments');
            }
        } catch (e) {
            console.error("Certificate fetch error:", e);
            toast({ title: "Error", description: "Failed to load certificate", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        if (!certificateRef.current) return;

        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2, // Higher scale for better quality
                useCORS: true, // Allow loading cross-origin images
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${certificateData?.studentName || 'Student'}_Certificate.pdf`);
            toast({ title: "Success", description: "Certificate downloaded successfully!" });
        } catch (e) {
            console.error("PDF generation error:", e);
            toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" });
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (!certificateData) {
        return <div className="text-center p-10">Certificate not found.</div>;
    }

    return (
        <div className="container mx-auto py-8 flex flex-col items-center space-y-6">
            <SEO title="Course Certificate" description="Download your certificate of completion." />

            <div className="w-full flex justify-between max-w-4xl">
                <Button variant="ghost" onClick={() => navigate('/dashboard/student/assignments')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Assignments
                </Button>
                <Button onClick={downloadPDF}>
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
            </div>

            {/* Certificate Container */}
            <div className="relative shadow-2xl rounded-lg overflow-hidden max-w-4xl w-full aspect-[1.414/1] bg-white text-center" ref={certificateRef}>
                {/* Background Image */}
                <img
                    src={certificateTemplate}
                    alt="Certificate Template"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />

                {/* Overlay Content */}
                <div className="relative z-10 flex flex-col items-center h-full w-full pt-20 text-slate-800 font-serif">

                    {/* "This is to certify that" */}
                    <div className="absolute top-[32%] w-full text-center">
                        <p className="text-lg md:text-xl italic text-slate-500">This is to certify that</p>
                    </div>

                    {/* Student Name */}
                    <div className="absolute top-[38%] w-full text-center px-8">
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-wide uppercase" style={{ fontFamily: 'Times New Roman, serif' }}>
                            {certificateData.studentName}
                        </h1>
                    </div>

                    {/* "has successfully..." */}
                    <div className="absolute top-[52%] w-full text-center px-12">
                        <p className="text-md md:text-lg text-slate-600 leading-relaxed">
                            has successfully demonstrated proficient comprehension<br />
                            in the course of
                        </p>
                    </div>

                    {/* Course/Assignment Topic */}
                    <div className="absolute top-[62%] w-full text-center px-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 uppercase tracking-wider">
                            "{certificateData.assignmentTopic}"
                        </h2>
                    </div>

                    {/* "And is therefore awarded..." */}
                    <div className="absolute top-[72%] w-full text-center px-12">
                        <p className="text-sm md:text-md text-slate-500 italic">
                            And is therefore awarded this qualification with distinction
                        </p>
                    </div>

                    {/* Signature Section (Static Placeholder) */}
                    <div className="absolute bottom-[10%] left-[20%] text-center">
                        <div className="w-40 border-t border-slate-400 mb-2"></div>
                        <p className="text-xs md:text-sm font-semibold text-slate-600 uppercase tracking-widest">Director of Studies</p>
                    </div>

                    {/* Date Section */}
                    <div className="absolute bottom-[10%] right-[20%] text-center">
                        <p className="text-lg md:text-xl font-medium text-slate-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                            {new Date(certificateData.date).toLocaleDateString()}
                        </p>
                        <div className="w-40 border-t border-slate-400 mb-2"></div>
                        <p className="text-xs md:text-sm font-semibold text-slate-600 uppercase tracking-widest">Date</p>
                    </div>

                </div>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
                Note: This is a preview. Click "Download PDF" to save a high-quality copy.
            </p>
        </div>
    );
};

export default OrgAssignmentCertificate;
