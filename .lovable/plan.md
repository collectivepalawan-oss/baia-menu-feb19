

## Plan: Hide Completed Room Orders from Service Board

### Problem
Room-charged orders that reach "Paid" status continue to appear in the Service Board's "Completed Today" section. As walk-in volume grows, this creates clutter. These orders are already visible in the Guest Portal and Admin Reception for records.

### Change

**`src/components/service/ServiceBoard.tsx`** — In the column bucketing logic (line ~130), exclude room orders from the `Completed` bucket. Orders with a `room_id` set or `payment_type === 'Charge to Room'` that are `Paid` will simply not appear in the Completed section. They remain accessible via the Guest Portal folio and Admin Reception order history.

Specifically, change the `Paid` bucketing line:
```typescript
// Before
if (o.status === 'Paid') cols.Completed.push(o);

// After — skip room orders from completed
if (o.status === 'Paid') {
  const isRoomOrder = o.room_id || o.payment_type === 'Charge to Room';
  if (!isRoomOrder) cols.Completed.push(o);
}
```

This applies to both the reception branch (line 134) and the kitchen/bar branch (line 122).

### Files
| File | Change |
|------|--------|
| `src/components/service/ServiceBoard.tsx` | Skip room orders from Completed bucket in both department branches |

