

## PDF Invoice Download for Served/Paid Orders

### Overview
Add a "Download Invoice" button to order cards when they reach "Served" or "Paid" status. The PDF will be a professional receipt-style invoice using resort profile data (logo, name, address, phone, email) with a thank-you footer linking to www.bingabeach.com. A "Share via WhatsApp" option will also be available by sharing the PDF download link or a text summary.

### How It Works
1. When an order is "Served" or "Paid", two new buttons appear on the OrderCard: **Download PDF** and **Share on WhatsApp**
2. The PDF is generated client-side using the `jspdf` library (no server needed)
3. Resort profile data is pulled from the existing `useResortProfile` hook
4. WhatsApp sharing sends a text-based invoice summary (since WhatsApp web links can't attach files directly)

### Invoice Layout (PDF)
```text
+----------------------------------+
|          [Resort Logo]           |
|         Resort Name              |
|      Address line here           |
|   Phone | Email                  |
+----------------------------------+
|        OFFICIAL INVOICE          |
|  Date: Feb 15, 2026  10:30 AM   |
|  Type: Room Delivery - Room 5   |
+----------------------------------+
|  2x Grilled Fish      P1,200    |
|  1x Mango Shake         P150    |
|                                  |
|  Subtotal              P1,350   |
|  Service Charge (10%)    P135   |
|  --------------------------------|
|  TOTAL                 P1,485   |
+----------------------------------+
|  Payment: Cash                   |
+----------------------------------+
|  Thank you for dining with us!   |
|  www.bingabeach.com              |
+----------------------------------+
```

### Changes

**1. Install `jspdf` package** -- lightweight client-side PDF generation

**2. New file: `src/lib/generateInvoicePdf.ts`**
- Function that takes order data + resort profile and generates a PDF using jspdf
- Draws logo (if available), resort info header, itemized order, totals, and thank-you footer
- Returns a Blob for download or sharing

**3. Update `src/components/admin/OrderCard.tsx`**
- Accept resort profile as a prop
- Add "Download Invoice" button (with download icon) for Served/Paid orders
- Add "Share on WhatsApp" button that opens WhatsApp with a text-based invoice summary
- Both buttons use 44px touch targets for mobile

**4. Update `src/components/staff/StaffOrdersView.tsx`**
- Fetch resort profile using the existing `useResortProfile` hook
- Pass profile data down to each OrderCard

### Technical Details

**generateInvoicePdf.ts** key logic:
- Uses `jsPDF` to create an A5-sized receipt document
- Converts logo URL to base64 via canvas for embedding in PDF
- Formats currency with peso sign and thousand separators
- Includes order date, type, location, itemized list, subtotal, service charge, grand total, and payment method

**OrderCard.tsx** additions:
- Two new icon buttons below the existing action button when status is "Served" or "Paid"
- Download button triggers PDF generation and `saveAs`-style download
- WhatsApp button builds a text summary and opens `wa.me` link

**StaffOrdersView.tsx** changes:
- Import and call `useResortProfile()`
- Pass `profile` to each `OrderCard`

