using System.ComponentModel.DataAnnotations;

namespace RazorKing.Models
{
    public class Barbershop
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Address { get; set; } = string.Empty;
        
        [Required]
        public string Phone { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public string? ImageUrl { get; set; }
        
        [Required]
        public int CityId { get; set; }
        
        [Required]
        public string UserId { get; set; } = string.Empty; // Changed from OwnerId
        
        public TimeSpan OpenTime { get; set; } = new TimeSpan(8, 0, 0);
        public TimeSpan CloseTime { get; set; } = new TimeSpan(20, 0, 0);
        
        public string WorkingDays { get; set; } = "شنبه,یکشنبه,دوشنبه,سه‌شنبه,چهارشنبه,پنج‌شنبه";
        
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        
        // Navigation Properties
        public virtual City City { get; set; } = null!;
        public virtual ApplicationUser Owner { get; set; } = null!;
        public virtual List<Service> Services { get; set; } = new();
        public virtual List<Appointment> Appointments { get; set; } = new();
        public virtual List<BarberSchedule> BarberSchedules { get; set; } = new();
    }
}