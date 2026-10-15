# Exploration: batch-list (Quản lý Lô Sản Phẩm & Hạn Sử Dụng - FEFO Expiry Management)

## 1. Hiện trạng Code & Bối cảnh Hệ thống

### 1.1. Phân hệ Goods Receipts (GRN) hiện tại
- **Giao diện**: Hệ thống đã có màn hình danh sách phiếu nhập kho tại `/store-owner/goods-receipts` (`GoodsReceiptListPage.tsx`) và form lập phiếu nhập `GoodsReceiptFormPage.tsx` (`src/features/goods-receipt/`).
- **Dữ liệu DTO (`grn.types.ts`)**:
  - `GrnItemDetail` đã hỗ trợ các trường: `batchCode?: string` (Mã lô hàng FEFO), `expiryDate?: string` (Hạn sử dụng YYYY-MM-DD), `receivedQty`, `unitPrice`, `lineTotal`.
  - Phiếu nhập có trạng thái `CONFIRMED` đại diện cho việc hàng đã chính thức qua cổng kiểm đếm và nhập kho chi nhánh.
- **Thiếu sót hiện tại**: Sau khi GRN được duyệt `CONFIRMED`, hệ thống chưa có màn hình trực quan để chủ cửa hàng và thủ kho quản trị danh sách các lô hàng đang lưu kho, kiểm soát hạn sử dụng, và chủ động ra quyết định theo nguyên tắc FEFO (First Expired, First Out).

### 1.2. Backend Domain Entities (`MT_GRMS_BACKEND`)
- Đã có entity `Batch` trong `MT_GRMS.Domain.Entities.Inventory.StockOnHand.cs`:
  - Thuộc tính: `Id`, `ProductId`, `BranchId`, `BatchCode`, `ManufactureDate`, `ExpiryDate`, `InitialQuantity`, `LandedCostPerUnit`, `DaysUntilExpiry`, `IsExpired`.
  - Entity `StockOnHand`: `BranchId`, `ProductId`, `BatchId`, `Quantity`, `ReservedQuantity`, `AvailableQuantity`.
- Đây là cơ sở dữ liệu vững chắc để liên kết giữa Phiếu nhập kho (GRN) -> Lô hàng (Batch) -> Tồn kho khả dụng (Available Stock).

### 1.3. Mockup Prototype chuẩn (`batch_list.html` & `batch_detail.html`)
- Prototype `design_ui/batch_list.html` (FE-02 / UI-02-01) cung cấp:
  - Header với điều hướng chéo sang `inventory_list.html` và `index.html`.
  - 4 Thẻ KPI phân loại hạn sử dụng (Expired, Critical, Warning, Normal).
  - Bộ lọc Chi nhánh, Trạng thái hạn dùng, Từ khóa tìm kiếm.
  - Bảng dữ liệu 11 cột hiển thị `Days Left`, số lượng tồn, đơn giá vốn, và hành động (Detail, Write-off, Discount).
- Prototype `design_ui/batch_detail.html` (UI-02-02) cung cấp cấu trúc thông tin chi tiết lô, vị trí quầy kệ (`Shelf Location`), phiếu GRN gốc (`Original GRN No`), và lịch sử luân chuyển lô (`Movement History`).

---

## 2. Assumptions (Giả định)
1. **Quy tắc FEFO**: Các sản phẩm cùng SKU nhưng khác lô sẽ được ưu tiên bán/xuất kho theo lô có HSD sớm nhất (`ExpiryDate` nhỏ nhất).
2. **Cơ chế tính Days Left**: `Days Left` được tính động dựa trên ngày hiện tại theo lịch thực tế (`Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24))`).
3. **Phân loại trạng thái**:
   - `Expired`: `Days Left <= 0` (đã quá hạn).
   - `Critical`: `1 <= Days Left <= 3` (cực kỳ khẩn cấp).
   - `Warning`: `4 <= Days Left <= 30` (cảnh báo cận date).
   - `Normal`: `Days Left > 30` (vòng đời an toàn).
4. **Đồng bộ liên kết**: Trang Quản lý Lô hỗ trợ URL search params (`?sku=...`, `?batch=...`, `?status=...`, `?branch=...`) để dễ dàng tích hợp từ màn hình Goods Receipts hoặc Product List.

---

## 3. Non-Goals (Ngoài phạm vi)
- Không viết lại toàn bộ module quản lý tồn kho tổng thể (FE-04 `inventory-list`) — trang này tập trung thuần túy vào **lô hàng và hạn sử dụng** (FE-02).
- Không tạo form đầy đủ của module Xuất hủy phế phẩm FE-06 (`damaged_goods_form.html`) — chỉ mock điều hướng và dialog xác nhận demo.
- Không kết nối phần cứng máy in mã vạch vật lý — chỉ cung cấp chức năng xem trước / In báo cáo trình duyệt (Browser Print Preview).

---

## 4. Các phương án thiết kế (Options Comparison)

### Phương án A: Tích hợp Lô hàng thành một Tab con bên trong màn hình Tồn kho (`/store-owner/inventory?tab=batches`)
- **Ưu điểm**: Giảm bớt 1 menu cấp 1 trên thanh điều hướng; gom toàn bộ dữ liệu kho vào một chỗ.
- **Nhược điểm**: 
  - Màn hình tồn kho vốn đã rất nặng (nhiều cột, nhiều chỉ số tài chính, kiểm kê). Thêm lô hàng vào tab con làm loãng nghiệp vụ chuyên sâu về Hạn dùng & FEFO.
  - Khó áp dụng deep-link trực tiếp từ Phiếu nhập kho GRN sang một bảng theo dõi date độc lập.
  - Không bám sát sơ đồ phân rã màn hình chuẩn SRS (`FE-02` là một module độc lập tách biệt với `FE-04`).

### Phương án B (Đề xuất): Xây dựng Module chuyên biệt `src/features/batch/` tại route `/store-owner/batches`
- **Ưu điểm**:
  - Chuẩn kiến trúc Feature-based của MT-GRMS: Độc lập, dễ bảo trì, dễ mở rộng (thêm Batch Detail Drawer, Batch Discount Modal, In danh sách lô cận date).
  - Bám sát 100% prototype `batch_list.html` và sơ đồ phân rã màn hình `screen_flow.html` (UI-02-01 và UI-02-02).
  - Hỗ trợ đầy đủ KPI Cards động có thể bấm lọc trực tiếp (Clickable Filter Cards).
  - Tích hợp mượt mà vào `AppTopNav.tsx` dưới mục `Hàng hóa -> Kho & Hạn dùng (FEFO) -> Quản lý lô & Hạn sử dụng`.
  - Hỗ trợ Drawer xem chi tiết lô ngay trên trang (Slide-over UX) mà không cần redirect sang trang mới, tăng tốc độ thao tác cho nhân viên và chủ cửa hàng.
- **Nhược điểm**: Cần tạo module feature mới và khai báo route mới trong router.

---

## 5. Phương án lựa chọn & Lý do
- **Lựa chọn**: **Phương án B**.
- **Lý do**:
  - Phù hợp nhất với yêu cầu của user và prototype chuẩn `design_ui/batch_list.html`.
  - Đảm bảo tính liền mạch trong quy trình nghiệp vụ: `Goods Receipt (GRN)` -> `Batch List (FEFO)` -> `Discount / Write-off`.
  - Tuân thủ nguyên tắc thiết kế B2B SaaS ERP cao cấp của MT-GRMS (Tailwind CSS, Lucide icons, responsive, phân quyền rõ ràng).

---

## 6. Rủi ro & Giải pháp giảm thiểu

| Rủi ro | Mức độ | Giải pháp giảm thiểu |
|---|---|---|
| Lệch múi giờ khi tính toán `Days Left` giữa client và server | Trung bình | Sử dụng ngày chuẩn ISO (YYYY-MM-DD) và chuẩn hóa so sánh lúc `00:00:00` theo múi giờ `Asia/Ho_Chi_Minh`. |
| Số lượng lô hàng lớn gây giật lag bảng dữ liệu | Thấp | Cung cấp phân trang client/server rõ ràng (10, 20, 50 dòng/trang), cấu trúc bảng chuẩn font `tabular-nums`. |
| Nhân viên bấm nhầm xuất hủy (Write-off) gây mất dữ liệu tồn kho | Trung bình | Thêm modal cảnh báo xác nhận đỏ (Confirm Danger Modal) trước khi thực hiện xuất hủy lô. |
| Người dùng điều hướng từ GRN với SKU không tồn tại trong kho | Thấp | Bổ sung Empty State lịch sự: "Không tìm thấy lô hàng nào cho sản phẩm này", kèm nút "Xóa bộ lọc" để quay về toàn bộ danh sách. |
