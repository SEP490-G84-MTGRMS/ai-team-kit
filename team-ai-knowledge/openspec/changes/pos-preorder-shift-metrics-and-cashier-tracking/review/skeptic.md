# Đánh giá phản biện (Skeptic Review) — pos-preorder-shift-metrics-and-cashier-tracking

## 1. Đánh giá 5 khía cạnh chất lượng (D1 – D5)

### D1: Completeness (Tính đầy đủ) — ĐẠT (5/5)
- Đặc tả đã giải quyết trọn vẹn cả 2 khía cạnh mà người dùng phản ánh:
  1. Hiển thị và lưu vết đầy đủ người tạo đơn cọc và người giao hàng trên bảng Đơn đặt trước.
  2. Xử lý chính xác dòng tiền vào ca làm việc: ca tạo đơn cọc chỉ ghi nhận tiền cọc thực thu; ca giao hàng thu tiền nốt ghi nhận bổ sung vào ca hiện tại.

### D2: Correctness (Đúng root cause hay chỉ triệu chứng) — ĐẠT (5/5)
- **Vấn đề thông số ca**: `GetShiftSalesMetricsAsync` trước đây `Sum(o => o.FinalAmount)` cho mọi đơn hàng không hủy, khiến tiền lý thuyết trong két đòi hỏi cả số tiền khách chưa trả. Sửa thành `Sum(o => o.Status == "PendingPickup" ? o.DepositAmount : o.FinalAmount)` sửa đúng 100% bản chất kế toán bán hàng quầy.
- **Vấn đề giao hàng khác ca**: Dùng cơ chế `ShiftCashMovement` (danh mục `PREORDER_PICKUP` hoặc `DEBT_COLLECT`) để nạp tiền vào ca hiện tại đảm bảo tiền mặt thực tế luôn khớp với báo cáo két Z-Report của ca giao hàng.

### D3: Coherence (Tính nhất quán) — ĐẠT (5/5)
- Nhất quán với luồng bán nợ và thu nợ (`DEBT_COLLECT`) đã có trong hệ thống:
  - Giao dịch bán hàng tạo công nợ/tiền cọc -> Khi thu nốt thì ghi nhận phiếu thu tiền ca tương ứng.

### D4: Constraints (Ràng buộc kỹ thuật & quy tắc dự án) — ĐẠT (5/5)
- Không phá vỡ database: Cột `FulfilledByCashierName` và `FulfilledAtUtc` được thêm qua DDL `ADD COLUMN IF NOT EXISTS`.
- Enum `CashMovementCategory` bổ sung `PREORDER_PICKUP = 5` tương thích ngược.

### D5: Blast Radius (Phạm vi ảnh hưởng) — THẤP (4.9/5)
- Chỉ ảnh hưởng đến luồng Đơn đặt trước (Pre-Order) và hàm tính `GetShiftSalesMetricsAsync`.
- Không ảnh hưởng đến đơn bán lẻ thông thường (Hóa đơn POS trực tiếp).

---

## 2. Kết luận
- **Đánh giá chung**: CHẤP NHẬN (PASS).
- Sẵn sàng tiến hành lập `tasks.md` và thực thi bước Apply.
