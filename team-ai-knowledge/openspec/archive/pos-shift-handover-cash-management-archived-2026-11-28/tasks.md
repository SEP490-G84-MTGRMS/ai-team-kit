# Kế Hoạch Thực Hiện (Tasks): Quản Lý Ca POS — Mở Ca, Thu Chi Két & Chốt Ca

## Nhóm 1: Cơ Sở Dữ Liệu & Thực Thể (Domain & Infrastructure)
- [x] **T1 (Domain Entities & Enums)**: 
  - Mở rộng `ShiftZReport.cs` (`BranchId`, `ShiftCode`, `ShiftName`, `PrevShiftId`, `OpeningFloatExpected`, `OpeningDiscrepancy`, `ReceiverUserId`, `HandoverStatus`, `TotalBankRevenue`, `TotalOrdersCount`, sửa `Discrepancy` sang `decimal?`, navigation `CashMovements`) *(REQ-SHIFT-01, REQ-SHIFT-04)*.
  - Tạo mới entity `ShiftCashMovement.cs` (`ShiftId`, `MovementType`, `Category`, `Amount`, `Reason`, `CreatedBy`, `OccurredAtUtc`, navigation `Shift`) *(REQ-SHIFT-02)*.
  - Bổ sung `ShiftId` (`Guid?`) và navigation `Shift` vào `Order.cs` *(REQ-SHIFT-03)*.
  - Tạo các enums: `CashMovementType`, `CashMovementCategory`, `HandoverStatus`.
- [x] **T2 (DbContext & Seed Data)**: 
  - Khai báo `DbSet<ShiftCashMovement>` trong `AppDbContext.cs`, cấu hình Fluent API mapping quan hệ 1-N giữa `ShiftZReport` và `ShiftCashMovement`.
  - Cập nhật `DbInitializer.cs` nạp ca làm việc mẫu và các phiếu thu chi lẻ phục vụ kiểm thử *(REQ-SHIFT-01, REQ-SHIFT-02)*.

## Nhóm 2: Tầng Nghiệp Vụ (Application Layer)
- [x] **T3 (DTOs & Service Interface)**: 
  - Tạo các DTOs trong `MT_GRMS.Application/PosShifts/Dtos/ShiftDtos.cs` (`OpenShiftRequest`, `CashMovementRequest`, `CloseShiftRequest`, `ConfirmHandoverRequest`, `ShiftDetailResponse`, `ZReportResponse`).
  - Định nghĩa interface `IShiftService` và repository `IShiftRepository` trong Application layer.
- [x] **T4 (ShiftService Implementation)**: 
  - Triển khai `ShiftService`:
    - `OpenShiftAsync`: Kiểm tra ràng buộc duy nhất 1 ca mở trên mỗi quầy, truy vết `PrevShiftId` và khép kín `OpeningFloatExpected` từ `prevShift.RetainedFloatAmount` *(REQ-SHIFT-01)*.
    - `AddCashMovementAsync`: Ghi nhận phiếu thu chi lẻ (`IN`/`OUT`) với audit `CreatedBy`, cập nhật `TotalCashIn`/`TotalCashOut` *(REQ-SHIFT-02)*.
    - `CloseShiftAsync`: Validate chặt chẽ ràng buộc $Retained + Dropped = H$, tự động truy vấn đơn hàng tính doanh thu tiền mặt $B$, doanh thu ngân hàng `TotalBankRevenue`, tiền lý thuyết $G$ và `Discrepancy` *(REQ-SHIFT-04)*.
    - `ConfirmHandoverAsync`: Người ca sau xác nhận bàn giao (`CONFIRMED` hoặc `DISPUTED` kèm lý do) *(REQ-SHIFT-05)*.
    - `GetCurrentShiftAsync`: Lấy thông tin ca đang hoạt động của quầy.
  - Cập nhật `OrderService.cs`: Tự động gán `ShiftId` của ca đang mở vào hóa đơn `Order` khi thanh toán tại quầy POS *(REQ-SHIFT-03)*.

## Nhóm 3: Tầng API (Web API Controller)
- [x] **T5 (ShiftsController)**: 
  - Tạo `ShiftsController.cs` tại `MT_GRMS.Api/Controllers/ShiftsController.cs` kế thừa `BaseApiController` với các endpoints:
    - `POST /api/pos/shifts/open`
    - `GET /api/pos/shifts/current`
    - `POST /api/pos/shifts/{id}/cash-movements`
    - `POST /api/pos/shifts/{id}/close`
    - `POST /api/pos/shifts/{id}/confirm-handover`
    - `GET /api/pos/shifts/{id}/z-report`

## Nhóm 4: Kiểm Thử & Nghiệm Thu (Unit Tests & Verification)
- [x] **T6 (Unit Test Suite)**: 
  - Tạo file `ShiftManagementServiceTests.cs` trong `MT_GRMS.UnitTests` với đầy đủ test cases kiểm chứng:
    - Khép kín chuỗi tiền giữa 2 ca liên tiếp (`PrevShiftId`, `OpeningFloatExpected`).
    - Thu chi két lẻ cập nhật chính xác `TotalCashIn` và `TotalCashOut`.
    - Tính đúng tiền lý thuyết $G = A + B + C - D - E$ và chênh lệch $H - G$.
    - Từ chối chốt ca khi phân bổ $Retained + Dropped \neq H$.
    - Xác nhận bàn giao ca `CONFIRMED` và `DISPUTED`.
- [x] **T7 (Verification & Build)**: 
  - Chạy toàn bộ test suites (`dotnet test`), kiểm tra frontend build (`npm run build`), xác nhận 100% PASS và sẵn sàng tích hợp UI.

## Tasks Sáp Nhập Từ Các Change Con

<!-- Tasks sáp nhập từ: pos-till-shift-timing-concurrency -->
# Tasks: Ca Dùng Chung Theo Chi Nhánh (Nhiều Quầy, Một Két), Khóa Bán Khi Chốt Ca & Concurrency Tồn Kho

## Database & Entities
- [x] T1: Cập nhật Entity `ShiftZReport` (thêm trạng thái `Closing = 2`, `ClosingStartedByUserId`, `ClosingStartedAtUtc`, `ClosedByUserId`, `ForceCloseReason`), tạo `ShiftParticipant.cs`, `ShiftCloseConfirmation.cs`, cấu hình EF Core trong `AppDbContext.cs`, tạo Partial Unique Index `(TenantId, BranchId)` cho ca `Open`/`Closing` (REQ-SHIFT-SHARED-01).

## Backend Application & Logic
- [x] T2: Cập nhật DTOs quản lý ca trong `MT_GRMS.Application/PosShifts/Dtos/ShiftDtos.cs` (`StartClosingShiftDto`, `CancelClosingShiftDto`, `UpdateCountedCashDto`, `ConfirmCloseShiftDto`, `ForceCloseShiftDto`, `ShiftDetailResponse` bổ sung participants và status Closing) (REQ-SHIFT-SHARED-02, REQ-SHIFT-SHARED-03).
- [x] T3: Triển khai logic nghiệp vụ ca dùng chung trong `IShiftService` và `ShiftService.cs`:
  - Mở ca: Ràng buộc duy nhất 1 ca `Open`/`Closing` mỗi chi nhánh (báo 409 nếu đã có ca).
  - Bắt đầu chốt ca (`StartClosingShiftAsync`): Chuyển ca sang `Closing`, ghi nhận người bắt đầu.
  - Hủy chốt ca (`CancelClosingShiftAsync`): Trả ca về `Open`, xóa xác nhận cũ.
  - Cập nhật số đếm (`UpdateCountedCashAsync`) và xác nhận (`ConfirmCloseShiftAsync`): Chặn đóng ca nếu còn phiếu chi `PendingApproval`.
  - Đóng ca cưỡng bức (`ForceCloseShiftAsync`): Chỉ Owner có quyền, bắt buộc lý do và số đếm (REQ-SHIFT-SHARED-01, REQ-SHIFT-SHARED-03, REQ-SHIFT-SHARED-04, REQ-SHIFT-SHARED-05).
- [x] T4: Cập nhật `OrderService.CreateOrderAsync`:
  - Kiểm tra trạng thái ca của chi nhánh: Từ chối với lỗi 409 nếu ca đang ở trạng thái `Closing`.
  - Gán đơn của Chủ cửa hàng vào ca `Open` đang chạy nếu có.
  - Ghi nhận người tạo đơn vào bảng `ShiftParticipants` nếu chưa có (REQ-SHIFT-SHARED-02, REQ-SHIFT-SHARED-03, REQ-SHIFT-SHARED-05).
- [x] T5: Triển khai Concurrency Control trừ tồn kho FEFO trong `OrderService.CreateOrderAsync`: Sử dụng row-level lock PostgreSQL (`FOR UPDATE`) trên `BranchStocks` trong transaction để đảm bảo 2 thu ngân bán cùng sản phẩm đồng thời không bị bán âm/bán quá tồn kho (REQ-STOCK-CONCURRENCY-01).
- [x] T6: Cập nhật API Controllers `ShiftsController.cs`:
  - `POST /api/pos/shifts/{id}/start-closing`
  - `POST /api/pos/shifts/{id}/cancel-closing`
  - `PUT /api/pos/shifts/{id}/counted-cash`
  - `POST /api/pos/shifts/{id}/confirm-close`
  - `POST /api/pos/shifts/{id}/force-close` (kiểm tra quyền Owner) (REQ-SHIFT-SHARED-03, REQ-SHIFT-SHARED-04, REQ-SHIFT-SHARED-05).

## Frontend POS UI/UX
- [x] T7: Cập nhật `posShiftApi.ts`: Bổ sung các phương thức gọi API `startClosingShift`, `cancelClosingShift`, `updateCountedCash`, `confirmCloseShift`, `forceCloseShift` (REQ-SHIFT-SHARED-03, REQ-SHIFT-SHARED-04, REQ-SHIFT-SHARED-05).
- [x] T8: Cập nhật `PosCheckoutPage.tsx`:
  - Thu ngân đăng nhập tự động vào ca đang chạy, không hiển thị modal bắt mở ca mới.
  - Khi ca ở trạng thái `Closing`: Hiển thị banner cảnh báo đỏ trên đầu màn hình và vô hiệu hóa nút thanh toán đơn hàng (REQ-SHIFT-SHARED-02, REQ-SHIFT-SHARED-03).
- [x] T9: Cập nhật `CloseShiftModal.tsx`:
  - Nút "Bắt đầu chốt ca" chuyển ca sang `Closing`.
  - Nút "Hủy chốt ca" cho phép thu ngân mở lại quầy nếu có khách cần thanh toán gấp.
  - Giao diện nhập số đếm, hiển thị chênh lệch và nút xác nhận đóng ca (REQ-SHIFT-SHARED-03, REQ-SHIFT-SHARED-04).

## Testing & Verification
- [x] T10: Viết Unit Tests & Integration Tests Backend trong `MT_GRMS.UnitTests`:
  - Test chặn mở 2 ca đồng thời trên cùng chi nhánh (409 Conflict).
  - Test khóa tạo đơn khi ca đang `Closing`.
  - Test hủy chốt ca và mở lại ca thành công.
  - Test chặn đóng ca khi còn phiếu chi chờ duyệt.
  - Test Owner đóng ca cưỡng bức kèm lý do.
  - Test multi-threaded concurrency trừ tồn kho FEFO không bị âm kho (REQ-SHIFT-SHARED-01 -> REQ-STOCK-CONCURRENCY-01).
- [x] T11: Chạy kiểm thử tự động toàn diện: `dotnet test` (Pass 100%) và `npm run build` (0 lỗi).
