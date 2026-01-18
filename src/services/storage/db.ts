import Dexie, { Table } from 'dexie';
import { BookMetadata, Chapter } from '@/lib/types/book';
import { ReadingPosition, ReaderPreferences } from '@/lib/types/reader';
import { EpubFileRecord } from '@/lib/types/storage';
import { DB_NAME, DB_VERSION } from '@/lib/constants';

export interface BookRecord extends BookMetadata {
  chapters: Chapter[];
}

export class RsvpDatabase extends Dexie {
  books!: Table<BookRecord, string>;
  epubFiles!: Table<EpubFileRecord, string>;
  positions!: Table<ReadingPosition, string>;
  preferences!: Table<ReaderPreferences & { id: string }, string>;

  constructor() {
    super(DB_NAME);

    this.version(DB_VERSION).stores({
      books: 'id, title, author, addedAt, lastOpenedAt',
      epubFiles: 'id, addedAt',
      positions: 'bookId, timestamp',
      preferences: 'id',
    });
  }
}

export const db = new RsvpDatabase();
