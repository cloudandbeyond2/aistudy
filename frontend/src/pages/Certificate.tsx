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
import saravananSign from '../res/saravanan-sign.png';
import { toPng } from 'html-to-image';
import { Card, CardContent } from '@/components/ui/card';

const certificateTemplate = '/assets/images/certificate_template_blue.jpg';

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

  const [certificateSettings, setCertificateSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const type = isOrgStudent ? 'org' : 'regular';
        const response = await axios.get(`${serverURL}/api/certificate-settings?type=${type}`);
        setCertificateSettings(response.data);
      } catch (error) {
        console.error('Error fetching certificate settings:', error);
      }
    };

    fetchSettings();

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
          {/* Custom Background Image for Org Students is always the blue template */}
          <img
            src={certificateTemplate}
            alt="Certificate Template"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />

          {/* Overlay Content */}
          <div className="relative z-10 flex flex-col items-center h-full w-full pt-20 text-slate-800 font-serif">

            {/* Brand logo + name (bottom-right) */}
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
              <p className="text-lg md:text-xl italic text-slate-500">This is to certify that</p>
            </div>

            {/* Student Name */}
            <div className="absolute top-[44%] w-full text-center px-8">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-wide uppercase" style={{ fontFamily: 'Times New Roman, serif' }}>
                {userName}
              </h1>
            </div>

            {/* Custom Certificate Description */}
            <div className="absolute top-[52%] w-full text-center px-12">
              <p className="text-md md:text-lg text-slate-600 leading-relaxed">
                {certificateSettings?.certificateDescription || 'has successfully demonstrated proficient comprehension in the course of'}
              </p>
            </div>

            {/* Course Topic */}
            <div className="absolute top-[63%] w-full text-center px-10">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 uppercase tracking-wider">
                "{courseTitle}"
              </h2>
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
              {/* Cover up built-in text with bg-white */}
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
              {certificateId && (
                <QRCodeSVG
                  value={`${certificateSettings?.qrCodeUrl || websiteURL}/verify-certificate?id=${certificateId}`}
                  size={parseInt(certificateSettings?.sizes?.qrCodeSize || '55')}
                  className="max-lg:w-12 max-lg:h-12 max-md:w-8 max-md:h-8 mb-2"
                />
              )}
              {certificateId && (
                <p className="text-[10px] md:text-[11px] font-mono text-slate-700 mb-1 font-bold">
                  ID: {certificateId.substring(0, 8).toUpperCase()}
                </p>
              )}
              {end && !isNaN(new Date(end).getTime()) && (
                <p className="text-sm md:text-md font-medium text-slate-700 mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {new Date(end).toLocaleDateString()}
                </p>
              )}
            </div>

          </div>
        </div>
      ) : (
        /* Regular User UI - Original Detailed Layout */
        <Card className="w-full max-w-4xl shadow-none bg-transparent border-none" style={{ backgroundColor: 'transparent' }}>
          <CardContent className="p-0 bg-transparent" style={{ backgroundColor: 'transparent' }}>
            {/* Header */}
            <div className="text-center p-8 border-b">
              <Award className="h-14 w-14 mx-auto text-primary mb-3" />
              <h1 className="text-3xl font-bold">Certificate of Completion</h1>
              <p className="text-muted-foreground mt-2">
                This certifies successful course completion
              </p>
            </div>

            {/* Certificate */}
            <div className="p-6 overflow-hidden bg-transparent">
              <div ref={certificateRef} className="relative w-full aspect-[1.414/1] font-serif overflow-hidden bg-transparent">
                {/* Background (custom or default) */}
                <img
                  src={certificateSettings?.backgroundImage || certificate}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Certificate Background"
                />

                {/* Organization logo (independently positioned) */}
                {certificateSettings?.showOrganization && certificateSettings?.organizationLogo && (
                  <div
                    className="absolute flex flex-col items-center gap-1"
                    style={{
                      top: certificateSettings?.positions?.organizationLogo?.top || '10%',
                      bottom: certificateSettings?.positions?.organizationLogo?.bottom || 'auto',
                      left: certificateSettings?.positions?.organizationLogo?.left || '50%',
                      right: certificateSettings?.positions?.organizationLogo?.right || 'auto',
                      transform: certificateSettings?.positions?.organizationLogo?.left === '50%' ? 'translateX(-50%)' : 'none',
                    }}
                  >
                    <img
                      src={certificateSettings.organizationLogo}
                      alt="Organization Logo"
                      style={{ height: certificateSettings?.sizes?.organizationLogoHeight || '50px' }}
                      className="object-contain"
                    />
                  </div>
                )}

                {/* Organization name (independently positioned) */}
                {certificateSettings?.showOrganization && certificateSettings?.organizationName && (
                  <div
                    className="absolute whitespace-nowrap"
                    style={{
                      top: certificateSettings?.positions?.organizationName?.top || '17%',
                      bottom: certificateSettings?.positions?.organizationName?.bottom || 'auto',
                      left: certificateSettings?.positions?.organizationName?.left || '50%',
                      right: certificateSettings?.positions?.organizationName?.right || 'auto',
                      transform: certificateSettings?.positions?.organizationName?.left === '50%' ? 'translateX(-50%)' : 'none',
                    }}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {certificateSettings.organizationName}
                    </p>
                  </div>
                )}

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
                  {certificateSettings?.organizationName}
                </div>

                {/* Name */}
                <p
                  className="absolute text-4xl font-semibold italic max-lg:text-2xl max-md:text-lg whitespace-nowrap"
                  style={{
                    top: certificateSettings?.positions?.name?.top || '46%',
                    left: certificateSettings?.positions?.name?.left || '50%',
                    right: certificateSettings?.positions?.name?.right || 'auto',
                    bottom: certificateSettings?.positions?.name?.bottom || 'auto',
                    transform: certificateSettings?.positions?.name?.left === '50%' ? 'translate(-50%, -50%)' : 'translateY(-50%)'
                  }}
                >
                  {userName}
                </p>

                {/* Course */}
                <p
                  className="absolute text-lg font-medium uppercase tracking-widest max-lg:text-sm max-md:text-[10px] whitespace-nowrap text-center"
                  style={{
                    top: certificateSettings?.positions?.courseName?.top || '58%',
                    left: certificateSettings?.positions?.courseName?.left || '50%',
                    right: certificateSettings?.positions?.courseName?.right || 'auto',
                    bottom: certificateSettings?.positions?.courseName?.bottom || 'auto',
                    transform: certificateSettings?.positions?.courseName?.left === '50%' ? 'translate(-50%, -50%)' : 'translateY(-50%)'
                  }}
                >
                  {courseTitle}
                </p>

                {/* Custom Description */}
                {certificateSettings?.certificateDescription && (
                  <p
                    className="absolute text-sm max-md:text-[8px] text-center px-4 w-3/4"
                    style={{
                      top: certificateSettings?.positions?.description?.top || '65%',
                      left: certificateSettings?.positions?.description?.left || '50%',
                      right: certificateSettings?.positions?.description?.right || 'auto',
                      bottom: certificateSettings?.positions?.description?.bottom || 'auto',
                      transform: certificateSettings?.positions?.description?.left === '50%' ? 'translate(-50%, -50%)' : 'translateY(-50%)'
                    }}
                  >
                    {certificateSettings.certificateDescription}
                  </p>
                )}

                {/* Director Signature (Left) */}
                <div
                  className="absolute flex flex-col items-center gap-1"
                  style={{
                    top: 'auto',
                    bottom: certificateSettings?.positions?.signature?.bottom || '12%',
                    left: certificateSettings?.positions?.signature?.left || '12%',
                    right: 'auto',
                    transform: certificateSettings?.positions?.signature?.left === '50%' ? 'translateX(-50%)' : 'none',
                  }}
                >
                  {certificateSettings?.ceoSignature ? (
                    <img
                      src={certificateSettings.ceoSignature}
                      alt="Director Signature"
                      style={{ height: certificateSettings?.sizes?.signatureHeight || '40px' }}
                      className="object-contain max-lg:h-6"
                    />
                  ) : (
                    <img
                      src={saravananSign}
                      alt="Saravanan Signature"
                      className="h-10 object-contain max-lg:h-6"
                    />
                  )}
                  <p className="text-md font-semibold leading-tight max-lg:text-xs">
                    ({certificateSettings?.ceoName || 'Saravanan'})
                  </p>
                  <p className="text-md text-gray-600 max-lg:text-[10px]">
                    {certificateSettings?.signatureTitle || 'Director'}
                  </p>
                </div>

                {/* Date (Right or relative to settings) */}
                {end && (
                  <div
                    className="absolute flex flex-col items-center gap-1"
                    style={{
                      top: 'auto',
                      bottom: (!certificateSettings?.positions?.date?.bottom || certificateSettings?.positions?.date?.bottom === 'auto') ? '12%' : certificateSettings.positions.date.bottom,
                      left: 'auto',
                      right: (!certificateSettings?.positions?.date?.right || certificateSettings?.positions?.date?.right === 'auto') ? '12%' : certificateSettings.positions.date.right,
                      transform: 'none',
                    }}
                  >
                    <p className="text-lg font-medium tracking-widest text-[#0c2f46]">
                      {end && !isNaN(new Date(end).getTime()) ? new Date(end).toLocaleDateString() : ''}
                    </p>
                    <div className="w-48 border-t border-slate-400 mx-auto"></div>
                    <p className="text-xs text-slate-800 uppercase tracking-widest mt-1">
                      Date
                    </p>
                  </div>
                )}

                {/* QR Code (Bottom Right as requested by user fallback default) */}
                {certificateId && (
                  <div
                    className="absolute flex flex-col items-center gap-1"
                    style={{
                      top: 'auto',
                      bottom: (!certificateSettings?.positions?.qrCode?.bottom || certificateSettings?.positions?.qrCode?.bottom === 'auto' || certificateSettings?.positions?.qrCode?.bottom === '6%') ? '24%' : certificateSettings.positions.qrCode.bottom,
                      left: 'auto',
                      right: (!certificateSettings?.positions?.qrCode?.right || certificateSettings?.positions?.qrCode?.right === 'auto') ? '12%' : certificateSettings.positions.qrCode.right,
                      transform: 'none',
                    }}
                  >
                    <QRCodeSVG
                      value={`${certificateSettings?.qrCodeUrl || websiteURL}/verify-certificate?id=${certificateId}`}
                      size={parseInt(certificateSettings?.sizes?.qrCodeSize || '55')}
                      className="max-lg:w-12 max-lg:h-12 max-md:w-8 max-md:h-8"
                    />
                    <p className="text-[10px] font-mono text-gray-600 max-lg:text-[8px] bg-white/70 px-1 rounded">
                      ID: {certificateId.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                )}
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
