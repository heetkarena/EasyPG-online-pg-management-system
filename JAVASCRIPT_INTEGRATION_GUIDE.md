# EasyPG JavaScript Integration Guide

## Quick Start

### 1. Add API Utilities to All Pages

Every HTML page needs this at the bottom before closing `</body>`:

```html
<script src="/static/js/api.js"></script>
<script src="/static/js/main.js"></script>
```

### 2. Add Feature-Specific Scripts

Based on page functionality, add additional scripts:

**For Login/Register:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/auth.js"></script>
```

**For Dashboard:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/main.js"></script>
<script src="/static/js/dashboard.js"></script>
```

**For Search/Browse:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/main.js"></script>
<script src="/static/js/search.js"></script>
<script src="/static/js/reviews.js"></script>
```

**For Saved Properties:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/main.js"></script>
<script src="/static/js/saved.js"></script>
```

**For Messages:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/main.js"></script>
<script src="/static/js/messages.js"></script>
```

**For Bookings/Payments:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/main.js"></script>
<script src="/static/js/bookings.js"></script>
<script src="/static/js/payments.js"></script>
<script src="/static/js/reviews.js"></script>
```

**For Profile:**
```html
<script src="/static/js/api.js"></script>
<script src="/static/js/main.js"></script>
<script src="/static/js/profile.js"></script>
```

## API Usage Examples

### Authentication

```javascript
// Login
try {
    const data = await AuthAPI.login('email@example.com', 'password123', 'student')
    saveAuthToken(data.token)
    saveUserData(data.user)
    window.location.href = '/dashboard'
} catch (error) {
    showNotification(error.message, 'error')
}

// Logout
await AuthAPI.logout()
clearAuthData()
window.location.href = '/'

// Check if logged in
if (isLoggedIn()) {
    // User is authenticated
}
```

### Properties

```javascript
// Search properties
const results = await PropertiesAPI.search({
    city: 'Rajkot',
    min_rent: 5000,
    max_rent: 10000,
    property_type: 'boys_pg',
    page: 1,
    per_page: 10
})

// Get property details
const property = await PropertiesAPI.getDetail('property-id')

// Create property (Owner only)
const property = await PropertiesAPI.create({
    property_name: 'My PG',
    property_type: 'boys_pg',
    address: '123 Main St',
    city: 'Rajkot',
    // ... other fields
})

// Get reviews for property
const reviews = await PropertiesAPI.getReviews('property-id')
```

### Saved Properties

```javascript
// Get all saved
const saved = await SavedPropertiesAPI.getAll()

// Save a property
await SavedPropertiesAPI.save('property-id')

// Remove from saved
await SavedPropertiesAPI.remove('property-id')
```

### Messages

```javascript
// Get conversations
const conversations = await MessagesAPI.getConversations()

// Get conversation with user
const messages = await MessagesAPI.getConversation('user-id')

// Send message
await MessagesAPI.send('receiver-id', 'Message text')
```

### Bookings

```javascript
// Get all bookings
const bookings = await BookingsAPI.getAll()

// Create booking
const booking = await BookingsAPI.create({
    property_id: 'prop-id',
    check_in_date: '2025-02-01',
    check_out_date: '2025-05-01',
    monthly_rent: 5500,
    total_amount: 20000
})

// Update booking status
await BookingsAPI.update('booking-id', 'confirmed')
```

### Reviews

```javascript
// Post review
await ReviewsAPI.create({
    property_id: 'prop-id',
    rating: 5,
    review_title: 'Great place',
    review_text: 'Very comfortable and clean...'
})

// Get reviews by property
const reviews = await ReviewsAPI.getByProperty('prop-id')
```

### Profile

```javascript
// Get profile
const profile = await ProfileAPI.get()

// Update profile
await ProfileAPI.update({
    full_name: 'New Name',
    phone: '9999999999'
})

// Change password
await ProfileAPI.changePassword('oldPassword123', 'newPassword123')
```

### Payments

```javascript
// Create payment
const payment = await PaymentsAPI.create({
    booking_id: 'booking-id',
    amount: 5500,
    payment_method: 'credit_card'
})

// Get payment details
const payment = await PaymentsAPI.get('payment-id')
```

### Dashboard

```javascript
// Get dashboard stats
const stats = await DashboardAPI.getStats()
// or specify type
const stats = await DashboardAPI.getStats('student')

// Get recent PGs
const recent = await DashboardAPI.getRecentPGs()

// Get recent properties (Owner)
const properties = await DashboardAPI.getRecentProperties()
```

## Utility Functions

### Notifications
```javascript
showNotification('Success message', 'success')
showNotification('Error message', 'error')
showNotification('Info message', 'info')
showNotification('Warning message', 'warning')
```

### Loading
```javascript
showLoading('Loading data...')
// ... do async work ...
hideLoading()
```

### Authentication Helpers
```javascript
// Check if logged in
if (isLoggedIn()) { }

// Get current user
const user = getCurrentUser()

// Save user data
saveUserData(userData)

// Save token
saveAuthToken(token)

// Clear auth data
clearAuthData()

// Redirect if not logged in
redirectIfNotLoggedIn()
```

### Format Helpers
```javascript
// Format date
formatDate('2025-01-15T10:30:00')  // Jan 15, 2025

// Format currency
formatCurrency(5500)  // ₹5,500.00

// Format time
formatTime('2025-01-15T10:30:00')  // 10:30 AM

// Get initials
getInitials('John Doe')  // JD

// Truncate text
truncateText('Long text...', 50)  // Long text...

// Validate email
validateEmail('test@example.com')  // true/false

// Validate phone
validatePhone('9876543210')  // true/false

// Validate password
validatePassword('password123')  // true/false
```

### Debounce & Throttle
```javascript
// Debounce (wait for user to stop typing)
const searchDebounced = debounce(searchFunction, 300)
inputField.addEventListener('input', searchDebounced)

// Throttle (limit function calls)
const scrollThrottled = throttle(handleScroll, 1000)
window.addEventListener('scroll', scrollThrottled)
```

## Error Handling

All API calls throw errors that can be caught:

```javascript
try {
    const data = await PropertiesAPI.search({ city: 'Rajkot' })
    // Success
} catch (error) {
    console.error('Error:', error)
    showNotification(error.message, 'error')
}
```

Error messages from API:
- "Session expired. Please login again." - Token expired (auto-redirects to login)
- "Invalid email or password" - Login failed
- "Property not found" - Resource doesn't exist
- Custom error from backend

## HTML Structure Requirements

### Modal Structure
```html
<div id="myModal" class="modal">
    <div class="modal-content">
        <span class="close" onclick="closeModal('myModal')">&times;</span>
        <!-- Content here -->
    </div>
</div>
```

### Form Structure
```html
<form onsubmit="handleSubmit(event)">
    <div class="form-group">
        <label>Field Label</label>
        <input type="text" id="fieldId" required />
    </div>
    <button type="submit">Submit</button>
</form>
```

### Property Card Structure
```html
<div class="property-card">
    <div class="property-image">
        <img src="image.jpg" alt="Property" />
        <button class="save-btn" onclick="toggleSave(this, 'prop-id', event)">
            <i class="fas fa-heart"></i>
        </button>
    </div>
    <div class="property-content">
        <h3>Property Name</h3>
        <p>Location</p>
        <div class="property-footer">
            <span class="price">₹5,500/month</span>
            <a href="/property-detail?id=prop-id">View Details</a>
        </div>
    </div>
</div>
```

## Common Issues & Solutions

### Issue: "API calls failing with 401"
**Solution:** Token might be expired or not set
```javascript
// Check if token exists
const token = getAuthToken()
if (!token) {
    redirectIfNotLoggedIn()
}
```

### Issue: "Notifications not showing"
**Solution:** Make sure notification CSS is included in style.css
```css
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 9999;
}
```

### Issue: "User data not persisting"
**Solution:** Ensure auth data is saved after login
```javascript
saveAuthToken(data.token)
saveUserData(data.user)
```

### Issue: "Page redirects to login immediately"
**Solution:** Make sure redirectIfNotLoggedIn() is only called on protected pages
```javascript
// Only on protected pages:
document.addEventListener('DOMContentLoaded', () => {
    redirectIfNotLoggedIn()
})

// Don't call on public pages like home or login
```

## Performance Tips

1. **Debounce Search Inputs**
```javascript
const searchDebounced = debounce(searchProperties, 500)
searchInput.addEventListener('input', searchDebounced)
```

2. **Throttle Scroll Events**
```javascript
const scrollThrottled = throttle(handleScroll, 1000)
window.addEventListener('scroll', scrollThrottled)
```

3. **Lazy Load Images**
```html
<img src="image.jpg" alt="Property" loading="lazy" />
```

4. **Cache API Results**
```javascript
let cachedProperties = null
async function getProperties() {
    if (cachedProperties) return cachedProperties
    cachedProperties = await PropertiesAPI.search()
    return cachedProperties
}
```

## Testing API Calls

### In Browser Console
```javascript
// Test login
AuthAPI.login('student@easypg.com', 'student123', 'student')
    .then(data => console.log('Logged in:', data))
    .catch(err => console.error('Error:', err))

// Test property search
PropertiesAPI.search({ city: 'Rajkot' })
    .then(data => console.log('Properties:', data))
    .catch(err => console.error('Error:', err))

// Test current user
console.log('Current user:', getCurrentUser())
console.log('Is logged in:', isLoggedIn())
```

## Next Steps

1. Update all HTML templates with new script includes
2. Add required CSS classes to style.css
3. Test each page functionality
4. Verify API endpoints are working
5. Test authentication flow
6. Test responsive design
7. Deploy to production

