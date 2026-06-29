"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Error({ error }: { error: Error }) {
  const router = useRouter()
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">Could not load this page.</p>
      <Button variant="outline" onClick={() => router.push("/")}>
        Go home
      </Button>
    </div>
  )
}
