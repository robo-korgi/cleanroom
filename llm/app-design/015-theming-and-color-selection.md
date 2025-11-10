# 015 — Theming & Color Selection (TEST FIRST)

Meta:
- created: 2025-11-10
- depends-on: 005 (components), 012 (nav), 014 (mobile nav)
- scope: CLI-driven theme configuration using shadcn/ui CSS variables

## Objective
Allow developers to configure primary and secondary brand colors during CLI bootstrap. Apply these colors consistently to shadcn/ui components (especially buttons) throughout the app using CSS custom properties.

## CLI Bootstrap Flow

During `cleanroom new`, add theme configuration prompts:

### 1. Color Selection Mode
```typescript
{
  type: 'select',
  name: 'colorSelectionMode',
  message: 'How would you like to choose your theme colors?',
  choices: [
    { title: 'Named Colors (e.g., blue, red, green)', value: 'named' },
    { title: 'Custom Hex Values', value: 'hex' },
    { title: 'Preset Color Palettes', value: 'palette' },
  ],
}
```

### 2a. Named Colors Mode
```typescript
// If mode === 'named'
{
  type: 'select',
  name: 'primaryColorName',
  message: 'Choose primary color:',
  choices: [
    { title: 'Blue', value: 'blue' },
    { title: 'Green', value: 'green' },
    { title: 'Red', value: 'red' },
    { title: 'Orange', value: 'orange' },
    { title: 'Purple', value: 'purple' },
    { title: 'Pink', value: 'pink' },
    { title: 'Teal', value: 'teal' },
    { title: 'Slate', value: 'slate' },
  ],
}

{
  type: 'select',
  name: 'secondaryColorName',
  message: 'Choose secondary color:',
  choices: [/* same as above */],
}
```

Named colors map to Tailwind color scales:
- `blue` → `hsl(221.2 83.2% 53.3%)`
- `green` → `hsl(142.1 76.2% 36.3%)`
- `red` → `hsl(0 84.2% 60.2%)`
- etc.

### 2b. Custom Hex Mode
```typescript
// If mode === 'hex'
{
  type: 'text',
  name: 'primaryColorHex',
  message: 'Enter primary color (hex):',
  initial: '#3b82f6',
  validate: (value) => /^#[0-9A-Fa-f]{6}$/.test(value),
}

{
  type: 'text',
  name: 'secondaryColorHex',
  message: 'Enter secondary color (hex):',
  initial: '#8b5cf6',
  validate: (value) => /^#[0-9A-Fa-f]{6}$/.test(value),
}
```

CLI converts hex to HSL for CSS variables.

### 2c. Preset Palette Mode
```typescript
// If mode === 'palette'
{
  type: 'select',
  name: 'colorPalette',
  message: 'Choose a color palette:',
  choices: [
    { title: 'Ocean (Blue/Teal)', value: 'ocean', hint: 'Blue primary, Teal secondary' },
    { title: 'Forest (Green/Lime)', value: 'forest', hint: 'Green primary, Lime secondary' },
    { title: 'Sunset (Orange/Pink)', value: 'sunset', hint: 'Orange primary, Pink secondary' },
    { title: 'Lavender (Purple/Pink)', value: 'lavender', hint: 'Purple primary, Pink secondary' },
    { title: 'Professional (Slate/Blue)', value: 'professional', hint: 'Slate primary, Blue secondary' },
    { title: 'Warm (Red/Orange)', value: 'warm', hint: 'Red primary, Orange secondary' },
  ],
}
```

Preset palettes are predefined primary/secondary combinations.

## shadcn/ui Theme System

shadcn/ui uses **CSS custom properties** (CSS variables) for theming. Colors are defined in HSL format in `app/globals.css`.

### Generated globals.css

The CLI generates theme configuration based on selections:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    /* PRIMARY - from CLI selection */
    --primary: 221.2 83.2% 53.3%;        /* blue (example) */
    --primary-foreground: 210 40% 98%;

    /* SECONDARY - from CLI selection */
    --secondary: 142.1 76.2% 36.3%;      /* green (example) */
    --secondary-foreground: 210 40% 98%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    /* PRIMARY - adjusted for dark mode */
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;

    /* SECONDARY - adjusted for dark mode */
    --secondary: 142.1 70.6% 45.3%;
    --secondary-foreground: 210 40% 98%;

    /* ... other dark mode variables */
  }
}
```

## Button Variants

shadcn Button component uses these CSS variables for variants:

### Primary Button (default)
Uses `--primary` and `--primary-foreground`:

```tsx
<Button>Primary Action</Button>
<Button variant="default">Primary Action</Button>
```

Renders with:
```css
background-color: hsl(var(--primary));
color: hsl(var(--primary-foreground));
```

### Secondary Button
Uses `--secondary` and `--secondary-foreground`:

```tsx
<Button variant="secondary">Secondary Action</Button>
```

Renders with:
```css
background-color: hsl(var(--secondary));
color: hsl(var(--secondary-foreground));
```

### Other Variants
shadcn also provides:
- `outline` - border with transparent background
- `ghost` - transparent background
- `destructive` - uses `--destructive` color
- `link` - text-only link style

## Color Palette Presets

### Ocean
```typescript
{
  primary: { name: 'Blue', hsl: '221.2 83.2% 53.3%' },
  secondary: { name: 'Teal', hsl: '173 58% 39%' },
}
```

### Forest
```typescript
{
  primary: { name: 'Green', hsl: '142.1 76.2% 36.3%' },
  secondary: { name: 'Lime', hsl: '84 81% 44%' },
}
```

### Sunset
```typescript
{
  primary: { name: 'Orange', hsl: '24.6 95% 53.1%' },
  secondary: { name: 'Pink', hsl: '330 81% 60%' },
}
```

### Lavender
```typescript
{
  primary: { name: 'Purple', hsl: '262.1 83.3% 57.8%' },
  secondary: { name: 'Pink', hsl: '330 81% 60%' },
}
```

### Professional
```typescript
{
  primary: { name: 'Slate', hsl: '215 16.3% 46.9%' },
  secondary: { name: 'Blue', hsl: '221.2 83.2% 53.3%' },
}
```

### Warm
```typescript
{
  primary: { name: 'Red', hsl: '0 84.2% 60.2%' },
  secondary: { name: 'Orange', hsl: '24.6 95% 53.1%' },
}
```

## CLI Code Generation

### Theme Config File
Generate `config/theme.ts`:

```typescript
// Generated by cleanroom new
export const theme = {
  mode: 'palette' as const,
  palette: 'ocean' as const,
  primary: {
    name: 'Blue',
    hsl: '221.2 83.2% 53.3%',
  },
  secondary: {
    name: 'Teal',
    hsl: '173 58% 39%',
  },
} as const;
```

### Regenerate Theme Command
Provide CLI command to update theme:

```bash
npx cleanroom theme
```

Re-prompts for color selection and regenerates `globals.css`.

## Component Examples

### Nav with Primary/Secondary Buttons
```tsx
<nav>
  <Logo />
  <div className="flex gap-2">
    <Button variant="secondary">Sign In</Button>
    <Button variant="default">Sign Up</Button>
  </div>
</nav>
```

### Form Actions
```tsx
<div className="flex gap-2 justify-end">
  <Button variant="outline">Cancel</Button>
  <Button variant="default">Save Changes</Button>
</div>
```

### Call-to-Action Section
```tsx
<section>
  <h1>Get Started Today</h1>
  <div className="flex gap-4">
    <Button size="lg" variant="default">
      Start Free Trial
    </Button>
    <Button size="lg" variant="secondary">
      Learn More
    </Button>
  </div>
</section>
```

## Dark Mode Support

The generated theme includes dark mode variants. Enable dark mode toggle:

```bash
npx shadcn@latest add dropdown-menu
```

Add theme toggle component (optional):
```tsx
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

## Playwright Tests

### @smoke
```typescript
test('primary button has correct theme color', async ({ page }) => {
  await page.goto('/');

  const primaryBtn = page.getByRole('button', { name: /sign up/i });
  await expect(primaryBtn).toBeVisible();

  // Check computed styles
  const bgColor = await primaryBtn.evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });

  // Verify it matches primary color (convert HSL to RGB for comparison)
  // Exact assertion depends on selected theme
  expect(bgColor).toBeTruthy();
});

test('secondary button has correct theme color', async ({ page }) => {
  await page.goto('/');

  const secondaryBtn = page.getByRole('button', { name: /sign in/i });
  await expect(secondaryBtn).toBeVisible();

  const bgColor = await secondaryBtn.evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });

  expect(bgColor).toBeTruthy();
});
```

### @visual (optional with Percy or Playwright screenshots)
```typescript
test('theme colors render consistently', async ({ page }) => {
  await page.goto('/components');

  // Screenshot of all button variants
  await expect(page).toHaveScreenshot('buttons-themed.png');
});
```

## Accessibility

- Ensure sufficient contrast between background and foreground colors
- CLI should validate contrast ratios (WCAG AA minimum: 4.5:1 for normal text)
- If user-provided colors fail contrast check, CLI warns and suggests adjustment
- Test with color blindness simulators

## Update Existing Components (from 005)

After theming is set up, update component gallery (005) to show theme variants:

**`/components` page:**
```tsx
<section>
  <h2>Buttons</h2>

  <div className="flex gap-2">
    <Button variant="default">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="destructive">Destructive</Button>
  </div>
</section>
```

## Exit Criteria

- CLI prompts for theme selection with 3 modes (named, hex, palette)
- `globals.css` generated with correct primary/secondary colors
- Primary buttons use primary color
- Secondary buttons use secondary color
- Theme persists across all pages
- Dark mode variants work correctly
- Tests verify button colors render correctly
- Contrast ratios meet WCAG AA standards
- CLI `theme` command allows regeneration
