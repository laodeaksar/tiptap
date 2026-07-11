# Notion Clone

A Notion-like workspace app built with SvelteKit, TipTap, and IndexedDB.

## Tech Stack

- **Framework**: SvelteKit 2 + Svelte 5 (Runes: `$state`, `$derived`, `$effect`, `$props`)
- **Build**: Vite 6
- **Styling**: TailwindCSS v4 with `@theme` and `@custom-variant dark`
- **Editor**: TipTap 2 (`@tiptap/core`) with rich extensions
- **Icons**: lucide-svelte
- **Drag & Drop**: svelte-dnd-action (sidebar), custom ProseMirror DnD (editor blocks)
- **IDs**: nanoid
- **Storage**: IndexedDB via `idb` (offline-first). Supabase adapter stub in `src/lib/db.ts`

## Running

```bash
pnpm install
pnpm run dev
```

App runs on port 5000.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard — recent pages grid |
| `/doc/[id]` | Editor — TipTap with slash commands, block handles, auto-save |
| `/p/[id]` | Public share — read-only TipTap, duplicate button |

## Key Files

```
src/
  lib/
    db.ts                        → IndexedDB + Supabase adapter stub
    stores/
      pages.svelte.ts            → Pages CRUD ($state class)
      slash-menu.svelte.ts       → Slash menu state ($state class)
      theme.svelte.ts            → Dark mode toggle
    tiptap/
      commands.ts                → SLASH_COMMANDS definitions
      editor.ts                  → TipTap extensions + SlashCommand extension
    components/
      Sidebar.svelte             → Page tree, search, DnD reorder
      Editor.svelte              → TipTap instance + bubble menu
      SlashMenu.svelte           → Floating slash command palette
      BlockHandle.svelte         → Drag handle overlay per block
      PublicHeader.svelte        → Public page header + Duplicate button
  routes/
    +layout.svelte               → App shell (sidebar on /doc/*, /; none on /p/*)
    +page.svelte                 → Dashboard
    doc/[id]/+page.svelte        → Editor page
    p/[id]/+page.svelte          → Public read-only page
```

## Features

- **Offline-first** via IndexedDB — all data persists in browser
- **Slash commands** (`/h1`, `/bullet`, `/table`, `/code`, …) using TipTap Suggestion
- **Bubble menu** on text selection (Bold, Italic, Underline, Link)
- **Block drag handles** — hover to see ⠿ handle, drag to reorder
- **Auto-save** — 500ms debounce on every editor change
- **Dark mode** — class-based (`.dark` on `<html>`), toggle in sidebar
- **Public sharing** — toggle page public, generates `publicId`, shareable `/p/[id]` link
- **Duplicate** public pages into your own workspace
- **Search** — Ctrl+K overlay searches all pages
- **Nested pages** — create child pages in sidebar

## User Preferences

- Svelte 5 Runes only — no `writable` stores
- All CRUD functions are async
- Minimal but clear comments

## Deployment

- `vercel.json` added — deploys with SvelteKit's `adapter-auto` (already configured in `svelte.config.js`, detects Vercel automatically). Set `PUBLIC_CONVEX_URL` / `PUBLIC_CONVEX_SITE_URL` in the Vercel project's env vars (referenced as secrets in `vercel.json`).
- `pnpm run convex:dev` — run Convex dev deployment locally
- `pnpm run convex:deploy` — deploy Convex functions to production

## Setup Status

Project was left as imported per user request — dependencies are not yet installed and no dev server has been started. Convex is not connected (`.replit` has placeholder `PUBLIC_CONVEX_URL`/`PUBLIC_CONVEX_SITE_URL`). Run `pnpm install` and `npx convex dev` when ready to run the app.
