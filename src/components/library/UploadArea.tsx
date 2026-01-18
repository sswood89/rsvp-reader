'use client';

import { DropZone } from '@/components/ui/DropZone';
import { Loader2 } from 'lucide-react';

interface UploadAreaProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export function UploadArea({ onUpload, isLoading, error }: UploadAreaProps) {
  return (
    <div className="mb-10">
      {isLoading ? (
        <div
          className="relative border-2 border-blue-400/60 dark:border-blue-500/60 rounded-2xl p-12 text-center overflow-hidden backdrop-blur-md"
          style={{
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.2)',
          }}
        >
          {/* Animated radial gradient background */}
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)',
            }}
          />
          {/* Dark mode gradient overlay */}
          <div
            className="absolute inset-0 dark:opacity-100 opacity-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, rgba(30, 41, 59, 0.4) 50%, transparent 70%)',
            }}
          />

          {/* Progress ring indicator */}
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100/80 dark:bg-blue-900/60 mb-5 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              {/* Outer spinning ring */}
              <div className="absolute w-20 h-20">
                <svg className="w-20 h-20 animate-spin" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="170"
                    strokeDashoffset="50"
                    className="text-blue-500/30 dark:text-blue-400/30"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="60 170"
                    strokeLinecap="round"
                    className="text-blue-600 dark:text-blue-400"
                  />
                </svg>
              </div>
              <Loader2 className="h-9 w-9 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>

            <p className="text-blue-700 dark:text-blue-300 font-semibold mb-1">
              Processing your book...
            </p>
            <p className="text-sm text-blue-600/70 dark:text-blue-400/70 mb-4">
              This may take a moment
            </p>

            {/* Animated progress dots */}
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      ) : (
        <DropZone onFileDrop={onUpload} />
      )}
      {error && (
        <div
          className="mt-4 flex items-center gap-3 px-5 py-4 bg-red-50/80 dark:bg-red-900/30 border border-red-200/80 dark:border-red-700/50 rounded-xl backdrop-blur-sm transition-all duration-300"
          style={{
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)',
          }}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">Please try again with a valid EPUB file</p>
          </div>
        </div>
      )}
    </div>
  );
}
