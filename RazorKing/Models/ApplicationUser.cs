using Microsoft.AspNetCore.Identity;

namespace RazorKing.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public virtual List<Barbershop> OwnedBarbershops { get; set; } = new();
        public virtual List<Appointment> CustomerAppointments { get; set; } = new();
        public virtual List<BarberSchedule> BarberSchedules { get; set; } = new();
    }
}