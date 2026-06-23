import * as React from 'react'
import { useLocation, Link } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { NAVIGATION } from '@/config/navigation'

const TITLE_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  const walk = (items: { title: string; to?: string; children?: any[] }[]) => {
    for (const item of items) {
      if (item.to) map[item.to] = item.title
      if (item.children) walk(item.children)
    }
  }
  NAVIGATION.forEach((g) => walk(g.items as any))
  return map
})()

function titleCase(seg: string) {
  return seg
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function AppBreadcrumb() {
  const location = useLocation()
  const pathname = location.pathname
  const segments = pathname.split('/').filter(Boolean)

  let acc = ''

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.length > 0 && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        {segments.length === 0 && (
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        )}
        {segments.map((seg, i) => {
          acc += '/' + seg
          const isLast = i === segments.length - 1
          const label = TITLE_MAP[acc] ?? titleCase(seg)
          if (isLast) {
            return (
              <BreadcrumbItem key={acc}>
                <BreadcrumbPage>{label}</BreadcrumbPage>
              </BreadcrumbItem>
            )
          }
          return (
            <React.Fragment key={acc}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={acc}>{label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
