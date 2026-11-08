# Tasks: product-management-ui

> **Quy định kỹ thuật:** KHÔNG dùng custom hook. Theo đúng style hiện tại của codebase: sử dụng trực tiếp `useState`, `useEffect`, `useCallback` trong Page component để gọi `productApi`. Tích hợp component chung `TablePagination` của dự án (`src/components/common/TablePagination`).

---

## 1. Tiểu cụm đã hoàn thành (1.1 -> 1.7)
- [x] T1 — Chuẩn hóa `src/features/product/types/index.ts` chỉ chứa các interface cốt lõi cho danh sách: `ProductResponse`, `PagedResult<T>`, `ProductQueryFilter` khớp 100% với DTOs C#. (REQ-01)
- [x] T2 — Xây dựng `src/features/product/api/productApi.ts` với hàm `getProductsPaged(filter: ProductQueryFilter)` gọi `httpClient.get('/products', { params })` qua `httpClient` chuẩn của dự án, unwrap `ApiResponse<PagedResult<ProductResponse>>`. (REQ-01)
- [x] T3 — Cập nhật `ProductListPage.tsx` bằng `useState`, `useEffect`, `useCallback` gọi trực tiếp `productApi.getProductsPaged`: hiển thị dữ liệu thật từ Backend lên bảng và tích hợp component phân trang dùng chung `TablePagination` của dự án. (REQ-01)
- [x] T4 — Viết test kiểm thử `productApi.getProductsPaged` và logic phân trang để đảm bảo dữ liệu map đúng từ API Backend. (REQ-01)
- [x] T5 — Cập nhật phân quyền cột "Giá vốn" trên bảng danh sách sản phẩm trong `ProductListPage.tsx`:
  - Lấy vai trò người dùng từ `useAuthStore` (hỗ trợ chuyển đổi nhanh vai trò trên thanh toolbar để kiểm thử).
  - Nếu role là `StoreOwner` hoặc `Admin` / `Manager`: Hiển thị cột `Giá vốn` và giá trị tương ứng.
  - Nếu role là `Cashier` hoặc `Staff`: Ẩn hoàn toàn cột `Giá vốn` (cả header `<th>` lẫn ô `<td>`), không hiển thị giá vốn và biên độ lãi. (REQ-04, BR-SEC-01)
- [x] T6 — Bổ sung Unit test cho BR-SEC-01 trong `ProductListPage.test.tsx`:
  - Test case: Khi vai trò là `Cashier`, xác minh chữ "Giá vốn" không xuất hiện trong bảng table header và DOM.
  - Test case: Khi vai trò là `StoreOwner`, xác minh cột "Giá vốn" hiển thị đầy đủ. (REQ-04)
- [x] T7 — Tích hợp cơ chế Debounce 300ms cho ô tìm kiếm sản phẩm trong `ProductListPage.tsx` bằng `useEffect`:
  - Khi người dùng nhập từ khóa tìm kiếm (Tên, SKU, Barcode), trì hoãn 300ms trước khi kích hoạt `fetchProducts`.
  - Tự động reset `pageIndex = 1` khi từ khóa tìm kiếm thay đổi.
  - Khi backend trả về kết quả rỗng (`totalCount === 0`), hiển thị Empty State "Không tìm thấy hàng hóa phù hợp". (REQ-02)
- [x] T8 — Bổ sung Unit test cho tìm kiếm Debounced trong `ProductListPage.test.tsx`:
  - Test case: Gõ liên tục vào ô tìm kiếm thì chỉ kích hoạt gọi API 1 lần sau 300ms dừng gõ.
  - Test case: Kiểm tra reset `pageIndex = 1` khi thay đổi từ khóa.
  - Test case: Hiển thị giao diện Empty State khi không có sản phẩm nào khớp từ khóa. (REQ-02)
- [x] T9 — Kết nối bộ chọn danh mục trong `CategorySidebar` với Server-side Filter trong `ProductListPage.tsx`:
  - Khi người dùng click chọn một nhóm hàng cụ thể, tự động reset `pageIndex = 1` và gọi `productApi.getProductsPaged({ categoryId, pageIndex: 1 })`.
  - Khi người dùng click nút "Bỏ chọn" hoặc chọn "Tất cả", gọi API lấy toàn bộ hàng hóa không kèm `categoryId`.
  - Đồng bộ số lượng sản phẩm `(productCount)` và trạng thái checkbox của danh mục. (REQ-03)
- [x] T10 — Bổ sung Unit test cho lọc danh mục Server-side trong `ProductListPage.test.tsx`:
  - Test case: Click chọn 1 nhóm hàng -> gọi API với đúng `categoryId` và `pageIndex = 1`.
  - Test case: Bỏ chọn nhóm hàng -> gọi API tải lại toàn bộ danh mục không truyền `categoryId`. (REQ-03)
- [x] T11 — Bổ sung điều kiện cho nút `+ Thêm đơn vị` trong `ProductFormModal.tsx`:
  - Kiểm tra `baseUnit.trim() !== ''`.
  - Nếu rỗng: vô hiệu hóa nút (disabled style: opacity 0.6, cursor: not-allowed) và hiển thị tooltip/thông báo "(Cần nhập tên đơn vị cơ bản trước)". (REQ-05)
- [x] T12 — Xây dựng bảng `Hàng cùng loại` trong `ProductFormModal.tsx` khi có đơn vị quy đổi (`uomConversions.length > 0`):
  - Hiển thị theo mockup chuẩn: Đơn vị, Quy đổi, Mã hàng, Mã vạch, Giá vốn, Giá bán, Tồn kho, Nút xóa.
  - Hàng đơn vị cơ bản: Quy đổi cố định 1 (disabled bg xám), Mã hàng `Tự động`, Giá vốn/Giá bán/Tồn kho đồng bộ trực tiếp.
  - Hàng đơn vị quy đổi: Quy đổi nhập, Mã vạch nhập, Giá vốn & Tồn kho tự tính hiển thị nền xám, Giá bán nhập riêng, nút Xóa hàng.
  - Đồng bộ 2 chiều tức thời với phần Đơn vị tính. (REQ-06)
- [x] T13 — Cập nhật `ProductListPage.tsx` hiển thị dropdown chọn Đơn vị tính ở cột Tên hàng hóa:
  - Nếu sản phẩm có `uomConversions`: hiển thị dropdown `[Tên SP] - [đơn vị] ⌵`.
  - Mở popover menu cho phép chọn chuyển đổi đơn vị và cập nhật hiển thị Giá bán tương ứng theo đơn vị được chọn. (REQ-07)
- [x] T14 — Viết Unit test kiểm thử cho logic REQ-05, REQ-06 và REQ-07 trong `ProductListPage.test.tsx` và `ProductFormModal.test.tsx`.
- [x] T15 — Triển khai state `selectedUnitName` và derived selector trong `ProductDetailModal.tsx`:
  - Tính toán tức thời `displayCode`, `displayBarcode`, `displaySellingPrice`, `displayCostPrice` (tuân thủ BR-SEC-01), `displayStock`, số lượng lẻ dư theo đơn vị cơ bản. (REQ-08)
- [x] T16 — Xây dựng thanh Unit Switcher (Segmented Pills) trên Header và tương tác click chọn dòng trong Bảng "Đơn vị tính & Quy đổi giá" của `ProductDetailModal.tsx`:
  - Hiển thị dải nút chọn đơn vị `[ chai (Cơ bản) ]  [ thung ]...` trên thanh Header.
  - Gắn nhãn `Đang xem` và highlight nền xanh `#F0FDFA` cho dòng đơn vị đang được kích hoạt. (REQ-08)
- [x] T17 — Bổ sung cơ chế tự động nạp đơn vị tính qua `productApi.getProductUnits(product.id)` trong `ProductDetailModal.tsx` nếu sản phẩm mở lên chưa có sẵn `uomConversions` (REQ-08).
- [x] T18 — Viết Unit test kiểm thử cho REQ-08 trong `ProductDetailModal.test.tsx`:
  - Test case 1: Chuyển đổi đơn vị tính trên Pill hoặc Bảng ĐVT cập nhật đúng giá bán, mã hàng, mã vạch, tồn kho.
  - Test case 2: Vai trò `StoreOwner` xem được giá vốn quy đổi; vai trò `Cashier` bị ẩn hoàn toàn giá vốn (BR-SEC-01).

---

## 2. Tiểu cụm 1.8: Cập nhật Hàng hóa & Đồng bộ Đơn vị tính (REQ-09)
- [x] T19 — Bổ sung hàm `updateProductUnit` và types `ProductUnitUpdatePayload` vào `src/features/product/api/productApi.ts` gọi `PUT /api/v1/product-units/{id}`. (REQ-09)
- [x] T20 — Cập nhật `ProductFormModal.tsx` ở chế độ chỉnh sửa:
  - Khóa ô nhập Mã hàng (`productCode`) với `disabled`, nền xám `#F1F5F9`.
  - Tự động nạp đơn vị quy đổi qua `productApi.getProductUnits` nếu `productToEdit.uomConversions` rỗng.
  - Quản lý danh sách `deletedUnitIds: string[]` khi xóa đơn vị cũ trong bảng "Hàng cùng loại".
  - Truyền `deletedUnitIds` vào tham số thứ 3 của callback `onSave(payload, saveAndAddNew, deletedUnitIds)`. (REQ-09)
- [x] T21 — Cập nhật `handleSaveProduct` trong `ProductListPage.tsx` điều phối lưu chỉnh sửa:
  - Gọi `productApi.updateProduct(id, payload)` cập nhật thông tin sản phẩm.
  - Gọi `productApi.deleteProductUnit(id)` cho các đơn vị trong `deletedUnitIds`.
  - Duyệt `uomConversions`: tạo mới (`POST /units`) nếu là ID tạm, hoặc cập nhật (`PUT /product-units/{id}`) nếu là GUID.
  - Refresh danh mục & bảng sản phẩm, đóng modal và hiển thị Toast thành công. (REQ-09)
- [x] T22 — Viết Unit test kiểm thử cho REQ-09 trong `ProductFormModal.test.tsx` và `ProductListPage.test.tsx`:
  - Ô Mã hàng bị disabled khi chỉnh sửa.
  - Ghi nhận `deletedUnitIds` khi xóa đơn vị quy đổi đã có trong DB.
  - Đồng bộ gọi đúng các API khi lưu sản phẩm chỉnh sửa. (REQ-09)

---

## 3. Tiểu cụm 1.9: Cải tiến UI/UX Form Thêm/Sửa Hàng Hóa (REQ-10)
- [x] T23 — Tăng kích thước modal `ProductFormModal.tsx` lên `maxWidth: 1160px, width: '96vw'` và bổ sung Lightbox Modal phóng to ảnh sản phẩm khi nhấn vào thumbnail hoặc nút xem chi tiết ảnh. (REQ-10)
- [x] T24 — Chuẩn hóa tiếng Việt bỏ dấu trong bộ lọc tìm kiếm nhóm hàng (`removeVietnameseTones`) và xử lý triệt để số 0 ở đầu các input số (giá vốn, giá bán, tồn kho, quy đổi, VAT) bằng placeholder `"0"` và `onFocus select()`. (REQ-10)
- [x] T25 — Xóa giá trị mặc định `"chai"` của đơn vị cơ bản (thay bằng placeholder gợi ý), tự động tính giá bán đơn vị quy đổi `price = conversionRate * sellingPrice`, và cải tiến ô nhập thuế VAT với hàng nút chọn nhanh 0%, 5%, 8%, 10%. (REQ-10)
- [x] T26 — Thay thế banner cảnh báo lỗi ở đầu form bằng Validation Alert Popup Modal nổi bật giữa màn hình; viết Unit test kiểm thử đầy đủ các cải tiến REQ-10 trong `ProductFormModal.test.tsx`. (REQ-10)

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: product-images-and-unit-codes -->
# Tasks: product-images-and-unit-codes

> **Quy định kỹ thuật:**
> - Backend: .NET 8 LTS Clean Architecture, EF Core 8 Code-First (Npgsql / PostgreSQL text[] array), xUnit tests.
> - Frontend: React 19 + TypeScript, Vite. KHÔNG dùng custom hook thừa, tuân thủ chặt chẽ style hiện có của codebase.

---

## 1. Database (Entity & Migration)
- [x] T1 — Bổ sung `public List<string> ImageUrls { get; set; } = new();` và `[NotMapped] public string? ImageUrl => ImageUrls.FirstOrDefault();` vào `Product.cs`. Đảm bảo Entity `ProductUnit.cs` không có thuộc tính mã hàng. (REQ-01, REQ-02)
- [x] T2 — Cập nhật `AppDbContext.cs` và EntityTypeConfigurations: ánh xạ `builder.Property(x => x.ImageUrls).HasColumnType("text[]");` trong `ProductConfiguration.cs`, xóa cấu hình `UnitCode` trong `ProductUnitConfiguration.cs`. Đã áp dụng migration `20261031193700_RemoveUnitCodeFromProductUnit` lên PostgreSQL. (REQ-01, REQ-02)

---

## 2. Backend (Application & API)
- [x] T3 — Cập nhật DTOs trong `MT_GRMS.Application`:
  - `ProductDtos.cs`: Đưa `List<string>? ImageUrls` vào `ProductResponse`, `ProductCreateRequest`, `ProductUpdateRequest`. (REQ-01)
  - `ProductUnitDtos.cs`: Đảm bảo `ProductUnitResponse`, `ProductUnitCreateRequest`, `ProductUnitUpdateRequest` không có trường mã hàng. (REQ-02)
- [x] T4 — Cập nhật `CatalogService.cs` xử lý lưu trữ `ImageUrls` dạng native array PostgreSQL, tự động gán và map `ImageUrl` đại diện tương thích ngược. (REQ-01)
- [x] T5 — Cập nhật `ProductUnitService.cs`: Bỏ logic sinh `UnitCode`, chỉ lưu các thông tin ĐVT chuẩn (`UnitName`, `ConversionRate`, `Price`, `Barcode`). (REQ-02)
- [x] T6 — Cập nhật Controllers và DTO mappings để tiếp nhận và trả về đúng dữ liệu `ImageUrls` và đơn vị tính. (REQ-01, REQ-02)

---

## 3. Frontend (Types, Form, Detail Modal)
- [x] T7 — Cập nhật types và API client:
  - `src/features/product/types/index.ts`: thêm `imageUrls?: string[]` trong `ProductResponse`, `ProductItem`, `ProductCreatePayload`, `ProductUpdatePayload`. Đảm bảo `ProductUnitResponse`, `ProductUnitCreatePayload`, `ProductUnitUpdatePayload` không có `unitCode`.
  - `src/features/product/api/productApi.ts`: đồng bộ interface payload và re-export types chuẩn. (REQ-01, REQ-02)
- [x] T8 — Nâng cấp `ProductFormModal.tsx` và `ProductListPage.tsx`:
  - Khu vực tải ảnh: Cho phép upload nhiều file ảnh đồng thời qua Cloudinary (`multiple`), hiển thị danh sách ảnh thumbnail có viền xanh + badge `Chính` cho ảnh đại diện (index 0), hỗ trợ nút "Đặt chính" reorder ảnh, nút xóa ảnh.
  - Bảng "Hàng cùng loại": Cột Mã hàng hiển thị mặc định theo mã sản phẩm cha `productCode` ở trạng thái disabled. (REQ-02, REQ-03)
- [x] T9 — Nâng cấp `ProductDetailModal.tsx`:
  - Cố định kích thước modal: `maxWidth: 1160px, width: '96vw', height: '88vh', maxHeight: '88vh'`.
  - Layout 3 tầng chuẩn: Header cố định (`flexShrink: 0`), Footer cố định (`flexShrink: 0`), phần thân tab body cuộn độc lập (`flex: 1, overflowY: 'auto'`), đảm bảo chuyển qua lại giữa các tab giữ nguyên 100% kích thước modal không bị co giật. (REQ-04)
  - Nạp dữ liệu thực tế từ API cho "Mô tả" (`product.description`) và "Ghi chú nội bộ" (`product.internalNote`), hiển thị thông báo rõ nếu chưa có dữ liệu. (REQ-05)
  - Thư viện Gallery nhiều ảnh: Hiển thị ảnh chính kèm nhãn `Chính`, dải thumbnails bên dưới để click chuyển đổi xem ảnh, hỗ trợ modal Lightbox phóng to ảnh khi click. (REQ-05)
  - Hiển thị mã hàng của từng đơn vị quy đổi mặc định theo mã sản phẩm cha `product.productCode`. (REQ-02, REQ-05)

---

## 4. Test & Verification
- [x] T10 — Viết Backend Unit tests trong `MT_GRMS.UnitTests`:
  - Kiểm thử tạo đơn vị quy đổi thành công không cần mã hàng.
  - Lưu trữ `List<string> ImageUrls` và tự động trích xuất `Product.ImageUrl` đại diện.
  - Kiểm thử đạt: **98/98 .NET tests PASS**. (REQ-01, REQ-02)
- [x] T11 — Viết Frontend Unit tests trong `ProductDetailModal.test.tsx` và `ProductFormModal.test.tsx`:
  - Upload nhiều ảnh, chọn ảnh đại diện, lightbox zoom trong form.
  - Cố định layout, switch tab mượt mà, hiển thị đúng mô tả, ghi chú thực tế, gallery ảnh và mã đơn vị tính mặc định theo sản phẩm cha.
  - Kiểm thử đạt: **85/85 Vitest tests PASS**, build frontend Vite thành công 100%. (REQ-03, REQ-04, REQ-05)


<!-- Tasks sáp nhập từ: backend-cloudinary-upload -->
# Tasks: backend-cloudinary-upload

## Backend
- [x] T1 — Thêm package `CloudinaryDotNet` vào `MT_GRMS.Infrastructure` và thêm template cấu hình `Cloudinary` vào `appsettings.json` (REQ-MEDIA-01)
- [x] T2 — Tạo DTO `ImageUploadResponseDto` và interface `ICloudinaryService` trong `MT_GRMS.Application` (REQ-MEDIA-01)
- [x] T3 — Cài đặt service `CloudinaryService` trong `MT_GRMS.Infrastructure` và đăng ký Dependency Injection (REQ-MEDIA-01)
- [x] T4 — Tạo `MediaController` với endpoint `POST /api/v1/media/upload`, kiểm duyệt kích thước $\le 5\text{MB}$ và định dạng `.jpg, .jpeg, .png, .webp` (REQ-MEDIA-01, REQ-MEDIA-02)

## Frontend
- [x] T5 — Thêm API helper `uploadImage` trong frontend để gửi `multipart/form-data` lên endpoint backend (REQ-MEDIA-03)
- [x] T6 — Tích hợp tải ảnh, trạng thái loading ("Đang tải ảnh lên..."), hiển thị preview và lưu URL vào `ProductFormModal.tsx` (REQ-MEDIA-03)

## Test
- [x] T7 — Viết unit tests cho validation upload ảnh và xử lý service tại backend (REQ-MEDIA-01, REQ-MEDIA-02)
- [x] T8 — Viết unit tests cho API client upload ảnh ở frontend và kiểm chứng toàn bộ test suite (REQ-MEDIA-03)
