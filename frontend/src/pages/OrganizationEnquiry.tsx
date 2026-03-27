import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  Headphones,
  Mail,
  Phone,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { serverURL, recaptchaSiteKey, appWordmarkLight } from "@/constants";
import { useBranding } from "@/contexts/BrandingContext";
import { cn } from "@/lib/utils";

type Country = { code: string; name: string; dialCode: string; phoneLength: number[] };

const COUNTRIES: Country[] = [
  { code: "IN", name: "India", dialCode: "+91", phoneLength: [10] },
  { code: "US", name: "United States", dialCode: "+1", phoneLength: [10] },
  { code: "GB", name: "United Kingdom", dialCode: "+44", phoneLength: [10] },
  { code: "CA", name: "Canada", dialCode: "+1", phoneLength: [10] },
  { code: "AU", name: "Australia", dialCode: "+61", phoneLength: [9] },
  { code: "SG", name: "Singapore", dialCode: "+65", phoneLength: [8] },
  { code: "AE", name: "UAE", dialCode: "+971", phoneLength: [9] },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", phoneLength: [9] },
  { code: "ZA", name: "South Africa", dialCode: "+27", phoneLength: [9] },
  { code: "BD", name: "Bangladesh", dialCode: "+880", phoneLength: [10] },
];

const preSubmitGuidance = [
  { icon: Building2, title: "Organizations", text: "Use this page if your team needs rollout help, onboarding, pricing, or support coordination." },
  { icon: Briefcase, title: "Companies", text: "Great for product teams, HR, L&D, and internal training groups planning a structured setup." },
  { icon: CalendarDays, title: "Institutions", text: "Best for colleges, academies, and training institutions planning large-scale adoption." },
];

const enquiryGuidance = [
  { icon: ClipboardList, title: "What to include", text: "Share your org name, team size, contact person, work email, and main use case." },
  { icon: Clock3, title: "Timeline details", text: "Mention your launch date, onboarding window, or any deadline that affects the rollout." },
  { icon: Headphones, title: "Support needs", text: "Tell us whether you need training, migration help, custom workflows, or ongoing support." },
];

const followUps = [
  "Tailored rollout guidance",
  "Role-based planning",
  "Pricing and onboarding support",
  "Faster routing when timeline is included",
];

const glassInput =
  "w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none transition-all duration-200 focus:border-primary/60 focus:bg-white/[0.09] focus:ring-2 focus:ring-primary/20";

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
    <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.p initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-[11px] text-red-400 flex items-center gap-1">
          <span className="inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-red-400/20 text-[9px] font-bold">!</span>
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const OrganizationEnquiry = () => {
  const { toast } = useToast();
  const { appName } = useBranding();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
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

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (dropdownOpen) window.setTimeout(() => searchRef.current?.focus(), 50);
  }, [dropdownOpen]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.organizationName.trim()) next.organizationName = "Organization required";
    if (!/^[A-Za-z ]{3,}$/.test(form.contactPerson.trim())) next.contactPerson = "Enter at least 3 letters";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Invalid email";

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!phoneDigits) next.phone = "Phone number is required";
    else if (!selectedCountry.phoneLength.includes(phoneDigits.length)) next.phone = `${selectedCountry.name} requires ${selectedCountry.phoneLength.join(" or ")} digits`;

    if (!form.teamSize.trim()) next.teamSize = "Required";
    if (form.message.trim().length < 10) next.message = "Please share a little more detail";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!captchaToken) {
      toast({ title: "Captcha required", description: "Please complete the captcha before submitting.", variant: "destructive" });
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
    } catch (error) {
      console.error(error);
      toast({ title: "Submission failed", description: "We could not send your enquiry. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const scrollToEnquiry = () => document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const filteredCountries = COUNTRIES.filter((country) => country.name.toLowerCase().includes(countrySearch.toLowerCase()) || country.dialCode.includes(countrySearch));

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#081323] text-slate-100">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-10 py-4 transition-all",
          isScrolled ? "bg-[#081325]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl" : "bg-transparent"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={appWordmarkLight} alt={appName} className="h-8 w-auto max-w-[180px] sm:max-w-[220px]" />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 hover:text-white md:inline-flex">Home</Link>
            <Link to="/contact" className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 hover:text-white md:inline-flex">Contact</Link>
            <Button onClick={scrollToEnquiry} className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90">
              Request a call
            </Button>
          </div>
        </div>
      </motion.header>

      <section className="relative overflow-hidden pt-28 pb-14 md:pt-36 md:pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(38,157,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.1),transparent_32%),linear-gradient(180deg,#081323_0%,#09182a_100%)]" />
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.08] mix-blend-screen" style={{ backgroundImage: "url('/bexon/images/pattern-bg.webp')" }} />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-6 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Enterprise enquiry
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance leading-[1.03] sm:text-5xl lg:text-6xl">
              Talk to the team about rollout, onboarding, and enterprise learning.
            </h1>
            <div className="relative rounded-3xl border border-white/10 bg-slate-900/55 p-6 backdrop-blur">
              <Quote className="absolute -left-3 -top-3 h-10 w-10 fill-primary text-primary/30" />
              <p className="text-base leading-7 text-slate-200 sm:text-lg">
                Use this page if your organization wants a custom setup, a pricing discussion, or help deciding which
                parts of {appName} fit your team best.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {followUps.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/55 p-4 backdrop-blur">
                  <CheckCircle2 className="h-4 w-4 text-cyan-200" />
                  <p className="mt-3 text-sm leading-6 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={scrollToEnquiry} className="h-12 rounded-full bg-primary px-6 text-white hover:bg-primary/90">
                Start your enquiry
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
                <Link to="/contact">Contact support</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.08 }} className="relative">
            <div className="absolute -inset-1 rounded-[34px] bg-gradient-to-tr from-primary/50 via-cyan-400/30 to-blue-500/40 blur-2xl opacity-60" />
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-2 backdrop-blur">
              <div className="rounded-[26px] bg-slate-950/80 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Before you submit</p>
                <h2 className="mt-2 text-2xl font-semibold">Tell us the shape of your rollout.</h2>
                <div className="mt-6 grid gap-3">
                  {preSubmitGuidance.map((item) => (
                    <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-center gap-2 text-cyan-100">
                    <ClipboardList className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.28em]">Recommended details</span>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                    <li>Team size and target departments</li>
                    <li>Primary use case and rollout timeline</li>
                    <li>Need for certificates, support, or custom workflows</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="enquiry" className="relative bg-[#07111f] px-4 py-16 sm:px-6 md:py-24">
        <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[140px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0b1628]/85 shadow-2xl backdrop-blur-2xl">
            <div className="h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="p-5 sm:p-8 md:p-10">
              <div className="text-center mb-8 md:mb-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Organization enquiry
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Tell us what your team needs</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">Give us the basics and we will route your enquiry to the right person.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4 md:space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                  <Field label="Organization Name" error={errors.organizationName}>
                    <input name="organizationName" value={form.organizationName} onChange={handleChange} placeholder="Acme Corporation" className={cn(glassInput, errors.organizationName && "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20")} />
                  </Field>
                  <Field label="Contact Person" error={errors.contactPerson}>
                    <input name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Jane Smith" className={cn(glassInput, errors.contactPerson && "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20")} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                  <Field label="Work Email" error={errors.email}>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@acmecorp.com" className={cn(glassInput, errors.email && "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20")} />
                  </Field>
                  <Field label="Phone Number" error={errors.phone}>
                    <div className="relative" ref={dropdownRef}>
                      <div className={cn("flex h-12 rounded-xl border transition-all duration-200 bg-white/[0.06]", errors.phone ? "border-red-500/60" : "border-white/10 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20")}>
                        <button type="button" onClick={() => setDropdownOpen((v) => !v)} className="flex h-full shrink-0 items-center gap-1.5 rounded-l-xl border-r border-white/10 px-3 hover:bg-white/5 transition-colors">
                          <span className="text-xs font-mono text-slate-300 whitespace-nowrap">{selectedCountry.dialCode}</span>
                          <ChevronDown className={cn("h-3 w-3 text-slate-400 transition-transform", dropdownOpen && "rotate-180")} />
                        </button>
                        <input
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value.replace(/[^\d\s\-()+]/g, "") }))}
                          placeholder={`${selectedCountry.phoneLength.join(" / ")} digits`}
                          className="h-full flex-1 rounded-r-xl bg-transparent px-3 text-sm font-mono text-white outline-none placeholder:text-slate-500"
                        />
                      </div>
                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }} transition={{ duration: 0.15 }} className="absolute left-0 top-[calc(100%+8px)] z-[60] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0d1e33] shadow-2xl shadow-black/70">
                            <div className="flex items-center gap-2 border-b border-white/8 px-3 py-2.5">
                              <Search className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                              <input ref={searchRef} type="text" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} placeholder="Search country or code" className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
                            </div>
                            <div className="max-h-56 overflow-y-auto">
                              {filteredCountries.length > 0 ? filteredCountries.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(country);
                                    setDropdownOpen(false);
                                    setCountrySearch("");
                                    setForm((prev) => ({ ...prev, phone: "" }));
                                    setErrors((prev) => ({ ...prev, phone: "" }));
                                  }}
                                  className={cn("flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5", country.code === selectedCountry.code && "bg-primary/10")}
                                >
                                  <span className="text-sm text-white">{country.name}</span>
                                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-mono text-slate-300">{country.dialCode}</span>
                                </button>
                              )) : <p className="px-4 py-8 text-center text-sm text-slate-500">No countries found</p>}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {!errors.phone && <p className="px-1 text-[11px] text-slate-500">{selectedCountry.name} uses {selectedCountry.phoneLength.join(" or ")} digits.</p>}
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                  <Field label="Estimated Team Size" error={errors.teamSize}>
                    <input name="teamSize" type="number" value={form.teamSize} onChange={handleChange} placeholder="e.g. 50" className={cn(glassInput, errors.teamSize && "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20")} />
                  </Field>
                  <Field label="Referred By (Optional)">
                    <input name="referBy" value={form.referBy} onChange={handleChange} placeholder="Name or company" className={glassInput} />
                  </Field>
                </div>

                <Field label="How can we help?" error={errors.message}>
                  <div className={cn("relative rounded-xl border transition-all duration-200 bg-white/[0.06]", errors.message ? "border-red-500/60" : "border-white/10 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20")}>
                    <Textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe your organization's needs, goals, or any specific requirements..."
                      rows={4}
                      className="w-full resize-none border-none bg-transparent px-4 py-3 text-sm text-white placeholder:text-slate-500 shadow-none focus-visible:ring-0"
                    />
                    <span className="absolute bottom-2.5 right-3 select-none text-[11px] text-slate-600">{form.message.length}/500</span>
                  </div>
                </Field>

                <div className="overflow-x-auto rounded-2xl border border-white/8 bg-white/[0.03] py-3">
                  <div className="flex justify-center px-3">
                    <ReCAPTCHA sitekey={recaptchaSiteKey} onChange={setCaptchaToken} theme="dark" />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="h-14 w-full rounded-xl bg-primary text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 active:scale-[0.99]">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending enquiry...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send enquiry
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                <p className="text-center text-xs text-slate-400">By submitting this form, you agree that our team can contact you about your request.</p>
              </form>
            </div>
          </motion.div>

          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="rounded-[2rem] border border-white/10 bg-[#0b1628]/85 p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-2 text-cyan-100">
                <ClipboardList className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.28em]">What to include</span>
              </div>
              <div className="mt-4 space-y-4">
                {enquiryGuidance.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{item.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-2 text-cyan-100">
                <Headphones className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.28em]">Need a faster reply?</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Add your timeline and a direct phone number. That gives the team enough context to prioritize your enquiry correctly.
              </p>
              <div className="mt-4 space-y-2 text-sm text-slate-200">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-cyan-200" />support@colossusiq.com</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-cyan-200" />+91 82200 02535</div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {["L&D teams", "Colleges", "Staff training", "Corporate rollout"].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#050b16] px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src={appWordmarkLight} alt={appName} className="h-8 w-auto max-w-[220px]" />
            </Link>
            <p className="max-w-md text-sm leading-7 text-slate-400">
              Enterprise support for organizations that want structured onboarding, learning, and role-based workflows.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-slate-300">
            <a href="mailto:support@colossusiq.com" className="flex items-center gap-2 hover:text-white"><Mail className="h-4 w-4 text-primary" />support@colossusiq.com</a>
            <a href="tel:+918220002535" className="flex items-center gap-2 hover:text-white"><Phone className="h-4 w-4 text-primary" />+91 82200 02535</a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSuccessModal(false)} className="absolute inset-0 bg-[#081325]/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }} className="relative w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#0f1e35] p-6 text-center text-white shadow-2xl sm:p-8">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-semibold sm:text-3xl">Enquiry received</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Thanks. Our enterprise team will review your request and contact you with the next step.
              </p>
              <Button onClick={() => setShowSuccessModal(false)} className="mt-6 h-12 w-full rounded-2xl bg-primary text-base font-semibold text-white hover:bg-primary/90">
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
