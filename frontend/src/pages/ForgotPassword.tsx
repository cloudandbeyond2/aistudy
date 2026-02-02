
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, AlertTriangle, ArrowRight, ShieldCheck, KeyRound, Home } from 'lucide-react';
import { appLogo, appName, companyName, serverURL } from '@/constants';
import Logo from '../res/logo.svg';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    try {
      const postURL = serverURL + '/api/forgot';
      const response = await axios.post(postURL, { email, name: appName, company: companyName, logo: appLogo });
      if (response.data.success) {
        setSuccess(true);
        toast({
          title: "Reset link sent",
          description: "If your email exists in our system, you'll receive a reset link shortly.",
        });
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setError(response.data.message);
      }

    } catch (err) {
      setError('Failed to send reset link. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
            <span className="font-display font-bold text-3xl tracking-tight u-text-shadow-sm">{appName}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 leading-[1.1]"
          >
            Recover Your <br /> Account Access <br /> Securely.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/80 text-lg mb-10 leading-relaxed"
          >
            Don't worry, it happens to the best of us. We'll help you get back to learning in no time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 w-fit"
          >
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg">Secure Recovery</div>
              <div className="text-white/60 text-sm">Your account security is our priority</div>
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

      {/* Right Panel - Forgot Password Form */}
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

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Forgot password?</h1>
            <p className="text-muted-foreground">Enter your email to reset your password.</p>
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

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-6 bg-muted/30 rounded-2xl p-8 border border-muted"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
                <Mail className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Check your email</h3>
                <p className="text-muted-foreground">
                  We've sent a password reset link to <br /> <strong className="text-foreground">{email}</strong>
                </p>
              </div>
              <p className="text-sm text-muted-foreground pt-4 border-t border-muted/60">
                Didn't receive the email? Check your spam folder or <button className="text-primary font-semibold hover:underline" onClick={() => setSuccess(false)}>try again</button>.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80">
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

              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Send reset link
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to login
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
