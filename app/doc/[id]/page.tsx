"use client"

import { useState, useEffect, useCallback, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { Editor } from "@/components/editor/editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Share2,
  Globe,
  Lock,
  Trash2,
  Check,
  Moon,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"

interface Document {
  id: string
  title: string
  icon: string
  content: Record<string, unknown> | null
  isPublic: boolean
  updatedAt: string
}

export default function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [icon, setIcon] = useState("📄")
  const [saved, setSaved] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchDoc = useCallback(async () => {
    const res = await fetch(`/api/documents/${id}`)
    if (res.ok) {
      const data = await res.json()
      setDoc(data)
      setTitle(data.title)
      setIcon(data.icon)
    } else {
      router.push("/")
    }
    setLoading(false)
  }, [id, router])

  useEffect(() => {
    fetchDoc()
  }, [fetchDoc])

  const save = useCallback(
    async (updates: Partial<Document>) => {
      await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
    [id]
  )

  const handleContentChange = useCallback(
    (content: Record<string, unknown>) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        save({ content })
      }, 800)
    },
    [save]
  )

  const handleTitleBlur = () => {
    if (title !== doc?.title) save({ title })
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") (e.target as HTMLInputElement).blur()
  }

  const togglePublic = async () => {
    const updated = !doc?.isPublic
    setDoc((prev) => (prev ? { ...prev, isPublic: updated } : prev))
    await save({ isPublic: updated })
    if (updated) {
      const url = `${window.location.origin}/p/${id}`
      await navigator.clipboard.writeText(url).catch(() => {})
      toast.success("Public link copied to clipboard!", {
        description: url,
      })
    } else {
      toast("Page is now private")
    }
  }

  const copyShareLink = async () => {
    const url = `${window.location.origin}/p/${id}`
    await navigator.clipboard.writeText(url).catch(() => {})
    toast.success("Link copied!", { description: url })
  }

  const deleteDoc = async () => {
    if (!confirm("Delete this page permanently?")) return
    await fetch(`/api/documents/${id}`, { method: "DELETE" })
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!doc) return null

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          <button
            className="shrink-0 text-lg leading-none"
            onClick={() => {
              const emoji = window.prompt("Choose an emoji icon", icon)
              if (emoji) {
                setIcon(emoji)
                save({ icon: emoji })
              }
            }}
          >
            {icon}
          </button>
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
          {saved && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Check className="h-3 w-3" />
              Saved
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={togglePublic}
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

          {doc.isPublic && (
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={copyShareLink}>
              <Share2 className="h-3.5 w-3.5" />
              Copy link
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={deleteDoc}>
            <Trash2 className="h-4 w-4" />
          </Button>
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
  )
}
