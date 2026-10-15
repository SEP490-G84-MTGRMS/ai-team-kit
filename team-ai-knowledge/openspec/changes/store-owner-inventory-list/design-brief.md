# Design Brief: store-owner-inventory-list

## 1. Luồng trải nghiệm người dùng (User Flows)
1. **Theo dõi bức tranh tài sản & Điểm nóng tồn kho**:
   - Chủ cửa hàng truy cập `/store-owner/inventory`.
   - 5 thẻ KPI đầu trang hiển thị ngay lập tức: Tổng số lượng SKU, Tổng giá trị tồn kho (Avg cost valuation), Lượng hàng đang nhập trên đường (`On-Order`), Số SKU sắp hết hoặc đã hết hàng, và Số lô hàng cận date $\le 30$ ngày.
   - Khi chọn một Chi nhánh cụ thể (ví dụ `BR-01`), toàn bộ số liệu 5 thẻ KPI và bảng bên dưới tự động lọc theo chi nhánh đó.

2. **Tìm kiếm & Phân tích tồn kho đa chiều**:
   - Chủ cửa hàng có thể kết hợp nhiều tiêu chí:
     - Tìm kiếm nhanh bằng Barcode hoặc Tên sản phẩm.
     - Lọc theo Ngành hàng (`Dairy`, `Beverage`, `Fresh`, `Frozen`...).
     - Lọc theo Vị trí lưu kho (`C-COOL-01` tủ mát, `F-FZ-01` tủ đông...).
     - Lọc theo Trạng thái tồn (`Low Stock`, `Out of Stock`) để ra quyết định tạo đơn mua hàng PO mới.

3. **Xem chi tiết Lô hàng FEFO & Hạn sử dụng**:
   - Từ bất kỳ dòng sản phẩm nào, bấm nút "Chi tiết HSD" (hoặc huy hiệu số lô).
   - Drawer bên phải trượt ra, hiển thị chi tiết từng lô hàng: Mã Lô (Batch ID), Nhà cung cấp, Ngày sản xuất, Hạn sử dụng, Số ngày còn lại, Số lượng khả dụng, và Huy hiệu mức độ rủi ro date (`Urgent < 7d`, `Near Expiry 7-14d`, `Clearance 15-30d`, `Safe > 30d`).

4. **Báo cáo & Kiểm kê định kỳ**:
   - Bấm nút "Xuất Excel" để tải bảng dữ liệu tồn kho phục vụ kế toán.
   - Bấm nút "In báo cáo" để in bảng tồn kho chuẩn A4.
   - Bấm "Stocktake" tại dòng sản phẩm để chuyển sang giao diện kiểm kê đối soát thực tế.

## 2. Kiến trúc Component & Giao diện
```
StoreOwnerInventoryPage (Container)
 ├── Page Header (Tiêu đề, breadcrumbs, role switcher Chủ cửa hàng vs Thủ kho)
 ├── InventoryKpiCards (5 thẻ KPI: Total SKUs, Valuation, On-Order, Warning, Expiry)
 ├── InventoryFilterBar (Dropdowns: Chi nhánh, Ngành hàng, Kệ, Trạng thái, Ô tìm kiếm, Nút Excel, Nút In)
 ├── InventoryTable (Bảng dữ liệu 16 cột, badge trạng thái, hover row, phân trang)
 └── InventoryBatchDrawer (Drawer trượt hiển thị danh sách các lô hàng FEFO của sản phẩm được chọn)
```

## 3. Quy tắc tính toán & Nghiệp vụ
1. **Khả dụng bán (Available Stock)**:
   - `Available = Math.max(0, onHand - committed)`.
2. **Tổng giá trị tồn (Total Inventory Value)**:
   - `ItemTotalValue = onHand * avgCost`.
   - `StoreTotalValue = Sum(ItemTotalValue)` (cho các mặt hàng thuộc phạm vi lọc).
3. **Trạng thái tồn kho (Stock Status)**:
   - `Out of Stock`: Khi `onHand <= 0` (Huy hiệu đỏ).
   - `Low Stock`: Khi `0 < onHand <= reorderPoint` (Huy hiệu cam cảnh báo đặt hàng lại).
   - `OK`: Khi `onHand > reorderPoint` (Huy hiệu xanh lá an toàn).
4. **Cảnh báo Lô hàng cận date (FEFO Expiry Risk)**:
   - Lô cận date $\le 30$ ngày được đánh dấu để cửa hàng ưu tiên xuất trước (FEFO Priority) hoặc áp dụng chương trình xả hàng giảm giá (Clearance Discount).
