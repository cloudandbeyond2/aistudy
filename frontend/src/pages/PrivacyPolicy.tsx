import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, LockKeyhole, Eye, Database, Sparkles, BadgeCheck } from 'lucide-react';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';
import StyledText from '@/components/styledText';
import InnerPageTopBar from '@/components/InnerPageTopBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { appName, serverURL } from '@/constants';
import './PrivacyPolicy.css';

const summaryCards = [
  { icon: LockKeyhole, title: 'Data protection', text: 'Personal information is handled with structured safeguards and controlled access.' },
  { icon: Eye, title: 'Transparency', text: 'This page explains what data is collected, why it is used, and how it is managed.' },
  { icon: Database, title: 'Usage scope', text: 'Platform data is used to support accounts, learning workflows, and service improvement.' },
];

const PrivacyPolicy = () => {
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/policies`);
        setData(response.data?.privacy || '');
      } catch (error) {
        console.error('Failed to fetch privacy policy:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacy();
  }, []);

  return (
    <>
      <SEO
        title="Privacy Policy"
        description={`Privacy policy for ${appName}. Learn how data is collected, used, protected, and managed across the platform.`}
        keywords="privacy policy, data protection, personal information, legal policy"
      />

      <div className="privacy-page min-h-screen">
        <section className="privacy-hero relative overflow-hidden text-white">
          <div className="privacy-hero__backdrop absolute inset-0" />
          <div
            className="privacy-hero__pattern absolute inset-0 bg-cover bg-center mix-blend-screen"
            style={{ backgroundImage: "url('/bexon/images/pattern-bg.webp')" }}
          />

          <div className="relative z-20 mx-auto max-w-7xl px-4 pt-4 md:px-6 lg:px-8 lg:pt-6">
            <InnerPageTopBar variant="dark" className="px-0" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="privacy-hero__copy space-y-6"
              >
                <Badge className="privacy-badge rounded-full px-4 py-1.5 hover:bg-white/10">
                  <Shield className="mr-2 h-3.5 w-3.5" />
                  Privacy policy
                </Badge>
                <h1 className="privacy-hero__title max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                  Privacy policy for secure, transparent, and responsible data handling.
                </h1>
                <p className="privacy-hero__text max-w-2xl text-sm leading-7 md:text-base">
                  Review how {appName} collects, uses, stores, and protects information across user,
                  student, staff, and organization experiences.
                </p>
                <Button asChild className="privacy-hero__cta h-12 rounded-full px-6">
                  <Link to="/contact">
                    Contact privacy support
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="privacy-hero__visual relative"
              >
                <div className="privacy-hero__glow absolute -inset-1 rounded-[34px] blur-2xl opacity-60" />
                <div className="privacy-hero__frame relative overflow-hidden rounded-[34px] p-2 backdrop-blur">
                  <img
                    src="/bexon/images/about-1.webp"
                    alt="Privacy policy preview"
                    className="privacy-hero__image h-[420px] w-full rounded-[26px] object-cover"
                  />
                  <div className="privacy-hero__stats absolute bottom-5 left-5 right-5 rounded-[24px] p-4 backdrop-blur">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { label: 'Privacy', value: 'Protected', icon: LockKeyhole },
                        { label: 'Policy', value: 'Clear', icon: Shield },
                        { label: 'Control', value: 'Structured', icon: BadgeCheck },
                      ].map((item) => (
                        <div key={item.label} className="privacy-stat rounded-2xl p-3">
                          <div className="privacy-stat__label flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span className="text-xs uppercase tracking-[0.25em]">{item.label}</span>
                          </div>
                          <div className="privacy-stat__value mt-2 text-sm font-semibold">{item.value}</div>
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
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="privacy-summary-badge rounded-full px-4 py-1.5">
                <Shield className="mr-2 h-3.5 w-3.5" />
                Privacy summary
              </Badge>
              <h2 className="privacy-section-title mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                The key privacy principles are highlighted before the full policy content.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {summaryCards.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                >
                  <Card className="privacy-summary-card h-full">
                    <CardContent className="space-y-4 p-6">
                      <item.icon className="privacy-summary-card__icon h-5 w-5" />
                      <h3 className="privacy-summary-card__title text-xl font-semibold">{item.title}</h3>
                      <p className="privacy-summary-card__text text-sm leading-7">{item.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 md:px-6 lg:px-8">
          <div className="privacy-content-shell mx-auto max-w-7xl rounded-[34px] p-6 md:p-8">
            {loading ? (
              <div className="privacy-content-state py-20 text-center">Loading privacy policy...</div>
            ) : data ? (
              <StyledText text={data} />
            ) : (
              <div className="privacy-content-state py-20 text-center">No privacy policy available.</div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicy;
