// تقویم شمسی جاوا اسکریپت
class PersianCalendar {
    constructor() {
        this.monthNames = [
            'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
            'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ];
        
        this.dayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
        this.fullDayNames = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    }

    // تبدیل تاریخ میلادی به شمسی
    gregorianToPersian(gYear, gMonth, gDay) {
        const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        
        if (gMonth > 2) {
            const gy2 = (gYear + 1);
            const days = 365 * gYear + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + 
                        Math.floor((gy2 + 399) / 400) - 80 + gDay + g_d_m[gMonth - 1];
        } else {
            const days = 365 * gYear + Math.floor((gYear + 3) / 4) - Math.floor((gYear + 99) / 100) + 
                        Math.floor((gYear + 399) / 400) - 80 + gDay + g_d_m[gMonth - 1];
        }
        
        let jYear = -14;
        let jMonth, jDay;
        
        const days2 = days - 79;
        const cycleYear = Math.floor(days2 / 1029983);
        const cyear = days2 % 1029983;
        
        if (cyear < 366) {
            jYear = 0;
            jMonth = 1;
            jDay = cyear + 1;
        } else {
            jYear = Math.floor((cyear - 366) / 365) + 1;
            const yday = (cyear - 366) % 365;
            
            if (yday < 186) {
                jMonth = 1 + Math.floor(yday / 31);
                jDay = 1 + (yday % 31);
            } else {
                jMonth = 7 + Math.floor((yday - 186) / 30);
                jDay = 1 + ((yday - 186) % 30);
            }
        }
        
        jYear += (cycleYear * 2816) + 1370;
        
        return [jYear, jMonth, jDay];
    }

    // تبدیل تاریخ شمسی به میلادی
    persianToGregorian(jYear, jMonth, jDay) {
        const epYear = jYear - 979;
        const epBase = 365 * epYear + Math.floor(epYear / 33) * 8 + 
                      Math.floor(((epYear % 33) + 3) / 4);
        
        let auxMonth;
        if (jMonth < 7) {
            auxMonth = (jMonth - 1) * 31;
        } else {
            auxMonth = (jMonth - 7) * 30 + 186;
        }
        
        const auxDay = auxMonth + jDay;
        const julianDay = auxDay + epBase + 1948321;
        
        const a = julianDay + 32044;
        const b = Math.floor((4 * a + 3) / 146097);
        const c = a - Math.floor((b * 146097) / 4);
        const d = Math.floor((4 * c + 3) / 1461);
        const e = c - Math.floor((1461 * d) / 4);
        const m = Math.floor((5 * e + 2) / 153);
        
        const gDay = e - Math.floor((153 * m + 2) / 5) + 1;
        const gMonth = m + 3 - 12 * Math.floor(m / 10);
        const gYear = b * 100 + d - 4800 + Math.floor(m / 10);
        
        return [gYear, gMonth, gDay];
    }

    // دریافت تاریخ امروز به شمسی
    getTodayPersian() {
        const today = new Date();
        return this.gregorianToPersian(today.getFullYear(), today.getMonth() + 1, today.getDate());
    }

    // فرمت کردن تاریخ شمسی
    formatPersianDate(year, month, day) {
        return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
    }

    // دریافت نام ماه شمسی
    getMonthName(month) {
        return this.monthNames[month - 1] || '';
    }

    // دریافت نام روز هفته
    getDayName(dayIndex) {
        return this.dayNames[dayIndex] || '';
    }

    // بررسی کبیسه بودن سال شمسی
    isLeapYear(year) {
        const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
        
        let jp = breaks[0];
        let jump = 0;
        for (let j = 1; j <= 19; j++) {
            const jm = breaks[j];
            jump = jm - jp;
            if (year < jm) break;
            jp = jm;
        }
        
        let n = year - jp;
        if (n < jump) {
            if (jump - n < 6) n = n - jump + ((jump + 4) / 6) * 6;
            let leap = ((n + 1) % 33) % 4;
            if (jump == 33 && leap == 1) leap = 0;
            return leap == 1;
        } else {
            return false;
        }
    }

    // دریافت تعداد روزهای ماه
    getMonthDays(year, month) {
        if (month <= 6) return 31;
        if (month <= 11) return 30;
        return this.isLeapYear(year) ? 30 : 29;
    }

    // ایجاد تقویم ماهانه
    generateMonthCalendar(year, month) {
        const daysInMonth = this.getMonthDays(year, month);
        const firstDayGregorian = this.persianToGregorian(year, month, 1);
        const firstDay = new Date(firstDayGregorian[0], firstDayGregorian[1] - 1, firstDayGregorian[2]);
        
        // تنظیم روز شروع هفته (شنبه = 0)
        let startDay = (firstDay.getDay() + 1) % 7;
        
        const calendar = [];
        let week = [];
        
        // اضافه کردن روزهای خالی ابتدای ماه
        for (let i = 0; i < startDay; i++) {
            week.push(null);
        }
        
        // اضافه کردن روزهای ماه
        for (let day = 1; day <= daysInMonth; day++) {
            week.push(day);
            
            if (week.length === 7) {
                calendar.push(week);
                week = [];
            }
        }
        
        // اضافه کردن روزهای خالی انتهای ماه
        while (week.length < 7 && week.length > 0) {
            week.push(null);
        }
        
        if (week.length > 0) {
            calendar.push(week);
        }
        
        return calendar;
    }

    // تبدیل رشته تاریخ شمسی به Date object
    parsePersianDate(dateString) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            const day = parseInt(parts[2]);
            
            const gregorian = this.persianToGregorian(year, month, day);
            return new Date(gregorian[0], gregorian[1] - 1, gregorian[2]);
        }
        return null;
    }

    // مقایسه دو تاریخ شمسی
    comparePersianDates(date1, date2) {
        const [y1, m1, d1] = date1;
        const [y2, m2, d2] = date2;
        
        if (y1 !== y2) return y1 - y2;
        if (m1 !== m2) return m1 - m2;
        return d1 - d2;
    }

    // بررسی اینکه آیا تاریخ در گذشته است
    isPastDate(year, month, day) {
        const today = this.getTodayPersian();
        return this.comparePersianDates([year, month, day], today) < 0;
    }

    // بررسی اینکه آیا تاریخ امروز است
    isToday(year, month, day) {
        const today = this.getTodayPersian();
        return this.comparePersianDates([year, month, day], today) === 0;
    }
}

// ایجاد نمونه سراسری
window.persianCalendar = new PersianCalendar();

// کامپوننت Date Picker شمسی
class PersianDatePicker {
    constructor(inputElement, options = {}) {
        this.input = inputElement;
        this.options = {
            minDate: options.minDate || null,
            maxDate: options.maxDate || null,
            disablePastDates: options.disablePastDates || false,
            onSelect: options.onSelect || null,
            ...options
        };
        
        this.calendar = new PersianCalendar();
        this.currentDate = this.calendar.getTodayPersian();
        this.selectedDate = null;
        
        this.init();
    }

    init() {
        this.createCalendarContainer();
        this.bindEvents();
        this.updateCalendar();
    }

    createCalendarContainer() {
        this.container = document.createElement('div');
        this.container.className = 'persian-datepicker';
        this.container.innerHTML = `
            <div class="datepicker-header">
                <button type="button" class="prev-month">&lt;</button>
                <span class="current-month"></span>
                <button type="button" class="next-month">&gt;</button>
            </div>
            <div class="datepicker-weekdays">
                ${this.calendar.dayNames.map(day => `<div class="weekday">${day}</div>`).join('')}
            </div>
            <div class="datepicker-days"></div>
        `;
        
        document.body.appendChild(this.container);
        this.hide();
    }

    bindEvents() {
        this.input.addEventListener('click', () => this.show());
        this.input.addEventListener('focus', () => this.show());
        
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target) && e.target !== this.input) {
                this.hide();
            }
        });

        this.container.querySelector('.prev-month').addEventListener('click', () => this.prevMonth());
        this.container.querySelector('.next-month').addEventListener('click', () => this.nextMonth());
    }

    show() {
        const rect = this.input.getBoundingClientRect();
        this.container.style.display = 'block';
        this.container.style.position = 'absolute';
        this.container.style.top = (rect.bottom + window.scrollY) + 'px';
        this.container.style.left = rect.left + 'px';
        this.container.style.zIndex = '1000';
    }

    hide() {
        this.container.style.display = 'none';
    }

    prevMonth() {
        let [year, month, day] = this.currentDate;
        month--;
        if (month < 1) {
            month = 12;
            year--;
        }
        this.currentDate = [year, month, day];
        this.updateCalendar();
    }

    nextMonth() {
        let [year, month, day] = this.currentDate;
        month++;
        if (month > 12) {
            month = 1;
            year++;
        }
        this.currentDate = [year, month, day];
        this.updateCalendar();
    }

    updateCalendar() {
        const [year, month] = this.currentDate;
        
        // بروزرسانی عنوان ماه
        this.container.querySelector('.current-month').textContent = 
            `${this.calendar.getMonthName(month)} ${year}`;
        
        // ایجاد روزهای ماه
        const monthCalendar = this.calendar.generateMonthCalendar(year, month);
        const daysContainer = this.container.querySelector('.datepicker-days');
        daysContainer.innerHTML = '';
        
        monthCalendar.forEach(week => {
            week.forEach(day => {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                
                if (day === null) {
                    dayElement.className += ' empty';
                } else {
                    dayElement.textContent = day;
                    dayElement.dataset.date = this.calendar.formatPersianDate(year, month, day);
                    
                    // بررسی تاریخ گذشته
                    if (this.options.disablePastDates && this.calendar.isPastDate(year, month, day)) {
                        dayElement.className += ' disabled';
                    } else {
                        dayElement.addEventListener('click', () => this.selectDate(year, month, day));
                    }
                    
                    // بررسی تاریخ امروز
                    if (this.calendar.isToday(year, month, day)) {
                        dayElement.className += ' today';
                    }
                    
                    // بررسی تاریخ انتخاب شده
                    if (this.selectedDate && 
                        this.calendar.comparePersianDates([year, month, day], this.selectedDate) === 0) {
                        dayElement.className += ' selected';
                    }
                }
                
                daysContainer.appendChild(dayElement);
            });
        });
    }

    selectDate(year, month, day) {
        this.selectedDate = [year, month, day];
        const formattedDate = this.calendar.formatPersianDate(year, month, day);
        this.input.value = formattedDate;
        
        if (this.options.onSelect) {
            this.options.onSelect(formattedDate, new Date(...this.calendar.persianToGregorian(year, month, day)));
        }
        
        this.updateCalendar();
        this.hide();
    }
}

// تابع کمکی برای راه‌اندازی آسان
function initPersianDatePicker(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        new PersianDatePicker(element, options);
    });
}