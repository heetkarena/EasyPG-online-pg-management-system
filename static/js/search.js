// Search page JavaScript

// Global variables
let currentPage = 1
let totalPages = 1
const currentFilters = {}
let properties = []
let isLoading = false

// Initialize search page
document.addEventListener("DOMContentLoaded", () => {
  initializeSearchPage()
})

// Initialize search page
function initializeSearchPage() {
  // Check authentication
  checkAuthStatus()

  // Get search query from URL
  const urlParams = new URLSearchParams(window.location.search)
  const query = urlParams.get("q")

  if (query) {
    document.getElementById("locationSearch").value = query
    searchProperties()
  } else {
    loadProperties()
  }
}

// Check authentication status
function checkAuthStatus() {
  const token = localStorage.getItem("authToken")
  if (!token) {
    window.location.href = "login.html"
    return
  }
}

// Load properties
async function loadProperties() {
  try {
    setLoadingState(true)

    const response = await makeAPIRequest("/properties")
    properties = response.properties || []

    displayProperties(properties)
    updateResultsTitle(properties.length)

    if (response.pagination) {
      setupPagination(response.pagination)
    }
  } catch (error) {
    console.error("Failed to load properties:", error)
    showNoResults()
  } finally {
    setLoadingState(false)
  }
}

// Search properties
async function searchProperties() {
  if (isLoading) return

  try {
    setLoadingState(true)

    const searchQuery = document.getElementById("locationSearch").value.trim()
    const filters = getFilters()

    // Build query parameters
    const params = new URLSearchParams()

    if (searchQuery) {
      params.append("city", searchQuery)
    }

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "") {
        if (Array.isArray(filters[key])) {
          filters[key].forEach((value) => params.append(key, value))
        } else {
          params.append(key, filters[key])
        }
      }
    })

    params.append("page", currentPage)
    params.append("per_page", 12)

    const response = await makeAPIRequest(`/properties?${params.toString()}`)
    properties = response.properties || []

    displayProperties(properties)
    updateResultsTitle(properties.length, searchQuery)

    if (response.pagination) {
      setupPagination(response.pagination)
    }

    if (searchQuery) {
      showNotification(`Found ${properties.length} properties`, "success")
    }
  } catch (error) {
    console.error("Search failed:", error)
    showNotification("Search failed. Please try again.", "error")
    showNoResults()
  } finally {
    setLoadingState(false)
  }
}

// Get current filters
function getFilters() {
  const amenities = getSelectedAmenities()

  return {
    property_type: document.getElementById("propertyType").value,
    gender_preference: document.getElementById("genderPreference").value,
    min_rent: document.getElementById("minRent").value,
    max_rent: document.getElementById("maxRent").value,
    amenities: amenities.length > 0 ? amenities : undefined,
  }
}

// Get selected amenities
function getSelectedAmenities() {
  const checkboxes = document.querySelectorAll(".amenity-checkbox input:checked")
  return Array.from(checkboxes).map((cb) => cb.value)
}

// Display properties
function displayProperties(properties) {
  const grid = document.getElementById("propertiesGrid")
  const noResults = document.getElementById("noResults")

  if (!properties || properties.length === 0) {
    showNoResults()
    return
  }

  grid.innerHTML = ""

  properties.forEach((property, index) => {
    const propertyCard = createPropertyCard(property, index)
    grid.appendChild(propertyCard)
  })

  // Show grid
  grid.style.display = "grid"
  noResults.style.display = "none"
}

// Create property card
function createPropertyCard(property, index) {
  const card = document.createElement("div")
  card.className = "property-card"
  card.style.animationDelay = `${index * 0.1}s`

  const mainImage =
    property.images && property.images.length > 0
      ? property.images[0].image_url
      : `/placeholder.svg?height=220&width=350&text=${encodeURIComponent(property.property_name)}`

  const amenitiesHtml = property.amenities
    .slice(0, 3)
    .map((amenity) => {
      const icon = getAmenityIcon(amenity)
      return `
            <div class="amenity-tag">
                <i class="${icon}"></i>
                <span>${amenity}</span>
            </div>
        `
    })
    .join("")

  const moreAmenities =
    property.amenities.length > 3 ? `<span class="more-amenities">+${property.amenities.length - 3} more</span>` : ""

  card.innerHTML = `
        <div class="property-image-container">
            <img src="${mainImage}" alt="${property.property_name}" class="property-image" loading="lazy">
            <div class="property-badges">
                <span class="property-type-badge">${getPropertyTypeLabel(property.property_type)}</span>
            </div>
            <button class="save-btn" onclick="toggleSave('${property.id}', this)">
                <i class="far fa-heart"></i>
            </button>
        </div>
        
        <div class="property-content">
            <div class="property-header">
                <h3 class="property-name">${property.property_name}</h3>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${property.city}, ${property.state}</span>
                </div>
            </div>
            
            <div class="property-details">
                <div class="property-rating">
                    <i class="fas fa-star"></i>
                    <span>4.5</span>
                    <span class="rating-count">(124 reviews)</span>
                </div>
                <span class="gender-badge">${getGenderLabel(property.gender_preference)}</span>
            </div>
            
            <div class="property-amenities">
                ${amenitiesHtml}
                ${moreAmenities}
            </div>
            
            <div class="property-footer">
                <div class="property-price">
                    <span class="price-amount">₹${property.rent_per_month.toLocaleString()}</span>
                    <span class="price-period">/month</span>
                </div>
                <div class="property-availability">
                    ${property.available_rooms} rooms available
                </div>
            </div>
            
            <div class="property-actions">
                <button class="btn btn-outline" onclick="viewProperty('${property.id}')">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
                <button class="btn btn-primary" onclick="contactOwner('${property.id}')">
                    <i class="fas fa-comments"></i>
                    Contact Owner
                </button>
            </div>
        </div>
    `

  return card
}

// Get amenity icon
function getAmenityIcon(amenity) {
  const icons = {
    wifi: "fas fa-wifi",
    parking: "fas fa-car",
    meals: "fas fa-utensils",
    gym: "fas fa-dumbbell",
    security: "fas fa-shield-alt",
    power_backup: "fas fa-bolt",
    laundry: "fas fa-tshirt",
    ac: "fas fa-snowflake",
  }
  return icons[amenity.toLowerCase().replace(" ", "_")] || "fas fa-check"
}

// Get property type label
function getPropertyTypeLabel(type) {
  const labels = {
    boys_pg: "Boys PG",
    girls_pg: "Girls PG",
    co_living: "Co-living",
    hostel: "Hostel",
    shared_apartment: "Shared Apartment",
  }
  return labels[type] || type
}

// Get gender label
function getGenderLabel(gender) {
  const labels = {
    boys_only: "Boys Only",
    girls_only: "Girls Only",
    co_living: "Co-living",
  }
  return labels[gender] || gender
}

// Toggle filters visibility
function toggleFilters() {
  const container = document.getElementById("filtersContainer")
  const isVisible = container.style.display !== "none"
  container.style.display = isVisible ? "none" : "block"
}

// Apply filters
function applyFilters() {
  currentPage = 1
  searchProperties()
  toggleFilters()
}

// Clear filters
function clearFilters() {
  document.getElementById("propertyType").value = ""
  document.getElementById("genderPreference").value = ""
  document.getElementById("minRent").value = ""
  document.getElementById("maxRent").value = ""

  // Clear amenity checkboxes
  const checkboxes = document.querySelectorAll(".amenity-checkbox input")
  checkboxes.forEach((cb) => (cb.checked = false))

  // Reload properties
  currentPage = 1
  loadProperties()
}

// Sort results
function sortResults() {
  const sortBy = document.getElementById("sortBy").value

  const sortedProperties = [...properties]

  switch (sortBy) {
    case "price_low":
      sortedProperties.sort((a, b) => a.rent_per_month - b.rent_per_month)
      break
    case "price_high":
      sortedProperties.sort((a, b) => b.rent_per_month - a.rent_per_month)
      break
    case "rating":
      // Placeholder sorting by rating
      sortedProperties.sort((a, b) => 4.5 - 4.5) // All have same rating for demo
      break
    case "distance":
      // Placeholder sorting by distance
      break
    default:
      // Keep original order for relevance
      break
  }

  displayProperties(sortedProperties)
}

// Set loading state
function setLoadingState(loading) {
  const loadingState = document.getElementById("loadingState")
  const searchResults = document.getElementById("searchResults")
  const noResults = document.getElementById("noResults")

  isLoading = loading

  if (loading) {
    loadingState.style.display = "flex"
    searchResults.style.display = "none"
    noResults.style.display = "none"
  } else {
    loadingState.style.display = "none"
    searchResults.style.display = "block"
  }
}

// Show no results
function showNoResults() {
  document.getElementById("noResults").style.display = "flex"
  document.getElementById("searchResults").style.display = "none"
  updateResultsTitle(0)
}

// Update results title
function updateResultsTitle(count, query = "") {
  const title = document.getElementById("resultsTitle")
  if (query) {
    title.textContent = `${count} properties found for "${query}"`
  } else {
    title.textContent = `${count} properties found`
  }
}

// Setup pagination
function setupPagination(pagination) {
  const paginationContainer = document.getElementById("pagination")
  const pageNumbers = document.getElementById("pageNumbers")
  const prevBtn = document.getElementById("prevBtn")
  const nextBtn = document.getElementById("nextBtn")

  if (pagination.pages <= 1) {
    paginationContainer.style.display = "none"
    return
  }

  currentPage = pagination.page
  totalPages = pagination.pages

  // Update buttons
  prevBtn.disabled = !pagination.has_prev
  nextBtn.disabled = !pagination.has_next

  // Generate page numbers
  pageNumbers.innerHTML = ""
  for (let i = 1; i <= Math.min(pagination.pages, 5); i++) {
    const pageBtn = document.createElement("button")
    pageBtn.className = `page-btn ${i === currentPage ? "active" : ""}`
    pageBtn.textContent = i
    pageBtn.onclick = () => goToPage(i)
    pageNumbers.appendChild(pageBtn)
  }

  paginationContainer.style.display = "flex"
}

// Go to page
function goToPage(page) {
  if (page !== currentPage && page >= 1 && page <= totalPages) {
    currentPage = page
    searchProperties()
  }
}

// Previous page
function previousPage() {
  if (currentPage > 1) {
    goToPage(currentPage - 1)
  }
}

// Next page
function nextPage() {
  if (currentPage < totalPages) {
    goToPage(currentPage + 1)
  }
}

// Property actions
function toggleSave(propertyId, button) {
  // Toggle save state
  const icon = button.querySelector("i")

  if (icon.classList.contains("far")) {
    icon.classList.remove("far")
    icon.classList.add("fas")
    button.classList.add("saved")
    showNotification("Property saved!", "success")
  } else {
    icon.classList.remove("fas")
    icon.classList.add("far")
    button.classList.remove("saved")
    showNotification("Property removed from saved", "info")
  }
}

function viewProperty(propertyId) {
  window.location.href = `property.html?id=${propertyId}`
}

function contactOwner(propertyId) {
  window.location.href = `messages.html?property=${propertyId}`
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification)
    }
  }, 3000)
}

// API helper function
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
