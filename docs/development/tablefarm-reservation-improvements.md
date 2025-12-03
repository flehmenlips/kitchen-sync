# TableFarm Reservation System - Continued Implementation Plan

## Current State Assessment

### ✅ What's Working
- Basic reservation CRUD operations
- Reservation calendar view (week view)
- Reservation list/management page
- Reservation status management (CONFIRMED, CANCELLED, COMPLETED, NO_SHOW)
- Customer information capture
- Order association with reservations

### ❌ What's Missing
- **ReservationSettings** model exists in database but no API endpoints
- **TimeSlotCapacity** model exists but not integrated
- No capacity checking when creating reservations
- Hardcoded time slots (11:00-22:00, 30-min intervals)
- No operating hours integration
- No waitlist functionality
- No table management system
- No availability calculation based on capacity
- No reservation settings UI for restaurant managers

## Implementation Plan

### Phase 1: Reservation Settings & Capacity Management (Priority: High)

#### 1.1 Backend API - ReservationSettings
- [ ] Create `reservationSettingsController.ts`
- [ ] Create `reservationSettingsRoutes.ts`
- [ ] Implement GET `/api/reservation-settings/:restaurantId`
- [ ] Implement POST `/api/reservation-settings` (create/update)
- [ ] Add validation for operating hours JSON structure
- [ ] Add validation for time slot intervals

#### 1.2 Backend API - TimeSlotCapacity
- [ ] Create `timeSlotCapacityController.ts`
- [ ] Create `timeSlotCapacityRoutes.ts`
- [ ] Implement GET `/api/time-slot-capacity/:restaurantId`
- [ ] Implement POST `/api/time-slot-capacity` (bulk create/update)
- [ ] Implement DELETE `/api/time-slot-capacity/:id`
- [ ] Add endpoint to get capacity for specific date/time

#### 1.3 Capacity Checking Service
- [ ] Create `reservationCapacityService.ts`
- [ ] Implement `checkAvailability(date, time, partySize)` function
- [ ] Calculate current bookings for time slot
- [ ] Check against TimeSlotCapacity limits
- [ ] Check against ReservationSettings maxCoversPerSlot
- [ ] Handle overbooking logic if enabled
- [ ] Return available slots for a given date

#### 1.4 Integration with Reservation Creation
- [ ] Update `createReservation` to check capacity before creating
- [ ] Return error if capacity exceeded
- [ ] Add capacity information to reservation response

### Phase 2: Frontend - Reservation Settings Management (Priority: High)

#### 2.1 Reservation Settings UI Component
- [ ] Create `ReservationSettingsPage.tsx`
- [ ] Operating hours editor (day-by-day, open/close times)
- [ ] Time slot interval selector (15, 30, 60 minutes)
- [ ] Party size limits (min/max)
- [ ] Advance booking settings
- [ ] Cancellation policy editor
- [ ] Overbooking toggle and percentage
- [ ] Save/update functionality

#### 2.2 Time Slot Capacity Management UI
- [ ] Create `TimeSlotCapacityManager.tsx`
- [ ] Weekly view with time slots
- [ ] Capacity input per slot
- [ ] Bulk update functionality
- [ ] Copy settings from one day to another
- [ ] Visual indicators for capacity levels

### Phase 3: Enhanced Reservation Calendar (Priority: Medium)

#### 3.1 Dynamic Time Slot Generation
- [ ] Replace hardcoded time slots with ReservationSettings-based slots
- [ ] Filter slots based on operating hours
- [ ] Show only available slots based on capacity
- [ ] Visual indicators for capacity status (available, limited, full)

#### 3.2 Availability Display
- [ ] Show current bookings count per time slot
- [ ] Show capacity remaining
- [ ] Color coding: green (available), yellow (limited), red (full)
- [ ] Tooltip with detailed capacity info

#### 3.3 Reservation Creation Enhancement
- [ ] Check availability before showing time slot
- [ ] Disable full slots
- [ ] Show waitlist option for full slots
- [ ] Real-time availability updates

### Phase 4: Waitlist Functionality (Priority: Medium)

#### 4.1 Waitlist Model & API
- [ ] Create Waitlist model in schema (if not exists)
- [ ] Create waitlist controller
- [ ] Implement add to waitlist endpoint
- [ ] Implement notify when slot becomes available
- [ ] Auto-convert waitlist to reservation when available

#### 4.2 Waitlist UI
- [ ] Add to waitlist button for full slots
- [ ] Waitlist management page
- [ ] Notification system for available slots
- [ ] Quick conversion to reservation

### Phase 5: Table Management (Priority: Low - Future)

#### 5.1 Table Model & API
- [ ] Create Table model (if not exists)
- [ ] Table CRUD operations
- [ ] Table assignment to reservations
- [ ] Table status tracking (available, occupied, reserved, cleaning)

#### 5.2 Table Management UI
- [ ] Floor plan view
- [ ] Table assignment interface
- [ ] Table status indicators
- [ ] Drag-and-drop table assignment

## Technical Implementation Details

### ReservationSettings JSON Structure
```typescript
interface OperatingHours {
  [day: string]: {
    open: string;      // "17:00"
    close: string;     // "22:00"
    closed: boolean;   // true if restaurant closed this day
  };
}

// Example:
{
  "monday": { "open": "17:00", "close": "22:00", "closed": false },
  "tuesday": { "open": "17:00", "close": "22:00", "closed": false },
  "wednesday": { "closed": true },
  // ... etc
}
```

### Capacity Calculation Logic
```typescript
function checkAvailability(
  restaurantId: number,
  date: Date,
  timeSlot: string,
  partySize: number
): {
  available: boolean;
  currentBookings: number;
  capacity: number;
  remaining: number;
} {
  // 1. Get TimeSlotCapacity for dayOfWeek and timeSlot
  // 2. Get all reservations for date/timeSlot
  // 3. Sum party sizes of confirmed reservations
  // 4. Compare against capacity
  // 5. Check ReservationSettings.maxCoversPerSlot if no TimeSlotCapacity
  // 6. Apply overbooking percentage if enabled
}
```

### Time Slot Generation
```typescript
function generateTimeSlots(
  settings: ReservationSettings,
  date: Date
): string[] {
  const dayOfWeek = getDayOfWeek(date); // 0-6
  const daySettings = settings.operatingHours[dayOfWeek];
  
  if (daySettings.closed) return [];
  
  const slots: string[] = [];
  const interval = settings.timeSlotInterval; // 15, 30, or 60
  const start = parseTime(daySettings.open);
  const end = parseTime(daySettings.close);
  
  let current = start;
  while (current < end) {
    slots.push(formatTime(current));
    current = addMinutes(current, interval);
  }
  
  return slots;
}
```

## Database Schema Notes

### ReservationSettings
- Already exists in schema ✅
- Fields: operatingHours (JSON), timeSlotInterval, maxCoversPerSlot, etc.

### TimeSlotCapacity
- Already exists in schema ✅
- Fields: restaurantId, dayOfWeek, timeSlot, maxCovers, isActive

### Potential New Models
- **Waitlist**: customer info, requested date/time, party size, notified status
- **Table**: table number, capacity, location, status

## Success Metrics

- [ ] Restaurant managers can configure reservation settings
- [ ] Time slots dynamically generated from settings
- [ ] Capacity checking prevents overbooking
- [ ] Waitlist functionality operational
- [ ] 100% of reservations respect capacity limits
- [ ] UI shows real-time availability

## Next Steps

1. Start with Phase 1.1 - ReservationSettings API endpoints
2. Then Phase 1.2 - TimeSlotCapacity API endpoints
3. Then Phase 1.3 - Capacity checking service
4. Then Phase 1.4 - Integration with reservation creation
5. Move to Phase 2 - Frontend UI components

