# Tasks: product-images-and-unit-codes

> **Quy định kỹ thuật:**
> - Backend: .NET 8 LTS Clean Architecture, EF Core 8 Code-First (Npgsql / PostgreSQL text[] array), xUnit tests.
> - Frontend: React 19 + TypeScript, Vite. KHÔNG dùng custom hook thừa, tuân thủ chặt chẽ style hiện có của codebase.

---

## 1. Database (Entity & Migration)
- [x] T1 — Bổ sung `public List<string> ImageUrls { get; set; } = new();` và `[NotMapped] public string? ImageUrl => ImageUrls.FirstOrDefault();` vào `Product.cs`, bổ sung trường `UnitCode` vào `ProductUnit.cs`. (REQ-01, REQ-02)
- [x] T2 — Cập nhật `AppDbContext.cs` và EntityTypeConfigurations: ánh xạ `builder.Property(x => x.ImageUrls).HasColumnType("text[]");` trong `ProductConfiguration.cs`, cấu hình `UnitCode` trong `ProductUnitConfiguration.cs`. Tạo EF Core Migration `20261031185633_AddProductImageUrlsAndUnitCode` và áp dụng thành công lên PostgreSQL. (REQ-01, REQ-02)

---

## 2. Backend (Application & API)
- [x] T3 — Cập nhật DTOs trong `MT_GRMS.Application`:
  - `ProductDtos.cs`: Đưa `List<string>? ImageUrls` vào `ProductResponse`, `ProductCreateRequest`, `ProductUpdateRequest`. (REQ-01)
  - `ProductUnitDtos.cs`: Bổ sung `UnitCode` vào `ProductUnitResponse`, `ProductUnitCreateRequest`, `ProductUnitUpdateRequest`. (REQ-02)
- [x] T4 — Cập nhật `CatalogService.cs` xử lý lưu trữ `ImageUrls` dạng native array PostgreSQL, tự động gán và map `ImageUrl` đại diện tương thích ngược. (REQ-01)
- [x] T5 — Cập nhật `ProductUnitService.cs` thêm logic tự động sinh `UnitCode` theo format `{product.ProductCode}-{unitSlug}` (kèm hậu tố chống trùng `-1`, `-2`) khi để trống. (REQ-02)
- [x] T6 — Cập nhật Controllers và DTO mappings để tiếp nhận và trả về đúng dữ liệu `ImageUrls` và `UnitCode`. (REQ-01, REQ-02)

---

## 3. Frontend (Types, Form, Detail Modal)
- [x] T7 — Cập nhật types và API client:
  - `src/features/product/types/index.ts`: thêm `imageUrls?: string[]` trong `ProductResponse`, `ProductItem`, `ProductCreatePayload`, `ProductUpdatePayload`; `unitCode?: string | null` trong `ProductUnitResponse` và `UomConversion`.
  - `src/features/product/api/productApi.ts`: đồng bộ interface payload và re-export types chuẩn. (REQ-01, REQ-02)
- [x] T8 — Nâng cấp `ProductFormModal.tsx` và `ProductListPage.tsx`:
  - Khu vực tải ảnh: Cho phép upload nhiều file ảnh đồng thời qua Cloudinary (`multiple`), hiển thị danh sách ảnh thumbnail có viền xanh + badge `Chính` cho ảnh đại diện (index 0), hỗ trợ nút "Đặt chính" reorder ảnh, nút xóa ảnh.
  - Bảng "Hàng cùng loại": Tự động điền mã hàng gợi ý `{productCode}-{unitName}` vào ô Mã hàng khi người dùng nhập đơn vị quy đổi mới, cho phép chỉnh sửa trực tiếp và submit `unitCode`. (REQ-02, REQ-03)
- [x] T9 — Nâng cấp `ProductDetailModal.tsx`:
  - Cố định kích thước modal: `maxWidth: 1160px, width: '96vw', height: '88vh', maxHeight: '88vh'`.
  - Layout 3 tầng chuẩn: Header cố định (`flexShrink: 0`), Footer cố định (`flexShrink: 0`), phần thân tab body cuộn độc lập (`flex: 1, overflowY: 'auto'`), đảm bảo chuyển qua lại giữa các tab giữ nguyên 100% kích thước modal không bị co giật. (REQ-04)
  - Nạp dữ liệu thực tế từ API cho "Mô tả" (`product.description`) và "Ghi chú nội bộ" (`product.internalNote`), hiển thị thông báo rõ nếu chưa có dữ liệu. (REQ-05)
  - Thư viện Gallery nhiều ảnh: Hiển thị ảnh chính kèm nhãn `Chính`, dải thumbnails bên dưới để click chuyển đổi xem ảnh, hỗ trợ modal Lightbox phóng to ảnh khi click. (REQ-05)
  - Hiển thị mã hàng (`UnitCode`) của từng đơn vị quy đổi trong bảng Đơn vị tính. (REQ-02, REQ-05)

---

## 4. Test & Verification
- [x] T10 — Viết Backend Unit tests trong `MT_GRMS.UnitTests`:
  - Tự động sinh `UnitCode` cho `ProductUnit` khi để trống và xử lý va chạm trùng mã.
  - Lưu trữ `List<string> ImageUrls` và tự động trích xuất `Product.ImageUrl` đại diện.
  - Kiểm thử đạt: **99/99 .NET tests PASS**. (REQ-01, REQ-02)
- [x] T11 — Viết Frontend Unit tests trong `ProductDetailModal.test.tsx` và `ProductFormModal.test.tsx`:
  - Upload nhiều ảnh, chọn ảnh đại diện, lightbox zoom trong form.
  - Cố định layout, switch tab mượt mà, hiển thị đúng mô tả, ghi chú thực tế, gallery ảnh và mã đơn vị tính.
  - Kiểm thử đạt: **85/85 Vitest tests PASS**, build frontend Vite thành công 100%. (REQ-03, REQ-04, REQ-05)
