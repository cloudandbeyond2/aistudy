
import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { serverURL, recaptchaSiteKey } from "@/constants";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import Logo from "../res/logo.svg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const OrganizationEnquiry = () => {
  const { toast } = useToast();

  const [form, setForm] = useState({
  organizationName: "",
  contactPerson: "",
  email: "",
  phone: "",
  teamSize: "",
  message: "",
  referBy: "",   // ✅ NEW FIELD
});

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  

  const handleChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      toast({
        title: "Verification required",
        description: "Please confirm you are not a robot.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${serverURL}/api/organization-enquiries`, {
        ...form,
        captchaToken,
      });

      toast({
        title: "Enquiry submitted",
        description: "Our enterprise team will contact you shortly.",
      });

      setForm({
        organizationName: "",
        contactPerson: "",
        email: "",
        phone: "",
        teamSize: "",
        message: "",
         referBy: "", 
      });

      setCaptchaToken(null);
    } catch {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a1a2f] text-white">

      {/* ================= HERO ================= */}
      <div className="relative min-h-[75vh] overflow-hidden">

         <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b')",
          }}
        /> 

<div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f3a]/90 via-[#0f2f5f]/80 to-[#0a1a2f]/90" />

        {/* NAVBAR */}
        <header className="absolute top-0 left-0 w-full z-20">
          <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-3 items-center">

            <div className="flex items-center gap-3">
              <img src={Logo} alt="AI Study Logo" className="h-10 w-10" />
              <span className="text-xl font-semibold">
                AI Study
              </span>
            </div>

            <nav className="hidden md:flex justify-center gap-10 text-sm font-medium">
              <Link to="/" className="hover:text-blue-400 transition">
                Home
              </Link>
              <Link to="/contact" className="hover:text-blue-400 transition">
                Contact
              </Link>
            </nav>

            <div className="flex justify-end">
              <a href="#enquiry">
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-full">
                  Get Started
                </Button>
              </a>
            </div>

          </div>
        </header>

        {/* HERO CONTENT */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[65vh] px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Enterprise AI Solutions for Organizational Growth
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mb-8">
            Customized AI training programs designed to strengthen teams,
            improve decision-making, and accelerate digital transformation.
          </p>

          <a href="#enquiry">
            <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full">
              Talk to Our Team
            </Button>
          </a>
        </div>
      </div>

      {/* ================= ENQUIRY ================= */}
      <section
        id="enquiry"
        className="py-20 bg-gradient-to-br from-[#0b1f3a] to-[#0a1a2f]"
      >
        <div className="max-w-xl mx-auto bg-[#132b4d] p-8 rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Organization Enquiry
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="organizationName"
              placeholder="Organization Name"
              value={form.organizationName}
              onChange={handleChange}
              required
              className="bg-white text-black"
            />

            <Input
              name="contactPerson"
              placeholder="Contact Person Name"
              value={form.contactPerson}
              onChange={handleChange}
              required
              className="bg-white text-black"
            />

            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="bg-white text-black"
            />

            <Input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="bg-white text-black"
            />

            <Input
              name="teamSize"
              placeholder="Team Size"
              value={form.teamSize}
              onChange={handleChange}
              className="bg-white text-black"
            />
            <Input
  name="referBy"
  placeholder="Refer By"
  value={form.referBy}
  onChange={handleChange}
  className="bg-white text-black"
/>

            <Textarea
              name="message"
              placeholder="Tell us about your requirement"
              value={form.message}
              onChange={handleChange}
              rows={4}
              required
              className="bg-white text-black"
            />

            <div className="flex justify-center py-2">
              <ReCAPTCHA
                sitekey={recaptchaSiteKey}
                onChange={(token) => setCaptchaToken(token)}
                theme="dark"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Enquiry"}
            </Button>
          </form>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#081624] pt-16 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">

          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={Logo} alt="AI Study Logo" className="h-10 w-10" />
              <span className="text-xl font-semibold">AI Study</span>
            </div>

            <p className="text-slate-400">
              Enterprise AI training platform for modern organizations.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-slate-400">
              <li><Link to="/" className="hover:text-blue-400">Home</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-slate-400">
              <div className="flex items-center gap-3">
                <Mail size={18} />
                <a href="mailto:traininglabs2017@gmail.com">
                  traininglabs2017@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} />
                <a href="tel:8220002535">
                  8220002535
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="text-center text-slate-500 text-sm mt-10">
          © {new Date().getFullYear()} AI Study. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default OrganizationEnquiry;
