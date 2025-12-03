# Quick Fix: Categories Not Showing in Filters

## The Issue
Categories aren't showing because the Algolia index needs to be reseeded with the new facet configuration.

## Quick Solution Steps

### Step 1: Make Sure Dev Server is Running

Open a terminal and run:
```bash
npm run dev
```

Wait for it to show: `Ready in X ms`

### Step 2: Reseed via Browser

**Option A: Using Browser DevTools Console**

1. Open your browser to: `http://localhost:3000/search`
2. Press `F12` to open DevTools
3. Go to the **Console** tab
4. Paste this code and press Enter:

```javascript
fetch('/api/algolia', { method: 'POST' })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Success!', data);
    alert('Index reseeded! Refresh the page.');
  })
  .catch(err => {
    console.error('❌ Error:', err);
    alert('Error: ' + err.message);
  });
```

5. Wait for the success message
6. **Refresh the page** (F5 or Ctrl+R)
7. Categories should now appear in the filters!

**Option B: Direct API Call**

1. Open a new browser tab
2. Install a REST client extension (like "REST Client" or "Talend API Tester")
3. Make a POST request to: `http://localhost:3000/api/algolia`
4. Check the response
5. Refresh the search page

### Step 3: Verify Categories Are Showing

After reseeding, you should see these categories in the filter:

- ✅ Electronics (1)
- ✅ Wearables (1)
- ✅ Furniture (1)
- ✅ Home & Kitchen (1)
- ✅ Gaming (1)

## Alternative: Manual Reseed via Algolia Dashboard

If the API approach doesn't work, you can configure facets directly in Algolia:

1. Go to: https://www.algolia.com/dashboard
2. Select your application
3. Select your index (e.g., `dev_woven_products`)
4. Go to **Configuration** → **Facets**
5. Add these attributes:
   - `category` (searchable)
   - `genre` (searchable)
   - `price` (for filtering)
6. Click **Save**
7. Go to **Add records** and manually add the sample products

## Troubleshooting

### "Cannot connect to server"
- Make sure `npm run dev` is running
- Check if `http://localhost:3000` is accessible

### "Algolia credentials not configured"
Check your `.env` file has:
```
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
ALGOLIA_ADMIN_KEY=your_admin_key
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_key
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=dev_woven_products
```

### "Index not found"
- Create the index in Algolia Dashboard
- Or let the API create it automatically

### Categories still not showing after reseed
1. **Hard refresh** the page: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Clear browser cache**
3. **Check browser console** for errors (F12)
4. **Verify in Algolia Dashboard** that records were added

## Expected Result

After successful reseed, the filter sidebar should show:

```
Filters                    [Clear all]

Category
☐ Electronics (1)
☐ Wearables (1)
☐ Furniture (1)
☐ Home & Kitchen (1)
☐ Gaming (1)

Price Range
[Min] to [Max]  [Apply]

Type
☐ Electronics (1)
☐ Wearables (1)
☐ Furniture (1)
☐ Home & Kitchen (1)
☐ Gaming (1)
```

## Still Having Issues?

If categories still don't show:

1. **Check the browser console** (F12 → Console tab)
2. **Look for errors** in the terminal running `npm run dev`
3. **Verify Algolia credentials** are correct
4. **Check Algolia Dashboard** to see if records exist
5. **Try clearing all browser data** for localhost

## Need Help?

Share the error message from:
- Browser console (F12 → Console)
- Terminal running dev server
- Network tab (F12 → Network → look for `/api/algolia` request)
