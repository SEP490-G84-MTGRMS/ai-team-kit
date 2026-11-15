# Tasks: Kho Danh mục Hàng hóa Mẫu Toàn Cầu (global-master-catalog-fmcg)

## 1. Cơ sở Dữ liệu & Tầng Domain (DB / Domain)
- [ ] T1: Tạo Domain Entities `MasterProduct.cs` và `MasterProductUnit.cs` trong `MT_GRMS.Domain/Entities/Catalog/` kế thừa `BaseEntity` (REQ-MC-01).
- [ ] T2: Cấu hình EF Core Entity Configurations `MasterProductConfiguration.cs` và `MasterProductUnitConfiguration.cs` với Unique Index trên cột `Barcode` và đăng ký vào `ApplicationDbContext` (REQ-MC-01).

## 2. Tầng Nghiệp vụ & Dịch vụ Backend (Application / Infrastructure)
- [ ] T3: Xây dựng Repository interface & implementation, DTOs và `MasterCatalogService` xử lý CRUD, phân trang, lọc và tính toán 4 chỉ số KPI (REQ-MC-01).
- [ ] T4: Xây dựng `MasterCatalogExcelService` sử dụng ClosedXML để phân tích cú pháp file Excel nhập hàng loạt (Batch Upsert) và xuất tệp template chuẩn hóa `Master_Catalog_Template.xlsx` (REQ-MC-02, REQ-MC-03).
- [ ] T5: Xây dựng `AdminMasterCatalogController` với quyền `RoleConstants.AdminOnly` và bổ sung endpoint công khai `GET /api/products/lookup-master` trong `ProductsController` cho Tenant tra cứu (REQ-MC-01, REQ-MC-04).

## 3. Giao diện Phân hệ Master Admin (Frontend Admin Portal)
- [ ] T6: Bổ sung mục menu "Kho Hàng Mẫu Toàn Cầu" trên `AdminSidebar.tsx` với icon đơn sắc Lucide `Package` và cấu hình route `/admin/master-catalog` trong `router.tsx` (REQ-MC-01).
- [ ] T7: Xây dựng API client `masterCatalogApi.ts` và định nghĩa TypeScript interfaces cho Master Catalog (REQ-MC-01, REQ-MC-02).
- [ ] T8: Xây dựng trang `/admin/master-catalog` với các components chuẩn KiotViet UI: `MasterCatalogKpiBanner.tsx`, `MasterCatalogFilterBar.tsx`, `MasterCatalogTable.tsx`, `MasterProductModal.tsx` (REQ-MC-01).
- [ ] T9: Xây dựng component `MasterExcelImportModal.tsx` hỗ trợ kéo thả file `.xlsx`, switch ghi đè, thanh tiến trình và bảng báo cáo lỗi chi tiết từng dòng (REQ-MC-02, REQ-MC-03).

## 4. Tích hợp Điểm chạm Cửa hàng (Tenant Integration)
- [ ] T10: Tích hợp logic Auto-lookup barcode (với debounce 500ms) vào form tạo/sửa sản phẩm `ProductFormModal.tsx` của Tenant, tự động điền Tên, Ảnh, ĐVT cơ bản và Đơn vị quy đổi (REQ-MC-04).

## 5. Quy chuẩn Đóng gói, Worklog & Kiểm thử (Verification & Worklog)
- [ ] T11: Tạo file Worklog `MT_GRMS_BACKEND/docs/worklogs/2026-11-15_FMCG-MASTER-CATALOG_Ortus24_add-global-master-catalog.md` và cập nhật `CHANGELOG.md` vượt qua Git pre-commit hook.
- [ ] T12: Chạy kiểm tra `dotnet build` phía Backend và `npm run build` phía Frontend đảm bảo 0 lỗi TypeScript, 0 lỗi compile.
