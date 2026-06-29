import { NextResponse } from "next/server"
import { getDocumentById, updateDocument, deleteDocument } from "@/lib/db"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doc = getDocumentById(id)
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(doc)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const updated = updateDocument(id, body)
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = deleteDocument(id)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
