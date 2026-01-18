'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { Play, X } from 'lucide-react';

interface ResumeMarkerProps {
  timestamp: number;
  onContinue: () => void;
  onDismiss?: () => void;
  autoHideMs?: number;
  className?: string;
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }
  return 'just now';
}

export function ResumeMarker({
  timestamp,
  onContinue,
  onDismiss,
  autoHideMs = 5000,
  className,
}: ResumeMarkerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isHiding, setIsHiding] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsHiding(true);
    // Wait for animation to complete
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  }, [onDismiss]);

  const handleContinue = useCallback(() => {
    setIsHiding(true);
    setTimeout(() => {
      setIsVisible(false);
      onContinue();
    }, 200);
  }, [onContinue]);

  // Auto-hide after specified duration
  useEffect(() => {
    if (autoHideMs <= 0) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, autoHideMs);

    return () => clearTimeout(timer);
  }, [autoHideMs, handleDismiss]);

  if (!isVisible) {
    return null;
  }

  const timeAgo = formatTimeAgo(timestamp);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm',
        'transition-all duration-300 ease-out',
        isHiding && 'opacity-0 translate-y-2',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Resumed from {timeAgo}
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
          Press Continue to pick up where you left off
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleContinue}
          className="gap-1.5"
        >
          <Play className="h-3.5 w-3.5" />
          Continue
        </Button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-md transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
