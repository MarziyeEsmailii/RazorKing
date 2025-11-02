using System.ComponentModel.DataAnnotations;
using RazorKing.Models;

namespace RazorKing.Models.ViewModels
{
    public class BarberDashboardViewModel
    {
        public Barbershop Barbershop { get; set; } = new();
        public List<Appointment> TodayAppointments { get; set; } = new();
        public List<Appointment> UpcomingAppointments { get; set; } = new();
        public BarberStatsViewModel MonthlyStats { get; set; } = new();
    }

    public class BarberStatsViewModel
    {
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public decimal TotalRevenue { get; set; }
        public double CompletionRate => TotalAppointments > 0 ? (double)CompletedAppointments / TotalAppointments * 100 : 0;
    }

    public class EditBarbershopViewModel
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "نام آرایشگاه الزامی است")]
        [Display(Name = "نام آرایشگاه")]
        public string Name { get; set; } = string.Empty;
        
        [Display(Name = "توضیحات")]
        public string Description { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "آدرس الزامی است")]
        [Display(Name = "آدرس")]
        public string Address { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "شماره تماس الزامی است")]
        [Display(Name = "شماره تماس")]
        public string Phone { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "انتخاب شهر الزامی است")]
        [Display(Name = "شهر")]
        public int CityId { get; set; }
        
        [Required(ErrorMessage = "ساعت شروع کار الزامی است")]
        [Display(Name = "ساعت شروع کار")]
        public TimeSpan OpenTime { get; set; }
        
        [Required(ErrorMessage = "ساعت پایان کار الزامی است")]
        [Display(Name = "ساعت پایان کار")]
        public TimeSpan CloseTime { get; set; }
        
        [Required(ErrorMessage = "روزهای کاری الزامی است")]
        [Display(Name = "روزهای کاری")]
        public string WorkingDays { get; set; } = string.Empty;
        
        public List<string> WorkingDaysArray { get; set; } = new();
        
        [Display(Name = "وضعیت فعال")]
        public bool IsActive { get; set; } = true;
        
        public List<City> Cities { get; set; } = new();
        public List<Service> Services { get; set; } = new();
    }

    public class AddServiceViewModel
    {
        [Required(ErrorMessage = "نام خدمت الزامی است")]
        [Display(Name = "نام خدمت")]
        public string Name { get; set; } = string.Empty;
        
        [Display(Name = "توضیحات")]
        public string Description { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "قیمت الزامی است")]
        [Range(1000, 1000000, ErrorMessage = "قیمت باید بین 1000 تا 1000000 تومان باشد")]
        [Display(Name = "قیمت (تومان)")]
        public decimal Price { get; set; }
        
        [Required(ErrorMessage = "مدت زمان الزامی است")]
        [Range(15, 300, ErrorMessage = "مدت زمان باید بین 15 تا 300 دقیقه باشد")]
        [Display(Name = "مدت زمان (دقیقه)")]
        public int Duration { get; set; }
    }

    public class EditServiceViewModel
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "نام خدمت الزامی است")]
        [Display(Name = "نام خدمت")]
        public string Name { get; set; } = string.Empty;
        
        [Display(Name = "توضیحات")]
        public string Description { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "قیمت الزامی است")]
        [Range(1000, 1000000, ErrorMessage = "قیمت باید بین 1000 تا 1000000 تومان باشد")]
        [Display(Name = "قیمت (تومان)")]
        public decimal Price { get; set; }
        
        [Required(ErrorMessage = "مدت زمان الزامی است")]
        [Range(15, 300, ErrorMessage = "مدت زمان باید بین 15 تا 300 دقیقه باشد")]
        [Display(Name = "مدت زمان (دقیقه)")]
        public int Duration { get; set; }
        
        [Display(Name = "وضعیت فعال")]
        public bool IsActive { get; set; } = true;
    }

    public class BarberScheduleViewModel
    {
        public Barbershop Barbershop { get; set; } = new();
        public string WorkingDays { get; set; } = string.Empty;
        public TimeSpan OpenTime { get; set; }
        public TimeSpan CloseTime { get; set; }
        public List<Appointment> Appointments { get; set; } = new();
    }

    public class UpdateScheduleViewModel
    {
        [Required(ErrorMessage = "روزهای کاری الزامی است")]
        public string WorkingDays { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "ساعت شروع کار الزامی است")]
        public TimeSpan OpenTime { get; set; }
        
        [Required(ErrorMessage = "ساعت پایان کار الزامی است")]
        public TimeSpan CloseTime { get; set; }
    }

    public class CreateBarbershopViewModel
    {
        [Required(ErrorMessage = "نام آرایشگاه الزامی است")]
        [Display(Name = "نام آرایشگاه")]
        public string Name { get; set; } = string.Empty;
        
        [Display(Name = "توضیحات")]
        public string Description { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "آدرس الزامی است")]
        [Display(Name = "آدرس")]
        public string Address { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "شماره تماس الزامی است")]
        [Display(Name = "شماره تماس")]
        public string Phone { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "انتخاب شهر الزامی است")]
        [Display(Name = "شهر")]
        public int CityId { get; set; }
        
        [Required(ErrorMessage = "ساعت شروع کار الزامی است")]
        [Display(Name = "ساعت شروع کار")]
        public TimeSpan OpenTime { get; set; } = new TimeSpan(9, 0, 0);
        
        [Required(ErrorMessage = "ساعت پایان کار الزامی است")]
        [Display(Name = "ساعت پایان کار")]
        public TimeSpan CloseTime { get; set; } = new TimeSpan(21, 0, 0);
        
        [Required(ErrorMessage = "روزهای کاری الزامی است")]
        [Display(Name = "روزهای کاری")]
        public string WorkingDays { get; set; } = "شنبه,یکشنبه,دوشنبه,سه‌شنبه,چهارشنبه,پنج‌شنبه";
        
        public List<string> WorkingDaysArray { get; set; } = new();
        
        public List<City> Cities { get; set; } = new();
    }

    public class ChangeAppointmentStatusViewModel
    {
        public int AppointmentId { get; set; }
        public AppointmentStatus Status { get; set; }
    }

    public class ManageAvailabilityViewModel
    {
        public Barbershop Barbershop { get; set; } = new();
        public string WorkingDays { get; set; } = string.Empty;
        public TimeSpan OpenTime { get; set; }
        public TimeSpan CloseTime { get; set; }
        public List<BlockedDate> BlockedDates { get; set; } = new();
    }

    public class BlockDateViewModel
    {
        [Required(ErrorMessage = "تاریخ الزامی است")]
        public DateTime Date { get; set; }
        
        [Display(Name = "دلیل مسدود کردن")]
        public string Reason { get; set; } = string.Empty;
    }

    public class BlockTimeViewModel
    {
        [Required(ErrorMessage = "تاریخ الزامی است")]
        public DateTime Date { get; set; }
        
        [Required(ErrorMessage = "ساعت شروع الزامی است")]
        public string StartTime { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "ساعت پایان الزامی است")]
        public string EndTime { get; set; } = string.Empty;
        
        [Display(Name = "دلیل مسدود کردن")]
        public string Reason { get; set; } = string.Empty;
    }

    public class WeeklyStatsViewModel
    {
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int CancelledAppointments { get; set; }
        public decimal TotalRevenue { get; set; }
        public int UniqueCustomers { get; set; }
        public double AverageRating { get; set; }
        public List<DailyStatsViewModel> DailyStats { get; set; } = new();
    }

    public class DailyStatsViewModel
    {
        public DateTime Date { get; set; }
        public int AppointmentCount { get; set; }
        public decimal Revenue { get; set; }
        public int AvailableSlots { get; set; }
        public double OccupancyRate { get; set; }
    }

    public class AppointmentSlotViewModel
    {
        public DateTime Date { get; set; }
        public TimeSpan Time { get; set; }
        public bool IsAvailable { get; set; }
        public bool IsBlocked { get; set; }
        public bool IsBreak { get; set; }
        public Appointment? Appointment { get; set; }
        public string SlotType { get; set; } = "available"; // available, booked, blocked, break
    }

    public class CalendarWeekViewModel
    {
        public DateTime WeekStart { get; set; }
        public DateTime WeekEnd { get; set; }
        public List<CalendarDayViewModel> Days { get; set; } = new();
        public WeeklyStatsViewModel Stats { get; set; } = new();
    }

    public class CalendarDayViewModel
    {
        public DateTime Date { get; set; }
        public string DayName { get; set; } = string.Empty;
        public bool IsWorkingDay { get; set; }
        public bool IsToday { get; set; }
        public List<AppointmentSlotViewModel> Slots { get; set; } = new();
        public DailyStatsViewModel Stats { get; set; } = new();
    }
}