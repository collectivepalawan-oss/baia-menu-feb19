

# Resort Profile and Logo Setup

## Overview
Add a complete resort profile section to the Admin Settings that serves as the "onboarding" for a new resort. This includes a logo upload (with transparent background support), resort details, and social media links -- all of which will automatically appear on invoices and the landing page.

## What Gets Added

### 1. Database -- New `resort_profile` table
A single-row table storing all resort branding and contact info:

| Field | Type | Purpose |
|-------|------|---------|
| id | uuid (PK) | |
| logo_url | text | URL to uploaded logo in storage |
| resort_name | text | e.g., "Baia Palawan" |
| tagline | text (nullable) | Optional subtitle |
| address | text | Full address |
| phone | text | Main phone number |
| contact_name | text | Primary contact person |
| contact_number | text | Contact person's number |
| email | text | Resort email |
| google_map_embed | text (nullable) | Google Maps embed code |
| google_map_url | text (nullable) | Google Maps link |
| facebook_url | text (nullable) | |
| instagram_url | text (nullable) | |
| tiktok_url | text (nullable) | |
| website_url | text (nullable) | |
| created_at | timestamptz | |

### 2. Storage -- Logo bucket
- Create a `logos` storage bucket (public) for logo uploads
- RLS policy allows anyone to read, anyone to upload (no auth in this app)

### 3. Admin Settings -- Resort Profile section
A new section at the top of the Setup tab with:
- **Logo upload area**: Click-to-upload with preview. Accepts PNG/SVG with transparency
- **Resort name and tagline** inputs
- **Address, phone, email** inputs
- **Contact name and number** inputs
- **Google Maps** embed code and URL inputs
- **Social media URLs**: Facebook, Instagram, TikTok, Website -- each with its icon
- Save button that persists everything to the `resort_profile` table

### 4. Landing Page (Index.tsx) -- Dynamic branding
- Replace hardcoded "BAIA PALAWAN" with the resort name from the profile
- Show the uploaded logo (rendered on the transparent/dark background)

### 5. Invoices -- Dynamic resort header
- CartDrawer invoice header pulls resort name from the profile instead of hardcoded "Baia Palawan"
- TabInvoice does the same
- Logo displayed at the top of invoices

## File Changes

| File | Change |
|------|--------|
| Migration SQL | Create `resort_profile` table, create `logos` storage bucket with public access |
| `src/pages/AdminPage.tsx` | Add "Resort Profile" section in Setup tab with logo upload, all profile fields, social media inputs |
| `src/pages/Index.tsx` | Fetch resort profile, display logo and dynamic resort name |
| `src/components/CartDrawer.tsx` | Fetch resort profile, use dynamic name and logo in invoice header |
| `src/components/admin/TabInvoice.tsx` | Fetch resort profile, use dynamic name and logo in tab invoice header |

## Technical Details

**Logo upload flow:**
1. User selects an image file (PNG or SVG recommended for transparency)
2. File is uploaded to the `logos` storage bucket via the Supabase Storage API
3. The public URL is saved to `resort_profile.logo_url`
4. The logo renders with a transparent background naturally since PNGs/SVGs preserve alpha channels -- no processing needed, but the UI will instruct the user to upload a transparent PNG

**Resort profile query (shared across pages):**
- A reusable query with key `['resort-profile']` fetches the single row from `resort_profile`
- Used by Index, CartDrawer, and TabInvoice

**Social media display:**
- Each social link stored as a full URL
- Rendered with the corresponding Lucide icon (Facebook, Instagram, Globe for TikTok/website)
- Only shown if the URL is filled in

**Invoice integration:**
- The invoice header in CartDrawer and TabInvoice will show: logo (if set), resort name (from profile), and the existing order type/location badges
- Falls back to "Resort" if no profile is configured yet

