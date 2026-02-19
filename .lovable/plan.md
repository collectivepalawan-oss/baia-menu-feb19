

# Inventory and Recipe System Redesign - Implementation Plan

## Pre-Flight: Data Safety

Before any unit conversions, the system will:
1. **Snapshot current data** by querying and logging existing `ingredients` and `recipe_ingredients` tables (we can export CSV from the existing inventory dashboard as a backup)
2. **Unit conversions will be intentional and auditable** - each change logged in `inventory_logs` with reason `unit_conversion`

Looking at the actual data, most units are already correct:
- Eggs = pcs, Bread = slices, Cooking Oil = ml, Cream = ml, Milk = ml, Olive Oil = ml, Honey = ml, Lemon/Calamansi = ml, White Rum = ml, Soda Water = ml
- Banana = grams (correct for cocktail recipes where it's measured by weight)
- Onion = grams (correct for cooking recipes)

The main items that need correction are minimal. Recipe quantities already match their units properly.

## Implementation Steps

### Step 1: Create Stock Check Utility
**New file: `src/lib/stockCheck.ts`**

A function that:
- Takes cart items (name + quantity)
- Looks up recipe_ingredients for each menu item
- Aggregates total ingredient needs across all cart items
- Compares against current_stock in ingredients table
- Returns `{ canFulfill: boolean, shortages: [{itemName, ingredientName, needed, available, unit}] }`

### Step 2: Update MenuPage.tsx - Sold Out Badges
- Add a query for recipe_ingredients with ingredient stock data
- Compute which menu items can't be fulfilled (any ingredient at 0 or below recipe requirement)
- Show "Sold Out" badge on those items and disable tapping them
- Show "Low Stock" badge when ingredients are near threshold

### Step 3: Update CartDrawer.tsx - Pre-Order Validation
- Import and call `stockCheck()` before `handleSendToKitchen`
- If shortages found, show a warning toast listing which items can't be made
- Block the order (staff can still override with a second tap)

### Step 4: Enhance InventoryDashboard.tsx
Add three new sections:

**a) Consumption Log Tab**
- Query `inventory_logs` where reason = 'order_deduction'
- Group by date and ingredient
- Show daily totals with date range filter

**b) Per-Dish Usage Tab**
- Join inventory_logs with orders to show which dishes consumed the most
- Date range filter

**c) Dashboard Enhancements**
- Unit type filter (pcs / grams / ml / all)
- "Out of Stock" filter
- Total inventory value summary (SUM of current_stock * cost_per_unit)
- Prominent "Missing cost" badge on ingredients with cost_per_unit = 0

### Step 5: Food Cost Visibility in Admin Menu List
- In AdminPage.tsx menu tab, show food cost and margin % next to each menu item
- Margin = (price - food_cost) / price * 100
- Highlight items with no food cost data

### Step 6: Fix Remaining Unit Types (Database)
- Update the few ingredients that genuinely have wrong units
- Add "slices" to the UNITS array in InventoryDashboard (Bread already uses it)

## Files to Create
- `src/lib/stockCheck.ts`

## Files to Modify
- `src/pages/MenuPage.tsx` - sold out badges, stock queries
- `src/components/CartDrawer.tsx` - pre-order stock validation
- `src/components/admin/InventoryDashboard.tsx` - consumption logs, filters, cost alerts
- `src/pages/AdminPage.tsx` - food cost/margin display in menu list

## No Schema Changes Needed
All tables already have the correct structure. Only data updates for unit corrections (via insert tool, not migrations).

