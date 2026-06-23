import { createFileRoute, Link } from '@tanstack/react-router'
import { Compass } from 'lucide-react'
import { PageWrapper } from '@/components/layout/page'
import { Button } from '@/components/ui/button'

function NotFoundPage() {
  return (
    <PageWrapper className="max-w-xl">
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="size-7" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The page you’re looking for doesn’t exist or was moved.
          </p>
        </div>
        <Button asChild>
          <Link to="/">Back to dashboard</Link>
        </Button>
      </div>
    </PageWrapper>
  )
}

export const Route = createFileRoute('/$')({ component: NotFoundPage })
