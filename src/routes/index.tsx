import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowUpRight,
  Download,
  Plus,
  Activity,
  Users,
  Server,
  Zap,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import {
  PageWrapper,
  PageHeader,
  PageActions,
  PageFooter,
  PageFooterStat,
} from '@/components/layout/page'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const STATS = [
  { label: 'Active sessions', value: '4,219', delta: '+12.4%', up: true, icon: Activity },
  { label: 'Total users', value: '28,901', delta: '+3.1%', up: true, icon: Users },
  { label: 'Nodes online', value: '64 / 64', delta: '0.0%', up: true, icon: Server },
  { label: 'Avg. p95 latency', value: '242ms', delta: '-8.7%', up: true, icon: Zap },
]

const FEED = [
  { id: 1, event: 'Deployment succeeded', target: 'console v1.4.2', time: '2m ago', tone: 'success' },
  { id: 2, event: 'Latency spike resolved', target: 'node-04', time: '18m ago', tone: 'info' },
  { id: 3, event: 'API key created', target: 'ci-runner', time: '1h ago', tone: 'default' },
  { id: 4, event: 'Backup completed', target: 'db-prod-01', time: '3h ago', tone: 'success' },
  { id: 5, event: 'Disk threshold', target: 'node-12', time: '5h ago', tone: 'warning' },
]

const toneClass: Record<string, string> = {
  success: 'bg-success',
  info: 'bg-info',
  warning: 'bg-warning',
  default: 'bg-muted-foreground',
}

function DashboardPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Dashboard"
        description="Operational overview of the KentOS production environment."
        actions={
          <PageActions>
            <Button variant="outline">
              <Download /> Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus /> New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>New project</DropdownMenuItem>
                <DropdownMenuItem>New workflow</DropdownMenuItem>
                <DropdownMenuItem>Invite user</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Import data</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </PageActions>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{s.value}</CardTitle>
              <CardAction>
                <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <s.icon className="size-4" />
                </span>
              </CardAction>
            </CardHeader>
            <CardContent>
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-medium',
                  s.up ? 'text-success' : 'text-destructive',
                )}
              >
                {s.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {s.delta}
                <span className="text-muted-foreground">vs last week</span>
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Activity feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest events across the workspace.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {FEED.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <span className={cn('size-1.5 rounded-full', toneClass[f.tone])} />
                        {f.event}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{f.target}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{f.time}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-sm" aria-label="Open">
                        <ArrowUpRight />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Resource usage */}
        <Card>
          <CardHeader>
            <CardTitle>Cluster resources</CardTitle>
            <CardDescription>Aggregate utilization.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {[
              { label: 'CPU', value: 42 },
              { label: 'Memory', value: 61 },
              { label: 'Disk', value: 38 },
              { label: 'Network', value: 27 },
            ].map((r) => (
              <div key={r.label} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-medium tabular-nums">{r.value}%</span>
                </div>
                <Progress value={r.value} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <PageFooter>
        <PageFooterStat label="Region" value="eu-central-1" />
        <PageFooterStat label="Uptime" value="99.98%" />
        <PageFooterStat label="Last sync" value="just now" className="ml-auto" />
      </PageFooter>
    </PageWrapper>
  )
}

export const Route = createFileRoute('/')({ component: DashboardPage })
