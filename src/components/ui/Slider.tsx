'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue = true, value, min, max, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-3">
        {(label || showValue) && (
          <div className="flex justify-between items-center text-sm">
            {label && (
              <span
                className="font-medium"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                {label}
              </span>
            )}
            {showValue && (
              <span
                className="font-semibold tabular-nums px-2.5 py-0.5 rounded-md"
                style={{
                  color: 'var(--foreground)',
                  backgroundColor: 'var(--control-bg)',
                }}
              >
                {value}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          value={value}
          min={min}
          max={max}
          className={cn(
            'w-full h-2 rounded-full appearance-none cursor-pointer',
            'accent-blue-600',
            '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-blue-600',
            '[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform',
            className
          )}
          style={{ backgroundColor: 'var(--control-bg)' }}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';
