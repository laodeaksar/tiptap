"use client"

import { useCallback, useState } from "react"
import { BubbleMenu } from "@tiptap/react/menus"
import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link,
  Link2Off,
  ChevronDown,
  Palette,
  Check,
} from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const COLORS = [
  { label: "Default", value: "" },
  { label: "Gray", value: "#6b7280" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Green", value: "#22c55e" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Pink", value: "#ec4899" },
]

function getBlockLabel(editor: Editor): string {
  if (editor.isActive("heading", { level: 1 })) return "Heading 1"
  if (editor.isActive("heading", { level: 2 })) return "Heading 2"
  if (editor.isActive("heading", { level: 3 })) return "Heading 3"
  if (editor.isActive("blockquote")) return "Quote"
  if (editor.isActive("codeBlock")) return "Code"
  if (editor.isActive("bulletList")) return "Bullet list"
  if (editor.isActive("orderedList")) return "Numbered list"
  if (editor.isActive("taskList")) return "To-do"
  return "Text"
}

interface EditorBubbleMenuProps {
  editor: Editor
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [colorOpen, setColorOpen] = useState(false)

  const openLink = useCallback(() => {
    const prev = (editor.getAttributes("link").href as string) ?? ""
    setLinkUrl(prev)
    setLinkOpen(true)
  }, [editor])

  const applyLink = useCallback(() => {
    if (linkUrl.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl.trim() })
        .run()
    }
    setLinkOpen(false)
  }, [editor, linkUrl])

  const removeLink = useCallback(() => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
    setLinkOpen(false)
  }, [editor])

  const currentColor =
    (editor.getAttributes("textStyle").color as string | undefined) ?? ""

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ state, from, to }) => {
        const { selection } = state
        if (selection.empty) return false
        return state.doc.textBetween(from, to).length > 0
      }}
    >
      <TooltipProvider>
        <div
          className="flex items-center gap-0.5 rounded-lg border bg-popover p-1 shadow-md"
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* ── Block type ── */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs font-medium"
                  >
                    {getBlockLabel(editor)}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">Turn into</TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="start" className="min-w-40">
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setParagraph().run()}
              >
                Text
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 1 }).run()
                }
              >
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 2 }).run()
                }
              >
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 3 }).run()
                }
              >
                Heading 3
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setBlockquote().run()}
              >
                Quote
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setCodeBlock().run()}
              >
                Code block
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="mx-0.5 h-5" />

          {/* ── Text formatting ── */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() =>
                  editor.chain().focus().toggleBold().run()
                }
                className="h-7 w-7"
                aria-label="Bold"
              >
                <Bold className="h-3.5 w-3.5" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Bold{" "}
              <span className="ml-1 opacity-60 text-[10px]">⌘B</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() =>
                  editor.chain().focus().toggleItalic().run()
                }
                className="h-7 w-7"
                aria-label="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Italic{" "}
              <span className="ml-1 opacity-60 text-[10px]">⌘I</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("strike")}
                onPressedChange={() =>
                  editor.chain().focus().toggleStrike().run()
                }
                className="h-7 w-7"
                aria-label="Strikethrough"
              >
                <Strikethrough className="h-3.5 w-3.5" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="bottom">Strikethrough</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("code")}
                onPressedChange={() =>
                  editor.chain().focus().toggleCode().run()
                }
                className="h-7 w-7"
                aria-label="Code"
              >
                <Code className="h-3.5 w-3.5" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Inline code{" "}
              <span className="ml-1 opacity-60 text-[10px]">⌘E</span>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-0.5 h-5" />

          {/* ── Link ── */}
          <Popover open={linkOpen} onOpenChange={setLinkOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive("link")}
                    onPressedChange={openLink}
                    className="h-7 w-7"
                    aria-label="Link"
                  >
                    <Link className="h-3.5 w-3.5" />
                  </Toggle>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Link{" "}
                <span className="ml-1 opacity-60 text-[10px]">⌘K</span>
              </TooltipContent>
            </Tooltip>

            <PopoverContent
              side="bottom"
              align="start"
              className="w-72 p-3"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                URL
              </p>
              <div className="flex gap-1.5">
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      applyLink()
                    }
                    e.stopPropagation()
                  }}
                  placeholder="https://…"
                  className="h-7 text-sm"
                  autoFocus
                />
                <Button size="sm" className="h-7 shrink-0 px-3" onClick={applyLink}>
                  Apply
                </Button>
              </div>
              {editor.isActive("link") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 w-full justify-start gap-1.5 px-1.5 text-xs text-muted-foreground hover:text-destructive"
                  onClick={removeLink}
                >
                  <Link2Off className="h-3.5 w-3.5" />
                  Remove link
                </Button>
              )}
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="mx-0.5 h-5" />

          {/* ── Text color ── */}
          <Popover open={colorOpen} onOpenChange={setColorOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-7 w-7"
                    aria-label="Text color"
                  >
                    <Palette className="h-3.5 w-3.5" />
                    <span
                      className={cn(
                        "absolute bottom-0.5 left-1/2 h-[3px] w-3.5 -translate-x-1/2 rounded-full transition-colors",
                        currentColor ? "" : "bg-foreground/40"
                      )}
                      style={
                        currentColor ? { backgroundColor: currentColor } : {}
                      }
                    />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">Color</TooltipContent>
            </Tooltip>

            <PopoverContent side="bottom" align="start" className="w-48 p-2.5">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Text color
              </p>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map(({ label, value }) => (
                  <Tooltip key={label}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          if (value === "") {
                            editor.chain().focus().unsetColor().run()
                          } else {
                            editor.chain().focus().setColor(value).run()
                          }
                          setColorOpen(false)
                        }}
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-md border transition-all hover:scale-110 hover:shadow-sm",
                          currentColor === value &&
                            "ring-2 ring-ring ring-offset-1"
                        )}
                        style={{
                          backgroundColor: value || "transparent",
                        }}
                        aria-label={label}
                      >
                        {currentColor === value && (
                          <Check
                            className={cn(
                              "h-3 w-3",
                              value ? "text-white" : "text-foreground"
                            )}
                          />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </TooltipProvider>
    </BubbleMenu>
  )
}
