
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Mail, Lock, User, AlertTriangle, Sparkles, GraduationCap, ShieldCheck, Home } from 'lucide-react';
import { appLogo, appName, companyName, serverURL, websiteURL } from '@/constants';
import Logo from '../res/logo.svg';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from 'framer-motion';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
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

    // Simple validation
    if (!name || !email || !password) {
      setError('Please fill out all fields');
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

    setIsLoading(true);

    // This is where you would integrate signup logic
    try {
      const postURL = serverURL + '/api/signup';
      const type = 'free';

      const response = await axios.post(postURL, { email, mName: name, password, type });
      if (response.data.success) {
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('mName', name);
        sessionStorage.setItem('auth', 'true');
        sessionStorage.setItem('uid', response.data.userId);
        sessionStorage.setItem('type', 'free');
        toast({
          title: "Account created!",
          description: "Welcome to " + appName + ".",
        });
        sendEmail(email);
      } else {
        setError(response.data.message);
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  async function sendEmail(mEmail: string, mName?: string) {
    const userName = mName || name;
    try {
      const dataToSend = {
        subject: `Welcome to ${appName}`,
        to: mEmail,
        html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
                <html lang="en">
                  <head></head>
                  <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">Welcome to AIstudy<div> ‌​‍‎‏﻿</div></div>
                  <body style="padding:20px; margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:#f6f9fc;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;">
                    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" height="80%" width="100%" style="max-width:37.5em;max-height:80%; margin-left:auto;margin-right:auto;margin-top:80px;margin-bottom:80px;width:465px;border-radius:0.25rem;border-width:1px;background-color:#fff;padding:20px">
                      <tr style="width:100%">
                        <td>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-top:32px">
                            <tbody>
                              <tr>
                                <td><img alt="Logo" src="${appLogo}" width="40" height="37" style="display:block;outline:none;border:none;text-decoration:none;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px" /></td>
                              </tr>
                            </tbody>
                          </table>
                          <h1 style="margin-left:0px;margin-right:0px;margin-top:30px;margin-bottom:30px;padding:0px;text-align:center;font-size:24px;font-weight:400;color:rgb(0,0,0)">Welcome to <strong>${appName}</strong></h1>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Hello <strong>${userName}</strong>,</p>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Welcome to <strong>${appName}</strong>, Unleash your AI potential with our platform, offering a seamless blend of theory and video courses. Dive into comprehensive lessons, from foundational theories to real-world applications, tailored to your learning preferences. Experience the future of AI education with ${appName} – where theory meets engaging visuals for a transformative learning journey!</p>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-bottom:32px;margin-top:32px;text-align:center">
                            <tbody>
                              <tr>
                                <td><a href="${websiteURL}" target="_blank" style="p-x:20px;p-y:12px;line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color: #007BFF;text-align:center;font-size:12px;font-weight:600;color:rgb(255,255,255);text-decoration-line:none"><span></span><span style="p-x:20px;p-y:12px;max-width:100%;display:inline-block;line-height:120%;text-decoration:none;text-transform:none;mso-padding-alt:0px;mso-text-raise:9px"><span>Get Started</span></a></td>
                              </tr>
                            </tbody>
                          </table>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Best,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">The <strong>${companyName}</strong> Team</p></p>
                          </td>
                      </tr>
                    </table>
                  </body>
                </html>`
      };
      const postURL = serverURL + '/api/data';
      await axios.post(postURL, dataToSend).then(res => {
        redirectHome();
      }).catch(error => {
        console.error(error);
        redirectHome();
      });
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
            scale: [1.2, 1, 1.2, 1, 1.2]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] border border-white/10 rounded-full"
        />
        <motion.div
          animate={{
            rotate: [360, 270, 180, 90, 0],
            scale: [1, 1.4, 1, 1.4, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-15%] left-[-15%] w-[60%] h-[60%] border border-white/10 rounded-full"
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
            Start Your <br /> Learning Adventure <br /> Today.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/80 text-lg mb-10 leading-relaxed"
          >
            Unlock the power of AI-driven education. Join 50,000+ learners who are mastering new technologies effortlessly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">Secure & Private</div>
                <div className="text-white/60 text-sm">Your data is always protected</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">AI-Powered</div>
                <div className="text-white/60 text-sm">Personalized curriculum in seconds</div>
              </div>
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

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[440px]"
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

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Create an account</h1>
            <p className="text-muted-foreground">Join the future of learning</p>
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
                  <AlertDescription className="font-medium text-sm">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold tracking-wider uppercase text-muted-foreground/80">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-11 h-12 bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all rounded-xl"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold tracking-wider uppercase text-muted-foreground/80">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all rounded-xl"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold tracking-wider uppercase text-muted-foreground/80">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 9 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12 bg-muted/30 border-transparent focus:border-primary focus:bg-background transition-all rounded-xl"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                disabled={isLoading}
                className="mt-1"
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-tight cursor-pointer"
              >
                I agree to the{" "}
                <Link to="/terms" className="text-primary font-medium hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy-policy" className="text-primary font-medium hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20 mt-4" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Create account
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-medium">Or sign up with</span>
            </div>
          </div>

          <div className="w-full flex justify-center mb-8">
            <GoogleLogin
              theme='outline'
              type='standard'
              width="440"
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
                      description: "Welcome to " + appName,
                    });
                    setIsLoading(false);
                    sessionStorage.setItem('email', decoded.email);
                    sessionStorage.setItem('mName', decoded.name);
                    sessionStorage.setItem('auth', 'true');
                    sessionStorage.setItem('uid', response.data.userData._id);
                    sessionStorage.setItem('type', response.data.userData.type);
                    sendEmail(decoded.email, decoded.name);
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
                setError('Signup Failed');
              }}
            />
          </div>

          <p className="text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
