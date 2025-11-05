using System.ComponentModel.DataAnnotations;

namespace RazorKing.Models.ViewModels
{
    public class ProfileViewModel
    {
        public ApplicationUser User { get; set; } = new();
        public List<Appointment> Appointments { get; set; } = new();
        public List<Appointment> UpcomingAppointments { get; set; } = new();
        public List<Appointment> PastAppointments { get; set; } = new();
        public int TotalAppointments { get; set; }
        public decimal TotalSpent { get; set; }
    }

    public class ProfileUpdateViewModel
    {
        [Required(ErrorMessage = "نام الزامی است")]
        [Display(Name = "نام")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "نام خانوادگی الزامی است")]
        [Display(Name = "نام خانوادگی")]
        public string LastName { get; set; } = string.Empty;

        [Phone(ErrorMessage = "فرمت شماره تلفن صحیح نیست")]
        [Display(Name = "شماره تلفن")]
        public string? PhoneNumber { get; set; }
    }
}