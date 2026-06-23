import * as React from 'react'
import { RotateCcw, Check } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useTheme } from '@/lib/theme/use-theme'
import {
  COLOR_PRESETS,
  FONT_OPTIONS,
  MONO_FONT_OPTIONS,
} from '@/lib/theme/presets'
import type { ShadowStrength, ThemeMode } from '@/lib/theme/types'
import { useLayout } from '@/lib/layout/use-layout'
import { cn } from '@/lib/utils'

function Row({
  label,
  value,
  children,
}: {
  label: string
  value?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {value && (
          <span className="text-xs tabular-nums text-muted-foreground">
            {value}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

export function ThemeCustomizer() {
  const { customizerOpen, setCustomizerOpen } = useLayout()
  const { config, setConfig, reset } = useTheme()

  return (
    <Sheet open={customizerOpen} onOpenChange={setCustomizerOpen}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Customize theme</SheetTitle>
          <SheetDescription>
            Changes apply instantly and persist across reloads.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 p-5">
          {/* Mode */}
          <Row label="Mode">
            <ToggleGroup
              type="single"
              value={config.mode}
              onValueChange={(v) => v && setConfig({ mode: v as ThemeMode })}
              className="w-full"
            >
              <ToggleGroupItem value="light" variant="outline" className="flex-1">
                Light
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" variant="outline" className="flex-1">
                Dark
              </ToggleGroupItem>
              <ToggleGroupItem value="system" variant="outline" className="flex-1">
                System
              </ToggleGroupItem>
            </ToggleGroup>
          </Row>

          {/* Preset */}
          <Row label="Accent preset">
            <div className="grid grid-cols-7 gap-2">
              {COLOR_PRESETS.map((p) => {
                const active = config.preset === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => setConfig({ preset: p.id })}
                    aria-label={p.label}
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full ring-offset-2 ring-offset-background outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      active && 'ring-2 ring-ring',
                    )}
                    style={{ backgroundColor: p.swatch }}
                  >
                    {active && <Check className="size-3.5 text-white" />}
                  </button>
                )
              })}
            </div>
          </Row>

          {/* Radius */}
          <Row label="Radius" value={`${config.radius.toFixed(2)} rem`}>
            <Slider
              min={0}
              max={1.5}
              step={0.01}
              value={[config.radius]}
              onValueChange={([v]) => setConfig({ radius: v })}
            />
          </Row>

          {/* Scale */}
          <Row label="Type scale" value={`${config.scale.toFixed(2)}×`}>
            <Slider
              min={0.85}
              max={1.25}
              step={0.01}
              value={[config.scale]}
              onValueChange={([v]) => setConfig({ scale: v })}
            />
          </Row>

          {/* Font size */}
          <Row label="Font size" value={`${config.fontSize}px`}>
            <Slider
              min={13}
              max={18}
              step={1}
              value={[config.fontSize]}
              onValueChange={([v]) => setConfig({ fontSize: v })}
            />
          </Row>

          {/* Spacing */}
          <Row label="Spacing grid" value={`${config.spacing.toFixed(2)} rem`}>
            <Slider
              min={0.2}
              max={0.32}
              step={0.01}
              value={[config.spacing]}
              onValueChange={([v]) => setConfig({ spacing: v })}
            />
          </Row>

          {/* Shadow */}
          <Row label="Shadow strength">
            <ToggleGroup
              type="single"
              value={config.shadow}
              onValueChange={(v) =>
                v && setConfig({ shadow: v as ShadowStrength })
              }
              className="w-full"
            >
              <ToggleGroupItem value="none" variant="outline" className="flex-1">
                None
              </ToggleGroupItem>
              <ToggleGroupItem value="soft" variant="outline" className="flex-1">
                Soft
              </ToggleGroupItem>
              <ToggleGroupItem value="default" variant="outline" className="flex-1">
                Default
              </ToggleGroupItem>
              <ToggleGroupItem value="strong" variant="outline" className="flex-1">
                Strong
              </ToggleGroupItem>
            </ToggleGroup>
          </Row>

          {/* Fonts */}
          <Row label="Body font">
            <FontSelect
              value={config.fontSans}
              options={FONT_OPTIONS}
              onChange={(stack) => setConfig({ fontSans: stack })}
            />
          </Row>
          <Row label="Heading font">
            <FontSelect
              value={config.fontHeading}
              options={FONT_OPTIONS}
              onChange={(stack) => setConfig({ fontHeading: stack })}
            />
          </Row>
          <Row label="Mono font">
            <FontSelect
              value={config.fontMono}
              options={MONO_FONT_OPTIONS}
              onChange={(stack) => setConfig({ fontMono: stack })}
            />
          </Row>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={reset}>
            <RotateCcw /> Reset to defaults
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function FontSelect({
  value,
  options,
  onChange,
}: {
  value: string
  options: { id: string; label: string; stack: string }[]
  onChange: (stack: string) => void
}) {
  const current = options.find((o) => o.stack === value) ?? options[0]
  return (
    <Select
      value={current?.id}
      onValueChange={(id) => {
        const opt = options.find((o) => o.id === id)
        if (opt) onChange(opt.stack)
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            <span style={{ fontFamily: o.stack }}>{o.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
