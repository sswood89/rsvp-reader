'use client';

import { useEffect, useCallback } from 'react';
import { Word } from '@/lib/types/book';
import { ReaderPreferences } from '@/lib/types/reader';
import { useRsvpEngine } from '@/hooks/useRsvpEngine';
import { RsvpDisplay } from './RsvpDisplay';
import { RsvpControls } from './RsvpControls';
import { WpmSlider } from './WpmSlider';
import { ProgressIndicator } from './ProgressIndicator';
import { ContextPreview } from './ContextPreview';
import { cn } from '@/lib/utils/cn';

interface RsvpReaderProps {
  words: Word[];
  initialWordIndex?: number;
  preferences?: ReaderPreferences;
  onPositionChange?: (index: number) => void;
  onComplete?: () => void;
  className?: string;
}

export function RsvpReader({
  words,
  initialWordIndex = 0,
  preferences,
  onPositionChange,
  onComplete,
  className,
}: RsvpReaderProps) {
  const {
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
    setWpm,
    jumpToPreviousSentence,
    jumpToNextSentence,
  } = useRsvpEngine({
    words,
    initialIndex: initialWordIndex,
    preferences,
    onWordChange: onPositionChange,
    onComplete,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          toggle();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          jumpBack();
          break;
        case 'ArrowRight':
          e.preventDefault();
          jumpForward();
          break;
        case 'Escape':
          e.preventDefault();
          stop();
          break;
        case 'BracketLeft':
          e.preventDefault();
          jumpToPreviousSentence();
          break;
        case 'BracketRight':
          e.preventDefault();
          jumpToNextSentence();
          break;
      }
    },
    [toggle, jumpBack, jumpForward, stop, jumpToPreviousSentence, jumpToNextSentence]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isPlaying = playbackState === 'playing';
  const isNotPlaying = !isPlaying;

  return (
    <div className={cn('flex flex-col items-center', isPlaying && 'zen-mode-active', className)}>
      {/* Word display area - solid background, no gradients/textures */}
      <div
        className="w-full rounded-2xl mb-4"
        style={{
          backgroundColor: 'var(--background-elevated)',
          border: '1px solid var(--border-color)',
        }}
      >
        <RsvpDisplay word={currentWord} />
      </div>

      {/* Context preview when paused - also uses theme variables */}
      {isNotPlaying && words.length > 0 && currentWord && (
        <div
          className="w-full max-w-2xl px-4 py-4 mb-4 rounded-xl zen-mode-controls"
          style={{
            backgroundColor: 'var(--control-bg)',
            border: '1px solid var(--border-color)',
          }}
        >
          <ContextPreview
            words={words}
            currentIndex={currentIndex}
          />
        </div>
      )}

      {/* Controls section with zen mode fading */}
      <div className="zen-mode-controls flex flex-col items-center gap-6 w-full">
        <RsvpControls
          playbackState={playbackState}
          onPlay={play}
          onPause={pause}
          onStop={stop}
          onJumpBack={jumpBack}
          onJumpForward={jumpForward}
        />

        <WpmSlider value={wpm} onChange={setWpm} />

        <ProgressIndicator
          current={currentIndex}
          total={words.length}
          className="w-full max-w-md"
        />

        <p
          className="text-xs text-center"
          style={{ color: 'var(--foreground-secondary)', opacity: 0.7 }}
        >
          Space: Play/Pause | Arrows: Jump 10 words | [ / ]: Jump sentences | Esc: Reset
        </p>
      </div>
    </div>
  );
}
