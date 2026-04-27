// Messages JavaScript - Handle messaging functionality

let currentConversationUserId = null
let allConversations = []
let currentMessages = []

// Initialize messages page
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.messages-container')) {
        initializeMessagesPage()
    }
})

function initializeMessagesPage() {
    redirectIfNotLoggedIn()
    loadConversations()
    setupMessageHandlers()
}

// Load all conversations
async function loadConversations() {
    try {
        showLoading('Loading conversations...')
        const data = await MessagesAPI.getConversations()
        allConversations = data.conversations || []
        renderConversations()
        hideLoading()

        // Load first conversation if available
        if (allConversations.length > 0) {
            loadConversation(allConversations[0].user_id)
        } else {
            displayEmptyState()
        }
    } catch (error) {
        console.error('Error loading conversations:', error)
        showNotification('Failed to load conversations', 'error')
        hideLoading()
    }
}

// Render conversations list
function renderConversations() {
    const conversationList = document.querySelector('.conversation-list')
    if (!conversationList) return

    if (allConversations.length === 0) {
        conversationList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No conversations yet</p>
            </div>
        `
        return
    }

    conversationList.innerHTML = allConversations.map(conv => `
        <div class="conversation-item ${currentConversationUserId === conv.user_id ? 'active' : ''}"
             onclick="loadConversation('${conv.user_id}')">
            <div class="conversation-avatar">
                ${getInitials(conv.user_name)}
            </div>
            <div class="conversation-info">
                <h4>${conv.user_name}</h4>
                <p>${truncateText(conv.last_message, 50)}</p>
            </div>
            <div class="conversation-meta">
                <span class="time">${formatTime(conv.last_message_at)}</span>
                ${conv.unread ? '<span class="unread-badge">New</span>' : ''}
            </div>
        </div>
    `).join('')
}

// Load specific conversation
async function loadConversation(userId) {
    try {
        currentConversationUserId = userId
        showLoading('Loading conversation...')
        const data = await MessagesAPI.getConversation(userId)
        currentMessages = data.messages || []
        renderMessages()
        renderConversationHeader(userId)
        hideLoading()
        scrollToBottom()
    } catch (error) {
        console.error('Error loading conversation:', error)
        showNotification('Failed to load conversation', 'error')
        hideLoading()
    }
}

// Render conversation header
function renderConversationHeader(userId) {
    const conversation = allConversations.find(c => c.user_id === userId)
    if (!conversation) return

    const header = document.querySelector('.messages-header')
    if (header) {
        header.innerHTML = `
            <div class="header-user-info">
                <div class="user-avatar">${getInitials(conversation.user_name)}</div>
                <div class="user-details">
                    <h3>${conversation.user_name}</h3>
                    <p>${conversation.user_email}</p>
                </div>
            </div>
            <div class="header-actions">
                <button onclick="callUser()" title="Call" class="btn-icon">
                    <i class="fas fa-phone"></i>
                </button>
                <button onclick="videoCallUser()" title="Video Call" class="btn-icon">
                    <i class="fas fa-video"></i>
                </button>
            </div>
        `
    }
}

// Render messages
function renderMessages() {
    const messagesList = document.querySelector('.messages-list')
    if (!messagesList) return

    if (currentMessages.length === 0) {
        messagesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <p>No messages yet. Start the conversation!</p>
            </div>
        `
        return
    }

    const currentUser = getCurrentUser()
    messagesList.innerHTML = currentMessages.map(msg => {
        const isOwnMessage = msg.sender_id === currentUser.id
        return `
            <div class="message ${isOwnMessage ? 'own' : 'other'}">
                <div class="message-content">
                    <p>${escapeHtml(msg.message)}</p>
                    <span class="message-time">${formatTime(msg.created_at)}</span>
                </div>
            </div>
        `
    }).join('')

    scrollToBottom()
}

// Send message
async function sendMessage(e) {
    if (e) e.preventDefault()

    if (!currentConversationUserId) {
        showNotification('Please select a conversation', 'error')
        return
    }

    const inputField = document.querySelector('.message-input')
    const message = inputField?.value.trim()

    if (!message) {
        showNotification('Please enter a message', 'error')
        return
    }

    try {
        await MessagesAPI.send(currentConversationUserId, message)
        inputField.value = ''

        // Reload conversation to show new message
        loadConversation(currentConversationUserId)
        showNotification('Message sent', 'success')
    } catch (error) {
        console.error('Error sending message:', error)
        showNotification('Failed to send message', 'error')
    }
}

// Setup message handlers
function setupMessageHandlers() {
    // Send button
    const sendBtn = document.querySelector('.send-message-btn')
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage)
    }

    // Message input with enter key
    const inputField = document.querySelector('.message-input')
    if (inputField) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
            }
        })
    }

    // Search conversations
    const searchInput = document.querySelector('.search-conversations')
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterConversations(e.target.value)
        })
    }
}

// Filter conversations by search
function filterConversations(query) {
    const filtered = allConversations.filter(conv =>
        conv.user_name.toLowerCase().includes(query.toLowerCase()) ||
        conv.user_email.toLowerCase().includes(query.toLowerCase())
    )

    const conversationList = document.querySelector('.conversation-list')
    if (!conversationList) return

    if (filtered.length === 0) {
        conversationList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No conversations found</p>
            </div>
        `
        return
    }

    conversationList.innerHTML = filtered.map(conv => `
        <div class="conversation-item ${currentConversationUserId === conv.user_id ? 'active' : ''}"
             onclick="loadConversation('${conv.user_id}')">
            <div class="conversation-avatar">
                ${getInitials(conv.user_name)}
            </div>
            <div class="conversation-info">
                <h4>${highlightSearch(conv.user_name, query)}</h4>
                <p>${truncateText(conv.last_message, 50)}</p>
            </div>
            <div class="conversation-meta">
                <span class="time">${formatTime(conv.last_message_at)}</span>
                ${conv.unread ? '<span class="unread-badge">New</span>' : ''}
            </div>
        </div>
    `).join('')
}

// Display empty state
function displayEmptyState() {
    const chatArea = document.querySelector('.chat-area')
    if (chatArea) {
        chatArea.innerHTML = `
            <div class="empty-state-large">
                <i class="fas fa-inbox"></i>
                <h2>No Active Conversations</h2>
                <p>Start a conversation by messaging a property owner or student.</p>
            </div>
        `
    }
}

// Scroll to bottom of messages
function scrollToBottom() {
    const messagesList = document.querySelector('.messages-list')
    if (messagesList) {
        setTimeout(() => {
            messagesList.scrollTop = messagesList.scrollHeight
        }, 100)
    }
}

// Placeholder functions for future implementation
function callUser() {
    showNotification('Call feature coming soon', 'info')
}

function videoCallUser() {
    showNotification('Video call feature coming soon', 'info')
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

// Helper function to highlight search query
function highlightSearch(text, query) {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
}

// Auto-load conversations on page load
document.addEventListener('DOMContentLoaded', () => {
    const messagesPage = document.querySelector('.messages-page')
    if (messagesPage) {
        loadConversations()
    }
})
