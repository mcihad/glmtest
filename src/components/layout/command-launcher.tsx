import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Sparkles,
  Palette,
  Moon,
  Sun,
  LayoutGrid,
  Settings,
} from 'lucide-react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { useLayout } from '@/lib/layout/use-layout'
import { useTheme } from '@/lib/theme/use-theme'
import { NAVIGATION, flattenLeaves, type NavItem } from '@/config/navigation'
import { APPS } from '@/config/apps'

export function CommandLauncher() {
  const { commandOpen, setCommandOpen, setLauncherOpen, setAiOpen, setCustomizerOpen } =
    useLayout()
  const { toggleMode, resolvedMode } = useTheme()
  const navigate = useNavigate()

  // Global ⌘K / Ctrl+K listener.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandOpen(!commandOpen)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [commandOpen, setCommandOpen])

  const go = (to: string) => {
    setCommandOpen(false)
    navigate({ to })
  }

  const leaves = flattenLeaves()
  const leafGroup: { item: NavItem; group: string }[] = []
  for (const g of NAVIGATION) {
    const groupLabel = g.label ?? 'General'
    const walk = (items: NavItem[]) => {
      for (const item of items) {
        if (item.to) leafGroup.push({ item, group: groupLabel })
        if (item.children) walk(item.children)
      }
    }
    walk(g.items)
  }

  return (
    <CommandDialog
      open={commandOpen}
      onOpenChange={setCommandOpen}
      title="Command Palette"
      description="Search commands and navigate"
    >
      <CommandInput placeholder="Search or jump to..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => { setCommandOpen(false); setLauncherOpen(true) }}>
            <LayoutGrid /> Open applications
            <CommandShortcut>Apps</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { setCommandOpen(false); setAiOpen(true) }}>
            <Sparkles /> Ask AI assistant
            <CommandShortcut>AI</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { setCommandOpen(false); setCustomizerOpen(true) }}>
            <Palette /> Customize theme
            <CommandShortcut>Theme</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setCommandOpen(false)
              toggleMode()
            }}
          >
            {resolvedMode === 'dark' ? <Sun /> : <Moon />}
            Toggle {resolvedMode === 'dark' ? 'light' : 'dark'} mode
            <CommandShortcut>Mode</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/settings')}>
            <Settings /> Open settings
            <CommandShortcut>Settings</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Applications">
          {APPS.map((app) => (
            <CommandItem key={app.id} onSelect={() => go(app.to)}>
              <app.icon />
              {app.name}
              <CommandShortcut>{app.description}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          {leafGroup.map(({ item, group }) => (
            <CommandItem
              key={item.to}
              value={`${item.title} ${group} ${(item.keywords ?? []).join(' ')}`}
              onSelect={() => go(item.to!)}
            >
              {item.icon && <item.icon />}
              {item.title}
              <CommandShortcut>{group}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="All routes">
          {leaves.map((item) => (
            <CommandItem key={item.to} value={item.title} onSelect={() => go(item.to!)}>
              {item.icon && <item.icon />}
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
