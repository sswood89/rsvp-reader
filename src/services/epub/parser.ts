import ePub, { Book, NavItem } from 'epubjs';
import { BookMetadata, Chapter, BookId } from '@/lib/types/book';

export interface ParsedEpub {
  metadata: BookMetadata;
  chapters: Chapter[];
  book: Book;
}

function generateId(): BookId {
  return `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function extractCover(book: Book): Promise<string | undefined> {
  try {
    const coverUrl = await book.coverUrl();
    return coverUrl || undefined;
  } catch {
    return undefined;
  }
}

function flattenNavItems(items: NavItem[], result: NavItem[] = []): NavItem[] {
  for (const item of items) {
    result.push(item);
    if (item.subitems && item.subitems.length > 0) {
      flattenNavItems(item.subitems, result);
    }
  }
  return result;
}

export async function parseEpub(data: ArrayBuffer): Promise<ParsedEpub> {
  const book = ePub(data);
  await book.ready;

  const metadata = await book.loaded.metadata;
  const navigation = await book.loaded.navigation;
  const spine = book.spine as unknown as { items: Array<{ href: string; index: number }> };

  const coverUrl = await extractCover(book);

  const navItems = flattenNavItems(navigation.toc);

  const chapters: Chapter[] = spine.items.map((spineItem, index) => {
    const navItem = navItems.find((nav) => {
      const navHref = nav.href.split('#')[0];
      return navHref === spineItem.href || spineItem.href.endsWith(navHref);
    });

    return {
      id: `chapter_${index}`,
      index,
      href: spineItem.href,
      title: navItem?.label?.trim() || `Chapter ${index + 1}`,
      wordCount: 0,
    };
  });

  const bookMetadata: BookMetadata = {
    id: generateId(),
    title: metadata.title || 'Untitled',
    author: metadata.creator || 'Unknown Author',
    coverUrl,
    addedAt: Date.now(),
    fileSize: data.byteLength,
    totalChapters: chapters.length,
  };

  return {
    metadata: bookMetadata,
    chapters,
    book,
  };
}

export async function loadEpubFromData(data: ArrayBuffer): Promise<Book> {
  const book = ePub(data);
  await book.ready;
  return book;
}
