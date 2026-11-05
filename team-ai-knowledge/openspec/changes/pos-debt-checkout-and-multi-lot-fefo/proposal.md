# Đề Xuất Sửa Lỗi: Bán Nợ POS, Độc Lập In Bill & Quy Chuẩn Khấu Trừ Kho FEFO Đa Lô

## 1. Mô tả lỗi & Vấn đề thực tế
1. **Lỗi cột CSDL khi mua nợ**: Khi khách hàng thực hiện mua nợ tại POS (`PaymentMethod: CREDIT`), hệ thống ném lỗi CSDL PostgreSQL: `42703: column c.LastRepaymentAtUtc does not exist`, khiến giao dịch bán nợ bị gián đoạn hoàn toàn.
2. **Lo ngại về luồng in bill**: Cần làm rõ và đảm bảo luồng tạo đơn hàng độc lập với lệnh in bill: nếu máy in không kết nối hoặc không in bill thì đơn hàng vẫn phải hoàn thành và lưu trữ toàn vẹn trong CSDL.
3. **Quy chuẩn khấu trừ kho FEFO đa lô**: Làm rõ cơ chế tự động cấn trừ tồn kho theo lô hạn dùng (FEFO): khi khách mua số lượng lớn hơn tồn của một lô lẻ (ví dụ: Lô A có 20 sp, Lô B có 30 sp, khách mua 40 sp), hệ thống phải tự động khấu trừ hết sạch Lô A rồi chuyển tiếp sang Lô B.

## 2. Các bước tái hiện
1. Đăng nhập hệ thống bằng tài khoản Chủ cửa hàng Trần Quốc An (`tenant_an_nhien_02`).
2. Vào màn hình POS (`/pos`), chọn khách hàng Bác Minh (`KH-AN-001`).
3. Chọn sản phẩm và chọn hình thức thanh toán "Bán nợ" (`CREDIT`).
4. Bấm "Thanh toán" -> Hệ thống báo lỗi: `Lỗi tạo đơn hàng: Lỗi: 42703: column c.LastRepaymentAtUtc does not exist`.

## 3. Kết quả thực tế vs Mong đợi
- **Thực tế**: Bảng `Customers` thiếu cột `LastRepaymentAtUtc`, giao dịch thanh toán nợ bị rollback và báo lỗi popup.
- **Mong đợi**: 
  - Đơn nợ tạo thành công, tự động ghi nhận hóa đơn nợ (`CustomerDebtInvoices`), sổ nợ (`CustomerDebtEntries`) và cập nhật dư nợ khách hàng.
  - Luồng tạo đơn hàng hoàn tất độc lập với dịch vụ in hóa đơn (in ngầm background, lỗi in không ảnh hưởng đến đơn).
  - Tồn kho được khấu trừ chuẩn xác theo FEFO vắt qua nhiều lô theo thứ tự hạn dùng gần nhất.

## 4. Phạm vi (Scope)
- **Trong phạm vi (In-Scope)**:
  - Bổ sung các cột công nợ còn thiếu trên bảng `Customers` (`LastRepaymentAtUtc`, `Notes`, `RowVersion`).
  - Đảm bảo luồng frontend `executeCompleteCheckout` lưu đơn hàng thành công trước khi gửi lệnh in.
  - Xác minh thuật toán FEFO trong `OrderService.cs` và `OrderRepository.cs` trừ tuần tự từng lô theo hạn dùng.
- **Ngoài phạm vi (Out-of-Scope)**:
  - Không thay đổi nghiệp vụ kiểm tra hạn mức nợ và phân quyền chủ cửa hàng.

## 5. Tiêu chí thành công (Success Criteria)
1. Giao dịch bán nợ tại POS cho khách hàng đủ điều kiện thành công 100%, ghi đúng hóa đơn nợ và tăng dư nợ khách.
2. Khi không in bill, đơn hàng vẫn ở trạng thái `Completed`, doanh thu/công nợ và kho hàng được lưu vết.
3. Test case khấu trừ FEFO đa lô (Lô A 20 sp, Lô B 30 sp, bán 40 sp) chứng minh Lô A về 0 và Lô B còn 10 sp.
4. Toàn bộ 347 unit tests backend và vitest frontend PASS.
