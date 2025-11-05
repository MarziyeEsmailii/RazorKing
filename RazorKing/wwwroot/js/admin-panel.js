// Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Auto-submit search forms on Enter
    const searchInputs = document.querySelectorAll('input[name="search"]');
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                this.form.submit();
            }
        });
    });

    // Confirm delete actions
    const deleteButtons = document.querySelectorAll('[onclick*="confirm"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('confirm')) {
                const match = onclickAttr.match(/confirm\('([^']+)'\)/);
                if (match) {
                    const confirmMessage = match[1];
                    if (!confirm(confirmMessage)) {
                        e.preventDefault();
                        return false;
                    }
                }
            }
        });
    });

    // Auto-refresh dashboard every 5 minutes
    if (window.location.pathname.includes('/Admin') && window.location.pathname.endsWith('/Admin')) {
        setInterval(function() {
            // Only refresh if user is still on the page and tab is active
            if (!document.hidden) {
                location.reload();
            }
        }, 300000); // 5 minutes
    }

    // Sidebar active state management
    const currentPath = window.location.pathname;
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    
    sidebarLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Mobile sidebar toggle (if needed in future)
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.admin-sidebar').classList.toggle('show');
        });
    }

    // Table row hover effects
    const tableRows = document.querySelectorAll('.table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });

    // Status badge animations
    const statusBadges = document.querySelectorAll('.badge');
    statusBadges.forEach(badge => {
        badge.style.transition = 'all 0.3s ease';
    });

    // Form validation enhancement
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('is-invalid');
                    isValid = false;
                } else {
                    field.classList.remove('is-invalid');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                alert('لطفاً تمام فیلدهای الزامی را پر کنید.');
            }
        });
    });

    // Number formatting for Persian locale
    const numberElements = document.querySelectorAll('[data-number]');
    numberElements.forEach(element => {
        const number = parseInt(element.textContent);
        if (!isNaN(number)) {
            element.textContent = number.toLocaleString('fa-IR');
        }
    });

    // Chart responsive handling
    window.addEventListener('resize', function() {
        if (typeof Chart !== 'undefined') {
            Chart.helpers.each(Chart.instances, function(instance) {
                instance.resize();
            });
        }
    });
});

// Utility functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; left: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fa-IR', {
        style: 'currency',
        currency: 'IRR',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('fa-IR').format(new Date(date));
}

// Export functions for global use
window.AdminPanel = {
    showNotification,
    formatCurrency,
    formatDate
};