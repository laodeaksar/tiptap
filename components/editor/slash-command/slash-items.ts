import type { Editor, Range } from "@tiptap/react"
import type { LucideIcon } from "lucide-react"
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code2,
  Quote,
  Minus,
  Type,
  Bold,
  Italic,
} from "lucide-react"

export interface SlashItem {
  title: string
  description: string
  icon: LucideIcon
  keywords: string[]
  group: string
  command: (editor: Editor, range: Range) => void
}

export const SLASH_ITEMS: SlashItem[] = [
  {
    title: "Text",
    description: "Plain paragraph",
    icon: Type,
    keywords: ["text", "paragraph", "p"],
    group: "Basic Blocks",
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: Heading1,
    keywords: ["h1", "heading", "title", "large"],
    group: "Basic Blocks",
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: Heading2,
    keywords: ["h2", "heading", "subtitle", "medium"],
    group: "Basic Blocks",
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: Heading3,
    keywords: ["h3", "heading", "small"],
    group: "Basic Blocks",
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    title: "Bold",
    description: "Make text bold",
    icon: Bold,
    keywords: ["bold", "strong", "b"],
    group: "Inline",
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBold().run(),
  },
  {
    title: "Italic",
    description: "Make text italic",
    icon: Italic,
    keywords: ["italic", "em", "i"],
    group: "Inline",
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleItalic().run(),
  },
  {
    title: "Bullet List",
    description: "Unordered list",
    icon: List,
    keywords: ["bullet", "list", "ul", "unordered"],
    group: "Lists",
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Ordered numbered list",
    icon: ListOrdered,
    keywords: ["numbered", "list", "ol", "ordered"],
    group: "Lists",
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Task List",
    description: "Checklist with checkboxes",
    icon: CheckSquare,
    keywords: ["task", "todo", "check", "checkbox"],
    group: "Lists",
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: "Code Block",
    description: "Fenced code with syntax",
    icon: Code2,
    keywords: ["code", "codeblock", "pre", "snippet"],
    group: "Advanced",
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Quote",
    description: "Highlighted blockquote",
    icon: Quote,
    keywords: ["quote", "blockquote", "cite"],
    group: "Advanced",
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Divider",
    description: "Horizontal separator line",
    icon: Minus,
    keywords: ["divider", "hr", "horizontal", "rule", "separator"],
    group: "Advanced",
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
]

export function filterSlashItems(query: string): SlashItem[] {
  if (!query) return SLASH_ITEMS
  const q = query.toLowerCase()
  return SLASH_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.includes(q))
  )
}

export const SLASH_GROUPS = [
  "Basic Blocks",
  "Inline",
  "Lists",
  "Advanced",
] as const
