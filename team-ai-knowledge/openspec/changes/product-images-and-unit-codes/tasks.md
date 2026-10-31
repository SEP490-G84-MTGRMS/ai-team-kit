# Tasks: product-images-and-unit-codes

> **Quy định kỹ thuật:**
> - Backend: .NET 8 LTS Clean Architecture, EF Core 8 Code-First, xUnit tests.
> - Frontend: React 19 + TypeScript, Vite. KHÔNG dùng custom hook thừa, tuân thủ chặt chẽ style hiện có của codebase.

---

## 1. Database (Entity & Migration)
- [ ] T1 — Tạo entity `ProductImage.cs` trong `MT_GRMS.Domain`, bổ sung trường `UnitCode` vào `ProductUnit.cs` và navigation `ICollection<ProductImage> Images` trong `Product.cs`. (REQ-01, REQ-02)
- [ ] T2 — Cập nhật `AppDbContext.cs` và các cấu hình EntityTypeConfigurations (`ProductImageConfiguration.cs`, `ProductUnitConfiguration.cs`, `ProductConfiguration.cs`). Tạo EF Core Migration `AddProductImagesAndUnitCode`. (REQ-01, REQ-02)

---

## 2. Backend (Application & API)
- [ ] T3 — Cập nhật DTOs trong `MT_GRMS.Application`:
  - `ProductDtos.cs`: Bổ sung `ProductImageDto`, đưa `Images` vào `ProductResponse`, `ProductCreateRequest`, `ProductUpdateRequest`. (REQ-01)
  - `ProductUnitDtos.cs`: Bổ sung `UnitCode` vào `ProductUnitResponse`, `ProductUnitCreateRequest`, `ProductUnitUpdateRequest`. (REQ-02)
- [ ] T4 — Cập nhật `ProductRepository.cs` và `ProductService.cs` (hoặc tương đương) xử lý lưu danh sách `ProductImages` (thêm, cập nhật, xóa cascade), tự động đồng bộ ảnh `IsMain` (hoặc ảnh đầu tiên) vào `Product.ImageUrl`. (REQ-01)
- [ ] T5 — Cập nhật `ProductUnitService.cs` thêm logic tự động sinh `UnitCode` theo format `{product.ProductCode}-{unitSlug}` khi người dùng để trống, và kiểm tra tính duy nhất của mã hàng đơn vị trong cùng Tenant. (REQ-02)
- [ ] T6 — Cập nhật `ProductsController.cs` và `ProductUnitsController.cs` để nhận và trả về đúng dữ liệu ảnh và mã đơn vị tính. (REQ-01, REQ-02)

---

## 3. Frontend (Types, Form, Detail Modal)
- [ ] T7 — Cập nhật types và API client:
  - `src/features/product/types/index.ts`: thêm `ProductImageItem`, trường `images` trong `ProductResponse`, `unitCode` trong `ProductUnitResponse` và các payload.
  - `src/features/product/api/productApi.ts`: đồng bộ interface payload tạo/cập nhật đơn vị và sản phẩm. (REQ-01, REQ-02)
- [ ] T8 — Nâng cấp `ProductFormModal.tsx`:
  - Khu vực tải ảnh: Cho phép upload nhiều ảnh, hiển thị danh sách ảnh thumbnail kèm nhãn/nút "Đặt làm ảnh chính", nút xóa ảnh (nếu xóa ảnh chính thì tự động chuyển cờ ảnh chính cho ảnh đầu tiên còn lại).
  - Bảng "Hàng cùng loại": Tự động điền mã hàng gợi ý `{productCode}-{unitName}` vào ô Mã hàng khi người dùng nhập đơn vị quy đổi mới, cho phép chỉnh sửa trực tiếp. (REQ-02, REQ-03)
- [ ] T9 — Nâng cấp `ProductDetailModal.tsx`:
  - Cố định kích thước modal: `maxWidth: 1160px, width: '96vw', height: '90vh'`.
  - Layout 3 tầng chuẩn: Header cố định (`flexShrink: 0`), Footer cố định (`flexShrink: 0`), phần thân tab body cuộn độc lập (`flex: 1, overflowY: 'auto'`), đảm bảo chuyển qua lại giữa các tab (Thông tin chung, Thẻ kho...) giữ nguyên 100% kích thước modal không bị giật. (REQ-04)
  - Nạp dữ liệu thực tế từ API cho "Mô tả" (`product.description`) và "Ghi chú nội bộ" (`product.internalNote`), hiển thị placeholder nếu rỗng. (REQ-05)
  - Thư viện Gallery nhiều ảnh: Hiển thị ảnh chính lớn bên trên kèm dải thumbnails bên dưới để click chọn xem ảnh, hỗ trợ Lightbox phóng to ảnh. (REQ-05)

---

## 4. Test & Verification
- [ ] T10 — Viết Backend Unit test trong `MT_GRMS.UnitTests` kiểm thử:
  - Tự động sinh `UnitCode` cho `ProductUnit` khi để trống.
  - Lưu trữ danh sách `ProductImages` và tự động cập nhật `Product.ImageUrl` theo ảnh đại diện `IsMain`. (REQ-01, REQ-02)
- [ ] T11 — Viết Frontend Unit test trong `ProductFormModal.test.tsx` và `ProductDetailModal.test.tsx` kiểm thử:
  - Upload nhiều ảnh và chọn ảnh đại diện trong form.
  - Cố định layout và hiển thị đúng dữ liệu thực tế mô tả/ghi chú/gallery ảnh trong modal chi tiết. (REQ-03, REQ-04, REQ-05)
