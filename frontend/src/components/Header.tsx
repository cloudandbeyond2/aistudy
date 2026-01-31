import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { appName } from '@/constants';
import Logo from '../res/logo.svg';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    const name = sessionStorage.getItem('mName');
    if (auth === 'true' && name) {
      setIsAuth(true);
      setUserName(name);
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-6 md:px-10 transition-all duration-500",
        isScrolled
          ? "bg-white/90 backdrop-blur-xl py-3 shadow-xl shadow-slate-900/5 border-b border-slate-100"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <img src={Logo} alt="Logo" className="h-7 w-7" />
          </motion.div>
          <span className={cn(
            "font-black text-2xl tracking-tighter transition-colors",
            isScrolled ? "text-slate-900" : "text-white"
          )}>
            {appName}<span className="text-primary text-4xl leading-[0]">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {['Features', 'How It Works', 'Pricing'].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              whileHover={{ y: -2 }}
              className={cn(
                "px-5 py-2 text-sm font-bold transition-colors relative group",
                isScrolled ? "text-slate-600 hover:text-primary" : "text-white/80 hover:text-white"
              )}
            >
              {item}
              <span className="absolute bottom-0 left-5 right-5 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
            </motion.a>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />

          {isAuth ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setOpen(!open)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all",
                  isScrolled
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-white/10 text-white backdrop-blur-md hover:bg-white/20 border border-white/10"
                )}
              >
                <span>{userName}</span>
                <div className={cn("transition-transform duration-300", open && "rotate-180")}>▾</div>
              </motion.button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-52 bg-white border border-slate-100 rounded-3xl shadow-2xl p-2 z-50 overflow-hidden"
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center px-4 py-3 text-sm font-bold rounded-2xl hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      Dashboard
                    </Link>
                     <Link
                      to="/dashboard/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center px-4 py-3 text-sm font-bold rounded-2xl hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-3 text-sm font-bold rounded-2xl text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" className={cn(
                  "font-bold rounded-full px-6 transition-colors",
                  isScrolled ? "text-slate-600 hover:text-primary" : "text-white/80 hover:text-white"
                )}>
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-primary hover:bg-slate-900 text-white font-bold rounded-full px-8 h-12 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-900"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-2xl overflow-hidden"
          >
            <div className="p-8 flex flex-col space-y-2">
              {['Features', 'How It Works', 'Pricing'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-4 py-4 text-xl font-bold text-slate-800 hover:text-primary rounded-2xl hover:bg-slate-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-6 mt-6 border-t border-slate-100 grid gap-4">
                {isAuth ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full h-14 rounded-2xl font-bold text-lg" variant="outline">Dashboard</Button>
                    </Link>
                    <Button onClick={handleLogout} className="w-full h-14 rounded-2xl font-bold text-lg bg-red-500">Logout</Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full h-14 rounded-2xl font-bold text-lg">Login</Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
