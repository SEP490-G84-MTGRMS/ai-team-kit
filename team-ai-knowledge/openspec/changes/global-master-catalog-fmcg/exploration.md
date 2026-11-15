# Exploration: Kho Danh mục Hàng hóa Mẫu Toàn Cầu (Global FMCG Master Catalog)

## 1. Hiện trạng Codebase Liên quan
- **Backend (`MT_GRMS_BACKEND`)**:
  - `Product` (`MT_GRMS.Domain.Entities.Catalog.Product`): Kế thừa `BaseTenantEntity`, phân lập chặt chẽ theo `TenantId` thông qua Global Query Filter của EF Core.
  - `ProductUnit` (`MT_GRMS.Domain.Entities.Catalog.ProductUnit`): Lưu trữ đơn vị quy đổi (Thùng, Lốc, Lon), cũng gắn theo `TenantId`.
  - `ProductsController.GetByBarcode`: Hiện chỉ tìm kiếm trong bảng `Product` của đúng `TenantId` hiện tại. Khi chủ tiệm quét mã vạch mới chưa nhập kho, endpoint trả về 404 `NOT_FOUND` và phía FE không có cơ chế gợi ý.
  - Phân hệ Admin: Có `AdminPlansController`, `AdminTenantsController`, `AdminDashboardController` phục vụ Super Admin (`RoleConstants.AdminOnly`), nhưng chưa có module quản lý danh mục dùng chung toàn cầu.
  - Xử lý Excel: Đã tích hợp thư viện `ClosedXML` chuẩn (đang dùng tại `SupplierProductExcelService` và `MatrixExcelImportService`).
- **Frontend (`MT_GRMS_FRONTEND`)**:
  - `AdminLayout`: Đang có các menu Dashboard, Tenants, Subscriptions; chưa có mục quản lý Hàng mẫu Toàn cầu.
  - `ProductFormModal.tsx`: Form tạo sản phẩm mới của Tenant yêu cầu nhập tay toàn bộ thông tin (Tên, Mã vạch, ĐVT, Danh mục, Đơn vị quy đổi) mà chưa có kết nối tra cứu mã vạch ngoài.

## 2. Assumptions (Giả định)
- **[ASSUMPTION-01]**: Mã vạch EAN-13 tiêu chuẩn hàng FMCG tại Việt Nam có tiền tố `893` (hoặc các mã quốc tế nhập khẩu 12–13 số), mang tính định danh duy nhất cho một mẫu bao bì sản phẩm.
- **[ASSUMPTION-02]**: Dữ liệu Master Catalog thuộc quyền sở hữu của Nền tảng (Platform Level), chỉ Super Admin mới có quyền thêm/sửa/xóa/import file Excel; các Tenant chỉ có quyền đọc (Read-only lookup) và sao chép về kho của mình.
- **[ASSUMPTION-03]**: Giá bán và giá vốn trong Master Catalog chỉ là giá thị trường tham khảo (Suggested Retail Price); khi Tenant clone về kho, Tenant toàn quyền sửa giá và quy cách theo thực tế kinh doanh của tiệm mình.
- **[ASSUMPTION-04]**: Super Admin chuẩn bị dữ liệu file Excel theo định dạng chuẩn `.xlsx` (tải từ template của hệ thống).

## 3. Non-Goals (Những gì không làm)
- Không đồng bộ ngược: Khi Tenant sửa tên hoặc giá sản phẩm trong kho riêng của họ, hệ thống **không** cập nhật ngược lại vào Master Catalog của Super Admin.
- Không tự động thay đổi giá của các sản phẩm mà Tenant đã nhập trước đó khi Master Catalog có cập nhật mới.
- Không cho phép Tenant trực tiếp thao tác ghi/xóa vào các bảng Master Catalog.

## 4. Đánh giá Các Phương án Kỹ thuật (Trade-off Analysis)

### Phương án A: Thêm cờ `IsMasterTemplate` vào chính bảng `Products` hiện tại
- **Cơ chế**: Dùng chung bảng `Products`, thêm cột `IsMasterTemplate = true` và cho phép `TenantId = NULL` hoặc `"SYSTEM"`.
- **Ưu điểm**: Tái sử dụng bảng hiện có, không cần tạo bảng mới.
- **Nhược điểm**:
  - Vi phạm nguyên tắc phân lập Multi-tenant: Phải vô hiệu hóa hoặc chỉnh sửa Global Query Filter của EF Core trên toàn bộ bảng `Products`, rủi ro làm rò rỉ dữ liệu giữa các tenant rất cao.
  - Bảng `Products` vốn có các quan hệ phức tạp với Lô hàng (Batches), Tồn kho (Inventories), Bảng giá chi nhánh (BranchProducts) không cần thiết cho hàng mẫu.
  - Gây chậm truy vấn khi dữ liệu bán lẻ phình to.

### Phương án B: Tách biệt thực thể riêng `MasterProduct` & `MasterProductUnit` kế thừa `BaseEntity` (Khuyên dùng)
- **Cơ chế**: Tạo bảng độc lập `MasterProducts` và `MasterProductUnits` kế thừa `BaseEntity` (không có `TenantId`, độc lập hoàn toàn với `BaseTenantEntity`).
- **Ưu điểm**:
  - Đảm bảo an toàn tuyệt đối 100% cho Multi-tenant Global Query Filters.
  - Thiết kế Schema tinh gọn, chỉ chứa các trường cần thiết cho thư viện mẫu (Tên, Barcode EAN-13, Brand, Category, ImageUrl, BaseUnit, Packaging Specs, SuggestedPrice, VatRate).
  - Tối ưu hóa hiệu năng index độc lập trên cột `Barcode` toàn cầu.
  - Khi Tenant clone về, backend chỉ cần thực hiện 1 câu mapping đơn giản để tạo `Product` và `ProductUnit` mới gắn `TenantId`.
- **Nhược điểm**: Cần tạo thêm 2 thực thể và 1 migration mới trong EF Core.

**=> Lựa chọn**: **Phương án B** vì bảo toàn triệt để kiến trúc Clean Architecture, an toàn bảo mật phân lập tenant và hiệu năng tối ưu.

## 5. Rủi ro & Cách Giảm Thiểu
1. **Rủi ro trùng lặp mã vạch khi Import Excel**:
   - *Giảm thiểu*: Thiết lập Unique Index trên `MasterProducts.Barcode`. Trong quá trình import bằng ClosedXML, hỗ trợ 2 chế độ: "Bỏ qua dòng trùng" (Skip) hoặc "Cập nhật thông tin mới" (Upsert).
2. **Rủi ro file Excel dung lượng lớn (hàng chục nghìn dòng) làm nghẽn bộ nhớ**:
   - *Giảm thiểu*: Sử dụng ClosedXML stream/row-by-row reading, giới hạn file tối đa 10MB hoặc 10.000 dòng mỗi lần upload, xử lý batch save `_dbContext.SaveChangesAsync()` mỗi 500 bản ghi.
3. **Rủi ro mạng chậm khi Tenant gõ từng ký tự barcode**:
   - *Giảm thiểu*: Áp dụng `useDebounce` (500ms) ở phía Frontend và chỉ gọi API tra cứu khi chuỗi barcode có độ dài $\ge 8$ ký tự hoặc khi nhận tín hiệu Enter từ máy quét USB HID.
