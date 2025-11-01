using System.Globalization;

namespace RazorKing.Helpers
{
    public static class PersianDateHelper
    {
        private static readonly PersianCalendar PersianCalendar = new PersianCalendar();

        /// <summary>
        /// تبدیل تاریخ میلادی به شمسی
        /// </summary>
        public static string ToPersianDate(this DateTime dateTime)
        {
            var year = PersianCalendar.GetYear(dateTime);
            var month = PersianCalendar.GetMonth(dateTime);
            var day = PersianCalendar.GetDayOfMonth(dateTime);

            return $"{year:0000}/{month:00}/{day:00}";
        }

        /// <summary>
        /// تبدیل تاریخ میلادی به شمسی با نام ماه
        /// </summary>
        public static string ToPersianDateWithMonthName(this DateTime dateTime)
        {
            var year = PersianCalendar.GetYear(dateTime);
            var month = PersianCalendar.GetMonth(dateTime);
            var day = PersianCalendar.GetDayOfMonth(dateTime);

            var monthName = GetPersianMonthName(month);
            return $"{day} {monthName} {year}";
        }

        /// <summary>
        /// تبدیل تاریخ میلادی به شمسی کامل با روز هفته
        /// </summary>
        public static string ToPersianDateFull(this DateTime dateTime)
        {
            var dayOfWeek = GetPersianDayOfWeek(dateTime.DayOfWeek);
            var persianDate = dateTime.ToPersianDateWithMonthName();
            return $"{dayOfWeek}، {persianDate}";
        }

        /// <summary>
        /// تبدیل تاریخ شمسی به میلادی
        /// </summary>
        public static DateTime FromPersianDate(int year, int month, int day)
        {
            return PersianCalendar.ToDateTime(year, month, day, 0, 0, 0, 0);
        }

        /// <summary>
        /// تبدیل رشته تاریخ شمسی به میلادی
        /// </summary>
        public static DateTime? FromPersianDateString(string persianDate)
        {
            try
            {
                var parts = persianDate.Split('/');
                if (parts.Length == 3)
                {
                    var year = int.Parse(parts[0]);
                    var month = int.Parse(parts[1]);
                    var day = int.Parse(parts[2]);
                    return FromPersianDate(year, month, day);
                }
            }
            catch
            {
                // در صورت خطا null برگردان
            }
            return null;
        }

        /// <summary>
        /// دریافت نام فارسی ماه
        /// </summary>
        public static string GetPersianMonthName(int month)
        {
            var monthNames = new[]
            {
                "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
                "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
            };

            return month >= 1 && month <= 12 ? monthNames[month - 1] : "";
        }

        /// <summary>
        /// دریافت نام فارسی روز هفته
        /// </summary>
        public static string GetPersianDayOfWeek(DayOfWeek dayOfWeek)
        {
            return dayOfWeek switch
            {
                DayOfWeek.Saturday => "شنبه",
                DayOfWeek.Sunday => "یکشنبه",
                DayOfWeek.Monday => "دوشنبه",
                DayOfWeek.Tuesday => "سه‌شنبه",
                DayOfWeek.Wednesday => "چهارشنبه",
                DayOfWeek.Thursday => "پنج‌شنبه",
                DayOfWeek.Friday => "جمعه",
                _ => ""
            };
        }

        /// <summary>
        /// دریافت تاریخ امروز به شمسی
        /// </summary>
        public static string GetTodayPersian()
        {
            return DateTime.Now.ToPersianDate();
        }

        /// <summary>
        /// دریافت سال جاری شمسی
        /// </summary>
        public static int GetCurrentPersianYear()
        {
            return PersianCalendar.GetYear(DateTime.Now);
        }

        /// <summary>
        /// دریافت ماه جاری شمسی
        /// </summary>
        public static int GetCurrentPersianMonth()
        {
            return PersianCalendar.GetMonth(DateTime.Now);
        }

        /// <summary>
        /// دریافت روز جاری شمسی
        /// </summary>
        public static int GetCurrentPersianDay()
        {
            return PersianCalendar.GetDayOfMonth(DateTime.Now);
        }

        /// <summary>
        /// بررسی اینکه آیا سال شمسی کبیسه است یا نه
        /// </summary>
        public static bool IsPersianLeapYear(int year)
        {
            return PersianCalendar.IsLeapYear(year);
        }

        /// <summary>
        /// دریافت تعداد روزهای ماه شمسی
        /// </summary>
        public static int GetPersianMonthDays(int year, int month)
        {
            return PersianCalendar.GetDaysInMonth(year, month);
        }

        /// <summary>
        /// تولید لیست روزهای یک ماه شمسی
        /// </summary>
        public static List<DateTime> GetPersianMonthDates(int year, int month)
        {
            var dates = new List<DateTime>();
            var daysInMonth = GetPersianMonthDays(year, month);

            for (int day = 1; day <= daysInMonth; day++)
            {
                dates.Add(FromPersianDate(year, month, day));
            }

            return dates;
        }

        /// <summary>
        /// فرمت کردن زمان به فارسی
        /// </summary>
        public static string ToPersianTime(this TimeSpan time)
        {
            return $"{time.Hours:00}:{time.Minutes:00}";
        }

        /// <summary>
        /// فرمت کردن تاریخ و زمان به فارسی
        /// </summary>
        public static string ToPersianDateTime(this DateTime dateTime)
        {
            var date = dateTime.ToPersianDate();
            var time = dateTime.TimeOfDay.ToPersianTime();
            return $"{date} - {time}";
        }
    }
}