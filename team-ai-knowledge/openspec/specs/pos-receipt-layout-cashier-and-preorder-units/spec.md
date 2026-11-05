# Spec: pos-receipt-layout-cashier-and-preorder-units

> Spec gốc của capability. Chỉ cập nhật qua `/sep-archive` (merge delta từ `openspec/changes/<change>/specs.md`).

## Requirements

### Requirement: REQ-POS-PRINT-01 Bố cục in hóa đơn nhiệt 2 dòng chống chèn số liệu
Máy in nhiệt POS-58 (Font B 40 ký tự) MUST in từng mặt hàng theo bố cục 2 dòng chuẩn bán lẻ:
- **Dòng 1**: Số thứ tự và Tên sản phẩm đầy đủ, tự động ngắt dòng trọn chữ (word-wrap) nếu dài hơn 40 ký tự mà không bao giờ chèn vào dòng số liệu.
- **Dòng 2**: `   {SL} x {DonGia}` căn trái (thụt lề 3 khoảng trắng) và `{ThanhTien}` căn phải tại cột 40.

#### Scenario: In mặt hàng có tên dài trên 35 ký tự
- **GIVEN** Một đơn hàng chứa sản phẩm "Bánh Orion Choco-Pie truyền thống Hộp 12 cái" số lượng 2, đơn giá 55.000đ, thành tiền 110.000đ.
- **WHEN** Gửi lệnh in hóa đơn qua `ThermalPrintService`.
- **THEN** Dòng 1 in trọn vẹn tên sản phẩm và dòng 2 in tách biệt `   2 x 55.000` bên trái và `110.000` căn phải sát cột 40, không có chữ nào bị đè hoặc lẫn vào dòng tiếp theo.

---

### Requirement: REQ-POS-CASHIER-01 Định danh người tạo / thu ngân động
Hóa đơn in nhiệt, popup xem trước hóa đơn và màn hình Quản lý hóa đơn MUST hiển thị thông tin người tạo theo quy tắc:
- Nếu tài khoản có vai trò `STORE_OWNER` / `Owner`: Hiển thị `Chủ cửa hàng: {FullName || Username}`.
- Nếu tài khoản có vai trò `STAFF` / `CASHIER`: Hiển thị `{FullName || Username}`.
- Tuyệt đối loại bỏ các chuỗi gán cứng tĩnh như `"Thu ngan"` hay `"NV: Nguyễn Bá Sơn (NV004)"`.

#### Scenario: Chủ cửa hàng đăng nhập bán hàng và in hóa đơn
- **GIVEN** Người dùng đăng nhập có vai trò `STORE_OWNER` với họ tên "Trần Văn An".
- **WHEN** Tiến hành thanh toán và in hóa đơn POS.
- **THEN** Hóa đơn in ra có dòng `Chu cua hang: Tran Van An` và danh sách hóa đơn hiển thị người tạo là `Chủ cửa hàng: Trần Văn An`.

#### Scenario: Nhân viên thu ngân làm ca bán hàng
- **GIVEN** Người dùng đăng nhập có vai trò `CASHIER` với họ tên "Lê Hoàng Nam".
- **WHEN** Lập hóa đơn và kiểm tra trang Quản lý hóa đơn.
- **THEN** Huy hiệu nhân viên và thông tin thu ngân trên hóa đơn hiển thị `Lê Hoàng Nam`.

---

### Requirement: REQ-POS-PREORDER-UNIT-01 Chọn đơn vị quy đổi khi tạo đơn đặt trước
Modal `CreatePreOrderModal.tsx` SHALL cho phép người dùng chọn đơn vị tính từ danh sách `product.unitPrices`:
- Mặc định chọn đơn vị cơ bản hoặc đơn vị đầu tiên.
- Khi người dùng đổi đơn vị (ví dụ từ Hộp sang Thùng):
  - Đơn giá của dòng tự động cập nhật theo `price` của đơn vị đó.
  - Số lượng tối đa cho phép nhập được tính theo công thức `Math.floor(product.quantityOnHand / conversionRate)`.
  - Tổng tiền đặt trước và tiền cọc tối thiểu (10%) được tính lại chính xác theo đơn giá mới.

#### Scenario: Khách đặt trước 2 thùng bánh Chocopie
- **GIVEN** Sản phẩm "Bánh Chocopie" có đơn vị cơ bản là Hộp (55.000đ, tồn kho 80 hộp) và đơn vị quy đổi Thùng (24 hộp/thùng, giá 1.250.000đ).
- **WHEN** Nhân viên thêm bánh vào đơn đặt trước và chọn đơn vị là "Thùng".
- **THEN** Đơn giá dòng hiển thị `1.250.000 đ`, số lượng tối đa cho phép là 3 thùng (floor(80/24)), và nếu nhập 2 thùng thì tổng tiền là 2.500.000đ, tiền cọc tối thiểu là 250.000đ.

---

### Requirement: REQ-POS-PREORDER-BACKEND-01 Quy đổi tồn kho khi tạo đơn đặt trước tại Backend
Phương thức `CreatePreOrderAsync` trong `OrderService.cs` MUST nhân số lượng với tỷ lệ quy đổi `conversionRate` của đơn vị được chọn:
- `requiredBaseQty = item.Quantity * conversionRate`.
- So sánh `requiredBaseQty` với tồn kho FEFO khả dụng của chi nhánh và trừ/giữ đúng `requiredBaseQty` đơn vị cơ bản trong các lô hàng.

#### Scenario: Backend giữ tồn kho 2 thùng nước ngọt
- **GIVEN** Sản phẩm Lon Coca tồn kho 100 lon, khách đặt 2 thùng (conversionRate = 24).
- **WHEN** Gọi `POST /api/v1/orders/pre-orders` với `Quantity = 2` và `UnitId = {UnitIdThùng}`.
- **THEN** Backend kiểm tra đủ 48 lon (2 * 24), trừ/giữ đúng 48 lon trong tồn kho chi nhánh và lưu đơn đặt trước thành công.

## Lịch sử
- 2026-11-05 · `pos-receipt-layout-cashier-and-preorder-units` · +0 ~4 -0
