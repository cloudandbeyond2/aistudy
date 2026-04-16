import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { websiteURL, serverURL } from '@/constants';
import { 
  Mail, 
  Phone, 
  User, 
  Building2, 
  Briefcase, 
  Calendar,
  ShieldCheck,
  Star,
  Download,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';

interface DigitalIDCardProps {
  student: {
    _id: string;
    mName: string;
    email: string;
    phone?: string;
    profileImage?: string;
    studentDetails?: {
      rollNo?: string;
      department?: string;
      batch?: string;
      academicYear?: string;
    };
    organizationId?: {
      mName?: string;
      organizationDetails?: {
        institutionName?: string;
      }
    };
  };
  organization?: {
    name?: string;
    logo?: string;
  };
}

const DigitalIDCard: React.FC<DigitalIDCardProps> = ({ student, organization }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const portfolioUrl = `${websiteURL}/portfolio/${student._id}`;
  const orgName = student.organizationId?.organizationDetails?.institutionName || student.organizationId?.mName || organization?.name || "Colossus IQ Academy";

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    
    try {
      setIsExporting(true);
      
      const element = cardRef.current;
      
      // Use html-to-image for better CSS fidelity
      const dataUrl = await toPng(element, {
        pixelRatio: 3,
        skipFonts: false,
        backgroundColor: '#0f172a', // Match slate-900
      });
      
      // ID-1 standard is 85.6mm x 53.98mm
      const imgWidth = 85.6;
      // Calculate height based on 340/540 ratio
      const imgHeight = (540 * imgWidth) / 340; 
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [imgWidth + 4, imgHeight + 4] // Add 2mm bleed on each side
      });
      
      pdf.addImage(dataUrl, 'PNG', 2, 2, imgWidth, imgHeight);
      pdf.save(`${student.mName.replace(/\s+/g, '_')}_ID_Card.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div 
        ref={cardRef}
        data-id-card="main"
        className="relative w-[340px] h-[540px] rounded-[3rem] bg-slate-900 border border-white/10 group select-none flex flex-col p-6 shadow-2xl overflow-hidden"
      >
        {/* Background Decos */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />
        
        {/* Header */}
        <div className="relative text-center pt-2 mb-4">
          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-inner">
               <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-1">Student Identity</h3>
          <p className="text-white/40 text-[9px] uppercase tracking-widest font-semibold line-clamp-1 h-3">{orgName}</p>
        </div>

        {/* Profile Section */}
        <div className="relative flex flex-col items-center gap-3 mb-6">
           <div className="relative">
              <div className="w-28 h-28 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden bg-slate-800 ring-1 ring-white/10">
                {student.profileImage ? (
                  <img 
                    crossOrigin="anonymous"
                    src={`${serverURL}${student.profileImage}`} 
                    alt={student.mName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white/10">
                    <User className="w-14 h-14" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-lg shadow-lg ring-2 ring-slate-900">
                <Star className="w-2.5 h-2.5 fill-current" />
              </div>
           </div>
           
           <div className="text-center px-4 w-full">
              <h2 className="text-2xl font-black text-white tracking-tight leading-tight mb-0.5 line-clamp-1">{student.mName}</h2>
              <p className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.1em] opacity-80 truncate">
                {student.studentDetails?.department || "General Student"}
              </p>
           </div>
        </div>

        {/* Details List */}
        <div className="relative flex flex-col gap-2 px-1 mb-4">
           <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-2xl border border-white/10">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 flex-shrink-0">
                 <Briefcase className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest leading-none mb-1">ID Number</span>
                 <span className="text-xs text-white/90 font-mono font-bold leading-none">{student.studentDetails?.rollNo || "NOT ASSIGNED"}</span>
              </div>
           </div>

           <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-2xl border border-white/10">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 flex-shrink-0">
                 <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest leading-none mb-1">Academic Year</span>
                 <span className="text-xs text-white/90 font-bold leading-none">{student.studentDetails?.academicYear || "2024-25"}</span>
              </div>
           </div>
        </div>

        {/* Footer - Pushed to bottom via mt-auto */}
        <div className="relative mt-auto flex items-end justify-between gap-4 pb-4">
           <div className="flex-1 space-y-1.5 overflow-hidden pb-1">
              <div className="flex items-center gap-2 text-white/40">
                 <Mail className="w-3 h-3 flex-shrink-0" />
                 <span className="text-[9px] font-medium truncate tracking-tight">{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                 <Phone className="w-3 h-3 flex-shrink-0" />
                 <span className="text-[9px] font-medium">{student.phone || "---"}</span>
              </div>
           </div>
           
           <div className="relative p-1 bg-white rounded-lg shadow-xl shrink-0">
              <QRCodeSVG 
                value={portfolioUrl} 
                size={54} 
                level="H"
                includeMargin={false}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-2.5 h-2.5 bg-white border border-slate-100 rounded-sm" />
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
         <Button 
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="w-full max-w-[340px] bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl py-6 shadow-xl hover:shadow-blue-500/25 transition-all group"
         >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform" />
            )}
            {isExporting ? "Generating PDF..." : "Export as Digital ID (PDF)"}
         </Button>

         <p className="text-[10px] text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Premium Verifiable Student Credential
         </p>
      </div>
    </div>
  );
};

export default DigitalIDCard;
