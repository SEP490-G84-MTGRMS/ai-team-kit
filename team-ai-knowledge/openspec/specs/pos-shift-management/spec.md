# Spec: pos-shift-management

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

### Requirement: REQ-POS-PREORDER-CASHIER-UI-01 — Hiển thị cột Người tạo trên bảng Đơn đặt trước
Bảng danh sách Đơn Đặt Trước & Giữ Kho trên giao diện [`InvoiceManagementPage.tsx`](file:///d:/FPT/FPT_Ky9/SEP490/PhanMen/Code/MT_GRMS_FRONTEND/src/features/pos/pages/InvoiceManagementPage.tsx) MUST có cột "Người tạo", hiển thị rõ ràng tên thu ngân / chủ cửa hàng đã lập đơn nhận cọc, và nếu đơn đã hoàn tất thì hiển thị thêm tên người đã giao hàng.

#### Scenario: Thu ngân xem bảng Đơn đặt trước
- **GIVEN** Đơn đặt trước `PO-2026110801` được tạo bởi `Nguyễn Văn Minh (Nhân viên bán hàng An Nhiên)`.
- **WHEN** Người dùng chuyển sang tab "Đơn Đặt Trước & Giữ Kho" trên trang Quản lý hóa đơn.
- **THEN** Bảng hiển thị cột "Người tạo" với giá trị `Nguyễn Văn Minh (Nhân viên bán hàng An Nhiên)`.

#### Scenario: Đơn đặt trước đã giao hàng hiển thị người hoàn tất
- **GIVEN** Đơn đặt trước `PO-2026110801` được hoàn tất giao hàng bởi thu ngân `Lê Thị Thu Ngân`.
- **WHEN** Xem danh sách đơn đặt trước.
- **THEN** Cột Người tạo hiển thị cả thông tin người lập cọc và người giao hàng: `Tạo: Nguyễn Văn Minh` và `Giao: Lê Thị Thu Ngân`.

---

### Requirement: REQ-POS-PREORDER-CASHIER-SNAPSHOT-02 — Lưu snapshot người tạo và người giao đơn đặt trước
Backend API MUST tiếp nhận `CashierName` trong `PreOrderCreateRequest` để lưu vào `Order.CashierName`, và tiếp nhận `CashierName` trong `PreOrderFulfillRequest` để lưu vào `Order.FulfilledByCashierName` cùng thời gian `Order.FulfilledAtUtc`.

#### Scenario: Thu ngân tạo đơn đặt trước tại quầy
- **GIVEN** Thu ngân `Nguyễn Văn Minh` mở modal Tạo đơn đặt trước, điền cọc 50.000 đ và xác nhận.
- **WHEN** Frontend gọi API `POST /api/v1/orders/pre-orders`.
- **THEN** Backend lưu đơn với `CashierName = "Nguyễn Văn Minh"`, `Status = "PendingPickup"`, `DepositAmount = 50000`.

---

### Requirement: REQ-POS-PREORDER-SHIFT-METRICS-03 — Chuẩn hóa tính tiền két ca khi có đơn đặt cọc
Hàm tính toán chỉ số bán hàng của ca làm việc (`GetShiftSalesMetricsAsync`) MUST chỉ cộng số tiền cọc thực thu (`DepositAmount`) của các đơn ở trạng thái `PendingPickup` vào doanh số ca (`CashSales` hoặc `BankRevenue`), thay vì cộng toàn bộ `FinalAmount`.

#### Scenario: Chốt ca làm việc có phát sinh đơn đặt trước đặt cọc tiền mặt
- **GIVEN** Ca làm việc có vốn đầu ca `OpeningFloat = 1.000.000 đ`.
- **WHEN** Phát sinh 1 đơn đặt trước tổng tiền 500.000 đ, khách cọc tiền mặt 50.000 đ (`DepositAmount = 50.000 đ`, `Status = "PendingPickup"`).
- **THEN** Doanh số tiền mặt của ca `CashSales` được tính đúng là `50.000 đ`, và tiền lý thuyết trong két `ExpectedCash = 1.000.000 + 50.000 = 1.050.000 đ` (khớp chính xác với số tiền mặt thực tế trong két).

---

### Requirement: REQ-POS-PREORDER-FULFILL-SHIFT-04 — Ghi nhận tiền thu phần còn lại vào ca làm việc giao hàng
Khi khách hàng đến nhận hàng và thanh toán phần tiền còn lại (`remainingAmount = FinalAmount - DepositAmount`), hệ thống backend `FulfillPreOrderAsync` MUST tự động ghi nhận số tiền này vào ca làm việc đang mở (`activeShift`) của chi nhánh giao hàng:
- Nếu thanh toán tiền mặt (`CASH`): Tự động tạo một phiếu thu tiền két `ShiftCashMovement` (loại `IN`, danh mục `PREORDER_PICKUP`, số tiền `remainingAmount`) và tăng `activeShift.TotalCashIn`, `activeShift.ExpectedCash`.
- Nếu thanh toán chuyển khoản / QR (`VIETQR`): Tăng `activeShift.TotalBankRevenue += remainingAmount`.

#### Scenario: Giao hàng thu nốt tiền mặt tại ca làm việc hôm sau
- **GIVEN** Đơn đặt trước có tiền còn thiếu phải thu là `450.000 đ`.
- **WHEN** Thu ngân ca hôm sau bấm "Giao hàng & Thu tiền", chọn hình thức Tiền mặt và nhập `amountPaid = 450.000 đ`.
- **THEN** Đơn hàng chuyển sang `Completed`, đồng thời ca làm việc hiện tại của thu ngân được cộng thêm `450.000 đ` vào tiền lý thuyết trong két `ExpectedCash` qua phiếu thu `ShiftCashMovement` hợp lệ, giúp chốt ca khớp 100%.

## Lịch sử
- 2026-11-08 · `pos-preorder-shift-metrics-and-cashier-tracking` · +0 ~4 -0
