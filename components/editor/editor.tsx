"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import type { Editor as TiptapEditor } from "@tiptap/react"
import { editorExtensions } from "./extensions"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Bold, Italic, Strikethrough, Code, Link } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"

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
  const editor = useEditor({
    extensions: editorExtensions,
    content: content ?? { type: "doc", content: [] },
    editable,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON() as Record<string, unknown>)
    },
  })

  const prevContent = useRef<string>("")

  useEffect(() => {
    if (!editor) return
    const incoming = JSON.stringify(content ?? { type: "doc", content: [] })
    if (prevContent.current !== incoming) {
      prevContent.current = incoming
      const current = JSON.stringify(editor.getJSON())
      if (current !== incoming) {
        editor.commands.setContent(content ?? { type: "doc", content: [] }, false)
      }
    }
  }, [content, editor])

  if (!editor) return null

  return (
    <div className="flex flex-col gap-2">
      {editable && <BubbleToolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className="tiptap min-h-[60vh] w-full cursor-text focus-within:outline-none"
      />
    </div>
  )
}
