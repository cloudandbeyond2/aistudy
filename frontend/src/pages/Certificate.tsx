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
import saravananSign from '../res/saravanan-sign.png';
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

  const [certificateSettings, setCertificateSettings] = useState<any>(null);

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
          {/* Custom Background Image */}
          {certificateSettings?.backgroundImage ? (
            <img
              src={certificateSettings.backgroundImage}
              alt="Certificate Background"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          ) : (
            <img
              src={certificateTemplate}
              alt="Certificate Template"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          )}

          {/* Overlay Content */}
          <div className="relative z-10 flex flex-col items-center h-full w-full pt-20 text-slate-800 font-serif">

            {/* Brand logo + name (bottom-right) */}
            {certificateSettings?.showOrganization && (
              <div
                className="absolute flex flex-col items-end gap-1"
                style={{
                  bottom: certificateSettings?.positions?.organizationLogo?.bottom || '10%',
                  right: certificateSettings?.positions?.organizationLogo?.right || '8%'
                }}
              >
                {certificateSettings?.organizationLogo && (
                  <img
                    src={certificateSettings.organizationLogo}
                    alt="Brand Logo"
                    className="h-16 object-contain"
                  />
                )}
                <p className="text-sm font-semibold text-slate-900">
                  {certificateSettings?.organizationName || appName}
                </p>
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

            {/* Partner Logo */}
            {certificateSettings?.showPartnerLogo && certificateSettings?.partnerLogo && (
              <div className="absolute top-[75%]">
                <img
                  src={certificateSettings.partnerLogo}
                  alt="Partner Logo"
                  className="h-12 object-contain"
                />
              </div>
            )}

{/* Bottom-left block (QR + Signature + Date) */}
                <div
                  className="absolute flex flex-col items-start gap-4"
                  style={{
                    bottom: certificateSettings?.positions?.signature?.bottom || '10%',
                    left: certificateSettings?.positions?.signature?.left || '8%'
                  }}
                >
                  {certificateId && (
                    <QRCodeSVG
                      value={`${certificateSettings?.qrCodeUrl || websiteURL}/verify-certificate?id=${certificateId}`}
                      size={parseInt(certificateSettings?.sizes?.qrCodeSize || '55')}
                      className="max-lg:w-12 max-lg:h-12 max-md:w-8 max-md:h-8"
                    />
                  )}

                  <div className="flex flex-col items-start gap-2 min-w-[180px]">
                    {certificateSettings?.ceoSignature && (
                      <img
                        src={certificateSettings.ceoSignature}
                        alt="Signature"
                        style={{
                          height: certificateSettings?.sizes?.signatureHeight || '40px'
                        }}
                        className="object-contain"
                      />
                    )}
                    <div className="w-40 border-t border-slate-400"></div>
                    <p className="text-xs md:text-sm font-semibold text-slate-600 uppercase tracking-widest">
                      {certificateSettings?.signatureTitle || 'Director'}
                    </p>

                    <div>
                      <p className="text-sm font-medium text-slate-700" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {end}
                      </p>
                      <p className="text-xs md:text-sm font-semibold text-slate-600 uppercase tracking-widest">Date</p>
                    </div>
                  </div>
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

                {/* Organization logo + name (bottom-left) */}
                {certificateSettings?.showOrganization && (
                  <div
                    className="absolute flex flex-col gap-1"
                    style={{
                      bottom: certificateSettings?.positions?.organizationName?.bottom || '10%',
                      left: certificateSettings?.positions?.organizationName?.left || '8%'
                    }}
                  >
                    {certificateSettings?.organizationLogo && (
                      <img
                        src={certificateSettings.organizationLogo}
                        alt="Organization Logo"
                        style={{
                          height: certificateSettings?.sizes?.organizationLogoHeight || '50px'
                        }}
                        className="object-contain"
                      />
                    )}
                    <p className="text-sm font-semibold text-slate-900">
                      {certificateSettings?.organizationName || appName}
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
                  {certificateSettings?.organizationName || appName}
                </div>

                {/* Name */}
                <p
                  className="absolute text-4xl font-semibold italic max-lg:text-2xl max-md:text-lg"
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
                  className="absolute text-lg font-medium uppercase tracking-widest max-lg:text-sm max-md:text-[10px]"
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
                    className="absolute text-sm max-md:text-[8px] text-center px-4"
                    style={{
                      top: certificateSettings?.positions?.description?.top || '62%',
                      left: certificateSettings?.positions?.description?.left || '50%',
                      right: certificateSettings?.positions?.description?.right || 'auto',
                      bottom: certificateSettings?.positions?.description?.bottom || 'auto',
                      transform: certificateSettings?.positions?.description?.left === '50%' ? 'translate(-50%, -50%)' : 'translateY(-50%)'
                    }}
                  >
                    {certificateSettings.certificateDescription}
                  </p>
                )}

                {/* Bottom bar: QR + Signature + Date (left) & Brand (right) */}
                <div
                  className="absolute left-[8%] right-[8%] bottom-[10%] flex justify-between items-end"
                  style={{
                    bottom: certificateSettings?.positions?.signature?.bottom || '10%',
                    left: certificateSettings?.positions?.signature?.left || '8%',
                    right: certificateSettings?.positions?.organizationLogo?.right || '8%'
                  }}
                >
                  <div className="flex flex-col items-start gap-3 min-w-[180px]">
                    {certificateId && (
                      <QRCodeSVG
                        value={`${certificateSettings?.qrCodeUrl || websiteURL}/verify-certificate?id=${certificateId}`}
                        size={parseInt(certificateSettings?.sizes?.qrCodeSize || '55')}
                        className="max-lg:w-12 max-lg:h-12 max-md:w-8 max-md:h-8"
                      />
                    )}

                    <div className="flex flex-col items-start gap-1">
                      {certificateSettings?.ceoSignature ? (
                        <img
                          src={certificateSettings.ceoSignature}
                          alt="Director Signature"
                          style={{
                            height: certificateSettings?.sizes?.signatureHeight || '40px'
                          }}
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
                      {end && (
                        <p className="text-xs text-slate-600 uppercase tracking-widest">
                          Date: {end}
                        </p>
                      )}
                      {certificateId && (
                        <p className="text-[10px] font-mono text-gray-600 max-lg:text-[8px]">
                          Certificate ID: {certificateId}
                        </p>
                      )}
                    </div>
                  </div>

                  {certificateSettings?.showOrganization && (
                    <div className="flex flex-col items-end gap-1">
                      {certificateSettings?.organizationLogo ? (
                        <img
                          src={certificateSettings.organizationLogo}
                          alt="Organization Logo"
                          style={{
                            height: certificateSettings?.sizes?.organizationLogoHeight || '50px'
                          }}
                          className="object-contain"
                        />
                      ) : certificateSettings?.logo ? (
                        <img
                          src={certificateSettings.logo}
                          alt="Logo"
                          style={{
                            height: certificateSettings?.sizes?.organizationLogoHeight || '50px'
                          }}
                          className="object-contain"
                        />
                      ) : (
                        <img src={logo} alt="Logo" className="h-8 object-contain" />
                      )}
                      <p className="text-sm font-semibold text-slate-900">
                        {certificateSettings?.organizationName || appName}
                      </p>
                    </div>
                  )}
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
