import {
  User,
  Settings,
  LogOut,
  LifeBuoy,
  Keyboard,
  Palette,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useLayout } from '@/lib/layout/use-layout'

export function UserMenu() {
  const { setCustomizerOpen } = useLayout()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-full" aria-label="User menu">
          <Avatar className="size-7">
            <AvatarImage src="" alt="Cihad" />
            <AvatarFallback className="size-7 bg-primary text-primary-foreground text-xs">
              CG
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">Cihad Güvenç</span>
            <span className="text-xs font-normal text-muted-foreground">cihad@kentos.io</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <User /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCustomizerOpen(true)}>
          <Palette /> Customize theme
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/help">
            <LifeBuoy /> Help & Docs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Keyboard /> Keyboard shortcuts
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
