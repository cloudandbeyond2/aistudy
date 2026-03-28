import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import ReCAPTCHA from 'react-google-recaptcha';
import Swal from 'sweetalert2';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
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
import InnerPageTopBar from '@/components/InnerPageTopBar';
import { appLogo, appName, appWordmarkDark, appWordmarkLight, companyName, recaptchaSiteKey, serverURL, websiteURL } from '@/constants';

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

const Signup = () => {
  const [mName, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(340);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (sessionStorage.getItem('auth')) {
      redirectHome();
    }
  }, []);

  useEffect(() => {
    const updateGoogleButtonWidth = () => {
      const availableWidth = Math.max(240, window.innerWidth - 48);
      setGoogleButtonWidth(Math.min(340, availableWidth));
    };

    updateGoogleButtonWidth();
    window.addEventListener('resize', updateGoogleButtonWidth);
    return () => window.removeEventListener('resize', updateGoogleButtonWidth);
  }, []);

  const redirectHome = () => {
    navigate('/dashboard');
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mName || !email || !password || !confirmPassword) {
      setError('Please fill out all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    if (password.length < 9) {
      setError('Password should be at least 9 characters');
      return;
    }

    if (!captchaToken) {
      setError('Please complete the reCAPTCHA');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${serverURL}/api/signup`, {
        email,
        mName,
        password,
        type: 'free',
        phone,
        captchaToken,
      });

      if (!response.data.success) {
        setError(response.data.message || 'Signup failed');
        return;
      }

      if (response.data.autoLogin) {
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('mName', mName);
        sessionStorage.setItem('auth', 'true');
        sessionStorage.setItem('uid', response.data.userId);
        sessionStorage.setItem('type', 'forever');
        toast({
          title: 'Account created',
          description: `Welcome to ${appName}`,
        });
        window.location.href = '/dashboard';
        return;
      }

      toast({
        title: 'Verify your email',
        description: 'Your account has been created. Please check your inbox before logging in.',
      });
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: 'error',
        title: 'Signup Failed',
        text: 'Failed to create account. Please try again.',
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;

    const decoded: any = jwtDecode(credentialResponse.credential);
    try {
      setIsLoading(true);
      const response = await axios.post(`${serverURL}/api/social`, { email: decoded.email, mName: decoded.name });
      if (!response.data.success) {
        setError(response.data.message || 'Signup failed');
        return;
      }

      sessionStorage.setItem('email', decoded.email);
      sessionStorage.setItem('mName', decoded.name);
      sessionStorage.setItem('auth', 'true');
      sessionStorage.setItem('uid', response.data.userData._id);
      sessionStorage.setItem('type', response.data.userData.type);

      toast({
        title: 'Account created',
        description: `Welcome to ${appName}`,
      });
      await sendEmail(decoded.email, decoded.name);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error(error);
      setError('Internal Server Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(30,138,138,0.08),transparent_25%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)]">
      <div className="absolute right-0 top-0 -z-10 h-[28rem] w-[28rem] translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-[28rem] w-[28rem] -translate-x-1/3 translate-y-1/3 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-20 bg-[#06101d] px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <InnerPageTopBar variant="dark" className="px-0" />
      </div>

      <div className="grid min-h-dvh lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 text-white lg:flex lg:items-center lg:justify-center lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,138,138,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_30%)]" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-screen"
            style={{ backgroundImage: "url('/bexon/images/pattern-bg.webp')" }}
          />

          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-10 max-w-xl space-y-8"
          >
            <div className="flex items-center gap-3">
              <img src={appWordmarkLight} alt={appName} className="h-10 w-auto max-w-[260px]" />
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Create account</p>
              </div>
            </div>

            <div className="space-y-4">
              <Badge className="rounded-full bg-white/10 px-4 py-1.5 text-cyan-100 hover:bg-white/10">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Join the platform
              </Badge>
              <h1 className="max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Start with a clean onboarding flow and a structured workspace.
              </h1>
              <p className="max-w-lg text-sm leading-7 text-slate-300 lg:text-base">
                Create your account, verify your email, and enter the learning platform with a responsive UI.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: 'Free', label: 'Starter' },
                { value: 'AI', label: 'Tools' },
                { value: '24/7', label: 'Access' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-2xl font-semibold">{item.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-3">
              {signupHighlights.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <item.icon className="mt-0.5 h-5 w-5 text-cyan-200" />
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-sm leading-6 text-slate-300">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="flex items-start justify-center px-4 py-8 sm:px-6 lg:items-center lg:px-8 lg:py-16">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[460px]"
          >
            <div className="lg:hidden mb-8">
              <Link to="/" className="inline-flex items-center gap-3">
                <img src={appWordmarkDark} alt={appName} className="h-8 w-auto max-w-[240px]" />
              </Link>
            </div>

            <Card className="border-slate-200/80 bg-white/90 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.35)] backdrop-blur">
              <CardContent className="space-y-6 p-6 md:p-8">
                <div>
                  <Badge variant="secondary" className="rounded-full px-4 py-1.5">
                    <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                    Sign up
                  </Badge>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight">Create your account</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Start free and move into the platform with verified access.
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <Alert variant="destructive" className="border-destructive/20 bg-destructive/10 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="font-medium text-sm">{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Full name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={mName}
                          onChange={(e) => setName(e.target.value)}
                          className="h-12 rounded-xl border-transparent bg-slate-50 pl-11 transition focus:border-primary focus:bg-white"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Email address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 rounded-xl border-transparent bg-slate-50 pl-11 transition focus:border-primary focus:bg-white"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Phone number
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="1234567890"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="h-12 rounded-xl border-transparent bg-slate-50 transition focus:border-primary focus:bg-white"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="At least 9 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 rounded-xl border-transparent bg-slate-50 pl-11 transition focus:border-primary focus:bg-white"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Confirm password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Repeat your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-12 rounded-xl border-transparent bg-slate-50 pl-11 transition focus:border-primary focus:bg-white"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center py-2 overflow-hidden">
                    <div className="origin-center scale-[0.9] sm:scale-100">
                      <ReCAPTCHA sitekey={recaptchaSiteKey} onChange={(token) => setCaptchaToken(token)} />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                      disabled={isLoading}
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm leading-6 text-muted-foreground">
                      I agree to the{' '}
                      <Link to="/terms" className="font-medium text-primary hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy-policy" className="font-medium text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign up
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Or sign up with
                    </span>
                  </div>
                </div>

                <div className="flex justify-center overflow-hidden">
                  <GoogleLogin
                    theme="outline"
                    type="standard"
                    width={googleButtonWidth}
                    shape="rectangular"
                    onSuccess={handleGoogleSignup}
                    onError={() => {
                      setError('Signup Failed');
                    }}
                  />
                </div>

                <p className="text-center text-sm text-muted-foreground">
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
