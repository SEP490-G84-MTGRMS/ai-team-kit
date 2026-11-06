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
