using Microsoft.AspNetCore.Identity;

namespace RazorKing.Models
{
    public enum UserRole
    {
        Customer,
        BarbershopOwner,
        Barber
    }

    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Customer;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public List<Barbershop> OwnedBarbershops { get; set; } = new List<Barbershop>();
        public List<Appointment> CustomerAppointments { get; set; } = new List<Appointment>();
        public List<BarberSchedule> BarberSchedules { get; set; } = new List<BarberSchedule>();
    }
}