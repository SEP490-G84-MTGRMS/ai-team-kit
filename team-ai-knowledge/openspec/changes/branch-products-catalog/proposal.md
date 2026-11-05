# Proposal: branch-products-catalog

## 1. Vấn đề (Problem Statement)
Màn hình Quản lý Sản phẩm theo Cửa hàng (`/store-owner/stores/products`) trước đây phụ thuộc vào bảng tồn kho `BranchStocks` để truy vấn và quản lý danh mục sản phẩm của từng chi nhánh. Mô hình này gặp phải các hạn chế nghiêm trọng:
1. **Nhập nhằng giữa danh mục kinh doanh và tồn kho thực tế**: Không thể phân định giữa sản phẩm được phép kinh doanh tại chi nhánh với hàng hóa thực tế đang có số lượng tồn kho theo lô/hạn dùng (FEFO). Khi gán một sản phẩm vào chi nhánh mà chưa có phiếu nhập kho, hệ thống buộc phải tạo dòng `BranchStock` rỗng (`QuantityOnHand = 0`).
2. **Thiếu cơ chế override giá bán theo đơn vị tính (ĐVT)**: Sản phẩm kinh doanh tại các chi nhánh khác nhau có thể áp dụng chính sách giá bán lẻ khác nhau (do chi phí vận chuyển, mặt bằng, vùng miền). Đặc biệt, hệ thống chưa có bảng lưu giá bán override cho từng quy cách ĐVT (`ProductUnit`, ví dụ: chai, lốc, thùng), dẫn đến việc chỉ sửa được giá đơn vị cơ sở hoặc làm sai lệch giá các đơn vị phụ.
3. **Nhầm lẫn nguồn dữ liệu giá vốn và MOQ**: Trên giao diện quản lý chi nhánh, giá vốn (Cost Price) và số lượng đặt hàng tối thiểu (MOQ) dễ bị nhầm lẫn là các trường có thể chỉnh sửa tự do tại chi nhánh. Trên thực tế, giá nhập và MOQ phụ thuộc hoàn toàn vào hợp đồng và điều khoản với Nhà cung cấp (`SupplierProduct`) đang liên kết với chi nhánh đó.
4. **Thiếu liên kết tính khả dụng giữa Nhà cung cấp và Chi nhánh**: Cửa hàng có thể gán nhầm các sản phẩm mà chi nhánh đó không có bất kỳ Nhà cung cấp nào đang hoạt động hỗ trợ giao hàng.

## 2. Mục tiêu (Objectives)
1. **Tách biệt hoàn toàn tầng Persistence**:
   - Tạo thực thể `BranchProduct` chuyên trách lưu trữ danh mục sản phẩm kinh doanh tại chi nhánh, giá bán lẻ override cơ sở, vị trí quầy kệ và trạng thái kinh doanh (`Active`/`Inactive`).
   - Tạo thực thể `BranchProductUnitPrice` lưu trữ giá bán lẻ override cho từng đơn vị tính phụ tại từng chi nhánh.
   - Trả bảng `BranchStocks` về đúng trách nhiệm duy nhất: lưu trữ tồn kho vật lý theo lô/vị trí/giá vốn nhập kho.
2. **Tự động migrate dữ liệu cũ**:
   - Viết migration EF Core tự động quét toàn bộ liên kết `(BranchId, ProductId)` hiện hữu trong `BranchStocks` để chuyển sang `BranchProducts` mà không làm gián đoạn dữ liệu vận hành.
3. **Đồng bộ điều khoản Nhà cung cấp (Supplier Terms)**:
   - Giá vốn hiển thị trên danh sách và popup chi nhánh được lấy trực tiếp từ `SupplierProducts` (giá sỉ thỏa thuận `AgreedWholesalePrice` có hiệu lực của NCC liên kết với chi nhánh).
   - Khóa hoàn toàn khả năng chỉnh sửa giá vốn và MOQ tại màn hình chi nhánh (chỉ đọc - read-only).
   - Chỉ cho phép gán các sản phẩm có Nhà cung cấp đang liên kết hoạt động (`Active`) với chi nhánh mục tiêu (`ActiveSupplierIdsForBranch`).
4. **Chuẩn hóa giao diện người dùng (UI/UX)**:
   - Bảng sản phẩm chi nhánh: Bổ sung cột Ảnh sản phẩm (thumbnail), cột Tổng hợp giá bán theo ĐVT (ví dụ: `Cái: 10.000 · Lốc: 58.000 · Thùng: 230.000`), nhãn trạng thái và hành động trực quan.
   - Popup gán sản phẩm: Hỗ trợ tìm kiếm chi nhánh bằng văn bản (text input), tự động hiển thị địa chỉ chi nhánh, chỉ hiển thị danh mục sản phẩm đủ điều kiện.
   - Popup chỉnh sửa: Thiết kế layout ngang hiện đại, hiển thị rõ ràng giá vốn/MOQ tham chiếu và cho phép cấu hình giá bán lẻ cho từng ĐVT.

## 3. Phạm vi (Scope)

### In Scope
- **Backend (Domain & Infrastructure)**:
  - Entity `BranchProduct` và `BranchProductUnitPrice` kế thừa `BaseTenantEntity`.
  - Cấu hình EF Core Fluent API, thiết lập Unique Index đa trường cô lập Multi-tenant.
  - Các bản Migration: `20261103230000_AddBranchProductsCatalog.cs` và `20261103233000_AddBranchProductUnitPrices.cs`.
- **Backend (Application & API)**:
  - Cập nhật `IBranchProductRepository` và `BranchProductRepository`.
  - Nâng cấp `BranchProductService` để đọc-ghi qua `BranchProducts` và `BranchProductUnitPrices`.
  - Các DTO: `BranchProductDto`, `BranchProductUnitPriceDto`, `AssignableBranchProductDto`, `AssignBranchProductsCommand`, `UpdateBranchProductCommand`.
  - Logic tính giá vốn từ NCC và lọc sản phẩm khả dụng (`GetAssignableProductsForBranchAsync`).
  - Unit tests bao phủ toàn diện tại `BranchProductManagementTests` và `SupplierProductManagementTests`.
- **Frontend**:
  - Tích hợp API service `storeProductApi.ts` hỗ trợ tải danh mục chi nhánh theo cấu trúc mới.
  - Cập nhật `StoreProductTable.tsx` hiển thị ảnh, SKU, ĐVT, giá theo ĐVT, giá vốn từ NCC.
  - Cải tiến `AssignStoreProductModal.tsx` và `EditStoreProductModal.tsx`.
  - Cập nhật giao diện gán nhà cung cấp vào chi nhánh `AssignBranchModal.tsx`.

### Out of Scope
- Quản lý tạo mới sản phẩm Master Product và Master ProductUnit (do module Catalog đảm nhiệm).
- Nghiệp vụ xuất nhập kho, kiểm kê, thuật toán xuất kho FEFO (do module Inventory đảm nhiệm).
- Thay đổi cấu trúc đơn đặt hàng PO hoặc bảng giá gốc của Nhà cung cấp (thực hiện ở màn hình NCC).

## 4. Người dùng & Role liên quan
- **Store Owner (Chủ chuỗi / Chủ cửa hàng)**:
  - Quản lý danh mục phân bổ hàng hóa cho các cơ sở chi nhánh.
  - Thiết lập giá bán lẻ riêng phù hợp với từng điểm bán.
  - Tạm dừng kinh doanh hoặc gỡ bỏ sản phẩm khi chi nhánh không còn kinh doanh mặt hàng đó.
- **Branch Manager / Staff (Quản lý & Nhân viên chi nhánh)**:
  - Tra cứu thông tin giá bán lẻ hiệu lực và vị trí trưng bày quầy kệ (`ShelfLocation`) của từng sản phẩm tại chi nhánh.

## 5. Tiêu chí thành công (Success Criteria)
1. Tách bảng CSDL thành công; dữ liệu sản phẩm đang gán tại các chi nhánh được migrate an toàn sang `BranchProducts`.
2. Giá bán lẻ ở từng chi nhánh có tính độc lập cao: thay đổi giá tại Chi nhánh A không làm ảnh hưởng Chi nhánh B hay Master Catalog.
3. Hỗ trợ cấu hình giá bán theo từng ĐVT (`BranchProductUnitPrice`), tự động fallback về giá Master khi không có override.
4. Giá vốn và MOQ hiển thị chính xác theo liên kết NCC của chi nhánh, không có lỗ hổng cho phép chỉnh sửa giá nhập từ màn hình chi nhánh.
5. Chặn tuyệt đối hành vi gỡ sản phẩm khỏi chi nhánh khi tồn kho vật lý vẫn còn (`QuantityOnHand > 0`).
6. Toàn bộ unit tests backend (`BranchProductManagementTests`) và các test frontend liên quan pass 100%.

