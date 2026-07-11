<script lang="ts">
  import { GripVertical } from 'lucide-svelte';
  import type { Editor } from '@tiptap/core';

  let { editor }: { editor: Editor | null } = $props();

  let visible = $state(false);
  let handleTop = $state(0);
  let handleLeft = $state(0);
  let dragging = $state(false);
  let dragSrcPos = -1;
  let activeElement: Element | null = null;

  function findTopLevelBlock(pos: number): { el: Element; before: number } | null {
    if (!editor) return null;
    const view = editor.view;
    const rpos = editor.state.doc.resolve(pos);

    // Walk up to depth=1 (direct child of doc)
    let depth = rpos.depth;
    while (depth > 1) depth--;

    let before: number;
    try {
      before = rpos.before(depth > 0 ? depth : 1);
    } catch {
      return null;
    }

    const nodeDom = view.nodeDOM(before);
    if (!nodeDom) return null;
    const el = nodeDom instanceof Element ? nodeDom : (nodeDom as Node).parentElement;
    if (!el) return null;
    return { el, before };
  }

  function onMouseMove(e: MouseEvent) {
    if (!editor || dragging) return;
    const view = editor.view;
    const editorDom = view.dom as HTMLElement;
    const editorRect = editorDom.getBoundingClientRect();

    // Only activate within horizontal range of the editor
    if (e.clientX < editorRect.left - 80 || e.clientX > editorRect.right + 10) {
      visible = false;
      return;
    }

    const posResult = view.posAtCoords({ left: Math.max(e.clientX, editorRect.left + 4), top: e.clientY });
    if (!posResult) { visible = false; return; }

    const block = findTopLevelBlock(posResult.pos);
    if (!block) { visible = false; return; }

    const { el, before } = block;
    if (!editorDom.contains(el)) { visible = false; return; }

    const rect = el.getBoundingClientRect();
    activeElement = el;
    dragSrcPos = before;
    visible = true;
    handleTop = rect.top + 2;
    handleLeft = editorRect.left - 28;
  }

  function onDragStart(e: DragEvent) {
    if (!e.dataTransfer || !editor || dragSrcPos < 0) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/notion-block-pos', String(dragSrcPos));
    dragging = true;

    // Ghost image
    const ghost = document.createElement('div');
    ghost.style.cssText =
      'position:fixed;top:-999px;left:-999px;background:#ede9fe;color:#6d28d9;padding:4px 8px;border-radius:6px;font-size:13px;pointer-events:none;';
    ghost.textContent = activeElement?.textContent?.slice(0, 40).trim() || 'Block';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 10, 12);
    requestAnimationFrame(() => ghost.remove());
  }

  function onDragEnd() {
    dragging = false;
    visible = false;
    dragSrcPos = -1;
  }

  // Listen on editor DOM for dragover/drop
  $effect(() => {
    if (!editor) return;
    const editorDom = editor.view.dom as HTMLElement;

    function onDragOver(e: DragEvent) {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    }

    function onDrop(e: DragEvent) {
      e.preventDefault();
      if (!e.dataTransfer || !editor) return;
      const srcPosStr = e.dataTransfer.getData('application/notion-block-pos');
      if (!srcPosStr) return;
      const srcPos = Number(srcPosStr);
      if (isNaN(srcPos)) return;

      const view = editor.view;
      const dropResult = view.posAtCoords({ left: e.clientX, top: e.clientY });
      if (!dropResult) return;

      const rsrc = editor.state.doc.resolve(srcPos);
      const rdst = editor.state.doc.resolve(dropResult.pos);

      // Get top-level nodes
      const srcDepth = rsrc.depth > 0 ? 1 : 0;
      const dstDepth = rdst.depth > 0 ? 1 : 0;

      let srcStart: number, srcEnd: number, dstInsert: number;
      try {
        srcStart = rsrc.before(srcDepth > 0 ? srcDepth : 1);
        srcEnd = rsrc.after(srcDepth > 0 ? srcDepth : 1);
        dstInsert = rdst.before(dstDepth > 0 ? dstDepth : 1);
      } catch {
        return;
      }

      if (srcStart === dstInsert) return;

      const srcNode = editor.state.doc.nodeAt(srcStart);
      if (!srcNode) return;

      const tr = editor.state.tr;
      // Remove source node then insert at destination
      if (srcStart < dstInsert) {
        tr.insert(dstInsert, srcNode);
        tr.delete(srcStart, srcEnd);
      } else {
        tr.delete(srcStart, srcEnd);
        tr.insert(dstInsert, srcNode);
      }
      view.dispatch(tr);
    }

    editorDom.addEventListener('dragover', onDragOver);
    editorDom.addEventListener('drop', onDrop);
    return () => {
      editorDom.removeEventListener('dragover', onDragOver);
      editorDom.removeEventListener('drop', onDrop);
    };
  });

  $effect(() => {
    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  });
</script>

{#if visible}
  <div
    class="fixed z-40 w-5 h-6 flex items-center justify-center rounded cursor-grab opacity-40 hover:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-all select-none"
    style="top: {handleTop}px; left: {handleLeft}px;"
    draggable="true"
    ondragstart={onDragStart}
    ondragend={onDragEnd}
    title="Drag to reorder"
    role="button"
    tabindex="-1"
  >
    <GripVertical size={14} />
  </div>
{/if}
