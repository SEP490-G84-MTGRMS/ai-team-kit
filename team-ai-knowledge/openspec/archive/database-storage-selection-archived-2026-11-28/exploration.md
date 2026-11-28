# EXP-2026-10-12-DATABASE-STORAGE: Khảo sát Kiến trúc Cơ sở Dữ liệu PostgreSQL 16 cho MT-GRMS

## 1. Problem Statement & Context
- **Bài toán**: Hệ thống MT-GRMS (Multi-Tenant Grocery Retail Management System) là nền tảng SaaS phục vụ chuỗi cửa hàng tạp hóa bán lẻ. Hệ thống đòi hỏi:
  - Xử lý giao dịch tại quầy thu ngân (POS) nhanh, đồng thời cao, không xảy ra tranh chấp khóa (Lock Escalation/Deadlock).
  - Quản lý kho theo nguyên tắc FEFO (First Expired, First Out) với các truy vấn tìm lô cận date siêu tốc.
  - Phân lập dữ liệu đa người thuê (Multi-Tenancy) nghiêm ngặt giữa các chuỗi cửa hàng.
  - Tính toán tài chính, dòng tiền và kiểm kê tồn kho chính xác tuyệt đối (ACID).
- **Hiện trạng mã nguồn**:
  - `MT_GRMS_BACKEND` đã có cấu hình sơ khởi trong `DependencyInjection.cs` hỗ trợ đa provider (`UseNpgsql`, `UseSqlServer`, `UseInMemoryDatabase`), tuy nhiên chưa có sự thống nhất và chưa có bộ EF Core Migrations chính thức cho PostgreSQL.
  - `MT_GRMS.Infrastructure.csproj` đã cài sẵn package `Npgsql.EntityFrameworkCore.PostgreSQL` version `8.0.11` và `Microsoft.EntityFrameworkCore.SqlServer` version `8.0.11`.
  - Chưa có file `docker-compose.yml` để chuẩn hóa môi trường chạy PostgreSQL 16 đồng nhất cho toàn bộ lập trình viên trong nhóm.

## 2. Bản đồ Code Bị Ảnh Hưởng (Caller / Callee)
```
MT_GRMS.Api (appsettings.json / Program.cs)
   └── calls -> MT_GRMS.Infrastructure.DependencyInjection.AddInfrastructureServices()
                   ├── configures -> DbContextOptionsBuilder.UseNpgsql()
                   └── registers  -> AppDbContext (DbSets cho 9 Entities)
                                       ├── applies -> ApplyConfigurationsFromAssembly()
                                       │                ├── ProductConfiguration.cs
                                       │                └── [Các cấu hình Entity tiếp theo]
                                       └── applies -> ConfigureTenantFilters() (Global Query Filters)
```
- Các file bị tác động:
  1. `src/MT_GRMS.Infrastructure/DependencyInjection.cs`: Chuẩn hóa ưu tiên Npgsql làm provider chính thức, giữ fallback InMemory cho môi trường test/CI.
  2. `src/MT_GRMS.Api/appsettings.json`: Chuẩn hóa chuỗi kết nối chuẩn cho PostgreSQL (`Host=localhost;Port=5432;Database=mtgrms_db;Username=postgres;Password=...`).
  3. `docker-compose.yml` (tại thư mục gốc backend): Định nghĩa service `postgres:16-alpine` với volume lưu trữ bền vững và healthcheck.
  4. `src/MT_GRMS.Infrastructure/Persistence/Configurations/`: Bổ sung cấu hình Fluent API cho các bảng Domain Entity theo chuẩn PostgreSQL (snake_case naming, decimal(18,2) cho tiền tệ, B-Tree index).

## 3. Ràng buộc (Constraints)
- **Nền tảng công nghệ**: .NET 8 LTS, EF Core 8 Code-First, Clean Architecture 4 tầng.
- **Tiền tệ & Số liệu**: Toàn bộ số tiền VND phải dùng `decimal(18,2)`.
- **Múi giờ**: Dữ liệu ngày giờ lưu UTC (`timestamptz`), hiển thị theo giờ Việt Nam (`Asia/Ho_Chi_Minh`).
- **Bảo mật Multi-Tenant**: Giữ nguyên cơ chế Global Query Filter trên mọi bảng nghiệp vụ kế thừa `BaseTenantEntity`.
- **Độ phủ Test**: Bộ test hiện có (`MT_GRMS.UnitTests` và `MT_GRMS.IntegrationTests`) phải tiếp tục build và chạy PASS 100%.

## 4. Giả định (Assumptions)
- **[ASSUMPTION-01]**: PostgreSQL 16 tương thích hoàn toàn với thư viện `Npgsql.EntityFrameworkCore.PostgreSQL 8.0.11`.
- **[ASSUMPTION-02]**: Mọi máy phát triển của thành viên nhóm có thể chạy PostgreSQL thông qua Docker Desktop hoặc cài trực tiếp PostgreSQL 16 local trên cổng 5432.
- **[ASSUMPTION-03]**: Môi trường Unit Test không cần kết nối tới Database vật lý mà sử dụng `UseInMemoryDatabase` để test logic service cực nhanh.

## 5. Phạm vi & Non-Goals
### In Scope
- Chuẩn hóa provider PostgreSQL (Npgsql) trong `DependencyInjection.cs` với cấu hình pooling và retry on failure.
- Cấu hình file `docker-compose.yml` chuẩn hóa PostgreSQL 16 cho dev môi trường local.
- Viết tài liệu hướng dẫn và lệnh chạy EF Core Migrations khởi tạo database schema.
- Kiểm tra tính tương thích của toàn bộ 9 Domain Entities với kiểu dữ liệu PostgreSQL.

### Out of Scope (Non-Goals)
- Không can thiệp sửa đổi các lớp nghiệp vụ trong `MT_GRMS.Application`.
- Không thay đổi hợp đồng API DTOs trong `MT_GRMS.Api`.
- Không triển khai Redis cache phân tán ở giai đoạn này (để dành cho phase tối ưu hiệu năng).

## 6. Đánh giá Các Phương Án Refactor
- **Phương án 1 (Khuyên dùng - Hybrid Smart Selection)**:
  - Thiết lập PostgreSQL làm Default Primary Database khi có ConnectionString.
  - Tự động kích hoạt cơ chế `EnableRetryOnFailure` khi mạng chập chờn.
  - Cho phép tự động fallback về `UseInMemoryDatabase` nếu chuỗi kết nối rỗng (hỗ trợ Unit Test và CI runner chạy độc lập không cần Docker).
  - *Ưu điểm*: An toàn cao, không phá vỡ test hiện tại, sẵn sàng cho cả dev local và deploy cloud (Render, Supabase).
  - *Nhược điểm*: Vẫn duy trì dependency SqlServer trong file csproj (không ảnh hưởng runtime).

- **Phương án 2 (Strict Pure PostgreSQL)**:
  - Gỡ bỏ hoàn toàn package `Microsoft.EntityFrameworkCore.SqlServer` và cấm fallback InMemory. Bắt buộc test tích hợp phải dùng Docker Testcontainers.
  - *Ưu điểm*: Cực kỳ tinh gọn, không dư thừa package.
  - *Nhược điểm*: Yêu cầu máy test phải có Docker Daemon chạy ngầm, gây khó khăn cho CI runner miễn phí có tài nguyên hạn chế.

👉 **Quyết định**: Chọn **Phương án 1** vì dung hòa hoàn hảo giữa tính chuyên nghiệp trên Production/Dev và sự tiện lợi, tốc độ khi chạy Automated Test.

## 7. Rủi ro & Biện pháp Giảm thiểu
| Rủi ro | Mức độ | Biện pháp giảm thiểu |
| :--- | :--- | :--- |
| Khác biệt múi giờ UTC giữa C# `DateTime` và PostgreSQL `timestamptz` | Trung bình | Đảm bảo gán `DateTime.UtcNow` trong `BaseTenantEntity` khi tạo mới hoặc cập nhật bản ghi. |
| Xung đột Migration giữa các thành viên | Thấp | Tạo initial migration duy nhất, thống nhất quy trình merge code qua SEP Kit trước khi push. |
