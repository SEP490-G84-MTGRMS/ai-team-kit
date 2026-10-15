# Proposal: store-owner-inventory-list

## Vấn đề
1. Hiện tại hệ thống chỉ có màn hình tra cứu tồn kho phục vụ thu ngân tại quầy POS (`InventoryLookupPage` tại `/pos/inventory-lookup`), thiếu màn hình **Quản lý tồn kho tổng thể thời gian thực (Real-time Inventory Management - FE-04)** dành cho Chủ cửa hàng (Store Owner) và Quản lý chuỗi để:
   - Theo dõi bức tranh toàn cảnh về giá trị tài sản tồn kho (Valuation theo giá vốn bình quân - Avg Cost).
   - Nắm bắt tức thì số lượng hàng đang trên đường nhập từ nhà cung cấp (`On-Order` từ các đơn PO đã chốt).
   - Nhận diện các điểm nóng tồn kho: SKU sắp hết hàng (`Low Stock <= Reorder Point`), SKU đã hết sạch (`Out of Stock = 0`), và các lô hàng cận hạn sử dụng (`Expiry <= 30 Days`).
2. Thiếu cơ chế lọc và phân loại hàng hóa đa chiều theo mô hình bán lẻ chuỗi:
   - Lọc theo từng Chi nhánh hoặc toàn bộ chuỗi (`All Branches`, `BR-01`, `BR-02`...).
   - Lọc theo Ngành hàng (`Dairy`, `Beverage`, `Fresh`, `Frozen`, `RTE`, `Snack`, `Personal Care`...).
   - Lọc theo Vị trí kệ / Khu vực lưu kho (`Location Shelf`: kệ khô, tủ mát `C-COOL-01`, tủ đông `F-FZ-01`, quầy nóng `H-HOT-01`...).
   - Lọc theo Trạng thái tồn (`OK`, `Low Stock`, `Out of Stock`).
3. Thiếu các liên kết hành động nghiệp vụ quan trọng từ màn hình tồn kho:
   - Xem chi tiết danh sách lô hàng FEFO và hạn sử dụng của từng SKU (Batch / Expiry drawer).
   - Khởi tạo nhanh phiếu kiểm kê điều chỉnh tồn kho (Stocktaking) trực tiếp từ SKU bị lệch/thiếu.
   - Xuất báo cáo Excel và in ấn báo cáo kiểm kê phục vụ đối soát định kỳ.

## Mục tiêu
1. Xây dựng màn hình **Quản lý tồn kho thời gian thực cho Chủ cửa hàng (Real-time Inventory List)** theo chuẩn prototype `inventory_list.html`, kế thừa và phát huy Design System của dự án MT-GRMS (card KPI, filter bar, table, pagination, status badges).
2. Tích hợp 5 thẻ chỉ số KPI tổng quan trên đầu trang:
   - `Total SKUs` (Tổng số mặt hàng đang quản lý).
   - `Total Inventory Value` (Tổng giá trị tồn kho tính theo giá vốn bình quân).
   - `On-Order` (Số lượng hàng đang đặt trên đơn PO chờ nhập kho).
   - `Low / Out Stock Warning` (Số lượng SKU chạm điểm đặt hàng lại hoặc hết hàng).
   - `Expiry Warning (<= 30 Days)` (Số lượng lô hàng cận date cần ưu tiên bán trước hoặc xả hàng).
3. Bảng dữ liệu tồn kho toàn diện với 16 cột thông tin chuẩn bán lẻ hiện đại (On-hand, Committed, Available, On-Order, Reorder Point, Avg Cost, Total Value, Location Shelf, Status).
4. Tích hợp Drawer / Modal xem chi tiết các Lô hàng FEFO (Mã lô, HSD, ngày sản xuất, số ngày còn lại, số lượng khả dụng).
5. Hỗ trợ đầy đủ các tính năng: Tìm kiếm từ khóa, Lọc đa tiêu chí, Phân trang, Sắp xếp (Sort), Xuất file Excel (giả lập tải file), và In báo cáo khổ giấy A4.
6. Đăng ký route `/store-owner/inventory` và liên kết trong menu thanh điều hướng `AppTopNav` ("Kiểm kho & Cân đối" -> `/store-owner/inventory`).

## Phạm vi
### In scope:
- Màn hình React 19 / TypeScript `StoreOwnerInventoryPage.tsx` đặt trong feature `src/features/inventory/` (tách riêng với POS để đảm bảo kiến trúc sạch).
- Router: `/store-owner/inventory`, `/admin/inventory`, và shortcut `/inventory`.
- Components:
  - `InventoryKpiCards.tsx`: 5 KPI cards với màu sắc phân loại (Total, Valuation, On-Order, Warning, Expiry).
  - `InventoryFilterBar.tsx`: Dropdowns Chi nhánh, Ngành hàng, Vị trí kệ, Trạng thái tồn, Input từ khóa, Nút Tìm/Đặt lại, Nút Xuất Excel, Nút In báo cáo.
  - `InventoryTable.tsx`: Bảng dữ liệu 16 cột với badge trạng thái, số lượng có màu trực quan, sắp xếp theo cột.
  - `InventoryBatchDrawer.tsx`: Drawer trượt hiển thị chi tiết các lô hàng FEFO của sản phẩm đã chọn kèm cảnh báo date.
- Phân quyền:
  - Store Owner: Xem toàn bộ các chi nhánh và chọn lọc chi nhánh cụ thể.
  - Nhân viên: Khóa theo chi nhánh phân công (BR-01).

### Out of scope:
- Backend REST API thật (dùng mock store reactive đồng bộ với danh mục sản phẩm và PO của dự án).
- Trực tiếp ghi vào máy in nhiệt qua cổng COM (dùng browser print window.print()).

## Người dùng liên quan
- **Chủ cửa hàng (Store Owner) / Quản lý chuỗi**: Theo dõi tổng giá trị hàng hóa, lập kế hoạch đặt hàng bù tồn kho từ NCC, kiểm soát tỷ lệ hàng cận date.
- **Thủ kho / Nhân viên chi nhánh**: Kiểm tra vị trí kệ hàng, lượng hàng thực tế khả dụng để bán hoặc soạn đơn, tạo phiếu kiểm kê.

## Tiêu chí thành công
- [ ] Giao diện tái hiện đầy đủ và nâng cấp trực quan từ prototype `inventory_list.html`, ăn khớp với Design System hiện tại của MT-GRMS (teal `#0d9488`, card container, typography).
- [ ] 5 thẻ KPI hiển thị chính xác các số liệu tổng hợp (Total SKUs, Valuation, On-Order, Low/Out Stock, Expiry Warning) và phản ứng linh hoạt theo bộ lọc Chi nhánh.
- [ ] Bộ lọc hoạt động tức thì và kết hợp mượt mà: Chi nhánh, Ngành hàng, Vị trí kệ, Trạng thái tồn (`OK`, `Low`, `Out`), và ô tìm kiếm SKU / Tên sản phẩm.
- [ ] Tính đúng công thức: `Available = On-hand - Committed`, `Total Value = On-hand * Avg Cost`, `Status = On-hand <= 0 ? 'Out' : On-hand <= Reorder ? 'Low' : 'OK'`.
- [ ] Nhấn nút "Chi tiết HSD" mở Drawer hiển thị rõ các lô FEFO của sản phẩm; nhấn "Stocktake" điều hướng sang luồng kiểm kê.
- [ ] `npm run build` (`tsc -b && vite build`) hoàn toàn không có lỗi cú pháp hoặc TypeScript.
