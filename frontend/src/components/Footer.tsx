import React from 'react';
import { Link } from 'react-router-dom';
import { useBranding } from '@/contexts/BrandingContext';
import { Facebook, X, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const { appName, appLogo } = useBranding();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: Facebook,
      url: 'https://www.facebook.com'
    },
    {
      icon: X,
      url: 'https://twitter.com'
    },
    {
      icon: Instagram,
      url: 'https://www.instagram.com'
    },
    {
      icon: Linkedin,
      url: 'https://www.linkedin.com/in'
    }
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 py-20 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

          {/* LOGO */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-8 group">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <img src={appLogo} alt="Logo" className="h-7 w-7" />
              </div>
              <span className="font-black text-2xl text-white tracking-tighter">
                {appName}<span className="text-primary text-4xl leading-[0]">.</span>
              </span>
            </Link>

            <p className="text-lg leading-relaxed mb-8 max-w-sm">
              AI-driven course solutions for organizational learning.
              Built for institutions, educators, and professional teams.
              Transform learning with intelligent technology.
            </p>

            <div className="flex space-x-4">
              {socialLinks.map(({ icon: Icon, url }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center
                                 hover:bg-primary hover:text-white transition-all"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>

          </div>

          {/* PLATFORM */}
          <div>
            <h4 className="text-white font-black text-xl mb-8 uppercase tracking-widest">
              Platform
            </h4>
            <ul className="space-y-4 text-lg">
              <li>
                <a href="/#features" className="hover:text-primary">
                  Features
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-primary">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#pricing" className="hover:text-primary">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="text-white font-black text-xl mb-8 uppercase tracking-widest">
              Company
            </h4>
            <ul className="space-y-4 text-lg">
              <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-primary">Blog</Link></li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h4 className="text-white font-black text-xl mb-8 uppercase tracking-widest">
              Newsletter
            </h4>
            <p className="mb-8 text-lg">
              Actionable AI insights, learning resources, and updates — straight to your inbox.
            </p>
            <input
              type="email"
              placeholder="Your email address"
              className="w-full bg-slate-900 border-slate-800 text-white rounded-2xl px-6 py-4"
            />
          </div>
        </div>

        {/* BOTTOM LINKS */}
        <div className="pt-8 border-t border-slate-900 flex justify-between items-center">
          <p className="text-sm">
            © {currentYear} {appName}. All rights reserved.
          </p>

          <div className="flex items-center space-x-8 text-sm font-medium">
            <Link to="/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="#" className="hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
