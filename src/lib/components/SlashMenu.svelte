<script lang="ts">
  import { slashMenuStore } from '$lib/stores/slash-menu.svelte';

  // Close when clicking outside
  function onWindowClick(e: MouseEvent) {
    if (!(e.target as Element)?.closest('.slash-menu')) {
      slashMenuStore.close();
    }
  }
</script>

<svelte:window onclick={onWindowClick} />

{#if slashMenuStore.visible}
  <div
    class="slash-menu fixed z-50 w-60 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl overflow-hidden"
    style="left: {slashMenuStore.x}px; top: {slashMenuStore.y}px;"
    role="listbox"
    aria-label="Commands"
  >
    <div class="px-3 py-2 border-b border-neutral-100 dark:border-neutral-700">
      <span class="text-xs text-neutral-400 font-medium uppercase tracking-wide">Blocks</span>
    </div>

    {#if slashMenuStore.items.length === 0}
      <div class="px-3 py-3 text-sm text-neutral-400">No results for "{slashMenuStore.query}"</div>
    {:else}
      <div class="py-1 max-h-72 overflow-y-auto">
        {#each slashMenuStore.items as item, i}
          <button
            class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors {i === slashMenuStore.selectedIndex ? 'bg-neutral-100 dark:bg-neutral-700' : ''}"
            onclick={() => slashMenuStore.select(item)}
            role="option"
            aria-selected={i === slashMenuStore.selectedIndex}
          >
            <span class="w-8 h-8 flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded text-sm font-mono font-bold shrink-0 text-neutral-600 dark:text-neutral-300">
              {item.icon}
            </span>
            <div class="min-w-0">
              <div class="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">{item.title}</div>
              <div class="text-xs text-neutral-400 truncate">{item.description}</div>
            </div>
          </button>
        {/each}
      </div>
    {/if}

    <div class="px-3 py-1.5 border-t border-neutral-100 dark:border-neutral-700 flex items-center gap-2 text-xs text-neutral-400">
      <kbd class="font-mono bg-neutral-100 dark:bg-neutral-700 px-1 rounded">↑↓</kbd> navigate
      <kbd class="font-mono bg-neutral-100 dark:bg-neutral-700 px-1 rounded">↵</kbd> select
      <kbd class="font-mono bg-neutral-100 dark:bg-neutral-700 px-1 rounded">Esc</kbd> close
    </div>
  </div>
{/if}
