# Salesforce API Integration Guide

This document explains how to integrate the ClientPartnerPortal with Salesforce (WOVN) API.

## Current Status

The application is currently using **mock data** for development. All the infrastructure for Salesforce integration is in place and ready to be activated when credentials are available.

## Architecture

### 1. API Service Layer (`lib/api/salesforce.ts`)

This module handles all Salesforce API interactions:

- **Authentication**: OAuth 2.0 Username-Password flow with token caching
- **SOQL Queries**: Execute queries against Salesforce objects
- **CRUD Operations**: Create, Read, Update, Delete for Orders
- **Data Mapping**: Converts Salesforce records to application data models

### 2. Custom React Hooks (`hooks/`)

- **`useOrders()`**: Fetches all orders with loading/error states
- **`useOrderStats()`**: Fetches order statistics for dashboard
- **`useOrder(orderId)`**: Fetches a single order by ID
- **`useProducts()`**: Fetches product catalog

All hooks automatically fall back to mock data when Salesforce is not configured.

### 3. UI Components (`components/ui/`)

- **`LoadingSpinner`**: Shows loading state during data fetching
- **`ErrorMessage`**: Displays errors with retry functionality

## Setup Instructions

### Step 1: Create Salesforce Connected App

1. Log into your Salesforce org
2. Navigate to **Setup** > **App Manager**
3. Click **New Connected App**
4. Fill in the required fields:
   - **Connected App Name**: ClientPartnerPortal
   - **API Name**: ClientPartnerPortal
   - **Contact Email**: your-email@company.com
5. Enable OAuth Settings:
   - **Callback URL**: `https://login.salesforce.com/services/oauth2/callback`
   - **Selected OAuth Scopes**:
     - Full access (full)
     - Perform requests at any time (refresh_token, offline_access)
6. Save and note the **Consumer Key** (Client ID) and **Consumer Secret** (Client Secret)

### Step 2: Get Security Token

1. In Salesforce, go to your user settings
2. Navigate to **Reset My Security Token**
3. Click **Reset Security Token**
4. Check your email for the new security token

### Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Salesforce credentials in `.env.local`:
   ```env
   # Salesforce Instance URL
   NEXT_PUBLIC_SALESFORCE_INSTANCE_URL=https://your-instance.salesforce.com

   # Connected App Credentials
   SALESFORCE_CLIENT_ID=your_consumer_key_here
   SALESFORCE_CLIENT_SECRET=your_consumer_secret_here

   # User Credentials
   SALESFORCE_USERNAME=your_username@company.com
   SALESFORCE_PASSWORD=your_password
   SALESFORCE_SECURITY_TOKEN=your_security_token
   ```

3. **Important**: Ensure `.env.local` is in `.gitignore` (it should be by default)

### Step 4: Update Salesforce Object Schema

The API queries assume specific field names. You'll need to update the SOQL queries in `lib/api/salesforce.ts` to match your Salesforce schema:

**Current assumed fields for Order object:**
```javascript
- Id
- Name
- Status
- Proposal__c
- Customer_PO__c
- Bill_To_Account__r.Name
- Ship_To_Location__c
- Total_Items__c
- Total_Amount__c
- Payment_Terms__c
- Delivery_Date__c
- Notes__c
```

**Update the queries in these functions:**
- `fetchOrders()`
- `fetchOrderStats()`
- `fetchOrderById()`
- `fetchProducts()`

### Step 5: Update Status Mapping

The `mapSalesforceStatus()` function maps Salesforce status values to application statuses. Update this mapping to match your Salesforce picklist values:

```typescript
function mapSalesforceStatus(salesforceStatus: string) {
  const statusMap = {
    'Draft': 'Draft',
    'Pending': 'Pending',
    'Activated': 'Success',
    'Completed': 'Success',
    'Cancelled': 'Cancelled',
  };
  return statusMap[salesforceStatus] || 'Pending';
}
```

### Step 6: Activate API Integration in Components

The hooks are ready to use but the components still use mock data directly. To activate the API:

**In `app/orders/page.tsx`:**

Replace:
```typescript
import { mockOrders, mockStats } from "./mockData";
```

With:
```typescript
import { useOrders, useOrderStats } from "@/hooks/useOrders";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
```

Then update the component:
```typescript
export default function OrdersPage() {
  const { orders, loading, error } = useOrders();
  const { stats } = useOrderStats();

  if (loading) return <LoadingSpinner text="Loading orders..." />;
  if (error) return <ErrorMessage message={error.message} />;

  // Rest of component using `orders` instead of `mockOrders`
}
```

**In `app/orders/[id]/page.tsx`:**

Similarly, replace mock products with:
```typescript
import { useProducts } from "@/hooks/useProducts";

export default function OrderDetailPage({ params }) {
  const { products, loading, error } = useProducts();
  // Use products instead of mockProducts
}
```

## Testing

### Test with Mock Data (Current)
The application works immediately with mock data. No configuration needed.

### Test with Salesforce
1. Complete setup steps above
2. Restart the development server:
   ```bash
   npm run dev
   ```
3. The app will automatically detect Salesforce configuration and switch to real data
4. Check the browser console for any API errors

## Troubleshooting

### "Authentication failed"
- Verify your Consumer Key and Secret are correct
- Ensure your password + security token combination is correct
- Check that your Salesforce user has API access enabled

### "SOQL Query failed"
- Verify field names match your Salesforce schema
- Ensure your user has read access to the objects
- Check for typos in field API names

### "CORS errors"
- Salesforce should handle CORS automatically for authenticated requests
- Ensure requests are coming from authenticated session

### Falls back to mock data
- Check console logs - the app logs when it falls back to mock data
- Verify all environment variables are set correctly
- Ensure `.env.local` is being loaded (restart dev server)

## Security Best Practices

1. **Never commit credentials**: Always keep `.env.local` in `.gitignore`
2. **Use environment-specific credentials**: Different credentials for dev/staging/prod
3. **Rotate credentials regularly**: Update security tokens and passwords periodically
4. **Limit API permissions**: Use a dedicated API user with minimal required permissions
5. **Monitor API usage**: Set up Salesforce API usage alerts
6. **Enable IP restrictions**: Restrict API access to known IP ranges in Salesforce

## API Rate Limits

Salesforce has API request limits:
- **Developer Edition**: 5,000 requests per 24 hours
- **Enterprise Edition**: Varies by license (typically 1,000+ per user per 24 hours)

The current implementation caches authentication tokens for 1 hour to minimize API calls.

## Next Steps

Once integrated:
1. Implement real-time data synchronization
2. Add webhook support for Salesforce events
3. Implement bulk operations for large datasets
4. Add caching layer (Redis) for frequently accessed data
5. Set up error monitoring (Sentry, Datadog)

## Support

For Salesforce-specific questions:
- [Salesforce REST API Documentation](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/)
- [OAuth 2.0 Username-Password Flow](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_username_password_flow.htm)

For application issues, refer to the main README.md
