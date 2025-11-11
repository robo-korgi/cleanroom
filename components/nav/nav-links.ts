export interface NavLink {
  href: string;
  label: string;
  testId?: string;
}

// Always visible gallery links
export const galleryLinks: NavLink[] = [
  { href: '/components', label: 'Components' },
  { href: '/blocks', label: 'Blocks' },
];

// Links shown only when logged out
export const publicAuthLinks: NavLink[] = [
  { href: '/signin', label: 'Sign In', testId: 'nav-signin' },
  { href: '/signup', label: 'Sign Up', testId: 'nav-signup' },
];

// Links shown only for admins (in addition to gallery links)
export const adminLinks: NavLink[] = [
  { href: '/admin', label: 'Admin', testId: 'nav-admin' },
];
