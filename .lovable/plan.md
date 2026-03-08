

## Add Resort Ops Expenses to Accounting Export

You're right — the current Accounting Export only covers revenue-side data (orders, bookings, tours, etc.) but completely misses the **expenses** from Resort Ops. That's a big gap for accounting.

### What's missing

The `expenses` table contains all Resort Ops expense records (vendor payments, utilities, supplies, labor syncs, etc.) with VAT details, categories, payment methods, and receipt images. None of this is included in the ZIP export.

### Plan

**Edit `src/components/admin/AccountingExport.tsx`** — add one more query + CSV file:

1. Query the `expenses` table for the selected date range (using `expense_date` or `created_at`)
2. Generate `expenses.csv` with columns: `id`, `expense_date`, `category`, `vendor`, `description`, `amount`, `vat_status`, `vatable_sale`, `vat_amount`, `vat_exempt_amount`, `zero_rated_amount`, `payment_method`, `invoice_number`, `official_receipt_number`, `tin`, `status`, `notes`
3. Add expense totals to `summary.csv`: Total Expenses, Total Input VAT, Net (Revenue minus Expenses)
4. Update the description text to mention expenses

**No database changes needed.** No other files touched. The `expenses` table already exists with all necessary fields and public RLS.

### Summary CSV additions
```
Total Expenses, <sum>
Total Input VAT, <sum of vat_amount>
Net Income (Revenue - Expenses), <calculated>
```

