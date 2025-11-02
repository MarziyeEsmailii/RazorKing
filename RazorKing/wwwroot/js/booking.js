/**
 * سیستم رزرو نوبت - ساده و کارآمد
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 سیستم رزرو نوبت شروع شد');
    
    // متغیرهای اصلی
    let currentStep = 1;
    let selectedData = {
        cityId: null,
        cityName: '',
        barbershopId: null,
        barbershopName: '',
        services: [],
        date: '',
        time: '',
        totalPrice: 0
    };

    // شروع سیستم
    initializeBookingSystem();
    
    // تست اولیه - چک کردن وجود شهرها
    setTimeout(() => {
        const cityOptions = document.querySelectorAll('.city-option');
        console.log('🏙️ تعداد شهرهای یافت شده:', cityOptions.length);
        
        if (cityOptions.length === 0) {
            console.error('❌ هیچ شهری یافت نشد! مشکل در بارگذاری داده‌ها');
        } else {
            cityOptions.forEach((city, index) => {
                console.log(`شهر ${index + 1}:`, city.querySelector('h5')?.textContent, 'ID:', city.dataset.cityId);
            });
        }
    }, 1000);

    function initializeBookingSystem() {
        console.log('🔧 راه‌اندازی سیستم...');
        
        // تست اولیه
        testSystemReadiness();
        
        // اضافه کردن event listener ها
        addEventListeners();
        
        // به‌روزرسانی navigation
        updateNavigation();
        
        console.log('✅ سیستم آماده است');
    }
    
    function testSystemReadiness() {
        console.log('🧪 تست آمادگی سیستم...');
        
        // تست وجود عناصر اصلی
        const elements = {
            bookingForm: document.getElementById('bookingForm'),
            step1: document.getElementById('step1'),
            cityOptions: document.querySelectorAll('.city-option'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            submitBtn: document.getElementById('submitBtn')
        };
        
        console.log('📋 عناصر یافت شده:', {
            bookingForm: !!elements.bookingForm,
            step1: !!elements.step1,
            cityOptionsCount: elements.cityOptions.length,
            prevBtn: !!elements.prevBtn,
            nextBtn: !!elements.nextBtn,
            submitBtn: !!elements.submitBtn
        });
        
        // تست شهرها
        if (elements.cityOptions.length > 0) {
            console.log('✅ شهرها بارگذاری شده‌اند:');
            elements.cityOptions.forEach((city, index) => {
                const cityName = city.querySelector('h5')?.textContent;
                const cityId = city.dataset.cityId;
                console.log(`  ${index + 1}. ${cityName} (ID: ${cityId})`);
            });
        } else {
            console.error('❌ هیچ شهری یافت نشد!');
        }
        
        return elements.cityOptions.length > 0;
    }

    function addEventListeners() {
        // صبر کردن تا DOM کاملاً آماده بشه
        setTimeout(() => {
            console.log('🔗 اضافه کردن event listener ها...');
            
            // انتخاب شهر
            const cityOptions = document.querySelectorAll('.city-option');
            console.log('🏙️ پیدا شدن', cityOptions.length, 'شهر');
            
            cityOptions.forEach((cityOption, index) => {
                console.log(`🔗 اضافه کردن listener به شهر ${index + 1}:`, cityOption.querySelector('h5')?.textContent);
                
                cityOption.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('🖱️ کلیک روی شهر:', this.querySelector('h5')?.textContent);
                    selectCity(this);
                });
                
                // اضافه کردن hover effect
                cityOption.addEventListener('mouseenter', function() {
                    console.log('🖱️ Mouse enter:', this.querySelector('h5')?.textContent);
                });
            });

            // دکمه‌های navigation
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const submitBtn = document.getElementById('submitBtn');
            const bookingForm = document.getElementById('bookingForm');

            console.log('🧭 دکمه‌های navigation:', {
                prevBtn: !!prevBtn,
                nextBtn: !!nextBtn,
                submitBtn: !!submitBtn,
                bookingForm: !!bookingForm
            });

            if (prevBtn) {
                prevBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    prevStep();
                });
                console.log('✅ Previous button listener اضافه شد');
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    nextStep();
                });
                console.log('✅ Next button listener اضافه شد');
            }

            if (bookingForm) {
                bookingForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    handleSubmit(e);
                });
                console.log('✅ Form submit listener اضافه شد');
            }
            
            console.log('✅ همه event listener ها اضافه شدند');
            
        }, 500); // نیم ثانیه صبر
    }

    // انتخاب شهر
    function selectCity(cityElement) {
        console.log('🏙️ تابع selectCity فراخوانی شد');
        console.log('🏙️ Element:', cityElement);
        console.log('🏙️ Dataset:', cityElement.dataset);
        
        try {
            // حذف انتخاب قبلی
            document.querySelectorAll('.city-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // انتخاب شهر جدید
            cityElement.classList.add('selected');
            console.log('✅ کلاس selected اضافه شد');
            
            // ذخیره اطلاعات
            selectedData.cityId = cityElement.dataset.cityId;
            const cityNameElement = cityElement.querySelector('h5');
            selectedData.cityName = cityNameElement ? cityNameElement.textContent.trim() : 'نامشخص';
            
            console.log('✅ اطلاعات شهر ذخیره شد:', {
                cityId: selectedData.cityId,
                cityName: selectedData.cityName
            });
            
            // نمایش پیام موفقیت
            showSuccessMessage(`شهر ${selectedData.cityName} انتخاب شد`);
            
            // به‌روزرسانی navigation
            updateNavigation();
            
            // بارگذاری آرایشگاه‌ها
            console.log('🏪 شروع بارگذاری آرایشگاه‌ها...');
            loadBarbershops(selectedData.cityId);
            
            // رفتن به مرحله بعد
            setTimeout(() => {
                console.log('🚀 رفتن به مرحله بعد...');
                nextStep();
            }, 1500);
            
        } catch (error) {
            console.error('❌ خطا در انتخاب شهر:', error);
        }
    }
    
    // نمایش پیام موفقیت
    function showSuccessMessage(message) {
        console.log('✅', message);
        
        // حذف پیام‌های قبلی
        const existingMessages = document.querySelectorAll('.success-message');
        existingMessages.forEach(msg => msg.remove());
        
        // ایجاد پیام جدید
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #22c55e;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 9999;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        // حذف خودکار پس از 3 ثانیه
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // بارگذاری آرایشگاه‌ها
    function loadBarbershops(cityId) {
        console.log('🏪 بارگذاری آرایشگاه‌ها...');
        
        const container = document.getElementById('barbershopsList');
        container.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> در حال بارگذاری...</div>';
        
        fetch(`/Booking/GetBarbershops?cityId=${cityId}`)
            .then(response => response.json())
            .then(barbershops => {
                console.log('✅ آرایشگاه‌ها بارگذاری شد:', barbershops.length);
                
                container.innerHTML = '';
                
                barbershops.forEach(barbershop => {
                    const card = document.createElement('div');
                    card.className = 'barbershop-card';
                    card.dataset.barbershopId = barbershop.id;
                    card.innerHTML = `
                        <h5>${barbershop.name}</h5>
                        <p>${barbershop.address}</p>
                        <small>${barbershop.phone}</small>
                    `;
                    
                    card.addEventListener('click', function() {
                        selectBarbershop(this, barbershop);
                    });
                    
                    container.appendChild(card);
                });
            })
            .catch(error => {
                console.error('❌ خطا در بارگذاری آرایشگاه‌ها:', error);
                container.innerHTML = '<div class="alert alert-danger">خطا در بارگذاری آرایشگاه‌ها</div>';
            });
    }

    // انتخاب آرایشگاه
    function selectBarbershop(barbershopElement, barbershopData) {
        console.log('🏪 آرایشگاه انتخاب شد');
        
        // حذف انتخاب قبلی
        document.querySelectorAll('.barbershop-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // انتخاب آرایشگاه جدید
        barbershopElement.classList.add('selected');
        
        // ذخیره اطلاعات
        selectedData.barbershopId = barbershopData.id;
        selectedData.barbershopName = barbershopData.name;
        
        console.log('✅ آرایشگاه انتخاب شد:', selectedData.barbershopName);
        
        // به‌روزرسانی navigation
        updateNavigation();
        
        // بارگذاری خدمات
        loadServices(selectedData.barbershopId);
        
        // رفتن به مرحله بعد
        setTimeout(() => {
            nextStep();
        }, 1000);
    }

    // بارگذاری خدمات
    function loadServices(barbershopId) {
        console.log('✂️ بارگذاری خدمات...');
        
        const container = document.getElementById('servicesList');
        container.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> در حال بارگذاری...</div>';
        
        fetch(`/Booking/GetServices?barbershopId=${barbershopId}`)
            .then(response => response.json())
            .then(services => {
                console.log('✅ خدمات بارگذاری شد:', services.length);
                
                container.innerHTML = '';
                
                services.forEach(service => {
                    const card = document.createElement('div');
                    card.className = 'service-card';
                    card.innerHTML = `
                        <input type="checkbox" class="service-checkbox" value="${service.id}" 
                               data-price="${service.price}" data-name="${service.name}">
                        <h5>${service.name}</h5>
                        <p>${service.description}</p>
                        <div class="service-price">${service.price.toLocaleString()} تومان</div>
                    `;
                    
                    const checkbox = card.querySelector('.service-checkbox');
                    checkbox.addEventListener('change', function() {
                        if (this.checked) {
                            card.classList.add('selected');
                        } else {
                            card.classList.remove('selected');
                        }
                        updateServiceSelection();
                    });
                    
                    container.appendChild(card);
                });
            })
            .catch(error => {
                console.error('❌ خطا در بارگذاری خدمات:', error);
                container.innerHTML = '<div class="alert alert-danger">خطا در بارگذاری خدمات</div>';
            });
    }

    // به‌روزرسانی انتخاب خدمات
    function updateServiceSelection() {
        selectedData.services = [];
        selectedData.totalPrice = 0;
        
        document.querySelectorAll('.service-checkbox:checked').forEach(checkbox => {
            selectedData.services.push({
                id: parseInt(checkbox.value),
                name: checkbox.dataset.name,
                price: parseFloat(checkbox.dataset.price)
            });
            selectedData.totalPrice += parseFloat(checkbox.dataset.price);
        });
        
        // به‌روزرسانی قیمت
        const totalPriceElement = document.getElementById('totalPrice');
        const depositAmountElement = document.getElementById('depositAmount');
        
        if (totalPriceElement) {
            totalPriceElement.textContent = selectedData.totalPrice.toLocaleString() + ' تومان';
        }
        
        if (depositAmountElement) {
            depositAmountElement.textContent = (selectedData.totalPrice * 0.3).toLocaleString() + ' تومان';
        }
        
        console.log('💰 قیمت کل:', selectedData.totalPrice);
        
        // به‌روزرسانی navigation
        updateNavigation();
    }

    // مرحله بعد
    function nextStep() {
        console.log('➡️ مرحله بعد');
        
        if (currentStep < 5) {
            // بررسی اعتبار مرحله فعلی
            if (!validateCurrentStep()) {
                console.log('❌ مرحله فعلی معتبر نیست');
                return;
            }
            
            // مخفی کردن مرحله فعلی
            document.querySelector(`#step${currentStep}`).classList.remove('active');
            document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('completed');
            
            // نمایش مرحله بعد
            currentStep++;
            document.querySelector(`#step${currentStep}`).classList.add('active');
            document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');
            
            // به‌روزرسانی navigation
            updateNavigation();
            
            // اگر مرحله 4 است، بارگذاری ساعات
            if (currentStep === 4) {
                loadAvailableTimes();
            }
            
            // اگر مرحله 5 است، به‌روزرسانی خلاصه
            if (currentStep === 5) {
                updateSummary();
            }
            
            console.log('✅ رفت به مرحله:', currentStep);
        }
    }

    // مرحله قبل
    function prevStep() {
        console.log('⬅️ مرحله قبل');
        
        if (currentStep > 1) {
            // مخفی کردن مرحله فعلی
            document.querySelector(`#step${currentStep}`).classList.remove('active');
            document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
            
            // نمایش مرحله قبل
            currentStep--;
            document.querySelector(`#step${currentStep}`).classList.add('active');
            document.querySelector(`.step[data-step="${currentStep + 1}"]`).classList.remove('completed');
            
            // به‌روزرسانی navigation
            updateNavigation();
            
            console.log('✅ برگشت به مرحله:', currentStep);
        }
    }

    // بررسی اعتبار مرحله فعلی
    function validateCurrentStep() {
        switch (currentStep) {
            case 1:
                return selectedData.cityId !== null;
            case 2:
                return selectedData.barbershopId !== null;
            case 3:
                return selectedData.services.length > 0;
            case 4:
                return selectedData.date !== '' && selectedData.time !== '';
            case 5:
                const customerName = document.getElementById('customerName')?.value;
                const customerPhone = document.getElementById('customerPhone')?.value;
                return customerName && customerPhone;
            default:
                return true;
        }
    }

    // به‌روزرسانی navigation
    function updateNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        // دکمه قبل
        if (prevBtn) {
            prevBtn.style.display = currentStep > 1 ? 'inline-flex' : 'none';
        }
        
        // دکمه بعد
        if (nextBtn) {
            if (currentStep < 5) {
                const isValid = validateCurrentStep();
                nextBtn.style.display = isValid ? 'inline-flex' : 'none';
            } else {
                nextBtn.style.display = 'none';
            }
        }
        
        // دکمه ثبت
        if (submitBtn) {
            submitBtn.style.display = currentStep === 5 ? 'inline-flex' : 'none';
        }
    }

    // بارگذاری ساعات خالی
    function loadAvailableTimes() {
        console.log('⏰ بارگذاری ساعات خالی...');
        
        const container = document.getElementById('timeSlots');
        container.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> در حال بارگذاری...</div>';
        
        const serviceIds = selectedData.services.map(s => s.id).join(',');
        const date = document.getElementById('appointmentDate')?.value || '2024-12-01';
        
        fetch(`/Booking/GetAvailableTimes?barbershopId=${selectedData.barbershopId}&date=${date}&serviceIds=${serviceIds}`)
            .then(response => response.json())
            .then(times => {
                console.log('✅ ساعات بارگذاری شد:', times.length);
                
                container.innerHTML = '';
                
                times.forEach(time => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'time-slot';
                    button.textContent = time;
                    button.dataset.time = time;
                    
                    button.addEventListener('click', function() {
                        document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
                        this.classList.add('selected');
                        selectedData.time = time;
                        selectedData.date = date;
                        
                        console.log('⏰ ساعت انتخاب شد:', time);
                        
                        // به‌روزرسانی navigation
                        updateNavigation();
                    });
                    
                    container.appendChild(button);
                });
            })
            .catch(error => {
                console.error('❌ خطا در بارگذاری ساعات:', error);
                container.innerHTML = '<div class="alert alert-danger">خطا در بارگذاری ساعات</div>';
            });
    }

    // به‌روزرسانی خلاصه
    function updateSummary() {
        console.log('📋 به‌روزرسانی خلاصه...');
        
        document.getElementById('summaryCity').textContent = selectedData.cityName;
        document.getElementById('summaryBarbershop').textContent = selectedData.barbershopName;
        document.getElementById('summaryServices').textContent = selectedData.services.map(s => s.name).join(', ');
        document.getElementById('summaryDateTime').textContent = `${selectedData.date} - ${selectedData.time}`;
        document.getElementById('summaryTotal').textContent = selectedData.totalPrice.toLocaleString() + ' تومان';
        document.getElementById('summaryDeposit').textContent = (selectedData.totalPrice * 0.3).toLocaleString() + ' تومان';
    }

    // ثبت نوبت
    function handleSubmit(e) {
        e.preventDefault();
        
        console.log('📝 ثبت نوبت...');
        
        const customerName = document.getElementById('customerName')?.value;
        const customerPhone = document.getElementById('customerPhone')?.value;
        
        if (!customerName || !customerPhone) {
            alert('لطفاً نام و شماره تماس را وارد کنید');
            return;
        }
        
        const appointmentData = {
            SelectedCityId: parseInt(selectedData.cityId),
            SelectedBarbershopId: parseInt(selectedData.barbershopId),
            SelectedServiceIds: selectedData.services.map(s => s.id),
            SelectedDate: selectedData.date,
            SelectedTime: selectedData.time,
            CustomerName: customerName,
            CustomerPhone: customerPhone,
            TotalPrice: selectedData.totalPrice,
            DepositAmount: selectedData.totalPrice * 0.3
        };

        console.log('📤 ارسال اطلاعات:', appointmentData);

        // نمایش loading
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ثبت...';
        submitBtn.disabled = true;

        fetch('/Booking/CreateAppointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ نوبت ثبت شد:', data.appointmentId);
                alert('نوبت شما با موفقیت ثبت شد!');
                window.location.href = `/Booking/Confirmation/${data.appointmentId}`;
            } else {
                console.error('❌ خطا در ثبت نوبت:', data.message);
                alert('خطا در ثبت نوبت');
                submitBtn.innerHTML = '<i class="fas fa-credit-card"></i> تایید و پرداخت بیعانه';
                submitBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('❌ خطای شبکه:', error);
            alert('خطا در ارتباط با سرور');
            submitBtn.innerHTML = '<i class="fas fa-credit-card"></i> تایید و پرداخت بیعانه';
            submitBtn.disabled = false;
        });
    }

    // در دسترس قرار دادن توابع برای تست
    window.bookingSystem = {
        selectedData,
        nextStep,
        prevStep,
        updateNavigation,
        selectCity,
        testSystemReadiness
    };
    
    // تست فوری پس از بارگذاری
    setTimeout(() => {
        console.log('🔍 تست نهایی سیستم...');
        const ready = testSystemReadiness();
        
        if (ready) {
            console.log('✅ سیستم کاملاً آماده است');
            
            // اضافه کردن یک دکمه تست
            const testButton = document.createElement('button');
            testButton.textContent = '🧪 تست انتخاب شهر اول';
            testButton.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                z-index: 9999;
                background: #22c55e;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            `;
            
            testButton.addEventListener('click', function() {
                const firstCity = document.querySelector('.city-option');
                if (firstCity) {
                    console.log('🧪 تست کلیک روی اولین شهر...');
                    selectCity(firstCity);
                } else {
                    console.error('❌ شهری برای تست یافت نشد');
                }
            });
            
            document.body.appendChild(testButton);
        } else {
            console.error('❌ سیستم آماده نیست!');
        }
    }, 2000);
});