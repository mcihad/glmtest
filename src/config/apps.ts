import type { LucideIcon } from 'lucide-react'
import {
  Boxes,
  BarChart3,
  Map,
  Workflow,
  Server,
  ShieldCheck,
  Library,
  FolderKanban,
  Gauge,
  Bell,
} from 'lucide-react'

export interface AppEntry {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  to: string
}

export const APPS: AppEntry[] = [
  {
    id: 'console',
    name: 'Console',
    description: 'Operational dashboard & control plane',
    icon: Boxes,
    color: 'oklch(0.55 0.22 295)',
    to: '/',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Metrics, sessions & reports',
    icon: BarChart3,
    color: 'oklch(0.55 0.2 255)',
    to: '/analytics',
  },
  {
    id: 'projects',
    name: 'Projects',
    description: 'Track work across initiatives',
    icon: FolderKanban,
    color: 'oklch(0.6 0.15 155)',
    to: '/projects',
  },
  {
    id: 'catalog',
    name: 'Catalog',
    description: 'Service & resource marketplace',
    icon: Library,
    color: 'oklch(0.72 0.16 65)',
    to: '/catalog',
  },
  {
    id: 'map',
    name: 'Map',
    description: 'Geo & topology canvas',
    icon: Map,
    color: 'oklch(0.6 0.13 195)',
    to: '/map',
  },
  {
    id: 'workflows',
    name: 'Workflows',
    description: 'Automations & pipelines',
    icon: Workflow,
    color: 'oklch(0.6 0.21 15)',
    to: '/workflows',
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    description: 'Live health & alerts',
    icon: Gauge,
    color: 'oklch(0.58 0.22 25)',
    to: '/admin/infrastructure',
  },
  {
    id: 'infra',
    name: 'Infrastructure',
    description: 'Nodes, compute & databases',
    icon: Server,
    color: 'oklch(0.55 0.2 255)',
    to: '/admin/nodes',
  },
  {
    id: 'access',
    name: 'Access',
    description: 'Users, roles & API keys',
    icon: ShieldCheck,
    color: 'oklch(0.6 0.15 155)',
    to: '/admin/access',
  },
  {
    id: 'alerts',
    name: 'Alerts',
    description: 'Notification center',
    icon: Bell,
    color: 'oklch(0.72 0.16 65)',
    to: '/help',
  },
]
