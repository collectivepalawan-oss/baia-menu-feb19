

## Plan: POS & Booking Fixes (5 Items)

### 1. Schedule Shift Cancel/Delete Buttons (Always Visible)

**File:** `src/components/admin/WeeklyScheduleManager.tsx`

The edit/delete buttons already exist on `ShiftBlock` and are always visible (lines 491-505). The delete flow uses `deleteIdRef` + `AlertDialog`. The issue is these buttons are tiny and can be missed on narrow shifts.

**Changes:**
- Add a dedicated "Cancel Shift" / "Delete" button inside the shift edit modal (`shiftModal.mode === 'edit'`) so users can delete from within the edit dialog
- Ensure the `AlertDialog` for delete confirmation renders correctly by moving it outside any conditional blocks if needed

### 2. Custom Roles System in Staff Access Manager

**File:** `src/components/admin/StaffAccessManager.tsx`

Currently roles are hardcoded in `ROLE_TEMPLATES` and `ROLE_LABELS`. Need to make these dynamic and stored in the database.

**Database migration:** Create a `staff_roles` table:
```sql
CREATE TABLE public.staff_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  permissions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
-- Public CRUD policies (same pattern as other tables)
```

**Changes:**
- Load roles from `staff_roles` table alongside the hardcoded defaults
- Add "Create Role" form: role name input + permission badge picker (reuse existing `GRANULAR_PERMISSIONS`)
- Add edit/duplicate/delete buttons on each custom role card
- Keep hardcoded templates as "built-in" (non-deletable) and show custom roles below them
- When applying a role, use `permissions` array from the role record

### 3. TAB Payment System Enhancement

**Current state:** Tabs already exist. `CartDrawer.tsx` creates tabs via `supabase.from('tabs').insert(...)`. `TabInvoice.tsx` handles viewing/closing tabs with payment method. The admin Orders tab has a "Open Tabs" sub-view.

The tab system is already functional. The request is to add "Tab" as a visible payment method option during order flow.

**File:** `src/components/CartDrawer.tsx`
- Add a "Tab" payment option alongside existing payment methods
- When "Tab" is selected, show option to create new tab or add to an existing open tab (dropdown of open tabs)
- Orders placed on a tab skip immediate payment and go to the tab

**File:** `src/pages/AdminPage.tsx`
- The tabs dashboard already shows open/closed tabs — no changes needed here
- `TabInvoice.tsx` already handles close-with-payment + receipt — already complete

### 4. Guest Name Field: Combo Input (Type + Dropdown)

**File:** `src/components/admin/RoomsDashboard.tsx`

Currently the check-in form uses a plain `<Input>` for guest name (line 632). It already creates-or-finds guests via `resort_ops_guests`.

**Changes:**
- Replace the plain `<Input>` with a combo field: a text input that shows a filtered dropdown of existing guests from `resort_ops_guests` as the user types
- Add an "Add New Guest" button at the bottom of the dropdown that auto-populates a new name
- When selecting an existing guest, auto-fill phone and email from their record
- Keep the input fully editable (not a locked select)

### 5. Clarify Booking = Present Management

**File:** `src/components/admin/RoomsDashboard.tsx`

The rooms dashboard already focuses on present-day management (check-in/out, occupied/vacant status). The check-in form is already simple.

**Changes:**
- Add a small header note: "Today's Room Status" or "Present Management" to make the intent clear
- Add a "Today" summary row at the top: X occupied, Y vacant, Z to clean
- Ensure the check-in date defaults to today (already does) and the flow is streamlined
- No complex calendar or future booking features — keep it as-is

---

### Files to Edit
1. `src/components/admin/WeeklyScheduleManager.tsx` — delete button in edit modal
2. `src/components/admin/StaffAccessManager.tsx` — custom roles CRUD
3. `src/components/CartDrawer.tsx` — "Tab" payment option with existing-tab picker
4. `src/components/admin/RoomsDashboard.tsx` — guest name combo input + today summary
5. **Database migration** — `staff_roles` table

