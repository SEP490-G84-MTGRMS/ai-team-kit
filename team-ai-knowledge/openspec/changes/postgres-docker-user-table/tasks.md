# Tasks: postgres-docker-user-table

## Hạ tầng Docker (DB)
- [x] T1 — Tạo tệp `docker-compose.yml` tại thư mục gốc `MT_GRMS_BACKEND` chạy PostgreSQL 16 Alpine (REQ-AUTH-DB-01)
- [x] T2 — Khởi động container PostgreSQL qua `docker compose up -d` và cấu hình auto-init volume (REQ-AUTH-DB-01)

## Backend & Domain Model (Backend)
- [x] T3 — Cập nhật thực thể `User.cs` trong `MT_GRMS.Domain`: Chỉ chứa `Id` (string Uid), `Username` (string), `Password` (string) (REQ-AUTH-DB-02)
- [x] T4 — Tạo `UserConfiguration.cs` trong `MT_GRMS.Infrastructure/Persistence/Configurations/` ánh xạ bảng `users` (REQ-AUTH-DB-02)
- [x] T5 — Cập nhật `AppDbContext.cs`, `UserRepository` và DTO `UserInfo` tương thích với `User.Id` kiểu string (REQ-AUTH-DB-02)

## Migration & Data Seeding (DB)
- [x] T6 — Tạo EF Core Migration `InitialCreate_UsersOnly` chỉ tạo duy nhất bảng `users` (REQ-AUTH-DB-03)
- [x] T7 — Áp dụng Migration vào PostgreSQL (`dotnet ef migrations script` & `init-db.sql`) và nạp seed user `admin` (REQ-AUTH-DB-03)

## Kiểm thử & Xác minh (Test)
- [x] T8 — Chạy `dotnet test` đảm bảo 100% test PASS và xác minh tính toàn vẹn Solution (REQ-AUTH-DB-01, REQ-AUTH-DB-02, REQ-AUTH-DB-03)
