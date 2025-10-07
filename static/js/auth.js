// Authentication JavaScript

// Global variables
let currentUserType = "student"
let isLoginMode = true

// Declare showNotification and makeAPIRequest functions
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  // Add to page
  document.body.appendChild(notification)

  // Remove after 3 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification)
    }
  }, 3000)
}

async function makeAPIRequest(endpoint, options = {}) {
  const url = `http://localhost:5000/api${endpoint}`

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  }

  const finalOptions = { ...defaultOptions, ...options }

  try {
    const response = await fetch(url, finalOptions)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Request failed")
    }

    return data
  } catch (error) {
    console.error("API Request failed:", error)
    throw error
  }
}

// Initialize auth page
document.addEventListener("DOMContentLoaded", () => {
  initializeAuthPage()
})

// Initialize authentication page
function initializeAuthPage() {
  // Get user type from URL
  const urlParams = new URLSearchParams(window.location.search)
  const typeParam = urlParams.get("type")
  const modeParam = urlParams.get("mode")

  if (typeParam && ["student", "owner", "admin"].includes(typeParam)) {
    currentUserType = typeParam
  }

  if (modeParam === "signup") {
    isLoginMode = false
  }

  // Initialize UI
  updateUserTypeUI()
  updateAuthModeUI()

  // Handle admin type
  if (currentUserType === "admin") {
    handleAdminType()
  }
}

// Setup event listeners
function setupEventListeners() {
  // User type tabs
  const tabButtons = document.querySelectorAll(".tab-btn")
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const type = this.dataset.type
      if (type) {
        switchUserType(type)
      }
    })
  })

  // Login/Signup toggle
  const loginBtn = document.getElementById("loginBtn")
  const signupBtn = document.getElementById("signupBtn")

  if (loginBtn) {
    loginBtn.addEventListener("click", () => switchAuthMode(true))
  }

  if (signupBtn) {
    signupBtn.addEventListener("click", () => switchAuthMode(false))
  }

  // Form submission
  const authForm = document.getElementById("authForm")
  if (authForm) {
    authForm.addEventListener("submit", handleFormSubmit)
  }

  // Password toggle
  const passwordToggle = document.getElementById("passwordToggle")
  if (passwordToggle) {
    passwordToggle.addEventListener("click", () => togglePassword("password"))
  }

  const confirmPasswordToggle = document.getElementById("confirmPasswordToggle")
  if (confirmPasswordToggle) {
    confirmPasswordToggle.addEventListener("click", () => togglePassword("confirmPassword"))
  }
}

// Switch user type
function switchUserType(type) {
  currentUserType = type
  updateUserTypeUI()

  // Update URL
  const url = new URL(window.location)
  url.searchParams.set("type", type)
  window.history.replaceState({}, "", url)
}

// Update user type UI
function updateUserTypeUI() {
  const userTypeIcon = document.getElementById("userTypeIcon")
  const authTitle = document.getElementById("authTitle")
  const authDescription = document.getElementById("authDescription")
  const userTypeTabs = document.getElementById("userTypeTabs")
  const adminBadge = document.getElementById("adminBadge")
  const adminNote = document.getElementById("adminNote")

  // Update active tab
  const tabButtons = document.querySelectorAll(".tab-btn")
  tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === currentUserType)
  })

  // Update content based on user type
  const typeInfo = getUserTypeInfo(currentUserType)

  if (userTypeIcon) {
    userTypeIcon.innerHTML = `<i class="${typeInfo.icon}"></i>`
    userTypeIcon.style.background = typeInfo.gradient
  }

  if (authTitle) {
    authTitle.textContent = typeInfo.title
  }

  if (authDescription) {
    authDescription.textContent = typeInfo.description
  }

  // Handle admin specific UI
  if (currentUserType === "admin") {
    if (userTypeTabs) userTypeTabs.style.display = "none"
    if (adminBadge) adminBadge.style.display = "block"
    if (adminNote) adminNote.style.display = "block"
  } else {
    if (userTypeTabs) userTypeTabs.style.display = "grid"
    if (adminBadge) adminBadge.style.display = "none"
    if (adminNote) adminNote.style.display = "none"
  }
}

// Get user type information
function getUserTypeInfo(type) {
  const types = {
    student: {
      icon: "fas fa-graduation-cap",
      title: "Student Portal",
      description: "Find and book your perfect PG accommodation",
      gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    },
    owner: {
      icon: "fas fa-building",
      title: "PG Owner Portal",
      description: "Manage your properties and connect with students",
      gradient: "linear-gradient(135deg, #10b981, #059669)",
    },
    admin: {
      icon: "fas fa-shield-alt",
      title: "Admin Portal",
      description: "Manage the entire EasyPG platform",
      gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    },
  }

  return types[type] || types.student
}

// Switch authentication mode
function switchAuthMode(login) {
  isLoginMode = login
  updateAuthModeUI()
}

// Update auth mode UI
function updateAuthModeUI() {
  // Update toggle buttons
  const loginBtn = document.getElementById("loginBtn")
  const signupBtn = document.getElementById("signupBtn")

  if (loginBtn) loginBtn.classList.toggle("active", isLoginMode)
  if (signupBtn) signupBtn.classList.toggle("active", !isLoginMode)

  // Update form fields
  const fullNameGroup = document.getElementById("fullNameGroup")
  const phoneGroup = document.getElementById("phoneGroup")
  const confirmPasswordGroup = document.getElementById("confirmPasswordGroup")
  const loginOptions = document.getElementById("loginOptions")
  const submitText = document.getElementById("submitText")

  if (fullNameGroup) {
    fullNameGroup.style.display = isLoginMode ? "none" : "block"
  }

  if (phoneGroup) {
    phoneGroup.style.display = isLoginMode ? "none" : "block"
  }

  if (confirmPasswordGroup) {
    confirmPasswordGroup.style.display = isLoginMode ? "none" : "block"
  }

  if (loginOptions) {
    loginOptions.style.display = isLoginMode ? "block" : "none"
  }

  if (submitText) {
    submitText.textContent = isLoginMode ? "Sign In" : "Create Account"
  }

  // Update required fields
  const fullNameInput = document.getElementById("fullName")
  const phoneInput = document.getElementById("phone")
  const confirmPasswordInput = document.getElementById("confirmPassword")

  if (fullNameInput) {
    fullNameInput.required = !isLoginMode
  }

  if (phoneInput) {
    phoneInput.required = !isLoginMode
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.required = !isLoginMode
  }
}
fetx
// Handle admin type
function handleAdminType() {
  // Hide user type tabs and show admin note
  const userTypeTabs = document.getElementById("userTypeTabs")
  const adminNote = document.getElementById("adminNote")

  if (userTypeTabs) {
    userTypeTabs.style.display = "none"
  }

  if (adminNote) {
    adminNote.style.display = "block"
  }
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const data = Object.fromEntries(formData.entries())

  // Validate form
  if (!validateForm(data)) {
    return
  }

  // Show loading state
  showLoadingState(true)

  try {
    if (isLoginMode) {
      await handleLogin(data)
    } else {
      await handleSignup(data)
    }
  } catch (error) {
    showNotification(error.message, "error")
  } finally {
    showLoadingState(false)
  }
}

// Validate form data
function validateForm(data) {
  // Basic validation
  if (!data.email || !data.password) {
    showNotification("Please fill in all required fields", "error")
    return false
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    showNotification("Please enter a valid email address", "error")
    return false
  }

  // Password validation
  if (data.password.length < 6) {
    showNotification("Password must be at least 6 characters long", "error")
    return false
  }

  // Signup specific validation
  if (!isLoginMode) {
    if (!data.fullName || !data.phone) {
      showNotification("Please fill in all required fields", "error")
      return false
    }

    if (data.password !== data.confirmPassword) {
      showNotification("Passwords do not match", "error")
      return false
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(data.phone)) {
      showNotification("Please enter a valid 10-digit phone number", "error")
      return false
    }
  }

  return true
}

// Handle login
async function handleLogin(data) {
  try {
    const response = await makeAPIRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        user_type: currentUserType,
      }),
    })

    // Store auth data
    localStorage.setItem("authToken", response.token)
    localStorage.setItem("userData", JSON.stringify(response.user))

    showNotification("Login successful! Redirecting...", "success")

    // Redirect based on user type
    setTimeout(() => {
      redirectAfterAuth(response.user)
    }, 1500)
  } catch (error) {
    throw new Error(error.message || "Login failed")
  }
}

// Handle signup
async function handleSignup(data) {
  try {
    const response = await makeAPIRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        phone: data.phone,
        user_type: currentUserType,
      }),
    })

    showNotification("Account created successfully! Please sign in.", "success")

    // Switch to login mode
    setTimeout(() => {
      switchAuthMode(true)
    }, 2000)
  } catch (error) {
    throw new Error(error.message || "Registration failed")
  }
}

// Redirect after authentication
function redirectAfterAuth(user) {
  switch (user.user_type) {
    case "admin":
      window.location.href = "admin-dashboard.html"
      break
    case "owner":
      window.location.href = "/dashboard?type=owner"
      break
    case "student":
    default:
      window.location.href = "/dashboard?type=student"
      break
  }
}

// Show loading state
function showLoadingState(loading) {
  const submitBtn = document.getElementById("submitBtn")
  const submitText = document.getElementById("submitText")
  const loadingSpinner = document.getElementById("loadingSpinner")

  if (submitBtn) {
    submitBtn.disabled = loading
  }

  if (submitText) {
    submitText.style.display = loading ? "none" : "inline"
  }

  if (loadingSpinner) {
    loadingSpinner.style.display = loading ? "inline-flex" : "none"
  }
}

// Toggle password visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId)
  const button = input.nextElementSibling
  const icon = button.querySelector("i")

  if (input.type === "password") {
    input.type = "text"
    icon.className = "fas fa-eye-slash"
  } else {
    input.type = "password"
    icon.className = "fas fa-eye"
  }
}
