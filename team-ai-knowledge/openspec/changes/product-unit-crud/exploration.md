# EXP-2026-10-30-002: Khảo sát kiến trúc CRUD cho Entity ProductUnit

## 1. Hiện trạng code & Bối cảnh (Current State & Context)
- **Domain**: Entity `ProductUnit` (`src/MT_GRMS.Domain/Entities/Catalog/ProductUnit.cs`) kế thừa `BaseEntity`, chứa các trường:
  - `ProductId`: Guid (Khóa ngoại trỏ đến `Product`)
  - `UnitName`: string (Tên đơn vị: Thùng, Lon, Lốc, Chai,...)
  - `ConversionRate`: decimal (Tỷ lệ quy đổi so với đơn vị cơ bản)
  - `Price`: decimal (Giá bán riêng áp dụng cho đơn vị này)
  - `Barcode`: string? (Mã vạch riêng của đơn vị)
  - `IsBaseUnit`: bool (Đánh dấu đơn vị cơ bản)
- **Database & Persistence**:
  - `ProductUnitConfiguration.cs` đã cấu hình bảng `ProductUnits` với khóa ngoại `ProductId`, quan hệ 1-Nhiều với `Product`.
  - `AppDbContext.cs` đã khai báo `DbSet<ProductUnit> ProductUnits`.
- **Khoảng trống cần bổ sung**:
  - Chưa có DTOs (`ProductUnitResponse`, `ProductUnitCreateRequest`, `ProductUnitUpdateRequest`).
  - Chưa có Repository chuyên biệt hoặc Service nghiệp vụ quản lý quy đổi.
  - Chưa có API Controllers để tiếp nhận request từ client.

## 2. Giả định (Assumptions)
- **[ASSUMPTION-01]**: Mỗi sản phẩm trong hệ thống có thể có từ 1 đến nhiều đơn vị tính.
- **[ASSUMPTION-02]**: Tỷ lệ quy đổi (`ConversionRate`) thể hiện số lượng đơn vị cơ bản chứa trong 1 đơn vị quy đổi (Ví dụ: 1 Thùng bia = 24 Lon thì `ConversionRate = 24.00`).
- **[ASSUMPTION-03]**: Mọi thao tác đều phải thuộc về Tenant hiện tại và sản phẩm cha phải đang tồn tại và thuộc cùng Tenant.

## 3. Ràng buộc (Constraints)
- Tuân thủ Clean Architecture 4 tầng của backend .NET 8.
- Validation:
  - Tên đơn vị không được rỗng và không được trùng nhau trong cùng một sản phẩm.
  - `ConversionRate` phải $> 0$.
  - `Price` phải $\ge 0$.
  - Nếu `IsBaseUnit == true` thì `ConversionRate` bắt buộc phải bằng $1.00$.
- Mã lỗi trả về chuẩn ProblemDetails RFC 7807 với `ApiResponse<T>`.

## 4. Mục tiêu ngoài phạm vi (Non-Goals)
- Không thay đổi bảng CSDL (sử dụng nguyên vẹn bảng `ProductUnits` đã có).
- Không tự động trừ tồn kho theo đơn vị tính khi bán hàng tại POS (nằm trong phase checkout).

## 5. Khảo sát các phương án kỹ thuật (Options Analysis)

### Phương án 1: Nhúng danh sách Units trong API Product Update (Embedded Array)
- **Mô tả**: Khi cập nhật đơn vị tính, client gửi toàn bộ mảng `units: []` vào `PUT /api/v1/products/{id}`.
- **Ưu điểm**: Ít endpoint hơn.
- **Nhược điểm**: Bất tiện khi chỉ muốn sửa giá bán hoặc thêm 1 đơn vị mới; client phải tải lại toàn bộ thông tin sản phẩm cha; dễ gây xung đột dữ liệu (concurrency conflict).

### Phương án 2: Xây dựng RESTful Resource độc lập với Controller riêng (ĐƯỢC CHỌN)
- **Mô tả**: Thiết kế bộ endpoint RESTful chuẩn:
  - `GET /api/v1/products/{productId}/units` & `POST /api/v1/products/{productId}/units`
  - `GET /api/v1/product-units/{id}`, `PUT /api/v1/product-units/{id}`, `DELETE /api/v1/product-units/{id}`
- **Ưu điểm**:
  - Rõ ràng, đúng chuẩn RESTful cho Sub-Resource.
  - Cho phép thao tác thêm/sửa/xóa từng đơn vị nhanh chóng mà không ảnh hưởng đến sản phẩm cha.
  - Dễ dàng tích hợp vào cả màn hình Form sản phẩm lẫn Modal chi tiết.
- **Nhược điểm**: Cần tạo thêm 1 controller hoặc nhóm route mới. (Hoàn toàn phù hợp với kiến trúc hiện có).

## 6. Đánh giá rủi ro & Cách khắc phục (Risks & Mitigations)
- **Rủi ro 1: Trùng lặp Barcode giữa đơn vị quy đổi và sản phẩm**:
  - *Khắc phục*: Service kiểm tra xem Barcode đã tồn tại trong bảng `Products` hoặc `ProductUnits` của tenant chưa trước khi lưu.
- **Rủi ro 2: Xóa mất đơn vị cơ bản duy nhất của sản phẩm**:
  - *Khắc phục*: Chặn xóa nếu đơn vị đó có `IsBaseUnit == true` và sản phẩm không còn đơn vị nào khác.
