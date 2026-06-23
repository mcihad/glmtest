import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  BarChart3,
  Component,
  Map,
  HelpCircle,
  FolderKanban,
  Library,
  Server,
  ShieldCheck,
  Users,
  Gauge,
  Database,
  Workflow,
  KeyRound,
} from 'lucide-react'

export interface NavItem {
  title: string
  icon?: LucideIcon
  to?: string
  badge?: string
  children?: NavItem[]
  keywords?: string[]
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

export const NAVIGATION: NavGroup[] = [
  {
    items: [
      {
        title: 'Dashboard',
        icon: LayoutDashboard,
        to: '/',
        keywords: ['home', 'overview', 'start'],
      },
    ],
  },
  {
    label: 'Workspace',
    items: [
      {
        title: 'Projects',
        icon: FolderKanban,
        to: '/projects',
        badge: '12',
        keywords: ['folders', 'work', 'initiatives'],
      },
      {
        title: 'Catalog',
        icon: Library,
        to: '/catalog',
        keywords: ['services', 'items', 'marketplace'],
      },
      {
        title: 'Analytics',
        icon: BarChart3,
        to: '/analytics',
        keywords: ['metrics', 'reports', 'sessions'],
      },
      {
        title: 'Components',
        icon: Component,
        to: '/components',
        keywords: ['ui', 'gallery', 'primitives'],
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        title: 'Map',
        icon: Map,
        to: '/map',
        keywords: ['geo', 'canvas', 'fullscreen'],
      },
      {
        title: 'Workflows',
        icon: Workflow,
        to: '/workflows',
        keywords: ['automation', 'pipeline'],
        children: [
          { title: 'Pipelines', icon: Workflow, to: '/workflows/pipelines' },
          { title: 'Runs', icon: Gauge, to: '/workflows/runs', badge: '3' },
        ],
      },
    ],
  },
  {
    label: 'Admin',
    items: [
      {
        title: 'Infrastructure',
        icon: Server,
        to: '/admin/infrastructure',
        keywords: ['servers', 'nodes', 'compute'],
        children: [
          { title: 'Nodes', icon: Server, to: '/admin/nodes' },
          { title: 'Databases', icon: Database, to: '/admin/databases' },
        ],
      },
      {
        title: 'Access',
        icon: ShieldCheck,
        to: '/admin/access',
        keywords: ['permissions', 'roles', 'iam'],
        children: [
          { title: 'Users', icon: Users, to: '/admin/users' },
          { title: 'API Keys', icon: KeyRound, to: '/admin/api-keys' },
        ],
      },
    ],
  },
]

export const SIDEBAR_FOOTER_ITEMS: NavItem[] = [
  {
    title: 'Help & Docs',
    icon: HelpCircle,
    to: '/help',
    keywords: ['docs', 'support', 'guides'],
  },
]

export const APP_ADDRESS = 'console.kentos.io'
export const APP_NAME = 'KentOS Console'
export const APP_ENV = 'Production'
export const APP_VERSION = 'v1.4.2'

export function flattenLeaves(groups: NavGroup[] = NAVIGATION): NavItem[] {
  const out: NavItem[] = []
  const walk = (items: NavItem[]) => {
    for (const item of items) {
      if (item.to) out.push(item)
      if (item.children) walk(item.children)
    }
  }
  groups.forEach((g) => walk(g.items))
  return out
}
