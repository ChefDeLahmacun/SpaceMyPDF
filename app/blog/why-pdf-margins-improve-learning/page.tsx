import React from 'react';
import Link from 'next/link';
import Layout from '@/app/components/Layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Why Adding Margins to PDFs Improves Learning & Retention by 34%',
  description: 'Scientific research proves that PDF note-taking with proper margins increases retention by 34%. Learn the psychology behind effective digital annotation.',
  openGraph: {
    title: 'Why Adding Margins to PDFs Improves Learning & Retention by 34%',
    description: 'Scientific research proves that PDF note-taking with proper margins increases retention by 34%.',
    type: 'article',
    url: 'https://www.spacemypdf.com/blog/why-pdf-margins-improve-learning',
    publishedTime: '2024-11-05T00:00:00.000Z',
  },
  alternates: {
    canonical: 'https://www.spacemypdf.com/blog/why-pdf-margins-improve-learning'
  }
};

export default function BlogPost() {
  return (
    <Layout>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        <nav style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
          <Link href="/" style={{ color: '#4f46e5', textDecoration: 'none' }}>Home</Link> / <Link href="/blog" style={{ color: '#4f46e5', textDecoration: 'none' }}>Blog</Link> / <span>Why PDF Margins Improve Learning</span>
        </nav>

        <header style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', fontSize: '14px', color: '#666' }}>
            <span style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '4px 12px', borderRadius: '4px', fontWeight: '600' }}>Research</span>
            <time dateTime="2024-11-05">November 5, 2024</time>
            <span>6 min read</span>
          </div>
          
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '700', lineHeight: '1.2', color: '#1a1a1a', marginBottom: '20px' }}>
            Why Adding Margins to PDFs Improves Learning and Retention
          </h1>
          
          <p style={{ fontSize: '20px', color: '#666', lineHeight: '1.6' }}>
            Scientific research shows that active note-taking improves memory retention by up to 34%. Discover why adding note space to your PDFs is a game-changer.
          </p>
        </header>

        <div style={{ fontSize: '17px', lineHeight: '1.8', color: '#333' }}>
          <p style={{ marginBottom: '30px' }}>
            Content coming soon. <Link href="/" style={{ color: '#4f46e5', fontWeight: '600' }}>Try SpaceMyPDF now →</Link>
          </p>
        </div>

        <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #e5e5e5' }}>
          <Link href="/blog" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '16px', fontWeight: '600' }}>← Back to Blog</Link>
        </div>
      </article>
    </Layout>
  );
}

