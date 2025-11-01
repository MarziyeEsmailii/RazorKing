using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using RazorKing.Data;
using RazorKing.Models;
using RazorKing.Models.ViewModels;

namespace RazorKing.Controllers
{
    public class AccountController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _context;

        public AccountController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Register()
        {
            ViewBag.Cities = new SelectList(await _context.Cities.ToListAsync(), "Id", "Name");
            return View();
        }

        [HttpGet]
        public IActionResult AuthForm()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                // اعتبارسنجی فیلدهای آرایشگاه برای صاحب آرایشگاه
                if (model.Role == UserRole.BarbershopOwner)
                {
                    if (string.IsNullOrEmpty(model.BarbershopName))
                    {
                        ModelState.AddModelError("BarbershopName", "نام آرایشگاه الزامی است");
                    }
                    if (string.IsNullOrEmpty(model.BarbershopAddress))
                    {
                        ModelState.AddModelError("BarbershopAddress", "آدرس آرایشگاه الزامی است");
                    }
                    if (!model.CityId.HasValue)
                    {
                        ModelState.AddModelError("CityId", "انتخاب شهر الزامی است");
                    }
                }

                if (ModelState.IsValid)
                {
                    var user = new ApplicationUser
                    {
                        UserName = model.Email,
                        Email = model.Email,
                        FirstName = model.FirstName,
                        LastName = model.LastName,
                        PhoneNumber = model.PhoneNumber,
                        Role = model.Role
                    };

                    var result = await _userManager.CreateAsync(user, model.Password);

                    if (result.Succeeded)
                    {
                        // Create roles if they don't exist
                        await EnsureRolesExist();

                        // Assign role to user
                        string roleName = model.Role.ToString();
                        await _userManager.AddToRoleAsync(user, roleName);

                        // اگر کاربر صاحب آرایشگاه است، آرایشگاه جدید ایجاد کن
                        if (model.Role == UserRole.BarbershopOwner)
                        {
                            var barbershop = new Barbershop
                            {
                                Name = model.BarbershopName!,
                                Address = model.BarbershopAddress!,
                                Description = model.BarbershopDescription ?? "",
                                CityId = model.CityId!.Value,
                                OwnerId = user.Id,
                                IsActive = true,
                                CreatedAt = DateTime.Now
                            };

                            _context.Barbershops.Add(barbershop);
                            await _context.SaveChangesAsync();
                        }

                        await _signInManager.SignInAsync(user, isPersistent: false);

                        // Redirect based on role
                        return model.Role switch
                        {
                            UserRole.BarbershopOwner => RedirectToAction("Dashboard", "Owner"),
                            UserRole.Barber => RedirectToAction("Dashboard", "Barber"),
                            _ => RedirectToAction("Index", "Home")
                        };
                    }

                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError(string.Empty, error.Description);
                    }
                }
            }

            ViewBag.Cities = new SelectList(await _context.Cities.ToListAsync(), "Id", "Name");
            return View(model);
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (ModelState.IsValid)
            {
                var result = await _signInManager.PasswordSignInAsync(
                    model.Email, model.Password, model.RememberMe, lockoutOnFailure: false);

                if (result.Succeeded)
                {
                    var user = await _userManager.FindByEmailAsync(model.Email);
                    
                    // Redirect based on role
                    return user.Role switch
                    {
                        UserRole.BarbershopOwner => RedirectToAction("Dashboard", "Owner"),
                        UserRole.Barber => RedirectToAction("Dashboard", "Barber"),
                        _ => RedirectToAction("Index", "Home")
                    };
                }

                ModelState.AddModelError(string.Empty, "ایمیل یا رمز عبور اشتباه است.");
            }

            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return RedirectToAction("Index", "Home");
        }

        private async Task EnsureRolesExist()
        {
            string[] roles = { "Customer", "BarbershopOwner", "Barber" };

            foreach (string role in roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }
    }
}