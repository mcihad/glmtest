import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { LayoutGrid, List, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLayout } from '@/lib/layout/use-layout'
import { APPS } from '@/config/apps'
import { cn } from '@/lib/utils'

type View = 'grid' | 'list'

export function AppLauncher() {
  const { launcherOpen, setLauncherOpen } = useLayout()
  const navigate = useNavigate()
  const [view, setView] = React.useState<View>('grid')
  const [query, setQuery] = React.useState('')

  const filtered = APPS.filter((a) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    )
  })

  const open = (to: string) => {
    setLauncherOpen(false)
    setQuery('')
    navigate({ to })
  }

  return (
    <Dialog
      open={launcherOpen}
      onOpenChange={(o) => {
        setLauncherOpen(o)
        if (!o) setQuery('')
      }}
    >
      <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0 text-left">
          <DialogTitle>Applications</DialogTitle>
          <DialogDescription>Switch to another app or workspace.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 px-5 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search applications..."
              className="pl-8"
            />
          </div>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as View)}
          >
            <ToggleGroupItem value="grid" variant="outline" size="sm" aria-label="Grid view">
              <LayoutGrid />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" variant="outline" size="sm" aria-label="List view">
              <List />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <ScrollArea className="max-h-[60vh]">
          {filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No applications match “{query}”.
            </p>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-3 gap-2 p-5 pt-0 sm:grid-cols-4">
              {filtered.map((app) => (
                <button
                  key={app.id}
                  onClick={() => open(app.to)}
                  className="group flex flex-col items-center gap-2 rounded-xl p-3 text-center outline-none transition-colors hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <span
                    className="flex size-12 items-center justify-center rounded-2xl text-white shadow-sm transition-transform group-hover:scale-105"
                    style={{ backgroundColor: app.color }}
                  >
                    <app.icon className="size-5" />
                  </span>
                  <span className="text-xs font-medium leading-tight">{app.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col p-2">
              {filtered.map((app) => (
                <button
                  key={app.id}
                  onClick={() => open(app.to)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg p-3 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  )}
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
                    style={{ backgroundColor: app.color }}
                  >
                    <app.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{app.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {app.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
