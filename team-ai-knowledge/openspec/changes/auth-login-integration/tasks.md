# Tasks: auth-login-integration

## Backend Tasks
- [x] T1 — Bổ sung route kép `api/auth` và `api/v1/auth` trên `AuthController.cs` (REQ-02)
- [x] T2 — Thêm kiểm tra mật khẩu `user.Password == request.Password` trong `AuthService.cs` và thêm thuộc tính `Role` trong `UserInfo` record (REQ-01)
- [x] T3 — Cập nhật và bổ sung các Unit Test trong `UserAuthenticationTests.cs` với đầy đủ input/output (REQ-01)
- [x] T4 — Tạo file tóm tắt `docs/worklogs/2026-10-13_BE-AUTH_login-integration.md` và cập nhật `CHANGELOG.md` trong `MT_GRMS_BACKEND` (Quy định bắt buộc pre-commit hook)

## Frontend Tasks
- [x] T5 — Cấu hình `server.proxy` trong `MT_GRMS_FRONTEND/vite.config.ts` để proxy `/api` tới `http://localhost:5232` (REQ-02)
- [x] T6 — Cập nhật `authTypes.ts` và `authService.ts` gửi `{ usernameOrEmail, password, tenantCode }`, hỗ trợ role mapping và thông báo lỗi thật (REQ-01, REQ-02)
- [x] T7 — Kiểm tra và đảm bảo `LoginPage.tsx` xử lý thông báo lỗi sắc nét và điều hướng đúng phân hệ (`CASHIER` -> `/pos`, `ADMIN` -> `/admin/dashboard`) (REQ-03)

## Verification & Testing Tasks
- [x] T8 — Chạy `dotnet test` xác minh toàn bộ test cases Backend PASS 100% (REQ-01)
- [x] T9 — Chạy kiểm tra build Frontend TypeScript (`npm run build` hoặc type check) không có lỗi (REQ-02, REQ-03)
