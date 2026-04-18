import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InnerPageTopBar from '@/components/InnerPageTopBar';
import { appName, appWordmarkDark, appWordmarkLight, serverURL } from '@/constants';

const loginHighlights = [
  {
    icon: BookOpen,
    title: 'Courses and content',
    text: 'Access your learning workspace, AI notebook, and course tools.',
  },
  {
    icon: GraduationCap,
    title: 'Role-based access',
    text: 'Users, students, staff, and organizations land in the right panel.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure sign-in',
    text: 'Session-based access with clear account and role handling.',
  },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0 });
  const [googleButtonWidth, setGoogleButtonWidth] = useState(340);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    if (sessionStorage.getItem('auth')) {
      redirectHome();
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const fetchRealCounts = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/public-stats`);
        if (response.data) {
          setStats({
            totalUsers: response.data.users || 0,
            totalCourses: response.data.courses || 0,
          });
        }
      } catch {
        setStats({ totalUsers: 98, totalCourses: 59 });
      }
    };

    fetchRealCounts();
  }, []);

  useEffect(() => {
    const updateGoogleButtonWidth = () => {
      const availableWidth = Math.max(240, Math.min(400, window.innerWidth - 48));
      setGoogleButtonWidth(availableWidth);
    };

    updateGoogleButtonWidth();
    window.addEventListener('resize', updateGoogleButtonWidth);
    return () => window.removeEventListener('resize', updateGoogleButtonWidth);
  }, []);

  const redirectHome = () => {
    const role = sessionStorage.getItem('role') || '';
    navigate(getDashboardPath(role));
  };

  const getDashboardPath = (role: string) => {
    if (role === 'org_admin') return '/dashboard/org';
    if (role === 'student') return '/dashboard/student';
    if (role === 'dept_admin') return '/dashboard/dept';
    return '/dashboard';
  };

  const storeUserSession = (userData: any) => {
    sessionStorage.setItem('email', userData.email);
    sessionStorage.setItem('mName', userData.mName);
    sessionStorage.setItem('auth', 'true');
    sessionStorage.setItem('uid', userData._id);
    sessionStorage.setItem('type', userData.type);
    sessionStorage.setItem('subscriptionEnd', userData.subscriptionEnd || '');
    sessionStorage.setItem('isOrganization', userData.isOrganization ? 'true' : 'false');
    sessionStorage.setItem('role', userData.role);
    sessionStorage.setItem('courseLimit', String(userData.courseLimit || 0));
    sessionStorage.setItem('coursesCreatedCount', String(userData.coursesCreatedCount || 0));

    const organizationId = userData.isOrganization ? userData._id : userData.organizationId;
    if (organizationId) sessionStorage.setItem('orgId', organizationId);
    if (userData.department) sessionStorage.setItem('deptId', userData.department);
    if (userData.organization) sessionStorage.setItem('orgId', userData.organization);
  };

  const getDataFromDatabase = async (id: string) => {
    try {
      const response = await axios.get(`${serverURL}/api/shareable?id=${id}`);
      const dat = response.data[0].content;
      const jsonData = JSON.parse(dat);
      const type = response.data[0].type.toLowerCase();
      const mainTopic = response.data[0].mainTopic;
      const user = sessionStorage.getItem('uid');
      const content = JSON.stringify(jsonData);
      const responses = await axios.post(`${serverURL}/api/courseshared`, { user, content, type, mainTopic });

      if (responses.data.success) {
        sessionStorage.removeItem('shared');
      }
    } catch (error) {
      console.error(error);
    } finally {
      redirectHome();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${serverURL}/api/signin`, { email, password });
      if (!response.data.success) {
        setError(response.data.message || 'Failed to login');
        return;
      }

      storeUserSession(response.data.userData);
      toast({
        title: 'Login successful',
        description: `Welcome back to ${appName}`,
      });

      const shared = sessionStorage.getItem('shared');
      if (shared) {
        await getDataFromDatabase(shared);
        return;
      }

      navigate(getDashboardPath(response.data.userData.role));
    } catch (err) {
      console.error(err);
      setError('Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white">
      {/* Background effects */}
      <div className="fixed right-0 top-0 -z-10 h-[28rem] w-[28rem] translate-x-1/3 -translate-y-1/3 rounded-full bg-[#14b8a6]/10 blur-3xl" />
      <div className="fixed bottom-0 left-0 -z-10 h-[28rem] w-[28rem] -translate-x-1/3 translate-y-1/3 rounded-full bg-[#06b6d4]/10 blur-3xl" />

      {/* Top Bar */}
      <div className="relative z-20 bg-[#0f172a] px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <InnerPageTopBar variant="dark" className="px-0" />
      </div>

      {/* Main Grid Layout */}
      <div className="flex min-h-[calc(100vh-80px)] w-full lg:min-h-[calc(100vh-88px)]">
        <div className="grid w-full grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left Section - Full Height Dark Background */}
          <section className="relative hidden min-h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 lg:block">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.1),transparent_50%)]" />
            
            {/* Pattern Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-5 mix-blend-overlay"
              style={{ backgroundImage: "url('/bexon/images/pattern-bg.webp')" }}
            />

            {/* Content Container */}
            <div className="relative z-10 flex min-h-full items-center justify-center px-8 py-12 xl:px-12">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="w-full max-w-xl space-y-8"
              >
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <img src={appWordmarkLight} alt={appName} className="h-10 w-auto max-w-[260px]" />
                </div>

                {/* Hero Text */}
                <div className="space-y-4">
                  <Badge className="w-fit rounded-full bg-white/10 px-4 py-1.5 text-cyan-100 hover:bg-white/10">
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    Sign in to your workspace
                  </Badge>
                  <h1 className="max-w-lg text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    A corporate learning platform built for clarity and speed.
                  </h1>
                  <p className="max-w-lg text-sm leading-7 text-slate-300 lg:text-base">
                    Access your dashboard, calendars, tasks, AI tools, and role-based panels from one clean entry point.
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: `${stats.totalCourses}+`, label: 'COURSES' },
                    { value: `${stats.totalUsers}+`, label: 'LEARNERS' },
                    { value: '24/7', label: 'ACCESS' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <div className="text-2xl font-semibold text-white">{item.value}</div>
                      <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.25em] text-slate-400">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Highlights */}
                <div className="grid gap-3">
                  {loginHighlights.map((item) => (
                    <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-200" />
                      <div>
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        <p className="text-sm leading-6 text-slate-300">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Right Section - Login Form */}
        <section className="flex items-start justify-center px-4 py-8 sm:px-6 lg:items-center lg:px-8 lg:py-16">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[440px]"
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
                    Welcome back
                  </Badge>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight">Sign in to continue</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Use your registered email and password to open your dashboard.
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
                        <AlertDescription className="font-medium">{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                      {/* <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 rounded-xl border-transparent bg-slate-50 pl-11 transition focus:border-primary focus:bg-white"
                        disabled={isLoading}
                      /> */}
                      <Input
  id="email"
  name="email"
  type="email"
  autoComplete="email"
  placeholder="name@company.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="h-12 rounded-xl border-transparent bg-slate-50 pl-11 transition focus:border-primary focus:bg-white"
  disabled={isLoading}
/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Password
                      </Label>
                      <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                     <Input
  id="password"
  name="password"
  type="password"
  autoComplete="current-password"
  placeholder="••••••••"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="h-12 rounded-xl border-transparent bg-slate-50 pl-11 transition focus:border-primary focus:bg-white"
  disabled={isLoading}
/>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign in
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
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    theme="outline"
                    type="standard"
                    width={googleButtonWidth}
                    shape="rectangular"
                    onSuccess={async (credentialResponse) => {
                      if (!credentialResponse.credential) return;

                      const decoded: any = jwtDecode(credentialResponse.credential);
                      try {
                        setIsLoading(true);
                        const response = await axios.post(`${serverURL}/api/social`, {
                          email: decoded.email,
                          name: decoded.name,
                        });

                        if (!response.data.success) {
                          setError(response.data.message || 'Login failed');
                          return;
                        }

                        storeUserSession(response.data.userData);
                        toast({
                          title: 'Login successful',
                          description: `Welcome back to ${appName}`,
                        });
                        navigate(getDashboardPath(response.data.userData.role));
                      } catch (error) {
                        console.error(error);
                        setError('Internal Server Error');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    onError={() => {
                      setError('Login Failed');
                    }}
                  />
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link to="/signup" className="font-semibold text-primary hover:underline">
                    Create one for free
                  </Link>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </section>
        </div>
      </div>
    </div>
  );
};

export default Login;
