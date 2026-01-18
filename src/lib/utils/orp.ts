export function calculateOrp(word: string): number {
  const cleanWord = word.replace(/[^a-zA-Z]/g, '');
  const length = cleanWord.length;

  if (length <= 1) return 0;
  if (length <= 3) return 0;
  if (length <= 5) return 1;
  if (length <= 9) return 2;
  if (length <= 13) return 3;
  return 4;
}

export function splitWordByOrp(word: string): {
  before: string;
  orp: string;
  after: string;
} {
  if (!word || word.length === 0) {
    return { before: '', orp: '', after: '' };
  }

  const leadingPuncMatch = word.match(/^[^a-zA-Z]*/);
  const leadingPunc = leadingPuncMatch ? leadingPuncMatch[0].length : 0;

  const cleanWord = word.replace(/[^a-zA-Z]/g, '');
  const orpIndex = calculateOrp(cleanWord);

  const actualIndex = leadingPunc + orpIndex;

  if (actualIndex >= word.length) {
    return { before: word, orp: '', after: '' };
  }

  return {
    before: word.slice(0, actualIndex),
    orp: word[actualIndex] || '',
    after: word.slice(actualIndex + 1),
  };
}
