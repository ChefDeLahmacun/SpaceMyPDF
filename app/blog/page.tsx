import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Note-Taking Tips & Guides | SpaceMyPDF Blog',
  description: 'Expert guides on PDF note-taking, study techniques, document organization, and maximizing productivity with digital documents. Free tips for students and professionals.',
  openGraph: {
    title: 'PDF Note-Taking Tips & Guides | SpaceMyPDF Blog',
    description: 'Expert guides on PDF note-taking, study techniques, document organization, and maximizing productivity with digital documents.',
    type: 'website',
    url: 'https://www.spacemypdf.com/blog',
  },
  alternates: {
    canonical: 'https://www.spacemypdf.com/blog'
  }
};

const blogPosts = [
  {
    title: "How to Add Note Space to PDF Documents: Complete Guide",
    slug: "how-to-add-note-space-to-pdf",
    excerpt: "Learn the best methods to add note-taking space to your PDF documents. Whether you're a student preparing for exams or a professional reviewing documents, discover how to create perfect note margins in seconds.",
    date: "2024-11-07",
    readTime: "5 min read",
    category: "Guides"
  },
  {
    title: "10 PDF Note-Taking Tips Every Student Should Know",
    slug: "pdf-note-taking-tips-for-students",
    excerpt: "Master the art of digital note-taking with these proven strategies. From annotation techniques to organization systems, learn how successful students take notes on PDF lecture slides and textbooks.",
    date: "2024-11-06",
    readTime: "7 min read",
    category: "Study Tips"
  },
  {
    title: "Why Adding Margins to PDFs Improves Learning and Retention",
    slug: "why-pdf-margins-improve-learning",
    excerpt: "Scientific research shows that active note-taking improves memory retention by up to 34%. Discover why adding note space to your PDFs is a game-changer for learning and how to do it effectively.",
    date: "2024-11-05",
    readTime: "6 min read",
    category: "Research"
  },
  {
    title: "Digital Note-Taking vs Traditional: Which is Better?",
    slug: "digital-vs-traditional-note-taking",
    excerpt: "Compare the pros and cons of digital and handwritten notes. Learn when to use each method and how to combine both approaches for maximum effectiveness using PDF tools.",
    date: "2024-11-04",
    readTime: "8 min read",
    category: "Comparison"
  },
  {
    title: "Best PDF Tools for Students in 2024",
    slug: "best-pdf-tools-for-students",
    excerpt: "A comprehensive review of the most useful PDF tools for academic success. From free browser-based solutions to advanced desktop software, find the perfect tools for your study workflow.",
    date: "2024-11-03",
    readTime: "10 min read",
    category: "Reviews"
  },
  {
    title: "How to Organize Digital Study Materials Effectively",
    slug: "organize-digital-study-materials",
    excerpt: "Stop losing important documents! Learn proven systems for organizing PDFs, lecture notes, and study materials. Create a digital filing system that saves time and reduces stress.",
    date: "2024-11-02",
    readTime: "6 min read",
    category: "Organization"
  }
];

export default function Blog() {
  return (
    <Layout>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '60px 20px',
        fontFamily: 'var(--font-inter), system-ui, sans-serif'
      }}>
        {/* Header */}
        <header style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: 'clamp(32px, 5vw, 48px)', 
            fontWeight: '700',
            marginBottom: '20px',
            color: '#1a1a1a'
          }}>
            PDF Note-Taking Tips & Guides
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#666',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Expert advice on digital note-taking, PDF productivity, and study techniques to help you learn smarter, not harder.
          </p>
        </header>

        {/* Blog Posts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '30px',
          marginBottom: '60px'
        }}>
          {blogPosts.map((post) => (
            <article 
              key={post.slug}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                border: '1px solid #e5e5e5'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#4f46e5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {post.category}
                </span>
                <time style={{ fontSize: '13px', color: '#999' }} dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </time>
              </div>
              
              <Link 
                href={`/blog/${post.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <h2 style={{ 
                  fontSize: '22px', 
                  fontWeight: '600',
                  marginBottom: '15px',
                  color: '#1a1a1a',
                  lineHeight: '1.4'
                }}>
                  {post.title}
                </h2>
              </Link>
              
              <p style={{ 
                fontSize: '15px', 
                color: '#666',
                lineHeight: '1.6',
                marginBottom: '20px'
              }}>
                {post.excerpt}
              </p>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '15px',
                borderTop: '1px solid #f0f0f0'
              }}>
                <span style={{ fontSize: '13px', color: '#999' }}>
                  {post.readTime}
                </span>
                <Link 
                  href={`/blog/${post.slug}`}
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#4f46e5',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <section style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          padding: '50px 30px',
          textAlign: 'center',
          border: '1px solid #e5e5e5'
        }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '700',
            marginBottom: '15px',
            color: '#1a1a1a'
          }}>
            Get More Study Tips
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#666',
            marginBottom: '25px',
            maxWidth: '600px',
            margin: '0 auto 25px'
          }}>
            Join thousands of students improving their note-taking skills. Start using SpaceMyPDF today to add note space to your PDFs instantly.
          </p>
          <Link 
            href="/"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: '#4f46e5',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#4338ca';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#4f46e5';
            }}
          >
            Try SpaceMyPDF Free
          </Link>
        </section>
      </div>
    </Layout>
  );
}
