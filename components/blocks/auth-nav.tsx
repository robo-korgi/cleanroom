'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import AvatarMenu from './avatar-menu';
import { galleryLinks, publicAuthLinks, adminLinks, type NavLink } from '@/components/nav/nav-links';

export default function AuthNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const renderNavLink = (link: NavLink, closeMenu?: () => void) => (
    <Link
      key={link.href}
      href={link.href}
      data-testid={link.testId}
      className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
      onClick={closeMenu}
    >
      {link.label}
    </Link>
  );

  return (
    <nav data-testid="nav" className="w-full flex items-center justify-between px-8 py-6">
      {/* Logo */}
      <Link
        href="/"
        data-testid="nav-logo"
        className="text-2xl no-underline hover:no-underline cursor-pointer"
      >
        ✨
      </Link>

      {/* Desktop Navigation - hidden on mobile */}
      <div className="hidden md:flex gap-6 items-center">
        {/* Gallery links - always visible */}
        {galleryLinks.map(link => renderNavLink(link))}

        {/* Auth state navigation */}
        {!isLoggedIn ? (
          <>
            {/* Public auth links */}
            {publicAuthLinks.map(link => renderNavLink(link))}
          </>
        ) : (
          <>
            {/* Admin link (only for admins) */}
            {isAdmin && adminLinks.map(link => renderNavLink(link))}

            {/* Avatar Menu */}
            <AvatarMenu
              userEmail={userEmail}
              userId={user?.id}
              onSignOut={handleSignOut}
            />
          </>
        )}
      </div>

      {/* Mobile Hamburger - hidden on desktop */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        data-testid="nav-mobile-toggle"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" data-testid="nav-mobile-drawer">
          <SheetHeader>
            <SheetTitle>Cleanroom</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-6 px-4">
            {/* Gallery links - always visible */}
            {galleryLinks.map(link => renderNavLink(link, () => setMobileMenuOpen(false)))}

            {/* Auth state navigation */}
            {!isLoggedIn ? (
              <>
                {/* Public auth links */}
                {publicAuthLinks.map(link => renderNavLink(link, () => setMobileMenuOpen(false)))}
              </>
            ) : (
              <>
                {/* Admin link (only for admins) */}
                {isAdmin && adminLinks.map(link => renderNavLink(link, () => setMobileMenuOpen(false)))}

                {/* Avatar Menu in mobile drawer */}
                <div className="pt-4 border-t">
                  <AvatarMenu
                    userEmail={userEmail}
                    userId={user?.id}
                    onSignOut={handleSignOut}
                  />
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
