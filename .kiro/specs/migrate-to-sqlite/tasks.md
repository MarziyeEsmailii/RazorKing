# Implementation Plan

- [x] 1. Update NuGet packages for SQLite


  - Remove Microsoft.EntityFrameworkCore.SqlServer package from RazorKing.csproj
  - Add Microsoft.EntityFrameworkCore.Sqlite version 9.0.0 to RazorKing.csproj
  - Verify all other packages remain unchanged
  - _Requirements: 2.1, 2.2, 2.3, 2.4_







- [x] 2. Update connection strings in configuration files


  - [ ] 2.1 Modify appsettings.json to use SQLite connection string
    - Change DefaultConnection to "Data Source=RazorKing.db"
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 2.2 Modify appsettings.Development.json to use SQLite connection string


    - Change DefaultConnection to "Data Source=RazorKing.db"
    - _Requirements: 3.1, 3.2, 3.3_





- [x] 3. Update Program.cs to use SQLite provider


  - Replace UseSqlServer with UseSqlite in DbContext configuration
  - Ensure all other configurations remain unchanged
  - Verify Identity configuration is preserved





  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4. Remove existing SQL Server migrations

  - Delete all files in RazorKing/Migrations directory
  - _Requirements: 5.1_

- [ ] 5. Create new SQLite migrations
  - [ ] 5.1 Generate initial migration for SQLite
    - Run dotnet ef migrations add InitialCreate command
    - Verify migration files are created successfully
    - _Requirements: 5.2_
  - [ ] 5.2 Apply migrations to create SQLite database
    - Run dotnet ef database update command
    - Verify RazorKing.db file is created
    - Verify all tables are created including Identity tables
    - _Requirements: 5.3_

- [ ] 6. Verify database and seed data
  - [ ] 6.1 Run the application to trigger seed data
    - Start the application with dotnet run
    - Verify admin user is created (admin@razorking.com)
    - Verify Admin and Barber roles are created
    - _Requirements: 5.4_
  - [ ] 6.2 Verify city seed data
    - Check that 10 cities from Golestan province are seeded
    - _Requirements: 5.3_
