# Danh Sách Công Việc (Tasks Checklist)

## Phân Nhóm 1: Tinh Gọn Giao Diện POS (UI Cleanup)
- [x] T1 — Gỡ bỏ nút "Về Dashboard" cạnh logo quầy và icon vương miện trên `PosHeader.tsx` (REQ-POS-UI-CLEANUP)
- [x] T2 — Xóa khối chọn nhanh tài khoản kiểm thử trên `LoginPage.tsx` (REQ-POS-UI-CLEANUP)
- [x] T3 — Tinh giản `AddCustomerModal.tsx`: bỏ ô `Mã KH:` và `Nhóm:`, tự động sinh mã ngầm (REQ-POS-UI-CLEANUP)

## Phân Nhóm 2: Đổi Mới Nghiệp Vụ Bán Nợ Tạp Hóa (Debt Refinement)
- [x] T4 — Bỏ hạn mức nợ cứng trên `PosPaymentPanel.tsx` và `PosCheckoutPage.tsx`, bổ sung theo dõi số lần nợ và tổng nợ (REQ-POS-DEBT)
- [x] T5 — Cập nhật Backend `OrderDtos.cs` và `OrderService.cs`: gỡ bỏ kiểm tra `DebtLimit`, bổ sung `CustomerPhone`, `DepositAmount`, `Note` (REQ-POS-DEBT)

## Phân Nhóm 3: Backend Quản Lý Đơn Hàng & Đơn Đặt Trước Giữ Kho (Order Management)
- [x] T6 — Chèn dữ liệu CSDL PostgreSQL 4 hóa đơn bán lẻ + 3 đơn đặt trước giữ kho cho tài khoản `0901234567` trong `DbInitializer.cs` (REQ-POS-ORDER-MGMT)
- [x] T7 — Xóa quy định "100% tại quầy (Không có công nợ lẻ)" và kết nối API Backend trong `InvoiceManagementPage.tsx` (REQ-POS-ORDER-MGMT)

## Phân Nhóm 4: Kiểm Thử & Nghiệm Thu (Testing & Verification)
- [x] T8 — Chạy kiểm thử tự động `dotnet test`: 162/162 Unit tests Backend PASSED 100% (REQ-POS-ORDER-MGMT)
- [x] T9 — Chạy kiểm thử biên dịch `npm run build`: Vite build Frontend 0 lỗi TypeScript (REQ-POS-ORDER-MGMT)
