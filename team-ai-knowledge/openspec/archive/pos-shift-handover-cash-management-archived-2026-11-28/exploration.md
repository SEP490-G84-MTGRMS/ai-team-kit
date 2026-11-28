# Khảo Sát Kỹ Thuật (Exploration): Quản Lý Ca Làm Việc POS — Mở Ca, Thu Chi Két & Bàn Giao Ca

## 1. Hiện Trạng Codebase Liên Quan
- **Entity hiện có**:
  - `MT_GRMS.Domain/Entities/Finance/ShiftZReport.cs`: Thực thể Z-Report cơ bản, có `OpeningFloat`, `ExpectedCash`, `ActualCashCounted`, `Discrepancy` (non-nullable), `RetainedFloatAmount`, `DroppedToSafeAmount`. Thiếu liên kết ca trước (`PrevShiftId`), thiếu mã ca, tên ca, doanh thu ngân hàng, số đơn hàng, và người nhận bàn giao.
  - `MT_GRMS.Domain/Entities/Sales/Order.cs`: Chưa có cột `ShiftId`. Doanh thu tính từ `Order` hiện tại chưa gắn kết trực tiếp với ca đang mở của quầy.
  - `MT_GRMS.Domain/Entities/HR/EmployeeSchedule.cs`: Đã có lịch làm việc theo ca, nhân viên và chi nhánh.
  - `MT_GRMS.Domain/Entities/SaaS/Branch.cs`: Chi nhánh hoạt động.
- **Vấn đề tồn đọng**:
  - Tiền mặt giữa các ca chưa khép kín: thu ngân mở ca không đối chiếu được số tiền ca trước bàn giao lại.
  - Không có bảng lưu các phiếu thu/chi lẻ trong ca (`ShiftCashMovement`) có audit người tạo và lý do.
  - `Discrepancy` đang để kiểu `decimal` (mặc định 0), gây hiểu lầm ca đang mở đã cân đối tiền.

## 2. Giả Định (Assumptions)
- Mỗi quầy thu ngân tại một chi nhánh chỉ có tối đa 1 ca ở trạng thái `Open` tại một thời điểm.
- Đơn hàng thanh toán tại quầy (`Order`) chỉ được phép tạo khi có ca đang mở tại quầy đó.
- Thu ngân đếm tiền mặt thực tế ($H$) theo nguyên tắc "đếm mù" (Blind Count) hoặc nhập tiền thực đếm rồi server tự tính $G$ và $Discrepancy$.

## 3. Non-Goals (Những gì không làm)
- Không kết nối phần cứng két sắt tự động mở qua cổng RJ11/Serial trong phạm vi này.
- Không tự động tính lương theo giờ từ thời gian mở/đóng ca (được đảm nhiệm bởi phân hệ HR / Payroll).
- Không tạo các bảng con quá nặng (như chi tiết từng mệnh giá tiền polyme 500k, 200k...); chỉ lưu tổng số tiền thực đếm $H$.

## 4. Phân Tích Các Phương Án Kỹ Thuật

### Phương án A: Lưu lịch sử thu/chi két trong cột JSON (`CashTransactionsJson`) trên `ShiftZReport`
- **Ưu điểm**: Không cần tạo bảng mới, cấu trúc DB gọn nhẹ.
- **Nhược điểm**: Không có khóa ngoại, không truy vấn audit được từng dòng giao dịch, ghi đè đồng thời gây mất dữ liệu, không lập báo cáo phân loại thu chi vặt trong tháng được.

### Phương án B: Tách bảng con duy nhất `ShiftCashMovement` + Mở rộng `ShiftZReport` & `Order.ShiftId` (Được chọn)
- **Ưu điểm**:
  - Bảng con `ShiftCashMovement` có `CreatedBy`, `Category`, `Amount`, `Reason`, `OccurredAtUtc` độc lập, hỗ trợ audit và báo cáo thu/chi chuẩn mực.
  - Gắn `ShiftId` vào `Order` giúp câu lệnh tính doanh thu tiền mặt bán hàng ($B$) tại thời điểm chốt ca là một truy vấn SQL chính xác, không sợ trôi số.
  - Thêm `PrevShiftId` và `OpeningFloatExpected` giúp khép kín 100% chuỗi tiền két giữa các ca.
  - Giữ thiết kế tinh gọn (MVP sạch), không phát sinh bảng thừa.
- **Nhược điểm**: Cần bổ sung 1 migration EF Core và tạo 1 entity mới.

## 5. Rủi Ro Kỹ Thuật & Giải Pháp Giảm Thiểu
- **Rủi ro 1: Lệch két do đơn thanh toán kết hợp hoặc hủy đơn**:
  - *Giải pháp*: $B$ chỉ tính từ `Orders` có `PaymentMethod == 'CASH'` và `Status == 'Completed'`. Doanh thu VietQR/Chuyển khoản được tách riêng vào `TotalBankRevenue`.
- **Rủi ro 2: Bấm chốt ca nhiều lần (Double Submit)**:
  - *Giải pháp*: API Chốt ca kiểm tra trạng thái ca (`Status == ShiftState.Open`), chuyển trạng thái nguyên tử sang `Closed`, chặn tạo đơn mới vào ca đã đóng.
- **Rủi ro 3: Bàn giao tiền thiếu / sai số**:
  - *Giải pháp*: Ràng buộc cứng $RetainedFloat + DroppedToSafe = ActualCashCounted$. Thu ngân ca kế tiếp khi mở ca có quyền xác nhận `CONFIRMED` hoặc khiếu nại `DISPUTED` kèm lý do.
