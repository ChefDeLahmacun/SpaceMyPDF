import { Manrope, Inter } from 'next/font/google';
import { Metadata } from 'next';
import Header from '@/components/Header';
import '@/styles/design-system.css';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'PDFextend - Add Note Space to Your PDFs',
  description: 'Easily extend your PDF documents with customizable note-taking space.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-navy-950 dark:to-navy-900">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Built with Next.js and Tailwind CSS
          </footer>
        </div>
      </body>
    </html>
  );
} 