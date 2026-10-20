# Tasks: supplier-product-management

## DB (Database & Persistence)
- [x] T1 — Tạo EF Core Entity `SupplierProduct` configuration với Unique Index `(TenantId, SupplierId, ProductId)` và Migration (REQ-SP01, REQ-SP06)

## Backend — Domain & Application Layer
- [x] T2 — Định nghĩa Entity `SupplierProduct` trong `MT_GRMS.Domain.Entities.Catalog` và các enum liên quan (REQ-SP01, REQ-SP03)
- [x] T3 — Xây dựng DTOs (`SupplierProductDto`, `AssignSupplierProductDto`, `ProductSupplierMappingDto`) và FluentValidation Validators (REQ-SP01, REQ-SP02)
- [x] T4 — Cài đặt Command Handler `AssignSupplierProduct` (chống trùng lặp BR-SP01, xử lý cờ Primary BR-SP02) (REQ-SP01, REQ-SP04)
- [x] T5 — Cài đặt Command Handler `UpdateSupplierProduct` (cập nhật giá thỏa thuận, MOQ, ĐVT) (REQ-SP02)
- [x] T6 — Cài đặt Command Handler `ToggleSupplierProductStatus` (Soft deactivation / reactivate) (REQ-SP03)
- [x] T7 — Cài đặt Command Handler `SetPrimarySupplier` (chuyển đổi độc quyền Primary Supplier BR-SP02) (REQ-SP04)
- [x] T8 — Cài đặt Query Handlers `GetSupplierProductsList` (phân trang, lọc ngành hàng, tìm kiếm Barcode/SKU/Tên) và `GetSuppliersForProduct` (tra cứu ngược cho PO) (REQ-SP05, REQ-SP06)

## Backend — API Layer
- [x] T9 — Xây dựng Endpoints quản lý sản phẩm theo NCC trong `SuppliersController` (`GET/POST /api/v1/suppliers/{id}/products`, `PUT/PATCH /api/v1/suppliers/{id}/products/{productId}/*`) (REQ-SP01 đến REQ-SP04)
- [x] T10 — Bổ sung Endpoint tra cứu ngược `GET /api/v1/products/{id}/suppliers` trong `ProductsController` (REQ-SP05)

## Frontend — State & UI Components (KiotViet UI Brand Blue)
- [x] T11 — Định nghĩa Types, TanStack Query Hooks & Mock data (`MASTER_PRODUCTS`, `MOCK_SUPPLIER_PRODUCTS`) trong `src/features/supplier/` (REQ-SP01 đến REQ-SP05)
- [x] T12 — Xây dựng component `SupplierContextCard` (bo góc 24px, dropdown chọn NCC, hiển thị Payment Term, Credit Limit, trạng thái) (REQ-SP05)
- [x] T13 — Xây dựng component `SupplierProductFilterBar` (lọc Ngành hàng, Trạng thái, ô tìm kiếm Debounced Barcode/SKU/Tên) (REQ-SP05)
- [x] T14 — Xây dựng component `SupplierProductTable` & `SupplierProductTableRow` (cột Barcode font-mono, Tên, ĐVT, Giá sỉ font-mono tabular-nums, MOQ, Badge Primary, Pill Status, Action buttons) (REQ-SP01 đến REQ-SP05)
- [x] T15 — Xây dựng modal `AssignProductModal` (bo góc 24px, Autocomplete chọn SP với barcode scanner preview, ĐVT, giá nhập, MOQ, cờ Primary) (REQ-SP01, REQ-SP04)
- [x] T16 — Xây dựng modal `EditSupplierProductModal` (sửa nhanh giá nhập sỉ thỏa thuận & MOQ kèm validation) (REQ-SP02)
- [x] T17 — Xây dựng trang hoàn chỉnh `SupplierProductManagementPage` (`src/features/supplier/pages/SupplierProductManagementPage.tsx`) và tích hợp vào Router/Sidebar navigation (REQ-SP01 đến REQ-SP06)

## Test & Verification
- [x] T18 — Viết xUnit Unit Tests trong `MT_GRMS.UnitTests` kiểm thử các kịch bản REQ-SP01 đến REQ-SP06 (Chặn trùng gán, Độc quyền Primary Supplier, Lọc đa tenant, Validate giá/MOQ)
- [x] T19 — Chạy kiểm thử Frontend (`npm run lint`, `npm run build`) và xác minh tương thích các tỷ lệ hiển thị màn hình 100%, 125%, 150% (Đạt 100% build PASS)
