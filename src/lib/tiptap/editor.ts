import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Suggestion from '@tiptap/suggestion';
import { createLowlight, common } from 'lowlight';
import { slashMenuStore } from '$lib/stores/slash-menu.svelte';
import { SLASH_COMMANDS, type SlashCommand } from './commands';

const lowlight = createLowlight(common);

/** Slash command extension using @tiptap/suggestion */
const SlashCommand = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        allowSpaces: false,
        startOfLine: false,
        command: ({ editor, range, props }: { editor: any; range: any; props: SlashCommand }) => {
          // Delete the '/' + query text, then execute the chosen command
          editor.chain().focus().deleteRange(range).run();
          props.execute(editor);
        },
        items: ({ query }: { query: string }) => {
          if (!query) return SLASH_COMMANDS;
          const q = query.toLowerCase();
          return SLASH_COMMANDS.filter(
            (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
          );
        },
        render: () => ({
          onStart(props: any) {
            slashMenuStore.open({
              query: props.query,
              command: props.command,
              clientRect: props.clientRect
            });
          },
          onUpdate(props: any) {
            slashMenuStore.update({
              query: props.query,
              command: props.command,
              clientRect: props.clientRect
            });
          },
          onKeyDown(props: any): boolean {
            return slashMenuStore.handleKey(props.event);
          },
          onExit() {
            slashMenuStore.close();
          }
        })
      })
    ];
  }
});

export function getExtensions(editable = true) {
  return [
    StarterKit.configure({
      codeBlock: false // replaced by CodeBlockLowlight
    }),
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') return 'Heading';
        return "Type '/' for commands";
      },
      showOnlyCurrent: true
    }),
    Link.configure({
      openOnClick: !editable,
      HTMLAttributes: { class: 'text-blue-500 underline cursor-pointer' }
    }),
    Image.configure({ inline: false, allowBase64: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    TaskList,
    TaskItem.configure({ nested: true }),
    CodeBlockLowlight.configure({ lowlight }),
    HorizontalRule,
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ...(editable ? [SlashCommand] : [])
  ];
}
