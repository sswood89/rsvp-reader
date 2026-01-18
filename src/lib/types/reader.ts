import { BookId, Word } from './book';

export type PlaybackState = 'idle' | 'playing' | 'paused';

export interface ReadingPosition {
  bookId: BookId;
  chapterIndex: number;
  wordIndex: number;
  timestamp: number;
}

export interface ReaderPreferences {
  wpm: number;
  theme: 'light' | 'dark' | 'system';
  pauseOnPunctuation: boolean;
  punctuationPauseMultiplier: number;
}

export interface RsvpReaderProps {
  words: Word[];
  initialWordIndex?: number;
  onPositionChange?: (index: number) => void;
  onChapterEnd?: () => void;
  onComplete?: () => void;
  className?: string;
}

export const DEFAULT_PREFERENCES: ReaderPreferences = {
  wpm: 250,
  theme: 'system',
  pauseOnPunctuation: true,
  punctuationPauseMultiplier: 2.5,
};
