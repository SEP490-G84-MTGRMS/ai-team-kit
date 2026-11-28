# Đề xuất sửa lỗi: Theo dõi người tạo đơn đặt trước và chuẩn hóa thông số két trong chốt ca

## 1. Mô tả lỗi & Bất cập thực tế
1. **Thiếu thông tin người tạo đơn đặt trước**:
   - Trên bảng danh sách Đơn Đặt Trước & Giữ Kho (`InvoiceManagementPage.tsx`), giao diện hoàn toàn không có cột "Người tạo" (khác với bảng Hóa đơn bán lẻ đã có).
   - Mô hình dữ liệu `PreOrderDTO` và request `PreOrderCreateRequest` chưa tiếp nhận và hiển thị `CashierName` của nhân viên bán hàng / chủ cửa hàng đã lập đơn đặt cọc.
2. **Sai lệch thông số tiền két khi chốt ca có đơn đặt trước**:
   - Khi khách đặt trước hàng và đặt cọc một phần (ví dụ đơn 500.000 đ, cọc 50.000 đ tiền mặt): Thu ngân chỉ thu 50.000 đ vào két. Tuy nhiên, hàm tính doanh thu ca chốt két (`GetShiftSalesMetricsAsync`) lại cộng toàn bộ `o.FinalAmount` (500.000 đ) vào tiền bán hàng của ca. Điều này khiến tiền lý thuyết trong két (`ExpectedCash`) bị đội lên thêm 450.000 đ, gây chênh lệch âm tiền mặt vô lý khi kiểm đếm chốt ca.
3. **Thất thoát thông số thu tiền phần còn lại khi khách vào nhận hàng (Fulfill)**:
   - Khách thường đến lấy hàng vào ngày khác hoặc ca khác của nhân viên khác. Khi nhân viên ca nhận thu nốt số tiền còn lại (ví dụ 450.000 đ tiền mặt), hệ thống cập nhật đơn hàng thành `Completed` nhưng số tiền này vẫn thuộc về `ShiftId` của ca cũ từ ngày trước, ca hiện tại của người giao hàng không được cộng thêm 450.000 đ vào két.

---

## 2. Các bước tái hiện lỗi (Steps to Reproduce)
- **Lỗi hiển thị người tạo**: Vào Quản lý Hóa đơn -> Chuyển sang tab "Đơn Đặt Trước & Giữ Kho" -> Quan sát tiêu đề các cột bảng -> Không thấy cột Người tạo đơn.
- **Lỗi tính sai tiền ca khi cọc**: Mở ca bán hàng với vốn ban đầu 1.000.000 đ -> Tạo 1 đơn đặt trước giá trị 500.000 đ, cọc tiền mặt 50.000 đ -> Kiểm tra chi tiết ca -> Thấy tiền bán hàng bị tính 500.000 đ (thay vì 50.000 đ) và két lý thuyết đòi hỏi 1.500.000 đ (trong khi thực tế trong két chỉ có 1.050.000 đ).
- **Lỗi tiền nhận hàng ở ca sau**: Mở ca mới hôm sau -> Bấm "Giao hàng & Nhận tiền nốt" 450.000 đ tiền mặt -> Kiểm tra két ca mới -> Không thấy số tiền 450.000 đ này xuất hiện trong ca mới.

---

## 3. Kết quả thực tế vs Kết quả mong đợi
| Tính năng | Hiện trạng (Thực tế) | Mong đợi |
|---|---|---|
| Cột Người tạo ở tab Đơn đặt trước | Không có cột Người tạo | Có cột "Người tạo" hiển thị rõ thu ngân/chủ cửa hàng đã lập đơn cọc |
| Tiền két ca khi có đơn cọc (PendingPickup) | Cộng toàn bộ `FinalAmount` | Chỉ cộng số tiền cọc thực thu (`DepositAmount`) theo phương thức thanh toán tương ứng |
| Tiền thu phần còn lại khi nhận hàng (Fulfill) | Không ghi nhận vào ca hiện tại | Ghi nhận số tiền thu nốt vào ca đang mở của người giao hàng (qua phiếu thu/chuyển tiền ca `ShiftCashMovement` hoặc cập nhật ca thu tiền) |
| Người giao hàng khi hoàn tất | Không lưu vết ai giao hàng | Lưu vết `FulfilledByCashierName` để rõ trách nhiệm |

---

## 4. Phạm vi (Scope)
- **In-Scope**:
  - Frontend: Bổ sung cột Người tạo trên bảng Đơn đặt trước, hiển thị người tạo cọc và người giao hàng; truyền `cashierName` khi gọi `createPreOrder` và `fulfillPreOrder`.
  - Backend: Cập nhật `PreOrderCreateRequest`, `PreOrderFulfillRequest` nhận `CashierName` và `ShiftId`; cập nhật `ShiftRepository.GetShiftSalesMetricsAsync` chỉ tính tiền cọc cho đơn chờ nhận; ghi nhận tiền thu phần còn lại vào ca đang mở của người giao hàng.
- **Out-of-Scope**:
  - Không sửa đổi quy trình kiểm tra tồn kho FEFO của đơn đặt trước.

---

## 5. Tiêu chí thành công (Acceptance Criteria)
1. Bảng Đơn đặt trước hiển thị cột Người tạo chính xác.
2. Tiền két lý thuyết (`ExpectedCash`) của ca tạo đơn cọc khớp đúng số tiền cọc thực thu.
3. Khi giao hàng và thu nốt tiền tại ca sau, ca đang mở ghi nhận đúng số tiền thu nốt.
4. 100% tests backend và build frontend thành công.
