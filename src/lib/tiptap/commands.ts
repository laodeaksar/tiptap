import type { Editor } from '@tiptap/core';

export interface SlashCommand {
  id: string;
  title: string;
  description: string;
  icon: string;
  execute: (editor: Editor) => void;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: 'h1',
    title: 'Heading 1',
    description: 'Large section heading',
    icon: 'H1',
    execute: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run()
  },
  {
    id: 'h2',
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: 'H2',
    execute: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run()
  },
  {
    id: 'h3',
    title: 'Heading 3',
    description: 'Small section heading',
    icon: 'H3',
    execute: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run()
  },
  {
    id: 'bullet',
    title: 'Bullet List',
    description: 'Unordered list',
    icon: '•',
    execute: (editor) => editor.chain().focus().toggleBulletList().run()
  },
  {
    id: 'number',
    title: 'Numbered List',
    description: 'Ordered list',
    icon: '1.',
    execute: (editor) => editor.chain().focus().toggleOrderedList().run()
  },
  {
    id: 'todo',
    title: 'To-do List',
    description: 'Checkboxes for tasks',
    icon: '☑',
    execute: (editor) => editor.chain().focus().toggleTaskList().run()
  },
  {
    id: 'quote',
    title: 'Quote',
    description: 'Capture a quote',
    icon: '"',
    execute: (editor) => editor.chain().focus().toggleBlockquote().run()
  },
  {
    id: 'code',
    title: 'Code Block',
    description: 'Code with syntax highlighting',
    icon: '</>',
    execute: (editor) => editor.chain().focus().toggleCodeBlock().run()
  },
  {
    id: 'table',
    title: 'Table',
    description: 'Insert a table',
    icon: '⊞',
    execute: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  },
  {
    id: 'image',
    title: 'Image',
    description: 'Embed an image by URL',
    icon: '🖼',
    execute: (editor) => {
      const url = window.prompt('Image URL:');
      if (url) editor.chain().focus().setImage({ src: url }).run();
    }
  },
  {
    id: 'divider',
    title: 'Divider',
    description: 'Visual horizontal line',
    icon: '—',
    execute: (editor) => editor.chain().focus().setHorizontalRule().run()
  }
];
