<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { pagesStore } from '$lib/stores/pages.svelte';
  import Editor from '$lib/components/Editor.svelte';
  import type { JSONContent } from '@tiptap/core';
  import { Globe, Lock, Smile } from 'lucide-svelte';

  const id = $derived($page.params.id);
  const currentPage = $derived(pagesStore.getById(id));

  // Title editing
  let titleEl: HTMLDivElement = $state() as HTMLDivElement;
  let saveTitleTimer: ReturnType<typeof setTimeout>;

  function onTitleInput(e: Event) {
    const text = (e.target as HTMLDivElement).innerText;
    clearTimeout(saveTitleTimer);
    saveTitleTimer = setTimeout(() => {
      pagesStore.updatePage(id, { title: text.trim() || 'Untitled' });
    }, 400);
  }

  function onTitleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Focus the editor on Enter from title
      const editorEl = document.querySelector('.ProseMirror') as HTMLElement | null;
      editorEl?.focus();
    }
  }

  async function handleContentUpdate(content: JSONContent) {
    await pagesStore.updateContent(id, content);
  }

  async function togglePublic() {
    const publicId = await pagesStore.togglePublic(id);
    if (publicId) {
      const url = `${window.location.origin}/p/${publicId}`;
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  // Emoji picker (simple prompt for now)
  async function changeIcon() {
    const icon = window.prompt('Enter an emoji for the page icon:', currentPage?.icon ?? '');
    if (icon !== null && currentPage) {
      await pagesStore.updatePage(id, { icon: icon.trim().slice(0, 2) });
    }
  }
</script>

{#if !pagesStore.initialized}
  <div class="flex items-center justify-center min-h-screen">
    <div class="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else if !currentPage}
  <div class="flex flex-col items-center justify-center min-h-screen gap-4">
    <div class="text-5xl">🔍</div>
    <p class="text-neutral-500 dark:text-neutral-400 text-sm">Page not found</p>
    <a href="/" class="text-sm text-violet-600 hover:underline">← Back to home</a>
  </div>
{:else}
  <div class="min-h-screen">
    <!-- Toolbar -->
    <div class="sticky top-0 z-20 flex items-center justify-end gap-2 px-6 py-2 border-b border-neutral-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
      <button
        onclick={togglePublic}
        class="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors {currentPage.isPublic
          ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50'
          : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}"
        title={currentPage.isPublic ? 'Click to make private' : 'Click to share publicly'}
      >
        {#if currentPage.isPublic}
          <Globe size={13} />
          Public · Copy link
        {:else}
          <Lock size={13} />
          Private
        {/if}
      </button>
    </div>

    <!-- Page header -->
    <div class="px-[96px] pt-16 pb-2 max-w-4xl mx-auto">
      <!-- Icon -->
      <button
        onclick={changeIcon}
        class="text-5xl leading-none mb-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg p-1 -ml-1 transition-colors inline-block"
        title="Change icon"
        aria-label="Change page icon"
      >
        {currentPage.icon || '📄'}
      </button>

      <!-- Title -->
      <div
        bind:this={titleEl}
        contenteditable="true"
        class="text-4xl font-bold outline-none text-neutral-900 dark:text-neutral-100 leading-tight mb-1 empty:before:content-['Untitled'] empty:before:text-neutral-300 dark:empty:before:text-neutral-600 cursor-text"
        oninput={onTitleInput}
        onkeydown={onTitleKeydown}
        role="textbox"
        tabindex="0"
        aria-label="Page title"
        aria-multiline="false"
        spellcheck="false"
      >{currentPage.title}</div>
    </div>

    <!-- TipTap editor -->
    <Editor
      content={currentPage.content}
      onUpdate={handleContentUpdate}
      editable={true}
    />
  </div>
{/if}
