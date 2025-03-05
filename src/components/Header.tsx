'use client';

import { useState, useEffect } from 'react';
import { FiMoon, FiSun, FiGithub } from 'react-icons/fi';

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if user prefers dark mode
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:bg-navy-900/80 dark:border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gradient">
                PDFextend
              </span>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* GitHub link */}
            <a
              href="https://github.com/yourusername/pdfextend"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-navy-600 transition-colors"
            >
              <FiGithub className="w-5 h-5" />
            </a>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-navy-600 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <FiSun className="w-5 h-5" />
              ) : (
                <FiMoon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 