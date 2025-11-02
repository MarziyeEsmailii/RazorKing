using System.ComponentModel.DataAnnotations;

namespace RazorKing.Models
{
    public class Service
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public decimal Price { get; set; }
        
        [Required]
        public int Duration { get; set; } // Duration in minutes
        
        public int DurationMinutes => Duration; // Alias for compatibility
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        [Required]
        public int BarbershopId { get; set; }
        
        // Navigation Properties
        public virtual Barbershop Barbershop { get; set; } = null!;
        public virtual List<Appointment> Appointments { get; set; } = new();
        public virtual List<AppointmentService> AppointmentServices { get; set; } = new();
    }
}