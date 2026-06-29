"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, FileText, Trash2, Moon, Sun, Search } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { documentsApi, queryKeys } from "@/lib/api"

export function NotionEditor() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { resolvedTheme, setTheme } = useTheme()
  const [search, setSearch] = useState("")

  const { data: documents = [], isLoading } = useQuery({
    queryKey: queryKeys.documents,
    queryFn: documentsApi.list,
  })

  const createMutation = useMutation({
    mutationFn: () => documentsApi.create("Untitled"),
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents })
      router.push(`/doc/${doc.id}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.documents })
      const previous = queryClient.getQueryData(queryKeys.documents)
      queryClient.setQueryData(
        queryKeys.documents,
        (old: typeof documents) => old.filter((d) => d.id !== id)
      )
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.documents, ctx.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents })
    },
  })

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-background">
      <aside className="flex w-64 flex-col border-r bg-sidebar">
        <div className="flex items-center justify-between p-4">
          <span className="text-sm font-semibold text-sidebar-foreground">My Notes</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>

        <div className="px-3 pb-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-xs"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            <Plus className="h-3.5 w-3.5" />
            New Page
          </Button>
        </div>

        <Separator />

        <ScrollArea className="flex-1 py-2">
          {isLoading ? (
            <div className="space-y-1 px-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">
              {search ? "No results found" : "No pages yet. Create one above."}
            </p>
          ) : (
            <div className="space-y-0.5 px-2">
              {filtered.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => router.push(`/doc/${doc.id}`)}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    "hover:bg-sidebar-accent text-sidebar-foreground"
                  )}
                >
                  <span className="shrink-0 text-base">{doc.icon}</span>
                  <span className="flex-1 truncate">{doc.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    disabled={deleteMutation.isPending}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteMutation.mutate(doc.id)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />
        <div className="p-3">
          <p className="text-center text-[10px] text-muted-foreground">
            Press <kbd className="rounded bg-muted px-1 font-mono text-[10px]">D</kbd> to toggle dark mode
          </p>
        </div>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold">Select a page</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Choose a page from the sidebar to start editing, or create a new one.
        </p>
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="mt-2 gap-2"
        >
          <Plus className="h-4 w-4" />
          New Page
        </Button>
      </main>
    </div>
  )
}
