

## Plan: Show All Assigned Functions on Staff Landing + Dashboard

### Problem
When admin assigns permissions like `menu:edit` to Chef Jim, there's no way for him to access those functions:
- The **landing page** has no "Menu" tile for staff with `menu` permission
- The **Manager Dashboard** only has 9 tabs (orders, reports, inventory, payroll, resort_ops, rooms, schedules, setup, timesheet) — missing menu, kitchen, bar, housekeeping, reception, experiences

Every permission the admin assigns should surface as a visible, accessible function for that staff member.

### Changes

**1. Landing page — add missing tiles** (`src/pages/Index.tsx`)
- Add a **"Menu"** button for staff with `menu` permission (navigates to `/menu?mode=staff` or a menu management view)
- Ensure all assignable permissions map to a visible navigation tile

**2. Manager Dashboard — add all missing section tabs** (`src/pages/ManagerPage.tsx`)
- Expand `TAB_MAP` and `SECTIONS` to include: `menu`, `kitchen`, `bar`, `housekeeping`, `experiences`, `reception`, `documents`
- Add corresponding `TabsContent` for each:
  - **Menu**: embed the menu editor (from AdminPage)
  - **Kitchen**: embed `DepartmentOrdersView` for kitchen
  - **Bar**: embed `DepartmentOrdersView` for bar  
  - **Housekeeping**: embed `HousekeepingConfig` or the housekeeper view
  - **Experiences**: embed the experiences content
  - **Reception**: embed reception content
- Each tab respects `readOnly()` based on view vs edit permission

**3. Employee Portal Dashboard button logic** (`src/pages/EmployeePortal.tsx`)
- Expand `MANAGER_SECTIONS` to include all permission keys so staff with `menu:edit` or `kitchen:edit` etc. see the Dashboard button
- Currently only checks: orders, reports, inventory, payroll, resort_ops, rooms, schedules, setup, timesheet

### Files to Edit
1. `src/pages/Index.tsx` — add Menu tile for staff with menu permission
2. `src/pages/ManagerPage.tsx` — add menu, kitchen, bar, housekeeping, experiences, reception tabs
3. `src/pages/EmployeePortal.tsx` — expand MANAGER_SECTIONS list

