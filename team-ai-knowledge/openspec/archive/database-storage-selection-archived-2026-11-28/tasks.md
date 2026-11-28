# Tasks: database-storage-selection

## Hạ tầng & Docker (DB)
- [ ] T1 — Tạo tệp `docker-compose.yml` tại `MT_GRMS_BACKEND` định nghĩa service `postgres:16-alpine`, cấu hình user `postgres`, database `mtgrms_db`, port `5432` và persistent named volume `postgres_data` (REQ-DB-04)
- [ ] T2 — Chuẩn hóa cấu hình PostgreSQL Connection String trong `src/MT_GRMS.Api/appsettings.json` và `appsettings.Development.json` (REQ-DB-01)

## Backend & Persistence (Backend)
- [ ] T3 — Refactor `src/MT_GRMS.Infrastructure/DependencyInjection.cs`: Chuẩn hóa `AddDbContext<AppDbContext>` sử dụng `UseNpgsql` làm provider chính thức với `EnableRetryOnFailure`, cấu hình timestamp UTC an toàn và fallback `UseInMemoryDatabase` khi rỗng (REQ-DB-01)
- [ ] T4 — Bổ sung và hoàn thiện các file cấu hình Fluent API trong `src/MT_GRMS.Infrastructure/Persistence/Configurations/` cho các thực thể còn lại (`Category`, `Order`, `OrderItem`, `Batch`, `StockOnHand`, `CashbookTransaction`, `User`, `Role`) đảm bảo `decimal(18,2)` và index (REQ-DB-02, REQ-DB-03)

## Kiểm thử & Xác minh (Test)
- [ ] T5 — Chạy kiểm thử tự động `dotnet test` (UnitTests & IntegrationTests) đảm bảo toàn bộ test tiếp tục PASS 100% với cấu hình mới (REQ-DB-01, REQ-DB-02)
- [ ] T6 — Xác minh kết nối hoặc sinh script migration thử nghiệm cho PostgreSQL bảo đảm không có lỗi runtime (REQ-DB-01)
