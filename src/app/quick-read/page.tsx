'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Word } from '@/lib/types/book';
import { parseTextInput, TextContent } from '@/services/text/textInput';
import { RsvpReader } from '@/components/reader/RsvpReader';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Loader2, Type } from 'lucide-react';
import Link from 'next/link';

// Session storage key for text content
const TEXT_STORAGE_KEY = 'rsvp-quick-read-text';

export default function QuickReadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [words, setWords] = useState<Word[]>([]);
  const [content, setContent] = useState<TextContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get text from session storage
    const storedData = sessionStorage.getItem(TEXT_STORAGE_KEY);

    if (storedData) {
      try {
        const { text, title } = JSON.parse(storedData);
        const { words: parsedWords, content: parsedContent } = parseTextInput(text, title);

        if (parsedWords.length === 0) {
          setError('No readable text found');
        } else {
          setWords(parsedWords);
          setContent(parsedContent);
        }
      } catch {
        setError('Failed to parse text content');
      }
    } else {
      setError('No text content found. Please paste text from the library page.');
    }

    setIsLoading(false);
  }, [searchParams]);

  const handleComplete = useCallback(() => {
    // Clear the session storage when done
    sessionStorage.removeItem(TEXT_STORAGE_KEY);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading text...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md px-4">
          <div
            className="mx-auto mb-6 p-4 rounded-full w-fit"
            style={{ backgroundColor: 'var(--accent-primary-alpha)' }}
          >
            <Type className="h-10 w-10" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'No text content available'}
          </p>
          <Link href="/library">
            <Button variant="primary">Go to Library</Button>
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
                {content.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {content.wordCount.toLocaleString()} words
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {words.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">
              No readable content found in the text.
            </p>
          </div>
        ) : (
          <RsvpReader
            words={words}
            initialWordIndex={0}
            onComplete={handleComplete}
            className="w-full max-w-3xl"
          />
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Quick Read Mode - Text is not saved
          </p>
        </div>
      </footer>
    </div>
  );
}
