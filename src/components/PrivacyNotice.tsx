'use client';

import { FiShield, FiLock, FiCheck } from 'react-icons/fi';

export default function PrivacyNotice() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
              <FiShield className="w-5 h-5 text-violet-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Privacy is Protected
              </h2>
              <FiLock className="w-4 h-4 text-violet-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <FiCheck className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 text-sm">
                  This tool processes your PDFs entirely in your browser. Your files are never uploaded
                  to any server, ensuring complete privacy and security.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <FiCheck className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 text-sm">
                  Perfect for sensitive documents — everything stays on your device, giving you
                  full control over your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 