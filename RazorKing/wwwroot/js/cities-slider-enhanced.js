/**
 * Enhanced Cities Slider with Touch Support and Auto-play
 */

class EnhancedCitiesSlider {
    constructor() {
        this.currentRow = 0;
        this.totalRows = 0;
        this.isTransitioning = false;
        this.autoSlideInterval = null;
        this.autoSlideDelay = 5000; // 5 seconds
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isDragging = false;
        this.isAutoPlaying = false;
        
        this.init();
    }
    
    init() {
        this.sliderTrack = document.getElementById('citiesSliderTrack');
        this.sliderContainer = document.getElementById('citiesSliderContainer');
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
        this.addTouchSupport();
        this.addKeyboardSupport();
        
        // Start auto-play after 3 seconds
        setTimeout(() => {
            if (this.totalRows > 1) {
                this.startAutoSlide();
            }
        }, 3000);
        
        console.log('Enhanced Cities slider initialized with', this.totalRows, 'rows');
    }
    
    calculateRows() {
        const rows = this.sliderTrack.querySelectorAll('.cities-row');
        
        this.totalRows = 0;
        rows.forEach(row => {
            const visibleCities = row.querySelectorAll('.city-slide-item:not(.city-empty-slot)');
            if (visibleCities.length > 0) {
                this.totalRows++;
            }
        });
        
        console.log('Calculated rows with cities:', this.totalRows);
        
        // Hide navigation if only one row
        if (this.totalRows <= 1) {
            if (this.prevBtn) this.prevBtn.style.display = 'none';
            if (this.nextBtn) this.nextBtn.style.display = 'none';
            if (this.dotsContainer) this.dotsContainer.style.display = 'none';
        } else {
            if (this.prevBtn) this.prevBtn.style.display = 'block';
            if (this.nextBtn) this.nextBtn.style.display = 'block';
            if (this.dotsContainer) this.dotsContainer.style.display = 'flex';
        }
        
        // Ensure all city cards are properly displayed with staggered animation
        const allCityCards = document.querySelectorAll('.city-card:not(.city-empty-slot .city-card)');
        allCityCards.forEach((card, index) => {
            card.style.display = 'flex';
            card.style.visibility = 'visible';
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            // Staggered animation
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    bindEvents() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.prevRow();
                this.pauseAutoSlide();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextRow();
                this.pauseAutoSlide();
            });
        }
        
        // Mouse events for auto-play control
        if (this.sliderContainer) {
            this.sliderContainer.addEventListener('mouseenter', () => {
                this.pauseAutoSlide();
            });
            
            this.sliderContainer.addEventListener('mouseleave', () => {
                if (this.totalRows > 1) {
                    this.resumeAutoSlide();
                }
            });
        }
        
        // Bind dot clicks
        if (this.dotsContainer) {
            const dots = this.dotsContainer.querySelectorAll('.cities-dot');
            dots.forEach((dot, index) => {
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.goToRow(index);
                    this.pauseAutoSlide();
                });
            });
        }
        
        // Visibility change event
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoSlide();
            } else if (this.totalRows > 1) {
                this.resumeAutoSlide();
            }
        });
    }
    
    addTouchSupport() {
        if (!this.sliderContainer) return;
        
        // Touch events
        this.sliderContainer.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.isDragging = true;
            this.sliderContainer.classList.add('touch-active');
            this.pauseAutoSlide();
        }, { passive: true });
        
        this.sliderContainer.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            
            this.touchEndX = e.touches[0].clientX;
            const diff = this.touchStartX - this.touchEndX;
            
            // Add visual feedback during drag
            if (Math.abs(diff) > 10) {
                const translateX = -(this.currentRow * 100) - (diff / this.sliderContainer.offsetWidth * 20);
                this.sliderTrack.style.transform = `translateX(${translateX}%)`;
            }
        }, { passive: true });
        
        this.sliderContainer.addEventListener('touchend', (e) => {
            if (!this.isDragging) return;
            
            this.isDragging = false;
            this.sliderContainer.classList.remove('touch-active');
            
            const diff = this.touchStartX - this.touchEndX;
            const threshold = 50; // Minimum swipe distance
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    // Swipe left - next
                    this.nextRow();
                } else {
                    // Swipe right - previous
                    this.prevRow();
                }
            } else {
                // Snap back to current position
                this.updateSlider();
            }
            
            // Resume auto-play after 3 seconds
            setTimeout(() => {
                if (this.totalRows > 1) {
                    this.resumeAutoSlide();
                }
            }, 3000);
        }, { passive: true });
        
        // Mouse drag support for desktop
        let isMouseDown = false;
        let mouseStartX = 0;
        
        this.sliderContainer.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            mouseStartX = e.clientX;
            this.sliderContainer.style.cursor = 'grabbing';
            this.pauseAutoSlide();
            e.preventDefault();
        });
        
        this.sliderContainer.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            
            const diff = mouseStartX - e.clientX;
            if (Math.abs(diff) > 10) {
                const translateX = -(this.currentRow * 100) - (diff / this.sliderContainer.offsetWidth * 20);
                this.sliderTrack.style.transform = `translateX(${translateX}%)`;
            }
        });
        
        this.sliderContainer.addEventListener('mouseup', (e) => {
            if (!isMouseDown) return;
            
            isMouseDown = false;
            this.sliderContainer.style.cursor = 'grab';
            
            const diff = mouseStartX - e.clientX;
            const threshold = 50;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.nextRow();
                } else {
                    this.prevRow();
                }
            } else {
                this.updateSlider();
            }
            
            setTimeout(() => {
                if (this.totalRows > 1) {
                    this.resumeAutoSlide();
                }
            }, 3000);
        });
        
        this.sliderContainer.addEventListener('mouseleave', () => {
            if (isMouseDown) {
                isMouseDown = false;
                this.sliderContainer.style.cursor = 'grab';
                this.updateSlider();
            }
        });
    }
    
    addKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            // Only handle if slider is visible
            if (!this.isSliderVisible()) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevRow();
                    this.pauseAutoSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextRow();
                    this.pauseAutoSlide();
                    break;
                case ' ': // Spacebar
                    e.preventDefault();
                    this.toggleAutoSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToRow(0);
                    this.pauseAutoSlide();
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToRow(this.totalRows - 1);
                    this.pauseAutoSlide();
                    break;
            }
        });
    }
    
    isSliderVisible() {
        if (!this.sliderContainer) return false;
        
        const rect = this.sliderContainer.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }
    
    updateSlider() {
        if (!this.sliderTrack) return;
        
        // Smooth transition
        this.sliderTrack.classList.add('transitioning');
        const translateX = -(this.currentRow * 100);
        this.sliderTrack.style.transform = `translateX(${translateX}%)`;
        
        console.log(`Slider updated: currentRow=${this.currentRow}, totalRows=${this.totalRows}, translateX=${translateX}%`);
        
        // Update dots with animation
        if (this.dotsContainer) {
            const dots = this.dotsContainer.querySelectorAll('.cities-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentRow);
            });
        }
        
        // Update button states with animation
        if (this.prevBtn) {
            this.prevBtn.style.opacity = this.currentRow === 0 ? '0.5' : '1';
            this.prevBtn.style.pointerEvents = this.currentRow === 0 ? 'none' : 'auto';
            this.prevBtn.style.transform = this.currentRow === 0 ? 'translateY(-50%) scale(0.9)' : 'translateY(-50%) scale(1)';
        }
        
        if (this.nextBtn) {
            this.nextBtn.style.opacity = this.currentRow === this.totalRows - 1 ? '0.5' : '1';
            this.nextBtn.style.pointerEvents = this.currentRow === this.totalRows - 1 ? 'none' : 'auto';
            this.nextBtn.style.transform = this.currentRow === this.totalRows - 1 ? 'translateY(-50%) scale(0.9)' : 'translateY(-50%) scale(1)';
        }
        
        // Animate city cards in current row
        this.animateCurrentRowCards();
    }
    
    animateCurrentRowCards() {
        const currentRowElement = this.sliderTrack.children[this.currentRow];
        if (!currentRowElement) return;
        
        const cards = currentRowElement.querySelectorAll('.city-card');
        cards.forEach((card, index) => {
            card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`;
        });
    }
    
    nextRow() {
        if (this.isTransitioning || this.totalRows <= 1 || this.currentRow >= this.totalRows - 1) {
            return;
        }
        
        this.isTransitioning = true;
        this.currentRow++;
        this.updateSlider();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 800);
    }
    
    prevRow() {
        if (this.isTransitioning || this.totalRows <= 1 || this.currentRow <= 0) {
            return;
        }
        
        this.isTransitioning = true;
        this.currentRow--;
        this.updateSlider();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 800);
    }
    
    goToRow(rowIndex) {
        if (this.isTransitioning || rowIndex === this.currentRow || rowIndex < 0 || rowIndex >= this.totalRows) {
            return;
        }
        
        this.isTransitioning = true;
        this.currentRow = rowIndex;
        this.updateSlider();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 800);
    }
    
    startAutoSlide() {
        if (this.totalRows <= 1 || this.isAutoPlaying) return;
        
        this.isAutoPlaying = true;
        if (this.sliderContainer) {
            this.sliderContainer.classList.add('auto-playing');
        }
        
        this.autoSlideInterval = setInterval(() => {
            if (this.currentRow >= this.totalRows - 1) {
                this.goToRow(0); // Loop back to first
            } else {
                this.nextRow();
            }
        }, this.autoSlideDelay);
        
        console.log('Auto-slide started');
    }
    
    pauseAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
        
        this.isAutoPlaying = false;
        if (this.sliderContainer) {
            this.sliderContainer.classList.remove('auto-playing');
        }
        
        console.log('Auto-slide paused');
    }
    
    resumeAutoSlide() {
        if (!this.isAutoPlaying && this.totalRows > 1) {
            setTimeout(() => {
                this.startAutoSlide();
            }, 2000); // Resume after 2 seconds
        }
    }
    
    toggleAutoSlide() {
        if (this.isAutoPlaying) {
            this.pauseAutoSlide();
        } else {
            this.startAutoSlide();
        }
    }
    
    destroy() {
        this.pauseAutoSlide();
        
        // Remove event listeners
        if (this.prevBtn) {
            this.prevBtn.removeEventListener('click', this.prevRow);
        }
        if (this.nextBtn) {
            this.nextBtn.removeEventListener('click', this.nextRow);
        }
        
        console.log('Enhanced Cities slider destroyed');
    }
}

// Global function for dot clicks (backward compatibility)
function goToCityRow(rowIndex) {
    if (window.enhancedCitiesSlider) {
        window.enhancedCitiesSlider.goToRow(rowIndex);
    }
}

// Initialize enhanced slider when DOM is ready
function initializeEnhancedCitySlider() {
    console.log('🏙️ Initializing Enhanced City Slider...');
    
    const cityOptions = document.querySelectorAll('.city-option, .city-card');
    console.log(`🧪 Found ${cityOptions.length} city elements`);
    
    if (cityOptions.length === 0) {
        console.error('❌ No city elements found for slider!');
        return;
    }
    
    // Ensure all city cards are visible and properly styled
    cityOptions.forEach((city, index) => {
        city.style.cursor = 'pointer';
        city.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Add hover effects
        city.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        city.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
    
    // Create enhanced slider instance
    console.log('🔧 Creating Enhanced Cities Slider instance...');
    window.enhancedCitiesSlider = new EnhancedCitiesSlider();
    
    if (window.enhancedCitiesSlider) {
        console.log('✅ Enhanced Cities Slider created successfully');
    } else {
        console.error('❌ Failed to create Enhanced Cities Slider');
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other scripts to load
    setTimeout(initializeEnhancedCitySlider, 1000);
});

// Make functions globally available
window.goToCityRow = goToCityRow;
window.initializeEnhancedCitySlider = initializeEnhancedCitySlider;
window.EnhancedCitiesSlider = EnhancedCitiesSlider;

console.log('✅ Enhanced Cities Slider script loaded');