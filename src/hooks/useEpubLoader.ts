'use client';

import { useState, useCallback } from 'react';
import { Book } from 'epubjs';
import { BookMetadata, Chapter, Word } from '@/lib/types/book';
import { parseEpub, loadEpubFromData } from '@/services/epub/parser';
import { extractChapterText } from '@/services/epub/extractor';
import { addBook, getBook, getEpubData } from '@/services/storage/books';
import { processText } from '@/services/text/pipeline';

interface UseEpubLoaderResult {
  isLoading: boolean;
  error: string | null;
  uploadEpub: (file: File) => Promise<BookMetadata | null>;
  loadBook: (bookId: string) => Promise<{
    metadata: BookMetadata;
    chapters: Chapter[];
    book: Book;
  } | null>;
  loadChapter: (book: Book, chapterHref: string, chapterIndex: number) => Promise<Word[]>;
}

export function useEpubLoader(): UseEpubLoaderResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadEpub = useCallback(async (file: File): Promise<BookMetadata | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { metadata, chapters, book } = await parseEpub(arrayBuffer);

      await addBook(metadata, chapters, arrayBuffer);
      book.destroy();

      return metadata;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load EPUB';
      console.error('Upload error:', err);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadBook = useCallback(
    async (
      bookId: string
    ): Promise<{
      metadata: BookMetadata;
      chapters: Chapter[];
      book: Book;
    } | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const bookRecord = await getBook(bookId);
        if (!bookRecord) {
          throw new Error('Book not found');
        }

        const epubData = await getEpubData(bookId);
        if (!epubData) {
          throw new Error('EPUB data not found');
        }

        const book = await loadEpubFromData(epubData);
        await book.loaded.spine;

        const { chapters, ...metadata } = bookRecord;

        return { metadata, chapters, book };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load book';
        console.error('Load book error:', err);
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loadChapter = useCallback(
    async (book: Book, chapterHref: string, chapterIndex: number): Promise<Word[]> => {
      const text = await extractChapterText(book, chapterHref);

      if (!text) {
        return [];
      }

      return processText(text, chapterIndex);
    },
    []
  );

  return {
    isLoading,
    error,
    uploadEpub,
    loadBook,
    loadChapter,
  };
}
