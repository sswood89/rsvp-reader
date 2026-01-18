import { Book } from 'epubjs';

interface SpineItem {
  href: string;
  url: string;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  load: (request: any) => Promise<Document>;
}

export async function extractChapterText(
  book: Book,
  chapterHref: string
): Promise<string> {
  const spine = book.spine as unknown as {
    get: (target: string | number) => SpineItem | undefined;
    items: SpineItem[];
  };

  // Find the section
  let section: SpineItem | undefined = spine.get(chapterHref);

  if (!section && spine.items) {
    section = spine.items.find((item) => {
      const itemHref = item.href || '';
      return (
        itemHref === chapterHref ||
        itemHref.endsWith(chapterHref) ||
        chapterHref.endsWith(itemHref)
      );
    });
  }

  // Try by index
  if (!section) {
    const idx = parseInt(chapterHref, 10);
    if (!isNaN(idx) && spine.items?.[idx]) {
      section = spine.items[idx];
    }
  }

  if (!section) {
    return '';
  }

  try {
    const doc = await section.load(book.load.bind(book));

    if (!doc) {
      return '';
    }

    let body: HTMLElement | null = null;

    // Try standard Document interface
    if (doc instanceof Document) {
      body = doc.body;
    }
    // epub.js may return the document wrapped differently
    else if (doc && typeof doc === 'object') {
      const d = doc as unknown as {
        body?: HTMLElement;
        documentElement?: HTMLElement;
        contents?: { body?: HTMLElement; documentElement?: HTMLElement };
        document?: Document;
      };

      // Check various possible structures
      if (d.body) {
        body = d.body;
      } else if (d.documentElement) {
        body = d.documentElement;
      } else if (d.contents?.body) {
        body = d.contents.body;
      } else if (d.document?.body) {
        body = d.document.body;
      } else {
        // Last resort: check if doc itself is the HTML element
        const el = doc as unknown as HTMLElement;
        if (el.textContent !== undefined && typeof el.querySelectorAll === 'function') {
          body = el;
        }
      }
    }

    if (!body) {
      return '';
    }

    const clone = body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('script, style, noscript').forEach(el => el.remove());

    const text = clone.textContent || '';
    return text.replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}

export async function extractAllChaptersText(book: Book): Promise<Map<string, string>> {
  const textMap = new Map<string, string>();
  const spine = book.spine as unknown as { items: Array<{ href: string }> };

  if (!spine.items) {
    return textMap;
  }

  for (const item of spine.items) {
    try {
      const text = await extractChapterText(book, item.href);
      textMap.set(item.href, text);
    } catch {
      textMap.set(item.href, '');
    }
  }

  return textMap;
}
