'use client';

import { PlaybackState } from '@/lib/types/reader';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface RsvpControlsProps {
  playbackState: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onJumpBack: () => void;
  onJumpForward: () => void;
}

export function RsvpControls({
  playbackState,
  onPlay,
  onPause,
  onStop,
  onJumpBack,
  onJumpForward,
}: RsvpControlsProps) {
  const isPlaying = playbackState === 'playing';

  const secondaryButtonStyle = {
    backgroundColor: 'var(--control-bg)',
    color: 'var(--foreground-secondary)',
  };

  const secondaryButtonClasses = cn(
    'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200',
    'hover:brightness-95 dark:hover:brightness-110',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
  );

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      <button
        onClick={onJumpBack}
        className={secondaryButtonClasses}
        style={secondaryButtonStyle}
        title="Jump back 10 words (Left Arrow)"
      >
        <SkipBack className="h-5 w-5" />
      </button>

      <button
        onClick={isPlaying ? onPause : onPlay}
        className={cn(
          'w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-all duration-200',
          'bg-blue-600 text-white shadow-lg shadow-blue-500/30',
          'hover:bg-blue-500 hover:shadow-blue-500/40 hover:scale-105',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'active:scale-95'
        )}
        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
      >
        {isPlaying ? (
          <Pause className="h-7 w-7" />
        ) : (
          <Play className="h-7 w-7 ml-1" />
        )}
      </button>

      <button
        onClick={onJumpForward}
        className={secondaryButtonClasses}
        style={secondaryButtonStyle}
        title="Jump forward 10 words (Right Arrow)"
      >
        <SkipForward className="h-5 w-5" />
      </button>

      <button
        onClick={onStop}
        className={cn(secondaryButtonClasses, 'ml-2')}
        style={secondaryButtonStyle}
        title="Reset to beginning (Escape)"
      >
        <RotateCcw className="h-5 w-5" />
      </button>
    </div>
  );
}
