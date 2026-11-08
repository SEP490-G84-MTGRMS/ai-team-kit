# Tasks: pos-cash-control-nav-and-shift-history

## 1. Backend & Unit Tests
- [ ] T1 — Bổ sung Eager Loading `Participants` và `CloseConfirmations` trong `ShiftRepository.GetHistoryAsync` (`MT_GRMS_BACKEND`) (REQ-SHIFT-HIST-01)
- [ ] T2 — Viết Unit Tests tự động cho `GetShiftHistoryAsync` và `ConfirmHandoverAsync` trong `ShiftManagementServiceTests.cs` (REQ-SHIFT-HIST-01, REQ-SHIFT-HIST-02)

## 2. Frontend — POS Cleanup & Portal Navigation
- [ ] T3 — Xóa mục "Hạn mức & Duyệt chi két" và prop `pendingApprovalCount` trong `PosHeader.tsx` & `PosCheckoutPage.tsx` (`MT_GRMS_FRONTEND`) (REQ-SHIFT-05)
- [ ] T4 — Đồng bộ menu "Cài đặt & Thiết lập" trên `AppTopNav.tsx` dẫn tới `StorePosCashControlPage.tsx` chuẩn xác khớp ảnh thiết kế (REQ-NAV-02)

## 3. Frontend — Work Schedule & Shift History
- [ ] T5 — Thêm button "Lịch sử giao ca" tại thanh công cụ trang `WorkSchedulePage.tsx` chuyển tiếp `branchId` (REQ-NAV-01)
- [ ] T6 — Tinh gọn `PosShiftPage.tsx`: loại bỏ tab mock kiểm đếm, kết nối API `posShiftApi.getShiftHistory` hiển thị bảng ca và 4 thẻ KPI thật (REQ-SHIFT-HIST-01)
- [ ] T7 — Bổ sung chức năng xác nhận bàn giao ca (`ConfirmHandover`) trên giao diện lịch sử ca (REQ-SHIFT-HIST-02)

## 4. Verification & Quality Gate
- [ ] T8 — Chạy toàn bộ Unit Tests `dotnet test` và build Front-end `tsc -b && vite build` kiểm chứng không có lỗi (REQ-ALL)
