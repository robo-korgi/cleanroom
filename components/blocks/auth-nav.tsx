'use client';

import Link from 'next/link';

export default function AuthNav() {
  // TODO: Replace with actual Supabase auth state when implemented
  // For now, this shows the logged-out state
  const isLoggedIn = false;
  const isAdmin = false;
  const userEmail: string = '';

  return (
    <nav data-testid="nav" className="w-full flex items-center justify-between px-8 py-6 border-b border-zinc-200">
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
              onClick={() => {
                // TODO: Implement sign out with Supabase
                console.log('Sign out clicked');
              }}
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
