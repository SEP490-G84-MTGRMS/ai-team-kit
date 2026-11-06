# Improvements: pos-shift-handover-cash-management

## Spec · 2026-11-06 06:55

Khép kín chuỗi tiền két giữa các ca bằng PrevShiftId và OpeningFloatExpected, tạo bảng con ShiftCashMovement lưu chi tiết thu chi lẻ, gán ShiftId vào Order.

## Brainstorm · 2026-11-06 07:00

Đã xây dựng mô hình dữ liệu chi tiết cho ShiftZReport mở rộng, ShiftCashMovement, Order.ShiftId và 5 scenarios Gherkin chuẩn xác.

## Verify Spec · 2026-11-06 07:01

Phản biện D1-D5 đạt 5/5, lập kế hoạch 7 tasks chi tiết bao quát từ Domain, DbContext, Service đến Controller và Unit Test Suite.

## Apply · 2026-11-06 07:23

Áp dụng CustomSchemaIds cho Swashbuckle SwaggerGen để tránh xung đột tên DTO giữa các namespace khác nhau.
