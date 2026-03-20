
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverURL, websiteURL } from '@/constants';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';

const certificateTemplate = '/assets/images/certificate_template_blue.jpg';

const OrgAssignmentCertificate = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [certificateData, setCertificateData] = useState<any>(null);
    const [certificateSettings, setCertificateSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const certificateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${serverURL}/api/certificate-settings`);
                setCertificateSettings(response.data);
            } catch (error) {
                console.error('Error fetching certificate settings:', error);
            }
        };

        fetchSettings();
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

                    {/* Partner Logo (Top Left) */}
                    {certificateSettings?.partnerLogo && (
                        <div className="absolute top-[8%] left-[8%]">
                            <img
                                src={certificateSettings.partnerLogo}
                                alt="Partner Logo"
                                style={{ height: certificateSettings?.sizes?.partnerLogoHeight || '50px' }}
                                className="object-contain"
                            />
                        </div>
                    )}

                    {/* Organization Logo (Top Right) */}
                    {certificateSettings?.organizationLogo && (
                        <div className="absolute top-[8%] right-[8%]">
                            <img
                                src={certificateSettings.organizationLogo}
                                alt="Organization Logo"
                                style={{ height: certificateSettings?.sizes?.organizationLogoHeight || '50px' }}
                                className="object-contain"
                            />
                        </div>
                    )}

                    {/* "This is to certify that" */}
                    <div className="absolute top-[38%] w-full text-center">
                        <p className="text-lg md:text-xl italic text-slate-500">This is to certifyy that</p>
                    </div>

                    {/* Student Name */}
                    <div className="absolute top-[44%] w-full text-center px-8">
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-wide uppercase" style={{ fontFamily: 'Times New Roman, serif' }}>
                            {certificateData.studentName}
                        </h1>
                    </div>

                    {/* "has successfully..." */}
                    <div className="absolute top-[55%] w-full text-center px-12">
                        <p className="text-md md:text-lg text-slate-600 leading-relaxed">
                            has successfully demonstrated proficient comprehension<br />
                            in the course of
                        </p>
                    </div>

                    {/* Course/Assignment Topic */}
                    <div className="absolute top-[63%] w-full text-center px-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 uppercase tracking-wider">
                            "{certificateData.assignmentTopic}"
                        </h2>
                    </div>

                    {/* "And is therefore awarded..." */}
                    <div className="absolute top-[71%] w-full text-center px-12">
                        <p className="text-sm md:text-md text-slate-500 italic">
                            And is therefore awarded this qualification with distinction
                        </p>
                    </div>

                    {/* Bottom Left: Director Signature & Name */}
                    <div
                        className="absolute flex flex-col items-center text-center w-48"
                        style={{
                            bottom: '14%',
                            left: '20%',
                            transform: 'translateX(-50%)'
                        }}
                    >
                        {certificateSettings?.ceoSignature && (
                            <img
                                src={certificateSettings.ceoSignature}
                                alt="Director Signature"
                                style={{ height: certificateSettings?.sizes?.signatureHeight || '40px' }}
                                className="object-contain mb-1"
                            />
                        )}
                        {/* We use bg-white px-2 py-1 to obscure the built-in 'Director of Studies' text on the image */}
                        <p className="text-sm font-semibold text-slate-800 uppercase tracking-widest mt-1 bg-white/90 px-2 rounded">
                            {certificateSettings?.ceoName || 'Director'}
                        </p>
                    </div>

                    {/* Bottom Middle-Right: Org Director Sign */}
                    <div
                        className="absolute flex justify-center items-center"
                        style={{
                            bottom: '18%',
                            right: '38%'
                        }}
                    >
                        {certificateSettings?.vpSignature && (
                            <img
                                src={certificateSettings.vpSignature}
                                alt="Org Signature"
                                style={{ height: certificateSettings?.sizes?.signatureHeight || '40px' }}
                                className="object-contain"
                            />
                        )}
                    </div>

                    {/* Bottom Right: QR, Cert No, Date */}
                    <div
                        className="absolute flex flex-col items-center text-center w-36 bg-white/90 p-2 rounded"
                        style={{
                            bottom: '11%',
                            right: '18%',
                            transform: 'translateX(50%)'
                        }}
                    >
                        <QRCodeSVG
                            value={`${certificateSettings?.qrCodeUrl || websiteURL}/verify-certificate?id=${certificateData._id}`}
                            size={parseInt(certificateSettings?.sizes?.qrCodeSize || '55')}
                            className="max-lg:w-12 max-lg:h-12 max-md:w-8 max-md:h-8 mb-2"
                        />
                        <p className="text-[10px] md:text-[11px] font-mono text-slate-700 mb-1 font-bold">
                            ID: {certificateData._id?.substring(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm md:text-md font-medium text-slate-700 mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                            {new Date(certificateData.date).toLocaleDateString()}
                        </p>
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
