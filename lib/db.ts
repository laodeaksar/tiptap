import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const DB_FILE = path.join(DATA_DIR, "documents.json")

export interface Document {
  id: string
  title: string
  icon: string
  content: Record<string, unknown> | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]), "utf-8")
  }
}

export function readDocuments(): Document[] {
  ensureDataDir()
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8")
    return JSON.parse(raw) as Document[]
  } catch {
    return []
  }
}

export function writeDocuments(docs: Document[]): void {
  ensureDataDir()
  fs.writeFileSync(DB_FILE, JSON.stringify(docs, null, 2), "utf-8")
}

export function getDocumentById(id: string): Document | undefined {
  return readDocuments().find((d) => d.id === id)
}

export function createDocument(title: string): Document {
  const docs = readDocuments()
  const doc: Document = {
    id: crypto.randomUUID(),
    title: title || "Untitled",
    icon: "📄",
    content: null,
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  docs.unshift(doc)
  writeDocuments(docs)
  return doc
}

export function updateDocument(id: string, updates: Partial<Omit<Document, "id" | "createdAt">>): Document | null {
  const docs = readDocuments()
  const idx = docs.findIndex((d) => d.id === id)
  if (idx === -1) return null
  docs[idx] = { ...docs[idx], ...updates, updatedAt: new Date().toISOString() }
  writeDocuments(docs)
  return docs[idx]
}

export function deleteDocument(id: string): boolean {
  const docs = readDocuments()
  const idx = docs.findIndex((d) => d.id === id)
  if (idx === -1) return false
  docs.splice(idx, 1)
  writeDocuments(docs)
  return true
}
