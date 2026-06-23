import * as React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  Search,
  ChevronRight,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { NAVIGATION, type NavItem, type NavGroup } from '@/config/navigation'
import { cn } from '@/lib/utils'

function matchItem(item: NavItem, q: string): boolean {
  const hay = [item.title, ...(item.keywords ?? [])].join(' ').toLowerCase()
  return hay.includes(q)
}

interface FilteredNode {
  item: NavItem
  matched: boolean
  children: FilteredNode[]
  hasMatchedDescendant: boolean
}

function filterItems(items: NavItem[], q: string): FilteredNode[] {
  const out: FilteredNode[] = []
  for (const item of items) {
    const matched = matchItem(item, q)
    const children = item.children ? filterItems(item.children, q) : []
    const hasMatchedDescendant = children.some(
      (c) => c.matched || c.hasMatchedDescendant,
    )
    if (matched || hasMatchedDescendant) {
      out.push({ item, matched, children, hasMatchedDescendant })
    }
  }
  return out
}

function containsActive(item: NavItem, pathname: string): boolean {
  if (item.to && item.to === pathname) return true
  if (item.to && pathname !== '/' && pathname.startsWith(item.to + '/')) return true
  return item.children?.some((c) => containsActive(c, pathname)) ?? false
}

function NavLeaf({
  item,
  collapsed = false,
}: {
  item: NavItem
  collapsed?: boolean
}) {
  const location = useLocation()
  const isActive = item.to === location.pathname
  const Icon = item.icon

  const content = (
    <Link
      to={item.to}
      data-slot="nav-leaf"
      data-status={isActive ? 'active' : 'inactive'}
      className={cn(
        'group flex h-8 items-center gap-2.5 rounded-md px-2 text-sm outline-none transition-colors',
        'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'data-[status=active]:bg-sidebar-accent data-[status=active]:font-medium data-[status=active]:text-sidebar-accent-foreground',
        collapsed && 'w-full justify-center px-0',
      )}
    >
      {Icon && <Icon className="size-4 shrink-0" />}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="px-1.5 py-0 text-2xs">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    )
  }
  return content
}

function NavBranch({
  node,
  forcedOpen,
  collapsed = false,
}: {
  node: FilteredNode
  forcedOpen?: boolean
  collapsed?: boolean
}) {
  const location = useLocation()
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = forcedOpen ?? internalOpen
  const Icon = node.item.icon
  const active = containsActive(node.item, location.pathname)

  if (collapsed) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            data-slot="nav-branch-rail"
            className={cn(
              'flex size-9 items-center justify-center rounded-md text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              active && 'bg-sidebar-accent text-sidebar-accent-foreground',
            )}
          >
            {Icon && <Icon className="size-4" />}
          </button>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="w-52 p-1">
          <p className="px-2 py-1.5 text-2xs font-medium text-muted-foreground">
            {node.item.title}
          </p>
          {node.item.children?.map((child) => (
            <NavLeaf key={child.to ?? child.title} item={child} />
          ))}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setInternalOpen}>
      <CollapsibleTrigger asChild>
        <button
          data-slot="nav-branch-trigger"
          className={cn(
            'group/branch flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-sm outline-none transition-colors',
            'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          )}
        >
          {Icon && <Icon className="size-4 shrink-0" />}
          <span className="flex-1 truncate text-left">{node.item.title}</span>
          {node.item.badge && (
            <Badge variant="secondary" className="px-1.5 py-0 text-2xs">
              {node.item.badge}
            </Badge>
          )}
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/branch:rotate-90" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-3.5 border-l border-sidebar-border pl-2.5">
          {node.children.map((child) =>
            child.item.children?.length ? (
              <NavBranch key={child.item.to ?? child.item.title} node={child} forcedOpen={open} />
            ) : (
              <NavLeaf key={child.item.to ?? child.item.title} item={child.item} />
            ),
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const [query, setQuery] = React.useState('')
  const q = query.trim().toLowerCase()
  const searching = q.length > 0

  const groups = React.useMemo(() => {
    if (!searching) return NAVIGATION
    return NAVIGATION.map((g) => ({
      ...g,
      items: filterItems(g.items, q).map((n) => n.item),
    })).filter((g) => g.items.length > 0) as NavGroup[]
  }, [q, searching])

  // Re-derive filtered nodes for open-state control.
  const filteredNodes = React.useMemo(() => {
    if (!searching) return null
    return NAVIGATION.map((g) => ({
      label: g.label,
      nodes: filterItems(g.items, q),
    })).filter((g) => g.nodes.length > 0)
  }, [q, searching])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 pt-3">
      {!collapsed && (
        <div className="relative px-3">
          <Search className="absolute left-5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search menu..."
            className="h-8 pl-8"
            aria-label="Search menu"
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-3">
        {collapsed ? (
          <RailNav />
        ) : searching && filteredNodes ? (
          <nav className="flex flex-col gap-4">
            {filteredNodes.map((g) => (
              <div key={g.label ?? 'general'} className="flex flex-col gap-1">
                {g.label && (
                  <p className="px-2 py-1 text-2xs font-medium uppercase tracking-widest text-muted-foreground">
                    {g.label}
                  </p>
                )}
                {g.nodes.map((node) =>
                  node.item.children?.length ? (
                    <NavBranch key={node.item.to ?? node.item.title} node={node} forcedOpen />
                  ) : (
                    <NavLeaf key={node.item.to ?? node.item.title} item={node.item} />
                  ),
                )}
              </div>
            ))}
          </nav>
        ) : (
          <nav className="flex flex-col gap-4">
            {groups.map((g, gi) => (
              <div key={g.label ?? `g-${gi}`} className="flex flex-col gap-1">
                {g.label && (
                  <p className="px-2 py-1 text-2xs font-medium uppercase tracking-widest text-muted-foreground">
                    {g.label}
                  </p>
                )}
                {g.items.map((item) =>
                  item.children?.length ? (
                    <BranchWrapper key={item.to ?? item.title} item={item} />
                  ) : (
                    <NavLeaf key={item.to ?? item.title} item={item} />
                  ),
                )}
              </div>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}

// Non-search branch that auto-opens when it contains the active route.
function BranchWrapper({ item }: { item: NavItem }) {
  const location = useLocation()
  const active = containsActive(item, location.pathname)
  const node: FilteredNode = {
    item,
    matched: false,
    hasMatchedDescendant: false,
    children: item.children
      ? filterItems(item.children, '')
      : [],
  }
  return <NavBranch node={node} forcedOpen={active || undefined} />
}

function RailNav() {
  return (
    <nav className="flex flex-col items-center gap-1">
      {NAVIGATION.map((g, gi) => (
        <React.Fragment key={g.label ?? `g-${gi}`}>
          {gi > 0 && <div className="my-1 h-px w-6 bg-sidebar-border" />}
          {g.items.map((item) =>
            item.children?.length ? (
              <NavBranch
                key={item.to ?? item.title}
                node={{
                  item,
                  matched: false,
                  hasMatchedDescendant: false,
                  children: [],
                }}
                collapsed
              />
            ) : (
              <NavLeaf key={item.to ?? item.title} item={item} collapsed />
            ),
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
