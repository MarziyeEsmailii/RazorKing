namespace RazorKing.Models
{
    public class Barbershop
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImagePath { get; set; }
        public int CityId { get; set; }
        public City City { get; set; } = null!;
        public string OwnerId { get; set; } = string.Empty;
        public ApplicationUser Owner { get; set; } = null!;
        public List<Service> Services { get; set; } = new List<Service>();
        public List<Appointment> Appointments { get; set; } = new List<Appointment>();
        public List<BarberSchedule> BarberSchedules { get; set; } = new List<BarberSchedule>();
        public TimeSpan OpenTime { get; set; } = new TimeSpan(8, 0, 0); // 8:00 AM
        public TimeSpan CloseTime { get; set; } = new TimeSpan(20, 0, 0); // 8:00 PM
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}