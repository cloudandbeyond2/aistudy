import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Headphones,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';
import InnerPageTopBar from '@/components/InnerPageTopBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { appName, serverURL } from '@/constants';

const infoCards = [
  { icon: Mail, title: 'Email', value: 'colossusiq@gmail.com', text: 'Best for product and account questions.' },
  { icon: Phone, title: 'Phone', value: '+91 82200 02535', text: 'Available during business hours.' },
  { icon: MapPin, title: 'Location', value: 'Remote first', text: 'Corporate support across time zones.' },
  { icon: Clock, title: 'Response', value: '9:00 AM - 6:00 PM (IST)', text: 'We reply as soon as the queue allows.' },
];

const faqItems = [
  {
    q: 'How do I reset my password?',
    a: 'Use the Forgot Password link on the login page and follow the email instructions.',
  },
  {
    q: 'Who should use the organization enquiry form?',
    a: 'Teams evaluating deployment, pricing, onboarding, or custom scheduling workflows.',
  },
  {
    q: 'Can I contact support about billing?',
    a: 'Yes. Use the billing subject and include your account email so the team can verify it.',
  },
];

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${serverURL}/api/contact`, {
        fname: name,
        lname: subject,
        email,
        phone: '',
        msg: message,
      });

      if (response.data.success) {
        toast({
          title: 'Message sent',
          description: response.data.message,
        });
        setIsSubmitted(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        toast({
          title: 'Failed',
          description: response.data.message || 'Could not send your message.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Failed',
        description: error.response?.data?.message || 'Could not send your message.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Contact Us"
        description={`Contact the ${appName} team for support, billing, partnerships, and product questions.`}
        keywords="contact, support, billing, help, partnership"
      />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(30,138,138,0.08),transparent_25%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)]">
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,138,138,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_30%)]" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-screen"
            style={{ backgroundImage: "url('/bexon/images/pattern-bg.webp')" }}
          />

          <div className="relative z-20 mx-auto max-w-7xl px-4 pt-4 md:px-6 lg:px-8 lg:pt-6">
            <InnerPageTopBar variant="dark" className="px-0" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="space-y-6"
              >
                <Badge className="rounded-full bg-white/10 px-4 py-1.5 text-cyan-100 hover:bg-white/10">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Contact the team
                </Badge>
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                  Reach the right team without digging through the dashboard.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  Use this page for support, billing, partnership discussions, and general questions about {appName}.
                  The contact flow is responsive and simple on mobile.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <ShieldCheck className="h-5 w-5 text-cyan-200" />
                    <p className="mt-3 text-sm text-slate-300">Messages go to the support queue and can be reviewed by the admin team.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <MessageSquare className="h-5 w-5 text-cyan-200" />
                    <p className="mt-3 text-sm text-slate-300">Use clear subjects so the team routes your request faster.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="relative"
              >
                <div className="absolute -inset-1 rounded-[34px] bg-gradient-to-tr from-primary/50 via-cyan-400/30 to-blue-500/40 blur-2xl opacity-60" />
                <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-2 backdrop-blur">
                  <img
                    src="/bexon/images/about-1.webp"
                    alt="Contact support preview"
                    className="h-[420px] w-full rounded-[26px] object-cover"
                  />
                  <div className="absolute bottom-5 left-5 right-5 rounded-[24px] border border-white/10 bg-slate-950/80 p-4 backdrop-blur">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { label: 'Support', value: 'Responsive', icon: Headphones },
                        { label: 'Billing', value: 'Fast routing', icon: Send },
                        { label: 'Response', value: '24-48 hrs', icon: Clock },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <div className="flex items-center gap-2 text-cyan-100">
                            <item.icon className="h-4 w-4" />
                            <span className="text-xs uppercase tracking-[0.25em] text-slate-300">{item.label}</span>
                          </div>
                          <div className="mt-2 text-sm font-semibold text-white">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="border-slate-200/80 bg-white/90 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)]">
              <CardContent className="p-6 md:p-8">
                <div className="mb-6">
                  <Badge variant="secondary" className="rounded-full px-4 py-1.5">
                    <Send className="mr-2 h-3.5 w-3.5" />
                    Send a message
                  </Badge>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight">Tell us what you need.</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    The form works on all screen sizes and routes data to the existing contact endpoint.
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="rounded-[28px] border border-primary/20 bg-primary/5 p-8 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
                    <h3 className="mt-4 text-2xl font-semibold">Message sent</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Thank you. The team will review your message and get back to you.
                    </p>
                    <Button className="mt-6 rounded-full" onClick={() => setIsSubmitted(false)}>
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select onValueChange={setSubject} value={subject}>
                        <SelectTrigger id="subject">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General inquiry</SelectItem>
                          <SelectItem value="support">Technical support</SelectItem>
                          <SelectItem value="billing">Billing question</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can we help?"
                        rows={7}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isLoading} className="h-12 rounded-full px-6">
                      {isLoading ? 'Sending...' : 'Send message'}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {infoCards.map((item) => (
                  <Card key={item.title} className="border-slate-200/80 bg-white/90 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)]">
                    <CardContent className="p-5">
                      <item.icon className="h-5 w-5 text-primary" />
                      <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm font-medium text-slate-950">{item.value}</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-slate-200/80 bg-white/90 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)]">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="text-2xl font-semibold">Frequently asked questions</h3>
                  </div>
                  <div className="mt-6 space-y-5">
                    {faqItems.map((item) => (
                      <div key={item.q} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                        <h4 className="font-semibold">{item.q}</h4>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Contact;
