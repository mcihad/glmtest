import * as React from 'react'
import { toast } from 'sonner'
import { MessageSquarePlus, Send } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useLayout } from '@/lib/layout/use-layout'

export function FeedbackDialog() {
  const { feedbackOpen, setFeedbackOpen } = useLayout()
  const [message, setMessage] = React.useState('')

  const submit = () => {
    if (!message.trim()) return
    toast.success('Thanks! Your feedback was submitted.', {
      description: 'We read every message.',
    })
    setMessage('')
    setFeedbackOpen(false)
  }

  return (
    <Dialog
      open={feedbackOpen}
      onOpenChange={(o) => {
        setFeedbackOpen(o)
        if (!o) setMessage('')
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="size-5 text-muted-foreground" />
            Send feedback
          </DialogTitle>
          <DialogDescription>
            Tell us what’s working or what could be better.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="feedback-message">Your message</Label>
          <Textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What’s on your mind?"
            rows={5}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setFeedbackOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!message.trim()}>
            <Send /> Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
