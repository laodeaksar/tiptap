import { NextResponse } from "next/server"
import { readDocuments, createDocument } from "@/lib/db"

export async function GET() {
  const docs = readDocuments()
  return NextResponse.json(docs)
}

export async function POST(request: Request) {
  const body = await request.json()
  const doc = createDocument(body.title ?? "Untitled")
  return NextResponse.json(doc, { status: 201 })
}
