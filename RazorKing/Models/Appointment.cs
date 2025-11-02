using System.ComponentModel.DataAnnotations;

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
        
        [Required]
        public string CustomerName { get; set; } = string.Empty;
        
        [Required]
        public string CustomerPhone { get; set; } = string.Empty;
        
        [Required]
        public DateTime AppointmentDate { get; set; }
        
        [Required]
        public TimeSpan AppointmentTime { get; set; }
        
        [Required]
        public int BarbershopId { get; set; }
        
        [Required]
        public int ServiceId { get; set; }
        
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
        public decimal TotalPrice { get; set; }
        public decimal PaidAmount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? CompletedAt { get; set; }
        public string? Notes { get; set; }
        
        // Navigation Properties
        public virtual ApplicationUser? Customer { get; set; }
        public virtual Barbershop Barbershop { get; set; } = null!;
        public virtual Service Service { get; set; } = null!;
        public virtual List<AppointmentService> AppointmentServices { get; set; } = new();
    }
}