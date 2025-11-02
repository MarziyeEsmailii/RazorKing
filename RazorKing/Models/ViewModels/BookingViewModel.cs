namespace RazorKing.Models.ViewModels
{
    public class BookingViewModel
    {
        public List<City> Cities { get; set; } = new List<City>();
        public int? SelectedCityId { get; set; }
        public List<Barbershop> Barbershops { get; set; } = new List<Barbershop>();
        public int? SelectedBarbershopId { get; set; }
        public List<Service> Services { get; set; } = new List<Service>();
        public List<int> SelectedServiceIds { get; set; } = new List<int>();
        public DateTime? SelectedDate { get; set; }
        public List<TimeSpan> AvailableTimes { get; set; } = new List<TimeSpan>();
        public TimeSpan? SelectedTime { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public decimal DepositAmount { get; set; }
    }
}