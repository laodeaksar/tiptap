<script lang="ts">
  import { Editor, type JSONContent } from '@tiptap/core';
  import { getExtensions } from '$lib/tiptap/editor';
  import SlashMenu from './SlashMenu.svelte';
  import BlockHandle from './BlockHandle.svelte';

  let {
    content,
    onUpdate,
    editable = true
  }: {
    content: JSONContent;
    onUpdate?: (content: JSONContent) => void;
    editable?: boolean;
  } = $props();

  let container: HTMLDivElement;
  let editor: Editor | null = $state(null);

  // Bubble menu state
  let bubbleVisible = $state(false);
  let bubbleX = $state(0);
  let bubbleY = $state(0);
  let isBold = $state(false);
  let isItalic = $state(false);
  let isUnderline = $state(false);

  let saveTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    if (!container) return;

    const e = new Editor({
      element: container,
      extensions: getExtensions(editable),
      content,
      editable,
      onUpdate: ({ editor: ed }) => {
        if (!editable) return;
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => onUpdate?.(ed.getJSON()), 500);
      },
      onSelectionUpdate: ({ editor: ed }) => {
        if (!editable) return;
        const { empty, from } = ed.state.selection;
        if (!empty) {
          const coords = ed.view.coordsAtPos(from);
          // Position above the selection
          bubbleX = coords.left;
          bubbleY = coords.top - 44;
          isBold = ed.isActive('bold');
          isItalic = ed.isActive('italic');
          isUnderline = ed.isActive('underline');
          bubbleVisible = true;
        } else {
          bubbleVisible = false;
        }
      },
      onBlur: () => {
        setTimeout(() => { bubbleVisible = false; }, 150);
      }
    });

    editor = e;

    return () => {
      clearTimeout(saveTimer);
      e.destroy();
      editor = null;
    };
  });

  function toggleBold() { editor?.chain().focus().toggleBold().run(); }
  function toggleItalic() { editor?.chain().focus().toggleItalic().run(); }
  function toggleUnderline() { editor?.chain().focus().toggleUnderline().run(); }
  function setLink() {
    const prev = editor?.getAttributes('link').href ?? '';
    const url = window.prompt('Link URL (leave empty to remove):', prev);
    if (url === null) return; // cancelled
    if (url === '') {
      editor?.chain().focus().unsetLink().run();
    } else {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }
</script>

<div class="relative">
  <!-- TipTap mounts here -->
  <div bind:this={container} class="notion-editor px-[96px] py-8 max-w-4xl mx-auto outline-none text-[15px] leading-[1.75]"></div>

  <!-- Bubble menu -->
  {#if bubbleVisible && editable}
    <div
      class="bubble-menu fixed z-50 flex items-center bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl overflow-hidden"
      style="left: {bubbleX}px; top: {bubbleY}px;"
      onmousedown={(e) => e.preventDefault()}
      role="toolbar"
      aria-label="Text formatting"
    >
      <button
        onclick={toggleBold}
        class="px-2.5 py-1.5 text-sm font-bold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors {isBold ? 'bg-neutral-100 dark:bg-neutral-700 text-violet-600 dark:text-violet-400' : 'text-neutral-700 dark:text-neutral-200'}"
        title="Bold (Ctrl+B)"
      >B</button>
      <button
        onclick={toggleItalic}
        class="px-2.5 py-1.5 text-sm italic hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors {isItalic ? 'bg-neutral-100 dark:bg-neutral-700 text-violet-600 dark:text-violet-400' : 'text-neutral-700 dark:text-neutral-200'}"
        title="Italic (Ctrl+I)"
      >I</button>
      <button
        onclick={toggleUnderline}
        class="px-2.5 py-1.5 text-sm underline hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors {isUnderline ? 'bg-neutral-100 dark:bg-neutral-700 text-violet-600 dark:text-violet-400' : 'text-neutral-700 dark:text-neutral-200'}"
        title="Underline (Ctrl+U)"
      >U</button>
      <div class="w-px h-4 bg-neutral-200 dark:bg-neutral-600 mx-0.5"></div>
      <button
        onclick={setLink}
        class="px-2.5 py-1.5 text-sm text-blue-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        title="Link"
      >Link</button>
    </div>
  {/if}

  <!-- Slash command menu (rendered globally via store) -->
  {#if editable}
    <SlashMenu />
    <BlockHandle {editor} />
  {/if}
</div>
