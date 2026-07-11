<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { pagesStore } from '$lib/stores/pages.svelte';
  import PublicHeader from '$lib/components/PublicHeader.svelte';
  import Editor from '$lib/components/Editor.svelte';
  import { onMount } from 'svelte';

  const publicId = $derived($page.params.id);
  let publicPage = $state<ReturnType<typeof pagesStore.getByPublicId>>(undefined);
  let duplicating = $state(false);

  $effect(() => {
    if (pagesStore.initialized) {
      publicPage = pagesStore.getByPublicId(publicId);
    }
  });

  async function duplicate() {
    if (!publicPage || duplicating) return;
    duplicating = true;
    try {
      const newPage = await pagesStore.duplicatePage(publicPage.id);
      goto(`/doc/${newPage.id}`);
    } finally {
      duplicating = false;
    }
  }
</script>

<svelte:head>
  {#if publicPage}
    <title>{publicPage.title || 'Untitled'} · Notion Clone</title>
  {:else}
    <title>Page not found · Notion Clone</title>
  {/if}
</svelte:head>

{#if !pagesStore.initialized}
  <div class="flex items-center justify-center min-h-screen">
    <div class="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else if !publicPage}
  <div class="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
    <div class="text-6xl">🔒</div>
    <h1 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Page not found</h1>
    <p class="text-neutral-500 dark:text-neutral-400 text-sm">This page is private or doesn't exist.</p>
    <a href="/" class="text-sm text-violet-600 hover:underline mt-2">Go to workspace →</a>
  </div>
{:else}
  <!-- Public header with duplicate button -->
  <PublicHeader page={publicPage} onDuplicate={duplicate} />

  <!-- Read-only editor -->
  <div class="min-h-screen">
    <div class="px-[96px] pt-12 pb-4 max-w-4xl mx-auto">
      <div class="text-5xl leading-none mb-3">{publicPage.icon || '📄'}</div>
      <h1 class="text-4xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight mb-1">
        {publicPage.title || 'Untitled'}
      </h1>
    </div>

    <Editor
      content={publicPage.content}
      editable={false}
    />
  </div>

  {#if duplicating}
    <div class="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div class="bg-white dark:bg-neutral-800 rounded-xl px-6 py-4 shadow-xl flex items-center gap-3">
        <div class="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm font-medium text-neutral-700 dark:text-neutral-200">Duplicating page…</span>
      </div>
    </div>
  {/if}
{/if}
