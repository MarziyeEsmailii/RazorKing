/**
 * Barber Edit JavaScript
 * ریزر کینگ - اسکریپت ویرایش و ایجاد آرایشگاه
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeBarberEdit();
});

function initializeBarberEdit() {
    // Initialize working days functionality
    initializeWorkingDays();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Initialize image preview
    initializeImagePreview();
}

// Working Days Management
function initializeWorkingDays() {
    const workingDaysCheckboxes = document.querySelectorAll('input[name="WorkingDaysArray"]');
    const workingDaysHidden = document.getElementById('workingDaysHidden');
    
    if (!workingDaysCheckboxes.length || !workingDaysHidden) return;
    
    // Update hidden field when checkboxes change
    function updateWorkingDays() {
        const selectedDays = [];
        workingDaysCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedDays.push(checkbox.value);
            }
        });
        workingDaysHidden.value = selectedDays.join(',');
    }
    
    // Add event listeners to checkboxes
    workingDaysCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateWorkingDays);
    });
    
    // Initialize on page load
    updateWorkingDays();
}

// Form Validation
function initializeFormValidation() {
    const form = document.querySelector('.edit-form, .create-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        let isValid = true;
        
        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showFieldError(field, 'این فیلد الزامی است');
                isValid = false;
            } else {
                clearFieldError(field);
            }
        });
        
        // Validate phone number
        const phoneField = form.querySelector('input[name="Phone"]');
        if (phoneField && phoneField.value) {
            const phonePattern = /^[0-9\-\s\+\(\)]+$/;
            if (!phonePattern.test(phoneField.value)) {
                showFieldError(phoneField, 'شماره تماس معتبر نیست');
                isValid = false;
            }
        }
        
        // Validate working hours
        const openTimeField = form.querySelector('input[name="OpenTime"]');
        const closeTimeField = form.querySelector('input[name="CloseTime"]');
        
        if (openTimeField && closeTimeField && openTimeField.value && closeTimeField.value) {
            const openTime = new Date('1970-01-01T' + openTimeField.value);
            const closeTime = new Date('1970-01-01T' + closeTimeField.value);
            
            if (openTime >= closeTime) {
                showFieldError(closeTimeField, 'ساعت پایان کار باید بعد از ساعت شروع کار باشد');
                isValid = false;
            }
        }
        
        // Validate working days
        const workingDaysHidden = document.getElementById('workingDaysHidden');
        if (workingDaysHidden && !workingDaysHidden.value) {
            showNotification('لطفاً حداقل یک روز کاری انتخاب کنید', 'error');
            isValid = false;
        }
        
        if (!isValid) {
            e.preventDefault();
            showNotification('لطفاً خطاهای فرم را اصلاح کنید', 'error');
        }
    });
}

// Image Preview
function initializeImagePreview() {
    const imageInput = document.querySelector('input[type="file"][name="imageFile"]');
    if (!imageInput) return;
    
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            showNotification('فرمت فایل مجاز نیست. لطفاً JPG، PNG یا GIF انتخاب کنید', 'error');
            imageInput.value = '';
            return;
        }
        
        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            showNotification('حجم فایل نباید بیشتر از 5 مگابایت باشد', 'error');
            imageInput.value = '';
            return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            showImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    });
}

// Show Image Preview
function showImagePreview(imageSrc) {
    // Remove existing preview
    const existingPreview = document.querySelector('.image-preview');
    if (existingPreview) {
        existingPreview.remove();
    }
    
    // Create preview element
    const preview = document.createElement('div');
    preview.className = 'image-preview';
    preview.innerHTML = `
        <div class="preview-container">
            <img src="${imageSrc}" alt="پیش‌نمایش تصویر" />
            <button type="button" class="remove-preview">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <p>پیش‌نمایش تصویر آرایشگاه</p>
    `;
    
    // Add after file input
    const imageInput = document.querySelector('input[type="file"][name="imageFile"]');
    imageInput.parentNode.appendChild(preview);
    
    // Add remove functionality
    preview.querySelector('.remove-preview').addEventListener('click', function() {
        preview.remove();
        imageInput.value = '';
    });
}

// Field Error Handling
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorElement = document.createElement('span');
    errorElement.className = 'text-danger field-error';
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
    field.classList.add('is-invalid');
}

function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.classList.remove('is-invalid');
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification
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
    
    // Auto hide
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

// Add styles for image preview and notifications
const additionalStyles = `
    .image-preview {
        margin-top: 15px;
        text-align: center;
    }
    
    .preview-container {
        position: relative;
        display: inline-block;
        border-radius: 15px;
        overflow: hidden;
        border: 2px solid rgba(212, 175, 55, 0.3);
    }
    
    .preview-container img {
        width: 200px;
        height: 150px;
        object-fit: cover;
        display: block;
    }
    
    .remove-preview {
        position: absolute;
        top: 8px;
        left: 8px;
        background: rgba(220, 53, 69, 0.9);
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .remove-preview:hover {
        background: #dc3545;
        transform: scale(1.1);
    }
    
    .image-preview p {
        color: #b0b0b0;
        font-size: 0.9rem;
        margin: 10px 0 0 0;
    }
    
    .form-control.is-invalid {
        border-color: #ff6b6b;
        box-shadow: 0 0 0 0.25rem rgba(255, 107, 107, 0.25);
    }
    
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
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);