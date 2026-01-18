'use client';

import { Slider } from '@/components/ui/Slider';
import { WPM_MIN, WPM_MAX } from '@/lib/constants';

interface WpmSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function WpmSlider({ value, onChange }: WpmSliderProps) {
  return (
    <div className="w-full max-w-sm px-4">
      <Slider
        label="Reading Speed"
        value={value}
        min={WPM_MIN}
        max={WPM_MAX}
        step={25}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
      <p
        className="text-center text-xs mt-1"
        style={{ color: 'var(--foreground-secondary)', opacity: 0.8 }}
      >
        words per minute
      </p>
    </div>
  );
}
