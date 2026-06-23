import type * as React from 'react'

export type Align = 'left' | 'center' | 'right'
export type FixedSide = 'left' | 'right'
export type SortDirection = 'asc' | 'desc'
export type SummaryType = 'sum' | 'avg' | 'count' | 'min' | 'max'
export type Density = 'compact' | 'comfortable' | 'cozy'
export type SelectionMode = 'single' | 'multiple'
export type FilterType = 'text' | 'number' | 'date' | 'select'
export type ConditionalFormatType =
  | 'dataBar'
  | 'colorScale'
  | 'highlight'
  | 'iconArrow'
  | 'iconTraffic'
export type CompareOperator =
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'eq'
  | 'neq'
  | 'between'
  | 'contains'
  | 'beginsWith'

export interface SortState {
  columnId: string
  direction: SortDirection
}

export interface SummaryItem {
  type: SummaryType
  columnId: string
  displayFormat?: string
  align?: Align
}

export interface ConditionalFormatRule {
  columnId: string
  type: ConditionalFormatType
  operator?: CompareOperator
  value1?: number | string
  value2?: number | string
  positiveColor?: string
  negativeColor?: string
  minColor?: string
  midColor?: string
  maxColor?: string
  className?: string
}

export interface ColumnDef<T = any> {
  id: string
  accessorKey?: string & keyof T
  header: string
  headerTooltip?: string
  cell?: (row: T, rowIndex: number) => React.ReactNode
  valueGetter?: (row: T) => unknown
  width?: number | string
  minWidth?: number
  maxWidth?: number
  align?: Align
  fixed?: FixedSide
  sortable?: boolean
  filterable?: boolean
  resizable?: boolean
  groupable?: boolean
  editable?: boolean
  defaultVisible?: boolean
  format?: (value: unknown, row: T) => string
  filterType?: FilterType
  summary?: SummaryItem | SummaryItem[]
  conditionalFormat?: ConditionalFormatRule[]
  allowHiding?: boolean
  allowPinning?: boolean
  aggregation?: SummaryType
}

export interface GroupRow<T = any> {
  kind: 'group'
  key: string
  columnId: string
  value: unknown
  level: number
  rows: T[]
  expanded: boolean
  children: Array<GroupRow<T> | LeafRow<T>>
}

export interface LeafRow<T = any> {
  kind: 'leaf'
  row: T
  index: number
}

export type GridRow<T = any> = GroupRow<T> | LeafRow<T>

export interface DataGridProps<T = any> {
  data: T[]
  columns: ColumnDef<T>[]
  getRowId?: (row: T, index: number) => string
  enableSorting?: boolean
  enableFiltering?: boolean
  enableGrouping?: boolean
  enableColumnResizing?: boolean
  enableColumnReordering?: boolean
  enableColumnPinning?: boolean
  enableColumnHiding?: boolean
  enableSelection?: boolean
  enableEditing?: boolean
  enableMasterDetail?: boolean
  enableVirtualization?: boolean
  enableExport?: boolean
  enableLayoutPersistence?: boolean
  enableFindPanel?: boolean
  density?: Density
  striped?: boolean
  selectionMode?: SelectionMode
  onSelectionChange?: (selectedIds: string[], selectedRows: T[]) => void
  onCellEdit?: (rowId: string, columnId: string, newValue: string, row: T) => void
  renderDetail?: (row: T) => React.ReactNode
  rowContextMenu?: (row: T) => React.ReactNode
  onRowClick?: (row: T) => void
  onRowDoubleClick?: (row: T) => void
  summaries?: SummaryItem[]
  groupSummaries?: SummaryItem[]
  layoutKey?: string
  className?: string
  height?: number | string
  emptyState?: React.ReactNode
  initialState?: {
    sorting?: SortState[]
    grouping?: string[]
    columnVisibility?: Record<string, boolean>
    columnOrder?: string[]
    columnSizing?: Record<string, number>
    columnPinning?: { left?: string[]; right?: string[] }
    expanded?: Record<string, boolean>
    density?: Density
  }
}

export const DENSITY_ROW_HEIGHT: Record<Density, number> = {
  compact: 32,
  comfortable: 40,
  cozy: 48,
}
