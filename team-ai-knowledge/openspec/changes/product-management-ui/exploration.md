# EXP-2026-10-31-003: Khảo sát Triển khai Chức năng Cập nhật Hàng hóa (Update Product & Product Units)

## 1. Problem Statement
Hiện tại, chức năng sửa hàng hóa trong [`ProductFormModal.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/components/ProductFormModal.tsx) và [`ProductListPage.tsx`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product/pages/ProductListPage.tsx) chỉ mới gọi `PUT /api/v1/products/{id}` để cập nhật các thông tin cơ bản của sản phẩm. Việc quản lý các Đơn vị tính quy đổi (Product Units) trong quá trình chỉnh sửa còn nhiều thiếu sót:
1. **Thiếu API & Logic sửa Đơn vị quy đổi đã có**: Khi người dùng sửa giá bán, tỷ lệ quy đổi hoặc mã vạch của một đơn vị đã tồn tại trong DB, hệ thống chưa có API `updateProductUnit` (`PUT /api/v1/product-units/{id}`), dẫn đến các thay đổi bị bỏ qua.
2. **Thiếu cơ chế xóa Đơn vị quy đổi đã tồn tại**: Khi người dùng bấm xóa một đơn vị quy đổi đã lưu trong DB khỏi bảng "Hàng cùng loại", hệ thống chưa ghi nhận ID để gọi `DELETE /api/v1/product-units/{id}` lên backend.
3. **Mã hàng (`productCode`) chưa được khóa khi Sửa**: Theo nghiệp vụ quản lý kho và DTO Backend `ProductUpdateRequest`, mã hàng SKU là định danh bất biến sau khi tạo. Ô nhập mã hàng trong `ProductFormModal` cần được vô hiệu hóa (`disabled`) khi ở chế độ Edit.
4. **Tải thiếu Đơn vị quy đổi khi mở Form Sửa**: Nếu sản phẩm được click sửa từ danh sách khi chưa nạp `uomConversions`, modal mở lên bị thiếu danh sách đơn vị đã lưu.

---

## 2. Context & Tech Stack
- **Backend Endpoints:**
  - `PUT /api/v1/products/{id}`: Cập nhật thông tin chính sản phẩm qua `ProductUpdateRequest`.
  - `POST /api/v1/products/{productId:guid}/units`: Thêm đơn vị quy đổi mới.
  - `PUT /api/v1/product-units/{id:guid}`: Cập nhật đơn vị quy đổi qua `ProductUnitUpdateRequest` (`unitName`, `conversionRate`, `price`, `barcode`, `isBaseUnit`).
  - `DELETE /api/v1/product-units/{id:guid}`: Xóa đơn vị quy đổi.
  - `GET /api/v1/products/{productId:guid}/units`: Lấy toàn bộ đơn vị tính của sản phẩm.
- **Frontend Components:**
  - `src/features/product/components/ProductFormModal.tsx`: Form tạo mới & chỉnh sửa hàng hóa.
  - `src/features/product/pages/ProductListPage.tsx`: Quản lý lưu sản phẩm `handleSaveProduct`.
  - `src/features/product/api/productApi.ts`: Client gọi các API sản phẩm và đơn vị tính.

---

## 3. Assumptions & Non-Goals

### Assumptions
1. Mã hàng (`productCode`) không được phép chỉnh sửa ở chế độ Edit (`disabled`, nền xám).
2. Khi sửa hàng hóa, danh sách đơn vị quy đổi chia làm 3 nhóm:
   - **Thêm mới**: Có `id` tạm (`uom-*`) -> gọi `POST /api/v1/products/{id}/units`.
   - **Cập nhật**: Có `id` là GUID đã tồn tại trong DB -> gọi `PUT /api/v1/product-units/{id}`.
   - **Xóa**: Đơn vị có `id` là GUID bị người dùng xóa khỏi form -> gọi `DELETE /api/v1/product-units/{id}`.
3. Đơn vị cơ bản không được phép xóa (luôn cố định tỷ lệ quy đổi = 1).
4. Phân quyền giá vốn: `Cashier` / `Staff` không được xem/sửa giá vốn, giá vốn được giữ nguyên theo dữ liệu gốc.

### Non-Goals
1. Không thay đổi endpoint backend hay tạo endpoint batch mới.
2. Không cho phép đổi trạng thái giao dịch kho trong form sửa (lịch sử giao dịch là bất biến).

---

## 4. Các Phương án Thiết kế

### Phương án 1: Client-side Diffing & Điều phối REST API hiện có (Đề xuất)
- Bổ sung hàm `updateProductUnit` vào `src/features/product/api/productApi.ts`.
- `ProductFormModal.tsx`:
  - Khóa ô nhập `productCode` khi `isEditing === true`.
  - Nếu `productToEdit.id` là GUID và `uomConversions` rỗng, tự động gọi `productApi.getProductUnits` để nạp đầy đủ đơn vị.
  - Theo dõi danh sách `deletedUnitIds: string[]` khi người dùng bấm xóa đơn vị có sẵn trong DB.
  - Truyền `deletedUnitIds` trong payload khi gọi `onSave`.
- `ProductListPage.tsx` (`handleSaveProduct`):
  - Bước 1: Gọi `productApi.updateProduct(id, payload)` cập nhật thông tin sản phẩm.
  - Bước 2: Gọi `productApi.deleteProductUnit(unitId)` cho các đơn vị trong `deletedUnitIds`.
  - Bước 3: Duyệt `uomConversions`:
    - Nếu `id` bắt đầu bằng `uom-`: gọi `productApi.createProductUnit`.
    - Nếu `id` là GUID: gọi `productApi.updateProductUnit`.
  - Bước 4: Refresh danh sách và đóng modal.
- **Ưu điểm:** Khớp 100% với kiến trúc backend hiện có, xử lý triệt để bài toán đồng bộ đơn vị tính, không cần sửa code C#.
- **Nhược điểm:** Phát sinh nhiều request tuần tự/song song khi có nhiều đơn vị thay đổi (tuy nhiên thực tế mỗi sản phẩm chỉ có 1–3 đơn vị nên tổng thời gian xử lý < 200ms).

### Phương án 2: Backend Batch Synchronization API
- Tạo một endpoint gộp ở Backend `PUT /api/v1/products/{id}/full` nhận toàn bộ sản phẩm và danh sách đơn vị để xử lý trong 1 transaction EF Core.
- **Ưu điểm:** 1 HTTP request duy nhất.
- **Nhược điểm:** Đòi hỏi sửa backend, viết thêm DTO, service, repository và unit test backend, vi phạm nguyên tắc "Đơn giản trước" và kéo dài thời gian hoàn thành.

---

## 5. Phương án Lựa chọn & Đánh giá Rủi ro
- **Phương án lựa chọn:** **Phương án 1** (Client-side Diffing).
- **Đánh giá rủi ro & Giải pháp:**
  | Rủi ro | Giải pháp |
  |---|---|
  | Lỗi khi xóa đơn vị đang có giao dịch | Backend sẽ trả lỗi nếu đơn vị không được phép xóa -> bắt lỗi `catch` và hiển thị cảnh báo toast rõ ràng. |
  | Nạp thiếu đơn vị khi mở form sửa | `useEffect` kiểm tra nếu `productToEdit.uomConversions` rỗng thì tự động gọi `getProductUnits(productToEdit.id)`. |
  | Trùng mã vạch đơn vị khi cập nhật | Backend kiểm tra unique barcode -> hiển thị thông báo lỗi cụ thể từ response. |
