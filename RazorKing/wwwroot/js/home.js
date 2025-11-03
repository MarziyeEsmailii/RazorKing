/**
 * Home Page JavaScript
 * ریزر کینگ - صفحه اصلی
 */

// Helper function to get barbershop image based on ID
function getBarbershopImage(barbershopId) {
    const barbershopImages = [
        'unrecognizable-barber-cutting-hair-man',
        'young-man-barbershop-trimming-hair',
        'handsome-man-cutting-beard-barber-salon',
        'great-time-barbershop-cheerful-young-bearded-man-getting-haircut-by-hairdresser-while-sitting-chair-barbershop',
        'client-doing-hair-cut-barber-shop-salon (1)',
        'client-doing-hair-cut-barber-shop-salon',
        'handsome-man-barber-shop-styling-hair'
    ];
    
    const imageIndex = Math.abs(barbershopId) % barbershopImages.length;
    return `/img/${barbershopImages[imageIndex]}.jpg`;
}

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
        
        if (!this.sliderTrack) {
            console.log('Cities slider track not found');
            return;
        }
        
        this.calculateRows();
        this.bindEvents();
        this.updateSlider();
        
        // Auto slide disabled for better user control
        // if (this.totalRows > 1) {
        //     this.startAutoSlide();
        // }
        
        console.log('Cities slider initialized with', this.totalRows, 'rows');
    }
    
    calculateRows() {
        const rows = this.sliderTrack.querySelectorAll('.cities-row');
        
        // Count only rows that have visible cities
        this.totalRows = 0;
        rows.forEach(row => {
            const visibleCities = row.querySelectorAll('.city-slide-item:not(.city-empty-slot)');
            if (visibleCities.length > 0) {
                this.totalRows++;
            }
        });
        
        console.log('Calculated rows with cities:', this.totalRows, 'Total DOM rows:', rows.length);
        
        // Hide navigation if only one row or no rows
        if (this.totalRows <= 1) {
            if (this.prevBtn) this.prevBtn.style.display = 'none';
            if (this.nextBtn) this.nextBtn.style.display = 'none';
            if (this.dotsContainer) this.dotsContainer.style.display = 'none';
        } else {
            if (this.prevBtn) this.prevBtn.style.display = 'block';
            if (this.nextBtn) this.nextBtn.style.display = 'block';
            if (this.dotsContainer) this.dotsContainer.style.display = 'flex';
        }
        
        // Ensure all city cards are properly displayed
        const allCityCards = document.querySelectorAll('.city-card:not(.city-empty-slot .city-card)');
        allCityCards.forEach(card => {
            card.style.display = 'flex';
            card.style.visibility = 'visible';
            card.style.opacity = '1';
        });
    }
    
    bindEvents() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.prevRow();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextRow();
            });
        }
        
        // Auto slide disabled - manual navigation only
        // const container = document.getElementById('citiesSliderContainer');
        // if (container) {
        //     container.addEventListener('mouseenter', () => this.stopAutoSlide());
        //     container.addEventListener('mouseleave', () => {
        //         if (this.totalRows > 1) {
        //             this.startAutoSlide();
        //         }
        //     });
        // }
        
        // Bind dot clicks
        if (this.dotsContainer) {
            const dots = this.dotsContainer.querySelectorAll('.cities-dot');
            dots.forEach((dot, index) => {
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.goToRow(index);
                });
            });
        }
    }
    
    updateSlider() {
        if (!this.sliderTrack) return;
        
        // Use percentage-based translation for better responsiveness
        const translateX = -(this.currentRow * 100);
        this.sliderTrack.style.transform = `translateX(${translateX}%)`;
        
        console.log(`Slider updated: currentRow=${this.currentRow}, totalRows=${this.totalRows}, translateX=${translateX}%`);
        
        // Update dots
        if (this.dotsContainer) {
            const dots = this.dotsContainer.querySelectorAll('.cities-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentRow);
            });
        }
        
        // Update button states
        if (this.prevBtn) {
            this.prevBtn.style.opacity = this.currentRow === 0 ? '0.5' : '1';
            this.prevBtn.style.pointerEvents = this.currentRow === 0 ? 'none' : 'auto';
        }
        
        if (this.nextBtn) {
            this.nextBtn.style.opacity = this.currentRow === this.totalRows - 1 ? '0.5' : '1';
            this.nextBtn.style.pointerEvents = this.currentRow === this.totalRows - 1 ? 'none' : 'auto';
        }
    }
    
    nextRow() {
        if (this.isTransitioning || this.totalRows <= 1 || this.currentRow >= this.totalRows - 1) return;
        
        this.isTransitioning = true;
        this.currentRow++;
        this.updateSlider();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }
    
    prevRow() {
        if (this.isTransitioning || this.totalRows <= 1 || this.currentRow <= 0) return;
        
        this.isTransitioning = true;
        this.currentRow--;
        this.updateSlider();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }
    
    goToRow(rowIndex) {
        if (this.isTransitioning || rowIndex === this.currentRow || rowIndex < 0 || rowIndex >= this.totalRows) return;
        
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
        }, 5000); // 5 seconds
    }
    
    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
}

// Global function for dot clicks
function goToCityRow(rowIndex) {
    if (window.citiesSlider) {
        window.citiesSlider.goToRow(rowIndex);
    }
}

// City Modal Functions
function showCityModal(cityId, cityName) {
    // Redirect to city page instead of showing modal
    const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content') || '';
    window.location.href = `${baseUrl}/Home/City/${cityId}`;
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

// Initialize Cities Slider
function initializeCityCards() {
    console.log('Initializing city cards...');
    
    // Ensure all city cards are visible first
    const cityCards = document.querySelectorAll('.city-card');
    console.log('Found', cityCards.length, 'city cards');
    
    cityCards.forEach((card, index) => {
        // Make sure cards are visible
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.style.display = 'flex';
        card.style.visibility = 'visible';
        
        // Add staggered entrance animation
        card.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.1}s`;
    });
    
    // Initialize slider immediately
    console.log('Creating CitiesSlider instance...');
    window.citiesSlider = new CitiesSlider();
    
    // Debug: Check if slider was created successfully
    if (window.citiesSlider) {
        console.log('CitiesSlider created successfully');
    } else {
        console.error('Failed to create CitiesSlider');
    }
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('Home page loaded');
    
    // Initialize statistics counter
    const statsContainer = document.querySelector('.hero-stats');
    if (statsContainer) {
        console.log('Stats container found');
        observer.observe(statsContainer);
        
        // Load real-time stats from API
        loadRealTimeStats();
        
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
    
    // Initialize city cards and slider
    initializeCityCards();
});

// Load real-time statistics
async function loadRealTimeStats() {
    try {
        console.log('🔄 Loading real-time stats...');
        
        const response = await fetch('/Home/TestData');
        const data = await response.json();
        
        if (data.success && data.data) {
            console.log('📊 Real-time stats loaded:', data.data);
            
            // Update stat numbers
            const totalCitiesEl = document.getElementById('totalCities');
            const totalBarbershopsEl = document.getElementById('totalBarbershops');
            const totalCustomersEl = document.getElementById('totalCustomers');
            
            if (totalCitiesEl) {
                totalCitiesEl.setAttribute('data-count', data.data.citiesCount);
                totalCitiesEl.textContent = data.data.citiesCount;
                console.log('✅ Cities updated:', data.data.citiesCount);
            }
            
            if (totalBarbershopsEl) {
                totalBarbershopsEl.setAttribute('data-count', data.data.barbershopsCount);
                totalBarbershopsEl.textContent = data.data.barbershopsCount;
                console.log('✅ Barbershops updated:', data.data.barbershopsCount);
            }
            
            if (totalCustomersEl) {
                // Use appointments count as customers if no real customers
                const customersCount = data.data.appointmentsCount || 0;
                totalCustomersEl.setAttribute('data-count', customersCount);
                totalCustomersEl.textContent = customersCount;
                console.log('✅ Customers updated:', customersCount);
            }
            
            // Trigger animations after updating data
            setTimeout(() => {
                const statNumbers = document.querySelectorAll('.stat-number');
                statNumbers.forEach(statNumber => {
                    const target = parseInt(statNumber.getAttribute('data-count'));
                    if (target > 0) {
                        animateCounter(statNumber, target);
                    }
                });
            }, 500);
            
        } else {
            console.log('⚠️ No stats data received');
        }
    } catch (error) {
        console.error('❌ Error loading real-time stats:', error);
    }
}

// Make functions globally available
window.quickBooking = quickBooking;
window.showCityModal = showCityModal;
window.goToCityRow = goToCityRow;
window.loadRealTimeStats = loadRealTimeStats;