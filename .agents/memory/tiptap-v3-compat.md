---
name: Tiptap v3 breaking changes
description: Named export requirements and removed APIs in Tiptap v3 (used in this project)
---

## Key breaking changes in Tiptap v3 (vs v2)

**Why:** This project uses Tiptap v3 (^3.27.x). v3 changed exports and removed the BubbleMenu React wrapper.

**How to apply:** Whenever adding or editing Tiptap-related code, use the patterns below.

### Named exports required (no default export)

- `@tiptap/extension-text-style` → `import { TextStyle } from "@tiptap/extension-text-style"`
- `@tiptap/react` → NO default export; use `import { useEditor, EditorContent } from "@tiptap/react"`

### BubbleMenu removed from @tiptap/react

`BubbleMenu` is NOT a React component in v3 — it's a Tiptap Extension only.
`import { BubbleMenu } from "@tiptap/extension-bubble-menu"` gives you the extension, not a React component.

**Fix:** Use a custom floating toolbar via `createPortal` + `editor.on('selectionUpdate')` + `view.coordsAtPos()`.
See `components/editor/editor.tsx` for the working implementation.

### StarterKit v3 bundles Link extension

StarterKit v3 includes `link` by default — adding a standalone `Link` extension causes duplicate warning.
**Fix:** Disable in StarterKit: `StarterKit.configure({ link: false })` then use standalone `Link.configure(...)`.

### Suggestion API

`@tiptap/suggestion` exports: `Suggestion` (named + default), `SuggestionPluginKey`, `findSuggestionMatch`, `exitSuggestion`.
Use `import Suggestion from "@tiptap/suggestion"` — default export works fine.

### Extension import summary (all confirmed working)

```ts
import StarterKit from "@tiptap/starter-kit"                    // default ✓
import Placeholder from "@tiptap/extension-placeholder"          // default ✓
import TaskList from "@tiptap/extension-task-list"               // default ✓
import TaskItem from "@tiptap/extension-task-item"               // default ✓
import Link from "@tiptap/extension-link"                        // default ✓
import CodeBlock from "@tiptap/extension-code-block"             // default ✓
import Blockquote from "@tiptap/extension-blockquote"            // default ✓
import Heading from "@tiptap/extension-heading"                  // default ✓
import HorizontalRule from "@tiptap/extension-horizontal-rule"   // default ✓
import { TextStyle } from "@tiptap/extension-text-style"         // NAMED only ✓
import Color from "@tiptap/extension-color"                      // default ✓
import { useEditor, EditorContent } from "@tiptap/react"         // NAMED only ✓
```
