namespace RazorKing.Models.ViewModels
{
    public class CityViewModel
    {
        public City City { get; set; } = new();
        public List<Barbershop> Barbershops { get; set; } = new();
        public int TotalServices { get; set; }
        public decimal MinPrice { get; set; }
        public decimal MaxPrice { get; set; }
        public decimal AveragePrice { get; set; }
    }
}