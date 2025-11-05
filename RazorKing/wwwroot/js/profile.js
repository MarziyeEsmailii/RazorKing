// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
    
    // بررسی نوبت‌های جدید
    checkForNewAppointments();
});

function initializeProfile() {
    // Initialize tooltips
    initializeTooltips();
    
    // Add smooth scrolling
    addSmoothScrolling();
    
    // Initialize animations
    initializeAnimations();
    
    // بارگذاری نوبت‌های کاربر
    loadUserAppointments();
}

// بارگذاری نوبت‌های کاربر
async function loadUserAppointments() {
    try {
        console.log('🔄 بارگذاری نوبت‌های کاربر...');
        
        const response = await fetch('/Profile/RefreshAppointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value || ''
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ نوبت‌های کاربر بارگذاری شد:', result);
            updateAppointmentsDisplay(result);
            
            // نمایش پیام اگر نوبت جدیدی اضافه شده
            if (result.totalAppointments > 0) {
                console.log(`📊 تعداد کل نوبت‌ها: ${result.totalAppointments}`);
                console.log(`📅 نوبت‌های آینده: ${result.upcomingCount}`);
                console.log(`📜 تاریخچه: ${result.pastCount}`);
            }
        } else {
            console.error('❌ خطا در دریافت نوبت‌ها:', result.message);
            showNotification('خطا در بارگذاری نوبت‌ها: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('❌ خطا در ارتباط با سرور:', error);
        showNotification('خطا در ارتباط با سرور', 'error');
    }
}

// به‌روزرسانی نمایش نوبت‌ها
function updateAppointmentsDisplay(data) {
    // به‌روزرسانی آمار
    updateStats(data);
    
    // به‌روزرسانی لیست نوبت‌های آینده
    updateUpcomingAppointments(data.appointments.filter(a => a.isUpcoming));
    
    // به‌روزرسانی تاریخچه
    updatePastAppointments(data.appointments.filter(a => !a.isUpcoming));
}

// Debug function for appointments
async function debugAppointments() {
    try {
        console.log('🔍 شروع بررسی نوبت‌ها...');
        
        // بررسی نوبت‌های کاربر
        const userResponse = await fetch('/Profile/GetMyAppointments');
        const userResult = await userResponse.json();
        
        console.log('📊 نوبت‌های کاربر:', userResult);
        
        // بررسی کل نوبت‌ها در سیستم
        const allResponse = await fetch('/Booking/DebugAppointments');
        const allResult = await allResponse.json();
        
        console.log('📊 کل نوبت‌ها در سیستم:', allResult);
        
        // بررسی نوبت‌های کاربر از کنترلر Booking
        const bookingResponse = await fetch('/Booking/DebugUserAppointments');
        const bookingResult = await bookingResponse.json();
        
        console.log('📊 نوبت‌های کاربر از Booking:', bookingResult);
        
        // نمایش نتایج
        let message = `
🔍 نتایج بررسی نوبت‌ها:

📊 از Profile Controller:
- موفقیت: ${userResult.success}
- تعداد نوبت‌ها: ${userResult.appointments ? userResult.appointments.length : 0}

📊 کل نوبت‌ها در سیستم:
- موفقیت: ${allResult.success}
- تعداد کل: ${allResult.count || 0}

📊 از Booking Controller:
- موفقیت: ${bookingResult.success}
- تعداد نوبت‌های کاربر: ${bookingResult.count || 0}
- ایمیل کاربر: ${bookingResult.userEmail || 'نامشخص'}

جزئیات کامل در Console مرورگر موجود است.
        `;
        
        alert(message);
        
    } catch (error) {
        console.error('❌ خطا در بررسی نوبت‌ها:', error);
        alert('خطا در بررسی نوبت‌ها: ' + error.message);
    }
}

// Create test appointment
async function createTestAppointment() {
    try {
        console.log('🔧 ایجاد نوبت تست...');
        
        const response = await fetch('/Home/CreateTestAppointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value || ''
            }
        });
        
        const result = await response.json();
        
        console.log('📊 نتیجه ایجاد نوبت تست:', result);
        
        if (result.success) {
            alert(`✅ نوبت تست با موفقیت ایجاد شد!
            
📅 جزئیات:
- شناسه: ${result.appointment.id}
- تاریخ: ${result.appointment.date}
- ساعت: ${result.appointment.time}
- آرایشگاه: ${result.appointment.barbershop}
- خدمت: ${result.appointment.service}
- قیمت: ${result.appointment.price} تومان

حالا صفحه را refresh کنید تا نوبت را ببینید.`);
            
            // Refresh the page to show the new appointment
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            alert('❌ خطا در ایجاد نوبت تست: ' + result.error);
        }
        
    } catch (error) {
        console.error('❌ خطا در ایجاد نوبت تست:', error);
        alert('خطا در ایجاد نوبت تست: ' + error.message);
    }
}

// Refresh appointments manually
async function refreshAppointments() {
    console.log('🔄 بروزرسانی دستی نوبت‌ها...');
    showNotification('در حال بروزرسانی نوبت‌ها...', 'info');
    await loadUserAppointments();
}

// Make functions globally available
window.debugAppointments = debugAppointments;
window.createTestAppointment = createTestAppointment;
window.refreshAppointments = refreshAppointments;

// به‌روزرسانی آمار
function updateStats(data) {
    const totalElement = document.querySelector('.stat-item:nth-child(1) .stat-number');
    const upcomingElement = document.querySelector('.stat-item:nth-child(3) .stat-number');
    
    if (totalElement) {
        totalElement.textContent = data.totalCount;
    }
    
    if (upcomingElement) {
        upcomingElement.textContent = data.upcomingCount;
    }
}

// به‌روزرسانی نوبت‌های آینده
function updateUpcomingAppointments(appointments) {
    const container = document.querySelector('.appointments-card .appointments-list');
    if (!container) return;
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h5>نوبت آینده‌ای ندارید</h5>
                <p>برای رزرو نوبت جدید کلیک کنید</p>
                <a href="/Booking" class="btn btn-gold">
                    <i class="fas fa-calendar-plus"></i>
                    رزرو نوبت
                </a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appointments.slice(0, 3).map(appointment => `
        <div class="appointment-item upcoming" data-appointment-id="${appointment.id}">
            <div class="appointment-date">
                <div class="date-day">${new Date(appointment.appointmentDate).getDate()}</div>
                <div class="date-month">${getMonthName(new Date(appointment.appointmentDate).getMonth())}</div>
            </div>
            <div class="appointment-details">
                <h5>${appointment.barbershopName}</h5>
                <p class="appointment-service">${appointment.serviceName}</p>
                <p class="appointment-time">
                    <i class="fas fa-clock"></i>
                    ${appointment.appointmentTime}
                </p>
                ${appointment.cityName ? `<p class="appointment-city"><i class="fas fa-map-marker-alt"></i> ${appointment.cityName}</p>` : ''}
            </div>
            <div class="appointment-status">
                <span class="status-badge status-${appointment.status.toLowerCase()}">
                    ${appointment.statusText}
                </span>
                <div class="appointment-price">
                    ${formatPrice(appointment.totalPrice)} تومان
                </div>
            </div>
            <div class="appointment-actions">
                ${appointment.canCancel ? `
                    <button class="btn btn-sm btn-outline-danger" onclick="cancelAppointment(${appointment.id}, this)" title="لغو نوبت">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-outline-gold" onclick="showAppointmentDetails(${appointment.id})" title="جزئیات">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// به‌روزرسانی تاریخچه
function updatePastAppointments(appointments) {
    const container = document.querySelector('.appointments-card:last-child .appointments-list');
    if (!container) return;
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h5>تاریخچه‌ای ندارید</h5>
                <p>نوبت‌های گذشته شما اینجا نمایش داده می‌شود</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appointments.slice(0, 5).map(appointment => `
        <div class="appointment-item past" data-appointment-id="${appointment.id}">
            <div class="appointment-date">
                <div class="date-day">${new Date(appointment.appointmentDate).getDate()}</div>
                <div class="date-month">${getMonthName(new Date(appointment.appointmentDate).getMonth())}</div>
            </div>
            <div class="appointment-details">
                <h5>${appointment.barbershopName}</h5>
                <p class="appointment-service">${appointment.serviceName}</p>
                <p class="appointment-time">
                    <i class="fas fa-clock"></i>
                    ${appointment.appointmentTime}
                </p>
                ${appointment.cityName ? `<p class="appointment-city"><i class="fas fa-map-marker-alt"></i> ${appointment.cityName}</p>` : ''}
            </div>
            <div class="appointment-status">
                <span class="status-badge status-${appointment.status.toLowerCase()}">
                    ${appointment.statusText}
                </span>
                <div class="appointment-price">
                    ${formatPrice(appointment.totalPrice)} تومان
                </div>
            </div>
            <div class="appointment-actions">
                <button class="btn btn-sm btn-outline-gold" onclick="showAppointmentDetails(${appointment.id})" title="جزئیات">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// بررسی نوبت‌های جدید
function checkForNewAppointments() {
    // بررسی localStorage برای نوبت‌های جدید
    const newAppointmentId = localStorage.getItem('newAppointmentId');
    if (newAppointmentId) {
        // نمایش پیام موفقیت
        showNotification('نوبت شما با موفقیت ثبت شد!', 'success');
        
        // حذف از localStorage
        localStorage.removeItem('newAppointmentId');
        
        // بارگذاری مجدد نوبت‌ها
        setTimeout(() => {
            loadUserAppointments();
        }, 1000);
    }
}

// توابع کمکی
function getMonthName(monthIndex) {
    const months = [
        'ژانویه', 'فوریه', 'مارس', 'آوریل', 'می', 'ژوئن',
        'ژوئیه', 'آگوست', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
    ];
    return months[monthIndex];
}

function formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(price);
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
    console.log('Opening edit profile modal...');
    
    // Remove any existing modals
    const existingModal = document.querySelector('.profile-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = createEditProfileModal();
    document.body.appendChild(modal);
    
    console.log('Modal added to DOM:', modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
        console.log('Modal show class added');
    }, 50);
    
    // Focus on first input after animation
    setTimeout(() => {
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
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
                        <label for="firstName">
                            <i class="fas fa-user"></i>
                            نام
                        </label>
                        <input type="text" id="firstName" name="firstName" class="form-control" 
                               placeholder="نام خود را وارد کنید" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName">
                            <i class="fas fa-user"></i>
                            نام خانوادگی
                        </label>
                        <input type="text" id="lastName" name="lastName" class="form-control" 
                               placeholder="نام خانوادگی خود را وارد کنید" required>
                    </div>
                    <div class="form-group">
                        <label for="phoneNumber">
                            <i class="fas fa-phone"></i>
                            شماره موبایل
                        </label>
                        <input type="tel" id="phoneNumber" name="phoneNumber" class="form-control"
                               placeholder="09xxxxxxxxx">
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
    const firstNameElement = document.querySelector('#display-firstName');
    const lastNameElement = document.querySelector('#display-lastName');
    const phoneElement = document.querySelector('#display-phoneNumber');
    
    if (firstNameElement) {
        modal.querySelector('#firstName').value = firstNameElement.textContent.trim();
    }
    
    if (lastNameElement) {
        modal.querySelector('#lastName').value = lastNameElement.textContent.trim();
    }
    
    if (phoneElement) {
        const phone = phoneElement.textContent.trim();
        if (phone !== 'وارد نشده') {
            modal.querySelector('#phoneNumber').value = phone;
        }
    }
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
    
    console.log('Submitting profile data:', data);
    
    // Validation
    if (!data.firstName || !data.lastName) {
        showNotification('نام و نام خانوادگی الزامی است', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...';
    submitBtn.disabled = true;
    
    // Get CSRF token
    const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value || 
                  document.querySelector('meta[name="__RequestVerificationToken"]')?.content || '';
    
    console.log('CSRF Token:', token);
    
    // Send update request
    fetch('/Profile/UpdateProfile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': token
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        console.log('Response result:', result);
        if (result.success) {
            showNotification('پروفایل با موفقیت بروزرسانی شد', 'success');
            
            // Update display values
            document.querySelector('#display-firstName').textContent = data.firstName;
            document.querySelector('#display-lastName').textContent = data.lastName;
            document.querySelector('#display-fullName').textContent = `${data.firstName} ${data.lastName}`;
            document.querySelector('#display-phoneNumber').textContent = data.phoneNumber || 'وارد نشده';
            
            closeEditProfileModal();
        } else {
            showNotification(result.message || 'خطا در بروزرسانی پروفایل', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('خطا در ارتباط با سرور: ' + error.message, 'error');
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// Cancel Appointment
function cancelAppointment(appointmentId, buttonElement) {
    if (!confirm('آیا از لغو این نوبت اطمینان دارید؟')) {
        return;
    }
    
    // Show loading state
    const button = buttonElement || document.querySelector(`button[onclick*="${appointmentId}"]`);
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
function loadMoreAppointments(buttonElement) {
    const button = buttonElement || document.querySelector('button[onclick*="loadMoreAppointments"]');
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
.profile-modal {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 10000 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    background: rgba(0, 0, 0, 0.5);
}

.profile-modal.show {
    opacity: 1 !important;
    visibility: visible !important;
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
    background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%) !important;
    border-radius: 20px !important;
    max-width: 500px !important;
    width: 90% !important;
    max-height: 90vh !important;
    overflow-y: auto !important;
    position: relative !important;
    z-index: 10001 !important;
    border: 2px solid rgba(212, 175, 55, 0.3) !important;
    transform: scale(0.9);
    transition: transform 0.3s ease !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5) !important;
}

.profile-modal.show .modal-content {
    transform: scale(1) !important;
}

.modal-header {
    padding: 25px 30px 20px !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%) !important;
    border-radius: 20px 20px 0 0 !important;
}

.modal-header h3 {
    color: #d4af37 !important;
    margin: 0 !important;
    font-size: 1.5rem !important;
    font-weight: 600 !important;
}

.modal-close {
    background: none !important;
    border: none !important;
    color: rgba(255, 255, 255, 0.6) !important;
    font-size: 1.2rem !important;
    cursor: pointer !important;
    padding: 8px !important;
    border-radius: 50% !important;
    transition: all 0.3s ease !important;
    width: 36px !important;
    height: 36px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

.modal-close:hover {
    color: #fff !important;
    background: rgba(255, 255, 255, 0.1) !important;
}

.modal-body {
    padding: 30px !important;
}

.form-group {
    margin-bottom: 20px !important;
}

.form-group label {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    color: #d4af37 !important;
    margin-bottom: 8px !important;
    font-weight: 600 !important;
    font-size: 0.9rem !important;
}

.form-group label i {
    width: 16px !important;
    text-align: center !important;
    color: #d4af37 !important;
}

.form-control {
    width: 100% !important;
    padding: 12px 16px !important;
    background: rgba(42, 42, 42, 0.8) !important;
    border: 2px solid rgba(212, 175, 55, 0.2) !important;
    border-radius: 10px !important;
    color: #fff !important;
    font-size: 1rem !important;
    transition: all 0.3s ease !important;
    box-sizing: border-box !important;
}

.form-control:focus {
    outline: none !important;
    border-color: #d4af37 !important;
    background: rgba(42, 42, 42, 1) !important;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2) !important;
}

.form-control::placeholder {
    color: rgba(255, 255, 255, 0.5) !important;
}

.form-actions {
    display: flex !important;
    gap: 15px !important;
    justify-content: flex-end !important;
    margin-top: 30px !important;
    padding-top: 20px !important;
    border-top: 1px solid rgba(212, 175, 55, 0.2) !important;
}

.btn {
    padding: 12px 24px !important;
    border-radius: 25px !important;
    font-weight: 600 !important;
    text-decoration: none !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
    transition: all 0.3s ease !important;
    border: none !important;
    cursor: pointer !important;
    font-size: 0.9rem !important;
    min-width: 120px !important;
    justify-content: center !important;
}

.btn-gold {
    background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%) !important;
    color: #1a1a1a !important;
    border: 2px solid #d4af37 !important;
}

.btn-gold:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4) !important;
    color: #1a1a1a !important;
}

.btn-outline-gold {
    background: transparent !important;
    color: #d4af37 !important;
    border: 2px solid #d4af37 !important;
}

.btn-outline-gold:hover {
    background: #d4af37 !important;
    color: #1a1a1a !important;
    transform: translateY(-2px) !important;
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
const styleElement = document.createElement('style');
styleElement.textContent = additionalStyles;
document.head.appendChild(styleElement);

// Add temporary test button for modal debugging
if (window.location.hostname === 'localhost') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            const testBtn = document.createElement('button');
            testBtn.textContent = 'تست مودال ویرایش';
            testBtn.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 9999;
                padding: 10px 15px;
                background: #d4af37;
                color: #1a1a1a;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
            `;
            testBtn.onclick = function() {
                console.log('Test button clicked');
                editProfile();
            };
            document.body.appendChild(testBtn);
        }, 1000);
    });
}