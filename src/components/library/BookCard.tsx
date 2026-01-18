'use client';

import { useEffect, useState } from 'react';
import { BookMetadata, Chapter } from '@/lib/types/book';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Book, Trash2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { getReadingPosition } from '@/services/storage/reading-state';
import { db } from '@/services/storage/db';

interface BookCardProps {
  book: BookMetadata;
  onDelete: (id: string) => void;
  staggerIndex?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

interface ReadingProgress {
  percentage: number;
  currentChapter: number;
  totalChapters: number;
}

export function BookCard({ book, onDelete, staggerIndex = 0 }: BookCardProps) {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const position = await getReadingPosition(book.id);
        if (!position) {
          setProgress(null);
          return;
        }

        // Get book record with chapters to calculate total words
        const bookRecord = await db.books.get(book.id);
        if (!bookRecord || !bookRecord.chapters) {
          setProgress(null);
          return;
        }

        const chapters = bookRecord.chapters;
        const totalWords = chapters.reduce((sum: number, ch: Chapter) => sum + ch.wordCount, 0);

        // Calculate words read up to current position
        let wordsRead = 0;
        for (let i = 0; i < position.chapterIndex; i++) {
          wordsRead += chapters[i]?.wordCount || 0;
        }
        wordsRead += position.wordIndex;

        const percentage = totalWords > 0 ? Math.min(100, Math.round((wordsRead / totalWords) * 100)) : 0;

        setProgress({
          percentage,
          currentChapter: position.chapterIndex + 1,
          totalChapters: chapters.length,
        });
      } catch (error) {
        console.error('Failed to fetch reading progress:', error);
        setProgress(null);
      }
    }

    fetchProgress();
  }, [book.id]);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete "${book.title}"?`)) {
      onDelete(book.id);
    }
  };

  const hasContinueReading = !!book.lastOpenedAt;

  return (
    <Link href={`/reader/${book.id}`}>
      <div
        className="h-full transition-all duration-250 ease-out hover:-translate-y-2 animate-stagger"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.06)) drop-shadow(0 4px 6px rgba(0,0,0,0.04))',
          '--stagger-index': staggerIndex,
        } as React.CSSProperties}
      >
        <div
          className="h-full transition-all duration-250 ease-out hover:drop-shadow-none"
          style={{
            ['--hover-shadow' as string]: '0 12px 28px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)',
          }}
        >
          <Card
            interactive
            className="h-full flex flex-col overflow-hidden group relative transition-shadow duration-250 ease-out hover:shadow-[0_12px_28px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)]"
          >
            {/* Cover image area */}
            <div className="aspect-[2/3] bg-gradient-to-br from-[var(--control-bg)] to-[var(--control-bg-hover)] relative flex items-center justify-center overflow-hidden">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Book className="h-12 w-12 text-[var(--foreground-secondary)] opacity-50" />
                  <span className="text-xs text-[var(--foreground-secondary)] opacity-50 font-medium">No cover</span>
                </div>
              )}

              {/* "Continue Reading" badge */}
              {hasContinueReading && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--accent-primary)] text-white rounded-full text-xs font-medium shadow-md">
                    <BookOpen className="h-3 w-3" />
                    Continue
                  </span>
                </div>
              )}

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />

              {/* Hover action overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-250">
                {/* Delete button - top right */}
                <div className="absolute top-2 right-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-250">
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={handleDelete}
                    className="h-9 w-9 shadow-lg backdrop-blur-sm bg-red-500/90 hover:bg-red-600 border-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quick info overlay */}
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-250 transform translate-y-2 group-hover:translate-y-0">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                  {book.totalChapters} chapters
                </span>
              </div>
            </div>

            {/* Book info */}
            <div className="p-3 flex-1 flex flex-col relative">
              <h3 className="font-semibold text-sm text-[var(--foreground-primary)] line-clamp-2 leading-tight mb-1">
                {book.title}
              </h3>
              <p className="text-xs text-[var(--foreground-secondary)] line-clamp-1">
                {book.author}
              </p>
              <div className="mt-auto pt-2">
                {book.lastOpenedAt ? (
                  <p className="text-xs text-[var(--foreground-secondary)] opacity-70">
                    Last read {formatDate(book.lastOpenedAt)}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--accent-primary)] font-medium">
                    New
                  </p>
                )}
              </div>

              {/* Reading progress bar */}
              {progress && progress.percentage > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--control-bg)]">
                  <div
                    className="h-full bg-[var(--accent-primary)] transition-all duration-300 ease-out rounded-r-full"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Link>
  );
}
