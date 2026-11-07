# Tasks: Ca Dùng Chung Theo Chi Nhánh (Nhiều Quầy, Một Két), Khóa Bán Khi Chốt Ca & Concurrency Tồn Kho

## Database & Entities
- [ ] T1: Cập nhật Entity `ShiftZReport` (thêm trạng thái `Closing = 2`, `ClosingStartedByUserId`, `ClosingStartedAtUtc`, `ClosedByUserId`, `ForceCloseReason`), tạo `ShiftParticipant.cs`, `ShiftCloseConfirmation.cs`, cấu hình EF Core trong `AppDbContext.cs`, tạo Partial Unique Index `(TenantId, BranchId)` cho ca `Open`/`Closing` (REQ-SHIFT-SHARED-01).

## Backend Application & Logic
- [ ] T2: Cập nhật DTOs quản lý ca trong `MT_GRMS.Application/PosShifts/Dtos/ShiftDtos.cs` (`StartClosingShiftDto`, `CancelClosingShiftDto`, `UpdateCountedCashDto`, `ConfirmCloseShiftDto`, `ForceCloseShiftDto`, `ShiftDetailResponse` bổ sung participants và status Closing) (REQ-SHIFT-SHARED-02, REQ-SHIFT-SHARED-03).
- [ ] T3: Triển khai logic nghiệp vụ ca dùng chung trong `IShiftService` và `ShiftService.cs`:
  - Mở ca: Ràng buộc duy nhất 1 ca `Open`/`Closing` mỗi chi nhánh (báo 409 nếu đã có ca).
  - Bắt đầu chốt ca (`StartClosingShiftAsync`): Chuyển ca sang `Closing`, ghi nhận người bắt đầu.
  - Hủy chốt ca (`CancelClosingShiftAsync`): Trả ca về `Open`, xóa xác nhận cũ.
  - Cập nhật số đếm (`UpdateCountedCashAsync`) và xác nhận (`ConfirmCloseShiftAsync`): Chặn đóng ca nếu còn phiếu chi `PendingApproval`.
  - Đóng ca cưỡng bức (`ForceCloseShiftAsync`): Chỉ Owner có quyền, bắt buộc lý do và số đếm (REQ-SHIFT-SHARED-01, REQ-SHIFT-SHARED-03, REQ-SHIFT-SHARED-04, REQ-SHIFT-SHARED-05).
- [ ] T4: Cập nhật `OrderService.CreateOrderAsync`:
  - Kiểm tra trạng thái ca của chi nhánh: Từ chối với lỗi 409 nếu ca đang ở trạng thái `Closing`.
  - Gán đơn của Chủ cửa hàng vào ca `Open` đang chạy nếu có.
  - Ghi nhận người tạo đơn vào bảng `ShiftParticipants` nếu chưa có (REQ-SHIFT-SHARED-02, REQ-SHIFT-SHARED-03, REQ-SHIFT-SHARED-05).
- [ ] T5: Triển khai Concurrency Control trừ tồn kho FEFO trong `OrderService.CreateOrderAsync`: Sử dụng row-level lock PostgreSQL (`FOR UPDATE`) trên `BranchStocks` trong transaction để đảm bảo 2 thu ngân bán cùng sản phẩm đồng thời không bị bán âm/bán quá tồn kho (REQ-STOCK-CONCURRENCY-01).
- [ ] T6: Cập nhật API Controllers `ShiftsController.cs`:
  - `POST /api/pos/shifts/{id}/start-closing`
  - `POST /api/pos/shifts/{id}/cancel-closing`
  - `PUT /api/pos/shifts/{id}/counted-cash`
  - `POST /api/pos/shifts/{id}/confirm-close`
  - `POST /api/pos/shifts/{id}/force-close` (kiểm tra quyền Owner) (REQ-SHIFT-SHARED-03, REQ-SHIFT-SHARED-04, REQ-SHIFT-SHARED-05).

## Frontend POS UI/UX
- [ ] T7: Cập nhật `posShiftApi.ts`: Bổ sung các phương thức gọi API `startClosingShift`, `cancelClosingShift`, `updateCountedCash`, `confirmCloseShift`, `forceCloseShift` (REQ-SHIFT-SHARED-03, REQ-SHIFT-SHARED-04, REQ-SHIFT-SHARED-05).
- [ ] T8: Cập nhật `PosCheckoutPage.tsx`:
  - Thu ngân đăng nhập tự động vào ca đang chạy, không hiển thị modal bắt mở ca mới.
  - Khi ca ở trạng thái `Closing`: Hiển thị banner cảnh báo đỏ trên đầu màn hình và vô hiệu hóa nút thanh toán đơn hàng (REQ-SHIFT-SHARED-02, REQ-SHIFT-SHARED-03).
- [ ] T9: Cập nhật `CloseShiftModal.tsx`:
  - Nút "Bắt đầu chốt ca" chuyển ca sang `Closing`.
  - Nút "Hủy chốt ca" cho phép thu ngân mở lại quầy nếu có khách cần thanh toán gấp.
  - Giao diện nhập số đếm, hiển thị chênh lệch và nút xác nhận đóng ca (REQ-SHIFT-SHARED-03, REQ-SHIFT-SHARED-04).

## Testing & Verification
- [ ] T10: Viết Unit Tests & Integration Tests Backend trong `MT_GRMS.UnitTests`:
  - Test chặn mở 2 ca đồng thời trên cùng chi nhánh (409 Conflict).
  - Test khóa tạo đơn khi ca đang `Closing`.
  - Test hủy chốt ca và mở lại ca thành công.
  - Test chặn đóng ca khi còn phiếu chi chờ duyệt.
  - Test Owner đóng ca cưỡng bức kèm lý do.
  - Test multi-threaded concurrency trừ tồn kho FEFO không bị âm kho (REQ-SHIFT-SHARED-01 -> REQ-STOCK-CONCURRENCY-01).
- [ ] T11: Chạy kiểm thử tự động toàn diện: `dotnet test` (Pass 100%) và `npm run build` (0 lỗi).
