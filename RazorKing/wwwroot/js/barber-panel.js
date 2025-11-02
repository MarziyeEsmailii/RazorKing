// Barber Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializePanel();
    setupEventListeners();
    startAutoRefresh();
});

function initializePanel() {
    // Add fade-in animation to content
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.classList.add('fade-in');
    }
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

function setupEventListeners() {
    // Auto-hide alerts after 5 seconds
    document.querySelectorAll('.alert:not(.alert-permanent)').forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
    
    // Confirm dialogs for dangerous actions
    document.querySelectorAll('[data-confirm]').forEach(element => {
        element.addEventListener('click', function(e) {
            const message = this.dataset.confirm || 'آیا مطمئن هستید؟';
            if (!confirm(message)) {
                e.preventDefault();
                return false;
            }
        });
    });
    
    // Loading states for forms
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
            }
        });
    });
    
    // Auto-save functionality for forms
    document.querySelectorAll('[data-auto-save]').forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', debounce(() => {
                autoSaveForm(form);
            }, 1000));
        });
    });
    
    // Real-time search functionality
    document.querySelectorAll('[data-search]').forEach(searchInput => {
        searchInput.addEventListener('input', debounce((e) => {
            performSearch(e.target.value, e.target.dataset.search);
        }, 300));
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + S for save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const activeForm = document.querySelector('form:focus-within');
        if (activeForm) {
            activeForm.submit();
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            const modal = bootstrap.Modal.getInstance(openModal);
            if (modal) {
                modal.hide();
            }
        }
    }
    
    // Ctrl/Cmd + R for refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        const refreshBtn = document.querySelector('[data-refresh]');
        if (refreshBtn) {
            e.preventDefault();
            refreshBtn.click();
        }
    }
}

function autoSaveForm(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Save to localStorage
    const formId = form.id || 'auto-save-form';
    localStorage.setItem(`barber-panel-${formId}`, JSON.stringify(data));
    
    // Show auto-save indicator
    showAutoSaveIndicator();
}

function loadAutoSavedData(form) {
    const formId = form.id || 'auto-save-form';
    const savedData = localStorage.getItem(`barber-panel-${formId}`);
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input && input.type !== 'file') {
                    input.value = data[key];
                }
            });
        } catch (e) {
            console.log('Could not load auto-saved data');
        }
    }
}

function showAutoSaveIndicator() {
    let indicator = document.querySelector('.auto-save-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'auto-save-indicator';
        indicator.innerHTML = '<i class="fas fa-save"></i> ذخیره خودکار';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(40, 167, 69, 0.9);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 25px;
            font-size: 0.8rem;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.style.opacity = '1';
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 2000);
}

function performSearch(query, target) {
    const searchableElements = document.querySelectorAll(`[data-searchable="${target}"]`);
    
    searchableElements.forEach(element => {
        const text = element.textContent.toLowerCase();
        const matches = text.includes(query.toLowerCase());
        
        element.style.display = matches ? '' : 'none';
        
        // Highlight matching text
        if (matches && query) {
            highlightText(element, query);
        } else {
            removeHighlight(element);
        }
    });
}

function highlightText(element, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    const originalText = element.dataset.originalText || element.innerHTML;
    
    if (!element.dataset.originalText) {
        element.dataset.originalText = originalText;
    }
    
    element.innerHTML = originalText.replace(regex, '<mark class="search-highlight">$1</mark>');
}

function removeHighlight(element) {
    if (element.dataset.originalText) {
        element.innerHTML = element.dataset.originalText;
    }
}

function startAutoRefresh() {
    // Auto-refresh data every 5 minutes
    setInterval(() => {
        const refreshableElements = document.querySelectorAll('[data-auto-refresh]');
        refreshableElements.forEach(element => {
            const url = element.dataset.autoRefresh;
            if (url) {
                refreshElement(element, url);
            }
        });
    }, 5 * 60 * 1000);
}

function refreshElement(element, url) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            element.innerHTML = html;
            element.classList.add('slide-in-right');
            setTimeout(() => {
                element.classList.remove('slide-in-right');
            }, 500);
        })
        .catch(error => {
            console.error('Error refreshing element:', error);
        });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show notification`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
        animation: slideInRight 0.3s ease;
    `;
    
    const iconMap = {
        success: 'check-circle',
        danger: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas fa-${iconMap[type] || 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
    
    return notification;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fa-IR', {
        style: 'currency',
        currency: 'IRR',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    return new Date(date).toLocaleDateString('fa-IR', { ...defaultOptions, ...options });
}

function formatTime(time) {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export functions for use in other scripts
window.BarberPanel = {
    showNotification,
    formatCurrency,
    formatDate,
    formatTime,
    debounce,
    autoSaveForm,
    loadAutoSavedData
};

// Add CSS for search highlighting
const style = document.createElement('style');
style.textContent = `
    .search-highlight {
        background: rgba(212, 175, 55, 0.3);
        color: #d4af37;
        padding: 0.1rem 0.2rem;
        border-radius: 3px;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification {
        animation: slideInRight 0.3s ease;
    }
`;
document.head.appendChild(style);