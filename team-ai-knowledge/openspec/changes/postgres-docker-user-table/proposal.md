# Proposal: postgres-docker-user-table

## Vấn đề
- Hệ thống backend `MT_GRMS_BACKEND` đang chuẩn bị tích hợp chức năng đăng nhập Authentication (xác thực người dùng, JWT, phân quyền).
- Hiện tại dự án chưa có môi trường cơ sở dữ liệu vật lý chạy cục bộ, chưa có cấu hình container hóa PostgreSQL 16 qua Docker Compose, và chưa có bảng dữ liệu người dùng (`users`) trong database thật.
- Để phục vụ kiểm thử đăng nhập nhanh chóng, độc lập và tránh việc khởi tạo hàng loạt bảng phức tạp chưa cần thiết, hệ thống cần triển khai PostgreSQL 16 qua Docker và chỉ khởi tạo duy nhất bảng `users`.

## Mục tiêu
- Thiết lập tệp `docker-compose.yml` tại thư mục backend khởi chạy container **PostgreSQL 16 Alpine** với thông số kết nối chuẩn (`mtgrms_db`, port 5432, named persistent volume `postgres_data`).
- Cấu hình provider `Npgsql.EntityFrameworkCore.PostgreSQL` và `UserConfiguration` (Fluent API) cho thực thể `User`.
- Tạo tệp EF Core Initial Migration chỉ chứa duy nhất bảng `users` (gồm các trường: `Id`, `TenantId`, `Username`, `Email`, `PasswordHash`, `FullName`, `Phone`, `RoleId`, `BranchId`, `IsActive`, `CreatedAt`, `UpdatedAt`, `IsDeleted`).
- Áp dụng (Apply) migration thành công vào container PostgreSQL, sẵn sàng cho luồng API Authentication đăng nhập.

## Phạm vi
- **In scope**:
  - Viết `docker-compose.yml` cho PostgreSQL 16 kèm kiểm tra trạng thái sức khỏe (healthcheck).
  - Chuẩn hóa chuỗi kết nối trong `appsettings.json`.
  - Cấu hình Fluent API `UserConfiguration.cs` và cấu hình `AppDbContext` để chỉ sinh duy nhất bảng `users`.
  - Tạo EF Core Migration `InitialCreate_UserTable` và chạy lệnh cập nhật database (`dotnet ef database update`).
  - Hỗ trợ dữ liệu mẫu (Seed Data) tài khoản Admin thử nghiệm đầu tiên phục vụ đăng nhập.
- **Out of scope**:
  - Chưa tạo các bảng nghiệp vụ khác (`Products`, `Orders`, `Batches`, `CashbookTransactions`, `Roles`...).
  - Chưa viết logic mã hóa mật khẩu hoặc sinh JWT Token (thuộc change `auth-login-feature`).

## Người dùng liên quan
- **Developer / Tester**: Có thể bật database PostgreSQL local chỉ với `docker compose up -d` và test ngay API đăng nhập mà không cần cài đặt Postgres thủ công.
- **Chủ cửa hàng / Quản trị viên**: Tài khoản đầu tiên được khởi tạo trong bảng `users` để đăng nhập vào hệ thống.

## Tiêu chí thành công
- [ ] Container PostgreSQL 16 khởi chạy thành công và healthy qua Docker Compose trên cổng 5432.
- [ ] EF Core Migration sinh ra chỉ chứa duy nhất bảng `users` với đầy đủ các chỉ mục (`Index`) trên `(TenantId, Username)` và `(TenantId, Email)`.
- [ ] Lệnh `dotnet ef database update` thực thi thành công, tạo bảng `users` trong cơ sở dữ liệu `mtgrms_db`.
- [ ] Khởi tạo thành công ít nhất 1 tài khoản mẫu (Seed User) để sẵn sàng kiểm thử đăng nhập.
- [ ] Bộ kiểm thử `dotnet test` tiếp tục PASS 100%.
