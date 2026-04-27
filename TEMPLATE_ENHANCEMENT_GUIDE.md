# Template Enhancement Guide for EasyPG

## Overview
This document outlines how to enhance all EasyPG templates to work with the newly implemented API routes.

## Required Script Inclusions

All pages should include in this order:
```html
<!-- API Utilities (load first) -->
<script src="/static/js/api.js"></script>

<!-- Page-specific scripts -->
<script src="/static/js/main.js"></script>

<!-- Feature-specific scripts (as needed per page) -->
<script src="/static/js/auth.js"></script>
<script src="/static/js/messages.js"></script>
<script src="/static/js/bookings.js"></script>
<script src="/static/js/reviews.js"></script>
<script src="/static/js/payments.js"></script>
<script src="/static/js/profile.js"></script>
<script src="/static/js/search.js"></script>
<script src="/static/js/dashboard.js"></script>
```

## Template Updates Required

### 1. index.html (Already Complete)
- ✅ Has proper navigation
- ✅ Links to login and search
- ✅ Responsive design
- **Add:** Include api.js and main.js scripts
- **Update:** Search button to use `searchPGs()` function from main.js

### 2. login.html
**Required Functionality:**
- Registration and Login forms
- User type selection (student/owner/admin)
- Form validation
- Token storage and redirect

**Scripts to include:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/auth.js"></script>
```

**Form Structure Needed:**
```html
<!-- Login Mode -->
<form class="login-form" onsubmit="handleLogin(event)">
    <input type="email" id="email" required />
    <input type="password" id="password" required />
    <select id="userType" required>
        <option value="">Select User Type</option>
        <option value="student">Student</option>
        <option value="owner">PG Owner</option>
    </select>
    <button type="submit">Login</button>
</form>

<!-- Signup Mode -->
<form class="signup-form" style="display:none;" onsubmit="handleSignup(event)">
    <input type="email" id="signupEmail" required />
    <input type="password" id="signupPassword" required />
    <input type="text" id="fullName" required />
    <input type="tel" id="phone" required />
    <select id="signupUserType" required>
        <option value="">Select User Type</option>
        <option value="student">Student</option>
        <option value="owner">PG Owner</option>
    </select>
    <button type="submit">Sign Up</button>
</form>
```

### 3. dashboard.html
**Required Functionality:**
- Display user-specific statistics
- Show recent properties/applications
- Navigation to other pages
- Responsive sidebar

**Scripts to include:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/main.js"></script>
<script src="/static/js/dashboard.js"></script>
```

**Elements Needed:**
```html
<!-- Stats section that will be populated by dashboard.js -->
<div class="stats-container" id="statsContainer">
    <!-- Stats will be populated here -->
</div>

<!-- Recent items section -->
<div class="recent-section">
    <h2>Recent Items</h2>
    <div class="recent-list" id="recentList">
        <!-- Items will be populated by dashboard.js -->
    </div>
</div>
```

### 4. search.html
**Required Functionality:**
- Search and filter properties
- Display search results
- Save/unsave properties
- Property details modal

**Scripts to include:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/main.js"></script>
<script src="/static/js/search.js"></script>
```

**Elements Needed:**
```html
<!-- Search filters -->
<div class="search-filters">
    <input type="text" id="cityInput" placeholder="City" />
    <input type="number" id="minRent" placeholder="Min Rent" />
    <input type="number" id="maxRent" placeholder="Max Rent" />
    <select id="propertyType">
        <option value="">Property Type</option>
        <option value="boys_pg">Boys PG</option>
        <option value="girls_pg">Girls PG</option>
        <option value="co_living">Co-living</option>
    </select>
    <button onclick="searchProperties()">Search</button>
</div>

<!-- Results grid -->
<div class="properties-grid" id="propertiesGrid">
    <!-- Results will be populated here -->
</div>
```

### 5. profile.html
**Required Functionality:**
- Display user profile
- Edit profile information
- Change password
- Download data
- Delete account

**Scripts to include:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/main.js"></script>
<script src="/static/js/profile.js"></script>
```

**Elements Needed:**
```html
<!-- Profile tabs -->
<div class="profile-tabs">
    <button class="profile-tab" data-section="edit" onclick="showProfileSection('edit')">
        <i class="fas fa-edit"></i> Edit Profile
    </button>
    <button class="profile-tab" data-section="password" onclick="showProfileSection('password')">
        <i class="fas fa-lock"></i> Change Password
    </button>
    <button class="profile-tab" data-section="data" onclick="showProfileSection('data')">
        <i class="fas fa-database"></i> Data & Privacy
    </button>
</div>

<!-- Edit profile form -->
<div id="editSection" class="profile-section">
    <form class="profile-form" onsubmit="updateProfile(event)">
        <input type="text" id="fullName" required />
        <input type="tel" id="phone" required />
        <button type="submit">Save Changes</button>
    </form>
</div>

<!-- Password change form -->
<div id="passwordSection" class="profile-section">
    <form class="password-form" onsubmit="changePassword(event)">
        <input type="password" id="currentPassword" required />
        <input type="password" id="newPassword" required />
        <input type="password" id="confirmPassword" required />
        <button type="submit">Change Password</button>
    </form>
</div>
```

### 6. messages.html
**Required Functionality:**
- List conversations
- Display conversation thread
- Send messages
- Search conversations

**Scripts to include:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/main.js"></script>
<script src="/static/js/messages.js"></script>
```

**Elements Needed:**
```html
<div class="messages-container">
    <!-- Conversations sidebar -->
    <aside class="conversations-sidebar">
        <input type="text" class="search-conversations" placeholder="Search..." />
        <div class="conversation-list">
            <!-- Populated by messages.js -->
        </div>
    </aside>

    <!-- Chat area -->
    <section class="chat-area">
        <div class="messages-header"></div>
        <div class="messages-list"></div>
        <form class="message-form" onsubmit="sendMessage(event)">
            <input type="text" class="message-input" />
            <button type="submit" class="send-message-btn">Send</button>
        </form>
    </section>
</div>
```

### 7. payments.html
**Required Functionality:**
- Display payment history
- Initiate payments
- Show payment status
- Download receipts

**Scripts to include:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/main.js"></script>
<script src="/static/js/payments.js"></script>
<script src="/static/js/bookings.js"></script>
```

**Elements Needed:**
```html
<div class="payments-container">
    <div class="payments-list">
        <!-- Payments will be populated here -->
    </div>
</div>

<!-- Payment Modal -->
<div id="paymentModal" class="modal">
    <div class="modal-content">
        <div class="payment-form"></div>
    </div>
</div>

<!-- Payment Details Modal -->
<div id="paymentDetailsModal" class="modal">
    <div class="modal-content"></div>
</div>
```

### 8. saved.html
**Required Functionality:**
- Display saved properties
- Remove from saved
- Compare properties
- Filter/sort saved properties

**Scripts to include:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/main.js"></script>
<script src="/static/js/saved.js"></script>
```

**Elements Needed:**
```html
<div class="saved-properties-container">
    <div class="controls">
        <input type="text" data-search="saved-properties" placeholder="Search saved..." />
        <select data-filter="saved-properties">
            <option value="">Sort By</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
        </select>
    </div>

    <div class="saved-grid">
        <!-- Saved properties will be populated here -->
    </div>
</div>
```

### 9. list-property.html (For Owners)
**Required Functionality:**
- Create new property listing
- Upload property images
- Set amenities and pricing
- Submit for approval

**Scripts to include:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/main.js"></script>
```

**Form Structure Needed:**
```html
<form class="property-form" onsubmit="createProperty(event)">
    <input type="text" id="propertyName" required />
    <select id="propertyType" required>
        <option value="">Select Type</option>
        <option value="boys_pg">Boys PG</option>
        <option value="girls_pg">Girls PG</option>
    </select>
    <input type="text" id="address" required />
    <input type="text" id="city" required />
    <input type="number" id="rentPerMonth" required />
    <input type="number" id="totalRooms" required />
    <input type="number" id="availableRooms" required />
    <!-- More fields... -->
    <button type="submit">Create Property</button>
</form>
```

### 10. settings.html
**Required Functionality:**
- Application settings
- Notification preferences
- Privacy settings
- Account management

**Scripts to include:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/main.js"></script>
```

## CSS Classes Required

The JavaScript files expect these CSS classes. Add to style.css if missing:

```css
/* Notifications */
.notification { /* Styled alerts */ }
.notification-success { /* Success styling */ }
.notification-error { /* Error styling */ }

/* Loading */
.loading-indicator { /* Full screen loader */ }
.spinner { /* Spinning animation */ }

/* Modals */
.modal { /* Modal styling */ }
.modal-content { /* Content area */ }
.close { /* Close button */ }

/* Status badges */
.status-badge { /* Status display */ }
.status-pending { /* Pending state */ }
.status-confirmed { /* Confirmed state */ }
.status-cancelled { /* Cancelled state */ }

/* Stars rating */
.stars { /* Star container */ }
.fa-star { /* Full star */ }
.fa-star-half-alt { /* Half star */ }

/* Form elements */
.form-control { /* Input styling */ }
.form-group { /* Group container */ }
.form-row { /* Side-by-side groups */ }

/* Cards and containers */
.card { /* Card styling */ }
.property-card { /* Property card */ }
.empty-state { /* Empty state message */ }
```

## Implementation Steps

1. **Update index.html**
   - Add script references at bottom of page
   - Test navigation works

2. **Update login.html**
   - Replace form submission with API calls
   - Add form validation
   - Add mode toggle (login/signup)

3. **Update dashboard.html**
   - Add stats container
   - Add recent items container
   - Verify sidebar navigation

4. **Update search.html**
   - Add filter controls
   - Add properties grid
   - Add property details modal

5. **Update profile.html**
   - Add profile form
   - Add password form
   - Add account settings

6. **Update messages.html**
   - Add conversations list
   - Add chat area
   - Add message form

7. **Update payments.html**
   - Add payment list
   - Add payment modals
   - Add receipt display

8. **Update saved.html**
   - Add saved properties grid
   - Add search/filter controls
   - Add comparison feature

9. **Update list-property.html**
   - Add property form
   - Add image upload
   - Add preview

10. **Update settings.html**
    - Add preference options
    - Add notification settings

## Testing Checklist

- [ ] All pages load without errors
- [ ] API calls work with correct endpoints
- [ ] Notifications display correctly
- [ ] Forms submit data properly
- [ ] Modals open and close
- [ ] Responsive design works on mobile
- [ ] Authentication redirects work
- [ ] Loading states display
- [ ] Error handling works
- [ ] Logout functionality works

## Notes

- All API calls should use the `api.js` utility functions
- Authentication token is automatically added to requests
- Errors are caught and displayed as notifications
- Loading states are shown for async operations
- Pages redirect to login if not authenticated

