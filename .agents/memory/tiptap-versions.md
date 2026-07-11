---
name: TipTap + SvelteKit version compatibility
description: Which TipTap and vite-plugin-svelte versions work together with Vite 6
---

## Rule
- **Vite 8** → `@sveltejs/vite-plugin-svelte@^7` (v5 only supports Vite 6, throws AggregateError scanning deps under Vite 8)
- **TipTap v3** → There is **no** `@tiptap/svelte` package on npm. Use `@tiptap/core` directly with the `Editor` class. All extension packages (`@tiptap/starter-kit`, `@tiptap/extension-*`, `@tiptap/suggestion`) are pinned to `3.27.1`.
- **`lucide-svelte`** deprecated at `0.488.0`. New package is `lucide-svelte@^1.0` (or `@lucide/svelte`).

**Why:** `@sveltejs/vite-plugin-svelte@5` uses esbuildOptions which Vite 8 deprecated (switched to rolldownOptions); v7 is the compatible build. `@tiptap/svelte` never shipped as a public npm package — TipTap Svelte integration is done via `Editor` from `@tiptap/core`.

**How to apply:** For Vite 8 + SvelteKit + TipTap 3.x: use `@sveltejs/vite-plugin-svelte@^7`, import `Editor` from `@tiptap/core`, no Svelte-specific TipTap wrapper needed.
