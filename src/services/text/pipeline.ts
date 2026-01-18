import { Word } from '@/lib/types/book';
import { normalizeText } from './normalizer';
import { tokenizeWords, cleanWord } from './tokenizer';
import { calculateOrp } from '@/lib/utils/orp';

export function processText(rawText: string, chapterIndex: number): Word[] {
  const normalizedText = normalizeText(rawText);
  const rawWords = tokenizeWords(normalizedText);

  if (rawWords.length === 0) {
    return [];
  }

  const words: Word[] = rawWords.map((raw, index) => {
    const cleanText = cleanWord(raw.text);

    // Boost pause multiplier for chapter start
    let pauseMultiplier = raw.pauseMultiplier;
    if (index === 0) {
      pauseMultiplier = Math.max(pauseMultiplier, 1.5); // Pause at chapter start
    }

    return {
      id: `${chapterIndex}_${index}`,
      text: raw.text,
      cleanText,
      globalIndex: index,
      chapterIndex,
      orpIndex: calculateOrp(cleanText),
      hasEndPunctuation: raw.hasEndPunctuation,
      hasPausePunctuation: raw.hasPausePunctuation,
      isChapterStart: index === 0,
      isChapterEnd: index === rawWords.length - 1,
      // Natural pause indicators
      isHeader: raw.isHeader,
      isSectionBreak: raw.isSectionBreak,
      isAfterSectionBreak: raw.isAfterSectionBreak,
      hasNumericContent: raw.hasNumericContent,
      pauseMultiplier,
    };
  });

  return words;
}

export function mergeChapterWords(chapters: Word[][]): Word[] {
  let globalIndex = 0;
  const merged: Word[] = [];

  for (const chapter of chapters) {
    for (const word of chapter) {
      merged.push({
        ...word,
        globalIndex: globalIndex++,
      });
    }
  }

  return merged;
}
