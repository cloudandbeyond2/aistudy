import React from 'react';
import { Link } from 'react-router-dom';
import { appName } from '@/constants';
import Logo from '../res/logo.svg';
import { Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 py-20 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-8 group">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                <img src={Logo} alt="Logo" className="h-7 w-7" />
              </div>
              <span className="font-black text-2xl text-white tracking-tighter">
                {appName}<span className="text-primary text-4xl leading-[0]">.</span>
              </span>
            </Link>
            <p className="text-lg leading-relaxed mb-8 max-w-sm">
              Empowering learners and educators with state-of-the-art AI technology. Create, learn, and excel.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-black text-xl mb-8 uppercase tracking-widest">Platform</h4>
            <ul className="space-y-4 text-lg">
              {['Features', 'How It Works', 'Pricing', 'Course Templates'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-primary transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xl mb-8 uppercase tracking-widest">Company</h4>
            <ul className="space-y-4 text-lg">
              {['About Us', 'Success Stories', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-primary transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xl mb-8 uppercase tracking-widest">Newsletter</h4>
            <p className="mb-8 text-lg leading-relaxed">
              Get the latest AI learning tips and platform updates delivered to your inbox.
            </p>
            <div className="relative group">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-slate-900 border-slate-800 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-white hover:text-primary text-white font-bold px-6 rounded-xl transition-all h-auto">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-medium">
            © {currentYear} {appName}. All rights reserved globally.
          </p>
          <div className="flex items-center space-x-8 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
