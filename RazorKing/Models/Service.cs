namespace RazorKing.Models
{
    public class Service
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int DurationMinutes { get; set; }
        public int BarbershopId { get; set; }
        public Barbershop Barbershop { get; set; } = null!;
        public List<AppointmentService> AppointmentServices { get; set; } = new List<AppointmentService>();
    }
}