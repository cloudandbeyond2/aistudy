
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, AlertTriangle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { appLogo, appName, appWordmarkDark, appWordmarkLight, companyName, serverURL } from '@/constants';
import InnerPageTopBar from '@/components/InnerPageTopBar';
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
    <div className="min-h-dvh overflow-hidden bg-[#06101d] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-20 px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <InnerPageTopBar variant="dark" className="px-0" />
      </div>

      <div className="grid min-h-[calc(100dvh-5rem)] lg:grid-cols-[1.05fr_0.95fr]">
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
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-cyan-100">
                <KeyRound className="h-3.5 w-3.5" />
                Account recovery
              </div>
              <h2 className="max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Recover your account access with a clean reset flow.
              </h2>
              <p className="max-w-lg text-sm leading-7 text-slate-300 lg:text-base">
                We will send a reset link to your registered email so you can return to your workspace securely.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: 'Secure', label: 'Reset' },
                { value: 'Fast', label: 'Delivery' },
                { value: 'Simple', label: 'Recovery' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-2xl font-semibold">{item.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-200" />
              <div>
                <h3 className="font-semibold text-white">Secure recovery</h3>
                <p className="text-sm leading-6 text-slate-300">
                  Password reset emails are tied to your account and the request flow stays controlled.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
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

            <Card className="border-white/10 bg-white/95 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.35)] backdrop-blur-sm">
              <CardContent className="space-y-6 p-6 md:p-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-cyan-100">
                    <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                    Forgot password
                  </div>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Reset your password</h1>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Enter your email and we&apos;ll send a reset link to your inbox.
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

                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50 p-8 text-center"
                  >
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Mail className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-950">Check your email</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      We&apos;ve sent a password reset link to <strong className="text-slate-950">{email}</strong>
                    </p>
                    <p className="mt-4 border-t border-slate-200/70 pt-4 text-sm text-slate-600">
                      Didn&apos;t receive the email? Check your spam folder or{' '}
                      <button className="font-semibold text-primary hover:underline" onClick={() => setSuccess(false)}>
                        try again
                      </button>
                      .
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Email Address
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-primary" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 transition-all focus:border-primary focus:bg-white"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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

                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center text-sm font-medium text-slate-600 transition-colors group hover:text-primary"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to login
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default ForgotPassword;
