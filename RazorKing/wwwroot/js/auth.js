/**
 * Authentication JavaScript
 * ریزر کینگ - اسکریپت‌های صفحات ورود و ثبت نام
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthForm();
    initializePasswordToggles();
    initializeFormValidation();
    initializeAnimations();
});

// Initialize auth form functionality
function initializeAuthForm() {
    const form = document.querySelector('.auth-form');
    if (!form) return;

    // Add loading state to submit button
    form.addEventListener('submit', function(e) {
        const submitBtn = form.querySelector('.btn-auth');
        if (submitBtn && !submitBtn.classList.contains('loading')) {
            submitBtn.classList.add('loading');
            const icon = submitBtn.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-spinner';
            }
            
            // Remove loading state after 10 seconds (fallback)
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                if (icon) {
                    icon.className = 'fas fa-sign-in-alt';
                }
            }, 10000);
        }
    });
}

// Initialize password toggle functionality
function initializePasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordInput = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Initialize form validation
function initializeFormValidation() {
    const form = document.querySelector('.auth-form');
    if (!form) return;

    // Real-time validation
    const inputs = form.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });

    // Password strength indicator
    const passwordInput = document.querySelector('input[name="Password"]');
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }

    // Confirm password validation
    const confirmPasswordInput = document.querySelector('input[name="ConfirmPassword"]');
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            validatePasswordMatch(passwordInput, confirmPasswordInput);
        });
    }

    // Form submission validation
    form.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            showAlert('لطفاً خطاهای فرم را برطرف کنید', 'error');
        }
    });
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Clear previous errors
    clearFieldError(e);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'این فیلد الزامی است');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'فرمت ایمیل صحیح نیست');
            return false;
        }
    }
    
    // Phone validation
    if (field.name === 'PhoneNumber' && value) {
        const phoneRegex = /^09\d{9}$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'شماره موبایل باید با 09 شروع شده و 11 رقم باشد');
            return false;
        }
    }
    
    // Password validation
    if (field.name === 'Password' && value) {
        if (value.length < 8) {
            showFieldError(field, 'رمز عبور باید حداقل 8 کاراکتر باشد');
            return false;
        }
        
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            showFieldError(field, 'رمز عبور باید شامل حروف بزرگ، کوچک و عدد باشد');
            return false;
        }
    }
    
    return true;
}

// Clear field error
function clearFieldError(e) {
    const field = e.target;
    const errorSpan = field.parentElement.querySelector('.text-danger');
    if (errorSpan) {
        errorSpan.textContent = '';
    }
    field.classList.remove('is-invalid');
}

// Show field error
function showFieldError(field, message) {
    const errorSpan = field.parentElement.querySelector('.text-danger');
    if (errorSpan) {
        errorSpan.textContent = message;
    }
    field.classList.add('is-invalid');
}

// Check password strength
function checkPasswordStrength(e) {
    const password = e.target.value;
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (!strengthIndicator) return;
    
    let strength = 0;
    let strengthText = '';
    let strengthClass = '';
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    switch (strength) {
        case 0:
        case 1:
            strengthText = 'ضعیف';
            strengthClass = 'weak';
            break;
        case 2:
        case 3:
            strengthText = 'متوسط';
            strengthClass = 'medium';
            break;
        case 4:
        case 5:
            strengthText = 'قوی';
            strengthClass = 'strong';
            break;
    }
    
    strengthIndicator.textContent = strengthText;
    strengthIndicator.className = `password-strength ${strengthClass}`;
}

// Validate password match
function validatePasswordMatch(passwordInput, confirmPasswordInput) {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword && password !== confirmPassword) {
        showFieldError(confirmPasswordInput, 'رمز عبور و تکرار آن یکسان نیستند');
        return false;
    } else {
        clearFieldError({ target: confirmPasswordInput });
        return true;
    }
}

// Validate entire form
function validateForm() {
    const form = document.querySelector('.auth-form');
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        const event = { target: input };
        if (!validateField(event)) {
            isValid = false;
        }
    });
    
    // Additional validations
    const passwordInput = document.querySelector('input[name="Password"]');
    const confirmPasswordInput = document.querySelector('input[name="ConfirmPassword"]');
    
    if (passwordInput && confirmPasswordInput) {
        if (!validatePasswordMatch(passwordInput, confirmPasswordInput)) {
            isValid = false;
        }
    }
    
    return isValid;
}

// Show alert message
function showAlert(message, type = 'info') {
    // Use RazorKing notification system if available
    if (window.RazorKing && window.RazorKing.showNotification) {
        window.RazorKing.showNotification(message, type);
        return;
    }
    
    // Fallback to simple alert
    const alertDiv = document.querySelector('.alert');
    if (alertDiv) {
        alertDiv.textContent = message;
        alertDiv.style.display = 'block';
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'info'}`;
        
        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

// Initialize animations
function initializeAnimations() {
    // Animate auth card entrance
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
        authCard.style.opacity = '0';
        authCard.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            authCard.style.transition = 'all 0.6s ease';
            authCard.style.opacity = '1';
            authCard.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Animate form elements
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            group.style.transition = 'all 0.4s ease';
            group.style.opacity = '1';
            group.style.transform = 'translateX(0)';
        }, 200 + (index * 100));
    });
    
    // Animate auth image
    const authImage = document.querySelector('.auth-image img');
    if (authImage) {
        authImage.addEventListener('load', function() {
            this.style.opacity = '1';
        });
    }
}

// Handle form submission success
function handleAuthSuccess(message, redirectUrl) {
    showAlert(message, 'success');
    
    setTimeout(() => {
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    }, 2000);
}

// Handle form submission error
function handleAuthError(message) {
    const submitBtn = document.querySelector('.btn-auth');
    if (submitBtn) {
        submitBtn.classList.remove('loading');
        const icon = submitBtn.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-exclamation-triangle';
            setTimeout(() => {
                icon.className = 'fas fa-sign-in-alt';
            }, 3000);
        }
    }
    
    showAlert(message, 'error');
}

// Make functions globally available
window.handleAuthSuccess = handleAuthSuccess;
window.handleAuthError = handleAuthError;