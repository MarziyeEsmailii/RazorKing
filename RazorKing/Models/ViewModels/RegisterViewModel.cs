using System.ComponentModel.DataAnnotations;

namespace RazorKing.Models.ViewModels
{
    public class RegisterViewModel
    {
        [Required(ErrorMessage = "نام الزامی است")]
        [Display(Name = "نام")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "نام خانوادگی الزامی است")]
        [Display(Name = "نام خانوادگی")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "ایمیل الزامی است")]
        [EmailAddress(ErrorMessage = "فرمت ایمیل صحیح نیست")]
        [Display(Name = "ایمیل")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "شماره تلفن الزامی است")]
        [Phone(ErrorMessage = "فرمت شماره تلفن صحیح نیست")]
        [Display(Name = "شماره تلفن")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "رمز عبور الزامی است")]
        [StringLength(100, ErrorMessage = "رمز عبور باید حداقل {2} کاراکتر باشد", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "رمز عبور")]
        public string Password { get; set; } = string.Empty;

        [DataType(DataType.Password)]
        [Display(Name = "تکرار رمز عبور")]
        [Compare("Password", ErrorMessage = "رمز عبور و تکرار آن یکسان نیست")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "نوع کاربری الزامی است")]
        [Display(Name = "نوع کاربری")]
        public UserRole Role { get; set; } = UserRole.Customer;

        // فیلدهای مخصوص صاحب آرایشگاه
        [Display(Name = "نام آرایشگاه")]
        public string? BarbershopName { get; set; }

        [Display(Name = "آدرس آرایشگاه")]
        public string? BarbershopAddress { get; set; }

        [Display(Name = "توضیحات آرایشگاه")]
        public string? BarbershopDescription { get; set; }

        [Display(Name = "شهر")]
        public int? CityId { get; set; }
    }


}