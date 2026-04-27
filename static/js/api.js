// API Utilities and Helper Functions for EasyPG

// API Base URL
const API_BASE_URL = window.location.origin + '/api'

// Notification function
function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `

    document.body.appendChild(notification)

    setTimeout(() => {
        notification.classList.add('show')
    }, 10)

    setTimeout(() => {
        notification.classList.remove('show')
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification)
            }
        }, 300)
    }, duration)
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    }
    return icons[type] || 'info-circle'
}

// Get Authorization Header
function getAuthHeaders() {
    const token = localStorage.getItem('authToken')
    const headers = {
        'Content-Type': 'application/json'
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    return headers
}

// Make API Request
async function makeAPIRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const defaultOptions = {
        headers: getAuthHeaders(),
        ...options
    }

    try {
        const response = await fetch(url, defaultOptions)
        const data = await response.json()

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('authToken')
                localStorage.removeItem('userData')
                window.location.href = '/login'
                throw new Error('Session expired. Please login again.')
            }
            throw new Error(data.error || `Error: ${response.status}`)
        }

        return data
    } catch (error) {
        console.error('API Request failed:', error)
        throw error
    }
}

// Authentication API Calls
const AuthAPI = {
    register: async (userData) => {
        return makeAPIRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        })
    },

    login: async (email, password, userType) => {
        return makeAPIRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, user_type: userType })
        })
    },

    verify: async () => {
        return makeAPIRequest('/auth/verify', { method: 'GET' })
    },

    logout: async () => {
        return makeAPIRequest('/auth/logout', { method: 'POST' })
    }
}

// Properties API Calls
const PropertiesAPI = {
    search: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        return makeAPIRequest(`/properties?${queryString}`, { method: 'GET' })
    },

    getDetail: async (propertyId) => {
        return makeAPIRequest(`/properties/${propertyId}`, { method: 'GET' })
    },

    create: async (propertyData) => {
        return makeAPIRequest('/properties', {
            method: 'POST',
            body: JSON.stringify(propertyData)
        })
    },

    update: async (propertyId, updateData) => {
        return makeAPIRequest(`/properties/${propertyId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        })
    },

    delete: async (propertyId) => {
        return makeAPIRequest(`/properties/${propertyId}`, {
            method: 'DELETE'
        })
    },

    getReviews: async (propertyId) => {
        return makeAPIRequest(`/properties/${propertyId}/reviews`, { method: 'GET' })
    }
}

// Saved Properties API Calls
const SavedPropertiesAPI = {
    getAll: async () => {
        return makeAPIRequest('/saved-properties', { method: 'GET' })
    },

    save: async (propertyId) => {
        return makeAPIRequest('/saved-properties', {
            method: 'POST',
            body: JSON.stringify({ property_id: propertyId })
        })
    },

    remove: async (propertyId) => {
        return makeAPIRequest(`/saved-properties/${propertyId}`, {
            method: 'DELETE'
        })
    }
}

// Messages API Calls
const MessagesAPI = {
    getConversations: async () => {
        return makeAPIRequest('/messages', { method: 'GET' })
    },

    getConversation: async (userId) => {
        return makeAPIRequest(`/messages/${userId}`, { method: 'GET' })
    },

    send: async (receiverId, message) => {
        return makeAPIRequest('/messages', {
            method: 'POST',
            body: JSON.stringify({
                receiver_id: receiverId,
                message: message
            })
        })
    }
}

// Bookings API Calls
const BookingsAPI = {
    getAll: async () => {
        return makeAPIRequest('/bookings', { method: 'GET' })
    },

    create: async (bookingData) => {
        return makeAPIRequest('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        })
    },

    update: async (bookingId, status) => {
        return makeAPIRequest(`/bookings/${bookingId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: status })
        })
    }
}

// Reviews API Calls
const ReviewsAPI = {
    create: async (reviewData) => {
        return makeAPIRequest('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        })
    },

    getByProperty: async (propertyId) => {
        return makeAPIRequest(`/properties/${propertyId}/reviews`, { method: 'GET' })
    }
}

// Profile API Calls
const ProfileAPI = {
    get: async () => {
        return makeAPIRequest('/profile', { method: 'GET' })
    },

    update: async (updateData) => {
        return makeAPIRequest('/profile', {
            method: 'PUT',
            body: JSON.stringify(updateData)
        })
    },

    changePassword: async (currentPassword, newPassword) => {
        return makeAPIRequest('/profile/password', {
            method: 'PUT',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        })
    }
}

// Payments API Calls
const PaymentsAPI = {
    create: async (paymentData) => {
        return makeAPIRequest('/payments', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        })
    },

    get: async (paymentId) => {
        return makeAPIRequest(`/payments/${paymentId}`, { method: 'GET' })
    }
}

// Dashboard API Calls
const DashboardAPI = {
    getStats: async (userType = null) => {
        let endpoint = '/dashboard/stats'
        if (userType) {
            endpoint += `?type=${userType}`
        }
        return makeAPIRequest(endpoint, { method: 'GET' })
    },

    getRecentPGs: async () => {
        return makeAPIRequest('/dashboard/recent-pgs', { method: 'GET' })
    },

    getRecentProperties: async () => {
        return makeAPIRequest('/dashboard/recent-properties', { method: 'GET' })
    }
}

// Utility Functions
function getCurrentUser() {
    const userData = localStorage.getItem('userData')
    return userData ? JSON.parse(userData) : null
}

function getAuthToken() {
    return localStorage.getItem('authToken')
}

function isLoggedIn() {
    return !!getAuthToken()
}

function saveUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData))
}

function saveAuthToken(token) {
    localStorage.setItem('authToken', token)
}

function clearAuthData() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
}

function redirectIfNotLoggedIn() {
    if (!isLoggedIn()) {
        window.location.href = '/login'
    }
}

function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount)
}

function formatTime(dateString) {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

function getInitials(name) {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

function truncateText(text, length = 100) {
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
}

function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

function throttle(func, limit) {
    let inThrottle
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

// Loading indicator functions
function showLoading(message = 'Loading...') {
    const loader = document.createElement('div')
    loader.id = 'loading-indicator'
    loader.className = 'loading-indicator'
    loader.innerHTML = `
        <div class="loader">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `
    document.body.appendChild(loader)
}

function hideLoading() {
    const loader = document.getElementById('loading-indicator')
    if (loader) {
        loader.remove()
    }
}

// Form validation
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
}

function validatePhone(phone) {
    const regex = /^[6-9]\d{9}$/
    return regex.test(phone)
}

function validatePassword(password) {
    return password.length >= 6
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AuthAPI,
        PropertiesAPI,
        SavedPropertiesAPI,
        MessagesAPI,
        BookingsAPI,
        ReviewsAPI,
        ProfileAPI,
        PaymentsAPI,
        DashboardAPI,
        showNotification,
        makeAPIRequest,
        getCurrentUser,
        isLoggedIn,
        saveUserData,
        clearAuthData,
        formatDate,
        formatCurrency,
        validateEmail,
        validatePhone,
        validatePassword
    }
}
