---
verdict: PASS
date: 2026-11-08
change: pos-strict-employee-schedule-check
author: sonnguyenn10
---

# Test Report: Nghiệm Thu Tính Năng Chặn Cứng Nhân Viên Không Có Lịch Trực Vào Bán Hàng POS

## 1. Kết Quả Kiểm Thử Theo Yêu Cầu & Kịch Bản (Requirements & Scenarios Verification)

| Mã Yêu Cầu | Kịch Bản Kiểm Thử | Kỳ Vọng | Kết Quả Thực Tế | Trạng Thái |
|---|---|---|---|---|
| **REQ-STRICT-SCHEDULE-VALIDATION** | Nhân viên có lịch trực hợp lệ hôm nay trong khung giờ (Phạm Thị Yến `0917778888`) | Được phép mở ca và thanh toán tạo đơn bình thường | `CheckCashierShiftEligibilityAsync` trả về `IsAllowed: true`; đơn hàng POS tạo thành công | **PASS** |
| **REQ-STRICT-SCHEDULE-VALIDATION** | Nhân viên không có lịch trực hôm nay (Nguyễn Văn Minh `0915556666`) | Bị chặn mở ca và chặn tạo đơn với mã lỗi `EMPLOYEE_NOT_SCHEDULED` | Backend ném `BusinessException("EMPLOYEE_NOT_SCHEDULED", "Bạn không có lịch làm việc trong ca hiện tại của chi nhánh.")` | **PASS** |
| **REQ-STRICT-SCHEDULE-VALIDATION** | Nhân viên có lịch trực nhưng ngoài khung giờ làm việc (quá 30 phút dung sai) | Bị chặn mở ca và thanh toán | Trả về `IsAllowed: false` kèm lý do chi tiết; chặn an toàn | **PASS** |
| **REQ-STRICT-SCHEDULE-VALIDATION** | Nhân viên đến sớm hoặc ở lại muộn trong phạm vi dung sai 30 phút | Được hệ thống chấp thuận tính hợp lệ để mở/chốt ca | Khung giờ `[PlannedStartTime - 30m, PlannedEndTime + 30m]` khớp chính xác; trả về `IsAllowed: true` | **PASS** |
| **REQ-STRICT-SCHEDULE-VALIDATION** | Chủ cửa hàng (`STORE_OWNER` / `ADMIN`) truy cập POS bán hàng | Được miễn trừ hoàn toàn kiểm tra lịch trực ca | Trả về `IsAllowed: true, IsExempt: true`; không bao giờ bị chặn | **PASS** |
| **REQ-POS-UI-SCHEDULE-ALERT** | Nhân viên ngoài ca mở màn hình POS (`/employee/pos`) | Giao diện hiển thị Banner Alert đỏ cảnh báo và vô hiệu hóa nút "Thanh toán (F9)" | Màn hình POS hiển thị Alert *"Không đủ điều kiện bán hàng trong ca hiện tại"* và khóa nút thanh toán kèm Tooltip giải thích | **PASS** |

## 2. Kiểm Thử Tự Động (Automated Test Execution)

### Backend Test Suite (xUnit)
- **Lệnh thực thi**: `dotnet test MT_GRMS_BACKEND\MT_GRMS_BACKEND.sln`
- **Kết quả**:
  - `MT_GRMS.UnitTests`: **525/525 tests PASSED** (bổ sung 4 unit tests mới bao phủ toàn diện các case eligibility: Store Owner miễn trừ, thiếu hồ sơ nhân viên, không có lịch trực, và có ca hợp lệ).
  - `MT_GRMS.IntegrationTests`: **44/44 tests PASSED**.
  - **Tổng**: **569/569 tests PASSED (100%)**, 0 Failed, 0 Skipped.

### Frontend Production Build
- **Lệnh thực thi**: `npm --prefix MT_GRMS_FRONTEND run build`
- **Kết quả**:
  - Vite build hoàn tất thành công trong **836ms**.
  - TypeScript type check: **0 lỗi** (0 errors).
  - Bundle `dist/` đóng gói thành công và an toàn.

## 3. Kết Luận
Toàn bộ các tiêu chí nghiệm thu đều đạt (verdict: **PASS**). Hệ thống sẵn sàng đưa vào vận hành thực tế.
