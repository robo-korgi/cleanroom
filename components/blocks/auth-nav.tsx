'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import AvatarMenu from './avatar-menu';

export default function AuthNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const isLoggedIn = !!user;
  const userEmail = user?.email || '';
  // TODO: Implement admin role checking with Supabase user metadata or database
  const isAdmin = false;

  return (
    <nav data-testid="nav" className="w-full flex items-center justify-between px-8 py-6">
      {/* Logo / Home */}
      <Link
        href="/"
        data-testid="nav-logo"
        className="text-2xl no-underline hover:no-underline cursor-pointer"
      >
        ✨
      </Link>

      {/* Navigation Links */}
      <div className="flex gap-6 items-center">
        {/* Always visible gallery links */}
        <Link
          href="/components"
          className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          Components
        </Link>
        <Link
          href="/blocks"
          className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          Blocks
        </Link>

        {/* Auth State Navigation */}
        {!isLoggedIn ? (
          <>
            {/* Logged-out state */}
            <Link
              href="/signin"
              data-testid="nav-signin"
              className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              data-testid="nav-signup"
              className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            {/* Logged-in state */}
            {/* Admin link (only for admins) */}
            {isAdmin && (
              <Link
                href="/admin"
                data-testid="nav-admin"
                className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                Admin
              </Link>
            )}

            {/* Avatar Menu */}
            <AvatarMenu
              userEmail={userEmail}
              userId={user?.id}
              onSignOut={handleSignOut}
            />
          </>
        )}
      </div>
    </nav>
  );
}
