# Tasks: supplier-branch-delivery-days

## 1. Database & Domain Entity
- [x] T1: Mở rộng Entity `SupplierBranchAssignment` với `DeliveryDaysOfWeek` (`List<int>`), `LeadTimeDaysOverride`, `CutoffTimeOverride` (REQ-02)
- [x] T2: Cập nhật EF Core configuration trong `SupplierBranchAssignmentConfiguration.cs` hỗ trợ chuyển đổi mảng int sang nvarchar/JSON (REQ-02)

## 2. Backend Application & API
- [x] T3: Cập nhật DTOs `AssignSupplierBranchDto`, `UpdateSupplierBranchAssignmentDto`, `SupplierBranchAssignmentDto` với `DeliveryDaysOfWeek` và `DeliveryDaysDisplay` (REQ-01, REQ-02, REQ-04)
- [x] T4: Triển khai logic trong `SupplierService.AssignSupplierToBranchAsync` và `UpdateSupplierBranchAssignmentAsync` (REQ-02, REQ-03)
- [x] T5: Cập nhật Controller `SuppliersController.cs` cho các route gán và cập nhật chi nhánh (REQ-02, REQ-03)
- [x] T6: Tích hợp `PurchaseOrderService.GetMatrixSupplierConfigsAsync` ưu tiên `DeliveryDaysOfWeek` của assignment trước khi fallback (REQ-05)

## 3. Frontend UI Components
- [x] T7: Cập nhật `AssignBranchModal.tsx`: Thêm 7 checkbox thứ trong tuần, prefill tự động từ cấu hình NCC đã chọn (REQ-01, REQ-02)
- [x] T8: Xây dựng modal `EditAssignmentDeliveryDaysModal.tsx` và `EditAssignmentModal.tsx` cho phép chỉnh sửa ngày giao hàng trực tiếp (REQ-03)
- [x] T9: Cập nhật `SupplierBranchTable.tsx` và `SupplierBranchTableRow.tsx` hiển thị cột "Ngày giao hàng" viết tắt dạng `T2, T4, T6` (REQ-04)
- [x] T10: Đồng bộ types trong `src/features/supplier/types/supplier.types.ts` và API service `supplierBranchApi.ts` (REQ-02, REQ-04)

## 4. Verification & Testing
- [x] T11: Viết và chạy Unit test backend kiểm thử logic fallback và override ngày giao hàng (REQ-05)
- [x] T12: Kiểm tra biên dịch TypeScript `tsc -b` và build Vite trên Frontend (REQ-01 đến REQ-05)
