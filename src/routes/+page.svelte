<script lang="ts">
  import { goto } from '$app/navigation';
  import { pagesStore } from '$lib/stores/pages.svelte';
  import { Plus, FileText, Clock } from 'lucide-svelte';

  const recentPages = $derived(
    [...pagesStore.pages]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 9)
  );

  async function newPage() {
    const p = await pagesStore.createPage(null);
    goto(`/doc/${p.id}`);
  }

  function formatDate(ts: number) {
    const d = new Date(ts);
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
</script>

<div class="min-h-screen px-8 py-16 max-w-4xl mx-auto">
  <!-- Header -->
  <div class="mb-10">
    <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-1">Home</h1>
    <p class="text-neutral-500 dark:text-neutral-400 text-sm">Your workspace overview</p>
  </div>

  <!-- Quick actions -->
  <div class="mb-10 flex flex-wrap gap-3">
    <button
      onclick={newPage}
      class="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
    >
      <Plus size={16} />
      New page
    </button>
  </div>

  <!-- Recent pages -->
  {#if recentPages.length > 0}
    <section>
      <h2 class="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4">
        <Clock size={13} />
        Recently updated
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {#each recentPages as p (p.id)}
          <a
            href="/doc/{p.id}"
            class="group flex flex-col gap-1 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md transition-all bg-white dark:bg-neutral-800/50"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="text-2xl leading-none">{p.icon || '📄'}</span>
            </div>
            <span class="font-medium text-neutral-800 dark:text-neutral-100 text-sm truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {p.title || 'Untitled'}
            </span>
            <span class="text-xs text-neutral-400">{formatDate(p.updatedAt)}</span>
          </a>
        {/each}
      </div>
    </section>
  {:else if pagesStore.initialized}
    <!-- Empty state -->
    <div class="flex flex-col items-center justify-center py-24 text-center">
      <div class="text-6xl mb-4">📄</div>
      <h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">No pages yet</h3>
      <p class="text-sm text-neutral-400 mb-6">Create your first page to get started</p>
      <button
        onclick={newPage}
        class="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        <Plus size={16} />
        New page
      </button>
    </div>
  {:else}
    <div class="flex items-center justify-center py-24">
      <div class="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  {/if}
</div>
