
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import { serverURL, recaptchaSiteKey } from "@/constants";
// import ReCAPTCHA from "react-google-recaptcha";
// import { Link } from "react-router-dom";
// import { Mail, Phone } from "lucide-react";
// import Logo from "../res/logo.svg";


// const OrganizationEnquiry = () => {
//   const { toast } = useToast();

//   const [form, setForm] = useState({
//     organizationName: "",
//     contactPerson: "",
//     email: "",
//     phone: "",
//     teamSize: "",
//     message: "",
//     referBy: "",
//   });

//   const [captchaToken, setCaptchaToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!captchaToken) {
//       toast({
//         title: "Verification required",
//         description: "Please confirm you are not a robot.",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       setLoading(true);

//       await axios.post(`${serverURL}/api/organization-enquiries`, {
//         ...form,
//         captchaToken,
//       });

//       toast({
//         title: "Enquiry submitted",
//         description: "Our enterprise team will contact you shortly.",
//       });

//       setForm({
//         organizationName: "",
//         contactPerson: "",
//         email: "",
//         phone: "",
//         teamSize: "",
//         message: "",
//         referBy: "",
//       });

//       setCaptchaToken(null);
//     } catch {
//       toast({
//         title: "Submission failed",
//         description: "Please try again later.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-[#0a1a2f] text-white">

//       {/* ================= HERO ================= */}
//       <div className="relative min-h-[75vh] overflow-hidden">

//         {/* Background */}
//         <div
//   className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
//   style={{
//     backgroundImage: "url('/enterprise-hero.png')",
//   }}
// />
//         {/* Overlay */}
//         <div className="absolute inset-0 bg-black/40" />

//         {/* Gradient */}
//         <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f3a]/60 via-[#0f2f5f]/40 to-[#0a1a2f]/60" />

//         {/* NAVBAR */}
//         <header className="absolute top-0 left-0 w-full z-20">
//           <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-3 items-center">

//             <div className="flex items-center gap-3">
//               <img src={Logo} alt="Colossus IQ Logo" className="h-10 w-10" />
//               <span className="text-xl font-semibold">Colossus IQ</span>
//             </div>

//             <nav className="hidden md:flex justify-center gap-10 text-sm font-medium">
//               <Link to="/" className="hover:text-blue-400 transition">
//                 Home
//               </Link>
//               <Link to="/contact" className="hover:text-blue-400 transition">
//                 Contact
//               </Link>
//             </nav>

//             <div className="flex justify-end">
//               <a href="#enquiry">
//                 <Button className="bg-blue-600 hover:bg-blue-700 rounded-full">
//                   Get Started
//                 </Button>
//               </a>
//             </div>

//           </div>
//         </header>

//         {/* HERO CONTENT */}
//         <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[65vh] px-6">

//           <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
//             Enterprise AI Solutions for Organizational Growth
//           </h1>

//           <p className="text-lg text-slate-300 max-w-3xl mb-8 leading-relaxed">
//             Customized AI training programs designed to strengthen teams,
//             improve decision-making, and accelerate digital transformation.
//           </p>

//           <a href="#enquiry">
//             <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full hover:scale-105 transition">
//               Talk to Our Team
//             </Button>
//           </a>

//         </div>
//       </div>

//       {/* ================= ENQUIRY ================= */}
//       <section
//         id="enquiry"
//         className="py-20 bg-gradient-to-br from-[#0b1f3a] to-[#0a1a2f]"
//       >
//         <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 shadow-xl">

//           <h2 className="text-2xl font-bold mb-6 text-center">
//             Organization Enquiry
//           </h2>

//           <form onSubmit={handleSubmit} className="space-y-5">

//             <Input
//               name="organizationName"
//               placeholder="Organization Name"
//               value={form.organizationName}
//               onChange={handleChange}
//               required
//               className="bg-white text-black"
//             />

//             <Input
//               name="contactPerson"
//               placeholder="Contact Person Name"
//               value={form.contactPerson}
//               onChange={handleChange}
//               required
//               className="bg-white text-black"
//             />

//             <Input
//               type="email"
//               name="email"
//               placeholder="Email Address"
//               value={form.email}
//               onChange={handleChange}
//               required
//               className="bg-white text-black"
//             />

//             <Input
//               name="phone"
//               placeholder="Phone Number"
//               value={form.phone}
//               onChange={handleChange}
//               className="bg-white text-black"
//             />

//             <Input
//               name="teamSize"
//               placeholder="Team Size"
//               value={form.teamSize}
//               onChange={handleChange}
//               className="bg-white text-black"
//             />

//             <Input
//               name="referBy"
//               placeholder="Refer By"
//               value={form.referBy}
//               onChange={handleChange}
//               className="bg-white text-black"
//             />

//             <Textarea
//               name="message"
//               placeholder="Tell us about your requirement"
//               value={form.message}
//               onChange={handleChange}
//               rows={4}
//               required
//               className="bg-white text-black"
//             />

//             <div className="flex justify-center py-2">
//               <ReCAPTCHA
//                 sitekey={recaptchaSiteKey}
//                 onChange={(token) => setCaptchaToken(token)}
//                 theme="dark"
//               />
//             </div>

//             <Button
//               type="submit"
//               className="w-full bg-blue-600 hover:bg-blue-700"
//               disabled={loading}
//             >
//               {loading ? "Submitting..." : "Submit Enquiry"}
//             </Button>

//           </form>
//         </div>
//       </section>

//       {/* ================= FOOTER ================= */}
//       <footer className="bg-[#081624] pt-16 pb-8 border-t border-white/10">

//         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">

//           <div>
//             <div className="flex items-center gap-3 mb-4">
//               <img src={Logo} alt="Colossus IQ Logo" className="h-10 w-10" />
//               <span className="text-xl font-semibold">Colossus IQ</span>
//             </div>

//             <p className="text-slate-400">
//               Enterprise AI training platform for modern organizations.
//             </p>
//           </div>

//           <div>
//             <h3 className="font-semibold mb-4">Quick Links</h3>
//             <ul className="space-y-3 text-slate-400">
//               <li>
//                 <Link to="/contact" className="hover:text-blue-400">
//                   Contact
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           <div>
//             <h3 className="font-semibold mb-4">Contact Us</h3>

//             <div className="space-y-3 text-slate-400">

//               <div className="flex items-center gap-3">
//                 <Mail size={18} />
//                 <a href="mailto:info@colossusiq.com">
//                   info@colossusiq.com
//                 </a>
//               </div>

//               <div className="flex items-center gap-3">
//                 <Phone size={18} />
//                 <a href="tel:+91 82200 02535">+91 82200 02535</a>
//               </div>

//             </div>
//           </div>

//         </div>

//         <div className="text-center text-slate-500 text-sm mt-10">
//           © {new Date().getFullYear()} Colossus IQ. All rights reserved.
//         </div>

//       </footer>

//     </div>
//   );
// };

// export default OrganizationEnquiry;


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { serverURL, recaptchaSiteKey } from "@/constants";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from "react-router-dom";
import { Mail, Phone, Quote, CheckCircle2 } from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const OrganizationEnquiry = () => {
  const { toast } = useToast();
  const { appName, appLogo } = useBranding();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [form, setForm] = useState({
    organizationName: "",
    contactPerson: "",
    email: "",
    phone: "",
    teamSize: "",
    message: "",
    referBy: "",
  });

  const [errors, setErrors] = useState({});
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const validate = () => {
    let newErrors = {};
    if (!form.organizationName.trim()) newErrors.organizationName = "Organization required";
    if (!/^[A-Za-z ]{3,}$/.test(form.contactPerson)) newErrors.contactPerson = "Min 3 letters only";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Invalid email";
    if (!/^[0-9]{10,15}$/.test(form.phone)) newErrors.phone = "Invalid phone";
    if (!form.teamSize.trim()) newErrors.teamSize = "Required";
    if (form.message.length < 10) newErrors.message = "Min 10 chars";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!captchaToken) {
      toast({ title: "Captcha required", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${serverURL}/api/organization-enquiries`, { ...form, captchaToken });
      
      // Trigger Success Modal
      setShowSuccessModal(true);

      // Reset form
      setForm({ organizationName: "", contactPerson: "", email: "", phone: "", teamSize: "", message: "", referBy: "" });
      setErrors({});
      setCaptchaToken(null);
    } catch (error) {
      toast({ title: "Error", description: "Submission failed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const scrollToEnquiry = () => {
    const element = document.getElementById("enquiry");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-[#0a1a2f] text-white min-h-screen font-sans selection:bg-primary/30 relative">
      
      {/* HEADER */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-4 transition-all",
          isScrolled
            ? "bg-[#0a1a2f]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <img src={appLogo} alt="Logo" className="h-7 w-7 object-contain" />
            </motion.div>

            <span className="font-black text-2xl tracking-tighter text-white">
              {appName}
              <span className="text-primary text-4xl leading-[0]">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-bold text-white/80 hover:text-white transition-colors">Home</Link>
            <Link to="/contact" className="text-sm font-bold text-white/80 hover:text-white transition-colors">Contact</Link>
            <Button 
              onClick={scrollToEnquiry}
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full px-8 h-11 shadow-xl shadow-primary/20 hover:scale-105 transition"
            >
              Get Started
            </Button>
          </nav>

          <div className="md:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-full left-0 right-0 bg-[#0a1a2f] border-b border-white/10 overflow-hidden"
            >
              <div className="p-8 flex flex-col space-y-4">
                <Link to="/" className="text-xl font-bold py-2">Home</Link>
                <Link to="/contact" className="text-xl font-bold py-2">Contact</Link>
                <Button onClick={() => { setIsMobileMenuOpen(false); scrollToEnquiry(); }} className="w-full h-14 rounded-2xl font-bold text-lg bg-primary">
                  Get Started
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-44 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              ENTERPRISE SOLUTIONS
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tighter">
              Empower Your <span className="text-primary">Workforce</span>
            </h1>
            
            <div className="relative p-6 bg-white/5 border-l-4 border-primary rounded-r-2xl mb-8">
               <Quote className="absolute -top-3 -left-3 text-primary fill-primary opacity-20 h-10 w-10" />
               <p className="text-lg italic text-slate-300">
            Empowering institutions to manage, train, and grow talent through one unified digital platform.
               </p>
            </div>

            <p className="text-slate-400 text-lg max-w-lg mb-8">
              Join leading organizations using {appName} to bridge the gap between AI potential and business results.
            </p>

            <Button 
                onClick={scrollToEnquiry}
                className="bg-primary hover:bg-primary/90 h-14 px-10 rounded-xl text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105"
            >
              Start Your Organization Setup
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
              alt="Team Collaboration" 
              className="relative rounded-[2rem] border border-white/10 shadow-2xl grayscale-[20%] hover:grayscale-0 transition-all duration-500"
            />
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section id="enquiry" className="py-24 px-6 bg-[#0a1a2f] relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Organization Enquiry</h2>
            <p className="text-slate-400">Fill out the form below and our team will be in touch.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <Input name="organizationName" placeholder="Organization Name" value={form.organizationName} onChange={handleChange} className="h-14 bg-white text-black rounded-xl" />
                <p className="text-red-400 text-xs px-1">{errors.organizationName}</p>
              </div>
              <div className="space-y-1">
                <Input name="contactPerson" placeholder="Contact Person" value={form.contactPerson} onChange={handleChange} className="h-14 bg-white text-black rounded-xl" />
                <p className="text-red-400 text-xs px-1">{errors.contactPerson}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <Input name="email" placeholder="Work Email" value={form.email} onChange={handleChange} className="h-14 bg-white text-black rounded-xl" />
                <p className="text-red-400 text-xs px-1">{errors.email}</p>
              </div>
              <div className="space-y-1">
                <Input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="h-14 bg-white text-black rounded-xl" />
                <p className="text-red-400 text-xs px-1">{errors.phone}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <Input name="teamSize" placeholder="Estimated Team Size" value={form.teamSize} onChange={handleChange} className="h-14 bg-white text-black rounded-xl" />
                <p className="text-red-400 text-xs px-1">{errors.teamSize}</p>
              </div>
              <div className="space-y-1">
                <Input name="referBy" placeholder="Referred By (Optional)" value={form.referBy} onChange={handleChange} className="h-14 bg-white text-black rounded-xl" />
              </div>
            </div>

            <Textarea name="message" placeholder="How can we help your organization?" rows={4} value={form.message} onChange={handleChange} className="bg-white text-black rounded-xl py-4 resize-none" />
            <p className="text-red-400 text-xs px-1 -mt-4">{errors.message}</p>

            <div className="flex justify-center py-4 bg-white/5 rounded-2xl">
              <ReCAPTCHA sitekey={recaptchaSiteKey} onChange={setCaptchaToken} theme="dark" />
            </div>

            <Button disabled={loading} className="w-full bg-primary hover:bg-primary/90 h-16 rounded-xl text-xl font-bold shadow-lg shadow-primary/40 transition-all active:scale-95">
              {loading ? "Sending..." : "Submit Enquiry"}
            </Button>
          </form>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#020817] pt-20 pb-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }} 
                className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
              >
                <img src={appLogo} className="h-7 w-7" alt="App Logo" />
              </motion.div>
              <span className="font-black text-3xl tracking-tighter text-white">
                {appName}<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              AI-driven course solutions for organizational learning. Built for institutions and professional teams to scale intelligence effectively.
            </p>
          </div>

          <div className="space-y-8 md:ml-auto">
            <h3 className="font-bold text-2xl text-primary">Get In Touch</h3>
            <div className="space-y-6">
              <a href="mailto:info@colossusiq.com" className="flex items-center gap-5 text-slate-300 hover:text-primary transition group cursor-pointer">
                <div className="p-4 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-all">
                    <Mail size={28} className="text-primary" />
                </div>
                <span className="text-xl font-medium tracking-wide">info@colossusiq.com</span>
              </a>
              <a href="tel:+918220002535" className="flex items-center gap-5 text-slate-300 hover:text-primary transition group cursor-pointer">
                <div className="p-4 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-all">
                    <Phone size={28} className="text-primary" />
                </div>
                <span className="text-xl font-medium tracking-wide">+91 82200 02535</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-20 pt-10 border-t border-white/5 text-slate-500 text-sm">
          © {new Date().getFullYear()} {appName}. All rights reserved.
        </div>
      </footer>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-[#0a1a2f]/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#112240] text-white p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl max-w-lg w-full text-center"
            >
              <div className="h-24 w-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <CheckCircle2 size={48} />
              </div>
              
              <h2 className="text-4xl font-black mb-4 tracking-tighter">Enquiry Sent!</h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Thank you for reaching out. Our enterprise team will review your requirements and contact you within 24–48 hours.
              </p>
              
              <Button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-primary hover:bg-primary/90 text-white h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 transition-transform active:scale-95"
              >
                Done
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default OrganizationEnquiry;