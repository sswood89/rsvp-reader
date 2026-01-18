'use client';

import { useRef, useCallback, useEffect } from 'react';
import { BookId } from '@/lib/types/book';
import { ReadingPosition } from '@/lib/types/reader';
import { saveReadingPosition, getReadingPosition } from '@/services/storage/reading-state';

const AUTO_SAVE_WORD_INTERVAL = 50;

interface UseReadingStateOptions {
  bookId: BookId;
  chapterIndex: number;
  debounceMs?: number;
}

interface UseReadingStateResult {
  savePosition: (wordIndex: number) => void;
  loadPosition: () => Promise<ReadingPosition | undefined>;
  flushSave: () => Promise<void>;
}

export function useReadingState({
  bookId,
  chapterIndex,
  debounceMs = 1000,
}: UseReadingStateOptions): UseReadingStateResult {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPositionRef = useRef<number | null>(null);
  const lastSavedIndexRef = useRef<number>(0);

  const flushSave = useCallback(async () => {
    if (pendingPositionRef.current !== null) {
      const position: ReadingPosition = {
        bookId,
        chapterIndex,
        wordIndex: pendingPositionRef.current,
        timestamp: Date.now(),
      };
      await saveReadingPosition(position);
      lastSavedIndexRef.current = pendingPositionRef.current;
      pendingPositionRef.current = null;
    }
  }, [bookId, chapterIndex]);

  const savePosition = useCallback(
    (wordIndex: number) => {
      pendingPositionRef.current = wordIndex;

      // Auto-save every AUTO_SAVE_WORD_INTERVAL words (in addition to debounce)
      const wordsSinceLastSave = wordIndex - lastSavedIndexRef.current;
      if (wordsSinceLastSave >= AUTO_SAVE_WORD_INTERVAL) {
        flushSave();
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(flushSave, debounceMs);
    },
    [debounceMs, flushSave]
  );

  const loadPosition = useCallback(async () => {
    const position = await getReadingPosition(bookId);
    if (position) {
      lastSavedIndexRef.current = position.wordIndex;
    }
    return position;
  }, [bookId]);

  // Save position when tab loses focus (visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        flushSave();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [flushSave]);

  // Save position before page close
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use synchronous approach for beforeunload
      if (pendingPositionRef.current !== null) {
        const position: ReadingPosition = {
          bookId,
          chapterIndex,
          wordIndex: pendingPositionRef.current,
          timestamp: Date.now(),
        };
        // Use navigator.sendBeacon for reliable saving on page close
        const data = JSON.stringify({ type: 'save-position', position });
        navigator.sendBeacon('/api/reading-position', data);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [bookId, chapterIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      flushSave();
    };
  }, [flushSave]);

  return { savePosition, loadPosition, flushSave };
}
