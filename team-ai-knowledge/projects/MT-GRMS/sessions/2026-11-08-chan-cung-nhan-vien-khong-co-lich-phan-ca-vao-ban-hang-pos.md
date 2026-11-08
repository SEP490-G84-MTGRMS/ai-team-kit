---
id: SES-2026-11-08-573
date: '2026-11-08'
author: sonnguyenn10
project: MT-GRMS
goals:
  - >-
    Triển khai cơ chế Chặn cứng (Strict Block) nhân viên không có trong lịch
    phân ca vào bán hàng POS và tạo đơn
  - >-
    Miễn trừ kiểm tra lịch phân ca cho Chủ cửa hàng (STORE_OWNER) và Quản trị
    viên (ADMIN)
  - Hiển thị cảnh báo trực quan và vô hiệu hóa nút Thanh toán trên POS Frontend
  - Cung cấp tài khoản test đối chứng tại chi nhánh Ba Đình
status: completed
files_changed:
  - MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Persistence/DbInitializer.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Application/PosShifts/Dtos/ShiftDtos.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Application/PosShifts/IShiftRepository.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Repositories/ShiftRepository.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Application/PosShifts/IShiftService.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Application/PosShifts/ShiftService.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Application/PosOrders/OrderService.cs
  - MT_GRMS_BACKEND/src/MT_GRMS.Api/Controllers/ShiftsController.cs
  - MT_GRMS_BACKEND/tests/MT_GRMS.UnitTests/ShiftManagementServiceTests.cs
  - MT_GRMS_FRONTEND/src/features/pos/types/posShift.types.ts
  - MT_GRMS_FRONTEND/src/features/pos/api/posShiftApi.ts
  - MT_GRMS_FRONTEND/src/features/pos/pages/PosCheckoutPage.tsx
tags:
  - session
  - summary
---

# Session Summary: Chặn cứng nhân viên không có lịch phân ca vào bán hàng POS

Đã hoàn thành toàn bộ 6 bước SEP cho change pos-strict-employee-schedule-check. Triển khai logic CheckCashierShiftEligibilityAsync đối soát EmployeeSchedules theo múi giờ VN (UTC+7) và dung sai 30 phút; chặn cứng tại OrderService.CreateOrderAsync và ShiftService.OpenShiftAsync với mã lỗi EMPLOYEE_NOT_SCHEDULED; mở endpoint GET /api/shifts/cashier-eligibility; cập nhật giao diện PosCheckoutPage hiển thị Alert đỏ cảnh báo và disable nút Thanh toán F9; seed data đối chứng Ba Đình: 0917778888 có lịch hợp lệ, 0915556666 bị chặn ngoài ca; toàn bộ 569/569 tests passed và build frontend thành công.
