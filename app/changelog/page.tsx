import React from 'react';
import Link from 'next/link';

export default function ChangelogPage() {
  const changelogEntries = [
    {
      version: "1.3.0",
      date: "2024-12-19",
      title: "Multiple Side Note Space with Separate Width Controls",
      features: [
        "Added ability to select multiple sides simultaneously (left, right, top, bottom)",
        "Implemented separate width controls for horizontal (left/right) and vertical (top/bottom) note spaces",
        "Added checkbox to optionally enable separate width controls when multiple sides are selected",
        "Real-time preview updates when adjusting separate width sliders",
        "Smart conditional rendering - controls only appear when relevant sides are selected",
        "Quick preset buttons (S: 30%, M: 70%, L: 100%) for both horizontal and vertical sliders"
      ],
      improvements: [
        "Enhanced user experience with immediate visual feedback",
        "Cleaner interface - original slider is replaced when separate widths are enabled",
        "Better note space customization for complex layouts"
      ]
    },
    {
      version: "1.2.0",
      date: "2024-12-19",
      title: "Note Space Patterns and Multi-Side Support",
      features: [
        "Added note space patterns: lines, grid, and dots",
        "Configurable spacing options for each pattern type",
        "Multi-side note space selection (left, right, top, bottom combinations)",
        "Automatic intersection handling for overlapping note spaces",
        "Pattern alignment across multiple sides"
      ],
      improvements: [
        "Enhanced note-taking experience with visual guides",
        "Better space utilization with multiple side options",
        "Professional-looking note spaces with customizable patterns"
      ]
    },
    {
      version: "1.1.0",
      date: "2024-12-19",
      title: "Enhanced PDF Processing and UI",
      features: [
        "Improved PDF preview generation",
        "Better error handling and user feedback",
        "Enhanced file upload experience",
        "Responsive design improvements"
      ],
      improvements: [
        "More stable PDF processing",
        "Better user experience across different devices"
      ]
    },
    {
      version: "1.0.0",
      date: "2024-12-19",
      title: "Initial Release - Core PDF Extension",
      features: [
        "PDF upload and processing",
        "Basic note space addition (single side)",
        "Note space width customization",
        "Color customization for note spaces",
        "PDF download with extended dimensions"
      ],
      improvements: [
        "Client-side PDF processing for privacy",
        "Simple and intuitive interface"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
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
              className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
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
