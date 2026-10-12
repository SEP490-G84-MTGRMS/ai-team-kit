# Specs: database-storage-selection

## Invariants & Requirements

### Requirement: REQ-DB-01 Chuẩn hóa PostgreSQL Provider cho AppDbContext
Hệ thống MUST kích hoạt `Npgsql.EntityFrameworkCore.PostgreSQL` làm cơ chế Data Access chính thức khi có cấu hình `ConnectionStrings:DefaultConnection`.

#### Scenario: Khởi động API với chuỗi kết nối PostgreSQL
- **GIVEN** ứng dụng được cấu hình `ConnectionStrings:DefaultConnection` chứa thông tin kết nối PostgreSQL (ví dụ `Host=localhost;Port=5432;Database=mtgrms_db...`).
- **WHEN** dịch vụ `AddInfrastructureServices` được đăng ký trong `Program.cs`.
- **THEN** `AppDbContext` MUST được cấu hình qua `UseNpgsql` với cờ `EnableRetryOnFailure` và MigrationsAssembly trỏ về `MT_GRMS.Infrastructure`.

#### Scenario: Fallback sang InMemory khi chạy Unit Test
- **GIVEN** ứng dụng hoặc test runner khởi tạo cấu hình với chuỗi kết nối rỗng hoặc không có.
- **WHEN** `AddInfrastructureServices` được gọi trong môi trường kiểm thử.
- **THEN** `AppDbContext` MUST tự động cấu hình `UseInMemoryDatabase("MT_GRMS_Db")` để đảm bảo test chạy thành công mà không phụ thuộc hạ tầng mạng.

---

### Requirement: REQ-DB-02 Bảo toàn Bộ lọc Cô lập Đa người thuê (Multi-Tenant Invariant)
Hệ thống MUST bảo đảm cơ chế Global Query Filter trên 9 Domain Entities không bị phá vỡ khi chuyển dịch / chuẩn hóa sang PostgreSQL.

#### Scenario: Truy vấn dữ liệu tự động gắn điều kiện TenantId
- **GIVEN** hệ thống có 2 tenants khác nhau trong cơ sở dữ liệu (`tenant_a` và `tenant_b`).
- **WHEN** người dùng thuộc `tenant_a` gửi yêu cầu truy vấn danh sách `Products` hoặc `Orders`.
- **THEN** câu lệnh SQL được EF Core sinh ra MUST tự động chứa mệnh đề `WHERE is_deleted = false AND tenant_id = 'tenant_a'`, ngăn chặn 100% rò rỉ dữ liệu chéo.

---

### Requirement: REQ-DB-03 Định dạng Dữ liệu & Tiền tệ Chính xác
Hệ thống MUST cấu hình kiểu dữ liệu cột tiền tệ VND là `decimal(18,2)` và ngày giờ dạng UTC trên PostgreSQL.

#### Scenario: Lưu trữ giao dịch tiền tệ không làm tròn sai số
- **GIVEN** một giao dịch thanh toán hoặc giá bán lẻ có giá trị tiền tệ cụ thể (ví dụ `56000.00`).
- **WHEN** thực thể `Product` hoặc `CashbookTransaction` được lưu vào PostgreSQL.
- **THEN** giá trị được lưu chính xác dưới dạng `numeric(18,2)` không bị sai lệch số thập phân hoặc lỗi floating-point.

---

### Requirement: REQ-DB-04 Chuẩn hóa Môi trường Local Docker Compose
Hệ thống MUST cung cấp tệp `docker-compose.yml` tại thư mục backend để khởi chạy PostgreSQL 16 nhất quán trên mọi máy trạm.

#### Scenario: Khởi chạy môi trường cơ sở dữ liệu qua Docker
- **GIVEN** lập trình viên mới clone dự án và đã cài đặt Docker.
- **WHEN** thực thi lệnh `docker compose up -d`.
- **THEN** container PostgreSQL 16 MUST khởi động tại cổng 5432, tạo sẵn cơ sở dữ liệu `mtgrms_db` với user/password khớp với cấu hình trong `appsettings.json`.

---

## Acceptance Checklist
- [ ] REQ-DB-01: `AppDbContext` kết nối thành công tới PostgreSQL với đầy đủ cấu hình retry logic.
- [ ] REQ-DB-02: Bộ lọc cô lập `TenantId` và `IsDeleted` hoạt động thông suốt trên PostgreSQL.
- [ ] REQ-DB-03: Cột tiền tệ lưu trữ `decimal(18,2)` và các trường thời gian lưu chuẩn UTC.
- [ ] REQ-DB-04: Tệp `docker-compose.yml` được định nghĩa chuẩn xác và có thể khởi động ngay lập tức.
- [ ] Mọi Unit Test và Integration Test hiện có đều vượt qua (100% PASS).
