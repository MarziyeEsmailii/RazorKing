/**
 * سیستم رزرو نوبت کامل - نسخه ساده و کارآمد
 */

console.log('🚀 شروع سیستم رزرو');

// متغیرهای سراسری
let currentStep = 1;
let maxSteps = 7;
let selectedData = {
    city: null,
    barbershop: null,
    services: [],
    date: null,
    time: null,
    customer: null,
    pricing: null
};

// راه‌اندازی سیستم
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM بارگذاری شد');
    initializeBookingSystem();
});

function initializeBookingSystem() {
    console.log('🔧 راه‌اندازی سیستم رزرو...');
    
    // راه‌اندازی event listener ها
    setupEventListeners();
    
    // تست اولیه
    testSystem();
    
    console.log('✅ سیستم رزرو آماده است');
}

function setupEventListeners() {
    console.log('🔗 راه‌اندازی event listener ها...');
    
    // شهرها
    setupCityListeners();
    
    // دکمه‌های navigation
    setupNavigationListeners();
    
    // فرم‌ها
    setupFormListeners();
}

function setupCityListeners() {
    const cityOptions = document.querySelectorAll('.city-option');
    console.log(`🏙️ ${cityOptions.length} شهر یافت شد`);
    
    cityOptions.forEach((city, index) => {
        const cityName = city.querySelector('h5')?.textContent || `شهر ${index + 1}`;
        const cityId = parseInt(city.dataset.cityId);
        
        console.log(`🏙️ راه‌اندازی listener برای شهر: ${cityName} با ID: ${cityId}`);
        
        city.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`🖱️ کلیک روی شهر: ${cityName} با ID: ${cityId}`);
            selectCity(this, { id: cityId, name: cityName });
        });
        
        // اضافه کردن cursor pointer
        city.style.cursor = 'pointer';
    });
}

function setupNavigationListeners() {
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const finalSubmitBtn = document.getElementById('finalSubmitBtn');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('➡️ کلیک روی دکمه بعد');
            nextStep();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('⬅️ کلیک روی دکمه قبل');
            prevStep();
        });
    }
    
    if (finalSubmitBtn) {
        finalSubmitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('✅ کلیک روی دکمه تایید نهایی');
            handleFinalSubmit();
        });
    }
}

function setupFormListeners() {
    // فرم اطلاعات مشتری
    const customerForm = document.getElementById('customerForm');
    if (customerForm) {
        customerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCustomerForm();
        });
    }
    
    // فرم پرداخت
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handlePayment();
        });
    }
}

// مرحله 1: انتخاب شهر
function selectCity(cityElement, cityData) {
    console.log('🏙️ شروع انتخاب شهر:', cityData);
    
    if (!cityData || !cityData.id) {
        console.error('❌ اطلاعات شهر نامعتبر:', cityData);
        showMessage('خطا در انتخاب شهر', 'error');
        return;
    }
    
    try {
        console.log('🔄 حذف انتخاب‌های قبلی...');
        // حذف انتخاب قبلی
        document.querySelectorAll('.city-option').forEach(city => {
            city.classList.remove('selected');
        });
        
        console.log('✅ انتخاب شهر جدید...');
        // انتخاب شهر جدید
        cityElement.classList.add('selected');
        
        // ذخیره اطلاعات
        selectedData.city = cityData;
        
        console.log('✅ شهر انتخاب شد:', selectedData.city);
        
        // نمایش پیام موفقیت
        showMessage(`شهر ${cityData.name} انتخاب شد`, 'success');
        
        // فعال کردن دکمه بعد
        enableNextButton();
        
        console.log('🏪 شروع بارگذاری آرایشگاه‌ها...');
        // بارگذاری آرایشگاه‌ها
        loadBarbershops(cityData.id);
        
        // رفتن به مرحله بعد
        console.log('➡️ رفتن به مرحله بعد در 1.5 ثانیه...');
        setTimeout(() => {
            console.log('➡️ اجرای nextStep...');
            nextStep();
        }, 1500);
        
    } catch (error) {
        console.error('❌ خطا در انتخاب شهر:', error);
        showMessage('خطا در انتخاب شهر: ' + error.message, 'error');
    }
}

// مرحله 2: بارگذاری آرایشگاه‌ها
async function loadBarbershops(cityId) {
    console.log('🏪 بارگذاری آرایشگاه‌ها برای شهر:', cityId);
    
    if (!cityId) {
        console.error('❌ شناسه شهر نامعتبر:', cityId);
        showMessage('شناسه شهر نامعتبر', 'error');
        return;
    }
    
    const container = document.getElementById('barbershopsList');
    if (!container) {
        console.error('❌ کانتینر آرایشگاه‌ها یافت نشد');
        return;
    }
    
    // نمایش loading
    container.innerHTML = getLoadingHTML('در حال بارگذاری آرایشگاه‌ها...');
    
    try {
        const url = `/Booking/GetBarbershops?cityId=${cityId}`;
        console.log('📡 درخواست به:', url);
        
        const response = await fetch(url);
        console.log('📡 وضعیت پاسخ:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📡 پاسخ API آرایشگاه‌ها:', data);
        
        if (data.success && data.barbershops && data.barbershops.length > 0) {
            console.log('✅ رندر کردن آرایشگاه‌ها...');
            renderBarbershops(container, data.barbershops);
            showMessage(`${data.barbershops.length} آرایشگاه یافت شد`, 'success');
        } else {
            console.log('⚠️ آرایشگاهی یافت نشد');
            container.innerHTML = getEmptyStateHTML('آرایشگاهی در این شهر یافت نشد');
            showMessage('آرایشگاهی یافت نشد', 'warning');
        }
    } catch (error) {
        console.error('❌ خطا در بارگذاری آرایشگاه‌ها:', error);
        container.innerHTML = getErrorHTML('خطا در بارگذاری آرایشگاه‌ها: ' + error.message);
        showMessage('خطا در بارگذاری آرایشگاه‌ها', 'error');
    }
}

function renderBarbershops(container, barbershops) {
    container.innerHTML = '';
    
    barbershops.forEach(barbershop => {
        const card = document.createElement('div');
        card.className = 'barbershop-card';
        card.dataset.barbershopId = barbershop.id;
        card.innerHTML = `
            <div class="barbershop-info">
                <h5>${barbershop.name}</h5>
                <p class="address"><i class="fas fa-map-marker-alt"></i> ${barbershop.address}</p>
                <p class="phone"><i class="fas fa-phone"></i> ${barbershop.phone}</p>
                <p class="hours"><i class="fas fa-clock"></i> ${barbershop.workingHours || '9:00 - 18:00'}</p>
            </div>
        `;
        
        // اضافه کردن event listener
        card.addEventListener('click', function() {
            selectBarbershop(this, barbershop);
        });
        
        container.appendChild(card);
    });
    
    console.log(`✅ ${barbershops.length} آرایشگاه رندر شد`);
}

function selectBarbershop(barbershopElement, barbershopData) {
    console.log('🏪 انتخاب آرایشگاه:', barbershopData.name);
    
    // حذف انتخاب قبلی
    document.querySelectorAll('.barbershop-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // انتخاب آرایشگاه جدید
    barbershopElement.classList.add('selected');
    
    // ذخیره اطلاعات
    selectedData.barbershop = barbershopData;
    
    console.log('✅ آرایشگاه انتخاب شد:', barbershopData);
    
    // نمایش پیام موفقیت
    showMessage(`آرایشگاه ${barbershopData.name} انتخاب شد`, 'success');
    
    // فعال کردن دکمه بعد
    enableNextButton();
    
    // بارگذاری خدمات
    loadServices(barbershopData.id);
}

// مرحله 3: بارگذاری خدمات
async function loadServices(barbershopId) {
    console.log('🛠️ بارگذاری خدمات آرایشگاه:', barbershopId);
    
    const container = document.getElementById('servicesList');
    if (!container) {
        console.error('❌ کانتینر خدمات یافت نشد');
        return;
    }
    
    // نمایش loading
    container.innerHTML = getLoadingHTML('در حال بارگذاری خدمات...');
    
    try {
        const response = await fetch(`/Booking/GetServices?barbershopId=${barbershopId}`);
        const data = await response.json();
        
        console.log('📡 پاسخ API خدمات:', data);
        
        if (data.success && data.services && data.services.length > 0) {
            renderServices(container, data.services);
            showMessage(`${data.services.length} خدمت موجود است`, 'success');
        } else {
            container.innerHTML = getEmptyStateHTML('خدماتی برای این آرایشگاه یافت نشد');
            showMessage('خدماتی یافت نشد', 'warning');
        }
    } catch (error) {
        console.error('❌ خطا در بارگذاری خدمات:', error);
        container.innerHTML = getErrorHTML('خطا در بارگذاری خدمات');
        showMessage('خطا در بارگذاری خدمات', 'error');
    }
}

function renderServices(container, services) {
    container.innerHTML = '';
    
    services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.dataset.serviceId = service.id;
        card.innerHTML = `
            <div class="service-header">
                <h6>${service.name}</h6>
                <span class="price">${formatPrice(service.price)} تومان</span>
            </div>
            <div class="service-details">
                <p class="description">${service.description}</p>
                <div class="service-meta">
                    <span class="duration"><i class="fas fa-clock"></i> ${service.duration} دقیقه</span>
                </div>
            </div>
            <div class="service-actions">
                <input type="checkbox" class="service-checkbox" id="service_${service.id}">
                <label for="service_${service.id}">انتخاب</label>
            </div>
        `;
        
        // اضافه کردن event listener
        const checkbox = card.querySelector('.service-checkbox');
        checkbox.addEventListener('change', function() {
            toggleService(service, this.checked);
        });
        
        container.appendChild(card);
    });
    
    console.log(`✅ ${services.length} خدمت رندر شد`);
}

function toggleService(serviceData, isSelected) {
    console.log(`🛠️ ${isSelected ? 'انتخاب' : 'حذف'} خدمت:`, serviceData.name);
    
    if (isSelected) {
        // اضافه کردن خدمت
        if (!selectedData.services.find(s => s.id === serviceData.id)) {
            selectedData.services.push(serviceData);
        }
    } else {
        // حذف خدمت
        selectedData.services = selectedData.services.filter(s => s.id !== serviceData.id);
    }
    
    console.log('✅ خدمات انتخاب شده:', selectedData.services);
    
    // به‌روزرسانی UI
    updateSelectedServices();
    
    // فعال/غیرفعال کردن دکمه بعد
    if (selectedData.services.length > 0) {
        enableNextButton();
    } else {
        disableNextButton();
    }
}

function updateSelectedServices() {
    const selectedCount = selectedData.services.length;
    const totalPrice = selectedData.services.reduce((sum, service) => sum + service.price, 0);
    
    // نمایش خلاصه انتخاب‌ها
    const summary = document.getElementById('servicesSummary');
    if (summary) {
        summary.innerHTML = `
            <div class="selected-services-summary">
                <h6>خدمات انتخاب شده (${selectedCount})</h6>
                <div class="total-price">${formatPrice(totalPrice)} تومان</div>
            </div>
        `;
    }
}

// Navigation methods
function nextStep() {
    if (currentStep < maxSteps) {
        goToStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

function goToStep(stepNumber) {
    console.log(`🔄 رفتن به مرحله ${stepNumber}`);
    
    const currentStepEl = document.getElementById(`step${currentStep}`);
    const newStepEl = document.getElementById(`step${stepNumber}`);
    
    // مخفی کردن مرحله فعلی
    if (currentStepEl) {
        currentStepEl.classList.remove('active');
    }
    
    // نمایش مرحله جدید
    if (newStepEl) {
        newStepEl.classList.add('active');
    }
    
    // به‌روزرسانی step indicators
    updateStepIndicators(currentStep, stepNumber);
    
    // به‌روزرسانی navigation buttons
    updateNavigationButtons(stepNumber);
    
    // اجرای عملیات خاص هر مرحله
    handleStepActions(stepNumber);
    
    // به‌روزرسانی متغیر
    currentStep = stepNumber;
    
    console.log(`✅ رفت به مرحله ${stepNumber}`);
}

function updateStepIndicators(fromStep, toStep) {
    // به‌روزرسانی indicator مرحله قبلی
    const fromIndicator = document.querySelector(`.step[data-step="${fromStep}"]`);
    if (fromIndicator) {
        fromIndicator.classList.remove('active');
        if (toStep > fromStep) {
            fromIndicator.classList.add('completed');
        } else {
            fromIndicator.classList.remove('completed');
        }
    }
    
    // به‌روزرسانی indicator مرحله جدید
    const toIndicator = document.querySelector(`.step[data-step="${toStep}"]`);
    if (toIndicator) {
        toIndicator.classList.add('active');
    }
}

function updateNavigationButtons(stepNumber) {
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const finalSubmitBtn = document.getElementById('finalSubmitBtn');
    
    // دکمه قبل
    if (prevBtn) {
        prevBtn.style.display = stepNumber > 1 ? 'inline-flex' : 'none';
    }
    
    // دکمه بعد و تایید نهایی
    if (stepNumber === maxSteps) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (finalSubmitBtn) finalSubmitBtn.style.display = 'inline-flex';
    } else {
        if (nextBtn) nextBtn.style.display = 'inline-flex';
        if (finalSubmitBtn) finalSubmitBtn.style.display = 'none';
    }
}

function handleStepActions(stepNumber) {
    switch (stepNumber) {
        case 4:
            loadAvailableDates();
            break;
        case 5:
            if (selectedData.date) {
                loadAvailableTimes();
            }
            break;
        case 6:
            calculatePrice();
            break;
    }
}

// مرحله 5: بارگذاری ساعات خالی
async function loadAvailableTimes() {
    console.log('🕐 بارگذاری ساعات خالی...');
    
    const barbershopId = selectedData.barbershop?.id;
    const selectedDate = selectedData.date?.date;
    
    if (!barbershopId || !selectedDate) {
        console.error('❌ آرایشگاه یا تاریخ انتخاب نشده');
        return;
    }
    
    const container = document.getElementById('timesList');
    if (!container) {
        console.error('❌ کانتینر ساعات یافت نشد');
        return;
    }
    
    // نمایش loading
    container.innerHTML = getLoadingHTML('در حال بارگذاری ساعات خالی...');
    
    try {
        const response = await fetch(`/Booking/GetAvailableTimes?barbershopId=${barbershopId}&date=${selectedDate}`);
        const data = await response.json();
        
        console.log('📡 پاسخ API ساعات:', data);
        
        if (data.success && data.times && data.times.length > 0) {
            renderTimes(container, data.times);
            showMessage(`${data.times.length} ساعت خالی موجود است`, 'success');
        } else {
            container.innerHTML = getEmptyStateHTML('ساعت خالی یافت نشد');
            showMessage('ساعت خالی یافت نشد', 'warning');
        }
    } catch (error) {
        console.error('❌ خطا در بارگذاری ساعات:', error);
        container.innerHTML = getErrorHTML('خطا در بارگذاری ساعات');
        showMessage('خطا در بارگذاری ساعات', 'error');
    }
}

function renderTimes(container, times) {
    container.innerHTML = '';
    
    // گروه‌بندی بر اساس دوره روز
    const morningTimes = times.filter(t => t.period === 'صبح');
    const eveningTimes = times.filter(t => t.period === 'عصر');
    
    if (morningTimes.length > 0) {
        const morningSection = createTimeSection('صبح', morningTimes);
        container.appendChild(morningSection);
    }
    
    if (eveningTimes.length > 0) {
        const eveningSection = createTimeSection('عصر', eveningTimes);
        container.appendChild(eveningSection);
    }
    
    console.log(`✅ ${times.length} ساعت رندر شد`);
}

function createTimeSection(period, times) {
    const section = document.createElement('div');
    section.className = 'time-section';
    section.innerHTML = `
        <h6 class="time-period">${period}</h6>
        <div class="times-grid"></div>
    `;
    
    const grid = section.querySelector('.times-grid');
    
    times.forEach(timeInfo => {
        const timeCard = document.createElement('div');
        timeCard.className = 'time-card';
        timeCard.dataset.time = timeInfo.time;
        
        if (timeInfo.isPeak) {
            timeCard.classList.add('peak-time');
        }
        
        timeCard.innerHTML = `
            <div class="time-display">${timeInfo.display}</div>
            ${timeInfo.isPeak ? '<span class="peak-label">شلوغ</span>' : ''}
        `;
        
        // اضافه کردن event listener
        timeCard.addEventListener('click', function() {
            selectTime(this, timeInfo);
        });
        
        grid.appendChild(timeCard);
    });
    
    return section;
}

function selectTime(timeElement, timeData) {
    console.log('🕐 انتخاب ساعت:', timeData.display);
    
    // حذف انتخاب قبلی
    document.querySelectorAll('.time-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // انتخاب ساعت جدید
    timeElement.classList.add('selected');
    
    // ذخیره اطلاعات
    selectedData.time = timeData;
    
    console.log('✅ ساعت انتخاب شد:', timeData);
    
    // نمایش پیام موفقیت
    showMessage(`ساعت ${timeData.display} انتخاب شد`, 'success');
    
    // فعال کردن دکمه بعد
    enableNextButton();
}

// مرحله 4: بارگذاری تاریخ‌های خالی
async function loadAvailableDates() {
    console.log('📅 بارگذاری تاریخ‌های خالی...');
    
    const barbershopId = selectedData.barbershop?.id;
    if (!barbershopId) {
        console.error('❌ آرایشگاه انتخاب نشده');
        return;
    }
    
    const container = document.getElementById('datesList');
    if (!container) {
        console.error('❌ کانتینر تاریخ‌ها یافت نشد');
        return;
    }
    
    // نمایش loading
    container.innerHTML = getLoadingHTML('در حال بارگذاری تاریخ‌های خالی...');
    
    try {
        const response = await fetch(`/Booking/GetAvailableDates?barbershopId=${barbershopId}`);
        const data = await response.json();
        
        console.log('📡 پاسخ API تاریخ‌ها:', data);
        
        if (data.success && data.dates && data.dates.length > 0) {
            renderDates(container, data.dates);
            showMessage(`${data.dates.length} روز خالی موجود است`, 'success');
        } else {
            container.innerHTML = getEmptyStateHTML('روز خالی یافت نشد');
            showMessage('روز خالی یافت نشد', 'warning');
        }
    } catch (error) {
        console.error('❌ خطا در بارگذاری تاریخ‌ها:', error);
        container.innerHTML = getErrorHTML('خطا در بارگذاری تاریخ‌ها');
        showMessage('خطا در بارگذاری تاریخ‌ها', 'error');
    }
}

function renderDates(container, dates) {
    container.innerHTML = '';
    
    dates.forEach(dateInfo => {
        const card = document.createElement('div');
        card.className = 'date-card';
        card.dataset.date = dateInfo.date;
        
        card.innerHTML = `
            <div class="date-header">
                <div class="date-display">${dateInfo.display}</div>
                <div class="day-name">${dateInfo.dayName}</div>
            </div>
            <div class="date-info">
                <span class="available-slots">
                    <i class="fas fa-clock"></i>
                    ${dateInfo.availableSlots} نوبت خالی
                </span>
            </div>
        `;
        
        // اضافه کردن event listener
        card.addEventListener('click', function() {
            selectDate(this, dateInfo);
        });
        
        container.appendChild(card);
    });
    
    console.log(`✅ ${dates.length} تاریخ رندر شد`);
}

function selectDate(dateElement, dateData) {
    console.log('📅 انتخاب تاریخ:', dateData.display);
    
    // حذف انتخاب قبلی
    document.querySelectorAll('.date-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // انتخاب تاریخ جدید
    dateElement.classList.add('selected');
    
    // ذخیره اطلاعات
    selectedData.date = dateData;
    
    console.log('✅ تاریخ انتخاب شد:', dateData);
    
    // نمایش پیام موفقیت
    showMessage(`تاریخ ${dateData.display} انتخاب شد`, 'success');
    
    // فعال کردن دکمه بعد
    enableNextButton();
    
    // رفتن به مرحله بعد پس از انتخاب تاریخ
    setTimeout(() => {
        nextStep();
    }, 1500);
}

// محاسبه قیمت
async function calculatePrice() {
    console.log('💰 محاسبه قیمت نهایی...');
    
    const barbershopId = selectedData.barbershop?.id;
    const serviceIds = selectedData.services.map(s => s.id);
    
    if (!barbershopId || serviceIds.length === 0) {
        console.error('❌ اطلاعات ناکافی برای محاسبه قیمت');
        return;
    }
    
    try {
        const response = await fetch('/Booking/CalculatePrice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                barbershopId: barbershopId,
                serviceIds: serviceIds
            })
        });
        
        const data = await response.json();
        
        console.log('📡 پاسخ محاسبه قیمت:', data);
        
        if (data.success) {
            selectedData.pricing = data.pricing;
            renderPricingSummary(data);
            showMessage('قیمت محاسبه شد', 'success');
        } else {
            showMessage('خطا در محاسبه قیمت', 'error');
        }
    } catch (error) {
        console.error('❌ خطا در محاسبه قیمت:', error);
        showMessage('خطا در محاسبه قیمت', 'error');
    }
}

function renderPricingSummary(data) {
    const container = document.getElementById('pricingSummary');
    if (!container) return;
    
    container.innerHTML = `
        <div class="pricing-summary">
            <h6>خلاصه قیمت</h6>
            <div class="price-breakdown">
                <div class="price-item">
                    <span>قیمت خدمات:</span>
                    <span>${formatPrice(data.pricing.basePrice)} تومان</span>
                </div>
                <div class="price-item">
                    <span>مالیات (9%):</span>
                    <span>${formatPrice(data.pricing.tax)} تومان</span>
                </div>
                <div class="price-item total">
                    <span>مجموع:</span>
                    <span>${formatPrice(data.pricing.finalPrice)} تومان</span>
                </div>
                <div class="price-item deposit">
                    <span>پیش پرداخت (30%):</span>
                    <span>${formatPrice(data.pricing.depositAmount)} تومان</span>
                </div>
            </div>
        </div>
    `;
}

// مدیریت فرم مشتری
function handleCustomerForm() {
    const form = document.getElementById('customerForm');
    if (!form) return;
    
    const formData = new FormData(form);
    
    const customerData = {
        name: formData.get('customerName'),
        phone: formData.get('customerPhone'),
        notes: formData.get('notes') || ''
    };
    
    // اعتبارسنجی
    if (!customerData.name || !customerData.phone) {
        showMessage('لطفاً تمام فیلدهای ضروری را پر کنید', 'error');
        return;
    }
    
    // ذخیره اطلاعات
    selectedData.customer = customerData;
    
    console.log('✅ اطلاعات مشتری ذخیره شد:', customerData);
    
    // فعال کردن دکمه بعد
    enableNextButton();
    
    // رفتن به مرحله پرداخت
    nextStep();
}

// مدیریت تایید نهایی
async function handleFinalSubmit() {
    console.log('💳 شروع فرآیند تایید نهایی...');
    
    // اعتبارسنجی نهایی
    if (!validateBookingData()) {
        showMessage('اطلاعات ناکامل است', 'error');
        return;
    }
    
    // نمایش loading
    showMessage('در حال ثبت نوبت...', 'info');
    
    try {
        const appointmentData = {
            barbershopId: selectedData.barbershop.id,
            serviceIds: selectedData.services.map(s => s.id),
            date: selectedData.date.date,
            time: selectedData.time?.time || '10:00',
            customerName: selectedData.customer.name,
            customerPhone: selectedData.customer.phone,
            paidAmount: selectedData.pricing?.depositAmount || 0,
            notes: selectedData.customer.notes
        };
        
        const response = await fetch('/Booking/CreateAppointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointmentData)
        });
        
        const result = await response.json();
        
        console.log('📡 پاسخ ثبت نوبت:', result);
        
        if (result.success) {
            showBookingSuccess(result.appointment);
            showMessage('نوبت با موفقیت رزرو شد!', 'success');
            
            // هدایت به صفحه تایید
            setTimeout(() => {
                window.location.href = `/Booking/Confirmation/${result.appointmentId}`;
            }, 3000);
        } else {
            showMessage(result.message || 'خطا در ثبت نوبت', 'error');
        }
    } catch (error) {
        console.error('❌ خطا در ثبت نوبت:', error);
        showMessage('خطا در ثبت نوبت', 'error');
    }
}

function validateBookingData() {
    return selectedData.city && 
           selectedData.barbershop && 
           selectedData.services.length > 0 && 
           selectedData.date && 
           selectedData.customer;
}

function showBookingSuccess(appointmentData) {
    const container = document.getElementById('bookingResult');
    if (!container) return;
    
    container.innerHTML = `
        <div class="booking-success">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h4>نوبت شما با موفقیت رزرو شد!</h4>
            <div class="appointment-details">
                <p><strong>شماره نوبت:</strong> ${appointmentData?.id || 'در حال تولید...'}</p>
                <p><strong>آرایشگاه:</strong> ${selectedData.barbershop.name}</p>
                <p><strong>تاریخ:</strong> ${selectedData.date.display}</p>
            </div>
            <div class="next-steps">
                <p>در حال هدایت به صفحه تایید...</p>
            </div>
        </div>
    `;
}

// Utility functions
function enableNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.style.display = 'inline-flex';
        nextBtn.disabled = false;
    }
}

function disableNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.disabled = true;
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(price);
}

function getLoadingHTML(message) {
    return `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin fa-2x"></i>
            <p>${message}</p>
        </div>
    `;
}

function getEmptyStateHTML(message) {
    return `
        <div class="empty-state">
            <i class="fas fa-info-circle fa-2x"></i>
            <p>${message}</p>
        </div>
    `;
}

function getErrorHTML(message) {
    return `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle fa-2x"></i>
            <p>${message}</p>
        </div>
    `;
}

function showMessage(text, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${text}`);
    
    // حذف پیام‌های قبلی
    const existingMessages = document.querySelectorAll('.booking-message');
    existingMessages.forEach(msg => msg.remove());
    
    // ایجاد پیام جدید
    const message = document.createElement('div');
    message.className = 'booking-message';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        background: ${getMessageColor(type)};
        animation: slideIn 0.3s ease-out;
    `;
    message.textContent = text;
    
    document.body.appendChild(message);
    
    // حذف خودکار
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

function getMessageColor(type) {
    const colors = {
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    return colors[type] || colors.info;
}

function testSystem() {
    console.log('🧪 تست سیستم...');
    
    const elements = {
        cities: document.querySelectorAll('.city-option'),
        steps: document.querySelectorAll('[id^="step"]'),
        nextBtn: document.getElementById('nextBtn'),
        prevBtn: document.getElementById('prevBtn')
    };
    
    console.log('📊 عناصر یافت شده:', {
        citiesCount: elements.cities.length,
        stepsCount: elements.steps.length,
        hasNextBtn: !!elements.nextBtn,
        hasPrevBtn: !!elements.prevBtn
    });
    
    if (elements.cities.length === 0) {
        console.warn('⚠️ هیچ شهری یافت نشد');
    }
}

// اضافه کردن استایل‌های CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .loading-state, .empty-state, .error-state {
        text-align: center;
        padding: 40px 20px;
        color: #6b7280;
    }
    
    .loading-state i { color: #d4af37; }
    .empty-state i { color: #6b7280; }
    .error-state i { color: #ef4444; }
    
    .booking-success {
        text-align: center;
        padding: 40px;
        background: #f0f9ff;
        border-radius: 12px;
        border: 2px solid #22c55e;
    }
    
    .success-icon i {
        font-size: 4rem;
        color: #22c55e;
        margin-bottom: 20px;
    }
`;
document.head.appendChild(style);

console.log('✅ سیستم رزرو کامل آماده است');