import { Word } from '../types/book';

export function calculateDelay(
  word: Word,
  wpm: number,
  pauseOnPunctuation: boolean,
  multiplier: number
): number {
  const baseDelay = 60000 / wpm;

  // Add extra time for longer words (improves readability)
  const wordLength = word.cleanText?.length || word.text.length;
  let lengthMultiplier = 1;
  if (wordLength > 8) {
    lengthMultiplier = 1.3; // 30% more time for long words
  } else if (wordLength > 5) {
    lengthMultiplier = 1.15; // 15% more time for medium words
  }

  let delay = baseDelay * lengthMultiplier;

  // Apply the word's natural pause multiplier (headers, sections, numbers, etc.)
  // This is independent of the punctuation pause setting
  const naturalPauseMultiplier = word.pauseMultiplier ?? 1.0;
  delay *= naturalPauseMultiplier;

  if (!pauseOnPunctuation) return delay;

  // End punctuation (. ! ?) gets full multiplier for natural pauses
  if (word.hasEndPunctuation) {
    return delay * multiplier;
  }

  // Pause punctuation (, ; :) gets partial multiplier
  if (word.hasPausePunctuation) {
    return delay * (1 + (multiplier - 1) * 0.6);
  }

  return delay;
}

export function wpmToMs(wpm: number): number {
  return 60000 / wpm;
}

export function msToWpm(ms: number): number {
  return Math.round(60000 / ms);
}
