"use client"

import { useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"
import { AlignLeft, Clock, Type } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function getStats(text: string) {
  const trimmed = text.trim()
  const words = trimmed ? trimmed.split(/\s+/).length : 0
  const chars = text.length
  const readTime = Math.max(1, Math.ceil(words / 200))
  return { words, chars, readTime }
}

interface EditorWordCountProps {
  editor: Editor
}

export function EditorWordCount({ editor }: EditorWordCountProps) {
  const [stats, setStats] = useState(() => getStats(editor.getText()))

  useEffect(() => {
    const update = () => setStats(getStats(editor.getText()))
    editor.on("update", update)
    return () => { editor.off("update", update) }
  }, [editor])

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5 pt-3 pb-1 select-none">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="gap-1.5 px-2 py-0.5 text-[11px] font-normal cursor-default"
            >
              <Type className="h-3 w-3" />
              {stats.words} {stats.words === 1 ? "word" : "words"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">Word count</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-3" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="gap-1.5 px-2 py-0.5 text-[11px] font-normal cursor-default"
            >
              <AlignLeft className="h-3 w-3" />
              {stats.chars} chars
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">Character count</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-3" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="gap-1.5 px-2 py-0.5 text-[11px] font-normal cursor-default"
            >
              <Clock className="h-3 w-3" />
              {stats.readTime} min read
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">Estimated reading time (200 wpm)</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
