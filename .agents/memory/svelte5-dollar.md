---
name: Svelte 5 reserved $ prefix
description: Variables named $foo inside .svelte files are forbidden — rune-prefix collision
---

## Rule
Never name a variable with a `$` prefix inside `.svelte` or `.svelte.ts` files. This includes ProseMirror resolved-position variables commonly written as `$pos`, `$from`, `$to`.

**Why:** Svelte 5 treats `$identifier` as a rune reference. The compiler throws `dollar_prefix_invalid` and the page 500s.

**How to apply:** Rename ProseMirror `$pos` → `rpos`, `$from` → `rfrom`, etc., anywhere these appear in Svelte component files. Plain `.ts` files are unaffected.
