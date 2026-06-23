import { Menu, Search, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { AppBreadcrumb } from './app-breadcrumb'
import { Notifications } from './notifications'
import { ModeToggle } from './mode-toggle'
import { UserMenu } from './user-menu'
import { useLayout } from '@/lib/layout/use-layout'

export function AppBar() {
  const { toggleSidebar, setMobileSidebarOpen, setCommandOpen, setCustomizerOpen } =
    useLayout()

  const onMenu = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
      toggleSidebar()
    } else {
      setMobileSidebarOpen(true)
    }
  }

  return (
    <header
      data-slot="app-bar"
      className="sticky top-0 z-[var(--app-z-appbar)] flex h-appbar shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md md:px-4"
    >
      {/* Left */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={onMenu} aria-label="Toggle sidebar">
              <Menu className="size-[1.15rem]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Toggle sidebar</TooltipContent>
        </Tooltip>
        <div className="hidden sm:block">
          <AppBreadcrumb />
        </div>
      </div>

      {/* Center — search-like command trigger */}
      <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 md:block">
        <Button
          variant="outline"
          onClick={() => setCommandOpen(true)}
          className="pointer-events-auto h-9 w-64 justify-start gap-2 rounded-lg border bg-muted/50 px-3 text-muted-foreground hover:bg-muted/70 lg:w-72"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left text-sm">Search or jump to…</span>
          <span className="flex items-center gap-0.5">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </Button>
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCustomizerOpen(true)}
              aria-label="Customize theme"
            >
              <Palette className="size-[1.15rem]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Customize theme</TooltipContent>
        </Tooltip>

        <Notifications />

        <ModeToggle />

        <Separator orientation="vertical" className="mx-1 h-5" />

        <UserMenu />
      </div>
    </header>
  )
}
