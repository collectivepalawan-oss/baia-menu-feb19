

# Make All Login Inputs Use Numeric PIN Style

## Problem
The Staff Order, Admin, and Employee entry points all require a PIN, but only the Employee Portal currently uses a numeric keypad-optimized input. The Index page passkey dialog and the Admin Login Gate still use regular password inputs.

## Changes

### 1. Index.tsx - Passkey Dialog
- Change the passkey `Input` from `type="password"` to `type="tel"` with `inputMode="numeric"` and `pattern="[0-9]*"`
- Filter non-digit characters on input
- Add `maxLength={6}`, center text, larger tracking for PIN feel

### 2. AdminLoginGate.tsx - Admin PIN Input
- Change the PIN `Input` from `type="password"` to `type="tel"` with `inputMode="numeric"` and `pattern="[0-9]*"`
- Filter non-digit characters on input
- Ensure consistent styling with the other PIN inputs (centered, large tracking)

### Technical Details
- Two files modified: `src/pages/Index.tsx` and `src/components/admin/AdminLoginGate.tsx`
- No backend changes needed
- All three entry points will trigger mobile numeric keypads consistently

