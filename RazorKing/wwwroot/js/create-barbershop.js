// Create Barbershop Form JavaScript

$(document).ready(function() {
    initializeForm();
    setupEventListeners();
    setupValidation();
});

// Initialize form components
function initializeForm() {
    // Set default working days if none selected
    if ($('input[name="WorkingDaysArray"]:checked').length === 0) {
        // Select Saturday to Thursday by default
        const defaultDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'];
        defaultDays.forEach(day => {
            $(`input[name="WorkingDaysArray"][value="${day}"]`).prop('checked', true);
        });
        updateWorkingDaysHidden();
    }
    
    // Set default working hours if empty
    if (!$('#OpenTime').val()) {
        $('#OpenTime').val('09:00');
    }
    if (!$('#CloseTime').val()) {
        $('#CloseTime').val('21:00');
    }
    
    // Ensure working days are properly set
    updateWorkingDaysHidden();
    
    // Initialize image upload
    initializeImageUpload();
    
    // Initialize city select styling
    initializeCitySelect();
}

// Setup event listeners
function setupEventListeners() {
    // Working days checkboxes
    $('input[name="WorkingDaysArray"]').on('change', function() {
        updateWorkingDaysHidden();
        validateWorkingDays();
    });
    
    // Form submission
    $('form').on('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            return false;
        }
        
        // Show loading state
        showLoadingState();
    });
    
    // Real-time validation
    $('.form-control, .form-select').on('blur', function() {
        validateField($(this));
    });
    
    // Phone number formatting
    $('#Phone').on('input', function() {
        formatPhoneNumber($(this));
    });
    
    // Time validation
    $('#OpenTime, #CloseTime').on('change', function() {
        validateWorkingHours();
    });
}

// Setup form validation
function setupValidation() {
    // Remove default browser validation
    $('form').attr('novalidate', true);
    
    // Custom validation messages
    const validationMessages = {
        'Name': 'نام آرایشگاه الزامی است',
        'Phone': 'شماره تماس معتبر وارد کنید',
        'Address': 'آدرس آرایشگاه الزامی است',
        'CityId': 'انتخاب شهر الزامی است',
        'OpenTime': 'ساعت شروع کار الزامی است',
        'CloseTime': 'ساعت پایان کار الزامی است'
    };
    
    // Store validation messages
    window.validationMessages = validationMessages;
}

// Update working days hidden field
function updateWorkingDaysHidden() {
    const selectedDays = [];
    $('input[name="WorkingDaysArray"]:checked').each(function() {
        selectedDays.push($(this).val());
    });
    $('#workingDaysHidden').val(selectedDays.join(','));
}

// Validate individual field
function validateField($field) {
    const fieldName = $field.attr('name') || $field.attr('id');
    const value = $field.val().trim();
    let isValid = true;
    let message = '';
    
    // Clear previous validation
    clearFieldValidation($field);
    
    switch(fieldName) {
        case 'Name':
            if (!value) {
                isValid = false;
                message = 'نام آرایشگاه الزامی است';
            } else if (value.length < 2) {
                isValid = false;
                message = 'نام آرایشگاه باید حداقل 2 کاراکتر باشد';
            }
            break;
            
        case 'Phone':
            if (!value) {
                isValid = false;
                message = 'شماره تماس الزامی است';
            } else if (!isValidPhoneNumber(value)) {
                isValid = false;
                message = 'شماره تماس معتبر وارد کنید (مثال: 09123456789)';
            }
            break;
            
        case 'Address':
            if (!value) {
                isValid = false;
                message = 'آدرس آرایشگاه الزامی است';
            } else if (value.length < 10) {
                isValid = false;
                message = 'آدرس باید حداقل 10 کاراکتر باشد';
            }
            break;
            
        case 'CityId':
            if (!value) {
                isValid = false;
                message = 'انتخاب شهر الزامی است';
            }
            break;
            
        case 'OpenTime':
        case 'CloseTime':
            if (!value) {
                isValid = false;
                message = fieldName === 'OpenTime' ? 'ساعت شروع کار الزامی است' : 'ساعت پایان کار الزامی است';
            }
            break;
    }
    
    if (!isValid) {
        showFieldError($field, message);
    } else {
        showFieldSuccess($field);
    }
    
    return isValid;
}

// Validate working days
function validateWorkingDays() {
    const selectedDays = $('input[name="WorkingDaysArray"]:checked').length;
    const $container = $('.days-grid').parent();
    
    clearContainerValidation($container);
    
    if (selectedDays === 0) {
        showContainerError($container, 'حداقل یک روز کاری انتخاب کنید');
        return false;
    } else if (selectedDays > 6) {
        showContainerError($container, 'حداکثر 6 روز کاری می‌توانید انتخاب کنید');
        return false;
    } else {
        showContainerSuccess($container);
        return true;
    }
}

// Validate working hours
function validateWorkingHours() {
    const openTime = $('#OpenTime').val();
    const closeTime = $('#CloseTime').val();
    
    if (!openTime || !closeTime) return true; // Will be caught by individual field validation
    
    const openMinutes = timeToMinutes(openTime);
    const closeMinutes = timeToMinutes(closeTime);
    
    const $closeField = $('#CloseTime');
    clearFieldValidation($closeField);
    
    if (closeMinutes <= openMinutes) {
        showFieldError($closeField, 'ساعت پایان کار باید بعد از ساعت شروع باشد');
        return false;
    } else if ((closeMinutes - openMinutes) < 120) { // Less than 2 hours
        showFieldError($closeField, 'حداقل 2 ساعت کاری در روز لازم است');
        return false;
    } else {
        showFieldSuccess($closeField);
        return true;
    }
}

// Validate entire form
function validateForm() {
    let isValid = true;
    
    // Validate required fields
    const requiredFields = ['#Name', '#Phone', '#Address', '#CityId', '#OpenTime', '#CloseTime'];
    requiredFields.forEach(selector => {
        const $field = $(selector);
        if (!validateField($field)) {
            isValid = false;
        }
    });
    
    // Validate working days
    if (!validateWorkingDays()) {
        isValid = false;
    }
    
    // Validate working hours
    if (!validateWorkingHours()) {
        isValid = false;
    }
    
    // Show summary message
    if (!isValid) {
        showValidationSummary();
        // Scroll to first error
        const $firstError = $('.is-invalid').first();
        if ($firstError.length) {
            $firstError[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            $firstError.focus();
        }
    }
    
    return isValid;
}

// Initialize image upload
function initializeImageUpload() {
    const $fileInput = $('#imageFile');
    const $uploadArea = $('.upload-area-compact');
    const $uploadContent = $('.upload-content-compact');
    const $uploadPreview = $('#uploadPreview');
    const $previewImage = $('#previewImage');
    const $removeBtn = $('#removeImage');
    
    // File input change
    $fileInput.on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });
    
    // Drag and drop
    $uploadArea.on('dragover', function(e) {
        e.preventDefault();
        $(this).addClass('drag-over');
    });
    
    $uploadArea.on('dragleave', function(e) {
        e.preventDefault();
        $(this).removeClass('drag-over');
    });
    
    $uploadArea.on('drop', function(e) {
        e.preventDefault();
        $(this).removeClass('drag-over');
        
        const files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                $fileInput[0].files = files;
                handleImageUpload(file);
            } else {
                showError('لطفاً فقط فایل تصویری انتخاب کنید');
            }
        }
    });
    
    // Remove image
    $removeBtn.on('click', function(e) {
        e.stopPropagation();
        removeImage();
    });
}

// Handle image upload
function handleImageUpload(file) {
    // Validate file
    if (!validateImageFile(file)) {
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        $('#previewImage').attr('src', e.target.result);
        $('.upload-content-compact').addClass('d-none');
        $('#uploadPreview').removeClass('d-none');
    };
    reader.readAsDataURL(file);
}

// Validate image file
function validateImageFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
        showError('فرمت فایل مجاز نیست. فقط JPG، PNG و GIF مجاز است');
        return false;
    }
    
    if (file.size > maxSize) {
        showError('حجم فایل نباید بیشتر از 5 مگابایت باشد');
        return false;
    }
    
    return true;
}

// Remove image
function removeImage() {
    $('#imageFile').val('');
    $('#previewImage').attr('src', '');
    $('.upload-content-compact').removeClass('d-none');
    $('#uploadPreview').addClass('d-none');
}

// Format phone number
function formatPhoneNumber($field) {
    let value = $field.val().replace(/\D/g, ''); // Remove non-digits
    
    // Limit to 11 digits
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    // Format as needed
    if (value.length > 0 && !value.startsWith('09')) {
        if (value.startsWith('9')) {
            value = '0' + value;
        }
    }
    
    $field.val(value);
}

// Validate phone number
function isValidPhoneNumber(phone) {
    const phoneRegex = /^09[0-9]{9}$/;
    return phoneRegex.test(phone);
}

// Convert time to minutes
function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Show field error
function showFieldError($field, message) {
    $field.addClass('is-invalid').removeClass('is-valid');
    
    // Remove existing error message
    $field.siblings('.invalid-feedback').remove();
    
    // Add error message
    $field.after(`<div class="invalid-feedback">${message}</div>`);
}

// Show field success
function showFieldSuccess($field) {
    $field.addClass('is-valid').removeClass('is-invalid');
    $field.siblings('.invalid-feedback').remove();
}

// Clear field validation
function clearFieldValidation($field) {
    $field.removeClass('is-valid is-invalid');
    $field.siblings('.invalid-feedback').remove();
}

// Show container error
function showContainerError($container, message) {
    $container.addClass('has-error');
    
    // Remove existing error message
    $container.find('.error-message').remove();
    
    // Add error message
    $container.append(`<div class="error-message text-danger mt-2">${message}</div>`);
}

// Show container success
function showContainerSuccess($container) {
    $container.removeClass('has-error');
    $container.find('.error-message').remove();
}

// Clear container validation
function clearContainerValidation($container) {
    $container.removeClass('has-error');
    $container.find('.error-message').remove();
}

// Show validation summary
function showValidationSummary() {
    const errorCount = $('.is-invalid').length + $('.has-error').length;
    
    if (errorCount > 0) {
        showError(`لطفاً ${errorCount} خطای موجود در فرم را برطرف کنید`);
    }
}

// Show loading state
function showLoadingState() {
    const $submitBtn = $('.btn-create');
    const originalText = $submitBtn.html();
    
    $submitBtn.prop('disabled', true);
    $submitBtn.html(`
        <div class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden">در حال پردازش...</span>
        </div>
        در حال ایجاد آرایشگاه...
    `);
    
    // Store original text for potential restoration
    $submitBtn.data('original-text', originalText);
}

// Utility functions
function showError(message) {
    // You can integrate with toastr or any notification library
    if (typeof toastr !== 'undefined') {
        toastr.error(message);
    } else {
        alert(message);
    }
}

function showSuccess(message) {
    if (typeof toastr !== 'undefined') {
        toastr.success(message);
    } else {
        alert(message);
    }
}

// Auto-save form data to localStorage (optional)
function autoSaveForm() {
    const formData = {
        name: $('#Name').val(),
        phone: $('#Phone').val(),
        description: $('#Description').val(),
        address: $('#Address').val(),
        cityId: $('#CityId').val(),
        openTime: $('#OpenTime').val(),
        closeTime: $('#CloseTime').val(),
        workingDays: $('#workingDaysHidden').val()
    };
    
    localStorage.setItem('barbershop-form-draft', JSON.stringify(formData));
}

// Load saved form data (optional)
function loadSavedForm() {
    const savedData = localStorage.getItem('barbershop-form-draft');
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            
            $('#Name').val(formData.name || '');
            $('#Phone').val(formData.phone || '');
            $('#Description').val(formData.description || '');
            $('#Address').val(formData.address || '');
            $('#CityId').val(formData.cityId || '');
            $('#OpenTime').val(formData.openTime || '09:00');
            $('#CloseTime').val(formData.closeTime || '21:00');
            
            if (formData.workingDays) {
                const days = formData.workingDays.split(',');
                days.forEach(day => {
                    $(`input[name="WorkingDaysArray"][value="${day.trim()}"]`).prop('checked', true);
                });
                updateWorkingDaysHidden();
            }
        } catch (e) {
            console.warn('Could not load saved form data:', e);
        }
    }
}

// Clear saved form data
function clearSavedForm() {
    localStorage.removeItem('barbershop-form-draft');
}

// Auto-save every 30 seconds
setInterval(autoSaveForm, 30000);

// Load saved data on page load
$(document).ready(function() {
    // Uncomment if you want to enable auto-save/load functionality
    // loadSavedForm();
});

// Clear saved data on successful submission
$('form').on('submit', function() {
    if (validateForm()) {
        clearSavedForm();
    }
});

// Initialize city select with better styling
function initializeCitySelect() {
    const $citySelect = $('#CityId');
    
    // Try to create custom select if native styling fails
    if (shouldUseCustomSelect()) {
        createCustomSelect($citySelect);
    } else {
        // Fallback to enhanced native select
        enhanceNativeSelect($citySelect);
    }
}

// Check if we should use custom select (for better browser compatibility)
function shouldUseCustomSelect() {
    // Use custom select for better control
    return true;
}

// Enhance native select
function enhanceNativeSelect($select) {
    // Add custom styling on focus
    $select.on('focus', function() {
        $(this).addClass('select-focused');
    });
    
    $select.on('blur', function() {
        $(this).removeClass('select-focused');
    });
    
    // Handle option selection
    $select.on('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.value) {
            $(this).addClass('has-value');
        } else {
            $(this).removeClass('has-value');
        }
        
        // Trigger validation
        validateField($(this));
    });
    
    // Check initial value
    if ($select.val()) {
        $select.addClass('has-value');
    }
    
    // Force option styling on interaction
    $select.on('mousedown touchstart', function() {
        setTimeout(() => {
            const options = this.querySelectorAll('option');
            options.forEach(option => {
                if (!option.style.backgroundColor) {
                    option.style.backgroundColor = '#2d2d2d';
                    option.style.color = '#fff';
                }
            });
        }, 10);
    });
}

// Create custom select dropdown
function createCustomSelect($originalSelect) {
    const $wrapper = $originalSelect.closest('.city-select-wrapper');
    const options = Array.from($originalSelect[0].options);
    
    // Create custom elements
    const $customWrapper = $('<div class="custom-select-wrapper"></div>');
    const $display = $('<div class="custom-select-display">انتخاب شهر</div>');
    const $optionsContainer = $('<div class="custom-select-options"></div>');
    
    // Add options to custom dropdown
    options.forEach(option => {
        const $customOption = $('<div class="custom-select-option"></div>');
        $customOption.text(option.text);
        $customOption.data('value', option.value);
        
        if (!option.value) {
            $customOption.addClass('placeholder');
        }
        
        if (option.selected) {
            $customOption.addClass('selected');
            $display.text(option.text);
        }
        
        $customOption.on('click', function() {
            const value = $(this).data('value');
            const text = $(this).text();
            
            // Update original select
            $originalSelect.val(value).trigger('change');
            
            // Update display
            $display.text(text);
            
            // Update selected state
            $optionsContainer.find('.custom-select-option').removeClass('selected');
            $(this).addClass('selected');
            
            // Close dropdown
            $display.removeClass('open');
            $optionsContainer.removeClass('show');
        });
        
        $optionsContainer.append($customOption);
    });
    
    // Handle display click
    $display.on('click', function() {
        $(this).toggleClass('open');
        $optionsContainer.toggleClass('show');
        
        // Close other dropdowns
        $('.custom-select-display').not(this).removeClass('open');
        $('.custom-select-options').not($optionsContainer).removeClass('show');
    });
    
    // Close dropdown when clicking outside
    $(document).on('click', function(e) {
        if (!$customWrapper.is(e.target) && $customWrapper.has(e.target).length === 0) {
            $display.removeClass('open');
            $optionsContainer.removeClass('show');
        }
    });
    
    // Build custom select
    $customWrapper.append($display);
    $customWrapper.append($optionsContainer);
    
    // Hide original select and add custom
    $originalSelect.addClass('custom-select');
    $wrapper.append($customWrapper);
}

// Export functions for potential external use
window.CreateBarbershopForm = {
    validateForm,
    showLoadingState,
    clearSavedForm,
    autoSaveForm,
    loadSavedForm,
    initializeCitySelect
};