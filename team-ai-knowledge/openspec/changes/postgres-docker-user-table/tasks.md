# Tasks: postgres-docker-user-table

## Hạ tầng Docker (DB)
- [ ] T1 — Tạo tệp `docker-compose.yml` tại thư mục gốc `MT_GRMS_BACKEND` chạy PostgreSQL 16 Alpine (REQ-AUTH-DB-01)
- [ ] T2 — Khởi động container PostgreSQL qua `docker compose up -d` và kiểm tra kết nối (REQ-AUTH-DB-01)

## Backend & Domain Model (Backend)
- [ ] T3 — Cập nhật thực thể `User.cs` trong `MT_GRMS.Domain`: Chỉ chứa `Id` (string Uid), `Username` (string), `Password` (string) (REQ-AUTH-DB-02)
- [ ] T4 — Tạo `UserConfiguration.cs` trong `MT_GRMS.Infrastructure/Persistence/Configurations/` ánh xạ bảng `users` (REQ-AUTH-DB-02)
- [ ] T5 — Cập nhật `AppDbContext.cs`, `UserRepository` và DTO `UserInfo` tương thích với `User.Id` kiểu string (REQ-AUTH-DB-02)

## Migration & Data Seeding (DB)
- [ ] T6 — Tạo EF Core Migration `InitialCreate_UsersOnly` chỉ tạo duy nhất bảng `users` (REQ-AUTH-DB-03)
- [ ] T7 — Áp dụng Migration vào PostgreSQL (`dotnet ef database update`) và nạp seed user `admin` (REQ-AUTH-DB-03)

## Kiểm thử & Xác minh (Test)
- [ ] T8 — Chạy `dotnet test` đảm bảo 100% test PASS và truy vấn thử bảng `users` trong container (REQ-AUTH-DB-01, REQ-AUTH-DB-02, REQ-AUTH-DB-03)
