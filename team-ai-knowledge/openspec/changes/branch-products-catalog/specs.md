# Specs: branch-products-catalog

## ADDED Requirements

### Requirement: REQ-BPC-01 Tách thực thể danh mục sản phẩm chi nhánh (BranchProduct)
Hệ thống **MUST** lưu trữ danh mục sản phẩm được phân bổ kinh doanh tại từng chi nhánh vào bảng riêng `BranchProducts` thay vì dùng bảng tồn kho `BranchStocks`. Bản ghi `BranchProduct` **MUST** bao gồm `BranchId`, `ProductId`, `SellingPriceOverride`, `Status`, và `ShelfLocation`. Giá bán lẻ hiệu lực của sản phẩm tại chi nhánh **MUST** là `SellingPriceOverride` nếu trường này khác `NULL`, ngược lại **MUST** kế thừa từ `Product.SellingPrice`.

#### Scenario: Truy vấn danh mục sản phẩm chi nhánh với giá bán hiệu lực
- **GIVEN** Sản phẩm "Gạo ST25 5kg" có giá niêm yết Master `Product.SellingPrice` = 195,000 VND.
- **AND** Tại Chi nhánh 1, `BranchProduct.SellingPriceOverride` = 210,000 VND.
- **AND** Tại Chi nhánh 2, `BranchProduct.SellingPriceOverride` = NULL.
- **WHEN** Quản lý Chi nhánh 1 truy vấn danh sách sản phẩm.
- **THEN** Hệ thống trả về `RetailPrice` = 210,000 VND.
- **WHEN** Quản lý Chi nhánh 2 truy vấn danh sách sản phẩm.
- **THEN** Hệ thống trả về `RetailPrice` = 195,000 VND (kế thừa từ Master).

#### Scenario: Không tạo bản ghi tồn kho rỗng khi gán sản phẩm vào chi nhánh
- **GIVEN** Sản phẩm "Bánh Danisa" chưa từng có tồn kho tại Chi nhánh 1.
- **WHEN** Store Owner gán sản phẩm vào Chi nhánh 1 qua API `POST /api/branches/{branchId}/products`.
- **THEN** Hệ thống tạo bản ghi mới trong `BranchProducts` với `BranchId` và `ProductId` tương ứng.
- **AND** Hệ thống **KHÔNG** bắt buộc phải tạo lô hàng tồn kho giả trong `BranchStocks` khi chưa có nhập kho.

---

### Requirement: REQ-BPC-02 Override giá bán lẻ theo từng đơn vị tính (BranchProductUnitPrice)
Hệ thống **MUST** hỗ trợ lưu trữ giá bán lẻ riêng biệt cho từng đơn vị tính quy đổi (`ProductUnit`) tại từng chi nhánh thông qua bảng `BranchProductUnitPrices`. Khi cập nhật sản phẩm tại chi nhánh, hệ thống **MUST** cho phép gửi danh sách các mức giá bán theo từng ĐVT (`UnitPrices`). Nếu người dùng đặt giá khác giá Master của ĐVT, hệ thống **MUST** upsert vào `BranchProductUnitPrices`.

#### Scenario: Lưu và hiển thị giá bán theo từng ĐVT tại chi nhánh
- **GIVEN** Sản phẩm "Nước giải khát Coca-Cola" có:
  - ĐVT cơ sở "Lon" (Master price: 10,000 VND).
  - ĐVT phụ "Lốc 6 lon" (Master price: 58,000 VND).
  - ĐVT phụ "Thùng 24 lon" (Master price: 225,000 VND).
- **WHEN** Store Owner chỉnh sửa Chi nhánh 1 với giá Lon = 11,000 VND, Lốc = 62,000 VND, Thùng = 240,000 VND.
- **THEN** Hệ thống lưu `BranchProduct.SellingPriceOverride` = 11,000 VND.
- **AND** Hệ thống lưu 2 bản ghi `BranchProductUnitPrice` tương ứng cho Lốc (62,000 VND) và Thùng (240,000 VND).
- **AND** Khi gọi API `GET /api/branches/{branchId}/products`, payload trả về mảng `UnitPrices` chứa đầy đủ 3 mức giá trên.

#### Scenario: Fallback giá ĐVT về Master khi không có override
- **GIVEN** Sản phẩm tại Chi nhánh 2 không có bản ghi nào trong `BranchProductUnitPrices`.
- **WHEN** Truy vấn sản phẩm tại Chi nhánh 2.
- **THEN** Danh sách `UnitPrices` của sản phẩm tự động phản ánh các mức giá chuẩn lấy từ `ProductUnits.Price`.

---

### Requirement: REQ-BPC-03 Ràng buộc sản phẩm khả dụng theo Nhà cung cấp Active của chi nhánh
Hệ thống **MUST** cung cấp endpoint `GET /api/branches/{branchId}/assignable-products` chỉ trả về những sản phẩm thuộc về các Nhà cung cấp đang có liên kết hoạt động (`Active`) với chi nhánh đó (`ActiveSupplierIdsForBranch`). Khi gán sản phẩm, hệ thống **MUST** từ chối hoặc cảnh báo nếu sản phẩm không có NCC nào đang cung cấp cho chi nhánh.

#### Scenario: Chỉ hiển thị sản phẩm của NCC đang liên kết với chi nhánh
- **GIVEN** Chi nhánh 1 chỉ liên kết với Nhà cung cấp Vinamilk (NCC01).
- **AND** NCC01 cung cấp sản phẩm SP01 (Sữa tươi 1L) và SP02 (Sữa chua).
- **AND** Nhà cung cấp Acecook (NCC02) cung cấp sản phẩm SP03 (Mì Hảo Hảo), nhưng NCC02 chưa liên kết với Chi nhánh 1.
- **WHEN** Người dùng mở popup gán sản phẩm tại Chi nhánh 1.
- **THEN** Danh sách sản phẩm khả dụng chỉ hiển thị SP01 và SP02, **KHÔNG** hiển thị SP03.

#### Scenario: Đánh dấu sản phẩm đã gán để tránh gán trùng
- **GIVEN** Sản phẩm SP01 đã có mặt trong `BranchProducts` của Chi nhánh 1.
- **WHEN** Người dùng mở popup gán sản phẩm.
- **THEN** Bản ghi SP01 có cờ `IsAlreadyAssigned = true`, checkbox bị vô hiệu hóa (disabled) để tránh thao tác gán trùng lặp.

---

### Requirement: REQ-BPC-04 Khóa chỉnh sửa giá vốn và MOQ tại màn hình chi nhánh
Giá vốn (`CostPrice`) và số lượng đặt tối thiểu (`MinOrderQuantity` / MOQ) hiển thị trên danh sách và popup chi nhánh **MUST** được lấy trực tiếp từ `SupplierProducts` (giá sỉ thỏa thuận `AgreedWholesalePrice` có hiệu lực của NCC cung cấp cho chi nhánh). Endpoint `PUT /api/branches/{branchId}/products/{productId}` **MUST** bỏ qua (ignore) hoặc từ chối mọi giá trị `MinOrderQuantity` và `CostPrice` được gửi lên từ client, bảo vệ toàn vẹn điều khoản hợp đồng của NCC.

#### Scenario: Cập nhật sản phẩm tại chi nhánh không ghi đè MOQ của Nhà cung cấp
- **GIVEN** Sản phẩm SP01 có liên kết NCC với `MOQ = 5` và `AgreedWholesalePrice = 150,000 VND`.
- **WHEN** Người dùng gửi request `PUT /api/branches/{branchId}/products/{productId}` với `RetailPrice = 210,000 VND` và payload kèm `MinOrderQuantity = 25`.
- **THEN** Hệ thống cập nhật `RetailPrice` tại chi nhánh thành 210,000 VND.
- **AND** Giá trị `MinimumOrderQuantity` trong bảng `SupplierProducts` vẫn giữ nguyên là 5, không bị thay đổi.
- **AND** Dữ liệu trả về vẫn hiển thị `MinOrderQuantity` = 5 và `CostPrice` = 150,000 VND.

---

### Requirement: REQ-BPC-05 Cô lập trạng thái và giá bán giữa các chi nhánh (Branch Isolation)
Hành động thay đổi giá bán hoặc đổi trạng thái (`Active` / `Inactive`) của một sản phẩm tại một chi nhánh **MUST** chỉ có hiệu lực duy nhất tại chi nhánh đó. Hành động này **MUST NOT** làm thay đổi giá bán, trạng thái của sản phẩm tại chi nhánh khác, và **MUST NOT** thay đổi trạng thái của Master Product.

#### Scenario: Đổi trạng thái Inactive tại Chi nhánh 1 không ảnh hưởng Chi nhánh 2
- **GIVEN** Sản phẩm SP01 đang ở trạng thái `Active` tại Chi nhánh 1, Chi nhánh 2 và Master Catalog.
- **WHEN** Store Owner gọi `PATCH /api/branches/{branch1Id}/products/{prodId}/status` với `Status = "Inactive"`.
- **THEN** `BranchProduct.Status` tại Chi nhánh 1 đổi thành `Inactive`.
- **AND** `BranchProduct.Status` tại Chi nhánh 2 vẫn là `Active`.
- **AND** `Product.Status` tại Master Catalog vẫn là `Active`.

---

### Requirement: REQ-BPC-06 Chặn gỡ sản phẩm khỏi chi nhánh khi còn tồn kho vật lý
Hệ thống **MUST** ngăn chặn việc gỡ sản phẩm khỏi chi nhánh (`DELETE /api/branches/{branchId}/products/{productId}`) nếu tổng số lượng tồn kho vật lý của sản phẩm tại chi nhánh đó (`SUM(BranchStocks.QuantityOnHand)`) lớn hơn 0.

#### Scenario: Gỡ thất bại khi sản phẩm còn tồn kho
- **GIVEN** Sản phẩm SP01 đang có 25 đơn vị tồn kho trong `BranchStocks` tại Chi nhánh 1.
- **WHEN** Người dùng yêu cầu gỡ sản phẩm khỏi Chi nhánh 1.
- **THEN** Hệ thống từ chối xóa và ném mã lỗi `CANNOT_REMOVE_PRODUCT_WITH_STOCK` với HTTP Status `400 Bad Request`.

#### Scenario: Gỡ thành công khi số lượng tồn kho bằng 0
- **GIVEN** Sản phẩm SP02 có tồn kho bằng 0 tại Chi nhánh 1.
- **WHEN** Người dùng yêu cầu gỡ sản phẩm khỏi Chi nhánh 1.
- **THEN** Hệ thống đánh dấu xóa mềm `BranchProduct.IsDeleted = true` và trả về `200 OK` (hoặc `204 NoContent`).

---

### Requirement: REQ-BPC-07 Hiển thị bảng sản phẩm chi nhánh trực quan với Ảnh và Tổng hợp ĐVT
Bảng giao diện `StoreProductTable.tsx` **MUST** hiển thị:
1. Cột **Ảnh**: Hiển thị ảnh thu nhỏ (thumbnail) từ `ImageUrl` của Master Product; nếu không có ảnh, hiển thị placeholder chuẩn.
2. Cột **Mã SKU**: Kèm Barcode (nếu có).
3. Cột **ĐVT & Giá bán theo ĐVT**: Chuỗi tổng hợp trực quan dạng `ĐVT_cơ_sở: Giá · ĐVT_phụ_1: Giá · ĐVT_phụ_2: Giá`.
4. Cột **Giá vốn**: Hiển thị giá thỏa thuận từ NCC, kèm chú thích giá tham chiếu.
5. Cột **Giá bán lẻ**: Giá bán lẻ hiệu lực của ĐVT cơ sở tại chi nhánh.
6. Cột **Trạng thái & Thao tác**: Badge màu trực quan và các nút thao tác Sửa, Tạm ngưng/Kích hoạt, Gỡ.

---

### Requirement: REQ-BPC-08 Modal Gán và Chỉnh sửa sản phẩm tối ưu trải nghiệm (UX)
1. **Assign Modal**:
   - Cung cấp ô input tìm kiếm chi nhánh bằng text (hỗ trợ tìm theo tên hoặc mã chi nhánh).
   - Hiển thị địa chỉ chi nhánh tương ứng dưới dạng read-only để người dùng kiểm tra đối chiếu.
   - Hiển thị danh sách sản phẩm khả dụng với checkbox chọn nhanh.
2. **Edit Modal**:
   - Thiết kế dạng các dòng ngang (Horizontal rows): SKU, Tên sản phẩm, Đơn vị tính (read-only).
   - Hiển thị Giá vốn NCC và MOQ dạng read-only kèm nhãn giải thích.
   - Cho phép nhập giá bán lẻ cơ sở và giá bán theo từng ĐVT phụ.
   - Toggle Switch đổi trạng thái kinh doanh lưu ngay khi submit form.

---

## Acceptance Checklist
- [x] Entity `BranchProduct` và `BranchProductUnitPrice` được tạo và cấu hình đầy đủ trong EF Core.
- [x] Migration CSDL tạo bảng và backfill dữ liệu từ `BranchStocks` sang `BranchProducts` thành công.
- [x] API `GET /api/branches/{branchId}/products` trả về đúng cấu trúc DTO mới kèm `UnitPrices` và `ImageUrl`.
- [x] API `GET /api/branches/{branchId}/assignable-products` lọc đúng sản phẩm theo các NCC active của chi nhánh.
- [x] Giá vốn và MOQ read-only, không bị ghi đè khi gọi lệnh update chi nhánh.
- [x] Đổi giá và trạng thái độc lập hoàn toàn giữa các chi nhánh (Branch Isolation).
- [x] Chặn gỡ sản phẩm khi tồn kho vật lý > 0 (`CANNOT_REMOVE_PRODUCT_WITH_STOCK`).
- [x] Giao diện `StoreProductTable` hiển thị cột ảnh, tổng hợp giá theo ĐVT, nhãn trạng thái và các action.
- [x] Modal Gán SP hỗ trợ tìm chi nhánh text và danh sách khả dụng chuẩn xác.
- [x] Modal Sửa SP hỗ trợ sửa giá theo từng ĐVT và lưu thành công.
- [x] Toàn bộ test suite `BranchProductManagementTests` pass 100%.

