# Website Builder Content Block Migration - Production Deployment Checklist

## 🚨 CRITICAL: Pre-Deployment Safety Measures

### ✅ Step 1: Database Backup (MANDATORY)
```bash
# Run the production backup script
cd backend
NODE_ENV=production node scripts/production-deployment-backup.js
```
- [ ] Backup script completed successfully
- [ ] Full database backup created
- [ ] Critical table backups created
- [ ] Validation results reviewed
- [ ] Backup files stored safely

### ✅ Step 2: Review Changes & Risk Assessment
**HIGH RISK Changes:**
- [ ] `contentBlockController.ts` - Enhanced restaurant detection with backward compatibility
- [ ] `contentBlockService.ts` - Enhanced error handling with graceful degradation

**MEDIUM RISK Changes:**
- [ ] `unifiedContentService.ts` - Fixed fallback content loading
- [ ] Customer portal rendering improvements

**LOW RISK Changes:**
- [ ] `subdomain.ts` - Development-only navigation URL fixes
- [ ] HTML content rendering improvements

### ✅ Step 3: Production Environment Verification
- [ ] Production uses real subdomains (e.g., `coq-au-vin.kitchensync.restaurant`)
- [ ] Backend auto-detects restaurant from subdomain headers
- [ ] All customer portals currently working
- [ ] Render deployment configured correctly

## 🚀 Deployment Process

### Step 4: Code Preparation
```bash
# Ensure all changes are committed
git add .
git status
git commit -m "feat: Website Builder content block migration with production safety measures

- Enhanced contentBlockController with restaurant slug detection and backward compatibility
- Added comprehensive error handling and logging for debugging
- Improved frontend services with graceful degradation
- Fixed navigation URL handling for development mode
- Added production deployment backup script and safety measures"
```
- [ ] All changes committed with descriptive message
- [ ] Working directory clean

### Step 5: Version Tagging
```bash
# Create version tag for this deployment
git tag -a v3.4.0 -m "Website Builder Content Block Migration
- Content blocks render correctly on customer portals
- Navigation links work with restaurant context
- Production-safe deployment with backward compatibility
- Enhanced error handling and logging
- Comprehensive backup and rollback procedures"

git push origin v3.4.0
```
- [ ] Version tag created (v3.4.0)
- [ ] Tag pushed to GitHub

### Step 6: Staged Deployment Strategy

**Option A: Safe Deployment (Recommended)**
```bash
# Push to main branch (triggers Render deployment)
git checkout main
git merge feature/website-builder-advanced-theming
git push origin main
```
- [ ] Changes merged to main branch
- [ ] Render deployment triggered automatically
- [ ] Monitor deployment logs in Render dashboard

**Option B: Manual Deployment Control**
- [ ] Deploy backend changes first
- [ ] Test API endpoints manually
- [ ] Deploy frontend changes after backend verification

### Step 7: Post-Deployment Verification

#### Immediate Checks (First 5 minutes)
- [ ] Render deployment completed successfully
- [ ] No build errors in deployment logs
- [ ] Application starts without crashes

#### API Endpoint Testing (5-10 minutes)
```bash
# Test content block API with different restaurant contexts
curl "https://api.kitchensync.restaurant/api/content-blocks/public?page=home&restaurantSlug=coq-au-vin"
curl "https://api.kitchensync.restaurant/api/content-blocks/public?page=home" # Should fallback to default
```
- [ ] API returns content blocks correctly
- [ ] Restaurant slug detection works
- [ ] Backward compatibility maintained
- [ ] Error handling works gracefully

#### Customer Portal Testing (10-15 minutes)
Test these production customer portals:
- [ ] https://coq-au-vin.kitchensync.restaurant - Content blocks render
- [ ] https://seabreeze-kitchen.kitchensync.restaurant - Navigation works
- [ ] https://mountain-view-bistro.kitchensync.restaurant - No errors in console
- [ ] At least 3 other restaurant subdomains tested

#### Admin Portal Testing (15-20 minutes)
- [ ] Website Builder loads correctly
- [ ] Content blocks display in admin
- [ ] Save functionality works
- [ ] Image uploads work
- [ ] Page management functions

### Step 8: Performance & Error Monitoring

#### Monitor for 30 minutes after deployment:
- [ ] Check Render application logs for errors
- [ ] Monitor customer portal loading times
- [ ] Watch for API error rates
- [ ] Verify no 500 errors in logs

#### Check specific log patterns:
```bash
# Look for these log patterns in Render
[ContentBlocks API] Restaurant found by subdomain
[ContentBlocks API] Restaurant found by slug
[ContentBlockService] Fetching public blocks
```
- [ ] Restaurant detection logs appear correctly
- [ ] No critical errors in logs
- [ ] Performance within acceptable range

## 🚨 Rollback Plan (If Issues Arise)

### Immediate Response (If Critical Issues)
1. **Stop Traffic** (if possible via Render)
2. **Revert Code**:
   ```bash
   git revert HEAD
   git push origin main
   ```
3. **Monitor** for deployment completion
4. **Verify** application functionality restored

### Database Rollback (If Data Issues)
1. **Get Render database connection details**
2. **Restore from backup**:
   ```bash
   psql "[PRODUCTION_DATABASE_URL]" < path/to/backup/website-builder-deployment-[DATE]-full-backup.sql
   ```
3. **Verify data integrity**
4. **Test application functionality**

### Partial Rollback (If Specific Features Broken)
- Disable specific content block types
- Revert specific controller methods
- Maintain core functionality while fixing issues

## 📊 Success Criteria

### Deployment Successful If:
- [ ] All existing customer portals continue to work
- [ ] Content blocks display correctly on restaurant subdomains
- [ ] Navigation works on production subdomain URLs
- [ ] No increase in API error rates
- [ ] Website Builder admin functionality intact
- [ ] Performance impact minimal (< 10% increase in response times)

### Deployment Failed If:
- Customer portals show "Failed to load page content"
- Navigation links broken on production
- API returning 500 errors consistently
- Database connection issues
- Significant performance degradation

## 📞 Emergency Contacts

- **Primary Developer**: [Your contact info]
- **Database Admin**: [Database contact]
- **Render Support**: https://render.com/support
- **Production Monitoring**: [Monitoring dashboard URL]

## 📝 Post-Deployment Actions

### Within 24 Hours:
- [ ] Monitor error rates and performance metrics
- [ ] Collect user feedback on customer portals
- [ ] Document any issues encountered
- [ ] Update deployment procedures based on learnings

### Within 1 Week:
- [ ] Review backup retention policy
- [ ] Update documentation with production insights
- [ ] Plan next phase of Website Builder enhancements
- [ ] Conduct post-mortem if any issues occurred

## 🎉 Deployment Sign-off

- [ ] **Pre-deployment checklist completed by**: _____________ Date: _______
- [ ] **Backup verified by**: _____________ Date: _______
- [ ] **Deployment executed by**: _____________ Date: _______
- [ ] **Post-deployment verification by**: _____________ Date: _______
- [ ] **Final sign-off by**: _____________ Date: _______

---

**Notes**: This deployment includes significant backend API changes for restaurant detection and content block loading. The changes are designed with backward compatibility and graceful degradation, but careful monitoring is essential during the first 24 hours after deployment. 