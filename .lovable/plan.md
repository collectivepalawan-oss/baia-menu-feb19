

## Remove Expenses Feature

### Overview
Completely remove the Expenses module and all related receipt scanning code from the webapp. This includes the Expenses tab in the Admin dashboard, the standalone Receipts page, and all supporting components. No database tables will be dropped (data is preserved), only the UI code is removed.

### Files to Delete
- `src/components/admin/ExpensesDashboard.tsx` -- the entire Expenses dashboard component
- `src/components/admin/SnapReceiptOCR.tsx` -- the local Tesseract.js OCR component
- `src/pages/ReceiptsPage.tsx` -- the standalone receipt scanner page
- `src/components/receipts/CameraViewfinder.tsx` -- the live camera viewfinder component
- `supabase/functions/scan-receipt/index.ts` -- the backend function for Gemini-based receipt scanning

### Files to Modify

**`src/pages/AdminPage.tsx`**
- Remove the `import ExpensesDashboard` line
- Remove the `const FEATURE_EXPENSES = true;` flag
- Remove the Expenses `TabsTrigger` from the tab bar
- Remove the Expenses `TabsContent` block

**`src/App.tsx`**
- Remove the `import ReceiptsPage` line
- Remove the `/receipts` route

### What is NOT Changed
- No database tables are dropped (expenses, expense_history tables remain with existing data)
- No storage buckets are removed
- No other modules are touched (Orders, Menu, Inventory, Payroll, Reports, Settings)
- No authentication or navigation changes beyond removing the route
- `src/lib/generateInvoicePdf.ts` is kept (used by Orders/Tabs invoicing)

### Technical Notes
- The `tesseract.js` dependency will remain in package.json but will be unused (tree-shaken out of builds). It can be manually removed from package.json later if desired.
- The `expenses` and `expense_history` database tables are preserved so no data is lost. They can be dropped later via a migration if you decide to permanently remove them.
