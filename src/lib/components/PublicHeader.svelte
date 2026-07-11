<script lang="ts">
  import { Copy, Globe } from 'lucide-svelte';
  import type { Page } from '$lib/db';

  let {
    page,
    onDuplicate
  }: {
    page: Page;
    onDuplicate: () => void;
  } = $props();
</script>

<header class="sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
  <div class="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
    <div class="flex items-center gap-3 min-w-0">
      {#if page.icon}
        <span class="text-2xl leading-none shrink-0">{page.icon}</span>
      {/if}
      <h1 class="text-lg font-semibold truncate text-neutral-800 dark:text-neutral-100">{page.title || 'Untitled'}</h1>
      <span class="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium shrink-0">
        <Globe size={10} />
        Public
      </span>
    </div>

    <button
      onclick={onDuplicate}
      class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors shrink-0"
    >
      <Copy size={14} />
      <span class="hidden sm:inline">Duplicate to workspace</span>
      <span class="sm:hidden">Duplicate</span>
    </button>
  </div>
</header>
