'use client';

import { Chapter } from '@/lib/types/book';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ChapterNavProps {
  chapters: Chapter[];
  currentChapterIndex: number;
  onChapterChange: (index: number) => void;
}

export function ChapterNav({
  chapters,
  currentChapterIndex,
  onChapterChange,
}: ChapterNavProps) {
  const currentChapter = chapters[currentChapterIndex];
  const hasPrev = currentChapterIndex > 0;
  const hasNext = currentChapterIndex < chapters.length - 1;

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChapterChange(currentChapterIndex - 1)}
        disabled={!hasPrev}
        title="Previous chapter"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <select
        value={currentChapterIndex}
        onChange={(e) => onChapterChange(parseInt(e.target.value, 10))}
        className="flex-1 max-w-xs px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {chapters.map((chapter, index) => (
          <option key={chapter.id} value={index}>
            {chapter.title}
          </option>
        ))}
      </select>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChapterChange(currentChapterIndex + 1)}
        disabled={!hasNext}
        title="Next chapter"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
