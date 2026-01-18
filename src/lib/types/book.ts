export type BookId = string;

export interface BookMetadata {
  id: BookId;
  title: string;
  author: string;
  coverUrl?: string;
  addedAt: number;
  lastOpenedAt?: number;
  fileSize: number;
  totalChapters: number;
}

export interface Chapter {
  id: string;
  index: number;
  href: string;
  title: string;
  wordCount: number;
}

export interface Word {
  id: string;
  text: string;
  cleanText: string;
  globalIndex: number;
  chapterIndex: number;
  orpIndex: number;
  hasEndPunctuation: boolean;
  hasPausePunctuation: boolean;
  isChapterStart: boolean;
  isChapterEnd: boolean;
  // Natural pause indicators
  isHeader: boolean;
  isSectionBreak: boolean;
  isAfterSectionBreak: boolean;
  hasNumericContent: boolean;
  pauseMultiplier: number; // Additional pause multiplier (1.0 = normal)
}
