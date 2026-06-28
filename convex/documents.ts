import { query, mutation } from "convex/server"
import { v4 as uuidv4 } from "uuid"

export const seedDocument = mutation(async ({ db }) => {
  const existing = await db.query("documents").first()
  if (existing) return existing._id

  const doc = {
    title: "Welcome",
    userId: "demo",
    icon: "📘",
  }
  return await db.insert("documents", doc)
})

export const createDocument = mutation(async ({ db }, title: string) => {
  const document = {
    title,
    userId: "demo",
    icon: "📝",
  }
  return await db.insert("documents", document)
})

export const renameDocument = mutation(async ({ db }, documentId: string, title: string) => {
  await db.patch(documentId, { title })
  return true
})

export const deleteDocument = mutation(async ({ db }, documentId: string) => {
  await db.delete(documentId)
  return true
})

export const getDocuments = query(async ({ db }) => {
  return await db.query("documents").orderBy("_id", "asc").collect()
})

export const getDocument = query(async ({ db }, documentId: string) => {
  return await db.get(documentId)
})
