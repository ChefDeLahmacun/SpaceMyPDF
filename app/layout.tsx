import type { Metadata } from "next";
import { inter, roboto } from "./fonts";
import "./globals.css";
import "./styles/layout-styles.css"; // Import the new CSS file
import Script from "next/script"; // Import Next.js Script component
// Import Fontsource CSS files
import '@fontsource/inter/100.css';
import '@fontsource/inter/200.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Navigation from "./components/Navigation";
import { GoogleAnalytics } from '@next/third-parties/google'
import { GA_MEASUREMENT_ID } from './utils/analytics';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.spacemypdf.com'),
  title: {
    default: "SpaceMyPDF | Free PDF Note Space Tool - Add Margins to PDFs Online",
    template: "%s | SpaceMyPDF"
  },
  description: "Add note-taking space to any PDF instantly. Free online tool for students and professionals. No downloads, 100% private, works in your browser. Perfect for lecture notes, textbooks, and documents.",
  applicationName: "SpaceMyPDF",
  authors: [{ name: "SpaceMyPDF" }],
  generator: "Next.js",
  category: "Education",
  openGraph: {
    title: "SpaceMyPDF | Free PDF Note Space Tool - Add Margins to PDFs Online",
    description: "Add note-taking space to any PDF instantly. Free online tool for students and professionals. No downloads, 100% private, works in your browser.",
    type: "website",
    url: "https://www.spacemypdf.com",
    siteName: "SpaceMyPDF",
    locale: "en_US",
    images: [
      {
        url: "/images/Logo.png",
        width: 1200,
        height: 630,
        alt: "SpaceMyPDF - Add Note Space to PDFs",
        type: "image/png"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpaceMyPDF | Free PDF Note Space Tool",
    description: "Add note-taking space to any PDF instantly. Free, private, and works in your browser. Perfect for students.",
    images: ["/images/Logo.png"],
    creator: "@spacemypdf",
    site: "@spacemypdf"
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "zAU4nyWIZ0lJgHFikZEcViImwePtQAc9T39mJ4n6vRY"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Combine font variables
  const fontVariables = `${inter.variable} ${roboto.variable}`;
  
  return (
    <html lang="en" className={`${fontVariables} font-loading`}>
      <head>
        {/* External CSS is now imported at the top */}
        {/* External JS is now loaded with Next.js Script component */}
        <Script src="/scripts/font-loader.js" strategy="afterInteractive" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* Schema.org structured data for rich search results */}
        <Script
          id="schema-org"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://www.spacemypdf.com/#website",
                  "url": "https://www.spacemypdf.com",
                  "name": "SpaceMyPDF",
                  "description": "Free online tool to add note-taking space to PDF documents",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://www.spacemypdf.com/?s={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "Organization",
                  "@id": "https://www.spacemypdf.com/#organization",
                  "name": "SpaceMyPDF",
                  "url": "https://www.spacemypdf.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.spacemypdf.com/images/Logo.png",
                    "width": 60,
                    "height": 60
                  },
                  "sameAs": [
                    "https://twitter.com/spacemypdf"
                  ]
                },
                {
                  "@type": "WebApplication",
                  "@id": "https://www.spacemypdf.com/#webapp",
                  "name": "SpaceMyPDF",
                  "url": "https://www.spacemypdf.com",
                  "applicationCategory": "UtilityApplication",
                  "operatingSystem": "Any",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  },
                  "featureList": [
                    "Add note space to PDFs",
                    "Multiple note space positions",
                    "Custom colors and patterns",
                    "Lines, grids, and dots",
                    "100% private - files never uploaded",
                    "Works in browser"
                  ],
                  "screenshot": "https://www.spacemypdf.com/images/Logo.png"
                },
                {
                  "@type": "SoftwareApplication",
                  "name": "SpaceMyPDF",
                  "applicationCategory": "EducationalApplication",
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "ratingCount": "1250"
                  },
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body suppressHydrationWarning style={{ WebkitOverflowScrolling: 'touch' }}>
        <Navigation />
        {children}
        <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
        <Script id="enable-ios-scroll-to-top" strategy="afterInteractive">
          {`
            document.addEventListener('DOMContentLoaded', function() {
              // Fix for iOS scroll to top when tapping status bar
              if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                window.addEventListener('scroll', function() {}, { passive: true });
              }
            });
          `}
        </Script>
        <Script id="suppress-warnings" strategy="beforeInteractive">
          {`
            // Suppress deprecated unload event warnings and geolocation violations
            (function() {
              const originalWarn = console.warn;
              console.warn = function(...args) {
                // Suppress specific deprecated unload warnings and geolocation violations
                const message = args.join(' ');
                if (message.includes('Unload event listeners are deprecated') || 
                    message.includes('unload') && message.includes('deprecated') ||
                    message.includes('geolocation') && message.includes('not allowed')) {
                  return; // Suppress this warning
                }
                // Allow other warnings through
                originalWarn.apply(console, args);
              };
              
              // Override geolocation API to prevent violations
              if (navigator.geolocation) {
                const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
                const originalWatchPosition = navigator.geolocation.watchPosition;
                
                navigator.geolocation.getCurrentPosition = function() {
                  // Silently ignore geolocation requests
                };
                
                navigator.geolocation.watchPosition = function() {
                  // Silently ignore geolocation requests
                  return 1; // Return a fake watch ID
                };
              }
            })();
          `}
        </Script>
        <Script id="modern-analytics-events" strategy="afterInteractive">
          {`
            // Modern event listeners to replace deprecated unload events
            document.addEventListener('DOMContentLoaded', function() {
              // Use Page Visibility API instead of unload events
              document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'hidden') {
                  // Send analytics event when page becomes hidden
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'page_hide', {
                      event_category: 'engagement',
                      event_label: 'page_visibility'
                    });
                  }
                }
              });
              
              // Use beforeunload for final cleanup (more reliable than unload)
              window.addEventListener('beforeunload', function() {
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'page_unload', {
                    event_category: 'engagement',
                    event_label: 'page_unload'
                  });
                }
              });
            });
          `}
        </Script>
      </body>
    </html>
  );
}
