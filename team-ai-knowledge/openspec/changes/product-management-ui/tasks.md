# Tasks: product-management-ui (FE-01 Product Catalog Management)

## 1. Domain Types & Mock Data Contract
- [x] T1 — Khởi tạo Data Types, DTOs & Mock Service (`src/features/product/types/index.ts`, `src/features/product/services/mockData.ts`) (REQ-01, REQ-02, REQ-03, REQ-06)

## 2. Category Tree Management
- [x] T2 — Xây dựng Category Sidebar & Modals Quản lý nhóm hàng (`CategorySidebar.tsx`, `CategoryModal.tsx`) theo prototype `create_category.html` & `edit_category.html` (REQ-06)

## 3. Product List Screen
- [x] T3 — Xây dựng Màn hình Danh sách Hàng hóa (`ProductListPage.tsx`) theo prototype `product_management.html` với bộ lọc đa tiêu chí, bảo mật che giá vốn theo vai trò (BR-SEC-01), phân trang và tổng hợp tồn kho (REQ-01)

## 4. Standard Product Creation & Editing
- [x] T4 — Xây dựng Màn hình / Modal Thêm & Sửa Hàng hóa chuẩn (`ProductFormModal.tsx`, `CreateProductPage.tsx`) theo prototype `create_product.html`: tự sinh SKU, cấu hình bảng quy đổi ĐVT đa cấp, định mức an toàn, khóa bất biến Base UOM sau giao dịch (BR-PROD-01) (REQ-02, REQ-04)

## 5. Combo Product Management
- [x] T5 — Xây dựng Màn hình / Modal Thêm Hàng Combo - Đóng gói (`ComboFormModal.tsx`, `CreateComboPage.tsx`) theo prototype `create_combosproduct.html`: chọn hàng thành phần, tự tính giá vốn và tồn kho khả dụng động (REQ-03)

## 6. Product 360 Detail View & Actions
- [x] T6 — Xây dựng Panel / Modal Xem chi tiết sản phẩm 360 độ (`ProductDetailModal.tsx`) theo prototype `detail/product_detail.html`: Tab Thông tin & Bảng quy đổi ĐVT, Tab Thẻ kho (Stock Ledger), Tab Tồn kho chi nhánh & Lô hạn dùng FEFO, cơ chế Soft/Hard Delete an toàn (BR-DATA-01) (REQ-01, REQ-04, REQ-05)

## 7. Routing & Layout Integration
- [x] T7 — Tích hợp module vào `StoreOwnerLayout`, gắn link trong `AppTopNav.tsx` (Menu "Hàng hóa" > "Danh mục hàng hóa") và cấu hình route trong `router.tsx` (REQ-01)

## 8. Build & Verification
- [x] T8 — Chạy `npm run build` kiểm tra TypeScript và bundle, xác minh hoàn thiện 100% các màn hình và không có lỗi runtime (REQ-01 -> REQ-06)
