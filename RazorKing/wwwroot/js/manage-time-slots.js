// Time Slot Management JavaScript
let selectedTimeSlots = [];
let currentDate = window.currentDate || new Date().toISOString().split('T')[0];
let barbershopId = window.barbershopId || 0;

// Initialize when document is ready
$(document).ready(function () {
    initializePage();
    setupEventListeners();
    loadTimeSlots();
});

// Initialize page components
function initializePage() {
    // Set current date in date picker
    $('#selectedDate').val(currentDate);

    // Update date display
    updateDateDisplay();

    // Initialize modals
    initializeModals();
}

// Setup event listeners
function setupEventListeners() {
    // Date change handler
    $('#selectedDate').on('change', function () {
        currentDate = $(this).val();
        updateDateDisplay();
        loadTimeSlots();
    });

    // Quick date buttons
    $('.quick-dates button').on('click', function (e) {
        e.preventDefault();
        const action = $(this).text().trim();

        switch (action) {
            case 'امروز':
                selectToday();
                break;
            case 'فردا':
                selectTomorrow();
                break;
            case 'هفته آینده':
                selectNextWeek();
                break;
        }
    });

    // Time slot selection
    $(document).on('click', '.time-slot', function () {
        toggleTimeSlotSelection($(this));
    });

    // Slot type change handler
    $('#slotType').on('change', function () {
        const slotType = $(this).val();
        if (slotType === 'Blocked') {
            $('#blockReasonGroup').show();
            $('#isAvailable').prop('checked', false);
        } else {
            $('#blockReasonGroup').hide();
            $('#isAvailable').prop('checked', slotType === 'Available');
        }
    });
}

// Initialize modals
function initializeModals() {
    // Generate modal
    $('#generateModal').on('show.bs.modal', function () {
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        $('#startDate').val(today);
        $('#endDate').val(nextMonth.toISOString().split('T')[0]);
    });

    // Time slot modal
    $('#timeSlotModal').on('show.bs.modal', function () {
        resetTimeSlotForm();
    });
}

// Load time slots for current date
function loadTimeSlots() {
    showLoading('#timeSlotsGrid');

    $.ajax({
        url: '/Barber/GetDayTimeSlots',
        type: 'GET',
        data: { date: currentDate },
        success: function (response) {
            if (response.success) {
                renderTimeSlots(response.timeSlots);
                renderAppointments(response.appointments);
                updateDaySummary(response.timeSlots, response.appointments);
            } else {
                showError('خطا در بارگذاری بازه‌های زمانی: ' + response.message);
            }
        },
        error: function () {
            showError('خطا در ارتباط با سرور');
        },
        complete: function () {
            hideLoading('#timeSlotsGrid');
        }
    });
}

// Render time slots grid
function renderTimeSlots(timeSlots) {
    const grid = $('#timeSlotsGrid');
    grid.empty();

    if (!timeSlots || timeSlots.length === 0) {
        grid.html(`
            <div class="empty-state">
                <i class="fas fa-clock fa-3x text-muted mb-3"></i>
                <h4>هیچ بازه زمانی تعریف نشده</h4>
                <p class="text-muted">برای این تاریخ بازه زمانی تعریف نشده است</p>
                <button class="btn btn-gold" onclick="openGenerateModal()">
                    <i class="fas fa-magic"></i>
                    تولید خودکار بازه‌ها
                </button>
            </div>
        `);
        return;
    }

    let slotsHtml = '<div class="slots-grid">';

    timeSlots.forEach(slot => {
        const slotClass = getSlotClass(slot);
        const slotIcon = getSlotIcon(slot);
        const isSelectable = slot.slotType !== 'Booked';

        slotsHtml += `
            <div class="time-slot ${slotClass} ${isSelectable ? 'selectable' : ''}" 
                 data-slot-id="${slot.id}"
                 data-start-time="${slot.startTime}"
                 data-end-time="${slot.endTime}"
                 data-slot-type="${slot.slotType}"
                 data-is-available="${slot.isAvailable}"
                 data-is-blocked="${slot.isBlocked}">
                <div class="slot-header">
                    <span class="slot-time">${slot.startTime} - ${slot.endTime}</span>
                    <i class="slot-icon ${slotIcon}"></i>
                </div>
                <div class="slot-status">
                    ${getSlotStatusText(slot)}
                </div>
                ${slot.blockReason ? `<div class="slot-reason">${slot.blockReason}</div>` : ''}
                <div class="slot-actions">
                    ${getSlotActions(slot)}
                </div>
            </div>
        `;
    });

    slotsHtml += '</div>';
    grid.html(slotsHtml);
}

// Get slot CSS class based on status
function getSlotClass(slot) {
    if (slot.slotType === 'Booked') return 'booked';
    if (slot.isBlocked || slot.slotType === 'Blocked') return 'blocked';
    if (slot.slotType === 'Break') return 'break';
    if (slot.isAvailable) return 'available';
    return 'unavailable';
}

// Get slot icon based on status
function getSlotIcon(slot) {
    if (slot.slotType === 'Booked') return 'fas fa-user-check';
    if (slot.isBlocked || slot.slotType === 'Blocked') return 'fas fa-ban';
    if (slot.slotType === 'Break') return 'fas fa-coffee';
    if (slot.isAvailable) return 'fas fa-clock';
    return 'fas fa-times';
}

// Get slot status text
function getSlotStatusText(slot) {
    if (slot.slotType === 'Booked') return 'رزرو شده';
    if (slot.isBlocked || slot.slotType === 'Blocked') return 'مسدود';
    if (slot.slotType === 'Break') return 'استراحت';
    if (slot.isAvailable) return 'آزاد';
    return 'غیرفعال';
}

// Get slot action buttons
function getSlotActions(slot) {
    let actions = '';

    if (slot.slotType !== 'Booked') {
        actions += `<button class="btn btn-sm btn-outline-primary" onclick="editTimeSlot(${slot.id})" title="ویرایش">
                        <i class="fas fa-edit"></i>
                    </button>`;
    }

    if (slot.slotType === 'Available' || slot.slotType === 'Break') {
        actions += `<button class="btn btn-sm btn-outline-warning" onclick="blockTimeSlot(${slot.id})" title="مسدود کردن">
                        <i class="fas fa-ban"></i>
                    </button>`;
    }

    if (slot.isBlocked || slot.slotType === 'Blocked') {
        actions += `<button class="btn btn-sm btn-outline-success" onclick="unblockTimeSlot(${slot.id})" title="رفع مسدودی">
                        <i class="fas fa-unlock"></i>
                    </button>`;
    }

    return actions;
}

// Render appointments in sidebar
function renderAppointments(appointments) {
    const container = $('#dayAppointments');

    if (!appointments || appointments.length === 0) {
        container.html(`
            <div class="empty-appointments">
                <i class="fas fa-calendar-times text-muted mb-2"></i>
                <p class="text-muted mb-0">نوبتی برای این روز وجود ندارد</p>
            </div>
        `);
        return;
    }

    let appointmentsHtml = '';
    appointments.forEach(appointment => {
        const statusClass = getAppointmentStatusClass(appointment.status);

        appointmentsHtml += `
            <div class="appointment-item ${statusClass}">
                <div class="appointment-time">
                    <i class="fas fa-clock"></i>
                    ${appointment.time}
                </div>
                <div class="appointment-details">
                    <div class="customer-name">${appointment.customerName}</div>
                    <div class="service-name">${appointment.serviceName}</div>
                    <div class="appointment-status">${getAppointmentStatusText(appointment.status)}</div>
                </div>
            </div>
        `;
    });

    container.html(appointmentsHtml);
}

// Update day summary statistics
function updateDaySummary(timeSlots, appointments) {
    const totalSlots = timeSlots ? timeSlots.length : 0;
    const availableSlots = timeSlots ? timeSlots.filter(s => s.isAvailable && s.slotType === 'Available').length : 0;
    const bookedSlots = timeSlots ? timeSlots.filter(s => s.slotType === 'Booked').length : 0;
    const blockedSlots = timeSlots ? timeSlots.filter(s => s.isBlocked || s.slotType === 'Blocked').length : 0;

    const occupancyRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

    const summaryHtml = `
        <div class="stat-item">
            <div class="stat-value">${totalSlots}</div>
            <div class="stat-label">کل بازه‌ها</div>
        </div>
        <div class="stat-item">
            <div class="stat-value text-success">${availableSlots}</div>
            <div class="stat-label">آزاد</div>
        </div>
        <div class="stat-item">
            <div class="stat-value text-primary">${bookedSlots}</div>
            <div class="stat-label">رزرو شده</div>
        </div>
        <div class="stat-item">
            <div class="stat-value text-warning">${blockedSlots}</div>
            <div class="stat-label">مسدود</div>
        </div>
        <div class="stat-item">
            <div class="stat-value text-info">${occupancyRate}%</div>
            <div class="stat-label">نرخ اشغال</div>
        </div>
    `;

    $('#daySummary').html(summaryHtml);
}

// Quick date selection functions
function selectToday() {
    const today = new Date().toISOString().split('T')[0];
    $('#selectedDate').val(today);
    currentDate = today;
    updateDateDisplay();
    loadTimeSlots();
}

function selectTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    $('#selectedDate').val(tomorrowStr);
    currentDate = tomorrowStr;
    updateDateDisplay();
    loadTimeSlots();
}

function selectNextWeek() {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    $('#selectedDate').val(nextWeekStr);
    currentDate = nextWeekStr;
    updateDateDisplay();
    loadTimeSlots();
}

// Update date display
function updateDateDisplay() {
    const date = new Date(currentDate);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const persianDate = date.toLocaleDateString('fa-IR', options);
    $('#currentDateDisplay').text(persianDate);
}

// Time slot selection functions
function toggleTimeSlotSelection(slotElement) {
    const slotId = slotElement.data('slot-id');

    if (slotElement.hasClass('selected')) {
        slotElement.removeClass('selected');
        selectedTimeSlots = selectedTimeSlots.filter(id => id !== slotId);
    } else {
        slotElement.addClass('selected');
        selectedTimeSlots.push(slotId);
    }

    updateSelectionActions();
}

function updateSelectionActions() {
    const hasSelection = selectedTimeSlots.length > 0;
    $('.slots-actions button[onclick*="Selected"]').prop('disabled', !hasSelection);
}

// Modal functions
function openGenerateModal() {
    $('#generateModal').modal('show');
}

function addTimeSlot() {
    resetTimeSlotForm();
    $('#timeSlotModalTitle').html('<i class="fas fa-plus"></i> افزودن بازه زمانی');
    $('#timeSlotModal').modal('show');
}

function editTimeSlot(slotId) {
    const slotElement = $(`.time-slot[data-slot-id="${slotId}"]`);

    $('#timeSlotId').val(slotId);
    $('#startTime').val(slotElement.data('start-time'));
    $('#endTime').val(slotElement.data('end-time'));
    $('#slotType').val(slotElement.data('slot-type'));
    $('#isAvailable').prop('checked', slotElement.data('is-available'));

    if (slotElement.data('slot-type') === 'Blocked') {
        $('#blockReasonGroup').show();
        $('#blockReason').val(slotElement.find('.slot-reason').text());
    }

    $('#timeSlotModalTitle').html('<i class="fas fa-edit"></i> ویرایش بازه زمانی');
    $('#timeSlotModal').modal('show');
}

function resetTimeSlotForm() {
    $('#timeSlotForm')[0].reset();
    $('#timeSlotId').val('');
    $('#blockReasonGroup').hide();
    $('#isAvailable').prop('checked', true);
}

// Time slot management functions
function saveTimeSlot() {
    const formData = {
        id: $('#timeSlotId').val() || 0,
        startTime: $('#startTime').val(),
        endTime: $('#endTime').val(),
        slotType: $('#slotType').val(),
        isAvailable: $('#isAvailable').is(':checked'),
        blockReason: $('#blockReason').val(),
        date: currentDate
    };

    if (!validateTimeSlotForm(formData)) {
        return;
    }

    const url = formData.id > 0 ? '/Barber/UpdateTimeSlot' : '/Barber/AddTimeSlot';

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                $('#timeSlotModal').modal('hide');
                loadTimeSlots();
            } else {
                showError(response.message);
            }
        },
        error: function () {
            showError('خطا در ذخیره بازه زمانی');
        }
    });
}

function validateTimeSlotForm(formData) {
    if (!formData.startTime) {
        showError('ساعت شروع الزامی است');
        return false;
    }

    if (!formData.endTime) {
        showError('ساعت پایان الزامی است');
        return false;
    }

    if (formData.startTime >= formData.endTime) {
        showError('ساعت پایان باید بعد از ساعت شروع باشد');
        return false;
    }

    if (formData.slotType === 'Blocked' && !formData.blockReason) {
        showError('دلیل مسدودی الزامی است');
        return false;
    }

    return true;
}

function blockTimeSlot(slotId) {
    if (confirm('آیا از مسدود کردن این بازه زمانی اطمینان دارید؟')) {
        updateTimeSlotStatus(slotId, {
            isBlocked: true,
            isAvailable: false,
            slotType: 'Blocked'
        });
    }
}

function unblockTimeSlot(slotId) {
    updateTimeSlotStatus(slotId, {
        isBlocked: false,
        isAvailable: true,
        slotType: 'Available',
        blockReason: null
    });
}

function blockSelectedSlots() {
    if (selectedTimeSlots.length === 0) {
        showError('لطفاً ابتدا بازه‌های مورد نظر را انتخاب کنید');
        return;
    }

    const reason = prompt('دلیل مسدود کردن بازه‌های انتخاب شده:');
    if (reason === null) return;

    selectedTimeSlots.forEach(slotId => {
        updateTimeSlotStatus(slotId, {
            isBlocked: true,
            isAvailable: false,
            slotType: 'Blocked',
            blockReason: reason
        });
    });

    clearSelection();
}

function unblockSelectedSlots() {
    if (selectedTimeSlots.length === 0) {
        showError('لطفاً ابتدا بازه‌های مورد نظر را انتخاب کنید');
        return;
    }

    selectedTimeSlots.forEach(slotId => {
        updateTimeSlotStatus(slotId, {
            isBlocked: false,
            isAvailable: true,
            slotType: 'Available',
            blockReason: null
        });
    });

    clearSelection();
}

function updateTimeSlotStatus(slotId, statusData) {
    $.ajax({
        url: '/Barber/UpdateTimeSlotAvailability',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            timeSlotId: slotId,
            ...statusData
        }),
        success: function (response) {
            if (response.success) {
                loadTimeSlots();
            } else {
                showError(response.message);
            }
        },
        error: function () {
            showError('خطا در به‌روزرسانی وضعیت بازه زمانی');
        }
    });
}

function clearSelection() {
    selectedTimeSlots = [];
    $('.time-slot').removeClass('selected');
    updateSelectionActions();
}

// Generate time slots
function generateTimeSlots() {
    const formData = {
        startDate: $('#startDate').val(),
        endDate: $('#endDate').val(),
        slotDuration: parseInt($('#slotDuration').val()),
        breakDuration: parseInt($('#breakDuration').val())
    };

    if (!validateGenerateForm(formData)) {
        return;
    }

    $.ajax({
        url: '/Barber/GenerateTimeSlots',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                $('#generateModal').modal('hide');
                loadTimeSlots();
            } else {
                showError(response.message);
            }
        },
        error: function () {
            showError('خطا در تولید بازه‌های زمانی');
        }
    });
}

function validateGenerateForm(formData) {
    if (!formData.startDate) {
        showError('تاریخ شروع الزامی است');
        return false;
    }

    if (!formData.endDate) {
        showError('تاریخ پایان الزامی است');
        return false;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        showError('تاریخ پایان باید بعد از تاریخ شروع باشد');
        return false;
    }

    return true;
}

// Utility functions
function getAppointmentStatusClass(status) {
    switch (status) {
        case 'Confirmed': return 'status-confirmed';
        case 'Completed': return 'status-completed';
        case 'Cancelled': return 'status-cancelled';
        case 'NoShow': return 'status-noshow';
        default: return 'status-pending';
    }
}

function getAppointmentStatusText(status) {
    switch (status) {
        case 'Confirmed': return 'تأیید شده';
        case 'Completed': return 'انجام شده';
        case 'Cancelled': return 'لغو شده';
        case 'NoShow': return 'عدم حضور';
        default: return 'در انتظار';
    }
}

function showLoading(selector) {
    $(selector).html(`
        <div class="loading-state">
            <div class="spinner-border text-gold" role="status">
                <span class="visually-hidden">در حال بارگذاری...</span>
            </div>
            <p class="mt-2">در حال بارگذاری...</p>
        </div>
    `);
}

function hideLoading(selector) {
    // Loading will be replaced by content
}

function showSuccess(message) {
    toastr.success(message);
}

function showError(message) {
    toastr.error(message);
}

function showInfo(message) {
    toastr.info(message);
}