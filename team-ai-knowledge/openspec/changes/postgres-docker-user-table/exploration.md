# EXP-2026-10-12-POSTGRES-USER: Khảo sát Triển khai PostgreSQL Docker & Bảng User Tối Giản

## 1. Hiện Trạng Code & Vấn Đề
- **Mục tiêu**: Thiết lập cơ sở dữ liệu vật lý PostgreSQL 16 chạy trên Docker và khởi tạo duy nhất bảng `users` với cấu trúc tối giản theo chỉ đạo trực tiếp của người dùng:
  - Trường `Id` là kiểu `string Uid` (ví dụ định dạng `usr_...` hoặc string UUID).
  - Bảng chỉ chứa đúng 3 trường: `Id`, `Username`, `Password`.
  - Phục vụ kiểm thử luồng đăng nhập Authentication (JWT/Session) nhanh chóng, độc lập mà không bị phụ thuộc vào các quan hệ bảng phức tạp khác.
- **Hiện trạng codebase `MT_GRMS_BACKEND`**:
  - `User.cs` cũ đang kế thừa `BaseTenantEntity` với `Guid Id`, nhiều trường phụ (`Email`, `FullName`, `Phone`, `RoleId`, `BranchId`) và liên kết khóa ngoại với `Role`.
  - `AppDbContext.cs` đang khai báo `DbSet` cho cả 9 entities và có `Global Query Filter` trên `BaseTenantEntity`.
  - Chưa có tệp `docker-compose.yml` để chạy PostgreSQL 16 trên môi trường local.
  - Chưa có bất kỳ EF Core Migration nào được sinh ra.

## 2. Bản Đồ Code Bị Ảnh Hưởng
```
docker-compose.yml (Mới) -> Khởi chạy container PostgreSQL 16 (port 5432)
   │
src/MT_GRMS.Domain/Entities/Identity/User.cs -> Tối giản hóa: Id (string Uid), Username, Password
   │
src/MT_GRMS.Infrastructure/Persistence/Configurations/UserConfiguration.cs -> Fluent API cho bảng "users"
   │
src/MT_GRMS.Infrastructure/Persistence/AppDbContext.cs -> Cấu hình DbSet<User> và điều chỉnh filter
   │
src/MT_GRMS.Infrastructure/Repositories/UserRepository.cs -> Cập nhật tương thích với string Id
   │
src/MT_GRMS.Application/Auth/ -> Tương thích UserInfo với string Id
```

## 3. Assumptions & Constraints
- **[ASSUMPTION-01]**: Cổng 5432 trên máy trạm sẵn sàng để ánh xạ cho container PostgreSQL.
- **[ASSUMPTION-02]**: Định dạng `Id` là `string` cho phép sinh chuỗi Uid linh hoạt (chẳng hạn `usr_` + timestamp/guid hoặc chuỗi Guid ngắn).
- **[CONSTRAINT]**: Bảng `users` chỉ chứa 3 cột: `id`, `username`, `password` (lưu hash mật khẩu) đúng theo yêu cầu.
- **[CONSTRAINT]**: Bộ test tự động phải tiếp tục build và chạy PASS.

## 4. Non-Goals
- Không tạo các bảng `products`, `orders`, `batches`, `roles`... trong migration lần này.
- Chưa tạo giao diện frontend (ở bước này chỉ phục vụ hạ tầng DB & backend).

## 5. So Sánh Các Phương Án Kỹ Thuật
- **Phương án 1 (Khuyên dùng - Dedicated Minimal User Entity)**:
  - Tách `User` thành thực thể độc lập không phụ thuộc `BaseTenantEntity` (`Id` string Uid, `Username`, `Password`).
  - Viết `UserConfiguration` ánh xạ chính xác vào bảng `users`.
  - Tạo Initial Migration chỉ sinh duy nhất bảng `users`.
  - Cập nhật `IUserRepository` và `AuthService` tương thích với `string Id`.
  - *Ưu điểm*: Cực kỳ sạch, đúng 100% yêu cầu người dùng, không bị ràng buộc ngoại lai.
- **Phương án 2 (Giữ BaseTenantEntity và bỏ qua field)**:
  - Cho `User` kế thừa `BaseTenantEntity` nhưng ẩn các trường bằng Fluent API `builder.Ignore(...)`.
  - *Nhược điểm*: `BaseTenantEntity` đang fix cứng `public Guid Id`, không đổi sang `string Uid` được nếu không sửa lớp cha, dễ gây xung đột với các Entity khác.

👉 **Quyết định**: Chọn **Phương án 1**.

## 6. Rủi ro & Cách Giảm Thiểu
- **Rủi ro**: `UserInfo` DTO trong `AuthDtos.cs` đang dùng `Guid Id`.
- **Cách giảm thiểu**: Cập nhật `UserInfo(string Id, ...)` hoặc hỗ trợ chuyển đổi linh hoạt để đảm bảo hợp đồng API trả về chuỗi Uid nhất quán cho client.
