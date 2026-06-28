import { id, type Document } from "convex/schema"

export const documents = {
  title: "string",
  userId: "string",
  icon: "string?",
} satisfies Record<string, Document>

export const blocks = {
  docId: id("documents"),
  type: "string",
  content: "any",
  order: "number",
} satisfies Record<string, Document>
