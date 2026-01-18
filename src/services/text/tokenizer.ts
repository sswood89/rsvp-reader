export interface RawWord {
  text: string;
  hasEndPunctuation: boolean;
  hasPausePunctuation: boolean;
  isHeader: boolean;
  isSectionBreak: boolean;
  isAfterSectionBreak: boolean;
  hasNumericContent: boolean;
  pauseMultiplier: number;
}

const END_PUNCTUATION = /[.!?]$/;
const PAUSE_PUNCTUATION = /[,;:]$/;

// Header patterns
const CHAPTER_PATTERN = /^(chapter|part|section|book|act|scene|prologue|epilogue|introduction|conclusion|appendix)\b/i;
const NUMBERED_HEADER = /^(\d+\.|\d+\)|\[\d+\]|[IVXLCDM]+\.|[A-Z]\.)$/;
const ALL_CAPS_WORD = /^[A-Z][A-Z]+$/;

// Section break patterns
const SECTION_BREAK = /^(\*{3,}|#{3,}|-{3,}|_{3,}|={3,}|~{3,}|\*\s*\*\s*\*|•\s*•\s*•)$/;

// Numeric content patterns
const NUMERIC_CONTENT = /\d/;
const PERCENTAGE = /\d+%/;
const CURRENCY = /[$€£¥]\d|^\d+[.,]\d{2}$/;
const DATE_PATTERN = /\d{1,4}[-/]\d{1,2}[-/]\d{1,4}|\d{1,2}(st|nd|rd|th)/i;
const TIME_PATTERN = /\d{1,2}:\d{2}/;

export function tokenizeWords(text: string): RawWord[] {
  // Split by whitespace but preserve section breaks as separate tokens
  const tokens = text.split(/(\s+)/).filter((t) => t.trim().length > 0);
  const words: RawWord[] = [];

  let isAfterBreak = false;
  let consecutiveAllCaps = 0;

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    const prevWord = i > 0 ? tokens[i - 1] : '';

    // Check if this is a section break
    const isSectionBreak = SECTION_BREAK.test(word);

    // Detect headers
    const isChapterStart = CHAPTER_PATTERN.test(word);
    const isNumberedHeader = NUMBERED_HEADER.test(word);
    const isAllCaps = ALL_CAPS_WORD.test(word) && word.length > 1;

    // Track consecutive all-caps words (likely a header)
    if (isAllCaps) {
      consecutiveAllCaps++;
    } else {
      consecutiveAllCaps = 0;
    }

    // Determine if this is a header word
    const isHeader = isChapterStart || isNumberedHeader ||
      (isAllCaps && consecutiveAllCaps <= 5) || // First few all-caps words
      (isAfterBreak && i < tokens.length - 1); // First word after section break

    // Detect numeric content
    const hasNumeric = NUMERIC_CONTENT.test(word);
    const hasPercentage = PERCENTAGE.test(word);
    const hasCurrency = CURRENCY.test(word);
    const hasDate = DATE_PATTERN.test(word);
    const hasTime = TIME_PATTERN.test(word);
    const hasNumericContent = hasNumeric || hasPercentage || hasCurrency || hasDate || hasTime;

    // Calculate pause multiplier
    let pauseMultiplier = 1.0;

    if (isSectionBreak) {
      pauseMultiplier = 3.0; // Long pause for section breaks
    } else if (isHeader) {
      pauseMultiplier = 1.5; // Moderate pause for headers
    } else if (isAfterBreak) {
      pauseMultiplier = 1.3; // Slight pause after section break
    }

    // Extra time for complex numeric content
    if (hasNumericContent) {
      if (hasDate || hasTime || hasCurrency) {
        pauseMultiplier = Math.max(pauseMultiplier, 1.4); // Dates/times/currency need more processing
      } else if (hasPercentage) {
        pauseMultiplier = Math.max(pauseMultiplier, 1.25);
      } else {
        pauseMultiplier = Math.max(pauseMultiplier, 1.15); // Regular numbers
      }
    }

    words.push({
      text: word,
      hasEndPunctuation: END_PUNCTUATION.test(word),
      hasPausePunctuation: PAUSE_PUNCTUATION.test(word),
      isHeader,
      isSectionBreak,
      isAfterSectionBreak: isAfterBreak && !isSectionBreak,
      hasNumericContent,
      pauseMultiplier,
    });

    // Track if we're after a section break for next iteration
    isAfterBreak = isSectionBreak || (!!prevWord && END_PUNCTUATION.test(prevWord) && word === word.toUpperCase());
  }

  return words;
}

export function cleanWord(word: string): string {
  return word.replace(/[^a-zA-Z'-]/g, '');
}

export function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
