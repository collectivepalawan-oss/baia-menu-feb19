

## Receipt Management with OCR Scanning

### Overview
Add a standalone `/receipts` page with camera-based receipt scanning, AI-powered data extraction, and a history list. This page will save scanned receipts to the existing `expenses` table, integrating seamlessly with the Expenses dashboard in Admin.

### OCR Approach: AI Vision via Backend Function

Tesseract.js is unreliable for real-world receipts (thermal paper, varied layouts, poor lighting). Instead, we will use a backend function powered by Lovable AI (Gemini 2.5 Flash) which excels at reading receipt images and extracting structured data. No API key is needed.

The flow:
1. User captures/uploads a receipt image
2. Image is uploaded to the existing `receipts` storage bucket
3. The image URL is sent to a backend function
4. The function calls Gemini with a prompt to extract vendor, date, currency, and total
5. Extracted data is returned to the frontend as JSON
6. User reviews and edits the data in a form, then saves

### File Changes

**New files:**
- `supabase/functions/scan-receipt/index.ts` -- Backend function that receives an image URL, calls Gemini Vision to extract vendor/date/currency/total, returns JSON with confidence scores
- `src/pages/ReceiptsPage.tsx` -- Standalone page with scanner interface, review form, and history list

**Modified files:**
- `src/App.tsx` -- Add `/receipts` route

**No changes to:** AdminPage, ExpensesDashboard, or any existing business logic.

### Database Changes

Add two columns to the existing `expenses` table:
- `currency` (text, default 'PHP') -- to store the extracted currency
- `ai_confidence` (jsonb, default null) -- to store per-field confidence scores from the AI extraction

No new tables needed. Scanned receipts are saved as expenses with `status = 'pending_review'`.

### Page Layout: `/receipts`

**Mobile-first, single column layout:**

1. **Header** -- "Receipt Scanner" title with a back button to home
2. **Scan Button** -- Large, prominent "Scan Receipt" button that opens the device camera (via `<input type="file" accept="image/*" capture="environment">`)
3. **Processing State** -- After capture, show the image with a loading spinner overlay and "Extracting data..." text while the backend function runs
4. **Review Form** (shown after extraction) -- Split layout on desktop (image left, form right), stacked on mobile:
   - Receipt image preview (zoomable)
   - Vendor Name (text input, pre-filled) with confidence badge
   - Date (date input, pre-filled) with confidence badge
   - Currency (text input, pre-filled, e.g. "PHP")
   - Total Amount (number input, pre-filled) with confidence badge
   - Category dropdown (same categories as Expenses)
   - Notes textarea
   - "Save" and "Discard" buttons
5. **History List** -- Below the scanner, a scrollable list of previously scanned receipts showing vendor, date, amount, and status badge (Pending Review / Approved / Draft). Tapping opens the review form for editing.

### Confidence Badges

Each AI-extracted field shows a small colored badge:
- Green "High" (score >= 0.8)
- Yellow "Medium" (0.5-0.8)
- Red "Low" (< 0.5)

This tells the user which fields to double-check.

### Backend Function: `scan-receipt`

```
POST /scan-receipt
Body: { imageUrl: string }
Response: { vendor, date, currency, total, confidence: { vendor, date, currency, total } }
```

Uses Gemini 2.5 Flash with a structured prompt asking it to extract receipt fields and return JSON. The model receives the image URL and returns parsed data.

### Technical Details

- Camera capture uses the native HTML file input with `capture="environment"` for rear camera on mobile
- Images are uploaded to the existing `receipts` bucket before sending to the backend function
- The backend function uses `LOVABLE_API_KEY` (already configured) and `SUPABASE_URL` secrets
- Pay period dates are auto-calculated (Sunday-Saturday) and stored on save, matching the Expenses dashboard logic
- History list queries `expenses` table filtered to entries that have an `image_url` (i.e., scanned receipts)
- All saves record an entry in `expense_history` for the audit trail
- Confidence scores stored in the `ai_confidence` JSONB column for future reference

