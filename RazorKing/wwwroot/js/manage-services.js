/**
 * Manage Services JavaScript
 * ریزر کینگ - اسکریپت مدیریت خدمات
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeManageServices();
});

function initializeManageServices() {
    // Initialize forms
    initializeAddServiceForm();
    initializeEditServiceForm();
    initializeDeleteButtons();
    
    // Initialize edit buttons
    initializeEditButtons();
}

// Add Service Form
function initializeAddServiceForm() {
    const form = document.getElementById('addServiceForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            Name: document.getElementById('serviceName').value.trim(),
            Description: document.getElementById('serviceDescription').value.trim(),
            Price: parseFloat(document.getElementById('servicePrice').value),
            Duration: parseInt(document.getElementById('serviceDuration').value)
        };
        
        // Validation
        if (!formData.Name || formData.Price < 1000 || formData.Duration < 15) {
            showNotification('لطفاً تمام فیلدهای الزامی را به درستی پر کنید', 'error');
            return;
        }
        
        try {
            const token = getAntiForgeryToken();
            console.log('Sending service data:', formData);
            console.log('CSRF Token:', token);
            
            const response = await fetch('/Barber/AddService', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': token
                },
                body: JSON.stringify(formData)
            });
            
            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Response result:', result);
            
            if (result.success) {
                showNotification(result.message, 'success');
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addServiceModal'));
                if (modal) modal.hide();
                // Reset form
                form.reset();
                // Reload page to show new service
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showNotification(result.message || 'خطا در اضافه کردن خدمت', 'error');
            }
        } catch (error) {
            console.error('Error adding service:', error);
            showNotification('خطا در ارتباط با سرور', 'error');
        }
    });
}

// Edit Service Form
function initializeEditServiceForm() {
    const form = document.getElementById('editServiceForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            Id: parseInt(document.getElementById('editServiceId').value),
            Name: document.getElementById('editServiceName').value.trim(),
            Description: document.getElementById('editServiceDescription').value.trim(),
            Price: parseFloat(document.getElementById('editServicePrice').value),
            Duration: parseInt(document.getElementById('editServiceDuration').value),
            IsActive: document.getElementById('editServiceActive').checked
        };
        
        // Validation
        if (!formData.Name || formData.Price < 1000 || formData.Duration < 15) {
            showNotification('لطفاً تمام فیلدهای الزامی را به درستی پر کنید', 'error');
            return;
        }
        
        try {
            const response = await fetch('/Barber/UpdateService', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': getAntiForgeryToken()
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(result.message, 'success');
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editServiceModal'));
                modal.hide();
                // Reload page to show updated service
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showNotification(result.message || 'خطا در به‌روزرسانی خدمت', 'error');
            }
        } catch (error) {
            console.error('Error updating service:', error);
            showNotification('خطا در ارتباط با سرور', 'error');
        }
    });
}

// Edit Buttons
function initializeEditButtons() {
    const editButtons = document.querySelectorAll('.edit-service-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const serviceId = this.dataset.serviceId;
            const serviceName = this.dataset.serviceName;
            const serviceDescription = this.dataset.serviceDescription;
            const servicePrice = this.dataset.servicePrice;
            const serviceDuration = this.dataset.serviceDuration;
            const serviceActive = this.dataset.serviceActive === 'true';
            
            // Fill edit form
            document.getElementById('editServiceId').value = serviceId;
            document.getElementById('editServiceName').value = serviceName;
            document.getElementById('editServiceDescription').value = serviceDescription;
            document.getElementById('editServicePrice').value = servicePrice;
            document.getElementById('editServiceDuration').value = serviceDuration;
            document.getElementById('editServiceActive').checked = serviceActive;
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('editServiceModal'));
            modal.show();
        });
    });
}

// Delete Buttons
function initializeDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.delete-service-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const serviceId = this.dataset.serviceId;
            const serviceCard = this.closest('.service-card');
            const serviceName = serviceCard.querySelector('h4').textContent;
            
            if (confirm(`آیا مطمئن هستید که می‌خواهید خدمت "${serviceName}" را حذف کنید؟`)) {
                deleteService(serviceId);
            }
        });
    });
}

// Delete Service
async function deleteService(serviceId) {
    try {
        const response = await fetch('/Barber/DeleteService', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': getAntiForgeryToken()
            },
            body: JSON.stringify({ id: serviceId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            // Remove service card from DOM
            const serviceCard = document.querySelector(`[data-service-id="${serviceId}"]`);
            if (serviceCard) {
                serviceCard.style.transition = 'all 0.3s ease';
                serviceCard.style.opacity = '0';
                serviceCard.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    serviceCard.remove();
                    // Check if no services left
                    const remainingServices = document.querySelectorAll('.service-card');
                    if (remainingServices.length === 0) {
                        window.location.reload();
                    }
                }, 300);
            }
        } else {
            showNotification(result.message || 'خطا در حذف خدمت', 'error');
        }
    } catch (error) {
        console.error('Error deleting service:', error);
        showNotification('خطا در ارتباط با سرور', 'error');
    }
}

// Utility Functions
function getAntiForgeryToken() {
    const token = document.querySelector('input[name="__RequestVerificationToken"]') || 
                  document.querySelector('meta[name="__RequestVerificationToken"]');
    return token ? (token.value || token.content) : '';
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
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification(notification);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        hideNotification(notification);
    });
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Add notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(26, 26, 26, 0.95);
        border: 2px solid rgba(212, 175, 55, 0.3);
        border-radius: 12px;
        padding: 15px 20px;
        color: #ffffff;
        z-index: 9999;
        transform: translateX(400px);
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        min-width: 300px;
        max-width: 400px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .notification-success {
        border-color: rgba(40, 167, 69, 0.5);
    }
    
    .notification-success .notification-content i {
        color: #28a745;
    }
    
    .notification-error {
        border-color: rgba(220, 53, 69, 0.5);
    }
    
    .notification-error .notification-content i {
        color: #dc3545;
    }
    
    .notification-close {
        position: absolute;
        top: 8px;
        left: 8px;
        background: none;
        border: none;
        color: #b0b0b0;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.3s ease;
    }
    
    .notification-close:hover {
        color: #d4af37;
        background: rgba(212, 175, 55, 0.1);
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);