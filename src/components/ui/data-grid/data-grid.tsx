import * as React from 'react'
import {
  ArrowDown,
  ArrowDownAZ,
  ArrowUp,
  ArrowUpAZ,
  ArrowUpDown,
  Check,
  ChevronRight,
  ChevronsLeftRight,
  ChevronsUpDown,
  Columns3,
  Download,
  Eraser,
  Eye,
  EyeOff,
  Filter,
  GripVertical,
  Layers,
  Minus,
  Pin,
  PinOff,
  Rows3,
  Search,
  Settings2,
  Ungroup,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Kbd } from '@/components/ui/kbd'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'
import type {
  Align,
  ColumnDef,
  ConditionalFormatRule,
  DataGridProps,
  Density,
  FixedSide,
  GridRow,
  GroupRow,
  LeafRow,
  SortState,
  SummaryItem,
} from './types'
import { DENSITY_ROW_HEIGHT } from './types'
import {
  aggregate,
  computeScale,
  evalConditionalFormat,
  exportToCsv,
  filterData,
  flattenGroups,
  formatCellValue,
  formatSummary,
  getCellValue,
  getUniqueValues,
  groupData,
  moveItem,
  sortData,
} from './utils'

const ALIGN_CLASS: Record<Align, string> = {
  left: 'text-left justify-start',
  center: 'text-center justify-center',
  right: 'text-right justify-end',
}

const DEFAULT_COL_WIDTH = 160

interface LayoutSnapshot {
  sorting: SortState[]
  grouping: string[]
  columnOrder: string[]
  columnVisibility: Record<string, boolean>
  columnSizing: Record<string, number>
  columnPinning: { left: string[]; right: string[] }
  density: Density
  striped: boolean
}

export function DataGrid<T>({
  data,
  columns,
  getRowId,
  enableSorting = true,
  enableFiltering = true,
  enableGrouping = true,
  enableColumnResizing = true,
  enableColumnReordering = true,
  enableColumnPinning = true,
  enableColumnHiding = true,
  enableSelection = false,
  enableEditing = false,
  enableMasterDetail = false,
  enableVirtualization = true,
  enableExport = true,
  enableLayoutPersistence = false,
  enableFindPanel = true,
  density: densityProp = 'comfortable',
  striped: stripedProp = false,
  selectionMode = 'multiple',
  onSelectionChange,
  onCellEdit,
  renderDetail,
  rowContextMenu,
  onRowClick,
  onRowDoubleClick,
  summaries,
  groupSummaries,
  layoutKey = 'app-data-grid-layout',
  className,
  height = '100%',
  emptyState,
  initialState,
}: DataGridProps<T>) {
  const rowIdFn = React.useCallback(
    (row: T, index: number) => (getRowId ? getRowId(row, index) : String(index)),
    [getRowId],
  )

  const allColumnIds = React.useMemo(() => columns.map((c) => c.id), [columns])
  const colMap = React.useMemo(
    () => new Map(columns.map((c) => [c.id, c] as const)),
    [columns],
  )

  const loadLayout = React.useCallback((): Partial<LayoutSnapshot> | null => {
    if (!enableLayoutPersistence) return null
    try {
      const raw = localStorage.getItem(layoutKey)
      if (!raw) return null
      return JSON.parse(raw) as Partial<LayoutSnapshot>
    } catch {
      return null
    }
  }, [enableLayoutPersistence, layoutKey])

  const [sorting, setSorting] = React.useState<SortState[]>(
    () => initialState?.sorting ?? loadLayout()?.sorting ?? [],
  )
  const [grouping, setGrouping] = React.useState<string[]>(
    () => initialState?.grouping ?? loadLayout()?.grouping ?? [],
  )
  const [columnOrder, setColumnOrder] = React.useState<string[]>(
    () => initialState?.columnOrder ?? loadLayout()?.columnOrder ?? allColumnIds,
  )
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>(
    () => {
      const base: Record<string, boolean> = {}
      for (const c of columns) base[c.id] = c.defaultVisible !== false
      const saved = loadLayout()?.columnVisibility
      return { ...base, ...saved, ...(initialState?.columnVisibility ?? {}) }
    },
  )
  const [columnSizing, setColumnSizing] = React.useState<Record<string, number>>(
    () => initialState?.columnSizing ?? loadLayout()?.columnSizing ?? {},
  )
  const [columnPinning, setColumnPinning] = React.useState<{
    left: string[]
    right: string[]
  }>(() => ({
    left: [],
    right: [],
    ...(loadLayout()?.columnPinning ?? {}),
    ...(initialState?.columnPinning ?? {}),
  }))
  const [density, setDensity] = React.useState<Density>(
    () => initialState?.density ?? loadLayout()?.density ?? densityProp,
  )
  const [striped, setStriped] = React.useState<boolean>(
    () => loadLayout()?.striped ?? stripedProp,
  )
  const [columnFilters, setColumnFilters] = React.useState<Record<string, string>>({})
  const [columnValueFilters, setColumnValueFilters] = React.useState<
    Record<string, Set<string>>
  >({})
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [showFindPanel, setShowFindPanel] = React.useState(false)
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>(
    () => initialState?.expanded ?? {},
  )
  const [expandedDetails, setExpandedDetails] = React.useState<Record<string, boolean>>({})
  const [selection, setSelection] = React.useState<Set<string>>(new Set())
  const [editingCell, setEditingCell] = React.useState<{
    rowId: string
    columnId: string
  } | null>(null)
  const [editValue, setEditValue] = React.useState('')
  const [showFilterRow, setShowFilterRow] = React.useState(enableFiltering)
  const [showGroupPanel, setShowGroupPanel] = React.useState(enableGrouping)
  const [dragColumn, setDragColumn] = React.useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = React.useState<string | null>(null)
  const [focusedRowIndex, setFocusedRowIndex] = React.useState<number>(-1)

  React.useEffect(() => {
    if (!enableLayoutPersistence) return
    const snap: LayoutSnapshot = {
      sorting,
      grouping,
      columnOrder,
      columnVisibility,
      columnSizing,
      columnPinning,
      density,
      striped,
    }
    try {
      localStorage.setItem(layoutKey, JSON.stringify(snap))
    } catch {
      /* ignore quota errors */
    }
  }, [
    enableLayoutPersistence,
    layoutKey,
    sorting,
    grouping,
    columnOrder,
    columnVisibility,
    columnSizing,
    columnPinning,
    density,
    striped,
  ])

  React.useEffect(() => {
    onSelectionChange?.(Array.from(selection), data.filter((r, i) => selection.has(rowIdFn(r, i))))
  }, [selection, onSelectionChange, data, rowIdFn])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f' && enableFindPanel) {
        const t = e.target as HTMLElement
        if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA') {
          e.preventDefault()
          setShowFindPanel((v) => !v)
        }
      }
      if (e.key === 'Escape' && editingCell) {
        setEditingCell(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enableFindPanel, editingCell])

  const rowHeight = DENSITY_ROW_HEIGHT[density]
  const headerHeight = Math.max(rowHeight, 38)

  const visibleColumns = React.useMemo(() => {
    const ordered = columnOrder
      .filter((id) => colMap.has(id) && columnVisibility[id] !== false)
      .map((id) => colMap.get(id) as ColumnDef<T>)
    const left = columnPinning.left.filter((id) => columnVisibility[id] !== false)
    const right = columnPinning.right.filter((id) => columnVisibility[id] !== false)
    return { ordered, left, right }
  }, [columnOrder, colMap, columnVisibility, columnPinning])

  const orderedVisible = visibleColumns.ordered
  const pinnedLeft = visibleColumns.left
  const pinnedRight = visibleColumns.right

  const colWidth = React.useCallback(
    (id: string): number => {
      const col = colMap.get(id)
      const explicit = columnSizing[id]
      if (typeof explicit === 'number') return explicit
      const w = col?.width
      if (typeof w === 'number') return w
      return DEFAULT_COL_WIDTH
    },
    [colMap, columnSizing],
  )

  const totalWidth = React.useMemo(
    () => orderedVisible.reduce((sum, c) => sum + colWidth(c.id), 0),
    [orderedVisible, colWidth],
  )

  const leftOffsets = React.useMemo(() => {
    const m = new Map<string, number>()
    let acc = 0
    for (const id of pinnedLeft) {
      m.set(id, acc)
      acc += colWidth(id)
    }
    return m
  }, [pinnedLeft, colWidth])

  const rightOffsets = React.useMemo(() => {
    const m = new Map<string, number>()
    let acc = 0
    for (const id of [...pinnedRight].reverse()) {
      m.set(id, acc)
      acc += colWidth(id)
    }
    return m
  }, [pinnedRight, colWidth])

  const filteredData = React.useMemo(
    () => filterData(data, columnFilters, columnValueFilters, globalFilter, columns),
    [data, columnFilters, columnValueFilters, globalFilter, columns],
  )

  const sortedData = React.useMemo(
    () => (enableSorting ? sortData(filteredData, sorting, columns) : filteredData),
    [enableSorting, filteredData, sorting, columns],
  )

  const grouped = React.useMemo(
    () => groupData(sortedData, grouping, columns),
    [sortedData, grouping, columns],
  )

  const flatRows = React.useMemo<GridRow<T>[]>(
    () => flattenGroups(grouped, expandedGroups, grouping, sortedData),
    [grouped, expandedGroups, grouping, sortedData],
  )

  const leafRows = React.useMemo(
    () => flatRows.filter((r): r is LeafRow<T> => r.kind === 'leaf'),
    [flatRows],
  )

  const anyDetailOpen = React.useMemo(
    () => Object.values(expandedDetails).some(Boolean),
    [expandedDetails],
  )

  const useVirtual =
    enableVirtualization && grouping.length === 0 && !anyDetailOpen && flatRows.length > 80

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)
  const [viewportH, setViewportH] = React.useState(0)

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setViewportH(el.clientHeight))
    ro.observe(el)
    setViewportH(el.clientHeight)
    return () => ro.disconnect()
  }, [])

  const virtualRange = React.useMemo(() => {
    if (!useVirtual) return { start: 0, end: flatRows.length, padTop: 0, total: 0 }
    const total = flatRows.length * rowHeight
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - 6)
    const visibleCount = Math.ceil(viewportH / rowHeight) + 12
    const end = Math.min(flatRows.length, start + visibleCount)
    return { start, end, padTop: start * rowHeight, total }
  }, [useVirtual, flatRows.length, rowHeight, scrollTop, viewportH])

  const scales = React.useMemo(() => {
    const m = new Map<string, { min: number; max: number; range: number }>()
    for (const col of orderedVisible) {
      if (col.conditionalFormat?.some((r) => r.type === 'dataBar' || r.type === 'colorScale')) {
        m.set(col.id, computeScale(sortedData, col))
      }
    }
    return m
  }, [orderedVisible, sortedData])

  const uniqueValuesMap = React.useMemo(() => {
    const m = new Map<string, string[]>()
    if (!enableFiltering) return m
    for (const col of orderedVisible) {
      if (col.filterable !== false) m.set(col.id, getUniqueValues(data, col))
    }
    return m
  }, [enableFiltering, orderedVisible, data])

  const allTotalSummary = React.useMemo(() => {
    const items = summaries ?? collectColumnSummaries(columns)
    if (!items || items.length === 0) return []
    return items.map((item) => {
      const col = colMap.get(item.columnId)
      const value = col ? aggregate(sortedData, col, item.type) : 0
      return { item, value, col }
    })
  }, [summaries, columns, colMap, sortedData])

  const showFooter = allTotalSummary.length > 0

  const toggleSort = (columnId: string, additive: boolean) => {
    if (!enableSorting) return
    setSorting((prev) => {
      const existing = prev.find((s) => s.columnId === columnId)
      if (!existing) {
        const next: SortState[] = additive
          ? [...prev, { columnId, direction: 'asc' }]
          : [{ columnId, direction: 'asc' }]
        return next
      }
      if (existing.direction === 'asc') {
        const flipped = prev.map((s) =>
          s.columnId === columnId ? { ...s, direction: 'desc' as const } : s,
        )
        return additive ? flipped : flipped
      }
      return additive
        ? prev.filter((s) => s.columnId !== columnId)
        : prev.filter((s) => s.columnId !== columnId)
    })
  }

  const clearSorting = (columnId?: string) => {
    setSorting((prev) => (columnId ? prev.filter((s) => s.columnId !== columnId) : []))
  }

  const toggleGroup = (columnId: string) => {
    if (!enableGrouping) return
    setGrouping((prev) =>
      prev.includes(columnId)
        ? prev.filter((g) => g !== columnId)
        : [...prev, columnId],
    )
  }

  const clearGrouping = () => setGrouping([])

  const togglePin = (columnId: string, side: FixedSide) => {
    if (!enableColumnPinning) return
    setColumnPinning((prev) => {
      const left = prev.left.filter((id) => id !== columnId)
      const right = prev.right.filter((id) => id !== columnId)
      if (side === 'left') left.push(columnId)
      else right.unshift(columnId)
      return { left, right }
    })
  }

  const unpin = (columnId: string) => {
    setColumnPinning((prev) => ({
      left: prev.left.filter((id) => id !== columnId),
      right: prev.right.filter((id) => id !== columnId),
    }))
  }

  const toggleVisibility = (columnId: string) => {
    if (!enableColumnHiding) return
    setColumnVisibility((prev) => ({ ...prev, [columnId]: !(prev[columnId] !== false) }))
  }

  const clearColumnFilters = (columnId?: string) => {
    if (columnId) {
      setColumnFilters((prev) => {
        const next = { ...prev }
        delete next[columnId]
        return next
      })
      setColumnValueFilters((prev) => {
        const next = { ...prev }
        delete next[columnId]
        return next
      })
    } else {
      setColumnFilters({})
      setColumnValueFilters({})
      setGlobalFilter('')
    }
  }

  const isPinned = (id: string): FixedSide | null =>
    pinnedLeft.includes(id) ? 'left' : pinnedRight.includes(id) ? 'right' : null

  const startEdit = (rowId: string, columnId: string, current: string) => {
    if (!enableEditing) return
    const col = colMap.get(columnId)
    if (!col || col.editable === false) return
    setEditingCell({ rowId, columnId })
    setEditValue(current)
  }

  const commitEdit = () => {
    if (!editingCell) return
    onCellEdit?.(editingCell.rowId, editingCell.columnId, editValue, data as T)
    setEditingCell(null)
  }

  const toggleDetail = (rowId: string) => {
    setExpandedDetails((prev) => ({ ...prev, [rowId]: !prev[rowId] }))
  }

  const toggleGroupExpanded = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: prev[key] === false }))
  }

  const toggleSelectRow = (id: string) => {
    setSelection((prev) => {
      const next = new Set(prev)
      if (selectionMode === 'single') {
        next.clear()
        if (!prev.has(id)) next.add(id)
      } else {
        if (next.has(id)) next.delete(id)
        else next.add(id)
      }
      return next
    })
  }

  const allLeafSelected =
    enableSelection && leafRows.length > 0 && leafRows.every((r) => selection.has(rowIdFn(r.row, r.index)))
  const someLeafSelected =
    enableSelection && leafRows.some((r) => selection.has(rowIdFn(r.row, r.index)))

  const toggleSelectAll = () => {
    setSelection((prev) => {
      if (allLeafSelected) return new Set()
      const next = new Set(prev)
      for (const r of leafRows) next.add(rowIdFn(r.row, r.index))
      return next
    })
  }

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  const reorderColumn = (fromId: string, toId: string) => {
    if (!enableColumnReordering || fromId === toId) return
    setColumnOrder((prev) => {
      const from = prev.indexOf(fromId)
      const to = prev.indexOf(toId)
      if (from < 0 || to < 0) return prev
      return moveItem(prev, from, to)
    })
  }

  const resizeState = React.useRef<{ id: string; startX: number; startW: number } | null>(null)

  const onResizeStart = (e: React.MouseEvent, col: ColumnDef<T>) => {
    if (col.resizable === false || !enableColumnResizing) return
    e.stopPropagation()
    e.preventDefault()
    resizeState.current = { id: col.id, startX: e.clientX, startW: colWidth(col.id) }
    const onMove = (ev: MouseEvent) => {
      const st = resizeState.current
      if (!st) return
      const delta = ev.clientX - st.startX
      const colDef = colMap.get(st.id)
      const min = colDef?.minWidth ?? 60
      const max = colDef?.maxWidth ?? 1200
      const nextW = Math.min(max, Math.max(min, st.startW + delta))
      setColumnSizing((prev) => ({ ...prev, [st.id]: nextW }))
    }
    const onUp = () => {
      resizeState.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const resetLayout = () => {
    setSorting([])
    setGrouping([])
    setColumnOrder(allColumnIds)
    const base: Record<string, boolean> = {}
    for (const c of columns) base[c.id] = c.defaultVisible !== false
    setColumnVisibility(base)
    setColumnSizing({})
    setColumnPinning({ left: [], right: [] })
    setDensity(densityProp)
    setStriped(stripedProp)
    clearColumnFilters()
  }

  const handleExport = () => {
    const visible = orderedVisible
    exportToCsv(sortedData, visible, 'data-grid-export.csv')
  }

  const renderCellContent = (row: T, col: ColumnDef<T>, rowIndex: number) => {
    if (col.cell) return col.cell(row, rowIndex)
    const value = getCellValue(row, col)
    return formatCellValue(value, row, col)
  }

  const renderFormattedCell = (row: T, col: ColumnDef<T>, rowIndex: number) => {
    const rules = col.conditionalFormat
    const value = getCellValue(row, col)
    const content = renderCellContent(row, col, rowIndex)
    if (!rules || rules.length === 0) return <>{content}</>

    const matched = evalConditionalFormat(row, col, rules)
    if (matched.length === 0) return <>{content}</>

    const num = typeof value === 'number' ? value : parseFloat(String(value))

    const highlight = matched.find((r) => r.type === 'highlight')
    const dataBar = matched.find((r) => r.type === 'dataBar')
    const colorScale = matched.find((r) => r.type === 'colorScale')
    const iconRule = matched.find((r) => r.type === 'iconArrow' || r.type === 'iconTraffic')

    // Background color resolved from highlight or colorScale (highlight wins).
    let bg: string | undefined
    let textColor: string | undefined
    if (highlight) {
      const c = highlight.positiveColor ?? 'var(--primary)'
      bg = `color-mix(in oklch, ${c} 18%, transparent)`
      textColor = c
    } else if (colorScale) {
      const scale = scales.get(col.id)
      if (scale) {
        const t = scale.range > 0 ? (num - scale.min) / scale.range : 0.5
        const minC = colorScale.minColor ?? 'var(--success)'
        const maxC = colorScale.maxColor ?? 'var(--destructive)'
        const midC = colorScale.midColor
        const pct = Math.round(Math.max(0, Math.min(1, t)) * 100)
        bg = midC
          ? t < 0.5
            ? `color-mix(in oklch, ${midC} ${pct * 2}%, ${minC})`
            : `color-mix(in oklch, ${maxC} ${(pct - 50) * 2}%, ${midC})`
          : `color-mix(in oklch, ${maxC} ${pct}%, ${minC})`
      }
    }

    // Optional leading icon (arrow / traffic).
    let icon: React.ReactNode = null
    if (iconRule) {
      const isPos = num > 0
      const isZero = num === 0
      const color = isZero
        ? 'var(--muted-foreground)'
        : isPos
          ? iconRule.positiveColor ?? 'var(--success)'
          : iconRule.negativeColor ?? 'var(--destructive)'
      const Icon = isZero ? Minus : isPos ? ArrowUp : ArrowDown
      icon = <Icon className="size-3.5 shrink-0" style={{ color }} />
    }

    // Data bar layer (subtle, behind text).
    let bar: React.ReactNode = null
    if (dataBar) {
      const scale = scales.get(col.id)
      if (scale) {
        const pct = scale.range > 0 ? ((num - scale.min) / scale.range) * 100 : 100
        const isNeg = num < 0
        const barColor = isNeg
          ? dataBar.negativeColor ?? 'var(--destructive)'
          : dataBar.positiveColor ?? 'var(--primary)'
        bar = (
          <div
            className="pointer-events-none absolute inset-y-1 rounded-[3px]"
            style={{
              width: `calc(${Math.max(2, Math.min(100, Math.abs(pct)))}% - 4px)`,
              backgroundColor: barColor,
              opacity: 0.35,
              right: isNeg ? 4 : undefined,
              left: isNeg ? undefined : 4,
            }}
          />
        )
      }
    }

    const hasLayer = Boolean(bar)
    const isHighlight = Boolean(highlight)

    return (
      <span
        className={cn(
          'relative inline-flex w-full items-center gap-1.5 px-1.5 py-0.5 text-sm tabular-nums',
          hasLayer && 'rounded-[3px]',
          isHighlight && 'font-medium',
        )}
        style={{ backgroundColor: bg, color: textColor }}
      >
        {bar}
        {icon}
        <span className={cn('relative z-[1] truncate', hasLayer && 'font-medium')}>{content}</span>
      </span>
    )
  }

  const stickyStyle = (col: ColumnDef<T>): React.CSSProperties => {
    const side = isPinned(col.id)
    if (!side) return {}
    if (side === 'left') {
      return { position: 'sticky', left: leftOffsets.get(col.id) ?? 0, zIndex: 11 }
    }
    return { position: 'sticky', right: rightOffsets.get(col.id) ?? 0, zIndex: 11 }
  }

  const renderHeader = () => (
    <div
      data-slot="data-grid-header"
      className="sticky top-0 z-30 flex border-b bg-card/95 backdrop-blur-sm"
      style={{ height: headerHeight }}
    >
      {enableSelection && (
        <div
          className="flex shrink-0 items-center justify-center border-r bg-card"
          style={{ width: 40, position: 'sticky', left: 0, zIndex: 12 }}
        >
          <Checkbox
            checked={allLeafSelected ? true : someLeafSelected ? 'indeterminate' : false}
            onCheckedChange={toggleSelectAll}
            aria-label="Select all rows"
          />
        </div>
      )}
      {enableMasterDetail && (
        <div
          className="flex shrink-0 items-center justify-center border-r bg-card"
          style={{ width: 32, position: 'sticky', left: enableSelection ? 40 : 0, zIndex: 12 }}
        />
      )}
      {orderedVisible.map((col) => {
        const sortState = sorting.find((s) => s.columnId === col.id)
        const sortIndex = sorting.findIndex((s) => s.columnId === col.id)
        const hasValueFilter = columnValueFilters[col.id] && columnValueFilters[col.id].size >= 0
        const isFiltered =
          Boolean(columnFilters[col.id]) || (hasValueFilter && columnValueFilters[col.id].size > 0)
        const pinned = isPinned(col.id)
        const draggable = enableColumnReordering && col.resizable !== false
        return (
          <div
            key={col.id}
            data-slot="data-grid-head-cell"
            data-pinned={pinned ?? undefined}
            className={cn(
              'group relative flex shrink-0 select-none items-center gap-1 border-r px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase',
              'transition-colors hover:bg-muted/40',
              dragOverCol === col.id && 'bg-primary/10 ring-2 ring-inset ring-primary/40',
              pinned && 'bg-card',
            )}
            style={{ width: colWidth(col.id), ...stickyStyle(col) }}
            draggable={draggable}
            onDragStart={(e) => {
              if (!enableColumnReordering) return
              setDragColumn(col.id)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onDragOver={(e) => {
              if (!enableColumnReordering || !dragColumn) return
              e.preventDefault()
              setDragOverCol(col.id)
            }}
            onDragLeave={() => setDragOverCol((c) => (c === col.id ? null : c))}
            onDrop={(e) => {
              e.preventDefault()
              if (dragColumn && dragColumn !== col.id) reorderColumn(dragColumn, col.id)
              setDragColumn(null)
              setDragOverCol(null)
            }}
            onDragEnd={() => {
              setDragColumn(null)
              setDragOverCol(null)
            }}
          >
            <GripVertical className="size-3 shrink-0 cursor-grab text-muted-foreground/40 opacity-0 group-hover:opacity-100" />
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-1 truncate text-left outline-none"
              onClick={() => toggleSort(col.id, false)}
              onDoubleClick={() => clearSorting(col.id)}
              title={col.headerTooltip ?? col.header}
            >
              <span className="truncate">{col.header}</span>
              {enableSorting && col.sortable !== false && (
                <span className="flex shrink-0 items-center">
                  {sortState ? (
                    sortState.direction === 'asc' ? (
                      <ArrowUp className="size-3.5 text-primary" />
                    ) : (
                      <ArrowDown className="size-3.5 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="size-3 opacity-0 group-hover:opacity-50" />
                  )}
                  {sorting.length > 1 && sortState && (
                    <span className="ml-0.5 text-[0.6rem] text-primary">{sortIndex + 1}</span>
                  )}
                </span>
              )}
            </button>
            {enableFiltering && col.filterable !== false && (
              <ColumnFilterPopover<T>
                column={col}
                filtered={isFiltered}
                uniqueValues={uniqueValuesMap.get(col.id) ?? []}
                textValue={columnFilters[col.id] ?? ''}
                selectedValues={columnValueFilters[col.id] ?? new Set<string>()}
                onTextChange={(v) =>
                  setColumnFilters((prev) => ({ ...prev, [col.id]: v }))
                }
                onValueChange={(set) =>
                  setColumnValueFilters((prev) => ({ ...prev, [col.id]: set }))
                }
                onClear={() => clearColumnFilters(col.id)}
                onSortAsc={() => toggleSort(col.id, false)}
                onSortDesc={() => {
                  toggleSort(col.id, false)
                  toggleSort(col.id, false)
                }}
                onGroup={() => toggleGroup(col.id)}
                onPinLeft={() => togglePin(col.id, 'left')}
                onPinRight={() => togglePin(col.id, 'right')}
                onUnpin={() => unpin(col.id)}
                onHide={() => toggleVisibility(col.id)}
                enableGrouping={enableGrouping}
                enablePinning={enableColumnPinning}
                enableHiding={enableColumnHiding}
                pinned={pinned}
                grouped={grouping.includes(col.id)}
              />
            )}
            {enableColumnResizing && col.resizable !== false && (
              <div
                className="absolute inset-y-0 right-0 w-1.5 cursor-col-resize touch-none opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-60 hover:bg-primary/40"
                onMouseDown={(e) => onResizeStart(e, col)}
              >
                <div className="absolute inset-y-1 right-0 w-px bg-border" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  const renderFilterRow = () => {
    if (!showFilterRow || !enableFiltering) return null
    return (
      <div
        data-slot="data-grid-filter-row"
        className="sticky z-20 flex border-b bg-muted/30"
        style={{ top: headerHeight, height: 36 }}
      >
        {enableSelection && (
          <div
            className="shrink-0 border-r bg-muted/30"
            style={{ width: 40, position: 'sticky', left: 0, zIndex: 12 }}
          />
        )}
        {enableMasterDetail && (
          <div
            className="shrink-0 border-r bg-muted/30"
            style={{ width: 32, position: 'sticky', left: enableSelection ? 40 : 0, zIndex: 12 }}
          />
        )}
        {orderedVisible.map((col) => (
          <div
            key={col.id}
            className="shrink-0 border-r p-1"
            style={{ width: colWidth(col.id), ...stickyStyle(col) }}
          >
            {col.filterable !== false ? (
              <div className="relative">
                <Search className="pointer-events-none absolute left-1.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  className="h-7 bg-background pl-6 text-xs"
                  placeholder="Filter…"
                  value={columnFilters[col.id] ?? ''}
                  onChange={(e) =>
                    setColumnFilters((prev) => ({ ...prev, [col.id]: e.target.value }))
                  }
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    )
  }

  const renderGroupRow = (gr: GroupRow<T>) => {
    const col = colMap.get(gr.columnId)
    const summaryItems = groupSummaries ?? collectColumnSummaries(columns)
    const displayValue = col ? formatCellValue(gr.value, gr.rows[0], col) : String(gr.value)
    return (
      <div
        data-slot="data-grid-group-row"
        className="flex items-stretch border-b bg-muted/40 font-medium"
        style={{ height: rowHeight }}
      >
        <div
          className="flex shrink-0 items-center"
          style={{ paddingLeft: gr.level * 16 + 8, width: 32 }}
        >
          <button
            type="button"
            className="flex size-5 items-center justify-center rounded-sm hover:bg-accent"
            onClick={() => toggleGroupExpanded(gr.key)}
          >
            <ChevronRight
              className={cn(
                'size-4 transition-transform',
                gr.expanded && 'rotate-90',
              )}
            />
          </button>
        </div>
        <div className="flex flex-1 items-center gap-2 truncate px-1 text-sm">
          <span className="text-muted-foreground">{col?.header}:</span>
          <span className="truncate">{displayValue}</span>
          <Badge variant="secondary" className="text-2xs">
            {gr.rows.length}
          </Badge>
          {summaryItems.length > 0 && (
            <span className="ml-auto hidden items-center gap-3 text-xs text-muted-foreground md:flex">
              {summaryItems.map((item) => {
                const c = colMap.get(item.columnId)
                if (!c) return null
                const v = aggregate(gr.rows, c, item.type)
                return (
                  <span key={item.columnId}>
                    <span className="text-muted-foreground/70">{c.header}: </span>
                    <span className="font-medium text-foreground">
                      {formatSummary(v, item.type, item.displayFormat)}
                    </span>
                  </span>
                )
              })}
            </span>
          )}
        </div>
      </div>
    )
  }

  const renderLeafRow = (leaf: LeafRow<T>, idx: number, styleTop?: number) => {
    const row = leaf.row
    const id = rowIdFn(row, leaf.index)
    const selected = selection.has(id)
    const detailOpen = expandedDetails[id]
    const focused = focusedRowIndex === idx
    const rowBg = cn(
      'group/row',
      selected ? 'bg-primary/10' : striped && idx % 2 === 1 ? 'bg-muted/30' : 'bg-card',
      'hover:bg-accent/40 transition-colors',
      focused && 'ring-2 ring-inset ring-ring/40',
    )

    const content = (
      <>
        {enableSelection && (
          <div
            className="flex shrink-0 items-center justify-center border-r"
            style={{ width: 40, position: 'sticky', left: 0, zIndex: 10, background: 'inherit' }}
          >
            <Checkbox
              checked={selected}
              onCheckedChange={() => toggleSelectRow(id)}
              aria-label="Select row"
            />
          </div>
        )}
        {enableMasterDetail && (
          <div
            className="flex shrink-0 items-center justify-center border-r"
            style={{
              width: 32,
              position: 'sticky',
              left: enableSelection ? 40 : 0,
              zIndex: 10,
              background: 'inherit',
            }}
          >
            <button
              type="button"
              className="flex size-5 items-center justify-center rounded-sm hover:bg-accent"
              onClick={() => toggleDetail(id)}
              aria-label="Toggle detail"
            >
              <ChevronRight className={cn('size-4 transition-transform', detailOpen && 'rotate-90')} />
            </button>
          </div>
        )}
        {orderedVisible.map((col) => {
          const isEditing =
            editingCell?.rowId === id && editingCell?.columnId === col.id
          const text = formatCellValue(getCellValue(row, col), row, col)
          return (
            <div
              key={col.id}
              data-slot="data-grid-cell"
              className={cn(
                'flex shrink-0 items-center border-r px-3 text-sm',
                ALIGN_CLASS[col.align ?? 'left'],
                isPinned(col.id) && 'bg-inherit',
                enableEditing && col.editable !== false && 'cursor-text',
              )}
              style={{ width: colWidth(col.id), ...stickyStyle(col) }}
              onClick={() => {
                if (enableEditing && col.editable !== false && !isEditing) {
                  startEdit(id, col.id, text)
                }
              }}
              onDoubleClick={() => onRowDoubleClick?.(row)}
            >
              {isEditing ? (
                <Input
                  className="h-7 bg-background text-sm"
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit()
                    if (e.key === 'Escape') setEditingCell(null)
                  }}
                />
              ) : (
                <span className="truncate">{renderFormattedCell(row, col, leaf.index)}</span>
              )}
            </div>
          )
        })}
      </>
    )

    const detailPanel =
      enableMasterDetail && detailOpen && renderDetail ? (
        <div
          data-slot="data-grid-detail"
          className="border-b bg-muted/20 px-4 py-3"
          style={{ paddingLeft: (enableSelection ? 40 : 0) + (enableMasterDetail ? 32 : 0) + 16 }}
        >
          {renderDetail(row)}
        </div>
      ) : null

    const rowEl = (
      <div
        data-slot="data-grid-row"
        className={cn('flex items-stretch border-b', rowBg)}
        style={{
          height: rowHeight,
          ...(styleTop != null ? { position: 'absolute', top: styleTop, left: 0, right: 0 } : {}),
        }}
        onClick={() => {
          setFocusedRowIndex(idx)
          onRowClick?.(row)
        }}
      >
        {content}
      </div>
    )

    if (!enableMasterDetail || !detailOpen) {
      return rowContextMenu ? (
        <div key={`r-${id}`} style={styleTop != null ? { position: 'absolute', top: styleTop, left: 0, right: 0, height: rowHeight } : undefined}>
          <ContextMenu>
            <ContextMenuTrigger asChild>{rowEl}</ContextMenuTrigger>
            <ContextMenuContent>{rowContextMenu(row)}</ContextMenuContent>
          </ContextMenu>
        </div>
      ) : (
        <div key={`r-${id}`} style={styleTop != null ? { position: 'absolute', top: styleTop, left: 0, right: 0 } : undefined}>
          {rowEl}
        </div>
      )
    }

    return (
      <div
        key={`r-${id}`}
        style={styleTop != null ? { position: 'absolute', top: styleTop, left: 0, right: 0 } : undefined}
      >
        {rowContextMenu ? (
          <ContextMenu>
            <ContextMenuTrigger asChild>{rowEl}</ContextMenuTrigger>
            <ContextMenuContent>{rowContextMenu(row)}</ContextMenuContent>
          </ContextMenu>
        ) : (
          rowEl
        )}
        {detailPanel}
      </div>
    )
  }

  const renderBody = () => {
    if (flatRows.length === 0) {
      return (
        <div className="flex min-h-[160px] items-center justify-center p-8 text-center text-sm text-muted-foreground">
          {emptyState ?? 'No records to display.'}
        </div>
      )
    }

    if (useVirtual) {
      return (
        <div style={{ position: 'relative', height: virtualRange.total }}>
          {flatRows.slice(virtualRange.start, virtualRange.end).map((gr, i) => {
            const idx = virtualRange.start + i
            const top = idx * rowHeight
            return (
              <div key={idx} style={{ position: 'absolute', top, left: 0, right: 0 }}>
                {gr.kind === 'group' ? renderGroupRow(gr) : renderLeafRow(gr, idx)}
              </div>
            )
          })}
        </div>
      )
    }

    return (
      <>
        {flatRows.map((gr, idx) =>
          gr.kind === 'group' ? (
            <div key={`g-${gr.key}`}>{renderGroupRow(gr)}</div>
          ) : (
            <div key={`l-${idx}-${rowIdFn(gr.row, gr.index)}`}>
              {renderLeafRow(gr, idx)}
            </div>
          ),
        )}
      </>
    )
  }

  const renderFooter = () => {
    if (!showFooter) return null
    return (
      <div
        data-slot="data-grid-footer"
        className="sticky bottom-0 z-20 flex border-t-2 bg-muted/50 font-medium"
        style={{ height: rowHeight }}
      >
        {enableSelection && (
          <div
            className="shrink-0 border-r bg-muted/50"
            style={{ width: 40, position: 'sticky', left: 0, zIndex: 12 }}
          />
        )}
        {enableMasterDetail && (
          <div
            className="shrink-0 border-r bg-muted/50"
            style={{ width: 32, position: 'sticky', left: enableSelection ? 40 : 0, zIndex: 12 }}
          />
        )}
        {orderedVisible.map((col) => {
          const entry = allTotalSummary.find((e) => e.item.columnId === col.id)
          return (
            <div
              key={col.id}
              className={cn(
                'flex shrink-0 items-center px-3 text-sm tabular-nums',
                ALIGN_CLASS[col.align ?? 'left'],
                isPinned(col.id) && 'bg-muted/50',
              )}
              style={{ width: colWidth(col.id), ...stickyStyle(col) }}
            >
              {entry
                ? formatSummary(entry.value, entry.item.type, entry.item.displayFormat)
                : ''}
            </div>
          )
        })}
      </div>
    )
  }

  const renderGroupPanel = () => {
    if (!showGroupPanel || !enableGrouping) return null
    return (
      <div
        data-slot="data-grid-group-panel"
        className={cn(
          'flex items-center gap-2 border-b px-3 py-2',
          grouping.length === 0 && 'bg-muted/20',
        )}
        onDragOver={(e) => {
          if (!enableGrouping || !dragColumn) return
          e.preventDefault()
        }}
        onDrop={(e) => {
          e.preventDefault()
          if (dragColumn && !grouping.includes(dragColumn)) toggleGroup(dragColumn)
          setDragColumn(null)
        }}
      >
        <Layers className="size-4 shrink-0 text-muted-foreground" />
        {grouping.length === 0 ? (
          <span className="text-xs text-muted-foreground">
            Drag a column header here to group by that column
          </span>
        ) : (
          grouping.map((gid) => {
            const col = colMap.get(gid)
            return (
              <Badge key={gid} variant="secondary" className="gap-1">
                {col?.header ?? gid}
                <button
                  type="button"
                  className="ml-0.5 rounded-sm hover:bg-destructive/15 hover:text-destructive"
                  onClick={() => toggleGroup(gid)}
                  aria-label={`Ungroup ${col?.header ?? gid}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )
          })
        )}
        {grouping.length > 0 && (
          <button
            type="button"
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={clearGrouping}
          >
            <Ungroup className="size-3.5" /> Clear grouping
          </button>
        )}
      </div>
    )
  }

  const renderFindPanel = () => {
    if (!showFindPanel || !enableFindPanel) return null
    return (
      <div data-slot="data-grid-find-panel" className="flex items-center gap-2 border-b bg-muted/20 px-3 py-2">
        <Search className="size-4 text-muted-foreground" />
        <Input
          autoFocus
          className="h-8 flex-1 bg-background"
          placeholder="Search across all columns…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <Button variant="ghost" size="icon-sm" onClick={() => setShowFindPanel(false)} aria-label="Close find">
          <X />
        </Button>
      </div>
    )
  }

  const renderToolbar = () => (
    <div
      data-slot="data-grid-toolbar"
      className="flex flex-wrap items-center gap-2 border-b px-3 py-2"
    >
      <div className="flex items-center gap-2">
        <Rows3 className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Data Grid</span>
      </div>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowFilterRow((v) => !v)}
        className={cn(showFilterRow && 'bg-accent text-accent-foreground')}
      >
        <Filter className="size-4" /> Filter row
      </Button>
      {enableFindPanel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFindPanel((v) => !v)}
          className={cn(showFindPanel && 'bg-accent text-accent-foreground')}
        >
          <Search className="size-4" /> Find
          <Kbd>Ctrl F</Kbd>
        </Button>
      )}
      {enableGrouping && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowGroupPanel((v) => !v)}
          className={cn(showGroupPanel && 'bg-accent text-accent-foreground')}
        >
          <Layers className="size-4" /> Group panel
        </Button>
      )}
      {enableColumnHiding && (
        <ColumnVisibilityPopover<T>
          columns={columns}
          columnVisibility={columnVisibility}
          onToggle={toggleVisibility}
          onShowAll={() => {
            const next: Record<string, boolean> = {}
            for (const c of columns) next[c.id] = true
            setColumnVisibility(next)
          }}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Settings2 className="size-4" /> Density
            <span className="ml-1 text-xs capitalize text-muted-foreground">{density}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Row density</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(['compact', 'comfortable', 'cozy'] as Density[]).map((d) => (
            <DropdownMenuItem
              key={d}
              onClick={() => setDensity(d)}
              className={cn(density === d && 'bg-accent')}
            >
              <span className="flex w-20 items-center gap-2">
                <Rows3 className="size-4" />
                <span className="capitalize">{d}</span>
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {DENSITY_ROW_HEIGHT[d]}px
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setStriped((v) => !v)}>
            {striped ? <Check className="size-4" /> : <Minus className="size-4 opacity-0" />}
            Striped rows
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {enableExport && (
        <Button variant="ghost" size="sm" onClick={handleExport}>
          <Download className="size-4" /> Export CSV
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={resetLayout}>
        <Eraser className="size-4" /> Reset
      </Button>
      <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
        {enableSelection && selection.size > 0 && (
          <Badge variant="info">{selection.size} selected</Badge>
        )}
        <span>
          <span className="font-medium text-foreground">{sortedData.length}</span>
          {sortedData.length !== data.length && (
            <span> of {data.length}</span>
          )}{' '}
          rows
        </span>
      </div>
    </div>
  )

  return (
    <div
      data-slot="data-grid"
      className={cn('flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm', className)}
      style={{ height }}
    >
      {renderToolbar()}
      {renderGroupPanel()}
      {renderFindPanel()}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="relative flex-1 overflow-auto"
      >
        <div style={{ width: Math.max(totalWidth, 0), minWidth: '100%' }}>
          {renderHeader()}
          {renderFilterRow()}
          {renderBody()}
          {renderFooter()}
        </div>
      </div>
    </div>
  )
}

function collectColumnSummaries<T>(columns: ColumnDef<T>[]): SummaryItem[] {
  const items: SummaryItem[] = []
  for (const col of columns) {
    if (!col.summary) continue
    const arr = Array.isArray(col.summary) ? col.summary : [col.summary]
    for (const s of arr) items.push(s)
    if (col.aggregation) items.push({ type: col.aggregation, columnId: col.id })
  }
  return items
}

interface ColumnFilterPopoverProps<T> {
  column: ColumnDef<T>
  filtered: boolean
  uniqueValues: string[]
  textValue: string
  selectedValues: Set<string>
  onTextChange: (v: string) => void
  onValueChange: (set: Set<string>) => void
  onClear: () => void
  onSortAsc: () => void
  onSortDesc: () => void
  onGroup: () => void
  onPinLeft: () => void
  onPinRight: () => void
  onUnpin: () => void
  onHide: () => void
  enableGrouping: boolean
  enablePinning: boolean
  enableHiding: boolean
  pinned: FixedSide | null
  grouped: boolean
}

function ColumnFilterPopover<T>({
  column,
  filtered,
  uniqueValues,
  textValue,
  selectedValues,
  onTextChange,
  onValueChange,
  onClear,
  onSortAsc,
  onSortDesc,
  onGroup,
  onPinLeft,
  onPinRight,
  onUnpin,
  onHide,
  enableGrouping,
  enablePinning,
  enableHiding,
  pinned,
  grouped,
}: ColumnFilterPopoverProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const values = React.useMemo(
    () => uniqueValues.filter((v) => v.toLowerCase().includes(search.toLowerCase())),
    [uniqueValues, search],
  )
  const allChecked = selectedValues.size === 0
  const noneChecked = selectedValues.size === uniqueValues.length && uniqueValues.length > 0

  const toggleValue = (v: string) => {
    const next = new Set(selectedValues)
    if (next.has(v)) next.delete(v)
    else next.add(v)
    onValueChange(next)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded-sm transition-colors',
            filtered
              ? 'text-primary'
              : 'text-muted-foreground/50 opacity-0 hover:bg-accent hover:text-foreground group-hover:opacity-100',
          )}
          aria-label={`Filter ${column.header}`}
        >
          <Filter className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-64 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-1 border-b p-2">
          <Button variant="ghost" size="sm" className="h-7 flex-1 justify-start" onClick={onSortAsc}>
            <ArrowUpAZ className="size-4" /> Sort asc
          </Button>
          <Button variant="ghost" size="sm" className="h-7 flex-1 justify-start" onClick={onSortDesc}>
            <ArrowDownAZ className="size-4" /> Sort desc
          </Button>
        </div>
        <div className="relative border-b p-2">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 pl-8 text-xs"
            placeholder="Search values…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-52 overflow-y-auto p-1">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            onClick={() => {
              onValueChange(new Set())
              onTextChange('')
            }}
          >
            <Checkbox checked={allChecked} />
            <span>(Select All)</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            onClick={() => onValueChange(new Set(uniqueValues))}
          >
            <Checkbox checked={noneChecked} />
            <span>(Clear All)</span>
          </button>
          <Separator className="my-1" />
          {values.slice(0, 200).map((v) => (
            <button
              key={v}
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
              onClick={() => toggleValue(v)}
            >
              <Checkbox checked={selectedValues.has(v)} />
              <span className="truncate">{v}</span>
            </button>
          ))}
          {values.length > 200 && (
            <p className="px-2 py-1 text-2xs text-muted-foreground">
              Showing first 200 of {values.length}
            </p>
          )}
        </div>
        <div className="border-t p-2">
          <p className="mb-1 text-2xs text-muted-foreground">Quick text filter</p>
          <Input
            className="h-8 text-xs"
            placeholder="e.g. >100, starts with…"
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between border-t p-2">
          <Button variant="ghost" size="sm" className="h-7" onClick={onClear}>
            <Eraser className="size-4" /> Clear
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7">
                <ChevronsUpDown className="size-4" /> More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top">
              <DropdownMenuLabel>Column options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {enableGrouping && (
                <DropdownMenuItem onClick={onGroup}>
                  {grouped ? <Ungroup className="size-4" /> : <Layers className="size-4" />}
                  {grouped ? 'Ungroup' : 'Group by this column'}
                </DropdownMenuItem>
              )}
              {enablePinning && (
                <>
                  <DropdownMenuItem onClick={onPinLeft} disabled={pinned === 'left'}>
                    <Pin className="size-4" /> Pin to left
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onPinRight} disabled={pinned === 'right'}>
                    <ChevronsLeftRight className="size-4" /> Pin to right
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onUnpin} disabled={!pinned}>
                    <PinOff className="size-4" /> Unpin
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {enableHiding && (
                <DropdownMenuItem onClick={onHide}>
                  <EyeOff className="size-4" /> Hide column
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface ColumnVisibilityPopoverProps<T> {
  columns: ColumnDef<T>[]
  columnVisibility: Record<string, boolean>
  onToggle: (id: string) => void
  onShowAll: () => void
}

function ColumnVisibilityPopover<T>({
  columns,
  columnVisibility,
  onToggle,
  onShowAll,
}: ColumnVisibilityPopoverProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const list = React.useMemo(
    () => columns.filter((c) => c.header.toLowerCase().includes(search.toLowerCase())),
    [columns, search],
  )
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Columns3 className="size-4" /> Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-0">
        <div className="flex items-center justify-between border-b p-2">
          <span className="text-sm font-medium">Show / hide columns</span>
          <Button variant="ghost" size="sm" className="h-7" onClick={onShowAll}>
            <Eye className="size-4" /> All
          </Button>
        </div>
        <div className="relative border-b p-2">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 pl-8 text-xs"
            placeholder="Search columns…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {list.map((c) => (
            <button
              key={c.id}
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
              onClick={() => onToggle(c.id)}
            >
              <Checkbox checked={columnVisibility[c.id] !== false} />
              {columnVisibility[c.id] !== false ? (
                <Eye className="size-4 text-muted-foreground" />
              ) : (
                <EyeOff className="size-4 text-muted-foreground" />
              )}
              <span className="truncate">{c.header}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export type { ColumnDef, DataGridProps, SummaryItem, SortState, ConditionalFormatRule }
