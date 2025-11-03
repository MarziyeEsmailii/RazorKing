// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
});

function initializeProfile() {
    // Initialize tooltips
    initializeTooltips();
    
    // Add smooth scrolling
    addSmoothScrolling();
    
    // Initialize animations
    initializeAnimations();
}

function initializeTooltips() {
    // Add tooltips to buttons
    const buttons = document.querySelectorAll('[data-toggle="tooltip"]');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', showTooltip);
        button.addEventListener('mouseleave', hideTooltip);
    });
}

function addSmoothScrolling() {
    // Smooth scroll for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initializeAnimations() {
    // Animate cards on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    const cards = document.querySelectorAll('.profile-card, .appointments-card, .appointment-item');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Edit Profile Modal
function editProfile() {
    const modal = createEditProfileModal();
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Focus on first input
    const firstInput = modal.querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }
}

function createEditProfileModal() {
    const modal = document.createElement('div');
    modal.className = 'profile-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeEditProfileModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>ویرایش پروفایل</h3>
                <button class="modal-close" onclick="closeEditProfileModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="editProfileForm">
                    <div class="form-group">
                        <label for="firstName">نام</label>
                        <input type="text" id="firstName" name="firstName" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName">نام خانوادگی</label>
                        <input type="text" id="lastName" name="lastName" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="phoneNumber">شماره موبایل</label>
                        <input type="tel" id="phoneNumber" name="phoneNumber" class="form-control">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline-gold" onclick="closeEditProfileModal()">
                            انصراف
                        </button>
                        <button type="submit" class="btn btn-gold">
                            <i class="fas fa-save"></i>
                            ذخیره تغییرات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add event listener for form submission
    const form = modal.querySelector('#editProfileForm');
    form.addEventListener('submit', handleEditProfileSubmit);
    
    // Populate form with current values
    populateEditForm(modal);
    
    return modal;
}

function populateEditForm(modal) {
    // Get current values from the page
    const nameElement = document.querySelector('.profile-name');
    const emailElement = document.querySelector('.profile-email');
    const phoneElement = document.querySelector('.detail-item span');
    
    if (nameElement) {
        const fullName = nameElement.textContent.trim().split(' ');
        const firstName = fullName[0] || '';
        const lastName = fullName.slice(1).join(' ') || '';
        
        modal.querySelector('#firstName').value = firstName;
        modal.querySelector('#lastName').value = lastName;
    }
    
    // Get phone from detail items
    const detailItems = document.querySelectorAll('.detail-item');
    detailItems.forEach(item => {
        const label = item.querySelector('label');
        const span = item.querySelector('span');
        if (label && label.textContent.includes('موبایل') && span) {
            const phone = span.textContent.trim();
            if (phone !== 'وارد نشده') {
                modal.querySelector('#phoneNumber').value = phone;
            }
        }
    });
}

function closeEditProfileModal() {
    const modal = document.querySelector('.profile-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function handleEditProfileSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phoneNumber: formData.get('phoneNumber')
    };
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...';
    submitBtn.disabled = true;
    
    // Send update request
    fetch('/Profile/UpdateProfile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value || ''
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('پروفایل با موفقیت بروزرسانی شد', 'success');
            closeEditProfileModal();
            // Refresh page to show updated data
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showNotification(result.message || 'خطا در بروزرسانی پروفایل', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('خطا در ارتباط با سرور', 'error');
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// Cancel Appointment
function cancelAppointment(appointmentId) {
    if (!confirm('آیا از لغو این نوبت اطمینان دارید؟')) {
        return;
    }
    
    // Show loading state
    const button = event.target.closest('button');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
    
    fetch('/Profile/CancelAppointment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value || ''
        },
        body: JSON.stringify({ appointmentId: appointmentId })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('نوبت با موفقیت لغو شد', 'success');
            // Remove appointment from UI or refresh page
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showNotification(result.message || 'خطا در لغو نوبت', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('خطا در ارتباط با سرور', 'error');
    })
    .finally(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    });
}

// Show Appointment Details
function showAppointmentDetails(appointmentId) {
    // Create and show appointment details modal
    const modal = createAppointmentDetailsModal(appointmentId);
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function createAppointmentDetailsModal(appointmentId) {
    const modal = document.createElement('div');
    modal.className = 'profile-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeAppointmentDetailsModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>جزئیات نوبت</h3>
                <button class="modal-close" onclick="closeAppointmentDetailsModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="appointment-details-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>در حال بارگذاری...</p>
                </div>
            </div>
        </div>
    `;
    
    // Load appointment details (this would typically fetch from server)
    loadAppointmentDetails(modal, appointmentId);
    
    return modal;
}

function loadAppointmentDetails(modal, appointmentId) {
    // For now, show a placeholder
    setTimeout(() => {
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="appointment-details-content">
                <p>جزئیات نوبت شماره ${appointmentId}</p>
                <p>این بخش در حال توسعه است...</p>
            </div>
        `;
    }, 1000);
}

function closeAppointmentDetailsModal() {
    const modal = document.querySelector('.profile-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Load More Appointments
function loadMoreAppointments() {
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال بارگذاری...';
    button.disabled = true;
    
    // Simulate loading more appointments
    setTimeout(() => {
        showNotification('تمام نوبت‌ها نمایش داده شده‌اند', 'info');
        button.style.display = 'none';
    }, 1000);
}

// Notification System
function showNotification(message, type = 'info') {
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
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Add CSS for modals and notifications
const additionalStyles = `
<style>
.profile-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.profile-modal.show {
    opacity: 1;
    visibility: visible;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
}

.modal-content {
    background: #2d2d2d;
    border-radius: 20px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    z-index: 1001;
    border: 1px solid rgba(212, 175, 55, 0.2);
    transform: scale(0.9);
    transition: transform 0.3s ease;
}

.profile-modal.show .modal-content {
    transform: scale(1);
}

.modal-header {
    padding: 25px 30px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.modal-header h3 {
    color: #d4af37;
    margin: 0;
    font-size: 1.5rem;
}

.modal-close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.modal-close:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
}

.modal-body {
    padding: 30px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 8px;
    font-weight: 500;
}

.form-control {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.form-control:focus {
    outline: none;
    border-color: #d4af37;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-actions {
    display: flex;
    gap: 15px;
    justify-content: flex-end;
    margin-top: 30px;
}

.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2d2d2d;
    border-radius: 10px;
    padding: 15px 20px;
    border-left: 4px solid #d4af37;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 1002;
    display: flex;
    align-items: center;
    gap: 15px;
    max-width: 400px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    border-left-color: #28a745;
}

.notification-error {
    border-left-color: #dc3545;
}

.notification-warning {
    border-left-color: #ffc107;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
}

.notification-content i {
    font-size: 1.2rem;
}

.notification-success .notification-content i {
    color: #28a745;
}

.notification-error .notification-content i {
    color: #dc3545;
}

.notification-warning .notification-content i {
    color: #ffc107;
}

.notification-content span {
    color: #fff;
    font-weight: 500;
}

.notification-close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.notification-close:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
}

.appointment-details-loading {
    text-align: center;
    padding: 40px;
    color: rgba(255, 255, 255, 0.6);
}

.appointment-details-loading i {
    font-size: 2rem;
    color: #d4af37;
    margin-bottom: 15px;
}
</style>
`;

// Add styles to head
document.head.insertAdjacentHTML('beforeend', additionalStyles);