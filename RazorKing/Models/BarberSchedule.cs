namespace RazorKing.Models
{
    public class BarberSchedule
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;
        public int BarbershopId { get; set; }
        public Barbershop Barbershop { get; set; } = null!;
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; } = true;
        public DateTime Date { get; set; }
    }
}