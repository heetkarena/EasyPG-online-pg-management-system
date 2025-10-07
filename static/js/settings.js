// Settings page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load saved settings from localStorage
    loadSettings();
    
    // Initialize event listeners
    initializeEventListeners();
});

// Load settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('userSettings')) || {};
    
    // Apply saved settings to form elements
    Object.keys(settings).forEach(key => {
        const element = document.getElementById(key) || document.querySelector(`[onchange*="${key}"]`);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = settings[key];
            } else {
                element.value = settings[key];
            }
        }
    });
}

// Save settings to localStorage
function saveSettings() {
    const settings = JSON.parse(localStorage.getItem('userSettings')) || {};
    localStorage.setItem('userSettings', JSON.stringify(settings));
}

// Update individual setting
function updateSetting(key, value) {
    const settings = JSON.parse(localStorage.getItem('userSettings')) || {};
    settings[key] = value;
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Show success notification
    showNotification('Setting updated successfully', 'success');
    
    // Apply setting changes
    applySetting(key, value);
}

// Apply setting changes
function applySetting(key, value) {
    switch(key) {
        case 'theme':
            applyTheme(value);
            break;
        case 'language':
            // Language change would typically require page reload
            console.log('Language changed to:', value);
            break;
        case 'emailNotifications':
        case 'smsNotifications':
        case 'pushNotifications':
            console.log(`${key} set to:`, value);
            break;
        default:
            console.log(`Setting ${key} updated to:`, value);
    }
}

// Apply theme
function applyTheme(theme) {
    const body = document.body;
    body.classList.remove('theme-light', 'theme-dark');
    
    if (theme === 'dark') {
        body.classList.add('theme-dark');
    } else if (theme === 'light') {
        body.classList.add('theme-light');
    } else if (theme === 'auto') {
        // Auto theme based on system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            body.classList.add('theme-dark');
        } else {
            body.classList.add('theme-light');
        }
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Add click handlers for buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            this.disabled = true;
            
            // Simulate processing time
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            }, 1500);
        });
    });
}

// Setup Two-Factor Authentication
function setup2FA() {
    showNotification('2FA setup initiated. Check your email for instructions.', 'info');
    
    // In a real application, this would redirect to 2FA setup page
    setTimeout(() => {
        showNotification('2FA setup completed successfully!', 'success');
    }, 2000);
}

// Clear search history
function clearSearchHistory() {
    if (confirm('Are you sure you want to clear your search history? This action cannot be undone.')) {
        localStorage.removeItem('searchHistory');
        showNotification('Search history cleared successfully', 'success');
    }
}

// Download user data
function downloadData() {
    const userData = {
        settings: JSON.parse(localStorage.getItem('userSettings')) || {},
        searchHistory: JSON.parse(localStorage.getItem('searchHistory')) || [],
        savedProperties: JSON.parse(localStorage.getItem('savedProperties')) || [],
        profile: JSON.parse(localStorage.getItem('userProfile')) || {}
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'easypg-user-data.json';
    link.click();
    
    showNotification('Data download started', 'success');
}

// Delete account
function deleteAccount() {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    
    if (confirmation === 'DELETE') {
        if (confirm('This will permanently delete your account and all data. Are you absolutely sure?')) {
            // Clear all local data
            localStorage.clear();
            sessionStorage.clear();
            
            showNotification('Account deletion initiated. You will be redirected shortly.', 'warning');
            
            // In a real application, this would make an API call to delete the account
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        }
    } else if (confirmation !== null) {
        showNotification('Account deletion cancelled - incorrect confirmation', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Get notification icon based on type
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        case 'info': return 'info-circle';
        default: return 'info-circle';
    }
}

// Handle responsive navigation
function toggleMobileNav() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = JSON.parse(localStorage.getItem('userSettings'))?.theme || 'light';
    applyTheme(savedTheme);
});
