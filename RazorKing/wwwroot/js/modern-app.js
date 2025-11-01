// ریزر کینگ - اپلیکیشن مدرن

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeApp();
});

function initializeApp() {
    // Initialize app without loading screen
    
    // Navigation
    initializeNavigation();
    
    // Scroll animations
    initializeScrollAnimations();
    
    // Back to top button
    initializeBackToTop();
    
    // Smooth scrolling
    initializeSmoothScrolling();
    
    // City cards
    initializeCityCards();
    
    // Service cards
    initializeServiceCards();
    
    // Form enhancements
    initializeFormEnhancements();
    
    // Page transitions
    initializePageTransitions();
}

// Loading Screen removed for better performance

// Navigation
function initializeNavigation() {
    const navbar = document.getElementById('mainNav');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
        });
    }
    
    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 992) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                    hide: true
                });
            }
        });
    });
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Add stagger animation to children
                if (entry.target.classList.contains('stagger-animation')) {
                    const children = entry.target.children;
                    Array.from(children).forEach((child, index) => {
                        setTimeout(() => {
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe elements
    const animatedElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .stagger-animation');
    animatedElements.forEach(el => observer.observe(el));
}

// Back to Top Button
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// City Cards
function initializeCityCards() {
    const cityCards = document.querySelectorAll('.city-card');
    
    cityCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Add click effect
        card.addEventListener('click', function() {
            const cityBtn = this.querySelector('.city-btn');
            if (cityBtn) {
                // Add ripple effect
                createRippleEffect(this, event);
                
                // Navigate after animation
                setTimeout(() => {
                    window.location.href = cityBtn.getAttribute('href');
                }, 300);
            }
        });
    });
}

// Service Cards
function initializeServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add glow effect
            this.style.boxShadow = '0 20px 40px rgba(212, 175, 55, 0.3)';
            
            // Animate icon
            const icon = this.querySelector('.service-icon i');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
            
            const icon = this.querySelector('.service-icon i');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

// Form Enhancements
function initializeFormEnhancements() {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Add focus effects
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            
            if (this.value) {
                this.parentElement.classList.add('filled');
            } else {
                this.parentElement.classList.remove('filled');
            }
        });
        
        // Check if already filled
        if (input.value) {
            input.parentElement.classList.add('filled');
        }
    });
    
    // Enhanced button effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            createRippleEffect(this, e);
        });
    });
}

// Page Transitions
function initializePageTransitions() {
    // Add page transition class to body
    document.body.classList.add('page-transition');
    
    // Remove transition class after load
    window.addEventListener('load', function() {
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
    });
    
    // Handle page navigation
    const links = document.querySelectorAll('a:not([href^="#"]):not([href^="mailto"]):not([href^="tel"])');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href && !href.startsWith('http') && !this.hasAttribute('target')) {
                e.preventDefault();
                
                document.body.classList.remove('loaded');
                
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            }
        });
    });
}

// Utility Functions
function createRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    // Add ripple styles
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(212, 175, 55, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.pointerEvents = 'none';
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Parallax Effect
function initializeParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        parallaxElements.forEach(element => {
            element.style.transform = `translateY(${rate}px)`;
        });
    });
}

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const increment = target / 100;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            counter.textContent = Math.floor(current);
            
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            }
        }, 20);
    });
}

// Lazy Loading Images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Typing Effect
function createTypingEffect(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function typeWriter() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }
    
    typeWriter();
}

// Toast Notifications
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Toast styles
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    // Toast colors
    const colors = {
        info: '#3498db',
        success: '#2ecc71',
        warning: '#f39c12',
        error: '#e74c3c'
    };
    
    toast.style.background = colors[type] || colors.info;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}

// Performance Optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Export functions for global use
window.RazorKing = {
    showToast,
    createTypingEffect,
    createRippleEffect,
    animateCounters,
    debounce,
    throttle
};
// راه‌ اندازی تقویم شمسی
document.addEventListener('DOMContentLoaded', function() {
    // راه‌اندازی تقویم برای فیلد انتخاب تاریخ
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
        const datePicker = new PersianDatePicker(dateInput, {
            disablePastDates: true,
            onSelect: function(persianDate, gregorianDate) {
                // نمایش تاریخ انتخاب شده
                const selectedDisplay = document.getElementById('selectedDateDisplay');
                const selectedText = document.getElementById('selectedDateText');
                
                if (selectedDisplay && selectedText) {
                    const calendar = new PersianCalendar();
                    const [year, month, day] = persianDate.split('/').map(Number);
                    const monthName = calendar.getMonthName(month);
                    const dayOfWeek = calendar.getDayName((gregorianDate.getDay() + 1) % 7);
                    
                    selectedText.textContent = `${dayOfWeek}، ${day} ${monthName} ${year}`;
                    selectedDisplay.style.display = 'block';
                    
                    // فراخوانی تابع بروزرسانی ساعات خالی
                    if (typeof updateAvailableTimes === 'function') {
                        updateAvailableTimes();
                    }
                }
            }
        });
    }
    
    // راه‌اندازی تقویم برای سایر فیلدهای تاریخ
    initPersianDatePicker('.persian-date-input:not(#appointmentDate)', {
        disablePastDates: false
    });
});

// تابع کمکی برای تبدیل تاریخ شمسی به میلادی برای ارسال به سرور
function convertPersianToGregorian(persianDateString) {
    if (!persianDateString) return null;
    
    const parts = persianDateString.split('/');
    if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);
        
        const gregorian = window.persianCalendar.persianToGregorian(year, month, day);
        return new Date(gregorian[0], gregorian[1] - 1, gregorian[2]);
    }
    return null;
}

// تابع کمکی برای فرمت کردن تاریخ میلادی برای ارسال به سرور
function formatDateForServer(date) {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// بروزرسانی تابع updateAvailableTimes برای استفاده از تاریخ شمسی
function updateAvailableTimes() {
    const dateInput = document.getElementById('appointmentDate');
    const barbershopId = document.getElementById('selectedBarbershopId')?.value;
    const serviceIds = getSelectedServiceIds();
    
    if (!dateInput?.value || !barbershopId || serviceIds.length === 0) {
        return;
    }
    
    // تبدیل تاریخ شمسی به میلادی
    const gregorianDate = convertPersianToGregorian(dateInput.value);
    if (!gregorianDate) {
        console.error('خطا در تبدیل تاریخ شمسی');
        return;
    }
    
    const formattedDate = formatDateForServer(gregorianDate);
    
    // ارسال درخواست به سرور
    fetch(`/Booking/GetAvailableTimes?barbershopId=${barbershopId}&date=${formattedDate}&serviceIds=${serviceIds.join(',')}`)
        .then(response => response.json())
        .then(times => {
            updateTimeSlots(times);
        })
        .catch(error => {
            console.error('خطا در دریافت ساعات خالی:', error);
        });
}

// نمایش پیام‌های فارسی برای تاریخ
function showPersianDateMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type} persian-message`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1050;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// اضافه کردن استایل انیمیشن
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
    
    .persian-message {
        font-family: 'Vazir', 'Tahoma', sans-serif;
        direction: rtl;
        text-align: right;
    }
`;
document.head.appendChild(style);