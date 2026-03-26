import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { serverURL, recaptchaSiteKey } from "@/constants";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from "react-router-dom";
import { Mail, Phone, Quote, CheckCircle2, ChevronDown, Search } from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Country Data ─────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "IN", name: "India",          dialCode: "+91",  flag: "🇮🇳", phoneLength: [10] },
  { code: "US", name: "United States",  dialCode: "+1",   flag: "🇺🇸", phoneLength: [10] },
  { code: "GB", name: "United Kingdom", dialCode: "+44",  flag: "🇬🇧", phoneLength: [10] },
  { code: "AU", name: "Australia",      dialCode: "+61",  flag: "🇦🇺", phoneLength: [9]  },
  { code: "CA", name: "Canada",         dialCode: "+1",   flag: "🇨🇦", phoneLength: [10] },
  { code: "DE", name: "Germany",        dialCode: "+49",  flag: "🇩🇪", phoneLength: [10, 11] },
  { code: "FR", name: "France",         dialCode: "+33",  flag: "🇫🇷", phoneLength: [9]  },
  { code: "JP", name: "Japan",          dialCode: "+81",  flag: "🇯🇵", phoneLength: [10, 11] },
  { code: "CN", name: "China",          dialCode: "+86",  flag: "🇨🇳", phoneLength: [11] },
  { code: "SG", name: "Singapore",      dialCode: "+65",  flag: "🇸🇬", phoneLength: [8]  },
  { code: "AE", name: "UAE",            dialCode: "+971", flag: "🇦🇪", phoneLength: [9]  },
  { code: "SA", name: "Saudi Arabia",   dialCode: "+966", flag: "🇸🇦", phoneLength: [9]  },
  { code: "ZA", name: "South Africa",   dialCode: "+27",  flag: "🇿🇦", phoneLength: [9]  },
  { code: "BR", name: "Brazil",         dialCode: "+55",  flag: "🇧🇷", phoneLength: [10, 11] },
  { code: "MX", name: "Mexico",         dialCode: "+52",  flag: "🇲🇽", phoneLength: [10] },
  { code: "NG", name: "Nigeria",        dialCode: "+234", flag: "🇳🇬", phoneLength: [10] },
  { code: "PK", name: "Pakistan",       dialCode: "+92",  flag: "🇵🇰", phoneLength: [10] },
  { code: "BD", name: "Bangladesh",     dialCode: "+880", flag: "🇧🇩", phoneLength: [10] },
  { code: "MY", name: "Malaysia",       dialCode: "+60",  flag: "🇲🇾", phoneLength: [9, 10] },
  { code: "PH", name: "Philippines",    dialCode: "+63",  flag: "🇵🇭", phoneLength: [10] },
  { code: "ID", name: "Indonesia",      dialCode: "+62",  flag: "🇮🇩", phoneLength: [9, 10, 11] },
  { code: "TH", name: "Thailand",       dialCode: "+66",  flag: "🇹🇭", phoneLength: [9]  },
  { code: "NZ", name: "New Zealand",    dialCode: "+64",  flag: "🇳🇿", phoneLength: [8, 9] },
  { code: "KE", name: "Kenya",          dialCode: "+254", flag: "🇰🇪", phoneLength: [9]  },
  { code: "VN", name: "Vietnam",        dialCode: "+84",  flag: "🇻🇳", phoneLength: [9]  },
];

// ─── Shared glass input class ──────────────────────────────────────────────────
const glassInput =
  "w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none transition-all duration-200 focus:border-primary/60 focus:bg-white/[0.09] focus:ring-2 focus:ring-primary/20";

// ─── Field component — defined OUTSIDE OrganizationEnquiry to prevent remount ─
const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold tracking-widest uppercase text-slate-400">
      {label}
    </label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="text-red-400 text-[11px] flex items-center gap-1"
        >
          <span className="w-3 h-3 rounded-full bg-red-400/20 inline-flex items-center justify-center font-bold shrink-0 text-[9px]">
            !
          </span>
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const OrganizationEnquiry = () => {
  const { toast } = useToast();
  const { appName, appLogo } = useBranding();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ─── Country / Phone state ────────────────────────────────────────────────
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    organizationName: "",
    contactPerson: "",
    email: "",
    phone: "",
    teamSize: "",
    message: "",
    referBy: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [dropdownOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.organizationName.trim()) newErrors.organizationName = "Organization required";
    if (!/^[A-Za-z ]{3,}$/.test(form.contactPerson)) newErrors.contactPerson = "Min 3 letters only";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Invalid email";

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!phoneDigits) {
      newErrors.phone = "Phone number is required";
    } else if (!selectedCountry.phoneLength.includes(phoneDigits.length)) {
      const expected = selectedCountry.phoneLength.join(" or ");
      newErrors.phone = `${selectedCountry.name} requires ${expected} digits (got ${phoneDigits.length})`;
    }

    if (!form.teamSize.trim()) newErrors.teamSize = "Required";
    if (form.message.length < 10) newErrors.message = "Min 10 chars";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!captchaToken) {
      toast({ title: "Captcha required", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${serverURL}/api/organization-enquiries`, {
        ...form,
        phone: `${selectedCountry.dialCode}${form.phone}`,
        captchaToken,
      });
      setShowSuccessModal(true);
      setForm({ organizationName: "", contactPerson: "", email: "", phone: "", teamSize: "", message: "", referBy: "" });
      setErrors({});
      setCaptchaToken(null);
      setSelectedCountry(COUNTRIES[0]);
    } catch {
      toast({ title: "Error", description: "Submission failed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const scrollToEnquiry = () => {
    document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dialCode.includes(countrySearch)
  );

  return (
    <div className="bg-[#0a1a2f] text-white min-h-screen font-sans selection:bg-primary/30 relative">

      {/* HEADER */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-10 py-4 transition-all",
          isScrolled ? "bg-[#0a1a2f]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <img src={appLogo} alt="Logo" className="h-7 w-7 object-contain" />
            </motion.div>
            <span className="font-black text-2xl tracking-tighter text-white">
              {appName}<span className="text-primary text-4xl leading-[0]">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-bold text-white/80 hover:text-white transition-colors">Home</Link>
            <Link to="/contact" className="text-sm font-bold text-white/80 hover:text-white transition-colors">Contact</Link>
            <Button onClick={scrollToEnquiry} className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full px-8 h-11 shadow-xl shadow-primary/20 hover:scale-105 transition">
              Get Started
            </Button>
          </nav>

          <div className="md:hidden flex items-center">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10">
              {isMobileMenuOpen ? "✕" : "☰"}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden absolute top-full left-0 right-0 bg-[#0a1a2f] border-b border-white/10 overflow-hidden">
              <div className="p-8 flex flex-col space-y-4">
                <Link to="/" className="text-xl font-bold py-2">Home</Link>
                <Link to="/contact" className="text-xl font-bold py-2">Contact</Link>
                <Button onClick={() => { setIsMobileMenuOpen(false); scrollToEnquiry(); }} className="w-full h-14 rounded-2xl font-bold text-lg bg-primary">Get Started</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-44 pb-12 md:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              ENTERPRISE SOLUTIONS
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-5 md:mb-6 leading-tight tracking-tighter">
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
            <Button onClick={scrollToEnquiry} className="w-full sm:w-auto bg-primary hover:bg-primary/90 h-14 px-10 rounded-xl text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105">
              Start Your Organization Setup
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative hidden lg:block">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" alt="Team Collaboration" className="relative rounded-[2rem] border border-white/10 shadow-2xl grayscale-[20%] hover:grayscale-0 transition-all duration-500" />
          </motion.div>
        </div>
      </section>

      {/* ── Form Section ─────────────────────────────────────────────────────── */}
      <section id="enquiry" className="py-16 md:py-24 px-4 sm:px-6 bg-[#0a1a2f] relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Subtle ambient glow behind card */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/5 rounded-full blur-[140px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto relative"
        >
          {/* Glass card */}
          <div className="bg-white/[0.03] backdrop-blur-2xl rounded-2xl sm:rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">

            {/* Accent bar at top */}
            <div className="h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent" />

            <div className="p-5 sm:p-8 md:p-12">

              {/* Card header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold tracking-widest uppercase mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Organization Enquiry
                </div>
                <h2 className="text-3xl font-bold mb-2 tracking-tight">Let's Work Together</h2>
                <p className="text-slate-400 text-sm">Fill out the form and our team will reach out within 24 hours.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4 md:space-y-5">

                {/* Row 1: Org Name + Contact Person */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <Field label="Organization Name" error={errors.organizationName}>
                    <input name="organizationName" value={form.organizationName} onChange={handleChange} placeholder="Acme Corporation"
                      className={cn(glassInput, errors.organizationName && "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20")} />
                  </Field>
                  <Field label="Contact Person" error={errors.contactPerson}>
                    <input name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Jane Smith"
                      className={cn(glassInput, errors.contactPerson && "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20")} />
                  </Field>
                </div>

                {/* Row 2: Email + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <Field label="Work Email" error={errors.email}>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@acmecorp.com"
                      className={cn(glassInput, errors.email && "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20")} />
                  </Field>

                  {/* ── Phone with Country Dropdown ── */}
                  <Field label="Phone Number" error={errors.phone}>
                    <div className="relative" ref={dropdownRef}>

                      {/* Combined input */}
                      <div className={cn(
                        "flex h-12 rounded-xl border transition-all duration-200 bg-white/[0.06] overflow-visible",
                        errors.phone
                          ? "border-red-500/60"
                          : "border-white/10 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20"
                      )}>
                        {/* Country selector button */}
                        <button
                          type="button"
                          onClick={() => setDropdownOpen((v) => !v)}
                          className="flex items-center gap-1.5 h-full px-3 border-r border-white/10 shrink-0 hover:bg-white/5 transition-colors rounded-l-xl"
                        >
                          <span className="text-xl leading-none">{selectedCountry.flag}</span>
                          <span className="text-xs font-mono text-slate-300 whitespace-nowrap">
                            {selectedCountry.dialCode}
                          </span>
                          <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform duration-200 shrink-0", dropdownOpen && "rotate-180")} />
                        </button>

                        {/* Phone number input */}
                        <input
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, phone: e.target.value.replace(/[^\d\s\-()+]/g, "") }))
                          }
                          placeholder={`${selectedCountry.phoneLength.join("/")} digits`}
                          className="flex-1 h-full px-3 bg-transparent text-white placeholder:text-slate-500 text-sm outline-none font-mono rounded-r-xl"
                        />
                      </div>

                      {/* ── Dropdown ── */}
                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-[calc(100%+8px)] left-0 z-[60] w-screen max-w-xs sm:w-full sm:min-w-[280px] bg-[#0d1e33] border border-white/10 rounded-2xl shadow-2xl shadow-black/70 overflow-hidden"
                          >
                            {/* Search */}
                            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/8">
                              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <input
                                ref={searchRef}
                                type="text"
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                placeholder="Search country or code..."
                                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                              />
                            </div>

                            {/* Country list */}
                            <div className="max-h-56 overflow-y-auto overscroll-contain">
                              {filteredCountries.length > 0 ? (
                                filteredCountries.map((c) => (
                                  <button
                                    key={c.code}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountry(c);
                                      setDropdownOpen(false);
                                      setCountrySearch("");
                                      setForm((p) => ({ ...p, phone: "" }));
                                      setErrors((p) => ({ ...p, phone: "" }));
                                    }}
                                    className={cn(
                                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5",
                                      c.code === selectedCountry.code && "bg-primary/10"
                                    )}
                                  >
                                    <span className="text-2xl leading-none w-8 text-center">{c.flag}</span>
                                    <span className="flex-1 text-sm text-white">{c.name}</span>
                                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/8">
                                      {c.dialCode}
                                    </span>
                                    {c.code === selectedCountry.code && (
                                      <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      </span>
                                    )}
                                  </button>
                                ))
                              ) : (
                                <p className="text-slate-500 text-sm text-center py-8">No countries found</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Hint line shown only when no error */}
                    {!errors.phone && (
                      <p className="text-slate-500 text-[11px] px-1 mt-0.5">
                        {selectedCountry.flag} {selectedCountry.name} · {selectedCountry.phoneLength.join(" or ")} digits required
                      </p>
                    )}
                  </Field>
                </div>

                {/* Row 3: Team Size + Referred By */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <Field label="Estimated Team Size" error={errors.teamSize}>
                    <input name="teamSize" type="number" value={form.teamSize} onChange={handleChange} placeholder="e.g. 50"
                      className={cn(glassInput, errors.teamSize && "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20")} />
                  </Field>
                  <Field label="Referred By (Optional)">
                    <input name="referBy" value={form.referBy} onChange={handleChange} placeholder="Name or company" className={glassInput} />
                  </Field>
                </div>

                {/* Message */}
                <Field label="How can we help?" error={errors.message}>
                  <div className={cn(
                    "relative rounded-xl border transition-all duration-200 bg-white/[0.06]",
                    errors.message
                      ? "border-red-500/60"
                      : "border-white/10 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20"
                  )}>
                    <Textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe your organization's needs, goals, or any specific requirements..."
                      rows={4}
                      className="w-full px-4 py-3 bg-transparent text-white placeholder:text-slate-500 text-sm outline-none resize-none border-none focus-visible:ring-0 shadow-none"
                    />
                    <span className="absolute bottom-2.5 right-3 text-[11px] text-slate-600 select-none">{form.message.length}/500</span>
                  </div>
                </Field>

                {/* Captcha */}
                <div className="flex justify-center py-3 md:py-4 bg-white/[0.03] rounded-2xl border border-white/8 overflow-x-auto">
                  <ReCAPTCHA sitekey={recaptchaSiteKey} onChange={setCaptchaToken} theme="dark" />
                </div>

                {/* Submit button */}
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-xl text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all active:scale-95 group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          Submit Enquiry
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>

                <p className="text-center text-slate-600 text-xs">
                  By submitting, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#020817] pt-12 md:pt-20 pb-8 md:pb-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
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
              <a href="mailto:info@colossusiq.com" className="flex items-center gap-4 md:gap-5 text-slate-300 hover:text-primary transition group cursor-pointer">
                <div className="p-3 md:p-4 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-all"><Mail size={22} className="text-primary md:hidden" /><Mail size={28} className="text-primary hidden md:block" /></div>
                <span className="text-base md:text-xl font-medium tracking-wide">info@colossusiq.com</span>
              </a>
              <a href="tel:+918220002535" className="flex items-center gap-4 md:gap-5 text-slate-300 hover:text-primary transition group cursor-pointer">
                <div className="p-3 md:p-4 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-all"><Phone size={22} className="text-primary md:hidden" /><Phone size={28} className="text-primary hidden md:block" /></div>
                <span className="text-base md:text-xl font-medium tracking-wide">+91 82200 02535</span>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSuccessModal(false)} className="absolute inset-0 bg-[#0a1a2f]/80 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#112240] text-white p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2.5rem] border border-white/10 shadow-2xl max-w-lg w-full text-center"
            >
              <div className="h-16 w-16 sm:h-24 sm:w-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 animate-bounce">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-2xl sm:text-4xl font-black mb-3 md:mb-4 tracking-tighter">Enquiry Sent!</h2>
              <p className="text-slate-300 text-sm sm:text-lg mb-6 md:mb-8 leading-relaxed">
                Thank you for reaching out. Our enterprise team will review your requirements and contact you within 24–48 hours.
              </p>
              <Button onClick={() => setShowSuccessModal(false)} className="w-full bg-primary hover:bg-primary/90 text-white h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 transition-transform active:scale-95">
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
