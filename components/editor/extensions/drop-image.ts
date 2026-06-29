import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
])

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("/api/upload", { method: "POST", body: formData })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? "Upload failed")
  }
  const { url } = await res.json()
  return url as string
}

function insertImageAt(
  view: Parameters<NonNullable<Plugin["props"]["handleDrop"]>>[0],
  url: string,
  pos: number
) {
  const { schema, tr } = view.state
  const node = schema.nodes.image?.create({ src: url })
  if (!node) return
  view.dispatch(tr.insert(pos, node))
}

export const DropImage = Extension.create({
  name: "dropImage",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("dropImage"),
        props: {
          handleDrop(view, event) {
            const dt = (event as DragEvent).dataTransfer
            if (!dt?.files.length) return false

            const images = Array.from(dt.files).filter((f) =>
              ALLOWED_TYPES.has(f.type)
            )
            if (!images.length) return false

            event.preventDefault()

            const coords = { left: event.clientX, top: event.clientY }
            const resolved = view.posAtCoords(coords)
            const insertPos = resolved?.pos ?? view.state.selection.from

            images.forEach(async (file) => {
              try {
                const url = await uploadFile(file)
                insertImageAt(view, url, insertPos)
              } catch (err) {
                console.error("Drop upload failed:", err)
                const msg = err instanceof Error ? err.message : "Upload failed"
                alert(msg)
              }
            })

            return true
          },

          handlePaste(view, event) {
            const cd = (event as ClipboardEvent).clipboardData
            if (!cd?.files.length) return false

            const images = Array.from(cd.files).filter((f) =>
              ALLOWED_TYPES.has(f.type)
            )
            if (!images.length) return false

            event.preventDefault()

            images.forEach(async (file) => {
              try {
                const url = await uploadFile(file)
                const { schema, tr, selection } = view.state
                const node = schema.nodes.image?.create({ src: url })
                if (!node) return
                view.dispatch(tr.replaceSelectionWith(node))
              } catch (err) {
                console.error("Paste upload failed:", err)
                const msg = err instanceof Error ? err.message : "Upload failed"
                alert(msg)
              }
            })

            return true
          },
        },
      }),
    ]
  },
})
