

## Plan: Add Light/Dark Mode Toggle (System-Preference Default)

### How It Works

Your app already has the perfect architecture for this — all colors use CSS custom properties, and `darkMode: ["class"]` is already set in Tailwind config. Adding a light mode means:

1. Define a second set of CSS variable values for light mode
2. Add a small theme provider that reads OS preference and allows manual override
3. Place a toggle icon (sun/moon) in every header

### Changes

**1. `src/index.css`** — Restructure CSS variables

Move current dark values under `.dark` class, add new light-mode values as the `:root` default:

- **Light mode** (`:root`): White/light gray backgrounds, dark text, muted borders — professional daytime palette
- **Dark mode** (`.dark`): Current navy/cream palette preserved exactly as-is
- Update `.bg-navy-texture` to be conditional (light: subtle warm gray texture, dark: current navy texture)
- Update glow animations to use softer shadows in light mode

**2. New file: `src/hooks/useTheme.tsx`** — Theme context + hook

- Reads `prefers-color-scheme` media query on mount
- Checks `localStorage` for manual override
- Applies `.dark` class to `<html>` element
- Exposes `{ theme, setTheme, toggleTheme }` via React context
- Three states: `system`, `light`, `dark`

**3. New file: `src/components/ThemeToggle.tsx`** — Small sun/moon icon button

- Uses `useTheme` hook
- Renders a `Button variant="ghost" size="icon"` with Sun or Moon icon
- Clicking cycles: system → light → dark → system

**4. Update headers to include the toggle:**

- `src/components/service/ServiceHeader.tsx` — Add `<ThemeToggle />` next to the staff name/logout area
- `src/components/StaffNavBar.tsx` — Add `<ThemeToggle />` in the nav bar
- `src/pages/Index.tsx` — Add `<ThemeToggle />` in the top corner of the login page
- `src/components/admin/AdminLoginGate.tsx` or `src/pages/AdminPage.tsx` — Add toggle in admin header

**5. `src/App.tsx`** — Wrap app with `ThemeProvider`

### Light Mode Color Palette

| Variable | Light Value | Purpose |
|----------|------------|---------|
| `--background` | `0 0% 100%` | White |
| `--foreground` | `220 20% 15%` | Near-black text |
| `--card` | `220 15% 97%` | Very light gray cards |
| `--card-foreground` | `220 20% 15%` | Dark text on cards |
| `--primary` | `220 30% 25%` | Dark navy buttons |
| `--primary-foreground` | `0 0% 100%` | White text on buttons |
| `--muted` | `220 10% 93%` | Light gray muted areas |
| `--border` | `220 10% 85%` | Subtle borders |
| `--gold` | `38 60% 50%` | Slightly deeper gold for contrast on white |

### What Won't Break

- All shadcn/ui components use the CSS variables — they adapt automatically
- Fonts (Playfair Display, Lato) are color-independent
- Department gradient badges (kitchen orange, bar purple, etc.) use self-contained colors with white text — they work on any background
- The `hsl(var(...))` pattern means zero component-level color changes needed

### What Needs Care

- ~6 places with hardcoded `bg-[hsl(...)]` inline colors (department badges in `StaffNavBar`, status badges in `ServiceOrderDetail`) — these are decorative and self-contained, so they'll work fine on light backgrounds
- `.bg-navy-texture` utility — will get a light-mode variant
- Glow/pulse animations — will use CSS variables or `@media (prefers-color-scheme)` to soften on light backgrounds

### Estimated Scope

- 2 new files (hook + toggle component)
- 1 major edit (`index.css` — add light palette)
- 4-5 minor edits (adding toggle to headers + wrapping App with provider)
- No database changes needed

