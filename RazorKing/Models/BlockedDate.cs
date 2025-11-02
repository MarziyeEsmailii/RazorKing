using System.ComponentModel.DataAnnotations;

namespace RazorKing.Models
{
    public class BlockedDate
    {
        public int Id { get; set; }
        
        [Required]
        public int BarbershopId { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        public string Reason { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; }
        
        // Navigation Properties
        public virtual Barbershop Barbershop { get; set; } = null!;
    }
}