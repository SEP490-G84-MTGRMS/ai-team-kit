# Exploration: store-owner-inventory-list

## 1. Hiện trạng & Bối cảnh
Dự án MT-GRMS hiện đã có:
- Màn hình tra cứu tồn kho cho nhân viên thu ngân quầy POS (`src/features/pos/pages/InventoryLookupPage.tsx`), tập trung vào thao tác bán hàng, chọn lô FEFO và tạo yêu cầu chuyển kho nhanh.
- Chưa có màn hình quản lý tồn kho tổng thể thời gian thực (`Real-time Inventory List` - FE-04) dành cho Chủ cửa hàng (Store Owner) và Quản lý chuỗi để:
  - Xem tổng quan các chỉ số KPI: Tổng số SKU, Tổng giá trị tài sản tồn kho (Valuation theo giá vốn bình quân), Số lượng hàng đang nhập (`On-Order`), Cảnh báo sắp hết/hết hàng (`Low/Out Stock`), và Cảnh báo cận hạn sử dụng (`Expiry <= 30 Days`).
  - Tra cứu và lọc tồn kho theo từng Chi nhánh, Ngành hàng, Vị trí kệ (Shelf Location: kệ khô, tủ mát `C-COOL-01`, tủ đông `F-FZ-01`...), và Trạng thái tồn kho.
  - Nắm bắt chi tiết số lượng: Tồn thực tế (`On-hand`), Đã đặt trước (`Committed`), Khả dụng bán (`Available`), Đang nhập (`On-order`), Điểm đặt hàng lại (`Reorder point`).
  - Xem danh sách lô hàng FEFO của từng SKU qua Drawer trượt và tạo nhanh phiếu kiểm kê (Stocktake).

## 2. Giả định (Assumptions)
- Dữ liệu tồn kho được quản lý chi tiết theo từng Chi nhánh (`BR-01`, `BR-02`...). Store Owner có thể chọn xem một chi nhánh hoặc toàn bộ chuỗi (`All Branches`).
- Công thức tính toán:
  - `Available = Math.max(0, onHand - committed)`
  - `TotalValue = onHand * avgCost`
  - Trạng thái hàng hóa:
    - `Out of Stock`: Khi `onHand <= 0`
    - `Low Stock`: Khi `0 < onHand <= reorderPoint`
    - `OK`: Khi `onHand > reorderPoint`
  - Cảnh báo hạn sử dụng: Khi SKU có ít nhất 1 lô còn hạn $\le 30$ ngày.
- Bộ lọc và tìm kiếm hoạt động reactive ngay trên frontend qua `useMemo`.
- Hỗ trợ phân trang linh hoạt (10, 20, 50, 100 dòng/trang).

## 3. Non-Goals
- Không thay đổi hoặc làm ảnh hưởng tới màn hình POS của thu ngân (`src/features/pos/pages/InventoryLookupPage.tsx`).
- Không kết nối phần cứng máy in nhiệt vật lý (dùng lệnh in A4 chuẩn `window.print()` và giả lập tải file Excel).

## 4. Khảo sát các phương án kiến trúc
### Phương án 1: Xây dựng module mới `src/features/inventory/` (Recommended)
- Tạo trang chính `StoreOwnerInventoryPage.tsx` đặt trong `src/features/inventory/pages/`.
- Tách bạch các sub-component:
  - `InventoryKpiCards.tsx`: Hiển thị 5 thẻ KPI đầu trang.
  - `InventoryFilterBar.tsx`: Thanh công cụ lọc và tìm kiếm đa chiều.
  - `InventoryTable.tsx`: Bảng dữ liệu 16 cột với status badge và phân trang.
  - `InventoryBatchDrawer.tsx`: Drawer xem chi tiết các lô hàng FEFO.
- Đăng ký route: `/store-owner/inventory` và shortcut `/inventory`.
- **Ưu điểm**:
  - Kiến trúc rõ ràng, module hóa cao, tuân thủ đúng pattern của các feature khác như `goods-receipt`, `purchase-order`, `supplier`.
  - Không gây xung đột với code POS hiện tại.
  - Đảm bảo hiệu năng và dễ mở rộng khi bổ sung tính năng Kiểm kê (Stocktaking) hoặc Quản lý lô (Batch Management).
- **Nhược điểm**: Thêm cấu trúc thư mục mới.

### Phương án 2: Mở rộng trực tiếp bên trong `src/features/pos/pages/InventoryLookupPage.tsx`
- Dùng chung một file page cho cả POS và Store Owner, điều khiển bằng prop `viewMode`.
- **Nhược điểm**: Làm file phình to (>1500 dòng), trộn lẫn logic bán hàng POS và logic phân tích quản lý kho của Store Owner.

### Quyết định lựa chọn:
**Chọn Phương án 1**. Tạo module `src/features/inventory/` chuyên trách cho nghiệp vụ Quản lý tồn kho của Store Owner.

## 5. Rủi ro & Giải pháp
1. **Rủi ro tính toán sai số khả dụng khi `committed > onHand`**:
   - Sử dụng `Math.max(0, onHand - committed)` để tránh số khả dụng bị âm.
2. **Rủi ro lọc chi nhánh làm mất số liệu toàn chuỗi**:
   - Khi chọn `All Branches`, bảng tổng hợp số lượng của tất cả chi nhánh hoặc hiển thị từng dòng theo cặp (SKU, Branch) rõ ràng, giúp Store Owner so sánh tồn giữa các chi nhánh.
