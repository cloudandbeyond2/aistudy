import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const [isTabView, setIsTabView] = useState(false);
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for tab view (between 768px and 1024px)
  useEffect(() => {
    const checkTabView = () => {
      setIsTabView(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    checkTabView();
    window.addEventListener('resize', checkTabView);
    return () => window.removeEventListener('resize', checkTabView);
  }, []);

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

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    let scrollY = 0;

    if (isMobileMenuOpen) {
      scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const y = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(y || '0') * -1);
    }
  }, [isMobileMenuOpen]);

  // Function to scroll to section with retry logic
  const scrollToSection = (sectionId: string, retries = 10) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setPendingScroll(null);
      return true;
    } else if (retries > 0) {
      // Retry after delay if element not found
      setTimeout(() => {
        scrollToSection(sectionId, retries - 1);
      }, 200);
      return false;
    }
    return false;
  };

  // Handle section click with improved navigation
  const handleSectionClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    
    if (location.pathname === '/') {
      // Already on homepage, scroll after a short delay
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 400);
    } else {
      // Navigate to homepage and set pending scroll
      setPendingScroll(sectionId);
      navigate('/');
    }
  };

  // Effect to handle pending scroll after navigation
  useEffect(() => {
    if (location.pathname === '/' && pendingScroll) {
      // Wait for DOM to be fully loaded
      const timer = setTimeout(() => {
        scrollToSection(pendingScroll);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, pendingScroll]);

  // Effect to handle scrolling when page loads (for direct URL access)
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const sectionId = location.hash.substring(1);
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 500);
    }
  }, [location]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 md:px-6 lg:px-10 py-3 md:py-4 transition-all",
        isScrolled
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 md:space-x-3 group">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <img src={appLogo} alt="Logo" className="h-6 w-6 md:h-7 md:w-7" />
          </motion.div>

          <span
            className={cn(
              "font-black text-xl md:text-2xl tracking-tighter transition-colors",
              isScrolled
                ? "text-slate-900 dark:text-white"
                : "text-white"
            )}
          >
            {appName}
            <span className="text-primary text-3xl md:text-4xl leading-[0]">.</span>
          </span>
        </Link>

        {/* Desktop Navigation (lg screens) */}
        <nav className="hidden lg:flex items-center space-x-2">
          {['Features', 'How It Works', 'Pricing'].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={(e) => {
                e.preventDefault();
                const sectionId = item.toLowerCase().replace(/\s+/g, '-');
                if (location.pathname === '/') {
                  scrollToSection(sectionId);
                } else {
                  setPendingScroll(sectionId);
                  navigate('/');
                }
              }}
              whileHover={{ y: -2 }}
              className={cn(
                "px-5 py-2 text-sm font-bold transition-colors relative group cursor-pointer",
                isScrolled
                  ? "text-slate-600 hover:text-primary dark:text-slate-300"
                  : "text-white/80 hover:text-white"
              )}
            >
              {item}
              <span className="absolute bottom-0 left-5 right-5 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
            </motion.a>
          ))}
        </nav>

        {/* Tab View Navigation (md to lg) */}
        {isTabView && (
          <nav className="hidden md:flex lg:hidden items-center space-x-1">
            {['Features', 'How It Works', 'Pricing'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={(e) => {
                  e.preventDefault();
                  const sectionId = item.toLowerCase().replace(/\s+/g, '-');
                  if (location.pathname === '/') {
                    scrollToSection(sectionId);
                  } else {
                    setPendingScroll(sectionId);
                    navigate('/');
                  }
                }}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold transition-colors rounded-lg cursor-pointer",
                  isScrolled
                    ? "text-slate-600 hover:text-primary hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {item}
              </motion.a>
            ))}
          </nav>
        )}

        {/* Right Actions - Desktop & Tab View */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
          <ThemeToggle />

          {isAuth ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setOpen(!open)}
                className={cn(
                  "flex items-center gap-2 px-3 lg:px-5 py-2 rounded-full text-sm font-bold transition-all",
                  isScrolled
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-white"
                    : "bg-white/10 text-white backdrop-blur-md hover:bg-white/20 border border-white/10"
                )}
              >
                <span className="max-w-[100px] lg:max-w-none truncate">{userName}</span>
                <div className={cn("transition-transform text-xs lg:text-sm", open && "rotate-180")}>▾</div>
              </motion.button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-48 lg:w-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl lg:rounded-3xl shadow-2xl p-1.5 lg:p-2 z-50"
                  >
                    <Link
                      to={dashboardPath}
                      onClick={() => setOpen(false)}
                      className="block px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-bold rounded-xl lg:rounded-2xl hover:bg-primary/5 dark:hover:bg-white/10 transition"
                    >
                      Dashboard
                    </Link>

                    {userRole !== 'student' && (
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setOpen(false)}
                        className="block px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-bold rounded-xl lg:rounded-2xl hover:bg-primary/5 dark:hover:bg-white/10 transition"
                      >
                        Profile
                      </Link>
                    )}

                    {['monthly', 'yearly', 'forever'].includes(userType) && (
                      <Link
                        to="/dashboard/resume-builder"
                        onClick={() => setOpen(false)}
                        className="block px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-bold rounded-xl lg:rounded-2xl hover:bg-primary/5 dark:hover:bg-white/10 transition"
                      >
                        Resume Builder
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="block px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-bold rounded-xl lg:rounded-2xl hover:bg-primary/5 dark:hover:bg-white/10 transition text-primary"
                      >
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-bold rounded-xl lg:rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center space-x-2 lg:space-x-3">
              <Link to="/login">
                <Button
                  variant="ghost"
                  size={isTabView ? "sm" : "default"}
                  className={cn(
                    "bg-white text-black font-bold rounded-full shadow-xl shadow-primary/20 transition-all hover:scale-105",
                    isTabView ? "px-5 h-10 text-sm" : "px-6 lg:px-8 h-11 lg:h-12",
                    isScrolled
                      ? "hover:bg-white/90"
                      : "hover:bg-white/80"
                  )}
                >
                  Login
                </Button>
              </Link>

              <Link to="/signup">
                <Button
                  size={isTabView ? "sm" : "default"}
                  className={cn(
                    "bg-primary text-white font-bold rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition",
                    isTabView ? "px-5 h-10 text-sm" : "px-6 lg:px-8 h-11 lg:h-12"
                  )}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-xl md:rounded-2xl bg-slate-100 dark:bg-slate-800 dark:text-white text-lg"
          >
            ☰
          </motion.button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-[85%] max-w-[320px] h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto">
              {/* Header with Logo */}
              <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
                <Link 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2"
                >
                  <img src={appLogo} alt="logo" className="h-8 w-8 rounded-lg" />
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {appName}
                  </span>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* User Profile Section - Only when logged in */}
                {isAuth && (
                  <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border border-primary/20">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                        {userName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {userName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                          {userRole || userType} Account
                        </p>
                      </div>
                      {isAdmin && (
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-primary text-white">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Menu Items */}
                <div className="flex flex-col space-y-2">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4 mb-2">
                    Menu
                  </p>
                  
                  {/* Home Link */}
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-base font-medium px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition group w-full text-left"
                  >
                    <span className="text-xl">🏠</span>
                    <span>Home</span>
                  </Link>
                  
                  {['Features', 'How It Works', 'Pricing'].map((item) => {
                    const sectionId = item.toLowerCase().replace(/\s+/g, '-');
                    
                    return (
                      <div
                        key={item}
                        onClick={() => handleSectionClick(sectionId)}
                        className="flex items-center space-x-3 text-base font-medium px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition group w-full text-left cursor-pointer"
                      >
                        <span className="text-xl">{
                          item === 'Features' ? '✨' : 
                          item === 'How It Works' ? '🎯' : '💎'
                        }</span>
                        <span>{item}</span>
                      </div>
                    );
                  })}
                </div>

                {/* User Account Section - Only when logged in */}
                {isAuth && (
                  <div className="flex flex-col space-y-2">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4 mb-2">
                      Account
                    </p>
                    
                    {/* Dashboard */}
                    <Link
                      to={dashboardPath}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 text-base font-medium px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition group"
                    >
                      <span className="text-xl">📊</span>
                      <span>Dashboard</span>
                    </Link>

                    {/* Profile - Only for non-students */}
                    {userRole !== 'student' && (
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-base font-medium px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition group"
                      >
                        <span className="text-xl">👤</span>
                        <span>Profile</span>
                      </Link>
                    )}

                    {/* Resume Builder - Only for premium users */}
                    {['monthly', 'yearly', 'forever'].includes(userType) && (
                      <Link
                        to="/dashboard/resume-builder"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-base font-medium px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition group"
                      >
                        <span className="text-xl">📄</span>
                        <span>Resume Builder</span>
                        {userType === 'forever' && (
                          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold">
                            LIFETIME
                          </span>
                        )}
                      </Link>
                    )}

                    {/* Admin Panel - Only for admins */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-base font-medium px-4 py-3 rounded-xl text-primary hover:bg-primary/10 transition group"
                      >
                        <span className="text-xl">⚙️</span>
                        <span className="font-bold">Admin Panel</span>
                        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-bold">
                          Admin Only
                        </span>
                      </Link>
                    )}

                    {/* Settings */}
                    <Link
                      to="/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 text-base font-medium px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition group"
                    >
                      <span className="text-xl">⚙️</span>
                      <span>Settings</span>
                    </Link>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 space-y-3 border-t border-slate-200 dark:border-slate-700">
                  {isAuth ? (
                    <>
                      {/* Subscription Info - Only for premium users */}
                      {userType !== 'free' && (
                        <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                              Premium Plan
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold capitalize">
                              {userType}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                            Access to all premium features
                          </p>
                        </div>
                      )}

                      {/* Logout Button */}
                      <Button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full h-12 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                      >
                        <span className="mr-2">🚪</span>
                        Logout
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant="outline"
                          className="w-full h-12 rounded-xl font-bold border-2 hover:bg-primary/5"
                        >
                          <span className="mr-2">🔑</span>
                          Login
                        </Button>
                      </Link>

                      <Link
                        to="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
                          <span className="mr-2">🚀</span>
                          Get Started
                        </Button>
                      </Link>

                      {/* Demo Account Info */}
                      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          New here? Create an account to access all features
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;