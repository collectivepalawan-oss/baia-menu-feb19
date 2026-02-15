

## Add Delete Capability to Menu Item Editor

### Current State
- **Add**: Working via "Add Menu Item" button (opens dialog with `editItem = 'new'`)
- **Edit**: Working via clicking any menu item in the list (opens dialog with item data)
- **Delete**: Missing -- no delete button exists in the menu item dialog

### Changes Required

**File: `src/pages/AdminPage.tsx`**

1. Add a `deleteItem` function that:
   - Deletes associated `recipe_ingredients` rows first (to avoid orphaned data)
   - Deletes the `menu_items` row
   - Closes the dialog
   - Invalidates the menu query cache
   - Shows a success toast

2. Add a Delete button to the edit dialog (only shown for existing items, not for "new"):
   - Placed below the Save button or in the dialog footer
   - Uses a two-click confirmation pattern (first click shows "Confirm Delete?", second click actually deletes) to prevent accidental deletion
   - Styled with destructive/red color to clearly indicate danger
   - Includes a Trash icon for visual clarity

### Technical Details

```text
deleteItem function:
  1. await supabase.from('recipe_ingredients').delete().eq('menu_item_id', editItem.id)
  2. await supabase.from('menu_items').delete().eq('id', editItem.id)
  3. setEditItem(null)
  4. qc.invalidateQueries({ queryKey: ['menu-admin'] })
  5. toast.success('Menu item deleted')
```

The delete button will use a `confirmingDelete` state variable with a 3-second auto-reset timeout (matching the existing pattern used in `EditableRow.tsx`).

### No Database Changes Needed
RLS policies already allow DELETE on `menu_items` and `recipe_ingredients` tables.

