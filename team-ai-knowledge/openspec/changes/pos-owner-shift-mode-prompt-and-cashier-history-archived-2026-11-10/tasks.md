# Danh Sách Công Việc (Tasks): pos-owner-shift-mode-prompt-and-cashier-history

## 1. Database (Cơ Sở Dữ Liệu)
- [x] T1 — Xác nhận mô hình dữ liệu hiện tại (SalesOrders, ShiftParticipants, FinanceAccounts) tương thích hoàn toàn và không cần tạo EF Core migration mới (REQ-SHIFT-PARTICIPANT-TRACKING-03)

## 2. Backend (MT_GRMS_BACKEND)
- [x] T2 — Bổ sung kiểm tra validation chặt chẽ cho `request.ShiftId` trong `OrderService.CreateOrderAsync`: từ chối nếu chi nhánh không có ca mở hoặc ca đã kết thúc (REQ-OWNER-SHIFT-ROUTING-02)
- [x] T3 — Cập nhật định tuyến dòng tiền mặt (`Till` khi bán vào ca, `Safe` khi bán riêng shiftless) và ghi nhận `ShiftParticipants` cho Chủ cửa hàng / Quản trị viên (REQ-OWNER-SHIFT-ROUTING-02)
- [x] T4 — Tự động đồng bộ nhân viên có lịch làm việc trong ngày vào `ShiftParticipants` khi mở ca và khi truy vấn lịch sử trong `ShiftService.cs` (REQ-SHIFT-PARTICIPANT-TRACKING-03)

## 3. Frontend (MT_GRMS_FRONTEND)
- [x] T5 — Xây dựng component `OwnerShiftModeModal.tsx` cho phép Chủ cửa hàng chọn "Bỏ chung ngăn kéo quầy" hoặc "Tự giữ / Cất két sắt", cấu hình chặn đóng tự do (REQ-OWNER-SHIFT-MODE-01)
- [x] T6 — Tích hợp kiểm tra ca hoạt động của chi nhánh, quản lý `sessionStorage` theo `branchId` và truyền `shiftId` phù hợp trong `PosCheckoutPage.tsx` (REQ-OWNER-SHIFT-MODE-01, REQ-OWNER-SHIFT-ROUTING-02)
- [x] T7 — Bổ sung badge hiển thị trạng thái chế độ bán và nút `[Đổi chế độ]` trên `PosHeader.tsx` kèm fallback tự động khi ca đóng (REQ-OWNER-SHIFT-MODE-01)
- [x] T8 — Hiển thị toàn bộ danh sách nhân viên tham gia ca dạng badges bo tròn trên bảng Lịch sử chốt ca và modal Bàn giao quầy trong `PosShiftPage.tsx` (REQ-SHIFT-PARTICIPANT-TRACKING-03)
- [x] T9 — Chuẩn hóa phông chữ giá sản phẩm (`.pos-product-price`) và ô nhập tiền mặt sang `var(--font-sans)` + `tabular-nums` loại bỏ số 0 chấm giữa; bảo toàn font monospace cho template in nhiệt (REQ-POS-FONT-STANDARDIZATION-04)

## 4. Kiểm Thử & Xác Minh (Test & Verification)
- [x] T10 — Kiểm tra biên dịch và chạy kiểm thử tự động Backend qua `dotnet test` (REQ-OWNER-SHIFT-ROUTING-02)
- [x] T11 — Kiểm tra build production và kiểm tra cú pháp linter Frontend qua `npm run build` và `npx oxlint` (REQ-OWNER-SHIFT-MODE-01, REQ-POS-FONT-STANDARDIZATION-04)
