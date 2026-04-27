// Profile JavaScript - Handle user profile management

let currentUserProfile = null

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
    const profileContainer = document.querySelector('[data-page="profile"]') ||
                            document.querySelector('.profile-container') ||
                            document.querySelector('.dashboard-section[data-section="profile"]')

    if (profileContainer) {
        initializeProfile()
    }
})

function initializeProfile() {
    redirectIfNotLoggedIn()
    loadProfile()
    setupProfileHandlers()
}

// Load user profile
async function loadProfile() {
    try {
        showLoading('Loading profile...')
        const data = await ProfileAPI.get()
        currentUserProfile = data.user
        renderProfile()
        hideLoading()
    } catch (error) {
        console.error('Error loading profile:', error)
        showNotification('Failed to load profile', 'error')
        hideLoading()
    }
}

// Render profile information
function renderProfile() {
    if (!currentUserProfile) return

    // Update profile display
    const profileName = document.getElementById('profileName')
    const profileEmail = document.getElementById('profileEmail')
    const profilePhone = document.getElementById('profilePhone')
    const profileType = document.getElementById('profileType')
    const profileAvatar = document.querySelector('.profile-avatar')

    if (profileName) profileName.textContent = currentUserProfile.full_name
    if (profileEmail) profileEmail.textContent = currentUserProfile.email
    if (profilePhone) profilePhone.textContent = currentUserProfile.phone
    if (profileType) profileType.textContent = currentUserProfile.user_type.charAt(0).toUpperCase() + currentUserProfile.user_type.slice(1)

    if (profileAvatar) {
        profileAvatar.textContent = getInitials(currentUserProfile.full_name)
    }

    // Update form fields
    const form = document.querySelector('.profile-form')
    if (form) {
        const nameInput = form.querySelector('#fullName')
        const emailInput = form.querySelector('#email')
        const phoneInput = form.querySelector('#phone')

        if (nameInput) nameInput.value = currentUserProfile.full_name
        if (emailInput) {
            emailInput.value = currentUserProfile.email
            emailInput.disabled = true // Email cannot be changed
        }
        if (phoneInput) phoneInput.value = currentUserProfile.phone
    }

    // Update sidebar
    const sidebarName = document.getElementById('profileName')
    const sidebarRole = document.getElementById('profileRole')
    const sidebarInitials = document.getElementById('sidebarInitials')

    if (sidebarName) sidebarName.textContent = currentUserProfile.full_name
    if (sidebarRole) sidebarRole.textContent = currentUserProfile.user_type.charAt(0).toUpperCase() + currentUserProfile.user_type.slice(1)
    if (sidebarInitials) sidebarInitials.textContent = getInitials(currentUserProfile.full_name)

    // Update welcome message
    const welcomeName = document.getElementById('welcomeName')
    if (welcomeName) {
        welcomeName.textContent = currentUserProfile.full_name.split(' ')[0]
    }
}

// Update profile
async function updateProfile(e) {
    e.preventDefault()

    const fullName = document.getElementById('fullName')?.value
    const phone = document.getElementById('phone')?.value

    if (!fullName || !phone) {
        showNotification('Please fill all required fields', 'error')
        return
    }

    if (!validatePhone(phone)) {
        showNotification('Invalid phone number format', 'error')
        return
    }

    if (fullName.length < 3) {
        showNotification('Name must be at least 3 characters', 'error')
        return
    }

    try {
        showLoading('Updating profile...')
        const updateData = {
            full_name: fullName,
            phone: phone
        }

        await ProfileAPI.update(updateData)
        hideLoading()
        showNotification('Profile updated successfully', 'success')

        // Reload profile
        loadProfile()
    } catch (error) {
        hideLoading()
        console.error('Error updating profile:', error)
        showNotification('Failed to update profile: ' + error.message, 'error')
    }
}

// Change password
async function changePassword(e) {
    e.preventDefault()

    const currentPassword = document.getElementById('currentPassword')?.value
    const newPassword = document.getElementById('newPassword')?.value
    const confirmPassword = document.getElementById('confirmPassword')?.value

    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill all password fields', 'error')
        return
    }

    if (!validatePassword(currentPassword)) {
        showNotification('Current password is incorrect', 'error')
        return
    }

    if (!validatePassword(newPassword)) {
        showNotification('New password must be at least 6 characters', 'error')
        return
    }

    if (newPassword !== confirmPassword) {
        showNotification('Passwords do not match', 'error')
        return
    }

    if (currentPassword === newPassword) {
        showNotification('New password must be different from current password', 'error')
        return
    }

    try {
        showLoading('Changing password...')
        await ProfileAPI.changePassword(currentPassword, newPassword)
        hideLoading()
        showNotification('Password changed successfully', 'success')

        // Reset form
        document.querySelector('.password-form')?.reset()
    } catch (error) {
        hideLoading()
        console.error('Error changing password:', error)
        showNotification('Failed to change password: ' + error.message, 'error')
    }
}

// Display profile section
function showProfileSection(sectionName) {
    const sections = document.querySelectorAll('.profile-section')
    sections.forEach(section => {
        section.style.display = 'none'
    })

    const activeSection = document.getElementById(`${sectionName}Section`)
    if (activeSection) {
        activeSection.style.display = 'block'
    }

    // Update tabs
    const tabs = document.querySelectorAll('.profile-tab')
    tabs.forEach(tab => {
        tab.classList.remove('active')
        if (tab.dataset.section === sectionName) {
            tab.classList.add('active')
        }
    })
}

// Upload profile picture
async function uploadProfilePicture(file) {
    if (!file) return

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
        showNotification('Please upload a valid image file (JPEG, PNG, GIF)', 'error')
        return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
        showNotification('File size must be less than 5MB', 'error')
        return
    }

    try {
        showLoading('Uploading profile picture...')

        // In a real app, you would upload to a file storage service
        // For now, we'll create a local preview
        const reader = new FileReader()
        reader.onload = (e) => {
            const profileAvatar = document.querySelector('.profile-avatar')
            if (profileAvatar) {
                profileAvatar.style.backgroundImage = `url(${e.target.result})`
                profileAvatar.textContent = ''
            }

            hideLoading()
            showNotification('Profile picture updated', 'success')
        }

        reader.readAsDataURL(file)
    } catch (error) {
        hideLoading()
        console.error('Error uploading picture:', error)
        showNotification('Failed to upload picture', 'error')
    }
}

// Delete account
function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return
    }

    if (!confirm('This will permanently delete all your data. Are you absolutely sure?')) {
        return
    }

    showLoading('Deleting account...')
    setTimeout(() => {
        hideLoading()
        clearAuthData()
        showNotification('Account deleted successfully', 'success')
        window.location.href = '/'
    }, 2000)
}

// Export/Download data
function downloadUserData() {
    try {
        const userData = {
            name: currentUserProfile.full_name,
            email: currentUserProfile.email,
            phone: currentUserProfile.phone,
            userType: currentUserProfile.user_type,
            created: currentUserProfile.created_at,
            isVerified: currentUserProfile.is_verified
        }

        const dataStr = JSON.stringify(userData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `easypg-profile-${Date.now()}.json`
        link.click()
        URL.revokeObjectURL(url)

        showNotification('Profile data downloaded', 'success')
    } catch (error) {
        console.error('Error downloading data:', error)
        showNotification('Failed to download data', 'error')
    }
}

// Setup profile handlers
function setupProfileHandlers() {
    // Profile form
    const profileForm = document.querySelector('.profile-form')
    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile)
    }

    // Password form
    const passwordForm = document.querySelector('.password-form')
    if (passwordForm) {
        passwordForm.addEventListener('submit', changePassword)
    }

    // Profile picture upload
    const profilePictureInput = document.getElementById('profilePictureInput')
    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', (e) => {
            uploadProfilePicture(e.target.files[0])
        })
    }

    const uploadBtn = document.querySelector('[data-action="upload-picture"]')
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            document.getElementById('profilePictureInput')?.click()
        })
    }

    // Profile tabs
    const tabs = document.querySelectorAll('.profile-tab')
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            showProfileSection(tab.dataset.section)
        })
    })

    // Password visibility toggle
    const passwordToggle = document.querySelectorAll('[data-action="toggle-password"]')
    passwordToggle.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const input = toggle.parentElement.querySelector('input')
            if (input) {
                input.type = input.type === 'password' ? 'text' : 'password'
                toggle.querySelector('i').classList.toggle('fa-eye')
                toggle.querySelector('i').classList.toggle('fa-eye-slash')
            }
        })
    })

    // Delete account button
    const deleteBtn = document.querySelector('[data-action="delete-account"]')
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteAccount)
    }

    // Download data button
    const downloadBtn = document.querySelector('[data-action="download-data"]')
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadUserData)
    }

    // Logout button
    const logoutBtn = document.querySelector('[data-action="logout"]')
    if (logoutBtn) {
        logoutBtn.addEventListener('click', signOut)
    }
}

// Sign out function
async function signOut() {
    try {
        showLoading('Signing out...')
        await AuthAPI.logout()
        hideLoading()

        clearAuthData()
        showNotification('Logged out successfully', 'success')
        window.location.href = '/'
    } catch (error) {
        hideLoading()
        console.error('Error logging out:', error)
        // Still clear local data and redirect
        clearAuthData()
        window.location.href = '/'
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const profilePage = document.querySelector('[data-page="profile"]')
    if (profilePage) {
        loadProfile()
    }
})
