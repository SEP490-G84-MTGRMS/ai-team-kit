---
verdict: PASS
date: 2026-11-08
change: pos-preorder-shift-metrics-and-cashier-tracking
schema: bug-fix
---

# Báo cáo kiểm thử: Theo dõi người tạo đơn đặt trước và chuẩn hóa thông số két trong chốt ca

## 1. Tổng quan
- **Thay đổi**: `pos-preorder-shift-metrics-and-cashier-tracking`
- **Kết luận (Verdict)**: **PASS**
- **Mục tiêu kiểm thử**:
  1. Hiển thị cột Người tạo / Giao hàng trên giao diện danh sách Đơn đặt trước (`InvoiceManagementPage.tsx`).
  2. Lưu trữ snapshot danh tính người tạo đơn đặt trước (`CashierName`) và người hoàn tất giao hàng (`FulfilledByCashierName`, `FulfilledAtUtc`).
  3. Sửa công thức tính doanh số ca `ShiftRepository.GetShiftSalesMetricsAsync`: chỉ tính tiền cọc thực thu (`DepositAmount`) của đơn `PendingPickup` thay vì cộng toàn bộ `FinalAmount`.
  4. Ghi nhận tiền thu nốt phần còn lại khi giao hàng vào ca làm việc đang mở của thu ngân (`ShiftCashMovement` danh mục `PREORDER_PICKUP` hoặc tăng `TotalBankRevenue`), đảm bảo tiền két khớp 100%.

---

## 2. Bảng đối soát Yêu cầu & Kịch bản

| Mã REQ / Scenario | Nội dung kiểm thử | Phương pháp | Kết quả |
|---|---|---|---|
| **REQ-POS-PREORDER-CASHIER-UI-01** | Bổ sung cột "Người tạo / Giao hàng" trong bảng Đơn Đặt Trước & Giữ Kho | UI Code Inspection & Build Verification | **PASS** |
| Scenario 1: Xem người tạo đơn cọc | Cột hiển thị tên người tạo kèm icon nhân viên: `Tạo: <CashierName>` | UI Code / Mock Data Inspection | **PASS** |
| Scenario 2: Xem người giao hàng khi hoàn tất | Hiển thị người tạo cọc và người hoàn tất đơn: `Giao: <FulfilledByCashierName>` (hoặc "Chờ giao hàng" nếu PendingPickup) | UI Code / Component State Inspection | **PASS** |
| **REQ-POS-PREORDER-CASHIER-SNAPSHOT-02** | Lưu snapshot `CashierName` khi tạo đơn và `FulfilledByCashierName`, `FulfilledAtUtc` khi giao hàng | Unit Test `CreatePreOrderAsync_WithCashierName_PersistsCashierNameAndReturnsInResponse` & `FulfillPreOrderAsync_WithCashierName_RecordsFulfilledByCashierName` | **PASS** |
| Scenario: Thu ngân tạo đơn đặt trước | Backend lưu `CashierName` vào `Order` và phản hồi trong `OrderResponse` | Unit Test | **PASS** |
| **REQ-POS-PREORDER-SHIFT-METRICS-03** | Chuẩn hóa tính tiền két ca: đơn `PendingPickup` chỉ tính `DepositAmount` | Code Inspection & Logic Audit trong `ShiftRepository.GetShiftSalesMetricsAsync` | **PASS** |
| Scenario: Chốt ca có đơn cọc tiền mặt | Đơn 500k, cọc 50k -> Doanh số tiền mặt cộng đúng 50.000 đ, két không bị lệch ảo 450.000 đ | Logic Verification | **PASS** |
| **REQ-POS-PREORDER-FULFILL-SHIFT-04** | Ghi nhận tiền thu phần còn lại vào ca mở của thu ngân giao hàng | Code Inspection trong `OrderService.FulfillPreOrderAsync` | **PASS** |
| Scenario: Giao hàng thu nốt tiền mặt | Tạo `ShiftCashMovement` (loại `IN`, danh mục `PREORDER_PICKUP`), tăng `TotalCashIn` và `ExpectedCash` của ca mở | Integration & Unit Logic Audit | **PASS** |

---

## 3. Tái hiện lỗi: Trước vs Sau (Before & After)

| Hành vi | Trước khi sửa (BUG) | Sau khi sửa (FIXED) |
|---|---|---|
| **Hiển thị người tạo đơn đặt trước** | Bảng Đơn đặt trước không có cột Người tạo; nhân viên và chủ cửa hàng không biết ai là người nhận cọc ban đầu. | Có cột riêng "Người tạo / Giao hàng" hiển thị chi tiết tên thu ngân nhận cọc và người giao hàng thực tế. |
| **Doanh số ca khi nhận cọc** | Ca A nhận cọc 50.000 đ cho đơn 500.000 đ nhưng hệ thống tính `FinalAmount = 500.000 đ` vào doanh số ca, khiến két ca A thiếu hụt ảo 450.000 đ khi chốt ca. | Ca A chỉ ghi nhận đúng số tiền cọc thực nhận `DepositAmount = 50.000 đ`. Tiền két khớp chuẩn từng đồng. |
| **Dòng tiền ca khi giao hàng & thu nốt tiền** | Ca B giao hàng thu nốt 450.000 đ tiền mặt nhưng tiền không được tính vào ca B, khiến két thực tế ca B dư 450.000 đ so với sổ sách hệ thống. | Ca B tự động sinh phiếu thu `ShiftCashMovement` danh mục `PREORDER_PICKUP` số tiền 450.000 đ, cộng vào `ExpectedCash` của ca B. Cả ca A và ca B đều cân bằng két 100%. |

---

## 4. Kết quả kiểm thử tự động

### 4.1. Backend Unit Tests
- **Lệnh thực thi**: `dotnet test MT_GRMS_BACKEND/tests/MT_GRMS.UnitTests/MT_GRMS.UnitTests.csproj`
- **Kết quả**:
  - `Total`: 529
  - `Passed`: 529
  - `Failed`: 0
  - `Skipped`: 0
  - Thời gian: 2 s

### 4.2. Backend Integration Tests
- **Lệnh thực thi**: `dotnet test MT_GRMS_BACKEND/tests/MT_GRMS.IntegrationTests/MT_GRMS.IntegrationTests.csproj`
- **Kết quả**:
  - `Total`: 44
  - `Passed`: 44
  - `Failed`: 0
  - `Skipped`: 0
  - Thời gian: 2 s

### 4.3. Frontend Build Verification
- **Lệnh thực thi**: `npm --prefix MT_GRMS_FRONTEND run build`
- **Kết quả**:
  - `tsc -b`: 0 lỗi type / compilation
  - `vite build`: Hoàn thành trong 902ms, tạo bundle thành công.

---

## 5. Lỗi tồn đọng
- **Không có lỗi tồn đọng**. Sẵn sàng nghiệm thu và archive change.
