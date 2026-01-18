export interface EpubFileRecord {
  id: string;
  data: ArrayBuffer;
  addedAt: number;
}

export const STORAGE_KEYS = {
  BOOKS: 'rsvp:books',
  POSITIONS: 'rsvp:reading-positions',
  PREFERENCES: 'rsvp:preferences',
} as const;
