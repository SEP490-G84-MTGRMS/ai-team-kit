# Tasks: branch-products-catalog

## 1. Database & Migrations
- [x] T1 — Tạo Domain Entity `BranchProduct.cs` kế thừa `BaseTenantEntity` (`BranchId`, `ProductId`, `SellingPriceOverride`, `Status`, `ShelfLocation`). (REQ-BPC-01)
- [x] T2 — Tạo Domain Entity `BranchProductUnitPrice.cs` kế thừa `BaseTenantEntity` (`BranchProductId`, `ProductUnitId`, `SellingPriceOverride`). (REQ-BPC-02)
- [x] T3 — Tạo cấu hình EF Core `BranchProductConfiguration.cs` và `BranchProductUnitPriceConfiguration.cs` với Unique Indexes cô lập Tenant. (REQ-BPC-01, REQ-BPC-02)
- [x] T4 — Viết migration `20261103230000_AddBranchProductsCatalog.cs` tạo bảng `BranchProducts` và backfill dữ liệu từ `BranchStocks`. (REQ-BPC-01)
- [x] T5 — Viết migration `20261103233000_AddBranchProductUnitPrices.cs` tạo bảng `BranchProductUnitPrices`. (REQ-BPC-02)

## 2. Backend Application & Repositories
- [x] T6 — Định nghĩa các DTO: `BranchProductDto`, `BranchProductUnitPriceDto`, `AssignableBranchProductDto`, `AssignBranchProductsCommand`, `UpdateBranchProductCommand`. (REQ-BPC-01, REQ-BPC-02, REQ-BPC-03)
- [x] T7 — Cập nhật `IBranchProductRepository` và `BranchProductRepository` hỗ trợ CRUD trên `BranchProducts` và `BranchProductUnitPrices`. (REQ-BPC-01, REQ-BPC-02)
- [x] T8 — Triển khai `BranchProductService.GetBranchProductsAsync` với join sản phẩm, tổng hợp tồn kho từ `BranchStocks`, giá vốn từ `SupplierProducts`, và danh sách `UnitPrices`. (REQ-BPC-01, REQ-BPC-04)
- [x] T9 — Triển khai `BranchProductService.GetAssignableProductsForBranchAsync` chỉ trả về sản phẩm từ NCC active liên kết với chi nhánh. (REQ-BPC-03)
- [x] T10 — Triển khai `BranchProductService.AssignProductsAsync` gán sản phẩm vào `BranchProducts`, không tạo tồn kho rỗng. (REQ-BPC-01)
- [x] T11 — Triển khai `BranchProductService.UpdateProductAsync` upsert giá override theo từng ĐVT, bỏ qua MOQ và giá vốn từ payload. (REQ-BPC-02, REQ-BPC-04)
- [x] T12 — Triển khai `BranchProductService.ToggleStatusAsync` và `RemoveProductAsync` với kiểm tra chặn gỡ khi tồn kho > 0. (REQ-BPC-05, REQ-BPC-06)

## 3. Frontend Components & UI/UX
- [x] T13 — Cập nhật `storeProductApi.ts` kết nối trực tiếp với backend endpoints của `BranchProducts`. (REQ-BPC-01)
- [x] T14 — Nâng cấp `StoreProductTable.tsx` hiển thị cột Ảnh thumbnail, cột Tổng hợp giá theo ĐVT, Giá vốn NCC và nhãn trạng thái. (REQ-BPC-07)
- [x] T15 — Nâng cấp `AssignStoreProductModal.tsx` hỗ trợ tìm kiếm chi nhánh bằng text, hiển thị địa chỉ chi nhánh, và chọn sản phẩm khả dụng. (REQ-BPC-08)
- [x] T16 — Nâng cấp `EditStoreProductModal.tsx` theo bố cục ngang hiện đại, hiển thị giá vốn/MOQ read-only, cấu hình giá từng ĐVT và toggle trạng thái. (REQ-BPC-08)

## 4. Tests & Verification
- [x] T17 — Xây dựng và kiểm tra bộ unit test backend `BranchProductManagementTests` bao phủ 11 kịch bản nghiệp vụ. (REQ-BPC-01 đến REQ-BPC-06)
- [x] T18 — Xây dựng và kiểm tra bộ unit test backend `SupplierProductManagementTests` xác thực điều khoản giá sỉ và liên kết NCC. (REQ-BPC-03, REQ-BPC-04)
- [x] T19 — Chạy kiểm thử frontend vitest cho `assignProductModalLogic.test.ts` và `supplierProductValidation.test.ts`. (REQ-BPC-07, REQ-BPC-08)

