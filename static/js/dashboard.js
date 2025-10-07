// Dashboard JavaScript

// Global variables
let currentUser = null
let userType = "student"

// Declare utility functions
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
  const token = localStorage.getItem("authToken")

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
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

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  initializeDashboard()
})

// Initialize dashboard
async function initializeDashboard() {
  // Show loading overlay
  showLoadingOverlay(true)

  try {
    // Check authentication
    await checkAuthentication()

    // Get user type from URL or user data
    const urlParams = new URLSearchParams(window.location.search)
    const typeParam = urlParams.get("type")

    if (typeParam && ["student", "owner"].includes(typeParam)) {
      userType = typeParam
    } else if (currentUser && ["student", "owner"].includes(currentUser.user_type)) {
      userType = currentUser.user_type
    }

    // Update UI based on user type
    updateDashboardUI()

    // Load dashboard data
    await loadDashboardData()
  } catch (error) {
    console.error("Dashboard initialization failed:", error)
    showNotification("Failed to load dashboard", "error")
    // Redirect to login
    setTimeout(() => {
      window.location.href = "/login"
    }, 1000)
  } finally {
    showLoadingOverlay(false)
  }
}

// Check authentication
async function checkAuthentication() {
  const token = localStorage.getItem("authToken")
  const userData = localStorage.getItem("userData")

  if (!token || !userData) {
    throw new Error("Not authenticated")
  }

  try {
    currentUser = JSON.parse(userData)

    // Verify token with server
    const response = await makeAPIRequest("/auth/verify")

    // Update user data if needed
    if (response.user) {
      currentUser = response.user
      localStorage.setItem("userData", JSON.stringify(currentUser))
    }
  } catch (error) {
    // Clear invalid auth data
    localStorage.removeItem("authToken")
    localStorage.removeItem("userData")
    throw new Error("Authentication failed")
  }
}

// Update dashboard UI based on user type
function updateDashboardUI() {
  // Update user badge
  const userBadge = document.getElementById("userBadge")
  if (userBadge) {
    userBadge.textContent = userType === "student" ? "Student" : "PG Owner"
    userBadge.className = `user-badge ${userType === "student" ? "badge-blue" : "badge-green"}`
  }

  // Update user initials
  const userInitials = document.getElementById("userInitials")
  const sidebarInitials = document.getElementById("sidebarInitials")
  const initials = getInitials(currentUser.full_name || currentUser.email)

  if (userInitials) userInitials.textContent = initials
  if (sidebarInitials) sidebarInitials.textContent = initials

  // Update profile info
  const profileName = document.getElementById("profileName")
  const profileRole = document.getElementById("profileRole")
  const welcomeName = document.getElementById("welcomeName")
  const welcomeDescription = document.getElementById("welcomeDescription")

  if (profileName) {
    profileName.textContent = currentUser.full_name || "User"
  }

  if (profileRole) {
    profileRole.textContent = userType === "student" ? "Student" : "PG Owner"
  }

  if (welcomeName) {
    welcomeName.textContent = (currentUser.full_name || "User").split(" ")[0]
  }

  if (welcomeDescription) {
    welcomeDescription.textContent =
      userType === "student"
        ? "Here's what's happening with your PG search"
        : "Here's your property management overview"
  }

  // Update navigation text
  const searchNavText = document.getElementById("searchNavText")
  const savedNavText = document.getElementById("savedNavText")
  const recentTitle = document.getElementById("recentTitle")

  if (searchNavText) {
    searchNavText.textContent = userType === "student" ? "Search PGs" : "My Properties"
  }

  if (savedNavText) {
    savedNavText.textContent = userType === "student" ? "Saved PGs" : "Bookings"
  }

  if (recentTitle) {
    recentTitle.textContent = userType === "student" ? "Recently Viewed PGs" : "Recent Property Activity"
  }

  // Show/hide add property button
  const addPropertyBtn = document.getElementById("addPropertyBtn")
  if (addPropertyBtn) {
    addPropertyBtn.style.display = userType === "owner" ? "flex" : "none"
  }
}

// Load dashboard data
async function loadDashboardData() {
  try {
    // Load stats
    await loadStats()

    // Load recent PGs/properties
    await loadRecentItems()

    // Load quick actions
    loadQuickActions()
  } catch (error) {
    console.error("Failed to load dashboard data:", error)
    showNotification("Some data could not be loaded", "warning")
  }
}

// Load statistics
async function loadStats() {
  const statsGrid = document.getElementById("statsGrid")
  if (!statsGrid) return

  try {
    const response = await makeAPIRequest(`/dashboard/stats?type=${userType}`)
    const stats = response.stats

    // Clear existing stats
    statsGrid.innerHTML = ""

    // Generate stats based on user type
    const statItems =
      userType === "student"
        ? [
            { label: "Saved PGs", value: stats.saved_pgs || "0", icon: "fas fa-heart", color: "#ef4444" },
            { label: "Applications", value: stats.applications || "0", icon: "fas fa-file-alt", color: "#3b82f6" },
            { label: "Visits Scheduled", value: stats.visits || "0", icon: "fas fa-calendar", color: "#10b981" },
            { label: "Messages", value: stats.messages || "0", icon: "fas fa-comments", color: "#8b5cf6" },
          ]
        : [
            {
              label: "Total Properties",
              value: stats.total_properties || "0",
              icon: "fas fa-building",
              color: "#3b82f6",
            },
            { label: "Occupied Rooms", value: stats.occupied_rooms || "0", icon: "fas fa-users", color: "#10b981" },
            {
              label: "Monthly Revenue",
              value: formatCurrency(stats.monthly_revenue || 0),
              icon: "fas fa-chart-line",
              color: "#8b5cf6",
            },
            { label: "New Inquiries", value: stats.inquiries || "0", icon: "fas fa-comments", color: "#f59e0b" },
          ]

    // Create stat cards
    statItems.forEach((stat) => {
      const statCard = createStatCard(stat)
      statsGrid.appendChild(statCard)
    })
  } catch (error) {
    console.error("Failed to load stats:", error)
    // Show placeholder stats
    showPlaceholderStats()
  }
}

// Create stat card element
function createStatCard(stat) {
  const card = document.createElement("div")
  card.className = "stat-card"
  card.innerHTML = `
        <div class="stat-info">
            <h3>${stat.label}</h3>
            <p>${stat.value}</p>
        </div>
        <div class="stat-icon" style="background-color: ${stat.color}20; color: ${stat.color}">
            <i class="${stat.icon}"></i>
        </div>
    `
  return card
}

// Show placeholder stats
function showPlaceholderStats() {
  const statsGrid = document.getElementById("statsGrid")
  if (!statsGrid) return

  const placeholderStats =
    userType === "student"
      ? [
          { label: "Saved PGs", value: "12", icon: "fas fa-heart", color: "#ef4444" },
          { label: "Applications", value: "5", icon: "fas fa-file-alt", color: "#3b82f6" },
          { label: "Visits Scheduled", value: "3", icon: "fas fa-calendar", color: "#10b981" },
          { label: "Messages", value: "8", icon: "fas fa-comments", color: "#8b5cf6" },
        ]
      : [
          { label: "Total Properties", value: "4", icon: "fas fa-building", color: "#3b82f6" },
          { label: "Occupied Rooms", value: "28", icon: "fas fa-users", color: "#10b981" },
          { label: "Monthly Revenue", value: "₹1.2L", icon: "fas fa-chart-line", color: "#8b5cf6" },
          { label: "New Inquiries", value: "15", icon: "fas fa-comments", color: "#f59e0b" },
        ]

  statsGrid.innerHTML = ""
  placeholderStats.forEach((stat) => {
    const statCard = createStatCard(stat)
    statsGrid.appendChild(statCard)
  })
}

// Load recent items
async function loadRecentItems() {
  const recentPGs = document.getElementById("recentPGs")
  if (!recentPGs) return

  try {
    const endpoint = userType === "student" ? "/dashboard/recent-pgs" : "/dashboard/recent-properties"
    const response = await makeAPIRequest(endpoint)
    const items = response.items || []

    // Clear existing items
    recentPGs.innerHTML = ""

    if (items.length === 0) {
      recentPGs.innerHTML = '<p class="no-data">No recent items found</p>'
      return
    }

    // Create PG cards
    items.forEach((item) => {
      const pgCard = createPGCard(item)
      recentPGs.appendChild(pgCard)
    })
  } catch (error) {
    console.error("Failed to load recent items:", error)
    // Show placeholder data
    showPlaceholderPGs()
  }
}

// Create PG card element
function createPGCard(pg) {
  const card = document.createElement("div")
  card.className = "pg-card"
  card.innerHTML = `
        <img src="${pg.image || "/placeholder.svg?height=200&width=300&text=PG+Image"}" alt="${pg.name}" class="pg-image">
        <div class="pg-content">
            <div class="pg-header">
                <h3 class="pg-name">${pg.name}</h3>
                <span class="pg-status status-${pg.status.toLowerCase().replace(" ", "-")}">${pg.status}</span>
            </div>
            <div class="pg-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${pg.location}</span>
            </div>
            <div class="pg-rating">
                <i class="fas fa-star"></i>
                <span>${pg.rating || "4.5"}</span>
                <span class="rating-count">(${pg.reviews || "124"} reviews)</span>
            </div>
            <div class="pg-footer">
                <span class="pg-price">${formatCurrency(pg.price || 8500)}/month</span>
            </div>
        </div>
    `
  return card
}

// Show placeholder PGs
function showPlaceholderPGs() {
  const recentPGs = document.getElementById("recentPGs")
  if (!recentPGs) return

  const placeholderPGs = [
    {
      name: "Vedaditya Boys Hostel",
      location: "Kankot Rd, Near Government Engineering Collage, Rajkot",
      price: 6500,
      rating: 4.5,
      reviews: 124,
      status: "Available",
      image: "/placeholder.svg?height=200&width=300&text=Green+Valley+PG",
    },
    {
      name: "Param Boys Hostel",
      location: "Kankot Rd, Near Labhubhai Trivedi Engineering Collage, Rajkot",
      price: 8200,
      rating: 4.3,
      reviews: 89,
      status: "Applied",
      image: "/placeholder.svg?height=200&width=300&text=Sunrise+Residency",
    },
    {
      name: "J. K. Boys Hostel",
      location: "Kankot Rd, Near Government Engineering Collage, Rajkot",
      price: 7800,
      rating: 4.1,
      reviews: 156,
      status: "Saved",
      image: "/placeholder.svg?height=200&width=300&text=Metro+Heights+PG",
    },
  ]

  recentPGs.innerHTML = ""
  placeholderPGs.forEach((pg) => {
    const pgCard = createPGCard(pg)
    recentPGs.appendChild(pgCard)
  })
}

// Load quick actions
function loadQuickActions() {
  const quickActions = document.getElementById("quickActions")
  if (!quickActions) return

  const actions =
    userType === "student"
      ? [
          { icon: "fas fa-search", label: "Search New PGs", color: "#3b82f6", href: "search.html" },
          { icon: "fas fa-calendar", label: "Schedule Visit", color: "#10b981", href: "visits.html" },
          { icon: "fas fa-comments", label: "Contact Owner", color: "#8b5cf6", href: "messages.html" },
          { icon: "fas fa-credit-card", label: "Make Payment", color: "#f59e0b", href: "payments.html" },
        ]
      : [
          { icon: "fas fa-plus", label: "Add Property", color: "#3b82f6", href: "list-property.html" },
          { icon: "fas fa-users", label: "Manage Tenants", color: "#10b981", href: "tenants.html" },
          { icon: "fas fa-comments", label: "View Inquiries", color: "#8b5cf6", href: "messages.html" },
          { icon: "fas fa-chart-line", label: "View Analytics", color: "#f59e0b", href: "analytics.html" },
        ]

  quickActions.innerHTML = ""
  actions.forEach((action) => {
    const actionBtn = createActionButton(action)
    quickActions.appendChild(actionBtn)
  })
}

// Create action button element
function createActionButton(action) {
  const button = document.createElement("a")
  button.className = "action-btn"
  button.href = action.href
  button.innerHTML = `
        <div class="action-icon" style="background-color: ${action.color}">
            <i class="${action.icon}"></i>
        </div>
        <span class="action-text">${action.label}</span>
    `
  return button
}

// Toggle sidebar for mobile
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar")
  if (sidebar) {
    sidebar.classList.toggle("open")
  }
}

// Utility functions
function getInitials(name) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

function showLoadingOverlay(show) {
  const overlay = document.getElementById("loadingOverlay")
  if (overlay) {
    overlay.style.display = show ? "flex" : "none"
  }
}

// Event handlers
function showNotifications() {
  showNotification("Notifications feature coming soon!", "info")
}

function showMessages() {
  window.location.href = "/messages"
}

function toggleUserMenu() {
  // Implement user menu toggle
  showNotification("User menu coming soon!", "info")
}

async function signOut() {
  try {
    // Call logout API
    await makeAPIRequest("/auth/logout", {
      method: "POST",
    })
  } catch (error) {
    console.error("Logout API failed:", error)
  } finally {
    // Clear local storage
    localStorage.removeItem("authToken")
    localStorage.removeItem("userData")

    showNotification("Signed out successfully", "success")

    // Redirect to home
    setTimeout(() => {
      window.location.href = "/"
    }, 2000)
  }
}
