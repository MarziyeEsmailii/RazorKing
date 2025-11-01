// انیمیشن‌های فرم ورود و ثبت نام
const container = document.querySelector('.container');
const LoginLink = document.querySelector('.SignInLink');
const RegisterLink = document.querySelector('.SignUpLink');

RegisterLink.addEventListener('click', () => {
    container.classList.add('active');
});

LoginLink.addEventListener('click', () => {
    container.classList.remove('active');
});

// مدیریت انتخاب نوع کاربر در ثبت نام
document.addEventListener('DOMContentLoaded', function() {
    const userTypeSelect = document.getElementById('UserType');
    const barbershopFields = document.getElementById('barbershopFields');
    
    if (userTypeSelect && barbershopFields) {
        userTypeSelect.addEventListener('change', function() {
            if (this.value === '1') { // BarbershopOwner
                barbershopFields.style.display = 'block';
                barbershopFields.classList.add('show');
                
                // اجباری کردن فیلدهای آرایشگاه
                const requiredFields = barbershopFields.querySelectorAll('input[name="BarbershopName"], input[name="BarbershopAddress"], select[name="CityId"]');
                requiredFields.forEach(field => {
                    field.setAttribute('required', 'required');
                });
            } else {
                barbershopFields.style.display = 'none';
                barbershopFields.classList.remove('show');
                
                // حذف اجباری بودن فیلدهای آرایشگاه
                const fields = barbershopFields.querySelectorAll('input, select, textarea');
                fields.forEach(field => {
                    field.removeAttribute('required');
                    field.value = '';
                });
            }
        });
    }

    // مدیریت فرم‌ها
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loadingOverlay = document.getElementById('loadingOverlay');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            if (validateForm('Login')) {
                showLoading();
            } else {
                e.preventDefault();
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            if (validateForm('Register')) {
                showLoading();
            } else {
                e.preventDefault();
            }
        });
    }

    function showLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    }
});

// اعتبارسنجی فرم
function validateForm(formType) {
    const form = document.querySelector(`.form-box.${formType} form`);
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderBottomColor = '#ff4444';
            isValid = false;
        } else {
            input.style.borderBottomColor = '#e46033';
        }
    });
    
    return isValid;
}

// نمایش پیام‌های خطا
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// نمایش پیام موفقیت
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e46033;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// انیمیشن ورود پیام‌ها
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);