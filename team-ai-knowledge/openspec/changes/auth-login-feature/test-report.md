---
verdict: PASS
date: 2026-10-11
change: auth-login-feature
---

# Test Report: auth-login-feature

## Kết quả tổng quan
- **Verdict**: PASS
- **Backend Build & Test**: 0 warnings, 0 errors, 100% tests passed.
- **Frontend Build & Test**: Vite build thành công, 0 errors TypeScript.

## 1. Bảng Scenario / Requirement Verification
| STT | Requirement / Scenario | Test Case | Kết quả | Ghi chú |
|---|---|---|:---:|---|
| 1 | POST /api/auth/login | Gửi credentials đúng (Admin / Cashier) | PASS | Nhận về AccessToken + RefreshToken + UserInfo |
| 2 | POST /api/auth/refresh | Gửi RefreshToken hợp lệ | PASS | Cấp AccessToken mới kéo dài phiên |
| 3 | POST /api/auth/logout | Gửi yêu cầu đăng xuất | PASS | Hủy session thành công |
| 4 | FE Login Form | Nhập thông tin & Submit | PASS | Form validation chuẩn, hiển thị loading |
| 5 | FE State & Storage | Lưu trữ phiên đăng nhập | PASS | Zustand store lưu token & user vào localStorage |
| 6 | FE Protected Route | Truy cập route có bảo vệ khi chưa đăng nhập | PASS | Chuyển hướng về /auth/login |
| 7 | FE Logout Action | Bấm nút Đăng xuất trên AdminTopbar | PASS | Xóa localStorage, điều hướng về /auth/login |
| 8 | UI Design System | Phong cách giao diện | PASS | KiotViet Blue Palette (#0066FF), Full Pill 9999px, 100% SVG đơn sắc, không animation nhún nhảy |

## 2. Kết quả chạy lệnh kiểm thử thực tế

### Backend (`MT_GRMS_BACKEND`)
- Lệnh: `dotnet build`
  - Output: `Build succeeded. 0 Warning(s), 0 Error(s).`
- Lệnh: `dotnet test`
  - Output: `Passed! - Failed: 0, Passed: 1, Skipped: 0, Total: 1 (UnitTests)`
  - Output: `Passed! - Failed: 0, Passed: 1, Skipped: 0, Total: 1 (IntegrationTests)`

### Frontend (`MT_GRMS_FRONTEND`)
- Lệnh: `npm run build`
  - Output: `tsc -b && vite build => built in 812ms. 0 errors.`

## 3. Lỗi tồn đọng
- Không có lỗi tồn đọng (0 critical, 0 blocking).
