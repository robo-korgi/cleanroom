'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut } from 'lucide-react';

interface AvatarMenuProps {
  userEmail: string;
  userId?: string;
  onSignOut: () => void;
}

export default function AvatarMenu({ userEmail, userId, onSignOut }: AvatarMenuProps) {
  const avatarLetter = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';
  const profileUrl = userId ? `/u/${userId}` : '#';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-testid="nav-avatar"
          className="w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center text-zinc-600 text-xs cursor-pointer hover:bg-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500"
          aria-label="User menu"
        >
          {avatarLetter}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-testid="nav-user-menu"
        align="end"
        className="w-48"
      >
        <DropdownMenuItem asChild>
          <Link
            href={profileUrl}
            data-testid="menu-profile"
            className="flex items-center gap-2 cursor-pointer"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/account"
            data-testid="menu-settings"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          data-testid="menu-signout"
          onClick={onSignOut}
          className="flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
