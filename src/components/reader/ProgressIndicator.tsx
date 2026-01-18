'use client';

import { cn } from '@/lib/utils/cn';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressIndicator({
  current,
  total,
  className,
}: ProgressIndicatorProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={cn('w-full', className)}>
      <div
        className="flex justify-between text-xs mb-2"
        style={{ color: 'var(--foreground-secondary)' }}
      >
        <span className="tabular-nums">Word {current + 1} of {total.toLocaleString()}</span>
        <span className="tabular-nums font-medium">{Math.round(progress)}%</span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--control-bg)' }}
      >
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
