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

// Enhanced Debug function for appointments
async function debugAppointments() {
    try {
        console.log('🔍 شروع بررسی نوبت‌ها...');
        showNotification('در حال بررسی نوبت‌ها...', 'info');
        
        // Create debug modal
        const debugModal = createDebugModal();
        document.body.appendChild(debugModal);
        setTimeout(() => debugModal.classList.add('show'), 10);
        
        const updateDebugContent = (content) => {
            const debugContent = debugModal.querySelector('.debug-content');
            if (debugContent) {
                debugContent.innerHTML = content;
            }
        };
        
        updateDebugContent('<div class="debug-loading"><i class="fas fa-spinner fa-spin"></i> در حال بررسی...</div>');
        
        const results = {};
        
        // بررسی نوبت‌های کاربر از Profile
        try {
            const userResponse = await fetch('/Profile/GetMyAppointments');
            results.userAppointments = await userResponse.json();
            console.log('📊 نوبت‌های کاربر از Profile:', results.userAppointments);
        } catch (e) {
            results.userAppointments = { error: e.message };
        }
        
        // بررسی اطلاعات کاربر
        try {
            const debugResponse = await fetch('/Profile/DebugAppointments');
            results.debugInfo = await debugResponse.json();
            console.log('📊 Debug اطلاعات کاربر:', results.debugInfo);
        } catch (e) {
            results.debugInfo = { error: e.message };
        }
        
        // بررسی کل نوبت‌ها در سیستم
        try {
            const homeResponse = await fetch('/Home/DebugAllAppointments');
            results.allAppointments = await homeResponse.json();
            console.log('📊 کل نوبت‌ها در سیستم:', results.allAppointments);
        } catch (e) {
            results.allAppointments = { error: e.message };
        }
        
        // بررسی نوبت‌های کاربر از Home
        try {
            const homeUserResponse = await fetch('/Home/CheckUserAppointments');
            results.homeUserCheck = await homeUserResponse.json();
            console.log('📊 نوبت‌های کاربر از Home:', results.homeUserCheck);
        } catch (e) {
            results.homeUserCheck = { error: e.message };
        }
        
        // نمایش نتایج در مودال
        const debugContent = generateDebugReport(results);
        updateDebugContent(debugContent);
        
        showNotification('بررسی نوبت‌ها تکمیل شد', 'success');
        
    } catch (error) {
        console.error('❌ خطا در بررسی نوبت‌ها:', error);
        showNotification('خطا در بررسی نوبت‌ها: ' + error.message, 'error');
    }
}

function createDebugModal() {
    const modal = document.createElement('div');
    modal.className = 'profile-modal debug-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeDebugModal()"></div>
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h3><i class="fas fa-bug"></i> بررسی نوبت‌ها</h3>
                <button class="modal-close" onclick="closeDebugModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="debug-content">
                    <div class="debug-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        در حال بررسی...
                    </div>
                </div>
            </div>
        </div>
    `;
    return modal;
}

function generateDebugReport(results) {
    const userInfo = results.debugInfo?.userInfo || {};
    const userAppointments = results.userAppointments || {};
    const allAppointments = results.allAppointments || {};
    const homeUserCheck = results.homeUserCheck || {};
    
    return `
        <div class="debug-report">
            <div class="debug-section">
                <h4><i class="fas fa-user"></i> اطلاعات کاربر</h4>
                <div class="debug-info">
                    <div class="info-item">
                        <span class="label">ایمیل:</span>
                        <span class="value">${userInfo.email || 'نامشخص'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">نام کاربری:</span>
                        <span class="value">${userInfo.userName || 'نامشخص'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">نام کامل:</span>
                        <span class="value">${(userInfo.firstName || '') + ' ' + (userInfo.lastName || '')}</span>
                    </div>
                </div>
            </div>
            
            <div class="debug-section">
                <h4><i class="fas fa-calendar-alt"></i> نوبت‌های کاربر (Profile)</h4>
                <div class="debug-info">
                    <div class="info-item">
                        <span class="label">وضعیت:</span>
                        <span class="value ${userAppointments.success ? 'success' : 'error'}">
                            ${userAppointments.success ? 'موفق' : 'خطا'}
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="label">تعداد کل:</span>
                        <span class="value">${userAppointments.totalCount || 0}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">آینده:</span>
                        <span class="value">${userAppointments.upcomingCount || 0}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">گذشته:</span>
                        <span class="value">${userAppointments.pastCount || 0}</span>
                    </div>
                </div>
            </div>
            
            <div class="debug-section">
                <h4><i class="fas fa-database"></i> کل نوبت‌ها در سیستم</h4>
                <div class="debug-info">
                    <div class="info-item">
                        <span class="label">وضعیت:</span>
                        <span class="value ${allAppointments.success ? 'success' : 'error'}">
                            ${allAppointments.success ? 'موفق' : 'خطا'}
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="label">تعداد کل:</span>
                        <span class="value">${allAppointments.totalAppointments || 0}</span>
                    </div>
                </div>
            </div>
            
            <div class="debug-section">
                <h4><i class="fas fa-check-circle"></i> بررسی از Home</h4>
                <div class="debug-info">
                    <div class="info-item">
                        <span class="label">نوبت‌های کاربر:</span>
                        <span class="value">${homeUserCheck.data?.userAppointments || 0}</span>
                    </div>
                </div>
            </div>
            
            <div class="debug-actions">
                <button class="btn btn-outline-gold" onclick="copyDebugInfo()">
                    <i class="fas fa-copy"></i>
                    کپی اطلاعات
                </button>
                <button class="btn btn-gold" onclick="refreshAppointments(); closeDebugModal();">
                    <i class="fas fa-sync-alt"></i>
                    بروزرسانی
                </button>
            </div>
        </div>
    `;
}

function closeDebugModal() {
    const modal = document.querySelector('.debug-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

function copyDebugInfo() {
    // This would copy debug info to clipboard
    showNotification('اطلاعات دیباگ کپی شد', 'success');
}

// Create test appointment
async function createTestAppointment() {
    try {
        console.log('🔧 ایجاد نوبت تست...');
        showNotification('در حال ایجاد نوبت تست...', 'info');
        
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
            showNotification('نوبت تست با موفقیت ایجاد شد!', 'success');
            
            alert(`✅ نوبت تست با موفقیت ایجاد شد!
            
📅 جزئیات:
- شناسه: ${result.appointment.id}
- تاریخ: ${result.appointment.date}
- ساعت: ${result.appointment.time}
- آرایشگاه: ${result.appointment.barbershop}
- خدمت: ${result.appointment.service}
- قیمت: ${result.appointment.price} تومان

صفحه به‌روزرسانی می‌شود...`);
            
            // Refresh appointments without full page reload
            setTimeout(async () => {
                await loadUserAppointments();
                showNotification('نوبت‌ها به‌روزرسانی شد', 'success');
            }, 1000);
            
        } else {
            showNotification('خطا در ایجاد نوبت تست: ' + (result.error || result.message), 'error');
            alert('❌ خطا در ایجاد نوبت تست: ' + (result.error || result.message));
        }
        
    } catch (error) {
        console.error('❌ خطا در ایجاد نوبت تست:', error);
        showNotification('خطا در ایجاد نوبت تست: ' + error.message, 'error');
        alert('خطا در ایجاد نوبت تست: ' + error.message);
    }
}

// Refresh appointments manually
async function refreshAppointments() {
    console.log('🔄 بروزرسانی دستی نوبت‌ها...');
    showNotification('در حال بروزرسانی نوبت‌ها...', 'info');
    await loadUserAppointments();
}

// Show all appointments in a modal
async function showAllAppointments() {
    try {
        console.log('📋 نمایش همه نوبت‌ها...');
        showNotification('در حال بارگذاری همه نوبت‌ها...', 'info');
        
        const response = await fetch('/Profile/GetMyAppointments');
        const result = await response.json();
        
        if (result.success && result.appointments) {
            const modal = createAllAppointmentsModal(result.appointments);
            document.body.appendChild(modal);
            
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            
            showNotification(`${result.appointments.length} نوبت یافت شد`, 'success');
        } else {
            showNotification('خطا در بارگذاری نوبت‌ها', 'error');
        }
        
    } catch (error) {
        console.error('❌ خطا در نمایش همه نوبت‌ها:', error);
        showNotification('خطا در نمایش همه نوبت‌ها: ' + error.message, 'error');
    }
}

function createAllAppointmentsModal(appointments) {
    const modal = document.createElement('div');
    modal.className = 'profile-modal appointments-modal';
    
    const upcomingAppointments = appointments.filter(a => a.isUpcoming);
    const pastAppointments = appointments.filter(a => !a.isUpcoming);
    
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeAllAppointmentsModal()"></div>
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h3><i class="fas fa-calendar-alt"></i> همه نوبت‌ها (${appointments.length})</h3>
                <button class="modal-close" onclick="closeAllAppointmentsModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="appointments-tabs">
                    <button class="tab-btn active" onclick="switchAppointmentsTab(this, 'upcoming')">
                        <i class="fas fa-calendar-plus"></i>
                        آینده (${upcomingAppointments.length})
                    </button>
                    <button class="tab-btn" onclick="switchAppointmentsTab(this, 'past')">
                        <i class="fas fa-history"></i>
                        گذشته (${pastAppointments.length})
                    </button>
                    <button class="tab-btn" onclick="switchAppointmentsTab(this, 'all')">
                        <i class="fas fa-list"></i>
                        همه (${appointments.length})
                    </button>
                </div>
                
                <div class="appointments-content">
                    <div class="tab-content active" id="upcoming-tab">
                        ${renderAppointmentsList(upcomingAppointments, 'upcoming')}
                    </div>
                    <div class="tab-content" id="past-tab">
                        ${renderAppointmentsList(pastAppointments, 'past')}
                    </div>
                    <div class="tab-content" id="all-tab">
                        ${renderAppointmentsList(appointments, 'all')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

function renderAppointmentsList(appointments, type) {
    if (appointments.length === 0) {
        return `
            <div class="empty-appointments">
                <i class="fas fa-calendar-times"></i>
                <p>نوبتی یافت نشد</p>
            </div>
        `;
    }
    
    return `
        <div class="appointments-list-modal">
            ${appointments.map(appointment => `
                <div class="appointment-item-modal ${type}">
                    <div class="appointment-header">
                        <div class="appointment-date-time">
                            <div class="date-info">
                                <i class="fas fa-calendar"></i>
                                <span>${appointment.appointmentDate}</span>
                            </div>
                            <div class="time-info">
                                <i class="fas fa-clock"></i>
                                <span>${appointment.appointmentTime}</span>
                            </div>
                        </div>
                        <div class="appointment-status-badge">
                            <span class="status-badge status-${appointment.status.toLowerCase()}">
                                ${appointment.statusText}
                            </span>
                        </div>
                    </div>
                    
                    <div class="appointment-details-modal">
                        <div class="detail-row">
                            <i class="fas fa-store"></i>
                            <span class="label">آرایشگاه:</span>
                            <span class="value">${appointment.barbershopName}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fas fa-cut"></i>
                            <span class="label">خدمت:</span>
                            <span class="value">${appointment.serviceName}</span>
                        </div>
                        ${appointment.cityName ? `
                            <div class="detail-row">
                                <i class="fas fa-map-marker-alt"></i>
                                <span class="label">شهر:</span>
                                <span class="value">${appointment.cityName}</span>
                            </div>
                        ` : ''}
                        <div class="detail-row">
                            <i class="fas fa-money-bill"></i>
                            <span class="label">قیمت:</span>
                            <span class="value price">${formatPrice(appointment.totalPrice)} تومان</span>
                        </div>
                        <div class="detail-row">
                            <i class="fas fa-calendar-plus"></i>
                            <span class="label">ثبت شده:</span>
                            <span class="value">${appointment.createdAt}</span>
                        </div>
                    </div>
                    
                    <div class="appointment-actions-modal">
                        ${appointment.canCancel ? `
                            <button class="btn btn-sm btn-danger" onclick="cancelAppointment(${appointment.id}, this)">
                                <i class="fas fa-times"></i>
                                لغو نوبت
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-gold" onclick="copyAppointmentInfo(${appointment.id})">
                            <i class="fas fa-copy"></i>
                            کپی اطلاعات
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function switchAppointmentsTab(button, tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab
    button.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function closeAllAppointmentsModal() {
    const modal = document.querySelector('.appointments-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function copyAppointmentInfo(appointmentId) {
    // This would copy appointment info to clipboard
    showNotification('اطلاعات نوبت کپی شد', 'success');
}

// Make functions globally available
window.debugAppointments = debugAppointments;
window.createTestAppointment = createTestAppointment;
window.refreshAppointments = refreshAppointments;
window.showAllAppointments = showAllAppointments;
window.switchAppointmentsTab = switchAppointmentsTab;
window.closeAllAppointmentsModal = closeAllAppointmentsModal;
window.copyAppointmentInfo = copyAppointmentInfo;
window.closeDebugModal = closeDebugModal;
window.copyDebugInfo = copyDebugInfo;

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

/* Appointments Modal Styles */
.large-modal {
    max-width: 900px !important;
    width: 95% !important;
    max-height: 90vh !important;
}

.appointments-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    border-bottom: 2px solid rgba(212, 175, 55, 0.2);
    padding-bottom: 15px;
}

.tab-btn {
    background: transparent !important;
    border: 2px solid rgba(212, 175, 55, 0.3) !important;
    color: rgba(255, 255, 255, 0.7) !important;
    padding: 10px 20px !important;
    border-radius: 25px !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    font-size: 0.9rem !important;
}

.tab-btn:hover,
.tab-btn.active {
    background: rgba(212, 175, 55, 0.2) !important;
    border-color: #d4af37 !important;
    color: #d4af37 !important;
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

.appointments-list-modal {
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 10px;
}

.appointment-item-modal {
    background: rgba(42, 42, 42, 0.8) !important;
    border: 2px solid rgba(212, 175, 55, 0.2) !important;
    border-radius: 15px !important;
    padding: 20px !important;
    margin-bottom: 15px !important;
    transition: all 0.3s ease !important;
}

.appointment-item-modal:hover {
    border-color: rgba(212, 175, 55, 0.5) !important;
    background: rgba(42, 42, 42, 1) !important;
}

.appointment-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 15px !important;
    padding-bottom: 10px !important;
    border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
}

.appointment-date-time {
    display: flex !important;
    gap: 20px !important;
}

.date-info,
.time-info {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    color: #d4af37 !important;
    font-weight: 600 !important;
}

.appointment-details-modal {
    margin-bottom: 15px !important;
}

.detail-row {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    margin-bottom: 8px !important;
    color: rgba(255, 255, 255, 0.9) !important;
}

.detail-row i {
    width: 16px !important;
    text-align: center !important;
    color: #d4af37 !important;
}

.detail-row .label {
    font-weight: 600 !important;
    min-width: 80px !important;
    color: rgba(255, 255, 255, 0.7) !important;
}

.detail-row .value {
    flex: 1 !important;
}

.detail-row .value.price {
    color: #d4af37 !important;
    font-weight: 700 !important;
}

.appointment-actions-modal {
    display: flex !important;
    gap: 10px !important;
    justify-content: flex-end !important;
    padding-top: 10px !important;
    border-top: 1px solid rgba(212, 175, 55, 0.2) !important;
}

.empty-appointments {
    text-align: center !important;
    padding: 40px !important;
    color: rgba(255, 255, 255, 0.6) !important;
}

.empty-appointments i {
    font-size: 3rem !important;
    color: rgba(212, 175, 55, 0.5) !important;
    margin-bottom: 15px !important;
}

.status-badge {
    padding: 4px 12px !important;
    border-radius: 20px !important;
    font-size: 0.8rem !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
}

.status-pending {
    background: rgba(255, 193, 7, 0.2) !important;
    color: #ffc107 !important;
    border: 1px solid rgba(255, 193, 7, 0.3) !important;
}

.status-confirmed {
    background: rgba(40, 167, 69, 0.2) !important;
    color: #28a745 !important;
    border: 1px solid rgba(40, 167, 69, 0.3) !important;
}

.status-completed {
    background: rgba(23, 162, 184, 0.2) !important;
    color: #17a2b8 !important;
    border: 1px solid rgba(23, 162, 184, 0.3) !important;
}

.status-cancelled {
    background: rgba(220, 53, 69, 0.2) !important;
    color: #dc3545 !important;
    border: 1px solid rgba(220, 53, 69, 0.3) !important;
}

/* Scrollbar Styles */
.appointments-list-modal::-webkit-scrollbar {
    width: 8px;
}

.appointments-list-modal::-webkit-scrollbar-track {
    background: rgba(42, 42, 42, 0.5);
    border-radius: 4px;
}

.appointments-list-modal::-webkit-scrollbar-thumb {
    background: rgba(212, 175, 55, 0.5);
    border-radius: 4px;
}

.appointments-list-modal::-webkit-scrollbar-thumb:hover {
    background: rgba(212, 175, 55, 0.7);
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