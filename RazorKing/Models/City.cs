namespace RazorKing.Models
{
    public class City
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Province { get; set; } = "گلستان";
        public List<Barbershop> Barbershops { get; set; } = new List<Barbershop>();
    }
}