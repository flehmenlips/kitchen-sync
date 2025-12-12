# Website Builder & TableFarm Reservation System Integration Plan

## Executive Summary

This plan outlines comprehensive improvements to integrate the TableFarm reservation system with the Website Builder module, creating a seamless, market-ready reservation booking experience for restaurant customers. The integration will enhance the existing reservation widget in content blocks, add real-time availability checking, improve the booking flow, and provide better management tools for restaurant staff.

## Current State Assessment

### ✅ What's Working
- Basic reservation CRUD operations via `/api/customer/reservations`
- Reservation widget exists in ContentBlockRenderer but only logs to console
- Customer reservation page (`CustomerReservationPage.tsx`) with full booking flow
- Reservation settings API endpoints exist (`/api/reservation-settings`)
- Time slot capacity management exists (`/api/time-slot-capacity`)
- Daily capacity checking implemented
- Customer authentication system in place
- Website builder content block system functional

### ❌ What's Missing or Needs Improvement
- **Reservation Widget Integration**: Widget in ContentBlockRenderer doesn't connect to API
- **Real-time Availability**: No live availability checking in embedded widgets
- **Time Slot Display**: Widget uses basic time input instead of dynamic slots
- **Capacity Indicators**: No visual feedback for slot availability
- **Error Handling**: Limited error handling in widget
- **Loading States**: No loading indicators during API calls
- **Success Feedback**: No confirmation UI after booking
- **Widget Customization**: Limited customization options for different themes
- **Mobile Optimization**: Widget may not be fully responsive
- **Integration Testing**: No end-to-end testing of widget → API flow

## Goals & Objectives

### Primary Goals
1. **Functional Integration**: Connect reservation widget to actual booking API
2. **Real-time Availability**: Show live availability for time slots
3. **Enhanced UX**: Improve booking flow with better feedback and error handling
4. **Market Readiness**: Make the system production-ready for customer use
5. **Consistency**: Ensure widget matches the quality of standalone reservation page

### Success Metrics
- [ ] 100% of reservation widget submissions successfully create reservations
- [ ] Real-time availability displayed for all time slots
- [ ] <2 second response time for availability checks
- [ ] Zero critical errors in widget booking flow
- [ ] Mobile-responsive design on all devices
- [ ] Consistent styling with restaurant branding

## Implementation Plan

### Phase 1: Core Widget Integration (Priority: Critical)

#### 1.1 Connect Widget to Reservation API
**Files to Modify:**
- `frontend/src/components/customer/ContentBlockRenderer.tsx` (lines 2528-2647)

**Tasks:**
- [ ] Import `customerReservationService` from `../../services/customerReservationService`
- [ ] Import `restaurantSettingsService` to get reservation settings
- [ ] Replace `console.log` in `handleSubmit` with actual API call
- [ ] Add proper error handling with user-friendly messages
- [ ] Add loading state during submission
- [ ] Add success confirmation UI after booking
- [ ] Handle authentication requirements (redirect to login if needed)

**Implementation Details:**
```typescript
// Replace handleSubmit with:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setError(null);
  
  try {
    const restaurantSlug = getCurrentRestaurantSlug();
    const response = await customerReservationService.createReservation({
      reservationDate: formData.date,
      reservationTime: formData.time,
      partySize: formData.partySize,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      restaurantSlug: restaurantSlug || undefined
    });
    
    setSuccess(true);
    setConfirmationData(response.reservation);
    // Reset form after delay
    setTimeout(() => {
      setSuccess(false);
      setFormData({ date: '', time: '', partySize: defaultPartySize, name: '', email: '', phone: '' });
    }, 5000);
  } catch (error: any) {
    setError(error.response?.data?.message || 'Failed to create reservation. Please try again.');
  } finally {
    setSubmitting(false);
  }
};
```

#### 1.2 Add Loading and Error States
**Tasks:**
- [ ] Add `submitting`, `error`, `success` state variables
- [ ] Display loading spinner on submit button during API call
- [ ] Show error message below form if submission fails
- [ ] Show success message with confirmation details
- [ ] Disable form inputs during submission

#### 1.3 Add Authentication Handling
**Tasks:**
- [ ] Check if user is authenticated before allowing submission
- [ ] Show login prompt if user is not authenticated
- [ ] Optionally allow guest reservations if supported
- [ ] Handle token refresh if needed

### Phase 2: Dynamic Time Slot Integration (Priority: High)

#### 2.1 Replace Time Input with Dynamic Slots
**Files to Modify:**
- `frontend/src/components/customer/ContentBlockRenderer.tsx`

**Tasks:**
- [ ] Fetch reservation settings to get operating hours and time slot interval
- [ ] Generate time slots dynamically based on selected date
- [ ] Replace `<TextField type="time">` with button grid of available slots
- [ ] Filter slots based on operating hours for selected day
- [ ] Handle restaurant closed days (disable date picker or show message)

**Implementation Details:**
```typescript
// Add state for time slots
const [timeSlots, setTimeSlots] = useState<string[]>([]);
const [loadingSlots, setLoadingSlots] = useState(false);

// Fetch time slots when date changes
useEffect(() => {
  if (!formData.date) {
    setTimeSlots([]);
    return;
  }
  
  const fetchTimeSlots = async () => {
    setLoadingSlots(true);
    try {
      // Get restaurant settings for operating hours
      const settings = await restaurantSettingsService.getRestaurantSettings();
      const reservationSettings = settings.reservationSettings;
      
      // Generate slots based on operating hours and interval
      const slots = generateTimeSlots(formData.date, reservationSettings);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };
  
  fetchTimeSlots();
}, [formData.date]);
```

#### 2.2 Add Time Slot Generation Utility
**Files to Create:**
- `frontend/src/utils/timeSlotGenerator.ts` (or add to existing utils)

**Tasks:**
- [ ] Create `generateTimeSlots(date, reservationSettings)` function
- [ ] Parse operating hours for selected day of week
- [ ] Generate slots based on `timeSlotInterval` (15, 30, or 60 minutes)
- [ ] Return array of time strings in "HH:MM" format
- [ ] Handle edge cases (midnight crossover, closed days)

### Phase 3: Real-time Availability Display (Priority: High)

#### 3.1 Integrate Availability API
**Files to Modify:**
- `frontend/src/components/customer/ContentBlockRenderer.tsx`

**Tasks:**
- [ ] Import `customerReservationService.getTimeSlotAvailability` (if exists) or create it
- [ ] Fetch availability when date or party size changes
- [ ] Store availability data in state
- [ ] Display availability indicators on time slot buttons

**Implementation Details:**
```typescript
// Add availability state
const [slotAvailability, setSlotAvailability] = useState<Map<string, {
  available: boolean;
  remaining: number | null;
  canAccommodate: boolean;
}>>(new Map());

// Fetch availability
useEffect(() => {
  if (!formData.date || !formData.partySize) return;
  
  const fetchAvailability = async () => {
    try {
      const response = await customerReservationService.getTimeSlotAvailability({
        date: formData.date,
        partySize: formData.partySize,
        restaurantSlug: getCurrentRestaurantSlug() || undefined
      });
      
      const availabilityMap = new Map();
      response.timeSlots.forEach((slot: any) => {
        availabilityMap.set(slot.timeSlot, {
          available: slot.available,
          remaining: slot.remaining,
          canAccommodate: slot.canAccommodate
        });
      });
      setSlotAvailability(availabilityMap);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };
  
  fetchAvailability();
}, [formData.date, formData.partySize]);
```

#### 3.2 Visual Availability Indicators
**Tasks:**
- [ ] Color-code time slot buttons:
  - Green: Available with capacity
  - Yellow: Limited availability (< 3 slots remaining)
  - Red: Fully booked
  - Gray: Unavailable (restaurant closed)
- [ ] Add tooltips showing remaining capacity
- [ ] Disable fully booked slots
- [ ] Show loading spinner while fetching availability

#### 3.3 Add Availability API Endpoint (if missing)
**Files to Check/Create:**
- `backend/src/controllers/customerReservationController.ts`
- `frontend/src/services/customerReservationService.ts`

**Tasks:**
- [ ] Verify `getPublicTimeSlotAvailability` endpoint exists
- [ ] If missing, create endpoint that returns availability for date/party size
- [ ] Include capacity information, remaining slots, and availability status
- [ ] Add frontend service method to call this endpoint

### Phase 4: Enhanced User Experience (Priority: Medium)

#### 4.1 Improved Form Validation
**Tasks:**
- [ ] Add client-side validation for all fields
- [ ] Validate email format
- [ ] Validate phone number format
- [ ] Ensure date is not in the past
- [ ] Ensure date is within advance booking window
- [ ] Show validation errors inline
- [ ] Disable submit button until form is valid

#### 4.2 Better Success Experience
**Tasks:**
- [ ] Show confirmation dialog/modal after successful booking
- [ ] Display reservation confirmation number
- [ ] Show reservation details (date, time, party size)
- [ ] Provide option to add to calendar
- [ ] Show "Book Another" button
- [ ] Auto-dismiss success message after 5 seconds

#### 4.3 Enhanced Error Handling
**Tasks:**
- [ ] Catch and display specific error messages from API
- [ ] Handle network errors gracefully
- [ ] Show retry option for failed submissions
- [ ] Log errors for debugging
- [ ] Provide helpful error messages (e.g., "This time slot is no longer available")

#### 4.4 Loading States
**Tasks:**
- [ ] Show loading spinner on submit button
- [ ] Disable form during submission
- [ ] Show loading state while fetching time slots
- [ ] Show loading state while fetching availability
- [ ] Use skeleton loaders for better perceived performance

### Phase 5: Widget Customization & Theming (Priority: Medium)

#### 5.1 Theme Implementation
**Files to Modify:**
- `frontend/src/components/customer/ContentBlockRenderer.tsx`

**Tasks:**
- [ ] Implement `theme` setting (light, dark, accent)
- [ ] Apply theme colors to form elements
- [ ] Style buttons based on theme
- [ ] Ensure contrast and accessibility
- [ ] Match restaurant branding colors if available

**Implementation Details:**
```typescript
const themeStyles = {
  light: {
    paper: { bgcolor: 'background.paper' },
    button: 'primary',
    text: 'text.primary'
  },
  dark: {
    paper: { bgcolor: 'grey.900', color: 'white' },
    button: 'secondary',
    text: 'white'
  },
  accent: {
    paper: { bgcolor: 'primary.main', color: 'white' },
    button: 'secondary',
    text: 'white'
  }
};
```

#### 5.2 Widget Configuration Options
**Tasks:**
- [ ] Make `showAvailability` setting functional
- [ ] Hide/show availability indicators based on setting
- [ ] Allow customization of default party size
- [ ] Add option to show/hide phone field
- [ ] Add option to require phone number
- [ ] Add custom submit button text

#### 5.3 Responsive Design Improvements
**Tasks:**
- [ ] Ensure widget is fully responsive on mobile
- [ ] Test on various screen sizes (320px to 1920px+)
- [ ] Optimize touch targets for mobile
- [ ] Improve date/time picker UX on mobile
- [ ] Test form layout on tablets

### Phase 6: Integration with Customer Portal (Priority: Low)

#### 6.1 Link to Customer Account
**Tasks:**
- [ ] If user is logged in, pre-fill name and email
- [ ] Show link to view existing reservations
- [ ] Allow editing/canceling reservations from widget context
- [ ] Show reservation history if applicable

#### 6.2 Guest vs Authenticated Flow
**Tasks:**
- [ ] Determine if guest reservations are allowed
- [ ] Handle guest booking flow differently
- [ ] Require email verification for guest bookings
- [ ] Provide option to create account after booking

### Phase 7: Testing & Quality Assurance (Priority: Critical)

#### 7.1 Unit Tests
**Files to Create:**
- `frontend/src/components/customer/__tests__/ContentBlockRenderer.test.tsx`

**Tasks:**
- [ ] Test reservation widget rendering
- [ ] Test form submission with valid data
- [ ] Test error handling
- [ ] Test time slot generation
- [ ] Test availability fetching
- [ ] Test theme application

#### 7.2 Integration Tests
**Tasks:**
- [ ] Test full booking flow: widget → API → database
- [ ] Test availability updates in real-time
- [ ] Test error scenarios (network failures, API errors)
- [ ] Test authentication flow
- [ ] Test with different reservation settings

#### 7.3 E2E Tests
**Tasks:**
- [ ] Test complete user journey: visit page → select date/time → fill form → submit → receive confirmation
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Test with different restaurant configurations

#### 7.4 Performance Testing
**Tasks:**
- [ ] Measure API response times
- [ ] Test with high availability check frequency
- [ ] Optimize re-renders
- [ ] Test with slow network conditions
- [ ] Ensure no memory leaks

### Phase 8: Documentation & Deployment (Priority: Medium)

#### 8.1 Code Documentation
**Tasks:**
- [ ] Add JSDoc comments to all new functions
- [ ] Document component props and state
- [ ] Document API integration points
- [ ] Update README with widget usage

#### 8.2 User Documentation
**Tasks:**
- [ ] Create guide for adding reservation widget to pages
- [ ] Document widget configuration options
- [ ] Create troubleshooting guide
- [ ] Add FAQ section

#### 8.3 Deployment Checklist
**Tasks:**
- [ ] Verify all API endpoints are deployed
- [ ] Test in staging environment
- [ ] Verify database migrations (if any)
- [ ] Check environment variables
- [ ] Monitor error rates after deployment
- [ ] Set up error tracking (Sentry, etc.)

## Technical Architecture

### Component Structure
```
ContentBlockRenderer
└── renderReservationWidgetBlock()
    ├── Form State Management (useState)
    ├── Time Slot Generation (useEffect + utility)
    ├── Availability Fetching (useEffect + API)
    ├── Form Submission Handler (API call)
    └── UI Rendering
        ├── Date Picker
        ├── Time Slot Grid (dynamic)
        ├── Party Size Selector
        ├── Customer Info Fields
        ├── Submit Button (with loading state)
        └── Error/Success Messages
```

### Data Flow
```
User Interaction
  ↓
Widget Component
  ↓
API Service Layer (customerReservationService)
  ↓
Backend Controller (customerReservationController)
  ↓
Service Layer (reservationCapacityService)
  ↓
Database (Prisma)
  ↓
Response back through chain
  ↓
UI Update
```

### API Endpoints Used
- `POST /api/customer/reservations` - Create reservation
- `GET /api/customer/reservations/time-slot-availability` - Get availability (if exists)
- `GET /api/restaurant/public/slug/:slug/settings` - Get restaurant settings
- `GET /api/reservation-settings/:restaurantId` - Get reservation settings

## Risk Assessment & Mitigation

### Risks
1. **API Availability**: Widget depends on backend API being available
   - *Mitigation*: Add retry logic, show graceful error messages
2. **Performance**: Frequent availability checks could slow down page
   - *Mitigation*: Debounce API calls, cache results, use loading states
3. **Authentication**: Widget may need customer authentication
   - *Mitigation*: Handle both authenticated and guest flows
4. **Browser Compatibility**: Date/time pickers vary by browser
   - *Mitigation*: Use Material-UI components, test on all browsers
5. **Mobile UX**: Form may be difficult to use on small screens
   - *Mitigation*: Mobile-first design, test on real devices

## Timeline Estimate

- **Phase 1**: 2-3 days (Core Integration)
- **Phase 2**: 2-3 days (Dynamic Time Slots)
- **Phase 3**: 2-3 days (Availability Display)
- **Phase 4**: 2-3 days (UX Enhancements)
- **Phase 5**: 1-2 days (Theming)
- **Phase 6**: 1-2 days (Customer Portal Integration)
- **Phase 7**: 3-4 days (Testing)
- **Phase 8**: 1-2 days (Documentation)

**Total Estimate**: 14-22 days

## Dependencies

### External Dependencies
- Material-UI components (already in use)
- date-fns (already in use)
- React hooks (useState, useEffect)
- Axios for API calls (already in use)

### Internal Dependencies
- `customerReservationService` must be functional
- `restaurantSettingsService` must be functional
- Reservation settings API must be available
- Time slot capacity API must be available
- Customer authentication system must be working

## Success Criteria

### Must Have (MVP)
- [ ] Widget successfully creates reservations via API
- [ ] Time slots are dynamically generated
- [ ] Basic error handling works
- [ ] Form validation prevents invalid submissions
- [ ] Success confirmation is shown

### Should Have (Enhanced)
- [ ] Real-time availability display
- [ ] Visual availability indicators
- [ ] Loading states throughout
- [ ] Theme customization works
- [ ] Mobile-responsive design

### Nice to Have (Future)
- [ ] Advanced theming options
- [ ] Guest reservation support
- [ ] Calendar integration
- [ ] Email notifications
- [ ] Reservation management from widget

## Next Steps

1. **Review & Approve Plan**: Get stakeholder approval
2. **Set Up Branch**: Already done (`feature/tablefarm-integration-improvements`)
3. **Start Phase 1**: Begin with core widget integration
4. **Iterate**: Complete phases sequentially, testing as we go
5. **Deploy**: Deploy to staging for testing before production

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-27  
**Author**: AI Assistant  
**Status**: Ready for Implementation
