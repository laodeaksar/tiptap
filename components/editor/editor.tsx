"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import type { Editor as TiptapEditor } from "@tiptap/react"
import { editorExtensions } from "./extensions"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Bold, Italic, Strikethrough, Code, Link } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { useDragContextMenu } from "./drag-context-menu"

interface BubbleToolbarProps {
  editor: TiptapEditor
}

function BubbleToolbar({ editor }: BubbleToolbarProps) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const updatePos = () => {
      const { state, view } = editor
      const { selection } = state

      if (selection.empty || !editor.isEditable) {
        setCoords(null)
        return
      }

      try {
        const { from, to } = selection
        const start = view.coordsAtPos(from)
        const end = view.coordsAtPos(to)

        const top = Math.min(start.top, end.top) - 44
        const centerX = (start.left + end.right) / 2
        const left = Math.max(8, Math.min(centerX - 100, window.innerWidth - 216))

        setCoords({ top, left })
      } catch {
        setCoords(null)
      }
    }

    const onBlur = () => setCoords(null)

    editor.on("selectionUpdate", updatePos)
    editor.on("focus", updatePos)
    editor.on("blur", onBlur)

    return () => {
      editor.off("selectionUpdate", updatePos)
      editor.off("focus", updatePos)
      editor.off("blur", onBlur)
    }
  }, [editor])

  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("URL", prev ?? "")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  if (!mounted || !coords) return null

  return createPortal(
    <div
      style={{ position: "fixed", top: coords.top, left: coords.left, zIndex: 50 }}
      className="flex items-center gap-0.5 rounded-lg border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
      onMouseDown={(e) => e.preventDefault()}
    >
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("code")}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("link")}
        onPressedChange={setLink}
      >
        <Link className="h-3.5 w-3.5" />
      </Toggle>
    </div>,
    document.body
  )
}

interface EditorProps {
  content: Record<string, unknown> | null
  onChange?: (content: Record<string, unknown>) => void
  editable?: boolean
}

export function Editor({ content, onChange, editable = true }: EditorProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const { extension: dragHandleExt, mountIntoEditor } = useDragContextMenu()

  const editor = useEditor({
    extensions: [
      ...editorExtensions,
      ...(dragHandleExt && editable ? [dragHandleExt] : []),
    ],
    content: content ?? { type: "doc", content: [] },
    editable,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON() as Record<string, unknown>)
    },
  })

  useEffect(() => {
    if (editable) mountIntoEditor(editor)
  }, [editor, editable, mountIntoEditor])

  const prevContent = useRef<string>("")

  useEffect(() => {
    if (!editor) return
    const incoming = JSON.stringify(content ?? { type: "doc", content: [] })
    if (prevContent.current !== incoming) {
      prevContent.current = incoming
      const current = JSON.stringify(editor.getJSON())
      if (current !== incoming) {
        editor.commands.setContent(content ?? { type: "doc", content: [] }, { emitUpdate: false })
      }
    }
  }, [content, editor])

  if (!editor) return null

  const handleDragOver = (e: React.DragEvent) => {
    const hasFiles = Array.from(e.dataTransfer.items).some(
      (item) => item.kind === "file" && item.type.startsWith("image/")
    )
    if (hasFiles) {
      e.preventDefault()
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = () => setIsDragOver(false)

  return (
    <div
      className="relative flex flex-col gap-2"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {editable && <BubbleToolbar editor={editor} />}
      {isDragOver && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5">
          <div className="flex flex-col items-center gap-2 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 opacity-80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <span className="text-sm font-medium">Drop image to upload</span>
          </div>
        </div>
      )}
      <EditorContent
        editor={editor}
        className="tiptap min-h-[60vh] w-full cursor-text focus-within:outline-none"
      />
    </div>
  )
}
