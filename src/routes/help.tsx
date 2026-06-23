import { createFileRoute, Link } from '@tanstack/react-router'
import { LifeBuoy, BookOpen, MessageSquarePlus, ExternalLink } from 'lucide-react'
import {
  PageWrapper,
  PageHeader,
} from '@/components/layout/page'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { useLayout } from '@/lib/layout/use-layout'

const FAQ = [
  {
    q: 'How do I customize the theme?',
    a: 'Open the customizer from the app bar (palette icon) or the command palette. Changes persist across reloads.',
  },
  {
    q: 'How do I switch between applications?',
    a: 'Click the brand icon in the sidebar header to open the App Launcher, or use ⌘K and choose “Open applications”.',
  },
  {
    q: 'Where does my theme get stored?',
    a: 'Your ThemeConfig is saved to localStorage under the "app-theme" key and re-applied before first paint.',
  },
  {
    q: 'Can I add a new accent preset?',
    a: 'Append a ColorPreset object to COLOR_PRESETS in src/lib/theme/presets.ts — it shows up in the customizer automatically.',
  },
]

function HelpPage() {
  const { setFeedbackOpen } = useLayout()

  return (
    <PageWrapper className="max-w-3xl">
      <PageHeader
        title="Help & Docs"
        description="Guides, FAQs and support for KentOS Console."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documentation</CardTitle>
            <CardDescription>Browse the full guides.</CardDescription>
            <CardAction>
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="size-4" />
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <a href="#">Open docs <ExternalLink /></a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Support</CardTitle>
            <CardDescription>Reach the team directly.</CardDescription>
            <CardAction>
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LifeBuoy className="size-4" />
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={() => setFeedbackOpen(true)}>
              <MessageSquarePlus /> Send feedback
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
            <CardDescription>Live system health.</CardDescription>
            <CardAction>
              <span className="flex size-8 items-center justify-center rounded-lg bg-success/15 text-success">
                <span className="size-2 rounded-full bg-success" />
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <Link to="/analytics">View analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Frequently asked questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single">
            {FAQ.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </PageWrapper>
  )
}

export const Route = createFileRoute('/help')({ component: HelpPage })
