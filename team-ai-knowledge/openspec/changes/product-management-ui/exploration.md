# EXP-2026-10-29-001: Khảo sát & Định hướng Hoàn thiện Giao diện Quản lý Hàng hóa (Product Management UI) kết nối Backend Thực tế

## 1. Problem Statement (Vấn đề)
Phía Backend của hệ thống MT-GRMS đã hoàn thiện đầy đủ bộ API nghiệp vụ quản lý sản phẩm tại [`ProductsController.cs`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/ProductsController.cs) và danh mục tại [`CategoriesController.cs`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/CategoriesController.cs) với các DTOs chuẩn hóa ([`ProductDtos.cs`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_BACKEND/src/MT_GRMS.Application/Catalog/Dtos/ProductDtos.cs)):
- Phân trang server-side và tìm kiếm đa tiêu chí (`ProductQueryFilter` kết hợp SearchTerm, CategoryId, Status, PageIndex, PageSize).
- Thực thi phân quyền giá vốn theo quy tắc **BR-SEC-01**: Nhân viên (`Cashier`, `Staff`) chỉ thấy giá bán, trường `CostPrice` được trả về `null`.
- Hỗ trợ tự sinh mã hàng hóa `SPxxxxxx` và Barcode khi tạo mới; kiểm tra trùng mã SKU và Barcode trên cùng Tenant.
- Tra cứu ngược danh sách nhà cung cấp cung ứng mặt hàng (`GET /api/products/{id}/suppliers`).
- Xóa mềm an toàn chuyển trạng thái sang `Discontinued` để bảo toàn lịch sử sổ cái và chứng từ (**BR-DATA-01**).

Tuy nhiên, tại Frontend ([`MT_GRMS_FRONTEND/src/features/product`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/features/product)):
- Giao diện hiện tại mới chỉ dựng mock data tĩnh (`mockData.ts`), chưa hề gọi HTTP request tới Backend.
- Định nghĩa kiểu dữ liệu trong `types/index.ts` còn sai lệch tên trường so với Backend C# (ví dụ: `productName` vs `name`, `code` vs `categoryCode`).
- Chưa có layer API Service (`productApi.ts`) sử dụng `httpClient` chuẩn của dự án.
- Chưa có TanStack React Query custom hooks để quản lý cache, invalidate, phân trang và trạng thái async.
- Category Sidebar chưa kết nối với API danh mục phẳng (`/api/categories`).

Mục tiêu của change này là hoàn thiện giao diện Frontend để kết nối 100% với Backend `ProductsController`, đảm bảo trải nghiệm mượt mà, đúng chuẩn kiến trúc Clean UI và tuân thủ các quy tắc nghiệp vụ trong SRS Report-3.

---

## 2. Context & Background (Bối cảnh & Hiện trạng)
- **Tài liệu tham chiếu:**
  - SRS Report-3: Phân hệ `FE-01 Product Catalog Management` ([BR-SEC-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Report/Report-3_Software%20Requirement%20Specification.docx.md#L4759), [BR-PROD-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Report/Report-3_Software%20Requirement%20Specification.docx.md#L4760), [BR-PROD-02](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Report/Report-3_Software%20Requirement%20Specification.docx.md#L4761), [BR-DATA-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Report/Report-3_Software%20Requirement%20Specification.docx.md#L4763), [BR-CAT-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Report/Report-3_Software%20Requirement%20Specification.docx.md#L4764)).
  - Backend API: `ProductsController.cs` (Base route: `/api/products`), `CategoriesController.cs` (`/api/categories`), `ApiResponse<T>`, `PagedResult<T>`.
- **Tech Stack Frontend:**
  - React 19, TypeScript, Vite.
  - State & Cache: `@tanstack/react-query` v5, `zustand` (auth store: `useAuthStore`).
  - HTTP: `axios` qua [`src/api/httpClient.ts`](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/MT_GRMS_FRONTEND/src/api/httpClient.ts).
  - Icons & UI: `lucide-react`, Tailwind CSS / CSS Modules.

---

## 3. Assumptions & Non-Goals
### Assumptions
- **[ASM-01]:** Backend API chạy tại URL được cấu hình trong `VITE_API_BASE_URL` (hoặc proxy qua `/api/v1`).
- **[ASM-02]:** Header `Authorization: Bearer <token>` tự động được inject bởi `httpClient.ts` từ `localStorage.getItem('access_token')`.
- **[ASM-03]:** Vai trò người dùng (Role) được lưu trong Auth Store hoặc giải mã từ JWT token (`StoreOwner`, `Cashier`, `Staff`).

### Non-Goals
- Không thay đổi logic và schema của Backend C# (Backend đã hoàn thành và pass toàn bộ test).
- Không triển khai module POS bán hàng thu ngân (thuộc scope riêng của phân hệ POS Checkout).
- Không tự upload file ảnh binary lên S3 nếu chưa có endpoint media; form chấp nhận chuỗi ImageUrl trực tiếp.

---

## 4. So sánh Phương án Kỹ thuật (Architectural Options)

### Phương án A: Giữ mockData và chỉ thêm adapter chuyển đổi tạm thời
- **Mô tả:** Tiếp tục dùng mockData, khi nào Backend thật chạy thì bọc adapter service.
- **Ưu điểm:** Nhanh, không làm thay đổi các component UI hiện có.
- **Nhược điểm:** Không giải quyết được yêu cầu kết nối thật; trải nghiệm người dùng không tương tác được với dữ liệu database thật; dễ sinh lỗi lệch DTO sau này.

### Phương án B (Được chọn): Refactor & Tích hợp trực tiếp React Query với Backend API chuẩn
- **Mô tả:** 
  1. Đồng bộ `types/index.ts` khớp 100% với DTOs của Backend C# (`ProductResponse`, `ProductCreateRequest`, `ProductUpdateRequest`, `ProductQueryFilter`, `CategoryDto`).
  2. Tạo module `src/features/product/api/productApi.ts` gọi đúng các route của `ProductsController`:
     - `GET /api/products`: phân trang và tìm kiếm.
     - `GET /api/products/{id}`: chi tiết sản phẩm.
     - `POST /api/products`: tạo mới.
     - `PUT /api/products/{id}`: cập nhật.
     - `DELETE /api/products/{id}`: xóa mềm.
     - `GET /api/products/{id}/suppliers`: tra cứu nhà cung cấp liên kết.
  3. Tạo React Query hooks chuyên biệt (`useProducts`, `useProductDetail`, `useProductMutations`, `useCategories`).
  4. Cập nhật `ProductListPage.tsx`: chuyển từ mock array sang server-side paging & debounced search; render cột "Giá vốn" có điều kiện theo role ([BR-SEC-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/File/doc/Report/Report-3_Software%20Requirement%20Specification.docx.md#L4759)).
  5. Cập nhật `ProductFormModal.tsx` & `ProductDetailModal.tsx` để thực hiện mutation thật, hiển thị toast thành công, invalidate cache để cập nhật bảng tức thì.
  6. Kết nối Category Sidebar với `/api/categories` dạng danh mục phẳng (Flat List).
- **Lý do chọn:** Đảm bảo hệ thống hoạt động trơn tru từ Frontend đến Database; tuân thủ đúng kiến trúc chuẩn của codebase đã áp dụng ở module `supplier`.

---

## 5. Rủi ro & Giải pháp Giảm thiểu (Risks & Mitigations)
| Rủi ro | Mức độ | Giải pháp giảm thiểu |
|---|---|---|
| **Lộ giá vốn (COGS) trên giao diện thu ngân** | Cao | Bảo vệ 2 lớp: Backend đã trả `CostPrice = null` cho Cashier; Frontend kiểm tra role `canViewCostPrice` để ẩn hoàn toàn cột Giá vốn và ô nhập trong Modal. |
| **Trùng Barcode / SKU khi tạo hoặc sửa** | Trung bình | Bắt lỗi từ Backend response (`400 Bad Request` với message báo trùng) và hiển thị thông báo lỗi in-line hoặc Toast đỏ trực quan cho người dùng. |
| **Độ trễ tìm kiếm khi gõ phím** | Thấp | Áp dụng kỹ thuật `useDebounce` (300ms) trên ô tìm kiếm trước khi trigger query params lên Backend. |
| **Mất đồng bộ phân trang khi lọc danh mục** | Thấp | Reset `pageIndex = 1` mỗi khi người dùng thay đổi danh mục, từ khóa tìm kiếm hoặc trạng thái lọc. |
