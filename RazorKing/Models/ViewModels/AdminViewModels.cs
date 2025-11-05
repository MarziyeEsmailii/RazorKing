using RazorKing.Models;

namespace RazorKing.Models.ViewModels
{
    public class AdminDashboardViewModel
    {
        public int TotalUsers { get; set; }
        public int TotalBarbershops { get; set; }
        public int TotalAppointments { get; set; }
        public int TotalCities { get; set; }
        public int TotalServices { get; set; }
        public int PendingAppointments { get; set; }
        public int ActiveBarbershops { get; set; }
        public int TodayAppointments { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public List<Appointment> RecentAppointments { get; set; } = new();
    }

    public class AdminUsersViewModel
    {
        public List<ApplicationUser> Users { get; set; } = new();
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public string SearchTerm { get; set; } = string.Empty;
    }

    public class AdminBarbershopsViewModel
    {
        public List<Barbershop> Barbershops { get; set; } = new();
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public string SearchTerm { get; set; } = string.Empty;
    }

    public class AdminServicesViewModel
    {
        public List<Service> Services { get; set; } = new();
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public string SearchTerm { get; set; } = string.Empty;
    }

    public class AdminAppointmentsViewModel
    {
        public List<Appointment> Appointments { get; set; } = new();
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public string SearchTerm { get; set; } = string.Empty;
        public AppointmentStatus? SelectedStatus { get; set; }
    }

    public class AdminReportsViewModel
    {
        public List<DailyAppointmentData> DailyAppointments { get; set; } = new();
        public List<MonthlyRevenueData> MonthlyRevenue { get; set; } = new();
        public List<TopBarbershopData> TopBarbershops { get; set; } = new();
        public List<TopServiceData> TopServices { get; set; } = new();
        public List<UserRegistrationData> UserRegistrations { get; set; } = new();
    }

    public class DailyAppointmentData
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
    }

    public class MonthlyRevenueData
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal Revenue { get; set; }
        public string MonthName => new DateTime(Year, Month, 1).ToString("MMMM yyyy");
    }

    public class TopBarbershopData
    {
        public string Name { get; set; } = string.Empty;
        public int AppointmentsCount { get; set; }
        public decimal Revenue { get; set; }
    }

    public class TopServiceData
    {
        public string Name { get; set; } = string.Empty;
        public string BarbershopName { get; set; } = string.Empty;
        public int BookingsCount { get; set; }
        public decimal Revenue { get; set; }
    }

    public class UserRegistrationData
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public int Count { get; set; }
        public string MonthName => new DateTime(Year, Month, 1).ToString("MMMM yyyy");
    }
}