# Đề Xuất Chức Năng (Proposal): Bán Hàng Ghi Nợ (Bán Nợ) & Quản Lý Thu Nợ Hóa Đơn Tại Quầy POS

## 1. Vấn Đề Cần Giải Quyết
- Quầy bán hàng POS hiện tại chỉ có 2 hình thức thanh toán: **Tiền mặt** và **Chuyển khoản VietQR**.
- Trong mô hình siêu thị / cửa hàng tiện lợi, nhiều khách quen (thuộc các hạng thành viên được chủ cửa hàng cho phép) có nhu cầu mua hàng trước trả tiền sau (**Bán nợ / Ghi nợ công nợ**).
- Cần có cơ chế kiểm soát hạn mức nợ (ví dụ: hạng Thân thiết/Bạc được nợ tối đa 500.000 đ, hạng Vàng 1.000.000 đ, v.v.). Khi đơn hàng làm vượt hạn mức nợ, hệ thống cần cảnh báo rõ ràng cho thu ngân nhưng vẫn cho phép linh hoạt phê duyệt bán nợ (theo ủy quyền của chủ cửa hàng).
- Khi khách hàng đến trả nợ (bằng tiền mặt hoặc chuyển khoản), quầy thu ngân cần có nơi tra cứu hóa đơn ghi nợ và thực hiện **Thu nợ hóa đơn** (thu toàn bộ hoặc thu từng phần), lưu lại lịch sử phiếu thu tiền nợ.

## 2. Mục Tiêu
- Bổ sung hình thức thanh toán **Ghi nợ (Bán nợ)** bên cạnh Tiền mặt và Chuyển khoản VietQR tại `PosPaymentPanel`.
- Kiểm tra điều kiện bán nợ:
  - Bắt buộc phải chọn khách hàng cụ thể (không áp dụng cho khách lẻ vô danh).
  - Hiển thị hạn mức nợ cho phép, số dư nợ hiện tại và dự kiến nợ sau đơn hàng.
  - Cảnh báo trực quan nếu vượt hạn mức nợ, yêu cầu thu ngân xác nhận để tiếp tục.
- Cập nhật Quản lý Hóa Đơn (`InvoiceManagementPage`):
  - Hiển thị nhãn/bộ lọc hóa đơn **Ghi nợ (Chưa thanh toán đủ)** kèm số tiền còn nợ.
  - Cung cấp thao tác **Thu nợ hóa đơn**: Cho phép chọn phương thức trả (Tiền mặt / VietQR), nhập số tiền khách thanh toán, ghi chú và lưu lại lịch sử các lần trả nợ.

## 3. Phạm Vi Triển Khai (Scope)
### In-Scope:
1. **Frontend Types & DTOs**:
   - Bổ sung phương thức thanh toán `'debt'` (Ghi nợ).
   - Bổ sung các trường quản lý nợ cho Customer: `debtLimit` (hạn mức nợ), `currentDebt` (nợ hiện tại), `allowDebt` (cho phép ghi nợ).
   - Bổ sung trường cho Invoice: `debtAmount` (tiền còn nợ), `debtHistory` (lịch sử các đợt trả nợ: ngày giờ, số tiền, hình thức thanh toán, thu ngân).
2. **Giao Diện Bán Hàng POS (`PosPaymentPanel` & `PosCheckoutPage`)**:
   - Thêm nút Radio `Ghi nợ (Bán nợ)` cạnh Tiền mặt và Chuyển khoản.
   - Thẻ hiển thị hạn mức nợ và nợ hiện tại của khách hàng đã chọn.
   - Modal cảnh báo xác nhận bán nợ khi vượt hạn mức cho phép.
3. **Giao Diện Quản Lý Hóa Đơn (`InvoiceManagementPage`)**:
   - Thêm tab / bộ lọc nhanh hóa đơn ghi nợ.
   - Hiển thị trạng thái công nợ: Đã thu đủ vs Còn nợ (màu đỏ cam nổi bật).
   - Modal **Thu nợ / Thanh toán công nợ**: Nhập số tiền thu, chọn Tiền mặt/VietQR, hiển thị tiền còn nợ sau khi thu, cập nhật trạng thái hóa đơn về Đã hoàn thành khi nợ = 0.
4. **Nguyên tắc an toàn**: Không đẩy code lên remote Git theo yêu cầu của user.

### Out-of-Scope:
- Module CRM chi tiết (đã do phân hệ CRM quản lý).
- Không tự động trừ tiền trong tài khoản ngân hàng của khách.

## 4. Người Dùng & Vai Trò
- **Thu ngân quầy**: Thực hiện bán nợ cho khách quen, xác nhận cảnh báo vượt hạn mức, lập phiếu thu nợ khi khách thanh toán.
- **Chủ cửa hàng (Store Owner)**: Thiết lập hạn mức nợ theo hạng thành viên / khách quen, theo dõi công nợ bán lẻ.

## 5. Tiêu Chí Thành Công
- Khi chọn hình thức `Ghi nợ` mà chưa chọn khách hàng: Hệ thống yêu cầu tìm/chọn khách hàng trước.
- Khi chọn khách hàng: Hiển thị ngay `Hạn mức nợ: xxx đ` và `Nợ hiện tại: yyy đ`.
- Khi thanh toán đơn vượt hạn mức: Hiển thị modal cảnh báo vượt hạn mức với thông số trực quan, bấm "Xác nhận duyệt bán nợ" đơn hàng sẽ hoàn tất và lưu hóa đơn ghi nợ.
- Tại Quản lý hóa đơn: Lọc và xem được các đơn ghi nợ, bấm "Thu nợ" nhập tiền trả thành công, cập nhật số nợ giảm đi và lưu lịch sử đợt trả.
- `npm run build` không có lỗi. Không đẩy lên Git.
