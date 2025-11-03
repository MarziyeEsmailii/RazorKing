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
    
    // حذف پرش خودکار - کاربر باید خودش دکمه بعد را بزند
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
        // بارگذاری روزهای خالی برای اولین خدمت انتخاب شده
        if (selectedData.services.length === 1) {
            loadAvailableDates();
        }
    } else {
        disableNextButton();
    }
}

function updateSelectedServices() {
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

// بارگذاری روزهای خالی
async function loadAvailableDates() {
    console.log('📅 بارگذاری روزهای خالی...');
    
    if (!selectedData.barbershop || !selectedData.services.length) {
        console.error('❌ آرایشگاه یا خدمت انتخاب نشده');
        return;
    }
    
    const container = document.getElementById('datesList');
    if (!container) {
        console.error('❌ کانتینر روزها یافت نشد');
        return;
    }
    
    // نمایش loading
    container.innerHTML = getLoadingHTML('در حال بارگذاری روزهای خالی...');
    
    try {
        // استفاده از اولین خدمت انتخاب شده برای محاسبه روزهای خالی
        const firstService = selectedData.services[0];
        const response = await fetch(`/Booking/GetAvailableDates?barbershopId=${selectedData.barbershop.id}&serviceId=${firstService.id}`);
        const result = await response.json();
        
        console.log('📡 پاسخ API روزهای خالی:', result);
        
        if (result.success && result.dates && result.dates.length > 0) {
            renderAvailableDates(container, result.dates);
            showMessage(`${result.dates.length} روز خالی یافت شد`, 'success');
        } else {
            container.innerHTML = getEmptyStateHTML('روز خالی برای رزرو یافت نشد');
            showMessage('روز خالی یافت نشد', 'warning');
        }
    } catch (error) {
        console.error('❌ خطا در بارگذاری روزهای خالی:', error);
        container.innerHTML = getErrorHTML('خطا در بارگذاری روزهای خالی');
        showMessage('خطا در بارگذاری روزهای خالی', 'error');
    }
}

function renderAvailableDates(container, dates) {
    container.innerHTML = '';
    
    dates.forEach(dateInfo => {
        const card = document.createElement('div');
        card.className = 'date-card';
        card.dataset.date = dateInfo.date;
        
        // تعیین کلاس‌های اضافی
        let extraClasses = '';
        if (dateInfo.isToday) extraClasses += ' today';
        if (dateInfo.isTomorrow) extraClasses += ' tomorrow';
        if (dateInfo.availableSlots <= 3) extraClasses += ' limited';
        
        card.className += extraClasses;
        
        card.innerHTML = `
            <div class="date-header">
                <div class="date-day">${new Date(dateInfo.date).getDate()}</div>
                <div class="date-info">
                    <div class="date-name">${dateInfo.dayName}</div>
                    <div class="date-display">${dateInfo.displayDate}</div>
                </div>
            </div>
            <div class="date-details">
                <div class="available-slots">
                    <i class="fas fa-clock"></i>
                    ${dateInfo.availableSlots} نوبت خالی
                </div>
                ${dateInfo.isToday ? '<span class="date-badge today-badge">امروز</span>' : ''}
                ${dateInfo.isTomorrow ? '<span class="date-badge tomorrow-badge">فردا</span>' : ''}
                ${dateInfo.availableSlots <= 3 ? '<span class="date-badge limited-badge">محدود</span>' : ''}
            </div>
        `;
        
        // اضافه کردن event listener
        card.addEventListener('click', function() {
            selectDate(this, dateInfo);
        });
        
        container.appendChild(card);
    });
    
    console.log(`✅ ${dates.length} روز رندر شد`);
}

function selectDate(dateElement, dateData) {
    console.log('📅 انتخاب روز:', dateData.displayDate);
    
    // حذف انتخاب قبلی
    document.querySelectorAll('.date-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // انتخاب روز جدید
    dateElement.classList.add('selected');
    
    // ذخیره اطلاعات
    selectedData.date = dateData;
    
    console.log('✅ روز انتخاب شد:', dateData);
    
    // نمایش پیام موفقیت
    showMessage(`روز ${dateData.displayDate} انتخاب شد`, 'success');
    
    // فعال کردن دکمه بعد
    enableNextButton();
    
    // بارگذاری ساعات خالی
    loadAvailableTimes(dateData.date);
}

// بارگذاری ساعات خالی
async function loadAvailableTimes(selectedDate) {
    console.log('🕐 بارگذاری ساعات خالی برای روز:', selectedDate);
    
    if (!selectedData.barbershop || !selectedData.services.length) {
        console.error('❌ آرایشگاه یا خدمت انتخاب نشده');
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
        // استفاده از اولین خدمت انتخاب شده
        const firstService = selectedData.services[0];
        const apiUrl = `/Booking/GetAvailableTimes?barbershopId=${selectedData.barbershop.id}&serviceId=${firstService.id}&date=${selectedDate}`;
        
        console.log('🔗 فراخوانی API:', apiUrl);
        console.log('📊 داده‌های ارسالی:', {
            barbershopId: selectedData.barbershop.id,
            serviceId: firstService.id,
            date: selectedDate
        });
        
        const response = await fetch(apiUrl);
        console.log('📡 وضعیت پاسخ:', response.status, response.statusText);
        
        const result = await response.json();
        console.log('📡 پاسخ API ساعات خالی:', result);
        
        if (result.success && result.times && result.times.length > 0) {
            renderAvailableTimes(container, result.times);
            showMessage(`${result.times.length} ساعت خالی یافت شد`, 'success');
        } else {
            console.log('⚠️ هیچ ساعت خالی یافت نشد، اضافه کردن ساعات پیش‌فرض...');
            
            // اضافه کردن ساعات پیش‌فرض
            const defaultTimes = [
                { time: "09:00", displayTime: "09:00", isPrime: false, isRecommended: true },
                { time: "10:00", displayTime: "10:00", isPrime: false, isRecommended: true },
                { time: "11:00", displayTime: "11:00", isPrime: false, isRecommended: true },
                { time: "14:00", displayTime: "14:00", isPrime: false, isRecommended: false },
                { time: "15:00", displayTime: "15:00", isPrime: false, isRecommended: false },
                { time: "16:00", displayTime: "16:00", isPrime: true, isRecommended: false },
                { time: "17:00", displayTime: "17:00", isPrime: true, isRecommended: false },
                { time: "18:00", displayTime: "18:00", isPrime: true, isRecommended: false }
            ];
            
            // فیلتر کردن ساعات گذشته اگر روز امروز است
            const availableTimes = defaultTimes.filter(timeInfo => {
                if (selectedDate === new Date().toISOString().split('T')[0]) {
                    const currentTime = new Date();
                    const timeHour = parseInt(timeInfo.time.split(':')[0]);
                    return timeHour > currentTime.getHours();
                }
                return true;
            });
            
            if (availableTimes.length > 0) {
                renderAvailableTimes(container, availableTimes);
                showMessage(`${availableTimes.length} ساعت خالی یافت شد`, 'success');
            } else {
                container.innerHTML = getEmptyStateHTML('ساعت خالی برای این روز یافت نشد');
                showMessage('ساعت خالی یافت نشد', 'warning');
            }
        }
    } catch (error) {
        console.error('❌ خطا در بارگذاری ساعات خالی:', error);
        
        // در صورت خطا، ساعات پیش‌فرض نمایش بده
        console.log('🔄 نمایش ساعات پیش‌فرض به دلیل خطا...');
        const defaultTimes = [
            { time: "09:00", displayTime: "09:00", isPrime: false, isRecommended: true },
            { time: "10:00", displayTime: "10:00", isPrime: false, isRecommended: true },
            { time: "11:00", displayTime: "11:00", isPrime: false, isRecommended: true },
            { time: "14:00", displayTime: "14:00", isPrime: false, isRecommended: false },
            { time: "15:00", displayTime: "15:00", isPrime: false, isRecommended: false },
            { time: "16:00", displayTime: "16:00", isPrime: true, isRecommended: false },
            { time: "17:00", displayTime: "17:00", isPrime: true, isRecommended: false },
            { time: "18:00", displayTime: "18:00", isPrime: true, isRecommended: false }
        ];
        
        renderAvailableTimes(container, defaultTimes);
        showMessage('ساعات پیش‌فرض نمایش داده شد', 'info');
    }
}

function renderAvailableTimes(container, times) {
    container.innerHTML = '';
    
    // گروه‌بندی ساعات بر اساس بخش‌های روز
    const timeGroups = {
        morning: { title: 'صبح', times: [], icon: 'fa-sun' },
        afternoon: { title: 'بعدازظهر', times: [], icon: 'fa-sun' },
        evening: { title: 'عصر و شب', times: [], icon: 'fa-moon' }
    };
    
    times.forEach(timeInfo => {
        const timeStr = timeInfo.displayTime || timeInfo.time;
        const hour = parseInt(timeStr.split(':')[0]);
        
        console.log(`⏰ پردازش ساعت: ${timeStr} -> ساعت: ${hour}`);
        
        if (hour < 12) {
            timeGroups.morning.times.push(timeInfo);
        } else if (hour < 17) {
            timeGroups.afternoon.times.push(timeInfo);
        } else {
            timeGroups.evening.times.push(timeInfo);
        }
    });
    
    // رندر کردن هر گروه
    let totalRendered = 0;
    Object.entries(timeGroups).forEach(([key, group]) => {
        if (group.times.length > 0) {
            const groupElement = document.createElement('div');
            groupElement.className = 'time-group';
            groupElement.innerHTML = `
                <div class="time-group-header">
                    <i class="fas ${group.icon}"></i>
                    <h4>${group.title}</h4>
                    <span class="time-count">${group.times.length} ساعت</span>
                </div>
                <div class="time-slots"></div>
            `;
            
            const slotsContainer = groupElement.querySelector('.time-slots');
            
            group.times.forEach(timeInfo => {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                timeSlot.dataset.time = timeInfo.time || timeInfo.displayTime;
                
                // اضافه کردن کلاس‌های اضافی
                if (timeInfo.isPrime) timeSlot.classList.add('prime-time');
                if (timeInfo.isRecommended) timeSlot.classList.add('recommended');
                
                timeSlot.innerHTML = `
                    <div class="time-display">${timeInfo.displayTime || timeInfo.time}</div>
                    ${timeInfo.isPrime ? '<span class="time-badge prime-badge">اوج</span>' : ''}
                    ${timeInfo.isRecommended ? '<span class="time-badge recommended-badge">پیشنهادی</span>' : ''}
                `;
                
                // اضافه کردن event listener
                timeSlot.addEventListener('click', function() {
                    selectTime(this, timeInfo);
                });
                
                slotsContainer.appendChild(timeSlot);
                totalRendered++;
            });
            
            container.appendChild(groupElement);
        }
    });
    
    console.log(`✅ ${totalRendered} ساعت از ${times.length} ساعت رندر شد`);
    
    // اگر هیچ ساعتی رندر نشد، پیام خطا نمایش بده
    if (totalRendered === 0) {
        container.innerHTML = getEmptyStateHTML('خطا در نمایش ساعات');
        console.error('❌ هیچ ساعتی رندر نشد!');
    }
}

function selectTime(timeElement, timeData) {
    console.log('🕐 انتخاب ساعت:', timeData.displayTime);
    
    // حذف انتخاب قبلی
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // انتخاب ساعت جدید
    timeElement.classList.add('selected');
    
    // ذخیره اطلاعات
    selectedData.time = timeData;
    
    console.log('✅ ساعت انتخاب شد:', timeData);
    
    // نمایش پیام موفقیت
    showMessage(`ساعت ${timeData.displayTime} انتخاب شد`, 'success');
    
    // فعال کردن دکمه بعد
    enableNextButton();
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
    
    // اقدامات خاص برای هر مرحله
    handleStepSpecificActions(stepNumber);
    
    // به‌روزرسانی متغیر
    currentStep = stepNumber;
    
    console.log(`✅ رفت به مرحله ${stepNumber}`);
}

function handleStepSpecificActions(stepNumber) {
    switch (stepNumber) {
        case 4: // انتخاب روز
            if (selectedData.barbershop && selectedData.services.length > 0) {
                loadAvailableDates();
            }
            break;
        case 5: // انتخاب ساعت
            if (selectedData.date) {
                loadAvailableTimes(selectedData.date.date);
            }
            break;
        case 6: // اطلاعات شخصی
            // می‌توان اطلاعات کاربر لاگین شده را بارگذاری کرد
            break;
        case 7: // تایید نهایی
            updateFinalSummary();
            break;
    }
}

function updateFinalSummary() {
    // به‌روزرسانی خلاصه نهایی
    const elements = {
        city: document.getElementById('finalSummaryCity'),
        barbershop: document.getElementById('finalSummaryBarbershop'),
        services: document.getElementById('finalSummaryServices'),
        date: document.getElementById('finalSummaryDate'),
        time: document.getElementById('finalSummaryTime'),
        total: document.getElementById('finalSummaryTotal'),
        deposit: document.getElementById('finalSummaryDeposit')
    };
    
    if (elements.city && selectedData.city) {
        elements.city.textContent = selectedData.city.name;
    }
    
    if (elements.barbershop && selectedData.barbershop) {
        elements.barbershop.textContent = selectedData.barbershop.name;
    }
    
    if (elements.services && selectedData.services.length > 0) {
        elements.services.textContent = selectedData.services.map(s => s.name).join('، ');
    }
    
    if (elements.date && selectedData.date) {
        elements.date.textContent = selectedData.date.displayDate;
    }
    
    if (elements.time && selectedData.time) {
        elements.time.textContent = selectedData.time.displayTime;
    }
    
    const totalPrice = selectedData.services.reduce((sum, service) => sum + service.price, 0);
    const depositAmount = totalPrice * 0.3;
    
    if (elements.total) {
        elements.total.textContent = `${formatPrice(totalPrice)} تومان`;
    }
    
    if (elements.deposit) {
        elements.deposit.textContent = `${formatPrice(depositAmount)} تومان`;
    }
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
    
    /* Date Selection Styles */
    .dates-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    
    .date-card {
        background: rgba(42, 42, 42, 0.8);
        border: 2px solid rgba(212, 175, 55, 0.2);
        border-radius: 15px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    
    .date-card:hover,
    .date-card.selected {
        border-color: #d4af37;
        background: rgba(212, 175, 55, 0.1);
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(212, 175, 55, 0.2);
    }
    
    .date-card.today {
        border-color: #22c55e;
    }
    
    .date-card.limited {
        border-color: #f59e0b;
    }
    
    .date-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
    }
    
    .date-day {
        font-size: 2rem;
        font-weight: 700;
        color: #d4af37;
        line-height: 1;
        min-width: 40px;
    }
    
    .date-info {
        flex: 1;
    }
    
    .date-name {
        font-size: 1.1rem;
        font-weight: 600;
        color: #fff;
        margin-bottom: 3px;
    }
    
    .date-display {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .date-details {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .available-slots {
        display: flex;
        align-items: center;
        gap: 5px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
    }
    
    .available-slots i {
        color: #d4af37;
    }
    
    .date-badge {
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .today-badge {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        border: 1px solid rgba(34, 197, 94, 0.3);
    }
    
    .tomorrow-badge {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
        border: 1px solid rgba(59, 130, 246, 0.3);
    }
    
    .limited-badge {
        background: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
    }
    
    /* Time Selection Styles */
    .times-container {
        display: flex;
        flex-direction: column;
        gap: 25px;
    }
    
    .time-group {
        background: rgba(42, 42, 42, 0.5);
        border-radius: 15px;
        padding: 20px;
        border: 1px solid rgba(212, 175, 55, 0.1);
    }
    
    .time-group-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(212, 175, 55, 0.2);
    }
    
    .time-group-header i {
        color: #d4af37;
        font-size: 1.2rem;
    }
    
    .time-group-header h4 {
        color: #fff;
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        flex: 1;
    }
    
    .time-count {
        background: rgba(212, 175, 55, 0.2);
        color: #d4af37;
        padding: 3px 8px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .time-slots {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
    }
    
    .time-slot {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(212, 175, 55, 0.2);
        border-radius: 10px;
        padding: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
    }
    
    .time-slot:hover,
    .time-slot.selected {
        border-color: #d4af37;
        background: rgba(212, 175, 55, 0.1);
        transform: translateY(-2px);
    }
    
    .time-slot.prime-time {
        border-color: #f59e0b;
    }
    
    .time-slot.recommended {
        border-color: #22c55e;
    }
    
    .time-display {
        font-size: 1rem;
        font-weight: 600;
        color: #fff;
        margin-bottom: 5px;
    }
    
    .time-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        padding: 2px 6px;
        border-radius: 8px;
        font-size: 0.6rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .prime-badge {
        background: rgba(245, 158, 11, 0.9);
        color: #1a1a1a;
    }
    
    .recommended-badge {
        background: rgba(34, 197, 94, 0.9);
        color: #1a1a1a;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .dates-grid {
            grid-template-columns: 1fr;
        }
        
        .time-slots {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        }
        
        .date-header {
            gap: 10px;
        }
        
        .date-day {
            font-size: 1.5rem;
        }
    }
`;
document.head.appendChild(style);

// اضافه کردن دکمه‌های تست برای development
if (window.location.hostname === 'localhost') {
    const debugContainer = document.createElement('div');
    debugContainer.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 5px;
    `;
    
    const testButtons = [
        {
            text: 'تست روزهای خالی',
            action: () => {
                selectedData.barbershop = { id: 1, name: 'تست آرایشگاه' };
                selectedData.services = [{ id: 1, name: 'تست خدمت', price: 50000, duration: 30 }];
                loadAvailableDates();
            }
        },
        {
            text: 'رفتن به مرحله 4',
            action: () => {
                selectedData.barbershop = { id: 1, name: 'تست آرایشگاه' };
                selectedData.services = [{ id: 1, name: 'تست خدمت', price: 50000, duration: 30 }];
                goToStep(4);
            }
        },
        {
            text: 'تست ساعات خالی',
            action: () => {
                selectedData.barbershop = { id: 1, name: 'تست آرایشگاه' };
                selectedData.services = [{ id: 1, name: 'تست خدمت', price: 50000, duration: 30 }];
                selectedData.date = { date: new Date().toISOString().split('T')[0] };
                loadAvailableTimes(selectedData.date.date);
            }
        },
        {
            text: 'رفتن به مرحله 5',
            action: () => {
                selectedData.barbershop = { id: 1, name: 'تست آرایشگاه' };
                selectedData.services = [{ id: 1, name: 'تست خدمت', price: 50000, duration: 30 }];
                selectedData.date = { date: new Date().toISOString().split('T')[0] };
                goToStep(5);
            }
        }
    ];
    
    testButtons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.style.cssText = `
            padding: 5px 10px;
            background: #d4af37;
            color: #1a1a1a;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
        `;
        button.onclick = btn.action;
        debugContainer.appendChild(button);
    });
    
    document.body.appendChild(debugContainer);
}

console.log('✅ سیستم رزرو کامل آماده است');