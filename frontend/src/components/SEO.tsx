
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useBranding } from '@/contexts/BrandingContext';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

const SEO = ({
  title,
  description,
  keywords = '',
  canonicalUrl = '',
  ogImage = ''
}: SEOProps) => {
  const { appName } = useBranding();
  // Format the title to include the brand name
  const formattedTitle = `${title} | ${appName}`;
  const defaultOgImage = `${window.location.origin}/logo.png`; // Fallback image

  return (
    <Helmet>
      {/* Basic metadata */}
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage || defaultOgImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />
    </Helmet>
  );
};

export default SEO;
