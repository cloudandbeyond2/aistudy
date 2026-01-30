
// import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { cn } from '@/lib/utils';
// import { Link } from 'react-router-dom';
// import { ThemeToggle } from './ThemeToggle';
// import { appName } from '@/constants';
// import Logo from '../res/logo.svg';

// const Header = () => {
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 10);
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   return (
//     <header
//       className={cn(
//         "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 md:px-10 py-4",
//         isScrolled ? "bg-glass border-b border-border/40" : "bg-transparent"
//       )}
//     >
//       <div className="max-w-7xl mx-auto flex items-center justify-between">
//         <Link to="/" className="flex items-center space-x-2">
//           <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
//             <img src={Logo} alt="Logo" className='h-6 w-6' />
//           </div>
//           <span className="font-display font-medium text-lg">{appName}</span>
//         </Link>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:flex items-center space-x-8">
//           <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
//           <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How It Works</a>
//           <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
//         </nav>

//         {/* Call to Actions */}
//         <div className="hidden md:flex items-center space-x-4">
//           <ThemeToggle />
//           <Link to="/login">
//             <Button variant="ghost" size="sm">Login</Button>
//           </Link>
//           <Link to="/signup">
//             <Button size="sm" className="bg-primary hover:bg-primary/90 transition-colors">Get Started</Button>
//           </Link>
//         </div>

//         {/* Mobile Menu Button */}
//         <div className="md:hidden flex items-center space-x-2">
//           <ThemeToggle />
//           <button
//             className="flex flex-col space-y-1.5"
//             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//           >
//             <span className={cn(
//               "block w-6 h-0.5 bg-foreground transition-transform duration-300",
//               isMobileMenuOpen && "translate-y-2 rotate-45"
//             )}></span>
//             <span className={cn(
//               "block w-6 h-0.5 bg-foreground transition-opacity duration-300",
//               isMobileMenuOpen && "opacity-0"
//             )}></span>
//             <span className={cn(
//               "block w-6 h-0.5 bg-foreground transition-transform duration-300",
//               isMobileMenuOpen && "-translate-y-2 -rotate-45"
//             )}></span>
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       <div className={cn(
//         "md:hidden fixed inset-x-0 bg-background border-b border-border/40 transition-all duration-300 ease-in-out",
//         isMobileMenuOpen ? "top-[64px] opacity-100" : "-top-full opacity-0"
//       )}>
//         <div className="px-6 py-6 flex flex-col space-y-4">
//           <a href="#features" className="text-base font-medium py-2">Features</a>
//           <a href="#how-it-works" className="text-base font-medium py-2">How It Works</a>
//           <a href="#pricing" className="text-base font-medium py-2">Pricing</a>
//           <div className="flex flex-col space-y-2 pt-2">
//             <Link to="/login">
//               <Button variant="outline" size="sm" className="w-full">Login</Button>
//             </Link>
//             <Link to="/signup">
//               <Button size="sm" className="w-full">Get Started</Button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { appName } from '@/constants';
import Logo from '../res/logo.svg';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Read auth
  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    const name = sessionStorage.getItem('mName');

    if (auth === 'true' && name) {
      setIsAuth(true);
      setUserName(name);
    }
  }, []);

  // Close dropdown on outside click
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
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-4 transition-all",
        isScrolled ? "bg-glass border-b border-border/40" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
            <img src={Logo} alt="Logo" className="h-6 w-6" />
          </div>
          <span className="font-medium text-lg">{appName}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#pricing">Pricing</a>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />

          {isAuth ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 text-sm font-medium hover:text-primary"
              >
                👋 {userName} <span className="text-xs">▾</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-40 bg-background border rounded-md shadow-md">
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-muted"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-muted"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>☰</button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden fixed inset-x-0 bg-background transition-all",
          isMobileMenuOpen ? "top-[64px]" : "-top-full"
        )}
      >
        <div className="px-6 py-6 space-y-4">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#pricing">Pricing</a>
{/* Star bala */}
          {isAuth ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline" className="w-full">Dashboard</Button>
              </Link>
              <Button onClick={handleLogout} className="w-full">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="w-full">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
