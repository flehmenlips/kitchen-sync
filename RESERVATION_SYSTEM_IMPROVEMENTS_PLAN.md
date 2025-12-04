# Reservation System Improvements Plan

## Overview
This document outlines improvements to the reservation management system, focusing on backend enhancements and intuitive user flow improvements.

## Branch
`feature/reservation-calendar-improvements`

---

## Phase 1: Frontend Calendar Flow Improvements (Quick Wins)

### 1.1 Fix Month View Day Click Behavior
**Current Issue**: Clicking a day in month view opens create reservation dialog
**Desired Behavior**: Clicking a day should switch to day view for that date

**Implementation**:
- Modify `handleDateClick` in `ReservationCalendar.tsx` to check current view
- If in month view, switch to day view and set the clicked date
- If in day/week view, open create reservation dialog (current behavior)
- Add separate handler for "Create Reservation" button/action

**Files to Modify**:
- `frontend/src/components/tablefarm/ReservationCalendar.tsx`

**Changes**:
```typescript
const handleDateClick = (date: Date) => {
  if (view === 'month') {
    // Switch to day view for clicked date
    setCurrentDate(date);
    setView('day');
  } else {
    // In day/week view, open create reservation dialog
    setSelectedDate(date);
    setFormOpen(true);
  }
};
```

### 1.2 Add "Create Reservation" Button in Month View
**Enhancement**: Add a floating action button or header button to create reservations
- More intuitive than clicking empty space
- Clearer user intent

### 1.3 Improve Day View Navigation
**Enhancement**: 
- Add visual indicator when switching from month to day view
- Smooth transition animation
- Preserve month view context (show "Back to Month" button)

---

## Phase 2: Backend API Enhancements

### 2.1 Enhanced Reservation Filtering & Search
**Current Limitation**: Only supports `date` and `status` filters
**Enhancement**: Add comprehensive filtering capabilities

**New Query Parameters**:
- `startDate` / `endDate` - Date range filtering (replaces single `date`)
- `customerName` - Search by customer name (partial match, case-insensitive)
- `customerEmail` - Search by customer email
- `customerPhone` - Search by phone number
- `partySizeMin` / `partySizeMax` - Filter by party size range
- `restaurantId` - Explicit restaurant filter (if multi-restaurant user)
- `search` - General search across name, email, phone

**Implementation**:
- Update `getReservations` in `reservationController.ts`
- Add Prisma query building with proper filtering
- Maintain backward compatibility with existing `date` parameter

**Example API Call**:
```
GET /api/reservations?startDate=2025-01-01&endDate=2025-01-31&customerName=John&status=CONFIRMED
```

### 2.2 Pagination Support
**Current Limitation**: Returns all reservations (could be thousands)
**Enhancement**: Add pagination with metadata

**New Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50, max: 200)
- `sortBy` - Field to sort by (default: 'reservationDate')
- `sortOrder` - 'asc' or 'desc' (default: 'desc')

**Response Format**:
```json
{
  "data": [...reservations...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 234,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2.3 Reservation Statistics Endpoint
**New Endpoint**: `GET /api/reservations/stats`

**Purpose**: Provide aggregated statistics for dashboard/analytics

**Query Parameters**:
- `startDate` / `endDate` - Date range
- `restaurantId` - Optional restaurant filter
- `groupBy` - 'day', 'week', 'month' (default: 'day')

**Response**:
```json
{
  "totalReservations": 150,
  "confirmed": 120,
  "cancelled": 20,
  "pending": 10,
  "totalGuests": 450,
  "averagePartySize": 3.0,
  "byStatus": {
    "CONFIRMED": 120,
    "CANCELLED": 20,
    "PENDING": 10
  },
  "byDate": [
    {
      "date": "2025-01-15",
      "count": 12,
      "totalGuests": 36
    }
  ],
  "peakHours": [
    { "hour": "18:00", "count": 45 },
    { "hour": "19:00", "count": 38 }
  ]
}
```

### 2.4 Bulk Operations
**New Endpoints**:
- `PUT /api/reservations/bulk/status` - Bulk status update
- `DELETE /api/reservations/bulk` - Bulk delete

**Request Body**:
```json
{
  "reservationIds": [1, 2, 3, 4],
  "status": "CANCELLED"  // for status update
}
```

**Response**:
```json
{
  "success": true,
  "updated": 4,
  "failed": 0,
  "errors": []
}
```

### 2.5 Date Range Availability Endpoint
**Enhancement**: Extend availability endpoint to support date ranges

**New Endpoint**: `GET /api/reservations/availability-range/:restaurantId`

**Query Parameters**:
- `startDate` - Start of range
- `endDate` - End of range
- `partySize` - Party size to check

**Response**: Array of availability for each date in range

---

## Phase 3: Backend Data & Performance Improvements

### 3.1 Database Indexing
**Enhancement**: Add indexes for common query patterns

**Indexes to Add**:
- `reservationDate` + `reservationTime` (composite)
- `customerEmail` (for search)
- `customerName` (for search)
- `status` + `reservationDate` (composite)
- `restaurantId` + `reservationDate` (composite)

**Implementation**: Add to Prisma schema migrations

### 3.2 Reservation Query Optimization
**Enhancement**: 
- Use `select` to limit fields returned
- Add eager loading for commonly accessed relations
- Implement query result caching for frequently accessed dates

### 3.3 Customer Relationship Enhancement
**Enhancement**: Link reservations to customer records when email matches
- Auto-link existing customers
- Provide customer history in reservation details
- Show customer preferences/allergies in reservation view

---

## Phase 4: Advanced Features

### 4.1 Reservation Waitlist
**Feature**: Allow customers to join waitlist when time slot is full
- New status: `WAITLISTED`
- Auto-notify when slot becomes available
- Backend endpoint to manage waitlist

### 4.2 Reservation Recurring Patterns
**Feature**: Support recurring reservations (weekly, monthly)
- New table: `ReservationPattern`
- Generate future reservations automatically
- Allow editing/deleting entire series

### 4.3 Reservation Notes & History
**Enhancement**: 
- Track all changes to reservations (audit log)
- Internal notes separate from customer-facing notes
- Change history visible in reservation details

### 4.4 Email/SMS Notifications
**Enhancement**: 
- Reminder notifications (24h before)
- Status change notifications
- Custom notification templates
- SMS integration for urgent updates

---

## Phase 5: Frontend Integration

### 5.1 Enhanced Reservation List View
**Enhancement**: Update `ReservationManagementPage` to use new filtering
- Add search bar
- Date range picker
- Status filters
- Pagination controls

### 5.2 Reservation Dashboard
**New Component**: Dashboard showing key metrics
- Today's reservations count
- Upcoming reservations
- Cancellation rate
- Peak hours chart

### 5.3 Bulk Actions UI
**Enhancement**: Add UI for bulk operations
- Checkbox selection in list view
- Bulk status update dropdown
- Bulk delete with confirmation

---

## Implementation Priority

### High Priority (Do First)
1. ✅ Fix month view day click behavior (Phase 1.1)
2. Enhanced filtering & search (Phase 2.1)
3. Pagination support (Phase 2.2)
4. Database indexing (Phase 3.1)

### Medium Priority
5. Reservation statistics endpoint (Phase 2.3)
6. Date range queries (Phase 2.1)
7. Enhanced reservation list view (Phase 5.1)

### Low Priority (Future)
8. Bulk operations (Phase 2.4)
9. Waitlist feature (Phase 4.1)
10. Recurring reservations (Phase 4.2)

---

## Testing Strategy

### Unit Tests
- Test filtering logic with various combinations
- Test pagination edge cases
- Test date range queries

### Integration Tests
- Test API endpoints with real database
- Test multi-restaurant access control
- Test bulk operations

### E2E Tests
- Test calendar navigation flows
- Test reservation creation from different views
- Test filtering and search in UI

---

## Migration Notes

### Backward Compatibility
- Keep existing `date` parameter working
- Maintain current response format (add new fields, don't remove)
- Version API endpoints if breaking changes needed

### Database Migrations
- Add indexes (non-breaking)
- Consider adding new tables for advanced features
- Ensure migrations are reversible

---

## Success Metrics

- **Performance**: Reservation list loads in <500ms for 1000+ reservations
- **Usability**: Users can find reservations 50% faster with search/filter
- **Adoption**: 80% of users use new filtering features within 2 weeks
- **Reliability**: Zero data loss during bulk operations

---

## Next Steps

1. Start with Phase 1.1 (month view click fix) - immediate user value
2. Implement Phase 2.1 (enhanced filtering) - backend foundation
3. Add Phase 2.2 (pagination) - performance improvement
4. Continue with remaining phases based on user feedback

