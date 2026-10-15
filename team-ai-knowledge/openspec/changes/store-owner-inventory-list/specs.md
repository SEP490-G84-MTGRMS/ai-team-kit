# Specs: store-owner-inventory-list

## API / Contract (Mock State Data)
| Entity | Type | Fields |
|---|---|---|
| `InventoryStockItem` | `interface` | `id`, `sku`, `barcode`, `productName`, `category`, `branchId`, `branchName`, `locationShelf`, `unit`, `onHand`, `committed`, `available`, `onOrder`, `reorderPoint`, `avgCost`, `totalValue`, `status`, `batches` |
| `InventoryFilterState` | `interface` | `branchId: string`, `category: string`, `locationShelf: string`, `status: string`, `keyword: string`, `pageIndex: number`, `pageSize: number` |
| `InventoryKpiSummary` | `interface` | `totalSkus: number`, `totalValue: number`, `totalOnOrder: number`, `warningCount: number`, `lowStockCount: number`, `outOfStockCount: number`, `expiryCount: number` |

## ADDED Requirements

### Requirement: REQ-01 5 Thẻ chỉ số KPI Tồn kho tổng thể
Hệ thống MUST hiển thị 5 thẻ chỉ số KPI ở đầu trang:
1. `Total SKUs`: Tổng số mặt hàng đang quản lý trong phạm vi chi nhánh được chọn.
2. `Total Inventory Value`: Tổng giá trị tài sản tồn kho tính theo `Sum(onHand * avgCost)`.
3. `On-Order (Đang nhập)`: Tổng số lượng hàng trên các đơn PO đang chờ nhận.
4. `Low / Out Stock Warning`: Tổng số SKU có `onHand <= reorderPoint` (kèm chi tiết số lượng Low và Out).
5. `Expiry Warning (<= 30 Days)`: Số lượng lô hàng cận date $\le 30$ ngày.

#### Scenario: Tính toán KPI khi chọn toàn bộ chuỗi
- GIVEN người dùng chọn chi nhánh "Tất cả chi nhánh (All Branches)"
- WHEN trang tồn kho tải xong
- THEN hệ thống hiển thị tổng hợp SKU của cả 2 chi nhánh
- AND hiển thị tổng giá trị tài sản tồn kho của toàn chuỗi (ví dụ `20,524,000 đ`).

#### Scenario: Cập nhật KPI khi lọc chi nhánh cụ thể
- GIVEN người dùng đổi bộ lọc sang chi nhánh "BR-01"
- WHEN bộ lọc áp dụng
- THEN 5 thẻ KPI tự động tính toán lại chỉ dựa trên các mặt hàng và lô hàng thuộc chi nhánh BR-01.

---

### Requirement: REQ-02 Thanh công cụ Lọc đa chiều & Tìm kiếm thời gian thực
Hệ thống MUST cung cấp thanh lọc với các điều kiện:
- Chi nhánh (`All Branches`, `BR-01`, `BR-02`)
- Ngành hàng (`Dairy`, `Beverage`, `Fresh`, `Frozen`, `RTE`, `Snack`, `Personal Care`)
- Vị trí kệ / Khu vực lưu trữ (`All Locations`, `A-01-01`, `A-01-02`, `B-02-01`, `C-COOL-01`, `F-FZ-01`, `H-HOT-01`)
- Trạng thái tồn (`All Statuses`, `OK`, `Low Stock`, `Out of Stock`)
- Ô tìm kiếm theo SKU, Barcode hoặc Tên sản phẩm
- Nút "Đặt lại" để khôi phục bộ lọc mặc định.

#### Scenario: Lọc các mặt hàng sắp hết cần đặt hàng
- GIVEN người dùng muốn tìm các sản phẩm cần nhập thêm
- WHEN người dùng chọn Trạng thái là "Low Stock"
- THEN bảng chỉ hiển thị các sản phẩm có `0 < onHand <= reorderPoint`.

#### Scenario: Tìm kiếm theo mã SKU hoặc Barcode
- GIVEN người dùng nhập "DY-SUA-01" vào ô tìm kiếm
- WHEN người dùng bấm "Lọc" hoặc nhấn Enter
- THEN bảng chỉ hiển thị sản phẩm Sữa tươi Vinamilk 1L khớp với mã trên.

---

### Requirement: REQ-03 Bảng dữ liệu tồn kho 16 cột với tính toán và phân loại trạng thái
Hệ thống MUST hiển thị bảng tồn kho gồm 16 cột: STT, SKU / Barcode, Tên sản phẩm, Ngành hàng, Chi nhánh, Vị trí kệ, ĐVT, Tồn vật lý (`On-hand`), Đã đặt trước (`Committed`), Khả dụng (`Available`), Đang nhập (`On-Order`), Định mức đặt lại (`Reorder`), Giá vốn bình quân, Tổng giá trị tồn, Trạng thái (Badge), và Thao tác.

#### Scenario: Tự động tính Số lượng khả dụng và Tổng giá trị
- GIVEN sản phẩm có `onHand = 86`, `committed = 10`, `avgCost = 32,000 đ`
- WHEN hiển thị trên dòng bảng
- THEN cột Khả dụng (`Available`) hiển thị là `76` màu xanh lá đậm
- AND cột Tổng giá trị (`Total Value`) hiển thị là `2,752,000 đ`.

#### Scenario: Hiển thị badge trạng thái chính xác
- GIVEN sản phẩm có `onHand = 0`
- WHEN hiển thị trên bảng
- THEN trạng thái hiển thị là badge `Out of Stock` màu đỏ
- AND nếu `0 < onHand <= reorderPoint`, hiển thị badge `Low Stock` màu cam.

---

### Requirement: REQ-04 Drawer xem chi tiết các Lô hàng FEFO
Hệ thống MUST cung cấp Drawer trượt ra từ bên phải khi người dùng bấm vào nút "Chi tiết HSD" (hoặc huy hiệu số lô) của bất kỳ sản phẩm nào. Drawer MUST hiển thị:
- Thông tin sản phẩm: SKU, Tên, ĐVT, Tổng tồn kho vật lý.
- Danh sách các lô hàng FEFO: Mã lô, Nhà cung cấp, Ngày sản xuất, Hạn sử dụng, Số ngày còn lại tới date, Số lượng khả dụng của lô, và Huy hiệu mức rủi ro cận date (`Urgent < 7d`, `Near Expiry 7-14d`, `Clearance 15-30d`, `Safe > 30d`).

#### Scenario: Mở drawer xem lô của sản phẩm có hàng cận date
- GIVEN sản phẩm Sữa tươi Vinamilk 1L có 2 lô hàng (1 lô còn 28 ngày, 1 lô còn 60 ngày)
- WHEN người dùng bấm "Chi tiết HSD"
- THEN Drawer trượt ra hiển thị cả 2 lô
- AND lô còn 28 ngày hiển thị cảnh báo `Clearance Priority (Vàng/Cam)`.

---

### Requirement: REQ-05 Hành động Xuất Excel, In báo cáo A4 và Liên kết Kiểm kê
Hệ thống MUST cung cấp:
- Nút "Xuất Excel": Giả lập xuất báo cáo file Excel danh sách tồn kho theo bộ lọc hiện tại kèm thông báo toast thành công.
- Nút "In báo cáo": Kích hoạt lệnh in `window.print()` chuẩn khổ A4.
- Nút "Stocktake" tại mỗi dòng sản phẩm: Điều hướng sang màn hình lập phiếu kiểm kê nhanh cho sản phẩm đó.

#### Scenario: Xuất báo cáo Excel thành công
- GIVEN người dùng bấm nút "Xuất Excel"
- WHEN hệ thống xử lý
- THEN hiển thị thông báo toast: "Đã xuất báo cáo tồn kho ra tệp Excel thành công!".

---

### Requirement: REQ-06 Định tuyến & Phân quyền vai trò (Store Owner vs Employee)
Hệ thống MUST:
- Đăng ký route `/store-owner/inventory` trong `StoreOwnerLayout`.
- Bổ sung liên kết trong menu thanh điều hướng `AppTopNav` (mục "Kiểm kho & Cân đối" trỏ về `/store-owner/inventory`).
- Hỗ trợ Role Switcher góc trên: Chủ cửa hàng xem toàn chuỗi vs Thủ kho bị khóa theo chi nhánh (ví dụ BR-01).

---

## Acceptance checklist
- [ ] REQ-01: 5 thẻ KPI đầu trang hiển thị đúng số liệu và tự động tính toán lại theo bộ lọc chi nhánh.
- [ ] REQ-02: Bộ lọc đa tiêu chí (Chi nhánh, Ngành hàng, Kệ, Trạng thái, Từ khóa) hoạt động mượt mà.
- [ ] REQ-03: Bảng 16 cột hiển thị đầy đủ thông tin, tính đúng Khả dụng bán và Tổng giá trị tồn.
- [ ] REQ-04: Drawer chi tiết Lô FEFO hiển thị rõ thông tin hạn sử dụng và mức độ rủi ro date.
- [ ] REQ-05: Chức năng Xuất Excel, In báo cáo và nút kiểm kê hoạt động tốt.
- [ ] REQ-06: Đăng ký route và liên kết điều hướng trong hệ thống hoàn chỉnh.
