import * as React from 'react'
import { Outlet } from '@tanstack/react-router'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { LayoutContext, type LayoutContextValue } from '@/lib/layout/layout-context'
import { SidebarInner } from './sidebar'
import { AppBar } from './app-bar'
import { AppFooter } from './footer'
import { AiChat } from './ai-chat'
import { AppLauncher } from './app-launcher'
import { CommandLauncher } from './command-launcher'
import { FeedbackDialog } from './feedback-dialog'
import { ThemeCustomizer } from '@/components/theme-customizer'
import { cn } from '@/lib/utils'

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)
  const [launcherOpen, setLauncherOpen] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [aiOpen, setAiOpen] = React.useState(false)
  const [customizerOpen, setCustomizerOpen] = React.useState(false)
  const [feedbackOpen, setFeedbackOpen] = React.useState(false)
  const [footerSlot, setFooterSlot] = React.useState<HTMLDivElement | null>(null)
  const [pageFooterActive, setPageFooterActive] = React.useState(false)

  const toggleSidebar = React.useCallback(
    () => setSidebarCollapsed((c) => !c),
    [],
  )

  const value = React.useMemo<LayoutContextValue>(
    () => ({
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      mobileSidebarOpen,
      setMobileSidebarOpen,
      launcherOpen,
      setLauncherOpen,
      commandOpen,
      setCommandOpen,
      aiOpen,
      setAiOpen,
      customizerOpen,
      setCustomizerOpen,
      feedbackOpen,
      setFeedbackOpen,
      footerSlot,
      setFooterSlot,
      pageFooterActive,
      setPageFooterActive,
    }),
    [
      sidebarCollapsed,
      toggleSidebar,
      mobileSidebarOpen,
      launcherOpen,
      commandOpen,
      aiOpen,
      customizerOpen,
      feedbackOpen,
      footerSlot,
      pageFooterActive,
    ],
  )

  return (
    <LayoutContext.Provider value={value}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
          {/* Desktop sidebar */}
          <aside
            className={cn(
              'hidden lg:block shrink-0 border-r border-sidebar-border transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-emphasized)]',
              sidebarCollapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
            )}
          >
            <SidebarInner collapsed={sidebarCollapsed} />
          </aside>

          {/* Mobile sidebar */}
          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Main navigation
              </SheetDescription>
              <SidebarInner collapsed={false} />
            </SheetContent>
          </Sheet>

          {/* Content column */}
          <div className="flex min-w-0 flex-1 flex-col">
            <AppBar />
            <main className="min-h-0 flex-1 overflow-y-auto">
              <Outlet />
            </main>
            <AppFooter />
          </div>
        </div>

        {/* Global overlays */}
        <AiChat />
        <AppLauncher />
        <CommandLauncher />
        <FeedbackDialog />
        <ThemeCustomizer />
    </LayoutContext.Provider>
  )
}
