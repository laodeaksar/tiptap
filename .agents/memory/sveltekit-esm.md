---
name: SvelteKit ESM setup
description: SvelteKit projects must declare ESM to avoid vite.config.ts load failure
---

## Rule
Always add `"type": "module"` to `package.json` in any SvelteKit project.

**Why:** `vite.config.ts` imports from `@sveltejs/kit/vite` which is ESM-only. Without `"type":"module"`, Node tries to load the config via `require()` and throws a fatal error before Vite even starts.

**How to apply:** When scaffolding a new SvelteKit project or importing one, check `package.json` for `"type": "module"` before running the dev server. If missing, add it.
