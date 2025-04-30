'use client';

import React from 'react';
import Layout from '../components/Layout';

const blogPosts = [
  {
    title: "How to Take Better Notes on PDF Documents",
    slug: "better-pdf-notes",
    excerpt: "Learn effective strategies for PDF note-taking and how SpaceMyPDF can enhance your study process.",
    date: "2024-03-21"
  },
  {
    title: "PDF Note-Taking Tips for Students",
    slug: "pdf-notes-students",
    excerpt: "Discover how to maximize your study efficiency with proper PDF note-taking techniques.",
    date: "2024-03-20"
  }
];

export default function Blog() {
  return (
    <Layout>
      <div className="blog-container">
        <h1>PDF Note-Taking Resources</h1>
        <div className="blog-posts">
          {blogPosts.map((post) => (
            <article key={post.slug} className="blog-post">
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              <span>{post.date}</span>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
} 