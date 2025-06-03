# Subdomain Routing Documentation

## Overview

KitchenSync now supports subdomain-based routing for restaurant customer portals. Each restaurant can have its own subdomain (e.g., `coqauvin.kitchensync.restaurant`) that automatically loads their branded customer portal.

## How It Works

### URL Structure
- **Main Application**: `app.kitchensync.restaurant` (staff/admin portal)
- **Restaurant Portals**: `{slug}.kitchensync.restaurant` (customer portals)
- **Example**: `coqauvin.kitchensync.restaurant` → Customer portal for Coq au Vin

### Development Testing
In development, subdomains are simulated using query parameters:
- `http://localhost:3000/customer?restaurant=coqauvin`

### Implementation Details

#### Backend
1. **API Endpoint**: `/api/restaurant-settings/public/slug/:slug/settings`
   - Accepts restaurant slug to fetch settings
   - Falls back to restaurant ID for backward compatibility

2. **Restaurant Identification**:
   ```typescript
   // Priority order:
   1. Slug from URL parameter
   2. Restaurant ID from query
   3. Default restaurant ID (1) for backward compatibility
   ```

#### Frontend
1. **Subdomain Detection** (`utils/subdomain.ts`):
   - Extracts subdomain from hostname
   - Handles localhost with query params
   - Provides utilities for building restaurant URLs

2. **Restaurant Settings Service**:
   - Automatically uses subdomain slug when available
   - Falls back to restaurant ID

3. **Customer Portal**:
   - Fetches settings based on subdomain
   - Applies restaurant branding dynamically

## Setup Instructions

### Development
1. Access customer portal with query param:
   ```
   http://localhost:3000/customer?restaurant={slug}
   ```

2. The SubdomainInfo component (dev only) shows current routing info

### Production
1. **DNS Configuration**:
   - Add wildcard DNS record: `*.kitchensync.restaurant → your-server-ip`
   
2. **Web Server Configuration** (Nginx example):
   ```nginx
   server {
       server_name *.kitchensync.restaurant;
       
       location / {
           proxy_pass http://your-app-server;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **SSL Certificate**:
   - Use wildcard certificate for `*.kitchensync.restaurant`
   - Or use Let's Encrypt with DNS challenge

## Restaurant Slug Requirements

- Must be unique across all restaurants
- Should be URL-safe (lowercase, no spaces)
- Examples: `coqauvin`, `seabreeze-kitchen`, `bistro-paris`

## Testing Checklist

- [ ] Restaurant settings load correctly based on subdomain
- [ ] Branding (colors, fonts, logo) applies correctly
- [ ] Menu content displays for the correct restaurant
- [ ] Reservation system uses correct restaurant context
- [ ] "View Customer Portal" button generates correct URL

## Future Enhancements

1. **Custom Domains**: Allow restaurants to use their own domains
2. **Subdomain Validation**: API endpoint to check if subdomain exists
3. **Automatic Slug Generation**: Generate slug from restaurant name
4. **SSL Automation**: Automatic certificate provisioning for new subdomains 