# Quick Frontend Fix for Restaurant Context

## The Issue
The frontend RestaurantContext is not properly setting the `X-Restaurant-Id` header, causing API calls to fail with 400/500 errors.

## Quick Fix
In your browser console, run this to manually set the restaurant context:

```javascript
// Set Coq au Vin (ID: 2) as the current restaurant
localStorage.setItem('kitchenSyncCurrentRestaurant', JSON.stringify({
  id: 2,
  name: 'Coq au Vin',
  slug: 'coq-au-vin',
  isActive: true
}));

// Reload the page
location.reload();
```

## Permanent Fix Options

### Option 1: Update Backend to Not Require Restaurant Context for Single Restaurant Users
Remove `requireRestaurantContext` from routes when user only has one restaurant.

### Option 2: Fix Frontend RestaurantContext
Ensure the RestaurantContext properly waits for restaurant data before allowing other API calls.

### Option 3: Add activeRestaurantId to Production
Run a migration to add the `activeRestaurantId` column to the users table in production.

## Testing
After setting the localStorage value and reloading:
1. The app should load George's recipes
2. All API calls should include `X-Restaurant-Id: 2` header
3. George should see his 38 recipes 