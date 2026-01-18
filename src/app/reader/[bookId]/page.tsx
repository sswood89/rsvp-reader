'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { Book } from 'epubjs';
import { BookMetadata, Chapter, Word } from '@/lib/types/book';
import { useEpubLoader } from '@/hooks/useEpubLoader';
import { useReadingState } from '@/hooks/useReadingState';
import { updateLastOpened } from '@/services/storage/books';
import { RsvpReader } from '@/components/reader/RsvpReader';
import { ChapterNav } from '@/components/reader/ChapterNav';
import { ResumeMarker } from '@/components/reader/ResumeMarker';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ReaderPageProps {
  params: Promise<{ bookId: string }>;
}

export default function ReaderPage({ params }: ReaderPageProps) {
  const { bookId } = use(params);
  const { isLoading: epubLoading, error: epubError, loadBook, loadChapter } = useEpubLoader();

  const [metadata, setMetadata] = useState<BookMetadata | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [words, setWords] = useState<Word[]>([]);
  const [initialWordIndex, setInitialWordIndex] = useState(0);
  const [isChapterLoading, setIsChapterLoading] = useState(false);
  const [resumeInfo, setResumeInfo] = useState<{ timestamp: number } | null>(null);

  const { savePosition, loadPosition } = useReadingState({
    bookId,
    chapterIndex: currentChapterIndex,
  });

  useEffect(() => {
    async function init() {
      const result = await loadBook(bookId);
      if (!result) {
        return;
      }

      setMetadata(result.metadata);
      setChapters(result.chapters);
      setBook(result.book);

      await updateLastOpened(bookId);

      const savedPosition = await loadPosition();
      if (savedPosition && savedPosition.wordIndex > 0) {
        setCurrentChapterIndex(savedPosition.chapterIndex);
        setInitialWordIndex(savedPosition.wordIndex);
        // Only show resume marker if position was saved more than a minute ago
        const timeSinceSave = Date.now() - savedPosition.timestamp;
        if (timeSinceSave > 60000) {
          setResumeInfo({ timestamp: savedPosition.timestamp });
        }
      }
    }

    init();
  }, [bookId, loadBook, loadPosition]);

  useEffect(() => {
    async function loadChapterContent() {
      if (!book || chapters.length === 0) return;

      setIsChapterLoading(true);
      try {
        const chapter = chapters[currentChapterIndex];
        const chapterWords = await loadChapter(book, chapter.href, currentChapterIndex);
        setWords(chapterWords);
      } catch (err) {
        console.error('Failed to load chapter:', err);
        setWords([]);
      } finally {
        setIsChapterLoading(false);
      }
    }

    loadChapterContent();
  }, [book, chapters, currentChapterIndex, loadChapter]);

  const handlePositionChange = useCallback(
    (index: number) => {
      savePosition(index);
    },
    [savePosition]
  );

  const handleChapterChange = useCallback((index: number) => {
    setCurrentChapterIndex(index);
    setInitialWordIndex(0);
  }, []);

  const handleChapterComplete = useCallback(() => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      setInitialWordIndex(0);
    }
  }, [currentChapterIndex, chapters.length]);

  const handleResumeContinue = useCallback(() => {
    setResumeInfo(null);
    // The reader is already at the saved position, so just dismiss the marker
    // User can press play to continue reading
  }, []);

  const handleResumeDismiss = useCallback(() => {
    setResumeInfo(null);
  }, []);

  if (epubLoading && !metadata) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading book...</p>
        </div>
      </div>
    );
  }

  if (epubError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{epubError}</p>
          <Link href="/library">
            <Button variant="primary">Return to Library</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Book not found</p>
          <Link href="/library">
            <Button variant="primary">Return to Library</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/library">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {metadata.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {metadata.author}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Resume marker when returning to saved position */}
        {resumeInfo && !isChapterLoading && words.length > 0 && (
          <ResumeMarker
            timestamp={resumeInfo.timestamp}
            onContinue={handleResumeContinue}
            onDismiss={handleResumeDismiss}
            autoHideMs={5000}
            className="w-full max-w-xl mb-6"
          />
        )}

        {isChapterLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading chapter...</p>
          </div>
        ) : words.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">
              This chapter appears to be empty.
            </p>
          </div>
        ) : (
          <RsvpReader
            words={words}
            initialWordIndex={initialWordIndex}
            onPositionChange={handlePositionChange}
            onComplete={handleChapterComplete}
            className="w-full max-w-3xl"
          />
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-center">
          <ChapterNav
            chapters={chapters}
            currentChapterIndex={currentChapterIndex}
            onChapterChange={handleChapterChange}
          />
        </div>
      </footer>
    </div>
  );
}
