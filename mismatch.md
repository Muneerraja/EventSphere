# Backend Model vs Frontend Mock Data Mismatch Analysis

This document compares backend model schemas with frontend mock data structures to identify inconsistencies that need to be resolved for proper data integration.

## 1. User Model Mismatch

### Backend User Schema
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required),
  role: ['admin', 'organizer', 'exhibitor', 'attendee'] (default: attendee),
  isVerified: Boolean (default: false),
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profile: {
    firstName: String,
    lastName: String,
    company: String,
    phone: String,
    bio: String
  },
  createdAt: Date (default: now)
}
```

### Frontend Mock Data Examples
- **Expos.jsx**: `{ organizer: { username: 'techcorp' } }` - Missing email, role, profile object
- **AttendeeDashboard.jsx**: Custom profile object with avatar URL, interests array, etc. - Doesn't match backend profile schema
- **AdminDashboard.jsx**: No user data integration

**Issues**: Profile structure mismatch, missing fields like isVerified, createdAt; incorrect data types

## 2. Expo Model Mismatch

### Backend Expo Schema
```javascript
{
  title: String (required),
  date: Date (required),
  location: String (required),
  description: String,
  theme: String,
  image: String,
  floorPlan: [{
    boothId: String (required),
    position: { x: Number, y: Number },
    size: { width: Number, height: Number },
    available: Boolean (default: true),
    assignedTo: ObjectId (ref: Exhibitor)
  }],
  organizer: ObjectId (ref: User, required),
  createdAt: Date (default: now)
}
```

### Frontend Mock Data (Expos.jsx)
```javascript
{
  _id: '1', // Should be ObjectId
  title: 'Tech Innovation Expo 2025',
  date: '2025-03-15T10:00:00Z', // String instead of Date
  location: 'Las Vegas Convention Center',
  description: '...',
  theme: 'Technology',
  organizer: { username: 'techcorp' } // Should be ObjectId ref
}
```

**Issues**: Missing floorPlan array, incorrect organizer format (needs to be ObjectId), date as string instead of Date object, no createdAt field

## 3. Attendee Model Mismatch

### Backend Attendee Schema
```javascript
{
  user: ObjectId (ref: User, required),
  registeredExpos: [ObjectId (ref: Expo)],
  bookmarkedSessions: [ObjectId (ref: Session)],
  createdAt: Date (default: now)
}
```

### Frontend Mock Data (AttendeeDashboard.jsx)
```javascript
// Missing Attendee model integration entirely
// Uses custom profile with avatar, interests, etc.
// Custom registeredEvents structure with session counts
```

**Issues**: No Attendee collection integration, data scattered across user profile, incorrect structure for registered expos and bookmarked sessions

## 4. Exhibitor Model Mismatch

### Backend Exhibitor Schema
```javascript
{
  user: ObjectId (ref: User, required),
  company: String (required),
  products: [String],
  logo: String,
  contact: String,
  description: String,
  status: ['pending', 'approved', 'rejected'] (default: pending),
  expoApplication: ObjectId (ref: Expo),
  booths: [ObjectId (ref: Booth)],
  createdAt: Date (default: now)
}
```

### Frontend Mock Data
- **No exhibitor pages reviewed yet**, but likely missing entirely
- Booth management disconnected from exhibitor profiles

**Issues**: Missing exhibitor data integration, no relationship to users or booths

## 5. Booth Model Mismatch

### Backend Booth Schema
```javascript
{
  expo: ObjectId (ref: Expo, required),
  exhibitor: ObjectId (ref: Exhibitor, required),
  space: String,
  products: [String],
  contact: String,
  createdAt: Date (default: now)
}
```

### Frontend Mock Data
- **No booth data in reviewed pages**

**Issues**: Complete disconnect from backend booth model

## 6. Session Model Mismatch

### Backend Session Schema
```javascript
{
  expo: ObjectId (ref: Expo, required),
  title: String (required),
  time: Date (required),
  speaker: ObjectId (ref: User),
  topic: String,
  location: String,
  ratings: [{
    user: ObjectId (ref: User),
    score: Number,
    comment: String
  }],
  attendance: [ObjectId (ref: User)],
  materials: [String],
  createdAt: Date (default: now)
}
```

### Frontend Mock Data (AttendeeDashboard.jsx)
```javascript
{
  id: 's1', // Should be _id with ObjectId
  title: 'AI Revolution...',
  expoTitle: 'Tech Conference 2025',
  time: '2025-12-15T10:00:00Z', // String format
  speaker: 'Dr. Amna Hassan', // Should be ObjectId ref
  category: 'AI & Machine Learning',
}
```

**Issues**: Missing relationships, incorrect field names, ratings and attendance not structured properly

## 7. Message Model Mismatch

### Backend Message Schema
```javascript
{
  sender: ObjectId (ref: User, required),
  receiver: ObjectId (ref: User, required),
  conversationId: String (generated from user IDs),
  content: String (required),
  type: ['text', 'appointment_request', 'system'] (default: text),
  read: Boolean (default: false),
  createdAt: Date (default: now)
}
```

### Frontend Mock Data
- **MessagesCenter.jsx not reviewed**, but likely missing message collection integration

**Issues**: No conversation management, missing type and read status

## 8. Feedback Model Mismatch

### Backend Feedback Schema
```javascript
{
  user: ObjectId (ref: User, required),
  type: ['suggestion', 'issue'],
  message: String (required),
  date: Date (default: now)
}
```

### Frontend Mock Data
- **No feedback integration in reviewed pages**

**Issues**: Complete disconnection from feedback system

## 9. Notification Model Mismatch

### Backend Notification Schema
```javascript
{
  user: ObjectId (ref: User, required),
  type: String,
  message: String (required),
  read: Boolean (default: false),
  createdAt: Date (default: now)
}
```

### Frontend Mock Data (AttendeeDashboard.jsx)
```javascript
{
  id: 'n1',
  type: 'session_reminder',
  message: '...',
  time: '1 hour ago', // Should be createdAt field
  read: false
}
```

**Issues**: Missing user reference, time field format incorrect

## 10. Identified Mismatches in Frontend Pages

### Pages with Proper Data Alignment:
- **Homepage.jsx** - No mock data issues
- **About.jsx** - No mock data issues
- **Expos.jsx** - Proper data structure from dummydata.js
- **Contact.jsx** - No mock data issues
- **Auth.jsx** - Proper structure for authentication
- **Dashboard.jsx** - Correct routing structure
- **MessagesCenter.jsx** - Uses correct data structure from dummydata.js
- **SessionDetails.jsx** - Proper data structure from dummydata.js
- **AdminDashboard.jsx** - Uses correct data structure from dummydata.js
- **UserManagement.jsx** - Proper API integration
- **OrganizerDashboard.jsx** - Proper data structure
- **MyExpos.jsx** - Proper API integration
- **ExhibitorDashboard.jsx** - Proper data structure
- **MyBooths.jsx** - Proper API integration
- **AttendeeDashboard.jsx** - Proper data structure from dummydata.js

### Pages with Data Model Misalignment - **RESOLVED** ✅

#### **CRITICAL DATA MODEL ALIGNMENT - COMPLETED:**
- ✅ **IndividualExpoPage.jsx** - **FIXED**: Now uses proper Expo/Exhibitor/Session models with ObjectIDs, floorPlan arrays, Date objects
- ✅ **ExhibitorSearch.jsx** - **FIXED**: Now uses Exhibitor model with user refs, status, booth assignments
- ✅ **Accounts.jsx** - **FIXED**: Now uses User model with profile{firstName,lastName,phone} subdocument
- ✅ **AnalyticsDashboard.jsx** - **FIXED**: Now matches analyticsController.js structures (attendee engagement, session analytics, booth traffic)

#### **SYSTEM CONFIGURATION PAGES (Not Data Model Issues):**
- **SystemSettings.jsx** - Platform configuration (SMTP, security, appearance) - PART OF SYSTEM ADMIN
- **ApprovalsManagement.jsx** - Admin approval interface - USES APPROVED/REJECTED EXHIBITOR MODEL
- **ExhibitorsManagement.jsx** - Admin exhibitor CRUD - USES EXHIBITOR MODEL
- **SessionsManagement.jsx** - Admin session CRUD - USES SESSION MODEL WITH RATINGS/ATTENDANCE
- **CreateExpo.jsx** - Organizer expo creation form - USES EXPO MODEL WITH FLOOR PLAN
- **ApplyForExos.jsx** - Exhibitor application form - USES EXHIBITOR MODEL APPLICATION FLOW
- **ExhibitorProfile.jsx** - Exhibitor profile display - USES EXHIBITOR MODEL
- **EventDiscovery.jsx** - Attendee expo browsing - USES EXPO + ATTENDEE MODELS
- **MyEvents.jsx** - Attendee events management - USES ATTENDEE + USER MODELS

**NOTE**: Remaining pages are system interfaces that follow the already-corrcet data models. They are not misaligned.

## Critical Integration Issues

### 1. Relationship Management
- **Frontend**: Uses inline objects and denormalized data
- **Backend**: Uses ObjectId references for relationships
- **Impact**: Data integrity lost, updates don't propagate

### 2. ID System Inconsistency
- **Frontend**: String IDs or no IDs in mock data
- **Backend**: MongoDB ObjectId system
- **Impact**: Cannot link related entities properly

### 3. Date Handling
- **Frontend**: Mix of string formats, no ISO standard
- **Backend**: Proper Date objects
- **Impact**: Sorting, filtering, and timezone issues

### 4. Missing Collections
- **Frontend**: Doesn't account for Attendees, Exhibitors, Booths, Messages, Feedback collections
- **Backend**: Core business logic built around these entities
- **Impact**: Essential features broken (registrations, messaging, booth assignments)

### 5. Authentication Integration
- **Frontend**: Mock data disconnected from user sessions
- **Backend**: User-based permissions and data filtering
- **Impact**: Security model ineffective, personalization impossible

## Required Changes Summary

1. **Replace all mock data** with structures matching dummydata.js exactly
2. **Implement proper relationships** using ObjectId references
3. **Standardize date formats** to ISO strings/Date objects
4. **Add missing model integrations** (Attendees, Exhibitors, Booths, Messages)
5. **Fix field naming** and data types to match backend schemas
6. **Connect authentication** context to all data operations
