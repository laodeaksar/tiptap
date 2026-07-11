import { openDB, type IDBPDatabase } from 'idb';
import { nanoid } from 'nanoid';
import type { JSONContent } from '@tiptap/core';

export interface Page {
  id: string;
  title: string;
  icon: string;
  cover: string;
  parentId: string | null;
  content: JSONContent;
  isPublic: boolean;
  publicId: string;
  createdAt: number;
  updatedAt: number;
}

const DB_NAME = 'notion-clone';
const DB_VERSION = 1;

let db: IDBPDatabase | null = null;

export async function getDB(): Promise<IDBPDatabase> {
  if (db) return db;

  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('pages')) {
        const store = database.createObjectStore('pages', { keyPath: 'id' });
        store.createIndex('parentId', 'parentId');
        store.createIndex('publicId', 'publicId', { unique: false });
      }
    }
  });

  return db;
}

export async function getAllPages(): Promise<Page[]> {
  const database = await getDB();
  return database.getAll('pages');
}

export async function getPageById(id: string): Promise<Page | undefined> {
  const database = await getDB();
  return database.get('pages', id);
}

export async function getPageByPublicId(publicId: string): Promise<Page | undefined> {
  const database = await getDB();
  const all = await database.getAll('pages');
  return all.find((p: Page) => p.publicId === publicId && p.isPublic);
}

export async function savePage(page: Page): Promise<void> {
  const database = await getDB();
  await database.put('pages', page);
}

export async function deletePage(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('pages', id);
}

export async function seedDefaultPages(): Promise<void> {
  const database = await getDB();
  const count = await database.count('pages');
  if (count > 0) return;

  const now = Date.now();
  const defaults: Page[] = [
    {
      id: nanoid(),
      title: 'Getting Started',
      icon: '🚀',
      cover: '',
      parentId: null,
      content: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Welcome to Notion Clone!' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'This is your workspace. Start writing, or use ' }, { type: 'text', marks: [{ type: 'code' }], text: '/' }, { type: 'text', text: ' for block commands.' }] },
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Quick Tips' }] },
          { type: 'bulletList', content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Type ' }, { type: 'text', marks: [{ type: 'bold' }], text: '/' }, { type: 'text', text: ' to open the command menu' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hover over a block to see the drag handle' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Use Ctrl+K to search pages' }] }] }
          ]}
        ]
      },
      isPublic: false,
      publicId: '',
      createdAt: now,
      updatedAt: now
    },
    {
      id: nanoid(),
      title: 'My Notes',
      icon: '📝',
      cover: '',
      parentId: null,
      content: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'My Notes' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Start writing your notes here...' }] }
        ]
      },
      isPublic: false,
      publicId: '',
      createdAt: now - 1000,
      updatedAt: now - 1000
    },
    {
      id: nanoid(),
      title: 'Project Ideas',
      icon: '💡',
      cover: '',
      parentId: null,
      content: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Project Ideas' }] },
          { type: 'taskList', content: [
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Build a SvelteKit app' }] }] },
            { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Learn TipTap editor' }] }] },
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ship something cool' }] }] }
          ]}
        ]
      },
      isPublic: false,
      publicId: '',
      createdAt: now - 2000,
      updatedAt: now - 2000
    }
  ];

  for (const page of defaults) {
    await database.put('pages', page);
  }
}

// --- Supabase adapter stub (wire up when ready) ---
export const supabaseAdapter = {
  async getAll(): Promise<Page[]> {
    throw new Error('Supabase adapter not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  },
  async get(_id: string): Promise<Page | undefined> {
    throw new Error('Supabase adapter not configured.');
  },
  async save(_page: Page): Promise<void> {
    throw new Error('Supabase adapter not configured.');
  },
  async remove(_id: string): Promise<void> {
    throw new Error('Supabase adapter not configured.');
  }
};
