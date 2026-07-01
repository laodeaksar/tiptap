"use client"

import { useState, useRef, use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Editor } from "@/components/editor/editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { LoadingScreen } from "@/components/loading-screen";
import {
  ArrowLeft,
  Share2,
  Globe,
  Lock,
  Trash2,
  Check,
  Moon,
  Sun,
  Smile,
} from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { documentsApi, queryKeys } from "@/lib/api"

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: "Documents",
    emojis: ["📄", "📃", "📑", "📝", "📋", "📊", "📈", "📉", "🗒️", "🗂️", "📁", "📂"],
  },
  {
    label: "Objects",
    emojis: ["💡", "🔍", "🔑", "⚙️", "🛠️", "📌", "📎", "✏️", "🖊️", "🖋️", "📐", "📏"],
  },
  {
    label: "Nature",
    emojis: ["🌟", "⭐", "✨", "🌈", "🌊", "🔥", "💎", "🌱", "🍀", "🌸", "🍁", "🌙"],
  },
  {
    label: "People",
    emojis: ["👤", "👥", "🙌", "👋", "💪", "🧠", "👀", "❤️", "🎯", "🏆", "🚀", "🎉"],
  },
]

export default function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { resolvedTheme, setTheme } = useTheme()
  const [title, setTitle] = useState("")
  const [icon, setIcon] = useState("📄")
  const [savedFlash, setSavedFlash] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleInitialized = useRef(false)

  const { data: doc, isLoading, isError } = useQuery({
    queryKey: queryKeys.document(id),
    queryFn: () => documentsApi.get(id),
    retry: false,
  })

  useEffect(() => {
    if (doc && !titleInitialized.current) {
      setTitle(doc.title)
      setIcon(doc.icon)
      titleInitialized.current = true
    }
  }, [doc])

  useEffect(() => {
    if (isError) router.push("/")
  }, [isError, router])

  const updateMutation = useMutation({
    mutationFn: (updates: Parameters<typeof documentsApi.update>[1]) =>
      documentsApi.update(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.document(id), updated)
      queryClient.invalidateQueries({ queryKey: queryKeys.documents })
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2000)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents })
      queryClient.removeQueries({ queryKey: queryKeys.document(id) })
      router.push("/")
    },
  })

  const handleContentChange = (content: Record<string, unknown>) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      updateMutation.mutate({ content })
    }, 800)
  }

  const handleTitleBlur = () => {
    if (title !== doc?.title) updateMutation.mutate({ title })
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") (e.target as HTMLInputElement).blur()
  }

  const handleIconSelect = (emoji: string) => {
    setIcon(emoji)
    setEmojiOpen(false)
    updateMutation.mutate({ icon: emoji })
  }

  const togglePublic = async () => {
    if (!doc) return
    const isPublic = !doc.isPublic
    updateMutation.mutate({ isPublic })
    if (isPublic) {
      const url = `${window.location.origin}/p/${id}`
      await navigator.clipboard.writeText(url).catch(() => {})
      toast.success("Public link copied to clipboard!", { description: url })
    } else {
      toast("Page is now private")
    }
  }

  const copyShareLink = async () => {
    const url = `${window.location.origin}/p/${id}`
    await navigator.clipboard.writeText(url).catch(() => {})
    toast.success("Link copied!", { description: url })
  }

  if (isLoading) {
    return (
      <LoadingScreen />
    )
  }

  if (!doc) return null

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-background">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to pages</TooltipContent>
          </Tooltip>

          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button
                      className="shrink-0 text-lg leading-none rounded-md p-0.5 hover:bg-accent transition-colors"
                      aria-label="Change page icon"
                    >
                      {icon}
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Change icon</TooltipContent>
              </Tooltip>

              <PopoverContent align="start" sideOffset={6} className="w-72 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Smile className="h-3.5 w-3.5" />
                  Choose an icon
                </div>
                <div className="space-y-2">
                  {EMOJI_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {group.label}
                      </p>
                      <div className="grid grid-cols-12 gap-0.5">
                        {group.emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleIconSelect(emoji)}
                            className="flex h-7 w-7 items-center justify-center rounded text-base transition-colors hover:bg-accent"
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="h-7 flex-1 border-none bg-transparent p-0 text-sm font-medium shadow-none focus-visible:ring-0"
              placeholder="Untitled"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {(savedFlash || updateMutation.isPending) && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {updateMutation.isPending ? (
                  <span className="h-2.5 w-2.5 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                {updateMutation.isPending ? "Saving…" : "Saved"}
              </span>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={togglePublic}
                  disabled={updateMutation.isPending}
                >
                  {doc.isPublic ? (
                    <>
                      <Globe className="h-3.5 w-3.5 text-green-500" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      Private
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {doc.isPublic ? "Make private" : "Make public & copy link"}
              </TooltipContent>
            </Tooltip>

            {doc.isPublic && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={copyShareLink}>
                    <Share2 className="h-3.5 w-3.5" />
                    Copy link
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy public link</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                >
                  {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete page</TooltipContent>
            </Tooltip>
          </div>
        </header>

        <Separator />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-8 py-10">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground/90 outline-none">
              {icon} {title || "Untitled"}
            </h1>
            <Editor content={doc.content} onChange={handleContentChange} />
          </div>
        </main>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this page?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{icon} {title || "Untitled"}</span> will be
              permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}
