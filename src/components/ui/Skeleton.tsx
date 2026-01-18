'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangle' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className,
  variant = 'rectangle',
  width,
  height,
  lines = 1,
  style,
  ...props
}: SkeletonProps) {
  const baseStyles = 'skeleton-shimmer bg-gray-200 dark:bg-gray-700';

  const variantStyles = {
    rectangle: 'rounded-md',
    circle: 'rounded-full',
    text: 'rounded h-4',
  };

  const computedStyle = {
    ...style,
    width: width ?? (variant === 'circle' ? height : undefined),
    height: height ?? (variant === 'circle' ? width : undefined),
  };

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseStyles,
              variantStyles.text,
              // Make the last line shorter for a more natural look
              index === lines - 1 && 'w-3/4'
            )}
            style={{
              height: height ?? undefined,
              width: index === lines - 1 ? '75%' : width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={computedStyle}
      {...props}
    />
  );
}

// Convenience components for common use cases
export function SkeletonText({
  lines = 1,
  className,
  ...props
}: Omit<SkeletonProps, 'variant'>) {
  return <Skeleton variant="text" lines={lines} className={className} {...props} />;
}

export function SkeletonCircle({
  size = 40,
  className,
  ...props
}: Omit<SkeletonProps, 'variant' | 'width' | 'height'> & { size?: number }) {
  return (
    <Skeleton
      variant="circle"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
}
