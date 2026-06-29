export interface Document {
  id: string
  title: string
  icon: string
  content: Record<string, unknown> | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.text().catch(() => res.statusText)
    throw new Error(error || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const documentsApi = {
  list(): Promise<Document[]> {
    return fetch("/api/documents").then((r) => handleResponse<Document[]>(r))
  },

  get(id: string): Promise<Document> {
    return fetch(`/api/documents/${id}`).then((r) => handleResponse<Document>(r))
  },

  create(title = "Untitled"): Promise<Document> {
    return fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then((r) => handleResponse<Document>(r))
  },

  update(id: string, updates: Partial<Omit<Document, "id" | "createdAt">>): Promise<Document> {
    return fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).then((r) => handleResponse<Document>(r))
  },

  delete(id: string): Promise<{ success: boolean }> {
    return fetch(`/api/documents/${id}`, { method: "DELETE" }).then((r) =>
      handleResponse<{ success: boolean }>(r)
    )
  },
}

export const queryKeys = {
  documents: ["documents"] as const,
  document: (id: string) => ["documents", id] as const,
}
