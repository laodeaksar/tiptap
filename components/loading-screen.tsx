import { Spinner } from "@/components/ui/spinner";

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center">
        <Spinner className="size-6" />
    </div>
  )
}

export { LoadingScreen }