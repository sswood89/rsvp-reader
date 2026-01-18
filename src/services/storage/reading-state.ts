import { db } from './db';
import { BookId } from '@/lib/types/book';
import { ReadingPosition, ReaderPreferences, DEFAULT_PREFERENCES } from '@/lib/types/reader';

const PREFERENCES_KEY = 'global';

export async function getReadingPosition(bookId: BookId): Promise<ReadingPosition | undefined> {
  return db.positions.get(bookId);
}

export async function saveReadingPosition(position: ReadingPosition): Promise<void> {
  await db.positions.put(position);
}

export async function clearReadingPosition(bookId: BookId): Promise<void> {
  await db.positions.delete(bookId);
}

export async function getPreferences(): Promise<ReaderPreferences> {
  const stored = await db.preferences.get(PREFERENCES_KEY);
  if (!stored) return DEFAULT_PREFERENCES;
  const { id, ...prefs } = stored;
  return prefs;
}

export async function savePreferences(prefs: ReaderPreferences): Promise<void> {
  await db.preferences.put({ ...prefs, id: PREFERENCES_KEY });
}
