using System.ComponentModel.DataAnnotations;

namespace RazorKing.Models
{
    public class BlockedTimeSlot
    {
        public int Id { get; set; }
        
        [Required]
        public int BarbershopId { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        [Required]
        public TimeSpan Time { get; set; }
        
        public string Reason { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        // Navigation properties
        public Barbershop Barbershop { get; set; } = null!;
    }
}