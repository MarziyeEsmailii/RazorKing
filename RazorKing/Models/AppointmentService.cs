namespace RazorKing.Models
{
    public class AppointmentService
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public Appointment Appointment { get; set; } = null!;
        public int ServiceId { get; set; }
        public Service Service { get; set; } = null!;
        public decimal Price { get; set; }
    }
}