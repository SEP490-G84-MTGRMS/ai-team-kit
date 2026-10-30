# Tasks: supplier-store-assignment

## 1. Backend API & DTOs
- [x] 1.1. Thêm DTOs cho Supplier Store/Branch Assignment (QueryFilter, SummaryDto, CreateAssignmentCommand)
- [x] 1.2. Thêm endpoint `GET /api/v1/suppliers/branch-assignments` lấy danh sách gán có phân trang và bộ lọc trong `SuppliersController.cs`
- [x] 1.3. Thêm phương thức gán mới và hủy gán đơn lẻ trong `ISupplierService` & `SupplierService`
- [x] 1.4. Bổ sung unit test cho chức năng query và assign chi nhánh

## 2. Frontend Components & Types
- [x] 2.1. Định nghĩa Types cho `SupplierBranchAssignmentItem` và `SupplierBranchFilterState` trong `supplier.types.ts`
- [x] 2.2. Xây dựng API client functions trong `supplierBranchApi.ts`
- [x] 2.3. Tạo component thanh bộ lọc `SupplierBranchFilterBar.tsx` theo chuẩn 2 dòng của `SupplierProductFilterBar.tsx`
- [x] 2.4. Tạo component bảng dữ liệu `SupplierBranchTable.tsx` & `SupplierBranchTableRow.tsx`
- [x] 2.5. Tạo modal gán mới `AssignBranchModal.tsx` hỗ trợ chọn nhiều chi nhánh
- [x] 2.6. Tạo trang chính `SupplierBranchManagementPage.tsx`
- [x] 2.7. Cấu hình routing `/store-owner/suppliers/branches` và gắn nút điều hướng từ Header trang danh sách NCC

## 3. Kiểm thử & Hoàn thiện
- [x] 3.1. Chạy `dotnet test` kiểm chứng Backend
- [x] 3.2. Chạy `npx tsc --noEmit` & `npx oxlint` kiểm chứng Frontend
- [x] 3.3. Kiểm tra hiển thị và luồng tương tác trên trình duyệt

