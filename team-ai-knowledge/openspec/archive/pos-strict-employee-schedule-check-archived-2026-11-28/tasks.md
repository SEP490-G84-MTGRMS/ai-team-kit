# Tasks: pos-strict-employee-schedule-check

- [x] T1 — [DB / Seed Data] Thêm dữ liệu lịch phân ca mẫu hôm nay (`EmployeeSchedule`) trong `DbInitializer.cs` cho thu ngân Ba Đình `0917778888` (Phạm Thị Yến) để test trường hợp hợp lệ, và `0915556666` (Nguyễn Văn Minh) không có ca để test trường hợp bị chặn (REQ-STRICT-SCHEDULE-VALIDATION)
- [x] T2 — [Backend - Dto & Repo] Thêm `CashierShiftEligibilityDto` và phương thức truy vấn lịch trực thời gian thực `GetActiveScheduleForCashierAsync` trong `IShiftRepository` / `ShiftRepository` (REQ-STRICT-SCHEDULE-VALIDATION)
- [x] T3 — [Backend - Service] Triển khai logic `CheckCashierShiftEligibilityAsync` trong `ShiftService`: miễn trừ `STORE_OWNER`/`ADMIN`, phân giải `Employee`, đối soát `WorkDate` và khung giờ $\pm 30$ phút dung sai, hỗ trợ ca qua đêm (REQ-STRICT-SCHEDULE-VALIDATION)
- [x] T4 — [Backend - Controller & Endpoint] Bổ sung endpoint `GET /api/shifts/cashier-eligibility` trong `ShiftsController.cs` để Frontend POS kiểm tra quyền trực ca (REQ-STRICT-SCHEDULE-VALIDATION)
- [x] T5 — [Backend - Strict Block] Ràng buộc kiểm tra quyền trực ca tại `OrderService.CreateOrderAsync` và `ShiftService.OpenShiftAsync`: chặn cứng ném `BusinessException("EMPLOYEE_NOT_SCHEDULED", ...)` nếu thu ngân ngoài ca (REQ-STRICT-SCHEDULE-VALIDATION)
- [x] T6 — [Frontend - API & Types] Thêm `checkCashierEligibility` trong `shiftApi` và khai báo interface `CashierShiftEligibilityDto` (REQ-POS-UI-SCHEDULE-ALERT)
- [x] T7 — [Frontend - POS UI] Tích hợp kiểm tra quyền trực ca tại `PosCheckoutPage.tsx`: hiển thị Alert cảnh báo đỏ và vô hiệu hóa nút "Thanh toán (F9)" khi thu ngân ngoài ca (REQ-POS-UI-SCHEDULE-ALERT)
- [x] T8 — [Test & Verification] Cập nhật / bổ sung Unit Tests cho `CheckCashierShiftEligibilityAsync`, chạy toàn bộ `dotnet test` và `npm run build`, xác nhận 100% PASS (All REQs)
