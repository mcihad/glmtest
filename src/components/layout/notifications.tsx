import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  description: string
  time: string
  unread?: boolean
  tone?: 'default' | 'success' | 'warning' | 'destructive'
}

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Deployment succeeded',
    description: 'console v1.4.2 rolled out to production.',
    time: '2m ago',
    unread: true,
    tone: 'success',
  },
  {
    id: '2',
    title: 'High latency on node-04',
    description: 'p95 latency exceeded 800ms for 5 minutes.',
    time: '18m ago',
    unread: true,
    tone: 'warning',
  },
  {
    id: '3',
    title: 'New API key created',
    description: '“ci-runner” key was added by cihad.',
    time: '1h ago',
    unread: false,
  },
]

const toneDot: Record<NonNullable<Notification['tone']>, string> = {
  default: 'bg-muted-foreground',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
}

export function Notifications() {
  const unread = NOTIFICATIONS.filter((n) => n.unread).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
          <Bell className="size-[1.15rem]" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex size-2 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unread > 0 && <Badge variant="secondary">{unread} new</Badge>}
          </div>
          <button className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <Check className="size-3" /> Mark all read
          </button>
        </div>
        <Separator />
        <div className="max-h-80 overflow-y-auto">
          {NOTIFICATIONS.map((n) => (
            <div
              key={n.id}
              className={cn(
                'flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
                n.unread && 'bg-muted/30',
              )}
            >
              <span
                className={cn(
                  'mt-1.5 size-2 shrink-0 rounded-full',
                  toneDot[n.tone ?? 'default'],
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {n.description}
                </p>
                <p className="mt-1 text-2xs text-muted-foreground">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
