# Tasks: pos-shift-sidebar-multistaff-and-fix400

- [x] T1 — [DB / Seed] Xác minh & đảm bảo 2 tài khoản nhân viên `0917778888` (Phạm Thị Yến) và `0915556666` (Nguyễn Văn Minh) thuộc Chi nhánh Ba Đình (`BR-AN-01`), sẵn sàng đăng nhập test bán cùng ca (REQ-MULTI-STAFF-SHIFT-TESTING)
- [x] T2 — [Backend] Cải tiến `ShiftsController.GetShiftHistory` chấp nhận `Guid? branchId` nullable và fallback tự động về `_tenantContext.CurrentBranchId` nếu rỗng, tránh lỗi 400 (REQ-SHIFT-HISTORY-QUERY)
- [x] T3 — [Frontend] Thay thế mock `AN_NHIEN_BRANCHES` trong `PosShiftPage.tsx` bằng API tải chi nhánh thực tế (`branchApi.getBranches` / `employeeApi.getBranches`), đảm bảo `selectedBranchId` là GUID hợp lệ (REQ-SHIFT-HISTORY-QUERY)
- [x] T4 — [Frontend] Đưa `PosShiftPage` vào route quản trị `/store-owner/shifts` bên trong `StoreOwnerLayout` (`router.tsx`), cập nhật nút "Lịch sử giao ca" tại `WorkSchedulePage.tsx` điều hướng đến route có Sidebar này (REQ-SHIFT-PAGE-LAYOUT)
- [x] T5 — [Frontend] Xóa bỏ `ZReportModal` và toàn bộ trigger in báo cáo kết ca K80 khi đóng ca tại `PosCheckoutPage.tsx` và nút in trong bảng lịch sử tại `PosShiftPage.tsx`, thay bằng Toast thông báo tinh gọn (REQ-SHIFT-CLOSE-UX-CLEANUP)
- [x] T6 — [Frontend] Xóa hiển thị `&bull; Quầy #01` trên thanh `PosHeader.tsx`, chỉ giữ thông tin Chi nhánh (REQ-POS-HEADER-CLEANUP)
- [x] T7 — [Test & Verification] Chạy toàn bộ test suite Backend (`dotnet test`) và kiểm tra build Frontend (`npm run build`), xác nhận 100% PASS không lỗi regression (All REQs)
