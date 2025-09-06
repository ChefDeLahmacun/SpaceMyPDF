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
  title: "SpaceMyPDF | Add Note Space to PDFs - Free & Easy PDF Tool",
  description: "Need space for notes in your PDF? SpaceMyPDF lets you add note-taking space to any PDF document. Free, private, and works instantly in your browser. Perfect for students and professionals.",
  keywords: "add space to PDF, PDF note space, PDF margin space, PDF notes, PDF editor free, add margins to PDF, PDF annotation space, space my pdf, spacemypdf, pdf note taking space",
  openGraph: {
    title: "SpaceMyPDF | Add Note Space to PDFs - Free & Easy PDF Tool",
    description: "Need space for notes in your PDF? SpaceMyPDF lets you add note-taking space to any PDF document. Free, private, and works instantly in your browser. Perfect for students and professionals.",
    type: "website",
    url: "https://www.spacemypdf.com",
    images: [
      {
        url: "/images/Logo.png",
        width: 60,
        height: 60,
        alt: "SpaceMyPDF Logo"
      }
    ],
    siteName: "SpaceMyPDF"
  },
  twitter: {
    card: "summary",
    title: "SpaceMyPDF | Add Note Space to PDFs - Free & Easy PDF Tool",
    description: "Need space for notes in your PDF? SpaceMyPDF lets you add note-taking space to any PDF document. Free, private, and works instantly in your browser.",
    images: ["/images/Logo.png"],
  },
  robots: {
    index: true,
    follow: true,
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
  },
  alternates: {
    canonical: "https://www.spacemypdf.com"
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
    <html lang="en" className={fontVariables}>
      <head>
        {/* External CSS is now imported at the top */}
        {/* External JS is now loaded with Next.js Script component */}
        <Script src="/scripts/font-loader.js" strategy="beforeInteractive" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body suppressHydrationWarning style={{ WebkitOverflowScrolling: 'touch' }}>
        <Navigation />
        <div className="bottom-section-placeholder"></div>
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
