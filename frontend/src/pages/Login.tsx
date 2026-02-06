
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Mail, Lock, AlertTriangle, Sparkles, BookOpen, GraduationCap, Home } from 'lucide-react';
import { appName, serverURL } from '@/constants';
import Logo from '../res/logo.svg';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (auth) {
      redirectHome();
    }
  }, []);

  function redirectHome() {
    navigate("/dashboard");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      const postURL = serverURL + '/api/signin';
      const response = await axios.post(postURL, { email, password });
      if (response.data.success) {
        sessionStorage.setItem('email', response.data.userData.email);
        sessionStorage.setItem('mName', response.data.userData.mName);
        sessionStorage.setItem('auth', 'true');
        sessionStorage.setItem('uid', response.data.userData._id);
        sessionStorage.setItem('type', response.data.userData.type);
        sessionStorage.setItem('role', response.data.userData.role); // Store role

        // Store organization ID for org_admin and student roles
        if (response.data.userData.organization) {
          sessionStorage.setItem('orgId', response.data.userData.organization);
        }

        toast({
          title: "Login successful",
          description: "Welcome back to " + appName,
        });

        if (sessionStorage.getItem('shared') === null) {
          // Role based redirect
          if (response.data.userData.role === 'org_admin') {
            navigate("/dashboard/org");
          } else if (response.data.userData.role === 'student') {
            navigate("/dashboard/student");
          } else {
            redirectHome();
          }
        } else {
          getDataFromDatabase(sessionStorage.getItem('shared'));
        }
      } else {
        setError(response.data.message);
        setIsLoading(false);
      }

    } catch (err) {
      setError('Failed to login. Please check your credentials.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  async function getDataFromDatabase(id: string) {
    const postURL = serverURL + `/api/shareable?id=${id}`;
    try {
      const response = await axios.get(postURL);
      const dat = response.data[0].content;
      const jsonData = JSON.parse(dat);
      const type = response.data[0].type.toLowerCase();
      const mainTopic = response.data[0].mainTopic;
      const user = sessionStorage.getItem('uid');
      const content = JSON.stringify(jsonData);

      const postURLs = serverURL + '/api/courseshared';
      const responses = await axios.post(postURLs, { user, content, type, mainTopic });
      if (responses.data.success) {
        sessionStorage.removeItem('shared');
        redirectHome();
      } else {
        redirectHome();
      }
    } catch (error) {
      console.error(error);
      redirectHome();
    }
  }

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10" />

      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-indigo-600 relative items-center justify-center p-12 overflow-hidden">
        {/* Animated Background Shapes */}
        <motion.div
          animate={{
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.2, 1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] border border-white/10 rounded-full"
        />
        <motion.div
          animate={{
            rotate: [360, 270, 180, 90, 0],
            scale: [1.2, 1, 1.2, 1, 1.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] border border-white/10 rounded-full"
        />

        <div className="relative z-10 max-w-lg text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl">
              <img src={Logo} alt="Logo" className='h-8 w-8 filter brightness-0 invert' />
            </div>
            <span className="font-display font-bold text-3xl tracking-tight">{appName}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 leading-[1.1]"
          >
            Empower Your <br /> Learning Journey <br /> With AI.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/80 text-lg mb-10 leading-relaxed"
          >
            Join the future of education. Create personalized courses, master new skills, and unlock your potential with our intelligent platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="grid grid-cols-2 gap-6"
          >
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <Sparkles className="h-6 w-6 mb-2 text-white/60" />
              <div className="text-xl font-bold">10k+</div>
              <div className="text-white/60 text-sm">Courses Created</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <GraduationCap className="h-6 w-6 mb-2 text-white/60" />
              <div className="text-xl font-bold">50k+</div>
              <div className="text-white/60 text-sm">Active Learners</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Back to Website Button */}
      <div className="absolute top-4 right-4 z-50">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50 hover:bg-background hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
          <Home className="w-4 h-4" />
          Back to Website
        </Link>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <img src={Logo} alt="Logo" className='h-6 w-6 filter brightness-0 invert' />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">{appName}</span>
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-3 tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-lg">Sign in to your account</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all rounded-xl"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80">
                  Password
                </Label>
                <Link to="/forgot-password" title="Forgot Password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12 bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all rounded-xl"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Sign in
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-medium">Or continue with</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="w-full flex justify-center">
              <GoogleLogin
                theme='outline'
                type='standard'
                width="420"
                shape="rectangular"
                onSuccess={async (credentialResponse) => {
                  if (!credentialResponse.credential) return;
                  const decoded: any = jwtDecode(credentialResponse.credential);
                  const email = decoded.email;
                  const name = decoded.name;
                  const postURL = serverURL + '/api/social';
                  try {
                    setIsLoading(true);
                    const response = await axios.post(postURL, { email, name });
                    if (response.data.success) {
                      toast({
                        title: "Login successful",
                        description: "Welcome back to " + appName,
                      });
                      setIsLoading(false);
                      sessionStorage.setItem('email', decoded.email);
                      sessionStorage.setItem('mName', decoded.name);
                      sessionStorage.setItem('auth', 'true');
                      sessionStorage.setItem('uid', response.data.userData._id);
                      sessionStorage.setItem('type', response.data.userData.type);
                      redirectHome();
                    } else {
                      setIsLoading(false);
                      setError(response.data.message);
                    }
                  } catch (error) {
                    console.error(error);
                    setIsLoading(false);
                    setError('Internal Server Error');
                  }
                }}
                onError={() => {
                  setIsLoading(false);
                  setError('Login Failed');
                }}
              />
            </div>
          </div>

          <p className="mt-10 text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Create one for free
            </Link>
          </p>
        </motion.div>
      </div>
    </div >
  );
};

export default Login;
