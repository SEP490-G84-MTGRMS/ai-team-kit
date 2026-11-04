# Proposal: pos-branch-pricing-and-fefo (Bán Hàng POS: Giá Bán Chi Nhánh, Đơn Vị Tính Quy Đổi & Trừ Kho FEFO)

## 1. Vấn đề (Problem)
- Hiện tại, luồng bán hàng POS tại quầy thu ngân cần đồng bộ chặt chẽ với kiến trúc Catalog đa tầng mới:
  - Giá bán lẻ cơ sở phải ưu tiên lấy từ giá cấu hình riêng của chi nhánh (`BranchProducts.SellingPriceOverride`), nếu không có mới dùng giá gốc `Products.SellingPrice`.
  - Sản phẩm bán lẻ trong siêu thị/tạp hóa thường có nhiều đơn vị đóng gói (Ví dụ: Lon -> Lốc 6 -> Thùng 24; Hộp 18 gói -> Thùng; Gói lẻ -> Lốc). Giá bán theo từng đơn vị quy đổi phải lấy từ bảng giá chi nhánh (`BranchProductUnitPrices.SellingPriceOverride`), kế thừa hoặc nhân theo tỷ lệ quy đổi (`ConversionRate`).
  - Giao diện bán hàng POS khi quét mã vạch chưa có dropdown cho thu ngân chọn nhanh đơn vị tính để tự động nhảy đơn giá tương ứng của đơn vị đó.
  - Khi hoàn tất thanh toán, hệ thống phải lưu đầy đủ đơn hàng vào `Orders` và `OrderDetails` (ghi nhận đúng đơn vị tính, số lượng quy đổi và giá bán), đồng thời trừ tồn kho thực tế tại bảng `BranchStocks` chuẩn theo nguyên tắc **FEFO (First Expired, First Out - lô hết hạn sớm nhất trừ trước)**.
  - Thiếu bộ dữ liệu mẫu (Seed Data) chuẩn thực tế cho cửa hàng An Nhiên của chủ tiệm **Trần Quốc An** với 4 sản phẩm thông dụng (Cà phê G7 3in1, Bánh Orion Choco-Pie, Muối chấm Hảo Hảo, Bia Hà Nội Sleek) để kiểm thử quét mã vạch và bán hàng.

## 2. Mục tiêu (Goals)
1. **Giá bán chi nhánh**: Backend tự động lấy giá bán từ `BranchProduct` (`SellingPriceOverride ?? Product.SellingPrice`).
2. **Giá bán đơn vị quy đổi**: Backend tự động xác định giá theo đơn vị mua từ `BranchProductUnitPrice` (`SellingPriceOverride ?? (ProductUnitPrice.ConversionRate * BasePrice)`).
3. **Trừ kho FEFO & Lưu đơn**: Khi tạo đơn thành công, lưu bản ghi vào `Orders`, `OrderDetails` và trừ tồn kho chính xác trong `BranchStocks` theo ngày hết hạn sớm nhất.
4. **Unit Tests toàn diện**: Viết bộ unit tests cho `OrderService` bao phủ 100% các kịch bản:
   - Bán đơn vị cơ bản vs đơn vị quy đổi.
   - Trừ kho FEFO qua 1 lô vs nhiều lô liên tiếp.
   - Báo lỗi khi tồn kho chi nhánh không đủ.
   - Hoàn trả kho chuẩn xác khi hủy đơn hàng.
5. **Giao diện POS**:
   - Khi quét mã vạch hoặc chọn sản phẩm vào giỏ, hiển thị dropdown chọn đơn vị tính.
   - Khi chọn đổi đơn vị tính, đơn giá tức thời đổi theo giá của unit đó và cập nhật tổng tiền giỏ hàng.
6. **Dữ liệu mẫu An Nhiên**: Chèn dữ liệu kiểm thử thực tế cho chủ tiệm Trần Quốc An với 4 sản phẩm chính xác mã vạch và nhiều đơn vị tính:
   - Cà phê hòa tan G7 3in1 (`8935024122310`)
   - Bánh Orion Choco-Pie truyền thống (`8936036020380`)
   - Muối chấm Hảo Hảo tôm chua cay (`8934563065249`)
   - Bia Hà Nội Sleek (`8936000440824`)

## 3. Phạm vi (Scope)
- **In scope**:
  - Backend: Cập nhật `OrderService`, `OrderRepository`, `BranchProductRepository` xử lý giá chi nhánh, đơn vị tính quy đổi, và trừ kho FEFO trên `BranchStocks`.
  - Backend: Viết trọn bộ Unit Tests cho POS Order.
  - Backend / Seeding: Script nạp dữ liệu mẫu cửa hàng An Nhiên (Trần Quốc An), 4 sản phẩm, đơn vị tính và lô hàng vào `BranchStocks`.
  - Frontend: Cập nhật POS Cart Item component hỗ trợ dropdown chọn đơn vị tính, binding giá tương ứng và gửi `unitId` / `unitPrice` khi checkout.
- **Out of scope**:
  - Cấu hình phần cứng máy in nhiệt vật lý (chỉ sử dụng preview & lệnh in chuẩn web).
  - Quản lý công nợ khách hàng B2B phức tạp.

## 4. Người dùng liên quan (Actors & Roles)
- **Cashier (Thu ngân)**: Quét mã vạch sản phẩm, chọn đơn vị tính theo yêu cầu của khách (mua lẻ hay mua lốc/thùng), thu tiền và in hóa đơn.
- **Store Owner (Trần Quốc An - Chủ tiệm An Nhiên)**: Thiết lập giá bán chi nhánh, theo dõi đơn hàng bán ra và tồn kho thực tế theo lô.

## 5. Tiêu chí thành công (Success Criteria)
- [ ] Quét mã vạch 4 sản phẩm mẫu trên POS lập tức thêm vào giỏ hàng đúng giá.
- [ ] Dropdown đơn vị tính trên giỏ hàng hoạt động mượt mà, đổi đơn vị tự động nhảy đúng giá bán của đơn vị đó.
- [ ] Đơn hàng thanh toán thành công được lưu vào `Orders`, `OrderDetails`.
- [ ] Tồn kho trong `BranchStocks` được trừ chính xác theo FEFO (lô hết hạn trước trừ trước).
- [ ] Toàn bộ Unit Tests backend của POS Order đều PASS 100%.
- [ ] Dữ liệu cửa hàng An Nhiên có sẵn trong CSDL để người dùng đăng nhập test được ngay.
