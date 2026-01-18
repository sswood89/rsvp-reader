'use client';

import { Word } from '@/lib/types/book';
import { processText } from './pipeline';

export interface TextContent {
  id: string;
  title: string;
  text: string;
  wordCount: number;
  createdAt: number;
}

/**
 * Parse raw text input into Word[] for the RSVP engine
 */
export function parseTextInput(text: string, title?: string): { words: Word[]; content: TextContent } {
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const words = processText(cleanedText, 0);

  const content: TextContent = {
    id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: title || generateTitle(cleanedText),
    text: cleanedText,
    wordCount: words.length,
    createdAt: Date.now(),
  };

  return { words, content };
}

/**
 * Generate a title from the first few words of the text
 */
function generateTitle(text: string): string {
  const firstLine = text.split('\n')[0].trim();
  if (firstLine.length <= 50) {
    return firstLine || 'Untitled Text';
  }
  return firstLine.slice(0, 47) + '...';
}

/**
 * Extract text from HTML (for pasted rich content)
 */
export function extractTextFromHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove scripts, styles, and other non-content elements
  doc.querySelectorAll('script, style, noscript, nav, header, footer, aside').forEach(el => el.remove());

  // Get text content
  const text = doc.body?.textContent || '';

  // Clean up whitespace
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Estimate reading time in minutes at given WPM
 */
export function estimateReadingTime(wordCount: number, wpm: number = 250): number {
  return Math.ceil(wordCount / wpm);
}
