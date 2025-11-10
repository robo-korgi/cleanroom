# 023 — CLI: `cleanroom new`

Meta:
- created: 2025-11-10
- consolidated from: 015 (theming), 027 (avatar selection), 024 (user profile)
- scope: Complete CLI bootstrap flow for new projects

## Objective
Provide a single, comprehensive CLI flow that gathers all configuration decisions upfront and generates a fully-configured Cleanroom app. All questions are asked once at project creation.

## CLI Tool

### Command
```bash
npx create-cleanroom-app@latest
# or
pnpm create cleanroom-app
```

### Interactive Prompts
Use `prompts` library for interactive CLI:

```bash
pnpm add prompts
pnpm add --save-dev @types/prompts
```

## Complete Question Flow

### 1. Project Setup

```typescript
{
  type: 'text',
  name: 'projectName',
  message: 'What is your project name?',
  initial: 'my-cleanroom-app',
  validate: (value) => /^[a-z0-9-]+$/.test(value) || 'Use lowercase letters, numbers, and hyphens only',
}

{
  type: 'text',
  name: 'projectDescription',
  message: 'Project description (optional):',
  initial: 'A Cleanroom app',
}
```

### 2. Theme Configuration

```typescript
{
  type: 'select',
  name: 'colorSelectionMode',
  message: 'How would you like to choose your theme colors?',
  choices: [
    { title: 'Preset Color Palettes (recommended)', value: 'palette' },
    { title: 'Named Colors (e.g., blue, red)', value: 'named' },
    { title: 'Custom Hex Values', value: 'hex' },
  ],
  initial: 0,
}
```

#### If palette mode:
```typescript
{
  type: (prev) => prev === 'palette' ? 'select' : null,
  name: 'colorPalette',
  message: 'Choose a color palette:',
  choices: [
    { title: 'Ocean (Blue/Teal) 🌊', value: 'ocean', hint: 'Professional, trustworthy' },
    { title: 'Forest (Green/Lime) 🌲', value: 'forest', hint: 'Natural, growth-focused' },
    { title: 'Sunset (Orange/Pink) 🌅', value: 'sunset', hint: 'Energetic, creative' },
    { title: 'Lavender (Purple/Pink) 💜', value: 'lavender', hint: 'Elegant, modern' },
    { title: 'Professional (Slate/Blue) 💼', value: 'professional', hint: 'Corporate, serious' },
    { title: 'Warm (Red/Orange) 🔥', value: 'warm', hint: 'Bold, passionate' },
  ],
  initial: 0,
}
```

#### If named mode:
```typescript
{
  type: (prev, values) => values.colorSelectionMode === 'named' ? 'select' : null,
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
  type: (prev, values) => values.colorSelectionMode === 'named' ? 'select' : null,
  name: 'secondaryColorName',
  message: 'Choose secondary color:',
  choices: [/* same as above */],
}
```

#### If hex mode:
```typescript
{
  type: (prev, values) => values.colorSelectionMode === 'hex' ? 'text' : null,
  name: 'primaryColorHex',
  message: 'Enter primary color (hex):',
  initial: '#3b82f6',
  validate: (value) => /^#[0-9A-Fa-f]{6}$/.test(value) || 'Must be valid hex color (e.g., #3b82f6)',
}

{
  type: (prev, values) => values.colorSelectionMode === 'hex' ? 'text' : null,
  name: 'secondaryColorHex',
  message: 'Enter secondary color (hex):',
  initial: '#8b5cf6',
  validate: (value) => /^#[0-9A-Fa-f]{6}$/.test(value) || 'Must be valid hex color',
}
```

### 3. Avatar Strategy

```typescript
{
  type: 'select',
  name: 'avatarStrategy',
  message: 'Choose avatar strategy:',
  choices: [
    { title: 'First Initial (auto-generated SVG)', value: 'first_initial', hint: 'Simple, no images needed' },
    { title: 'Selectable Emojis', value: 'selectable_emojis', hint: 'Fun, lightweight' },
    { title: 'Selectable Images (preset gallery)', value: 'selectable_images', hint: 'Professional look' },
    { title: 'Default Image (single shared avatar)', value: 'default_image', hint: 'Minimal, uniform' },
  ],
  initial: 0,
}

// If selectable_images:
{
  type: (prev) => prev === 'selectable_images' ? 'number' : null,
  name: 'presetAvatarCount',
  message: 'How many preset avatars?',
  initial: 12,
  min: 6,
  max: 48,
}
```

### 4. User Profile Schema

```typescript
{
  type: 'select',
  name: 'profileTemplate',
  message: 'Choose a user profile template (determines available user properties):',
  choices: [
    { title: 'Minimal (name, email, avatar only)', value: 'minimal' },
    { title: 'Standard (add bio, location, socials)', value: 'standard' },
    { title: 'Custom (choose from list)', value: 'custom' },
  ],
  initial: 1,
}

// If custom:
{
  type: (prev) => prev === 'custom' ? 'multiselect' : null,
  name: 'profileFields',
  message: 'Select profile fields to include:',
  choices: [
    { title: 'Bio / About Me', value: 'bio', selected: true },
    { title: 'Location', value: 'location', selected: true },
    { title: 'Website URL', value: 'website' },
    { title: 'Social Links (Twitter, GitHub, etc.)', value: 'socials', selected: true },
    { title: 'Phone Number', value: 'phone' },
    { title: 'Date of Birth', value: 'birthdate' },
    { title: 'Pronouns', value: 'pronouns' },
    { title: 'Company/Organization', value: 'organization' },
    { title: 'Job Title', value: 'jobTitle' },
  ],
  hint: 'Space to select, Enter to continue',
}
```

### 5. Features / Modules

```typescript
{
  type: 'multiselect',
  name: 'features',
  message: 'Select optional features to include:',
  choices: [
    { title: 'Dark Mode Toggle', value: 'dark_mode', selected: true },
    { title: 'OAuth Providers (Google, GitHub)', value: 'oauth' },
    { title: 'Custom Avatar Upload (S3)', value: 'avatar_upload' },
    { title: 'Admin Dashboard', value: 'admin_dashboard', selected: true },
    { title: 'User Search', value: 'user_search' },
    { title: 'Analytics (Vercel Analytics)', value: 'analytics', selected: true },
  ],
  hint: 'Space to select, Enter to continue',
  min: 0,
}
```

### 6. Package Manager

```typescript
{
  type: 'select',
  name: 'packageManager',
  message: 'Which package manager?',
  choices: [
    { title: 'pnpm (recommended)', value: 'pnpm' },
    { title: 'npm', value: 'npm' },
    { title: 'yarn', value: 'yarn' },
  ],
  initial: 0,
}
```

### 7. Git Initialization

```typescript
{
  type: 'confirm',
  name: 'initGit',
  message: 'Initialize git repository?',
  initial: true,
}
```

## Generated Files

### Project Structure
```
my-cleanroom-app/
  .env.example
  .env.local
  .gitignore
  package.json
  tsconfig.json
  next.config.js
  tailwind.config.ts
  drizzle.config.ts
  docker-compose.yml

  app/
    globals.css           # Generated with theme colors
    layout.tsx
    page.tsx
    (auth)/
      login/
      signup/
      logout/
    auth/
      callback/
    account/              # User self-edit
    admin/                # If admin_dashboard feature enabled
      users/

  lib/
    supabase/
      client.ts
      server.ts
    auth/
      session.ts
      guards.ts
    env.ts                # Environment validation

  config/
    theme.ts              # Generated theme config
    avatar.ts             # Generated avatar config
    profile.ts            # Generated profile schema

  components/
    ui/                   # shadcn components
    nav/                  # Navigation components
    blocks/               # Reusable blocks

  db/
    schema/
      users.ts            # Generated with profile fields
    migrations/

  tests/
    helpers/
    fixtures/
    e2e/
    smoke/

  scripts/
    dev-up.sh
    dev-down.sh
    db-reset.sh
    seed.ts              # Generated with test data

  docs/
    environment-setup.md
    development.md
```

### config/theme.ts

Generated based on theme answers:

```typescript
// Generated by create-cleanroom-app
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
} as const
```

### config/avatar.ts

```typescript
// Generated by create-cleanroom-app
export const avatarStrategy = 'selectable_emojis' as const

export const availableEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
  // ... more emojis
] as const
```

### config/profile.ts

```typescript
// Generated by create-cleanroom-app
import { z } from 'zod'

export const profileTemplate = 'standard' as const

export const profileSchema = z.object({
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  socials: z.object({
    twitter: z.string().optional(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
})

export type ProfileData = z.infer<typeof profileSchema>
```

### app/globals.css

Generated with theme colors:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    /* PRIMARY - from CLI selection */
    --primary: 221.2 83.2% 53.3%;        /* Blue (Ocean palette) */
    --primary-foreground: 210 40% 98%;

    /* SECONDARY - from CLI selection */
    --secondary: 173 58% 39%;            /* Teal (Ocean palette) */
    --secondary-foreground: 210 40% 98%;

    /* ... rest of theme */
  }

  .dark {
    /* ... dark mode variants */
  }
}
```

### db/schema/users.ts

Generated with profile fields:

```typescript
import { pgTable, uuid, text, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['admin', 'user'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  display_name: text('display_name'),
  avatar_url: text('avatar_url'),
  role: roleEnum('role').notNull().default('user'),

  // Generated based on profile template
  bio: text('bio'),
  location: text('location'),
  website: text('website'),
  socials: jsonb('socials').$type<{ twitter?: string; github?: string; linkedin?: string }>(),

  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})
```

## Post-Generation Steps

After generating files, CLI should:

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Install shadcn components:**
   ```bash
   npx shadcn@latest init -y
   npx shadcn@latest add button input label card avatar alert toast table
   ```

3. **Initialize git (if requested):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit from create-cleanroom-app"
   ```

4. **Display next steps:**
   ```
   ✅ Success! Created my-cleanroom-app

   Next steps:

   1. Configure environment variables:
      cp .env.example .env.local
      # Edit .env.local with your Supabase credentials

   2. Start Docker services:
      pnpm docker:up

   3. Start development server:
      pnpm dev

   4. Open http://localhost:3000

   📖 Documentation: docs/environment-setup.md
   ```

## Regeneration / Updates

### Update Theme
```bash
npx cleanroom theme
```
Re-prompts for theme questions and regenerates:
- `config/theme.ts`
- `app/globals.css`

### Update Avatar Strategy
```bash
npx cleanroom avatar
```
Re-prompts for avatar questions and regenerates:
- `config/avatar.ts`
- Avatar-related components

### Add Profile Fields
```bash
npx cleanroom profile add
```
Prompts for additional fields and updates:
- `config/profile.ts`
- `db/schema/users.ts`
- Generates migration

## Testing CLI

### Development
```bash
# In CLI package
pnpm link

# In test directory
pnpm create cleanroom-app
```

### Test Fixtures
Create test configurations for CI:

**File:** `tests/cli/fixtures/minimal.json`
```json
{
  "projectName": "test-minimal-app",
  "colorSelectionMode": "palette",
  "colorPalette": "ocean",
  "avatarStrategy": "first_initial",
  "profileTemplate": "minimal",
  "features": [],
  "packageManager": "pnpm",
  "initGit": false
}
```

## Exit Criteria

- CLI prompts gather all configuration decisions
- Generated project matches selected options
- Theme colors applied correctly
- Avatar strategy configured correctly
- Profile schema generated correctly
- All dependencies installed
- shadcn components added
- Git initialized (if requested)
- Next steps displayed
- Documentation generated
- Regeneration commands work
