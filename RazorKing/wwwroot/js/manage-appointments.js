// Manage Appointments JavaScript
document.addEventListener('DOMContentLoaded', function() {
    let currentWeekStart = getWeekStart(new Date());
    let currentView = 'week';
    let appointments = window.barbershopData?.appointments || [];
    let workingDays = window.barbershopData?.workingDays?.split(',') || [];
    let openTime = window.barbershopData?.openTime || '09:00';
    let closeTime = window.barbershopData?.closeTime || '18:00';
    
    // Initialize
    initializeCalendar();
    setupEventListeners();
    updateStats();
    
    function initializeCalendar() {
        generateTimeSlots();
        generateDayColumns();
        loadAppointments();
        updateWeekDisplay();
    }
    
    function setupEventListeners() {
        // Week navigation
        document.getElementById('prevWeek').addEventListener('click', () => {
            currentWeekStart = new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
            updateCalendar();
        });
        
        document.getElementById('nextWeek').addEventListener('click', () => {
            currentWeekStart = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            updateCalendar();
        });
        
        // View controls
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentView = e.target.dataset.view;
                updateCalendar();
            });
        });
        
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', refreshData);
        
        // Block time button
        document.getElementById('blockTimeBtn').addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('blockTimeModal'));
            modal.show();
        });
        
        // Block time form
        document.getElementById('confirmBlockTime').addEventListener('click', handleBlockTime);
        
        // Appointment modal actions
        document.getElementById('completeAppointment').addEventListener('click', () => {
            changeAppointmentStatus('Completed');
        });
        
        document.getElementById('cancelAppointment').addEventListener('click', () => {
            changeAppointmentStatus('Cancelled');
        });
    }
    
    function generateTimeSlots() {
        const timeSlotsContainer = document.getElementById('timeSlots');
        timeSlotsContainer.innerHTML = '';
        
        const startHour = parseInt(openTime.split(':')[0]);
        const endHour = parseInt(closeTime.split(':')[0]);
        
        for (let hour = startHour; hour <= endHour; hour++) {
            // Full hour slot
            const hourSlot = document.createElement('div');
            hourSlot.className = 'time-slot hour-mark';
            hourSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
            timeSlotsContainer.appendChild(hourSlot);
            
            // 15-minute intervals (except for the last hour)
            if (hour < endHour) {
                for (let minute = 15; minute < 60; minute += 15) {
                    const minuteSlot = document.createElement('div');
                    minuteSlot.className = 'time-slot';
                    minuteSlot.textContent = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    timeSlotsContainer.appendChild(minuteSlot);
                }
            }
        }
    }
    
    function generateDayColumns() {
        const daysContainer = document.getElementById('daysContainer');
        daysContainer.innerHTML = '';
        
        const dayNames = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
        
        if (currentView === 'week') {
            // Generate 7 days for week view
            for (let i = 0; i < 7; i++) {
                const date = new Date(currentWeekStart.getTime() + i * 24 * 60 * 60 * 1000);
                const dayColumn = createDayColumn(date, dayNames[i]);
                daysContainer.appendChild(dayColumn);
            }
        } else {
            // Generate single day for day view
            const today = new Date();
            const dayName = dayNames[today.getDay() === 6 ? 0 : today.getDay() + 1];
            const dayColumn = createDayColumn(today, dayName);
            daysContainer.appendChild(dayColumn);
        }
    }
    
    function createDayColumn(date, dayName) {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        
        // Day header
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        if (isToday(date)) {
            dayHeader.classList.add('today');
        }
        
        const dayNameElement = document.createElement('div');
        dayNameElement.className = 'day-name';
        dayNameElement.textContent = dayName;
        
        const dayDateElement = document.createElement('div');
        dayDateElement.className = 'day-date';
        dayDateElement.textContent = formatDate(date);
        
        dayHeader.appendChild(dayNameElement);
        dayHeader.appendChild(dayDateElement);
        
        // Day slots
        const daySlots = document.createElement('div');
        daySlots.className = 'day-slots';
        
        const startHour = parseInt(openTime.split(':')[0]);
        const endHour = parseInt(closeTime.split(':')[0]);
        
        for (let hour = startHour; hour <= endHour; hour++) {
            // Full hour slot
            const hourSlot = createTimeSlot(date, hour, 0, true);
            daySlots.appendChild(hourSlot);
            
            // 15-minute intervals
            if (hour < endHour) {
                for (let minute = 15; minute < 60; minute += 15) {
                    const minuteSlot = createTimeSlot(date, hour, minute, false);
                    daySlots.appendChild(minuteSlot);
                }
            }
        }
        
        dayColumn.appendChild(dayHeader);
        dayColumn.appendChild(daySlots);
        
        return dayColumn;
    }
    
    function createTimeSlot(date, hour, minute, isHourMark) {
        const slot = document.createElement('div');
        slot.className = 'appointment-slot';
        
        if (isHourMark) {
            slot.classList.add('hour-mark');
        }
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const dateString = formatDateForAPI(date);
        
        // Check if this day is a working day
        const dayName = getDayName(date);
        if (!workingDays.includes(dayName)) {
            slot.classList.add('blocked');
            slot.innerHTML = '<div class="appointment-content"><div class="appointment-time">تعطیل</div></div>';
            return slot;
        }
        
        // Check for existing appointment
        const existingAppointment = appointments.find(apt => 
            apt.date === dateString && apt.time === timeString
        );
        
        if (existingAppointment) {
            slot.classList.add('booked');
            slot.innerHTML = `
                <div class="appointment-content">
                    <div class="appointment-status ${existingAppointment.status.toLowerCase()}"></div>
                    <div class="appointment-time">${timeString}</div>
                    <div class="appointment-customer">${existingAppointment.customerName}</div>
                    <div class="appointment-service">${existingAppointment.serviceName}</div>
                </div>
            `;
            
            slot.addEventListener('click', () => showAppointmentDetails(existingAppointment));
        } else {
            // Check if it's break time (15 minutes after each appointment)
            const prevSlot = appointments.find(apt => {
                const aptTime = new Date(`${apt.date}T${apt.time}`);
                const slotTime = new Date(`${dateString}T${timeString}`);
                const timeDiff = slotTime.getTime() - aptTime.getTime();
                return timeDiff > 0 && timeDiff <= 15 * 60 * 1000; // 15 minutes
            });
            
            if (prevSlot) {
                slot.classList.add('break');
                slot.innerHTML = '<div class="appointment-content"><div class="appointment-time">استراحت</div></div>';
            } else {
                slot.classList.add('available');
                slot.innerHTML = `
                    <div class="appointment-content">
                        <div class="appointment-time">${timeString}</div>
                        <div class="appointment-customer">آزاد</div>
                    </div>
                `;
                
                slot.addEventListener('click', () => handleSlotClick(dateString, timeString));
            }
        }
        
        return slot;
    }
    
    function loadAppointments() {
        // Appointments are already loaded from server data
        // This function can be used to refresh data via AJAX
    }
    
    function updateCalendar() {
        generateDayColumns();
        updateWeekDisplay();
        updateStats();
    }
    
    function updateWeekDisplay() {
        const weekText = document.getElementById('currentWeekText');
        if (currentView === 'week') {
            const weekEnd = new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
            weekText.textContent = `${formatDate(currentWeekStart)} - ${formatDate(weekEnd)}`;
        } else {
            weekText.textContent = formatDate(new Date());
        }
    }
    
    function updateStats() {
        const today = new Date();
        const todayString = formatDateForAPI(today);
        const weekStart = getWeekStart(today);
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        
        // Today's appointments
        const todayAppointments = appointments.filter(apt => apt.date === todayString);
        document.getElementById('todayAppointments').textContent = todayAppointments.length;
        
        // Available slots today
        const totalSlotsToday = calculateTotalSlots(today);
        const availableToday = totalSlotsToday - todayAppointments.length;
        document.getElementById('availableSlots').textContent = availableToday;
        
        // Weekly customers
        const weeklyCustomers = appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= weekStart && aptDate <= weekEnd;
        }).length;
        document.getElementById('totalCustomers').textContent = weeklyCustomers;
        
        // Weekly revenue
        const weeklyRevenue = appointments
            .filter(apt => {
                const aptDate = new Date(apt.date);
                return aptDate >= weekStart && aptDate <= weekEnd && apt.status === 'Completed';
            })
            .reduce((sum, apt) => sum + (apt.servicePrice || 0), 0);
        
        document.getElementById('weeklyRevenue').textContent = formatCurrency(weeklyRevenue);
    }
    
    function calculateTotalSlots(date) {
        const dayName = getDayName(date);
        if (!workingDays.includes(dayName)) return 0;
        
        const startHour = parseInt(openTime.split(':')[0]);
        const endHour = parseInt(closeTime.split(':')[0]);
        return (endHour - startHour) * 4; // 4 slots per hour (15-minute intervals)
    }
    
    function showAppointmentDetails(appointment) {
        const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
        const detailsContainer = document.querySelector('.appointment-details');
        
        detailsContainer.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">مشتری:</span>
                <span class="detail-value">${appointment.customerName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">شماره تماس:</span>
                <span class="detail-value">${appointment.customerPhone}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">خدمت:</span>
                <span class="detail-value">${appointment.serviceName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">قیمت:</span>
                <span class="detail-value">${formatCurrency(appointment.servicePrice)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">تاریخ:</span>
                <span class="detail-value">${formatDatePersian(appointment.date)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">ساعت:</span>
                <span class="detail-value">${appointment.time}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">وضعیت:</span>
                <span class="detail-value">${getStatusText(appointment.status)}</span>
            </div>
        `;
        
        // Store appointment ID for actions
        modal._element.dataset.appointmentId = appointment.id;
        
        modal.show();
    }
    
    function handleSlotClick(date, time) {
        // This can be extended to show a booking form or redirect to booking page
        showNotification(`زمان انتخاب شده: ${formatDatePersian(date)} - ${time}`, 'info');
    }
    
    function changeAppointmentStatus(newStatus) {
        const modal = document.getElementById('appointmentModal');
        const appointmentId = modal.dataset.appointmentId;
        
        if (!appointmentId) return;
        
        // Show loading
        const btn = event.target;
        btn.classList.add('loading');
        btn.disabled = true;
        
        // Send AJAX request
        fetch('/Barber/ChangeAppointmentStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value
            },
            body: JSON.stringify({
                appointmentId: parseInt(appointmentId),
                status: newStatus
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                
                // Update local data
                const appointment = appointments.find(apt => apt.id == appointmentId);
                if (appointment) {
                    appointment.status = newStatus;
                }
                
                // Refresh calendar
                updateCalendar();
                
                // Close modal
                bootstrap.Modal.getInstance(modal).hide();
            } else {
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('خطا در تغییر وضعیت نوبت', 'error');
        })
        .finally(() => {
            btn.classList.remove('loading');
            btn.disabled = false;
        });
    }
    
    function handleBlockTime() {
        const date = document.getElementById('blockDate').value;
        const startTime = document.getElementById('blockStartTime').value;
        const endTime = document.getElementById('blockEndTime').value;
        const reason = document.getElementById('blockReason').value;
        
        if (!date || !startTime || !endTime) {
            showNotification('لطفاً تمام فیلدهای الزامی را تکمیل کنید', 'error');
            return;
        }
        
        if (startTime >= endTime) {
            showNotification('ساعت پایان باید بعد از ساعت شروع باشد', 'error');
            return;
        }
        
        // Show loading
        const btn = document.getElementById('confirmBlockTime');
        btn.classList.add('loading');
        btn.disabled = true;
        
        // Send AJAX request
        fetch('/Barber/BlockTime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value
            },
            body: JSON.stringify({
                date: date,
                startTime: startTime,
                endTime: endTime,
                reason: reason
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                
                // Refresh calendar
                refreshData();
                
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('blockTimeModal')).hide();
                
                // Reset form
                document.getElementById('blockTimeForm').reset();
            } else {
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('خطا در مسدود کردن زمان', 'error');
        })
        .finally(() => {
            btn.classList.remove('loading');
            btn.disabled = false;
        });
    }
    
    function refreshData() {
        const btn = document.getElementById('refreshBtn');
        btn.classList.add('loading');
        btn.disabled = true;
        
        // Refresh appointments data
        fetch('/Barber/GetTodayAppointments')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                // Update appointments data
                appointments = data.map(apt => ({
                    id: apt.id,
                    date: apt.date || new Date().toISOString().split('T')[0],
                    time: apt.appointmentTime,
                    customerName: apt.customerName,
                    customerPhone: apt.customerPhone,
                    serviceName: apt.serviceName,
                    servicePrice: apt.servicePrice,
                    status: apt.status
                }));
                
                // Refresh calendar
                updateCalendar();
                showNotification('اطلاعات به‌روزرسانی شد', 'success');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('خطا در بروزرسانی اطلاعات', 'error');
        })
        .finally(() => {
            btn.classList.remove('loading');
            btn.disabled = false;
        });
    }
    
    // Utility functions
    function getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Saturday start
        return new Date(d.setDate(diff));
    }
    
    function isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    
    function formatDate(date) {
        return date.toLocaleDateString('fa-IR');
    }
    
    function formatDateForAPI(date) {
        return date.toISOString().split('T')[0];
    }
    
    function formatDatePersian(dateString) {
        return new Date(dateString).toLocaleDateString('fa-IR');
    }
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('fa-IR', {
            style: 'currency',
            currency: 'IRR',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    function getDayName(date) {
        const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
        return dayNames[date.getDay()];
    }
    
    function getStatusText(status) {
        const statusMap = {
            'Pending': 'در انتظار',
            'Confirmed': 'تایید شده',
            'Completed': 'تکمیل شده',
            'Cancelled': 'لغو شده'
        };
        return statusMap[status] || status;
    }
    
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info'} alert-dismissible fade show`;
        
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Auto-refresh every 5 minutes
    setInterval(refreshData, 5 * 60 * 1000);
});