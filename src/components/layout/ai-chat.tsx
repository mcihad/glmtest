import * as React from 'react'
import { Sparkles, X, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLayout } from '@/lib/layout/use-layout'
import { cn } from '@/lib/utils'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Summarize today’s incidents',
  'Explain the access model',
  'Show node-04 health',
]

const DEMO_REPLIES = [
  'Here’s a quick summary: no active incidents, p95 latency is back to normal on node-04.',
  'Access is role-based: admins manage users & API keys, operators run workflows, viewers have read-only access.',
  'node-04 is healthy — CPU 38%, memory 61%, disk 44%. Latency p95: 240ms.',
]

export function AiChat() {
  const { aiOpen, setAiOpen } = useLayout()
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      content: 'Hi! I’m the KentOS assistant. Ask me anything about your workspace.',
    },
  ])
  const [input, setInput] = React.useState('')
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  const send = (text: string) => {
    const content = text.trim()
    if (!content) return
    const userMsg: Message = { id: Date.now(), role: 'user', content }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setTimeout(() => {
      const reply: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: DEMO_REPLIES[Math.floor(Math.random() * DEMO_REPLIES.length)],
      }
      setMessages((m) => [...m, reply])
    }, 600)
  }

  return (
    <>
      {/* FAB */}
      <Button
        aria-label="Open AI assistant"
        onClick={() => setAiOpen(true)}
        className={cn(
          'fixed right-5 bottom-[calc(var(--app-footer-height)+1.25rem)] z-[var(--app-z-fab)] size-12 rounded-full shadow-lg transition-transform duration-[var(--duration-normal)] ease-[var(--ease-emphasized)]',
          aiOpen && 'pointer-events-none scale-0 opacity-0',
        )}
      >
        <Sparkles className="size-5" />
      </Button>

      {/* Dock */}
      <div
        data-slot="ai-dock"
        className={cn(
          'fixed right-5 bottom-[calc(var(--app-footer-height)+1.25rem)] z-[var(--app-z-fab)] flex w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border bg-popover shadow-2xl transition-[transform,opacity,box-shadow] duration-[var(--duration-normal)] ease-[var(--ease-emphasized)] origin-bottom-right',
          'h-[min(34rem,calc(100vh-var(--app-footer-height)-6rem))]',
          aiOpen
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-90 opacity-0',
        )}
      >
        <div className="flex items-center gap-2 border-b p-3">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-none">AI Assistant</p>
            <p className="mt-1 text-2xs text-muted-foreground">Demo · not connected</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setAiOpen(false)} aria-label="Close">
            <X />
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3 p-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                  m.role === 'user'
                    ? 'self-end bg-primary text-primary-foreground'
                    : 'self-start bg-muted text-foreground',
                )}
              >
                {m.content}
              </div>
            ))}
          </div>
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          className="flex items-center gap-2 border-t p-3"
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
          />
          <Button type="submit" size="icon-sm" disabled={!input.trim()} aria-label="Send">
            <ArrowUp />
          </Button>
        </form>
      </div>
    </>
  )
}
