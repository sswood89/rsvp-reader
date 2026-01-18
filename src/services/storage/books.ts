import { db, BookRecord } from './db';
import { BookMetadata, BookId, Chapter } from '@/lib/types/book';

export async function getAllBooks(): Promise<BookMetadata[]> {
  const books = await db.books.orderBy('addedAt').reverse().toArray();
  return books.map(({ chapters, ...metadata }) => metadata);
}

export async function getBook(id: BookId): Promise<BookRecord | undefined> {
  return db.books.get(id);
}

export async function addBook(
  metadata: BookMetadata,
  chapters: Chapter[],
  epubData: ArrayBuffer
): Promise<void> {
  await db.transaction('rw', [db.books, db.epubFiles], async () => {
    await db.books.put({ ...metadata, chapters });
    await db.epubFiles.put({
      id: metadata.id,
      data: epubData,
      addedAt: metadata.addedAt,
    });
  });
}

export async function deleteBook(id: BookId): Promise<void> {
  await db.transaction('rw', [db.books, db.epubFiles, db.positions], async () => {
    await db.books.delete(id);
    await db.epubFiles.delete(id);
    await db.positions.delete(id);
  });
}

export async function updateLastOpened(id: BookId): Promise<void> {
  await db.books.update(id, { lastOpenedAt: Date.now() });
}

export async function getEpubData(id: BookId): Promise<ArrayBuffer | undefined> {
  const record = await db.epubFiles.get(id);
  return record?.data;
}
