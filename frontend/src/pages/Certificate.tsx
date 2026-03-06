import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { serverURL } from '@/constants';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ArrowLeft, Award } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';

import { appName, websiteURL } from '@/constants';
import { QRCodeSVG } from 'qrcode.react';

import certificate from '../res/certificate.png';
import logo from '../res/logo.svg';
import cloudBeyondLogo from '../res/cloud-beyond.png';
import infilabsLogo from '../res/infilabs.png';
import trainingLabsLogo from '../res/traininglabs.png';
import saravananSign from '../res/saravanan-sign.png';
import { cn } from '@/lib/utils';
import { toPng } from 'html-to-image';
import { Card, CardContent } from '@/components/ui/card';

const certificateTemplate = '/assets/images/certificate_template.jpg';

const Certificate = () => {
  const { state } = useLocation();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { courseTitle, end } = state || {};
  const userName = sessionStorage.getItem('mName');

  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const orgId = sessionStorage.getItem('orgId');
  const isOrgStudent = !!orgId;

  useEffect(() => {
    if (!courseTitle || !end || !userName) {
      setLoading(false);
      return;
    }

    // Fetch certificate ID if available
    if (courseId) {
      axios.post(`${serverURL}/api/getmyresult`, { courseId })
        .then(res => {
          if (res.data?.success && res.data.certificateId) {
            setCertificateId(res.data.certificateId);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [courseId, courseTitle, end, userName]);

  const downloadPDF = async () => {
    if (!certificateRef.current) return;
    setProcessing(true);

    try {
      if (isOrgStudent) {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${userName || 'Student'}_Course_Certificate.pdf`);
      } else {
        const dataUrl = await toPng(certificateRef.current, { cacheBust: true } as any);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${userName || 'Student'}_Course_Certificate.png`;
        link.click();
      }
      toast({ title: "Success", description: "Certificate downloaded successfully!" });
    } catch (e) {
      console.error("Certificate download error:", e);
      toast({ title: "Error", description: "Failed to download certificate", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!courseTitle || !end || !userName) {
    return (
      <div className="text-center p-10 flex flex-col items-center">
        <p className="mb-4">Certificate data missing. Please complete the course first.</p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 flex flex-col items-center space-y-6">
      <SEO title={`${courseTitle} Certificate`} description="Download your course completion certificate." />

      <div className="w-full flex justify-between max-w-4xl px-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={downloadPDF} disabled={processing}>
          <Download className="w-4 h-4 mr-2" /> {processing ? "Processing..." : isOrgStudent ? "Download PDF" : "Download Certificate"}
        </Button>
      </div>

      {isOrgStudent ? (
        /* Organization Student UI - Simplified */
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
            <div className="absolute top-[38%] w-full text-center">
              <p className="text-lg md:text-xl italic text-slate-500">This is to certify that</p>
            </div>

            {/* Student Name */}
            <div className="absolute top-[44%] w-full text-center px-8">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-wide uppercase" style={{ fontFamily: 'Times New Roman, serif' }}>
                {userName}
              </h1>
            </div>

            {/* "has successfully..." */}
            <div className="absolute top-[55%] w-full text-center px-12">
              <p className="text-md md:text-lg text-slate-600 leading-relaxed">
                has successfully demonstrated proficient comprehension<br />
                in the course of
              </p>
            </div>

            {/* Course Topic */}
            <div className="absolute top-[63%] w-full text-center px-10">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 uppercase tracking-wider">
                "{courseTitle}"
              </h2>
            </div>

            {/* "And is therefore awarded..." */}
            <div className="absolute top-[71%] w-full text-center px-12">
              <p className="text-sm md:text-md text-slate-500 italic">
                And is therefore awarded this qualification with distinction
              </p>
            </div>

            {/* Signature Section */}
            <div className="absolute bottom-[18%] left-[20%] text-center">
              <div className="w-48 border-t border-slate-400 mb-2 mx-auto"></div>
              {/* <p className="text-xs md:text-sm font-semibold text-slate-600 uppercase tracking-widest">Director of Studies</p> */}
            </div>

            {/* Date Section */}
            <div className="absolute bottom-[18%] right-[20%] text-center">
              <p className="text-lg md:text-xl font-medium text-slate-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                {end}
              </p>
              <div className="w-48 border-t border-slate-400 mb-2 mx-auto"></div>
              {/* <p className="text-xs md:text-sm font-semibold text-slate-600 uppercase tracking-widest">Date</p> */}
            </div>

          </div>
        </div>
      ) : (
        /* Regular User UI - Original Detailed Layout */
        <Card className="w-full max-w-4xl shadow-xl">
          <CardContent className="p-0">
            {/* Header */}
            <div className="text-center p-8 border-b">
              <Award className="h-14 w-14 mx-auto text-primary mb-3" />
              <h1 className="text-3xl font-bold">Certificate of Completion</h1>
              <p className="text-muted-foreground mt-2">
                This certifies successful course completion
              </p>
            </div>

            {/* Certificate */}
            <div className="p-6 overflow-hidden">
              <div ref={certificateRef} className="relative w-full font-serif">
                <img src={certificate} className="w-full" alt="Certificate" />

                {/* WATERMARK */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    transform: 'rotate(-25deg)',
                    opacity: 0.05,
                    fontSize: '4rem',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                  }}
                >
                  {appName}
                </div>

                {/* Name */}
                <p
                  className="absolute text-4xl font-semibold italic max-lg:text-2xl max-md:text-lg"
                  style={{ top: '46%', left: '50%', transform: 'translate(-50%, -50%)' }}
                >
                  {userName}
                </p>

                {/* Course */}
                <p
                  className="absolute text-lg font-medium uppercase tracking-widest max-lg:text-sm max-md:text-[10px]"
                  style={{ top: '58%', left: '50%', transform: 'translate(-50%, -50%)' }}
                >
                  {courseTitle}
                </p>

                {/* Date */}
                <p
                  className="absolute text-sm max-md:text-[8px]"
                  style={{ top: '63.5%', left: '50%', transform: 'translate(-50%, -50%)' }}
                >
                  Completed on {end}
                </p>

                {/* ISSUER + PARTNER LOGOS */}
                <div
                  className="absolute flex items-center gap-6 max-lg:gap-3"
                  style={{ bottom: '20%', left: '50%', transform: 'translateX(-50%)' }}
                >
                  {/* Cloud & Beyond */}
                  <div className="bg-white px-3 py-2 rounded-sm max-lg:px-1 max-lg:py-1">
                    <img src={cloudBeyondLogo} className="h-14 object-contain max-lg:h-8 max-md:h-6" />
                  </div>

                  {/* Infilabs */}
                  <div className="bg-white px-3 py-2 rounded-sm max-lg:px-1 max-lg:py-1">
                    <img src={infilabsLogo} className="h-14 object-contain max-lg:h-8 max-md:h-6" />
                  </div>

                  {/* TrainingLabs */}
                  <div className="bg-white px-3 py-2 rounded-sm max-lg:px-1 max-lg:py-1">
                    <img src={trainingLabsLogo} className="h-14 object-contain max-lg:h-8 max-md:h-6" />
                  </div>
                </div>

                {/* Director Signature */}
                <div
                  className="absolute flex flex-col items-start"
                  style={{ bottom: '22%', left: '8%' }}
                >
                  <img
                    src={saravananSign}
                    alt="Saravanan Signature"
                    className="h-10 object-contain max-lg:h-6"
                  />
                  <p className="text-md font-semibold leading-tight max-lg:text-xs">(Saravanan)</p>
                  <p className="text-md text-gray-600 max-lg:text-[10px]">Director</p>
                </div>

                {/* QR */}
                {certificateId && (
                  <div
                    className="absolute bg-white p-2 rounded-md shadow max-lg:p-1"
                    style={{ bottom: '21%', right: '8%' }}
                  >
                    <QRCodeSVG
                      value={`${websiteURL}/verify-certificate?id=${certificateId}`}
                      size={80}
                      className="max-lg:w-12 max-lg:h-12 max-md:w-8 max-md:h-8"
                    />
                    <p className="text-[8px] text-center mt-1 text-gray-500 max-md:text-[6px]">
                      Verify
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div
                  className="absolute w-full text-center"
                  style={{ bottom: '10%' }}
                >
                  <img src={logo} className="h-8 mx-auto mb-1 max-lg:h-5" />
                  <p className="text-sm font-semibold max-lg:text-xs">{appName}</p>
                  <p className="text-[10px] font-mono text-gray-600 max-lg:text-[8px]">
                    Certificate ID: {certificateId}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <p className="text-sm text-muted-foreground mt-4">
          Note: This is a preview. Click "Download" to save a high-quality copy.
        </p>
        {certificateId && (
          <p className="font-mono text-[10px] text-muted-foreground mt-1">Certificate ID: {certificateId}</p>
        )}
      </div>
    </div>
  );
};

export default Certificate;
