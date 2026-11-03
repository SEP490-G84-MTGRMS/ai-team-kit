# Đề xuất chức năng: CRUD cho Entity ProductUnit (Đơn vị tính & Quy đổi giá hàng hóa)

## 1. Vấn đề (Problem Statement)
- Trong mô hình tạp hóa và bán lẻ hiện đại (MT-GRMS), một mặt hàng thường được phân phối và bán theo nhiều đơn vị tính khác nhau (Ví dụ: Bia có Lon, Lốc 6 lon, Thùng 24 lon; Nước ngọt có Chai, Két 20 chai; Bánh kẹo có Gói, Hộp).
- Hiện tại hệ thống Backend mới chỉ quản lý đơn vị cơ bản (`BaseUnit`) trên bảng `Products`. Entity `ProductUnit` đã có sẵn trong Domain và EF Core nhưng chưa có tầng Service, Repository và API Controller tương ứng.
- Thiếu các API CRUD này khiến người dùng không thể cấu hình tỷ lệ quy đổi, giá bán riêng biệt và mã vạch riêng cho từng đơn vị lớn khi bán hàng tại POS hoặc kiểm kho.

## 2. Mục tiêu (Objectives)
- Xây dựng đầy đủ các API RESTful CRUD cho `ProductUnit` trên Backend .NET 8 Clean Architecture:
  1. `GET /api/v1/products/{productId}/units`: Lấy danh sách toàn bộ đơn vị tính của sản phẩm.
  2. `GET /api/v1/product-units/{id}`: Xem chi tiết một đơn vị tính.
  3. `POST /api/v1/products/{productId}/units`: Thêm mới đơn vị tính quy đổi.
  4. `PUT /api/v1/product-units/{id}`: Cập nhật thông tin đơn vị tính (tên, tỷ lệ quy đổi, giá bán, barcode).
  5. `DELETE /api/v1/product-units/{id}`: Xóa đơn vị tính quy đổi.
- Ràng buộc toàn vẹn dữ liệu: Tỷ lệ quy đổi $> 0$, giá bán $\ge 0$, tên đơn vị không được trùng trong cùng một sản phẩm, và barcode không bị trùng lặp.
- Thiết kế linh hoạt để Frontend có thể tích hợp vào màn hình Tạo/Sửa sản phẩm (`ProductFormModal.tsx`) và Chi tiết sản phẩm (`ProductDetailModal.tsx`).

## 3. Phạm vi (Scope)
### Trong phạm vi (In Scope)
- **Backend Application Layer**:
  - DTOs: `ProductUnitResponse`, `ProductUnitCreateRequest`, `ProductUnitUpdateRequest`.
  - Interface & Service: `IProductUnitRepository`, `IProductUnitService`, `ProductUnitService`.
  - Validation: Kiểm tra logic nghiệp vụ (tỷ lệ quy đổi, tên đơn vị, giá bán, barcode).
- **Backend Infrastructure Layer**:
  - `ProductUnitRepository` kế thừa `GenericRepository<ProductUnit>` và đăng ký DI.
- **Backend API Layer**:
  - `ProductUnitsController` (hoặc tích hợp các endpoint vào `ProductsController`).
- **Kiểm thử**:
  - Unit tests bao phủ toàn bộ các phương thức CRUD và các kịch bản lỗi biên (edge cases).

### Ngoài phạm vi (Out of Scope)
- Trừ kho tự động theo đơn vị tính khi bán hàng tại quầy POS (nằm trong luồng checkout POS Order).
- Giao diện người dùng Frontend (sẽ tích hợp ở change tiếp theo hoặc form chi tiết).

## 4. Người dùng & Phân quyền liên quan
- **StoreOwner (Chủ cửa hàng)**: Toàn quyền thêm, sửa, xóa đơn vị tính và giá bán của sản phẩm.
- **StoreManager (Quản lý cửa hàng)**: Quyền thêm, sửa đơn vị tính quy đổi.
- **Cashier (Nhân viên thu ngân)**: Chỉ có quyền đọc danh sách đơn vị tính để quét mã hoặc chọn đơn vị bán tại POS.

## 5. Tiêu chí thành công (Acceptance Criteria)
1. Endpoint `POST /api/v1/products/{productId}/units` tạo thành công đơn vị quy đổi mới và trả về HTTP 201 kèm ID.
2. Endpoint `GET /api/v1/products/{productId}/units` trả về danh sách đơn vị được sắp xếp hợp lý (đơn vị cơ bản lên đầu).
3. Endpoint `PUT /api/v1/product-units/{id}` cập nhật chính xác các thông tin đơn vị và kiểm tra trùng lặp tên/barcode.
4. Endpoint `DELETE /api/v1/product-units/{id}` xóa thành công và từ chối xóa nếu là đơn vị cơ bản duy nhất.
5. Kiểm duyệt dữ liệu từ chối với HTTP 400 khi `ConversionRate <= 0` hoặc tên đơn vị để trống.
6. 100% Unit tests trong `MT_GRMS.UnitTests` chạy pass, `dotnet build` đạt 0 lỗi.
