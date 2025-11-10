# 014 — Mobile Nav (TEST FIRST)

Meta:
- created: 2025-11-10
- depends-on: 012 (nav), 013 (avatar menu)
- scope: Responsive navigation with mobile drawer

## Objective
Add mobile-responsive navigation to the existing nav block using a hamburger menu that slides out from the left with a backdrop overlay. Navigation links should be defined once and reused across both desktop and mobile views.

## Technology
- **shadcn Sheet component** for the mobile drawer
- **shadcn Button component** for hamburger icon
- **Lucide icons** for hamburger/close icons
- Tailwind responsive breakpoints

Install required components:
```bash
npx shadcn@latest add sheet
```

## Behavior

### Desktop (≥ md breakpoint, 768px+)
- Nav links displayed inline horizontally
- No hamburger icon visible
- Avatar menu (from 013) visible inline

### Mobile (< md breakpoint, < 768px)
- Nav links hidden
- Hamburger icon visible in nav bar
- Clicking hamburger opens Sheet drawer from left
- Backdrop overlay dims the rest of the screen
- Sheet contains same nav links in vertical layout
- Avatar menu (if logged in) shown in Sheet
- Clicking backdrop or close icon dismisses Sheet
- Clicking any nav link dismisses Sheet

## DRY Principle: Shared Nav Links
Navigation links must be defined **once** and reused in both views.

Create a shared data structure:
```typescript
// components/nav/nav-links.ts
export const navLinks = {
  public: [
    { href: '/', label: 'Home', testId: 'nav-home' },
    { href: '/signin', label: 'Sign In', testId: 'nav-signin' },
    { href: '/signup', label: 'Sign Up', testId: 'nav-signup' },
  ],
  authenticated: [
    { href: '/', label: 'Home', testId: 'nav-home' },
    { href: '/account', label: 'Account', testId: 'nav-account' },
    // Avatar menu (013) renders separately
  ],
  admin: [
    { href: '/', label: 'Home', testId: 'nav-home' },
    { href: '/account', label: 'Account', testId: 'nav-account' },
    { href: '/admin', label: 'Admin', testId: 'nav-admin' },
    // Avatar menu (013) renders separately
  ],
};
```

Both desktop nav and mobile Sheet map over the same data structure.

## Structure

```tsx
<nav data-testid="nav">
  {/* Logo - always visible */}
  <Logo />

  {/* Desktop nav - hidden on mobile */}
  <div className="hidden md:flex">
    {navLinks[authState].map(link => <NavLink {...link} />)}
    {isAuthenticated && <AvatarMenu />}
  </div>

  {/* Mobile hamburger - hidden on desktop */}
  <Button
    variant="ghost"
    className="md:hidden"
    data-testid="nav-mobile-toggle"
    onClick={() => setOpen(true)}
  >
    <MenuIcon />
  </Button>

  {/* Mobile Sheet */}
  <Sheet open={open} onOpenChange={setOpen}>
    <SheetContent side="left" data-testid="nav-mobile-drawer">
      {navLinks[authState].map(link => (
        <NavLink {...link} onClick={() => setOpen(false)} />
      ))}
      {isAuthenticated && <AvatarMenu />}
    </SheetContent>
  </Sheet>
</nav>
```

## Breakpoints
Use Tailwind's standard breakpoints:
- `md:` prefix for desktop (≥ 768px)
- Default (no prefix) for mobile (< 768px)

## Touch Interactions
- **Tap hamburger**: Opens drawer
- **Tap backdrop**: Closes drawer
- **Tap any link**: Navigates and closes drawer
- **Swipe left** (optional enhancement): Closes drawer

## Selectors (data-testid)
- `nav-mobile-toggle` — Hamburger button
- `nav-mobile-drawer` — Sheet content container
- `nav-mobile-backdrop` — Sheet overlay/backdrop
- Existing link selectors from 012: `nav-home`, `nav-signin`, `nav-signup`, `nav-account`, `nav-admin`

## Playwright Tests

### @smoke
```typescript
test('mobile: hamburger visible on small viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page.getByTestId('nav-mobile-toggle')).toBeVisible();
});

test('desktop: hamburger hidden on large viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await expect(page.getByTestId('nav-mobile-toggle')).not.toBeVisible();
});
```

### @mobile
```typescript
test('mobile: drawer opens on hamburger click', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  await page.getByTestId('nav-mobile-toggle').click();
  await expect(page.getByTestId('nav-mobile-drawer')).toBeVisible();
});

test('mobile: drawer closes on backdrop click', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  await page.getByTestId('nav-mobile-toggle').click();
  await expect(page.getByTestId('nav-mobile-drawer')).toBeVisible();

  // Click backdrop (Sheet's overlay)
  await page.locator('[data-radix-dialog-overlay]').click();
  await expect(page.getByTestId('nav-mobile-drawer')).not.toBeVisible();
});

test('mobile: drawer closes on link click', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  await page.getByTestId('nav-mobile-toggle').click();
  await expect(page.getByTestId('nav-mobile-drawer')).toBeVisible();

  await page.getByTestId('nav-home').click();
  await expect(page.getByTestId('nav-mobile-drawer')).not.toBeVisible();
});

test('mobile: same links in drawer as desktop nav', async ({ page }) => {
  // Check desktop links
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  const desktopLinks = await page.getByRole('navigation').getByRole('link').allTextContents();

  // Check mobile links
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.getByTestId('nav-mobile-toggle').click();
  const mobileLinks = await page.getByTestId('nav-mobile-drawer').getByRole('link').allTextContents();

  expect(mobileLinks).toEqual(desktopLinks);
});
```

### @auth
```typescript
test('mobile: authenticated drawer shows avatar menu', async ({ page }) => {
  // Login first (use helper from 012)
  await loginAsUser(page);

  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  await page.getByTestId('nav-mobile-toggle').click();
  await expect(page.getByTestId('nav-avatar')).toBeVisible();
  await expect(page.getByTestId('nav-signout')).toBeVisible();
});
```

## Accessibility
- Hamburger button has `aria-label="Open navigation menu"`
- Sheet has proper ARIA attributes (handled by shadcn)
- Focus trap when drawer is open
- ESC key closes drawer
- Tab order flows correctly through drawer items

## Exit Criteria
- All tests pass on mobile viewports (375px, 414px) and desktop (1280px, 1920px)
- Nav links are defined once and rendered consistently in both views
- Drawer slides smoothly from left
- Backdrop properly dims background
- Touch interactions work on actual mobile devices
