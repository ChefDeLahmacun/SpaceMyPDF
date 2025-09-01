'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import './changelog.css';

export default function ChangelogPage() {
  // Override body background for this page
  useEffect(() => {
    const originalBackground = document.body.style.background;
    document.body.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
    
    return () => {
      document.body.style.background = originalBackground;
    };
  }, []);

  const changelogEntries = [
    {
      version: "1.2.0",
      date: "27 August 2025",
      title: "Multi-Side Note Space & Patterns",
      features: [
        "Multi-side note space selection (left, right, top, bottom)",
        "Separate width controls for horizontal and vertical sides",
        "Note patterns: lines, grid, dots with configurable spacing",
        "Smart intersection handling for overlapping note spaces",
        "Real-time preview updates for all controls"
      ],
      improvements: [
        "Enhanced note-taking experience with visual guides",
        "Better space utilization with multiple side options",
        "Professional note spaces with customizable patterns"
      ]
    },
    {
      version: "1.1.0",
      date: "29 April 2025",
      title: "Enhanced PDF Processing & SEO",
      features: [
        "Improved PDF preview generation and display",
        "Better error handling and user feedback",
        "Enhanced file upload experience",
        "SEO improvements and Google Search Console integration"
      ],
      improvements: [
        "More stable PDF processing across devices",
        "Better search engine visibility and user experience"
      ]
    },
    {
      version: "1.0.0",
      date: "5 March 2025",
      title: "Initial Release - Core PDF Extension",
      features: [
        "PDF upload and client-side processing",
        "Basic note space addition (single side)",
        "Note space width and color customization",
        "PDF download with extended dimensions",
        "Responsive design for mobile and desktop"
      ],
      improvements: [
        "Client-side PDF processing for privacy",
        "Simple and intuitive interface design"
      ]
    }
  ];

  return (
    <div 
      className="changelog-page"
      style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div className="changelog-container container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Changelog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track the evolution of SpaceMyPDF with our detailed changelog. 
            See what's new, what's improved, and what's been added in each version.
          </p>
          <div className="mt-6">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              ← Back to SpaceMyPDF
            </Link>
          </div>
        </div>

        {/* Changelog Entries */}
        <div className="max-w-4xl mx-auto space-y-8">
          {changelogEntries.map((entry, index) => (
            <div 
              key={entry.version}
              className="changelog-entry bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Version Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {entry.title}
                  </h2>
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      v{entry.version}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {entry.date}
                    </span>
                  </div>
                </div>
                {index === 0 && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    Latest
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  New Features
                </h3>
                <ul className="space-y-2">
                  {entry.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              {entry.improvements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Improvements
                  </h3>
                  <ul className="space-y-2">
                    {entry.improvements.map((improvement, improvementIndex) => (
                      <li key={improvementIndex} className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1">⚡</span>
                        <span className="text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p className="text-sm">
            SpaceMyPDF is continuously evolving. Check back regularly for updates!
          </p>
        </div>
      </div>
    </div>
  );
}
