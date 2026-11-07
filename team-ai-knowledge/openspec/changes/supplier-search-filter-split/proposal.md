# Proposal: Gộp SupplierDeliveryConfigs vào Suppliers (1-1)

## Vấn đề
Hiện tại cấu hình giao hàng nhà cung cấp (`SupplierDeliveryConfigs`) đang tách thành 1 bảng/entity riêng với quan hệ 1–1 với `Suppliers`.
- Gây overhead truy vấn qua EF Core (phải luôn `.Include(s => s.DeliveryConfig)`).
- Gây phức tạp trong truy vấn join của `PurchaseOrderRepository`, `OrderMatrix`, `SupplierService`.
- Hai trường `CutoffTime` và `OrderCutoffTime` bị dư thừa dữ liệu trùng lặp; `CutoffDayOffset` là dead-code không dùng trong thuật toán tính toán lịch giao hàng; các trường `LeadTimeHours`/`LeadTimeDays` trước đây đã bị loại bỏ.
- Bảng `SupplierBlackoutDates` đang tồn tại 2 khóa ngoại dư thừa (`SupplierId` và `SupplierDeliveryConfigId`).

## Mục tiêu
- Gộp toàn bộ entity và bảng `SupplierDeliveryConfigs` trực tiếp vào bảng `Suppliers` (quan hệ 1–1).
- KHÔNG gộp bảng `SupplierBlackoutDates` — giữ nguyên bảng riêng 1–N với `Suppliers`, chỉ liên kết qua `SupplierId` (drop cột & FK `SupplierDeliveryConfigId`).
- Tối ưu hóa hiệu năng truy vấn, loại bỏ thực thể và bảng thừa `SupplierDeliveryConfigs`.
- Giữ nguyên 100% nghiệp vụ và tương thích API / FE: Cấu trúc DTO `SupplierDeliveryConfigDto` và các endpoint API `GET/PUT /api/v1/suppliers/{id}/delivery-config` được bảo toàn hình dạng response để Frontend không bị xáo trộn UX.

## Phạm vi
- **In scope**:
  1. **Domain**:
     - Thêm các cột cấu hình giao hàng vào `MT_GRMS.Domain/Entities/Supplier/Supplier.cs`:
       - `CutoffTime` (string, default "17:00")
       - `CutoffDayOffset` (int, default 1)
       - `DeliveryWeekdaysMask` (int, default 127)
       - `DeliveryDaysJson` (string JSON, default `["Mon","Tue","Wed","Thu","Fri","Sat"]`)
       - `MinOrderQuantity` (int, default 0)
       - `AllowUrgent` (bool, default false)
       - `UrgentLeadTimeHours` (int, default 4)
       - `UrgentFeePercent` (decimal, default 0)
     - Xóa thực thể `SupplierDeliveryConfig.cs` và cấu hình EF `SupplierDeliveryConfigConfiguration.cs`.
     - Cập nhật `SupplierBlackoutDate.cs`: Bỏ `SupplierDeliveryConfigId` và navigation `SupplierDeliveryConfig`, chỉ giữ `SupplierId` và navigation `Supplier`.
     - Cập nhật navigation `Supplier.cs`: Chứa `ICollection<SupplierBlackoutDate> BlackoutDates`, xóa navigation `DeliveryConfig`.
  2. **Database Schema & Migration**:
     - Cập nhật EF migration và `DbInitializer.cs`:
       - `ALTER TABLE "Suppliers" ADD COLUMN IF NOT EXISTS ...` cho các cột delivery.
       - Migrate dữ liệu từ `SupplierDeliveryConfigs` sang `Suppliers` theo `SupplierId`.
       - `DROP TABLE IF EXISTS "SupplierDeliveryConfigs"`.
       - `ALTER TABLE "SupplierBlackoutDates" DROP COLUMN IF EXISTS "SupplierDeliveryConfigId"`.
  3. **Application & Infrastructure**:
     - Cập nhật `SupplierService.cs`: `GetDeliveryConfigAsync` và `UpdateDeliveryConfigAsync` đọc/ghi trực tiếp từ thực thể `Supplier`.
     - Giữ nguyên response shape DTO (`SupplierDeliveryConfigDto`) để FE không cần sửa đổi lớn.
     - Đồng bộ `OrderCutoffTime` trỏ về `CutoffTime` trong DTO mapping.
     - `PurchaseOrderRepository.cs`: Bỏ `.Include(s => s.DeliveryConfig)`, truy vấn trực tiếp các trường delivery từ `Supplier`.
     - Cập nhật `DeliveryScheduleCalculator.cs`, `SupplierBranchAssignment` bỏ quan hệ với `SupplierDeliveryConfig`.
  4. **Frontend**:
     - Kiểm tra và đảm bảo tab Delivery trên `SupplierDetailPage.tsx` tiếp tục lưu và tải cấu hình mượt mà.
  5. **Unit Tests**:
     - Cập nhật các test suite: `SupplierManagementTests` (REQDEL*), `PurchaseOrderMatrixTests`, fake repositories/entities tương ứng.
- **Out of scope**:
  - Không thêm lại Lead Time.
  - Không thay đổi nghiệp vụ Urgent ngoài việc di chuyển cột sang `Suppliers`.
  - Không gộp `SupplierBlackoutDates` vào `Suppliers`.

## Người dùng liên quan
- Quản lý cửa hàng (Store Owner), Nhân viên chi nhánh (Branch Staff), Admin quản trị hệ thống.

## Tiêu chí thành công (Acceptance Criteria)
- [ ] Không còn entity `SupplierDeliveryConfig.cs` và bảng `SupplierDeliveryConfigs` trong codebase và database.
- [ ] Thực thể `Supplier` lưu trữ trực tiếp các trường: `CutoffTime`, `CutoffDayOffset`, `DeliveryWeekdaysMask`, `DeliveryDaysJson`, `MinOrderQuantity`, `AllowUrgent`, `UrgentLeadTimeHours`, `UrgentFeePercent`.
- [ ] Bảng `SupplierBlackoutDates` chỉ còn khóa ngoại `SupplierId`.
- [ ] API `GET /api/v1/suppliers/{id}/delivery-config` và `PUT /api/v1/suppliers/{id}/delivery-config` hoạt động bình thường với response shape tương thích.
- [ ] FE tab Giao hàng trên `SupplierDetailPage` lưu/đọc cấu hình bình thường.
- [ ] Màn hình Order Matrix và `PurchaseOrderRepository` tính toán `EarliestDeliveryDate` chính xác.
- [ ] `dotnet build` thành công 0 lỗi; toàn bộ Unit Tests liên quan (REQDEL*) đều PASS.
