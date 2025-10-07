// Main JavaScript file for EasyPG

// Global variables
let currentUser = null
let isMenuOpen = false
const isLoading = false

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

// Initialize application
function initializeApp() {
  // Check if user is logged in
  checkAuthStatus()

  // Initialize homepage functionality
  initializeHomepage()
}

// Initialize homepage functionality
function initializeHomepage() {
  setupNavigation()
  setupSearch()
  setupAnimations()
  setupScrollEffects()
  initializeSmoothScrolling()
}

// Check authentication status
function checkAuthStatus() {
  const token = localStorage.getItem("authToken")
  const userData = localStorage.getItem("userData")

  if (token && userData) {
    currentUser = JSON.parse(userData)
    console.log("User is logged in:", currentUser)
  }
}

// Setup navigation
function setupNavigation() {
  const navToggle = document.querySelector(".nav-toggle")
  const navMenu = document.querySelector(".nav-menu")

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", toggleMobileMenu)
  }

  // Close menu when clicking on links
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (isMenuOpen) {
        toggleMobileMenu()
      }
    })
  })
}

// Toggle mobile menu
function toggleMobileMenu() {
  const navMenu = document.querySelector(".nav-menu")
  const navToggle = document.querySelector(".nav-toggle")

  isMenuOpen = !isMenuOpen

  if (navMenu) {
    navMenu.classList.toggle("active", isMenuOpen)
  }

  if (navToggle) {
    const icon = navToggle.querySelector("i")
    if (icon) {
      icon.className = isMenuOpen ? "fas fa-times" : "fas fa-bars"
    }
  }
}

// Setup search functionality
function setupSearch() {
  const locationInput = document.getElementById("locationInput")
  const searchForm = document.querySelector(".hero-search")

  if (locationInput) {
    // Handle enter key press
    locationInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        searchPGs()
      }
    })

    // Add autocomplete suggestions (placeholder)
    locationInput.addEventListener("input", handleSearchInput)
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault()
      searchPGs()
    })
  }
}

// Handle search input
function handleSearchInput(e) {
  const query = e.target.value.trim()

  // Here you could implement autocomplete suggestions
  // For now, we'll just validate the input
  if (query.length > 0) {
    e.target.style.borderColor = "#10b981"
  } else {
    e.target.style.borderColor = "#e5e7eb"
  }
}

// Search PGs function
function searchPGs() {
  const locationInput = document.getElementById("locationInput")
  const query = locationInput ? locationInput.value.trim() : ""

  if (!query) {
    showNotification("Please enter a location to search", "warning")
    return
  }

  // Show loading state
  showNotification("Searching for PGs...", "info")

  // Simulate search delay
  setTimeout(() => {
    // Redirect to search page with query
    window.location.href = `search.html?q=${encodeURIComponent(query)}`
  }, 1000)
}

// Initialize smooth scrolling for anchor links
function initializeSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]')

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      const targetId = this.getAttribute("href").substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
}

// Setup animations
function setupAnimations() {
  // Animate elements on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
      }
    })
  }, observerOptions)

  // Observe elements for animation
  const animateElements = document.querySelectorAll(".feature-card, .step-card")
  animateElements.forEach((el) => {
    observer.observe(el)
  })
}

// Setup scroll effects
function setupScrollEffects() {
  let lastScrollTop = 0
  const navbar = document.querySelector(".navbar")

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    // Hide/show navbar on scroll
    if (navbar) {
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        navbar.style.transform = "translateY(-100%)"
      } else {
        navbar.style.transform = "translateY(0)"
      }
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop
  })

  // Add scroll-based navbar background
  window.addEventListener("scroll", () => {
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled")
      } else {
        navbar.classList.remove("scrolled")
      }
    }
  })
}

// Show notification
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

// API helper functions
const API_BASE_URL = "http://localhost:5000/api"

// Make API request
async function makeAPIRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
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
      throw new Error(data.message || "Request failed")
    }

    return data
  } catch (error) {
    console.error("API Request failed:", error)
    throw error
  }
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
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

// Add CSS for animations
const style = document.createElement("style")
style.textContent = `
    .navbar {
        transition: transform 0.3s ease, background-color 0.3s ease;
    }
    
    .navbar.scrolled {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
    }
    
    .nav-menu.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        padding: 20px;
        gap: 20px;
    }
    
    .feature-card, .step-card {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .feature-card.animate-in, .step-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    }
    
    .notification.success {
        background: #10b981;
    }
    
    .notification.error {
        background: #ef4444;
    }
    
    .notification.warning {
        background: #f59e0b;
    }
    
    .notification.info {
        background: #3b82f6;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            display: none;
        }
        
        .nav-menu.active {
            display: flex;
        }
    }
`
document.head.appendChild(style)
