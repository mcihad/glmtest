import { createFileRoute } from '@tanstack/react-router'
import {
  PageWrapper,
  PageHeader,
  PageActions,
} from '@/components/layout/page'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import { Tree, type TreeNode } from '@/components/ui/tree'
import { DataGrid, type ColumnDef, type ConditionalFormatRule } from '@/components/ui/data-grid'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import {
  MoreHorizontal,
  Mail,
  Star,
  Trash2,
  Folder,
  File,
  Eye,
  Pencil,
  Copy,
  TrendingUp,
  Globe,
  Package,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const LIST = [
  { id: 1, name: 'Aida Bughao', role: 'Admin', email: 'aida@kentos.io', status: 'Active' },
  { id: 2, name: 'Cihad Güvenç', role: 'Operator', email: 'cihad@kentos.io', status: 'Active' },
  { id: 3, name: 'Mira Solis', role: 'Viewer', email: 'mira@kentos.io', status: 'Invited' },
  { id: 4, name: 'Kenji Watanabe', role: 'Operator', email: 'kenji@kentos.io', status: 'Suspended' },
]

const statusVariant: Record<string, 'success' | 'secondary' | 'warning'> = {
  Active: 'success',
  Invited: 'secondary',
  Suspended: 'warning',
}

const TREE_NODES: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'ui', label: 'ui' },
          { id: 'layout', label: 'layout' },
        ],
      },
      { id: 'routes', label: 'routes' },
      { id: 'lib', label: 'lib' },
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [{ id: 'favicon', label: 'favicon.svg' }],
  },
  { id: 'readme', label: 'README.md' },
]

/* ------------------------------------------------------------------ *
 * Advanced Data Grid — DevExpress cxGrid–grade showcase
 * ------------------------------------------------------------------ */

interface Order {
  id: string
  customer: string
  region: string
  product: string
  status: 'Active' | 'Pending' | 'Critical' | 'Suspended' | 'Closed'
  quantity: number
  unitPrice: number
  revenue: number
  score: number
  change: number
  lastOrder: string
}

const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East']
const PRODUCTS = ['Atlas Console', 'Vortex DB', 'Pulse Analytics', 'Nimbus Sync', 'Cobalt Auth', 'Helix Queue']
const STATUSES: Order['status'][] = ['Active', 'Pending', 'Critical', 'Suspended', 'Closed']
const CUSTOMERS = [
  'Aida Bughao', 'Cihad Güvenç', 'Mira Solis', 'Kenji Watanabe', 'Lena Petrov',
  'Omar Haddad', 'Sofia Reyes', 'Ravi Kapoor', 'Elena Novak', 'Tomás Lima',
  'Yuki Tanaka', 'Nina Kovac', 'Hugo Brandt', 'Layla Mansour', 'Pia Costa',
  'Marco Bianchi', 'Zara Ahmed', 'Bo Lindqvist', 'Iris Cole', 'Dev Patel',
]

function seeded(n: number): number {
  const x = Math.sin(n) * 10000
  return x - Math.floor(x)
}

function buildOrders(): Order[] {
  const rows: Order[] = []
  for (let i = 0; i < 142; i++) {
    const product = PRODUCTS[Math.floor(seeded(i + 1) * PRODUCTS.length)]
    const region = REGIONS[Math.floor(seeded(i + 2) * REGIONS.length)]
    const status = STATUSES[Math.floor(seeded(i + 3) * STATUSES.length)]
    const quantity = 1 + Math.floor(seeded(i + 4) * 240)
    const unitPrice = Math.round((40 + seeded(i + 5) * 960) * 100) / 100
    const revenue = Math.round(quantity * unitPrice * 100) / 100
    const score = Math.round(seeded(i + 6) * 100)
    const change = Math.round((seeded(i + 7) * 50 - 20) * 10) / 10
    const day = 1 + Math.floor(seeded(i + 8) * 27)
    const month = 1 + Math.floor(seeded(i + 9) * 12)
    const customer = CUSTOMERS[Math.floor(seeded(i + 10) * CUSTOMERS.length)]
    rows.push({
      id: `ORD-${String(1000 + i)}`,
      customer,
      region,
      product,
      status,
      quantity,
      unitPrice,
      revenue,
      score,
      change,
      lastOrder: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    })
  }
  return rows
}

const ORDERS = buildOrders()

const orderStatusVariant: Record<Order['status'], 'success' | 'secondary' | 'warning' | 'info' | 'destructive'> = {
  Active: 'success',
  Pending: 'info',
  Critical: 'destructive',
  Suspended: 'warning',
  Closed: 'secondary',
}

const currencyFmt = (v: unknown) =>
  Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const gridConditionalFormat: ConditionalFormatRule[] = [
  {
    columnId: 'revenue',
    type: 'dataBar',
    positiveColor: 'var(--primary)',
    negativeColor: 'var(--destructive)',
  },
  {
    columnId: 'score',
    type: 'colorScale',
    minColor: 'var(--destructive)',
    midColor: 'var(--warning)',
    maxColor: 'var(--success)',
  },
  {
    columnId: 'change',
    type: 'iconArrow',
    positiveColor: 'var(--success)',
    negativeColor: 'var(--destructive)',
  },
  {
    columnId: 'status',
    type: 'highlight',
    operator: 'eq',
    value1: 'Critical',
    positiveColor: 'var(--destructive)',
  },
  {
    columnId: 'status',
    type: 'highlight',
    operator: 'eq',
    value1: 'Active',
    positiveColor: 'var(--success)',
  },
]

const ORDER_COLUMNS: ColumnDef<Order>[] = [
  {
    id: 'id',
    header: 'Order ID',
    width: 120,
    minWidth: 100,
    fixed: 'left',
    allowHiding: false,
    cell: (row) => <span className="font-mono text-xs font-medium">{row.id}</span>,
  },
  {
    id: 'customer',
    header: 'Customer',
    width: 180,
    minWidth: 120,
    fixed: 'left',
    cell: (row) => <span className="font-medium">{row.customer}</span>,
  },
  {
    id: 'region',
    header: 'Region',
    width: 160,
    align: 'left',
    cell: (row) => (
      <span className="inline-flex items-center gap-1.5">
        <Globe className="size-3.5 text-muted-foreground" />
        {row.region}
      </span>
    ),
  },
  {
    id: 'product',
    header: 'Product',
    width: 170,
    cell: (row) => (
      <span className="inline-flex items-center gap-1.5">
        <Package className="size-3.5 text-muted-foreground" />
        {row.product}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    width: 130,
    align: 'center',
    cell: (row) => (
      <Badge variant={orderStatusVariant[row.status]} className="whitespace-nowrap">
        {row.status}
      </Badge>
    ),
    conditionalFormat: gridConditionalFormat.filter((r) => r.columnId === 'status'),
  },
  {
    id: 'quantity',
    header: 'Qty',
    width: 90,
    align: 'right',
    editable: true,
    format: (v) => String(v),
  },
  {
    id: 'unitPrice',
    header: 'Unit Price',
    width: 120,
    align: 'right',
    editable: true,
    format: currencyFmt,
  },
  {
    id: 'revenue',
    header: 'Revenue',
    width: 170,
    align: 'right',
    format: currencyFmt,
    summary: { type: 'sum', columnId: 'revenue', displayFormat: 'Total: {0}', align: 'right' },
    conditionalFormat: gridConditionalFormat.filter((r) => r.columnId === 'revenue'),
  },
  {
    id: 'score',
    header: 'Score',
    width: 110,
    align: 'right',
    summary: { type: 'avg', columnId: 'score', displayFormat: 'Avg: {0}', align: 'right' },
    conditionalFormat: gridConditionalFormat.filter((r) => r.columnId === 'score'),
  },
  {
    id: 'change',
    header: 'Δ WoW',
    width: 110,
    align: 'right',
    format: (v) => `${Number(v) > 0 ? '+' : ''}${v}%`,
    summary: { type: 'avg', columnId: 'change', displayFormat: 'Avg: {0}%', align: 'right' },
    conditionalFormat: gridConditionalFormat.filter((r) => r.columnId === 'change'),
  },
  {
    id: 'lastOrder',
    header: 'Last Order',
    width: 130,
    align: 'left',
    filterType: 'date',
    cell: (row) => (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Tag className="size-3.5" />
        {row.lastOrder}
      </span>
    ),
  },
]

function orderContextMenu(row: Order) {
  return (
    <>
      <ContextMenuItem onSelect={() => toast(`Viewing ${row.id}`)}>
        <Eye /> View details
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => toast(`Editing ${row.id}`)}>
        <Pencil /> Edit order
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => toast(`Duplicated ${row.id}`)}>
        <Copy /> Duplicate
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem variant="destructive" onSelect={() => toast.error(`Deleted ${row.id}`)}>
        <Trash2 /> Delete
      </ContextMenuItem>
    </>
  )
}

function orderDetail(row: Order) {
  return (
    <div className="grid gap-3 text-sm sm:grid-cols-3">
      <div className="rounded-lg border bg-card p-3">
        <p className="text-2xs uppercase tracking-wide text-muted-foreground">Customer</p>
        <p className="mt-1 font-medium">{row.customer}</p>
        <p className="text-xs text-muted-foreground">{row.region}</p>
      </div>
      <div className="rounded-lg border bg-card p-3">
        <p className="text-2xs uppercase tracking-wide text-muted-foreground">Line items</p>
        <p className="mt-1 font-medium">{row.product}</p>
        <p className="text-xs text-muted-foreground">
          {row.quantity} × {currencyFmt(row.unitPrice)}
        </p>
      </div>
      <div className="rounded-lg border bg-card p-3">
        <p className="text-2xs uppercase tracking-wide text-muted-foreground">Performance</p>
        <p className="mt-1 font-medium">{currencyFmt(row.revenue)}</p>
        <p className="text-xs text-muted-foreground">
          Score {row.score}/100 · Δ {row.change}%
        </p>
      </div>
    </div>
  )
}

function ComponentsPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Components"
        description="A living gallery of the design-system primitives."
        actions={
          <PageActions>
            <Button variant="outline" onClick={() => toast('Saved component preset')}>
              Save
            </Button>
            <Button onClick={() => toast.success('Published!')}>Publish</Button>
          </PageActions>
        }
      />

      <Tabs defaultValue="datagrid">
        <TabsList>
          <TabsTrigger value="datagrid">Data Grid</TabsTrigger>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="data">Data display</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="overlays">Overlays</TabsTrigger>
        </TabsList>

        {/* Advanced Data Grid — DevExpress cxGrid–grade */}
        <TabsContent value="datagrid" className="mt-4 flex flex-col gap-4">
          <Card className="overflow-hidden py-0">
            <CardHeader className="border-b py-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                Advanced Data Grid
              </CardTitle>
              <CardDescription>
                DevExpress cxGrid–grade: sorting, Excel-style filtering, drag-to-group,
                summaries, conditional formatting, pinned columns, inline editing,
                master-detail, virtual scrolling, selection, context menu, CSV export,
                and persistent layout.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <DataGrid<Order>
                data={ORDERS}
                columns={ORDER_COLUMNS}
                getRowId={(row) => row.id}
                height={620}
                enableSelection
                enableEditing
                enableMasterDetail
                enableLayoutPersistence
                layoutKey="showcase-orders-grid"
                striped
                density="comfortable"
                summaries={[
                  { type: 'count', columnId: 'id', displayFormat: '{0} orders', align: 'left' },
                ]}
                groupSummaries={[
                  { type: 'sum', columnId: 'revenue', displayFormat: '{0}' },
                  { type: 'count', columnId: 'id', displayFormat: '{0}' },
                ]}
                initialState={{
                  sorting: [{ columnId: 'revenue', direction: 'desc' }],
                  columnPinning: { left: ['id', 'customer'] },
                  density: 'comfortable',
                }}
                renderDetail={orderDetail}
                rowContextMenu={orderContextMenu}
                onCellEdit={(rowId, columnId, value) =>
                  toast.success(`Updated ${columnId} on ${rowId}`, {
                    description: `New value: ${value}`,
                  })
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buttons & badges */}
        <TabsContent value="buttons" className="mt-4 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Variants and sizes.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="icon"><Mail /></Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data display */}
        <TabsContent value="data" className="mt-4 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>List view</CardTitle>
              <CardDescription>Avatar + title + status + row menu pattern.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y rounded-lg border mx-6 mb-6">
                {LIST.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 p-3 transition-colors hover:bg-muted/50"
                  >
                    <Avatar>
                      <AvatarFallback>
                        {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge variant={statusVariant[u.status]}>{u.status}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="Row actions">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Mail /> Email</DropdownMenuItem>
                        <DropdownMenuItem><Star /> Promote</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive"><Trash2 /> Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tree</CardTitle>
                <CardDescription>File-explorer style navigation.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tree
                  nodes={TREE_NODES}
                  defaultExpanded={['src', 'components']}
                  defaultSelected="readme"
                  onSelect={(id) => toast(`Selected ${id}`)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accordion</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" defaultValue="a">
                  <AccordionItem value="a">
                    <AccordionTrigger>What is KentOS Console?</AccordionTrigger>
                    <AccordionContent>
                      A design-system template for operations consoles.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="b">
                    <AccordionTrigger>Is it themeable?</AccordionTrigger>
                    <AccordionContent>
                      Yes — every token flows from CSS custom properties.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="c">
                    <AccordionTrigger>Can I add presets?</AccordionTrigger>
                    <AccordionContent>
                      Append a ColorPreset to COLOR_PRESETS and it appears here.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forms */}
        <TabsContent value="forms" className="mt-4">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Form controls</CardTitle>
              <CardDescription>Switch, checkbox, slider, progress.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <label className="flex items-center justify-between gap-4 text-sm">
                <span>Enable notifications</span>
                <Switch defaultChecked />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox defaultChecked /> Accept terms
              </label>
              <div className="flex flex-col gap-2">
                <span className="text-sm">Volume</span>
                <Slider defaultValue={[60]} max={100} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm">Upload progress</span>
                <Progress value={72} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overlays */}
        <TabsContent value="overlays" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Context menu</CardTitle>
              <CardDescription>Right-click the area below.</CardDescription>
            </CardHeader>
            <CardContent>
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div
                    className={cn(
                      'flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground',
                    )}
                  >
                    Right-click here
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onSelect={() => toast('Opened')}><Folder /> Open</ContextMenuItem>
                  <ContextMenuItem onSelect={() => toast('Renamed')}><File /> Rename</ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem variant="destructive" onSelect={() => toast.error('Deleted')}>
                    <Trash2 /> Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  )
}

export const Route = createFileRoute('/components')({ component: ComponentsPage })
