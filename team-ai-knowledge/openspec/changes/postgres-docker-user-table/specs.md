# Specs: postgres-docker-user-table

## ADDED Requirements

### Requirement: REQ-AUTH-DB-01 Triển khai PostgreSQL 16 trên Docker Compose
Hệ thống MUST cung cấp tệp `docker-compose.yml` để khởi chạy máy chủ PostgreSQL 16 Alpine với cấu hình kết nối chuẩn trên cổng 5432.

#### Scenario: Khởi chạy container PostgreSQL thành công
- **GIVEN** máy phát triển đã cài Docker và chưa chạy dịch vụ nào trên cổng 5432.
- **WHEN** thực hiện lệnh `docker compose up -d` tại thư mục backend.
- **THEN** container `mtgrms-postgres` MUST khởi động ở trạng thái healthy, lắng nghe trên cổng 5432 và tạo sẵn database `mtgrms_db`.

#### Scenario: Lưu trữ dữ liệu bền vững qua Named Volume
- **GIVEN** container `mtgrms-postgres` đang chạy và đã có dữ liệu.
- **WHEN** container bị dừng hoặc restart (`docker compose down && docker compose up -d`).
- **THEN** dữ liệu MUST được bảo toàn nguyên vẹn từ volume `postgres_data`.

---

### Requirement: REQ-AUTH-DB-02 Cấu hình Bảng User Tối Giản với String Uid
Hệ thống MUST định nghĩa thực thể `User` và bảng cơ sở dữ liệu `users` chỉ chứa đúng 3 trường: `id` (chuỗi Uid), `username` và `password`.

#### Scenario: Lưu trữ thực thể User với string Uid
- **GIVEN** một tài khoản người dùng mới có `Id = "usr_admin_01"`, `Username = "admin"`, `Password = "Admin@123"`.
- **WHEN** thực thể được lưu vào bảng `users`.
- **THEN** bản ghi MUST được tạo thành công với khóa chính `id` là kiểu chuỗi và không yêu cầu bất kỳ trường bắt buộc nào khác.

#### Scenario: Ràng buộc tính duy nhất của Username
- **GIVEN** bảng `users` đã tồn tại tài khoản có username `"admin"`.
- **WHEN** có một bản ghi khác cố gắng chèn vào bảng với username `"admin"`.
- **THEN** cơ sở dữ liệu MUST từ chối và ném lỗi vi phạm Unique Constraint `ix_users_username`.

---

### Requirement: REQ-AUTH-DB-03 EF Core Initial Migration Cho Bảng Users
Hệ thống MUST tạo một bản Migration đầu tiên chỉ sinh duy nhất bảng `users` và áp dụng thành công vào PostgreSQL.

#### Scenario: Sinh migration độc lập chỉ chứa bảng users
- **GIVEN** cấu hình DbContext của dự án `MT_GRMS_BACKEND`.
- **WHEN** thực hiện lệnh tạo migration `InitialCreate_UserOnly`.
- **THEN** tệp Migration sinh ra MUST chỉ chứa lệnh `migrationBuilder.CreateTable("users", ...)` mà không chứa bất kỳ bảng nào khác.

#### Scenario: Áp dụng migration vào cơ sở dữ liệu và seed tài khoản mẫu
- **GIVEN** container PostgreSQL 16 đang hoạt động.
- **WHEN** thực hiện lệnh `dotnet ef database update`.
- **THEN** bảng `users` MUST xuất hiện trong schema của database `mtgrms_db` và có sẵn 1 tài khoản quản trị viên mẫu để kiểm thử đăng nhập ngay lập tức.

---

## Acceptance Checklist
- [ ] REQ-AUTH-DB-01: Container `mtgrms-postgres` khởi chạy thành công qua `docker compose up -d`.
- [ ] REQ-AUTH-DB-02: Thực thể `User` có `Id` kiểu string Uid, `Username`, `Password`, ràng buộc Unique trên `Username`.
- [ ] REQ-AUTH-DB-03: Migration chỉ sinh đúng bảng `users` và `dotnet ef database update` hoàn tất không lỗi.
- [ ] Đăng nhập thử nghiệm thành công với tài khoản seed `admin`.
- [ ] Toàn bộ UnitTests & IntegrationTests tiếp tục PASS 100%.
