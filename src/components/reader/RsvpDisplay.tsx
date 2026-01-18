'use client';

import { Word } from '@/lib/types/book';
import { splitWordByOrp } from '@/lib/utils/orp';
import { cn } from '@/lib/utils/cn';

interface RsvpDisplayProps {
  word: Word | null;
  className?: string;
}

export function RsvpDisplay({ word, className }: RsvpDisplayProps) {
  if (!word) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-44 sm:h-52',
          className
        )}
      >
        <div className="text-center">
          <p
            className="text-2xl sm:text-3xl font-light tracking-wide"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            Press play to start
          </p>
          <p
            className="text-sm mt-2"
            style={{ color: 'var(--foreground-secondary)', opacity: 0.7 }}
          >
            or press Space
          </p>
        </div>
      </div>
    );
  }

  const { before, orp, after } = splitWordByOrp(word.text);

  return (
    <div
      className={cn(
        'flex items-center justify-center h-44 sm:h-52 select-none',
        className
      )}
    >
      <div className="relative flex items-center px-4">
        {/* ORP vertical alignment guide - subtle 2px line at 20% opacity */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 flex flex-col items-center pointer-events-none">
          <div className="orp-guide h-full" />
        </div>

        {/* Word display with Atkinson Hyperlegible font */}
        <div className="rsvp-word flex items-baseline">
          <span
            className="text-right min-w-[4ch] sm:min-w-[5ch] font-normal"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {before}
          </span>
          <span
            className="font-bold"
            style={{ color: 'var(--orp-highlight)' }}
          >
            {orp}
          </span>
          <span
            className="text-left min-w-[4ch] sm:min-w-[5ch] font-normal"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {after}
          </span>
        </div>
      </div>
    </div>
  );
}
