'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface BlogPostCardProps {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
}

export default function BlogPostCard({ title, slug, excerpt, date, readTime, category }: BlogPostCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const categoryColors: { [key: string]: { bg: string; text: string } } = {
    'Guides': { bg: '#e0e7ff', text: '#4f46e5' },
    'Study Tips': { bg: '#fef3c7', text: '#92400e' },
    'Research': { bg: '#e0e7ff', text: '#4f46e5' },
    'Comparison': { bg: '#e0f2fe', text: '#075985' },
    'Reviews': { bg: '#f0fdf4', text: '#166534' },
    'Organization': { bg: '#fce7f3', text: '#9f1239' }
  };

  const colors = categoryColors[category] || { bg: '#f3f4f6', text: '#374151' };

  return (
    <article 
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: isHovered ? '0 8px 20px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        border: '1px solid #e5e5e5',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
          color: colors.text,
          backgroundColor: colors.bg,
          padding: '4px 12px',
          borderRadius: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {category}
        </span>
        <time style={{ fontSize: '13px', color: '#999' }} dateTime={date}>
          {new Date(date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </time>
      </div>
      
      <Link 
        href={`/blog/${slug}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <h2 style={{ 
          fontSize: '22px', 
          fontWeight: '600',
          marginBottom: '15px',
          color: '#1a1a1a',
          lineHeight: '1.4'
        }}>
          {title}
        </h2>
      </Link>
      
      <p style={{ 
        fontSize: '15px', 
        color: '#666',
        lineHeight: '1.6',
        marginBottom: '20px'
      }}>
        {excerpt}
      </p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: '15px',
        borderTop: '1px solid #f0f0f0'
      }}>
        <span style={{ fontSize: '13px', color: '#999' }}>
          {readTime}
        </span>
        <Link 
          href={`/blog/${slug}`}
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
  );
}

