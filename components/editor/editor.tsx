"use client"

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react"
import { editorExtensions } from "./extensions"
import { useCallback, useEffect } from "react"
import { Bold, Italic, Strikethrough, Code, Link } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"

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

  useEffect(() => {
    if (!editor) return
    const current = JSON.stringify(editor.getJSON())
    const incoming = JSON.stringify(content ?? { type: "doc", content: [] })
    if (current !== incoming) {
      editor.commands.setContent(content ?? { type: "doc", content: [] }, false)
    }
  }, [content, editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes("link").href
    const url = window.prompt("URL", prev)
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="flex flex-col gap-2">
      {editable && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex items-center gap-0.5 rounded-lg border bg-popover p-1 shadow-md">
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
          </div>
        </BubbleMenu>
      )}
      <EditorContent
        editor={editor}
        className="tiptap min-h-[60vh] w-full cursor-text focus-within:outline-none"
      />
    </div>
  )
}
