

## Plan: Remove Kanban Board from Reception & Remove Order Button from Reception/Cashier

### Changes

1. **`src/pages/ServiceReceptionPage.tsx`** — Remove the `<ServiceBoard department="reception" />` component and its separator. Reception will show only the Morning Briefing + embedded Reception dashboard (room ops, guest list, calendar).

2. **`src/components/service/ServiceHeader.tsx`** — Hide the "+ Order" button when `department` is `reception` or `cashier`. Change the condition from `canOrder` to `canOrder && department !== 'reception' && department !== 'cashier'`.

### Result
- Reception service view becomes a clean operational dashboard without the empty Kanban columns
- Order creation is handled by kitchen/bar staff only; cashier and reception focus on settlement and room ops

