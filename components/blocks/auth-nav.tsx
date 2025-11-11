'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

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
    router.push('/');
    router.refresh();
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
        className="text-2xl no-underline hover:no-underline"
      >
        ✨
      </Link>

      {/* Auth State Navigation */}
      <div className="flex gap-6 items-center">
        {!isLoggedIn ? (
          <>
            {/* Logged-out state */}
            <Link
              href="/signin"
              data-testid="nav-signin"
              className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              data-testid="nav-signup"
              className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            {/* Logged-in state */}
            <div className="flex items-center gap-2">
              {/* Account email */}
              <span
                data-testid="nav-account-email"
                className="text-sm text-zinc-700"
              >
                {userEmail}
              </span>
              {/* Avatar fallback */}
              <div
                data-testid="nav-account-avatar"
                className="w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center text-zinc-600 text-xs"
              >
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>

            {/* Admin link (only for admins) */}
            {isAdmin && (
              <Link
                href="/admin"
                data-testid="nav-admin"
                className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                Admin
              </Link>
            )}

            {/* Sign Out button */}
            <button
              data-testid="nav-signout"
              onClick={handleSignOut}
              className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
