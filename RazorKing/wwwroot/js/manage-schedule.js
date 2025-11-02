/**
 * Manage Schedule JavaScript
 * ریزر کینگ - مدیریت برنامه کاری آرایشگر
 */

let currentWeek = new Date();
let currentView = 'week';
let scheduleSettings = {
    slotInterval: 30, // minutes
    breakTime: 15 // minutes
};

document.addEventListener('DOMContentLoaded', function() {
    initializeSchedule();
    generateTimeSlots();
    
    // Initialize modal
    if (typeof bootstrap !== 'undefined') {
        window.timeSlotModal = new bootstrap.Modal(document.getElementById('timeSlotModal'));
    }
});

function initializeSchedule() {
    if (typeof window.scheduleData !== 'undefined') {
        console.log('Schedule data loaded:', window.scheduleData);
        updateWeekTitle();
        generateTimeSlots();
    }
}

function updateWeekTitle() {
    const titleElement = document.getElementById('currentWeekTitle');
    if (titleElement) {
        const startOfWeek = getStartOfWeek(currentWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const options = { month: 'long', day: 'numeric' };
        const startStr = startOfWeek.toLocaleDateString('fa-IR', options);
        const endStr = endOfWeek.toLocaleDateString('fa-IR', options);
        
        titleElement.textContent = `${startStr} - ${endStr}`;
    }
}

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Saturday as first day
    return new Date(d.setDate(diff));
}

function generateTimeSlots() {
    const grid = document.getElementById('timeSlotsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (currentView === 'week') {
        generateWeekView(grid);
    } else {
        generateDayView(grid);
    }
}

function generateWeekView(grid) {
    const startOfWeek = getStartOfWeek(currentWeek);
    const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    
    // Header row
    grid.appendChild(createTimeHeader(''));
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dayName = days[i];
        const dayDate = date.getDate();
        
        const header = createTimeHeader(`${dayName}\n${dayDate}`);
        grid.appendChild(header);
    }
    
    // Time slots
    const openTime = parseTime(window.scheduleData?.openTime || '09:00');
    const closeTime = parseTime(window.scheduleData?.closeTime || '21:00');
    
    for (let time = openTime; time < closeTime; time += scheduleSettings.slotInterval) {
        const timeStr = formatTime(time);
        const timeLabel = createTimeLabel(timeStr);
        grid.appendChild(timeLabel);
        
        // Create slots for each day
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + dayIndex);
            
            const slot = createTimeSlot(date, time);
            grid.appendChild(slot);
        }
    }
}

function generateDayView(grid) {
    // Implementation for day view
    const today = new Date(currentWeek);
    const dayName = today.toLocaleDateString('fa-IR', { weekday: 'long' });
    
    // Header
    grid.appendChild(createTimeHeader('ساعت'));
    grid.appendChild(createTimeHeader(dayName));
    
    const openTime = parseTime(window.scheduleData?.openTime || '09:00');
    const closeTime = parseTime(window.scheduleData?.closeTime || '21:00');
    
    for (let time = openTime; time < closeTime; time += scheduleSettings.slotInterval) {
        const timeStr = formatTime(time);
        const timeLabel = createTimeLabel(timeStr);
        grid.appendChild(timeLabel);
        
        const slot = createTimeSlot(today, time);
        grid.appendChild(slot);
    }
}

function createTimeHeader(text) {
    const header = document.createElement('div');
    header.className = 'time-header';
    header.textContent = text;
    return header;
}

function createTimeLabel(timeStr) {
    const label = document.createElement('div');
    label.className = 'time-label';
    label.textContent = timeStr;
    return label;
}

function createTimeSlot(date, timeMinutes) {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = formatTime(timeMinutes);
    
    // Check if this slot has an appointment
    const appointment = findAppointment(dateStr, timeStr);
    
    if (appointment) {
        slot.classList.add('booked', 'has-appointment');
        slot.setAttribute('data-customer', appointment.customerName);
        slot.textContent = 'رزرو شده';
        slot.title = `${appointment.customerName} - ${appointment.serviceName}`;
    } else if (isWorkingDay(date) && isWorkingHour(timeMinutes)) {
        slot.classList.add('available');
        slot.textContent = 'آزاد';
        slot.onclick = () => handleSlotClick(dateStr, timeStr);
    } else {
        slot.classList.add('blocked');
        slot.textContent = 'تعطیل';
    }
    
    return slot;
}

function findAppointment(dateStr, timeStr) {
    if (!window.scheduleData?.appointments) return null;
    
    return window.scheduleData.appointments.find(apt => 
        apt.date === dateStr && apt.time === timeStr
    );
}

function isWorkingDay(date) {
    const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
    const dayName = dayNames[date.getDay()];
    const workingDays = window.scheduleData?.workingDays || '';
    return workingDays.includes(dayName);
}

function isWorkingHour(timeMinutes) {
    const openTime = parseTime(window.scheduleData?.openTime || '09:00');
    const closeTime = parseTime(window.scheduleData?.closeTime || '21:00');
    return timeMinutes >= openTime && timeMinutes < closeTime;
}

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function handleSlotClick(date, time) {
    console.log(`Clicked slot: ${date} ${time}`);
    // Here you can implement slot booking or blocking functionality
    showSlotOptions(date, time);
}

function showSlotOptions(date, time) {
    const options = [
        { text: 'مسدود کردن این ساعت', action: () => blockTimeSlot(date, time) },
        { text: 'تنظیم به عنوان استراحت', action: () => setBreakTime(date, time) },
        { text: 'مشاهده جزئیات', action: () => viewSlotDetails(date, time) }
    ];
    
    // Simple implementation - you can enhance this with a proper modal
    const choice = prompt(`انتخاب عملیات برای ${date} ${time}:\n${options.map((opt, i) => `${i + 1}. ${opt.text}`).join('\n')}`);
    
    if (choice && choice >= 1 && choice <= options.length) {
        options[choice - 1].action();
    }
}

function previousWeek() {
    currentWeek.setDate(currentWeek.getDate() - 7);
    updateWeekTitle();
    generateTimeSlots();
}

function nextWeek() {
    currentWeek.setDate(currentWeek.getDate() + 7);
    updateWeekTitle();
    generateTimeSlots();
}

function setView(view) {
    currentView = view;
    
    // Update button states
    document.querySelectorAll('.view-options .btn').forEach(btn => {
        btn.classList.remove('active', 'btn-gold');
        btn.classList.add('btn-outline-gold');
    });
    
    event.target.classList.remove('btn-outline-gold');
    event.target.classList.add('active', 'btn-gold');
    
    generateTimeSlots();
}

function openTimeSlotModal() {
    if (window.timeSlotModal) {
        window.timeSlotModal.show();
    }
}

function saveScheduleSettings() {
    const openTime = document.getElementById('openTime').value;
    const closeTime = document.getElementById('closeTime').value;
    const workingDays = Array.from(document.querySelectorAll('input[name="workingDays"]:checked'))
        .map(cb => cb.value)
        .join(',');
    const slotInterval = parseInt(document.getElementById('slotInterval').value);
    const breakTime = parseInt(document.getElementById('breakTime').value);
    
    const data = {
        OpenTime: openTime,
        CloseTime: closeTime,
        WorkingDays: workingDays
    };
    
    // Update local settings
    scheduleSettings.slotInterval = slotInterval;
    scheduleSettings.breakTime = breakTime;
    
    fetch('/Barber/UpdateSchedule', {
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
            
            // Update local data
            if (window.scheduleData) {
                window.scheduleData.openTime = openTime;
                window.scheduleData.closeTime = closeTime;
                window.scheduleData.workingDays = workingDays;
            }
            
            generateTimeSlots();
            
            if (window.timeSlotModal) {
                window.timeSlotModal.hide();
            }
        } else {
            showNotification(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error saving schedule:', error);
        showNotification('خطا در ذخیره تنظیمات', 'error');
    });
}

function blockTimeSlot(date, time) {
    const reason = prompt('دلیل مسدود کردن این زمان را وارد کنید:');
    if (!reason) return;
    
    const data = {
        Date: date,
        Reason: reason
    };
    
    fetch('/Barber/BlockDate', {
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
            generateTimeSlots();
        } else {
            showNotification(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error blocking time slot:', error);
        showNotification('خطا در مسدود کردن زمان', 'error');
    });
}

function setBreakTime(date, time) {
    console.log(`Setting break time for ${date} ${time}`);
    showNotification('قابلیت تنظیم استراحت به زودی اضافه خواهد شد', 'info');
}

function viewSlotDetails(date, time) {
    console.log(`Viewing details for ${date} ${time}`);
    showNotification('جزئیات زمان انتخاب شده', 'info');
}

function viewStatistics() {
    console.log('Viewing statistics');
    showNotification('آمار نوبت‌ها به زودی اضافه خواهد شد', 'info');
}

function exportSchedule() {
    console.log('Exporting schedule');
    showNotification('خروجی برنامه به زودی اضافه خواهد شد', 'info');
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
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
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
window.previousWeek = previousWeek;
window.nextWeek = nextWeek;
window.setView = setView;
window.openTimeSlotModal = openTimeSlotModal;
window.saveScheduleSettings = saveScheduleSettings;
window.blockTimeSlot = blockTimeSlot;
window.setBreakTime = setBreakTime;
window.viewStatistics = viewStatistics;
window.exportSchedule = exportSchedule;