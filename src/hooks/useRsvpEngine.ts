'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Word } from '@/lib/types/book';
import { PlaybackState, ReaderPreferences, DEFAULT_PREFERENCES } from '@/lib/types/reader';
import { calculateDelay } from '@/lib/utils/timing';
import { JUMP_BACK_WORDS } from '@/lib/constants';

interface UseRsvpEngineOptions {
  words: Word[];
  initialIndex?: number;
  preferences?: ReaderPreferences;
  onWordChange?: (index: number) => void;
  onComplete?: () => void;
}

interface UseRsvpEngineResult {
  currentIndex: number;
  currentWord: Word | null;
  playbackState: PlaybackState;
  wpm: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
  jumpBack: () => void;
  jumpForward: () => void;
  goToWord: (index: number) => void;
  setWpm: (wpm: number) => void;
  progress: number;
  jumpToSentenceStart: () => void;
  jumpToPreviousSentence: () => void;
  jumpToNextSentence: () => void;
}

export function useRsvpEngine({
  words,
  initialIndex = 0,
  preferences = DEFAULT_PREFERENCES,
  onWordChange,
  onComplete,
}: UseRsvpEngineOptions): UseRsvpEngineResult {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [wpm, setWpmState] = useState(preferences.wpm);

  // Use refs for values needed in the tick function to avoid stale closures
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(currentIndex);
  const playingRef = useRef(false);
  const wpmRef = useRef(wpm);
  const wordsRef = useRef(words);
  const onWordChangeRef = useRef(onWordChange);
  const onCompleteRef = useRef(onComplete);

  // Keep refs in sync
  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    wpmRef.current = wpm;
  }, [wpm]);

  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  useEffect(() => {
    onWordChangeRef.current = onWordChange;
  }, [onWordChange]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset when words change (new chapter)
  useEffect(() => {
    clearTimer();
    playingRef.current = false;
    setPlaybackState('idle');
    setCurrentIndex(initialIndex);
    indexRef.current = initialIndex;
  }, [words]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // The core tick function - advances one word and schedules the next
  const tick = useCallback(() => {
    if (!playingRef.current) return;

    const currentWords = wordsRef.current;
    const idx = indexRef.current;

    // Check if we've reached the end
    if (idx >= currentWords.length - 1) {
      playingRef.current = false;
      setPlaybackState('idle');
      onCompleteRef.current?.();
      return;
    }

    // Advance to next word
    const nextIndex = idx + 1;
    indexRef.current = nextIndex;
    setCurrentIndex(nextIndex);
    onWordChangeRef.current?.(nextIndex);

    // Calculate delay for the word we just showed
    const word = currentWords[nextIndex];
    const delay = calculateDelay(
      word,
      wpmRef.current,
      preferences.pauseOnPunctuation,
      preferences.punctuationPauseMultiplier
    );

    // Schedule next tick
    timeoutRef.current = setTimeout(tick, delay);
  }, [preferences.pauseOnPunctuation, preferences.punctuationPauseMultiplier]);

  const play = useCallback(() => {
    if (wordsRef.current.length === 0) return;

    // If at end, restart from beginning
    if (indexRef.current >= wordsRef.current.length - 1) {
      indexRef.current = 0;
      setCurrentIndex(0);
    }

    playingRef.current = true;
    setPlaybackState('playing');

    // Calculate delay for current word and start
    const word = wordsRef.current[indexRef.current];
    const delay = calculateDelay(
      word,
      wpmRef.current,
      preferences.pauseOnPunctuation,
      preferences.punctuationPauseMultiplier
    );

    timeoutRef.current = setTimeout(tick, delay);
  }, [tick, preferences.pauseOnPunctuation, preferences.punctuationPauseMultiplier]);

  const pause = useCallback(() => {
    clearTimer();
    playingRef.current = false;
    setPlaybackState('paused');
  }, [clearTimer]);

  const toggle = useCallback(() => {
    if (playingRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const stop = useCallback(() => {
    clearTimer();
    playingRef.current = false;
    setPlaybackState('idle');
    setCurrentIndex(0);
    indexRef.current = 0;
    onWordChangeRef.current?.(0);
  }, [clearTimer]);

  const jumpBack = useCallback(() => {
    const newIndex = Math.max(0, indexRef.current - JUMP_BACK_WORDS);
    indexRef.current = newIndex;
    setCurrentIndex(newIndex);
    onWordChangeRef.current?.(newIndex);
  }, []);

  const jumpForward = useCallback(() => {
    const newIndex = Math.min(wordsRef.current.length - 1, indexRef.current + JUMP_BACK_WORDS);
    indexRef.current = newIndex;
    setCurrentIndex(newIndex);
    onWordChangeRef.current?.(newIndex);
  }, []);

  const goToWord = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(wordsRef.current.length - 1, index));
    indexRef.current = clampedIndex;
    setCurrentIndex(clampedIndex);
    onWordChangeRef.current?.(clampedIndex);
  }, []);

  const setWpm = useCallback((newWpm: number) => {
    const clamped = Math.max(100, Math.min(800, newWpm));
    wpmRef.current = clamped;
    setWpmState(clamped);
  }, []);

  // Find the start of the current sentence (first word after previous sentence end)
  const findSentenceStart = useCallback((fromIndex: number): number => {
    const currentWords = wordsRef.current;
    if (fromIndex <= 0) return 0;

    // Walk backwards to find the end of the previous sentence
    for (let i = fromIndex - 1; i >= 0; i--) {
      if (currentWords[i].hasEndPunctuation) {
        // The word after the end punctuation is the start of current sentence
        return i + 1;
      }
    }
    // No previous sentence end found, so we're at the start
    return 0;
  }, []);

  // Jump to start of current sentence
  const jumpToSentenceStart = useCallback(() => {
    const sentenceStart = findSentenceStart(indexRef.current);
    indexRef.current = sentenceStart;
    setCurrentIndex(sentenceStart);
    onWordChangeRef.current?.(sentenceStart);
  }, [findSentenceStart]);

  // Jump to start of previous sentence
  const jumpToPreviousSentence = useCallback(() => {
    const currentSentenceStart = findSentenceStart(indexRef.current);

    if (currentSentenceStart === 0) {
      // Already at start, go to index 0
      indexRef.current = 0;
      setCurrentIndex(0);
      onWordChangeRef.current?.(0);
      return;
    }

    // Find the start of the previous sentence
    // First, go to the word before current sentence start (which has end punctuation)
    // Then find where that sentence started
    const prevSentenceEnd = currentSentenceStart - 1;
    const prevSentenceStart = findSentenceStart(prevSentenceEnd);

    indexRef.current = prevSentenceStart;
    setCurrentIndex(prevSentenceStart);
    onWordChangeRef.current?.(prevSentenceStart);
  }, [findSentenceStart]);

  // Jump to start of next sentence
  const jumpToNextSentence = useCallback(() => {
    const currentWords = wordsRef.current;
    const currentIdx = indexRef.current;

    // Find the next word with end punctuation starting from current position
    for (let i = currentIdx; i < currentWords.length; i++) {
      if (currentWords[i].hasEndPunctuation) {
        // Move to the word after the punctuation (start of next sentence)
        const nextSentenceStart = Math.min(i + 1, currentWords.length - 1);
        indexRef.current = nextSentenceStart;
        setCurrentIndex(nextSentenceStart);
        onWordChangeRef.current?.(nextSentenceStart);
        return;
      }
    }

    // No next sentence found, stay at current position or go to end
    const endIndex = currentWords.length - 1;
    indexRef.current = endIndex;
    setCurrentIndex(endIndex);
    onWordChangeRef.current?.(endIndex);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      playingRef.current = false;
    };
  }, [clearTimer]);

  const currentWord = words[currentIndex] ?? null;
  const progress = words.length > 1 ? (currentIndex / (words.length - 1)) * 100 : (words.length === 1 ? 100 : 0);

  return {
    currentIndex,
    currentWord,
    playbackState,
    wpm,
    play,
    pause,
    toggle,
    stop,
    jumpBack,
    jumpForward,
    goToWord,
    setWpm,
    progress,
    jumpToSentenceStart,
    jumpToPreviousSentence,
    jumpToNextSentence,
  };
}
