# Exploration: supplier-product-management

## 1. Hiện trạng Code & Hệ thống
- **Backend (`MT_GRMS_BACKEND`)**:
  - Thực thể `Product` và `Category` đã có trong `MT_GRMS.Domain.Entities.Catalog` (`SKU`, `Barcode`, `ProductName`, `CostPrice`, `BasePrice`, `UnitName`, `IsActive`).
  - Thực thể `Supplier` đã được thiết kế trong change `master-supplier-management`.
  - Chưa có bảng liên kết N-N `SupplierProducts` để lưu trữ mối quan hệ cung ứng, giá sỉ thỏa thuận, MOQ và ĐVT giao hàng giữa Nhà cung cấp và Sản phẩm.
- **Frontend (`MT_GRMS_FRONTEND`)**:
  - Đã có nguyên mẫu giao diện prototype [`supplier_product_manage.html`](file:///d:/FPT%20UNIVERSITY/FALL_2026_SEASON9/SEP490/design_ui/supplier_product_manage.html).
  - Trước đây, danh sách sản phẩm nằm chung trong một tab nhỏ của `SupplierDetailPage`, nhưng người dùng đã yêu cầu tách riêng thành một màn hình quản lý Master Data độc lập do số lượng sản phẩm lớn và cần thao tác gán/lọc/đối soát chuyên biệt.
  - Đã có khung types sơ bộ `SupplierProductItem` trong `src/features/supplier/types/supplier.types.ts`.

---

## 2. Giả định (Assumptions)
1. **Quan hệ N-N**: Một Nhà cung cấp có thể phân phối nhiều sản phẩm; một sản phẩm có thể được cung cấp bởi nhiều Nhà cung cấp khác nhau.
2. **Chính sách mua hàng riêng biệt**: Với cùng một sản phẩm, mỗi NCC có thể có:
   - Giá nhập sỉ thỏa thuận (`AgreedWholesalePrice`) khác nhau.
   - Số lượng đặt hàng tối thiểu (`MOQ`) khác nhau.
   - Đơn vị tính giao hàng (`DeliveryUoM`) khác nhau (ví dụ: NCC A giao thùng 24 lon, NCC B giao két 12 lon, trong khi đơn vị cơ sở bán lẻ là lon).
   - Mã sản phẩm riêng của NCC (`SupplierProductCode`).
3. **Nhà cung cấp chính (`IsPrimarySupplier`)**: Mỗi sản phẩm tại một Tenant nên có tối đa một Nhà cung cấp được đánh dấu là chính (Default / Primary Supplier) để hệ thống tự động chọn khi sinh đề xuất Đơn đặt hàng (Purchase Order - PO) bù tồn kho.
4. **Cô lập đa chi nhánh/tenant**: Toàn bộ liên kết `SupplierProducts` phải được cô lập tuyệt đối theo `TenantId`.

---

## 3. Những gì không làm (Non-Goals)
1. **Không can thiệp giá bán lẻ**: Việc thay đổi giá nhập sỉ thỏa thuận (`AgreedWholesalePrice`) không tự động thay đổi giá bán lẻ niêm yết (`BasePrice`) trong danh mục sản phẩm.
2. **Không hỗ trợ bảng giá bậc thang (Tiered Pricing)**: Trong giai đoạn này chỉ hỗ trợ một mức giá thỏa thuận cơ bản và một mức MOQ, chưa áp dụng chiết khấu bậc thang theo số lượng mua (ví dụ mua > 100 giảm 5%).
3. **Không xử lý kiểm tra chất lượng hay nhập kho thực tế**: Màn hình chỉ quản lý danh mục dữ liệu chủ (Master Data Mapping), quy trình kiểm tra chất lượng hàng hóa nhập kho thuộc capability `inventory/receiving`.

---

## 4. Các phương án kiến trúc & Thiết kế giao diện

### Phương án 1: Màn hình Quản lý tập trung theo Nhà cung cấp (Supplier-centric View) — ĐỀ XUẤT CHỌN
- **Mô tả**: Bám sát 100% tinh thần prototype `supplier_product_manage.html`:
  - Chọn một Nhà cung cấp làm ngữ cảnh làm việc (`Context Header`).
  - Hiển thị thông tin tóm tắt của NCC (Trạng thái, Điều khoản thanh toán, Hạn mức nợ).
  - Phía trên là Form / Modal gán sản phẩm mới vào NCC đó.
  - Phía dưới là Bảng danh sách sản phẩm NCC đang cung ứng, kèm bộ lọc danh mục và thanh tìm kiếm.
  - Thao tác nhanh: Sửa giá nhập thỏa thuận, sửa MOQ, Bật/Tắt trạng thái liên kết (`Active`/`Inactive`).
- **Ưu điểm**:
  - Trực quan, người dùng dễ thao tác khi làm việc theo hợp đồng với từng NCC cụ thể.
  - Tải dữ liệu nhanh vì chỉ truy vấn danh sách sản phẩm thuộc một NCC đã chọn.
  - Khớp hoàn toàn với thói quen nghiệp vụ nhập hợp đồng cung ứng của nhân viên mua hàng KiotViet.
- **Nhược điểm**: Khi muốn biết một sản phẩm X do những NCC nào cung cấp thì phải chuyển đổi NCC để tra cứu.

### Phương án 2: Giao diện Hai chiều (Bi-directional Dual-tab: By Supplier & By Product)
- **Mô tả**: Cung cấp 2 Tab lớn:
  - Tab 1: Quản lý theo Nhà cung cấp (chọn NCC -> xem sản phẩm).
  - Tab 2: Quản lý theo Sản phẩm (chọn Sản phẩm -> xem danh sách các NCC cung cấp, so sánh giá nhập giữa các NCC, chọn NCC chính).
- **Ưu điểm**: Toàn diện, cực kỳ thuận tiện cho bộ phận thu mua khi cần so sánh giá giữa các nhà phân phối.
- **Nhược điểm**: Phạm vi lớn, phức tạp hóa giao diện ban đầu và tốn nhiều thời gian triển khai hơn.

### Quyết định chọn:
- **Chọn Phương án 1** làm giao diện chính cho màn hình quản lý `SupplierProductManagementPage`.
- **Bổ sung API phụ trợ**: Thiết kế sẵn API `GET /api/v1/products/{id}/suppliers` ở Backend để có thể tái sử dụng ngay khi mở rộng sang màn hình lập đơn PO hoặc khi nâng cấp giao diện hai chiều trong tương lai.

---

## 5. Rủi ro & Biện pháp giảm thiểu

| Rủi ro | Mức độ | Biện pháp giảm thiểu |
|---|---|---|
| **Gán trùng sản phẩm**: Người dùng gán cùng một sản phẩm 2 lần cho 1 NCC. | Cao | Thiết lập Unique Index `(TenantId, SupplierId, ProductId)` tại Database; Frontend tự động lọc bỏ các sản phẩm đã gán khỏi dropdown tìm kiếm. |
| **Xung đột Primary Supplier**: Nhiều NCC cùng được đặt làm NCC chính cho một sản phẩm. | Trung bình | Khi người dùng bật cờ `IsPrimary = true` cho một liên kết, Command Handler ở Backend tự động cập nhật cờ `IsPrimary = false` cho tất cả các NCC khác đang liên kết với sản phẩm đó trong cùng Tenant. |
| **Xóa nhầm dữ liệu đang có giao dịch**: Hủy liên kết NCC - Sản phẩm khi đang có đơn hàng mở. | Trung bình | Áp dụng cơ chế Soft Deactivation (`Status = Inactive`) thay vì xóa cứng (`Hard Delete`). Các đơn PO lịch sử vẫn bảo toàn dữ liệu. |
| **Sai lệch đơn vị tính (UoM)**: Đơn vị tính giao hàng khác đơn vị bán lẻ gây sai lệch số lượng. | Trung bình | Bắt buộc chọn `DeliveryUoM` rõ ràng; lưu hệ số quy đổi nếu có quy cách đóng gói (Conversion Factor). |
