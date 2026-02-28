

## Enhanced Staff Access Control: Read/Write Permissions, Audit Trail, and Sensitive Data Protection

### What This Solves
Right now, if you give someone access to "Rooms," they can see AND modify everything including passports. You need finer control: who can view vs. edit, who can see sensitive documents, and a log of every change made by staff.

### How It Will Work

**1. Permission Levels Per Section**
Each section toggle becomes a 3-way choice instead of on/off:
- **Off** -- no access at all
- **View** -- can see the section but cannot add, edit, or delete anything
- **Edit** -- full access to view and modify

The permission values stored will change from just `rooms` to `rooms:view` or `rooms:edit`. The Admin toggle still grants full edit access to everything.

**2. Sensitive Data Gate: Documents Tab**
A new permission called `documents` controls access to the Documents tab inside Rooms. If an employee has `rooms:view` or `rooms:edit` but NOT `documents:view` or `documents:edit`, the Documents tab is hidden. This keeps passports and IDs away from housekeepers who only need to see room status and vibes.

**3. Audit Trail for All Staff Modifications**
A new `audit_log` database table records every create/update/delete action made through the Manager dashboard:
- **who**: employee name + ID
- **what**: which table and record was affected
- **action**: created / updated / deleted
- **details**: what changed (old value -> new value summary)
- **when**: timestamp

The current employee's identity (from localStorage `emp_name` / `emp_id`) is captured automatically whenever they make a modification through the Manager view.

**4. Updated Staff Access Manager UI**
The permission panel for each employee will show:
- Admin toggle (unchanged, amber)
- Per-section: a 3-state toggle (Off / View / Edit)
- A separate "Documents (Sensitive)" toggle under Rooms
- Clear visual indicators for each level

### Example Scenarios After Implementation
- **Ron**: Admin -- full access to everything, all edits logged as "Ron"
- **Regina**: Edit access to Orders, Rooms, Vibes; View-only for Reports; NO access to HR or Documents
- **Susan** (housekeeper): View access to Rooms + Edit access to Vibes; no Documents access; cannot see HR, Reports, etc.

### Database Changes

**New table: `audit_log`**
```text
id            uuid (PK)
employee_id   uuid
employee_name text
action        text (created / updated / deleted)
table_name    text (e.g., 'guest_vibe_records')
record_id     text
details       text (summary of change)
created_at    timestamptz
```

**Update `employee_permissions` data format**
No schema change needed. Permission values will shift from `rooms` to `rooms:view` or `rooms:edit`. Old `rooms` entries will be treated as `rooms:edit` for backward compatibility.

### Files to Create/Update

1. **New migration** -- Create `audit_log` table with public RLS
2. **`src/components/admin/StaffAccessManager.tsx`** -- Rewrite permission toggles to support Off/View/Edit per section + Documents toggle
3. **`src/pages/ManagerPage.tsx`** -- Pass `readOnly` prop to each dashboard component based on `:view` vs `:edit` permission; hide Documents tab when no `documents` permission
4. **`src/components/admin/RoomsDashboard.tsx`** -- Accept `readOnly` and `canViewDocuments` props; hide add/edit/delete buttons when read-only; hide Documents tab when restricted
5. **`src/lib/auditLog.ts`** (new) -- Helper function `logAudit(action, tableName, recordId, details)` that reads `emp_id`/`emp_name` from localStorage and inserts into `audit_log`
6. **Key dashboard components** (ResortOpsDashboard, PayrollDashboard, InventoryDashboard, etc.) -- Accept `readOnly` prop and conditionally hide mutation controls; call `logAudit()` on create/update/delete actions

### Technical Details

**Permission resolution logic:**
```text
hasAccess(empId, section)     = has section:view OR section:edit OR admin
canEdit(empId, section)       = has section:edit OR admin
canViewDocuments(empId)       = has documents:view OR documents:edit OR admin
```

**Backward compatibility:**
Existing permissions like `rooms` (without `:view`/`:edit` suffix) will be treated as `rooms:edit` so nothing breaks for current staff until you update their access levels.

**Audit log integration:**
Each dashboard's create/update/delete functions will call `logAudit()` after successful operations. The audit log will be viewable in the Admin dashboard (a new small section or sub-tab).

