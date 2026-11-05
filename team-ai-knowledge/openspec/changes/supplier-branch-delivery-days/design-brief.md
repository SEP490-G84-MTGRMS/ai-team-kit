# Design Brief: supplier-branch-delivery-days

## 1. Luồng Người Dùng (User Flow)

```
[Màn hình Quản lý gán Nhà cung cấp – Chi nhánh]
(/store-owner/suppliers/branches)
        │
        ├──► [Action 1: Gán chi nhánh mới]
        │       │
        │       ▼
        │   [Modal: AssignBranchModal]
        │   - Chọn Chi nhánh cần gán
        │   - Hệ thống tự động fetch và prefill DeliveryDays từ SupplierDeliveryConfig của NCC
        │   - Hiển thị 7 checkbox ngày giao hàng: [CN] [T2] [T3] [T4] [T5] [T6] [T7]
        │   - User tùy chỉnh tick chọn theo nhu cầu thực tế của cửa hàng
        │   - Bấm [Lưu gán chi nhánh]
        │       │
        │       ▼
        │   Gọi POST /api/v1/suppliers/{id}/branches kèm DeliveryDaysOfWeek
        │
        └──► [Action 2: Chỉnh sửa ngày giao của chi nhánh đã gán]
                │
                ▼
            [Click nút "Chỉnh sửa ngày giao" trên từng dòng bảng]
                │
                ▼
            [Modal: EditAssignmentDeliveryDaysModal]
            - Hiển thị thông tin NCC và Tên chi nhánh
            - Checkbox 7 ngày giao hàng hiện tại của chi nhánh
            - User sửa đổi tick chọn
            - Bấm [Cập nhật ngày giao hàng]
                │
                ▼
            Gọi PUT /api/v1/suppliers/{id}/branches/{branchId}
                │
                ▼
            Bảng cập nhật ngay chuỗi viết tắt (vd: "T2, T4, T6")
```

## 2. Thiết Kế Component Frontend

- **`AssignBranchModal.tsx`**:
  - Tải danh sách chi nhánh chưa gán của Supplier.
  - Tự động prefill ngày giao từ `supplier.deliveryDaysOfWeek`.
  - Checkbox group 7 ngày giao hàng thân thiện, trực quan.
- **`EditAssignmentDeliveryDaysModal.tsx`**:
  - Modal chuyên biệt để điều chỉnh nhanh lịch giao hàng cho 1 cặp (Supplier, Branch).
  - Hỗ trợ nút "Chọn tất cả", "Bỏ chọn tất cả", "Khôi phục theo lịch gốc của NCC".
- **`SupplierBranchTable.tsx` & `SupplierBranchTableRow.tsx`**:
  - Thêm cột `Ngày giao hàng` (Delivery Date):
    - Hiển thị chuỗi viết tắt gọn gàng (vd: `T2, T4, T6`).
    - Nút icon chỉnh sửa nhanh lịch giao hàng ngay trên dòng.

## 3. Thiết Kế Backend API & DTOs

### 3.1. Endpoints
- **`POST /api/v1/suppliers/{id}/branches`**:
  - Request body:
    ```json
    {
      "branchId": "01a18874-9747-7299-b539-82c2174a3fb0",
      "deliveryDaysOfWeek": [1, 3, 5],
      "leadTimeDaysOverride": null,
      "cutoffTimeOverride": null
    }
    ```
- **`PUT /api/v1/suppliers/{id}/branches/{branchId}`**:
  - Request body:
    ```json
    {
      "deliveryDaysOfWeek": [2, 4, 6],
      "isActive": true
    }
    ```
- **`GET /api/v1/suppliers/{id}/branches`**:
  - Trả về danh sách chi nhánh đã gán, mỗi item chứa:
    - `deliveryDaysOfWeek`: `[1, 3, 5]`
    - `deliveryDaysDisplay`: `"T2, T4, T6"`

### 3.2. Database & Domain Entity
- Entity: `SupplierBranchAssignment` (`MT_GRMS.Domain/Entities/Supplier/SupplierBranchAssignment.cs`):
  - `DeliveryDaysOfWeek`: `List<int>` (0=Sunday, 1=Monday, ..., 6=Saturday).
  - Cấu hình EF Core: ánh xạ cột `nvarchar(100)` hoặc JSON conversion.

### 3.3. Tích hợp Ma trận đặt hàng (Order Matrix Integration)
- Trong `PurchaseOrderService.GetMatrixSupplierConfigsAsync`:
  ```csharp
  var activeDays = assignment?.DeliveryDaysOfWeek != null && assignment.DeliveryDaysOfWeek.Any()
      ? assignment.DeliveryDaysOfWeek
      : supplier.DeliveryDaysOfWeek ?? new List<int> { 1, 2, 3, 4, 5, 6 };
  ```
  Nhờ đó, khi Chi nhánh mở màn hình Ma trận đặt hàng (`/store-owner/purchase-orders/create-matrix`), các cột ngày giao hàng sẽ hiển thị `OPEN` hoặc `SUPPLIER_OFF` chính xác theo lịch của chi nhánh đó.

## 4. Phân Quyền & Bảo Mật
- Quyền thực hiện: `STORE_OWNER`, `STORE_MANAGER`.
- Nhân viên chi nhánh thông thường (`EMPLOYEE`, `CASHIER`) chỉ có quyền xem, không được chỉnh sửa lịch gán.
- Multi-tenant: Tenant isolation tự động qua `ITenantContext.CurrentTenantId`.
