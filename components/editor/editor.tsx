"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import { editorExtensions } from "./extensions"
import { CloudUpload } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useDragContextMenu } from "./drag-context-menu"
import { EditorBubbleMenu } from "./bubble-menu"
import { EditorFloatingMenu } from "./floating-menu"
import { EditorWordCount } from "./word-count"

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
      {editable && <EditorBubbleMenu editor={editor} />}
      {editable && <EditorFloatingMenu editor={editor} />}
      {isDragOver && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5">
          <div className="flex flex-col items-center gap-2 text-primary">
            <CloudUpload className="h-10 w-10 opacity-80" />
            <span className="text-sm font-medium">Drop image to upload</span>
          </div>
        </div>
      )}
      <EditorContent
        editor={editor}
        className="tiptap min-h-[60vh] w-full cursor-text focus-within:outline-none"
      />
      {editable && <EditorWordCount editor={editor} />}
    </div>
  )
}
