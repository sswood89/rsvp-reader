'use client';

import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * A wrapper component that adds subtle fade-in animation when pages mount.
 * Uses CSS animation for smooth, performant transitions.
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div className={`page-transition ${className}`}>
      {children}
    </div>
  );
}
