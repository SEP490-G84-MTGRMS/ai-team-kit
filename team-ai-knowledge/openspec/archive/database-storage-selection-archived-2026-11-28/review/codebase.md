# Codebase Review: database-storage-selection

## Bản đồ ảnh hưởng
| REQ | Code hiện có | Cần thêm/sửa | Ghi chú |
|---|---|---|---|
| REQ-DB-01 | `src/MT_GRMS.Infrastructure/DependencyInjection.cs` | Chuẩn hóa cấu hình `UseNpgsql` với pooling, retry logic và legacy timestamp switch nếu cần | Giữ fallback `UseInMemoryDatabase` khi connection string rỗng |
| REQ-DB-02 | `src/MT_GRMS.Infrastructure/Persistence/AppDbContext.cs` | Kiểm tra lại `ConfigureTenantFilters` | 9 entities đã được áp dụng bộ lọc `TenantId` và `IsDeleted` |
| REQ-DB-03 | `src/MT_GRMS.Infrastructure/Persistence/Configurations/` | Mở rộng cấu hình Fluent API cho các bảng còn lại | Đảm bảo kiểu `decimal(18,2)` và snake_case table name |
| REQ-DB-04 | Gốc `MT_GRMS_BACKEND` | Tạo tệp `docker-compose.yml` với service `postgres:16-alpine` | Cổng 5432, named volume `postgres_data` |

## Tái sử dụng được
- `src/MT_GRMS.Infrastructure/Persistence/Configurations/ProductConfiguration.cs` — Khung mẫu chuẩn Fluent API đã viết sẵn.
- `src/MT_GRMS.Infrastructure/Persistence/AppDbContext.cs` — Hàm `ConfigureTenantFilters` đã bao quát đầy đủ 9 thực thể.

## Xung đột / rủi ro
- [THẤP] Logic `connectionString.Contains("Host=")` trong `DependencyInjection.cs` có thể bỏ sót các định dạng connection string PostgreSQL khác.
  👉 **Đề xuất**: Chuẩn hóa kiểm tra kết nối để nhận diện rõ PostgreSQL hoặc mặc định dùng Npgsql khi có chuỗi kết nối.

## Kết luận: Khả thi
Specs hoàn toàn phù hợp với cấu trúc Clean Architecture của codebase hiện tại.
