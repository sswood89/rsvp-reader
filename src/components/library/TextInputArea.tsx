'use client';

import { useState, useCallback, useRef, DragEvent, ClipboardEvent } from 'react';
import { Type, ClipboardPaste, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface TextInputAreaProps {
  onTextSubmit: (text: string, title?: string) => void;
  className?: string;
}

export function TextInputArea({ onTextSubmit, className }: TextInputAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedText = e.dataTransfer.getData('text/plain');
    const droppedHtml = e.dataTransfer.getData('text/html');

    if (droppedText) {
      setText(droppedText);
      setIsExpanded(true);
    } else if (droppedHtml) {
      // Extract text from HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(droppedHtml, 'text/html');
      doc.querySelectorAll('script, style, noscript').forEach(el => el.remove());
      const extractedText = doc.body?.textContent?.trim() || '';
      if (extractedText) {
        setText(extractedText);
        setIsExpanded(true);
      }
    }
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text/plain');
    if (pastedText && !isExpanded) {
      e.preventDefault();
      setText(pastedText);
      setIsExpanded(true);
    }
  }, [isExpanded]);

  const handleSubmit = useCallback(() => {
    if (text.trim()) {
      onTextSubmit(text.trim(), title.trim() || undefined);
      setText('');
      setTitle('');
      setIsExpanded(false);
    }
  }, [text, title, onTextSubmit]);

  const handleCancel = useCallback(() => {
    setText('');
    setTitle('');
    setIsExpanded(false);
  }, []);

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  if (isExpanded) {
    return (
      <div
        className={cn(
          'rounded-xl p-6 transition-all duration-200',
          className
        )}
        style={{
          backgroundColor: 'var(--background-elevated)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />
            <span className="font-medium" style={{ color: 'var(--foreground-primary)' }}>
              Quick Read
            </span>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" style={{ color: 'var(--foreground-secondary)' }} />
          </button>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full px-3 py-2 mb-3 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--control-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--foreground-primary)',
          }}
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here..."
          className="w-full h-48 px-3 py-2 rounded-lg text-sm resize-none"
          style={{
            backgroundColor: 'var(--control-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--foreground-primary)',
          }}
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {wordCount.toLocaleString()} words
            {wordCount > 0 && ` (~${Math.ceil(wordCount / 250)} min at 250 WPM)`}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={wordCount === 0}
            >
              Start Reading
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl p-8 text-center transition-all duration-200 cursor-pointer',
        isDragging && 'scale-[1.02]',
        className
      )}
      style={{
        backgroundColor: isDragging ? 'var(--accent-primary-alpha)' : 'var(--background-elevated)',
        border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-color)'}`,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      onClick={() => setIsExpanded(true)}
      tabIndex={0}
      role="button"
      aria-label="Drop or paste text to read"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="p-4 rounded-full"
          style={{ backgroundColor: 'var(--accent-primary-alpha)' }}
        >
          {isDragging ? (
            <ClipboardPaste className="h-8 w-8" style={{ color: 'var(--accent-primary)' }} />
          ) : (
            <Type className="h-8 w-8" style={{ color: 'var(--accent-primary)' }} />
          )}
        </div>
        <div>
          <p className="font-medium mb-1" style={{ color: 'var(--foreground-primary)' }}>
            {isDragging ? 'Drop text here' : 'Quick Read'}
          </p>
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Drag & drop text, paste from clipboard, or click to type
          </p>
        </div>
      </div>
    </div>
  );
}
