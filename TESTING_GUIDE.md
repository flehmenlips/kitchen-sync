# Testing Guide for Reservation Bug Fixes

## Prerequisites
1. Ensure backend and frontend are running: `npm run dev:all` from project root
2. Have a customer account ready (or create one)
3. Have access to a restaurant subdomain or know a restaurant slug

---

## Test 1: Bug A Fix - Null Assertion Safety ✅

**What we're testing:** The defensive check prevents crashes if customer ID extraction fails.

### Steps:
1. Navigate to a restaurant subdomain (e.g., `http://localhost:5173` if using a subdomain, or `http://localhost:5173/customer/reservations/new`)
2. Try to make a reservation **without being logged in**
3. **Expected Result:** 
   - You should be redirected to login page
   - No server crashes or errors in console
   - Error message: "Please sign in to make a reservation"

### Verification:
- ✅ No 500 errors in browser console
- ✅ No crashes in backend logs
- ✅ Clean redirect to login page

---

## Test 2: Bug B Fix - Restaurant ID Default Removed ✅

**What we're testing:** System no longer defaults to restaurant ID 1, fails gracefully instead.

### Steps:
1. Log in as a customer (use existing account or create new one)
2. Navigate to reservation page: `/customer/reservations/new` (NOT on a restaurant subdomain)
3. Fill out reservation form (date, time, party size)
4. Submit reservation
5. **Expected Result:**
   - If restaurant slug is missing AND restaurant ID is missing:
     - Should return 400 error
     - Error message: "Restaurant ID or slug is required"
     - Should NOT create reservation for restaurant ID 1

### Alternative Test (if you have API access):
Use Postman/curl to test directly:
```bash
curl -X POST http://localhost:3001/api/customer/reservations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reservationDate": "2025-01-20",
    "reservationTime": "19:00",
    "partySize": 2
  }'
```

**Expected:** 400 error with message about restaurant ID/slug being required

### Verification:
- ✅ Returns 400 error (not 500)
- ✅ Error message mentions restaurant ID/slug requirement
- ✅ No reservation created for restaurant ID 1

---

## Test 3: Bug C Fix - Transaction Wrapper ✅

**What we're testing:** If reservation creation fails, customerRestaurant upsert is rolled back.

### Steps:
1. Log in as a verified customer
2. Navigate to reservation page on a restaurant subdomain
3. Fill out reservation form with **invalid data** that will cause reservation creation to fail:
   - Option A: Use a date/time in the past
   - Option B: Use party size > 20
   - Option C: Use invalid date format
4. Submit reservation
5. **Expected Result:**
   - Reservation creation fails
   - No orphaned `customerRestaurant` record is created
   - Error message displayed to user

### Verification Steps:
1. Check database after failed reservation attempt:
```sql
-- Check if customerRestaurant record was created for this customer+restaurant combo
SELECT * FROM customer_restaurants 
WHERE customer_id = YOUR_CUSTOMER_ID 
AND restaurant_id = YOUR_RESTAURANT_ID;
```

**Expected:** No record should exist if reservation failed

### Verification:
- ✅ Reservation creation fails gracefully
- ✅ No orphaned customerRestaurant records in database
- ✅ Error message shown to user

---

## Test 4: Happy Path - Successful Reservation ✅

**What we're testing:** Normal reservation flow still works correctly.

### Steps:
1. Log in as a **verified** customer (`emailVerified: true`)
2. Navigate to reservation page on a restaurant subdomain (or with restaurant slug)
3. Fill out reservation form:
   - Select a future date
   - Select a time
   - Choose party size (1-20)
   - Add optional special requests
4. Submit reservation
5. **Expected Result:**
   - Reservation created successfully
   - Confirmation page shown
   - `customerRestaurant` record created/updated
   - Reservation appears in database

### Verification:
- ✅ Reservation created successfully
- ✅ Confirmation page displayed
- ✅ Reservation visible in customer's reservation list
- ✅ customerRestaurant record exists in database

---

## Quick Test Checklist

- [ ] **Test 1:** Unauthenticated user → Redirected to login (no crashes)
- [ ] **Test 2:** Missing restaurant ID → 400 error (not defaulting to restaurant 1)
- [ ] **Test 3:** Failed reservation → No orphaned customerRestaurant records
- [ ] **Test 4:** Successful reservation → Everything works correctly

---

## How to Check Database

If you want to verify database state:

```bash
# Connect to your local database
npm run db:studio

# Or use psql
psql YOUR_DATABASE_URL
```

### Useful Queries:
```sql
-- Check recent reservations
SELECT id, customer_id, restaurant_id, reservation_date, reservation_time, party_size, status 
FROM reservations 
ORDER BY created_at DESC 
LIMIT 10;

-- Check customer-restaurant links
SELECT cr.*, c.email, r.name as restaurant_name
FROM customer_restaurants cr
JOIN customers c ON cr.customer_id = c.id
JOIN restaurants r ON cr.restaurant_id = r.id
ORDER BY cr.created_at DESC
LIMIT 10;

-- Check customer email verification status
SELECT id, email, email_verified, first_name, last_name
FROM customers
ORDER BY created_at DESC
LIMIT 10;
```

---

## What to Look For

### ✅ Success Indicators:
- No 500 errors in backend logs
- No crashes or exceptions
- Proper error messages displayed
- Database remains consistent (no orphaned records)
- Successful reservations work as expected

### ❌ Failure Indicators:
- 500 errors in backend
- Crashes or unhandled exceptions
- Reservations created for wrong restaurant (ID 1)
- Orphaned customerRestaurant records after failed reservations
- Successful reservations fail to create

---

## Need Help?

If you encounter issues:
1. Check browser console for frontend errors
2. Check backend terminal for server errors
3. Verify customer is logged in and email is verified
4. Verify restaurant slug/ID is being passed correctly
5. Check database state using queries above

