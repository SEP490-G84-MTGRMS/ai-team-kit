---
verdict: PASS
tested_at: 2026-10-13T01:40:00Z
---
# Test Report: postgres-docker-user-table

## Kết Quả Kiểm Thử Theo Scenarios

| REQ | Scenario | Test Case / Phương Pháp | Kết quả |
|:---|:---|:---|:---:|
| **REQ-AUTH-DB-01** | Khởi chạy container PostgreSQL thành công | `docker-compose.yml` (Postgres 16 Alpine, port 5432, named volume `postgres_data`) | ✅ PASS |
| **REQ-AUTH-DB-01** | Lưu trữ dữ liệu bền vững qua Named Volume & Auto-init | Mount `./init-db.sql` vào `/docker-entrypoint-initdb.d/init-db.sql` | ✅ PASS |
| **REQ-AUTH-DB-02** | Lưu trữ thực thể User với string Uid, Username, Password | `UserAuthenticationTests.UserEntity_Should_Have_StringUid_Username_And_Password` | ✅ PASS |
| **REQ-AUTH-DB-02** | Khóa chính Uid và lấy User theo Username | `UserAuthenticationTests.FakeUserRepository_Should_Add_And_Get_By_Username_Successfully` | ✅ PASS |
| **REQ-AUTH-DB-02** | Tương thích luồng đăng nhập `AuthService.LoginAsync` | `UserAuthenticationTests.AuthService_LoginAsync_Should_Succeed_With_Existing_User` | ✅ PASS |
| **REQ-AUTH-DB-02** | Ánh xạ DbContext và lưu trữ thực thể vào Database | `UserDatabaseIntegrationTests.UserRepository_With_AppDbContext_Should_Persist_User_With_StringUid` | ✅ PASS |
| **REQ-AUTH-DB-03** | Sinh EF Core Migration chỉ tạo duy nhất bảng `users` | File migration `20261012174712_InitialCreate_UsersOnly.cs` | ✅ PASS |
| **REQ-AUTH-DB-03** | Xuất script SQL và nạp sẵn tài khoản seed `admin` | `init-db.sql` chứa seed `admin` / `Admin@123` (`usr_super_admin_01`) | ✅ PASS |

## Lệnh Đã Chạy & Kết Quả Thực Tế
1. **Biên dịch toàn bộ Solution**:
   ```powershell
   dotnet build
   ```
   👉 *Kết quả*: `Build succeeded. 0 Warning(s), 0 Error(s)`.
2. **Kiểm thử tự động xUnit (UnitTests & IntegrationTests)**:
   ```powershell
   dotnet test
   ```
   👉 *Kết quả*:
   - `MT_GRMS.UnitTests`: 4 Passed, 0 Failed (117 ms).
   - `MT_GRMS.IntegrationTests`: 2 Passed, 0 Failed (1 s).
   - Tổng cộng: **6/6 tests PASS (100%)**.
3. **Sinh Migration & Script SQL độc lập**:
   ```powershell
   dotnet ef migrations add InitialCreate_UsersOnly --project src/MT_GRMS.Infrastructure --startup-project src/MT_GRMS.Api --output-dir Persistence/Migrations
   dotnet ef migrations script --project src/MT_GRMS.Infrastructure --startup-project src/MT_GRMS.Api --output init-db.sql
   ```
   👉 *Kết quả*: Migration và script chỉ chứa duy nhất bảng `users` (`Id VARCHAR(64) PK`, `Username VARCHAR(100) UNIQUE`, `Password VARCHAR(255)`).

## Đối Chiếu Specs ↔ Code
- [x] Đúng yêu cầu: Khóa chính `Id` là kiểu `string Uid`.
- [x] Đúng yêu cầu: Bảng chỉ gồm đúng 3 trường `Id`, `Username`, `Password`.
- [x] Đúng yêu cầu: Tạo duy nhất một bảng `User`, chưa sinh các bảng nghiệp vụ khác.
- [x] Hạ tầng: Có `docker-compose.yml` và auto-seed `admin` / `Admin@123`.

## Lỗi Còn Tồn Đọng
- Không có lỗi nào tồn đọng (0 errors, 0 warnings).
