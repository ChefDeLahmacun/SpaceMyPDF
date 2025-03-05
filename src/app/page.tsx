'use client';

import { useState } from 'react';
import UploadArea from '@/components/UploadArea';
import PDFViewer from '@/components/PDFViewer';
import NoteSpaceControl from '@/components/NoteSpaceControl';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [noteSpaceWidth, setNoteSpaceWidth] = useState(200);

  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient">
            Add Note Space to Your PDFs
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Easily extend your PDF documents with customizable note-taking space. Perfect for students, researchers, and professionals.
          </p>
        </section>

        {/* Main Content */}
        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-lg p-6 md:p-8 mb-12 animate-slide-up">
          {!selectedFile ? (
            <UploadArea onFileSelect={setSelectedFile} />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-semibold">
                  Customize Note Space
                </h2>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="btn btn-secondary"
                >
                  Upload New PDF
                </button>
              </div>
              <NoteSpaceControl
                width={noteSpaceWidth}
                onChange={setNoteSpaceWidth}
              />
              <PDFViewer
                file={selectedFile}
                noteSpaceWidth={noteSpaceWidth}
              />
            </div>
          )}
        </div>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-6 animate-fade-in">
          {[
            {
              title: 'Customizable Space',
              description: 'Adjust the width of your note space to fit your needs perfectly.'
            },
            {
              title: 'Preview Changes',
              description: 'See how your extended PDF looks in real-time as you make adjustments.'
            },
            {
              title: 'Fast Processing',
              description: 'Quick and efficient PDF processing with live preview of the first 10 pages.'
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-navy-800 rounded-xl p-6 shadow-md"
            >
              <h3 className="text-xl font-display font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
} 