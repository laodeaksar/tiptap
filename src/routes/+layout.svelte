<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { pagesStore } from '$lib/stores/pages.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { Menu, X } from 'lucide-svelte';
  import '../app.css';

  let { children } = $props();

  // Hide sidebar on public pages
  const isPublicRoute = $derived($page.url.pathname.startsWith('/p/'));

  // Mobile sidebar
  let mobileSidebarOpen = $state(false);

  onMount(() => {
    themeStore.init();
    pagesStore.init();
  });
</script>

{#if isPublicRoute}
  <!-- Public pages: no sidebar, clean layout -->
  <div class="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
    {@render children()}
  </div>
{:else}
  <!-- App layout: sidebar + main -->
  <div class="flex h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans">

    <!-- Desktop sidebar -->
    <div class="hidden md:flex flex-shrink-0">
      <Sidebar />
    </div>

    <!-- Mobile sidebar overlay -->
    {#if mobileSidebarOpen}
      <div
        class="fixed inset-0 z-40 md:hidden"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onclick={() => (mobileSidebarOpen = false)}
          role="presentation"
        ></div>
        <div class="absolute left-0 top-0 h-full z-50">
          <Sidebar onclose={() => (mobileSidebarOpen = false)} />
        </div>
      </div>
    {/if}

    <!-- Main content area -->
    <main class="flex-1 min-w-0 overflow-auto relative">
      <!-- Mobile menu button -->
      <button
        onclick={() => (mobileSidebarOpen = !mobileSidebarOpen)}
        class="md:hidden fixed top-3 left-3 z-30 p-2 rounded-lg bg-white/80 dark:bg-neutral-800/80 backdrop-blur shadow-sm border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
        aria-label="Toggle sidebar"
      >
        {#if mobileSidebarOpen}
          <X size={18} />
        {:else}
          <Menu size={18} />
        {/if}
      </button>

      {@render children()}
    </main>
  </div>
{/if}
