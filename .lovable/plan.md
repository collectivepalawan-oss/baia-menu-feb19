

## Flash Department Tabs When Orders Need Attention

### Problem
The role-switcher tabs in StaffShell (`/staff`) and the Operations tabs in AdminPage (`/admin`) are static — they don't indicate when a department has pending orders requiring attention.

### Approach
Add a single shared query that counts pending items per department, then apply the existing `tab-pulse` CSS class to tab buttons that have pending counts.

### What counts as "needs attention" per department
- **Reception**: Pending guest requests (`status = 'pending'`) + pending tour bookings (`status = 'booked'`) + New orders
- **Kitchen**: Orders where `kitchen_status = 'pending'` and status is New/Preparing
- **Bar**: Orders where `bar_status = 'pending'` and status is New/Preparing
- **Orders**: Any orders with `status = 'New'`
- **Housekeeping**: Housekeeping orders with `status = 'pending_inspection'` or `status = 'pending_cleaning'`
- **Experiences**: Pending tour bookings

### Changes

**1. Create a shared hook `src/hooks/useDepartmentAlerts.ts`**
- Queries `orders` (today, active statuses), `guest_requests` (pending), `guest_tours`/`tour_bookings` (pending), `housekeeping_orders` (pending)
- Returns a map: `{ reception: boolean, kitchen: boolean, bar: boolean, orders: boolean, housekeeping: boolean, experiences: boolean }`
- Refetches every 10 seconds + uses existing realtime invalidation

**2. Update `src/pages/StaffShell.tsx`**
- Import and use `useDepartmentAlerts()`
- Add `tab-pulse` class to role-switcher buttons when `alerts[r.key]` is true and that tab is not the active one

**3. Update `src/pages/AdminPage.tsx`**
- Import and use `useDepartmentAlerts()`
- Map admin tab values to alert keys (e.g., `rooms` → `reception`, `guest-services` → `experiences`)
- Add `tab-pulse` class to Operations TabsTrigger buttons when alerts indicate pending items and tab is not active

### Technical Details

The hook will run lightweight count queries:
```typescript
// orders with active status from today
const { data: orders } = useQuery({
  queryKey: ['dept-alert-orders'],
  queryFn: async () => { /* fetch today's active orders */ },
  refetchInterval: 10000,
});

// guest_requests pending count
// housekeeping_orders pending count
// tour_bookings pending count
```

Tab button conditional class (same pattern already used in `StaffOrdersView`):
```
className={`... ${alerts[r.key] && activeRole !== r.key ? 'tab-pulse' : ''}`}
```

