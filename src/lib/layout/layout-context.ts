import { createContext } from 'react'

export interface LayoutContextValue {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void

  mobileSidebarOpen: boolean
  setMobileSidebarOpen: (v: boolean) => void

  launcherOpen: boolean
  setLauncherOpen: (v: boolean) => void

  commandOpen: boolean
  setCommandOpen: (v: boolean) => void

  aiOpen: boolean
  setAiOpen: (v: boolean) => void

  customizerOpen: boolean
  setCustomizerOpen: (v: boolean) => void

  feedbackOpen: boolean
  setFeedbackOpen: (v: boolean) => void

  footerSlot: HTMLDivElement | null
  setFooterSlot: (el: HTMLDivElement | null) => void
  pageFooterActive: boolean
  setPageFooterActive: (v: boolean) => void
}

export const LayoutContext = createContext<LayoutContextValue | null>(null)
