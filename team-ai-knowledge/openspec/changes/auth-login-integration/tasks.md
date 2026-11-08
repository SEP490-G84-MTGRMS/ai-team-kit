# Tasks: auth-login-integration

## Backend Tasks
- [x] T1 — Bổ sung route kép `api/auth` và `api/v1/auth` trên `AuthController.cs` (REQ-02)
- [x] T2 — Chuẩn hóa HTTP Status Codes (200 OK, 400 Bad Request, 401 Unauthorized) đóng gói qua `ApiResponse<T>`, loại bỏ mock fallback ngầm (REQ-01)
- [x] T3 — Kiểm tra mật khẩu `user.Password == request.Password` trong `AuthService.cs` và thêm thuộc tính `Role` trong `UserInfo` record (REQ-01)
- [x] T4 — Bổ sung và cập nhật bộ kiểm thử đơn vị & tích hợp (11 Unit Tests + 5 Integration Tests) bao phủ đầy đủ kịch bản 200, 400, 401 (REQ-01)
- [x] T5 — Tạo file tóm tắt `docs/worklogs/2026-10-13_BE-AUTH_login-integration.md` và cập nhật `CHANGELOG.md` trong `MT_GRMS_BACKEND` (Quy định bắt buộc pre-commit hook)

## Frontend Tasks
- [x] T6 — Cấu hình `server.proxy` trong `MT_GRMS_FRONTEND/vite.config.ts` để proxy `/api` tới `http://localhost:5232` (REQ-02)
- [x] T7 — Cập nhật `authTypes.ts` và `authService.ts` gửi `{ usernameOrEmail, password, tenantCode }`, bóc tách `ApiResponse` envelope và hiển thị lỗi thật (REQ-01, REQ-02)
- [x] T8 — Kiểm tra và đảm bảo `LoginPage.tsx` xử lý thông báo lỗi sắc nét và điều hướng đúng phân hệ (`CASHIER` -> `/pos`, `ADMIN` -> `/admin/dashboard`) (REQ-03)

## Verification & Testing Tasks
- [x] T9 — Chạy `dotnet test` xác minh toàn bộ test cases Backend PASS 100% (16/16 tests) (REQ-01)
- [x] T10 — Chạy kiểm tra build Frontend TypeScript (`npm run build`) hoàn thành thành công không có lỗi (REQ-02, REQ-03)

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: auth-login-feature -->
# Tasks: auth-login-feature

## Backend Tasks (ASP.NET Core 8 Web API)

- [x] BE-01: Setup AuthDtos (LoginRequest, LoginResponse, UserInfo, RefreshTokenRequest)
- [x] BE-02: Setup FluentValidation LoginRequestValidator
- [x] BE-03: Implement IAuthService & AuthService (LoginAsync, RefreshTokenAsync)
- [x] BE-04: IUserRepository & GenericRepository User entity integration
- [x] BE-05: POST /api/auth/login endpoint trong AuthController
- [x] BE-06: POST /api/auth/refresh endpoint trong AuthController
- [x] BE-07: POST /api/auth/logout endpoint trong AuthController
- [x] BE-08: Đăng ký Dependency Injection trong Application và Infrastructure
- [x] BE-09: Unit tests & Integration tests passing 100%

## Frontend Tasks (React 19 / TypeScript / Vite)

- [x] FE-01: Tinh giản Login form (Phone-First trực diện: chỉ SĐT + Mật khẩu, bỏ hoàn toàn tabs và trường mã chuỗi tenant)
- [x] FE-02: API integration AuthService.ts với fallback demo accounts (hỗ trợ khớp SĐT/email)
- [x] FE-03: Zustand auth store (token, user, isAuthenticated, setAuth, logout)
- [x] FE-04: Axios httpClient interceptor tự động đính kèm token
- [x] FE-05: Protected route guard (ProtectedRoute.tsx)
- [x] FE-06: Logout button trên AdminTopbar với chuyển hướng /auth/login
- [x] FE-07: Loại bỏ trường Email trong Form Đăng ký (Phone-first UX cho tiểu thương tạp hóa)
- [x] FE-08: Sắp xếp hàng mật khẩu 2 cột và tối ưu tỷ lệ Zero-Scroll (vừa vặn 100% không cần cuộn)
- [x] FE-09: Đồng bộ Design System KiotViet Blue Palette & 100% Monochrome SVG Icons

## Estimate & Verification
- BE: Hoàn tất (Build 0 warnings, test PASS)
- FE: Hoàn tất (Build 0 errors, Browser subagent xác nhận Zero-Scroll & UI tinh gọn)


<!-- Tasks sáp nhập từ: user-table-database-attributes -->
# Tasks: user-table-database-attributes

## Database Design & Data Dictionary
- [ ] T1 — Cập nhật sơ đồ Mermaid ERD trong `Database_Design_Data_Dictionary.md` bổ sung các trường mới cho `Tenants`, `Users`, `TenantUsers` và thực thể `AuditLogs` (REQ-01, REQ-02, REQ-03, REQ-04).
- [ ] T2 — Cập nhật bảng Từ điển Dữ liệu chi tiết (Phân hệ 1) trong `Database_Design_Data_Dictionary.md` với đầy đủ 20 cột của `Users`, 6 cột của `TenantUsers`, 17 cột của `Tenants` và 13 cột của `AuditLogs` (REQ-01, REQ-02, REQ-03, REQ-04).
- [ ] T3 — Cập nhật mã nguồn C# EF Core (mục 5.3) và Fluent API (mục 5.4) trong `Database_Design_Data_Dictionary.md` cho các thực thể `User`, `Tenant`, `TenantUser`, `AuditLog` (REQ-01, REQ-02, REQ-03, REQ-04).

## Backend Domain & Persistence
- [ ] T4 — Cập nhật thực thể C# `User.cs` trong `MT_GRMS_BACKEND/src/MT_GRMS.Domain/Entities/Identity/` với đầy đủ các thuộc tính an ninh, kiểm toán và phiên đăng nhập (REQ-01).
- [ ] T5 — Cập nhật cấu hình Fluent API `UserConfiguration.cs` trong `MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Persistence/Configurations/` với chỉ mục Unique cho Email, Phone và cấu hình độ dài chuỗi (REQ-01).
- [ ] T6 — Tự động tạo file worklog trong `MT_GRMS_BACKEND/docs/worklogs/` và cập nhật `CHANGELOG.md` theo quy tắc bắt buộc của Git pre-commit hook (REQ-01).

## Verification & Tests
- [ ] T7 — Chạy kiểm thử Unit Tests và Integration Tests cho User Entity trong `MT_GRMS_BACKEND` bảo đảm build và test PASS 100% (REQ-01).


<!-- Tasks sáp nhập từ: postgres-docker-user-table -->
# Tasks: postgres-docker-user-table

## Hạ tầng Docker (DB)
- [x] T1 — Tạo tệp `docker-compose.yml` tại thư mục gốc `MT_GRMS_BACKEND` chạy PostgreSQL 16 Alpine (REQ-AUTH-DB-01)
- [x] T2 — Khởi động container PostgreSQL qua `docker compose up -d` và cấu hình auto-init volume (REQ-AUTH-DB-01)

## Backend & Domain Model (Backend)
- [x] T3 — Cập nhật thực thể `User.cs` trong `MT_GRMS.Domain`: Chỉ chứa `Id` (string Uid), `Username` (string), `Password` (string) (REQ-AUTH-DB-02)
- [x] T4 — Tạo `UserConfiguration.cs` trong `MT_GRMS.Infrastructure/Persistence/Configurations/` ánh xạ bảng `users` (REQ-AUTH-DB-02)
- [x] T5 — Cập nhật `AppDbContext.cs`, `UserRepository` và DTO `UserInfo` tương thích với `User.Id` kiểu string (REQ-AUTH-DB-02)

## Migration & Data Seeding (DB)
- [x] T6 — Tạo EF Core Migration `InitialCreate_UsersOnly` chỉ tạo duy nhất bảng `users` (REQ-AUTH-DB-03)
- [x] T7 — Áp dụng Migration vào PostgreSQL (`dotnet ef migrations script` & `init-db.sql`) và nạp seed user `admin` (REQ-AUTH-DB-03)

## Kiểm thử & Xác minh (Test)
- [x] T8 — Chạy `dotnet test` đảm bảo 100% test PASS và xác minh tính toàn vẹn Solution (REQ-AUTH-DB-01, REQ-AUTH-DB-02, REQ-AUTH-DB-03)
