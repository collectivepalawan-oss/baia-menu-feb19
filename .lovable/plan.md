
# Add Bulk Menu Item Import to Admin Menu Section

## Overview

Add a bulk import feature to the Menu section in the Admin page, allowing CSV upload of multiple menu items at once. Also add a downloadable CSV template that matches the import format.

## What Changes

### 1. Download Template Button

Add a "Download Template" option that downloads an empty CSV with the correct headers and one example row, so the admin knows the exact format to fill in. Headers: `Category, Name, Description, Price, Sort Order`.

The existing CSV export button already exports menu data -- the new template is specifically a blank/example file for importing.

### 2. Bulk Import Modal

Create a new component `src/components/admin/MenuBulkImportModal.tsx` (following the same pattern as the existing `ExpenseBulkImportModal.tsx`):

- Dialog modal with:
  - "Download CSV Template" button (same template as above)
  - File upload input (accept `.csv`)
  - "Import" button with loading state
  - Results summary showing success/error counts and error details

### 3. CSV Import Logic

- Parse CSV with proper quote handling (reuse the same `parseCSVLine` pattern from `ExpenseBulkImportModal`)
- Validate each row:
  - `Name` is required
  - `Category` is required (must match an existing category or will use as-is)
  - `Price` must be a valid number >= 0
  - `Sort Order` defaults to 0 if missing
- Skip duplicate names within the same category (warn user)
- Insert valid rows via `supabase.from('menu_items').insert(rows)`
- Show results: "X imported, Y errors" with error details

### 4. UI Integration in AdminPage.tsx

- Add a "Bulk Import" button next to the existing "Add Menu Item" and CSV export buttons
- Add state for `bulkImportOpen` boolean
- Import and render the `MenuBulkImportModal` component
- On import complete, invalidate the `menu-admin` query to refresh the list

## Technical Details

### MenuBulkImportModal.tsx structure:
- Props: `open`, `onOpenChange`, `onComplete`, `categories` (list of existing category names)
- Template CSV columns: `Category,Name,Description,Price,Sort Order`
- Example row: `Main Courses,Grilled Fish,Fresh catch of the day,450,0`
- Validation: name required, category required, price must be numeric
- Insert uses `supabase.from('menu_items').insert(rows)`

### AdminPage.tsx changes:
- Add `bulkImportOpen` state
- Add "Bulk Import" button in the menu section toolbar (between Add Menu Item and Export)
- Render `MenuBulkImportModal` with `categories={menuCategories.map(c => c.name)}`

### No database changes needed
The existing `menu_items` table already has all required columns (name, category, description, price, sort_order, food_cost, available, featured).
