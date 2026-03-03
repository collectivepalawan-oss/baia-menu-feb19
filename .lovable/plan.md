

# Fix Housekeeping Flow: Reduce PIN Prompts and Auto-Redirect

## Problem
1. After submitting inspection, the screen doesn't visually transition to cleaning -- the housekeeper has to leave and come back.
2. Too many PIN prompts (4 total). Only 2 are needed for accountability.

## Current vs New Flow

```text
CURRENT (4 PINs):                    NEW (2 PINs):
Accept Assignment [PIN]              Accept Assignment [PIN]
    |                                    |
Do Inspection                        Do Inspection
    |                                    |
Submit Inspection [PIN] -- REMOVE    Submit Inspection [NO PIN]
    |                                    |
Screen stuck -- BUG                  Auto-transition to Cleaning
    |                                    |
Complete Cleaning [PIN]              Complete Cleaning [PIN]
```

## Changes

### File: `src/components/admin/HousekeepingInspection.tsx`

**1. Remove PIN from inspection submission**
- Currently: clicking "Complete Inspection" opens the PIN modal (`setPinAction('inspection')`)
- Change: clicking "Complete Inspection" calls `completeInspection()` directly, using the already-authenticated housekeeper info from `localStorage` (set when they accepted the assignment with PIN)

**2. Auto-transition to cleaning after inspection**
- Currently: `completeInspection` updates the DB but the component's `step` variable is derived from `order.status`, and the `order` prop doesn't refresh -- so the screen stays on inspection.
- Fix: After the DB update succeeds, force a local state change so the UI immediately shows the cleaning step without requiring navigation or page reload. Add a local `currentStep` state that overrides the prop-derived step.

**3. Keep PIN only for cleaning completion**
- The PIN modal and `pinAction` state will only be used for the cleaning completion step (no change needed here).

### Technical Details

1. Add `const [currentStep, setCurrentStep] = useState(step)` to track the active step locally
2. Change the "Complete Inspection" button's `onClick` from `() => setPinAction('inspection')` to call `completeInspection()` directly
3. Modify `completeInspection()` to:
   - Remove the `confirmedBy` parameter
   - Use `localStorage.getItem('emp_name')` and `localStorage.getItem('emp_id')` for `inspection_by_name` (the housekeeper already authenticated via PIN when accepting)
   - After successful DB update, call `setCurrentStep('cleaning')` to immediately show the cleaning screen
4. Update the step variable usage throughout the component to use `currentStep` instead of the prop-derived `step`
5. Remove the `pinAction === 'inspection'` branch from `handlePinConfirm`
6. Update PIN modal title/description to only reference cleaning completion

