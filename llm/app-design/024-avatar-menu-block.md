# 024 — User Avatar Menu Block (TEST FIRST)

Meta:
- created: 2025-11-10T06:35:22.246293Z
- depends-on: 011 (nav), 018 (guards)

## Block
Clickable avatar that reveals a persistent hoverable menu.

Selectors:
- `nav-avatar` (button/toggle with avatar)
- `nav-user-menu` (menu container)
- Items:
  - `menu-profile` → `/u/{public_uuid}`
  - `menu-settings` → `/account`
  - `menu-signout` → POST/GET sign out

Behavior:
- Menu opens on click of avatar; closes on:
  - Selecting a menu item
  - Clicking avatar again
  - Clicking outside OR moving mouse far off the avatar/menu
- **Sticky hover**: moving between avatar → menu must **not** close the menu if pointer stays within a tolerance corridor.

Accessibility:
- ARIA menu/button roles, focus trap, ESC closes

Playwright:
- `@auth` menu toggles open/close correctly
- Selecting each item navigates appropriately and menu closes
- Mouse leave small distances doesn’t close; large distance does
- Keyboard: ENTER/SPACE open, ESC close, arrow key navigation

Exit:
- Integrated into global nav for logged-in state (replacing Sign In/Up).
