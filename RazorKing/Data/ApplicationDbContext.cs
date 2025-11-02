using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RazorKing.Models;

namespace RazorKing.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<City> Cities { get; set; }
        public DbSet<Barbershop> Barbershops { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<AppointmentService> AppointmentServices { get; set; }
        public DbSet<BarberSchedule> BarberSchedules { get; set; }
        public DbSet<BlockedDate> BlockedDates { get; set; }
        public DbSet<BlockedTimeSlot> BlockedTimeSlots { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships
            modelBuilder.Entity<Barbershop>()
                .HasOne(b => b.City)
                .WithMany(c => c.Barbershops)
                .HasForeignKey(b => b.CityId);

            modelBuilder.Entity<Service>()
                .HasOne(s => s.Barbershop)
                .WithMany(b => b.Services)
                .HasForeignKey(s => s.BarbershopId);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Barbershop)
                .WithMany(b => b.Appointments)
                .HasForeignKey(a => a.BarbershopId);

            modelBuilder.Entity<AppointmentService>()
                .HasOne(aps => aps.Appointment)
                .WithMany(a => a.AppointmentServices)
                .HasForeignKey(aps => aps.AppointmentId);

            modelBuilder.Entity<AppointmentService>()
                .HasOne(aps => aps.Service)
                .WithMany(s => s.AppointmentServices)
                .HasForeignKey(aps => aps.ServiceId);

            // User relationships
            modelBuilder.Entity<Barbershop>()
                .HasOne(b => b.Owner)
                .WithMany(u => u.OwnedBarbershops)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Customer)
                .WithMany(u => u.CustomerAppointments)
                .HasForeignKey(a => a.CustomerId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<BarberSchedule>()
                .HasOne(bs => bs.User)
                .WithMany(u => u.BarberSchedules)
                .HasForeignKey(bs => bs.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BarberSchedule>()
                .HasOne(bs => bs.Barbershop)
                .WithMany(b => b.BarberSchedules)
                .HasForeignKey(bs => bs.BarbershopId)
                .OnDelete(DeleteBehavior.Cascade);

            // Fix cascade delete issues
            modelBuilder.Entity<AppointmentService>()
                .HasOne(aps => aps.Service)
                .WithMany(s => s.AppointmentServices)
                .HasForeignKey(aps => aps.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Service>()
                .HasOne(s => s.Barbershop)
                .WithMany(b => b.Services)
                .HasForeignKey(s => s.BarbershopId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Barbershop)
                .WithMany(b => b.Appointments)
                .HasForeignKey(a => a.BarbershopId)
                .OnDelete(DeleteBehavior.Restrict);

            // Appointment-Service relationship
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Service)
                .WithMany(s => s.Appointments)
                .HasForeignKey(a => a.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure decimal precision
            modelBuilder.Entity<Service>()
                .Property(s => s.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Appointment>()
                .Property(a => a.TotalPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Appointment>()
                .Property(a => a.PaidAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<AppointmentService>()
                .Property(aps => aps.Price)
                .HasPrecision(18, 2);

            // Configure BlockedDate relationships
            modelBuilder.Entity<BlockedDate>()
                .HasOne(bd => bd.Barbershop)
                .WithMany()
                .HasForeignKey(bd => bd.BarbershopId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure BlockedTimeSlot relationships
            modelBuilder.Entity<BlockedTimeSlot>()
                .HasOne(bts => bts.Barbershop)
                .WithMany()
                .HasForeignKey(bts => bts.BarbershopId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed data for Golestan cities
            modelBuilder.Entity<City>().HasData(
                new City { Id = 1, Name = "گرگان", Province = "گلستان" },
                new City { Id = 2, Name = "گنبد کاووس", Province = "گلستان" },
                new City { Id = 3, Name = "علی آباد کتول", Province = "گلستان" },
                new City { Id = 4, Name = "آق قلا", Province = "گلستان" },
                new City { Id = 5, Name = "بندر گز", Province = "گلستان" },
                new City { Id = 6, Name = "کردکوی", Province = "گلستان" },
                new City { Id = 7, Name = "آزادشهر", Province = "گلستان" },
                new City { Id = 8, Name = "رامیان", Province = "گلستان" },
                new City { Id = 9, Name = "مینودشت", Province = "گلستان" },
                new City { Id = 10, Name = "کلاله", Province = "گلستان" }
            );
        }
    }
}