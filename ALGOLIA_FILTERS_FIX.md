# Algolia Filters Fix

## Problem
The category and price filters were not working because the Algolia index was not configured with the proper faceting attributes.

## What Was Fixed

### 1. **Index Configuration** (`app/api/algolia/route.ts`)

Added index settings to enable faceting:

```typescript
await index.setSettings({
  attributesForFaceting: [
    'searchable(category)',  // Enables category filter + search
    'searchable(genre)',     // Enables genre/type filter + search
    'price'                  // Enables price range filter
  ],
  searchableAttributes: [
    'title',
    'name',
    'description',
    'category',
    'genre'
  ],
  customRanking: ['desc(price)']
});
```

### 2. **Search Page Configuration** (`app/search/page.tsx`)

Updated the Configure component to request facets:

```typescript
<Configure 
  hitsPerPage={200}
  facets={['category', 'genre']}
  maxValuesPerFacet={20}
/>
```

## How to Apply the Fix

### Option 1: Via Browser (Recommended)

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/search`

3. The page will show a message about seeding the database

4. Click the "Initialize / Reset Data" button (if visible)
   - OR manually trigger via: `http://localhost:3000/api/algolia` (POST request)

### Option 2: Via Script

Run the reseed script:

```bash
node scripts/reseed-algolia.js
```

### Option 3: Via API Call

Using curl (PowerShell):
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/algolia" -Method POST
```

Using curl (Bash):
```bash
curl -X POST http://localhost:3000/api/algolia
```

## Verification

After reseeding, the filters should work:

1. **Category Filter**: 
   - ✅ Shows: Electronics, Wearables, Furniture, Home & Kitchen, Gaming
   - ✅ Clicking a category filters products

2. **Price Range Filter**:
   - ✅ Enter min/max price (e.g., 50 to 150)
   - ✅ Click "Apply"
   - ✅ Products filtered by price range

3. **Type/Genre Filter**:
   - ✅ Shows available product types
   - ✅ Clicking filters products

4. **Current Refinements**:
   - ✅ Active filters shown as pills
   - ✅ Click X to remove individual filters

5. **Clear All**:
   - ✅ Removes all active filters at once

## What the Filters Do

### Category Filter (`RefinementList`)
- Attribute: `category`
- Type: Checkbox list
- Features:
  - Shows product count per category
  - "Show more/less" functionality
  - Searchable (can type to find categories)

### Price Range Filter (`RangeInput`)
- Attribute: `price`
- Type: Min/Max input fields
- Features:
  - Enter minimum price
  - Enter maximum price
  - Click "Apply" to filter

### Type Filter (`RefinementList`)
- Attribute: `genre`
- Type: Checkbox list
- Features:
  - Shows product types
  - Multiple selection
  - Searchable

## Troubleshooting

### Filters still not working?

1. **Check if index was reseeded:**
   ```bash
   # Check browser console for success message
   # Or check server logs
   ```

2. **Verify Algolia credentials:**
   ```bash
   # Check .env file
   NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
   ALGOLIA_ADMIN_KEY=your_admin_key
   ```

3. **Check Algolia Dashboard:**
   - Go to: https://www.algolia.com/dashboard
   - Select your index
   - Go to "Configuration" > "Facets"
   - Should see: category, genre, price

4. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

5. **Check browser console for errors:**
   - Open DevTools (F12)
   - Look for any red errors

### No products showing?

1. **Reseed the index:**
   ```bash
   node scripts/reseed-algolia.js
   ```

2. **Check if sample data was added:**
   - Should have 5 products after seeding

### Filters show but don't filter?

1. **Verify facet configuration in Algolia Dashboard**
2. **Check that attributes match exactly:**
   - `category` (not `categories`)
   - `genre` (not `type`)
   - `price` (not `cost`)

## Sample Data

After seeding, you should have these products:

1. **Wireless Bluetooth Headphones** - $79.99 (Electronics)
2. **Smart Fitness Watch** - $199.99 (Wearables)
3. **Ergonomic Office Chair** - $349.99 (Furniture)
4. **Stainless Steel Water Bottle** - $24.99 (Home & Kitchen)
5. **Mechanical Gaming Keyboard** - $129.99 (Gaming)

## Technical Details

### Why `searchable(category)`?

The `searchable()` modifier allows users to:
1. Filter by category (checkbox)
2. Search within categories (type to find)

Without it, categories would only be filterable, not searchable.

### Why separate `facets` in Configure?

The `facets` parameter tells Algolia which facets to retrieve with each search request. This improves performance by only fetching needed facet data.

### Why `maxValuesPerFacet={20}`?

Limits the number of facet values returned per attribute. Prevents performance issues with large datasets.

## Next Steps

1. ✅ Reseed the index
2. ✅ Test all filters
3. ✅ Verify in production (if deployed)
4. 📝 Consider adding more filters:
   - Brand
   - Rating
   - Availability
   - Tags

## Additional Resources

- [Algolia Faceting Guide](https://www.algolia.com/doc/guides/managing-results/refine-results/faceting/)
- [React InstantSearch Widgets](https://www.algolia.com/doc/api-reference/widgets/react/)
- [RefinementList Widget](https://www.algolia.com/doc/api-reference/widgets/refinement-list/react/)
- [RangeInput Widget](https://www.algolia.com/doc/api-reference/widgets/range-input/react/)
