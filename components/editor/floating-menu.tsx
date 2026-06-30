"use client"

import { useState } from "react"
import { FloatingMenu } from "@tiptap/react/menus"
import type { Editor } from "@tiptap/react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SLASH_ITEMS, SLASH_GROUPS } from "./slash-command/slash-items"

const EXCLUDED_GROUPS = new Set(["Inline"])

interface EditorFloatingMenuProps {
  editor: Editor
}

export function EditorFloatingMenu({ editor }: EditorFloatingMenuProps) {
  const [open, setOpen] = useState(false)

  const visibleGroups = SLASH_GROUPS.filter((g) => !EXCLUDED_GROUPS.has(g))

  const handleSelect = (command: (editor: Editor, range: { from: number; to: number }) => void) => {
    setOpen(false)
    const { from, to } = editor.state.selection
    command(editor, { from, to })
  }

  return (
    <FloatingMenu
      editor={editor}
      shouldShow={({ state }) => {
        const { selection } = state
        const { $anchor, empty } = selection
        if (!empty) return false
        const isTextBlock = $anchor.parent.isTextblock && !$anchor.parent.type.spec.code
        const isEmpty = $anchor.parent.textContent === ""
        return isTextBlock && isEmpty
      }}
    >
      <TooltipProvider>
        <Popover open={open} onOpenChange={setOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 rounded-md text-muted-foreground shadow-sm hover:text-foreground"
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label="Insert block"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="top">
              Insert block
              <span className="ml-1.5 opacity-60 text-[10px]">/</span>
            </TooltipContent>
          </Tooltip>

          <PopoverContent
            side="bottom"
            align="start"
            sideOffset={6}
            className="w-56 p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <ScrollArea className="max-h-72">
              <div className="p-1">
                {visibleGroups.map((group, gi) => {
                  const items = SLASH_ITEMS.filter((i) => i.group === group)
                  if (items.length === 0) return null
                  return (
                    <div key={group}>
                      {gi > 0 && <Separator className="my-1" />}
                      <p className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
                        {group}
                      </p>
                      {items.map((item) => {
                        const Icon = item.icon
                        return (
                          <Tooltip key={item.title}>
                            <TooltipTrigger asChild>
                              <button
                                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelect(item.command)}
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background shadow-sm">
                                  <Icon className="h-3.5 w-3.5" />
                                </span>
                                <span className="font-medium">{item.title}</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {item.description}
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    </FloatingMenu>
  )
}
