# Skeptic Review: shift-and-business-day-closing

| Chiều | Điểm (1–5) | Nhận xét |
|---|---:|---|
| D1 Completeness | 3 | Thiếu phạm vi kiểm đếm ngày, trạng thái thực trả, reversal khi reopen và danh sách write path bị khóa. |
| D2 Correctness | 2 | Hợp đồng chốt ngày và reopen có thể làm sai Cashbook. |
| D3 Coherence | 3 | Chưa thống nhất doanh thu thuần, FundCounts và mô hình bàn giao. |
| D4 Constraints | 3 | Tenant, idempotency và khóa kỳ chưa đủ chi tiết. |
| D5 Blast Radius | 2 | Ảnh hưởng Shift, Order, Refund, Cashbook, BusinessDay và UI lớn hơn mô tả. |

## Vấn đề
- [HIGH] REQ-SBDC-08 chưa xác định kiểm đếm theo quỹ. → Chọn FundCounts theo từng quỹ, định nghĩa tiền đang bàn giao và tổng chênh lệch.
- [HIGH] REQ-SBDC-10 thiếu reversal/adjustment khi reopen. → Ledger bất biến; điều chỉnh phải liên kết entry/version gốc.
- [HIGH] REQ-SBDC-01/02 không ánh xạ được “đã thực trả” vào state hiện có. → Chốt state machine và thời điểm ảnh hưởng két.
- [HIGH] REQ-SBDC-05 chưa có state machine chuyển quỹ duy nhất. → Chọn aggregate nguồn, PendingReceipt/Received/Cancelled và thời điểm ghi quỹ.
- [HIGH] REQ-SBDC-10 chưa liệt kê các write path phải áp dụng lock guard. → Bao phủ order/payment/refund/return, movement, debt, preorder và cashbook.
- [HIGH] REQ-SBDC-01 chưa định nghĩa revenue với discount, void, partial/full return và refund khác phương thức. → Bổ sung công thức và scenarios.
- [HIGH] REQ-SBDC-09 thiếu ma trận ShiftState/HandoverStatus/PostingStatus và recovery. → Bổ sung blocker/posting matrix và transaction/outbox.
- [MEDIUM] PreviewVersion chưa chỉ rõ nguồn invalidation. → Token opaque bao phủ mọi dữ liệu nguồn.
- [MEDIUM] BusinessDate của movement trong ca kéo dài qua cutoff chưa rõ. → Kế thừa Shift.BusinessDate.
- [MEDIUM] Nguồn tạo participant chưa rõ. → Liệt kê event và unique ShiftId+UserId.
- [MEDIUM] PendingReceipt có chặn ngày hay không chưa thống nhất. → Chọn chính sách cấu hình.
- [MEDIUM] Reopen một bước hay hai bước chưa rõ. → Chốt mô hình.
- [LOW] Chưa thống nhất VND integer hay decimal. → Dùng số nguyên đồng trên UI và decimal(18,2) backend không silent rounding.

## Kết luận: Cần sửa
