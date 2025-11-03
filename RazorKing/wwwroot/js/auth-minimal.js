// ✨ Beautiful Auth JavaScript - ریزر کینگ ✨

document.addEventListener('DOMContentLoaded', function() {
    // 🎯 عناصر
    const inputs = document.querySelectorAll('input');
    
    // 🔄 دکمه‌های تب فقط برای نمایش هستن
    // تعویض با onclick در HTML انجام می‌شه
    
    // 🖼️ تصاویر ثابت - بدون تعویض خودکار
    // عکس‌ها ثابت می‌مونن و تغییر نمی‌کنن
    
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
            this.style.boxShadow = '';
            const errorSpan = this.parentNode.querySelector('.field-error');
            if (errorSpan && errorSpan.textContent.trim()) {
                errorSpan.style.animation = 'errorSlide 0.3s ease-out reverse';
                setTimeout(() => {
                    errorSpan.textContent = '';
                    errorSpan.style.display = 'none';
                }, 300);
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
                
                // فوکوس روی اولین input خطادار
                const firstErrorInput = form.querySelector('input[style*="border-color: #ff6b6b"]');
                if (firstErrorInput) {
                    firstErrorInput.focus();
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
            const otherSwitch = document.querySelector('.auth-switch:not(.active)');
            if (otherSwitch) otherSwitch.click();
        }
    });
});