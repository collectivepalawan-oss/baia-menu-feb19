

## Cashier Full Control — Receipt Sharing & Order Flow

### Problem
1. **Auto-completion bypasses cashier**: Room charge and tab orders auto-transition from "Served" → "Paid", skipping the cashier entirely
2. **Receipt only after payment**: Receipts can only be printed/shared after payment confirmation — cashier can't print/share for active or served orders
3. **Completed orders are not interactive**: Paid orders in the completed section can't be tapped to print/share
4. **No sharing options**: No way to share receipts via WhatsApp to staff, admin, or guests

### Plan

#### 1. Stop auto-completing room charges and tabs at the cashier level
In `CashierBoard.tsx`, change the `mark-served` action handler (line 171-177) so orders always go to `Served` status — never auto-jump to `Paid`. The cashier explicitly confirms all payments. Also update the bucketing logic (line 86-99) so ALL "Served" orders appear in the "Bill Out" section, not just non-room-charge ones.

#### 2. Make all orders tappable — including completed/paid ones
Update `OrderRow` (line 314-368) to allow clicking on paid/completed orders too. When a paid order is tapped, show the receipt panel (not the payment panel) so the cashier can reprint or share.

#### 3. Add Share buttons to CashierReceipt
Enhance `CashierReceipt.tsx` with:
- **Print Receipt** (existing)
- **Share via WhatsApp** — builds a text receipt and opens WhatsApp (reusing the existing `buildWhatsAppUrl` pattern from `lib/order.ts`)
- **Copy to Clipboard** — copies receipt text for pasting into any messenger

#### 4. Allow receipt preview from BillOutPanel before payment
Add a "Preview Receipt" button in the `BillOutPanel` so the cashier can print/share the bill even before confirming payment (useful for showing the guest the total).

### Files to modify
| File | Change |
|------|--------|
| `src/components/service/CashierBoard.tsx` | Stop auto-pay on serve, move all Served to Bill Out, make paid orders tappable for receipt view, add pre-payment receipt preview |
| `src/components/service/CashierReceipt.tsx` | Add WhatsApp share and copy-to-clipboard buttons |

### What doesn't change
- Other service boards (Kitchen, Bar, Reception) keep their existing behavior
- Payment flow itself stays the same — just no more auto-skip
- Database schema unchanged

