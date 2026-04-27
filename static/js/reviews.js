// Reviews JavaScript - Handle reviews and ratings

let currentPropertyReviews = []
let currentPropertyId = null

// Initialize reviews page
document.addEventListener('DOMContentLoaded', () => {
    const reviewsSection = document.querySelector('[data-page="reviews"]') ||
                          document.querySelector('.reviews-section') ||
                          document.querySelector('.property-reviews')

    if (reviewsSection) {
        initializeReviews()
    }
})

function initializeReviews() {
    redirectIfNotLoggedIn()

    // Get property ID from URL or data attribute
    const urlParams = new URLSearchParams(window.location.search)
    currentPropertyId = urlParams.get('property_id') ||
                        document.querySelector('[data-property-id]')?.dataset.propertyId

    if (currentPropertyId) {
        loadPropertyReviews()
    }

    setupReviewHandlers()
}

// Load reviews for a property
async function loadPropertyReviews() {
    try {
        showLoading('Loading reviews...')
        const data = await ReviewsAPI.getByProperty(currentPropertyId)
        currentPropertyReviews = data.reviews || []
        renderReviews()
        hideLoading()
    } catch (error) {
        console.error('Error loading reviews:', error)
        showNotification('Failed to load reviews', 'error')
        hideLoading()
    }
}

// Render reviews
function renderReviews() {
    const reviewsContainer = document.querySelector('.reviews-list') ||
                            document.querySelector('.reviews-container')
    if (!reviewsContainer) return

    if (currentPropertyReviews.length === 0) {
        reviewsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <p>No reviews yet. Be the first to review this property!</p>
            </div>
        `
        return
    }

    // Calculate average rating
    const avgRating = currentPropertyReviews.reduce((sum, r) => sum + r.rating, 0) / currentPropertyReviews.length

    // Render summary
    const summaryDiv = document.querySelector('.reviews-summary')
    if (summaryDiv) {
        summaryDiv.innerHTML = `
            <div class="rating-summary">
                <div class="rating-number">${avgRating.toFixed(1)}</div>
                <div class="stars">${renderStars(avgRating, 'large')}</div>
                <p>${currentPropertyReviews.length} Reviews</p>
            </div>
        `
    }

    // Render individual reviews
    reviewsContainer.innerHTML = currentPropertyReviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="avatar">${getInitials(review.student_name)}</div>
                    <div>
                        <h4>${review.student_name}</h4>
                        <span class="date">${formatDate(review.created_at)}</span>
                    </div>
                </div>
                <div class="rating">${renderStars(review.rating)}</div>
            </div>
            <div class="review-content">
                <h5>${review.review_title}</h5>
                <p>${review.review_text}</p>
            </div>
            <div class="review-actions">
                <button onclick="likeReview(this)" class="btn-icon" title="Helpful">
                    <i class="fas fa-thumbs-up"></i>
                    <span class="like-count">0</span>
                </button>
            </div>
        </div>
    `).join('')
}

// Post new review
async function postReview(e) {
    e.preventDefault()

    if (!currentPropertyId) {
        showNotification('Property ID not found', 'error')
        return
    }

    const rating = document.getElementById('rating')?.value
    const title = document.getElementById('reviewTitle')?.value
    const text = document.getElementById('reviewText')?.value

    if (!rating || !title || !text) {
        showNotification('Please fill all fields', 'error')
        return
    }

    if (title.length < 5) {
        showNotification('Title must be at least 5 characters', 'error')
        return
    }

    if (text.length < 20) {
        showNotification('Review must be at least 20 characters', 'error')
        return
    }

    try {
        showLoading('Posting review...')
        const reviewData = {
            property_id: currentPropertyId,
            rating: parseInt(rating),
            review_title: title,
            review_text: text
        }

        await ReviewsAPI.create(reviewData)
        hideLoading()
        showNotification('Review posted successfully', 'success')

        // Reset form
        document.querySelector('.review-form')?.reset()
        document.getElementById('rating').value = 5

        // Reload reviews
        loadPropertyReviews()
    } catch (error) {
        hideLoading()
        console.error('Error posting review:', error)
        showNotification('Failed to post review', 'error')
    }
}

// Render star rating
function renderStars(rating, size = 'normal') {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    let starsHtml = ''

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHtml += `<i class="fas fa-star"></i>`
        } else if (i === fullStars && hasHalfStar) {
            starsHtml += `<i class="fas fa-star-half-alt"></i>`
        } else {
            starsHtml += `<i class="far fa-star"></i>`
        }
    }

    return `<div class="stars ${size}">${starsHtml}</div>`
}

// Update star rating input
function updateStarRating(value) {
    document.getElementById('rating').value = value

    const stars = document.querySelectorAll('.rating-input .star')
    stars.forEach((star, index) => {
        if (index < value) {
            star.classList.add('active')
        } else {
            star.classList.remove('active')
        }
    })
}

// Like review
function likeReview(button) {
    const likeCount = button.querySelector('.like-count')
    const currentCount = parseInt(likeCount.textContent)
    likeCount.textContent = currentCount + 1

    button.classList.add('liked')
    button.disabled = true

    // In a real app, you'd send this to the server
}

// Filter reviews by rating
function filterReviewsByRating(rating) {
    const reviewsContainer = document.querySelector('.reviews-list')
    if (!reviewsContainer) return

    if (rating === 0) {
        renderReviews()
        return
    }

    const filtered = currentPropertyReviews.filter(r => r.rating === rating)

    if (filtered.length === 0) {
        reviewsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No reviews with ${rating} stars</p>
            </div>
        `
        return
    }

    reviewsContainer.innerHTML = filtered.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="avatar">${getInitials(review.student_name)}</div>
                    <div>
                        <h4>${review.student_name}</h4>
                        <span class="date">${formatDate(review.created_at)}</span>
                    </div>
                </div>
                <div class="rating">${renderStars(review.rating)}</div>
            </div>
            <div class="review-content">
                <h5>${review.review_title}</h5>
                <p>${review.review_text}</p>
            </div>
        </div>
    `).join('')
}

// Sort reviews
function sortReviews(sortBy) {
    let sorted = [...currentPropertyReviews]

    switch (sortBy) {
        case 'newest':
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            break
        case 'oldest':
            sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            break
        case 'highest':
            sorted.sort((a, b) => b.rating - a.rating)
            break
        case 'lowest':
            sorted.sort((a, b) => a.rating - b.rating)
            break
    }

    currentPropertyReviews = sorted
    renderReviews()
}

// Setup review handlers
function setupReviewHandlers() {
    // Review form submit
    const reviewForm = document.querySelector('.review-form')
    if (reviewForm) {
        reviewForm.addEventListener('submit', postReview)
    }

    // Rating input
    const stars = document.querySelectorAll('.rating-input .star')
    stars.forEach((star, index) => {
        star.addEventListener('click', () => updateStarRating(index + 1))
        star.addEventListener('mouseover', () => {
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.add('hover')
                } else {
                    s.classList.remove('hover')
                }
            })
        })
    })

    document.querySelector('.rating-input')?.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hover'))
    })

    // Filter and sort
    const filterSelects = document.querySelectorAll('[data-filter="rating"]')
    filterSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            filterReviewsByRating(parseInt(e.target.value))
        })
    })

    const sortSelects = document.querySelectorAll('[data-sort="reviews"]')
    sortSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            sortReviews(e.target.value)
        })
    })

    // Character counter for review text
    const reviewText = document.getElementById('reviewText')
    if (reviewText) {
        const counter = document.querySelector('.char-count')
        reviewText.addEventListener('input', () => {
            const remaining = 500 - reviewText.value.length
            if (counter) {
                counter.textContent = `${reviewText.value.length}/500`
                if (remaining < 50) {
                    counter.classList.add('warning')
                } else {
                    counter.classList.remove('warning')
                }
            }
        })
    }

    // Character counter for title
    const reviewTitle = document.getElementById('reviewTitle')
    if (reviewTitle) {
        const titleCounter = document.querySelector('.title-char-count')
        reviewTitle.addEventListener('input', () => {
            if (titleCounter) {
                titleCounter.textContent = `${reviewTitle.value.length}/100`
            }
        })
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    const reviewsPage = document.querySelector('[data-page="property-detail"]') ||
                        document.querySelector('.property-detail')

    if (reviewsPage) {
        // Load reviews for the property on this page
        const propId = reviewsPage.dataset.propertyId
        if (propId) {
            currentPropertyId = propId
            loadPropertyReviews()
        }
    }
})
