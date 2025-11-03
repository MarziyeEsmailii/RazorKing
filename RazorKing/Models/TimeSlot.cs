using System.ComponentModel.DataAnnotations;

namespace RazorKing.Models
{
    public class TimeSlot
    {
        public int Id { get; set; }
        
        [Required]
        public int BarbershopId { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        [Required]
        public TimeSpan StartTime { get; set; }
        
        [Required]
        public TimeSpan EndTime { get; set; }
        
        public bool IsAvailable { get; set; } = true;
        
        public bool IsBlocked { get; set; } = false;
        
        public string? BlockReason { get; set; }
        
        public TimeSlotType SlotType { get; set; } = TimeSlotType.Available;
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        // Navigation properties
        public virtual Barbershop Barbershop { get; set; } = null!;
        public virtual Appointment? Appointment { get; set; }
    }
    
    public enum TimeSlotType
    {
        Available,
        Booked,
        Blocked,
        Break
    }
}