"use client"

import { Extension } from "@tiptap/react"
import Suggestion, {
  type SuggestionOptions,
  type SuggestionProps,
  type SuggestionKeyDownProps,
} from "@tiptap/suggestion"
import { createRef } from "react"
import { createRoot, type Root } from "react-dom/client"
import { SlashMenu, type SlashMenuRef } from "./slash-menu"
import { filterSlashItems, type SlashItem } from "./slash-items"

function buildRenderer() {
  let container: HTMLDivElement | null = null
  let root: Root | null = null
  const menuRef = createRef<SlashMenuRef>()

  function position(rect: DOMRect) {
    if (!container) return
    const MARGIN = 8
    const menuW = 256
    const viewW = window.innerWidth
    const viewH = window.innerHeight

    let top = rect.bottom + MARGIN
    let left = rect.left

    if (top + 320 > viewH) top = rect.top - 320 - MARGIN
    if (left + menuW > viewW) left = viewW - menuW - MARGIN

    container.style.top = `${top}px`
    container.style.left = `${left}px`
  }

  function render(props: SuggestionProps<SlashItem>) {
    root?.render(
      <SlashMenu
        ref={menuRef}
        items={props.items}
        command={(item) => props.command(item)}
      />
    )
  }

  return {
    onStart(props: SuggestionProps<SlashItem>) {
      container = document.createElement("div")
      container.style.cssText =
        "position:fixed;z-index:9999;outline:none;"
      document.body.appendChild(container)

      const rect = props.clientRect?.()
      if (rect) position(rect)

      root = createRoot(container)
      render(props)
    },

    onUpdate(props: SuggestionProps<SlashItem>) {
      const rect = props.clientRect?.()
      if (rect) position(rect)
      render(props)
    },

    onKeyDown(props: SuggestionKeyDownProps): boolean {
      if (props.event.key === "Escape") {
        root?.unmount()
        container?.remove()
        root = null
        container = null
        return true
      }
      return menuRef.current?.onKeyDown(props.event) ?? false
    },

    onExit() {
      root?.unmount()
      container?.remove()
      root = null
      container = null
    },
  }
}

export type SlashCommandOptions = {
  suggestion: Omit<SuggestionOptions<SlashItem>, "editor">
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        allowSpaces: false,
        items({ query }) {
          return filterSlashItems(query)
        },
        command({ editor, range, props }) {
          props.command(editor, range)
        },
        render: buildRenderer,
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
