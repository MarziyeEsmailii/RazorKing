/**
 * City Page JavaScript
 * ریزر کینگ - اسکریپت صفحه شهر
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

document.addEventListener('DOMContentLoaded', function() {
    initializeCityPage();
});

function initializeCityPage() {
    // Initialize filters
    initializeFilters();
    
    // Initialize search
    initializeSearch();
    
    // Ensure images load properly
    ensureImagesLoad();
    
    // Animate cards on load
    animateCards();
}

function initializeFilters() {
    const priceFilter = document.getElementById('priceFilter');
    const serviceFilter = document.getElementById('serviceFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters);
    }
    
    if (serviceFilter) {
        serviceFilter.addEventListener('change', applyFilters);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }
}

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applyFilters();
            }, 300);
        });
    }
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const priceRange = document.getElementById('priceFilter')?.value || '';
    const serviceFilter = document.getElementById('serviceFilter')?.value || '';
    const sortBy = document.getElementById('sortFilter')?.value || 'name';
    
    const barbershopCards = Array.from(document.querySelectorAll('.barbershop-card'));
    
    // Filter cards
    const filteredCards = barbershopCards.filter(card => {
        // Search filter
        const name = card.querySelector('.barbershop-name')?.textContent.toLowerCase() || '';
        const address = card.querySelector('.barbershop-address')?.textContent.toLowerCase() || '';
        
        const matchesSearch = !searchTerm || name.includes(searchTerm) || address.includes(searchTerm);
        
        // Price filter
        let matchesPrice = true;
        if (priceRange) {
            const priceText = card.querySelector('.price-range span')?.textContent || '';
            const prices = priceText.match(/\d+/g);
            
            if (prices && prices.length >= 2) {
                const minPrice = parseInt(prices[0].replace(/,/g, ''));
                const maxPrice = parseInt(prices[1].replace(/,/g, ''));
                
                switch (priceRange) {
                    case '0-50000':
                        matchesPrice = minPrice < 50000;
                        break;
                    case '50000-100000':
                        matchesPrice = minPrice >= 50000 && maxPrice <= 100000;
                        break;
                    case '100000-200000':
                        matchesPrice = minPrice >= 100000 && maxPrice <= 200000;
                        break;
                    case '200000+':
                        matchesPrice = minPrice >= 200000;
                        break;
                }
            }
        }
        
        // Service filter
        let matchesService = true;
        if (serviceFilter) {
            const serviceTags = card.querySelectorAll('.service-tag');
            matchesService = Array.from(serviceTags).some(tag => 
                tag.textContent.toLowerCase().includes(serviceFilter.toLowerCase())
            );
        }
        
        return matchesSearch && matchesPrice && matchesService;
    });
    
    // Sort cards
    filteredCards.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                const nameA = a.querySelector('.barbershop-name')?.textContent || '';
                const nameB = b.querySelector('.barbershop-name')?.textContent || '';
                return nameA.localeCompare(nameB, 'fa');
                
            case 'price-low':
                const priceA = getPriceFromCard(a);
                const priceB = getPriceFromCard(b);
                return priceA - priceB;
                
            case 'price-high':
                const priceA2 = getPriceFromCard(a);
                const priceB2 = getPriceFromCard(b);
                return priceB2 - priceA2;
                
            case 'services':
                const servicesA = a.querySelectorAll('.service-tag').length;
                const servicesB = b.querySelectorAll('.service-tag').length;
                return servicesB - servicesA;
                
            default:
                return 0;
        }
    });
    
    // Hide all cards first
    barbershopCards.forEach(card => {
        card.style.display = 'none';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
    });
    
    // Show filtered cards with animation
    const grid = document.getElementById('barbershopsGrid');
    if (grid) {
        // Clear grid
        grid.innerHTML = '';
        
        // Add filtered cards
        filteredCards.forEach((card, index) => {
            card.style.display = 'block';
            grid.appendChild(card);
            
            // Animate in
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        // Show empty state if no results
        if (filteredCards.length === 0) {
            showEmptyState(grid);
        }
        
        // Update results count
        updateResultsCount(filteredCards.length);
    }
}

function getPriceFromCard(card) {
    const priceText = card.querySelector('.price-range span')?.textContent || '';
    const prices = priceText.match(/\d+/g);
    
    if (prices && prices.length > 0) {
        return parseInt(prices[0].replace(/,/g, ''));
    }
    
    return 0;
}

function showEmptyState(container) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
        <i class="fas fa-search fa-3x"></i>
        <h3>نتیجه‌ای یافت نشد</h3>
        <p>با فیلترهای انتخاب شده آرایشگاهی پیدا نشد</p>
        <button class="btn btn-gold" onclick="clearFilters()">
            <i class="fas fa-times"></i>
            پاک کردن فیلترها
        </button>
    `;
    
    container.appendChild(emptyState);
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        const countNumber = resultsCount.querySelector('.count-number');
        const countText = resultsCount.querySelector('.count-text');
        
        if (countNumber) {
            countNumber.textContent = count.toLocaleString('fa-IR');
        }
        
        if (countText) {
            countText.textContent = count === 1 ? 'آرایشگاه یافت شد' : 'آرایشگاه یافت شد';
        }
    }
}

function clearFilters() {
    // Clear all filters
    const searchInput = document.getElementById('searchInput');
    const priceFilter = document.getElementById('priceFilter');
    const serviceFilter = document.getElementById('serviceFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (searchInput) searchInput.value = '';
    if (priceFilter) priceFilter.value = '';
    if (serviceFilter) serviceFilter.value = '';
    if (sortFilter) sortFilter.value = 'name';
    
    // Reapply filters (which will show all cards)
    applyFilters();
}

function animateCards() {
    const cards = document.querySelectorAll('.barbershop-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });
}

// Barbershop details modal
async function showBarbershopDetails(barbershopId) {
    const modal = new bootstrap.Modal(document.getElementById('barbershopModal'));
    
    // Show loading
    document.getElementById('barbershopDetailsLoading').classList.remove('d-none');
    document.getElementById('barbershopDetailsContent').classList.add('d-none');
    
    // Store barbershop ID for booking
    document.getElementById('bookNowBtn').setAttribute('data-barbershop-id', barbershopId);
    
    modal.show();
    
    try {
        const response = await fetch(`/Home/GetBarbershopDetails?barbershopId=${barbershopId}`);
        const barbershop = await response.json();
        
        if (barbershop) {
            displayBarbershopDetails(barbershop);
        } else {
            showBarbershopError();
        }
    } catch (error) {
        console.error('Error loading barbershop details:', error);
        showBarbershopError();
    }
}

function displayBarbershopDetails(barbershop) {
    const content = document.getElementById('barbershopDetailsContent');
    
    // Parse working days
    const workingDays = barbershop.workingDays ? barbershop.workingDays.split(',') : [];
    
    content.innerHTML = `
        <div class="barbershop-details">
            <div class="barbershop-header">
                <img src="${barbershop.imageUrl || getBarbershopImage(barbershop.id)}" 
                     alt="${barbershop.name}" 
                     class="barbershop-image-large"
                     onerror="this.src='/img/background.webp'">
                <h4 class="barbershop-name-large">${barbershop.name}</h4>
                ${barbershop.description ? `<p class="barbershop-description">${barbershop.description}</p>` : ''}
            </div>
            
            <div class="barbershop-info-grid">
                <div class="info-section">
                    <h6>
                        <i class="fas fa-info-circle"></i>
                        اطلاعات تماس
                    </h6>
                    <div class="info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${barbershop.address}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-phone"></i>
                        <span>${barbershop.phone}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-city"></i>
                        <span>${barbershop.cityName}</span>
                    </div>
                </div>
                
                <div class="info-section">
                    <h6>
                        <i class="fas fa-clock"></i>
                        ساعات کاری
                    </h6>
                    <div class="info-item">
                        <i class="fas fa-sun"></i>
                        <span>شروع: ${formatTime(barbershop.openTime)}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-moon"></i>
                        <span>پایان: ${formatTime(barbershop.closeTime)}</span>
                    </div>
                    <div class="working-days">
                        ${workingDays.map(day => `<span class="day-badge">${day.trim()}</span>`).join('')}
                    </div>
                </div>
            </div>
            
            ${barbershop.services && barbershop.services.length > 0 ? `
                <div class="info-section">
                    <h6>
                        <i class="fas fa-scissors"></i>
                        خدمات ارائه شده
                    </h6>
                    <div class="services-grid">
                        ${barbershop.services.map(service => `
                            <div class="service-item">
                                <div class="service-name">${service.name}</div>
                                <div class="service-price">${formatCurrency(service.price)}</div>
                                ${service.duration ? `<div class="service-duration">${service.duration} دقیقه</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Hide loading and show content
    document.getElementById('barbershopDetailsLoading').classList.add('d-none');
    document.getElementById('barbershopDetailsContent').classList.remove('d-none');
}

function showBarbershopError() {
    const content = document.getElementById('barbershopDetailsContent');
    content.innerHTML = `
        <div class="text-center py-5">
            <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
            <h5 class="text-muted">خطا در بارگذاری اطلاعات</h5>
            <p class="text-muted">لطفاً دوباره تلاش کنید</p>
        </div>
    `;
    
    document.getElementById('barbershopDetailsLoading').classList.add('d-none');
    document.getElementById('barbershopDetailsContent').classList.remove('d-none');
}

// Booking redirect function
function bookAppointment(barbershopId) {
    window.location.href = `/Booking?barbershopId=${barbershopId}`;
}

// Format time helper
function formatTime(timeString) {
    if (!timeString) return '';
    
    try {
        const time = new Date(`2000-01-01T${timeString}`);
        return time.toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return timeString;
    }
}

// Format currency helper
function formatCurrency(amount) {
    if (!amount) return '';
    
    return new Intl.NumberFormat('fa-IR', {
        style: 'currency',
        currency: 'IRR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Initialize booking button
document.addEventListener('DOMContentLoaded', function() {
    const bookNowBtn = document.getElementById('bookNowBtn');
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', function() {
            const barbershopId = this.getAttribute('data-barbershop-id');
            if (barbershopId) {
                bookAppointment(barbershopId);
            }
        });
    }
});

// Export functions for global access
window.CityPage = {
    applyFilters,
    clearFilters,
    bookAppointment,
    showBarbershopDetails
};

// Make showBarbershopDetails globally available
window.showBarbershopDetails = showBarbershopDetails;

// Ensure barbershop images load properly
function ensureImagesLoad() {
    const barbershopImages = document.querySelectorAll('.barbershop-image img');
    
    barbershopImages.forEach((img, index) => {
        // Add loaded class when image loads
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
        
        // If image is already loaded
        if (img.complete) {
            img.classList.add('loaded');
        }
        
        // Fallback: ensure image is visible after a short delay
        setTimeout(() => {
            img.style.opacity = '1';
            img.style.visibility = 'visible';
            img.style.display = 'block';
        }, index * 100);
    });
    
    console.log('Initialized', barbershopImages.length, 'barbershop images');
}