import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Hero1 from '@/components/Hero1';
import Features1 from '@/components/Features1';
import HowItWorks1 from '@/components/HowItWorks1';
import Testimonials1 from '@/components/Testimonials1';
import Pricing1 from '@/components/Pricing1';
import Footer from '@/components/Footer';
import { Feather } from 'lucide-react';
import OrgSolutions1 from '@/components/OrgSolutions1';
import CTA1 from '@/components/CTA1';
 
 
 
const LandingPage = () => {
  // Smooth scroll to anchor links
  useEffect(() => {
    const handleHashLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
 
      if (!anchor) return;
 
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
 
      const destinationId = href.substring(1);
      const destinationElement = document.getElementById(destinationId);
 
      if (destinationElement) {
        e.preventDefault();
 
        window.scrollTo({
          top: destinationElement.offsetTop - 80, // Adjust for header height
          behavior: 'smooth',
        });
 
        // Update URL without scrolling
        window.history.pushState(null, '', href);
      }
    };
 
    document.addEventListener('click', handleHashLinkClick);
 
    return () => {
      document.removeEventListener('click', handleHashLinkClick);
    };
  }, []);
 
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main>
        <Hero1 />
        <Features1/>
        <HowItWorks1 />
        <OrgSolutions1 />
        <Testimonials1 />
        <Pricing1 />
        <CTA1 />
      </main>
      <Footer />
    </div>
  );
};
 
export default LandingPage;
 