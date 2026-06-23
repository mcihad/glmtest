import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Boxes, PanelLeftClose, LifeBuoy, MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { SidebarNav } from './sidebar-nav'
import { useLayout } from '@/lib/layout/use-layout'
import { APP_NAME, APP_ENV } from '@/config/navigation'
import { cn } from '@/lib/utils'

export function SidebarInner({ collapsed = false }: { collapsed?: boolean }) {
  const { setLauncherOpen, toggleSidebar, setFeedbackOpen } = useLayout()

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div
        className={cn(
          'flex h-appbar shrink-0 items-center gap-2 border-b border-sidebar-border px-3',
          collapsed && 'justify-center px-0',
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="size-9 rounded-lg"
              onClick={() => setLauncherOpen(true)}
              aria-label="Applications"
            >
              <Boxes className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Applications</TooltipContent>
        </Tooltip>

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{APP_NAME}</p>
            <p className="truncate text-xs text-muted-foreground">{APP_ENV}</p>
          </div>
        )}

        {!collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleSidebar}
                className="hidden lg:inline-flex"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="size-[1.05rem]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Collapse sidebar</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Nav (includes search) */}
      <SidebarNav collapsed={collapsed} />

      {/* Footer */}
      <div
        className={cn(
          'shrink-0 border-t border-sidebar-border',
          collapsed
            ? 'flex flex-col items-center gap-1 py-2'
            : 'flex h-footer items-center gap-1 px-3',
        )}
      >
        <FooterLink
          to="/help"
          icon={LifeBuoy}
          label="Help & Docs"
          collapsed={collapsed}
        />
        <FooterButton
          icon={MessageSquarePlus}
          label="Send feedback"
          collapsed={collapsed}
          onClick={() => setFeedbackOpen(true)}
        />
      </div>
    </div>
  )
}

function FooterLink({
  to,
  icon: Icon,
  label,
  collapsed,
}: {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  collapsed: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8 rounded-md"
          asChild
        >
          <Link to={to} aria-label={label}>
            <Icon className="size-[1.05rem]" />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side={collapsed ? 'right' : 'top'}>{label}</TooltipContent>
    </Tooltip>
  )
}

function FooterButton({
  icon: Icon,
  label,
  collapsed,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  collapsed: boolean
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8 rounded-md"
          onClick={onClick}
          aria-label={label}
        >
          <Icon className="size-[1.05rem]" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={collapsed ? 'right' : 'top'}>{label}</TooltipContent>
    </Tooltip>
  )
}
