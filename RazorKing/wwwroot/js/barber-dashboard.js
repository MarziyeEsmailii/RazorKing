/**
 * Barber Dashboard JavaScript
 * ریزر کینگ - پنل مدیریت آرایشگر
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Auto-refresh today's schedule every 5 minutes
    setInterval(refreshTodaySchedule, 300000);
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Add loading states to buttons
    addButtonLoadingStates();
}

function refreshTodaySchedule() {
    const scheduleContainer = document.getElementById('todaySchedule');
    if (!scheduleContainer) return;
    
    // Show loading state
    const originalContent = scheduleContainer.innerHTML;
    scheduleContainer.innerHTML = `
        <div class="text-center py-4">
            <div class="loading-spinner"></div>
            <p class="mt-2 text-muted">در حال بروزرسانی...</p>
        </div>
    `;
    
    fetch('/Barber/GetTodayAppointments')
        .then(response => response.json())
        .then(data => {
            if (data && Array.isArray(data)) {
                updateScheduleDisplay(data);
            } else {
                scheduleContainer.innerHTML = originalContent;
                showNotification('خطا در بارگذاری نوبت‌ها', 'error');
            }
        })
        .catch(error => {
            console.error('Error refreshing schedule:', error);
            scheduleContainer.innerHTML = originalContent;
            showNotification('خطا در ارتباط با سرور', 'error');
        });
}

function updateScheduleDisplay(appointments) {
    const scheduleContainer = document.getElementById('todaySchedule');
    
    if (appointments.length === 0) {
        scheduleContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h4>نوبتی برای امروز وجود ندارد</h4>
                <p>شما امروز نوبت رزرو شده‌ای ندارید</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    appointments.forEach(appointment => {
        html += createAppointmentHTML(appointment);
    });
    
    scheduleContainer.innerHTML = html;
}

function createAppointmentHTML(appointment) {
    const statusClass = appointment.status.toLowerCase();
    const statusText = getStatusText(appointment.status);
    
    return `
        <div class="timeline-item" data-appointment-id="${appointment.id}">
            <div class="timeline-time">
                ${appointment.appointmentTime}
            </div>
            <div class="timeline-content">
                <div class="appointment-info">
                    <h5 class="customer-name">${appointment.customerName}</h5>
                    <p class="service-info">
                        <i class="fas fa-cut"></i>
                        ${appointment.serviceName}
                        <span class="price">${parseInt(appointment.servicePrice).toLocaleString()} تومان</span>
                    </p>
                    <p class="contact-info">
                        <i class="fas fa-phone"></i>
                        ${appointment.customerPhone}
                    </p>
                </div>
                <div class="appointment-actions">
                    <div class="status-badge status-${statusClass}">
                        ${statusText}
                    </div>
                    <div class="action-buttons">
                        ${createActionButtons(appointment)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createActionButtons(appointment) {
    let buttons = '';
    
    switch (appointment.status) {
        case 'Pending':
            buttons = `
                <button class="btn btn-sm btn-success" onclick="changeStatus(${appointment.id}, 'Confirmed')">
                    <i class="fas fa-check"></i>
                    تایید
                </button>
                <button class="btn btn-sm btn-danger" onclick="changeStatus(${appointment.id}, 'Cancelled')">
                    <i class="fas fa-times"></i>
                    لغو
                </button>
            `;
            break;
        case 'Confirmed':
            buttons = `
                <button class="btn btn-sm btn-primary" onclick="changeStatus(${appointment.id}, 'Completed')">
                    <i class="fas fa-check-double"></i>
                    تکمیل
                </button>
                <button class="btn btn-sm btn-warning" onclick="changeStatus(${appointment.id}, 'Cancelled')">
                    <i class="fas fa-ban"></i>
                    لغو
                </button>
            `;
            break;
    }
    
    return buttons;
}

function getStatusText(status) {
    const statusMap = {
        'Pending': 'در انتظار تایید',
        'Confirmed': 'تایید شده',
        'Completed': 'تکمیل شده',
        'Cancelled': 'لغو شده'
    };
    return statusMap[status] || 'نامشخص';
}

function changeStatus(appointmentId, newStatus) {
    const button = event.target.closest('button');
    const originalContent = button.innerHTML;
    
    // Show loading state
    button.disabled = true;
    button.innerHTML = '<div class="loading-spinner"></div>';
    
    const data = {
        AppointmentId: appointmentId,
        Status: newStatus
    };
    
    fetch('/Barber/ChangeAppointmentStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': getAntiForgeryToken()
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            refreshTodaySchedule();
        } else {
            showNotification(data.message, 'error');
            button.disabled = false;
            button.innerHTML = originalContent;
        }
    })
    .catch(error => {
        console.error('Error changing status:', error);
        showNotification('خطا در تغییر وضعیت', 'error');
        button.disabled = false;
        button.innerHTML = originalContent;
    });
}

function addButtonLoadingStates() {
    document.addEventListener('click', function(e) {
        const button = e.target.closest('button[type="submit"], .btn-submit');
        if (button && !button.disabled) {
            const originalContent = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<div class="loading-spinner"></div> در حال پردازش...';
            
            // Re-enable after 10 seconds as fallback
            setTimeout(() => {
                button.disabled = false;
                button.innerHTML = originalContent;
            }, 10000);
        }
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    let container = document.querySelector('.notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
    
    // Add animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getAntiForgeryToken() {
    const token = document.querySelector('input[name="__RequestVerificationToken"]');
    return token ? token.value : '';
}

// Export functions for global use
window.refreshTodaySchedule = refreshTodaySchedule;
window.changeStatus = changeStatus;
window.showNotification = showNotification;