'use client';

import { useState, useCallback, DragEvent, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { Upload } from 'lucide-react';

interface DropZoneProps {
  onFileDrop: (file: File) => void;
  accept?: string;
  className?: string;
  disabled?: boolean;
}

export function DropZone({
  onFileDrop,
  accept = '.epub',
  className,
  disabled = false,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.name.endsWith('.epub')) {
          onFileDrop(file);
        }
      }
    },
    [onFileDrop, disabled]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileDrop(files[0]);
      }
      e.target.value = '';
    },
    [onFileDrop]
  );

  const handleMouseEnter = useCallback(() => {
    if (!disabled) setIsHovered(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        // Base styles with glass morphism
        'relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer overflow-hidden',
        'backdrop-blur-md',
        // Smooth transitions
        'transition-all duration-300 ease-out',
        // Dragging state - prominent visual feedback
        isDragging && [
          'border-blue-500 dark:border-blue-400',
          'scale-[1.02]',
          // Glow effect via box-shadow
          'shadow-[0_0_30px_rgba(59,130,246,0.3)] dark:shadow-[0_0_30px_rgba(59,130,246,0.4)]',
        ],
        // Default state
        !isDragging && [
          'border-gray-300/60 dark:border-gray-600/60',
          'hover:border-blue-400/80 dark:hover:border-blue-500/80',
          'hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]',
        ],
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        // CSS custom properties for theming
        ['--dropzone-gradient-start' as string]: isDragging
          ? 'rgba(59, 130, 246, 0.15)'
          : 'rgba(255, 255, 255, 0.7)',
        ['--dropzone-gradient-end' as string]: isDragging
          ? 'rgba(59, 130, 246, 0.05)'
          : 'rgba(255, 255, 255, 0.3)',
      }}
    >
      {/* Radial gradient background */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          isDragging ? 'opacity-100' : 'opacity-80'
        )}
        style={{
          background: isDragging
            ? 'radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)'
            : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 50%, transparent 70%)',
        }}
      />
      {/* Dark mode gradient overlay */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300 dark:opacity-100 opacity-0'
        )}
        style={{
          background: isDragging
            ? 'radial-gradient(circle at center, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)'
            : 'radial-gradient(circle at center, rgba(30, 41, 59, 0.6) 0%, rgba(30, 41, 59, 0.3) 50%, transparent 70%)',
        }}
      />

      {/* Content container */}
      <div className="relative z-10">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Icon container with enhanced styling */}
        <div className={cn(
          'inline-flex items-center justify-center w-20 h-20 rounded-full mb-5',
          'transition-all duration-300 ease-out',
          // Background color states
          isDragging
            ? 'bg-blue-100 dark:bg-blue-900/60'
            : 'bg-gray-100/80 dark:bg-gray-700/60',
          // Hover scale and glow
          (isHovered || isDragging) && [
            'scale-110',
            isDragging
              ? 'shadow-[0_0_25px_rgba(59,130,246,0.4)]'
              : 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',
          ],
        )}>
          <Upload className={cn(
            'h-9 w-9 transition-all duration-300',
            // Color states
            isDragging
              ? 'text-blue-600 dark:text-blue-400'
              : isHovered
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400',
            // Bounce animation when dragging
            isDragging && 'animate-bounce',
          )} />
        </div>

        <p className={cn(
          'font-semibold mb-1 transition-colors duration-200',
          isDragging
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300'
        )}>
          {isDragging ? 'Drop your file here' : 'Drag and drop an EPUB file here'}
        </p>
        <p className={cn(
          'text-sm mb-4 transition-colors duration-200',
          isDragging
            ? 'text-blue-600/80 dark:text-blue-400/80'
            : 'text-gray-500 dark:text-gray-400'
        )}>
          or click to browse
        </p>
        <span className={cn(
          'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium',
          'transition-all duration-200',
          isDragging
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
            : 'bg-gray-100/80 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400'
        )}>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
          .epub files only
        </span>
      </div>
    </div>
  );
}
