using RazorKing.Models;

namespace RazorKing.Models.ViewModels
{
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
        public string Status { get; set; } = string.Empty;
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public List<ServiceInfo> Services { get; set; } = new List<ServiceInfo>();
    }

    public class ServiceInfo
    {
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}