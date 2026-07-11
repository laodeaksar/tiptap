import {
  getAllPages,
  savePage,
  deletePage,
  seedDefaultPages,
  type Page
} from '$lib/db';
import { nanoid } from 'nanoid';
import type { JSONContent } from '@tiptap/core';

class PagesStore {
  pages = $state<Page[]>([]);
  initialized = $state(false);
  loading = $state(false);

  async init() {
    if (this.initialized) return;
    this.loading = true;
    await seedDefaultPages();
    this.pages = await getAllPages();
    this.initialized = true;
    this.loading = false;
  }

  /** Root pages or children of a parent */
  childrenOf(parentId: string | null): Page[] {
    return this.pages
      .filter((p) => p.parentId === parentId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  getById(id: string): Page | undefined {
    return this.pages.find((p) => p.id === id);
  }

  getByPublicId(publicId: string): Page | undefined {
    return this.pages.find((p) => p.publicId === publicId && p.isPublic);
  }

  async createPage(parentId: string | null = null): Promise<Page> {
    const page: Page = {
      id: nanoid(),
      title: 'Untitled',
      icon: '📄',
      cover: '',
      parentId,
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      isPublic: false,
      publicId: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await savePage(page);
    this.pages = [...this.pages, page];
    return page;
  }

  async updatePage(id: string, updates: Partial<Page>): Promise<void> {
    const page = this.pages.find((p) => p.id === id);
    if (!page) return;
    const updated: Page = { ...page, ...updates, updatedAt: Date.now() };
    await savePage(updated);
    this.pages = this.pages.map((p) => (p.id === id ? updated : p));
  }

  async updateContent(id: string, content: JSONContent): Promise<void> {
    await this.updatePage(id, { content });
  }

  async deletePage(id: string): Promise<void> {
    // Recursively delete children first
    const children = this.pages.filter((p) => p.parentId === id);
    for (const child of children) {
      await this.deletePage(child.id);
    }
    await deletePage(id);
    this.pages = this.pages.filter((p) => p.id !== id);
  }

  async togglePublic(id: string): Promise<string | null> {
    const page = this.pages.find((p) => p.id === id);
    if (!page) return null;
    const isPublic = !page.isPublic;
    const publicId = isPublic ? (page.publicId || nanoid(12)) : page.publicId;
    await this.updatePage(id, { isPublic, publicId });
    return isPublic ? publicId : null;
  }

  async setParent(id: string, parentId: string | null): Promise<void> {
    await this.updatePage(id, { parentId });
  }

  async duplicatePage(sourceId: string): Promise<Page> {
    const src = this.pages.find((p) => p.id === sourceId);
    if (!src) throw new Error('Source page not found');
    const newPage: Page = {
      ...src,
      id: nanoid(),
      title: src.title + ' (copy)',
      isPublic: false,
      publicId: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await savePage(newPage);
    this.pages = [...this.pages, newPage];
    return newPage;
  }
}

export const pagesStore = new PagesStore();
