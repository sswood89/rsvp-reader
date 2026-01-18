'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BookMetadata } from '@/lib/types/book';
import { getAllBooks, deleteBook } from '@/services/storage/books';
import { useEpubLoader } from '@/hooks/useEpubLoader';
import { BookGrid } from '@/components/library/BookGrid';
import { UploadArea } from '@/components/library/UploadArea';
import { TextInputArea } from '@/components/library/TextInputArea';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { PageTransition } from '@/components/ui/PageTransition';
import { BookOpen, Library } from 'lucide-react';

const TEXT_STORAGE_KEY = 'rsvp-quick-read-text';

export default function LibraryPage() {
  const router = useRouter();
  const [books, setBooks] = useState<BookMetadata[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLoading, error, uploadEpub } = useEpubLoader();

  const loadBooks = useCallback(async () => {
    const allBooks = await getAllBooks();
    setBooks(allBooks);
  }, []);

  useEffect(() => {
    loadBooks().then(() => setIsInitialized(true));
  }, [loadBooks]);

  // Track scroll position for header shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      const metadata = await uploadEpub(file);
      if (metadata) {
        await loadBooks();
      }
    },
    [uploadEpub, loadBooks]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteBook(id);
      await loadBooks();
    },
    [loadBooks]
  );

  const handleTextSubmit = useCallback(
    (text: string, title?: string) => {
      // Store text in session storage and navigate to quick-read page
      sessionStorage.setItem(TEXT_STORAGE_KEY, JSON.stringify({ text, title }));
      router.push('/quick-read');
    },
    [router]
  );

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <header
        className={`
          sticky top-0 z-50
          bg-[var(--background-elevated)]/85
          backdrop-blur-xl
          border-b transition-all duration-200
          ${isScrolled
            ? 'border-[var(--border-color)] shadow-lg shadow-black/5 dark:shadow-black/20'
            : 'border-transparent'
          }
        `}
        style={{ backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--accent-primary)] rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-[var(--foreground)]">
                  RSVP Reader
                </h1>
                {isInitialized && books.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-primary-alpha)] text-[var(--accent-primary)]">
                    <Library className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">
                      {books.length} {books.length === 1 ? 'book' : 'books'}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-[var(--foreground-secondary)]">Speed reading made simple</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <UploadArea onUpload={handleUpload} isLoading={isLoading} error={error} />
          <TextInputArea onTextSubmit={handleTextSubmit} />
        </div>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              Your Library
            </h2>
            {isInitialized && books.length > 0 && (
              <span className="text-sm text-[var(--foreground-secondary)]">
                {books.length} {books.length === 1 ? 'book' : 'books'}
              </span>
            )}
          </div>
          <BookGrid books={books} onDelete={handleDelete} isLoading={!isInitialized} />
        </section>
      </main>
    </div>
    </PageTransition>
  );
}
