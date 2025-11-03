using RazorKing.Models;

namespace RazorKing.Models.ViewModels
{
    public class ProfileViewModel
    {
        public ApplicationUser User { get; set; } = null!;
        public List<Appointment> Appointments { get; set; } = new();
        public List<Appointment> UpcomingAppointments { get; set; } = new();
        public List<Appointment> PastAppointments { get; set; } = new();
        public int TotalAppointments { get; set; }
        public decimal TotalSpent { get; set; }
    }

    public class ProfileUpdateViewModel
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }
}