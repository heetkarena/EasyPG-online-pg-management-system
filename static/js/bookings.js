// Bookings JavaScript - Handle booking functionality

let allBookings = []
let currentBookingId = null

// Initialize bookings
document.addEventListener('DOMContentLoaded', () => {
    const bookingsContainer = document.querySelector('[data-page="bookings"]') ||
                              document.querySelector('.bookings-container') ||
                              document.querySelector('.dashboard-section[data-section="bookings"]')

    if (bookingsContainer) {
        initializeBookings()
    }
})

function initializeBookings() {
    redirectIfNotLoggedIn()
    loadBookings()
    setupBookingHandlers()
}

// Load all bookings
async function loadBookings() {
    try {
        showLoading('Loading bookings...')
        const data = await BookingsAPI.getAll()
        allBookings = data.bookings || []
        renderBookings()
        hideLoading()
    } catch (error) {
        console.error('Error loading bookings:', error)
        showNotification('Failed to load bookings', 'error')
        hideLoading()
    }
}

// Render bookings
function renderBookings() {
    const bookingsContainer = document.querySelector('.bookings-list') ||
                             document.querySelector('.bookings-table tbody')
    if (!bookingsContainer) return

    if (allBookings.length === 0) {
        bookingsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>No bookings yet</p>
                <a href="/search" class="btn btn-primary">Browse Properties</a>
            </div>
        `
        return
    }

    if (bookingsContainer.classList.contains('bookings-list')) {
        bookingsContainer.innerHTML = allBookings.map(booking => `
            <div class="booking-card" onclick="viewBookingDetails('${booking.id}')">
                <div class="booking-header">
                    <h3>${booking.property_name}</h3>
                    <span class="status-badge status-${booking.status}">${booking.status}</span>
                </div>
                <div class="booking-info">
                    <p><strong>Location:</strong> ${booking.city}</p>
                    <p><strong>Check-in:</strong> ${formatDate(booking.check_in_date)}</p>
                    <p><strong>Check-out:</strong> ${formatDate(booking.check_out_date)}</p>
                    <p><strong>Monthly Rent:</strong> ${formatCurrency(booking.monthly_rent)}</p>
                    <p><strong>Total Amount:</strong> ${formatCurrency(booking.total_amount)}</p>
                </div>
                <div class="booking-actions">
                    <button onclick="editBooking('${booking.id}', event)" class="btn-small btn-primary">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${booking.status === 'pending' ? `
                        <button onclick="cancelBooking('${booking.id}', event)" class="btn-small btn-danger">
                            <i class="fas fa-trash"></i> Cancel
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('')
    } else {
        // Table view
        bookingsContainer.innerHTML = allBookings.map(booking => `
            <tr>
                <td>${booking.property_name}</td>
                <td>${booking.city}</td>
                <td>${formatDate(booking.check_in_date)}</td>
                <td>${formatDate(booking.check_out_date)}</td>
                <td>${formatCurrency(booking.monthly_rent)}</td>
                <td>
                    <span class="status-badge status-${booking.status}">${booking.status}</span>
                </td>
                <td>
                    <button onclick="viewBookingDetails('${booking.id}')" class="btn-icon" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${booking.status === 'pending' ? `
                        <button onclick="cancelBooking('${booking.id}', event)" class="btn-icon" title="Cancel">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('')
    }
}

// Create new booking
async function createBooking(propertyId) {
    const modal = document.getElementById('bookingModal')
    if (!modal) return

    modal.style.display = 'block'

    const form = document.querySelector('.booking-form')
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault()

            const formData = {
                property_id: propertyId,
                check_in_date: document.getElementById('checkInDate').value,
                check_out_date: document.getElementById('checkOutDate').value,
                monthly_rent: parseFloat(document.getElementById('monthlyRent').value),
                total_amount: parseFloat(document.getElementById('totalAmount').value)
            }

            if (!formData.check_in_date || !formData.check_out_date) {
                showNotification('Please select both dates', 'error')
                return
            }

            try {
                showLoading('Creating booking...')
                await BookingsAPI.create(formData)
                hideLoading()
                showNotification('Booking created successfully', 'success')
                modal.style.display = 'none'
                form.reset()
                loadBookings()
            } catch (error) {
                hideLoading()
                console.error('Error creating booking:', error)
                showNotification('Failed to create booking', 'error')
            }
        }
    }
}

// View booking details
function viewBookingDetails(bookingId) {
    const booking = allBookings.find(b => b.id === bookingId)
    if (!booking) return

    const modal = document.getElementById('bookingDetailsModal')
    if (!modal) return

    const content = modal.querySelector('.modal-content')
    if (content) {
        content.innerHTML = `
            <span class="close" onclick="closeModal('bookingDetailsModal')">&times;</span>
            <h2>Booking Details</h2>
            <div class="booking-details">
                <div class="detail-group">
                    <label>Property Name</label>
                    <p>${booking.property_name}</p>
                </div>
                <div class="detail-group">
                    <label>City</label>
                    <p>${booking.city}</p>
                </div>
                <div class="detail-group">
                    <label>Check-in Date</label>
                    <p>${formatDate(booking.check_in_date)}</p>
                </div>
                <div class="detail-group">
                    <label>Check-out Date</label>
                    <p>${formatDate(booking.check_out_date)}</p>
                </div>
                <div class="detail-group">
                    <label>Monthly Rent</label>
                    <p>${formatCurrency(booking.monthly_rent)}</p>
                </div>
                <div class="detail-group">
                    <label>Total Amount</label>
                    <p>${formatCurrency(booking.total_amount)}</p>
                </div>
                <div class="detail-group">
                    <label>Status</label>
                    <p><span class="status-badge status-${booking.status}">${booking.status}</span></p>
                </div>
                <div class="detail-actions">
                    ${booking.status === 'pending' ? `
                        <button onclick="updateBookingStatus('${booking.id}', 'confirmed')" class="btn btn-primary">
                            <i class="fas fa-check"></i> Confirm
                        </button>
                        <button onclick="updateBookingStatus('${booking.id}', 'cancelled')" class="btn btn-danger">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    ` : ''}
                    <button onclick="processPayment('${booking.id}')" class="btn btn-success">
                        <i class="fas fa-credit-card"></i> Pay Now
                    </button>
                </div>
            </div>
        `
    }

    modal.style.display = 'block'
}

// Edit booking
function editBooking(bookingId, event) {
    event.stopPropagation()
    const booking = allBookings.find(b => b.id === bookingId)
    if (!booking) return

    const modal = document.getElementById('bookingModal')
    if (!modal) return

    const form = document.querySelector('.booking-form')
    if (form) {
        document.getElementById('checkInDate').value = booking.check_in_date
        document.getElementById('checkOutDate').value = booking.check_out_date
        document.getElementById('monthlyRent').value = booking.monthly_rent
        document.getElementById('totalAmount').value = booking.total_amount

        form.onsubmit = async (e) => {
            e.preventDefault()

            try {
                showLoading('Updating booking...')
                await BookingsAPI.update(bookingId, 'pending')
                hideLoading()
                showNotification('Booking updated successfully', 'success')
                modal.style.display = 'none'
                form.reset()
                loadBookings()
            } catch (error) {
                hideLoading()
                console.error('Error updating booking:', error)
                showNotification('Failed to update booking', 'error')
            }
        }
    }

    modal.style.display = 'block'
}

// Update booking status
async function updateBookingStatus(bookingId, status) {
    try {
        showLoading(`${status === 'confirmed' ? 'Confirming' : 'Cancelling'} booking...`)
        await BookingsAPI.update(bookingId, status)
        hideLoading()
        showNotification(`Booking ${status} successfully`, 'success')
        loadBookings()
        closeModal('bookingDetailsModal')
    } catch (error) {
        hideLoading()
        console.error('Error updating booking:', error)
        showNotification('Failed to update booking', 'error')
    }
}

// Cancel booking
async function cancelBooking(bookingId, event) {
    event.stopPropagation()

    if (!confirm('Are you sure you want to cancel this booking?')) {
        return
    }

    await updateBookingStatus(bookingId, 'cancelled')
}

// Process payment
function processPayment(bookingId) {
    const booking = allBookings.find(b => b.id === bookingId)
    if (!booking) return

    // Redirect to payments page with booking ID
    window.location.href = `/payments?booking_id=${bookingId}`
}

// Setup booking handlers
function setupBookingHandlers() {
    // Book property button
    const bookPropertyBtns = document.querySelectorAll('[data-action="book-property"]')
    bookPropertyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const propertyId = btn.dataset.propertyId
            createBooking(propertyId)
        })
    })

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('bookingModal')
        if (event.target === modal) {
            modal.style.display = 'none'
        }

        const detailsModal = document.getElementById('bookingDetailsModal')
        if (event.target === detailsModal) {
            detailsModal.style.display = 'none'
        }
    })
}

// Close modal helper
function closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
        modal.style.display = 'none'
    }
}

// Calculate total amount based on dates and rent
function calculateTotalAmount() {
    const checkIn = new Date(document.getElementById('checkInDate').value)
    const checkOut = new Date(document.getElementById('checkOutDate').value)
    const monthlyRent = parseFloat(document.getElementById('monthlyRent').value) || 0

    if (checkIn && checkOut && monthlyRent) {
        const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
        const dailyRent = monthlyRent / 30
        const totalAmount = dailyRent * days

        document.getElementById('totalAmount').value = totalAmount.toFixed(2)
    }
}

// Add event listeners for date and rent changes
document.addEventListener('DOMContentLoaded', () => {
    const dateInputs = document.querySelectorAll('#checkInDate, #checkOutDate')
    const rentInput = document.getElementById('monthlyRent')

    dateInputs.forEach(input => {
        input.addEventListener('change', calculateTotalAmount)
    })

    if (rentInput) {
        rentInput.addEventListener('change', calculateTotalAmount)
    }
})
