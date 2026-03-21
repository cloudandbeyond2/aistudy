import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useBranding } from '@/contexts/BrandingContext';
import { motion, AnimatePresence } from 'framer-motion';
import { serverURL } from '@/constants';
import axios from 'axios';

const Header = () => {
  const { appName, appLogo } = useBranding();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userType, setUserType] = useState<string>('free');
  const [userRole, setUserRole] = useState<string>('');
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
      setUserType(sessionStorage.getItem('type') || 'free');
      setUserRole(sessionStorage.getItem('role') || '');
    }
  }, []);

  const dashboardPath =
    userRole === 'org_admin'
      ? '/dashboard/org'
      : userRole === 'dept_admin'
      ? '/dashboard/staff'
      : userRole === 'student'
      ? '/dashboard/student'
      : '/dashboard';

  useEffect(() => {
    async function checkAdmin() {
      try {
        const email = sessionStorage.getItem('email');
        if (!email) return;

        let adminEmail = sessionStorage.getItem('adminEmail');
        if (!adminEmail) {
          const res = await axios.post(`${serverURL}/api/dashboard`);
          adminEmail = res.data.admin.email;
          sessionStorage.setItem('adminEmail', adminEmail);
        }

        if (adminEmail === email) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    }
    if (isAuth) {
      checkAdmin();
    }
  }, [isAuth]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    const destinationId = href.substring(1);
    const destinationElement = document.getElementById(destinationId);

    if (destinationElement) {
      setIsMobileMenuOpen(false);

      setTimeout(() => {
        window.scrollTo({
          top: destinationElement.offsetTop - 80,
          behavior: 'smooth',
        });
      }, 300);
    }
  };

  // Check if user has premium access
  const hasPremium = ['monthly', 'yearly', 'forever'].includes(userType);

  // Icon components for menu items
  const HomeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  const FeaturesIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );

  const HowItWorksIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const PricingIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const DashboardIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  const ProfileIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const SettingsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const ResumeBuilderIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const AdminPanelIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const LogoutIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 transition-all duration-300",
          isScrolled
            ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Area */}
          <Link to="/" className="flex items-center shrink-0">
            <div className="flex items-center gap-2">
              <img src={appLogo} alt="Logo" className="h-7 w-7 sm:h-8 sm:w-8" />
              <span
                className={cn(
                  "font-bold text-lg sm:text-xl tracking-tight",
                  isScrolled
                    ? "text-slate-800 dark:text-white"
                    : "text-white"
                )}
              >
                {appName}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1">
            {['Home', 'Features', 'How It Works', 'Pricing'].map((item) => (
              <motion.a
                key={item}
                href={item === 'Home' ? '/' : `#${item.toLowerCase().replace(/\s+/g, '-')}`}
                whileHover={{ y: -1 }}
                className={cn(
                  "px-3 lg:px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                  isScrolled
                    ? "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    : "text-white/80 hover:text-white"
                )}
              >
                {item}
              </motion.a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <ThemeToggle />

            {isAuth ? (
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setOpen(!open)}
                  className={cn(
                    "flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full text-sm font-medium transition-all",
                    isScrolled
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                      : "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                  )}
                >
                  <span className="max-w-[100px] lg:max-w-[120px] truncate">{userName}</span>
                  <svg className={cn("w-4 h-4 transition-transform", open && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-[60]"
                    >
                      <div className="py-2">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold text-lg">
                                {userName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {userName}
                              </p>
                              <p className="text-xs text-slate-400">
                                {hasPremium ? "Premium Member" : "Free Member"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Section */}
                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Menu
                        </div>
                        <a
                          href="/"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <HomeIcon />
                          Home
                        </a>
                        <a
                          href="#features"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <FeaturesIcon />
                          Features
                        </a>
                        <a
                          href="#how-it-works"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <HowItWorksIcon />
                          How It Works
                        </a>
                        <a
                          href="#pricing"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <PricingIcon />
                          Pricing
                        </a>

                        {/* Account Section */}
                        <div className="px-3 py-2 mt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-t border-slate-100 dark:border-slate-800 pt-2">
                          Account
                        </div>
                        <Link
                          to={dashboardPath}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <DashboardIcon />
                          Dashboard
                        </Link>
                        {userRole !== 'student' && (
                          <Link
                            to="/dashboard/profile"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                          >
                            <ProfileIcon />
                            Profile
                          </Link>
                        )}
                        <Link
                          to="/dashboard/settings"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <SettingsIcon />
                          Settings
                        </Link>

                        {/* Plan Indicator */}
                        <div className="px-4 py-2 mt-1">
                          <div className={cn(
                            "text-xs font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-2",
                            hasPremium ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          )}>
                            {hasPremium ? "⭐ Premium Plan" : "📋 Free Plan"}
                          </div>
                          {hasPremium && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Access to all premium features
                            </p>
                          )}
                        </div>

                        {hasPremium && (
                          <Link
                            to="/dashboard/resume-builder"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition"
                          >
                            <ResumeBuilderIcon />
                            Resume Builder (LIFETIME)
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition"
                          >
                            <AdminPanelIcon />
                            Admin Panel
                          </Link>
                        )}

                        <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                          <LogoutIcon />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 lg:gap-3">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className={cn(
                      "rounded-full px-5 lg:px-6 h-9 lg:h-10 text-sm font-medium",
                      isScrolled
                        ? "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                        : "text-white hover:text-white hover:bg-white/10"
                    )}
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-primary text-white rounded-full px-5 lg:px-6 h-9 lg:h-10 text-sm font-medium shadow-md hover:shadow-lg transition">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {isMobileMenuOpen ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu - Full screen overlay from left side with icons */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Menu Panel - Left side, full height */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute left-0 top-0 bottom-0 w-[280px] sm:w-80 bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto"
            >
              <div className="flex flex-col min-h-full">
                {/* Menu Header with User Info */}
                <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <img src={appLogo} alt="Logo" className="h-7 w-7" />
                        <span className="font-bold text-lg text-slate-800 dark:text-white">
                          {appName}
                        </span>
                      </div>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* User Info */}
                    {isAuth && (
                      <div className="flex items-center gap-3 pt-2">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold text-lg">
                            {userName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {userName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {userRole === 'student' ? 'Student Account' : 'User Account'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Menu Content */}
                <div className="flex-1 py-2">
                  {/* Menu Section */}
                  <div className="mb-2">
                    <div className="px-5 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Menu
                    </div>
                    <a
                      href="/"
                      className="flex items-center gap-3 px-5 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      onClick={(e) => {
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <HomeIcon />
                      Home
                    </a>
                    <a
                      href="#features"
                      className="flex items-center gap-3 px-5 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      onClick={(e) => handleMobileNavClick(e, '#features')}
                    >
                      <FeaturesIcon />
                      Features
                    </a>
                    <a
                      href="#how-it-works"
                      className="flex items-center gap-3 px-5 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      onClick={(e) => handleMobileNavClick(e, '#how-it-works')}
                    >
                      <HowItWorksIcon />
                      How It Works
                    </a>
                    <a
                      href="#pricing"
                      className="flex items-center gap-3 px-5 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      onClick={(e) => handleMobileNavClick(e, '#pricing')}
                    >
                      <PricingIcon />
                      Pricing
                    </a>
                  </div>

                  {/* Account Section */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                    <div className="px-5 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Account
                    </div>
                    {isAuth ? (
                      <>
                        <Link
                          to={dashboardPath}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <DashboardIcon />
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <ProfileIcon />
                          Profile
                        </Link>
                        <Link
                          to="/dashboard/settings"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <SettingsIcon />
                          Settings
                        </Link>

                        {/* Plan Indicator */}
                        <div className="px-5 py-3">
                          <div className={cn(
                            "text-xs font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-2",
                            hasPremium ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          )}>
                            {hasPremium ? "⭐ Premium Plan" : "📋 Free Plan"}
                          </div>
                          {hasPremium && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Access to all premium features
                            </p>
                          )}
                        </div>

                        {hasPremium && (
                          <Link
                            to="/dashboard/resume-builder"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-3 text-base font-semibold text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition"
                          >
                            <ResumeBuilderIcon />
                            Resume Builder (LIFETIME)
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-3 text-base font-medium text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition"
                          >
                            <AdminPanelIcon />
                            Admin Panel
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-3 px-5 py-3 mt-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                          <LogoutIcon />
                          Logout
                        </button>
                      </>
                    ) : (
                      <div className="px-5 space-y-3 mt-2">
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full rounded-full h-11 text-base font-medium">
                            Login
                          </Button>
                        </Link>
                        <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full rounded-full h-11 text-base font-medium bg-primary shadow-md mt-[10px]">
                            Get Started
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Menu Footer */}
                <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {userName ? `Welcome, ${userName}` : appName}
                    </span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;