// سیستم رزرو - فقط JavaScript درست شده
console.log('🚀 سیستم رزرو بارگذاری شد');

let currentStep = 1;
let selectedData = {
    city: null,
    barbershop: null,
    services: [],
    date: null,
    time: null,
    customer: null
};

// شروع سیستم
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM آماده شد');
    
    // تست فوری شهرها
    const cityOptions = document.querySelectorAll('.city-option');
    console.log(`🧪 تعداد شهرهای یافت شده در DOM: ${cityOptions.length}`);
    
    cityOptions.forEach((city, index) => {
        const cityId = city.dataset.cityId;
        const cityName = city.querySelector('h5')?.textContent;
        console.log(`🏙️ شهر ${index + 1}: ${cityName} (ID: ${cityId})`);
    });
    
    if (cityOptions.length === 0) {
        console.error('❌ هیچ شهری در DOM یافت نشد!');
        
        // اضافه کردن پیام خطا به صفحه
        const citiesGrid = document.querySelector('.cities-grid');
        if (citiesGrid) {
            citiesGrid.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h4>هیچ شهری یافت نشد!</h4>
                    <p>لطفاً صفحه را refresh کنید</p>
                    <button onclick="location.reload()" class="btn btn-warning">تازه‌سازی صفحه</button>
                </div>
            `;
        }
    }
    
    initBooking();
});

function initBooking() {
    console.log('� راه ‌اندازی سیستم رزرو');
    
    // راه‌اندازی انتخاب شهر
    setupCitySelection();
    
    // راه‌اندازی navigation
    setupNavigation();
    
    console.log('✅ سیستم آماده است');
}

// انتخاب شهر
function setupCitySelection() {
    const cityOptions = document.querySelectorAll('.city-option');
    console.log(`🏙️ ${cityOptions.length} شهر یافت شد`);
    
    if (cityOptions.length === 0) {
        console.error('❌ هیچ شهری برای راه‌اندازی یافت نشد!');
        return;
    }
    
    // اضافه کردن event listener کلی برای تست
    document.addEventListener('click', function(e) {
        const cityOption = e.target.closest('.city-option');
        if (cityOption) {
            console.log('🖱️ کلیک کلی روی شهر شناسایی شد!', cityOption);
        }
    });
    
    cityOptions.forEach((city, index) => {
        const cityName = city.querySelector('h5')?.textContent || `شهر ${index + 1}`;
        const cityId = parseInt(city.dataset.cityId);
        
        console.log(`🔧 راه‌اندازی شهر ${index + 1}: ${cityName} (ID: ${cityId})`);
        
        // اضافه کردن استایل‌های بصری
        city.style.cursor = 'pointer';
        city.style.transition = 'all 0.3s ease';
        
        // اضافه کردن event listener
        city.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`🖱️ کلیک مستقیم روی شهر: ${cityName} (ID: ${cityId})`);
            selectCity(this, { id: cityId, name: cityName });
        });
        
        // اضافه کردن hover effect
        city.addEventListener('mouseenter', function() {
            console.log(`🖱️ Mouse enter روی شهر: ${cityName}`);
            this.style.transform = 'scale(1.05)';
        });
        
        city.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'scale(1)';
            }
        });
        
        // تست کلیک با دابل کلیک
        city.addEventListener('dblclick', function(e) {
            e.preventDefault();
            console.log(`🖱️ دابل کلیک روی شهر: ${cityName} (ID: ${cityId})`);
            selectCity(this, { id: cityId, name: cityName });
        });
    });
    
    // اضافه کردن دکمه تست
    const testButton = document.createElement('button');
    testButton.textContent = 'تست انتخاب شهر اول';
    testButton.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 9999;
        padding: 10px 15px;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
    `;
    testButton.onclick = function() {
        console.log('🧪 تست دستی کلیک شد');
        if (cityOptions.length > 0) {
            const firstCity = cityOptions[0];
            const cityName = firstCity.querySelector('h5')?.textContent;
            const cityId = parseInt(firstCity.dataset.cityId);
            console.log(`🧪 تست انتخاب شهر اول: ${cityName} (ID: ${cityId})`);
            selectCity(firstCity, { id: cityId, name: cityName });
        }
    };
    document.body.appendChild(testButton);
}

function selectCity(cityElement, cityData) {
    console.log('🏙️ انتخاب شهر:', cityData);
    
    // حذف انتخاب قبلی
    document.querySelectorAll('.city-option').forEach(city => {
        city.classList.remove('selected');
    });
    
    // انتخاب شهر جدید
    cityElement.classList.add('selected');
    
    // ذخیره اطلاعات
    selectedData.city = cityData;
    
    console.log('✅ شهر انتخاب شد:', selectedData.city);
    
    // نمایش پیام موفقیت
    showMessage(`شهر ${cityData.name} انتخاب شد`, 'success');
    
    // فعال کردن دکمه بعد
    enableNextButton();
    
    // بارگذاری آرایشگاه‌ها
    loadBarbershops(cityData.id);
    
    // رفتن به مرحله بعد
    setTimeout(() => {
        nextStep();
    }, 1500);
}

// بارگذاری آرایشگاه‌ها
async function loadBarbershops(cityId) {
    console.log('🏪 بارگذاری آرایشگاه‌ها برای شهر:', cityId);
    
    const container = document.getElementById('barbershopsList');
    if (!container) {
        console.error('❌ کانتینر آرایشگاه‌ها یافت نشد');
        return;
    }
    
    // نمایش loading
    container.innerHTML = getLoadingHTML('در حال بارگذاری آرایشگاه‌ها...');
    
    try {
        const response = await fetch(`/Booking/GetBarbershops?cityId=${cityId}`);
        const data = await response.json();
        
        console.log('📡 پاسخ API آرایشگاه‌ها:', data);
        
        if (data && data.length > 0) {
            renderBarbershops(container, data);
            showMessage(`${data.length} آرایشگاه یافت شد`, 'success');
        } else {
            container.innerHTML = getEmptyStateHTML('آرایشگاهی در این شهر یافت نشد');
            showMessage('آرایشگاهی یافت نشد', 'warning');
        }
    } catch (error) {
        console.error('❌ خطا در بارگذاری آرایشگاه‌ها:', error);
        container.innerHTML = getErrorHTML('خطا در بارگذاری آرایشگاه‌ها');
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

// بارگذاری خدمات
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
        
        if (data && data.length > 0) {
            renderServices(container, data);
            showMessage(`${data.length} خدمت موجود است`, 'success');
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
    const depositAmount = totalPrice * 0.3;
    
    // به‌روزرسانی نمایش قیمت
    const totalPriceEl = document.getElementById('totalPrice');
    const depositAmountEl = document.getElementById('depositAmount');
    
    if (totalPriceEl) {
        totalPriceEl.textContent = `${formatPrice(totalPrice)} تومان`;
    }
    
    if (depositAmountEl) {
        depositAmountEl.textContent = `${formatPrice(depositAmount)} تومان`;
    }
}

// Navigation methods
function setupNavigation() {
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

function nextStep() {
    if (currentStep < 7) {
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
    if (stepNumber === 7) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (finalSubmitBtn) finalSubmitBtn.style.display = 'inline-flex';
    } else {
        if (nextBtn) nextBtn.style.display = 'inline-flex';
        if (finalSubmitBtn) finalSubmitBtn.style.display = 'none';
    }
}

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

function handleFinalSubmit() {
    console.log('💳 شروع فرآیند تایید نهایی...');
    showMessage('در حال ثبت نوبت...', 'info');
    
    // شبیه‌سازی ثبت نوبت
    setTimeout(() => {
        showMessage('نوبت با موفقیت ثبت شد!', 'success');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    }, 2000);
}

// Utility functions
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
`;
document.head.appendChild(style);

console.log('✅ سیستم رزرو کامل آماده است');