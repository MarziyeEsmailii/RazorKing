// ✨ اسکریپت بهبود یافته صفحات ورود و ثبت نام - ریزر کینگ ✨

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 سیستم احراز هویت بارگذاری شد');
    
    // بهبود تعامل با input ها
    enhanceInputs();
    
    // بهبود فرم validation
    enhanceValidation();
    
    // بهبود انیمیشن‌ها
    enhanceAnimations();
    
    // بهبود تب‌ها
    enhanceTabs();
    
    console.log('✅ سیستم احراز هویت آماده است');
});

function enhanceInputs() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"]');
    
    inputs.forEach(input => {
        // اضافه کردن افکت focus
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            if (this.value.trim() !== '') {
                this.parentElement.classList.add('filled');
            } else {
                this.parentElement.classList.remove('filled');
            }
        });
        
        // بررسی اولیه برای input های پر شده
        if (input.value.trim() !== '') {
            input.parentElement.classList.add('filled');
        }
        
        // بهبود placeholder برای RTL
        input.addEventListener('input', function() {
            if (this.value.length > 0) {
                this.style.textAlign = 'right';
            } else {
                this.style.textAlign = 'right';
            }
        });
    });
}

function enhanceValidation() {
    const forms = document.querySelectorAll('.auth-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const inputs = this.querySelectorAll('input[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                const errorSpan = input.parentElement.querySelector('.field-error');
                
                // پاک کردن خطاهای قبلی
                if (errorSpan) {
                    errorSpan.textContent = '';
                }
                
                // بررسی validation
                if (!input.value.trim()) {
                    showFieldError(input, 'این فیلد الزامی است');
                    isValid = false;
                } else if (input.type === 'email' && !isValidEmail(input.value)) {
                    showFieldError(input, 'فرمت ایمیل صحیح نیست');
                    isValid = false;
                } else if (input.type === 'tel' && !isValidPhone(input.value)) {
                    showFieldError(input, 'شماره موبایل صحیح نیست');
                    isValid = false;
                } else if (input.type === 'password' && input.value.length < 6) {
                    showFieldError(input, 'رمز عبور باید حداقل 6 کاراکتر باشد');
                    isValid = false;
                }
            });
            
            // بررسی تطابق رمز عبور
            const password = form.querySelector('input[name="Password"]');
            const confirmPassword = form.querySelector('input[name="ConfirmPassword"]');
            
            if (password && confirmPassword && password.value !== confirmPassword.value) {
                showFieldError(confirmPassword, 'رمز عبور و تکرار آن یکسان نیست');
                isValid = false;
            }
            
            if (!isValid) {
                e.preventDefault();
                showMessage('لطفاً خطاهای فرم را اصلاح کنید', 'error');
            }
        });
    });
}

function showFieldError(input, message) {
    const errorSpan = input.parentElement.querySelector('.field-error');
    if (errorSpan) {
        errorSpan.textContent = message;
        input.classList.add('error');
        
        // حذف کلاس خطا بعد از تغییر input
        input.addEventListener('input', function() {
            this.classList.remove('error');
            errorSpan.textContent = '';
        }, { once: true });
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^09[0-9]{9}$/;
    return phoneRegex.test(phone);
}

function enhanceAnimations() {
    // انیمیشن ورود کارت
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
        authCard.style.opacity = '0';
        authCard.style.transform = 'translateY(30px) scale(0.95)';
        
        setTimeout(() => {
            authCard.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            authCard.style.opacity = '1';
            authCard.style.transform = 'translateY(0) scale(1)';
        }, 100);
    }
    
    // انیمیشن ورود عکس
    const authImg = document.querySelector('.auth-img');
    if (authImg) {
        authImg.style.opacity = '0';
        authImg.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            authImg.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
            authImg.style.opacity = '1';
            authImg.style.transform = 'scale(1)';
        }, 300);
    }
}

function enhanceTabs() {
    const tabs = document.querySelectorAll('.auth-switch');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // اضافه کردن افکت کلیک
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

function showMessage(text, type = 'info') {
    // حذف پیام‌های قبلی
    const existingMessages = document.querySelectorAll('.auth-message');
    existingMessages.forEach(msg => msg.remove());
    
    // ایجاد پیام جدید
    const message = document.createElement('div');
    message.className = 'auth-message';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 9999;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        background: ${getMessageColor(type)};
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        direction: rtl;
        text-align: right;
        font-size: 14px;
        max-width: 300px;
    `;
    message.textContent = text;
    
    document.body.appendChild(message);
    
    // حذف خودکار
    setTimeout(() => {
        message.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => message.remove(), 400);
    }, 4000);
}

function getMessageColor(type) {
    const colors = {
        success: 'linear-gradient(135deg, #22c55e, #16a34a)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };
    return colors[type] || colors.info;
}

// اضافه کردن استایل‌های انیمیشن
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .input-group.focused::before {
        width: 100% !important;
    }
    
    .input-group.filled input {
        background: linear-gradient(145deg, rgba(212, 175, 55, 0.08), var(--light-gray)) !important;
    }
    
    input.error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.3) !important;
        animation: shake 0.5s ease-in-out !important;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .auth-btn:active {
        transform: translateY(0) scale(0.95) !important;
    }
    
    .type-card:hover {
        transform: translateY(-3px) !important;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important;
    }
    
    .checkbox-label:hover .checkmark {
        transform: scale(1.1) !important;
        border-color: var(--gold) !important;
    }
    
    .forgot-link:hover {
        transform: translateY(-1px) !important;
    }
`;
document.head.appendChild(style);

// بهبود تجربه کاربری برای موبایل
if (window.innerWidth <= 768) {
    document.body.style.overflow = 'auto';
    
    // بهبود scroll برای موبایل
    const authPage = document.querySelector('.auth-page');
    if (authPage) {
        authPage.style.minHeight = 'auto';
        authPage.style.paddingTop = '2rem';
        authPage.style.paddingBottom = '2rem';
    }
}

console.log('✨ بهبودهای احراز هویت اعمال شد');