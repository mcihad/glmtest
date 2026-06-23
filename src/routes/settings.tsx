import { createFileRoute } from '@tanstack/react-router'
import {
  PageWrapper,
  PageHeader,
  PageActions,
} from '@/components/layout/page'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

function SettingsPage() {
  return (
    <PageWrapper className="max-w-3xl">
      <PageHeader
        title="Settings"
        description="Manage your profile and workspace preferences."
        actions={
          <PageActions>
            <Button variant="outline">Discard</Button>
            <Button onClick={() => toast.success('Settings saved')}>Save changes</Button>
          </PageActions>
        }
      />

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>This information is visible to your team.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Display name</Label>
                <Input id="name" defaultValue="Cihad Güvenç" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="cihad@kentos.io" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={3} placeholder="Tell us about yourself" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Workspace behavior.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {[
              { k: 'Email notifications', desc: 'Receive product & alert emails.', on: true },
              { k: 'Compact density', desc: 'Reduce vertical spacing across the app.', on: false },
              { k: 'Auto-refresh dashboards', desc: 'Poll live data every 30s.', on: true },
            ].map((p, i) => (
              <div key={p.k}>
                {i > 0 && <Separator className="my-3" />}
                <label className="flex items-center justify-between gap-4 py-1">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{p.k}</span>
                    <span className="text-xs text-muted-foreground">{p.desc}</span>
                  </div>
                  <Switch defaultChecked={p.on} />
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Region</Label>
                <Select defaultValue="eu">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eu">eu-central-1</SelectItem>
                    <SelectItem value="us">us-east-1</SelectItem>
                    <SelectItem value="ap">ap-southeast-1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Time zone</Label>
                <Select defaultValue="berlin">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="berlin">Europe/Berlin</SelectItem>
                    <SelectItem value="london">Europe/London</SelectItem>
                    <SelectItem value="tokyo">Asia/Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}

export const Route = createFileRoute('/settings')({ component: SettingsPage })
