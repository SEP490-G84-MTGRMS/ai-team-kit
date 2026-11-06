# Exploration: branch-products-catalog

## 1. Hiện trạng Code liên quan (Current State Analysis)

### Backend:
- **Thực thể Domain**:
  - `Product.cs`: Chứa thông tin Master (SKU, Barcode, Tên, Giá bán niêm yết `SellingPrice`, Giá vốn chuẩn `CostPrice`, Đơn vị cơ sở `BaseUnit`).
  - `ProductUnit.cs`: Chứa quy cách ĐVT phụ, hệ số quy đổi `ConversionRate`, và giá bán chuẩn `Price`.
  - `BranchStock.cs`: Trước đây vừa lưu trữ số lượng tồn thực tế (`QuantityOnHand`), vừa lưu trữ giá bán lẻ tại chi nhánh (`RetailPrice`) và trạng thái (`Status`).
- **Tầng Application & Repository**:
  - `BranchProductService.cs` và `BranchProductRepository.cs`: Trước đây thực hiện truy vấn trực tiếp trên bảng `BranchStocks`. Khi một sản phẩm được gán vào chi nhánh mà chưa phát sinh nhập kho, hệ thống phải tạo một bản ghi `BranchStock` với `QuantityOnHand = 0`.
  - Khi cần cập nhật giá hoặc trạng thái, service cập nhật trên các bản ghi `BranchStock` của sản phẩm tại chi nhánh đó. Nếu sản phẩm có nhiều lô hàng trong kho, việc update phải duyệt qua nhiều dòng hoặc phát sinh tình trạng bất nhất giá.
  - Chưa có bảng lưu trữ giá bán override cho các ĐVT phụ tại chi nhánh.

### Frontend:
- Màn hình `/store-owner/stores/products` sử dụng `storeProductApi.ts` gọi các endpoint branch product.
- `StoreProductTable.tsx` hiển thị dữ liệu bảng nhưng thiếu ảnh sản phẩm, thiếu cột tổng hợp giá bán theo ĐVT.
- `AssignStoreProductModal.tsx` chọn chi nhánh qua dropdown đơn giản, chưa lọc chặt chẽ theo danh sách NCC đang cung cấp cho chi nhánh.
- `EditStoreProductModal.tsx` trước đây có layout cũ, còn trường MOQ gây nhầm lẫn với điều khoản nhập hàng từ NCC.

## 2. Giả định (Assumptions)
1. **Quy tắc giá bán mặc định (Fallback Chain)**:
   - Nếu `BranchProduct.SellingPriceOverride == null`, giá bán lẻ của sản phẩm tại chi nhánh sẽ lấy giá niêm yết chung từ `Product.SellingPrice`.
   - Nếu một ĐVT phụ chưa có bản ghi trong `BranchProductUnitPrice`, giá bán lẻ theo ĐVT đó tại chi nhánh sẽ lấy từ `ProductUnit.Price`.
2. **Quy tắc gán sản phẩm**:
   - Một sản phẩm chỉ được coi là "khả dụng để gán vào chi nhánh" nếu tồn tại ít nhất một Nhà cung cấp đang ở trạng thái `Active`, có liên kết với chi nhánh đó (`BranchSuppliers`), và đang cung cấp mặt hàng này (`SupplierProducts`).
3. **Quy tắc an toàn tồn kho (Safety Invariant)**:
   - Một sản phẩm không thể bị gỡ khỏi chi nhánh (`BranchProduct.IsDeleted = true`) nếu tổng số lượng tồn kho vật lý tại chi nhánh đó (`SUM(BranchStocks.QuantityOnHand)`) lớn hơn 0.

## 3. Non-Goals
- Không thay đổi cấu trúc bảng `BranchStocks` hay cơ chế quản lý xuất kho theo hạn dùng (FEFO) và quản lý lô hàng (`Batch`).
- Không cho phép người dùng thay đổi giá nhập thỏa thuận (`AgreedWholesalePrice`) hay số lượng đặt tối thiểu (`MOQ`) từ màn hình Quản lý Sản phẩm Cửa hàng (phải thực hiện tại màn hình Quản lý Nhà cung cấp).
- Không tự động thay đổi giá trong các đơn đặt hàng (PO) đã chốt trước đó khi giá chi nhánh thay đổi.

## 4. Các phương án kiến trúc & đánh giá (Options Evaluation)

### Phương án 1: Giữ nguyên bảng `BranchStocks`, bổ sung cột cờ `IsAssigned` và cấu trúc JSON cho giá ĐVT
- **Ưu điểm**:
  - Không cần tạo bảng mới, migration nhẹ nhàng.
  - Ít thay đổi trong các câu lệnh JOIN hiện hữu.
- **Nhược điểm**:
  - Vi phạm nguyên tắc Single Responsibility Principle (SRP): bảng quản lý tồn kho vật lý lại gánh thêm chức năng danh mục kinh doanh và thiết lập chính sách giá.
  - Dữ liệu rác: sản phẩm gán vào nhưng không có tồn kho vẫn phải tạo dòng `BranchStock` rỗng.
  - Lưu giá ĐVT bằng JSON gây khó khăn cho việc lập chỉ mục (index), truy vấn báo cáo, kiểm soát toàn vẹn dữ liệu ngoại khóa và đa người dùng.

### Phương án 2 (Được chọn): Tách thực thể độc lập `BranchProduct` và `BranchProductUnitPrice`
- **Mô tả**:
  - Tạo bảng `BranchProducts` chuyên trách liên kết Product ↔ Branch, lưu `SellingPriceOverride`, `Status`, `ShelfLocation`.
  - Tạo bảng `BranchProductUnitPrices` liên kết 1-N với `BranchProduct`, lưu giá bán override cho từng `ProductUnit`.
  - `BranchStocks` chỉ đơn thuần liên kết `(BranchId, ProductId)` để quản lý số lượng tồn, giá vốn nhập kho từng lô.
- **Ưu điểm**:
  - Thiết kế chuẩn hóa Clean Architecture và mô hình cơ sở dữ liệu quan hệ (3NF).
  - Phân tách rõ ràng giữa "Quyền kinh doanh & Chính sách giá" và "Hàng hóa vật lý trong kho".
  - Dễ dàng mở rộng, tối ưu truy vấn, quản lý khóa ngoại toàn vẹn đến `Products`, `Branches`, và `ProductUnits`.
  - Hỗ trợ tốt cơ chế Multi-tenant với `TenantId` trên từng thực thể.
- **Nhược điểm**:
  - Cần viết migration chuyển dữ liệu cũ từ `BranchStocks` sang `BranchProducts`.
  - Cần cập nhật các câu lệnh JOIN trong `BranchProductRepository`.

## 5. Phương án lựa chọn & Lý do (Chosen Option)
Chọn **Phương án 2**. Đây là giải pháp căn cơ, sạch sẽ, giải quyết dứt điểm các lỗi logic và xung đột dữ liệu giữa tồn kho và danh mục bán hàng, đồng thời đáp ứng trọn vẹn yêu cầu nghiệp vụ về cấu hình giá bán lẻ theo từng đơn vị tính tại chi nhánh.

## 6. Rủi ro & Biện pháp giảm thiểu (Risks & Mitigation)
1. **Rủi ro mất dữ liệu khi chuyển đổi (Data Migration Risk)**:
   - *Biện pháp*: Viết migration EF Core sử dụng câu lệnh SQL an toàn: `INSERT INTO "BranchProducts" ... SELECT DISTINCT "TenantId", "BranchId", "ProductId", ... FROM "BranchStocks" ON CONFLICT DO NOTHING`. Đảm bảo các sản phẩm đã có trong kho đều tự động có mặt trong danh mục chi nhánh.
2. **Rủi ro xung đột giá khi đồng thời cập nhật nhiều ĐVT**:
   - *Biện pháp*: Cấu hình Unique Index trên `(TenantId, BranchProductId, ProductUnitId)` và áp dụng cơ chế Upsert (nếu đã có thì update giá, chưa có thì insert, nếu giá bằng giá Master thì có thể xóa override để tiết kiệm dung lượng).
3. **Rủi ro ảnh hưởng đến các màn hình khác (POS, Bán hàng, Kiểm kho)**:
   - *Biện pháp*: Viết bộ unit tests hoàn chỉnh trong `BranchProductManagementTests`, bao phủ các case: lấy danh sách phân trang, gán sản phẩm, sửa giá độc lập giữa các chi nhánh, đổi trạng thái cô lập, chặn gỡ khi còn tồn kho.

