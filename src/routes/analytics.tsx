import { createFileRoute } from '@tanstack/react-router'
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
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Calendar, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

const BARS = [38, 52, 41, 67, 49, 72, 58, 81, 63, 74, 59, 88, 71, 64]
const MAX = Math.max(...BARS)

const TRAFFIC = [
  { source: 'Direct', visits: 12420, share: 41 },
  { source: 'Organic search', visits: 8190, share: 27 },
  { source: 'Referral', visits: 5230, share: 17 },
  { source: 'Social', visits: 3140, share: 10 },
  { source: 'Email', visits: 1480, share: 5 },
]

function AnalyticsPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Analytics"
        description="Sessions, engagement and traffic sources."
        actions={
          <PageActions>
            <Button variant="outline">
              <Calendar /> Last 14 days
            </Button>
            <Button variant="outline">
              <Filter /> Filters
            </Button>
          </PageActions>
        }
      />

      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sessions over time</CardTitle>
              <CardDescription>Daily sessions for the last 14 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-56 items-end gap-2">
                {BARS.map((b, i) => (
                  <div
                    key={i}
                    className="group flex flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div
                      className="w-full rounded-t-md bg-primary/80 transition-all group-hover:bg-primary"
                      style={{ height: `${(b / MAX) * 100}%` }}
                    />
                    <span className="text-2xs text-muted-foreground">{i + 1}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic sources</CardTitle>
              <CardDescription>Where your visitors come from.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {TRAFFIC.map((t) => (
                <div key={t.source} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm">{t.source}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${t.share}%` }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                    {t.visits.toLocaleString()}
                  </span>
                  <Badge variant="secondary" className="w-12 justify-center">
                    {t.share}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="mt-4">
          <div className={cn('grid gap-4 sm:grid-cols-3')}>
            {[
              { k: 'Avg. duration', v: '4m 12s' },
              { k: 'Bounce rate', v: '38.2%' },
              { k: 'Pages / session', v: '3.4' },
            ].map((m) => (
              <Card key={m.k}>
                <CardHeader>
                  <CardDescription>{m.k}</CardDescription>
                  <CardTitle className="text-2xl tabular-nums">{m.v}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <PageFooter>
        <PageFooterStat label="Sessions" value="30,460" />
        <PageFooterStat label="Avg. duration" value="4m 12s" />
        <PageFooterStat label="Bounce" value="38.2%" />
        <PageFooterStat label="Updated" value="just now" className="ml-auto" />
      </PageFooter>
    </PageWrapper>
  )
}

export const Route = createFileRoute('/analytics')({ component: AnalyticsPage })
