

## Plan: Fix Permission Persistence & Remove "Manage" Level from UI

### Root Cause of Permissions Resetting

The `syncPermissionsFromRoles` function (line 238) deletes ALL `employee_permissions` for an employee and re-inserts only what the roles define. When an admin manually cycles a permission (e.g., sets Rooms to "View"), it writes directly to `employee_permissions`. But the next time any role is added/removed, `syncPermissionsFromRoles` wipes those manual changes and recalculates purely from roles — causing the "keeps changing" behavior.

Additionally, the delete loop uses the stale React-cached `permissions` array, so it may miss recently-added records.

### Changes

#### 1. Remove "Manage" from the permission cycling UI (`StaffAccessManager.tsx`)

- Remove `THREE_LEVEL_SECTIONS` constant entirely
- All sections cycle: **Off → View → Edit → Off** (3 states only)
- Remove "Manage" from `LEVEL_LABELS` display and `LEVEL_COLORS` in the cycling buttons
- Update `cyclePermission` and `cycleRolePerm` to always use the 2-level cycle
- Keep `manage` working internally in `permissions.ts` for backward compatibility (existing `manage` entries still grant access), but the UI never sets it going forward

#### 2. Fix permission sync to not lose manual overrides (`StaffAccessManager.tsx`)

- Change `syncPermissionsFromRoles` to use a single SQL delete query (`delete().eq('employee_id', empId)`) instead of iterating the stale cached array — ensures all old rows are actually removed
- After role sync, preserve any manual override by merging: role-derived permissions set the baseline, but if the admin has manually set a higher level on a module, keep the higher one
- Alternatively (simpler): make individual permission badges **read-only** when roles are assigned, showing the effective level from roles. This eliminates the conflict entirely — roles are the single source of truth

#### 3. Update role template modal cycling (`StaffAccessManager.tsx`)

- Same removal of "Manage" from the role creation/edit modal cycling
- Templates that currently include `:manage` permissions will continue to work but display as "Edit" in the UI

### Files

| File | Change |
|------|--------|
| `src/components/admin/StaffAccessManager.tsx` | Remove manage cycling, fix sync delete query, clarify read-only when roles assigned |

