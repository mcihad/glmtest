import { useLayout } from '@/lib/layout/use-layout'
import { APP_VERSION, APP_ADDRESS } from '@/config/navigation'
import { cn } from '@/lib/utils'

function AppFooter({ className }: { className?: string }) {
  const { setFooterSlot, pageFooterActive } = useLayout()

  return (
    <footer
      data-slot="app-footer"
      className={cn(
        'flex h-footer shrink-0 items-center border-t bg-background px-4 text-xs text-muted-foreground',
        className,
      )}
    >
      {/* Portal target for page-supplied footer content */}
      <div ref={setFooterSlot} className="contents" />

      {!pageFooterActive && (
        <div className="flex w-full items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-success" />
            <span>All systems operational</span>
          </span>
          <Separator />
          <span className="tabular-nums">{APP_VERSION}</span>
          <Separator />
          <span className="hidden sm:inline">{APP_ADDRESS}</span>
          <nav className="ml-auto hidden items-center gap-3 sm:flex">
            <a className="transition-colors hover:text-foreground" href="#">Privacy</a>
            <a className="transition-colors hover:text-foreground" href="#">Terms</a>
            <span>&copy; {new Date().getFullYear()} KentOS</span>
          </nav>
        </div>
      )}
    </footer>
  )
}

function Separator() {
  return <span className="text-border">·</span>
}

export { AppFooter }
