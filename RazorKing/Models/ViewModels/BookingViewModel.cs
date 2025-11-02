using System.ComponentModel.DataAnnotations;

namespace RazorKing.Models.ViewModels
{
    public class BookingViewModel
    {
        public List<City> Cities { get; set; } = new();
        public int? SelectedCityId { get; set; }
        public List<Barbershop> Barbershops { get; set; } = new();
        public int? SelectedBarbershopId { get; set; }
        public List<Service> Services { get; set; } = new();
        public List<int> SelectedServiceIds { get; set; } = new();
        public DateTime? SelectedDate { get; set; }
        public List<TimeSpan> AvailableTimes { get; set; } = new();
        public TimeSpan? SelectedTime { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public decimal DepositAmount { get; set; }
    }

    public class BookingConfirmationViewModel
    {
        public int AppointmentId { get; set; }
        public string BarbershopName { get; set; } = string.Empty;
        public string BarbershopAddress { get; set; } = string.Empty;
        public string BarbershopPhone { get; set; } = string.Empty;
        public string CityName { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public TimeSpan AppointmentTime { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public decimal ServicePrice { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
    }
}