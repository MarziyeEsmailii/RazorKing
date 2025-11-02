/**
 * Home Page JavaScript
 * ریزر کینگ - صفحه اصلی
 */

// Counter Animation
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString('fa-IR');
    }, 16);
}

// Intersection Observer for triggering animations
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(statNumber => {
                const target = parseInt(statNumber.getAttribute('data-count'));
                animateCounter(statNumber, target);
            });
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Quick booking functionality
function quickBooking() {
    const citySelect = document.getElementById('quickCitySelect');
    const selectedCity = citySelect.value;
    
    if (selectedCity) {
        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content') || '';
        window.location.href = `${baseUrl}/Booking?cityId=${selectedCity}`;
    } else {
        alert('لطفاً ابتدا شهر خود را انتخاب کنید');
    }
}

// Cities Slider - 4 Per Row
class CitiesSlider {
    constructor() {
        this.currentRow = 0;
        this.totalRows = 0;
        this.isTransitioning = false;
        this.autoSlideInterval = null;
        
        this.init();
    }
    
    init() {
        this.sliderTrack = document.getElementById('citiesSliderTrack');
        this.prevBtn = document.getElementById('citiesPrevBtn');
        this.nextBtn = document.getElementById('citiesNextBtn');
        this.dotsContainer = document.getElementById('citiesDotsContainer');
        
        if (!this.sliderTrack) return;
        
        this.calculateRows();
        this.bindEvents();
        this.startAutoSlide();
    }
    
    calculateRows() {
        const rows = this.sliderTrack.querySelectorAll('.cities-row');
        this.totalRows = rows.length;
        
        // Hide navigation if only one row
        if (this.totalRows <= 1) {
            if (this.prevBtn) this.prevBtn.style.display = 'none';
            if (this.nextBtn) this.nextBtn.style.display = 'none';
            if (this.dotsContainer) this.dotsContainer.style.display = 'none';
        }
    }
    
    bindEvents() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevRow());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextRow());
        }
        
        // Pause on hover
        const container = document.getElementById('citiesSliderContainer');
        if (container) {
            container.addEventListener('mouseenter', () => this.stopAutoSlide());
            container.addEventListener('mouseleave', () => this.startAutoSlide());
        }
    }
    
    updateSlider() {
        if (this.isTransitioning) return;
        
        const translateX = -(this.currentRow * 100);
        this.sliderTrack.style.transform = `translateX(${translateX}%)`;
        
        // Update dots
        const dots = this.dotsContainer.querySelectorAll('.cities-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentRow);
        });
    }
    
    nextRow() {
        if (this.isTransitioning || this.totalRows <= 1) return;
        
        this.isTransitioning = true;
        this.currentRow = (this.currentRow + 1) % this.totalRows;
        this.updateSlider();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }
    
    prevRow() {
        if (this.isTransitioning || this.totalRows <= 1) return;
        
        this.isTransitioning = true;
        this.currentRow = this.currentRow === 0 ? this.totalRows - 1 : this.currentRow - 1;
        this.updateSlider();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }
    
    goToRow(rowIndex) {
        if (this.isTransitioning || rowIndex === this.currentRow) return;
        
        this.isTransitioning = true;
        this.currentRow = rowIndex;
        this.updateSlider();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }
    
    startAutoSlide() {
        if (this.totalRows <= 1) return;
        
        this.stopAutoSlide();
        this.autoSlideInterval = setInterval(() => {
            this.nextRow();
        }, 6000);
    }
    
    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
}

// City Modal Functions
function showCityModal(cityId, cityName) {
    const modal = new bootstrap.Modal(document.getElementById('cityModal'));
    document.getElementById('cityModalTitle').textContent = `آرایشگاه‌های ${cityName}`;
    
    // Show loading
    document.getElementById('cityBarbershopsLoading').classList.remove('d-none');
    document.getElementById('cityBarbershopsContent').classList.add('d-none');
    document.getElementById('cityBarbershopsEmpty').classList.add('d-none');
    
    modal.show();
    
    // Load barbershops
    loadCityBarbershops(cityId);
}

async function loadCityBarbershops(cityId) {
    try {
        const response = await fetch(`/Home/GetCityBarbershops?cityId=${cityId}`);
        const data = await response.json();
        
        // Hide loading
        document.getElementById('cityBarbershopsLoading').classList.add('d-none');
        
        if (data && data.length > 0) {
            displayBarbershops(data);
            document.getElementById('cityBarbershopsContent').classList.remove('d-none');
        } else {
            document.getElementById('cityBarbershopsEmpty').classList.remove('d-none');
        }
    } catch (error) {
        console.error('Error loading barbershops:', error);
        document.getElementById('cityBarbershopsLoading').classList.add('d-none');
        document.getElementById('cityBarbershopsEmpty').classList.remove('d-none');
    }
}

function displayBarbershops(barbershops) {
    const grid = document.getElementById('barbershopsGrid');
    grid.innerHTML = '';
    
    barbershops.forEach(barbershop => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        
        col.innerHTML = `
            <div class="barbershop-card">
                <h5 class="barbershop-name">
                    <i class="fas fa-store text-gold me-2"></i>
                    ${barbershop.name}
                </h5>
                <div class="barbershop-address">
                    <i class="fas fa-map-marker-alt text-gold"></i>
                    ${barbershop.address}
                </div>
                <div class="barbershop-services">
                    ${barbershop.services.map(service => 
                        `<span class="service-tag">${service.name} - ${service.price.toLocaleString('fa-IR')} تومان</span>`
                    ).join('')}
                </div>
                <div class="barbershop-actions">
                    <a href="/Booking?barbershopId=${barbershop.id}" class="btn-book-now">
                        <i class="fas fa-calendar-plus"></i>
                        رزرو نوبت
                    </a>
                    <span class="text-muted">
                        <i class="fas fa-phone text-gold"></i>
                        ${barbershop.phone}
                    </span>
                </div>
            </div>
        `;
        
        grid.appendChild(col);
    });
}

function goToCityRow(rowIndex) {
    if (window.citiesSlider) {
        window.citiesSlider.goToRow(rowIndex);
    }
}

// Initialize Cities Slider
function initializeCityCards() {
    window.citiesSlider = new CitiesSlider();
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('Home page loaded');
    
    // Initialize statistics counter immediately
    const statsContainer = document.querySelector('.hero-stats');
    if (statsContainer) {
        console.log('Stats container found');
        observer.observe(statsContainer);
        
        // Also trigger animation immediately for testing
        setTimeout(() => {
            const statNumbers = statsContainer.querySelectorAll('.stat-number');
            statNumbers.forEach(statNumber => {
                const target = parseInt(statNumber.getAttribute('data-count'));
                console.log('Animating stat:', target);
                if (target > 0) {
                    animateCounter(statNumber, target);
                }
            });
        }, 1000);
    } else {
        console.log('Stats container not found');
    }
    
    // Add pulse animation to stat items
    const statItems = document.querySelectorAll('.stat-item');
    console.log('Found stat items:', statItems.length);
    statItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.animation = 'fadeInUp 0.6s ease forwards';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Initialize city cards animation
    initializeCityCards();
});

// Make functions globally available
window.quickBooking = quickBooking;
window.showCityModal = showCityModal;
window.goToCityRow = goToCityRow;// Ci
ty modal functionality
function showCityModal(cityId, cityName) {
    // Redirect to city page instead of showing modal
    const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content') || '';
    window.location.href = `${baseUrl}/Home/City/${cityId}`;
}

// City navigation functions
function goToCityRow(rowIndex) {
    const track = document.getElementById('citiesSliderTrack');
    if (track) {
        const rowHeight = 300; // Approximate height of each row
        track.style.transform = `translateY(-${rowIndex * rowHeight}px)`;
        
        // Update dots
        const dots = document.querySelectorAll('.cities-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === rowIndex);
        });
    }
}

// Cities slider navigation
function initializeCitiesSlider() {
    const prevBtn = document.getElementById('citiesPrevBtn');
    const nextBtn = document.getElementById('citiesNextBtn');
    const track = document.getElementById('citiesSliderTrack');
    const dots = document.querySelectorAll('.cities-dot');
    
    let currentRow = 0;
    const totalRows = dots.length;
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentRow > 0) {
                currentRow--;
                goToCityRow(currentRow);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentRow < totalRows - 1) {
                currentRow++;
                goToCityRow(currentRow);
            }
        });
    }
}