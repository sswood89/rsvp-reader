'use client';

import { useMemo } from 'react';
import { Word } from '@/lib/types/book';
import { cn } from '@/lib/utils/cn';

interface ContextPreviewProps {
  words: Word[];
  currentIndex: number;
  className?: string;
}

interface SentenceBounds {
  start: number;
  end: number;
}

function findSentenceBounds(words: Word[], fromIndex: number): SentenceBounds {
  // Find sentence start (first word after previous sentence end)
  let start = 0;
  for (let i = fromIndex - 1; i >= 0; i--) {
    if (words[i].hasEndPunctuation) {
      start = i + 1;
      break;
    }
  }

  // Find sentence end (word with end punctuation)
  let end = words.length - 1;
  for (let i = fromIndex; i < words.length; i++) {
    if (words[i].hasEndPunctuation) {
      end = i;
      break;
    }
  }

  return { start, end };
}

function findNextSentenceBounds(words: Word[], currentSentenceEnd: number): SentenceBounds | null {
  const nextStart = currentSentenceEnd + 1;
  if (nextStart >= words.length) return null;

  // Find next sentence end
  let end = words.length - 1;
  for (let i = nextStart; i < words.length; i++) {
    if (words[i].hasEndPunctuation) {
      end = i;
      break;
    }
  }

  return { start: nextStart, end };
}

export function ContextPreview({ words, currentIndex, className }: ContextPreviewProps) {
  const { currentSentence, nextSentence } = useMemo(() => {
    if (words.length === 0) {
      return { currentSentence: null, nextSentence: null };
    }

    const currentBounds = findSentenceBounds(words, currentIndex);
    const currentSentenceWords = words.slice(currentBounds.start, currentBounds.end + 1);

    const nextBounds = findNextSentenceBounds(words, currentBounds.end);
    const nextSentenceWords = nextBounds
      ? words.slice(nextBounds.start, nextBounds.end + 1)
      : null;

    return {
      currentSentence: {
        words: currentSentenceWords,
        highlightIndex: currentIndex - currentBounds.start,
      },
      nextSentence: nextSentenceWords
        ? { words: nextSentenceWords }
        : null,
    };
  }, [words, currentIndex]);

  if (!currentSentence) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Current sentence with highlighted word */}
      <div className="text-center leading-relaxed">
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
          {currentSentence.words.map((word, index) => (
            <span
              key={word.id}
              className={cn(
                'inline',
                index === currentSentence.highlightIndex &&
                  'bg-yellow-300 dark:bg-yellow-600 px-0.5 rounded font-medium'
              )}
            >
              {word.text}
              {index < currentSentence.words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>
      </div>

      {/* Next sentence preview (dimmed) */}
      {nextSentence && (
        <div className="text-center leading-relaxed">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {nextSentence.words.map((word, index) => (
              <span key={word.id}>
                {word.text}
                {index < nextSentence.words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
