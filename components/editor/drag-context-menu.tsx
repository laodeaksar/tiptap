"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createRoot, type Root } from "react-dom/client"
import type { Editor } from "@tiptap/react"
import { DragHandle } from "@tiptap/extension-drag-handle"
import type { Node } from "@tiptap/pm/model"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  GripVertical,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code2,
  ListTodo,
} from "lucide-react"

interface CurrentNode {
  pos: number
  node: Node | null
}

function DragHandleMenu({
  editor,
  currentNodeRef,
}: {
  editor: Editor
  currentNodeRef: React.MutableRefObject<CurrentNode>
}) {
  const [open, setOpen] = useState(false)

  const selectNode = useCallback(() => {
    const { pos, node } = currentNodeRef.current
    if (pos < 0 || !node) return false
    editor.chain().focus().setNodeSelection(pos).run()
    return true
  }, [editor, currentNodeRef])

  const handleDelete = () => {
    if (!selectNode()) return
    setOpen(false)
    editor.chain().focus().setNodeSelection(currentNodeRef.current.pos).deleteSelection().run()
  }

  const handleDuplicate = () => {
    const { pos, node } = currentNodeRef.current
    if (pos < 0 || !node) return
    setOpen(false)
    const end = pos + node.nodeSize
    editor.chain().focus().insertContentAt(end, node.toJSON()).run()
  }

  const handleMoveUp = () => {
    const { pos, node } = currentNodeRef.current
    if (pos < 0 || !node) return
    setOpen(false)
    editor.commands.command(({ tr, state }) => {
      const $pos = state.doc.resolve(pos)
      const index = $pos.index()
      if (index === 0) return false
      const prevNode = $pos.parent.child(index - 1)
      const prevPos = pos - prevNode.nodeSize
      tr.delete(pos, pos + node.nodeSize)
      tr.insert(prevPos, node)
      return true
    })
    editor.commands.focus()
  }

  const handleMoveDown = () => {
    const { pos, node } = currentNodeRef.current
    if (pos < 0 || !node) return
    setOpen(false)
    editor.commands.command(({ tr, state }) => {
      const $pos = state.doc.resolve(pos)
      const parent = $pos.parent
      const index = $pos.index()
      if (index === parent.childCount - 1) return false
      const nextNode = parent.child(index + 1)
      tr.delete(pos, pos + node.nodeSize)
      tr.insert(pos + nextNode.nodeSize, node)
      return true
    })
    editor.commands.focus()
  }

  const turnInto = (fn: () => void) => {
    selectNode()
    setOpen(false)
    fn()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          onMouseDown={(e) => e.preventDefault()}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className="min-w-52">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Block actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleMoveUp}>
          <ArrowUp data-icon="inline-start" />
          Move up
          <DropdownMenuShortcut>⌥↑</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleMoveDown}>
          <ArrowDown data-icon="inline-start" />
          Move down
          <DropdownMenuShortcut>⌥↓</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDuplicate}>
          <Copy data-icon="inline-start" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={handleDelete}
        >
          <Trash2 data-icon="inline-start" />
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Type data-icon="inline-start" />
            Turn into
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() => turnInto(() => editor.chain().focus().setParagraph().run())}
            >
              <Type data-icon="inline-start" />
              Paragraph
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                turnInto(() => editor.chain().focus().setHeading({ level: 1 }).run())
              }
            >
              <Heading1 data-icon="inline-start" />
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                turnInto(() => editor.chain().focus().setHeading({ level: 2 }).run())
              }
            >
              <Heading2 data-icon="inline-start" />
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                turnInto(() => editor.chain().focus().setHeading({ level: 3 }).run())
              }
            >
              <Heading3 data-icon="inline-start" />
              Heading 3
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => turnInto(() => editor.chain().focus().setBlockquote().run())}
            >
              <Quote data-icon="inline-start" />
              Quote
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => turnInto(() => editor.chain().focus().setCodeBlock().run())}
            >
              <Code2 data-icon="inline-start" />
              Code block
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => turnInto(() => editor.chain().focus().toggleTaskList().run())}
            >
              <ListTodo data-icon="inline-start" />
              To-do list
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface DragContextMenuSetup {
  element: HTMLElement
  extension: ReturnType<typeof DragHandle.configure>
}

export function useDragContextMenu() {
  const currentNodeRef = useRef<CurrentNode>({ pos: -1, node: null })
  const rootRef = useRef<Root | null>(null)

  const [setup] = useState<DragContextMenuSetup | null>(() => {
    if (typeof window === "undefined") return null
    const element = document.createElement("div")
    element.style.cssText = "display:flex;align-items:center;"
    const extension = DragHandle.configure({
      render: () => element,
      onNodeChange({ node, editor }) {
        if (!node) {
          currentNodeRef.current = { pos: -1, node: null }
          return
        }
        let foundPos = -1
        editor.state.doc.descendants((n, p) => {
          if (n === node) {
            foundPos = p
            return false
          }
        })
        currentNodeRef.current = { pos: foundPos, node }
      },
    })
    return { element, extension }
  })

  const mountIntoEditor = useCallback(
    (editor: Editor | null) => {
      if (!editor || !setup) return
      if (rootRef.current) return

      const root = createRoot(setup.element)
      rootRef.current = root
      root.render(<DragHandleMenu editor={editor} currentNodeRef={currentNodeRef} />)
    },
    [setup]
  )

  useEffect(() => {
    return () => {
      const root = rootRef.current
      if (root) {
        setTimeout(() => root.unmount(), 0)
        rootRef.current = null
      }
    }
  }, [])

  return {
    extension: setup?.extension ?? null,
    mountIntoEditor,
  }
}
