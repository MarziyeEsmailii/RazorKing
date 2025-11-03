// ✨ Beautiful Auth JavaScript - ریزر کینگ ✨

document.addEventListener('DOMContentLoaded', function() {
    // 🎯 عناصر
    const switches = document.querySelectorAll('.auth-switch');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const images = document.querySelectorAll('.auth-img');
    const inputs = document.querySelectorAll('input');
    
    // 🔄 تعویض بین ورود و ثبت نام
    switches.forEach(switchBtn => {
        switchBtn.addEventListener('click', function() {
            const formType = this.dataset.form;
            
            if (!formType) return;
            
            // تغییر تب فعال با انیمیشن
            switches.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            
            // تغییر فرم با انیمیشن نرم
            if (formType === 'login') {
                if (registerForm) registerForm.classList.add('hidden');
                if (loginForm) {
                    setTimeout(() => loginForm.classList.remove('hidden'), 150);
                }
            } else {
                if (loginForm) loginForm.classList.add('hidden');
                if (registerForm) {
                    setTimeout(() => registerForm.classList.remove('hidden'), 150);
                }
            }
        });
    });
    
    // 🖼️ تعویض خودکار تصاویر زیبا
    if (images.length > 1) {
        let currentImageIndex = 0;
        
        function switchImage() {
            images[currentImageIndex].classList.remove('active');
            currentImageIndex = (currentImageIndex + 1) % images.length;
            images[currentImageIndex].classList.add('active');
        }
        
        // تعویض تصویر هر 6 ثانیه
        setInterval(switchImage, 6000);
    }
    
    // ✨ افکت‌های زیبا برای ورودی‌ها
    inputs.forEach(input => {
        // انیمیشن فوکوس
        input.addEventListener('focus', function() {
            this.parentNode.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.style.transform = 'translateY(0)';
        });
        
        // پاک کردن خطاها
        input.addEventListener('input', function() {
            this.style.borderColor = '';
            const errorSpan = this.parentNode.querySelector('.field-error');
            if (errorSpan) {
                errorSpan.style.opacity = '0';
                setTimeout(() => errorSpan.textContent = '', 300);
            }
        });
    });
    
    // 🎯 اعتبارسنجی فرم با انیمیشن
    const forms = document.querySelectorAll('.auth-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredInputs = form.querySelectorAll('input[required]');
            let isValid = true;
            
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ff6b6b';
                    input.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.3)';
                    
                    // انیمیشن لرزش
                    input.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => input.style.animation = '', 500);
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                
                // نمایش پیام خطا با انیمیشن
                const errorDiv = form.querySelector('.auth-error');
                if (errorDiv) {
                    errorDiv.style.animation = 'shake 0.5s ease-in-out';
                }
            }
        });
    });
    
    // 🎨 افکت موس برای دکمه‌ها
    const buttons = document.querySelectorAll('.auth-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // ⌨️ کلیدهای میانبر
    document.addEventListener('keydown', function(e) {
        // Enter برای ارسال فرم
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            const form = e.target.closest('form');
            if (form) {
                const submitBtn = form.querySelector('.auth-btn');
                if (submitBtn) submitBtn.click();
            }
        }
        
        // Tab برای تعویض بین ورود و ثبت نام
        if (e.key === 'Tab' && e.ctrlKey) {
            e.preventDefault();
            const activeSwitch = document.querySelector('.auth-switch.active');
            const otherSwitch = document.querySelector('.auth-switch:not(.active)');
            if (otherSwitch) otherSwitch.click();
        }
    });
});