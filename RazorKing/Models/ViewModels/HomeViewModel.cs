namespace RazorKing.Models.ViewModels
{
    public class HomeViewModel
    {
        public List<City> Cities { get; set; } = new List<City>();
        public int TotalBarbershops { get; set; }
        public int TotalAppointments { get; set; }
        public int TotalCustomers { get; set; }
        public List<Barbershop> FeaturedBarbershops { get; set; } = new List<Barbershop>();
        public List<ServiceSummary> PopularServices { get; set; } = new List<ServiceSummary>();
        public List<Appointment> RecentAppointments { get; set; } = new List<Appointment>();
    }

    public class ServiceSummary
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal AveragePrice { get; set; }
        public decimal MinPrice { get; set; }
        public decimal MaxPrice { get; set; }
    }
}