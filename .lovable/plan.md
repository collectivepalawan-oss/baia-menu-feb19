

# Font and Admin Improvements

## Problem Summary
1. **Font readability**: Current fonts (Playfair Display + Cormorant Garamond) are hard to read at small sizes, especially in admin. Need a more readable hospitality-grade font globally.
2. **Units and Tables management**: No ability to edit names or delete items -- only toggle active/inactive.
3. **Time selection**: Plain HTML time inputs look outdated and inconsistent with the luxury aesthetic.

---

## Changes

### 1. Global Font Upgrade

Replace Cormorant Garamond (body font) with **Lato** -- a clean, highly readable sans-serif widely used in hospitality and hotel websites. Keep Playfair Display for display headings only (brand name, section titles).

**Files changed:**
- `src/index.css` -- Update Google Fonts import to load Lato instead of Cormorant Garamond
- `tailwind.config.ts` -- Update `font-body` to use Lato
- All pages already use `font-body` and `font-display` utility classes, so the change propagates automatically

### 2. Units Management -- Add Edit and Delete

Each unit row will show:
- The unit name (tappable to edit inline)
- An **edit** icon button that opens an inline text field to rename
- A **delete** icon button with confirmation
- The existing active/inactive toggle

**File changed:** `src/pages/AdminPage.tsx`
- Add edit state tracking per unit (inline rename with save/cancel)
- Add delete with a confirmation toast or small confirm prompt
- Wire up Supabase `.update()` for rename and `.delete()` for removal

### 3. Tables Management -- Add Edit and Delete

Same pattern as units:
- Edit (rename) button per table row
- Delete button with confirmation
- Keep existing active toggle

**File changed:** `src/pages/AdminPage.tsx`

### 4. Time Selection -- Modern Styled Picker

Replace the plain `<Input type="time">` fields for breakfast hours with custom styled time selectors using two side-by-side dropdowns (hour + AM/PM) that match the dark luxury theme.

**File changed:** `src/pages/AdminPage.tsx`
- Create a simple inline time picker component using Select dropdowns for hours (1-12) and period (AM/PM)
- Style consistently with the dark navy/cream theme

---

## Technical Details

**Font change in `src/index.css`:**
- Google Fonts URL updated to: `Playfair+Display:...&family=Lato:wght@300;400;700&display=swap`
- Body default font changed from `'Cormorant Garamond', serif` to `'Lato', sans-serif`

**Font change in `tailwind.config.ts`:**
- `fontFamily.body` changed from `['"Cormorant Garamond"', 'serif']` to `['"Lato"', 'sans-serif']`

**Admin unit/table rows refactored to include:**
- Inline editing state (`editingUnitId`, `editingUnitName`)
- Edit icon triggers inline input; save on Enter or blur
- Delete calls `supabase.from('units').delete().eq('id', id)` with a confirmation step
- Same pattern for `resort_tables`

**Time picker:**
- Custom component using two `<Select>` dropdowns (hour: 1-12, period: AM/PM)
- Converts to/from 24h format for database storage
- Styled with existing `bg-secondary border-border text-foreground` classes

