# Codebase Review: postgres-docker-user-table

## Bản đồ ảnh hưởng
| REQ | Code hiện có | Cần thêm/sửa | Ghi chú |
|---|---|---|---|
| REQ-AUTH-DB-01 | Gốc `MT_GRMS_BACKEND` | Tạo tệp `docker-compose.yml` chạy `postgres:16-alpine` | Cổng 5432, named volume `postgres_data` |
| REQ-AUTH-DB-02 | `src/MT_GRMS.Domain/Entities/Identity/User.cs` | Refactor thực thể `User` chỉ gồm: `Id` (string), `Username` (string), `Password` (string) | Bỏ kế thừa `BaseTenantEntity` để chỉ giữ đúng 3 trường |
| REQ-AUTH-DB-02 | `src/MT_GRMS.Infrastructure/Persistence/Configurations/` | Tạo mới `UserConfiguration.cs` mapping bảng `users`, PK `id`, unique index `username` | Chuẩn hóa Fluent API |
| REQ-AUTH-DB-02 | `src/MT_GRMS.Infrastructure/Persistence/AppDbContext.cs` | Tinh chỉnh `AppDbContext` và `ConfigureTenantFilters` | Tránh filter lỗi nếu `User` không có `TenantId` |
| REQ-AUTH-DB-03 | `src/MT_GRMS.Infrastructure/Migrations/` | Sinh migration `InitialCreate_UsersOnly` | Chỉ tạo bảng `users` |
| REQ-AUTH-DB-03 | `src/MT_GRMS.Application/Auth/` | Cập nhật `UserInfo` sang `string Id` và `AuthService` | Đảm bảo test tiếp tục pass 100% |

## Tái sử dụng được
- Cấu hình Npgsql provider sẵn có trong `DependencyInjection.cs`.
- Chuỗi kết nối PostgreSQL chuẩn trong `appsettings.json`.

## Kết luận: Khả thi
Toàn bộ mã nguồn hoàn toàn sẵn sàng cho việc triển khai.
