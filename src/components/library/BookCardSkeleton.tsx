'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function BookCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Cover image area - matches BookCard aspect ratio */}
      <div className="aspect-[2/3] relative">
        <Skeleton className="absolute inset-0 rounded-none rounded-t-xl" />
      </div>

      {/* Book info - matches BookCard padding and structure */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Title - 2 lines */}
        <Skeleton variant="text" className="h-4 w-full mb-1" />
        <Skeleton variant="text" className="h-4 w-3/4 mb-2" />

        {/* Author - 1 line */}
        <Skeleton variant="text" className="h-3 w-1/2 mb-auto" />

        {/* Date/New badge area */}
        <div className="mt-auto pt-2">
          <Skeleton variant="text" className="h-3 w-2/5" />
        </div>
      </div>
    </Card>
  );
}

interface BookGridSkeletonProps {
  count?: number;
}

export function BookGridSkeleton({ count = 6 }: BookGridSkeletonProps) {
  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </div>
  );
}
