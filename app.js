// Student Leave Portal JavaScript

// Global state
let currentUser = null;
let leaveApplications = [];

// DOM elements
const loginForm = document.getElementById('loginForm');
const leaveForm = document.getElementById('leaveForm');
const loginStatus = document.getElementById('loginStatus');
const statusPanel = document.getElementById('statusPanel');
const approvalBlock = document.getElementById('approvalBlock');
const rejectedBlock = document.getElementById('rejectedBlock');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showLoginStatus();
        showStatusPanel();
    }

    // Load saved leave applications
    const savedApplications = localStorage.getItem('leaveApplications');
    if (savedApplications) {
        leaveApplications = JSON.parse(savedApplications);
    }
});

// Login simulation function
function simulateLogin(event, userType) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return false;
    }
    
    // Simulate login delay
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        // Simulate successful login
        currentUser = {
            email: email,
            userType: userType,
            loginTime: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showLoginStatus();
        showStatusPanel();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Clear form
        document.getElementById('email').value = '';
        
        // Show success message
        showNotification('Login successful!', 'success');
    }, 1500);
    
    return false;
}

// Show login status
function showLoginStatus() {
    if (currentUser) {
        loginStatus.querySelector('[data-bind="email"]').textContent = currentUser.email;
        loginStatus.classList.remove('hidden');
        loginForm.style.display = 'none';
    }
}

// Show status panel
function showStatusPanel() {
    if (currentUser) {
        statusPanel.classList.remove('hidden');
        
        // Show the most recent application status
        const recentApp = leaveApplications[leaveApplications.length - 1];
        if (recentApp) {
            updateStatusDisplay(recentApp);
        }
    }
}

// Submit leave form
function submitLeave(event, options = {}) {
    event.preventDefault();
    
    if (!currentUser) {
        alert('Please login first');
        return false;
    }
    
    const formData = new FormData(event.target);
    const leaveData = {
        id: Date.now(),
        email: currentUser.email,
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        category: formData.get('category'),
        reason: formData.get('reason'),
        document: formData.get('document')?.name || null,
        voice: formData.get('voice')?.name || null,
        scope: options.scope || 'College',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        approvedAt: null,
        rejectedAt: null,
        rejectionReason: null
    };
    
    // Validate dates
    if (new Date(leaveData.startDate) > new Date(leaveData.endDate)) {
        alert('End date must be after start date');
        return false;
    }
    
    // Add to applications
    leaveApplications.push(leaveData);
    localStorage.setItem('leaveApplications', JSON.stringify(leaveApplications));
    
    // Update status display
    updateStatusDisplay(leaveData);
    
    // Show success message
    showNotification('Leave application submitted successfully!', 'success');
    
    // Reset form
    event.target.reset();
    
    return false;
}

// Update status display
function updateStatusDisplay(application) {
    // Hide all status blocks
    document.querySelectorAll('.status-row').forEach(row => {
        row.classList.add('hidden');
    });
    
    // Show appropriate status
    if (application.status === 'pending') {
        document.querySelector('.status-row:first-child').classList.remove('hidden');
    } else if (application.status === 'approved') {
        approvalBlock.classList.remove('hidden');
        document.getElementById('approvedDate').textContent = 
            new Date(application.approvedAt).toLocaleDateString();
    } else if (application.status === 'rejected') {
        rejectedBlock.classList.remove('hidden');
        document.getElementById('rejectedReason').textContent = 
            application.rejectionReason || 'No reason provided';
    }
}

// Simulate approval (for demo purposes)
function simulateApproval(applicationId) {
    const app = leaveApplications.find(a => a.id === applicationId);
    if (app) {
        app.status = 'approved';
        app.approvedAt = new Date().toISOString();
        localStorage.setItem('leaveApplications', JSON.stringify(leaveApplications));
        updateStatusDisplay(app);
    }
}

// Simulate rejection (for demo purposes)
function simulateRejection(applicationId, reason) {
    const app = leaveApplications.find(a => a.id === applicationId);
    if (app) {
        app.status = 'rejected';
        app.rejectedAt = new Date().toISOString();
        app.rejectionReason = reason;
        localStorage.setItem('leaveApplications', JSON.stringify(leaveApplications));
        updateStatusDisplay(app);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : '#0c5460'};
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    location.reload();
}

// Add logout button functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add logout button to header if user is logged in
    if (currentUser) {
        const header = document.querySelector('.site-header');
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.style.cssText = `
            background: #dc3545;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            margin-left: auto;
        `;
        logoutBtn.onclick = logout;
        
        const headerContent = document.createElement('div');
        headerContent.style.cssText = 'display: flex; align-items: center; justify-content: space-between;';
        headerContent.innerHTML = header.innerHTML;
        headerContent.appendChild(logoutBtn);
        header.innerHTML = '';
        header.appendChild(headerContent);
    }
});

// Demo functions for testing (can be called from browser console)
window.demoApprove = function() {
    if (leaveApplications.length > 0) {
        simulateApproval(leaveApplications[leaveApplications.length - 1].id);
        showNotification('Application approved!', 'success');
    }
};

window.demoReject = function() {
    if (leaveApplications.length > 0) {
        simulateRejection(leaveApplications[leaveApplications.length - 1].id, 'Demo rejection reason');
        showNotification('Application rejected!', 'info');
    }
};

window.demoReset = function() {
    localStorage.clear();
    location.reload();
};
