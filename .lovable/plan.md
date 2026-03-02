

## Add Preview Button to Room Type Rows

### What Changes

**`src/components/admin/HousekeepingConfig.tsx`** -- Add a Preview toggle to each room type row

1. **New state**: `previewRoomTypeId` (string | null) to track which room type's preview is open

2. **Room type row**: Add a Preview button (Eye icon) after the existing Checklist/Package buttons

3. **Preview panel**: When a room type's preview is toggled open, render an inline collapsible panel below that row showing:
   - **Inspection Checklist** section: Lists all checklist items for that room type with their Required/Optional badge and count expectations (read-only display)
   - **Cleaning Package(s)** section: Lists all packages for that room type with their supply items and quantities (read-only display)
   - If no checklist or packages configured, shows "Not configured yet" message

4. **Styling**: Preview panel uses a slightly different background (`bg-secondary/30`) with left border accent to distinguish it from the editable sections below

### Technical Details

- Import `Eye` / `EyeOff` from lucide-react
- Filter `checklists` and `packages`/`packageItems` by the previewed room type ID
- Preview button toggles `previewRoomTypeId` between the room type ID and null
- No database changes needed
- No new components -- just inline expansion within the room types card

