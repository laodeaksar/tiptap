<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { dndzone, type DndEvent } from 'svelte-dnd-action';
  import {
    Plus, Search, Moon, Sun, Trash2, Globe, Lock,
    Copy, ChevronRight, ChevronDown, FilePlus, X, Link
  } from 'lucide-svelte';
  import { pagesStore } from '$lib/stores/pages.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import type { Page } from '$lib/db';

  let { onclose }: { onclose?: () => void } = $props();

  // ---- State ----
  let searchOpen = $state(false);
  let searchQuery = $state('');
  let expandedIds = $state(new Set<string>());
  let optionsOpen = $state<string | null>(null); // page id with open options
  let copiedId = $state<string | null>(null);

  // Flat array for DnD (root level)
  let rootItems = $state<Page[]>([]);
  $effect(() => {
    rootItems = pagesStore.childrenOf(null);
  });

  // Search results
  const searchResults = $derived(
    pagesStore.pages.filter(
      (p) =>
        searchQuery &&
        (p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.icon.includes(searchQuery))
    )
  );

  // Current page id
  const currentId = $derived($page.params.id ?? '');

  // ---- Ctrl+K to open search ----
  function onKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchOpen = true;
    }
    if (e.key === 'Escape') {
      searchOpen = false;
      optionsOpen = null;
    }
  }

  // ---- DnD handlers (root level reorder) ----
  function onConsider(e: CustomEvent<DndEvent<Page>>) {
    rootItems = e.detail.items;
  }
  async function onFinalize(e: CustomEvent<DndEvent<Page>>) {
    rootItems = e.detail.items;
    // Update parentId order — svelte-dnd-action maintains array order
    for (let i = 0; i < rootItems.length; i++) {
      if (rootItems[i].parentId !== null) {
        await pagesStore.updatePage(rootItems[i].id, { parentId: null });
      }
    }
  }

  // ---- Actions ----
  async function newRootPage() {
    const p = await pagesStore.createPage(null);
    goto(`/doc/${p.id}`);
    onclose?.();
  }

  async function newChildPage(parentId: string) {
    expandedIds.add(parentId);
    expandedIds = new Set(expandedIds);
    const p = await pagesStore.createPage(parentId);
    goto(`/doc/${p.id}`);
    onclose?.();
  }

  function navigate(id: string) {
    goto(`/doc/${id}`);
    onclose?.();
  }

  function toggleExpand(id: string) {
    if (expandedIds.has(id)) {
      expandedIds.delete(id);
    } else {
      expandedIds.add(id);
    }
    expandedIds = new Set(expandedIds);
  }

  async function deletePage(id: string) {
    optionsOpen = null;
    await pagesStore.deletePage(id);
    if (currentId === id) goto('/');
  }

  async function togglePublic(id: string) {
    optionsOpen = null;
    const publicId = await pagesStore.togglePublic(id);
    if (publicId) {
      // Copy link to clipboard
      const url = `${window.location.origin}/p/${publicId}`;
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  async function copyPublicLink(id: string) {
    const p = pagesStore.getById(id);
    if (!p?.isPublic || !p.publicId) return;
    const url = `${window.location.origin}/p/${p.publicId}`;
    await navigator.clipboard.writeText(url);
    copiedId = id;
    setTimeout(() => (copiedId = null), 1500);
    optionsOpen = null;
  }
</script>

<svelte:window onkeydown={onKeydown} />

<!-- Search modal -->
{#if searchOpen}
  <div
    class="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-[15vh]"
    onclick={() => (searchOpen = false)}
    role="dialog"
    aria-modal="true"
    aria-label="Search pages"
  >
    <div
      class="w-full max-w-lg bg-white dark:bg-neutral-800 rounded-xl shadow-2xl overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <div class="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
        <Search size={16} class="text-neutral-400 shrink-0" />
        <!-- svelte-ignore a11y_autofocus -->
        <input
          class="flex-1 bg-transparent outline-none text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400"
          placeholder="Search pages..."
          bind:value={searchQuery}
          autofocus
        />
        <button onclick={() => (searchOpen = false)} class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
          <X size={16} />
        </button>
      </div>
      <div class="max-h-80 overflow-y-auto">
        {#if searchResults.length === 0 && searchQuery}
          <div class="px-4 py-6 text-sm text-neutral-400 text-center">No pages found</div>
        {:else if !searchQuery}
          <div class="px-4 py-6 text-sm text-neutral-400 text-center">Type to search…</div>
        {:else}
          {#each searchResults as result}
            <button
              class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left transition-colors"
              onclick={() => { navigate(result.id); searchOpen = false; searchQuery = ''; }}
            >
              <span class="text-xl w-7 shrink-0 text-center">{result.icon || '📄'}</span>
              <span class="text-sm text-neutral-800 dark:text-neutral-100 truncate">{result.title || 'Untitled'}</span>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Sidebar body -->
<div class="flex flex-col h-full w-60 bg-[#f7f7f5] dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 text-sm select-none">
  <!-- Top area -->
  <div class="px-3 py-3 border-b border-neutral-200/60 dark:border-neutral-800">
    <div class="flex items-center justify-between">
      <span class="font-semibold text-neutral-800 dark:text-neutral-100 text-base tracking-tight">Workspace</span>
      <div class="flex items-center gap-1">
        <button
          onclick={() => themeStore.toggle()}
          class="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors"
          title="Toggle dark mode"
        >
          {#if themeStore.dark}
            <Sun size={15} />
          {:else}
            <Moon size={15} />
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Search + New page -->
  <div class="px-2 pt-2 pb-1 space-y-0.5">
    <button
      onclick={() => (searchOpen = true)}
      class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors"
    >
      <Search size={15} />
      <span class="text-sm">Search</span>
      <kbd class="ml-auto text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-400 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
    </button>
    <button
      onclick={newRootPage}
      class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors"
    >
      <FilePlus size={15} />
      <span class="text-sm">New page</span>
    </button>
  </div>

  <!-- Divider -->
  <div class="mx-3 my-1 border-t border-neutral-200 dark:border-neutral-800"></div>

  <!-- Page tree -->
  <div class="flex-1 overflow-y-auto px-1 pb-4">
    <div class="px-2 py-1 text-xs font-medium text-neutral-400 uppercase tracking-wide">Pages</div>

    <!-- Root level DnD zone -->
    <div
      use:dndzone={{ items: rootItems, flipDurationMs: 120 }}
      onconsider={onConsider}
      onfinalize={onFinalize}
      class="min-h-[4px]"
    >
      {#each rootItems as p (p.id)}
        {@const hasChildren = pagesStore.childrenOf(p.id).length > 0}
        {@const isExpanded = expandedIds.has(p.id)}
        {@const isActive = currentId === p.id}

        <div class="group relative">
          <div
            class="flex items-center gap-1 rounded-md pr-1 transition-colors {isActive ? 'bg-neutral-200/80 dark:bg-neutral-700/80' : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60'}"
          >
            <!-- Expand toggle -->
            <button
              onclick={() => toggleExpand(p.id)}
              class="p-0.5 shrink-0 text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors {hasChildren ? '' : 'invisible'}"
              aria-label="Toggle expand"
            >
              {#if isExpanded}
                <ChevronDown size={13} />
              {:else}
                <ChevronRight size={13} />
              {/if}
            </button>

            <!-- Page link -->
            <button
              onclick={() => navigate(p.id)}
              class="flex-1 flex items-center gap-1.5 py-1 min-w-0 text-left"
            >
              <span class="text-base leading-none shrink-0">{p.icon || '📄'}</span>
              <span class="truncate text-sm text-neutral-700 dark:text-neutral-200">{p.title || 'Untitled'}</span>
              {#if p.isPublic}
                <Globe size={10} class="shrink-0 text-green-500 ml-auto" />
              {/if}
            </button>

            <!-- Hover actions -->
            <div class="hidden group-hover:flex items-center gap-0.5 shrink-0">
              <button
                onclick={() => newChildPage(p.id)}
                class="p-0.5 rounded hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                title="Add child page"
              >
                <Plus size={13} />
              </button>
              <button
                onclick={(e) => { e.stopPropagation(); optionsOpen = optionsOpen === p.id ? null : p.id; }}
                class="p-0.5 rounded hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-xs font-bold"
                title="Options"
              >
                ···
              </button>
            </div>
          </div>

          <!-- Options dropdown -->
          {#if optionsOpen === p.id}
            <div
              class="absolute right-0 top-7 z-40 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 text-sm"
              onclick={(e) => e.stopPropagation()}
              onkeydown={(e) => e.key === 'Escape' && (optionsOpen = null)}
              role="menu"
              tabindex="-1"
            >
              <button
                class="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                onclick={() => togglePublic(p.id)}
                role="menuitem"
              >
                {#if p.isPublic}
                  <Lock size={14} class="text-neutral-400" />
                  Make private
                {:else}
                  <Globe size={14} class="text-green-500" />
                  Share publicly
                {/if}
              </button>
              {#if p.isPublic && p.publicId}
                <button
                  class="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                  onclick={() => copyPublicLink(p.id)}
                  role="menuitem"
                >
                  <Link size={14} class="text-neutral-400" />
                  {copiedId === p.id ? 'Copied!' : 'Copy link'}
                </button>
              {/if}
              <div class="my-1 border-t border-neutral-100 dark:border-neutral-700"></div>
              <button
                class="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                onclick={() => deletePage(p.id)}
                role="menuitem"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          {/if}

          <!-- Children (non-DnD for simplicity) -->
          {#if isExpanded && hasChildren}
            <div class="pl-4">
              {#each pagesStore.childrenOf(p.id) as child (child.id)}
                {@const childActive = currentId === child.id}
                <div
                  class="flex items-center gap-1.5 pl-1 py-1 pr-1 rounded-md cursor-pointer transition-colors {childActive ? 'bg-neutral-200/80 dark:bg-neutral-700/80' : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60'}"
                  onclick={() => navigate(child.id)}
                  role="button"
                  tabindex="0"
                  onkeydown={(e) => e.key === 'Enter' && navigate(child.id)}
                >
                  <span class="text-sm leading-none shrink-0">{child.icon || '📄'}</span>
                  <span class="truncate text-sm text-neutral-700 dark:text-neutral-200">{child.title || 'Untitled'}</span>
                </div>
              {/each}
              <button
                onclick={() => newChildPage(p.id)}
                class="w-full flex items-center gap-1.5 pl-1 py-1 text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-400 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 transition-colors"
              >
                <Plus size={12} />
                <span class="text-xs">Add a page</span>
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    {#if pagesStore.pages.length === 0 && pagesStore.initialized}
      <button
        onclick={newRootPage}
        class="w-full flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 transition-colors"
      >
        <Plus size={14} />
        <span class="text-sm">New page</span>
      </button>
    {/if}
  </div>

  <!-- Bottom: add page -->
  <div class="px-2 py-2 border-t border-neutral-200 dark:border-neutral-800">
    <button
      onclick={newRootPage}
      class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
    >
      <Plus size={15} />
      <span class="text-sm">New page</span>
    </button>
  </div>
</div>

<!-- Click outside to close options -->
{#if optionsOpen}
  <div
    class="fixed inset-0 z-30"
    onclick={() => (optionsOpen = null)}
    role="presentation"
  ></div>
{/if}
