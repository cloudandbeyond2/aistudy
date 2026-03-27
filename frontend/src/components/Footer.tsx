import React from 'react';
import { Link } from 'react-router-dom';
import { useBranding } from '@/contexts/BrandingContext';
import { Facebook, Instagram, Linkedin, Send, X } from 'lucide-react';
import axios from 'axios';
import { appWordmarkLight, serverURL } from '@/constants';
import { useToast } from '@/hooks/use-toast';

const Footer = () => {
  const { appName } = useBranding();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const socialLinks = [
    { icon: Facebook, url: 'https://www.facebook.com' },
    { icon: X, url: 'https://twitter.com' },
    { icon: Instagram, url: 'https://www.instagram.com' },
    { icon: Linkedin, url: 'https://www.linkedin.com/in' },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${serverURL}/api/subscribe`, { email });
      if (res.data.success) {
        toast({
          title: 'Subscribed!',
          description: 'Thank you for joining our newsletter.',
        });
        setEmail('');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <Link to="/" className="mb-6 flex items-center gap-3">
              <img src={appWordmarkLight} alt={appName} className="h-10 w-auto max-w-[240px]" />
            </Link>

            <p className="max-w-sm text-base leading-7">
              AI-driven course solutions for institutions, educators, and professional teams.
              Build, schedule, and manage learning with a polished corporate experience.
            </p>

            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ icon: Icon, url }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 transition hover:bg-primary hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-black uppercase tracking-[0.24em] text-white">Platform</h4>
            <ul className="space-y-4 text-base">
              <li>
                <a href="/#features" className="transition hover:text-primary">
                  Features
                </a>
              </li>
              <li>
                <a href="/#platform" className="transition hover:text-primary">
                  Panels
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="transition hover:text-primary">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#pricing" className="transition hover:text-primary">
                  Pricing
                </a>
              </li>
              <li>
                <Link to="/blog" className="transition hover:text-primary">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-black uppercase tracking-[0.24em] text-white">Company</h4>
            <ul className="space-y-4 text-base">
              <li>
                <Link to="/about" className="transition hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="transition hover:text-primary">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition hover:text-primary">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-black uppercase tracking-[0.24em] text-white">Newsletter</h4>
            <p className="mb-6 text-base leading-7">
              Corporate AI updates, learning resources, and product news delivered directly to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 pr-14 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-primary"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="px-1 text-xs text-slate-500">You can unsubscribe at any time.</p>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-900 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            © {currentYear} {appName}. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-6 text-sm font-medium">
            <Link to="/privacy-policy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link to="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link to="/cookies" className="transition hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
