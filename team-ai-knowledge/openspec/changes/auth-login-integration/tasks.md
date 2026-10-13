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
