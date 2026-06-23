import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useLayout } from '@/lib/layout/use-layout'

function PageWrapper({
  className,
  padded = true,
  ...props
}: React.ComponentProps<'div'> & { padded?: boolean }) {
  return (
    <div
      data-slot="page-wrapper"
      data-padded={padded}
      className={cn(
        padded
          ? 'mx-auto w-full px-[var(--app-page-padding-x)] py-[var(--app-page-padding-y)]'
          : 'relative h-full w-full',
        className,
      )}
      {...props}
    />
  )
}

function PageHeader({
  className,
  title,
  description,
  actions,
  children,
}: {
  className?: string
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        'flex flex-col gap-3 mb-6 md:flex-row md:items-center md:justify-between md:gap-6',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}

function PageActions({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-actions"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  )
}

function PageFooter({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { footerSlot, setPageFooterActive } = useLayout()

  React.useEffect(() => {
    setPageFooterActive(true)
    return () => setPageFooterActive(false)
  }, [setPageFooterActive])

  if (!footerSlot) return null

  return createPortal(
    <div
      data-slot="page-footer"
      className={cn('flex h-full items-center gap-4 px-4', className)}
    >
      {children}
    </div>,
    footerSlot,
  )
}

function PageFooterStat({
  label,
  value,
  className,
}: {
  label: React.ReactNode
  value: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="page-footer-stat"
      className={cn('flex items-baseline gap-1.5 text-xs', className)}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </div>
  )
}

export { PageWrapper, PageHeader, PageActions, PageFooter, PageFooterStat }
