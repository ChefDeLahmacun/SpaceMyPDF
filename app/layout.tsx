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
  title: "SpaceMyPDF",
  description: "Add note space to your PDFs easily",
  icons: {
    icon: [
      { url: '/images/Logo.png' },
    ],
    apple: [
      { url: '/images/Logo.png' },
    ],
  },
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
        <link rel="icon" type="image/png" sizes="32x32" href="/images/Logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/Logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/Logo.png" />
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
      </body>
    </html>
  );
}
