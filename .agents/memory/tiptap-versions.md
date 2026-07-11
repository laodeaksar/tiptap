---
name: TipTap + SvelteKit version compatibility
description: Which TipTap and vite-plugin-svelte versions work together with Vite 6
---

## Rule
Use `@sveltejs/vite-plugin-svelte@^5` (not v4) when Vite 6 is present. TipTap v3 packages exist on npm but pair with `@tiptap/svelte` which has incomplete Svelte 5 support — use TipTap v2.x (`^2.11`) for stable Svelte 5 integration.

**Why:** `@sveltejs/vite-plugin-svelte@4` declares `peer vite@"^5.0.0"` and breaks under Vite 6. TipTap v3 is released but the Svelte adapter lags behind.

**How to apply:** When setting up TipTap + SvelteKit, pin `@sveltejs/vite-plugin-svelte@^5` and TipTap `^2.11`. Upgrade TipTap to v3 once `@tiptap/svelte` publishes stable Svelte 5 runes support.
