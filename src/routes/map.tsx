import { createFileRoute } from '@tanstack/react-router'
import { Plus, Minus, Locate, Layers, Map as MapIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageWrapper } from '@/components/layout/page'
import { cn } from '@/lib/utils'

const NODES = [
  { id: 'n01', x: 22, y: 30, label: 'node-01' },
  { id: 'n02', x: 48, y: 22, label: 'node-02' },
  { id: 'n03', x: 70, y: 45, label: 'node-03' },
  { id: 'n04', x: 35, y: 62, label: 'node-04' },
  { id: 'n05', x: 60, y: 70, label: 'node-05' },
  { id: 'n06', x: 82, y: 60, label: 'node-06' },
]

function MapPage() {
  return (
    <PageWrapper padded={false}>
      <div className="absolute inset-0 overflow-hidden bg-muted/30">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(to right, color-mix(in oklch, var(--border) 80%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--border) 80%, transparent) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Edges */}
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {NODES.slice(0, -1).map((n, i) => {
            const m = NODES[i + 1]
            return (
              <line
                key={n.id}
                x1={`${n.x}%`}
                y1={`${n.y}%`}
                x2={`${m.x}%`}
                y2={`${m.y}%`}
                stroke="var(--primary)"
                strokeOpacity={0.35}
                strokeWidth={1.5}
              />
            )
          })}
        </svg>

        {/* Nodes */}
        {NODES.map((n) => (
          <div
            key={n.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="flex size-3 items-center justify-center rounded-full bg-primary ring-4 ring-primary/20" />
              <span className="rounded-md bg-background/90 px-1.5 py-0.5 text-2xs font-medium shadow-xs">
                {n.label}
              </span>
            </div>
          </div>
        ))}

        {/* Controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-1.5">
          <Button variant="outline" size="icon-sm" aria-label="Zoom in"><Plus /></Button>
          <Button variant="outline" size="icon-sm" aria-label="Zoom out"><Minus /></Button>
          <Button variant="outline" size="icon-sm" aria-label="Locate"><Locate /></Button>
          <Button variant="outline" size="icon-sm" aria-label="Layers"><Layers /></Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg border bg-background/90 px-3 py-2 text-xs shadow-md backdrop-blur">
          <MapIcon className="size-4 text-muted-foreground" />
          <span className="font-medium">Topology</span>
          <span className="text-muted-foreground">· {NODES.length} nodes</span>
        </div>

        <div className={cn('pointer-events-none absolute right-4 bottom-4 text-2xs text-muted-foreground')}>
          flush PageWrapper · absolute inset-0
        </div>
      </div>
    </PageWrapper>
  )
}

export const Route = createFileRoute('/map')({ component: MapPage })
