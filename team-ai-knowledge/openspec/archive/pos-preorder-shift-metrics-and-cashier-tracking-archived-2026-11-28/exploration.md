# EXP-2026-11-08-002: Khám phá luồng ghi nhận chốt ca và theo dõi người tạo của Đơn đặt trước

## 1. Tóm tắt vấn đề & Khả năng tái hiện (Reproduction)
Đã tái hiện và làm rõ 2 vấn đề lớn trong quy trình Đơn đặt trước (Pre-Order):
1. **Thiếu thông tin người tạo đơn đặt trước trên giao diện**:
   - Trong bảng danh sách Đơn Đặt Trước & Giữ Kho (`InvoiceManagementPage.tsx`), bảng hiện có 9 cột nhưng hoàn toàn thiếu cột "Người tạo" (khác với bảng Hóa đơn bán lẻ có cột "Người tạo").
   - `PreOrderDTO` và request `PreOrderCreateRequest` không có trường `CashierName`.
   - Khi tạo đơn hoặc giao hàng, người dùng không thể biết thu ngân nào đã nhận cọc và thu ngân nào đã giao hàng cho khách.
2. **Lỗi tính sai tiền ca chốt két khi có đơn đặt trước (Shift Z-Report)**:
   - Trong `ShiftRepository.GetShiftSalesMetricsAsync(shiftId)`:
     `decimal cashSales = orders.Where(o => o.ShiftId == shiftId && o.Status != "Cancelled").Sum(o => o.FinalAmount);`
   - Đơn đặt trước khi mới tạo đang ở trạng thái `PendingPickup`, khách hàng chỉ đặt cọc một phần (`DepositAmount`, ví dụ 50.000 đ trên tổng đơn 500.000 đ). Nhưng hàm lại cộng cả `FinalAmount` (500.000 đ) vào doanh số ca tạo đơn.
   - Khiến két lý thuyết `ExpectedCash` đòi hỏi thêm 450.000 đ tiền mặt mà thực tế khách chưa trả!
3. **Thất thoát ghi nhận tiền thu phần còn lại khi giao hàng ở ca sau**:
   - Khi khách đến quầy nhận hàng (thường sau 1-2 ngày ở ca làm việc khác), thu ngân ca giao hàng thu nốt 450.000 đ tiền mặt và bấm hoàn tất đơn.
   - Backend `FulfillPreOrderAsync` chỉ đổi trạng thái đơn thành `Completed` mà không hề ghi nhận 450.000 đ này vào ca làm việc hiện tại của thu ngân giao hàng. Két ca giao hàng bị thừa 450.000 đ không rõ nguồn gốc.

---

## 2. Phân tích nguyên nhân gốc rễ (Root Cause Analysis)
- **Thiếu cột UI**: `InvoiceManagementPage.tsx` chưa định nghĩa header và ô dữ liệu cho "Người tạo" trong bảng Đơn đặt trước.
- **Thiếu snapshot DTO**: `PreOrderCreateRequest` và `PreOrderFulfillRequest` chưa có trường `CashierName`.
- **Entity Order**: Chưa lưu thông tin người giao hàng `FulfilledByCashierName` và thời điểm giao `FulfilledAtUtc`.
- **Hàm tính doanh số ca**: `GetShiftSalesMetricsAsync` tính `Sum(o => o.FinalAmount)` mà không phân biệt đơn `PendingPickup` chỉ mới thu `DepositAmount`.
- **Hàm FulfillPreOrderAsync**: Chưa tích hợp với ca làm việc đang mở (`activeShift`) để ghi nhận khoản thu phần còn lại.

---

## 3. Các phương án giải quyết (Options Considered)

### Phương án A: Chỉ sửa hiển thị Frontend (Không can thiệp két backend - KHÔNG KHUYẾN NGHỊ)
- **Hạn chế**: Không giải quyết được bài toán chốt ca. Tiền mặt thực tế trong két và sổ ca chốt két vẫn tiếp tục bị lệch nghiêm trọng.

### Phương án B: Chuẩn hóa toàn diện Fullstack - Ghi nhận đúng dòng tiền ca & Theo dõi thu ngân 2 giai đoạn (CHỌN)
1. **Theo dõi nhân sự (Cashier Tracking)**:
   - Thêm cột `FulfilledByCashierName` (varchar 150) và `FulfilledAtUtc` vào bảng `Orders`.
   - `PreOrderCreateRequest` nhận `CashierName` -> lưu vào `Order.CashierName`.
   - `PreOrderFulfillRequest` nhận `CashierName` -> lưu vào `Order.FulfilledByCashierName`.
   - Bổ sung cột "Người tạo / Giao hàng" trên giao diện bảng Đơn đặt trước (`InvoiceManagementPage.tsx`).
2. **Chuẩn hóa thông số két ca tạo đơn cọc**:
   - Trong `ShiftRepository.GetShiftSalesMetricsAsync`:
     Đơn hàng ở trạng thái `PendingPickup` chỉ cộng `DepositAmount` vào doanh số ca (thay vì toàn bộ `FinalAmount`).
3. **Ghi nhận tiền thu nốt vào ca giao hàng**:
   - Trong `OrderService.FulfillPreOrderAsync`:
     Khi thu nốt `remainingAmount`, tìm ca làm việc đang mở của chi nhánh (`activeShift`):
     - Nếu thanh toán `CASH`: Tự động tạo một phiếu thu tiền vào két `ShiftCashMovement` (loại `IN`, danh mục `PREORDER_PICKUP`, số tiền `remainingAmount`) và cập nhật `TotalCashIn`, `ExpectedCash` của ca giao hàng.
     - Nếu thanh toán `VIETQR`/Chuyển khoản: Cập nhật `TotalBankRevenue += remainingAmount`.

---

## 4. Giả định (Assumptions) & Ràng buộc (Constraints)
- Đơn đặt trước có thể tạo tại ca A và được giao tại ca B (khác ngày, khác thu ngân).
- Số tiền cọc tối thiểu ≥ 10% giá trị đơn hàng.
- Tiền thu phần còn lại phải được phản ánh ngay lập tức vào ca trực của người giao hàng.
