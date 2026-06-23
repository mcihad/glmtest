import type {
  ColumnDef,
  ConditionalFormatRule,
  CompareOperator,
  GridRow,
  GroupRow,
  LeafRow,
  SortState,
  SummaryType,
} from './types'

export function getCellValue<T>(row: T, col: ColumnDef<T>): unknown {
  if (col.valueGetter) return col.valueGetter(row)
  if (col.accessorKey != null) return (row as any)[col.accessorKey]
  return (row as any)[col.id]
}

export function formatCellValue<T>(
  value: unknown,
  row: T,
  col: ColumnDef<T>,
): string {
  if (col.format) {
    try {
      return col.format(value, row)
    } catch {
      return String(value ?? '')
    }
  }
  if (value == null || value === '') return ''
  if (value instanceof Date) return value.toLocaleDateString()
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? value.toLocaleString()
      : value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'number' && typeof b === 'number') return a - b
  const sa = String(a).toLowerCase()
  const sb = String(b).toLowerCase()
  if (sa < sb) return -1
  if (sa > sb) return 1
  return 0
}

export function sortData<T>(data: T[], sorting: SortState[], columns: ColumnDef<T>[]): T[] {
  if (sorting.length === 0) return data
  const colMap = new Map(columns.map((c) => [c.id, c]))
  return [...data].sort((a, b) => {
    for (const s of sorting) {
      const col = colMap.get(s.columnId)
      if (!col) continue
      const av = getCellValue(a, col)
      const bv = getCellValue(b, col)
      const cmp = compareValues(av, bv)
      if (cmp !== 0) return s.direction === 'asc' ? cmp : -cmp
    }
    return 0
  })
}

function matchesText(value: unknown, query: string): boolean {
  if (value == null) return false
  return String(value).toLowerCase().includes(query)
}

function evalOperator(a: unknown, op: CompareOperator, v1: unknown, v2?: unknown): boolean {
  const an = typeof a === 'number' ? a : parseFloat(String(a))
  const v1n = typeof v1 === 'number' ? v1 : parseFloat(String(v1))
  const v2n = typeof v2 === 'number' ? v2 : parseFloat(String(v2))
  switch (op) {
    case 'gt': return an > v1n
    case 'gte': return an >= v1n
    case 'lt': return an < v1n
    case 'lte': return an <= v1n
    case 'eq': return String(a) === String(v1)
    case 'neq': return String(a) !== String(v1)
    case 'between': return an >= v1n && an <= v2n
    case 'contains': return matchesText(a, String(v1 ?? ''))
    case 'beginsWith': return String(a).toLowerCase().startsWith(String(v1).toLowerCase())
    default: return false
  }
}

export function filterByColumnQuery<T>(
  row: T,
  col: ColumnDef<T>,
  query: string,
): boolean {
  if (!query) return true
  const value = getCellValue(row, col)
  const q = query.trim().toLowerCase()
  const ft = col.filterType
  if (ft === 'number') {
    const n = typeof value === 'number' ? value : parseFloat(String(value))
    if (q.startsWith('>=')) return n >= parseFloat(q.slice(2))
    if (q.startsWith('<=')) return n <= parseFloat(q.slice(2))
    if (q.startsWith('>')) return n > parseFloat(q.slice(1))
    if (q.startsWith('<')) return n < parseFloat(q.slice(1))
    if (q.startsWith('=')) return n === parseFloat(q.slice(1))
    return String(n).includes(q)
  }
  if (ft === 'date') {
    const d = value instanceof Date ? value : new Date(String(value))
    return d.toLocaleDateString().toLowerCase().includes(q)
  }
  return matchesText(value, q)
}

export function filterData<T>(
  data: T[],
  columnFilters: Record<string, string>,
  columnValueFilters: Record<string, Set<string>>,
  globalQuery: string,
  columns: ColumnDef<T>[],
): T[] {
  const filterableCols = new Map(columns.filter((c) => c.filterable !== false).map((c) => [c.id, c]))
  return data.filter((row) => {
    for (const [colId, query] of Object.entries(columnFilters)) {
      const col = filterableCols.get(colId)
      if (!col) continue
      if (!filterByColumnQuery(row, col, query)) return false
    }
    for (const [colId, selected] of Object.entries(columnValueFilters)) {
      if (!selected || selected.size === 0) continue
      const col = filterableCols.get(colId)
      if (!col) continue
      const val = formatCellValue(getCellValue(row, col), row, col)
      if (!selected.has(val)) return false
    }
    if (globalQuery) {
      const q = globalQuery.toLowerCase()
      const hit = columns.some((col) => {
        if (col.defaultVisible === false) return false
        const val = getCellValue(row, col)
        return matchesText(formatCellValue(val, row, col), q)
      })
      if (!hit) return false
    }
    return true
  })
}

export function getUniqueValues<T>(data: T[], col: ColumnDef<T>): string[] {
  const set = new Set<string>()
  for (const row of data) {
    const v = formatCellValue(getCellValue(row, col), row, col)
    if (v !== '') set.add(v)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export interface BuiltGroup<T> {
  key: string
  columnId: string
  value: unknown
  rows: T[]
  groups: BuiltGroup<T>[]
}

export function groupData<T>(
  data: T[],
  groupCols: string[],
  columns: ColumnDef<T>[],
): BuiltGroup<T> {
  const colMap = new Map(columns.map((c) => [c.id, c]))
  const root: BuiltGroup<T> = { key: '__root', columnId: '', value: null, rows: data, groups: [] }
  if (groupCols.length === 0) return root

  function build(rows: T[], level: number): BuiltGroup<T>[] {
    const colId = groupCols[level]
    const col = colMap.get(colId)
    if (!col) return []
    const buckets = new Map<string, T[]>()
    const order: string[] = []
    for (const row of rows) {
      const raw = getCellValue(row, col)
      const key = formatCellValue(raw, row, col)
      if (!buckets.has(key)) {
        buckets.set(key, [])
        order.push(key)
      }
      buckets.get(key)!.push(row)
    }
    return order.map((key) => {
      const groupRows = buckets.get(key)!
      const firstRow = groupRows[0]
      return {
        key,
        columnId: colId,
        value: col ? getCellValue(firstRow, col) : key,
        rows: groupRows,
        groups: level + 1 < groupCols.length ? build(groupRows, level + 1) : [],
      }
    })
  }

  root.groups = build(data, 0)
  return root
}

export function aggregate<T>(rows: T[], col: ColumnDef<T>, type: SummaryType): number {
  const values = rows.map((r) => {
    const v = getCellValue(r, col)
    if (typeof v === 'number') return v
    const n = parseFloat(String(v))
    return Number.isFinite(n) ? n : NaN
  })
  const nums = values.filter((n) => !Number.isNaN(n))
  switch (type) {
    case 'count': return rows.length
    case 'sum': return nums.reduce((a, b) => a + b, 0)
    case 'avg': return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
    case 'min': return nums.length ? Math.min(...nums) : 0
    case 'max': return nums.length ? Math.max(...nums) : 0
    default: return 0
  }
}

export function formatSummary(value: number, type: SummaryType, fmt?: string): string {
  const text =
    type === 'count'
      ? String(value)
      : Number.isInteger(value)
        ? value.toLocaleString()
        : value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  if (fmt) return fmt.replace('{0}', text)
  return text
}

export function flattenGroups<T>(
  root: BuiltGroup<T>,
  expanded: Record<string, boolean>,
  groupCols: string[],
  allRows: T[],
): GridRow<T>[] {
  if (groupCols.length === 0) {
    return allRows.map((row, i) => ({ kind: 'leaf', row, index: i }) as LeafRow<T>)
  }
  const out: GridRow<T>[] = []
  function walk(groups: BuiltGroup<T>[], level: number) {
    for (const g of groups) {
      const stateKey = `${g.columnId}:${g.key}`
      const isExpanded = expanded[stateKey] !== false
      const groupRow: GroupRow<T> = {
        kind: 'group',
        key: stateKey,
        columnId: g.columnId,
        value: g.value,
        level,
        rows: g.rows,
        expanded: isExpanded,
        children: [],
      }
      out.push(groupRow)
      if (isExpanded) {
        if (g.groups.length > 0) {
          walk(g.groups, level + 1)
        } else {
          for (const row of g.rows) {
            out.push({ kind: 'leaf', row, index: 0 })
          }
        }
      }
    }
  }
  walk(root.groups, 0)
  return out
}

export function evalConditionalFormat<T>(
  row: T,
  col: ColumnDef<T>,
  rules: ConditionalFormatRule[],
): ConditionalFormatRule[] {
  const value = getCellValue(row, col)
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  const matched: ConditionalFormatRule[] = []
  for (const rule of rules) {
    if (rule.columnId !== col.id) continue
    switch (rule.type) {
      case 'highlight':
        if (rule.operator && evalOperator(value, rule.operator, rule.value1, rule.value2)) {
          matched.push(rule)
        }
        break
      case 'dataBar':
      case 'colorScale':
      case 'iconArrow':
      case 'iconTraffic':
        if (Number.isFinite(num)) matched.push(rule)
        break
    }
  }
  return matched
}

export function computeScale<T>(
  data: T[],
  col: ColumnDef<T>,
): { min: number; max: number; range: number } {
  let min = Infinity
  let max = -Infinity
  for (const row of data) {
    const v = getCellValue(row, col)
    const n = typeof v === 'number' ? v : parseFloat(String(v))
    if (Number.isFinite(n)) {
      if (n < min) min = n
      if (n > max) max = n
    }
  }
  if (!Number.isFinite(min)) min = 0
  if (!Number.isFinite(max)) max = 0
  const range = max - min || 1
  return { min, max, range }
}

export function exportToCsv<T>(
  data: T[],
  columns: ColumnDef<T>[],
  filename = 'grid-export.csv',
): void {
  const visible = columns.filter((c) => c.defaultVisible !== false)
  const header = visible.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',')
  const lines = data.map((row) =>
    visible
      .map((c) => {
        const v = formatCellValue(getCellValue(row, c), row, c)
        return `"${String(v).replace(/"/g, '""')}"`
      })
      .join(','),
  )
  const csv = [header, ...lines].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}
