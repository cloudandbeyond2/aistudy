
// import React, { useEffect, useRef, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { GoogleLogin } from '@react-oauth/google';
// import { jwtDecode } from 'jwt-decode';
// import ReCAPTCHA from 'react-google-recaptcha';
// import { AnimatePresence, motion } from 'framer-motion';
// import {
//   AlertTriangle,
//   ArrowRight,
//   CheckCircle2,
//   ChevronDown,
//   GraduationCap,
//   Home,
//   Lock,
//   Mail,
//   Search,
//   ShieldCheck,
//   Sparkles,
//   User,
// } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { cn } from '@/lib/utils';
// import {
//   appLogo,
//   appName,
//   appWordmarkDark,
//   appWordmarkLight,
//   recaptchaSiteKey,
//   serverURL,
//   websiteURL,
// } from '@/constants';

// type Country = {
//   code: string;
//   name: string;
//   dialCode: string;
//   phoneLength: number[];
// };

// const COUNTRIES: Country[] = [
//   { code: 'IN', name: 'India', dialCode: '+91', phoneLength: [10] },
//   { code: 'US', name: 'United States', dialCode: '+1', phoneLength: [10] },
//   { code: 'GB', name: 'United Kingdom', dialCode: '+44', phoneLength: [10] },
//   { code: 'CA', name: 'Canada', dialCode: '+1', phoneLength: [10] },
//   { code: 'AU', name: 'Australia', dialCode: '+61', phoneLength: [9] },
//   { code: 'SG', name: 'Singapore', dialCode: '+65', phoneLength: [8] },
//   { code: 'AE', name: 'UAE', dialCode: '+971', phoneLength: [9] },
// ];

// const signupHighlights = [
//   {
//     icon: CheckCircle2,
//     title: 'Clean onboarding',
//     text: 'Create an account in a few steps with responsive forms and clear validation.',
//   },
//   {
//     icon: GraduationCap,
//     title: 'Role-ready access',
//     text: 'Start free and move into student, staff, or organization workflows later.',
//   },
//   {
//     icon: ShieldCheck,
//     title: 'Verified signup',
//     text: 'reCAPTCHA and email verification help keep the platform controlled.',
//   },
// ];

// const Field = ({
//   label,
//   error,
//   children,
// }: {
//   label: string;
//   error?: string;
//   children: React.ReactNode;
// }) => (
//   <div className="space-y-1.5">
//     <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
//       {label}
//     </Label>
//     {children}
//     <AnimatePresence>
//       {error && (
//         <motion.p
//           initial={{ opacity: 0, y: -4 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -4 }}
//           className="text-[11px] text-red-500 flex items-center gap-1"
//         >
//           <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-red-500/20 text-[9px] font-bold">!</span>
//           {error}
//         </motion.p>
//       )}
//     </AnimatePresence>
//   </div>
// );

// const Signup = () => {

//   const getPasswordStrength = (password) => {
//   if (!password) return "";

//   let score = 0;

//   if (password.length >= 8) score++;
//   if (/[A-Z]/.test(password)) score++;
//   if (/[0-9]/.test(password)) score++;
//   if (/[^A-Za-z0-9]/.test(password)) score++;

//   if (score <= 1) return "Weak";
//   if (score <= 3) return "Medium";
//   return "Strong";
// };
//   const validateField = (name: string, value: string, form: any) => {
//   switch (name) {
//     case "mName":
//       if (!value.trim()) return "Full name is required";
//       if (value.trim().length < 3) return "Minimum 3 characters";
//       return "";

//     case "email":
//       if (!value.trim()) return "Email is required";
//       if (!/^\S+@\S+\.\S+$/.test(value))
//         return "Enter valid email (example@gmail.com)";
//       return "";
// case "password":
//   if (!value) return "Password is required";
//   if (value.length < 8) return "Minimum 8 characters";
//   if (!/[A-Z]/.test(value)) return "Add one uppercase letter";
//   if (!/[0-9]/.test(value)) return "Add one number";
//   if (!/[^A-Za-z0-9]/.test(value)) return "Add one special character";
//   return "";
//     case "confirmPassword":
//       if (!value) return "Confirm your password";
//       if (value !== form.password) return "Passwords do not match";
//       return "";

//     default:
//       return "";
//   }
// };
//   const [form, setForm] = useState({
//     mName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     phone: '',
//   });

//   const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [countrySearch, setCountrySearch] = useState('');
//   const [agreeToTerms, setAgreeToTerms] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [captchaToken, setCaptchaToken] = useState<string | null>(null);
//   const [googleButtonWidth, setGoogleButtonWidth] = useState(340);
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const searchRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     window.scrollTo(0, 0);
//     if (sessionStorage.getItem('auth')) navigate('/dashboard');
//   }, [navigate]);

//   // Close dropdown
//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
//         setDropdownOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   useEffect(() => {
//     if (dropdownOpen) setTimeout(() => searchRef.current?.focus(), 50);
//   }, [dropdownOpen]);

//   // Google button width
//   useEffect(() => {
//     const updateWidth = () => {
//       const width = Math.max(240, window.innerWidth - 48);
//       setGoogleButtonWidth(Math.min(340, width));
//     };
//     updateWidth();
//     window.addEventListener('resize', updateWidth);
//     return () => window.removeEventListener('resize', updateWidth);
//   }, []);
// const validateForm = (): boolean => {
//   const newErrors: Record<string, string> = {};

//   Object.keys(form).forEach((key) => {
//     const error = validateField(key, (form as any)[key], form);
//     if (error) newErrors[key] = error;
//   });

//   if (form.phone) {
//     const phoneDigits = form.phone.replace(/\D/g, "");
//     if (phoneDigits.length !== selectedCountry.phoneLength[0]) {
//       newErrors.phone = `Enter ${selectedCountry.phoneLength[0]} digits`;
//     }
//   }

//   if (!agreeToTerms) {
//     newErrors.terms = "Accept terms to continue";
//   }

//   if (!captchaToken) {
//     newErrors.captcha = "Complete reCAPTCHA";
//   }

//   setErrors(newErrors);
//   return Object.keys(newErrors).length === 0;
// };
// const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const { name, value } = e.target;

//   const updatedForm = {
//     ...form,
//     [name]: value,
//   };

//   setForm(updatedForm);

//   const errorMsg = validateField(name, value, updatedForm);

//   setErrors((prev) => ({
//     ...prev,
//     [name]: errorMsg,
//   }));

//   if (name === "password" && updatedForm.confirmPassword) {
//     setErrors((prev) => ({
//       ...prev,
//       confirmPassword:
//         value !== updatedForm.confirmPassword
//           ? "Passwords do not match"
//           : "",
//     }));
//   }
// };
//  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const cleaned = e.target.value
//     .replace(/[^\d]/g, "")
//     .slice(0, selectedCountry.phoneLength[0]); // 🔥 limit digits

//   setForm((prev) => ({ ...prev, phone: cleaned }));
//   let error = "";

//   if (
//     cleaned.length > 0 &&
//     cleaned.length !== selectedCountry.phoneLength[0]
//   ) {
//     error = `Enter ${selectedCountry.phoneLength[0]} digits`;
//   }

//   setErrors((prev) => ({
//     ...prev,
//     phone: error,
//   }));
// };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrors({});

//     if (!validateForm()) return;

//     setIsLoading(true);

//     try {
//       const fullPhone = form.phone 
//         ? `${selectedCountry.dialCode}${form.phone.replace(/\D/g, '')}` 
//         : '';

//       const response = await axios.post(`${serverURL}/api/signup`, {
//         email: form.email.trim(),
//         mName: form.mName.trim(),
//         password: form.password,
//         type: 'free',
//         phone: fullPhone,
//         captchaToken,
//       });

//       if (!response.data.success) {
//         setErrors({ general: response.data.message || 'Signup failed' });
//         return;
//       }

//       if (response.data.autoLogin) {
//         sessionStorage.setItem('email', form.email);
//         sessionStorage.setItem('mName', form.mName);
//         sessionStorage.setItem('auth', 'true');
//         sessionStorage.setItem('uid', response.data.userId);
//         sessionStorage.setItem('type', 'forever');

//         toast({ title: 'Account created successfully', description: `Welcome to ${appName}` });
//         await sendEmail(form.email, form.mName);
//         window.location.href = '/dashboard';
//         return;
//       }

//       toast({ title: 'Account created', description: 'Please check your email to verify your account.' });
//       window.location.href = '/login';
//     } catch (err: any) {
//       setErrors({ general: err.response?.data?.message || 'Failed to create account. Please try again.' });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const sendEmail = async (mEmail: string, name?: string) => {
//     try {
//       await axios.post(`${serverURL}/api/data`, {
//         subject: `Welcome to ${appName}`,
//         to: mEmail,
//         html: `
//           <html>
//             <body style="font-family: Arial, sans-serif; background:#f6f9fc; padding:24px;">
//               <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;padding:32px;border:1px solid #e5e7eb;">
//                 <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
//                   <img src="${appLogo}" alt="${appName}" width="44" height="44" />
//                   <h1 style="margin:0;font-size:24px;">Welcome to ${appName}</h1>
//                 </div>
//                 <p style="font-size:16px;line-height:1.7;color:#111827;">Hello ${name || mEmail}, your account is ready.</p>
//                 <p style="font-size:16px;line-height:1.7;color:#111827;">Use ${websiteURL} to sign in and start building courses, schedules, and learning workflows.</p>
//               </div>
//             </body>
//           </html>`,
//       });
//     } catch (error) {
//       console.error('Welcome email failed:', error);
//     }
//   };

//   const handleGoogleSignup = async (credentialResponse: any) => {
//     if (!credentialResponse.credential) return;
//     const decoded: any = jwtDecode(credentialResponse.credential);

//     try {
//       setIsLoading(true);
//       const response = await axios.post(`${serverURL}/api/social`, {
//         email: decoded.email,
//         mName: decoded.name,
//       });

//       if (!response.data.success) {
//         setErrors({ general: response.data.message || 'Signup failed' });
//         return;
//       }

//       sessionStorage.setItem('email', decoded.email);
//       sessionStorage.setItem('mName', decoded.name);
//       sessionStorage.setItem('auth', 'true');
//       sessionStorage.setItem('uid', response.data.userData._id);
//       sessionStorage.setItem('type', response.data.userData.type);

//       toast({ title: 'Account created', description: `Welcome to ${appName}` });
//       window.location.href = '/dashboard';
//     } catch (error) {
//       setErrors({ general: 'Google signup failed. Please try again.' });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const filteredCountries = COUNTRIES.filter((c) =>
//     c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.dialCode.includes(countrySearch)
//   );
// const isFormValid =
//   form.mName &&
//   form.email &&
//   form.password &&
//   form.confirmPassword &&
//   !errors.mName &&
//   !errors.email &&
//   !errors.password &&
//   !errors.confirmPassword &&
//   !errors.phone &&
//   agreeToTerms &&
//   captchaToken;
//   return (
//     <div className="min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(30,138,138,0.08),transparent_25%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)]">
//       <div className="absolute right-0 top-0 -z-10 h-[28rem] w-[28rem] translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
//       <div className="absolute bottom-0 left-0 -z-10 h-[28rem] w-[28rem] -translate-x-1/3 translate-y-1/3 rounded-full bg-cyan-500/10 blur-3xl" />

//       <div className="absolute right-4 top-4 z-50 sm:right-6 sm:top-6">
//         <Link
//           to="/"
//           className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-primary/20 hover:text-primary sm:px-4 sm:py-2 sm:text-sm"
//         >
//           <Home className="h-4 w-4" /> Back to Website
//         </Link>
//       </div>

//       <div className="grid min-h-dvh lg:grid-cols-[0.95fr_1.05fr]">
//         {/* ===================== LEFT SIDE - FULL CONTENT ===================== */}
//         <section className="relative hidden overflow-hidden bg-slate-950 text-white lg:flex lg:items-center lg:justify-center lg:px-12">
//           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,138,138,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_30%)]" />
//           <div
//             className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-screen"
//             style={{ backgroundImage: "url('/bexon/images/pattern-bg.webp')" }}
//           />

//           <motion.div
//             initial={{ opacity: 0, x: -24 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.7 }}
//             className="relative z-10 max-w-xl space-y-8"
//           >
//             <div className="flex items-center gap-3">
//               <img src={appWordmarkLight} alt={appName} className="h-10 w-auto max-w-[260px]" />
//               <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Create account</p>
//             </div>

//             <div className="space-y-4">
//               <Badge className="rounded-full bg-white/10 px-4 py-1.5 text-cyan-100 hover:bg-white/10">
//                 <Sparkles className="mr-2 h-3.5 w-3.5" />
//                 Join the platform
//               </Badge>
//               <h1 className="max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
//                 Start with a clean onboarding flow and a structured workspace.
//               </h1>
//               <p className="max-w-lg text-sm leading-7 text-slate-300 lg:text-base">
//                 Create your account, verify your email, and enter the learning platform with a responsive UI.
//               </p>
//             </div>

//             <div className="grid gap-3 sm:grid-cols-3">
//               {[
//                 { value: 'Free', label: 'Starter' },
//                 { value: 'AI', label: 'Tools' },
//                 { value: '24/7', label: 'Access' },
//               ].map((item) => (
//                 <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
//                   <div className="text-2xl font-semibold">{item.value}</div>
//                   <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-slate-400">{item.label}</div>
//                 </div>
//               ))}
//             </div>

//             <div className="grid gap-3">
//               {signupHighlights.map((item) => (
//                 <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
//                   <item.icon className="mt-0.5 h-5 w-5 text-cyan-200" />
//                   <div>
//                     <h3 className="font-semibold text-white">{item.title}</h3>
//                     <p className="text-sm leading-6 text-slate-300">{item.text}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </motion.div>
//         </section>

//         {/* ===================== RIGHT SIDE - FORM ===================== */}
//         <section className="flex items-start justify-center px-4 py-8 sm:px-6 lg:items-center lg:px-8 lg:py-16">
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6 }}
//             className="w-full max-w-[460px]"
//           >
//             <Card className="border-slate-200/80 bg-white/90 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.35)] backdrop-blur">
//               <CardContent className="space-y-6 p-6 md:p-8">
//                 <div>
//                   <Badge variant="secondary" className="rounded-full px-4 py-1.5">
//                     <ShieldCheck className="mr-2 h-3.5 w-3.5" />
//                     Sign up
//                   </Badge>
//                   <h2 className="mt-4 text-3xl font-semibold tracking-tight">Create your account</h2>
//                   <p className="mt-2 text-sm leading-7 text-muted-foreground">
//                     Start free and move into the platform with verified access.
//                   </p>
//                 </div>

//                 {errors.general && (
//                   <Alert variant="destructive">
//                     <AlertTriangle className="h-4 w-4" />
//                     <AlertDescription>{errors.general}</AlertDescription>
//                   </Alert>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-5">
//                   <Field label="Full Name" error={errors.mName}>
//                     <div className="relative">
//                       <User className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
//                       <Input
//                         name="mName"
//                         placeholder="John Doe"
//                         value={form.mName}
//                         onChange={handleChange}
//                         className="h-12 rounded-xl border-transparent bg-slate-50 pl-11 focus:border-primary focus:bg-white"
//                         disabled={isLoading}
//                       />
//                     </div>
//                   </Field>

//                   <Field label="Email Address" error={errors.email}>
//                     <div className="relative">
//                       <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
//                       <Input
//                         name="email"
//                         type="email"
//                         placeholder="you@example.com"
//                         value={form.email}
//                         onChange={handleChange}
//                         className="h-12 rounded-xl border-transparent bg-slate-50 pl-11 focus:border-primary focus:bg-white"
//                         disabled={isLoading}
//                       />
//                     </div>
//                   </Field>

//                   <Field label="Phone Number (Optional)" error={errors.phone}>
//                     <div className="relative" ref={dropdownRef}>
//                       <div className="flex h-12 rounded-xl border bg-slate-50 focus-within:border-primary">
//                         <button
//                           type="button"
//                           onClick={() => setDropdownOpen(!dropdownOpen)}
//                           className="flex items-center gap-1.5 rounded-l-xl border-r border-slate-200 px-3 hover:bg-slate-100"
//                         >
//                           <span className="font-mono">{selectedCountry.dialCode}</span>
//                           <ChevronDown className={cn("h-4 w-4 transition-transform", dropdownOpen && "rotate-180")} />
//                         </button>
//                         <input
//                           type="tel"
//                           value={form.phone}
//                           onChange={handlePhoneChange}
//                           placeholder={`${selectedCountry.phoneLength[0]} digits`}
//                           className="flex-1 bg-transparent px-4 text-sm outline-none"
//                           disabled={isLoading}
//                         />
//                       </div>

//                       <AnimatePresence>
//                         {dropdownOpen && (
//                           <motion.div
//                             initial={{ opacity: 0, y: 8 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             exit={{ opacity: 0, y: 8 }}
//                             className="absolute left-0 top-full z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl"
//                           >
//                             <div className="p-2">
//                               <div className="flex items-center gap-2 border-b pb-2">
//                                 <Search className="h-4 w-4 text-muted-foreground" />
//                                 <input
//                                   ref={searchRef}
//                                   value={countrySearch}
//                                   onChange={(e) => setCountrySearch(e.target.value)}
//                                   placeholder="Search country..."
//                                   className="flex-1 bg-transparent text-sm outline-none"
//                                 />
//                               </div>
//                             </div>
//                             <div className="max-h-60 overflow-auto">
//                               {filteredCountries.map((country) => (
//                                 <button
//                                   key={country.code}
//                                   type="button"
//                                   onClick={() => {
//                                     setSelectedCountry(country);
//                                     setDropdownOpen(false);
//                                     setCountrySearch('');
//                                     setForm((prev) => ({ ...prev, phone: '' }));
//                                   }}
//                                   className="flex w-full justify-between px-4 py-2.5 hover:bg-slate-50 text-left"
//                                 >
//                                   <span>{country.name}</span>
//                                   <span className="font-mono text-sm text-muted-foreground">{country.dialCode}</span>
//                                 </button>
//                               ))}
//                             </div>
//                           </motion.div>
//                         )}
//                       </AnimatePresence>
//                     </div>
//                   </Field>

//                   <Field label="Password" error={errors.password}>
//                     <div className="relative">
//                       <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
//                       <Input
//                         name="password"
//                         type="password"
//                   placeholder="Enter password"
//                         value={form.password}
//                         onChange={handleChange}
//                         className="h-12 rounded-xl border-transparent bg-slate-50 pl-11 focus:border-primary focus:bg-white"
//                         disabled={isLoading}
//                       />
//                       {form.password && (
//   <p className={`text-xs mt-1 font-medium ${
//     getPasswordStrength(form.password) === "Weak"
//       ? "text-red-500"
//       : getPasswordStrength(form.password) === "Medium"
//       ? "text-yellow-500"
//       : "text-green-600"
//   }`}>
//     Password strength: {getPasswordStrength(form.password)}
//   </p>
// )}
//                     </div>
//                   </Field>

//                   <Field label="Confirm Password" error={errors.confirmPassword}>
//                     <div className="relative">
//                       <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
//                       <Input
//                         name="confirmPassword"
//                         type="password"
//                         placeholder="Repeat your password"
//                         value={form.confirmPassword}
//                         onChange={handleChange}
//                         className="h-12 rounded-xl border-transparent bg-slate-50 pl-11 focus:border-primary focus:bg-white"
//                         disabled={isLoading}
//                       />
//                     </div>
//                   </Field>

//                   <div className="flex justify-center py-2">
//                     <ReCAPTCHA sitekey={recaptchaSiteKey} onChange={setCaptchaToken} />
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <Checkbox
//                       id="terms"
//                       checked={agreeToTerms}
//                       onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
//                       disabled={isLoading}
//                     />
//                     <label htmlFor="terms" className="text-sm text-muted-foreground">
//                       I agree to the{' '}
//                       <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and{' '}
//                       <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
//                     </label>
//                   </div>

//                  <Button
//   type="submit"
//   disabled={isLoading || !isFormValid}
//                     className="h-12 w-full rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
//                   >
//                     {isLoading ? (
//                       <span className="flex items-center gap-2">
//                         <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
//                         Creating account...
//                       </span>
//                     ) : (
//                       'Sign up'
//                     )}
//                   </Button>
//                 </form>

//                 <div className="relative py-2">
//                   <div className="absolute inset-0 flex items-center">
//                     <span className="w-full border-t border-slate-200" />
//                   </div>
//                   <div className="relative flex justify-center">
//                     <span className="bg-white px-4 text-xs uppercase tracking-widest text-muted-foreground">
//                       Or sign up with
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex justify-center">
//                   <GoogleLogin
//                     theme="outline"
//                     width={googleButtonWidth}
//                     onSuccess={handleGoogleSignup}
//                     onError={() => setErrors({ general: 'Google signup failed' })}
//                   />
//                 </div>

//                 <p className="text-center text-sm text-muted-foreground">
//                   Already have an account?{' '}
//                   <Link to="/login" className="font-semibold text-primary hover:underline">
//                     Sign in
//                   </Link>
//                 </p>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </section>
//       </div>
//     </div>
//   );
// };

// export default Signup;

import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import ReCAPTCHA from 'react-google-recaptcha';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Home,
  Lock,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  appLogo,
  appName,
  appWordmarkDark,
  appWordmarkLight,
  recaptchaSiteKey,
  serverURL,
  websiteURL,
} from '@/constants';

type Country = {
  code: string;
  name: string;
  dialCode: string;
  phoneLength: number[];
};

const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India', dialCode: '+91', phoneLength: [10] },
  { code: 'US', name: 'United States', dialCode: '+1', phoneLength: [10] },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', phoneLength: [10] },
  { code: 'CA', name: 'Canada', dialCode: '+1', phoneLength: [10] },
  { code: 'AU', name: 'Australia', dialCode: '+61', phoneLength: [9] },
  { code: 'SG', name: 'Singapore', dialCode: '+65', phoneLength: [8] },
  { code: 'AE', name: 'UAE', dialCode: '+971', phoneLength: [9] },
];

const signupHighlights = [
  {
    icon: CheckCircle2,
    title: 'Clean onboarding',
    text: 'Create an account in a few steps with responsive forms and clear validation.',
  },
  {
    icon: GraduationCap,
    title: 'Role-ready access',
    text: 'Start free and move into student, staff, or organization workflows later.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified signup',
    text: 'reCAPTCHA and email verification help keep the platform controlled.',
  },
];

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 sm:text-xs">
      {label}
    </Label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-[10px] text-red-500 flex items-center gap-1 sm:text-[11px]"
        >
          <span className="inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500/20 text-[8px] font-bold sm:h-3 sm:w-3 sm:text-[9px]">!</span>
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const Signup = () => {

  const getPasswordStrength = (password) => {
    if (!password) return "";
    
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 1) return "Weak";
    if (score <= 3) return "Medium";
    return "Strong";
  };
  
  const validateField = (name: string, value: string, form: any) => {
    switch (name) {
      case "mName":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 3) return "Minimum 3 characters";
        return "";
        
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^\S+@\S+\.\S+$/.test(value))
          return "Enter valid email (example@gmail.com)";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Minimum 8 characters";
        if (!/[A-Z]/.test(value)) return "Add one uppercase letter";
        if (!/[0-9]/.test(value)) return "Add one number";
        if (!/[^A-Za-z0-9]/.test(value)) return "Add one special character";
        return "";
      case "confirmPassword":
        if (!value) return "Confirm your password";
        if (value !== form.password) return "Passwords do not match";
        return "";
        
      default:
        return "";
    }
  };
  
  const [form, setForm] = useState({
    mName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(340);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    if (sessionStorage.getItem('auth')) navigate('/dashboard');
  }, [navigate]);
  
  // Close dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  
  useEffect(() => {
    if (dropdownOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [dropdownOpen]);
  
  // Google button width - responsive
  useEffect(() => {
    const updateWidth = () => {
      const width = Math.max(200, window.innerWidth - 48);
      setGoogleButtonWidth(Math.min(340, width));
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(form).forEach((key) => {
      const error = validateField(key, (form as any)[key], form);
      if (error) newErrors[key] = error;
    });
    
    if (form.phone) {
      const phoneDigits = form.phone.replace(/\D/g, "");
      if (phoneDigits.length !== selectedCountry.phoneLength[0]) {
        newErrors.phone = `Enter ${selectedCountry.phoneLength[0]} digits`;
      }
    }
    
    if (!agreeToTerms) {
      newErrors.terms = "Accept terms to continue";
    }
    
    if (!captchaToken) {
      newErrors.captcha = "Complete reCAPTCHA";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    const updatedForm = {
      ...form,
      [name]: value,
    };
    
    setForm(updatedForm);
    
    const errorMsg = validateField(name, value, updatedForm);
    
    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg,
    }));
    
    if (name === "password" && updatedForm.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== updatedForm.confirmPassword
            ? "Passwords do not match"
            : "",
      }));
    }
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value
      .replace(/[^\d]/g, "")
      .slice(0, selectedCountry.phoneLength[0]);
    
    setForm((prev) => ({ ...prev, phone: cleaned }));
    let error = "";
    
    if (
      cleaned.length > 0 &&
      cleaned.length !== selectedCountry.phoneLength[0]
    ) {
      error = `Enter ${selectedCountry.phoneLength[0]} digits`;
    }
    
    setErrors((prev) => ({
      ...prev,
      phone: error,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const fullPhone = form.phone 
        ? `${selectedCountry.dialCode}${form.phone.replace(/\D/g, '')}` 
        : '';
      
      const response = await axios.post(`${serverURL}/api/signup`, {
        email: form.email.trim(),
        mName: form.mName.trim(),
        password: form.password,
        type: 'free',
        phone: fullPhone,
        captchaToken,
      });
      
      if (!response.data.success) {
        setErrors({ general: response.data.message || 'Signup failed' });
        return;
      }
      
      if (response.data.autoLogin) {
        sessionStorage.setItem('email', form.email);
        sessionStorage.setItem('mName', form.mName);
        sessionStorage.setItem('auth', 'true');
        sessionStorage.setItem('uid', response.data.userId);
        sessionStorage.setItem('type', 'forever');
        
        toast({ title: 'Account created successfully', description: `Welcome to ${appName}` });
        await sendEmail(form.email, form.mName);
        window.location.href = '/dashboard';
        return;
      }
      
      toast({ title: 'Account created', description: 'Please check your email to verify your account.' });
      window.location.href = '/login';
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || 'Failed to create account. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendEmail = async (mEmail: string, name?: string) => {
    try {
      await axios.post(`${serverURL}/api/data`, {
        subject: `Welcome to ${appName}`,
        to: mEmail,
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; background:#f6f9fc; padding:24px;">
              <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;padding:32px;border:1px solid #e5e7eb;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                  <img src="${appLogo}" alt="${appName}" width="44" height="44" />
                  <h1 style="margin:0;font-size:24px;">Welcome to ${appName}</h1>
                </div>
                <p style="font-size:16px;line-height:1.7;color:#111827;">Hello ${name || mEmail}, your account is ready.</p>
                <p style="font-size:16px;line-height:1.7;color:#111827;">Use ${websiteURL} to sign in and start building courses, schedules, and learning workflows.</p>
              </div>
            </body>
          </html>`,
      });
    } catch (error) {
      console.error('Welcome email failed:', error);
    }
  };
  
  const handleGoogleSignup = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    const decoded: any = jwtDecode(credentialResponse.credential);
    
    try {
      setIsLoading(true);
      const response = await axios.post(`${serverURL}/api/social`, {
        email: decoded.email,
        mName: decoded.name,
      });
      
      if (!response.data.success) {
        setErrors({ general: response.data.message || 'Signup failed' });
        return;
      }
      
      sessionStorage.setItem('email', decoded.email);
      sessionStorage.setItem('mName', decoded.name);
      sessionStorage.setItem('auth', 'true');
      sessionStorage.setItem('uid', response.data.userData._id);
      sessionStorage.setItem('type', response.data.userData.type);
      
      toast({ title: 'Account created', description: `Welcome to ${appName}` });
      window.location.href = '/dashboard';
    } catch (error) {
      setErrors({ general: 'Google signup failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.dialCode.includes(countrySearch)
  );
  
  const isFormValid =
    form.mName &&
    form.email &&
    form.password &&
    form.confirmPassword &&
    !errors.mName &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword &&
    !errors.phone &&
    agreeToTerms &&
    captchaToken;
  
  return (
   <div className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(30,138,138,0.08),transparent_25%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)]">
      {/* Responsive Background Effects */}
  <div className="absolute right-0 top-0 -z-10 h-[14rem] w-[14rem] sm:h-[18rem] sm:w-[18rem] md:h-[22rem] md:w-[22rem] lg:h-[26rem] lg:w-[26rem] rounded-full bg-primary/10 blur-3xl opacity-50" />

  <div className="absolute bottom-0 left-0 -z-10 h-[14rem] w-[14rem] sm:h-[18rem] sm:w-[18rem] md:h-[22rem] md:w-[22rem] lg:h-[26rem] lg:w-[26rem] rounded-full bg-cyan-500/10 blur-3xl opacity-50" />
      
      {/* Responsive Back Button */}
      <div className="fixed right-2 top-2 z-50 xs:right-3 xs:top-3 sm:right-4 sm:top-4 md:right-6 md:top-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 px-2 py-1 text-[10px] font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-primary/20 hover:text-primary xs:gap-1.5 xs:px-2.5 xs:py-1.5 xs:text-xs sm:gap-2 sm:px-3 sm:py-2 sm:text-sm md:px-4"
        >
          <Home className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Back to Website</span>
          <span>Back to Website</span>
        </Link>
      </div>
      
      {/* Responsive Grid Layout */}
      <div className="flex min-h-screen flex-col lg:grid lg:min-h-dvh lg:grid-cols-[0.95fr_1.05fr]">
        {/* ===================== LEFT SIDE - FULL CONTENT (Hidden on Mobile) ===================== */}
        <section className="relative hidden overflow-hidden bg-slate-950 text-white lg:flex lg:items-center lg:justify-center lg:px-6 xl:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,138,138,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_30%)]" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-screen"
            style={{ backgroundImage: "url('/bexon/images/pattern-bg.webp')" }}
          />
          
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-10 w-full max-w-xl space-y-6 px-4 sm:px-6 md:space-y-8"
          >
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <img src={appWordmarkLight} alt={appName} className="h-8 w-auto max-w-[180px] sm:h-9 md:h-10 md:max-w-[260px]" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 sm:text-xs sm:tracking-[0.35em]">Create account</p>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <Badge className="inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-cyan-100 hover:bg-white/10 sm:px-4 sm:py-1.5">
                <Sparkles className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-3.5 sm:w-3.5" />
                <span className="text-xs sm:text-sm">Join the platform</span>
              </Badge>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                Start with a clean onboarding flow and a structured workspace.
              </h1>
              <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-7 lg:text-lg">
                Create your account, verify your email, and enter the learning platform with a responsive UI.
              </p>
            </div>
            
            <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
              {[
                { value: 'Free', label: 'Starter' },
                { value: 'AI', label: 'Tools' },
                { value: '24/7', label: 'Access' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur sm:rounded-2xl sm:p-4">
                  <div className="text-xl font-semibold sm:text-2xl">{item.value}</div>
                  <div className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-slate-400 sm:mt-1 sm:text-[11px] sm:tracking-[0.25em]">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {signupHighlights.map((item) => (
                <div key={item.title} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur sm:gap-3 sm:rounded-2xl sm:p-4">
                  <item.icon className="mt-0.5 h-4 w-4 text-cyan-200 sm:h-5 sm:w-5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white sm:text-base">{item.title}</h3>
                    <p className="text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
        
        {/* ===================== RIGHT SIDE - FORM (Fully Responsive) ===================== */}
 <section className="flex justify-center min-h-screen pb-10 sm:pb-14 pt-16 sm:pt-20 lg:pt-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
         className="w-full max-w-md mx-auto"
          >
            <Card className="border-slate-200/80 bg-white/90 shadow-lg backdrop-blur sm:shadow-xl">
          <CardContent className="space-y-4 p-4 sm:space-y-5 sm:p-6 md:space-y-6 md:px-8 md:pt-8 md:pb-10">
                <div>
                  <Badge variant="secondary" className="inline-flex rounded-full px-3 py-1 text-xs sm:px-4 sm:py-1.5">
                    <ShieldCheck className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-3.5 sm:w-3.5" />
                    Sign up
                  </Badge>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight sm:mt-4 sm:text-2xl md:text-3xl">
                    Create your account
                  </h2>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-7">
                    Start free and move into the platform with verified access.
                  </p>
                </div>
                
                {errors.general && (
                  <Alert variant="destructive" className="text-xs sm:text-sm">
                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <Field label="Full Name" error={errors.mName}>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground sm:left-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                      <Input
                        name="mName"
                        placeholder="John Doe"
                        value={form.mName}
                        onChange={handleChange}
                        className="h-10 rounded-lg border-transparent bg-slate-50 pl-8 text-sm focus:border-primary focus:bg-white sm:h-11 sm:rounded-xl sm:pl-9 md:h-12 md:pl-11"
                        disabled={isLoading}
                      />
                    </div>
                  </Field>
                  
                  <Field label="Email Address" error={errors.email}>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground sm:left-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                      <Input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className="h-10 rounded-lg border-transparent bg-slate-50 pl-8 text-sm focus:border-primary focus:bg-white sm:h-11 sm:rounded-xl sm:pl-9 md:h-12 md:pl-11"
                        disabled={isLoading}
                      />
                    </div>
                  </Field>
                  
                  <Field label="Phone Number (Optional)" error={errors.phone}>
                    <div className="relative" ref={dropdownRef}>
                      <div className="flex h-10 rounded-lg border bg-slate-50 focus-within:border-primary sm:h-11 sm:rounded-xl md:h-12">
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="flex items-center gap-1 rounded-l-lg border-r border-slate-200 px-2 text-xs hover:bg-slate-100 sm:gap-1.5 sm:rounded-l-xl sm:px-3 sm:text-sm"
                        >
                          <span className="font-mono text-xs sm:text-sm">{selectedCountry.dialCode}</span>
                          <ChevronDown className={cn("h-3 w-3 transition-transform sm:h-3.5 sm:w-3.5 md:h-4 md:w-4", dropdownOpen && "rotate-180")} />
                        </button>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={handlePhoneChange}
                          placeholder={`${selectedCountry.phoneLength[0]} digits`}
                          className="flex-1 bg-transparent px-3 text-sm outline-none sm:px-4"
                          disabled={isLoading}
                        />
                      </div>
                      
                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-xl sm:rounded-xl"
                          >
                            <div className="p-2">
                              <div className="flex items-center gap-2 border-b pb-2">
                                <Search className="h-3 w-3 text-muted-foreground sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                                <input
                                  ref={searchRef}
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                  placeholder="Search country..."
                                  className="flex-1 bg-transparent text-xs outline-none sm:text-sm"
                                />
                              </div>
                            </div>
                            <div className="max-h-48 overflow-auto sm:max-h-60">
                              {filteredCountries.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(country);
                                    setDropdownOpen(false);
                                    setCountrySearch('');
                                    setForm((prev) => ({ ...prev, phone: '' }));
                                  }}
                                  className="flex w-full justify-between px-3 py-2 text-left text-xs hover:bg-slate-50 sm:px-4 sm:py-2.5 sm:text-sm"
                                >
                                  <span className="truncate">{country.name}</span>
                                  <span className="ml-2 font-mono text-xs text-muted-foreground sm:text-sm">{country.dialCode}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Field>
               <Field label="Password">
  <div className="relative group">
    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
    
    <Input
      name="password"
      type="password"
      placeholder="••••••••"
      value={form.password}
      onChange={handleChange}
      className="h-12 rounded-xl border-slate-200 bg-slate-50/50 pl-11 transition-all focus:bg-white focus:ring-4 focus:ring-primary/5"
      disabled={isLoading}
    />
  </div>
</Field>
<AnimatePresence mode="wait">
  {form.password && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2 overflow-hidden"
    >
      <div className="flex gap-1 h-1 w-full rounded-full bg-slate-100">
        {[1, 2, 3].map((step) => {
          const strength = getPasswordStrength(form.password);
          const isActive =
            (strength === "Weak" && step === 1) ||
            (strength === "Medium" && step <= 2) ||
            (strength === "Strong");

          return (
            <div
              key={step}
              className={cn(
                "h-full flex-1 transition-all duration-500 rounded-full",
                isActive
                  ? strength === "Weak"
                    ? "bg-red-500"
                    : strength === "Medium"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                  : "bg-transparent"
              )}
            />
          );
        })}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">
        {getPasswordStrength(form.password)} security
      </p>
    </motion.div>
  )}
</AnimatePresence>

                 <Field label="Confirm Password" error={errors.confirmPassword}>
  <div className="relative group">
    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
    
    <Input
      name="confirmPassword"
      type="password"
      placeholder="••••••••"
      value={form.confirmPassword}
      onChange={handleChange}
      className="h-12 rounded-xl border-slate-200 bg-slate-50/50 pl-11 transition-all focus:bg-white focus:ring-4 focus:ring-primary/5"
      disabled={isLoading}
    />
  </div>
</Field>
                  {/* Responsive reCAPTCHA */}
                  <div className="flex justify-center py-1 sm:py-2">
                   <div className="flex justify-center">
  <div className="scale-[0.85] sm:scale-100 origin-top">
    <ReCAPTCHA 
      sitekey={recaptchaSiteKey} 
      onChange={setCaptchaToken}
    />
  </div>
</div>
                  </div>
                  
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
                      disabled={isLoading}
                      className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4"
                    />
                    <label htmlFor="terms" className="text-[11px] leading-5 text-muted-foreground sm:text-xs md:text-sm">
                      I agree to the{' '}
                      <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and{' '}
                      <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
                    </label>
                  </div>
                  
                 <Button
  type="submit"
  disabled={isLoading || !isFormValid}
  className="w-full h-11 sm:h-12 rounded-xl bg-primary text-white text-sm font-medium shadow-md hover:bg-primary/90 transition"
>
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                        <span className="text-xs sm:text-sm">Creating account...</span>
                      </span>
                    ) : (
                      'Sign up'
                    )}
                  </Button>
                </form>
                
             <div className="relative py-3 sm:py-4">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t border-slate-200" />
  </div>
  <div className="relative flex justify-center">
    <span className="bg-white px-3 text-[10px] uppercase tracking-wider text-muted-foreground sm:px-4 sm:text-xs">
      Or sign up with
    </span>
  </div>
</div>

<div className="w-full mt-2 sm:mt-3">
  <GoogleLogin
    theme="outline"
    width={googleButtonWidth}
    onSuccess={handleGoogleSignup}
    onError={() => setErrors({ general: 'Google signup failed' })}
  />
</div>

<p className="mt-3 sm:mt-4 text-center text-[11px] text-muted-foreground sm:text-xs md:text-sm">
  Already have an account?{' '}
  <Link to="/login" className="font-semibold text-primary hover:underline">
    Sign in
  </Link>
</p>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Signup;