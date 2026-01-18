'use client';

import { BookMetadata } from '@/lib/types/book';
import { BookCard } from './BookCard';
import { BookGridSkeleton } from './BookCardSkeleton';
import { BookOpen, Upload } from 'lucide-react';

interface BookGridProps {
  books: BookMetadata[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* Illustration */}
      <div className="relative mb-8">
        {/* Background decorative elements */}
        <div className="absolute -inset-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full blur-2xl opacity-60" />

        {/* Stacked books illustration */}
        <div className="relative flex items-end gap-1">
          {/* Book 1 */}
          <div className="w-10 h-14 bg-gradient-to-br from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 rounded-sm shadow-lg transform -rotate-6" />
          {/* Book 2 */}
          <div className="w-10 h-16 bg-gradient-to-br from-indigo-400 to-indigo-500 dark:from-indigo-500 dark:to-indigo-600 rounded-sm shadow-lg" />
          {/* Book 3 */}
          <div className="w-10 h-12 bg-gradient-to-br from-purple-400 to-purple-500 dark:from-purple-500 dark:to-purple-600 rounded-sm shadow-lg transform rotate-6" />

          {/* Open book icon overlay */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
            <BookOpen className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Text content */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
        Your library is empty
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
        Start building your collection by uploading an EPUB file. Your books will appear here for easy access.
      </p>

      {/* Upload hint */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-300">
        <Upload className="w-4 h-4" />
        <span>Drag and drop or click to upload</span>
      </div>
    </div>
  );
}

export function BookGrid({ books, onDelete, isLoading = false }: BookGridProps) {
  if (isLoading) {
    return <BookGridSkeleton count={6} />;
  }

  if (books.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      }}
    >
      {books.map((book, index) => (
        <BookCard key={book.id} book={book} onDelete={onDelete} staggerIndex={index} />
      ))}
    </div>
  );
}
