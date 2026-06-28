"use client"

import { useMemo, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  CheckSquare,
  ChevronRight,
  FileText,
  Heading1,
  Italic,
  List,
  ListOrdered,
  Quote,
  Search,
  Settings,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const initialContent = `
  <h1>Weekly roadmap</h1>
  <p>Capture ideas, notes, and next steps in a calm workspace that feels familiar and focused.</p>
  <ul>
    <li>Outline the launch checklist</li>
    <li>Share highlights with the team</li>
    <li>Track what is moving next</li>
  </ul>
`

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      onClick={onClick}
      className={active ? "bg-secondary" : ""}
    >
      {children}
    </Button>
  )
}

export function NotionEditor() {
  const [title, setTitle] = useState("Weekly roadmap")

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-[280px] rounded-xl border-none px-0 py-2 text-base leading-8 outline-none",
      },
    },
  })

  const quickLinks = useMemo(
    () => [
      { label: "Meeting notes", active: false },
      { label: "Product plan", active: true },
      { label: "Design inspo", active: false },
    ],
    []
  )

  if (!editor) {
    return null
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_40%),linear-gradient(135deg,_rgba(255,255,255,0.9),_rgba(248,250,252,0.95))] p-4 text-foreground md:p-6 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.2),_transparent_36%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(3,7,18,1))]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[28px] border border-border/70 bg-background/90 p-3 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)] backdrop-blur md:p-4">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-3 pb-4 pt-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Personal workspace
            </p>
            <h1 className="text-xl font-semibold">Notion-style editor</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Share
            </Button>
            <Button size="sm">Publish</Button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Search notes</span>
            </div>

            <div className="space-y-2">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="size-4" />
                Quick links
              </div>
              {quickLinks.map((item) => (
                <button
                  key={item.label}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                    item.active
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="size-4" />
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-background/70 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <CheckSquare className="size-4" />
                Today
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Keep momentum with a clear outline and a lightweight writing space.
              </p>
            </div>
          </aside>

          <Card className="border-border/70 shadow-none">
            <CardContent className="p-0">
              <div className="flex flex-wrap gap-2 border-b border-border/70 px-4 py-3">
                <ToolbarButton
                  active={editor.isActive("bold")}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <Bold className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  active={editor.isActive("italic")}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <Italic className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  active={editor.isActive("heading", { level: 1 })}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                  <Heading1 className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  active={editor.isActive("bulletList")}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                  <List className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  active={editor.isActive("orderedList")}
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                  <ListOrdered className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  active={editor.isActive("blockquote")}
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                  <Quote className="size-4" />
                </ToolbarButton>
              </div>

              <div className="space-y-4 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 px-3 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="size-4" />
                    Untitled page
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="size-4" />
                    Page settings
                  </Button>
                </div>

                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Untitled"
                  className="h-auto border-none px-0 py-0 text-3xl font-semibold shadow-none focus-visible:ring-0 md:text-4xl"
                />

                <EditorContent editor={editor} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
