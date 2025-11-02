// Create Barbershop JavaScript
document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    const totalSteps = 3;
    
    // Initialize
    initializeForm();
    setupEventListeners();
    
    function initializeForm() {
        updateStepDisplay();
        setupWorkingDays();
        setupImageUpload();
        setupFormValidation();
    }
    
    function setupEventListeners() {
        // Step navigation
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', nextStep);
        });
        
        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', prevStep);
        });
        
        // Form submission
        document.querySelector('.create-form').addEventListener('submit', handleFormSubmit);
        
        // Working days checkboxes
        document.querySelectorAll('input[name="WorkingDaysArray"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateWorkingDays);
        });
        
        // Time inputs
        document.querySelectorAll('.time-input').forEach(input => {
            input.addEventListener('change', validateTimeRange);
        });
    }
    
    function nextStep() {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateStepDisplay();
                animateStepTransition();
            }
        }
    }
    
    function prevStep() {
        if (currentStep > 1) {
            currentStep--;
            updateStepDisplay();
            animateStepTransition();
        }
    }
    
    function updateStepDisplay() {
        // Update progress steps
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === currentStep) {
                step.classList.add('active');
            } else if (stepNumber < currentStep) {
                step.classList.add('completed');
            }
        });
        
        // Update form steps
        document.querySelectorAll('.form-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active');
            
            if (stepNumber === currentStep) {
                step.classList.add('active');
            }
        });
    }
    
    function animateStepTransition() {
        const activeStep = document.querySelector('.form-step.active');
        if (activeStep) {
            activeStep.style.opacity = '0';
            activeStep.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                activeStep.style.opacity = '1';
                activeStep.style.transform = 'translateY(0)';
            }, 100);
        }
    }
    
    function validateCurrentStep() {
        const currentStepElement = document.getElementById(`step-${currentStep}`);
        const inputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        // Additional validations per step
        if (currentStep === 1) {
            isValid = validateStep1() && isValid;
        } else if (currentStep === 2) {
            isValid = validateStep2() && isValid;
        }
        
        return isValid;
    }
    
    function validateStep1() {
        const name = document.getElementById('Name');
        const phone = document.getElementById('Phone');
        const cityId = document.getElementById('CityId');
        
        let isValid = true;
        
        if (!name.value.trim()) {
            showFieldError(name, 'نام آرایشگاه الزامی است');
            isValid = false;
        } else {
            clearFieldError(name);
        }
        
        if (!phone.value.trim()) {
            showFieldError(phone, 'شماره تماس الزامی است');
            isValid = false;
        } else if (!isValidPhone(phone.value)) {
            showFieldError(phone, 'شماره تماس معتبر نیست');
            isValid = false;
        } else {
            clearFieldError(phone);
        }
        
        if (!cityId.value) {
            showFieldError(cityId, 'انتخاب شهر الزامی است');
            isValid = false;
        } else {
            clearFieldError(cityId);
        }
        
        return isValid;
    }
    
    function validateStep2() {
        const openTime = document.getElementById('OpenTime');
        const closeTime = document.getElementById('CloseTime');
        const workingDays = document.querySelectorAll('input[name="WorkingDaysArray"]:checked');
        
        let isValid = true;
        
        if (!openTime.value) {
            showFieldError(openTime, 'ساعت شروع کار الزامی است');
            isValid = false;
        } else {
            clearFieldError(openTime);
        }
        
        if (!closeTime.value) {
            showFieldError(closeTime, 'ساعت پایان کار الزامی است');
            isValid = false;
        } else {
            clearFieldError(closeTime);
        }
        
        if (openTime.value && closeTime.value) {
            if (openTime.value >= closeTime.value) {
                showFieldError(closeTime, 'ساعت پایان کار باید بعد از ساعت شروع باشد');
                isValid = false;
            }
        }
        
        if (workingDays.length === 0) {
            showNotification('حداقل یک روز کاری انتخاب کنید', 'error');
            isValid = false;
        }
        
        return isValid;
    }
    
    function validateInput(input) {
        if (input.hasAttribute('required') && !input.value.trim()) {
            showFieldError(input, 'این فیلد الزامی است');
            return false;
        }
        
        clearFieldError(input);
        return true;
    }
    
    function showFieldError(input, message) {
        input.classList.add('is-invalid');
        
        let errorElement = input.parentNode.querySelector('.text-danger');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'text-danger';
            input.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
    
    function clearFieldError(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        
        const errorElement = input.parentNode.querySelector('.text-danger');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    
    function isValidPhone(phone) {
        const phoneRegex = /^[\d\-\s\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.length >= 10;
    }
    
    function validateTimeRange() {
        const openTime = document.getElementById('OpenTime');
        const closeTime = document.getElementById('CloseTime');
        
        if (openTime.value && closeTime.value) {
            if (openTime.value >= closeTime.value) {
                showFieldError(closeTime, 'ساعت پایان کار باید بعد از ساعت شروع باشد');
            } else {
                clearFieldError(closeTime);
            }
        }
    }
    
    function setupWorkingDays() {
        updateWorkingDays();
    }
    
    function updateWorkingDays() {
        const checkedDays = Array.from(document.querySelectorAll('input[name="WorkingDaysArray"]:checked'))
            .map(cb => cb.value);
        
        document.getElementById('workingDaysHidden').value = checkedDays.join(',');
    }
    
    function setupImageUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('imageFile');
        const uploadContent = uploadArea.querySelector('.upload-content');
        const uploadPreview = document.getElementById('uploadPreview');
        const previewImage = document.getElementById('previewImage');
        const removeButton = document.getElementById('removeImage');
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
        
        // Remove image
        removeButton.addEventListener('click', () => {
            fileInput.value = '';
            uploadContent.classList.remove('d-none');
            uploadPreview.classList.add('d-none');
        });
        
        function handleFileSelect(file) {
            if (!isValidImageFile(file)) {
                showNotification('فایل انتخاب شده معتبر نیست. لطفاً یک تصویر انتخاب کنید.', 'error');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5MB
                showNotification('حجم فایل نباید بیشتر از 5 مگابایت باشد.', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                uploadContent.classList.add('d-none');
                uploadPreview.classList.remove('d-none');
            };
            reader.readAsDataURL(file);
        }
        
        function isValidImageFile(file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            return validTypes.includes(file.type);
        }
    }
    
    function setupFormValidation() {
        // Real-time validation
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('blur', () => validateInput(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid')) {
                    validateInput(input);
                }
            });
        });
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate all steps
        let allValid = true;
        for (let step = 1; step <= totalSteps; step++) {
            currentStep = step;
            if (!validateCurrentStep()) {
                allValid = false;
                break;
            }
        }
        
        if (!allValid) {
            currentStep = 1; // Reset to first invalid step
            updateStepDisplay();
            showNotification('لطفاً تمام فیلدهای الزامی را تکمیل کنید', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('.btn-create');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Submit form
        setTimeout(() => {
            e.target.submit();
        }, 500);
    }
    
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            if (currentStep < totalSteps) {
                nextStep();
            } else {
                document.querySelector('.btn-create').click();
            }
        }
    });
    
    // Auto-save to localStorage
    function autoSave() {
        const formData = new FormData(document.querySelector('.create-form'));
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        localStorage.setItem('barbershop_draft', JSON.stringify(data));
    }
    
    function loadDraft() {
        const draft = localStorage.getItem('barbershop_draft');
        if (draft) {
            try {
                const data = JSON.parse(draft);
                Object.keys(data).forEach(key => {
                    const input = document.querySelector(`[name="${key}"]`);
                    if (input && input.type !== 'file') {
                        input.value = data[key];
                    }
                });
                updateWorkingDays();
            } catch (e) {
                console.log('Could not load draft');
            }
        }
    }
    
    // Load draft on page load
    loadDraft();
    
    // Auto-save every 30 seconds
    setInterval(autoSave, 30000);
    
    // Save on input change
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('change', autoSave);
    });
    
    // Clear draft on successful submission
    window.addEventListener('beforeunload', () => {
        if (document.querySelector('.btn-create.loading')) {
            localStorage.removeItem('barbershop_draft');
        }
    });
});

// CSS Animation for notifications
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
`;
document.head.appendChild(style);