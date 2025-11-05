using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RazorKing.Models;

namespace RazorKing.Controllers
{
    public class SetupController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public SetupController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<IActionResult> CreateAdmin()
        {
            try
            {
                // Create Admin role if it doesn't exist
                if (!await _roleManager.RoleExistsAsync("Admin"))
                {
                    await _roleManager.CreateAsync(new IdentityRole("Admin"));
                }

                // Create default admin user
                var adminEmail = "admin@razorking.com";
                var adminUser = await _userManager.FindByEmailAsync(adminEmail);
                
                if (adminUser == null)
                {
                    adminUser = new ApplicationUser
                    {
                        UserName = adminEmail,
                        Email = adminEmail,
                        FirstName = "مدیر",
                        LastName = "سیستم",
                        EmailConfirmed = true,
                        IsActive = true
                    };

                    var result = await _userManager.CreateAsync(adminUser, "Admin123!");
                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(adminUser, "Admin");
                        ViewBag.Message = "اکانت ادمین با موفقیت ایجاد شد!";
                        ViewBag.Email = adminEmail;
                        ViewBag.Password = "Admin123!";
                    }
                    else
                    {
                        ViewBag.Error = "خطا در ایجاد اکانت ادمین: " + string.Join(", ", result.Errors.Select(e => e.Description));
                    }
                }
                else
                {
                    // Make sure user has admin role
                    if (!await _userManager.IsInRoleAsync(adminUser, "Admin"))
                    {
                        await _userManager.AddToRoleAsync(adminUser, "Admin");
                    }
                    ViewBag.Message = "اکانت ادمین از قبل وجود دارد!";
                    ViewBag.Email = adminEmail;
                    ViewBag.Password = "Admin123!";
                }

                return View();
            }
            catch (Exception ex)
            {
                ViewBag.Error = "خطا: " + ex.Message;
                return View();
            }
        }
    }
}
