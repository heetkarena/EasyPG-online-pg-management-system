// Payments JavaScript - Handle payments

let allPayments = []
let currentPaymentId = null

// Initialize payments page
document.addEventListener('DOMContentLoaded', () => {
    const paymentsContainer = document.querySelector('[data-page="payments"]') ||
                             document.querySelector('.payments-container') ||
                             document.querySelector('.dashboard-section[data-section="payments"]')

    if (paymentsContainer) {
        initializePayments()
    }
})

function initializePayments() {
    redirectIfNotLoggedIn()
    loadPayments()
    setupPaymentHandlers()
}

// Load all payments
async function loadPayments() {
    try {
        showLoading('Loading payment history...')
        // Note: You might need to create a GET /api/payments endpoint for fetching all payments
        // For now, we'll load from bookings and show associated payments
        const bookingsData = await BookingsAPI.getAll()
        renderPayments(bookingsData.bookings || [])
        hideLoading()
    } catch (error) {
        console.error('Error loading payments:', error)
        showNotification('Failed to load payments', 'error')
        hideLoading()
    }
}

// Render payments
function renderPayments(bookings) {
    const paymentsContainer = document.querySelector('.payments-list') ||
                             document.querySelector('.payments-table tbody')
    if (!paymentsContainer) return

    if (bookings.length === 0) {
        paymentsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-credit-card"></i>
                <p>No payments yet</p>
                <a href="/search" class="btn btn-primary">Book a Property</a>
            </div>
        `
        return
    }

    if (paymentsContainer.classList.contains('payments-list')) {
        paymentsContainer.innerHTML = bookings.map((booking, index) => `
            <div class="payment-card">
                <div class="payment-header">
                    <h3>Payment #${String(index + 1).padStart(5, '0')}</h3>
                    <span class="status-badge status-${getPaymentStatus(booking.status)}">
                        ${getPaymentStatusText(booking.status)}
                    </span>
                </div>
                <div class="payment-info">
                    <p><strong>Property:</strong> ${booking.property_name}</p>
                    <p><strong>Amount:</strong> ${formatCurrency(booking.total_amount)}</p>
                    <p><strong>Date:</strong> ${formatDate(booking.created_at)}</p>
                    <p><strong>Duration:</strong> ${formatDate(booking.check_in_date)} to ${formatDate(booking.check_out_date)}</p>
                </div>
                <div class="payment-actions">
                    ${booking.status === 'pending' || booking.status === 'confirmed' ? `
                        <button onclick="initiatePayment('${booking.id}', '${booking.total_amount}')" class="btn btn-primary">
                            <i class="fas fa-credit-card"></i> Pay Now
                        </button>
                    ` : ''}
                    <button onclick="viewPaymentDetails('${booking.id}')" class="btn btn-outline">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
        `).join('')
    } else {
        // Table view
        paymentsContainer.innerHTML = bookings.map((booking, index) => `
            <tr>
                <td>
                    <span class="payment-id">#${String(index + 1).padStart(5, '0')}</span>
                </td>
                <td>${booking.property_name}</td>
                <td>${formatCurrency(booking.total_amount)}</td>
                <td>${formatDate(booking.created_at)}</td>
                <td>
                    <span class="status-badge status-${getPaymentStatus(booking.status)}">
                        ${getPaymentStatusText(booking.status)}
                    </span>
                </td>
                <td>
                    <button onclick="viewPaymentDetails('${booking.id}')" class="btn-icon" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${booking.status === 'pending' || booking.status === 'confirmed' ? `
                        <button onclick="initiatePayment('${booking.id}', '${booking.total_amount}')" class="btn-icon" title="Pay">
                            <i class="fas fa-credit-card"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('')
    }
}

// Get payment status
function getPaymentStatus(bookingStatus) {
    const statusMap = {
        'pending': 'pending',
        'confirmed': 'completed',
        'cancelled': 'cancelled'
    }
    return statusMap[bookingStatus] || 'pending'
}

// Get payment status text
function getPaymentStatusText(bookingStatus) {
    const statusMap = {
        'pending': 'Pending',
        'confirmed': 'Completed',
        'cancelled': 'Cancelled'
    }
    return statusMap[bookingStatus] || 'Pending'
}

// Initiate payment
async function initiatePayment(bookingId, amount) {
    const modal = document.getElementById('paymentModal')
    if (!modal) return

    const paymentForm = modal.querySelector('.payment-form')
    if (paymentForm) {
        paymentForm.innerHTML = `
            <h3>Make Payment</h3>
            <div class="payment-summary">
                <div class="summary-item">
                    <span>Amount:</span>
                    <strong>${formatCurrency(amount)}</strong>
                </div>
                <div class="summary-item">
                    <span>Payment Method:</span>
                    <select id="paymentMethod" class="form-control" required>
                        <option value="">Select Payment Method</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="upi">UPI</option>
                        <option value="net_banking">Net Banking</option>
                        <option value="wallet">Digital Wallet</option>
                    </select>
                </div>
            </div>

            <div id="cardDetails" class="payment-details" style="display:none;">
                <div class="form-group">
                    <label>Card Number</label>
                    <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" class="form-control">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Expiry Date</label>
                        <input type="text" id="cardExpiry" placeholder="MM/YY" maxlength="5" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>CVV</label>
                        <input type="password" id="cardCVV" placeholder="123" maxlength="3" class="form-control">
                    </div>
                </div>
            </div>

            <div id="upiDetails" class="payment-details" style="display:none;">
                <div class="form-group">
                    <label>UPI ID</label>
                    <input type="text" id="upiId" placeholder="user@upi" class="form-control">
                </div>
            </div>

            <div class="form-group">
                <label>
                    <input type="checkbox" id="agreeTerms" required>
                    I agree to the terms and conditions
                </label>
            </div>

            <div class="form-actions">
                <button type="button" onclick="closeModal('paymentModal')" class="btn btn-outline">Cancel</button>
                <button type="button" onclick="processPayment('${bookingId}', '${amount}')" class="btn btn-primary">
                    <i class="fas fa-lock"></i> Pay ${formatCurrency(amount)}
                </button>
            </div>
        `

        // Show/hide payment details based on method selection
        const paymentMethod = document.getElementById('paymentMethod')
        const cardDetails = document.getElementById('cardDetails')
        const upiDetails = document.getElementById('upiDetails')

        if (paymentMethod) {
            paymentMethod.addEventListener('change', (e) => {
                cardDetails.style.display = e.target.value === 'credit_card' || e.target.value === 'debit_card' ? 'block' : 'none'
                upiDetails.style.display = e.target.value === 'upi' ? 'block' : 'none'
            })
        }
    }

    modal.style.display = 'block'
}

// Process payment
async function processPayment(bookingId, amount) {
    const paymentMethod = document.getElementById('paymentMethod')?.value
    const agreeTerms = document.getElementById('agreeTerms')?.checked

    if (!paymentMethod) {
        showNotification('Please select a payment method', 'error')
        return
    }

    if (!agreeTerms) {
        showNotification('Please agree to terms and conditions', 'error')
        return
    }

    // Validate payment details based on method
    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
        const cardNumber = document.getElementById('cardNumber')?.value
        const cardExpiry = document.getElementById('cardExpiry')?.value
        const cardCVV = document.getElementById('cardCVV')?.value

        if (!cardNumber || !cardExpiry || !cardCVV) {
            showNotification('Please enter all card details', 'error')
            return
        }

        // Basic validation
        if (cardNumber.replace(/\s/g, '').length !== 16) {
            showNotification('Invalid card number', 'error')
            return
        }
    } else if (paymentMethod === 'upi') {
        const upiId = document.getElementById('upiId')?.value
        if (!upiId || !upiId.includes('@')) {
            showNotification('Invalid UPI ID', 'error')
            return
        }
    }

    try {
        showLoading('Processing payment...')

        const paymentData = {
            booking_id: bookingId,
            amount: parseFloat(amount),
            payment_method: paymentMethod
        }

        const response = await PaymentsAPI.create(paymentData)
        hideLoading()

        showNotification('Payment processed successfully', 'success')

        // Close modal
        const modal = document.getElementById('paymentModal')
        if (modal) {
            modal.style.display = 'none'
        }

        // Reload payments
        loadPayments()

        // Show success message
        displayPaymentSuccess(response.payment?.id)
    } catch (error) {
        hideLoading()
        console.error('Error processing payment:', error)
        showNotification('Payment failed: ' + error.message, 'error')
    }
}

// View payment details
function viewPaymentDetails(bookingId) {
    const modal = document.getElementById('paymentDetailsModal')
    if (!modal) return

    // Fetch and display payment details
    const content = modal.querySelector('.modal-content')
    if (content) {
        content.innerHTML = `
            <span class="close" onclick="closeModal('paymentDetailsModal')">&times;</span>
            <h2>Payment Receipt</h2>
            <div class="receipt">
                <div class="receipt-header">
                    <h3>EasyPG</h3>
                    <p>Payment Receipt</p>
                </div>
                <div class="receipt-details">
                    <div class="receipt-item">
                        <span>Receipt #:</span>
                        <span>#REC${String(Date.now()).slice(-6)}</span>
                    </div>
                    <div class="receipt-item">
                        <span>Date:</span>
                        <span>${formatDate(new Date())}</span>
                    </div>
                    <div class="receipt-item">
                        <span>Booking ID:</span>
                        <span>${bookingId}</span>
                    </div>
                </div>
                <div class="receipt-total">
                    <span>Total Amount:</span>
                    <strong>Amount shown here</strong>
                </div>
                <div class="receipt-footer">
                    <p>Thank you for your payment!</p>
                </div>
            </div>
            <div class="receipt-actions">
                <button onclick="downloadReceipt()" class="btn btn-outline">
                    <i class="fas fa-download"></i> Download
                </button>
                <button onclick="closeModal('paymentDetailsModal')" class="btn btn-primary">Close</button>
            </div>
        `
    }

    modal.style.display = 'block'
}

// Display payment success
function displayPaymentSuccess(paymentId) {
    const successModal = document.getElementById('paymentSuccessModal')
    if (successModal) {
        successModal.style.display = 'block'
        setTimeout(() => {
            successModal.style.display = 'none'
        }, 3000)
    }
}

// Download receipt
function downloadReceipt() {
    // In a real app, generate PDF receipt
    showNotification('Receipt downloaded', 'success')
}

// Format card number input
function formatCardNumber(value) {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
}

// Setup payment handlers
function setupPaymentHandlers() {
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber')
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            e.target.value = formatCardNumber(e.target.value)
        })
    }

    // Expiry date formatting
    const cardExpiryInput = document.getElementById('cardExpiry')
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '')
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4)
            }
            e.target.value = value
        })
    }

    // CVV only numbers
    const cvvInput = document.getElementById('cardCVV')
    if (cvvInput) {
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '')
        })
    }

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('paymentModal')
        if (event.target === modal) {
            modal.style.display = 'none'
        }

        const detailsModal = document.getElementById('paymentDetailsModal')
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
