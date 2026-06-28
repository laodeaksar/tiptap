import { query, mutation } from "convex/server"

export const getBlocks = query(async ({ db }, docId: string) => {
  return await db
    .query("blocks")
    .withIndex("docId", (q) => q.eq("docId", docId))
    .orderBy("order", "asc")
    .collect()
})

export const createBlock = mutation(async ({ db }, docId: string, type: string, content: any, order: number) => {
  return await db.insert("blocks", { docId, type, content, order })
})

export const updateBlock = mutation(async ({ db }, blockId: string, updates: { content?: any; order?: number }) => {
  await db.patch(blockId, updates)
  return true
})

export const deleteBlock = mutation(async ({ db }, blockId: string) => {
  await db.delete(blockId)
  return true
})

export const reorderBlocks = mutation(async ({ db }, docId: string, blockIds: string[]) => {
  for (let index = 0; index < blockIds.length; index++) {
    await db.patch(blockIds[index], { order: index })
  }
  return true
})
