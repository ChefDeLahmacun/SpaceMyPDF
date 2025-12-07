import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog - Product Updates & New Features',
  description: 'Track the latest updates, new features, and improvements to SpaceMyPDF. See how we\'re making PDF note-taking better every day.',
  openGraph: {
    title: 'SpaceMyPDF Changelog - Latest Updates',
    description: 'Track the latest updates, new features, and improvements to SpaceMyPDF.',
    type: 'website',
    url: 'https://www.spacemypdf.com/changelog',
  },
  alternates: {
    canonical: 'https://www.spacemypdf.com/changelog'
  }
};

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


