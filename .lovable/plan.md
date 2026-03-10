

## Plan: Block Non-Admin Staff from `/admin` Route

### Problem
Jessa (housekeeping) can navigate directly to `/admin` and access the full admin dashboard, including editing schedules. The route only checks for a valid session, not admin-level permissions. The red "ADMIN" badge in the navbar confirms she's on the admin page.

### Changes

**1. `src/App.tsx`** — Add `adminOnly` to the `/admin` route guard

Change:
```tsx
<Route path="/admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
```
To:
```tsx
<Route path="/admin" element={<RequireAuth adminOnly><AdminPage /></RequireAuth>} />
```

This will redirect non-admin users back to `/` with a "Admin access required" toast if they try to navigate to `/admin`.

**2. `src/lib/getHomeRoute.ts`** — Already correct (non-admins route to `/staff`), no change needed.

**3. `src/components/StaffNavBar.tsx`** — Remove the `admin` entry from `DEPT_COLORS` and `DEPT_LABELS`, and remove the route inference for `/admin` (line 55). Non-admin staff should never see an "ADMIN" badge. If an admin is on `/admin`, the department badge is unnecessary since they're in their home dashboard.

### Files
```
EDIT  src/App.tsx  (add adminOnly prop)
EDIT  src/components/StaffNavBar.tsx  (remove admin dept badge logic)
```

Two lines changed, one block removed. Non-admin staff will be immediately bounced from `/admin` and never see the red badge.

