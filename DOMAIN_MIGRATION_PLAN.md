# KitchenSync Domain Migration Plan
## From: kitchen-sync-app.onrender.com / kitchensync.app
## To: kitchensync.restaurant

### Executive Summary
This document outlines the complete migration plan for transitioning KitchenSync to the new domain `kitchensync.restaurant`. This migration affects multiple services, codebase references, and external integrations.

---

## 1. Current Domain References Inventory

### 1.1 Hard-coded Domain References
| File | Current Reference | Update Required |
|------|------------------|-----------------|
| `backend/src/server.ts` | `kitchen-sync-app.onrender.com` | Yes - CORS |
| `backend/src/server.ts` | `kitchensync.app` | Yes - CORS |
| `frontend/src/services/prepColumnService.ts` | `kitchen-sync-app.onrender.com/api` | Remove hard-coding |
| `frontend/src/services/prepTaskService.ts` | `kitchen-sync-app.onrender.com/api` | Remove hard-coding |
| `backend/scripts/test-api-endpoint.js` | `kitchen-sync-app.onrender.com` | Yes |
| `backend/scripts/check-env.js` | `kitchen-sync-app.onrender.com` | Yes |
| `PRODUCTION_ENV_SETUP.md` | `kitchen-sync-app.onrender.com` | Yes - Documentation |

### 1.2 Email References
| File | Current Reference | Update Required |
|------|------------------|-----------------|
| `backend/src/services/emailService.ts` | `support@kitchensync.app` | Yes - New email |
| `backend/src/services/emailService.ts` | `docs.kitchensync.app` | Yes - Subdomain |
| `backend/src/services/emailService.ts` | `kitchensync.app/tutorials` | Yes |
| `frontend/src/pages/RestaurantWelcomePage.tsx` | `support@kitchensync.app` | Yes |

### 1.3 Environment Variables
| Variable | Current Value | New Value |
|----------|--------------|-----------|
| `FRONTEND_URL` | `https://kitchen-sync-app.onrender.com` | `https://kitchensync.restaurant` |
| `BACKEND_URL` | Varies | `https://api.kitchensync.restaurant` |

---

## 2. External Service Configuration Changes

### 2.1 Render.com
- [ ] Add custom domain `kitchensync.restaurant` to frontend service
- [ ] Add custom domain `api.kitchensync.restaurant` to backend service
- [ ] Update SSL certificates
- [ ] Update environment variables
- [ ] Set up redirects from old domain

### 2.2 Cloudinary
- [ ] Update allowed domains for CORS
- [ ] Update webhook URLs if any
- [ ] Update referrer restrictions

### 2.3 SendGrid
- [ ] Add domain authentication for `kitchensync.restaurant`
- [ ] Update sender authentication
- [ ] Create new email addresses:
  - `support@kitchensync.restaurant`
  - `noreply@kitchensync.restaurant`
  - `admin@kitchensync.restaurant`
- [ ] Update email templates with new domain
- [ ] Update unsubscribe links

### 2.4 Stripe
- [ ] Update webhook endpoints to `https://api.kitchensync.restaurant/api/platform/webhooks/stripe`
- [ ] Update success/cancel URLs in checkout sessions
- [ ] Update domain in Stripe dashboard settings
- [ ] Test payment flows with new domain

### 2.5 PostgreSQL (Render)
- No changes required (internal connection)

---

## 3. DNS Configuration

### 3.1 Required DNS Records
```
# Root domain
@    A      [Render IP]
@    A      [Render IP 2]

# Subdomains
api       CNAME    [backend-service].onrender.com
www       CNAME    kitchensync.restaurant
docs      CNAME    [documentation-platform]

# Email (SendGrid)
em1234    CNAME    sendgrid.net
s1._domainkey    CNAME    s1.domainkey.sendgrid.net
s2._domainkey    CNAME    s2.domainkey.sendgrid.net

# Email (MX Records)
@    MX    10    mx.sendgrid.net
```

### 3.2 Subdomain Strategy
- `kitchensync.restaurant` - Main application
- `api.kitchensync.restaurant` - Backend API
- `docs.kitchensync.restaurant` - Documentation
- `platform.kitchensync.restaurant` - Platform admin (future)

---

## 4. Code Updates Required

### 4.1 Backend Updates
```javascript
// backend/src/server.ts - Update CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://kitchensync.restaurant',
    'https://www.kitchensync.restaurant',
    'https://api.kitchensync.restaurant'
];
```

### 4.2 Frontend Updates
```javascript
// Remove hard-coded URLs from services
// Use environment variable: process.env.REACT_APP_API_URL
```

### 4.3 Email Template Updates
- Update all links to use new domain
- Update support email addresses
- Update branding if needed

---

## 5. Migration Phases

### Phase 1: Preparation (Week 1)
- [ ] Set up DNS records
- [ ] Configure Render custom domains
- [ ] Set up email authentication in SendGrid
- [ ] Create staging environment with new domain

### Phase 2: Code Updates (Week 2)
- [ ] Update all hard-coded references
- [ ] Update environment variables in development
- [ ] Update email templates
- [ ] Update documentation
- [ ] Comprehensive testing

### Phase 3: External Services (Week 3)
- [ ] Configure Cloudinary
- [ ] Update Stripe webhooks and settings
- [ ] Update any other third-party integrations
- [ ] Test all integrations

### Phase 4: Deployment (Week 4)
- [ ] Deploy code updates to production
- [ ] Update production environment variables
- [ ] Switch DNS to point to Render
- [ ] Set up redirects from old domain
- [ ] Monitor for issues

### Phase 5: Post-Migration (Week 5)
- [ ] Monitor error logs
- [ ] Check email deliverability
- [ ] Verify all payments working
- [ ] Update marketing materials
- [ ] Notify existing users

---

## 6. Testing Checklist

### Pre-Migration Testing
- [ ] Test new domain in staging environment
- [ ] Verify SSL certificates working
- [ ] Test all API endpoints
- [ ] Test authentication flows
- [ ] Test email delivery
- [ ] Test payment processing
- [ ] Test file uploads
- [ ] Test customer portal

### Post-Migration Testing
- [ ] Verify redirects working
- [ ] Test all user journeys
- [ ] Monitor error rates
- [ ] Check page load speeds
- [ ] Verify SEO tags updated
- [ ] Test social sharing

---

## 7. Rollback Plan

### If Issues Arise:
1. Keep old domain active for 30 days
2. Maintain ability to switch DNS back
3. Keep environment variables documented
4. Have database backups ready

### Emergency Contacts:
- Render Support: [support link]
- SendGrid Support: [support link]
- Stripe Support: [support link]
- Domain Registrar: [support link]

---

## 8. Communication Plan

### Internal Communication:
- [ ] Update development team
- [ ] Update documentation
- [ ] Update internal tools

### External Communication:
- [ ] Email notification to all users (1 week before)
- [ ] Banner notification in app (2 weeks before)
- [ ] Social media announcement
- [ ] Update all marketing materials

### Email Template:
```
Subject: KitchenSync is moving to a new home!

We're excited to announce that KitchenSync is moving to our new domain:
kitchensync.restaurant

What this means for you:
- Your account and data remain exactly the same
- The old domain will redirect automatically
- Update your bookmarks to: https://kitchensync.restaurant

The migration will happen on [DATE].

Questions? Contact us at support@kitchensync.restaurant
```

---

## 9. SEO Considerations

### Required Actions:
- [ ] Set up 301 redirects from old domain
- [ ] Update sitemap.xml
- [ ] Update robots.txt
- [ ] Submit new domain to Google Search Console
- [ ] Update all backlinks where possible
- [ ] Monitor search rankings

---

## 10. Success Metrics

### Key Indicators:
- Zero downtime during migration
- No lost user sessions
- Email delivery rate maintained
- Payment processing uninterrupted
- No increase in error rates
- SEO rankings maintained

### Monitoring Period:
- Intensive monitoring: First 48 hours
- Daily checks: First week
- Weekly reviews: First month

---

## Appendix A: Environment Variable Updates

### Frontend (.env.production)
```bash
REACT_APP_API_URL=https://api.kitchensync.restaurant
REACT_APP_DOMAIN=kitchensync.restaurant
```

### Backend (.env)
```bash
FRONTEND_URL=https://kitchensync.restaurant
BACKEND_URL=https://api.kitchensync.restaurant
SUPPORT_EMAIL=support@kitchensync.restaurant
NOREPLY_EMAIL=noreply@kitchensync.restaurant
```

---

## Appendix B: Service-Specific Configurations

### Render.com Custom Domain Setup
1. Navigate to service settings
2. Add custom domain
3. Configure SSL certificate
4. Update environment variables

### SendGrid Domain Authentication
1. Add new domain
2. Add CNAME records
3. Verify domain
4. Update sender authentication

### Stripe Webhook Configuration
1. Add new endpoint URL
2. Select events to listen for
3. Update webhook secret in env vars
4. Test with Stripe CLI

---

Last Updated: [Current Date]
Version: 1.0 