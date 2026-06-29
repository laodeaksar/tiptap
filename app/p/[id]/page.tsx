import { getDocumentById } from "@/lib/db"
import { Editor } from "@/components/editor/editor"
import { notFound } from "next/navigation"
import { Globe, FileText } from "lucide-react"

export default async function PublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doc = getDocumentById(id)

  if (!doc) notFound()
  if (!doc.isPublic) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <FileText className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold">This page is private</h1>
        <p className="text-sm text-muted-foreground">The owner hasn&apos;t made this page public.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-8 py-3">
          <span className="text-xl">{doc.icon}</span>
          <h1 className="flex-1 truncate text-sm font-medium">{doc.title}</h1>
          <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs text-green-600 dark:text-green-400">
            <Globe className="h-3 w-3" />
            Public
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-8 py-10">
        <h1 className="mb-6 text-4xl font-bold tracking-tight">
          {doc.icon} {doc.title}
        </h1>
        <Editor content={doc.content} editable={false} />
      </main>

      <footer className="mt-16 border-t py-6 text-center text-xs text-muted-foreground">
        Made with Notion Clone on Replit
      </footer>
    </div>
  )
}
