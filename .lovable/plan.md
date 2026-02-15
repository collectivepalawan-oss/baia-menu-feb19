

## Add Home Button to Staff Orders Header

### Problem
The staff "Orders" view (when staff taps the "Orders" tab in the bottom nav) is missing a Home button in its header. Every other page already has one. The NotFound page also lacks the consistent styled Home button.

### Changes

**1. `src/pages/MenuPage.tsx` -- Staff Orders header (lines 228-231)**
- Add a Home icon button (same style as the menu header) to the left side of the "ORDERS" header
- Change the layout from centered title to `justify-between` with Home button on left, title centered, and an invisible spacer on right for balance

**2. `src/pages/NotFound.tsx`**
- Restyle to match the app theme (navy background, display font)
- Replace the plain text link with a Home icon button and a styled "Return Home" button for fast navigation

### Technical Details

**MenuPage.tsx (Orders header, ~line 228-231):**
Replace the centered-only header with:
```tsx
<div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
  <button onClick={() => navigate('/')} className="text-cream-dim hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
    <Home className="w-5 h-5" />
  </button>
  <h1 className="font-display text-lg tracking-[0.15em] text-foreground">ORDERS</h1>
  <div className="w-[44px]" /> {/* spacer for centering */}
</div>
```

**NotFound.tsx:**
- Add `useNavigate`, import `Home` from lucide-react
- Apply `bg-navy-texture` background, `font-display` headings, and a prominent Home button with 44px touch target
