namespace RazorKing.Models
{
    public enum AppointmentStatus
    {
        Pending,
        Confirmed,
        Completed,
        Cancelled
    }

    public class Appointment
    {
        public int Id { get; set; }
        public string? CustomerId { get; set; }
        public ApplicationUser? Customer { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public TimeSpan AppointmentTime { get; set; }
        public int BarbershopId { get; set; }
        public Barbershop Barbershop { get; set; } = null!;
        public string? BarberId { get; set; }
        public ApplicationUser? Barber { get; set; }
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
        public decimal TotalPrice { get; set; }
        public decimal PaidAmount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? CompletedAt { get; set; }
        public List<AppointmentService> AppointmentServices { get; set; } = new List<AppointmentService>();
    }
}