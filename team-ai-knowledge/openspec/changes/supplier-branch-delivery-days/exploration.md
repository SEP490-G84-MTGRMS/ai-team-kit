# Exploration: supplier-branch-delivery-days

## 1. Problem Statement
Hiện tại lịch giao hàng (`DeliveryDays`) của Nhà cung cấp trong MT-GRMS chỉ được cấu hình ở cấp Nhà cung cấp chung (tab Delivery Date). Khi gán một Nhà cung cấp với từng Chi nhánh (`SupplierBranchAssignment`), hệ thống chưa cho phép tùy biến ngày giao hàng riêng cho từng chi nhánh, mặc dù trên thực tế mỗi cửa hàng/chi nhánh có đặc thù vận hành, vị trí địa lý và ngày nhận hàng khác nhau (ví dụ: Chi nhánh Quận 1 nhận hàng T2, T4, T6; Chi nhánh Thủ Đức nhận T3, T5, T7).
Đồng thời, màn hình Quản lý gán chi nhánh (`/store-owner/suppliers/branches`) chưa hiển thị lịch giao hàng đang áp dụng cho từng dòng gán, gây khó khăn cho Store Owner trong việc theo dõi và điều phối đặt hàng.

## 2. Context & Background
- **Hiện trạng Entity Backend**:
  - `SupplierBranchAssignment` trước đây chỉ lưu quan hệ gán `(TenantId, SupplierId, BranchId, IsActive)`.
  - Cấu hình ngày giao hàng nằm ở `Supplier.DeliveryDaysOfWeek` hoặc `SupplierDeliveryConfig`.
  - Hàm `GetMatrixSupplierConfigsAsync` trong `PurchaseOrderService` chỉ đọc `ActiveDeliveryDays` từ cấp Supplier.
- **Hiện trạng Frontend**:
  - `AssignBranchModal.tsx`: Chỉ cho phép chọn Chi nhánh và bấm Gán, không có tùy chọn ngày giao hàng.
  - `SupplierBranchTable.tsx`: Thiếu cột hiển thị lịch giao hàng của từng chi nhánh.
  - Chưa có modal sửa ngày giao hàng trực tiếp cho chi nhánh đã gán.

## 3. Constraints
- Phải tương thích ngược 100% với các bản ghi gán chi nhánh cũ (nếu chi nhánh chưa cấu hình ngày giao hàng riêng, hệ thống tự động fallback về lịch giao hàng gốc của Supplier).
- Định dạng ngày giao hàng theo thứ trong tuần: 0 = Chủ Nhật, 1 = Thứ Hai, ..., 6 = Thứ Bảy.
- Dữ liệu ngày giao hàng lưu trữ trên `SupplierBranchAssignment.DeliveryDaysOfWeek` dưới dạng danh sách số nguyên (`List<int>`) ánh xạ JSON/string trong cơ sở dữ liệu.
- Multi-tenant bắt buộc: Mỗi bản ghi gán phải thuộc cùng `TenantId` với Supplier và Branch.

## 4. Assumptions
- **[ASSUMPTION-1]**: Mặc định khi mở popup gán chi nhánh, hệ thống sẽ tự động prefill các ngày giao hàng từ cấu hình base của Nhà cung cấp để giảm thiểu thao tác nhập liệu của Store Owner.
- **[ASSUMPTION-2]**: Store Owner có quyền sửa đổi ngày giao hàng bất kỳ lúc nào mà không làm ảnh hưởng đến các Purchase Order đã phát hành trước đó.
- **[ASSUMPTION-3]**: Chuỗi viết tắt chuẩn tiếng Việt cho các thứ trong tuần hiển thị trên bảng: `CN, T2, T3, T4, T5, T6, T7`.

## 5. Scope & Non-Goals
### In Scope
- Mở rộng Entity `SupplierBranchAssignment`: Bổ sung `DeliveryDaysOfWeek` (`List<int>`), `LeadTimeDaysOverride`, `CutoffTimeOverride`.
- API Backend:
  - `POST /api/v1/suppliers/{id}/branches`: Hỗ trợ payload `deliveryDaysOfWeek` khi gán chi nhánh mới.
  - `PUT /api/v1/suppliers/{id}/branches/{branchId}`: Hỗ trợ cập nhật `deliveryDaysOfWeek` cho assignment đã tồn tại.
  - `GET /api/v1/suppliers/{id}/branches`: Trả về `deliveryDaysOfWeek` và chuỗi định dạng `deliveryDaysDisplay`.
- Tích hợp Business Engine:
  - `PurchaseOrderService.GetMatrixSupplierConfigsAsync`: Ưu tiên `DeliveryDaysOfWeek` từ assignment chi nhánh; nếu rỗng fallback về cấu hình Supplier.
- Frontend:
  - `AssignBranchModal.tsx`: Checkbox 7 ngày (Chủ Nhật, Thứ 2 → Thứ 7), prefill từ base DeliveryDays của NCC.
  - `EditAssignmentDeliveryDaysModal.tsx` & `EditAssignmentModal.tsx`: Cho phép sửa ngày giao hàng của dòng gán đã có.
  - `SupplierBranchTable.tsx` & `SupplierBranchTableRow.tsx`: Bổ sung cột "Ngày giao hàng" dạng badge/text viết tắt (vd: `T2, T4, T6`).

### Out of Scope (Non-Goals)
- Thay đổi cấu hình Blackout dates riêng theo từng chi nhánh (vẫn áp dụng chung từ Supplier).
- Thay đổi logic tính toán tồn kho hoặc công thức FEFO/FIFO.

## 6. Success Criteria
1. Khi mở modal gán chi nhánh, các checkbox ngày giao hàng được prefill đúng theo lịch của Nhà cung cấp đã chọn.
2. Store Owner thay đổi tick chọn và bấm Lưu thành công; danh sách chi nhánh hiển thị chuỗi viết tắt chính xác (ví dụ: `T2, T4, T6`).
3. Ma trận đặt hàng (`OrderMatrix`) và Dispatch Hub tự động bật `OPEN`/`OFF` ngày giao hàng cho chi nhánh đó theo đúng lịch override riêng.
4. Các chi nhánh cũ chưa cấu hình override vẫn hoạt động bình thường theo lịch base của Nhà cung cấp (Zero regression).
