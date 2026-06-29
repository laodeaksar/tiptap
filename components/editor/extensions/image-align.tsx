"use client"

import Image from "@tiptap/extension-image"
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react"
import { AlignCenter, AlignLeft, AlignRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Align = "left" | "center" | "right"

function ImageAlignView({
  node,
  updateAttributes,
  selected,
  deleteNode,
}: NodeViewProps) {
  const align = ((node.attrs.align as string) ?? "center") as Align
  const src = node.attrs.src as string
  const alt = (node.attrs.alt as string) ?? ""
  const title = (node.attrs.title as string) ?? ""

  const justifyMap: Record<Align, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  }

  return (
    <NodeViewWrapper
      className="my-3 flex w-full"
      style={{ justifyContent: justifyMap[align] ?? "center" }}
    >
      <div className="relative inline-block max-w-full select-none">
        {selected && (
          <div className="absolute -top-10 left-1/2 z-20 -translate-x-1/2 flex items-center gap-0.5 rounded-lg border bg-popover p-1 shadow-md">
            <TooltipProvider>
              <ToggleGroup
                type="single"
                value={align}
                spacing={0}
                onValueChange={(v) => {
                  if (v) updateAttributes({ align: v as Align })
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value="left"
                      size="sm"
                      variant="outline"
                      aria-label="Align left"
                    >
                      <AlignLeft className="h-3.5 w-3.5" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Align left</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value="center"
                      size="sm"
                      variant="outline"
                      aria-label="Center"
                    >
                      <AlignCenter className="h-3.5 w-3.5" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Center</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value="right"
                      size="sm"
                      variant="outline"
                      aria-label="Align right"
                    >
                      <AlignRight className="h-3.5 w-3.5" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Align right</TooltipContent>
                </Tooltip>
              </ToggleGroup>

              <Separator orientation="vertical" className="mx-0.5 h-5" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => deleteNode()}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Delete image</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        <img
          src={src}
          alt={alt}
          title={title || undefined}
          className="block max-w-full rounded-lg"
          style={{
            outline: selected ? "2px solid hsl(var(--ring))" : "2px solid transparent",
            outlineOffset: "2px",
            transition: "outline-color 0.1s",
          }}
          draggable={false}
        />
      </div>
    </NodeViewWrapper>
  )
}

export const ImageAlign = Image.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center" as Align,
        parseHTML: (el) => (el.getAttribute("data-align") as Align) ?? "center",
        renderHTML: (attrs) => ({ "data-align": attrs.align }),
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageAlignView)
  },
})
