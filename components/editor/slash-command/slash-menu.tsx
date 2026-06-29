"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { type SlashItem, SLASH_GROUPS } from "./slash-items"

export interface SlashMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean
}

interface SlashMenuProps {
  items: SlashItem[]
  command: (item: SlashItem) => void
}

export const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const itemRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
      setSelectedIndex(0)
    }, [items])

    useEffect(() => {
      itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" })
    }, [selectedIndex])

    useImperativeHandle(ref, () => ({
      onKeyDown(event: KeyboardEvent) {
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) => (i - 1 + items.length) % items.length)
          return true
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % items.length)
          return true
        }
        if (event.key === "Enter") {
          const item = items[selectedIndex]
          if (item) command(item)
          return true
        }
        return false
      },
    }))

    if (!items.length) {
      return (
        <Command
          shouldFilter={false}
          className="w-64 rounded-xl border bg-popover shadow-lg"
        >
          <CommandList>
            <CommandEmpty className="py-4 text-xs text-muted-foreground">
              No commands found
            </CommandEmpty>
          </CommandList>
        </Command>
      )
    }

    let flatIndex = 0

    return (
      <Command
        shouldFilter={false}
        className="w-64 rounded-xl border bg-popover shadow-lg"
      >
        <CommandList className="max-h-72">
          {SLASH_GROUPS.filter((g) => items.some((i) => i.group === g)).map(
            (group) => {
              const groupItems = items.filter((i) => i.group === group)
              return (
                <CommandGroup key={group} heading={group}>
                  {groupItems.map((item) => {
                    const idx = flatIndex++
                    const isSelected = idx === selectedIndex
                    return (
                      <CommandItem
                        key={item.title}
                        ref={(el) => {
                          itemRefs.current[idx] = el
                        }}
                        value={item.title}
                        data-selected={isSelected ? "true" : undefined}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5"
                        onSelect={() => command(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-none">
                            {item.title}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )
            }
          )}
        </CommandList>
      </Command>
    )
  }
)

SlashMenu.displayName = "SlashMenu"
